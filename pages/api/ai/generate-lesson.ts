import type { NextApiRequest, NextApiResponse } from 'next'

import { GoogleGenerativeAI } from '@google/generative-ai'

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface LessonRequest {
  topic: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  module: string
  includeQuiz?: boolean
}

interface GeneratedLesson {
  title: string
  description: string
  content: string
  quiz?: {
    questions: Array<{
      question: string
      options: string[]
      correct_answer: number
      explanation: string
    }>
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { topic, difficulty, duration, module, includeQuiz = true }: LessonRequest = req.body

    if (!topic || !difficulty || !duration || !module) {
      return res.status(400).json({ message: 'Missing required fields' })
    }


    // Use Gemini for lesson content
    let lessonContent: string | undefined
    let lesson: GeneratedLesson
    {
      const lessonPrompt = `
Create a comprehensive RS-CIT lesson on "${topic}" for ${difficulty} level students.
Module: ${module}
Duration: ${duration} minutes

The lesson should include:
1. A catchy title
2. Brief description (1-2 sentences)
3. Well-structured HTML content with:
   - Introduction
   - Key concepts with examples
   - Practical tips
   - Summary
   - Use proper HTML tags (h2, h3, p, ul, li, strong, em, code)
   - Make it engaging and easy to understand
   - Include real-world examples relevant to RS-CIT certification

Format the response as JSON with: title, description, content
`
      const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const geminiRes = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: lessonPrompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 2000 } });
      lessonContent = geminiRes.response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!lessonContent) {
        throw new Error('Failed to generate lesson content from Gemini');
      }
      lesson = JSON.parse(lessonContent);
    }

    // Generate quiz with Gemini if requested
    if (includeQuiz) {
      const quizPrompt = `
Create 3-5 multiple choice questions for the RS-CIT lesson on "${topic}".
Each question should have:
- Clear question text
- 4 options (A, B, C, D)
- Correct answer index (0-3)
- Detailed explanation

Topics should cover the main concepts from the lesson.
Questions should be practical and test understanding, not just memorization.

Format as JSON array with: question, options, correct_answer, explanation
`
      try {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const geminiRes = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: quizPrompt }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 1500 } });
        const quizContent = geminiRes.response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (quizContent) {
          try {
            const questions = JSON.parse(quizContent)
            lesson.quiz = { questions }
          } catch (error) {
            console.error('Error parsing quiz JSON from Gemini:', error)
            // Continue without quiz if parsing fails
          }
        }
      } catch (error) {
        console.error('Error generating quiz with Gemini:', error)
        // Continue without quiz if Gemini fails
      }
    }

    res.status(200).json({
      success: true,
      lesson
    })

  } catch (error: any) {
    console.error('Error generating lesson:', error)
    
    // Fallback content if AI fails
    if (error.message.includes('API key') || error.message.includes('OpenAI')) {
      const fallbackLesson: GeneratedLesson = {
        title: `Introduction to ${req.body.topic}`,
        description: `Learn the fundamentals of ${req.body.topic} in this comprehensive RS-CIT lesson.`,
        content: `
          <h2>Introduction to ${req.body.topic}</h2>
          <p>This lesson covers the essential concepts you need to know about ${req.body.topic} for your RS-CIT certification.</p>
          
          <h3>Key Learning Objectives</h3>
          <ul>
            <li>Understand the basic concepts of ${req.body.topic}</li>
            <li>Learn practical applications</li>
            <li>Prepare for certification exam</li>
          </ul>
          
          <h3>Main Content</h3>
          <p>The topic of ${req.body.topic} is fundamental to computer literacy and is an important part of the RS-CIT curriculum.</p>
          
          <h3>Summary</h3>
          <p>In this lesson, we covered the basics of ${req.body.topic}. Practice these concepts to master them for your certification exam.</p>
        `,
        quiz: {
          questions: [
            {
              question: `What is the primary purpose of ${req.body.topic}?`,
              options: [
                'To store data',
                'To process information',
                'To display content',
                'All of the above'
              ],
              correct_answer: 3,
              explanation: `${req.body.topic} serves multiple purposes in computer systems including data storage, processing, and display.`
            }
          ]
        }
      }
      
      return res.status(200).json({
        success: true,
        lesson: fallbackLesson,
        note: 'Used fallback content due to AI service unavailability'
      })
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to generate lesson content',
      error: error.message 
    })
  }
}