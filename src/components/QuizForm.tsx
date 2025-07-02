'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/navigation';

type QuestionType = {
  id?: string; // Optional for new questions
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation?: string;
};

type QuizType = {
  id?: string;
  title: string;
  lesson_id?: string | null;
};

const QuizForm = ({ quizId }: { quizId?: string }) => {
  const [quizTitle, setQuizTitle] = useState('');
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch lessons for dropdown
        const { data: lessonsData, error: lessonsError } = await supabase.from('lessons').select('id, title');
        if (lessonsError) throw lessonsError;
        setLessons(lessonsData || []);

        if (quizId) {
          // Fetch quiz details for editing
          const { data: quizData, error: quizError } = await supabase
            .from('quizzes')
            .select('*, questions(*)') // Fetch quiz and its questions
            .eq('id', quizId)
            .single();

          if (quizError) throw quizError;
          if (quizData) {
            setQuizTitle(quizData.title);
            setLessonId(quizData.lesson_id || null);
            setQuestions(quizData.questions || []);
          }
        }
      } catch (error: any) {
        setError(error.message || 'Failed to fetch initial data.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [quizId]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_answer_index: 0,
        explanation: '',
      },
    ]);
  };

  const handleQuestionChange = (index: number, field: keyof QuestionType, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let currentQuizId = quizId;

      if (quizId) {
        // Update existing quiz
        const { error: quizUpdateError } = await supabase
          .from('quizzes')
          .update({ title: quizTitle, lesson_id: lessonId })
          .eq('id', quizId);
        if (quizUpdateError) throw quizUpdateError;
      } else {
        // Create new quiz
        const { data, error: quizInsertError } = await supabase
          .from('quizzes')
          .insert([{ title: quizTitle, lesson_id: lessonId }])
          .select();
        if (quizInsertError) throw quizInsertError;
        if (data && data.length > 0) {
          currentQuizId = data[0].id;
        } else {
          throw new Error('Failed to create quiz.');
        }
      }

      // Handle questions (insert/update/delete)
      const existingQuestionIds = questions.filter(q => q.id).map(q => q.id);

      // Delete questions that are no longer in the list
      if (quizId) {
        const { data: oldQuestions } = await supabase.from('questions').select('id').eq('quiz_id', quizId);
        const oldQuestionIds = oldQuestions?.map(q => q.id) || [];
        const questionsToDelete = oldQuestionIds.filter(id => !existingQuestionIds.includes(id));
        if (questionsToDelete.length > 0) {
          const { error: deleteError } = await supabase.from('questions').delete().in('id', questionsToDelete);
          if (deleteError) throw deleteError;
        }
      }

      // Upsert (insert or update) remaining questions
      const questionsToUpsert = questions.map(q => ({
        ...q,
        quiz_id: currentQuizId,
      }));

      const { error: questionsUpsertError } = await supabase.from('questions').upsert(questionsToUpsert);
      if (questionsUpsertError) throw questionsUpsertError;

      router.push('/admin/content-management/quizzes');
    } catch (error: any) {
      setError(error.message || 'Failed to save quiz.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading form...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header"><h2>{quizId ? 'Edit Quiz' : 'Create New Quiz'}</h2></div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="quizTitle" className="form-label">Quiz Title</label>
              <input
                type="text"
                className="form-control"
                id="quizTitle"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="lessonId" className="form-label">Associate with Lesson (Optional)</label>
              <select
                className="form-control"
                id="lessonId"
                value={lessonId || ''}
                onChange={(e) => setLessonId(e.target.value || null)}
              >
                <option value="">None</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>

            <h4 className="mt-4">Questions</h4>
            {questions.map((question, qIndex) => (
              <div key={question.id || qIndex} className="card mb-3 p-3 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>Question {qIndex + 1}</h6>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteQuestion(qIndex)}>Delete Question</button>
                </div>
                <div className="mb-3">
                  <label htmlFor={`questionText-${qIndex}`} className="form-label">Question Text</label>
                  <textarea
                    className="form-control"
                    id={`questionText-${qIndex}`}
                    rows={2}
                    value={question.question_text}
                    onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Options</label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="input-group mb-2">
                      <div className="input-group-text">
                        <input
                          type="radio"
                          className="form-check-input mt-0"
                          name={`correctAnswer-${qIndex}`}
                          checked={question.correct_answer_index === oIndex}
                          onChange={() => handleQuestionChange(qIndex, 'correct_answer_index', oIndex)}
                        />
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>
                <div className="mb-3">
                  <label htmlFor={`explanation-${qIndex}`} className="form-label">Explanation (Optional)</label>
                  <textarea
                    className="form-control"
                    id={`explanation-${qIndex}`}
                    rows={1}
                    value={question.explanation || ''}
                    onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                  ></textarea>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-info mb-4" onClick={handleAddQuestion}>Add Question</button>

            <div className="d-flex justify-content-between">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Quiz'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => router.push('/admin/content-management/quizzes')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
