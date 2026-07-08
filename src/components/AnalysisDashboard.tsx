import { useState } from "react";
import { 
  Briefcase, 
  GraduationCap, 
  Award, 
  FolderGit2, 
  ShieldAlert, 
  Compass, 
  BarChart3, 
  FileCheck, 
  ArrowRight, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  Search,
  Filter,
  Sparkles,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import { ResumeAnalysisResult, SkillItem, PredictedRole, SkillGap } from "../types";

interface AnalysisDashboardProps {
  data: ResumeAnalysisResult;
  onReset: () => void;
}

export default function AnalysisDashboard({ data, onReset }: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<"insights" | "resume">("insights");
  const [skillSearch, setSkillSearch] = useState("");
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<"all" | "technical" | "soft" | "domain">("all");
  const [selectedPathwayIdx, setSelectedPathwayIdx] = useState<number>(0);
  const [selectedPredictedRoleIdx, setSelectedPredictedRoleIdx] = useState<number>(0);
  const [selectedEpoch, setSelectedEpoch] = useState<"fiveYearsAgo" | "today" | "fiveYearsFuture">("today");

  const { personalInfo, workExperience, education, skills, certifications, projects, achievements, careerProgression, competitivenessScores, skillGapAnalysis } = data;

  // Gracefully normalize career progression to pathways structure supporting legacy or standard results
  const pathways = careerProgression.pathways || ((careerProgression as any).predictedRoles ? [{
    pathwayName: "Primary Career Track",
    description: "The main predicted progression roadmap based on current skills and background.",
    predictedRoles: (careerProgression as any).predictedRoles
  }] : []);

  // Filter skills based on search term and category selection
  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
                          (skill.strengthDescription || "").toLowerCase().includes(skillSearch.toLowerCase());
    const matchesCategory = skillCategoryFilter === "all" || skill.category.toLowerCase() === skillCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "low": {
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      }
      case "medium": {
        return "bg-amber-50 text-amber-700 border-amber-200";
      }
      case "high": {
        return "bg-rose-50 text-rose-700 border-rose-200";
      }
      default: {
        return "bg-gray-50 text-gray-700 border-gray-200";
      }
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand.toLowerCase()) {
      case "high": {
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      }
      case "moderate": {
        return "bg-sky-50 text-sky-700 border-sky-200";
      }
      case "low": {
        return "bg-slate-50 text-slate-700 border-slate-200";
      }
      default: {
        return "bg-gray-50 text-gray-700 border-gray-200";
      }
    }
  };

  const getGapPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": {
        return "bg-red-50 text-red-700 border-red-200";
      }
      case "medium": {
        return "bg-amber-50 text-amber-700 border-amber-200";
      }
      case "low": {
        return "bg-blue-50 text-blue-700 border-blue-200";
      }
      default: {
        return "bg-gray-50 text-gray-700 border-gray-200";
      }
    }
  };

  const getGapTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "critical": {
        return "bg-rose-100 text-rose-900 font-bold border-rose-300";
      }
      case "missing": {
        return "bg-amber-100 text-amber-900 font-medium border-amber-200";
      }
      case "emerging": {
        return "bg-purple-100 text-purple-900 font-medium border-purple-200";
      }
      default: {
        return "bg-gray-100 text-gray-800 border-gray-200";
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-16" id="analysis-dashboard">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
          id="btn-back-to-upload"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resume Upload
        </button>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              activeTab === "insights"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            id="tab-btn-insights"
          >
            <Compass className="w-4 h-4" />
            AI Career Insights
          </button>
          <button
            onClick={() => setActiveTab("resume")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              activeTab === "resume"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            id="tab-btn-resume"
          >
            <FileCheck className="w-4 h-4" />
            Parsed Resume Data
          </button>
        </div>
      </div>

      {/* Main header block */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-10 text-white border border-slate-800 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Intelligence Profile
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-sans tracking-tight">{personalInfo.fullName}</h2>
            {personalInfo.summary && (
              <p className="text-gray-300 text-base md:text-lg leading-relaxed font-light">
                {personalInfo.summary}
              </p>
            )}

            {/* Contacts bar */}
            <div className="flex flex-wrap gap-4 text-xs md:text-sm text-gray-400 pt-2">
              {personalInfo.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-indigo-400" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span>{personalInfo.location}</span>
                </div>
              )}
            </div>

            {/* Links bar */}
            {personalInfo.links && personalInfo.links.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {personalInfo.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.startsWith("http") ? link : `https://${link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-white hover:underline transition-colors bg-white/5 px-2.5 py-1 rounded-md border border-white/10"
                  >
                    <span>{link}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Current Status Badge */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl md:w-64 backdrop-blur-sm space-y-2 shrink-0">
            <span className="text-xs text-indigo-300 font-semibold tracking-wide block uppercase">
              Current Career Stage
            </span>
            <div className="text-xl font-bold text-white">
              {careerProgression.currentCareerStage || "Determining..."}
            </div>
            <div className="h-[1px] bg-white/10 my-2"></div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              Ready for upskilling analysis
            </div>
          </div>
        </div>
      </div>

      {activeTab === "insights" ? (
        /* INSIGHTS TAB */
        <div className="grid lg:grid-cols-3 gap-8" id="insights-view-content">
          {/* LEFT 2 COLUMNS: Scores & Career Progression & Skills Heatmap */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. COMPETITIVENESS SCORES TIME LAPSE */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Market Competitiveness Scores
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Evaluation based on labor economics, tech stack popularity, and automation models.
                  </p>
                </div>
                {/* Epoch switches */}
                <div className="flex bg-gray-100 p-1 rounded-lg shrink-0 text-xs font-semibold">
                  <button
                    onClick={() => setSelectedEpoch("fiveYearsAgo")}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      selectedEpoch === "fiveYearsAgo" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    5 Years Ago
                  </button>
                  <button
                    onClick={() => setSelectedEpoch("today")}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      selectedEpoch === "today" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Today (2026)
                  </button>
                  <button
                    onClick={() => setSelectedEpoch("fiveYearsFuture")}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      selectedEpoch === "fiveYearsFuture" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    5 Years Future
                  </button>
                </div>
              </div>

              {/* Spark Chart / Interactive Graphic */}
              <div className="grid md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    {selectedEpoch === "fiveYearsAgo" ? "Competitiveness Score (2021)" : selectedEpoch === "today" ? "Competitiveness Score (2026)" : "Projected Score (2031)"}
                  </div>
                  
                  {/* Gauge indicator */}
                  <div className="relative flex items-center justify-center w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-gray-200 fill-none"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-indigo-600 fill-none transition-all duration-1000"
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * competitivenessScores[selectedEpoch].score) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-3xl font-sans font-extrabold text-gray-900 flex flex-col items-center justify-center">
                      <span>{competitivenessScores[selectedEpoch].score}</span>
                      <span className="text-[10px] text-gray-400 font-normal uppercase tracking-wider">out of 100</span>
                    </div>
                  </div>

                  <div className="mt-4 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                    {competitivenessScores[selectedEpoch].score >= 85 ? "Excellent Alignment" : competitivenessScores[selectedEpoch].score >= 70 ? "Strong Alignment" : "Needs Upskilling"}
                  </div>
                </div>

                {/* Explanation text */}
                <div className="md:col-span-8 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      Labor & Technology Trend Context
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed bg-indigo-50/20 border border-indigo-100/50 p-4 rounded-xl">
                      {competitivenessScores[selectedEpoch].marketTrendContext}
                    </p>
                  </div>

                  {/* 3-Epoch Quick timeline switcher visual */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button 
                      onClick={() => setSelectedEpoch("fiveYearsAgo")}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedEpoch === "fiveYearsAgo" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-200 hover:border-indigo-200"
                      }`}
                    >
                      <div className="text-xs opacity-80 font-medium">5 Years Ago</div>
                      <div className="text-lg font-bold">{competitivenessScores.fiveYearsAgo.score}%</div>
                    </button>
                    <button 
                      onClick={() => setSelectedEpoch("today")}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedEpoch === "today" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-200 hover:border-indigo-200"
                      }`}
                    >
                      <div className="text-xs opacity-80 font-medium">Today</div>
                      <div className="text-lg font-bold">{competitivenessScores.today.score}%</div>
                    </button>
                    <button 
                      onClick={() => setSelectedEpoch("fiveYearsFuture")}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedEpoch === "fiveYearsFuture" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-200 hover:border-indigo-200"
                      }`}
                    >
                      <div className="text-xs opacity-80 font-medium">5 Yrs Future</div>
                      <div className="text-lg font-bold">{competitivenessScores.fiveYearsFuture.score}%</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PREDICTED CAREER PATHWAY PROGRESSION */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-600" />
                    Predictive Career Progression Roadmap
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    AI-simulated advancement pathways detailing alternative corporate trajectories.
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
                  {pathways.length} Paths Available (Max 5)
                </span>
              </div>

              {/* Pathway selection tabs */}
              {pathways.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Choose Pathway Option:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pathways.map((path: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedPathwayIdx(idx);
                          setSelectedPredictedRoleIdx(0);
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer ${
                          selectedPathwayIdx === idx
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.01]"
                            : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800"
                        }`}
                        id={`btn-pathway-tab-${idx}`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedPathwayIdx === idx ? "bg-white text-indigo-700" : "bg-indigo-100 text-indigo-700"}`}>
                            {idx + 1}
                          </span>
                          <span className="line-clamp-1">{path.pathwayName}</span>
                        </div>
                        {path.description && (
                          <p className={`text-[10px] leading-snug line-clamp-2 ${selectedPathwayIdx === idx ? "text-indigo-100 font-light" : "text-gray-500"}`}>
                            {path.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pathway Horizontal/Vertical Visual Timeline */}
              {pathways[selectedPathwayIdx] ? (
                <div className="flex flex-col space-y-6 pt-2">
                  
                  {/* Horizontal nodes for timeline navigation */}
                  <div className="relative flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="absolute left-6 right-6 top-[28px] h-[2px] bg-gray-200 z-0"></div>
                    
                    {pathways[selectedPathwayIdx].predictedRoles.map((role: PredictedRole, idx: number) => {
                      const isSelected = selectedPredictedRoleIdx === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedPredictedRoleIdx(idx)}
                          className="relative z-10 flex flex-col items-center focus:outline-none group cursor-pointer"
                          id={`btn-career-node-${idx}`}
                        >
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                            isSelected 
                              ? "bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100" 
                              : "bg-white border-gray-300 text-gray-500 group-hover:border-indigo-400 group-hover:text-indigo-600"
                          }`}>
                            {idx + 1}
                          </div>
                          <span className={`text-[10px] md:text-xs font-semibold mt-1 bg-white px-2 py-0.5 rounded-full border ${
                            isSelected ? "text-indigo-700 border-indigo-200 shadow-sm" : "text-gray-500 border-transparent"
                          }`}>
                            {role.timeframe}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Info Card for selected role */}
                  {pathways[selectedPathwayIdx].predictedRoles[selectedPredictedRoleIdx] && (() => {
                    const activeRole = pathways[selectedPathwayIdx].predictedRoles[selectedPredictedRoleIdx];
                    return (
                      <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-6 space-y-4 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-100/60 pb-3">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                              Predicted Step {selectedPredictedRoleIdx + 1} ({activeRole.timeframe})
                            </span>
                            <h4 className="text-lg font-bold text-slate-900">{activeRole.roleTitle}</h4>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(activeRole.transitionDifficulty)}`}>
                              Difficulty: {activeRole.transitionDifficulty}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDemandColor(activeRole.marketDemand)}`}>
                              Market Demand: {activeRole.marketDemand}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 leading-relaxed">
                          {activeRole.description}
                        </p>

                        <div className="space-y-2">
                          <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wide">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            Prerequisite Skills to Master:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {activeRole.requiredSkillsToAcquire.map((skill, idx) => (
                              <span 
                                key={idx}
                                className="bg-white border border-indigo-200 text-indigo-800 text-xs px-2.5 py-1 rounded-md font-medium shadow-sm hover:border-indigo-400 transition-all"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Executive Outlook summary card */}
                  {careerProgression.outlookSummary && (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Executive Outlook Summary</h4>
                        <p className="text-xs text-gray-600 leading-relaxed mt-1">{careerProgression.outlookSummary}</p>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No career pathways predicted.
                </div>
              )}
            </div>

            {/* 3. SKILLS HEATMAP WITH DETAILED GRADES */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Skills Heat Map & Proficiency Profiles
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Categorized breakdown of technical prowess, industry domains, and critical soft skills.
                  </p>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-[14px]" />
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search skills or keywords..."
                    className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
                
                {/* Category filters */}
                <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold self-start md:self-auto shrink-0">
                  <button
                    onClick={() => setSkillCategoryFilter("all")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      skillCategoryFilter === "all" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    All Skills
                  </button>
                  <button
                    onClick={() => setSkillCategoryFilter("technical")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      skillCategoryFilter === "technical" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Technical
                  </button>
                  <button
                    onClick={() => setSkillCategoryFilter("soft")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      skillCategoryFilter === "soft" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Soft Skills
                  </button>
                  <button
                    onClick={() => setSkillCategoryFilter("domain")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      skillCategoryFilter === "domain" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Domain
                  </button>
                </div>
              </div>

              {/* Heat Map Grid */}
              {filteredSkills.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No matching skills found. Try clear search or filters.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredSkills.map((skill, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            skill.category === "technical" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                            skill.category === "soft" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            "bg-purple-50 text-purple-700 border border-purple-100"
                          }`}>
                            {skill.category}
                          </span>
                          <h4 className="font-semibold text-slate-900 text-sm">{skill.name}</h4>
                        </div>
                        <span className="text-base font-extrabold text-indigo-600">{skill.proficiency}%</span>
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            skill.category === "technical" ? "bg-indigo-600" :
                            skill.category === "soft" ? "bg-emerald-500" :
                            "bg-purple-500"
                          }`}
                          style={{ width: `${skill.proficiency}%` }}
                        ></div>
                      </div>

                      {skill.strengthDescription && (
                        <p className="text-xs text-gray-500 italic leading-relaxed">
                          "{skill.strengthDescription}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDEBAR COLUMN: Gaps & Actionable Recommendations */}
          <div className="space-y-8">
            
            {/* 4. SKILL GAP ANALYSIS */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  Skill Gap & Urgency Index
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Identification of critical skills missing for 2031 future market competitiveness.
                </p>
              </div>

              {/* List of Gaps */}
              <div className="space-y-4">
                {skillGapAnalysis.gaps.map((gap: SkillGap, idx: number) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 space-y-3 relative hover:border-indigo-300 transition-all"
                  >
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm">{gap.skillName}</h4>
                        <div className="flex gap-1.5 items-center">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border ${getGapTypeBadge(gap.type)}`}>
                            {gap.type}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border ${getGapPriorityColor(gap.priority)}`}>
                            Priority: {gap.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong className="text-slate-800">Impact: </strong>{gap.impactDescription}
                    </p>

                    {/* Action recommendations box */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-950 flex gap-2 items-start">
                      <Lightbulb className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block text-indigo-900 mb-0.5">Actionable Recommendation:</strong>
                        {gap.actionableRecommendation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Strategic career advice block */}
              {skillGapAnalysis.strategicAdvice && (
                <div className="bg-indigo-950 text-indigo-100 rounded-xl p-5 space-y-3 border border-indigo-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-bounce" />
                    Professional Coach Strategic Advice
                  </h4>
                  <p className="text-xs leading-relaxed text-indigo-100/90 font-light">
                    {skillGapAnalysis.strategicAdvice}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        /* PARSED RESUME DATA TAB */
        <div className="grid lg:grid-cols-3 gap-8" id="resume-view-content">
          {/* Work experience section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Work Experience
              </h3>

              <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-50">
                {workExperience.map((exp, idx) => (
                  <div key={idx} className="relative pl-8 space-y-2">
                    {/* timeline marker */}
                    <div className="absolute left-1 top-1.5 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm ring-1 ring-indigo-200"></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-base font-bold text-slate-900">{exp.jobTitle}</h4>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full shrink-0 self-start sm:self-auto border border-indigo-100">
                        {exp.duration}
                      </span>
                    </div>

                    <div className="text-sm font-medium text-gray-600 flex flex-wrap items-center gap-2">
                      <span>{exp.company}</span>
                      {exp.location && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {exp.location}
                          </span>
                        </>
                      )}
                    </div>

                    {exp.description && exp.description.length > 0 && (
                      <ul className="space-y-1.5 pt-2 list-disc list-inside text-sm text-gray-600 leading-relaxed pl-1">
                        {exp.description.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Projects section */}
            {projects && projects.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <FolderGit2 className="w-5 h-5 text-indigo-600" />
                  Key Projects
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {projects.map((project, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-900 text-sm">{project.title}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">{project.description}</p>
                      </div>
                      {project.technologiesUsed && project.technologiesUsed.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {project.technologiesUsed.map((tech, tIdx) => (
                            <span key={tIdx} className="bg-white border border-gray-300 px-2 py-0.5 rounded text-[10px] text-gray-600 font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Education & Certs right column */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Education
              </h3>

              <div className="space-y-6">
                {education.map((edu, idx) => (
                  <div key={idx} className="space-y-2 border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{edu.degree}</h4>
                      {edu.fieldOfStudy && (
                        <p className="text-xs font-semibold text-indigo-600 mt-0.5">{edu.fieldOfStudy}</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      <p className="font-medium text-gray-700">{edu.institution}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {edu.duration && <span>{edu.duration}</span>}
                        {edu.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" />
                              {edu.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications and Achievements */}
            {certifications && certifications.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Certifications
                </h3>

                <div className="space-y-4">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="flex gap-3 items-start text-xs border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{cert.name}</h4>
                        {cert.issuingOrganization && (
                          <p className="text-gray-500 mt-0.5">{cert.issuingOrganization}</p>
                        )}
                        {cert.issueDate && (
                          <p className="text-gray-400 mt-0.5">Issued: {cert.issueDate}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {achievements && achievements.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Honors & Achievements
                </h3>

                <ul className="space-y-2 text-xs text-gray-600 list-disc list-inside">
                  {achievements.map((achievement, idx) => (
                    <li key={idx} className="leading-relaxed">{achievement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
