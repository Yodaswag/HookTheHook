# Audio Icon And Emoji Rendering Fix Plan

## Root Cause

The current UI depends on platform-rendered emoji glyphs:

- `index.html` line 15 uses `🔊` inside the mute button.
- `index.html` lines 46-50, 83-87, and 94-98 use emoji text for survey choices.
- `js/ui.js` line 18 swaps the mute button text between emoji glyphs.
- `css/styles.css` lines 226-240 applies `filter: grayscale(100%)` to `.emoji-btn`, so even color emoji are intentionally forced toward black/white until hover or selection.

That makes the result browser/font dependent. On Windows or some browser contexts, emoji can render as monochrome glyphs. The safest fix is to stop using emoji as UI assets.

## Pass 1: Fix The Sound Toggle Icon Only

Goal: replace the sound emoji with inline SVG icons and keep the existing audio behavior unchanged.

### 1. Replace The Mute Button In `index.html`

Find:

```html
<button id="mute-btn" title="השתק סאונד">🔊</button>
```

Replace with:

```html
<button id="mute-btn" type="button" title="השתק סאונד" aria-label="השתק סאונד" aria-pressed="false">
    <svg class="sound-icon sound-icon-on" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 9v6h4l5 4V5L7 9H3z"></path>
        <path d="M16 8.5a5 5 0 0 1 0 7"></path>
        <path d="M18.5 6a8 8 0 0 1 0 12"></path>
    </svg>
    <svg class="sound-icon sound-icon-off" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 9v6h4l5 4V5L7 9H3z"></path>
        <path d="M17 9l5 5"></path>
        <path d="M22 9l-5 5"></path>
    </svg>
</button>
```

### 2. Extend The Mute Button CSS In `css/styles.css`

Keep the existing `#mute-btn` block, but change `font-size` to `color` and add icon rules below it.

Inside `#mute-btn`, replace:

```css
font-size: 24px;
```

With:

```css
color: #0f172a;
```

Then add this after the `#mute-btn:hover` block:

```css
.sound-icon {
    width: 26px;
    height: 26px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.sound-icon path:first-child {
    fill: currentColor;
    stroke: none;
}

.sound-icon-off {
    display: none;
}

#mute-btn.is-muted {
    color: #b91c1c;
}

#mute-btn.is-muted .sound-icon-on {
    display: none;
}

#mute-btn.is-muted .sound-icon-off {
    display: block;
}
```

### 3. Update The Mute Button Logic In `js/ui.js`

Find the mute button section in `initUI`:

```js
// Mute button
document.getElementById('mute-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const muted = toggleMute();
    document.getElementById('mute-btn').innerText = muted ? '🔇' : '🔊';
});
```

Replace it with:

```js
// Mute button
const muteBtn = document.getElementById('mute-btn');
updateMuteButton(muteBtn, getIsMuted());

muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const muted = toggleMute();
    updateMuteButton(muteBtn, muted);
});
```

Then add this helper after `initUI`:

```js
function updateMuteButton(button, muted) {
    const label = muted ? 'הפעל סאונד' : 'השתק סאונד';
    button.classList.toggle('is-muted', muted);
    button.title = label;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(muted));
}
```

### 4. Test Pass 1

Run the game and verify:

- The button shows a drawn speaker icon, not an emoji.
- Clicking the button switches to a red muted icon.
- Clicking again switches back to the normal speaker icon.
- Cast/catch/reel sounds still play when unmuted.
- No console errors appear after clicking the mute button.

## Pass 2: Stop Using Emoji Glyphs For Survey Faces

Goal: make the face ratings colorful and consistent without relying on browser emoji fonts.

Recommended approach: replace each emoji with a small CSS face component. It keeps the current DOM flow and click logic, because the `.emoji-btn`, `data-emoji`, `single-emoji`, and `data-val` attributes can remain.

### 1. Replace Survey 1 Face Text In `index.html`

Find:

```html
<span class="emoji-btn" data-emoji="🤩">🤩</span>
<span class="emoji-btn" data-emoji="😊">😊</span>
<span class="emoji-btn" data-emoji="🤔">🤔</span>
<span class="emoji-btn" data-emoji="😕">😕</span>
<span class="emoji-btn" data-emoji="😴">😴</span>
```

Replace with:

```html
<span class="emoji-btn face-choice face-excited" data-emoji="excited" aria-label="מתרגש"></span>
<span class="emoji-btn face-choice face-happy" data-emoji="happy" aria-label="שמח"></span>
<span class="emoji-btn face-choice face-thinking" data-emoji="thinking" aria-label="חושב"></span>
<span class="emoji-btn face-choice face-unsure" data-emoji="unsure" aria-label="לא בטוח"></span>
<span class="emoji-btn face-choice face-sleepy" data-emoji="sleepy" aria-label="ישנוני"></span>
```

### 2. Replace Both Final Rating Rows

In both `rating-1` and `rating-2`, replace the five emoji spans with:

```html
<span class="emoji-btn single-emoji face-choice face-excited" data-val="1" aria-label="מאוד נהניתי"></span>
<span class="emoji-btn single-emoji face-choice face-happy" data-val="2" aria-label="נהניתי"></span>
<span class="emoji-btn single-emoji face-choice face-neutral" data-val="3" aria-label="נייטרלי"></span>
<span class="emoji-btn single-emoji face-choice face-unsure" data-val="4" aria-label="פחות נהניתי"></span>
<span class="emoji-btn single-emoji face-choice face-angry" data-val="5" aria-label="לא נהניתי"></span>
```

### 3. Replace The Emoji Button CSS

In `css/styles.css`, replace the existing `.emoji-btn`, `.emoji-btn:hover`, and `.emoji-btn.selected` blocks with:

```css
.emoji-btn {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.emoji-btn:hover {
    transform: scale(1.12);
}

.emoji-btn.selected {
    transform: scale(1.08);
    box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.45);
}
```

Then add:

```css
.face-choice {
    position: relative;
    width: 52px;
    height: 52px;
    display: inline-flex;
    border-radius: 50%;
    background: #facc15;
    border: 3px solid #f59e0b;
    box-shadow: inset 0 -5px 0 rgba(0, 0, 0, 0.12);
}

.face-choice::before,
.face-choice::after {
    content: "";
    position: absolute;
}

.face-choice::before {
    left: 13px;
    top: 16px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #1f2937;
    box-shadow: 18px 0 0 #1f2937;
}

.face-choice::after {
    left: 16px;
    top: 31px;
    width: 20px;
    height: 9px;
    border: 3px solid #1f2937;
    border-top: 0;
    border-radius: 0 0 18px 18px;
}

.face-excited {
    background: #fde047;
}

.face-excited::before {
    width: 7px;
    height: 7px;
    background: #7c2d12;
    box-shadow: 18px 0 0 #7c2d12;
}

.face-happy {
    background: #facc15;
}

.face-neutral::after {
    top: 34px;
    height: 0;
    border: 0;
    border-top: 3px solid #1f2937;
    border-radius: 0;
}

.face-thinking {
    background: #fde68a;
}

.face-thinking::before {
    top: 17px;
}

.face-thinking::after {
    left: 18px;
    top: 33px;
    width: 16px;
    height: 0;
    border: 0;
    border-top: 3px solid #1f2937;
    border-radius: 0;
    transform: rotate(-10deg);
}

.face-unsure {
    background: #fdba74;
    border-color: #f97316;
}

.face-unsure::after {
    top: 34px;
    height: 7px;
    border-top: 3px solid #1f2937;
    border-bottom: 0;
    border-radius: 18px 18px 0 0;
}

.face-sleepy {
    background: #bfdbfe;
    border-color: #60a5fa;
}

.face-sleepy::before {
    height: 0;
    border-radius: 0;
    background: transparent;
    border-top: 3px solid #1f2937;
    box-shadow: 18px 0 0 transparent;
}

.face-angry {
    background: #fca5a5;
    border-color: #ef4444;
}

.face-angry::before {
    top: 18px;
    height: 0;
    border-radius: 0;
    background: transparent;
    border-top: 3px solid #1f2937;
    box-shadow: 18px 0 0 transparent;
    transform: rotate(12deg);
}

.face-angry::after {
    top: 35px;
    height: 7px;
    border-top: 3px solid #1f2937;
    border-bottom: 0;
    border-radius: 18px 18px 0 0;
}
```

### 4. Update Selected Survey Display Logic

Because Survey 1 no longer stores actual emoji characters, replace this line in `js/ui.js`:

```js
document.getElementById('selected-emojis-display').innerText = selectedEmojis.join(' ');
```

With:

```js
document.getElementById('selected-emojis-display').innerText = selectedEmojis
    .map(value => btn.closest('#emoji-container-1').querySelector(`[data-emoji="${value}"]`)?.getAttribute('aria-label') || value)
    .join(', ');
```

### 5. Test Pass 2

Run the game and verify:

- Survey faces are colorful on first render, before hover.
- Hover still enlarges each face.
- Selected faces get a clear yellow focus ring.
- Survey 1 selected display shows Hebrew labels instead of raw internal values.
- Final survey selection still allows only one selected face per row.
- No black/white emoji glyphs remain in the UI.

## Recommended Order

Implement Pass 1 first and test it independently. It is small, low risk, and fixes the most obvious control problem.

Only after Pass 1 works, implement Pass 2. If the CSS faces feel too plain, the next iteration can switch the `.face-choice` spans to local PNG/WebP image assets, but the core rule should stay the same: do not rely on emoji fonts for production UI.
