
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Zod schemas for validation
const questionPostSchema = z.object({
  module_id: z.string().min(1, "Module ID is required."),
  title: z.string().min(1, "Title is required."),
  body: z.string().optional(),
});

const questionPutSchema = z.object({
  id: z.string().uuid("Invalid question ID format."),
  module_id: z.string().min(1, "Module ID cannot be empty.").optional(),
  title: z.string().min(1, "Title cannot be empty.").optional(),
  body: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected'], "Invalid status value.").optional(),
}).refine(data => Object.keys(data).length > 1, {
  message: "At least one field (module_id, title, body, status) must be provided for update.",
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
        const { data: questions, error: getError } = await supabase
          .from('questions')
          .select('*');

        if (getError) {
          console.error('Error fetching questions:', getError.message);
          return res.status(500).json({ error: 'Failed to fetch questions.', details: getError.message });
        }
        return res.status(200).json(questions);
      } catch (e) {
        console.error('Unexpected error in GET /questions:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'POST':
      try {
        const validatedData = questionPostSchema.parse(req.body);
        const { module_id, title, body } = validatedData;

        const { data: newQuestion, error: postError } = await supabase
          .from('questions')
          .insert([{ module_id, title, body, status: 'pending', user_id: (await supabase.auth.getUser(req.headers.authorization?.split(' ')[1] || '')).data.user?.id }])
          .select();

        if (postError) {
          console.error('Error creating question:', postError.message);
          return res.status(500).json({ error: 'Failed to create question.', details: postError.message });
        }
        return res.status(201).json(newQuestion[0]);
      } catch (e) {
        if (e instanceof z.ZodError) {
          return res.status(400).json({ error: 'Validation failed.', details: e.errors });
        }
        console.error('Unexpected error in POST /questions:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'PUT':
      try {
        const validatedData = questionPutSchema.parse(req.body);
        const { id, ...updates } = validatedData;

        let updateQuery;
        if (userRole === 'admin') {
          updateQuery = supabaseAdmin.from('questions').update(updates).eq('id', id);
        } else {
          const { status, ...userUpdates } = updates;
          updateQuery = supabase.from('questions').update(userUpdates).eq('id', id);
        }

        const { data: updatedQuestion, error: putError } = await updateQuery.select();

        if (putError) {
          console.error('Error updating question:', putError.message);
          return res.status(500).json({ error: 'Failed to update question.', details: putError.message });
        }
        if (!updatedQuestion || updatedQuestion.length === 0) {
          return res.status(404).json({ error: 'Question not found or unauthorized to update.' });
        }
        return res.status(200).json(updatedQuestion[0]);
      } catch (e) {
        if (e instanceof z.ZodError) {
          return res.status(400).json({ error: 'Validation failed.', details: e.errors });
        }
        console.error('Unexpected error in PUT /questions:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'DELETE':
      try {
        const { id: deleteId } = req.query;
        if (typeof deleteId !== 'string' || !z.string().uuid().safeParse(deleteId).success) {
          return res.status(400).json({ error: 'Valid question ID is required for deletion.' });
        }

        const { error: deleteError } = await supabase
          .from('questions')
          .delete()
          .eq('id', deleteId);

        if (deleteError) {
          console.error('Error deleting question:', deleteError.message);
          return res.status(500).json({ error: 'Failed to delete question.', details: deleteError.message });
        }
        return res.status(204).end();
      } catch (e) {
        console.error('Unexpected error in DELETE /questions:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
