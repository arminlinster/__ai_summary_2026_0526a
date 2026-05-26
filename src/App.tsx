import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { 
  Sparkles, 
  Copy, 
  Check, 
  UploadCloud, 
  Languages, 
  FileText, 
  Trash2, 
  Sliders, 
  Download, 
  BookOpen, 
  ArrowRight, 
  AlertCircle, 
  X,
  FileClock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SAMPLE_TRANSCRIPTS, SampleTranscript } from "./data/samples";

export default function App() {
  // Input settings
  const [transcript, setTranscript] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>("完整會議記錄 (精細)");
  const [targetLanguage, setTargetLanguage] = useState<string>("繁體中文");
  const [customContext, setCustomContext] = useState<string>("");

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  // Feedback states
  const [copied, setCopied] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [showDirectives, setShowDirectives] = useState<boolean>(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate dynamic loading statements
  useEffect(() => {
    if (!loading) return;
    
    const phases = [
      "正在解析讀取您的會議音檔或文字內容...",
      "正在精確過濾冗言贅字與語氣助詞...",
      "正在梳理會議討論結構並提取核心決議...",
      "正在將資訊整合並繪製 Action Items 追蹤矩陣...",
      "正在進行高階語系翻譯與專業修辭優化...",
      "精雕細琢排版格式，即將呈現最完美的會議記錄..."
    ];

    setLoadingPhase(phases[0]);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count < phases.length) {
        setLoadingPhase(phases[count]);
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [loading]);

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Process File Reading
  const processFile = (file: File) => {
    if (!file) return;
    if (file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTranscript(event.target.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      alert("僅支援 .txt、.md 及 .csv 格式之純文字檔案！");
    }
  };

  // Drag and Drop drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Manual File Select clicked
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Load Premade Samples
  const loadSample = (sample: SampleTranscript) => {
    setTranscript(sample.content);
    // Auto populate additional directives or header details if nice
  };

  // Submit request to Backend proxy endpoint
  const handleSubmit = async () => {
    if (!transcript.trim()) {
      setError("請先貼上會議逐字稿、重點筆記或點擊上方預設範例！");
      return;
    }

    setLoading(true);
    setError(null);
    setResult("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcript,
          option: selectedOption,
          language: targetLanguage,
          customContext: customContext,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "生成失敗，請稍後再試。");
      }

      setResult(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "連線至後端 AI 服務時發生錯誤。請確認伺服器運作正常，並已填寫金鑰。");
    } finally {
      setLoading(false);
    }
  };

  // Copy Result to Clipboard
  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("複製失敗:", err);
    }
  };

  // Download Markdown file
  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `會議記錄_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto count stats
  const charCount = transcript.length;

  return (
    <div className="min-h-screen pb-16 flex flex-col bg-[#0A0B0E] text-slate-300" id="app_root">
      {/* Dynamic Header */}
      <header className="border-b border-white/5 bg-[#0D0F14]/90 backdrop-blur-md sticky top-0 z-50 py-4.5 px-6 md:px-12 flex justify-between items-center" id="app_header">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl button-glow flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
              AI 會議記錄生成與翻譯工具
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Powered by Google Gemini 3.5 & Express Backend Proxy
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs bg-white/5 text-slate-400 px-3 py-1.5 rounded-lg border border-white/10 font-semibold select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>後端安全代理模式</span>
        </div>
      </header>

      {/* Main Grid Container */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-8 mt-8 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8" id="app_main">
        {/* Left Input and Setups Side */}
        <section className="lg:col-span-6 flex flex-col gap-6" id="input_panel">
          
          {/* Quick Start Presets Section */}
          <div className="glass-panel rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 text-slate-200 font-bold mb-3 text-sm">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>點擊快速載入會議範例測試</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_TRANSCRIPTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => loadSample(sample)}
                  type="button"
                  className="flex flex-col items-start p-3 rounded-xl border border-white/10 bg-[#0F1115]/50 hover:border-indigo-500/40 hover:bg-indigo-600/10 active:bg-indigo-600/20 text-left transition group cursor-pointer"
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 transition group-hover:bg-indigo-500/20 mb-1.5">
                    {sample.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white line-clamp-1">
                    {sample.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Input Textarea & File Uploader */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl flex flex-col flex-grow relative">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <FileClock className="h-4 w-4 text-indigo-400" />
                <span>會議原始逐字稿或重點筆記</span>
              </label>
              
              <div className="flex items-center gap-2">
                {charCount > 0 && (
                  <button
                    onClick={() => setTranscript("")}
                    title="清除文字內容"
                    type="button"
                    className="text-slate-400 hover:text-rose-400 p-1 rounded-md hover:bg-white/5 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <span className="text-xs text-slate-500 font-mono">
                  {charCount.toLocaleString()} 字
                </span>
              </div>
            </div>

            {/* Drag & Drop Overlay container */}
            <div
              className={`relative flex-grow flex flex-col rounded-xl border transition duration-200 min-h-[300px] ${
                dragActive 
                  ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]" 
                  : transcript 
                    ? "border-white/10 bg-black/20" 
                    : "border-white/10 hover:border-white/20 bg-black/30"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {/* Textarea inside */}
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="在此直接貼上您的會議講稿、語音翻譯、討論對白，或是將 .txt、.md 檔案拖曳放到此處上傳..."
                className="w-full h-full p-4 bg-transparent outline-hidden resize-none text-slate-200 placeholder-slate-500 text-sm leading-relaxed"
                style={{ minHeight: "280px" }}
                id="meeting_transcript_input"
              />

              {/* No input instructions */}
              {!transcript && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 mb-3 border border-white/5">
                    <UploadCloud className="h-6 w-6 text-indigo-400 animate-pulse" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">拖放或上傳您的文字記錄檔案</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[280px]">
                    支援拖放純文字 .txt, .md 或 <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-indigo-400 hover:underline font-bold pointer-events-auto cursor-pointer"
                    >點擊上傳檔案</button>
                  </p>
                </div>
              )}
            </div>

            {/* Hidden Input field for drag selection */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".txt,.md,.csv"
              className="hidden"
            />
          </div>

          {/* Prompt Setups Dashboard */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-white/5">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span>智能AI解析設定參數</span>
            </h3>

            {/* Mode / preset option */}
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-2">1. 選擇會議整理模式</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "完整會議記錄 (精細)",
                  "簡短摘要 (精簡)",
                  "任務指派與 Action Items",
                  "中英雙語對照整理"
                ].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedOption(mode)}
                    type="button"
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition duration-200 cursor-pointer ${
                      selectedOption === mode 
                        ? "border-indigo-500 bg-indigo-600/20 text-indigo-300 font-bold button-glow" 
                        : "border-white/10 hover:bg-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Language translation option */}
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-2 flex items-center gap-1">
                <Languages className="h-3.5 w-3.5 text-indigo-400" />
                <span>2. 翻譯與輸出語系</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10">
                {["繁體中文", "English", "日本語", "한국어", "Español"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setTargetLanguage(lang)}
                    type="button"
                    className={`py-1.5 rounded-lg text-xs font-medium text-center transition ${
                      targetLanguage === lang 
                        ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold" 
                        : "text-slate-400 hover:text-slate-200 cursor-pointer"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Directions Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowDirectives(!showDirectives)}
                className="text-xs font-bold text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition cursor-pointer"
              >
                {showDirectives ? "− 收起" : "＋ 展開"} 額外自訂指令與附加要求（可不填）
              </button>
              
              <AnimatePresence>
                {showDirectives && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-2"
                  >
                    <textarea
                      value={customContext}
                      onChange={(e) => setCustomContext(e.target.value)}
                      placeholder="例：請特別用條列式突顯 SRE 阿強的發言、多加些 Emoji、或是採用嚴格的商務簡報大綱架構。"
                      className="w-full text-xs p-3 rounded-xl border border-white/10 outline-hidden bg-black/40 focus:bg-black/20 text-slate-200 min-h-[60px]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error notifications */}
            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-850/60 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1">
                  <p className="font-bold">{error}</p>
                  <p className="text-[10px] text-slate-400 mt-1">請確實在 Settings 介面加入 GEMINI_API_KEY 金鑰以解鎖 AI 服務。</p>
                </div>
              </div>
            )}

            {/* Generate Trigger Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !transcript.trim()}
              type="button"
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2.5 transition text-sm relative overflow-hidden tracking-wider shadow-sm cursor-pointer h-14 ${
                loading
                  ? "bg-[#1E2330] text-slate-400 border border-white/5 cursor-not-allowed"
                  : !transcript.trim()
                    ? "bg-[#16171D] text-slate-500 cursor-not-allowed border border-white/10"
                    : "button-glow bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/20 hover:shadow-lg active:scale-[0.99]"
              }`}
              id="generate_meeting_btn"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>AI 正在全力分析生成中，請稍候...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-indigo-200 animate-pulse" />
                  <span>生成極簡會議記錄與翻譯 ⚡</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Output Area Screen */}
        <section className="lg:col-span-6 flex flex-col" id="output_panel">
          <div className="glass-panel rounded-2xl shadow-xl flex-grow flex flex-col min-h-[500px] overflow-hidden">
            
            {/* Header toolbar for result */}
            <div className="bg-[#0D0F14]/80 px-6 py-4.5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 button-glow"></span>
                <span className="text-sm font-bold text-slate-200">AI 智能分析報告與翻譯結果</span>
              </div>
              
              {/* Action buttons if result is displayed */}
              {result && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    type="button"
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-slate-900/50 hover:bg-[#1E1F27]/60 active:scale-[0.98] text-slate-300 hover:text-white transition cursor-pointer"
                    id="copy_result_btn"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">已複製！</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-indigo-400" />
                        <span>一鍵複製</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    type="button"
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-slate-900/50 hover:bg-slate-800/80 active:scale-[0.98] text-slate-300 hover:text-white transition cursor-pointer"
                    id="download_result_btn"
                  >
                    <Download className="h-3.5 w-3.5 text-indigo-400" />
                    <span>下載 .md</span>
                  </button>
                </div>
              )}
            </div>

            {/* Core Box displaying Placeholder/Loader/Content */}
            <div className="p-6 flex-grow overflow-y-auto leading-relaxed max-h-[850px] relative h-full flex flex-col">
              
              <AnimatePresence mode="wait">
                {/* 1. Placeholder screen */}
                {!loading && !result && (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="my-auto flex flex-col items-center justify-center text-center p-8 flex-grow"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 mb-4 border border-white/10">
                      <FileText className="h-8 w-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-200">等待載入與生成</h3>
                    <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                      請在左側輸入您的會議講話、逐字內容或載入測試範例，並設定模式及語系，點擊送出即可以由 AI 秘書協助歸納。
                    </p>
                  </motion.div>
                )}

                {/* 2. Custom Loader with dynamic statements */}
                {loading && (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="my-auto flex flex-col items-center justify-center p-8 flex-grow"
                  >
                    <div className="relative flex items-center justify-center mb-6">
                      <div className="absolute w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                      <div className="w-14 h-14 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400">
                        <Sparkles className="h-6 w-6 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-200">AI 秘書正忙碌中...</h3>
                    <p className="text-xs text-indigo-300 font-medium mt-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl text-center shadow-xs animate-pulse max-w-md">
                      {loadingPhase}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-4">
                      這大概需要 4-8 秒鐘，極佳的排版與翻譯值得您稍加等候。
                    </p>
                  </motion.div>
                )}

                {/* 3. Output Content with specialized custom rendering */}
                {!loading && result && (
                  <motion.div
                    key="output"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="markdown-body text-sm select-text flex-grow pb-12 text-slate-300"
                    id="markdown_output_container"
                  >
                    {/* Visual Meta Badge */}
                    <div className="flex flex-wrap items-center gap-2 mb-6 select-none bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        模式: {selectedOption}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        目標語系: {targetLanguage}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-auto font-mono">
                        生成完成
                      </span>
                    </div>

                    <Markdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-3 text-white font-display" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-indigo-300 border-b pb-1.5 border-white/10 font-display" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base font-bold mt-4 mb-2 text-slate-200 border-l-4 border-indigo-500 pl-3.5 my-2" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3.5 text-slate-300 leading-relaxed text-sm" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-slate-300" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-slate-300" {...props} />,
                        li: ({node, ...props}) => <li className="pl-0.5 text-slate-300" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 py-1.5 my-3 bg-indigo-500/10 italic text-slate-300 rounded-r-lg" {...props} />,
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-4.5 rounded-xl border border-white/10 bg-black/20">
                            <table className="min-w-full divide-y divide-white/10" {...props} />
                          </div>
                        ),
                        thead: ({node, ...props}) => <thead className="bg-[#0D0F14]" {...props} />,
                        tbody: ({node, ...props}) => <tbody className="divide-y divide-white/5 bg-transparent" {...props} />,
                        tr: ({node, ...props}) => <tr className="hover:bg-white/5 transition" {...props} />,
                        th: ({node, ...props}) => <th className="px-4 py-3 bg-indigo-500/10 text-left text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/10" {...props} />,
                        td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-slate-300 whitespace-pre-line leading-relaxed" {...props} />,
                        code: ({node, ...props}) => <code className="bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono font-medium" {...props} />,
                      }}
                    >
                      {result}
                    </Markdown>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </section>
      </main>

      {/* Aesthetic Footer */}
      <footer className="mt-auto pt-16 text-center select-none" id="app_footer_container">
        <p className="text-xs text-slate-500 font-medium">
          © 2026 AI 會議記錄生成與翻譯工具 • SYSTEM ID: GEMINI-PRO-X1
        </p>
        <p className="text-[10px] text-slate-600 mt-1 font-mono uppercase tracking-widest">
          AI 引擎狀態: 運行正常 • Vite • React • Tailwind v4 • motion
        </p>
      </footer>
    </div>
  );
}
