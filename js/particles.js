// ── Particles ──
(function () {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    const section = document.querySelector('.ecosystem-section');

    const QUANTITY   = 100;
    const STATICITY  = 50;
    const EASE       = 50;
    const BASE_SIZE  = 0.4;
    const COLOR      = '#ffffff';
    const VX = 0, VY = 0;
    const dpr = window.devicePixelRatio || 1;

    let canvasW = 0, canvasH = 0;
    let circles = [];
    const mouse = { x: 0, y: 0 };
    let rafID = null;

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const v = parseInt(hex, 16);
        return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
    }

    const rgb = hexToRgb(COLOR);

    function circleParams() {
        return {
            x: Math.floor(Math.random() * canvasW),
            y: Math.floor(Math.random() * canvasH),
            translateX: 0,
            translateY: 0,
            size: Math.floor(Math.random() * 2) + BASE_SIZE,
            alpha: 0,
            targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
            dx: (Math.random() - 0.5) * 0.1,
            dy: (Math.random() - 0.5) * 0.1,
            magnetism: 0.1 + Math.random() * 4
        };
    }

    function drawCircle(c, update = false) {
        ctx.translate(c.translateX, c.translateY);
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${c.alpha})`;
        ctx.fill();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (!update) circles.push(c);
    }

    function resizeCanvas() {
        canvasW = section.offsetWidth;
        canvasH = section.offsetHeight;
        canvas.width  = canvasW * dpr;
        canvas.height = canvasH * dpr;
        canvas.style.width  = canvasW + 'px';
        canvas.style.height = canvasH + 'px';
        ctx.scale(dpr, dpr);
        circles = [];
        for (let i = 0; i < QUANTITY; i++) drawCircle(circleParams());
    }

    function remapValue(v, s1, e1, s2, e2) {
        const r = ((v - s1) * (e2 - s2)) / (e1 - s1) + s2;
        return r > 0 ? r : 0;
    }

    function animate() {
        ctx.clearRect(0, 0, canvasW, canvasH);
        circles.forEach((c, i) => {
            const edge = [
                c.x + c.translateX - c.size,
                canvasW - c.x - c.translateX - c.size,
                c.y + c.translateY - c.size,
                canvasH - c.y - c.translateY - c.size
            ];
            const closest = Math.min(...edge);
            const remap = parseFloat(remapValue(closest, 0, 20, 0, 1).toFixed(2));
            if (remap > 1) {
                c.alpha += 0.02;
                if (c.alpha > c.targetAlpha) c.alpha = c.targetAlpha;
            } else {
                c.alpha = c.targetAlpha * remap;
            }
            c.x += c.dx + VX;
            c.y += c.dy + VY;
            c.translateX += (mouse.x / (STATICITY / c.magnetism) - c.translateX) / EASE;
            c.translateY += (mouse.y / (STATICITY / c.magnetism) - c.translateY) / EASE;
            drawCircle(c, true);
            if (c.x < -c.size || c.x > canvasW + c.size ||
                c.y < -c.size || c.y > canvasH + c.size) {
                circles.splice(i, 1);
                drawCircle(circleParams());
            }
        });
        rafID = requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - canvasW / 2;
        const y = e.clientY - rect.top  - canvasH / 2;
        if (x < canvasW / 2 && x > -canvasW / 2 &&
            y < canvasH / 2 && y > -canvasH / 2) {
            mouse.x = x;
            mouse.y = y;
        }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeCanvas, 200);
    });

    resizeCanvas();
    animate();
})();
