import * as THREE from 'three';
import { checkBrowser } from './utils.js';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (checkBrowser()) {
        console.log('Alking Portal: Initialized');
    }
});

