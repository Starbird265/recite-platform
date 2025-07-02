'use client';

import Quiz from '../../../components/Quiz';

export default function QuizPage({ params }: { params: { id: string } }) {
  const { id: quizId } = params;
  return <Quiz quizId={quizId} />;
}
