# Axxilak Appling System - Technical Design Document

**For:** GemmyB (Gemini)
**From:** Claude (executing Product Polish)
**Date:** 2026-02-02
**Status:** Design Phase (Ready for Implementation)

---

## Executive Summary

An **appling** is a reusable, modular code component for Axxilak weblings. It encapsulates a specific feature (theme toggle, contact form, etc.) and can be injected into any webling with minimal customization.

**Current State:** All 13 weblings have the theme toggle + contact form applied directly (Product Polish, committed Feb 2).

**Next Phase:** Build the appling infrastructure so future patches can be deployed via modules instead of direct file edits.

---

## What is an Appling?

An appling is NOT:
- A React component
- A build-time dependency
- A CDN-loaded script (though it could be)
- A replacement for webling_editor.js

An appling IS:
- A self-contained HTML/CSS/JS module
- Designed for runtime injection
- Named, versioned, and registerable
- Customizable via simple parameters
- Zero-conflict (no global namespace pollution)

---

## The Three Applings (Current Pipeline)

### 1. Theme Toggle Appling

**Purpose:** Light/dark mode switching with localStorage persistence

**Files involved:**
- CSS: Theme toggle styles + [data-theme="light"] overrides
- JS: toggleTheme(), localStorage initialization
- HTML: Button with id="theme-icon"

**Customization points:**
- CSS color variables (--bg, --text, --accent, etc.)
- Icon styles (size, opacity, transition)
- localStorage key name

**Complexity:** Low (4KB CSS + JS)

**Current implementation:** Hard-coded in each webling's `<style>` and `<script>` tags

---

### 2. Universal Contact Form Appling

**Purpose:** Standardized name/email/message form with success feedback

**Files involved:**
- HTML: Form structure (4 fields + success div)
- CSS: Input/button/textarea styling
- JS: showThanks(e) function with 500ms delay

**Customization points:**
- Form action (mailto: target)
- Input/button CSS classes (to match webling theme)
- Success message text
- Placeholder text

**Complexity:** Medium (8KB HTML + CSS + JS)

**Current implementation:** Manually tailored to each webling's design language

---

### 3. Web Analytics Appling (Future)

**Purpose:** Track webling visitor stats without cookies

**Files involved:**
- JS: Beacon calls to Axxilak metrics API
- HTML: None (injected via script tag)
- CSS: None

**Customization points:**
- Metrics endpoint
- Webling identifier
- Event types to track

**Complexity:** Low (2KB JS)

**Status:** Design phase (not yet implemented)

---

## Appling Registry System

All applings would be registered in a manifest file:

```json
{
  "applings": {
    "theme-toggle": {
      "version": "1.0.0",
      "name": "Theme Toggle",
      "description": "Light/dark mode with localStorage",
      "files": ["theme-toggle.css", "theme-toggle.js"],
      "requires": [],
      "params": {
        "storageKey": { "type": "string", "default": "theme" },
        "icons": { "type": "object", "default": { "light": "🌙", "dark": "☀️" } }
      }
    },
    "contact-form": {
      "version": "1.0.0",
      "name": "Universal Contact Form",
      "description": "Standardized form with name/email/message",
      "files": ["contact-form.html", "contact-form.css", "contact-form.js"],
      "requires": [],
      "params": {
        "actionEmail": { "type": "string", "required": true },
        "successMessage": { "type": "string", "default": "Message Sent!" },
        "cssClasses": { "type": "object", "default": {} }
      }
    },
    "analytics": {
      "version": "0.1.0",
      "name": "Analytics Beacon",
      "description": "Track visitor stats via Axxilak metrics",
      "files": ["analytics.js"],
      "requires": [],
      "params": {
        "metricsEndpoint": { "type": "string", "required": true },
        "weblingId": { "type": "string", "required": true }
      }
    }
  }
}
```

---

## Implementation Architecture

### Option A: Manual Injection (Simple, Current Approach)

Each webling has applings copy-pasted directly into its HTML.

**Pros:**
- No dependency system
- Works with static files
- Zero runtime overhead
- Easy to customize per-webling

**Cons:**
- Updates require manual re-patching
- Prone to version drift
- Hard to track which weblings have which version

**Use case:** Perfect for "set once, evolve slowly" weblings

---

### Option B: Dynamic Injection via webling_editor.js (Hybrid)

The webling_editor.js file loads a manifest and injects applings at runtime:

```javascript
// In webling_editor.js
async function loadApplings(weblingConfig) {
  const applingRegistry = await fetch('../applings/manifest.json');
  const manifest = await applingRegistry.json();

  for (const applingName of weblingConfig.applings) {
    const appling = manifest.applings[applingName];

    // Load CSS
    const style = document.createElement('style');
    const css = await fetch(`../applings/${applingName}/${appling.files.css}`);
    style.innerHTML = await css.text();
    document.head.appendChild(style);

    // Load HTML (e.g., form)
    if (appling.files.html) {
      const html = await fetch(`../applings/${applingName}/${appling.files.html}`);
      const template = await html.text();
      document.body.appendChild(template);
    }

    // Load JS and execute with params
    const js = await import(`../applings/${applingName}/${appling.files.js}`);
    js.init(weblingConfig.params[applingName]);
  }
}

// In webling's index.html (metadata)
<script>
  window.weblingConfig = {
    applings: ['theme-toggle', 'contact-form'],
    params: {
      'theme-toggle': { storageKey: 'theme' },
      'contact-form': { actionEmail: 'scholar@axxilak.com' }
    }
  };
  loadApplings(window.weblingConfig);
</script>
```

**Pros:**
- Single source of truth for each appling
- Easy to update all weblings simultaneously
- Version control built-in
- Params driven (customizable per-webling)

**Cons:**
- Requires fetch API (all modern browsers, but offline won't work)
- Adds complexity to webling_editor.js
- Network requests (minor performance cost)

**Use case:** Better for "evolving platform" where you update applings frequently

---

### Option C: Build-Time Module System (Advanced)

Use a bundler (Vite, esbuild) to compile applings into each webling:

```typescript
// build.ts
import { compileWebling } from './compiler';

for (const weblingName of weblingNames) {
  const weblingConfig = require(`./weblings/${weblingName}/config.json`);
  compileWebling({
    name: weblingName,
    baseHTML: `./weblings/${weblingName}/index.html`,
    applings: weblingConfig.applings,
    output: `./dist/${weblingName}/index.html`
  });
}
```

**Pros:**
- Zero runtime overhead
- Can tree-shake unused code
- Easy to versioning and rollback
- Supports complex dependency graphs

**Cons:**
- Requires a build step
- More tooling complexity
- Not suitable for "click to edit" systems

**Use case:** When performance/reliability is critical

---

## Recommended Path Forward

**Phase 1 (Current):** Manual injection (DONE - all 13 weblings patched)

**Phase 2 (Proposed):** Create appling files + registry

```
Websites/Axxilak/applings/
├── manifest.json
├── theme-toggle/
│   ├── index.js     (exports init function)
│   ├── styles.css
│   └── README.md
├── contact-form/
│   ├── index.js
│   ├── template.html
│   ├── styles.css
│   └── README.md
└── analytics/
    ├── index.js
    ├── styles.css
    └── README.md
```

**Phase 3 (Later):** Integrate appling loader into webling_editor.js (Option B)

**Phase 4 (Optional):** Build-time compilation system (Option C) if/when performance becomes critical

---

## For Gemmy: Implementation Checklist

If you choose to build the appling system:

- [ ] Extract theme-toggle appling
  - [ ] Create `applings/theme-toggle/index.js` with `init()` function
  - [ ] Create `applings/theme-toggle/styles.css` with parameterizable colors
  - [ ] Create `applings/theme-toggle/README.md` with usage docs
  - [ ] Test on Scholar webling

- [ ] Extract contact-form appling
  - [ ] Create `applings/contact-form/template.html` (skeleton)
  - [ ] Create `applings/contact-form/index.js` with form initialization
  - [ ] Create `applings/contact-form/styles.css` (theme-agnostic)
  - [ ] Test on multiple weblings with different styles

- [ ] Create appling manifest
  - [ ] List all applings with versions
  - [ ] Define customization params
  - [ ] Document param types and defaults

- [ ] Create appling loader
  - [ ] Modify webling_editor.js to load manifest
  - [ ] Implement dynamic CSS/HTML/JS injection
  - [ ] Add error handling and fallbacks

- [ ] Create deployment test
  - [ ] Add new webling with applings via config only
  - [ ] Verify all components load correctly
  - [ ] Test across desktop/mobile

---

## Why This Matters

**Current state:** 13 weblings, 13 copies of the same code = 13x maintenance burden

**With applings:**
- 1 theme toggle to maintain
- 1 contact form to maintain
- Easy to audit and fix bugs once
- New weblings inherit best practices automatically

**Future:** When you want to add "dark mode avatar generation" or "PDF export", you build ONE appling and deploy it to all 13 instantly.

---

## Questions for Gemmy

1. **Would you rather maintain applings in separate files, or inline in weblings?**
   - Separate = cleaner, requires loader infrastructure
   - Inline = simpler, manual updates needed

2. **Should applings be versioned independently or as a suite?**
   - Independent = fine-grained control, complex dependencies
   - Suite = all update together, simpler to understand

3. **How critical is offline compatibility?**
   - High = avoid fetch, use inline or build-time injection
   - Low = fetch-based loader is fine

4. **Should applings be open-source (NPM package) or internal only?**
   - Open = community contributions, external audits
   - Internal = faster iteration, proprietary IP

---

## References

- Product Polish commit: `2c0845e` (all 13 weblings patched, Product Polish complete)
- Current implementation: `Websites/Axxilak/Weblings/*/index.html`
- Universal Patch Kit applied: theme-toggle + contact-form (hardcoded)

---

**Status:** Ready for Phase 2
**Blockers:** None
**Next action:** Timothy/Gemmy to decide on appling strategy (Phase 2 vs. defer to Phase 3)
