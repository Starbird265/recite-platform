import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1e293b" />
        <meta name="description" content="RS-CIT Hybrid Micro-Learning Platform - Democratizing certification through AI-driven lessons" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}