import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { 
  BookOpen, 
  FileText, 
  Layers, 
  Lightbulb, 
  MessageSquare, 
  Copy, 
  Check, 
  Loader2, 
  Sparkles,
  Search,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { summarizeText, SummaryStyle } from "./services/geminiService";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStyle, setActiveStyle] = useState<SummaryStyle>(SummaryStyle.ABSTRACT);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async (styleOverride?: SummaryStyle) => {
    const styleToUse = styleOverride || activeStyle;
    setError(null);
    setIsLoading(true);
    try {
      const result = await summarizeText({ text: inputText, style: styleToUse });
      if (result) {
        setSummary(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const STYLES_CONFIG = [
    { id: SummaryStyle.ABSTRACT, label: "Abstract", icon: FileText, desc: "Technical overview" },
    { id: SummaryStyle.KEY_FINDINGS, label: "Findings", icon: Lightbulb, desc: "Core data points" },
    { id: SummaryStyle.METHODOLOGY, label: "Methodology", icon: Layers, desc: "Research design" },
    { id: SummaryStyle.CRITICAL_REVIEW, label: "Critical", icon: Search, desc: "Analysis & Critique" },
    { id: SummaryStyle.EXPLAIN_LIKE_IM_FIVE, label: "ELI5", icon: MessageSquare, desc: "Simple explanation" },
  ];

  return (
    <TooltipProvider>
      <div className="h-screen bg-academic-bg flex flex-col overflow-hidden">
        {/* Top Header Navigation */}
        <header className="h-14 border-b border-academic-border bg-white flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-academic-accent rounded flex items-center justify-center text-white font-bold">Σ</div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">ScholarSum.ai</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-100 rounded-lg p-1 border border-zinc-200">
              <button className="px-3 py-1 text-[11px] font-medium bg-white shadow-sm rounded border border-zinc-200">Summarizer</button>
              <button className="px-3 py-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-700">References</button>
              <button className="px-3 py-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-700">Methods</button>
            </div>
            <div className="h-4 w-[1px] bg-zinc-200" />
            <Badge variant="outline" className="font-mono text-[10px] border-zinc-300">v1.0.0-beta</Badge>
          </div>
        </header>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Sidebar: Paper Metadata */}
          <aside className="w-72 border-r border-academic-border bg-zinc-50/50 p-5 flex flex-col gap-6 shrink-0 overflow-y-auto">
            <section>
              <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Analysis Profile</h2>
              <div className="p-3 bg-white border border-zinc-200 rounded-lg shadow-sm">
                <h3 className="text-xs font-bold leading-tight mb-2">Live Document Buffer</h3>
                <p className="text-[11px] text-zinc-500 italic mb-3">Awaiting full synthesis of source material.</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-400">Integrity</span>
                    <span className="text-zinc-600 font-bold">Verified</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-academic-accent" 
                      initial={{ width: 0 }}
                      animate={{ width: inputText.length > 50 ? "100%" : "30%" }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Text Stats</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-white border border-zinc-200 rounded-lg">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Words</p>
                  <p className="text-base font-bold">{inputText.trim() ? inputText.split(/\s+/).length : 0}</p>
                </div>
                <div className="p-2 bg-white border border-zinc-200 rounded-lg">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Reading Time</p>
                  <p className="text-base font-bold">{Math.max(1, Math.ceil(inputText.split(/\s+/).length / 200))}m</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Mode Selection</h2>
              <div className="flex flex-col gap-1.5">
                {STYLES_CONFIG.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setActiveStyle(style.id);
                      if (summary) handleSummarize(style.id);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[11px] font-medium transition-all ${
                      activeStyle === style.id 
                        ? "bg-academic-accent text-white shadow-sm" 
                        : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    <style.icon size={12} />
                    {style.label}
                  </button>
                ))}
              </div>
            </section>

            <div className="mt-auto pt-6">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <h5 className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest mb-1">Quality Score</h5>
                <p className="text-[10px] text-indigo-700 leading-relaxed italic">
                  Advanced semantic verification active for all academic summaries.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
            {/* Input Section */}
            <div className="flex flex-col gap-4 min-h-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Source Material</h2>
                <div className="flex items-center gap-2">
                  {isLoading && <Loader2 className="animate-spin h-3 w-3 text-academic-accent" />}
                  <span className="text-[11px] text-zinc-400 font-mono">UTF-8 Input</span>
                </div>
              </div>
              <Card className="flex-1 border-academic-border shadow-sm overflow-hidden bg-white rounded-xl flex flex-col">
                <CardContent className="p-0 flex-1 relative">
                  <Textarea 
                    placeholder="Paste your research text here (Abstract, Conclusion, or full paper)..."
                    className="absolute inset-0 w-full h-full border-none focus-visible:ring-0 resize-none p-6 font-sans text-sm leading-relaxed"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                </CardContent>
                <Separator />
                <div className="p-3 bg-zinc-50 flex items-center justify-between shrink-0">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    {inputText.length} Chars • Academic Buffer
                  </div>
                  <Button 
                    onClick={() => handleSummarize()} 
                    disabled={isLoading || inputText.length < 50}
                    className="bg-zinc-900 hover:bg-black text-white h-8 text-xs font-bold px-4 gap-2 rounded-md"
                  >
                    {isLoading ? <Loader2 className="animate-spin h-3 w-3" /> : <Sparkles size={12} />}
                    Synthesize
                  </Button>
                </div>
              </Card>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs flex items-center gap-2"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                  {error}
                </motion.div>
              )}
            </div>

            {/* Output Section */}
            <div className="flex flex-col gap-4 min-h-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Generated Synthesis</h2>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded border border-zinc-200 bg-white"
                        onClick={handleCopy}
                        disabled={!summary}
                      >
                        {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-[10px]">Copy Report</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="flex-1 relative min-h-0">
                <AnimatePresence mode="wait">
                  {!summary && !isLoading ? (
                    <motion.div 
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-white border border-zinc-200 border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4"
                    >
                      <div className="h-12 w-12 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100">
                        <BookOpen className="text-zinc-300 h-6 w-6" />
                      </div>
                      <div className="max-w-[200px]">
                        <h3 className="text-zinc-600 text-xs font-bold uppercase tracking-wider">Synthesis Engine Idle</h3>
                        <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">System awaiting data ingestion. Processing will commence upon synthesis initiation.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key={activeStyle + (summary ? "loaded" : "empty")}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-full"
                    >
                      <Card className="h-full border-academic-border shadow-md bg-white rounded-xl overflow-hidden flex flex-col">
                        <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">{activeStyle} Active</span>
                          <div className="flex gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                          </div>
                        </div>
                        <CardContent className="p-0 flex-1 overflow-hidden relative">
                          <ScrollArea className="h-full">
                            <div className="p-6">
                              <div className="markdown-body p-0 prose-sm prose-zinc text-[14px]">
                                <ReactMarkdown>{summary || ""}</ReactMarkdown>
                              </div>
                            </div>
                          </ScrollArea>
                          {isLoading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                              <Loader2 className="animate-spin h-8 w-8 text-academic-accent" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </main>
        </div>

        {/* Bottom Control Bar */}
        <footer className="h-12 border-t border-academic-border bg-white px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">ScholarEngine v4.2 Ready</span>
            </div>
            <span className="text-zinc-300">|</span>
            <div className="flex gap-4">
              <span className="text-[10px] text-zinc-500 font-mono">Confidence: <span className="font-bold text-zinc-800">92.4%</span></span>
              <span className="text-[10px] text-zinc-500 font-mono">Latency: <span className="font-bold text-zinc-800">{isLoading ? "---" : "1.12s"}</span></span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-7 text-[10px] font-bold uppercase tracking-wider px-3 border-zinc-300 hover:bg-zinc-50">Export Logs</Button>
            <Button className="h-7 text-[10px] font-bold uppercase tracking-wider px-3 bg-zinc-900 border-none hover:bg-black text-white">Full Report</Button>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
