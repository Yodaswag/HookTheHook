import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../js/ui.js', import.meta.url), 'utf8');
const game = readFileSync(new URL('../js/game.js', import.meta.url), 'utf8');
const input = readFileSync(new URL('../js/input.js', import.meta.url), 'utf8');

test('UI uses drawn assets instead of platform emoji glyphs', () => {
    const emojiGlyphPattern = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

    assert.equal(emojiGlyphPattern.test(index), false);
    assert.equal(emojiGlyphPattern.test(ui), false);
    assert.match(index, /class="sound-icon sound-icon-on"/);
    assert.match(index, /class="emoji-btn face-choice face-excited"/);
});

test('survey faces are styled as consistent CSS assets', () => {
    assert.doesNotMatch(styles, /filter:\s*grayscale/);
    assert.match(styles, /\.face-choice/);
    assert.match(styles, /\.face-excited/);
    assert.match(styles, /\.face-angry/);
});

test('game exposes deterministic browser verification hooks', () => {
    assert.match(game, /window\.render_game_to_text/);
    assert.match(game, /window\.advanceTime/);
});

test('mute button children do not trigger gameplay input', () => {
    assert.match(input, /target\.closest\('?#mute-btn'?\)/);
});
