(function() {
    console.log("Checking Coherence... (Type 'lux' to activate)");

    // --- STATE ---
    let isActive = false;
    let keystrokes = [];
    const SECRET_CODE = "lux";

    // --- ACTIVATION LISTENER ---
    document.addEventListener('keydown', (e) => {
        if (isActive) return; 

        keystrokes.push(e.key.toLowerCase());
        if (keystrokes.length > SECRET_CODE.length) {
            keystrokes.shift();
        }
        
        if (keystrokes.join("") === SECRET_CODE) {
            initCoherenceEngine();
        }
    });

    // --- ENGINE INITIALIZATION ---
    function initCoherenceEngine() {
        if (isActive) return;
        isActive = true;
        console.log("✧ COHERENCE ENGINE ENGAGED: PHASE 3 (SUMMONER) ✧");

        // 1. Inject Styles
        const css = 
            // Main UI Bar
            ".coherence-ui-glass {" +
            "    position: fixed;" +
            "    bottom: 30px;" +
            "    left: 50%;" +
            "    transform: translateX(-50%);" +
            "    background: rgba(10, 10, 10, 0.9);" +
            "    backdrop-filter: blur(12px);" +
            "    border: 1px solid rgba(212, 175, 55, 0.3);" +
            "    padding: 12px 24px;" +
            "    border-radius: 50px;" +
            "    display: flex;" +
            "    align-items: center;" +
            "    gap: 20px;" +
            "    z-index: 99999;" +
            "    box-shadow: 0 10px 40px rgba(0,0,0,0.6);" +
            "    font-family: 'Outfit', sans-serif;" +
            "    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);" +
            "}" +
            "@keyframes slideUp {" +
            "    from { bottom: -100px; opacity: 0; }" +
            "    to { bottom: 30px; opacity: 1; }" +
            "}" +
            ".coherence-label {" +
            "    color: #d4af37;" +
            "    font-size: 11px;" +
            "    letter-spacing: 0.15em;" +
            "    text-transform: uppercase;" +
            "    font-weight: 600;" +
            "    display: flex;" +
            "    align-items: center;" +
            "    gap: 8px;" +
            "}" +
            ".coherence-label::before {" +
            "    content: '';" +
            "    display: block;" +
            "    width: 6px;" +
            "    height: 6px;" +
            "    background: #d4af37;" +
            "    border-radius: 50%;" +
            "    box-shadow: 0 0 10px #d4af37;" +
            "}" +
            ".coherence-btn {" +
            "    background: linear-gradient(135deg, #d4af37 0%, #aa771c 100%);" +
            "    color: #000;" +
            "    border: none;" +
            "    padding: 8px 20px;" +
            "    border-radius: 20px;" +
            "    font-size: 11px;" +
            "    font-weight: 700;" +
            "    text-transform: uppercase;" +
            "    letter-spacing: 0.1em;" +
            "    cursor: pointer;" +
            "    transition: all 0.3s ease;" +
            "}" +
            ".coherence-btn:hover {" +
            "    transform: translateY(-2px);" +
            "    box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);" +
            "}" +
            ".coherence-close {" +
            "    background: transparent;" +
            "    border: none;" +
            "    color: rgba(255,255,255,0.4);" +
            "    cursor: pointer;" +
            "    font-size: 16px;" +
            "    transition: color 0.3s;" +
            "    margin-left: 10px;" +
            "}" +
            ".coherence-close:hover { color: #fff; }" +
            
            // Editable Elements
            ".coherence-editable {" +
            "    outline: 1px dashed rgba(255, 255, 255, 0.1);" +
            "    transition: all 0.2s;" +
            "}" +
            ".coherence-editable:hover {" +
            "    outline: 1px solid rgba(212, 175, 55, 0.8);" +
            "    cursor: text;" +
            "    background: rgba(212, 175, 55, 0.05);" +
            "    position: relative;" +
            "}" +
            "[contenteditable='true'] {" +
            "    outline: 2px solid #d4af37 !important;" +
            "    background: rgba(0,0,0,0.8) !important;" +
            "    color: white !important;" +
            "    z-index: 1000;" +
            "    position: relative;" +
            "    min-width: 20px;" +
            "}" +
            
            // Image Controls
            ".coherence-image {" +
            "    outline: 1px dashed rgba(255, 255, 255, 0.1);" +
            "}" +
            ".coherence-image:hover {" +
            "    outline: 2px solid #d4af37;" +
            "    cursor: pointer;" +
            "}" +
            
            // Section Toolbar
            ".coherence-section-toolbar {" +
            "    position: absolute;" +
            "    top: 0;" +
            "    right: 0;" +
            "    background: #000;" +
            "    border: 1px solid #333;" +
            "    display: flex;" +
            "    gap: 1px;" +
            "    z-index: 10000;" +
            "    opacity: 0;" +
            "    transition: opacity 0.2s;" +
            "    pointer-events: none;" + 
            "}" +
            ".coherence-section:hover .coherence-section-toolbar {" +
            "    opacity: 1;" +
            "    pointer-events: auto;" +
            "}" +
            ".coherence-section-btn {" +
            "    background: #111;" +
            "    border: none;" +
            "    color: #888;" +
            "    padding: 6px 10px;" +
            "    cursor: pointer;" +
            "    font-size: 12px;" +
            "}" +
            ".coherence-section-btn:hover {" +
            "    background: #222;" +
            "    color: #fff;" +
            "}" +
            ".btn-danger:hover { background: #ef4444; color: white; }" +
            ".coherence-section { position: relative; border: 1px dashed transparent; }" +
            ".coherence-section:hover { border-color: rgba(255,255,255,0.1); }" +
            
            // Summoner Menu (The Ghost Button's Interface)
            ".coherence-summoner {" +
            "    position: fixed;" +
            "    bottom: 90px;" +
            "    left: 50%;" +
            "    transform: translateX(-50%);" +
            "    background: #111;" +
            "    border: 1px solid #333;" +
            "    border-radius: 8px;" +
            "    width: 200px;" +
            "    display: none;" +
            "    flex-direction: column;" +
            "    overflow: hidden;" +
            "    box-shadow: 0 10px 30px rgba(0,0,0,0.8);" +
            "    z-index: 100000;" +
            "}" +
            ".coherence-summon-item {" +
            "    padding: 12px;" +
            "    background: transparent;" +
            "    border: none;" +
            "    border-bottom: 1px solid #222;" +
            "    color: #888;" +
            "    text-align: left;" +
            "    cursor: pointer;" +
            "    font-family: sans-serif;" +
            "    font-size: 12px;" +
            "    transition: all 0.2s;" +
            "}" +
            ".coherence-summon-item:hover {" +
            "    background: #222;" +
            "    color: #d4af37;" +
            "}";

        const style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);

        // 2. Inject UI
        const ui = document.createElement('div');
        ui.className = 'coherence-ui-glass';
        ui.innerHTML = 
            '<div class="coherence-label">Coherence Engaged</div>' +
            '<button id="coherence-add" class="coherence-section-btn" style="border-radius: 20px; border: 1px solid #333; margin-right: 10px;">+ Add</button>' +
            '<button id="coherence-save" class="coherence-btn">Commit to Reality</button>' +
            '<button id="coherence-close" class="coherence-close">✕</button>';
        document.body.appendChild(ui);
        
        // 2.5 Inject Summoner Menu
        const menu = document.createElement('div');
        menu.id = 'coherence-summoner-menu';
        menu.className = 'coherence-summoner';
        document.body.appendChild(menu);

        // 3. Awaken Elements
        activateTextEditing();
        activateImageSwapping();
        activateSectionControls();
        interceptLinks();
        buildSummonerMenu();

        // 4. Bind Actions
        document.getElementById('coherence-save').onclick = commitToReality;
        document.getElementById('coherence-close').onclick = shutdownEngine;
        document.getElementById('coherence-add').onclick = toggleSummoner;
    }
    
    function buildSummonerMenu() {
        const menu = document.getElementById('coherence-summoner-menu');
        menu.innerHTML = ''; // Clear
        
        // Find all templates in the document
        const templates = document.querySelectorAll('template[data-name]');
        
        if (templates.length === 0) {
            menu.innerHTML = '<div style="padding:10px; color:#666; font-size:10px;">No Blueprints Found</div>';
            return;
        }
        
        templates.forEach(tpl => {
            const btn = document.createElement('button');
            btn.className = 'coherence-summon-item';
            btn.innerText = '+ ' + tpl.getAttribute('data-name');
            btn.onclick = () => summonTemplate(tpl);
            menu.appendChild(btn);
        });
    }
    
    function toggleSummoner() {
        const menu = document.getElementById('coherence-summoner-menu');
        menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    }
    
    function summonTemplate(tpl) {
        // Clone content
        const clone = tpl.content.cloneNode(true);
        // Inject before Footer (assuming footer is last main element)
        const footer = document.querySelector('footer');
        if (footer) {
            footer.parentNode.insertBefore(clone, footer);
        } else {
            document.body.appendChild(clone);
        }
        
        // Re-scan for interactive elements
        activateTextEditing(); // Re-bind new text
        activateSectionControls(); // Add toolbar to new section
        
        // Close menu
        document.getElementById('coherence-summoner-menu').style.display = 'none';
        
        // Scroll to new section
        footer.previousElementSibling.scrollIntoView({behavior: 'smooth'});
    }

    function activateTextEditing() {
        const textNodes = document.querySelectorAll('h1, h2, h3, h4, p, span, li, a, button, div');
        textNodes.forEach(el => {
            if (el.closest('.coherence-ui-glass')) return;
            if (el.closest('.coherence-section-toolbar')) return;
            
            const hasText = el.textContent.trim().length > 0;
            const isLeaf = el.children.length === 0;
            
            if (hasText && isLeaf) {
                el.classList.add('coherence-editable');
                
                el.addEventListener('click', (e) => {
                    if (!isActive) return;
                    e.preventDefault();
                    e.stopPropagation();
                    el.contentEditable = "true";
                    el.focus();
                }, true);

                el.onblur = () => {
                    el.contentEditable = "false";
                };
                
                el.onkeydown = (e) => {
                     if (e.key === 'Enter' && !['P', 'LI'].includes(el.tagName)) {
                        e.preventDefault();
                        el.blur();
                     }
                };
            }
        });
    }

    function activateImageSwapping() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.closest('.coherence-ui-glass')) return;
            img.classList.add('coherence-image');

            img.addEventListener('click', (e) => {
                if (!isActive) return;
                e.preventDefault();
                e.stopPropagation();

                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (ev) => {
                    const file = ev.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (readerEvent) => {
                            img.src = readerEvent.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                };
                input.click();
            }, true);
        });
    }

    function activateSectionControls() {
        const sections = document.querySelectorAll('section, header, footer');
        sections.forEach(sec => {
            if (sec.closest('.coherence-ui-glass')) return;
            if (sec.classList.contains('coherence-section')) return; // Already bound
            
            sec.classList.add('coherence-section');
            
            const toolbar = document.createElement('div');
            toolbar.className = 'coherence-section-toolbar';
            toolbar.contentEditable = "false"; 
            
            const btnUp = document.createElement('button');
            btnUp.innerHTML = '↑';
            btnUp.className = 'coherence-section-btn';
            btnUp.onclick = (e) => { e.preventDefault(); e.stopPropagation(); if (sec.previousElementSibling) sec.parentNode.insertBefore(sec, sec.previousElementSibling); };
            
            const btnDown = document.createElement('button');
            btnDown.innerHTML = '↓';
            btnDown.className = 'coherence-section-btn';
            btnDown.onclick = (e) => { e.preventDefault(); e.stopPropagation(); if (sec.nextElementSibling) sec.parentNode.insertBefore(sec.nextElementSibling, sec); };
            
            const btnDup = document.createElement('button');
            btnDup.innerHTML = 'Clone';
            btnDup.className = 'coherence-section-btn';
            btnDup.onclick = (e) => { 
                e.preventDefault(); e.stopPropagation();
                const clone = sec.cloneNode(true);
                clone.classList.remove('coherence-section'); // Strip status so re-init works cleanly
                clone.querySelectorAll('.coherence-section-toolbar').forEach(b => b.remove());
                sec.parentNode.insertBefore(clone, sec.nextSibling);
                activateSectionControls(); // Re-bind new section
                activateTextEditing(); // Re-bind new text
            };
            
            const btnDel = document.createElement('button');
            btnDel.innerHTML = '✕';
            btnDel.className = 'coherence-section-btn btn-danger';
            btnDel.onclick = (e) => { e.preventDefault(); e.stopPropagation(); if(confirm("Delete this section?")) sec.remove(); };
            
            toolbar.append(btnUp, btnDown, btnDup, btnDel);
            sec.prepend(toolbar);
        });
    }
    
    function interceptLinks() {
        const links = document.querySelectorAll('a');
        links.forEach(a => {
            a.addEventListener('click', (e) => {
                if (isActive) e.preventDefault();
            }, false);
        });
    }

    function commitToReality() {
        // DEMO MODE: Modal Logic
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); backdrop-filter: blur(8px);
            z-index: 100000; display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div style="background: #111; border: 1px solid #d4af37; padding: 40px; text-align: center; max-width: 500px; position: relative;">
                <button id="demo-close" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: #666; cursor: pointer;">✕</button>
                <div style="color: #d4af37; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 20px;">Architecture Crystallized</div>
                <h2 style="color: white; font-family: 'Cinzel', serif; font-size: 32px; margin-bottom: 20px;">Unlock Your Reality</h2>
                <p style="color: #888; font-family: 'Outfit', sans-serif; line-height: 1.6; margin-bottom: 30px;">
                    You have shaped this webling to your vision. To export the source code and take full ownership, acquire the Sovereign Key.
                </p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="window.location.href='./Axxilak Forge v4.0 (The Composer).html'" style="background: #d4af37; color: black; border: none; padding: 12px 30px; font-weight: bold; text-transform: uppercase; cursor: pointer; letter-spacing: 0.1em;">
                        Acquire License ($20)
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.getElementById('demo-close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }

    function shutdownEngine() {
        if(confirm("Disengage Coherence Mode? Unsaved changes will be lost.")) {
            location.reload(); 
        }
    }

})();