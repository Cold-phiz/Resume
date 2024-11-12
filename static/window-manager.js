const windows = document.querySelectorAll('.window');
    let activeWindow = null;
    let startX;
    let startY;

    // Position windows randomly without overlap
    function positionWindows() {
      const padding = 20;
      const windowWidth = 290; // width + padding
      const windowHeight = 190; // height + padding
      const viewportWidth = window.innerWidth - windowWidth - padding;
      const viewportHeight = window.innerHeight - windowHeight - padding;
      
      let positions = [];

      windows.forEach(win => {
        let position;
        let attempts = 0;
        const maxAttempts = 100;

        // Keep trying positions until we find one without overlap
        do {
          position = {
            x: Math.floor(Math.random() * viewportWidth),
            y: Math.floor(Math.random() * viewportHeight)
          };
          attempts++;
        } while (
          positions.some(pos => 
            position.x < pos.x + windowWidth &&
            position.x + windowWidth > pos.x &&
            position.y < pos.y + windowHeight &&
            position.y + windowHeight > pos.y
          ) && attempts < maxAttempts
        );

        positions.push(position);
        win.style.left = `${position.x}px`;
        win.style.top = `${position.y}px`;
      });
    }

    // Call on load
    positionWindows();

    // Recalculate positions if window is resized
    window.addEventListener('resize', positionWindows);

    windows.forEach(window => {
      window.addEventListener('mousedown', dragStart);
      window.addEventListener('touchstart', dragStart, { passive: false });
    });

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
      if (e.target.closest('.window')) {
        activeWindow = e.target.closest('.window');
        activeWindow.classList.add('dragging');
        
        // Bring window to front
        windows.forEach(w => w.style.zIndex = "1");
        activeWindow.style.zIndex = "2";

        // Get current transform
        const transform = window.getComputedStyle(activeWindow).transform;
        const matrix = new DOMMatrix(transform);
        const currentX = matrix.m41;
        const currentY = matrix.m42;

        // Get start position
        if (e.type === 'touchstart') {
          startX = e.touches[0].clientX - currentX;
          startY = e.touches[0].clientY - currentY;
        } else {
          startX = e.clientX - currentX;
          startY = e.clientY - currentY;
        }
      }
    }

    function drag(e) {
      if (activeWindow) {
        e.preventDefault();
        
        let x, y;
        if (e.type === 'touchmove') {
          x = e.touches[0].clientX - startX;
          y = e.touches[0].clientY - startY;
        } else {
          x = e.clientX - startX;
          y = e.clientY - startY;
        }

        activeWindow.style.transform = `translate(${x}px, ${y}px)`;
      }
    }

    function dragEnd() {
      if (activeWindow) {
        activeWindow.classList.remove('dragging');
        activeWindow = null;
      }
    }