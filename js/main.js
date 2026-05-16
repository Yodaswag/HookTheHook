// main.js — Entry point: wires all modules together

import { initCanvas } from './canvas.js';
import { initAudio } from './audio.js';
import { initInput } from './input.js';
import { initUI } from './ui.js';
import * as game from './game.js';
import { waitForVisualAssets } from './renderer.js';

// Initialize canvas scaling
initCanvas('gameCanvas');

// Wire input to game
initInput((e) => {
    game.handleDrop(e);
});

// Wire UI callbacks to game
initUI({
    onStart: () => {
        initAudio();
        game.start();
    },
    onStartLevel: () => {
        game.startCurrentLevel();
    },
    onSubmitSurvey1: () => {
        game.onSubmitSurvey1();
    },
    onCloseCard: () => {
        game.onCloseCard();
    },
    onSubmitSurvey2: () => {
        game.onSubmitSurvey2();
    },
    onSetSpeed: (val) => {
        game.setGameSpeed(val);
    }
});

waitForVisualAssets().then(() => {
    game.renderCurrentFrame();
});
