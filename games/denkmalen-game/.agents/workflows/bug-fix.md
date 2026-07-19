# Workflow: Bug Fix

## Overview
Structured workflow for diagnosing and fixing bugs.

## Phases

### Phase 1: Triage (30 min)
```
Agent: project-manager
Task: Classify bug severity
Output: Priority (P0-P3)

Agent: testing-qa
Task: Reproduce bug
Output: Reproduction steps

Agent: analytics
Task: Check impact metrics
Output: Affected users report
```

### Phase 2: Diagnosis (1-2 hours)
```
Agent: architect
Task: Identify root cause
Output: Root cause analysis

Agent: security
Task: Check if security issue
Output: Security assessment

Agent: performance
Task: Check if performance issue
Output: Performance analysis
```

### Phase 3: Fix (1-3 hours)
```
Agent: [domain agent]
Task: Implement fix
Output: Code changes

Agent: testing-qa
Task: Write regression test
Output: Test case

Agent: architect
Task: Code review
Output: Review approval
```

### Phase 4: Verify (1 hour)
```
Agent: testing-qa
Task: Run full test suite
Output: All tests pass

Agent: performance
Task: Verify no regression
Output: Performance OK

Agent: security
Task: Security re-check
Output: No new vulnerabilities
```

### Phase 5: Deploy (30 min)
```
Agent: devops
Task: Deploy fix
Output: Live fix

Agent: docs
Task: Update changelog
Output: Release note
```

## Bug Severity
```
P0 (Critical): Game broken, data loss, security
  → Fix within 1 hour
  → All hands on deck

P1 (High): Major feature broken
  → Fix within 4 hours
  → Assigned agent priority

P2 (Medium): Minor feature broken
  → Fix within 24 hours
  → Normal workflow

P3 (Low): Cosmetic, minor inconvenience
  → Fix in next release
  → Backlog
```

## Checklist
- [ ] Bug reproduced
- [ ] Root cause identified
- [ ] Security impact assessed
- [ ] Fix implemented
- [ ] Regression test added
- [ ] Code reviewed
- [ ] All tests passing
- [ ] No performance regression
- [ ] Deployed to production
- [ ] Changelog updated
- [ ] User notified (if P0/P1)

## Estimated Time: 3-7 hours
