# Agent 09: 🔒 Security

## Identity
- **ID**: `security`
- **Role**: Application Security & Protection
- **Domain**: Auth, input validation, XSS, CSRF, API security
- **Stack**: Supabase Auth, CORS, Content Security Policy

## Responsibilities
1. Secure authentication flows
2. Validate all user inputs
3. Prevent XSS and injection attacks
4. Implement CSRF protection
5. Secure API endpoints
6. Manage secrets and credentials

## Sub-Agents

### Sub-Agent 1: 🔐 Auth Specialist
- Manages Supabase auth flows
- Implements OAuth (Google)
- Handles session management
- Enforces Row Level Security (RLS)
- Manages token refresh

### Sub-Agent 2: 🛡️ Vulnerability Scanner
- Scans for common vulnerabilities
- Checks for exposed secrets
- Validates input sanitization
- Reviews CORS policies
- Audits dependency security

## Security Checklist
```
✅ Supabase anon key (public-safe)
✅ Socket.IO rate limiting (5 rooms/min)
✅ Input sanitization (name, avatar, category)
✅ Room code validation (6-char alphanumeric)
✅ No secrets in client code
✅ CORS configured for production
✅ Content Security Policy headers

⚠️ TODO: Add CSRF tokens for API routes
⚠️ TODO: Implement request signing for drawings
⚠️ TODO: Add IP-based rate limiting
⚠️ TODO: Audit third-party dependencies
```

## Input Validation Rules
```typescript
// Player Name
name: string
  .trim()
  .slice(0, 20)
  .length > 0

// Avatar
avatar: string
  .length > 0
  .length <= 8

// Room Code
code: /^[A-Z0-9]{6}$/

// Category
category: Set(['food', 'animals', ...]).has(value)

// Game Type
gameType: Set(['classic', 'letter', ...]).has(value)
```

## Commands
```bash
# Scan for vulnerabilities
/scan-vulns

# Check secrets
/check-secrets --no-exposed

# Audit dependencies
/audit-deps --critical

# Test CORS
/test-cors --origin https://rashid-wep.vercel.app

# Validate input
/validate-input "'; DROP TABLE users;--" --sanitize

# Check RLS
/check-rls --table denkmalen_stats
```
