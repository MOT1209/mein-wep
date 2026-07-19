# Workflow: Release

## Overview
End-to-end release workflow for Denkmalen.

## Phases

### Phase 1: Pre-Release (2-4 hours)
```
Agent: testing-qa
Task: Run full test suite
Output: All tests passing

Agent: security
Task: Security audit
Output: No vulnerabilities

Agent: performance
Task: Performance check
Output: Metrics acceptable

Agent: i18n-a11y
Task: Translation audit
Output: All translations complete
```

### Phase 2: Code Freeze (1 hour)
```
Agent: architect
Task: Code review all changes
Output: All PRs approved

Agent: project-manager
Task: Verify all tasks complete
Output: Release checklist complete

Agent: docs
Task: Update changelog
Output: Release notes ready
```

### Phase 3: Deployment (1-2 hours)
```
Agent: devops
Task: Create release branch
Output: release/v1.x.x

Task: Deploy to staging
Output: Staging live

Agent: testing-qa
Task: Smoke test staging
Output: Staging verified

Agent: devops
Task: Deploy to production
Output: Production live
```

### Phase 4: Post-Release (1-2 hours)
```
Agent: analytics
Task: Monitor error rates
Output: No spikes

Agent: performance
Task: Monitor Core Web Vitals
Output: Metrics stable

Agent: project-manager
Task: Announce release
Output: Release communicated

Agent: docs
Task: Update documentation
Output: Docs current
```

## Release Checklist
```
Pre-Release:
- [ ] All P0/P1 bugs fixed
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Security audit passed
- [ ] Performance acceptable
- [ ] Translations complete (EN/AR/DE)
- [ ] Documentation updated
- [ ] Changelog written

Deployment:
- [ ] Release branch created
- [ ] Version bumped
- [ ] Staging deployed
- [ ] Staging tested
- [ ] Production deployed
- [ ] DNS updated (if needed)
- [ ] SSL verified

Post-Release:
- [ ] Error monitoring active
- [ ] Performance monitoring active
- [ ] User feedback monitored
- [ ] Rollback plan ready
- [ ] Release announced
```

## Versioning
```
Major (X.0.0): Breaking changes
Minor (0.X.0): New features
Patch (0.0.X): Bug fixes

Current: v1.0.0
Next: v1.1.0 (if new features) or v1.0.1 (if bug fixes)
```

## Estimated Time: 5-9 hours
