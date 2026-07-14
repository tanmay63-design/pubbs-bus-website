// ── Features Tabs: SVG path morph + gradient tween ──
(function () {
    const PATHS = [
        'M0 233.5C781.628 357.331 1200.38 303.274 1920 0V900C1231.23 507.241 811.438 468.45 0 714.5V233.5Z',
        'M0 233.5C782.198 419.606 1201 372.164 1920 0V900C1174.89 712.651 748.539 697.763 0 714.5V233.5Z',
        'M0 374.17C719.002 710.04 1137.8 168 1920 0V734.81C1171.46 719.7 745.108 730.88 0 900V374.17Z'
    ];
    const GRADIENTS = [
        ['#1C7BF6', '#AC1DFF'],
        ['#1C7BF6', '#1CF6B1'],
        ['#D91CF6', '#F6891C']
    ];
    const GRAD_LINES = [
        [1233.5, 800, 1149.5, 231],
        [1233.5, 800, 1149.5, 231],
        [686.5, 899.5, 770.5, 330.5]
    ];

    const pathEl    = document.getElementById('bgMorphPath');
    const patternEl = document.getElementById('bgMorphPattern');
    const gradEl    = document.getElementById('bgGrad');
    const gradStops = gradEl ? gradEl.querySelectorAll('stop') : [];
    if (pathEl)    pathEl.setAttribute('d', PATHS[0]);
    if (patternEl) patternEl.setAttribute('d', PATHS[0]);

    // Replace each number with '|' placeholder (| never appears in SVG paths)
    function parsePath(d) {
        const nums = [];
        const template = d.replace(/-?\d+(\.\d+)?/g, m => {
            nums.push(parseFloat(m));
            return '|';
        });
        return { nums, template };
    }
    function buildPath(template, nums) {
        let i = 0;
        return template.replace(/\|/g, () => {
            return (Math.round(nums[i++] * 100) / 100).toString();
        });
    }
    const parsed = PATHS.map(parsePath);

    function hexToRgb(h) {
        h = h.replace('#', '');
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        const v = parseInt(h, 16);
        return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
    }
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('');
    }
    const GRADIENTS_RGB = GRADIENTS.map(([a, b]) => [hexToRgb(a), hexToRgb(b)]);

    function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    let currentIndex = 0;
    let rafId = null;

    function morphTo(targetIdx, duration) {
        if (rafId) cancelAnimationFrame(rafId);
        const fromIndex = currentIndex;
        const toIndex   = targetIdx;
        const fromNums  = parsed[fromIndex].nums;
        const toNums    = parsed[toIndex].nums;
        const template  = parsed[toIndex].template;
        const fromGrad  = GRADIENTS_RGB[fromIndex];
        const toGrad    = GRADIENTS_RGB[toIndex];
        const start     = performance.now();

        function tick(now) {
            const raw = Math.min(1, (now - start) / duration);
            const t   = easeInOut(raw);
            const out = fromNums.map((f, i) => f + (toNums[i] - f) * t);
            const dStr = buildPath(template, out);
            if (pathEl)    pathEl.setAttribute('d', dStr);
            if (patternEl) patternEl.setAttribute('d', dStr);
            for (let s = 0; s < 2; s++) {
                const r = fromGrad[s][0] + (toGrad[s][0] - fromGrad[s][0]) * t;
                const g = fromGrad[s][1] + (toGrad[s][1] - fromGrad[s][1]) * t;
                const b = fromGrad[s][2] + (toGrad[s][2] - fromGrad[s][2]) * t;
                if (gradStops[s]) gradStops[s].setAttribute('stop-color', rgbToHex(r, g, b));
            }
            const fl = GRAD_LINES[fromIndex];
            const tl = GRAD_LINES[toIndex];
            if (gradEl) {
                gradEl.setAttribute('x1', fl[0] + (tl[0] - fl[0]) * t);
                gradEl.setAttribute('y1', fl[1] + (tl[1] - fl[1]) * t);
                gradEl.setAttribute('x2', fl[2] + (tl[2] - fl[2]) * t);
                gradEl.setAttribute('y2', fl[3] + (tl[3] - fl[3]) * t);
            }
            if (raw < 1) {
                rafId = requestAnimationFrame(tick);
            } else {
                currentIndex = toIndex;
                rafId = null;
            }
        }
        rafId = requestAnimationFrame(tick);
    }

    const tabs   = document.querySelectorAll('.features-tab');
    const panels = document.querySelectorAll('.features-panel');

    function activate(idx) {
        tabs.forEach((t, i) => {
            const active = i === idx;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        panels.forEach((p, i) => {
            if (i === idx) {
                p.classList.remove('active');
                void p.offsetWidth;
                p.classList.add('active');
            } else {
                p.classList.remove('active');
            }
        });
        morphTo(idx, 200);
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('mousedown', e => e.preventDefault());
        tab.addEventListener('click', e => {
            e.preventDefault();
            const sx = window.scrollX, sy = window.scrollY;
            document.querySelectorAll('.features-section .scroll-fade').forEach(el => {
                el.classList.add('visible');
            });
            activate(i);
            requestAnimationFrame(() => window.scrollTo(sx, sy));
        });
        tab.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') activate((i + 1) % tabs.length);
            if (e.key === 'ArrowLeft')  activate((i - 1 + tabs.length) % tabs.length);
        });
    });
})();

// ── Dark Features Tabs ──
(function () {
    const tabs   = document.querySelectorAll('.dark-features-tab');
    const panels = document.querySelectorAll('.dark-features-panel');

    function activateDark(idx) {
        tabs.forEach((t, i) => t.classList.toggle('active', i === idx));
        panels.forEach((p, i) => {
            if (i === idx) {
                p.classList.remove('active');
                void p.offsetWidth;
                p.classList.add('active');
            } else {
                p.classList.remove('active');
            }
        });
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('mousedown', e => e.preventDefault());
        tab.addEventListener('click', () => {
            const sx = window.scrollX, sy = window.scrollY;
            activateDark(i);
            requestAnimationFrame(() => window.scrollTo(sx, sy));
        });
        tab.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') activateDark((i + 1) % tabs.length);
            if (e.key === 'ArrowLeft')  activateDark((i - 1 + tabs.length) % tabs.length);
        });
    });
})();
