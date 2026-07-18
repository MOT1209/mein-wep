---
name: image-optimization
description: Optimize images for web — format conversion, lazy loading, responsive sizes, Core Web Vitals
triggers:
  - image optimization
  - WebP
  - lazy loading
  - responsive images
  - Core Web Vitals
  - LCP images
---

# Image Optimization Skill

## Overview
Optimize images for Rashid's portfolio to improve loading performance and Core Web Vitals (especially LCP).

## Image Formats

### Recommended Formats
| Format | Use Case | Quality | Size |
|--------|----------|---------|------|
| WebP | All images | 80-85% | Smallest |
| AVIF | Modern browsers | 75-80% | Smallestest |
| PNG | Transparency needed | 100% | Large |
| JPEG | Photos | 80% | Medium |
| SVG | Icons, logos | N/A | Tiny |

### Fallback Strategy
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>
```

## Responsive Images

### srcset for Different Sizes
```html
<img 
  src="image-800w.jpg"
  srcset="
    image-400w.jpg 400w,
    image-800w.jpg 800w,
    image-1200w.jpg 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Description"
  loading="lazy"
  decoding="async"
>
```

## Lazy Loading

### Native Lazy Loading
```html
<!-- Below fold: always lazy -->
<img src="image.webp" alt="Description" loading="lazy" decoding="async">

<!-- Above fold: eager for LCP -->
<img src="hero.webp" alt="Hero" loading="eager" fetchpriority="high">
```

### JavaScript Lazy Loading (Intersection Observer)
```javascript
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      imageObserver.unobserve(img);
    }
  });
});
lazyImages.forEach(img => imageObserver.observe(img));
```

## Core Web Vitals Impact

### LCP (Largest Contentful Paint)
- Hero image: `loading="eager"`, `fetchpriority="high"`
- Preload: `<link rel="preload" as="image" href="hero.webp">`
- Dimensions: Always specify width/height to prevent CLS

### CLS (Cumulative Layout Shift)
```html
<img src="image.webp" width="800" height="600" alt="Description">
```

## Tools
- Sharp (Node.js): `sharp(input).webp({ quality: 80 }).toFile(output)`
- Squoosh: https://squoosh.app/
- ImageMagick: `convert input.png -quality 80 output.webp`

## Rules
- All images: WebP format with JPEG fallback
- Lazy load: All images below the fold
- Dimensions: Always specify width/height
- Alt text: Descriptive, not keyword-stuffed
- Maximum size: 200KB per image
- Maximum dimensions: 1920px width for full-screen
- Icons: SVG format only
- Hero image: preload, eager loading
