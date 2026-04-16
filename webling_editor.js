/**
 * WEBLING EDITOR ENGINE (v1.1 STABILIZED)
 * Client-side, No-Code customization with Crystalline Guards
 */

(function () {
    // 1. Inject Editor UI - Marked with Sanctuary Boundary
    const editorUI = document.createElement('div');
    editorUI.id = 'webling-editor-ui';
    editorUI.setAttribute('data-anothen-internal', ''); // SANCTUARY BOUNDARY
    editorUI.innerHTML = `
        <div style="position: fixed; bottom: 20px; right: 20px; background: #111; color: white; padding: 15px; border-radius: 8px; font-family: sans-serif; z-index: 9999; display: flex; gap: 10px; align-items: center;">
            <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">Editor Active</div>
            <button id="btn-save" style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Download Site</button>
            <button id="btn-close" style="background: transparent; color: #666; border: none; cursor: pointer;">✕</button>
        </div>
    `;
    document.body.appendChild(editorUI);

    // 2. Make Text Editable with Undefined Shield
    const textElements = document.querySelectorAll('h1, h2, h3, h4, p, a, span, li, div');
    textElements.forEach(el => {
        if (el.children.length === 0 && el.textContent.trim().length > 0 && !el.closest('#webling-editor-ui')) {
            el.addEventListener('click', (e) => {
                // THE UNDEFINED SHIELD
                if (el.innerText.trim() === 'undefined') {
                    console.warn("[Axxilak] Blocked 'undefined' focus leak.");
                    return;
                }
                e.preventDefault();
                el.contentEditable = "true";
                el.focus();
            });
            el.addEventListener('blur', () => { el.contentEditable = "false"; });
        }
    });

    // 3. Export Function
    document.getElementById('btn-save').addEventListener('click', () => {
        const clone = document.documentElement.cloneNode(true);
        const ui = clone.querySelector('#webling-editor-ui');
        if (ui) ui.remove();
        const htmlContent = "<!DOCTYPE html>\n" + clone.outerHTML;
        const blob = new Blob([htmlContent], { type: "text/html" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "index.html";
        a.click();
    });

    document.getElementById('btn-close').addEventListener('click', () => {
        editorUI.style.display = 'none';
    });
})();
