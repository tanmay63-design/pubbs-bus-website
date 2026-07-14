// ── Scroll fade-up observer ──
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.scroll-fade').forEach(el => observer.observe(el));

// ── Split Text Animation ──
(function () {
    const el = document.getElementById('split-text-heading');
    if (!el) return;

    const DURATION = 0.7;
    const STAGGER  = 30;

    const childNodes = Array.from(el.childNodes);
    el.innerHTML = '';

    const allChars = [];

    function splitTextContent(text, isBold) {
        const words = text.trim().split(/\s+/);
        words.forEach(word => {
            if (!word) return;
            const span = document.createElement('span');
            span.textContent = word;
            span.className = 'split-char';
            span.style.cssText = 'display: inline-block; opacity: 0; transform: translateY(40px); margin-right: 0.28em;';
            if (isBold) {
                span.style.fontWeight = '600';
                span.style.color = '#000000';
            }
            el.appendChild(span);
            allChars.push(span);
        });
    }

    childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            splitTextContent(node.textContent, false);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const isBold = node.classList.contains('heading-bold');
            splitTextContent(node.textContent, isBold);
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                allChars.forEach((char, i) => {
                    setTimeout(() => {
                        char.style.transition = `opacity ${DURATION}s cubic-bezier(0.215, 0.61, 0.355, 1), transform ${DURATION}s cubic-bezier(0.215, 0.61, 0.355, 1)`;
                        char.style.opacity = '1';
                        char.style.transform = 'translateY(0)';
                    }, i * STAGGER);
                });
                observer.disconnect();
            }
        });
    }, { threshold: 0.1, rootMargin: '-100px' });

    observer.observe(el);
})();

// ── Text Reveal on Scroll ──
(function () {
    const els = document.querySelectorAll('.sw-text-reveal');
    if (!els.length) return;

    els.forEach(function (el) {
        const words = el.textContent.trim().split(/\s+/);
        el.innerHTML = words
            .map(word => `<span class="sw-reveal-word">${word}</span>`)
            .join(' ');

        const wordEls = Array.from(el.querySelectorAll('.sw-reveal-word'));
        let rafPending = false;

        function update() {
            rafPending = false;

            const rect = el.getBoundingClientRect();
            const vh   = window.innerHeight;

            // Pure viewport-relative: works identically scrolling down OR up
            const revealStart = vh * 0.9;
            const revealEnd   = vh * 0.35;

            let progress = (revealStart - rect.top) / (revealStart - revealEnd);
            progress = Math.max(0, Math.min(1, progress));

            const activeCount = Math.round(progress * wordEls.length);
            wordEls.forEach((word, i) => {
                word.classList.toggle('is-active', i < activeCount);
            });
        }

        function scheduleUpdate() {
            if (!rafPending) {
                rafPending = true;
                requestAnimationFrame(update);
            }
        }

        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate);

        update();
    });
})();

// ── Hero Image Scroll Animation ──
(function () {
    const heroImageWrap = document.querySelector('.hero-image-wrap');
    const heroImageImg  = document.querySelector('.hero-image-wrap img');
    if (!heroImageWrap || !heroImageImg) return;

    let rafPending = false;

    function applyTransform() {
        rafPending = false;

        if (window.innerWidth <= 768) return;

        const rect   = heroImageWrap.getBoundingClientRect();
        const vh     = window.innerHeight;
        const total  = vh + rect.height;
        let p        = Math.max(0, Math.min(1, 1 - rect.bottom / total));
        const adj    = Math.min(1, p * 3.5);

        const isTablet = window.innerWidth <= 1600;

        const rotate    = 20 - 20 * adj;
        const scale     = 1.05 + (1 - 1.05) * adj;
        const translate = (isTablet ? -30 : -100) * adj;

        heroImageImg.style.transform =
            `rotateX(${rotate}deg) scale(${scale}) translateY(${translate}px)`;
    }

    function scheduleUpdate() {
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(applyTransform);
        }
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    applyTransform();
})();
