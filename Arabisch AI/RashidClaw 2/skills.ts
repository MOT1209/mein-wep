export const skills = [
  {
    name: "get_current_time",
    description: "Get current system time",
    execute: async () => {
      return new Date().toISOString();
    }
  },

  {
    name: "generate_image",
    description: "Generate image from prompt",
    execute: async (prompt: string) => {
      // call Pixazo or SD
      return `Image generated for: ${prompt}`;
    }
  },

  {
    name: "generate_video",
    description: "Generate video from prompt",
    execute: async (prompt: string) => {
      return `Video generated for: ${prompt}`;
    }
  },

  {
    name: "prompt_optimizer",
    description: "Improve prompts professionally",
    execute: async (input: string) => {
      return `Cinematic ultra detailed prompt: ${input}`;
    }
  },

  {
    name: "code_generator",
    description: "Generate or fix code",
    execute: async (input: string) => {
      return `Generated code for: ${input}`;
    }
  },

  {
    name: "google_search",
    description: "Search real info",
    execute: async (query: string) => {
      return `Search results for: ${query}`;
    }
  }
];
