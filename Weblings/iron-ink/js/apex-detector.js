// Websites/Axxilak/Weblings/apex/js/apex-detector.js
// Element Detection Engine
// Detects elements within lens bounds, returns editable properties

class ElementDetector {
  constructor() {
    this.detectedElements = [];
    this.elementIdCounter = 0;
    this.gridSize = 20; // Sample grid every N pixels
  }

  /**
   * Main detection function: Find all editable elements within lens bounds
   * @param {number} lensX - Lens left position
   * @param {number} lensY - Lens top position
   * @param {number} lensWidth - Lens width
   * @param {number} lensHeight - Lens height
   * @returns {Object} { elements: [...] }
   */
  detectElementsInLens(lensX, lensY, lensWidth, lensHeight) {
    this.detectedElements = [];
    this.elementIdCounter = 0;

    const lensRight = lensX + lensWidth;
    const lensBottom = lensY + lensHeight;

    // Get all visible elements on page
    const allElements = document.querySelectorAll('*');
    const seenElements = new Set();

    // Sample grid: check every N pixels within lens bounds
    for (let y = lensY; y < lensBottom; y += this.gridSize) {
      for (let x = lensX; x < lensRight; x += this.gridSize) {
        const elementsAtPoint = document.elementsFromPoint(x, y);

        elementsAtPoint.forEach(el => {
          // Skip duplicates
          if (seenElements.has(el)) return;

          // Skip invisible/structural elements
          if (this.shouldIgnoreElement(el)) return;

          // Only process editable elements
          if (!this.isEditableElement(el)) return;

          seenElements.add(el);

          // Extract element data
          const elementData = this.extractElementData(el);
          if (elementData) {
            this.detectedElements.push(elementData);
          }
        });
      }
    }

    // Remove duplicates by selector
    const uniqueElements = [];
    const seenSelectors = new Set();

    this.detectedElements.forEach(el => {
      if (!seenSelectors.has(el.selector)) {
        uniqueElements.push(el);
        seenSelectors.add(el.selector);
      }
    });

    return { elements: uniqueElements };
  }

  /**
   * Check if element should be ignored (invisible, structural, etc.)
   */
  shouldIgnoreElement(el) {
    // Skip document, html, body
    if (el === document || el.tagName === 'HTML' || el.tagName === 'BODY') {
      return true;
    }

    // Skip editor UI (lens and palette containers)
    const lensContainer = document.getElementById('lens-container');
    const paletteContainer = document.getElementById('palette-container');
    if (lensContainer && lensContainer.contains(el)) return true;
    if (paletteContainer && paletteContainer.contains(el)) return true;

    // Skip hidden elements
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return true;
    }

    // Skip very small elements (< 20px either dimension)
    const rect = el.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 20) {
      return true;
    }

    return false;
  }

  /**
   * Check if element is editable (text, image, color, etc.)
   */
  isEditableElement(el) {
    const tagName = el.tagName.toLowerCase();
    const text = el.innerText?.trim() || '';
    const isTextNode = text.length > 0 && text.length < 500; // Reasonable text length

    // Editable text elements
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'button', 'a'].includes(tagName)) {
      return isTextNode;
    }

    // Editable image elements
    if (tagName === 'img') {
      return true;
    }

    return false;
  }

  /**
   * Extract all editable properties from element
   */
  extractElementData(el) {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    // Generate unique selector
    const selector = this.generateSelector(el);
    if (!selector) return null;

    const elementId = `elem-${++this.elementIdCounter}`;
    const text = el.innerText?.trim() || '';
    const tagName = el.tagName.toLowerCase();

    // Determine element type
    let type = 'text';
    if (tagName === 'img') {
      type = 'image';
    } else if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      type = 'color';
    }

    // Extract editable properties
    const properties = {
      text: text || '',
      color: this.rgbToHex(style.color),
      fontSize: style.fontSize,
      fontFamily: style.fontFamily.replace(/"/g, ''),
      fontWeight: style.fontWeight,
      backgroundColor: this.rgbToHex(style.backgroundColor),
    };

    // Add image src if applicable
    if (tagName === 'img') {
      properties.src = el.src;
    }

    return {
      id: elementId,
      type: type,
      content: text,
      selector: selector,
      properties: properties,
      rect: {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      }
    };
  }

  /**
   * Generate a CSS selector for the element
   */
  generateSelector(el) {
    // Use ID if available
    if (el.id) {
      return `#${el.id}`;
    }

    // Build selector with tag + classes + position
    let selector = el.tagName.toLowerCase();

    // Add classes if available
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ').filter(c => c.trim()).join('.');
      if (classes) {
        selector += `.${classes}`;
      }
    }

    // Add nth-of-type to ensure uniqueness
    if (el.parentElement) {
      const siblings = Array.from(el.parentElement.children).filter(child => child.tagName === el.tagName);
      if (siblings.length > 1) {
        const index = siblings.indexOf(el) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    return selector;
  }

  /**
   * Convert RGB to Hex
   */
  rgbToHex(rgb) {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return '#000000';

    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#000000';

    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`.toUpperCase();
  }

  /**
   * Update an element's property in the DOM
   */
  updateElementProperty(elementId, propertyName, value) {
    const elementData = this.detectedElements.find(el => el.id === elementId);
    if (!elementData) {
      console.warn('Element not found:', elementId);
      return;
    }

    // Find all DOM elements matching selector
    const domElements = document.querySelectorAll(elementData.selector);
    domElements.forEach(el => {
      if (propertyName === 'text' || propertyName === 'content') {
        el.innerText = value;
      } else if (propertyName === 'src') {
        el.src = value;
      } else {
        // CSS properties
        el.style[propertyName] = value;
      }
    });

    // Update cached properties
    if (elementData.properties[propertyName]) {
      elementData.properties[propertyName] = value;
    }
  }

  /**
   * Get current cached detected elements
   */
  getDetectedElements() {
    return this.detectedElements;
  }

  /**
   * Clear cache
   */
  clear() {
    this.detectedElements = [];
    this.elementIdCounter = 0;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ElementDetector;
}
