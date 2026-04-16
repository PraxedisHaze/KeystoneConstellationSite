/**
 * Universal Handler Dispatcher
 * =============================
 * Executes handlers defined in data-handler attributes.
 * Provides centralized, safe handler execution with error handling.
 *
 * Usage in HTML:
 *   <button data-handler="scrollTo('#target')">Click me</button>
 *   <button data-handler="toggleTheme()">Toggle Dark/Light</button>
 */

class HandlerDispatcher {
    constructor() {
        this.handlers = {
            // Scroll to element smoothly
            scrollTo: (selector) => {
                try {
                    const element = document.querySelector(selector);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        // Close mobile menu if open
                        const mobileMenu = document.getElementById('mobile-menu');
                        if (mobileMenu) {
                            mobileMenu.classList.add('hidden');
                        }
                    }
                } catch (e) {
                    console.warn(`[HandlerDispatcher] scrollTo error:`, e);
                }
            },

            // Toggle dark/light theme
            toggleTheme: () => {
                try {
                    // Use existing toggleTheme function if available
                    if (window.toggleTheme && typeof window.toggleTheme === 'function') {
                        window.toggleTheme();
                    }
                } catch (e) {
                    console.warn(`[HandlerDispatcher] toggleTheme error:`, e);
                }
            },

            // Toggle mobile menu visibility
            toggleMobileMenu: () => {
                try {
                    const mobileMenu = document.getElementById('mobile-menu');
                    if (mobileMenu) {
                        mobileMenu.classList.toggle('hidden');
                    }
                } catch (e) {
                    console.warn(`[HandlerDispatcher] toggleMobileMenu error:`, e);
                }
            },

            // Toggle edit mode
            toggleEditMode: () => {
                try {
                    if (window.toggleEditMode && typeof window.toggleEditMode === 'function') {
                        window.toggleEditMode();
                    } else {
                        console.warn('[HandlerDispatcher] toggleEditMode not available');
                    }
                } catch (e) {
                    console.warn(`[HandlerDispatcher] toggleEditMode error:`, e);
                }
            }
        };

        // Bind click handler
        this.attachListeners();
    }

    /**
     * Attach event delegation to document
     */
    attachListeners() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-handler]');
            if (!target) return;

            // EDIT MODE GUARD: Block handlers when inspector is in edit mode
            if (window.inspectorEditMode === true) {
                // Allow clicks only if target is inside palette or internal UI
                const inPalette = e.target.closest('#palette-container');
                const inInternal = e.target.closest('[data-anothen-internal]');

                if (!inPalette && !inInternal) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return false;  // Block handler execution
                }
            }

            const handlerAttr = target.getAttribute('data-handler');
            if (!handlerAttr) return;

            this.execute(handlerAttr);
        });
    }

    /**
     * Parse and execute handler
     * Supports: handlerName('arg'), handlerName(selector), handlerName()
     */
    execute(handlerString) {
        try {
            // Parse handler name and arguments
            const match = handlerString.match(/^(\w+)\((.*)\)$/);
            if (!match) {
                console.warn(`[HandlerDispatcher] Invalid handler format:`, handlerString);
                return;
            }

            const [, handlerName, argsString] = match;

            // Get handler function
            const handler = this.handlers[handlerName];
            if (!handler) {
                console.warn(`[HandlerDispatcher] Unknown handler: ${handlerName}`);
                return;
            }

            // Parse arguments
            let args = [];
            if (argsString.trim()) {
                // Handle quoted strings like 'selector' or "#id"
                const quotedMatch = argsString.match(/^['"](.+?)['"]$/);
                if (quotedMatch) {
                    args = [quotedMatch[1]];
                } else {
                    // Try to parse as JSON for other types
                    try {
                        args = JSON.parse(`[${argsString}]`);
                    } catch {
                        args = [argsString];
                    }
                }
            }

            // Execute handler with error handling
            handler(...args);

        } catch (e) {
            console.error(`[HandlerDispatcher] Execution error:`, e);
        }
    }

    /**
     * Register additional handlers at runtime
     */
    register(name, fn) {
        if (typeof fn === 'function') {
            this.handlers[name] = fn;
        }
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.handlerDispatcher = new HandlerDispatcher();
    });
} else {
    window.handlerDispatcher = new HandlerDispatcher();
}

export { HandlerDispatcher };
