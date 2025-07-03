
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Zod schemas for validation
const videoPostSchema = z.object({
  title: z.string().min(1, "Title is required."),
  youtube_id: z.string().min(1, "YouTube ID is required."),
  description: z.string().optional(),
  module_id: z.string().min(1, "Module ID is required."),
});

const videoPutSchema = z.object({
  id: z.string().uuid("Invalid video ID format."),
  title: z.string().min(1, "Title cannot be empty.").optional(),
  youtube_id: z.string().min(1, "YouTube ID cannot be empty.").optional(),
  description: z.string().optional(),
  module_id: z.string().min(1, "Module ID cannot be empty.").optional(),
  status: z.enum(['pending', 'approved', 'rejected'], "Invalid status value.").optional(),
}).refine(data => Object.keys(data).length > 1, { // Ensure at least one field other than ID is provided
  message: "At least one field (title, youtube_id, description, module_id, status) must be provided for update.",
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
        const { data: videos, error: getError } = await supabase
          .from('videos')
          .select('*');

        if (getError) {
          console.error('Error fetching videos:', getError.message);
          return res.status(500).json({ error: 'Failed to fetch videos.', details: getError.message });
        }
        return res.status(200).json(videos);
      } catch (e) {
        console.error('Unexpected error in GET /videos:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'POST':
      try {
        const validatedData = videoPostSchema.parse(req.body);
        const { title, youtube_id, description, module_id } = validatedData;

        const { data: newVideo, error: postError } = await supabase
          .from('videos')
          .insert([{ title, youtube_id, description, module_id, status: 'pending' }])
          .select();

        if (postError) {
          console.error('Error creating video:', postError.message);
          return res.status(500).json({ error: 'Failed to create video.', details: postError.message });
        }
        return res.status(201).json(newVideo[0]);
      } catch (e) {
        if (e instanceof z.ZodError) {
          return res.status(400).json({ error: 'Validation failed.', details: e.errors });
        }
        console.error('Unexpected error in POST /videos:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'PUT':
      try {
        const validatedData = videoPutSchema.parse(req.body);
        const { id, ...updates } = validatedData;

        let updateQuery;
        if (userRole === 'admin') {
          updateQuery = supabaseAdmin.from('videos').update(updates).eq('id', id);
        } else {
          const { status, ...userUpdates } = updates;
          updateQuery = supabase.from('videos').update(userUpdates).eq('id', id);
        }

        const { data: updatedVideo, error: putError } = await updateQuery.select();

        if (putError) {
          console.error('Error updating video:', putError.message);
          return res.status(500).json({ error: 'Failed to update video.', details: putError.message });
        }
        if (!updatedVideo || updatedVideo.length === 0) {
          return res.status(404).json({ error: 'Video not found or unauthorized to update.' });
        }
        return res.status(200).json(updatedVideo[0]);
      } catch (e) {
        if (e instanceof z.ZodError) {
          return res.status(400).json({ error: 'Validation failed.', details: e.errors });
        }
        console.error('Unexpected error in PUT /videos:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    case 'DELETE':
      try {
        const { id: deleteId } = req.query;
        if (typeof deleteId !== 'string' || !z.string().uuid().safeParse(deleteId).success) {
          return res.status(400).json({ error: 'Valid video ID is required for deletion.' });
        }

        // RLS policies should handle authorization for deletion
        const { error: deleteError } = await supabase
          .from('videos')
          .delete()
          .eq('id', deleteId);

        if (deleteError) {
          console.error('Error deleting video:', deleteError.message);
          return res.status(500).json({ error: 'Failed to delete video.', details: deleteError.message });
        }
        return res.status(204).end();
      } catch (e) {
        console.error('Unexpected error in DELETE /videos:', e);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
