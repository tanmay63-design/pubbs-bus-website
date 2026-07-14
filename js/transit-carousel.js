// ── Mobile Transit Role Carousel (replaces marquee loop on mobile) ──
(function () {
    const wrapper = document.querySelector('.marquee-wrapper');
    const track = document.querySelector('.marquee-track');
    if (!wrapper || !track) return;

    const HOLD_MS = 2000;
    const mq = window.matchMedia('(max-width: 768px)');

    let cards = [];
    let index = 0;
    let timer = null;

    function getCards() {
        return Array.from(track.querySelectorAll('.transit-card:not(.marquee-duplicate)'));
    }

    function getOffset(i) {
        const card = cards[i];
        return card.offsetLeft - (wrapper.clientWidth - card.offsetWidth) / 2;
    }

    function centerCard(i, animate) {
        const card = cards[i];
        if (!card) return;
        const offset = getOffset(i);
        track.style.transition = animate ? 'transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)' : 'none';
        track.style.transform = `translateX(${-offset}px)`;
    }

    function next() {
        index = (index + 1) % cards.length;
        centerCard(index, true);
    }

    function startTimer() {
        clearInterval(timer);
        timer = setInterval(next, HOLD_MS);
    }

    function start() {
        cards = getCards();
        if (!cards.length) return;
        index = 0;
        centerCard(0, false);
        startTimer();
    }

    function stop() {
        clearInterval(timer);
        timer = null;
        track.style.transition = '';
        track.style.transform = '';
    }

    function handleChange(e) {
        if (e.matches) {
            start();
        } else {
            stop();
        }
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        if (!mq.matches) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => centerCard(index, false), 150);
    });

    // ── Swipe / drag to navigate ──
    let dragging = false;
    let startX = 0;
    let startOffset = 0;

    function onPointerDown(e) {
        if (!mq.matches || !cards.length) return;
        dragging = true;
        clearInterval(timer);
        startX = e.clientX;
        startOffset = -getOffset(index);
        track.style.transition = 'none';
    }

    function onPointerMove(e) {
        if (!dragging) return;
        const delta = e.clientX - startX;
        track.style.transform = `translateX(${startOffset + delta}px)`;
    }

    function onPointerUp(e) {
        if (!dragging) return;
        dragging = false;

        const delta = e.clientX - startX;
        const threshold = wrapper.clientWidth * 0.15;

        if (delta <= -threshold) {
            index = (index + 1) % cards.length;
        } else if (delta >= threshold) {
            index = (index - 1 + cards.length) % cards.length;
        }

        centerCard(index, true);
        startTimer();
    }

    wrapper.addEventListener('pointerdown', onPointerDown);
    wrapper.addEventListener('pointermove', onPointerMove);
    wrapper.addEventListener('pointerup', onPointerUp);
    wrapper.addEventListener('pointercancel', onPointerUp);
    wrapper.addEventListener('pointerleave', (e) => {
        if (dragging) onPointerUp(e);
    });

    mq.addEventListener('change', handleChange);
    if (mq.matches) start();
})();
