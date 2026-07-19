# 🚀 CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for continuous integration and deployment. The pipeline automatically runs tests, linting, and builds on every push and pull request.

## Workflows

### 1. CI Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` branch
- Pull request to `main` branch

**Jobs:**
1. **Lint** - Runs ESLint to check code quality
2. **Test** - Runs Jest tests with coverage
3. **Build** - Builds the Next.js application

### 2. Deploy Pipeline (`deploy.yml`)

**Triggers:**
- Push to `main` branch
- Manual trigger via GitHub UI

**Jobs:**
1. **Pre-deploy Tests** - Runs tests before deployment
2. **Deploy to Vercel** - Deploys frontend to Vercel
3. **Deploy Socket Server** - Deploys Socket.IO server to Render

## Setup Instructions

### Prerequisites

1. GitHub repository with admin access
2. Vercel account (for frontend deployment)
3. Render account (for Socket server deployment)

### Required Secrets

Add these secrets in your GitHub repository settings (`Settings → Secrets and variables → Actions`):

#### Vercel Secrets
```
VERCEL_TOKEN=your-vercel-token
```

To get your Vercel token:
1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Copy the token value

#### Render Secrets (Optional)
```
RENDER_SERVICE_ID=your-render-service-id
RENDER_API_KEY=your-render-api-key
```

To get Render credentials:
1. Go to https://dashboard.render.com
2. Select your service
3. Find the service ID in the URL
4. Go to Account Settings → API Keys for the API key

### Environment Variables

Set these in Vercel project settings:

```
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.onrender.com
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Local Development

### Running Tests Locally

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests (CI mode)
npm run test:ci
```

### Running Lint Locally

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Type Checking

```bash
npm run type-check
```

## Pipeline Details

### Test Stage

- Runs all Jest tests
- Generates coverage report
- Uploads coverage to Codecov (optional)
- Fails pipeline if any test fails

### Build Stage

- Builds Next.js application
- Generates static export in `out/` directory
- Creates build artifacts for deployment

### Deploy Stage

- Deploys to Vercel (frontend)
- Deploys to Render (Socket server)
- Only runs on `main` branch
- Requires all tests to pass

## Troubleshooting

### Common Issues

#### 1. Tests Fail in CI

**Problem:** Tests pass locally but fail in CI.

**Solution:**
- Check for environment-specific code
- Ensure all mocks are properly set up
- Verify test dependencies are in `package.json`

#### 2. Build Fails

**Problem:** Build fails with missing dependencies.

**Solution:**
- Run `npm install` locally
- Commit `package-lock.json`
- Check for missing environment variables

#### 3. Deployment Fails

**Problem:** Vercel deployment fails.

**Solution:**
- Verify `VERCEL_TOKEN` is set correctly
- Check Vercel project settings
- Review deployment logs in Vercel dashboard

### Debugging

#### Check Workflow Runs

1. Go to GitHub repository → Actions tab
2. Click on the failed workflow
3. Expand the failed job
4. Review the error logs

#### Local Simulation

To simulate CI locally:

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Run tests
npm test -- --ci

# Build
npm run build
```

## Performance

### Caching

The pipeline uses npm caching to speed up builds:
- Node modules are cached based on `package-lock.json`
- Subsequent runs reuse cached dependencies

### Parallel Jobs

- Lint and Test run in parallel
- Build waits for both to complete
- Deploy waits for build to complete

## Best Practices

1. **Always create PRs** - Don't push directly to `main`
2. **Write tests** - Maintain high test coverage
3. **Keep dependencies updated** - Use Dependabot
4. **Review logs** - Check CI output before merging
5. **Use meaningful commit messages** - Helps debug issues

## Monitoring

### GitHub Actions

- Monitor workflow runs in the Actions tab
- Set up notifications for failed builds
- Review coverage reports regularly

### Vercel

- Monitor deployment status in Vercel dashboard
- Check function logs for errors
- Review performance metrics

## Future Improvements

- [ ] Add E2E tests with Playwright
- [ ] Implement canary deployments
- [ ] Add performance testing
- [ ] Set up automated dependency updates
- [ ] Add security scanning

---

*Last updated: 2026-07-17*
