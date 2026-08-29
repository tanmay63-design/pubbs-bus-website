// ── Campus image lightbox (zoom + pan, mouse & touch) ──
(function () {
    const triggers = document.querySelectorAll('.cbs-figure a');
    if (!triggers.length) return;

    // Build overlay once
    const lb = document.createElement('div');
    lb.className = 'cbs-lightbox';
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML = `
        <button class="cbs-lb-close" type="button" aria-label="Close">
            <svg viewBox="0 0 24 24"><path d="M18.3 5.71 12 12l6.3 6.29-1.42 1.42L10.59 13.4 4.3 19.71 2.88 18.3 9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.29-6.3z"/></svg>
        </button>
        <div class="cbs-lb-controls">
            <button type="button" data-act="out" aria-label="Zoom out">&minus;</button>
            <button type="button" data-act="reset" aria-label="Reset zoom">Reset</button>
            <button type="button" data-act="in" aria-label="Zoom in">+</button>
        </div>
        <div class="cbs-lb-stage">
            <img class="cbs-lb-img" alt="" draggable="false">
        </div>
        <span class="cbs-lb-hint">Scroll or pinch to zoom · drag to pan</span>
    `;
    document.body.appendChild(lb);

    const stage = lb.querySelector('.cbs-lb-stage');
    const img   = lb.querySelector('.cbs-lb-img');

    const MIN = 1, MAX = 6;
    let scale = 1, tx = 0, ty = 0;

    function apply() {
        img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        img.classList.toggle('is-zoomed', scale > 1);
    }

    function reset() { scale = 1; tx = 0; ty = 0; apply(); }

    function open(src, alt) {
        img.src = src;
        img.alt = alt || '';
        reset();
        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        lb.classList.remove('is-open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        img.src = '';
    }

    // Clamp pan so the image can't be dragged completely off-screen
    function clamp() {
        const r = stage.getBoundingClientRect();
        const maxX = (img.clientWidth  * scale - r.width)  / 2;
        const maxY = (img.clientHeight * scale - r.height) / 2;
        tx = Math.max(-Math.max(maxX, 0), Math.min(Math.max(maxX, 0), tx));
        ty = Math.max(-Math.max(maxY, 0), Math.min(Math.max(maxY, 0), ty));
    }

    function zoomTo(next, cx, cy) {
        next = Math.max(MIN, Math.min(MAX, next));
        const r = stage.getBoundingClientRect();
        // zoom around pointer position relative to stage centre
        const ox = (cx - r.left - r.width / 2 - tx) / scale;
        const oy = (cy - r.top - r.height / 2 - ty) / scale;
        tx -= ox * (next - scale);
        ty -= oy * (next - scale);
        scale = next;
        if (scale === 1) { tx = 0; ty = 0; }
        clamp();
        apply();
    }

    // ── Open triggers ──
    triggers.forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const src = a.getAttribute('href');
            const im  = a.querySelector('img');
            open(src, im ? im.alt : '');
        });
    });

    // ── Close controls ──
    lb.querySelector('.cbs-lb-close').addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb || e.target === stage) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('is-open')) close(); });

    lb.querySelector('.cbs-lb-controls').addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const r = stage.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        if (btn.dataset.act === 'in')  zoomTo(scale + 0.6, cx, cy);
        if (btn.dataset.act === 'out') zoomTo(scale - 0.6, cx, cy);
        if (btn.dataset.act === 'reset') reset();
    });

    // ── Wheel zoom (desktop) ──
    stage.addEventListener('wheel', e => {
        e.preventDefault();
        zoomTo(scale + (e.deltaY < 0 ? 0.3 : -0.3), e.clientX, e.clientY);
    }, { passive: false });

    // ── Double click / tap to toggle zoom ──
    let lastTap = 0;
    stage.addEventListener('dblclick', e => {
        zoomTo(scale > 1 ? 1 : 2.5, e.clientX, e.clientY);
    });

    // ── Pointer-based pan + pinch (mouse & touch unified) ──
    const pts = new Map();
    let startDist = 0, startScale = 1, startMid = { x: 0, y: 0 };
    let panning = false, panStart = { x: 0, y: 0, tx: 0, ty: 0 };

    stage.addEventListener('pointerdown', e => {
        stage.setPointerCapture(e.pointerId);
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pts.size === 2) {
            const [p1, p2] = [...pts.values()];
            startDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            startScale = scale;
            startMid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        } else if (scale > 1) {
            panning = true;
            panStart = { x: e.clientX, y: e.clientY, tx, ty };
        }

        // double-tap detection (touch)
        if (e.pointerType === 'touch') {
            const now = Date.now();
            if (now - lastTap < 300) zoomTo(scale > 1 ? 1 : 2.5, e.clientX, e.clientY);
            lastTap = now;
        }
    });

    stage.addEventListener('pointermove', e => {
        if (!pts.has(e.pointerId)) return;
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pts.size === 2) {
            const [p1, p2] = [...pts.values()];
            const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            if (startDist > 0) zoomTo(startScale * (dist / startDist), startMid.x, startMid.y);
        } else if (panning) {
            tx = panStart.tx + (e.clientX - panStart.x);
            ty = panStart.ty + (e.clientY - panStart.y);
            clamp();
            apply();
        }
    });

    function endPointer(e) {
        pts.delete(e.pointerId);
        if (pts.size < 2) startDist = 0;
        if (pts.size === 0) panning = false;
    }
    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', endPointer);
})();
