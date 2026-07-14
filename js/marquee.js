// ── Smooth marquee hover deceleration ──
(function () {
    const wrapper = document.querySelector('.marquee-wrapper');
    const track   = document.querySelector('.marquee-track');
    if (!wrapper || !track) return;

    let rafId   = null;
    let rate    = 1;
    let hovered = false;

    function tweenRate(target) {
        cancelAnimationFrame(rafId);
        function step() {
            rate += (target - rate) * 0.32;
            if (Math.abs(target - rate) < 0.004) rate = target;
            const anim = track.getAnimations()[0];
            if (anim) anim.updatePlaybackRate(rate);
            if (rate !== target) rafId = requestAnimationFrame(step);
        }
        rafId = requestAnimationFrame(step);
    }

    // Use pointermove on document so bounds are rechecked after every
    // reflow (e.g. DevTools opening/resizing the viewport).
    document.addEventListener('pointermove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const over = e.clientX >= rect.left && e.clientX <= rect.right &&
                     e.clientY >= rect.top  && e.clientY <= rect.bottom;
        if (over === hovered) return;
        hovered = over;
        tweenRate(over ? 0 : 1);
    });

    // Resume when cursor leaves the browser window entirely.
    document.addEventListener('pointerleave', () => {
        if (!hovered) return;
        hovered = false;
        tweenRate(1);
    });

    // Resume when the tab/window loses focus (e.g. clicking into DevTools).
    window.addEventListener('blur', () => {
        if (!hovered) return;
        hovered = false;
        tweenRate(1);
    });

    // Force Chrome to initialize the Animation object and compositor layer
    // before first hover, eliminating the first-interaction glitch.
    requestAnimationFrame(() => {
        const anim = track.getAnimations()[0];
        if (anim) anim.updatePlaybackRate(1);
    });
})();
