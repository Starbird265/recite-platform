import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Zod schemas for validation
const answerPostSchema = z.object({
  question_id: z.string().uuid("Invalid question ID format."),
  body: z.string().min(1, "Answer body is required."),
});

const answerPutSchema = z.object({
  id: z.string().uuid("Invalid answer ID format."),
  question_id: z.string().uuid("Invalid question ID format.").optional(),
  body: z.string().min(1, "Answer body cannot be empty.").optional(),
  status: z.enum(['pending', 'approved', 'rejected'], "Invalid status value.").optional(),
}).refine(data => Object.keys(data).length > 1, {
  message: "At least one field (question_id, body, status) must be provided for update.",
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
        const { data: answers, error: getError } = await supabase
          .from('answers')
          .select('*');

        if (getError) {
          console.error('Error fetching answers:', getError.message);
          return res.status(500).json({ error: 'Failed to fetch answers.', details: getError.message });
        }
        return res.status(200).json(answers);
      } catch (e) {
        console.error('Unexpected error in GET /answers:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'POST':
      try {
        const validatedData = answerPostSchema.parse(req.body);
        const { question_id, body } = validatedData;

        const { data: newAnswer, error: postError } = await supabase
          .from('answers')
          .insert([{ question_id, body, status: 'pending', user_id: (await supabase.auth.getUser(req.headers.authorization?.split(' ')[1] || '')).data.user?.id }])
          .select();

        if (postError) {
          console.error('Error creating answer:', postError.message);
          return res.status(500).json({ error: 'Failed to create answer.', details: postError.message });
        }
        return res.status(201).json(newAnswer[0]);
      } catch (e) {
        if (e instanceof z.ZodError) {
          return res.status(400).json({ error: 'Validation failed.', details: e.errors });
        }
        console.error('Unexpected error in POST /answers:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'PUT':
      try {
        const validatedData = answerPutSchema.parse(req.body);
        const { id, ...updates } = validatedData;

        let updateQuery;
        if (userRole === 'admin') {
          updateQuery = supabaseAdmin.from('answers').update(updates).eq('id', id);
        } else {
          const { status, ...userUpdates } = updates;
          updateQuery = supabase.from('answers').update(userUpdates).eq('id', id);
        }

        const { data: updatedAnswer, error: putError } = await updateQuery.select();

        if (putError) {
          console.error('Error updating answer:', putError.message);
          return res.status(500).json({ error: 'Failed to update answer.', details: putError.message });
        }
        if (!updatedAnswer || updatedAnswer.length === 0) {
          return res.status(404).json({ error: 'Answer not found or unauthorized to update.' });
        }
        return res.status(200).json(updatedAnswer[0]);
      } catch (e) {
        if (e instanceof z.ZodError) {
          return res.status(400).json({ error: 'Validation failed.', details: e.errors });
        }
        console.error('Unexpected error in PUT /answers:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'DELETE':
      try {
        const { id: deleteId } = req.query;
        if (typeof deleteId !== 'string' || !z.string().uuid().safeParse(deleteId).success) {
          return res.status(400).json({ error: 'Valid answer ID is required for deletion.' });
        }

        const { error: deleteError } = await supabase
          .from('answers')
          .delete()
          .eq('id', deleteId);

        if (deleteError) {
          console.error('Error deleting answer:', deleteError.message);
          return res.status(500).json({ error: 'Failed to delete answer.', details: deleteError.message });
        }
        return res.status(204).end();
      } catch (e) {
        console.error('Unexpected error in DELETE /answers:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}