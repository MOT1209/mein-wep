---
name: structured-data
description: Create and validate JSON-LD structured data for SEO — Person, WebSite, Article, SoftwareApplication schemas
triggers:
  - structured data
  - JSON-LD
  - schema.org
  - SEO markup
  - rich results
  - knowledge graph
---

# Structured Data Skill

## Overview
Create and validate JSON-LD structured data for Rashid's portfolio website to improve SEO and rich results.

## Supported Schema Types

### 1. Person Schema (Portfolio)
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Rashid",
  "alternateName": "MOT1209",
  "url": "https://rashid-wep.vercel.app",
  "image": "https://rashid-wep.vercel.app/images/og-image.svg",
  "jobTitle": "Full-Stack Developer & AI Engineer",
  "knowsAbout": ["JavaScript", "TypeScript", "Python", "Three.js", "Supabase"],
  "sameAs": ["https://github.com/MOT1209"],
  "makesOffer": [...]
}
```

### 2. WebSite Schema
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Rashid — Full-Stack Developer & AI Engineer",
  "url": "https://rashid-wep.vercel.app",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://rashid-wep.vercel.app/?q={search_term_string}"
  }
}
```

### 3. Article Schema (Blog Posts)
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "author": {
    "@type": "Person",
    "name": "Rashid"
  },
  "datePublished": "2024-01-01",
  "dateModified": "2024-01-01",
  "image": "https://rashid-wep.vercel.app/images/...",
  "publisher": {
    "@type": "Organization",
    "name": "Rashid",
    "logo": {
      "@type": "ImageObject",
      "url": "https://rashid-wep.vercel.app/images/og-image.svg"
    }
  }
}
```

### 4. SoftwareApplication Schema (Games/Apps)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "KingCraft",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### 5. BreadcrumbList Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://rashid-wep.vercel.app"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://rashid-wep.vercel.app/blog/"
    }
  ]
}
```

## Validation Tools
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema Markup Validator: https://validator.schema.org/
- Yoast SEO (if using WordPress)

## Implementation
1. Add `<script type="application/ld+json">` in `<head>`
2. One schema per page (minimum)
3. Use `@graph` for multiple schemas on same page
4. Validate before deployment

## Rules
- All URLs must be absolute (https://rashid-wep.vercel.app/...)
- No placeholder values (empty strings, null)
- Dates in ISO 8601 format (YYYY-MM-DD)
- Images must be accessible (200 OK)
- Publisher logo: 600x60px minimum
