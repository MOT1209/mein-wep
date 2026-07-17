import { skills } from './skills';

interface AgentResponse {
  thought: string;
  action: string;
  input: string;
  final_answer: string;
}

export class RashidClawAgent {
  private maxIterations = 5;

  async run(prompt: string, llm: (prompt: string) => Promise<AgentResponse>) {
    let currentPrompt = prompt;

    for (let i = 0; i < this.maxIterations; i++) {
      const response = await llm(currentPrompt);

      if (response.action !== "none") {
        const tool = skills.find(s => s.name === response.action);
        if (tool) {
          const result = await tool.execute(response.input);
          // Append the tool result back to the prompt for the next iteration
          currentPrompt += `\nTool result (${response.action}): ${result}`;
        } else {
          return `Error: Unknown tool ${response.action}`;
        }
      } else {
        return response.final_answer;
      }
    }

    return "Max iterations reached without a final answer.";
  }
}
