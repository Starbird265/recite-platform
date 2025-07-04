import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Clock, 
  Star,
  Zap,
  Award,
  Users,
  Calculator,
  Lock,
  Rocket,
  Target,
  TrendingUp,
  BookOpen,
  Monitor,
  Coins,
  Trophy,
  Gamepad2,
  Cpu,
  Heart,
  Timer
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import {
  PixelButton,
  PixelCard,
  PixelBadge,
  PixelContainer,
  PixelGrid,
  PixelHeader,
  PixelBody,
  PixelInput,
  PixelSelect,
  PixelAnimation,
  PixelBackground,
  PixelAlert,
  PixelProgress
} from '../components/PixelComponents'

interface PaymentPlan {
  id: number
  name: string
  displayName: string
  months: number
  emi: number
  total: number
  popular: boolean
  savings: number
  badge: string
  color: string
  icon: string
}

interface Center {
  id: string
  name: string
  city: string
  address: string
  fees: number
  rating: number
  distance: number
  verified: boolean
  specialties: string[]
}

export default function PaymentPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<number>(4)
  const [selectedCenter, setSelectedCenter] = useState<string>('')
  const [centers, setCenters] = useState<Center[]>([])
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(33)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'bharatpur'
  })

  const plans: PaymentPlan[] = [
    {
      id: 3,
      name: 'express',
      displayName: '⚡ SPEED RUN',
      months: 3,
      emi: 1566,
      total: 4699,
      popular: false,
      savings: 0,
      badge: 'Fast Track',
      color: 'border-red-400',
      icon: '🏃‍♂️'
    },
    {
      id: 4,
      name: 'standard',
      displayName: '🎯 BALANCED',
      months: 4,
      emi: 1175,
      total: 4699,
      popular: true,
      savings: 391,
      badge: 'Most Popular',
      color: 'border-cyan-400',
      icon: '⚖️'
    },
    {
      id: 6,
      name: 'flexible',
      displayName: '🛡️ EASY MODE',
      months: 6,
      emi: 783,
      total: 4699,
      popular: false,
      savings: 783,
      badge: 'Budget Friendly',
      color: 'border-green-400',
      icon: '🐌'
    }
  ]

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const { data, error } = await supabase
          .from('centers')
          .select('*')
          .eq('verified', true)
          .eq('city', 'bharatpur')
          .order('rating', { ascending: false })
  
        if (error) throw error
  
        const centersData = data || [
          {
            id: '1',
            name: 'Digital Warriors Academy',
            city: 'bharatpur',
            address: 'Main Market, Bharatpur - The Battle Arena',
            fees: 4699,
            rating: 4.8,
            distance: 2.5,
            verified: true,
            specialties: ['Gaming Setup', 'AI Labs', 'VR Training']
          },
          {
            id: '2',
            name: 'Pixel Perfect Learning Hub',
            city: 'bharatpur',
            address: 'Civil Lines, Bharatpur - Tech Fortress',
            fees: 4699,
            rating: 4.6,
            distance: 3.2,
            verified: true,
            specialties: ['Retro Gaming', 'Code Academy', 'Digital Art']
          },
          {
            id: '3',
            name: 'Cyber Skills Training Center',
            city: 'bharatpur',
            address: 'Kaman Area, Bharatpur - Command Center',
            fees: 4699,
            rating: 4.7,
            distance: 1.8,
            verified: true,
            specialties: ['Hacker Mode', 'Speed Coding', 'Tech Wizardry']
          }
        ]
  
        setCenters(centersData)
        if (centersData.length > 0) {
          setSelectedCenter(centersData[0].id)
        }
      } catch (error) {
        console.error('Error fetching training centers:', error)
      }
    }

    fetchCenters()
    
    // Pre-fill form if user is logged in
    if (user) {
      setFormData({
        name: user.email?.split('@')[0] || '',
        phone: '',
        email: user.email || '',
        city: 'bharatpur'
      })
    }

    // Get plan from URL with gaming flair
    const planParam = router.query.plan
    if (planParam) {
      const planId = parseInt(planParam as string)
      if (plans.some(p => p.id === planId)) {
        setSelectedPlan(planId)
      }
    }

    // Update progress based on step
    setProgress(step * 33.33)
  }, [user, router.query.plan, step, plans])

  const fetchCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('centers')
        .select('*')
        .eq('verified', true)
        .eq('city', 'bharatpur')
        .order('rating', { ascending: false })

      if (error) throw error

      const centersData = data || [
        {
          id: '1',
          name: 'Digital Warriors Academy',
          city: 'bharatpur',
          address: 'Main Market, Bharatpur - The Battle Arena',
          fees: 4699,
          rating: 4.8,
          distance: 2.5,
          verified: true,
          specialties: ['Gaming Setup', 'AI Labs', 'VR Training']
        },
        {
          id: '2',
          name: 'Pixel Perfect Learning Hub',
          city: 'bharatpur',
          address: 'Civil Lines, Bharatpur - Tech Fortress',
          fees: 4699,
          rating: 4.6,
          distance: 3.2,
          verified: true,
          specialties: ['Retro Gaming', 'Code Academy', 'Digital Art']
        },
        {
          id: '3',
          name: 'Cyber Skills Training Center',
          city: 'bharatpur',
          address: 'Kaman Area, Bharatpur - Command Center',
          fees: 4699,
          rating: 4.7,
          distance: 1.8,
          verified: true,
          specialties: ['Hacker Mode', 'Speed Coding', 'Tech Wizardry']
        }
      ]

      setCenters(centersData)
      if (centersData.length > 0) {
        setSelectedCenter(centersData[0].id)
      }
    } catch (error) {
      console.error('Error fetching training centers:', error)
    }
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan)
  const selectedCenterData = centers.find(c => c.id === selectedCenter)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmitPayment = async () => {
    if (!user) {
      toast.error('🎮 Please sign in to start your quest!')
      router.push('/login')
      return
    }

    if (!selectedPlanData || !selectedCenterData) {
      toast.error('⚠️ Please select your power-up plan and training center!')
      return
    }

    if (!formData.name || !formData.phone) {
      toast.error('📝 Please complete your player profile!')
      return
    }

    setLoading(true)
    try {
      // Create enrollment record - Player joins the game!
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert([{
          user_id: user.id,
          center_id: selectedCenter,
          emi_plan: `${selectedPlan}_months`,
          total_amount: selectedPlanData.total,
          monthly_amount: selectedPlanData.emi,
          status: 'active',
          enrolled_at: new Date().toISOString()
        }])

      if (enrollmentError) throw enrollmentError

      // Create first payment record - First power-up purchase!
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          user_id: user.id,
          amount: selectedPlanData.emi,
          payment_method: 'razorpay',
          payment_type: 'emi',
          status: 'pending',
          payment_date: new Date().toISOString(),
          emi_number: 1,
          total_emis: selectedPlan
        }])

      if (paymentError) throw paymentError

      // 🎉 VICTORY! Quest begins!
      toast.success('🎊 Welcome to the RS-CIT Adventure! Your quest begins now!')
      
      // Redirect to the player dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Payment quest failed:', error)
      toast.error('💥 Quest enrollment failed! Please try again, warrior!')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  return (
    <>
      <Head>
        <title>🎮 Payment Quest | RS-CIT Platform</title>
        <meta name="description" content="Enroll in RS-CIT course with flexible EMI power-ups and start your digital adventure!" />
      </Head>

      <PixelBackground pattern="circuit" className="min-h-screen">
        {/* 🎮 Gaming Header */}
        <header className="pixel-nav">
          <PixelContainer>
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <PixelAnimation type="glow">
                  <Monitor className="h-8 w-8 text-cyan-400" />
                </PixelAnimation>
                <div>
                  <PixelHeader className="text-xl text-white">ENROLLMENT QUEST</PixelHeader>
                  <PixelBody className="text-gray-400 text-sm">Choose your power-ups and begin your adventure</PixelBody>
                </div>
              </div>
              <PixelButton
                variant="outline"
                onClick={() => router.push('/')}
                icon={Rocket}
              >
                Back to Base
              </PixelButton>
            </div>
          </PixelContainer>
        </header>

        <PixelContainer className="py-8">
          {/* 🎯 Quest Progress Bar */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <PixelHeader className="text-white text-lg">Quest Progress</PixelHeader>
              <PixelBody className="text-gray-400">Complete all steps to unlock your learning adventure</PixelBody>
            </div>
            
            <PixelProgress value={progress} className="mb-4" />
            
            <div className="flex items-center justify-center space-x-8">
              {[
                { step: 1, title: "Power-Up Plan", icon: <Zap className="h-5 w-5" /> },
                { step: 2, title: "Training Center", icon: <Target className="h-5 w-5" /> },
                { step: 3, title: "Final Boss", icon: <Trophy className="h-5 w-5" /> }
              ].map((item) => (
                <div key={item.step} className="flex items-center">
                  <PixelCard 
                    variant="gaming" 
                    className={`p-3 flex items-center justify-center ${
                      step >= item.step ? 'pixel-glow' : 'opacity-50'
                    }`}
                  >
                    {step > item.step ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <div className="text-cyan-400">{item.icon}</div>
                    )}
                  </PixelCard>
                  <div className="ml-3 text-center">
                    <PixelBody className="text-white text-sm font-bold">{item.title}</PixelBody>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* 🎮 Step 1: Power-Up Selection */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <PixelHeader className="text-3xl text-white mb-4">
                    ⚡ CHOOSE YOUR POWER-UP PLAN
                  </PixelHeader>
                  <PixelBody className="text-gray-400 max-w-2xl mx-auto">
                    Select the payment plan that matches your gaming style and unlocks your learning potential
                  </PixelBody>
                </div>

                <PixelGrid cols={3}>
                  {plans.map((plan) => (
                    <PixelCard
                      key={plan.id}
                      variant="gaming"
                      className={`p-6 cursor-pointer transition-all relative ${
                        selectedPlan === plan.id ? 'pixel-glow scale-105' : 'hover:scale-102'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <PixelBadge variant="warning" icon={Star}>
                            {plan.badge}
                          </PixelBadge>
                        </div>
                      )}

                      <div className="text-center">
                        <div className="text-4xl mb-3">{plan.icon}</div>
                        <PixelHeader className="text-xl text-white mb-3">{plan.displayName}</PixelHeader>
                        
                        <div className="pixel-font-header text-3xl text-cyan-400 mb-2">
                          ₹{plan.emi.toLocaleString()}
                        </div>
                        <PixelBody className="text-gray-400 mb-4">
                          per month × {plan.months} quests
                        </PixelBody>

                        <div className="border-t-2 border-gray-600 pt-4 mb-6">
                          <PixelBody className="text-gray-400 mb-2">
                            Total Adventure Cost: <span className="text-white font-bold">₹{plan.total.toLocaleString()}</span>
                          </PixelBody>
                          {plan.savings > 0 && (
                            <PixelBadge variant="success">
                              <Coins className="h-3 w-3 mr-1" />
                              Save ₹{plan.savings}
                            </PixelBadge>
                          )}
                        </div>

                        {/* Power-ups included */}
                        <div className="text-left space-y-2 mb-6">
                          {[
                            '🧠 AI Brain Booster',
                            '🎮 Gamified Quests',
                            '🏆 Achievement System',
                            '📜 Legendary Certificate'
                          ].map((feature, i) => (
                            <div key={i} className="flex items-center text-sm text-gray-400">
                              <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                        </div>

                        {selectedPlan === plan.id && (
                          <PixelBadge variant="primary" className="mb-4">
                            <Zap className="h-3 w-3 mr-1" />
                            Selected Power-Up
                          </PixelBadge>
                        )}
                      </div>
                    </PixelCard>
                  ))}
                </PixelGrid>

                <div className="text-center">
                  <PixelButton
                    variant="primary"
                    size="lg"
                    onClick={nextStep}
                    className="pixel-glow"
                    icon={Rocket}
                  >
                    Activate Power-Up
                  </PixelButton>
                </div>
              </div>
            )}

            {/* 🎯 Step 2: Training Center Selection */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <PixelHeader className="text-3xl text-white mb-4">
                    🏰 SELECT TRAINING CENTER
                  </PixelHeader>
                  <PixelBody className="text-gray-400 max-w-2xl mx-auto">
                    Choose your training ground where you&apos;ll practice hands-on skills with expert mentors
                  </PixelBody>
                </div>

                <div className="space-y-4">
                  {centers.map((center) => (
                    <PixelCard
                      key={center.id}
                      variant="gaming"
                      className={`p-6 cursor-pointer transition-all ${
                        selectedCenter === center.id ? 'pixel-glow' : 'hover:scale-102'
                      }`}
                      onClick={() => setSelectedCenter(center.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center">
                            {selectedCenter === center.id && (
                              <div className="w-3 h-3 bg-cyan-400 rounded-full pixel-glow"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <PixelHeader className="text-lg text-white">{center.name}</PixelHeader>
                              {center.verified && (
                                <PixelBadge variant="success" icon={Shield}>
                                  Verified
                                </PixelBadge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {center.address}
                              </div>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                                {center.rating} Rating
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {center.distance} km away
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {center.specialties?.map((specialty, index) => (
                                <PixelBadge key={index} variant="primary" className="text-xs">
                                  {specialty}
                                </PixelBadge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <PixelBody className="text-cyan-400 font-bold">Training Hub</PixelBody>
                          <PixelBody className="text-gray-400 text-sm">Expert Mentors</PixelBody>
                        </div>
                      </div>
                    </PixelCard>
                  ))}
                </div>

                <div className="flex justify-between">
                  <PixelButton
                    variant="outline"
                    onClick={prevStep}
                    icon={Target}
                  >
                    Back to Power-Ups
                  </PixelButton>
                  <PixelButton
                    variant="primary"
                    onClick={nextStep}
                    disabled={!selectedCenter}
                    icon={Rocket}
                  >
                    Proceed to Final Boss
                  </PixelButton>
                </div>
              </div>
            )}

            {/* 🏆 Step 3: Final Boss - Payment */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <PixelHeader className="text-3xl text-white mb-4">
                    🏆 FINAL BOSS: COMPLETE YOUR QUEST
                  </PixelHeader>
                  <PixelBody className="text-gray-400 max-w-2xl mx-auto">
                    Last step! Confirm your details and unlock your learning adventure
                  </PixelBody>
                </div>

                <PixelGrid cols={2} className="gap-8">
                  {/* Quest Summary */}
                  <PixelCard variant="gaming" className="p-6">
                    <PixelHeader className="text-lg text-white mb-4 flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                      Quest Summary
                    </PixelHeader>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <PixelBody className="text-gray-400">Power-Up Plan:</PixelBody>
                        <PixelBody className="text-white font-bold">{selectedPlanData?.displayName}</PixelBody>
                      </div>
                      <div className="flex justify-between items-center">
                        <PixelBody className="text-gray-400">Training Center:</PixelBody>
                        <PixelBody className="text-white font-bold">{selectedCenterData?.name}</PixelBody>
                      </div>
                      <div className="flex justify-between items-center">
                        <PixelBody className="text-gray-400">Monthly Power-Up:</PixelBody>
                        <PixelBody className="text-white font-bold">₹{selectedPlanData?.emi.toLocaleString()}</PixelBody>
                      </div>
                      <div className="flex justify-between items-center">
                        <PixelBody className="text-gray-400">Quest Duration:</PixelBody>
                        <PixelBody className="text-white font-bold">{selectedPlanData?.months} months</PixelBody>
                      </div>
                      <div className="border-t-2 border-gray-600 pt-4">
                        <div className="flex justify-between items-center">
                          <PixelBody className="text-white">Total Adventure Cost:</PixelBody>
                          <PixelHeader className="text-xl text-cyan-400">₹{selectedPlanData?.total.toLocaleString()}</PixelHeader>
                        </div>
                      </div>
                    </div>

                    <PixelAlert type="success" className="mt-6" icon={Shield}>
                      <strong>Secure Payment Protected</strong><br />
                      Your quest enrollment is protected by 256-bit SSL encryption and Razorpay security
                    </PixelAlert>
                  </PixelCard>

                  {/* Player Profile */}
                  <PixelCard variant="gaming" className="p-6">
                    <PixelHeader className="text-lg text-white mb-4 flex items-center">
                      <Gamepad2 className="h-5 w-5 mr-2 text-cyan-400" />
                      Player Profile
                    </PixelHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block pixel-font-small text-gray-400 mb-2">Player Name *</label>
                        <PixelInput
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          placeholder="Enter your warrior name"
                          dark
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block pixel-font-small text-gray-400 mb-2">Contact Number *</label>
                        <PixelInput
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleFormChange}
                          placeholder="Your communication device"
                          dark
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block pixel-font-small text-gray-400 mb-2">Email Portal *</label>
                        <PixelInput
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          placeholder="Your digital mailbox"
                          dark
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block pixel-font-small text-gray-400 mb-2">Home Base</label>
                        <PixelSelect
                          name="city"
                          value={formData.city}
                          onChange={handleFormChange}
                          dark
                        >
                          <option value="bharatpur">Bharatpur - The Digital Fortress</option>
                          <option value="jaipur">Jaipur - Pink City Tech Hub</option>
                          <option value="jodhpur">Jodhpur - Blue City Academy</option>
                          <option value="udaipur">Udaipur - Lake City Learning</option>
                        </PixelSelect>
                      </div>
                    </div>

                    <PixelAlert type="info" className="mt-6" icon={Heart}>
                      <strong>What Awaits You</strong><br />
                      • 32 AI-powered micro-quests<br />
                      • Interactive boss battles (quizzes)<br />
                      • Hands-on training at your center<br />
                      • Legendary RS-CIT certificate
                    </PixelAlert>
                  </PixelCard>
                </PixelGrid>

                <div className="flex justify-between items-center">
                  <PixelButton
                    variant="outline"
                    onClick={prevStep}
                    icon={Target}
                  >
                    Back to Training Centers
                  </PixelButton>
                  <PixelButton
                    variant="primary"
                    size="lg"
                    onClick={handleSubmitPayment}
                    disabled={loading}
                    className="pixel-glow"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Initializing Quest...
                      </div>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Start Adventure - ₹{selectedPlanData?.emi.toLocaleString()}
                      </>
                    )}
                  </PixelButton>
                </div>
              </div>
            )}
          </div>
        </PixelContainer>
      </PixelBackground>
    </>
  )
}