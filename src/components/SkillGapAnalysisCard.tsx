import { ShieldAlert, Lightbulb, Sparkles } from "lucide-react";
import { SkillGapAnalysis, SkillGap } from "../types";

interface SkillGapAnalysisCardProps {
  skillGapAnalysis: SkillGapAnalysis;
}

export default function SkillGapAnalysisCard({ skillGapAnalysis }: SkillGapAnalysisCardProps) {
  const getGapPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "low":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getGapTypeBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case "critical":
        return "bg-rose-100 text-rose-900 font-bold border-rose-300";
      case "missing":
        return "bg-amber-100 text-amber-900 font-medium border-amber-200";
      case "emerging":
        return "bg-purple-100 text-purple-900 font-medium border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
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
                <div className="flex gap-1.5 items-center mt-1">
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
              <strong className="text-slate-800 font-semibold">Impact: </strong>{gap.impactDescription}
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
  );
}
