// =============================================================================
// KING2 AI — Tools Registry
// =============================================================================
// - Centralised tool registration & lookup
// - Input validation before execution
// - Timeout support per tool
// - Lazy initialisation
// =============================================================================

import { ToolDefinition, ToolParameter } from '@/lib/agents/types';
import { webSearchTool } from './web-search';
import { calculatorTool } from './calculator';
import { imageGenTool } from './image-gen';
import { fileReaderTool } from './file-reader';
import { pdfParserTool } from './pdf-parser';
import { codeInterpreterTool } from './code-interpreter';

// ── Store ────────────────────────────────────────────────────────────

const tools = new Map<string, ToolDefinition>();
let initialized = false;

// ── Validation ───────────────────────────────────────────────────────

function validateTool(tool: ToolDefinition): void {
  if (!tool.name || typeof tool.name !== 'string') {
    throw new Error('Tool must have a valid string name');
  }
  if (!tool.description || typeof tool.description !== 'string') {
    throw new Error(`Tool "${tool.name}" must have a description`);
  }
  if (!Array.isArray(tool.parameters)) {
    throw new Error(`Tool "${tool.name}" must have a parameters array`);
  }
  if (typeof tool.execute !== 'function') {
    throw new Error(`Tool "${tool.name}" must have an execute function`);
  }

  for (const param of tool.parameters) {
    if (!param.name || typeof param.name !== 'string') {
      throw new Error(`Tool "${tool.name}" has a parameter without a name`);
    }
    if (!['string', 'number', 'boolean'].includes(param.type)) {
      throw new Error(
        `Tool "${tool.name}" parameter "${param.name}" has invalid type "${param.type}"`
      );
    }
  }
}

function validateArgs(tool: ToolDefinition, args: Record<string, any>): string | null {
  for (const param of tool.parameters) {
    if (param.required) {
      const value = args[param.name];
      if (value === undefined || value === null || value === '') {
        return `المدخل "${param.name}" مطلوب للأداة "${tool.name}"`;
      }
    }
  }
  return null;
}

// ── API ──────────────────────────────────────────────────────────────

export function registerTool(tool: ToolDefinition): void {
  validateTool(tool);

  if (tools.has(tool.name)) {
    console.warn(`[Registry] Overwriting existing tool: ${tool.name}`);
  }

  tools.set(tool.name, tool);
}

export function getTool(name: string): ToolDefinition | undefined {
  return tools.get(name);
}

export function getAllTools(): ToolDefinition[] {
  return Array.from(tools.values());
}

/**
 * Returns tool definitions formatted for LLM function calling
 */
export function getToolDefinitionsForLLM() {
  return getAllTools().map((t) => ({
    name: t.name,
    description: t.description,
    parameters: {
      type: 'object',
      properties: Object.fromEntries(
        t.parameters.map((p: ToolParameter) => [
          p.name,
          { type: p.type, description: p.description },
        ])
      ),
      required: t.parameters.filter((p) => p.required).map((p) => p.name),
    },
  }));
}

/**
 * Execute a tool by name with the given arguments.
 * Includes timeout and input validation.
 */
export async function executeTool(
  name: string,
  args: Record<string, any>,
  timeoutMs?: number
): Promise<string> {
  const tool = getTool(name);
  if (!tool) {
    throw new Error(`الأداة "${name}" غير موجودة`);
  }

  // Validate required args
  const validationError = validateArgs(tool, args);
  if (validationError) {
    return validationError;
  }

  // Execute with optional timeout
  const effectiveTimeout = timeoutMs ?? tool.timeout ?? 30_000;

  try {
    const result = await Promise.race([
      tool.execute(args),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`انتهت مهلة الأداة "${name}" بعد ${effectiveTimeout}ms`)),
          effectiveTimeout
        )
      ),
    ]);
    return result;
  } catch (error: any) {
    const message = error.message || 'خطأ غير معروف';
    return `⚠️ خطأ في تنفيذ "${name}": ${message}`;
  }
}

/**
 * Execute multiple independent tools in parallel
 */
export async function executeToolsParallel(
  executions: { name: string; args: Record<string, any> }[],
  timeoutMs?: number
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  const promises = executions.map(async ({ name, args }) => {
    const result = await executeTool(name, args, timeoutMs);
    results.set(name, result);
  });

  await Promise.allSettled(promises);
  return results;
}

// ── Initialisation ───────────────────────────────────────────────────

export function initializeTools(): void {
  if (initialized) return;

  registerTool(webSearchTool);
  registerTool(calculatorTool);
  registerTool(imageGenTool);
  registerTool(fileReaderTool);
  registerTool(pdfParserTool);
  registerTool(codeInterpreterTool);

  initialized = true;
  console.log(`[Registry] Initialised ${tools.size} tools`);
}
