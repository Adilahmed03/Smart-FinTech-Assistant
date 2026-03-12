import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Trophy, 
  ArrowLeft, 
  Loader2, 
  HelpCircle,
  Hash
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
      console.error("Failed to fetch lessons", err);
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
      console.error("Failed to submit quiz", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#131722]">
        <Loader2 className="animate-spin text-[#2962ff]" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#131722] p-6">
      {/* List Mode */}
      {mode === 'list' && (
        <div className="max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#d1d4dc] mb-2 flex items-center gap-3">
              <BookOpen className="text-[#2962ff]" />
              Institutional Learning Library
            </h2>
            <p className="text-[#787b86] text-sm">Master the fundamentals of financial markets with structured lessons and assessments.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <div 
                key={lesson.id}
                onClick={() => handleSelectLesson(lesson)}
                className="p-5 rounded-lg border border-[#2a2e39] bg-[#1e222d] hover:border-[#2962ff] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded bg-[#2962ff]/10 flex items-center justify-center">
                    <Hash size={18} className="text-[#2962ff]" />
                  </div>
                  <ChevronRight size={18} className="text-[#787b86] group-hover:text-[#d1d4dc] transition-colors" />
                </div>
                <h3 className="text-[15px] font-bold text-[#d1d4dc] mb-2">{lesson.title}</h3>
                <p className="text-[12px] text-[#787b86] line-clamp-2 leading-relaxed">
                  {lesson.explanation}
                </p>
                <div className="mt-4 flex items-center gap-2">
                   <span className="text-[10px] uppercase font-bold text-[#089981] bg-[#089981]/10 px-2 py-0.5 rounded">
                     {lesson.quiz.length} Questions
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Mode */}
      {mode === 'content' && selectedLesson && (
        <div className="max-w-3xl mx-auto w-full flex flex-col h-full overflow-hidden">
          <button 
            onClick={() => setMode('list')}
            className="flex items-center gap-2 text-[12px] text-[#787b86] hover:text-[#d1d4dc] mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Library
          </button>
          
          <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar">
            <div>
              <h1 className="text-3xl font-bold text-[#d1d4dc] mb-4">{selectedLesson.title}</h1>
              <div className="h-1 w-20 bg-[#2962ff] rounded mb-6" />
              <p className="text-[15px] text-[#b2b5be] leading-relaxed whitespace-pre-wrap">
                {selectedLesson.explanation}
              </p>
            </div>

            <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-6">
              <h3 className="text-[14px] font-bold text-[#d1d4dc] mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#089981]" />
                Key Takeaways
              </h3>
              <ul className="space-y-3">
                {selectedLesson.takeaways.map((point, i) => (
                  <li key={i} className="flex gap-3 text-[13px] text-[#b2b5be] leading-relaxed">
                    <span className="text-[#2962ff] font-bold">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#2a2e39] flex justify-end">
            <button 
              onClick={startQuiz}
              className="px-6 py-2.5 rounded bg-[#2962ff] text-white text-[13px] font-bold hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              Take Assessment
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Quiz Mode */}
      {mode === 'quiz' && selectedLesson && (
        <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
           <div className="mb-8">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase font-bold text-[#787b86] tracking-widest">
                  Assessment: {selectedLesson.title}
                </span>
                <span className="text-[11px] font-bold text-[#2962ff]">
                   Progress: {quizAnswers.filter(a => a !== null).length}/{selectedLesson.quiz.length}
                </span>
             </div>
             <div className="h-1.5 w-full bg-[#2a2e39] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#2962ff] transition-all duration-300" 
                  style={{ width: `${(quizAnswers.filter(a => a !== null).length / selectedLesson.quiz.length) * 100}%` }}
                />
             </div>
           </div>

           <div className="flex-1 overflow-y-auto space-y-10 pr-4">
              {selectedLesson.quiz.map((q, qIdx) => (
                <div key={qIdx} className="space-y-4">
                  <h4 className="text-[16px] font-bold text-[#d1d4dc]">
                    {qIdx + 1}. {q.question}
                  </h4>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => {
                          const newAns = [...quizAnswers];
                          newAns[qIdx] = oIdx;
                          setQuizAnswers(newAns);
                        }}
                        className={`w-full text-left px-5 py-4 rounded border text-[13px] transition-all ${
                          quizAnswers[qIdx] === oIdx
                          ? 'border-[#2962ff] bg-[#2962ff]/10 text-[#d1d4dc]'
                          : 'border-[#2a2e39] bg-[#1e222d] text-[#787b86] hover:border-[#434651]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
           </div>

           <div className="pt-6 border-t border-[#2a2e39] flex justify-between items-center">
              <button 
                onClick={() => setMode('content')}
                className="text-[12px] text-[#787b86] hover:text-[#d1d4dc] transition-colors"
                disabled={submitting}
              >
                Review Content
              </button>
              <button 
                onClick={submitQuiz}
                disabled={quizAnswers.includes(null) || submitting}
                className="px-8 py-3 rounded bg-[#089981] text-white text-[13px] font-bold hover:bg-[#067d6a] transition-all disabled:opacity-30 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                Submit Answers
              </button>
           </div>
        </div>
      )}

      {/* Result Mode */}
      {mode === 'result' && quizResult && (
        <div className="max-w-md mx-auto w-full flex flex-col items-center justify-center h-full text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
            quizResult.percentage >= 70 ? 'bg-[#089981]/20' : 'bg-[#f23645]/20'
          }`}>
             <Trophy size={48} className={quizResult.percentage >= 70 ? 'text-[#089981]' : 'text-[#f23645]'} />
          </div>
          
          <h2 className="text-3xl font-bold text-[#d1d4dc] mb-2">
            {quizResult.percentage >= 70 ? 'Mastery Achieved!' : 'Keep Learning!'}
          </h2>
          <p className="text-[#787b86] text-[14px] mb-8">
            You scored {quizResult.score} out of {quizResult.total} correctly.
          </p>

          <div className="w-full bg-[#1e222d] border border-[#2a2e39] rounded-xl p-6 mb-8">
             <div className="text-5xl font-black text-[#2962ff] mb-2">{quizResult.percentage}%</div>
             <div className="text-[11px] uppercase tracking-widest font-bold text-[#787b86]">Accuracy Score</div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setMode('list')}
              className="px-6 py-2.5 rounded border border-[#363a45] text-[#d1d4dc] text-[13px] font-bold hover:bg-[#1e222d] transition-colors"
            >
              Browse Library
            </button>
            <button 
              onClick={() => { setMode('content'); setQuizResult(null); }}
              className="px-6 py-2.5 rounded bg-[#2962ff] text-white text-[13px] font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-600/20"
            >
              Review Lesson
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
