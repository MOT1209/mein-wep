---
title: Vercel AI Gateway
description: Reference for using Vercel AI Gateway with the AI SDK.
---

# Vercel AI Gateway

The Vercel AI Gateway is the fastest way to get started with the AI SDK. It provides access to models from OpenAI, Anthropic, Google, and other providers through a single API.

## Authentication

Authenticate with OIDC (for Vercel deployments) or an AI Gateway API key:

```env filename=".env.local"
AI_GATEWAY_API_KEY=your_api_key_here
```

## Usage

The AI Gateway is the default global provider, so you can access models using a simple string:

```ts
import { generateText } from 'ai';

const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4.5',
  prompt: 'What is love?',
});
```

You can also explicitly import and use the gateway provider:

```ts
import { gateway } from 'ai';
model: gateway('anthropic/claude-sonnet-4.5');
```

## Find Available Models

Always fetch the current model list before writing code.

```bash
curl -s https://ai-gateway.vercel.sh/v1/models | jq -r '[.data[] | select(.id | startswith("anthropic/")) | .id] | reverse | .[]'
```
