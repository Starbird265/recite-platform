import { supabase } from '../lib/supabaseClient';

// Supabase-Backed CRUD Operations

export async function getCentres() {
  const { data, error } = await supabase
    .from('centers') // Assuming 'centers' is the table name
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function bookCentre(centreId: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw authError || new Error('User not authenticated');

  const { error } = await supabase
    .from('referrals')
    .insert([{ user_id: user.id, centre_id: centreId }]);
  if (error) throw error;
}

export async function getTodayLesson(userId: string) {
  // This is a placeholder. Actual logic will depend on your lesson scheduling.
  // For now, it fetches the first lesson and checks user progress.
  const { data: lessonData, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .order('order', { ascending: true })
    .limit(1)
    .single();

  if (lessonError) throw lessonError;

  const { data: progressData, error: progressError } = await supabase
    .from('user_progress')
    .select('completed')
    .eq('user_id', userId)
    .eq('lesson_id', lessonData.id)
    .single();

  if (progressError && progressError.code !== 'PGRST116') throw progressError; // PGRST116 means no rows found

  return { ...lessonData, completed: !!progressData?.completed };
}

export async function getVideo(moduleId: string) {
  const { data, error } = await supabase
    .from('videos')
    .select('youtube_id, title')
    .eq('module_id', moduleId)
    .single();
  if (error) throw error;
  return data;
}

export async function getQuizQuestions(quizId: string) {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, question, choices, correct_index')
    .eq('quiz_id', quizId);
  if (error) throw error;
  return data.map(q => ({
    id: q.id,
    question_text: q.question,
    options: q.choices,
    correct_answer: q.choices[q.correct_index]
  }));
}

export async function submitQuizResult(moduleId: string, score: number) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw authError || new Error('User not authenticated');

  const { error } = await supabase
    .from('results')
    .insert([{ user_id: user.id, module_id: moduleId, score }]);
  if (error) throw error;
}

export async function getQuestions(moduleId: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*, answers(*)')
    .eq('module_id', moduleId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function postQuestion(moduleId: string, text: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw authError || new Error('User not authenticated');

  const { error } = await supabase
    .from('questions')
    .insert([{ user_id: user.id, module_id: moduleId, text }]);
  if (error) throw error;
}

// Edge Functions

export async function generateLesson(topic: string) {
  const res = await supabase.functions.invoke('generate-lesson', { body: { topic } });
  if (res.error) throw res.error;
  return (res.data as any).script;
}

export async function createOrder(amount: number) {
  const res = await supabase.functions.invoke('razorpay-order', { body: { amount } });
  if (res.error) throw res.error;
  return res.data.order; // contains order_id, key_id, etc.
}

export async function createPracticeTest() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw authError || new Error('User not authenticated');

  const { data: questions, error } = await supabase
    .from('quizzes')
    .select('*')
    .limit(50); // random set or paginate

  if (error) throw error;

  const { data: test, error: testError } = await supabase
    .from('practice_tests')
    .insert([{ user_id: user.id }])
    .select()
    .single();

  if (testError) throw testError;

  const qMappings = questions.map(q => ({
    test_id: test.id,
    quiz_id: q.id,
  }));

  const { error: insertError } = await supabase.from('practice_test_questions').insert(qMappings);
  if (insertError) throw insertError;

  return { testId: test.id, questions };
}

export async function submitPracticeTest(testId: string, answers: any[]) {
  for (const { quiz_id, answer, is_correct } of answers) {
    const { error } = await supabase.from('practice_test_questions')
      .update({ answer, is_correct })
      .match({ test_id: testId, quiz_id });
    if (error) console.error('Error updating practice test question:', error);
  }
  const score = answers.filter(a => a.is_correct).length;
  const { error } = await supabase.from('practice_tests')
    .update({ score, ended_at: new Date().toISOString() })
    .match({ id: testId });
  if (error) console.error('Error updating practice test score:', error);
}

export async function getMyQuizHistory() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw authError || new Error('User not authenticated');

  const { data, error } = await supabase
    .from('results')
    .select('score, created_at, quizzes(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getLeaderboard() {
  const { data, error } = await supabase.from('leaderboard').select('*');
  if (error) throw error;
  return data;
}

export async function getUserDetails() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function updateUserProfile(name: string, phone: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw authError || new Error('User not authenticated');

  const { error } = await supabase.from('users')
    .update({ name, phone })
    .eq('id', user.id);
  if (error) throw error;
}