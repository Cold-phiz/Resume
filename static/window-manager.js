const windows = document.querySelectorAll('.window');
  let activeWindow = null;
  let startX = 0;
  let startY = 0;

  windows.forEach(window => {
    const position = { x: 0, y: 0 };
    window.position = position;
    
    window.addEventListener('mousedown', e => dragStart(e, window));
    window.addEventListener('touchstart', e => dragStart(e, window), { passive: false });
    window.addEventListener('transitionend', () => {
      // Get the computed transform when transition ends
      const style = window.style.transform;
      const match = style.match(/translate\((-?\d+\.?\d*)px,\s*(-?\d+\.?\d*)px\)/);
      if (match) {
        window.position.x = parseFloat(match[1]);
        window.position.y = parseFloat(match[2]);
      }
    });
  });

  document.addEventListener('mousemove', drag);
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('touchend', dragEnd);

  function dragStart(e, window) {
    if (activeWindow) {
      // Remove transition from previously active window
      activeWindow.classList.remove('dragging');
      // Capture the current position from the transform
      const style = activeWindow.style.transform;
      const match = style.match(/translate\((-?\d+\.?\d*)px,\s*(-?\d+\.?\d*)px\)/);
      if (match) {
        activeWindow.position.x = parseFloat(match[1]);
        activeWindow.position.y = parseFloat(match[2]);
      }
    }
    
    activeWindow = window;
    const position = activeWindow.position;
    
    if (e.type === 'touchstart') {
      startX = e.touches[0].clientX - position.x;
      startY = e.touches[0].clientY - position.y;
    } else {
      startX = e.clientX - position.x;
      startY = e.clientY - position.y;
    }

    // Bring window to front
    windows.forEach(w => w.style.zIndex = "1");
    activeWindow.style.zIndex = "2";
    
    // Add transition class for smooth movement
    activeWindow.classList.add('dragging');
  }

  function drag(e) {
    if (!activeWindow) return;
    e.preventDefault();

    let x, y;
    if (e.type === 'touchmove') {
      x = e.touches[0].clientX - startX;
      y = e.touches[0].clientY - startY;
    } else {
      x = e.clientX - startX;
      y = e.clientY - startY;
    }

    activeWindow.position.x = x;
    activeWindow.position.y = y;
    
    activeWindow.style.transform = `translate(${x}px, ${y}px)`;
  }

  function dragEnd() {
    if (!activeWindow) return;
    
    // Get the current computed transform
    const style = window.getComputedStyle(activeWindow);
    const matrix = new DOMMatrix(style.transform);
    
    // Update position to current visual position
    activeWindow.position.x = matrix.m41;
    activeWindow.position.y = matrix.m42;
    
    // Update transform to match current position exactly
    activeWindow.style.transform = `translate(${matrix.m41}px, ${matrix.m42}px)`;
    
    activeWindow.classList.remove('dragging');
    activeWindow = null;
  }