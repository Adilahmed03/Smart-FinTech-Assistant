import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Trophy, 
  ArrowLeft, 
  Loader2, 
  HelpCircle,
  Hash,
  Star,
  Activity,
  Award
} from 'lucide-react';
import { learningAPI } from '../api';

export default function LearningModule() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [mode, setMode] = useState('list'); // 'list', 'content', 'quiz', 'result'
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await learningAPI.getLessons();
      setLessons(res.data.lessons);
    } catch (err) {
      console.error("Lesson fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
    setMode('content');
    setQuizAnswers([]);
    setQuizResult(null);
  };

  const startQuiz = () => {
    setQuizAnswers(new Array(selectedLesson.quiz.length).fill(null));
    setMode('quiz');
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await learningAPI.submitQuiz(selectedLesson.id, quizAnswers);
      setQuizResult(res.data);
      setMode('result');
    } catch (err) {
      console.error("Quiz submission error", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg">
        <Loader2 className="animate-spin text-primary opacity-50" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg p-8 animate-in fade-in duration-700">
      {/* List Mode */}
      {mode === 'list' && (
        <div className="max-w-5xl mx-auto w-full">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-text-primary mb-3 flex items-center justify-center gap-4 uppercase tracking-tighter">
              <BookOpen className="text-primary" size={32} />
              Educational Infrastructure
            </h2>
            <p className="text-text-dim text-sm font-bold uppercase tracking-[0.2em]">Institutional Grade Financial Literacy Program</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson, idx) => (
              <div 
                key={lesson.id}
                onClick={() => handleSelectLesson(lesson)}
                className="terminal-card p-6 hover:border-primary/40 transition-all cursor-pointer group flex flex-col h-full bg-card/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded bg-bg border border-card-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                    <span className="text-[14px] font-black text-primary">0{idx + 1}</span>
                  </div>
                  <ChevronRight size={18} className="text-text-dim group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-black text-text-primary mb-3 tracking-tight group-hover:text-primary transition-colors uppercase">
                   {lesson.title}
                </h3>
                <p className="text-[12px] text-text-dim line-clamp-3 leading-relaxed font-medium mb-6">
                  {lesson.explanation}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-card-border/50 pt-4">
                   <div className="flex items-center gap-1.5">
                      <HelpCircle size={12} className="text-primary" />
                      <span className="text-[10px] font-black uppercase text-text-dim tracking-widest">{lesson.quiz.length} Questions</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <Star size={12} className="text-secondary" />
                      <span className="text-[10px] font-black uppercase text-text-dim tracking-widest">Entry Level</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Mode */}
      {mode === 'content' && selectedLesson && (
        <div className="max-w-4xl mx-auto w-full flex flex-col h-full overflow-hidden animate-in slide-in-from-right-4 duration-500">
          <button 
            onClick={() => setMode('list')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-dim hover:text-text-primary mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> Neural Library Exit
          </button>
          
          <div className="flex-1 overflow-y-auto space-y-10 pr-6 custom-scrollbar">
            <div className="relative">
              <div className="absolute -left-10 top-0 text-[60px] font-black text-primary/5 select-none leading-none">01</div>
              <h1 className="text-4xl font-black text-text-primary mb-6 tracking-tighter uppercase">{selectedLesson.title}</h1>
              <div className="h-1.5 w-24 bg-primary rounded-full mb-8 shadow-lg shadow-primary/20" />
              <p className="text-[16px] text-text-secondary leading-relaxed whitespace-pre-wrap font-medium">
                {selectedLesson.explanation}
              </p>
            </div>

            <div className="terminal-card p-8 bg-card/40 border-primary/10">
              <h3 className="text-[14px] font-black text-text-primary mb-6 flex items-center gap-3 uppercase tracking-widest">
                <CheckCircle2 size={18} className="text-success" />
                Syndicated Takeaways
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedLesson.takeaways.map((point, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-lg bg-bg/50 border border-card-border/50">
                    <span className="text-primary font-black text-sm">#</span>
                    <p className="text-[13px] text-text-secondary leading-normal font-bold uppercase tracking-tight italic">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 mt-4 border-t border-card-border flex justify-between items-center bg-bg">
             <div className="flex items-center gap-3">
                <Activity size={16} className="text-secondary animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest text-text-dim">Ready for Verification?</span>
             </div>
            <button 
              onClick={startQuiz}
              className="px-8 py-3.5 rounded bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center gap-3 shadow-xl shadow-primary/20 active:scale-95"
            >
              Initialize Assessment
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Quiz Mode */}
      {mode === 'quiz' && selectedLesson && (
        <div className="max-w-3xl mx-auto w-full flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
           <div className="mb-10">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase font-black text-text-dim tracking-[0.3em]">
                  Module: {selectedLesson.title}
                </span>
                <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">
                   Syncing: {quizAnswers.filter(a => a !== null).length} / {selectedLesson.quiz.length}
                </span>
             </div>
             <div className="h-2 w-full bg-card rounded-full overflow-hidden border border-card-border">
                <div 
                  className="h-full bg-primary transition-all duration-700 shadow-lg shadow-primary/20" 
                  style={{ width: `${(quizAnswers.filter(a => a !== null).length / selectedLesson.quiz.length) * 100}%` }}
                />
             </div>
           </div>

           <div className="flex-1 overflow-y-auto space-y-12 pr-6 custom-scrollbar pb-10">
              {selectedLesson.quiz.map((q, qIdx) => (
                <div key={qIdx} className="space-y-6">
                  <div className="flex gap-4">
                     <span className="text-2xl font-black text-primary opacity-20">0{qIdx + 1}</span>
                     <h4 className="text-[18px] font-black text-text-primary tracking-tight leading-tight uppercase">
                       {q.question}
                     </h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3 ml-12">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => {
                          const newAns = [...quizAnswers];
                          newAns[qIdx] = oIdx;
                          setQuizAnswers(newAns);
                        }}
                        className={`w-full text-left px-6 py-4 rounded-lg border text-sm font-bold uppercase tracking-wider transition-all ${
                          quizAnswers[qIdx] === oIdx
                          ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5'
                          : 'border-card-border bg-card/30 text-text-dim hover:bg-card hover:text-text-secondary hover:translate-x-1'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
           </div>

           <div className="pt-8 mt-4 border-t border-card-border flex justify-between items-center bg-bg px-2">
              <button 
                onClick={() => setMode('content')}
                className="text-[11px] font-black uppercase tracking-widest text-text-dim hover:text-text-primary transition-colors"
                disabled={submitting}
              >
                Abort & Review
              </button>
              <button 
                onClick={submitQuiz}
                disabled={quizAnswers.includes(null) || submitting}
                className="px-10 py-4 rounded bg-success text-white text-[12px] font-black uppercase tracking-[0.2em] hover:bg-green-600 transition-all disabled:opacity-30 flex items-center gap-3 shadow-xl shadow-success/20 active:scale-95"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Award size={18} />}
                Transmit Answers
              </button>
           </div>
        </div>
      )}

      {/* Result Mode */}
      {mode === 'result' && quizResult && (
        <div className="max-w-2xl mx-auto w-full flex flex-col items-center justify-center h-full text-center animate-in zoom-in-95 duration-700">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 relative ${
            quizResult.percentage >= 70 ? 'bg-success/10 border-2 border-success/30' : 'bg-danger/10 border-2 border-danger/30'
          }`}>
             <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${quizResult.percentage >= 70 ? 'bg-success' : 'bg-danger'}`} />
             <Trophy size={56} className={quizResult.percentage >= 70 ? 'text-success' : 'text-danger'} />
          </div>
          
          <h2 className="text-4xl font-black text-text-primary mb-2 uppercase tracking-tighter">
            {quizResult.percentage >= 70 ? 'Proficiency Verified' : 'Neural Gaps Detected'}
          </h2>
          <p className="text-text-dim text-[14px] font-bold uppercase tracking-[0.2em] mb-10">
            Performance Metrics: {quizResult.score} Accepted / {quizResult.total} Transmission
          </p>

          <div className="w-full max-w-sm terminal-card p-10 bg-card/30 mb-12 border-primary/20 relative">
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 rounded text-[10px] font-black text-white uppercase tracking-widest">Final Rank</div>
             <div className="text-7xl font-black text-primary mb-3 tracking-tighter drop-shadow-2xl">{quizResult.percentage}%</div>
             <div className="text-[12px] font-black text-text-dim uppercase tracking-[0.3em]">Mastery Coefficient</div>
          </div>

          <div className="flex gap-6 w-full max-w-md">
            <button 
              onClick={() => setMode('list')}
              className="flex-1 terminal-btn-outline py-4 flex items-center justify-center gap-2"
            >
              Module Library
            </button>
            <button 
              onClick={() => { setMode('content'); setQuizResult(null); }}
              className="flex-1 terminal-btn-primary py-4 flex items-center justify-center gap-2 bg-primary text-white"
            >
              Re-Analyze Lesson
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
