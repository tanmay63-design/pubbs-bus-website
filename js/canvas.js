// ── Features Section Flickering Grid with Fade ──
(function () {
    const canvas = document.getElementById('features-flickering-grid');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const section = canvas.closest('section');

    const SQUARE_SIZE = 4;
    const GRID_GAP = 6;
    const COLOR = '#6889B3';
    const MAX_OPACITY = 0.3;
    const FLICKER_CHANCE = 0.1;
    const STEP = SQUARE_SIZE + GRID_GAP;

    let squares = [];
    let currentOpacityMultiplier = 1;

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        const v = parseInt(hex, 16);
        return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
    }
    const rgb = hexToRgb(COLOR);

    function resizeCanvas() {
        canvas.width = section.offsetWidth;
        canvas.height = section.offsetHeight;
        squares = [];
        const cols = Math.ceil(canvas.width / STEP) + 1;
        const rows = Math.ceil(canvas.height / STEP) + 1;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                squares.push({
                    x: c * STEP,
                    y: r * STEP,
                    opacity: Math.random() * MAX_OPACITY
                });
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        squares.forEach(sq => {
            if (Math.random() < FLICKER_CHANCE) {
                sq.opacity = Math.random() * MAX_OPACITY;
            }
            ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${sq.opacity * currentOpacityMultiplier})`;
            ctx.fillRect(sq.x, sq.y, SQUARE_SIZE, SQUARE_SIZE);
        });
        requestAnimationFrame(animate);
    }

    function updateFadeOnScroll() {
        const rect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;
        const fadeEnd = sectionHeight;
        const scrollProgress = -rect.top;
        const fadeFraction = Math.max(0, Math.min(1, scrollProgress / fadeEnd));
        currentOpacityMultiplier = Math.max(0, 1 - fadeFraction);
        canvas.style.opacity = currentOpacityMultiplier;
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeCanvas, 200);
    });

    window.addEventListener('scroll', updateFadeOnScroll);

    resizeCanvas();
    animate();
})();

// ── Transit Role Section Flickering Grid ──
(function () {
    const canvas = document.getElementById('flickering-grid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const section = canvas.closest('section');

    const SQUARE_SIZE = 4;
    const GRID_GAP = 6;
    const COLOR = '#ffffff';
    const MAX_OPACITY = 0.5;
    const FLICKER_CHANCE = 0.1;
    const STEP = SQUARE_SIZE + GRID_GAP;

    let squares = [];

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        const v = parseInt(hex, 16);
        return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
    }
    const rgb = hexToRgb(COLOR);

    function resizeCanvas() {
        canvas.width = section.offsetWidth;
        canvas.height = section.offsetHeight;
        squares = [];
        const cols = Math.ceil(canvas.width / STEP) + 1;
        const rows = Math.ceil(canvas.height / STEP) + 1;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                squares.push({
                    x: c * STEP,
                    y: r * STEP,
                    opacity: Math.random() * MAX_OPACITY
                });
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        squares.forEach(sq => {
            if (Math.random() < FLICKER_CHANCE) {
                sq.opacity = Math.random() * MAX_OPACITY;
            }
            ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${sq.opacity})`;
            ctx.fillRect(sq.x, sq.y, SQUARE_SIZE, SQUARE_SIZE);
        });
        requestAnimationFrame(animate);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeCanvas, 200);
    });

    resizeCanvas();
    animate();
})();
