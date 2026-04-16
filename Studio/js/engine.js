/**
 * AXXILAK STUDIO ENGINE (v1.1 STABILIZED)
 * Visual Builder with Crystalline Stability Guards
 */

const frame = document.getElementById('webling-frame');
const propPanel = document.getElementById('properties-panel');
let selectedEl = null;
let currentTool = 'select';

// --- SELECTION LOGIC ---
function selectElement(el) {
    // 1. THE SANCTUARY BOUNDARY: Stop UI from detecting itself
    if (el.closest('[data-anothen-internal]')) return;[cite: 1940, 5207]

    // 2. THE UNDEFINED SHIELD: Block the "Obliteration" glitch
    const textContent = el.innerText?.trim();
    if (textContent === 'undefined') {
        [cite: 4661, 5203]
        console.warn("[Axxilak] Blocked 'undefined' lattice leak.");
        return;
    }

    if (selectedEl) selectedEl.classList.remove('studio-selected');
    selectedEl = el;
    selectedEl.classList.add('studio-selected');

    renderProperties(el);
}

// --- LOADER ---
document.getElementById('file-input').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        frame.srcdoc = content;

        frame.onload = () => {
            initFrame(frame.contentDocument);
            document.getElementById('canvas-label').innerText = file.name;
        };
    };
    reader.readAsText(file);
});

function initFrame(doc) {
    const style = doc.createElement('style');
    style.innerHTML = `
        .studio-hover { outline: 2px dashed #2563eb !important; cursor: pointer !important; }
        .studio-selected { outline: 2px solid #ec4899 !important; }
    `;
    doc.head.appendChild(style);

    doc.body.addEventListener('click', (e) => {
        if (currentTool === 'move') return;
        e.preventDefault();
        e.stopPropagation();
        selectElement(e.target);
    });
}

// ... Properties Panel rendering logic remains standard ...
