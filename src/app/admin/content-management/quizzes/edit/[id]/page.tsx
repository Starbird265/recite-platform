'use client';

import QuizForm from '../../../../../../components/QuizForm';

export default function EditQuizPage({ params }: { params: { id: string } }) {
  const { id: quizId } = params;
  return <QuizForm quizId={quizId} />;
}
