---
title: AI SDK DevTools
description: Debug AI SDK calls by inspecting captured runs and steps.
---

# AI SDK DevTools

## Setup

```ts
import { wrapLanguageModel, gateway } from 'ai';
import { devToolsMiddleware } from '@ai-sdk/devtools';

const model = wrapLanguageModel({
  model: gateway('anthropic/claude-sonnet-4.5'),
  middleware: devToolsMiddleware(),
});
```

## Viewing Captured Data

All runs and steps are saved to `.devtools/generations.json`.

Launch the web UI:

```bash
npx @ai-sdk/devtools
# Open http://localhost:4983
```
