import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../js/ui.js', import.meta.url), 'utf8');
const game = readFileSync(new URL('../js/game.js', import.meta.url), 'utf8');
const input = readFileSync(new URL('../js/input.js', import.meta.url), 'utf8');
const renderer = readFileSync(new URL('../js/renderer.js', import.meta.url), 'utf8');

test('UI uses drawn assets instead of platform emoji glyphs', () => {
    const emojiGlyphPattern = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

    assert.equal(emojiGlyphPattern.test(index), false);
    assert.equal(emojiGlyphPattern.test(ui), false);
    assert.match(index, /class="sound-icon sound-icon-on"/);
    assert.match(index, /assets\/Hook Game\/1-frustrated-pirate\.png/);
});

test('survey faces use pirate image assets', () => {
    assert.doesNotMatch(styles, /filter:\s*grayscale/);
    assert.match(index, /assets\/Hook Game\/1-frustrated-pirate\.png/);
    assert.match(index, /assets\/Hook Game\/2-slightly-frustrated-pirate\.png/);
    assert.match(index, /assets\/Hook Game\/3-neutral-bored-pirate\.png/);
    assert.match(index, /assets\/Hook Game\/4-happy-pirate\.png/);
    assert.match(index, /assets\/Hook Game\/5-very-happy-pirate\.png/);
    assert.match(styles, /\.face-img/);
});

test('survey face controls are transparent single-row image buttons', () => {
    assert.match(styles, /\.emoji-row,\s*\n\.emoji-row-reverse\s*\{[^}]*flex-wrap:\s*nowrap/s);
    assert.match(styles, /\.emoji-btn\s*\{[^}]*background:\s*transparent/s);
    assert.match(styles, /\.emoji-btn\s*\{[^}]*border:\s*0/s);
    assert.match(styles, /\.face-choice:hover/s);
    assert.match(styles, /\.face-choice\.selected/s);
    assert.match(styles, /\.face-choice\.selected,\s*\n\.single-emoji\.selected\s*\{[^}]*outline:\s*0/s);
});

test('first survey face question is single choice', () => {
    assert.doesNotMatch(ui, /let\s+selectedEmojis\s*=\s*\[\]/);
    assert.match(ui, /let\s+selectedEmoji\s*=\s*null/);
    assert.match(ui, /buttons\.forEach\(item\s*=>\s*item\.classList\.remove\('selected'\)\)/);
    assert.match(ui, /selectedEmoji\s*=\s*emoji/);
});

test('final survey rows keep frustrated faces on the left', () => {
    assert.doesNotMatch(index, /id="rating-[12]"\s+class="emoji-row-reverse"/);
});

test('game exposes deterministic browser verification hooks', () => {
    assert.match(game, /window\.render_game_to_text/);
    assert.match(game, /window\.advanceTime/);
});

test('mute button children do not trigger gameplay input', () => {
    assert.match(input, /target\.closest\('?#mute-btn'?\)/);
});

test('surface art uses expected y coordinates', () => {
    assert.match(game, /HOOK_ORIGIN\s*=\s*\{\s*x:\s*VIRTUAL_WIDTH\s*\/\s*2,\s*y:\s*220\s*\}/);
    assert.match(renderer, /const\s+waveY\s*=\s*220\b/);
    assert.match(renderer, /const\s+boatY\s*=\s*240\s*-\s*h\b/);
});

test('underwater texture stays below the sea line and behind the seabed', () => {
    assert.match(renderer, /const\s+seaLevelY\s*=\s*220\b/);
    assert.match(renderer, /drawUnderwaterTexture\(ctx\);\s*\n\s*drawSeabed\(ctx\);/);
    assert.match(renderer, /ctx\.rect\(0,\s*seaLevelY,\s*VIRTUAL_WIDTH,\s*VIRTUAL_HEIGHT\s*-\s*seaLevelY\);/);
    assert.match(renderer, /waterImg\.src\s*=\s*'assets\/Hook%20Game\/Water\.png'/);
    assert.match(renderer, /ctx\.drawImage\(\s*\n\s*waterImg,/);
});
