// ui.js — DOM-based UI: screens, surveys, modals

import { toggleMute, getIsMuted, playChestOpenSound } from './audio.js';

let uiCallbacks = {};

/**
 * Initialize all UI event listeners.
 * @param {Object} callbacks - { onStart, onStartLevel, onSubmitSurvey1, onCloseCard, onSubmitSurvey2, onSetSpeed }
 */
export function initUI(callbacks) {
    uiCallbacks = callbacks;

    // Mute button
    const muteBtn = document.getElementById('mute-btn');
    updateMuteButton(muteBtn, getIsMuted());

    muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const muted = toggleMute();
        updateMuteButton(muteBtn, muted);
    });

    // Start button
    document.getElementById('start-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (uiCallbacks.onStart) uiCallbacks.onStart();
    });

    // Level intro continue button
    document.getElementById('start-level-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        hideScreen('level-intro-screen');
        if (uiCallbacks.onStartLevel) uiCallbacks.onStartLevel();
    });

    // Survey 1 emoji selection
    initEmojiSelection();

    // Survey 1 submit
    document.getElementById('submit-survey-1-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        hideScreen('survey-1-screen');
        if (uiCallbacks.onSubmitSurvey1) uiCallbacks.onSubmitSurvey1();
    });

    // Card close button (level 2 animation)
    document.getElementById('close-card-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        hideScreen('animation-modal');
        if (uiCallbacks.onCloseCard) uiCallbacks.onCloseCard();
    });

    // Survey 2 emoji ratings
    setupSingleEmojiRating('rating-1');
    setupSingleEmojiRating('rating-2');

    // Survey 2 submit
    document.getElementById('submit-survey-2-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        hideScreen('survey-2-screen');
        if (uiCallbacks.onSubmitSurvey2) uiCallbacks.onSubmitSurvey2();
    });

    // Speed button + panel
    const speedBtn    = document.getElementById('speed-btn');
    const speedPanel  = document.getElementById('speed-panel');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue  = document.getElementById('speed-value');

    function updateSliderTrack(val) {
        const min = parseFloat(speedSlider.min);
        const max = parseFloat(speedSlider.max);
        const pct = ((val - min) / (max - min) * 100).toFixed(1) + '%';
        speedSlider.style.setProperty('--pct', pct);
    }
    updateSliderTrack(parseFloat(speedSlider.value));

    speedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = !speedPanel.classList.contains('hidden');
        if (isOpen) {
            speedPanel.classList.add('hidden');
            speedBtn.classList.remove('is-active');
            speedBtn.setAttribute('aria-pressed', 'false');
        } else {
            speedPanel.classList.remove('hidden');
            speedBtn.classList.add('is-active');
            speedBtn.setAttribute('aria-pressed', 'true');
        }
    });

    speedSlider.addEventListener('input', (e) => {
        e.stopPropagation();
        const val = parseFloat(speedSlider.value);
        if (uiCallbacks.onSetSpeed) uiCallbacks.onSetSpeed(val);
        speedValue.textContent = '\u00d7' + val.toFixed(1);
        updateSliderTrack(val);
    });
}

// --- Emoji Selection (Survey 1) ---
let selectedEmojis = [];

function initEmojiSelection() {
    document.querySelectorAll('#emoji-container-1 .emoji-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const emoji = btn.dataset.emoji;
            if (selectedEmojis.includes(emoji)) {
                selectedEmojis = selectedEmojis.filter(em => em !== emoji);
                btn.classList.remove('selected');
            } else {
                selectedEmojis.push(emoji);
                btn.classList.add('selected');
            }
            document.getElementById('selected-emojis-display').innerText = selectedEmojis.join(' ');
        });
    });
}

function updateMuteButton(button, muted) {
    const label = muted ? 'הפעל סאונד' : 'השתק סאונד';
    button.classList.toggle('is-muted', muted);
    button.title = label;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(muted));
}

function setupSingleEmojiRating(containerId) {
    const container = document.getElementById(containerId);
    const emojis = container.querySelectorAll('.single-emoji');
    emojis.forEach(emoji => {
        emoji.addEventListener('click', (e) => {
            e.stopPropagation();
            emojis.forEach(s => s.classList.remove('selected'));
            emoji.classList.add('selected');
        });
    });
}

// --- Screen visibility helpers ---

export function showScreen(id) {
    document.getElementById(id).classList.remove('hidden');
}

export function hideScreen(id) {
    document.getElementById(id).classList.add('hidden');
}

export function showGameUI() {
    document.getElementById('game-ui').classList.remove('hidden');
}

export function hideGameUI() {
    document.getElementById('game-ui').classList.add('hidden');
}

export function updateLevelDisplay(text) {
    document.getElementById('level-display').innerText = text;
}

export function updateMessageDisplay(text) {
    document.getElementById('message-display').innerText = text;
}

export function updateScoreDisplay(score) {
    document.getElementById('score-display').innerText = `נקודות: ${score}`;
}

export function flashMessageError() {
    const msg = document.getElementById('message-display');
    msg.classList.add('msg-error');
    setTimeout(() => msg.classList.remove('msg-error'), 2500);
}

/**
 * Show the level intro screen with appropriate text.
 */
export function showLevelIntro(level) {
    if (level === 2) {
        document.getElementById('level-intro-title').innerText = "שלב 2: עקרונות ההוק";
        document.getElementById('level-intro-text').innerText = "כעת נלמד על עקרונות ההוק. דוגו את כל תיבות המידע!";
    } else if (level === 3) {
        document.getElementById('level-intro-title').innerText = "שלב 3: אתגר הידע";
        document.getElementById('level-intro-text').innerText = "אספו את כל המשפטים הנכונים לגבי הוק. שימו לב לקרוא את התשובות בקפידה! כל טעות תוריד 100 נקודות.";
    }
    showScreen('level-intro-screen');
}

/**
 * Show the chest-open animation for level 2 (principle card).
 */
export function showChestAnimation(title, text) {
    playChestOpenSound();
    document.getElementById('card-title').innerText = title;
    document.getElementById('card-text').innerText = text;

    document.getElementById('chest-lid').classList.remove('open');
    document.getElementById('principle-card').classList.remove('emerge');

    const closeBtn = document.getElementById('close-card-btn');
    closeBtn.disabled = true;

    showScreen('animation-modal');

    setTimeout(() => {
        document.getElementById('chest-lid').classList.add('open');
        setTimeout(() => {
            document.getElementById('principle-card').classList.add('emerge');
            setTimeout(() => { closeBtn.disabled = false; }, 750);
        }, 300);
    }, 500);
}
