import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    // Generate lesson content
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

    const lessonResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert RS-CIT instructor creating engaging micro-lessons. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: lessonPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const lessonContent = lessonResponse.choices[0]?.message?.content
    if (!lessonContent) {
      throw new Error('Failed to generate lesson content')
    }

    let lesson: GeneratedLesson
    try {
      lesson = JSON.parse(lessonContent)
    } catch (error) {
      throw new Error('Invalid JSON response from AI')
    }

    // Generate quiz if requested
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

      const quizResponse = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are creating RS-CIT quiz questions. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: quizPrompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.6,
      })

      const quizContent = quizResponse.choices[0]?.message?.content
      if (quizContent) {
        try {
          const questions = JSON.parse(quizContent)
          lesson.quiz = { questions }
        } catch (error) {
          console.error('Error parsing quiz JSON:', error)
          // Continue without quiz if parsing fails
        }
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