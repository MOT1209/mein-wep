import { initFlipbook } from './flipbook.js';
import { initAIGenerator } from './ai-generator.js';
import { initAIAgent } from './ai-agent.js';

initFlipbook(document.getElementById('drawCanvas').closest('.app'));
initAIGenerator();
initAIAgent();
