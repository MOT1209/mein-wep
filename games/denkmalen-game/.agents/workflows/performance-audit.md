# Workflow: Performance Audit

## Overview
Comprehensive performance audit and optimization workflow.

## Phases

### Phase 1: Measurement (1-2 hours)
```
Agent: performance
Task: Run Lighthouse audit
Output: Baseline metrics

Task: Profile React renders
Output: Component render times

Task: Analyze bundle size
Output: Bundle breakdown

Agent: analytics
Task: Collect real-user metrics
Output: RUM data
```

### Phase 2: Analysis (1-2 hours)
```
Agent: performance
Task: Identify bottlenecks
Output: Bottleneck list

Task: Analyze network requests
Output: Request waterfall

Task: Check image optimization
Output: Image audit

Agent: frontend
Task: Identify unnecessary re-renders
Output: Render optimization list
```

### Phase 3: Optimization (4-8 hours)
```
Agent: performance
Task: Implement code splitting
Output: Lazy loaded routes

Task: Optimize images
Output: Compressed images

Task: Implement caching
Output: Cache headers

Agent: frontend
Task: Memoize expensive components
Output: Memoized components

Task: Optimize state updates
Output: Reduced re-renders

Agent: backend
Task: Optimize API responses
Output: Compressed payloads
```

### Phase 4: Validation (1-2 hours)
```
Agent: performance
Task: Re-run Lighthouse
Output: Improved metrics

Task: Verify no regressions
Output: Comparison report

Agent: testing-qa
Task: Run full test suite
Output: All tests pass
```

## Performance Targets
```
Before → After:
├── LCP: 3.5s → 2.5s
├── FID: 50ms → 30ms
├── CLS: 0.05 → 0.02
├── Bundle: 350KB → 200KB
├── TTI: 4s → 3s
└── Lighthouse: 65 → 90
```

## Checklist
- [ ] Baseline metrics collected
- [ ] Bottlenecks identified
- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Caching configured
- [ ] Re-renders reduced
- [ ] Bundle size reduced
- [ ] Target metrics achieved
- [ ] No test regressions
- [ ] Documentation updated

## Estimated Time: 7-14 hours
