/*
 * Dependency-free recovery mode for the flat calculator.
 * If the Three.js module cannot load or crashes before startup completes,
 * keep the 2D calculator usable and show a clear message in the 3D viewport.
 */
(() => {
  const moduleScript = document.querySelector('#datamathModuleScript');
  let activated = false;

  function activateFallback(reason) {
    if (activated || window.__datamathAppReady) return;
    activated = true;
    window.__datamathFallbackActive = true;

    const keypad = document.querySelector('#keypad');
    const display = document.querySelector('#display');
    const loadState = document.querySelector('#loadState');
    const viewLabel = document.querySelector('#viewLabel');
    const scene = document.querySelector('#scene');
    if (!keypad || !display) return;

    // A partial module startup may have already inserted some buttons.
    keypad.replaceChildren();
    const keys = [
      ['CE/D', 'ce', 1, 1], ['÷', 'op:/', 1, 2], ['×', 'op:*', 1, 3], ['C', 'clear', 1, 4],
      ['7', 'num:7', 2, 1], ['8', 'num:8', 2, 2], ['9', 'num:9', 2, 3], ['−', 'op:-', 2, 4],
      ['4', 'num:4', 3, 1], ['5', 'num:5', 3, 2], ['6', 'num:6', 3, 3], ['+', 'op:+', 3, 4],
      ['1', 'num:1', 4, 1], ['2', 'num:2', 4, 2], ['3', 'num:3', 4, 3],
      ['0', 'num:0', 5, 1], ['.', 'decimal', 5, 3], ['=', 'equals', 5, 4]
    ];

    let current = '0', stored = null, operator = null, waiting = false;
    let lastOperand = null, lastOperator = null;
    const tidy = n => {
      if (!Number.isFinite(n)) return 'Error';
      if (Math.abs(n) > 99999999) return n.toExponential(2);
      return String(Number(n.toPrecision(8)));
    };
    const calculate = (a, b, op) => {
      if (op === '+') return a + b;
      if (op === '-') return a - b;
      if (op === '*') return a * b;
      if (op === '/') return b === 0 ? NaN : a / b;
      return b;
    };
    function show() { display.textContent = current; }
    function press(action) {
      if (action.startsWith('num:')) {
        const n = action.slice(4);
        current = waiting || current === 'Error' ? n : current === '0' ? n : (current + n).slice(0, 12);
        waiting = false;
      } else if (action === 'decimal') {
        if (waiting || current === 'Error') { current = '0.'; waiting = false; }
        else if (!current.includes('.')) current += '.';
      } else if (action === 'clear') {
        current = '0'; stored = null; operator = null; waiting = false;
        lastOperand = null; lastOperator = null;
      } else if (action === 'ce') {
        current = '0'; waiting = false;
      } else if (action === 'sign') {
        if (current !== '0' && current !== 'Error') current = current.startsWith('-') ? current.slice(1) : '-' + current;
      } else if (action.startsWith('op:')) {
        const next = action.slice(3), value = Number(current === 'Error' ? '0' : current);
        if (operator && !waiting) { current = tidy(calculate(stored, value, operator)); stored = Number(current); }
        else stored = value;
        operator = next; waiting = true; lastOperator = null;
      } else if (action === 'equals') {
        if (operator && !waiting) {
          lastOperand = Number(current); lastOperator = operator;
          current = tidy(calculate(stored, lastOperand, operator));
          stored = null; operator = null; waiting = true;
        } else if (lastOperator && lastOperand !== null) {
          current = tidy(calculate(Number(current), lastOperand, lastOperator)); waiting = true;
        }
      }
      show();
    }

    keys.forEach(([label, action, row, col]) => {
      const button = document.createElement('button');
      const isFunction = ['CE/D', 'C'].includes(label);
      const isOperator = ['÷', '×', '−', '+'].includes(label);
      button.className = 'key' + (isFunction ? ' utility' : '') + (isOperator || label === '=' ? ' operator' : '');
      button.type = 'button';
      button.textContent = label;
      button.setAttribute('aria-label', label === 'C' ? 'Clear all' : label);
      button.style.gridRow = String(row);
      button.style.gridColumn = label === '0' ? '1 / span 2' : String(col);
      button.addEventListener('click', () => {
        press(action);
        button.classList.add('pressed');
        window.setTimeout(() => button.classList.remove('pressed'), 90);
      });
      keypad.appendChild(button);
    });

    // Replace any partially registered keyboard handler with a guarded fallback handler.
    if (!window.__datamathFallbackKeyboardBound) {
      window.__datamathFallbackKeyboardBound = true;
      window.addEventListener('keydown', event => {
        if (!window.__datamathFallbackActive || event.metaKey || event.ctrlKey || event.altKey) return;
        const map = { Enter: 'equals', '=': 'equals', Escape: 'clear', Backspace: 'ce', '+': 'op:+', '-': 'op:-', '*': 'op:*', '/': 'op:/', '.': 'decimal' };
        let action = map[event.key];
        if (/^\\d$/.test(event.key)) action = 'num:' + event.key;
        if (action) { event.preventDefault(); press(action); }
      });
    }

    if (loadState) loadState.textContent = '3D UNAVAILABLE — 2D CALCULATOR ACTIVE';
    if (viewLabel) viewLabel.textContent = '2D FALLBACK';
    if (scene && !scene.querySelector('.render-fallback-notice')) {
      const notice = document.createElement('div');
      notice.className = 'render-fallback-notice';
      notice.setAttribute('role', 'status');
      notice.textContent = 'The 3D view could not start. The 2D calculator still works below. Check your connection and reload to retry 3D.';
      scene.appendChild(notice);
    }
    console.error('Datamath entered 2D recovery mode:', reason);
  }

  if (moduleScript) {
    moduleScript.addEventListener('error', () => activateFallback('The 3D module or one of its CDN imports failed to load.'));
  }
  window.addEventListener('error', event => {
    if (event instanceof ErrorEvent && !window.__datamathAppReady) {
      activateFallback(event.message || 'A JavaScript or WebGL startup error occurred.');
    }
  });
  window.addEventListener('unhandledrejection', event => {
    if (!window.__datamathAppReady) activateFallback(event.reason || 'A startup promise was rejected.');
  });

  // A timeout also covers browsers that fail to dispatch a useful module-load error.
  window.setTimeout(() => {
    if (!window.__datamathAppReady) activateFallback('The 3D startup did not finish in time.');
  }, 8000);
})();
