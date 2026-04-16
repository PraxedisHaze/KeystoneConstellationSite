// Websites/Axxilak/Weblings/apex/js/apex-palette.js
// Context-Aware Tool Palette Generator
// Generates UI controls based on detected elements, emits edit events

/**
 * Generate palette HTML based on detected elements
 * @param {Object} detectionResult - { elements: [...] } from detector
 * @returns {string} HTML string for palette
 */
function generatePalette(detectionResult) {
  if (!detectionResult || !detectionResult.elements || detectionResult.elements.length === 0) {
    return `
      <div class="palette-empty">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Move lens over content to edit
        </p>
      </div>
    `;
  }

  const elements = detectionResult.elements;

  // Handle single element
  if (elements.length === 1) {
    return generateSingleElementPalette(elements[0]);
  }

  // Handle multiple elements (show common properties only)
  return generateMultiElementPalette(elements);
}

/**
 * Generate controls for a single element
 */
function generateSingleElementPalette(element) {
  const { id, type, properties } = element;
  let html = `<div class="palette-section">`;

  // Element type label
  html += `<div style="font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
    ${type.toUpperCase()} • ${element.content.substring(0, 30)}${element.content.length > 30 ? '...' : ''}
  </div>`;

  // Text editing (if applicable)
  if (properties.text && type !== 'image') {
    html += `
      <div class="palette-control">
        <label class="palette-label">Text</label>
        <textarea class="palette-textarea" data-element-id="${id}" data-property="text" style="width: 100%; height: 60px; padding: 6px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px; resize: vertical;">${properties.text}</textarea>
      </div>
    `;
  }

  // Font Family (dropdown)
  if (properties.fontFamily) {
    const fonts = ['Inter', 'Georgia', 'Arial', 'Times New Roman', 'Courier New', 'Verdana'];
    const currentFont = properties.fontFamily.split(',')[0].trim().replace(/['"]/g, '');

    html += `
      <div class="palette-control">
        <label class="palette-label">Font</label>
        <select class="palette-select" data-element-id="${id}" data-property="fontFamily" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px;">
          ${fonts.map(font => `<option value="${font}" ${currentFont === font ? 'selected' : ''}>${font}</option>`).join('')}
        </select>
      </div>
    `;
  }

  // Font Size (slider + input)
  if (properties.fontSize) {
    const sizeValue = parseInt(properties.fontSize);
    html += `
      <div class="palette-control">
        <label class="palette-label">Font Size</label>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="range" class="palette-slider" data-element-id="${id}" data-property="fontSize" min="12" max="96" value="${sizeValue}" style="flex: 1; cursor: pointer;">
          <span class="palette-value" style="width: 50px; text-align: right; font-size: 12px; font-weight: 600;">${sizeValue}px</span>
        </div>
      </div>
    `;
  }

  // Font Weight (dropdown)
  if (properties.fontWeight) {
    const weights = ['300', '400', '500', '600', '700', '800', '900'];
    const currentWeight = properties.fontWeight;

    html += `
      <div class="palette-control">
        <label class="palette-label">Weight</label>
        <select class="palette-select" data-element-id="${id}" data-property="fontWeight" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px;">
          ${weights.map(w => `<option value="${w}" ${currentWeight === w ? 'selected' : ''}>${w}</option>`).join('')}
        </select>
      </div>
    `;
  }

  // Color picker
  if (properties.color && properties.color !== '#000000') {
    html += `
      <div class="palette-control">
        <label class="palette-label">Color</label>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="color" class="palette-color-picker" data-element-id="${id}" data-property="color" value="${properties.color}" style="width: 50px; height: 36px; border: 1px solid #ddd; border-radius: 3px; cursor: pointer;">
          <input type="text" class="palette-hex-input" data-element-id="${id}" data-property="color" value="${properties.color}" style="flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 3px; font-family: monospace; font-size: 12px;">
        </div>
      </div>
    `;
  }

  // Background color (if applicable)
  if (properties.backgroundColor && properties.backgroundColor !== '#000000') {
    html += `
      <div class="palette-control">
        <label class="palette-label">Background</label>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="color" class="palette-color-picker" data-element-id="${id}" data-property="backgroundColor" value="${properties.backgroundColor}" style="width: 50px; height: 36px; border: 1px solid #ddd; border-radius: 3px; cursor: pointer;">
          <input type="text" class="palette-hex-input" data-element-id="${id}" data-property="backgroundColor" value="${properties.backgroundColor}" style="flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 3px; font-family: monospace; font-size: 12px;">
        </div>
      </div>
    `;
  }

  // Image src (if applicable)
  if (properties.src) {
    html += `
      <div class="palette-control">
        <label class="palette-label">Image URL</label>
        <input type="text" class="palette-input" data-element-id="${id}" data-property="src" value="${properties.src}" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px;">
      </div>
    `;
  }

  html += `</div>`;
  return html;
}

/**
 * Generate controls for multiple selected elements (common properties only)
 */
function generateMultiElementPalette(elements) {
  // Find common editable properties
  const commonProps = {};

  elements.forEach((el, idx) => {
    Object.keys(el.properties).forEach(prop => {
      if (idx === 0) {
        commonProps[prop] = el.properties[prop];
      } else if (commonProps[prop] === el.properties[prop]) {
        // Keep if value matches
      } else {
        commonProps[prop] = null; // Mark as different
      }
    });
  });

  let html = `<div class="palette-section">`;
  html += `<div style="font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
    ${elements.length} ELEMENTS SELECTED (common properties only)
  </div>`;

  // Show only matching properties
  Object.keys(commonProps).forEach(prop => {
    if (commonProps[prop] === null) return; // Skip non-matching

    const firstElement = elements[0];
    const elementId = firstElement.id;

    if (prop === 'color') {
      html += `
        <div class="palette-control">
          <label class="palette-label">Color</label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="color" class="palette-color-picker-multi" data-property="color" value="${commonProps[prop]}" style="width: 50px; height: 36px; border: 1px solid #ddd; border-radius: 3px; cursor: pointer;">
            <input type="text" class="palette-hex-input-multi" data-property="color" value="${commonProps[prop]}" style="flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 3px; font-family: monospace; font-size: 12px;">
          </div>
        </div>
      `;
    } else if (prop === 'fontSize') {
      const sizeValue = parseInt(commonProps[prop]);
      html += `
        <div class="palette-control">
          <label class="palette-label">Font Size</label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="range" class="palette-slider-multi" data-property="fontSize" min="12" max="96" value="${sizeValue}" style="flex: 1; cursor: pointer;">
            <span class="palette-value-multi" data-property="fontSize" style="width: 50px; text-align: right; font-size: 12px; font-weight: 600;">${sizeValue}px</span>
          </div>
        </div>
      `;
    }
  });

  html += `<p style="font-size: 11px; color: #999; margin-top: 12px; font-style: italic;">
    Select a single element for full editing options
  </p>`;
  html += `</div>`;
  return html;
}

/**
 * Attach event listeners to palette controls
 */
function attachPaletteListeners() {
  // Single element controls
  document.addEventListener('change', (e) => {
    const target = e.target;

    // Text textarea
    if (target.classList.contains('palette-textarea')) {
      const elementId = target.dataset.elementId;
      const property = target.dataset.property;
      const value = target.value;
      emitPaletteEdit(elementId, property, value);
    }

    // Select dropdowns
    if (target.classList.contains('palette-select')) {
      const elementId = target.dataset.elementId;
      const property = target.dataset.property;
      const value = target.value;
      emitPaletteEdit(elementId, property, value);
    }

    // Color pickers
    if (target.classList.contains('palette-color-picker')) {
      const elementId = target.dataset.elementId;
      const property = target.dataset.property;
      const value = target.value;
      emitPaletteEdit(elementId, property, value);

      // Update paired hex input
      const pairedInput = document.querySelector(`.palette-hex-input[data-element-id="${elementId}"][data-property="${property}"]`);
      if (pairedInput) pairedInput.value = value;
    }

    // Hex inputs
    if (target.classList.contains('palette-hex-input')) {
      const elementId = target.dataset.elementId;
      const property = target.dataset.property;
      const value = target.value;
      if (/^#[0-9A-F]{6}$/i.test(value)) {
        emitPaletteEdit(elementId, property, value);

        // Update paired color picker
        const pairedPicker = document.querySelector(`.palette-color-picker[data-element-id="${elementId}"][data-property="${property}"]`);
        if (pairedPicker) pairedPicker.value = value;
      }
    }

    // Range sliders
    if (target.classList.contains('palette-slider')) {
      const elementId = target.dataset.elementId;
      const property = target.dataset.property;
      const value = target.value + 'px';
      emitPaletteEdit(elementId, property, value);

      // Update display
      const display = document.querySelector(`.palette-value[data-property="${property}"]`);
      if (display) display.textContent = target.value + 'px';
    }
  });
}

/**
 * Emit palette-edit CustomEvent for #4 to catch
 */
function emitPaletteEdit(elementId, property, value) {
  const event = new CustomEvent('palette-edit', {
    detail: {
      elementId: elementId,
      property: property,
      newValue: value
    }
  });
  document.dispatchEvent(event);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generatePalette, attachPaletteListeners };
}
