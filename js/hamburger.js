// ── Hamburger Menu ──
(function () {
    function init() {
        const btn  = document.getElementById('hamburger');
        const menu = document.getElementById('mobile-menu');
        if (!btn || !menu) return;

        btn.addEventListener('click', () => {
            const open = menu.classList.toggle('open');
            btn.classList.toggle('open', open);
            btn.setAttribute('aria-expanded', open);
        });

        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('open');
                btn.classList.remove('open');
            }
        });

        // ── Mobile submenu (accordion) ──
        document.querySelectorAll('.mobile-menu-toggle').forEach((toggle) => {
            toggle.addEventListener('click', () => {
                const submenu = document.getElementById(toggle.dataset.toggle);
                if (!submenu) return;
                const open = submenu.classList.toggle('open');
                toggle.classList.toggle('open', open);
                toggle.setAttribute('aria-expanded', open);
            });
        });
    }

    if (document.getElementById('hamburger')) {
        init();
    } else {
        document.addEventListener('partials-loaded', init);
    }
})();
