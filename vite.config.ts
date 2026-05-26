import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

// Load environment variables for local API simulation
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// A simple plugin to simulate /api/generate inside the Vite dev server
function localApiPlugin() {
  return {
    name: 'local-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/api/generate')) {
          let body = {};
          if (req.method === 'POST') {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const rawBody = Buffer.concat(buffers).toString();
            try {
              body = JSON.parse(rawBody);
            } catch (e) {
              body = {};
            }
          }
          
          // Attach body and mock VercelRequest / VercelResponse methods
          req.body = body;
          res.status = (code: number) => {
            res.statusCode = code;
            return {
              json: (data: any) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              },
              end: () => res.end()
            };
          };
          res.json = (data: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = res.statusCode || 200;
            res.end(JSON.stringify(data));
          };

          try {
            // ssrLoadModule dynamically loads and compiles the TS serverless function in the Vite dev server!
            const { default: handler } = await server.ssrLoadModule('./api/generate.ts');
            await handler(req, res);
          } catch (err: any) {
            console.error("Local API Simulation Error:", err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || "Internal Server Error in Local Simulation" }));
          }
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
