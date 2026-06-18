---
title: Type-Safe useChat with Agents
description: Build end-to-end type-safe agents by inferring UIMessage types from your agent definition.
---

# Type-Safe useChat with Agents

## Recommended Structure

```
lib/
  agents/
    my-agent.ts
  tools/
    weather-tool.ts
```

## Define Agent and Export Type

```ts
import { ToolLoopAgent, InferAgentUIMessage } from 'ai';

export const myAgent = new ToolLoopAgent({
  model: 'anthropic/claude-sonnet-4',
  instructions: 'You are a helpful assistant.',
  tools: { weather: weatherTool },
});

export type MyAgentUIMessage = InferAgentUIMessage<typeof myAgent>;
```

## Use with `useChat`

```tsx
import { useChat } from '@ai-sdk/react';
import type { MyAgentUIMessage } from '@/lib/agents/my-agent';

export function Chat() {
  const { messages } = useChat<MyAgentUIMessage>();
  // ...
}
```

## Rendering Parts with Type Safety

```tsx
function Message({ message }: { message: MyAgentUIMessage }) {
  return (
    <div>
      {message.parts.map((part, i) => {
        switch (part.type) {
          case 'text':
            return <p key={i}>{part.text}</p>;
          case 'tool-weather':
            if (part.state === 'output-available') {
              return <div>Weather: {part.output.temperature}F</div>;
            }
            return <div>Loading...</div>;
          default:
            return null;
        }
      })}
    </div>
  );
}
```
