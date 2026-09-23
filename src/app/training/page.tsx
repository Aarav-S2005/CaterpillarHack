"use client";

import { CheckCircle2, Clock, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import type { TrainingCourse } from "@/lib/types";

export default function TrainingPage() {
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(
    null,
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);

  const fetchCourses = async () => {
    try {
      const data = await apiClient.getTrainingCourses();
      setCourses(data);
      if (data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCompleteQuiz = async () => {
    if (!selectedCourse || selectedAnswer === null) return;
    const isCorrect = selectedAnswer === selectedCourse.quiz[0].correctIndex;
    setQuizSubmitted(true);
    setQuizSuccess(isCorrect);

    if (isCorrect) {
      const updated = await apiClient.completeTraining(selectedCourse.id, 92);
      setCourses((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
      setSelectedCourse(updated);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#ffcd11]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffcd11]">
              BEHAVIOR-DRIVEN ADAPTIVE TRAINING HUB
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
            Targeted Operator Skill Drills & Micro-Courses
          </h1>
          <p className="text-xs text-slate-400">
            Automated course recommendations triggered directly by observed
            telemetry anomalies and delay drivers.
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="rounded-lg bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 text-emerald-300 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            <span>Closed-Loop Skill Feedback Active</span>
          </div>
        </div>
      </div>

      {/* Grid: Course Catalog on Left (5 cols) & Interactive Course Viewer on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Course List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-mono text-slate-400 px-1 flex justify-between">
            <span>RECOMMENDED MODULES ({courses.length})</span>
            <span>STATUS</span>
          </div>

          {courses.map((course) => {
            const isSelected = selectedCourse?.id === course.id;

            return (
              <div
                key={course.id}
                onClick={() => {
                  setSelectedCourse(course);
                  setSelectedAnswer(null);
                  setQuizSubmitted(false);
                }}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-[#ffcd11] bg-slate-900/90 shadow-lg"
                    : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-[9px] font-mono font-bold text-[#ffcd11] border border-yellow-500/30 uppercase">
                    {course.category}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      course.completed
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {course.completed
                      ? "COMPLETED (VERIFIED)"
                      : `${course.progressPercentage}% PROGRESS`}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-sm text-white">
                    {course.title}
                  </h3>
                  <div className="mt-1 flex items-center space-x-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {course.durationMinutes} min
                    </span>
                    <span>Format: {course.format}</span>
                  </div>
                </div>

                {course.triggeredByAnomaly && (
                  <div className="mt-3 rounded bg-amber-950/40 border border-amber-500/30 p-2 text-[11px] font-mono text-amber-200">
                    ⚠ Triggered by: {course.triggeredByAnomaly}
                  </div>
                )}

                {course.beforeScore && course.afterScore && (
                  <div className="mt-3 flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/60 text-slate-300">
                    <span>Baseline: {course.beforeScore}/100</span>
                    <span className="text-emerald-400 font-bold">
                      Post-Drill: {course.afterScore}/100 (+
                      {course.afterScore - course.beforeScore})
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right 7 Cols: Interactive Course Drill & Quiz Viewer */}
        {selectedCourse && (
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-mono font-bold text-[#ffcd11] border border-yellow-500/30 uppercase">
                      {selectedCourse.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Duration: {selectedCourse.durationMinutes} mins
                    </span>
                  </div>
                  <h2 className="mt-1 text-xl font-bold text-white">
                    {selectedCourse.title}
                  </h2>
                </div>

                <div className="text-right font-mono">
                  {selectedCourse.completed ? (
                    <span className="rounded-lg bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-600">
                      Certified Complete
                    </span>
                  ) : (
                    <span className="rounded-lg bg-yellow-950 px-3 py-1 text-xs font-bold text-[#ffcd11] border border-yellow-600">
                      Active Drill
                    </span>
                  )}
                </div>
              </div>

              {/* Recommendation Reason */}
              <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 text-xs font-mono space-y-1">
                <div className="text-[#ffcd11] font-bold uppercase text-[10px]">
                  AI Causal Trigger Rationale:
                </div>
                <p className="text-slate-300">
                  {selectedCourse.recommendedReason}
                </p>
              </div>

              {/* Key Takeaways */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Key Operating Principles & Kinematic Rules:
                </div>
                <div className="space-y-2">
                  {selectedCourse.keyTakeaways.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2.5 rounded-lg bg-slate-950/60 p-3 border border-slate-800 text-xs text-slate-300 leading-relaxed"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ffcd11] mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Quiz Simulation */}
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <div className="text-xs font-mono font-bold uppercase text-[#ffcd11] flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4" />
                  <span>Knowledge Verification Check</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 font-mono text-xs">
                  <div className="font-bold text-white text-sm">
                    {selectedCourse.quiz[0].question}
                  </div>

                  <div className="space-y-2 pt-1">
                    {selectedCourse.quiz[0].options.map((opt, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect =
                        idx === selectedCourse.quiz[0].correctIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (!quizSubmitted) setSelectedAnswer(idx);
                          }}
                          className={`w-full text-left rounded-lg p-3 text-xs transition-all border ${
                            isSelected
                              ? "bg-yellow-500/20 border-[#ffcd11] text-white font-bold"
                              : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80"
                          } ${
                            quizSubmitted && isCorrect
                              ? "bg-emerald-950 border-emerald-500 text-emerald-300 font-bold"
                              : ""
                          } ${
                            quizSubmitted && isSelected && !isCorrect
                              ? "bg-rose-950 border-rose-500 text-rose-300 font-bold"
                              : ""
                          }`}
                        >
                          <span className="mr-2 font-bold">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={handleCompleteQuiz}
                      disabled={selectedAnswer === null}
                      className="mt-3 w-full rounded-lg bg-[#ffcd11] hover:bg-yellow-400 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-40 transition-colors"
                    >
                      Submit Answer & Update Operator Digital Twin
                    </button>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <div
                        className={`rounded-lg p-3 text-xs font-bold ${
                          quizSuccess
                            ? "bg-emerald-950/80 border border-emerald-500 text-emerald-300"
                            : "bg-rose-950/80 border border-rose-500 text-rose-300"
                        }`}
                      >
                        {quizSuccess
                          ? "✅ Correct! Operator skill profile updated (+6 skill points, +2 safety index)."
                          : "❌ Incorrect answer. Review key takeaways above and re-attempt."}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Explanation: {selectedCourse.quiz[0].explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
