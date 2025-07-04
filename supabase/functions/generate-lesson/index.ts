import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { exec } from 'child_process';
import { promisify } from 'util';

const run = promisify(exec);

serve(async (req) => {
  const { topic } = await req.json();
  // Reconstruct key JSON
  const saKey = JSON.parse(atob(Deno.env.get('GEMINI_SA_KEY')!));
  // Write to a temp file for the CLI
  Deno.writeTextFileSync('/tmp/sa.json', JSON.stringify(saKey));
  // Build the CLI command
  const cmd = [
    'gemini',
    'chat',
    '--project', Deno.env.get('GEMINI_PROJECT')!,
    '--model',   Deno.env.get('GEMINI_MODEL')!,
    '--service-account', '/tmp/sa.json',
    '--prompt', `"Generate a 300-word lesson script on: ${topic}"`
  ].join(' ');

  try {
    const { stdout } = await run(cmd);
    return new Response(JSON.stringify({ script: stdout }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('Error generating lesson', { status: 500 });
  }
});