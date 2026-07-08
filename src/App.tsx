import { useState, useEffect } from "react";
import { Sparkles, Brain, Compass, HelpCircle, RefreshCw, AlertCircle, TrendingUp, Info } from "lucide-react";
import ResumeUpload from "./components/ResumeUpload";
import AnalysisDashboard from "./components/AnalysisDashboard";
import { ResumeAnalysisResult } from "./types";
import { SAMPLE_RESUMES } from "./sampleData";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const loadingPhrases = [
    "Parsing resume document structures...",
    "Extracting work experience timelines and metrics...",
    "Categorizing technical, soft, and domain skill vectors...",
    "Accessing real-time 2026 labor market statistics...",
    "Simulating 2031 technological automation and stack disruption indices...",
    "Running multi-epoch career trajectory models...",
    "Assembling strategic gap analysis and professional coach recommendations...",
    "Wrapping visual dashboard parameters..."
  ];
  useEffect(() => {
    handleReset(); // Reset state on initial load/reload
  }, []);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 3000);//change the phrase every 3 seconds
    } else {
      setLoadingPhraseIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleAnalyze = async (payload: {
    textData?: string;
    fileData?: string;
    mimeType?: string;
    isSample?: boolean;
    sampleName?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    // Short-circuit if it is a sample
    if (payload.isSample && payload.sampleName) {
      setTimeout(() => {
        const sample = SAMPLE_RESUMES[payload.sampleName!];
        if (sample) {
          setAnalysisResult(sample.data);
        } else {
          setError("Sample not found.");
        }
        setIsLoading(false);
      }, 1500); // Small realistic simulation delay for a delightful user experience
      return;
    }

    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          textData: payload.textData,
          fileData: payload.fileData,
          mimeType: payload.mimeType,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during resume parsing. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col justify-between" id="app-root">
      
      {/* Navbar header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 md:px-8 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-sans font-black shadow-md shadow-indigo-100">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="font-sans font-extrabold text-lg tracking-tight text-slate-950 block">
                SkillSense
              </span>
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">
                AI Resume Futurist
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <span className="hidden sm:inline bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
              Powered by Gemini 2.5 Flash
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-8 px-6 md:px-8 max-w-7xl w-full mx-auto flex flex-col justify-center">
        {isLoading ? (
          /* Delightful custom loading screen with real steps and progress bar */
          <div className="w-full max-w-lg mx-auto text-center space-y-8 py-16" id="loading-state">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
              <Sparkles className="w-8 h-8 text-indigo-600 absolute animate-pulse" />
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900">Analyzing Your Potential...</h3>
              <p className="text-sm text-gray-500 min-h-[40px] font-mono transition-all duration-300">
                {loadingPhrases[loadingPhraseIndex]}
              </p>
            </div>

            {/* Simulated progress indicator */}
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${((loadingPhraseIndex + 1) / loadingPhrases.length) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : error ? (
          /* Error feedback panel */
          <div className="w-full max-w-2xl mx-auto bg-white border border-rose-200 rounded-2xl p-8 shadow-sm text-center space-y-6" id="error-state">
            <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border border-rose-100">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Analysis Request Failed</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                {error}
              </p>
            </div>

            {/* Error assistance card */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-left text-gray-500 max-w-md mx-auto space-y-2">
              <span className="font-bold text-slate-800 block">Troubleshooting Steps:</span>
              <ul className="list-disc list-inside space-y-1">
                <li>Make sure your Gemini API Key is configured in the AI Studio sidebar.</li>
                <li>Ensure the resume is text-readable or clear image format.</li>
                <li>Use the pre-configured sample files below to try the features instantly.</li>
              </ul>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm shadow-sm"
                id="btn-retry"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        ) : analysisResult ? (
          /* The primary dashboard view */
          <AnalysisDashboard data={analysisResult} onReset={handleReset} />
        ) : (
          /* Upload View */
          <ResumeUpload key={resetKey} onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}
      </main>

      {/* Footer explaining methodology */}
      <footer className="bg-white border-t border-gray-200 py-6 px-6 shrink-0 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 SkillSense. Built with Google AI Studio and Gemini 3.5 Flash.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              Scored using standard macroeconomic labor models
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
