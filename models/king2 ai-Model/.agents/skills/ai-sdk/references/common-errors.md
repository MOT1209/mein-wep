---
title: Common Errors
description: Reference for common AI SDK errors and how to resolve them.
---

# Common Errors

## `maxTokens` → `maxOutputTokens`

```typescript
// ❌ Incorrect
const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  maxTokens: 512,
  prompt: 'Write a short story',
});

// ✅ Correct
const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  maxOutputTokens: 512,
  prompt: 'Write a short story',
});
```

## `maxSteps` → `stopWhen: isStepCount(n)`

```typescript
// ❌ Incorrect
const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  tools: { weather },
  maxSteps: 5,
  prompt: 'What is the weather in NYC?',
});

// ✅ Correct
import { generateText, isStepCount } from 'ai';

const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  tools: { weather },
  stopWhen: isStepCount(5),
  prompt: 'What is the weather in NYC?',
});
```

## `parameters` → `inputSchema` (in tool definition)

```typescript
// ❌ Incorrect
const weatherTool = tool({
  description: 'Get weather for a location',
  parameters: z.object({
    location: z.string(),
  }),
  execute: async ({ location }) => ({ location, temp: 72 }),
});

// ✅ Correct
const weatherTool = tool({
  description: 'Get weather for a location',
  inputSchema: z.object({
    location: z.string(),
  }),
  execute: async ({ location }) => ({ location, temp: 72 }),
});
```

## `generateObject` → `generateText` with `output`

`generateObject` is deprecated. Use `generateText` with the `output` option instead.

```typescript
// ❌ Deprecated
import { generateObject } from 'ai';

const result = await generateObject({
  model: 'anthropic/claude-opus-4.5',
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a recipe for chocolate cake',
});

// ✅ Correct
import { generateText, Output } from 'ai';

const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  output: Output.object({
    schema: z.object({
      recipe: z.object({
        name: z.string(),
        ingredients: z.array(z.string()),
      }),
    }),
  }),
  prompt: 'Generate a recipe for chocolate cake',
});

console.log(result.output);
```

## `toDataStreamResponse` → `toUIMessageStreamResponse`

```typescript
// ❌ Incorrect (when using useChat)
const result = streamText({});
return result.toDataStreamResponse();

// ✅ Correct
const result = streamText({});
return result.toUIMessageStreamResponse();
```

## Removed managed input state in `useChat`

```tsx
// ❌ Deprecated
import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  return (
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={handleInputChange} />
    </form>
  );
}

// ✅ Correct
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

export default function Page() {
  const [input, setInput] = useState('');
  const { sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const handleSubmit = e => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={e => setInput(e.target.value)} />
    </form>
  );
}
```

## `tool-invocation` → `tool-{toolName}`

```tsx
// ❌ Incorrect
message.parts.map((part, i) => {
  switch (part.type) {
    case 'text':
      return <div key={i}>{part.text}</div>;
    case 'tool-invocation':
      return <pre>{JSON.stringify(part.toolInvocation, null, 2)}</pre>;
  }
});

// ✅ Correct
message.parts.map(part => {
  switch (part.type) {
    case 'text':
      return part.text;
    case 'tool-weather':
      // typed tool part
      break;
  }
});
```

## Tool invocation states renamed

```tsx
// ❌ Incorrect
switch (part.toolInvocation.state) {
  case 'partial-call':
  case 'call':
  case 'result':
}

// ✅ Correct
switch (part.state) {
  case 'input-streaming':
  case 'input-available':
  case 'output-available':
}
```

## `addToolResult` → `addToolOutput`

```tsx
// ❌ Incorrect
addToolResult({ toolCallId: '...', result: 'Yes' });

// ✅ Correct
addToolOutput({ tool: 'askForConfirmation', toolCallId: '...', output: 'Yes' });
```

## `messages` → `uiMessages` in `createAgentUIStreamResponse`

```typescript
// ❌ Incorrect
return createAgentUIStreamResponse({ agent: myAgent, messages });

// ✅ Correct
return createAgentUIStreamResponse({ agent: myAgent, uiMessages: messages });
```
