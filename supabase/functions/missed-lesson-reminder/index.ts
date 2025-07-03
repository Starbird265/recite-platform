
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Supabase client using the service role key for elevated privileges
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// The logic to find users who have missed lessons
async function findAndNotifyMissedLessons() {
  // 1. Get all published lessons (videos)
  const { data: lessons, error: lessonsError } = await supabase
    .from('videos')
    .select('id, published_at')
    .order('published_at', { ascending: true });

  if (lessonsError) throw lessonsError;

  // 2. Get all active students
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) throw usersError;

  const notificationsToInsert = [];

  // 3. For each user, check their progress
  for (const user of users.users) {
    // Get all quiz results for the user
    const { data: results, error: resultsError } = await supabase
      .from('results')
      .select('module_id')
      .eq('user_id', user.id);

    if (resultsError) {
      console.error(`Failed to get results for user ${user.id}:`, resultsError);
      continue; // Skip to next user
    }

    const completedModules = new Set(results.map(r => r.module_id));
    let missedCount = 0;

    // Compare lessons to completed quizzes
    for (const lesson of lessons) {
      // A lesson is missed if it was published more than a day ago and not completed
      const isPublished = new Date(lesson.published_at) < new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (isPublished && !completedModules.has(lesson.id)) {
        missedCount++;
      }
    }

    // 4. If 3 or more lessons are missed, create a notification
    if (missedCount >= 3) {
      notificationsToInsert.push({
        user_id: user.id,
        type: 'missed_lesson_reminder',
        status: 'pending',
        content: { missed_count: missedCount },
      });
    }
  }

  // 5. Insert all notifications in a single batch
  if (notificationsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notificationsToInsert);

    if (insertError) {
      console.error('Failed to insert notifications:', insertError);
      return { error: 'Failed to insert notifications' };
    }
  }

  return { count: notificationsToInsert.length };
}

// Serve the function as an HTTP endpoint
serve(async (req) => {
  // This is to protect the function from being called by anyone
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_FUNCTION_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await findAndNotifyMissedLessons();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
