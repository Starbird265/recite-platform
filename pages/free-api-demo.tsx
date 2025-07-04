import { useEffect, useState } from 'react';
import { getCentres, getQuizQuestions, getVideo, generateLesson, createOrder } from '../utils/api';
import Head from 'next/head';
import toast from 'react-hot-toast';

export default function DemoPage() {
  const [centres, setCentres] = useState<any[]>([]);
  const [video, setVideo] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [lesson, setLesson] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Centres
        const fetchedCentres = await getCentres();
        setCentres(fetchedCentres);

        // Fetch Video (using a dummy module ID)
        const fetchedVideo = await getVideo('module-1'); // Assuming 'module-1' exists in your videos table
        setVideo(fetchedVideo);

        // Fetch Quiz Questions (using a dummy module ID)
        const fetchedQuestions = await getQuizQuestions('1a2b3c4d-5e6f-7890-1234-567890abcdef'); // Using a quiz ID from dummy data
        setQuestions(fetchedQuestions);

        // Generate Lesson
        const generatedLesson = await generateLesson('Basics of Cloud Computing');
        setLesson(generatedLesson);

      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateOrder = async () => {
    try {
      const mockAmount = 1000; // Example amount
      const order = await createOrder(mockAmount);
      toast.success(`Order created: ${order.orderId}`);
    } catch (err: any) {
      toast.error(`Failed to create order: ${err.message}`);
      console.error(err);
    }
  };

  if (loading) return <div className="p-4">Loading API demo data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <>
      <Head>
        <title>API Demo | RS-CIT Platform</title>
      </Head>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6">Free API Demo</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Centres</h2>
          {centres.length > 0 ? (
            <ul className="list-disc pl-5">
              {centres.map(c => <li key={c.id}>{c.name} ({c.city})</li>)}
            </ul>
          ) : (
            <p>No centres found or loaded.</p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Video</h2>
          {video ? (
            <iframe 
              src={`https://www.youtube.com/embed/${video.youtube_id}`}
              width="560" 
              height="315" 
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          ) : (
            <p>No video loaded or found for the dummy module ID.</p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quiz Questions</h2>
          {questions.length > 0 ? (
            <ul className="list-disc pl-5">
              {questions.map(q => <li key={q.id}>{q.question}</li>)}
            </ul>
          ) : (
            <p>No quiz questions loaded or found for the dummy module ID.</p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Generated Lesson (AI)</h2>
          {lesson ? (
            <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap">{lesson}</pre>
          ) : (
            <p>No lesson generated.</p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Razorpay Order Creation</h2>
          <button 
            onClick={handleCreateOrder} 
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Create Mock Order
          </button>
          <p className="text-sm text-gray-600 mt-2">Check console for mock order details or toast for success/failure.</p>
        </section>
      </div>
    </>
  );
}
