import { initFlipbook } from './flipbook.js';
import { initAIGenerator } from './ai-generator.js';

initFlipbook(document.getElementById('drawCanvas').closest('.app'));
initAIGenerator();
