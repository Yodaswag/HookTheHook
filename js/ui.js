// ui.js - DOM-based UI: screens, surveys, modals.

import { toggleMute, getIsMuted, playChestOpenSound } from './audio.js';

let uiCallbacks = {};
let selectedEmoji = null;
let chestStartTimer = null;
let chestFrameTimer = null;
let cardRevealTimer = null;
let closeEnableTimer = null;

const CHEST_FRAME_COUNT = 25;
const CHEST_FRAME_COLUMNS = 5;
const CHEST_SOURCE_FRAME_SIZE = 256;
const CHEST_FRAME_MS = 32;
const CHEST_ANIMATION_START_DELAY_MS = 180;
const CHEST_CARD_REVEAL_DELAY_MS = CHEST_ANIMATION_START_DELAY_MS + ((CHEST_FRAME_COUNT - 1) * CHEST_FRAME_MS);
const CHEST_CLOSE_ENABLE_DELAY_MS = CHEST_CARD_REVEAL_DELAY_MS + 730;

export function initUI(callbacks) {
    uiCallbacks = callbacks;

    const muteBtn = document.getElementById('mute-btn');
    updateMuteButton(muteBtn, getIsMuted());

    muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const muted = toggleMute();
        updateMuteButton(muteBtn, muted);
    });

    document.getElementById('start-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (uiCallbacks.onStart) uiCallbacks.onStart();
    });

    document.getElementById('start-level-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        hideScreen('level-intro-screen');
        if (uiCallbacks.onStartLevel) uiCallbacks.onStartLevel();
    });

    initEmojiSelection();

    document.getElementById('submit-survey-1-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        hideScreen('survey-1-screen');
        if (uiCallbacks.onSubmitSurvey1) uiCallbacks.onSubmitSurvey1();
    });

    document.getElementById('close-card-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        clearChestAnimationTimers();
        hideScreen('animation-modal');
        if (uiCallbacks.onCloseCard) uiCallbacks.onCloseCard();
    });

    setupSingleEmojiRating('rating-1');
    setupSingleEmojiRating('rating-2');

    document.getElementById('submit-survey-2-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        hideScreen('survey-2-screen');
        if (uiCallbacks.onSubmitSurvey2) uiCallbacks.onSubmitSurvey2();
    });

    const speedBtn = document.getElementById('speed-btn');
    const speedPanel = document.getElementById('speed-panel');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');

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
        speedPanel.classList.toggle('hidden', isOpen);
        speedBtn.classList.toggle('is-active', !isOpen);
        speedBtn.setAttribute('aria-pressed', String(!isOpen));
    });

    speedSlider.addEventListener('input', (e) => {
        e.stopPropagation();
        const val = parseFloat(speedSlider.value);
        if (uiCallbacks.onSetSpeed) uiCallbacks.onSetSpeed(val);
        speedValue.textContent = 'x' + val.toFixed(1);
        updateSliderTrack(val);
    });
}

function initEmojiSelection() {
    const buttons = document.querySelectorAll('#emoji-container-1 .emoji-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const emoji = btn.dataset.emoji;
            buttons.forEach(item => item.classList.remove('selected'));
            selectedEmoji = emoji;
            btn.classList.add('selected');
            document.getElementById('selected-emojis-display').innerText = selectedEmoji;
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

export function showLevelIntro(level) {
    if (level === 2) {
        document.getElementById('level-intro-title').innerText = 'שלב 2: עקרונות ההוק';
        document.getElementById('level-intro-text').innerText = 'כעת נלמד על עקרונות ההוק. דוגו את כל תיבות המידע!';
    } else if (level === 3) {
        document.getElementById('level-intro-title').innerText = 'שלב 3: אתגר הידע';
        document.getElementById('level-intro-text').innerText = 'אספו את כל המשפטים הנכונים לגבי הוק. שימו לב לקרוא את התשובות בקפידה! כל טעות תוריד 100 נקודות.';
    }
    showScreen('level-intro-screen');
}

function clearChestAnimationTimers() {
    clearTimeout(chestStartTimer);
    clearInterval(chestFrameTimer);
    clearTimeout(cardRevealTimer);
    clearTimeout(closeEnableTimer);
    chestStartTimer = null;
    chestFrameTimer = null;
    cardRevealTimer = null;
    closeEnableTimer = null;
}

function setChestFrame(chestSprite, frameIndex) {
    const safeFrame = Math.max(0, Math.min(CHEST_FRAME_COUNT - 1, frameIndex));
    const column = safeFrame % CHEST_FRAME_COLUMNS;
    const row = Math.floor(safeFrame / CHEST_FRAME_COLUMNS);
    const displayFrameSize = chestSprite.clientWidth;
    const scale = displayFrameSize / CHEST_SOURCE_FRAME_SIZE;
    const sheetSize = CHEST_SOURCE_FRAME_SIZE * CHEST_FRAME_COLUMNS * scale;

    chestSprite.style.backgroundSize = `${sheetSize}px ${sheetSize}px`;
    chestSprite.style.backgroundPosition = `-${column * displayFrameSize}px -${row * displayFrameSize}px`;
}

function playChestSpriteAnimation(chestSprite) {
    let frameIndex = 0;
    setChestFrame(chestSprite, frameIndex);

    chestFrameTimer = window.setInterval(() => {
        frameIndex += 1;
        setChestFrame(chestSprite, frameIndex);

        if (frameIndex >= CHEST_FRAME_COUNT - 1) {
            clearInterval(chestFrameTimer);
            chestFrameTimer = null;
        }
    }, CHEST_FRAME_MS);
}

export function showChestAnimation(title, text) {
    playChestOpenSound();
    document.getElementById('card-title').innerText = title;
    document.getElementById('card-text').innerText = text;

    const chestSprite = document.getElementById('chest-sprite');
    const principleCard = document.getElementById('principle-card');
    clearChestAnimationTimers();
    setChestFrame(chestSprite, 0);
    principleCard.classList.remove('emerge');

    const closeBtn = document.getElementById('close-card-btn');
    closeBtn.disabled = true;

    showScreen('animation-modal');

    chestStartTimer = window.setTimeout(() => {
        playChestSpriteAnimation(chestSprite);
    }, CHEST_ANIMATION_START_DELAY_MS);

    cardRevealTimer = window.setTimeout(() => {
        principleCard.classList.add('emerge');
    }, CHEST_CARD_REVEAL_DELAY_MS);

    closeEnableTimer = window.setTimeout(() => {
        closeBtn.disabled = false;
    }, CHEST_CLOSE_ENABLE_DELAY_MS);
}
