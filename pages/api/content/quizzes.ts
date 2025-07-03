
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Zod schemas for validation
const quizPostSchema = z.object({
  module_id: z.string().min(1, "Module ID is required."),
  question: z.string().min(1, "Question is required."),
  choices: z.array(z.string().min(1, "Choice cannot be empty.")).min(2, "At least two choices are required."),
  correct_index: z.number().int().min(0, "Correct index must be non-negative."),
});

const quizPutSchema = z.object({
  id: z.string().uuid("Invalid quiz ID format."),
  module_id: z.string().min(1, "Module ID cannot be empty.").optional(),
  question: z.string().min(1, "Question cannot be empty.").optional(),
  choices: z.array(z.string().min(1, "Choice cannot be empty.")).min(2, "At least two choices are required.").optional(),
  correct_index: z.number().int().min(0, "Correct index must be non-negative.").optional(),
  status: z.enum(['pending', 'approved', 'rejected'], "Invalid status value.").optional(),
}).refine(data => Object.keys(data).length > 1, {
  message: "At least one field (module_id, question, choices, correct_index, status) must be provided for update.",
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for regular user operations (respects RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Client for admin/service operations (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Helper to get user's role from JWT
  const getUserRole = async (req: NextApiRequest) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return null;
      const token = authHeader.split(' ')[1];
      if (!token) return null;

      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error) {
        console.error("Error fetching user for role check:", error.message);
        return null;
      }
      return user?.user_metadata?.role || null;
    } catch (e) {
      console.error("Exception in getUserRole:", e);
      return null;
    }
  };

  const userRole = await getUserRole(req);

  switch (req.method) {
    case 'GET':
      try {
        const { data: quizzes, error: getError } = await supabase
          .from('quizzes')
          .select('*');

        if (getError) {
          console.error('Error fetching quizzes:', getError.message);
          return res.status(500).json({ error: 'Failed to fetch quizzes.', details: getError.message });
        }
        return res.status(200).json(quizzes);
      } catch (e) {
        console.error('Unexpected error in GET /quizzes:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'POST':
      try {
        const validatedData = quizPostSchema.parse(req.body);
        const { module_id, question, choices, correct_index } = validatedData;

        const { data: newQuiz, error: postError } = await supabase
          .from('quizzes')
          .insert([{ module_id, question, choices, correct_index, status: 'pending' }])
          .select();

        if (postError) {
          console.error('Error creating quiz:', postError.message);
          return res.status(500).json({ error: 'Failed to create quiz.', details: postError.message });
        }
        return res.status(201).json(newQuiz[0]);
      } catch (e) {
        if (e instanceof z.ZodError) {
          return res.status(400).json({ error: 'Validation failed.', details: e.errors });
        }
        console.error('Unexpected error in POST /quizzes:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'PUT':
      try {
        const validatedData = quizPutSchema.parse(req.body);
        const { id, ...updates } = validatedData;

        let updateQuery;
        if (userRole === 'admin') {
          updateQuery = supabaseAdmin.from('quizzes').update(updates).eq('id', id);
        } else {
          const { status, ...userUpdates } = updates;
          updateQuery = supabase.from('quizzes').update(userUpdates).eq('id', id);
        }

        const { data: updatedQuiz, error: putError } = await updateQuery.select();

        if (putError) {
          console.error('Error updating quiz:', putError.message);
          return res.status(500).json({ error: 'Failed to update quiz.', details: putError.message });
        }
        if (!updatedQuiz || updatedQuiz.length === 0) {
          return res.status(404).json({ error: 'Quiz not found or unauthorized to update.' });
        }
        return res.status(200).json(updatedQuiz[0]);
      } catch (e) {
        if (e instanceof z.ZodError) {
          return res.status(400).json({ error: 'Validation failed.', details: e.errors });
        }
        console.error('Unexpected error in PUT /quizzes:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'DELETE':
      try {
        const { id: deleteId } = req.query;
        if (typeof deleteId !== 'string' || !z.string().uuid().safeParse(deleteId).success) {
          return res.status(400).json({ error: 'Valid quiz ID is required for deletion.' });
        }

        const { error: deleteError } = await supabase
          .from('quizzes')
          .delete()
          .eq('id', deleteId);

        if (deleteError) {
          console.error('Error deleting quiz:', deleteError.message);
          return res.status(500).json({ error: 'Failed to delete quiz.', details: deleteError.message });
        }
        return res.status(204).end();
      } catch (e) {
        console.error('Unexpected error in DELETE /quizzes:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
