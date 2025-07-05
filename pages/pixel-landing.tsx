import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PixelCard, 
  PixelButton, 
  PixelIcon, 
  PixelTitle, 
  PixelStats, 
  PixelSection, 
  PixelGrid 
} from '../components/PixelComponents'

const PixelLanding: React.FC = () => {
  const [learnerCount, setLearnerCount] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    // Animate counter
    const target = 247
    let count = 0
    const increment = target / 30
    
    const timer = setInterval(() => {
      count += increment
      if (count >= target) {
        setLearnerCount(target)
        clearInterval(timer)
      } else {
        setLearnerCount(Math.floor(count))
      }
    }, 50)

    return () => clearInterval(timer)
  }, [])

  const stats = [
    { number: learnerCount, label: 'Active Learners', color: 'primary' as const },
    { number: '15+', label: 'Training Centers', color: 'success' as const },
    { number: '94%', label: 'Success Rate', color: 'warning' as const },
    { number: '87%', label: 'Average Score', color: 'accent' as const },
  ]

  const features = [
    {
      icon: '🎯',
      title: 'Interactive Learning',
      description: 'Engaging lessons with quizzes, videos, and hands-on practice sessions that make learning computer skills fun and effective.',
      color: 'primary' as const
    },
    {
      icon: '🧠',
      title: 'AI-Powered Content',
      description: 'Smart learning paths that adapt to your pace and style, with personalized recommendations to help you master concepts faster.',
      color: 'secondary' as const
    },
    {
      icon: '⏰',
      title: 'Flexible Schedule',
      description: 'Learn at your own pace with 30-minute micro-lessons that fit perfectly into your busy schedule and lifestyle.',
      color: 'accent' as const
    },
    {
      icon: '🏆',
      title: 'Official Certification',
      description: 'Get government-recognized RS-CIT certification that opens doors to better job opportunities and career advancement.',
      color: 'success' as const
    }
  ]

  const pricingPlans = [
    {
      name: 'Fast Track',
      price: '₹1,566',
      period: 'per month × 3 months',
      icon: '⚡',
      color: 'danger' as const,
      features: [
        'All course materials',
        'Interactive quizzes',
        'Center practice sessions',
        'Official certification'
      ]
    },
    {
      name: 'Balanced',
      price: '₹1,175',
      period: 'per month × 4 months',
      icon: '⚖️',
      color: 'primary' as const,
      popular: true,
      features: [
        'All course materials',
        'Interactive quizzes',
        'Center practice sessions',
        'Official certification',
        'Extra practice time'
      ]
    },
    {
      name: 'Flexible',
      price: '₹783',
      period: 'per month × 6 months',
      icon: '🛡️',
      color: 'success' as const,
      features: [
        'All course materials',
        'Interactive quizzes',
        'Center practice sessions',
        'Official certification',
        'Lowest monthly payment'
      ]
    }
  ]

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Government Employee',
      avatar: '👩',
      text: 'The clean interface and step-by-step lessons made learning so easy. I completed my RS-CIT in 4 months and got a government job!'
    },
    {
      name: 'Raj Kumar',
      role: 'Small Business Owner',
      avatar: '👨',
      text: 'The EMI option was perfect for my budget. The platform is user-friendly and the support team is always helpful.'
    },
    {
      name: 'Sunita Devi',
      role: 'Homemaker',
      avatar: '👩',
      text: 'I could learn at my own pace between household work. The 30-minute lessons were perfect for busy mothers like me.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* 🎨 Hero Section */}
      <PixelSection className="pixel-container">
        <div className="text-center">
          <div className="pixel-bounce mb-8">
            <PixelIcon size="lg" color="primary">💻</PixelIcon>
          </div>
          
          <PixelTitle size="xl" className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Level Up Your Digital Skills
          </PixelTitle>
          
          <p className={`pixel-subtitle transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Master computer fundamentals with our modern, interactive learning platform. 
            Get RS-CIT certified with flexible EMI options and expert guidance.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <PixelButton size="lg" variant="primary">
              🚀 Start Learning - ₹783/month
            </PixelButton>
            <PixelButton size="lg" variant="outline">
              📍 Find Centers Near You
            </PixelButton>
          </div>

          <PixelGrid cols={4} className={`transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {stats.map((stat, index) => (
              <PixelStats
                key={`stat-${index}`}
                title={stat.label}
                value={stat.number}
                icon={() => <span className="text-2xl">⭐</span>}
                iconColor={stat.color}
              />
            ))}
          </PixelGrid>
        </div>
      </PixelSection>

      {/* 🎯 Features Section */}
      <PixelSection background="gray" className="pixel-container">
        <h2 className="pixel-heading">Why Choose Our Platform?</h2>
        
        <PixelGrid cols={2} gap="lg">
          {features.map((feature, index) => (
            <PixelCard key={`feature-${index}`} className={`text-center transition-all duration-700 delay-${index * 100}`}>
              <PixelIcon size="md" color={feature.color}>
                {feature.icon}
              </PixelIcon>
              <h3 className="text-xl font-semibold mb-4 pixel-text-gray-800">
                {feature.title}
              </h3>
              <p className="pixel-text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </PixelCard>
          ))}
        </PixelGrid>
      </PixelSection>

      {/* 💰 Pricing Section */}
      <PixelSection className="pixel-container">
        <h2 className="pixel-heading">Choose Your Learning Plan</h2>
        
        <PixelGrid cols={3} gap="lg">
          {pricingPlans.map((plan, index) => (
            <PixelCard 
              key={index} 
              className={`text-center relative ${plan.popular ? 'transform scale-105 border-4 border-blue-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  ⭐ Most Popular
                </div>
              )}
              
              <PixelIcon size="md" color={plan.color}>
                {plan.icon}
              </PixelIcon>
              
              <h3 className="text-xl font-semibold mb-4 pixel-text-gray-800">
                {plan.name}
              </h3>
              
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {plan.price}
              </div>
              
              <p className="pixel-text-gray-500 mb-6">
                {plan.period}
              </p>
              
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
              
              <PixelButton 
                variant={plan.color} 
                className="w-full"
              >
                Choose Plan
              </PixelButton>
            </PixelCard>
          ))}
        </PixelGrid>
      </PixelSection>

      {/* 🗣️ Testimonials Section */}
      <PixelSection background="gradient" className="pixel-container">
        <h2 className="pixel-heading">What Our Students Say</h2>
        
        <PixelGrid cols={3} gap="lg">
          {testimonials.map((testimonialItem, index) => (
            <PixelCard key={`${testimonialItem.name}-${testimonialItem.role}`} className="text-center">
              <div role="img" aria-label={`${testimonialItem.name}'s avatar (${testimonialItem.role})`} className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl text-white mb-4 mx-auto">
                {testimonialItem.avatar}
              </div>
              
              <p className="pixel-text-gray-600 italic mb-4 leading-relaxed">
                &quot;{testimonialItem.text}&quot;
              </p>
              
              <div className="font-semibold pixel-text-gray-800 mb-1">
                {testimonialItem.name}
              </div>
              
              <div className="pixel-text-gray-500 text-sm">
                {testimonialItem.role}
              </div>
            </PixelCard>
          ))}
        </PixelGrid>
      </PixelSection>

      {/* 🎯 Call to Action */}
      <PixelSection className="pixel-container">
        <div className="max-w-2xl mx-auto">
          <PixelCard className="text-center">
            <div className="pixel-bounce mb-6">
              <PixelIcon size="lg" color="accent">🎓</PixelIcon>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 pixel-text-gray-800">
              Ready to Start Your Journey?
            </h2>
            
            <p className="pixel-text-gray-600 mb-8 text-lg">
              Join thousands of students who have already transformed their careers with RS-CIT certification.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <PixelButton size="lg" variant="primary">
                🚀 Get Started Today
              </PixelButton>
              <PixelButton size="lg" variant="outline">
                📞 Talk to Our Team
              </PixelButton>
            </div>
            
            <div className="flex justify-center gap-8 text-sm pixel-text-gray-500">
              <div className="flex items-center gap-2">
                <span>🛡️</span>
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🏆</span>
                <span>Govt. Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <span>❤️</span>
                <span>Made in India</span>
              </div>
            </div>
          </PixelCard>
        </div>
      </PixelSection>
    </div>
  )
}

export default PixelLanding