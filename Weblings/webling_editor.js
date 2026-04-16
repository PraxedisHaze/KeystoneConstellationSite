/**
 * WEBLING EDITOR ENGINE (v1.0)
 * The "Coherence Editor" - Client-side, No-Code customization.
 * 
 * Usage: Include this script at the bottom of any Webling index.html.
 * It injects a UI for editing text, images, and colors, then exports the result.
 */

(function() {
    // 1. Inject Editor UI
    const editorUI = document.createElement('div');
    editorUI.id = 'webling-editor-ui';
    editorUI.innerHTML = `
        <div style="position: fixed; bottom: 20px; right: 20px; background: #111; color: white; padding: 15px; border-radius: 8px; font-family: sans-serif; z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; gap: 10px; align-items: center;">
            <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Editor Active</div>
            <button id="btn-save" style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Download Site</button>
            <button id="btn-close" style="background: transparent; color: #666; border: none; cursor: pointer;">✕</button>
        </div>
        <style>
            .editable-hover { outline: 2px dashed #2563eb; cursor: text; }
            .editable-image-hover { outline: 2px dashed #ec4899; cursor: pointer; }
        </style>
    `;
    document.body.appendChild(editorUI);

    // 2. Make Text Editable
    const textElements = document.querySelectorAll('h1, h2, h3, h4, p, a, span, li, div');
    
    textElements.forEach(el => {
        // Only leaf nodes with text
        if (el.children.length === 0 && el.textContent.trim().length > 0 && !el.closest('#webling-editor-ui')) {
            el.addEventListener('mouseover', () => el.classList.add('editable-hover'));
            el.addEventListener('mouseout', () => el.classList.remove('editable-hover'));
            el.addEventListener('click', (e) => {
                e.preventDefault();
                el.contentEditable = "true";
                el.focus();
            });
            el.addEventListener('blur', () => {
                el.contentEditable = "false";
            });
        }
    });

    // 3. Make Images Swappable
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('mouseover', () => img.classList.add('editable-image-hover'));
        img.addEventListener('mouseout', () => img.classList.remove('editable-image-hover'));
        img.addEventListener('click', (e) => {
            e.preventDefault();
            
            const choice = confirm("Press OK to Upload from computer, or Cancel to use a URL.");
            
            if (choice) {
                // Upload from computer
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = e => {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = event => {
                        img.src = event.target.result; // Base64 string
                    };
                    reader.readAsDataURL(file);
                };
                input.click();
            } else {
                // Use URL
                const newUrl = prompt("Enter new Image URL:", img.src);
                if (newUrl) img.src = newUrl;
            }
        });
    });

    // 4. Export Function
    document.getElementById('btn-save').addEventListener('click', () => {
        // Clone the document to clean it up
        const clone = document.documentElement.cloneNode(true);
        
        // Remove the editor UI and script from the clone
        const ui = clone.querySelector('#webling-editor-ui');
        if (ui) ui.remove();
        
        // Remove contenteditable attributes
        const editables = clone.querySelectorAll('[contenteditable]');
        editables.forEach(el => el.removeAttribute('contenteditable'));
        
        // Serialize
        const htmlContent = "<!DOCTYPE html>\n" + clone.outerHTML;
        
        // Download
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
