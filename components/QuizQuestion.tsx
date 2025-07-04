import React from 'react';

interface QuizQuestionProps {
  question: {
    id: string;
    question: string;
    choices: string[];
    correct_index: number;
  };
  selectedAnswer: string | null;
  onSelectAnswer: (questionId: string, answer: string) => void;
  showAnswer: boolean;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  selectedAnswer,
  onSelectAnswer,
  showAnswer,
}) => {
  const correctAnswerText = question.choices[question.correct_index];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
      <div className="space-y-3">
        {question.choices.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelectAnswer(question.id, option)}
            className={`w-full text-left p-3 border rounded-lg 
              ${selectedAnswer === option ? 'bg-blue-100 border-blue-500' : 'border-gray-300 hover:bg-gray-50'}
              ${showAnswer && index === question.correct_index ? 'bg-green-100 border-green-500' : ''}
              ${showAnswer && selectedAnswer === option && index !== question.correct_index ? 'bg-red-100 border-red-500' : ''}
            `}
            disabled={showAnswer}
          >
            {option}
          </button>
        ))}
      </div>
      {showAnswer && selectedAnswer !== null && (
        <p className="mt-4 text-sm">
          {selectedAnswer === correctAnswerText ? (
            <span className="text-green-600">Correct!</span>
          ) : (
            <span className="text-red-600">Incorrect. The correct answer was: {correctAnswerText}</span>
          )}
        </p>
      )}
    </div>
  );
};

export default QuizQuestion;
