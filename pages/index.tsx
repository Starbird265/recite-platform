import { useState } from 'react'
import Head from 'next/head'
import { useAuth } from '@/components/AuthContext'
import Login from '@/components/Login'
import Dashboard from '@/components/Dashboard'
import LandingPage from '@/components/LandingPage'

export default function Home() {
  const { session } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  if (session) {
    return <Dashboard />
  }

  return (
    <>
      <Head>
        <title>RS-CIT Platform - Democratizing IT Certification</title>
        <meta name="description" content="AI-powered micro-learning platform for RS-CIT certification with trusted local center network" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {showAuth ? (
        <Login onBack={() => setShowAuth(false)} />
      ) : (
        <LandingPage onGetStarted={() => setShowAuth(true)} />
      )}
    </>
  )
}