import { useState } from 'react';
// import { generateLesson } from '../utils/supabase-helpers';

export default function LessonGenerator() {
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // const text = await generateLesson(topic);
      setScript(`Demo lesson for: ${topic}\n\nThis feature is coming soon! Your lesson will be generated using AI.`);
    } catch (error) {
      console.error(error);
      setScript('Error generating lesson.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Lesson Generator</h1>
      <form onSubmit={onSubmit}>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter module topic"
          className="w-full p-2 border border-gray-300 rounded-lg mb-4"
        />
        <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          {loading ? 'Generating...' : 'Generate Lesson'}
        </button>
        {script && <pre className="mt-4 whitespace-pre-wrap bg-gray-100 p-4 rounded-lg">{script}</pre>}
      </form>
    </div>
  );
}