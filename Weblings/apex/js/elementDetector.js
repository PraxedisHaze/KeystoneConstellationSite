/**
 * ELEMENT DETECTOR
 * Authoritative detector for the Apex inspector.
 * Produces a stable payload for the palette and maintains data-ax-id lattice.
 */
export class ElementDetector {
  constructor(options = {}) {
    this.ignoredSelectors = options.ignoredSelectors || [];
    this.onDetect = options.onDetect || (() => {});
    this.throttleMs = Number.isFinite(options.throttle) ? options.throttle : 0;
    this.lastDetectAt = 0;
    this.axIdCounter = 0;
    this.debugBadge = null;
  }

  initLattice() {
    const editable = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,div,button,a,img,section,header,footer,main,article');
    editable.forEach(el => {
      if (this._isInternal(el)) return;
      if (!el.dataset.axId) {
        this.axIdCounter += 1;
        el.dataset.axId = `ax-${this.axIdCounter}`;
      }
    });
  }

  getUniqueSelector(el) {
    if (!el) return null;
    if (el.dataset && el.dataset.axId) {
      return `[data-ax-id="${el.dataset.axId}"]`;
    }
    if (el.id) return `#${el.id}`;

    let selector = el.tagName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ').filter(Boolean).join('.');
      if (classes) selector += `.${classes}`;
    }

    if (el.parentElement) {
      const siblings = Array.from(el.parentElement.children).filter(child => child.tagName === el.tagName);
      if (siblings.length > 1) {
        const index = siblings.indexOf(el) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    return selector;
  }

  detect(x, y) {
    const now = Date.now();
    if (this.throttleMs && now - this.lastDetectAt < this.throttleMs) return null;
    this.lastDetectAt = now;

    const elements = document.elementsFromPoint
      ? document.elementsFromPoint(x, y)
      : [document.elementFromPoint(x, y)].filter(Boolean);

    if (!elements || elements.length === 0) {
      console.log('[APEX][detect] no element');
      this._setBadge('no element');
      return null;
    }

    let element = null;
    for (const el of elements) {
      if (!el) continue;
      if (this._isInternal(el)) continue;
      if (!this._isEditable(el)) continue;
      element = el;
      break;
    }

    if (!element) {
      const hasNonInternal = elements.some(el => el && !this._isInternal(el));
      if (!hasNonInternal) {
        console.log('[APEX][detect] internal stack');
        this._setBadge('internal stack');
      } else {
        console.log('[APEX][detect] non-editable stack');
        this._setBadge('non-editable stack');
      }
      return null;
    }

    if (!element.dataset.axId) {
      this.axIdCounter += 1;
      element.dataset.axId = `ax-${this.axIdCounter}`;
    }

    const data = this._extractElementData(element);
    if (data) this.onDetect(data);
    this._setBadge(`hit ${element.tagName}`);
    return data;
  }

  _setBadge(text) {
    if (!this.debug) return; // Only show if debug is explicitly enabled
    if (!this.debugBadge) {
      const badge = document.createElement('div');
      badge.style.cssText = 'position:fixed; bottom:10px; left:10px; z-index:30000; background:#111; color:#0f0; font-family:JetBrains Mono, monospace; font-size:11px; padding:6px 8px; border:1px solid #0f0; border-radius:4px; opacity:0.9; pointer-events:none;';
      document.body.appendChild(badge);
      this.debugBadge = badge;
    }
    this.debugBadge.textContent = `[APEX DETECT] ${text}`;
  }

  _isInternal(el) {
    let current = el;
    while (current && current !== document.body) {
      const isInternal = this.ignoredSelectors.some(selector => {
        try {
          return current.matches(selector);
        } catch (e) {
          // Fallback for non-standard selectors or old browsers
          if (selector.startsWith('.')) return current.classList.contains(selector.slice(1));
          if (selector.startsWith('#')) return current.id === selector.slice(1);
          if (selector.startsWith('[')) {
            const attr = selector.replace(/[\[\]]/g, '');
            return current.hasAttribute(attr);
          }
          return current.tagName.toLowerCase() === selector.toLowerCase();
        }
      });
      if (isInternal) return true;
      current = current.parentElement;
    }
    return false;
  }

  _isEditable(el) {
    const tagName = el.tagName.toLowerCase();

    // 1. MEDIA ROLE
    if (tagName === 'img') return true;

    // 2. TEXT ROLE (Leaf elements - check before structure to prioritize buttons/links)
    if (['h1','h2','h3','h4','h5','h6','p','span','button','a'].includes(tagName)) {
      // If it has children, check if it's a 'leaf container' (e.g., a link containing a single span)
      const childElements = Array.from(el.childNodes).filter(n => n.nodeType === 1);
      if (childElements.length > 0) {
        // If it has only one or two small children, we allow it as a text-leaf for branding/links
        if (childElements.length <= 2) return true;
        // Otherwise, it's structural
        return true;
      }
      return (el.innerText || '').trim().length > 0;
    }

    // 3. STRUCTURE ROLE (Fallbacks for move/clone - only after text elements)
    if (['section', 'header', 'footer', 'main', 'article', 'div'].includes(tagName)) {
      // Only treat as structural if it has child elements (is a container)
      // BUT: Don't treat as structural if it only contains form controls (buttons, inputs, etc)
      // NOTE: 'nav' excluded because it's always structural UI, never editable content
      const children = Array.from(el.childNodes).filter(n => n.nodeType === 1);
      if (children.length === 0) return false;

      // Check if all children are form controls (buttons, inputs, etc) - skip those containers
      const allFormControls = children.every(child => {
        const childTag = child.tagName.toLowerCase();
        return ['button', 'input', 'select', 'textarea'].includes(childTag);
      });

      if (allFormControls) return false; // Skip containers that only hold form controls

      return true; // Container with mixed/content children is editable
    }

    return false;
  }

  _extractElementData(el) {
    const styles = window.getComputedStyle(el);
    const selector = this.getUniqueSelector(el);
    if (!selector) return null;
    
    const tagName = el.tagName.toLowerCase();
    const hasChildElements = Array.from(el.childNodes).some(n => n.nodeType === 1);

    // CATEGORIZATION
    let role = 'text';
    if (tagName === 'img') role = 'media';
    else if (hasChildElements || ['section', 'header', 'footer', 'main', 'article', 'div', 'nav'].includes(tagName)) {
        role = 'structure';
    }

    return {
      element: el,
      selector,
      role,
      isStructural: role === 'structure',
      // CRITICAL: Structural elements MUST NOT provide textContent or they will dissolve their children
      textContent: role === 'text' ? (el.innerText || '').trim() : '',
      styles: {
        color: styles.color,
        zIndex: styles.zIndex,
        fontFamily: styles.fontFamily || '',
        backgroundColor: styles.backgroundColor
      }
    };
  }
}

export default ElementDetector;