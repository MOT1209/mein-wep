---
name: rate-limiting
description: Implement rate limiting for API endpoints — memory-based, Supabase-based, token bucket
triggers:
  - rate limiting
  - API protection
  - DDoS protection
  - request throttling
  - abuse prevention
---

# Rate Limiting Skill

## Overview
Implement rate limiting for Rashid's API endpoints to prevent abuse and ensure fair usage.

## Rate Limiting Strategies

### 1. Memory-Based (Simple)
```javascript
const rateLimit = new Map();

function checkRateLimit(ip, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }
  const requests = rateLimit.get(ip).filter(time => time > windowStart);
  rateLimit.set(ip, requests);
  if (requests.length >= limit) {
    return false;
  }
  requests.push(now);
  return true;
}

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!checkRateLimit(ip, 100, 60000)) {
    return res.status(429).json({ error: 'Too many requests', retryAfter: 60 });
  }
  // Process request
}
```

### 2. Token Bucket Algorithm
```javascript
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }
  consume(tokens = 1) {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }
  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}
```

### 3. Supabase-Based (Persistent)
```sql
CREATE TABLE rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_ip_endpoint
ON rate_limits(ip_address, endpoint, window_start);
```

## Rate Limits by Endpoint

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| /api/contact | 5 | 1 hour | Prevent spam |
| /api/gemini | 10 | 1 minute | AI costs |
| /api/github | 30 | 1 minute | API quota |
| /api/rss | 100 | 1 minute | Caching |
| General API | 100 | 1 minute | Default |

## Rules
- All API endpoints must have rate limiting
- Return 429 status with retry-after header
- Log rate limit violations for monitoring
- Use IP-based limiting for anonymous users
- Use user ID-based limiting for authenticated users
