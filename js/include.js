// ── Load shared header / mobile-menu / footer partials ──
(function () {
    const PAGE = location.pathname.split('/').pop() || 'index.html';

    function markActive(root) {
        root.querySelectorAll(`a[href="${PAGE}"]`).forEach((a) => a.classList.add('active'));

        const dropdownLink = root.querySelector(`.nav-dropdown a[href="${PAGE}"]`);
        if (dropdownLink) {
            const trigger = dropdownLink.closest('.nav-dropdown')?.querySelector('.nav-dropdown-trigger');
            if (trigger) trigger.classList.add('active');
        }
    }

    const includes = Array.from(document.querySelectorAll('[data-include]'));

    Promise.all(includes.map((el) => {
        const src = el.getAttribute('data-include');
        return fetch(src + '?v=' + Date.now())
            .then((res) => res.text())
            .then((html) => {
                el.innerHTML = html;
                markActive(el);
            })
            .catch((err) => console.error('Failed to load partial:', src, err));
    })).then(() => {
        document.dispatchEvent(new CustomEvent('partials-loaded'));
    });
})();
