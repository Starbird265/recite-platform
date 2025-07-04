import React, { useState } from 'react';

interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

interface Question {
  id: string;
  user_id: string;
  module_id: string;
  text: string;
  created_at: string;
  answers: Answer[];
}

interface DiscussionThreadProps {
  questions: Question[];
  onPostQuestion: (text: string) => void;
  onPostAnswer: (questionId: string, text: string) => void;
}

const DiscussionThread: React.FC<DiscussionThreadProps> = ({
  questions,
  onPostQuestion,
  onPostAnswer,
}) => {
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newAnswerText, setNewAnswerText] = useState<Record<string, string>>({});

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestionText.trim()) {
      onPostQuestion(newQuestionText);
      setNewQuestionText('');
    }
  };

  const handleAnswerSubmit = (questionId: string) => (e: React.FormEvent) => {
    e.preventDefault();
    if (newAnswerText[questionId]?.trim()) {
      onPostAnswer(questionId, newAnswerText[questionId]);
      setNewAnswerText((prev) => ({ ...prev, [questionId]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Post New Question */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Ask a New Question</h2>
        <form onSubmit={handleQuestionSubmit}>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            rows={3}
            placeholder="Type your question here..."
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
          ></textarea>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Post Question
          </button>
        </form>
      </div>

      {/* Existing Questions */}
      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="bg-white rounded-lg shadow p-6">
            <p className="font-semibold text-gray-800 mb-2">{question.text}</p>
            <p className="text-sm text-gray-500 mb-4">
              Asked by User {question.user_id} on {new Date(question.created_at).toLocaleDateString()}
            </p>

            {/* Answers */}
            <div className="ml-4 border-l pl-4 space-y-3">
              {question.answers.map((answer) => (
                <div key={answer.id} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700">{answer.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Answered by User {answer.user_id} on {new Date(answer.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}

              {/* Post New Answer */}
              <form onSubmit={handleAnswerSubmit(question.id)} className="mt-3">
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-lg mb-2 text-sm"
                  rows={2}
                  placeholder="Type your answer here..."
                  value={newAnswerText[question.id] || ''}
                  onChange={(e) =>
                    setNewAnswerText((prev) => ({ ...prev, [question.id]: e.target.value }))
                  }
                ></textarea>
                <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm">
                  Post Answer
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscussionThread;
