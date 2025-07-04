import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getVideo } from '../../utils/api';

export default function VideoPlayerPage() {
  const router = useRouter();
  const { module: moduleId } = router.query; // Assuming 'module' is the YouTube video ID
  const { user } = useAuth();
  const [video, setVideo] = useState<{ youtube_id: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!moduleId) return;
      try {
        const data = await getVideo(moduleId as string);
        setVideo(data);
      } catch (err) {
        setError('Failed to load video.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideoData();
  }, [moduleId]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to view video lessons</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading video...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Video Not Found</h2>
          <p className="text-gray-600">The video you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const youtubeEmbedUrl = `https://www.youtube.com/embed/${video.youtube_id}?rel=0`;
  const youtubeDomain = process.env.NEXT_PUBLIC_YOUTUBE_DOMAIN || 'yourdomain.com'; // Fallback for local testing

  return (
    <>
      <Head>
        <title>Video Lesson: {video.title} | RS-CIT Platform</title>
        <meta name="description" content={`Watch video lesson ${video.title}`} />
      </Head>

      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Video Lesson: {video.title}</h1>
        <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={youtubeEmbedUrl}
            title={`YouTube video player - ${video.title}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            sandbox={`allow-scripts allow-same-origin allow-presentation allow-popups allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-top-navigation-by-user-activation allow-downloads allow-storage-access-by-user-activation allow-fullscreen allow-popups-to-escape-sandbox allow-top-navigation`}
          ></iframe>
        </div>
        <p className="text-gray-600 mt-4">This video is restricted to playback on {youtubeDomain}.</p>
      </div>
    </>
  );
}
