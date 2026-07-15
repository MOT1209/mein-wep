'use client'

/**
 * JSON-LD Structured Data for SEO
 * Helps search engines understand the game content
 */
export function JsonLd() {
  const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Denkmalen',
    description: 'Draw words, get judged by AI, and compete with friends! A creative drawing battle game with instant AI feedback.',
    url: 'https://rashid-wep.vercel.app/denkmalen',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'AI-powered drawing evaluation',
      'Multiplayer support',
      'Multiple game modes',
      'Offline play',
      'Cross-platform',
    ],
    screenshot: 'https://rashid-wep.vercel.app/denkmalen/og.svg',
    author: {
      '@type': 'Person',
      name: 'Rashid',
      url: 'https://rashid-wep.vercel.app',
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Rashid Portfolio',
    url: 'https://rashid-wep.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://rashid-wep.vercel.app/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://rashid-wep.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Games',
        item: 'https://rashid-wep.vercel.app/games',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Denkmalen',
        item: 'https://rashid-wep.vercel.app/denkmalen',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}