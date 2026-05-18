// levels.js — Level data, principles, and initialization

import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from './canvas.js';

// --- Data ---

export const principles = [
    { title: "עקרון הוק: יצירת אתגר", text: "חידה עשויה לעורר חשיבה ביקורתית והשתתפות אצל התלמידים." },
    { title: "עקרון הוק: רלוונטיות", text: "כדאי שהמשחק יהיה קשור ישירות לנושא הנלמד בשיעור." },
    { title: "עקרון הוק: סקרנות חושית", text: "אינטרקציה, גרפיקה וסאונד יכולים לסייע משמעותית בתפיסת תשומת הלב של הלומד." },
    { title: "עקרון הוק: שאלות מעניינות", text: "שילוב שאלות יכול לעורר סקרנות טבעית ורצון להמשיך וללמוד עוד." }
];

export const level3Items = [
    { lines: ["מעורר חשיבה", "ביקורתית"], isCorrectStatement: true },
    { lines: ["קשור ישירות", "לנושא הנלמד"], isCorrectStatement: true },
    { lines: ["גרפיקה וסאונד", "תופסים קשב"], isCorrectStatement: true },
    { lines: ["שאלות מעוררות", "סקרנות"], isCorrectStatement: true },
    { lines: ["חייב להיות ארוך", "ומורכב"], isCorrectStatement: false }
];

// --- Level 3 target slots (where collected correct items slide to) ---
export const level3Slots = [
    { x: 145, y: 160 },
    { x: 315, y: 160 },
    { x: 485, y: 160 },
    { x: 655, y: 160 }
];

/**
 * Generate items array for the given level.
 * Uses virtual coordinates (800×800 space).
 * @param {number} level
 * @returns {Array} items
 */
export function createLevelItems(level) {
    let items = [];

    if (level === 1) {
        items = [
            { id: 1, type: 'chest', x: 250, y: 620, width: 60, height: 45, caught: false },
            { id: 2, type: 'chest', x: 550, y: 660, width: 60, height: 45, caught: false },
            { id: 3, type: 'bomb', x: 400, y: 560, radius: 20, caught: false },
            { id: 4, type: 'bomb', x: 700, y: 590, radius: 20, caught: false }
        ];
    }
    else if (level === 2) {
        const positions = [
            { x: 150, y: 620 },
            { x: 350, y: 560 },
            { x: 550, y: 660 },
            { x: 720, y: 590 }
        ];
        items = principles.map((p, i) => ({
            id: i + 10, type: 'principle_chest', title: p.title, text: p.text,
            x: positions[i].x, y: positions[i].y, width: 60, height: 45, caught: false
        }));
    }
    else if (level === 3) {
        // Concave (U-Shape) layout
        const positions = [
            { x: 100, y: 440 },
            { x: 250, y: 520 },
            { x: 400, y: 600 },
            { x: 550, y: 520 },
            { x: 700, y: 440 }
        ];


        // Shuffle for replayability
        let shuffled = [...level3Items].sort(() => Math.random() - 0.5);

        items = shuffled.map((item, i) => ({
            id: i + 20, type: 'text_box', lines: item.lines, isCorrectStatement: item.isCorrectStatement,
            x: positions[i].x, y: positions[i].y, width: 140, height: 60, caught: false, collected: false, scale: 1
        }));
    }

    // Store original positions for snap-back on mistakes
    items.forEach(item => {
        item.originalX = item.x;
        item.originalY = item.y;
    });

    return items;
}
