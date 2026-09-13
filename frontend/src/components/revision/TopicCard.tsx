import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  BookOpen, 
  Code, 
  Lightbulb,
  Target,
  ListOrdered,
  ArrowRightLeft,
  GraduationCap,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { TopicNote } from '../../types';

interface TopicCardProps {
  topic: TopicNote;
  onToggleReviewed: (id: string) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onToggleReviewed }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const parts = [
      `# ${topic.topic_title} [${topic.priority} PRIORITY - ${topic.source_reference}]`,
      `\n**Overview**: ${topic.summary}`,
      topic.core_explanation ? `\n**Core Concept**: ${topic.core_explanation}` : '',
      topic.key_concepts?.length ? `\n**Key Concepts**:\n${topic.key_concepts.map(k => `- ${k}`).join('\n')}` : '',
      topic.formulas_or_rules?.length ? `\n**Formulas & Rules**:\n${topic.formulas_or_rules.map(f => `- ${f}`).join('\n')}` : '',
      topic.structured_pitfalls?.length ? `\n**Exam Pitfalls**:\n${topic.structured_pitfalls.map(p => `- Misconception: ${p.misconception} | Truth: ${p.correct_understanding}`).join('\n')}` : '',
    ].filter(Boolean);

    navigator.clipboard.writeText(parts.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className={`border rounded-3xl transition-all duration-200 overflow-hidden ${
      topic.reviewed 
        ? 'bg-slate-50/80 border-slate-200' 
        : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
    }`}>
      {/* Header bar */}
      <div className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wider ${getPriorityStyle(topic.priority)}`}>
              {topic.priority} PRIORITY
            </span>

            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
              Source: {topic.source_reference}
            </span>

            {topic.reviewed && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Reviewed</span>
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {topic.topic_title}
          </h3>

          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            {topic.summary}
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleCopy}
            className={`p-1.5 rounded-lg border transition-all ${
              copied 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-transparent hover:border-slate-200'
            }`}
            title={copied ? "Copied to clipboard!" : "Copy Topic Notes"}
            aria-label="Copy Topic Notes"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onToggleReviewed(topic.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              topic.reviewed
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${topic.reviewed ? 'text-emerald-700' : 'text-slate-400'}`} />
            <span>{topic.reviewed ? 'Reviewed' : 'Mark Reviewed'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Priority Evidence Rationale */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-600 flex items-center space-x-2">
        <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span><b>Evidence Basis:</b> {topic.priority_reason}</span>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-5 border-t border-slate-100 space-y-5 bg-white">
          
          {/* Core Explanation (Teacher-style grounded explanation) */}
          {topic.core_explanation && topic.core_explanation !== topic.summary && (
            <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4">
              <h4 className="text-xs uppercase font-bold text-indigo-900 tracking-wider mb-2 flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Core Concept Explanation</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {topic.core_explanation}
              </p>
            </div>
          )}

          {/* Key Concepts */}
          {topic.key_concepts && topic.key_concepts.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-700 tracking-wider mb-2 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Key Academic Concepts</span>
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                {topic.key_concepts.map((kc, idx) => (
                  <li key={idx} className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-indigo-600 font-bold shrink-0">&bull;</span>
                    <span>{kc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Important Definitions */}
          {topic.definitions && topic.definitions.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-700 tracking-wider mb-2 flex items-center space-x-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                <span>Important Definitions</span>
              </h4>
              <div className="space-y-1.5">
                {topic.definitions.map((def, idx) => (
                  <div key={idx} className="text-xs text-slate-800 bg-blue-50/40 p-2.5 rounded-xl border border-blue-100">
                    {def}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Procedures & Algorithms (Numbered Steps) */}
          {topic.procedures && topic.procedures.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-700 tracking-wider mb-2 flex items-center space-x-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                <span>Algorithmic Procedures & Workflow Steps</span>
              </h4>
              <div className="space-y-1.5">
                {topic.procedures.map((proc, idx) => (
                  <div key={idx} className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-start space-x-2">
                    <span className="font-semibold text-indigo-600 shrink-0">{proc.split('.')[0]}.</span>
                    <span>{proc.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulas or Rules */}
          {topic.formulas_or_rules && topic.formulas_or_rules.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-700 tracking-wider mb-2 flex items-center space-x-1.5">
                <Code className="w-3.5 h-3.5 text-purple-600" />
                <span>Formulas & Core Rules</span>
              </h4>
              <div className="space-y-1.5 font-mono">
                {topic.formulas_or_rules.map((rule, idx) => (
                  <div key={idx} className="text-xs text-purple-900 bg-purple-50 border border-purple-200 p-2.5 rounded-xl font-semibold">
                    <code>{rule}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Comparisons */}
          {topic.comparisons && topic.comparisons.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-700 tracking-wider mb-2 flex items-center space-x-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600" />
                <span>Key Comparisons</span>
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="p-2.5 font-semibold">Aspect</th>
                      <th className="p-2.5 font-semibold">Concept A</th>
                      <th className="p-2.5 font-semibold">Concept B</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topic.comparisons.map((comp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-medium text-slate-900">{comp.aspect}</td>
                        <td className="p-2.5 text-slate-700">{comp.concept_a}</td>
                        <td className="p-2.5 text-slate-700">{comp.concept_b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Evidence-Based Structured Pitfalls & Misconceptions */}
          {topic.structured_pitfalls && topic.structured_pitfalls.length > 0 ? (
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Common Exam Pitfalls & Misconceptions</span>
              </h4>
              <div className="space-y-2.5">
                {topic.structured_pitfalls.map((pit, idx) => (
                  <div key={idx} className="bg-white/80 border border-amber-200/80 rounded-xl p-3 text-xs space-y-1.5">
                    <div className="flex items-start space-x-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0 uppercase">
                        Misconception
                      </span>
                      <span className="text-slate-700">{pit.misconception}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 uppercase">
                        Truth
                      </span>
                      <span className="text-slate-800 font-medium">{pit.correct_understanding}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0 uppercase">
                        Why It Matters
                      </span>
                      <span className="text-slate-600 italic">{pit.why_it_matters}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : topic.common_mistakes && topic.common_mistakes.length > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Common Exam Pitfalls & Misconceptions</span>
              </h4>
              <ul className="space-y-1 text-xs text-amber-900/90">
                {topic.common_mistakes.map((mis, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-amber-600">&bull;</span>
                    <span>{mis}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Exam Focus Points */}
          {topic.exam_focus_points && topic.exam_focus_points.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] text-slate-500 font-semibold mb-1.5 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>High-Value Revision Points Grounded in {topic.source_reference}:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topic.exam_focus_points.map((pt, idx) => (
                  <span key={idx} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                    {pt}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
