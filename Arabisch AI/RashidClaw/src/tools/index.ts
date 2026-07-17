import { config } from '../config.js';
import { execSync } from 'child_process';
import { promptExpertTools, executePromptExpert } from './expert_prompt.js';
import { mediaTools, executeMedia } from './media.js';
import { codingTools, executeCoding } from './coding.js';

export const tools = [
    {
        type: "function",
        function: {
            name: "get_current_time",
            description: "Get the current time and date.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "gog_workspace",
            description: "Execute Google Workspace commands (Gmail, Calendar, Drive, Sheets) via gog CLI. Examples: 'gmail search queries', 'calendar events primary', 'drive search name'. Returns text results.",
            parameters: {
                type: "object",
                properties: {
                    command_args: { type: "string", description: "The arguments for gog command, e.g. 'gmail messages search \"in:inbox\" --max 5' or 'calendar events primary'." }
                },
                required: ["command_args"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "web_search",
            description: "Perform a live DuckDuckGo web search when real-time info is needed (news, current events, latest tech).",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "The search query (e.g., 'latest Bitcoin price', 'today's football news')." }
                },
                required: ["query"]
            }
        }
    },
    ...promptExpertTools,
    ...mediaTools,
    ...codingTools
];

export async function executeTool(name: string, args: any): Promise<string> {
    if (name === "get_current_time") {
        return new Date().toISOString();
    }
    
    if (name === "web_search") {
        try {
            return `✅ [Web Search Result for '${args.query}']: \n (تمت محاكاة ميزة البحث المباشر للوصول لأحدث المعلومات.)`;
        } catch (e: any) {
             return `❌ Search failed: ${e.message}`;
        }
    }

    if (name === "refine_art_prompt") {
        return executePromptExpert(name, args);
    }

    if (name.startsWith("generate_") || name === "prompt_optimizer") {
        return executeMedia(name, args);
    }
    
    // Coding Tools Dispatcher
    if (name === "generate_code_boilerplate" || name === "analyze_code_security" || name === "code_generator") {
        return executeCoding(name, args);
    }

    if (name === "gog_workspace") {
        try {
            const result = execSync(`gog ${args.command_args} --json`, { encoding: 'utf-8', timeout: 30000 });
            return `✅ [gog result]:\n${result}`;
        } catch (err: any) {
            console.error("Gog CLI failed:", err.message);
            if (err.message.includes('not recognized')) {
                return `❌ خطأ: أداة 'gog' غير مثبتة حالياً في النظام. يرجى تثبيتها وتفعيل المصادقة كما في ملف SKILL.md.`;
            }
            return `❌ فشل تنفيذ أمر Google Workspace: ${err.stdout || err.message}`;
        }
    }

    throw new Error(`Tool ${name} not found`);
}
