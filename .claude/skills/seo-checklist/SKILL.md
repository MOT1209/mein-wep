---
name: seo-checklist
description: Comprehensive SEO checklist for all pages — meta tags, Open Graph, structured data, performance
triggers:
  - SEO checklist
  - meta tags
  - Open Graph
  - SEO audit
  - search optimization
  - Google ranking
---

# SEO Checklist Skill

## Overview
Comprehensive SEO checklist for every page on Rashid's portfolio website.

## Per-Page SEO Requirements

### Essential Tags
```html
<head>
  <!-- Primary Meta -->
  <title>Page Title | Rashid</title>
  <meta name="description" content="150-160 char description with keywords">
  <meta name="keywords" content="keyword1, keyword2, keyword3">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://rashid-wep.vercel.app/page">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Description">
  <meta property="og:image" content="https://rashid-wep.vercel.app/images/og-image.svg">
  <meta property="og:url" content="https://rashid-wep.vercel.app/page">
  <meta property="og:site_name" content="Rashid Portfolio">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Page Title">
  <meta name="twitter:description" content="Description">
  <meta name="twitter:image" content="https://rashid-wep.vercel.app/images/og-image.svg">

  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Page Title",
    "description": "Description",
    "url": "https://rashid-wep.vercel.app/page"
  }
  </script>
</head>
```

## Page-Specific SEO

### Homepage (index.html)
- Title: "Rashid — Full-Stack Developer & AI Engineer"
- Description: "Building AI-powered platforms, 3D games, and open-source tools. Creator of KingCraft and Rashid AI."
- Schema: Person + WebSite
- Priority: 1.0

### About (about.html)
- Title: "About Rashid — Full-Stack Developer & AI Engineer"
- Description: "Learn about Rashid's journey in software development, AI engineering, and game development."
- Schema: Person
- Priority: 0.8

### Contact (contact.html)
- Title: "Contact Rashid — Get in Touch"
- Description: "Contact Rashid for web development, AI integration, or game development projects."
- Schema: ContactPage
- Priority: 0.7

### Blog Posts
- Title: "Article Title | Rashid Blog"
- Description: Article excerpt (150-160 chars)
- Schema: Article
- Priority: 0.6

### Games
- Title: "KingCraft — 3D Voxel Game | Rashid"
- Description: "Play KingCraft, a browser-based 3D voxel game built with Three.js."
- Schema: SoftwareApplication (GameApplication)
- Priority: 0.7

## Technical SEO

### URL Structure
- Use hyphens, not underscores
- Keep URLs short and descriptive
- Include target keyword
- Example: /blog/building-kingcraft-3d-game

### Internal Linking
- Link between related pages
- Use descriptive anchor text
- Maintain logical hierarchy
- Breadcrumbs on all pages

### Image SEO
- Descriptive file names: kingcraft-gameplay.webp
- Alt text: descriptive, include keywords naturally
- Dimensions: specify width/height
- Format: WebP with JPEG fallback

### Performance SEO
- LCP < 2.5 seconds
- CLS < 0.1
- INP < 200ms
- Mobile-friendly (responsive)
- HTTPS enabled

## Validation Tools
- Google Search Console
- Google Rich Results Test
- Google PageSpeed Insights
- Screaming Frog SEO Spider
- Ahrefs/SEMrush

## Rules
- Every page must have unique title and description
- Every page must have Open Graph tags
- Every page must have structured data
- Images must have alt text
- URLs must be canonical
- Sitemap.xml must be updated
- Robots.txt must allow crawling
