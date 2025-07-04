
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Zod schemas for validation
const quizMetadataPostSchema = z.object({
  module_id: z.string().min(1, "Module ID is required."),
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  difficulty: z.string().optional(),
  duration_minutes: z.number().int().min(1, "Duration must be at least 1 minute.").optional(),
  num_questions: z.number().int().min(1, "Number of questions must be at least 1.").optional(),
  passing_score: z.number().int().min(0).max(100, "Passing score must be between 0 and 100.").optional(),
});

const quizQuestionPostSchema = z.object({
  question: z.string().min(1, "Question is required."),
  choices: z.array(z.string().min(1, "Choice cannot be empty.")).min(2, "At least two choices are required."),
  correct_index: z.number().int().min(0, "Correct index must be non-negative."),
});

const quizMetadataPutSchema = z.object({
  id: z.string().uuid("Invalid quiz ID format."),
  module_id: z.string().min(1, "Module ID cannot be empty.").optional(),
  title: z.string().min(1, "Title cannot be empty.").optional(),
  description: z.string().optional(),
  difficulty: z.string().optional(),
  duration_minutes: z.number().int().min(1, "Duration must be at least 1 minute.").optional(),
  num_questions: z.number().int().min(1, "Number of questions must be at least 1.").optional(),
  passing_score: z.number().int().min(0).max(100, "Passing score must be between 0 and 100.").optional(),
  passing_score: z.number().int().min(0).max(100, "Passing score must be between 0 and 100.").optional(),
  status: z.enum(['pending', 'approved', 'rejected'], "Invalid status value.").optional(),
}).refine(data => Object.keys(data).length > 1, {
  message: "At least one field (module_id, title, description, difficulty, duration_minutes, num_questions, passing_score, status) must be provided for update.",
});

const quizQuestionPutSchema = z.object({
  id: z.string().uuid("Invalid quiz question ID format."),
  question: z.string().min(1, "Question cannot be empty.").optional(),
  choices: z.array(z.string().min(1, "Choice cannot be empty.")).min(2, "At least two choices are required.").optional(),
  correct_index: z.number().int().min(0, "Correct index must be non-negative.").optional(),
  status: z.enum(['pending', 'approved', 'rejected'], "Invalid status value.").optional(),
}).refine(data => Object.keys(data).length > 1, {
  message: "At least one field (question, choices, correct_index, status) must be provided for update.",
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
        const { id: quizId } = req.query;

        if (quizId) {
          // Fetch quiz questions for a specific quiz
          const { data: quizQuestions, error: getQuestionsError } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', quizId as string);

          if (getQuestionsError) {
            console.error('Error fetching quiz questions:', getQuestionsError.message);
            return res.status(500).json({ error: 'Failed to fetch quiz questions.', details: getQuestionsError.message });
          }
          return res.status(200).json(quizQuestions);
        } else {
          // Fetch all quizzes (metadata)
          const { data: quizzes, error: getQuizzesError } = await supabase
            .from('quizzes')
            .select('*');

          if (getQuizzesError) {
            console.error('Error fetching quizzes metadata:', getQuizzesError.message);
            return res.status(500).json({ error: 'Failed to fetch quizzes metadata.', details: getQuizzesError.message });
          }
          return res.status(200).json(quizzes);
        }
      } catch (e) {
        console.error('Unexpected error in GET /quizzes:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'POST':
      try {
        // Determine if it's a quiz metadata creation or a quiz question creation
        if ('question' in req.body && 'choices' in req.body && 'correct_index' in req.body) {
          // It's a quiz question
          const validatedData = quizQuestionPostSchema.parse(req.body);
          const { question, choices, correct_index } = validatedData;
          const { quiz_id } = req.body; // Assuming quiz_id is provided in the body for questions

          if (!quiz_id || typeof quiz_id !== 'string' || !z.string().uuid().safeParse(quiz_id).success) {
            return res.status(400).json({ error: 'Valid quiz_id is required for creating a quiz question.' });
          }

          const { data: newQuizQuestion, error: postError } = await supabase
            .from('quiz_questions')
            .insert([{ quiz_id, question, choices, correct_index, status: 'pending' }])
            .select();

          if (postError) {
            console.error('Error creating quiz question:', postError.message);
            return res.status(500).json({ error: 'Failed to create quiz question.', details: postError.message });
          }
          return res.status(201).json(newQuizQuestion[0]);
        } else {
          // It's quiz metadata
          const validatedData = quizMetadataPostSchema.parse(req.body);
          const { module_id, title, description, difficulty, duration_minutes, num_questions, passing_score } = validatedData;

          const { data: newQuizMetadata, error: postError } = await supabase
            .from('quizzes')
            .insert([{ module_id, title, description, difficulty, duration_minutes, num_questions, passing_score, status: 'pending' }])
            .select();

          if (postError) {
            console.error('Error creating quiz metadata:', postError.message);
            return res.status(500).json({ error: 'Failed to create quiz metadata.', details: postError.message });
          }
          return res.status(201).json(newQuizMetadata[0]);
        }
      } catch (e) {
        if (e instanceof z.ZodError) {
          return res.status(400).json({ error: 'Validation failed.', details: e.errors });
        }
        console.error('Unexpected error in POST /quizzes:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'PUT':
      try {
        let updatedData;
        let putError;
        let targetTable;

        if ('question' in req.body || 'choices' in req.body || 'correct_index' in req.body) {
          // It's a quiz question update
          const validatedData = quizQuestionPutSchema.parse(req.body);
          const { id, ...updates } = validatedData;
          targetTable = 'quiz_questions';

          let updateQuery;
          if (userRole === 'admin') {
            updateQuery = supabaseAdmin.from(targetTable).update(updates).eq('id', id);
          } else {
            const { status, ...userUpdates } = updates;
            updateQuery = supabase.from(targetTable).update(userUpdates).eq('id', id);
          }
          const { data, error } = await updateQuery.select();
          updatedData = data;
          putError = error;

        } else {
          // It's a quiz metadata update
          const validatedData = quizMetadataPutSchema.parse(req.body);
          const { id, ...updates } = validatedData;
          targetTable = 'quizzes';

          let updateQuery;
          if (userRole === 'admin') {
            updateQuery = supabaseAdmin.from(targetTable).update(updates).eq('id', id);
          } else {
            const { status, ...userUpdates } = updates;
            updateQuery = supabase.from(targetTable).update(userUpdates).eq('id', id);
          }
          const { data, error } = await updateQuery.select();
          updatedData = data;
          putError = error;
        }

        if (putError) {
          console.error(`Error updating ${targetTable}:`, putError.message);
          return res.status(500).json({ error: `Failed to update ${targetTable}.`, details: putError.message });
        }
        if (!updatedData || updatedData.length === 0) {
          return res.status(404).json({ error: `${targetTable} not found or unauthorized to update.` });
        }
        return res.status(200).json(updatedData[0]);
      } catch (e) {
        if (e instanceof z.ZodError) {
          return res.status(400).json({ error: 'Validation failed.', details: e.errors });
        }
        console.error('Unexpected error in PUT /quizzes:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'DELETE':
      try {
        const { id: deleteId, type } = req.query;

        if (typeof deleteId !== 'string' || !z.string().uuid().safeParse(deleteId).success) {
          return res.status(400).json({ error: 'Valid ID is required for deletion.' });
        }

        let targetTable;
        if (type === 'question') {
          targetTable = 'quiz_questions';
        } else {
          targetTable = 'quizzes';
        }

        const { error: deleteError } = await supabaseAdmin
          .from(targetTable)
          .delete()
          .eq('id', deleteId);

        if (deleteError) {
          console.error(`Error deleting ${targetTable}:`, deleteError.message);
          return res.status(500).json({ error: `Failed to delete ${targetTable}.`, details: deleteError.message });
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
