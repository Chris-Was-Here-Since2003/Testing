import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Brain, 
  Compass, 
  HelpCircle, 
  RefreshCw, 
  AlertCircle, 
  TrendingUp, 
  Info,
  LogOut,
  User as UserIcon,
  History,
  Trash2,
  Clock,
  Database,
  Lock,
  ChevronDown
} from "lucide-react";
import ResumeUpload from "./components/ResumeUpload";
import AnalysisDashboard from "./components/AnalysisDashboard";
import AccountModal from "./components/AccountModal";
import { ResumeAnalysisResult, User, SavedResume } from "./types";
import { SAMPLE_RESUMES } from "./sampleData";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [resetKey, setResetKey] = useState(0);

  // Authentication & SQL Relational Database States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [isSavingResume, setIsSavingResume] = useState(false);
  const [isCurrentResumeSaved, setIsCurrentResumeSaved] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

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

  // Read current user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("skillsense_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch (e) {
        console.error("Error reading stored user session:", e);
      }
    }
  }, []);

  // Fetch saved analyses when user logs in or switches
  const fetchSavedResumes = async (userId: string) => {
    try {
      const response = await fetch("/api/resumes", {
        headers: {
          "x-user-id": userId
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedResumes(data);
      }
    } catch (err) {
      console.error("Failed to load SQL database history:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchSavedResumes(currentUser.id);
    } else {
      setSavedResumes([]);
    }
    setIsCurrentResumeSaved(false);
  }, [currentUser]);

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("skillsense_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("skillsense_user");
    setShowHistoryDropdown(false);
    setIsCurrentResumeSaved(false);
  };

  // SQL Persistence Handlers
  const handleSaveCurrentAnalysis = async () => {
    if (!currentUser || !analysisResult) return;
    setIsSavingResume(true);
    try {
      const candidateName = analysisResult.personalInfo.fullName || "Resume Analysis";
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id
        },
        body: JSON.stringify({
          name: candidateName,
          parsedData: analysisResult
        })
      });

      if (response.ok) {
        setIsCurrentResumeSaved(true);
        fetchSavedResumes(currentUser.id);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save analysis.");
      }
    } catch (err) {
      console.error("SQL Save analysis failed:", err);
    } finally {
      setIsSavingResume(false);
    }
  };

  const handleDeleteSavedResume = async (resumeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    if (!confirm("Are you sure you want to delete this saved analysis from your SQL database?")) return;

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": currentUser.id
        }
      });

      if (response.ok) {
        setSavedResumes((prev) => prev.filter((r) => r.id !== resumeId));
        // Reset current analysis if it was deleted
        setIsCurrentResumeSaved(false);
      } else {
        alert("Failed to delete analysis.");
      }
    } catch (err) {
      console.error("Delete saved resume failed:", err);
    }
  };

  const handleSelectSavedResume = (resume: SavedResume) => {
    setAnalysisResult(resume.parsedData);
    setIsCurrentResumeSaved(true);
    setShowHistoryDropdown(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 3000);
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
    setIsCurrentResumeSaved(false);

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
    setIsCurrentResumeSaved(false);
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

          <div className="flex items-center gap-4">
            <span className="hidden lg:inline bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 text-xs font-medium">
              Powered by Gemini 2.5 Flash
            </span>

            {/* SQL Relational Accounts Widget */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* History Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                    className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-slate-200"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    SQL History ({savedResumes.length})
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showHistoryDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                      <div className="px-4 py-1.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SQL Table: Analyses</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">SQLite3</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {savedResumes.length === 0 ? (
                          <div className="px-4 py-4 text-center text-xs text-gray-400 font-medium">
                            No saved analyses yet.
                          </div>
                        ) : (
                          savedResumes.map((resume) => (
                            <div
                              key={resume.id}
                              onClick={() => handleSelectSavedResume(resume)}
                              className="w-full text-left px-4 py-2.5 hover:bg-indigo-50/50 flex items-center justify-between gap-3 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                            >
                              <div className="min-w-0">
                                <span className="block text-xs font-bold text-slate-800 truncate">
                                  {resume.name}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                                  <Clock className="w-3 h-3 text-gray-300" />
                                  {new Date(resume.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <button
                                onClick={(e) => handleDeleteSavedResume(resume.id, e)}
                                className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Details */}
                <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-800">{currentUser.email}</span>
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Database className="w-2.5 h-2.5" /> SQL Storage
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                My Account
              </button>
            )}
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
          <AnalysisDashboard 
            data={analysisResult} 
            onReset={handleReset} 
            currentUser={currentUser}
            onSave={handleSaveCurrentAnalysis}
            isSaving={isSavingResume}
            isSaved={isCurrentResumeSaved}
            onTriggerLogin={() => setShowAuthModal(true)}
          />
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

      {/* Account Modal for SQLite Authentication */}
      {showAuthModal && (
        <AccountModal 
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
