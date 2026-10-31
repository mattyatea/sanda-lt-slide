(() => {
    function init() {
        const row = document.querySelector('.live-reactions');
        if (!row) return;
        const slide = row.closest('svg.bespoke-marp-slide');
        if (!slide) return;
        const badges = [...row.querySelectorAll('.live-reaction')];
        const reduced = matchMedia('(prefers-reduced-motion: reduce)');
        const printing = matchMedia('print');
        let timer;
        let running = false;
        let counts = [];

        function arrive() {
            // Existing reactions are more likely, but new emoji can join at any time.
            const pool = counts.some(Boolean) && Math.random() < .65
                ? badges.filter((_, index) => counts[index] > 0) : badges;
            const badge = pool[Math.floor(Math.random() * pool.length)];
            const index = badges.indexOf(badge);
            counts[index]++;
            badge.hidden = false;
            badge.querySelector('.reaction-count').textContent = counts[index];
            badge.getAnimations().forEach(animation => animation.cancel());
            badge.animate([
                { transform: 'scale(.96)' },
                { transform: 'scale(1.12)', offset: .4 },
                { transform: 'scale(1)' },
            ], { duration: 250, easing: 'cubic-bezier(.23,1,.32,1)' });
            const delay = Math.random() < .25 ? 160 + Math.random() * 240 : 650 + Math.random() * 1600;
            timer = setTimeout(arrive, delay);
        }

        function sync() {
            const active = slide.classList.contains('bespoke-marp-active') && !document.hidden && !reduced.matches && !printing.matches;
            if (active === running) return;
            running = active;
            clearTimeout(timer);
            row.classList.toggle('is-live', active);
            if (active) {
                counts = badges.map(() => 0);
                badges.forEach(badge => { badge.hidden = true; });
                timer = setTimeout(arrive, 450);
            } else {
                badges.forEach((badge, index) => {
                    badge.hidden = false;
                    badge.querySelector('.reaction-count').textContent = [3, 2, 1, 1, 1, 1][index];
                    badge.getAnimations().forEach(animation => animation.cancel());
                });
            }
        }
        new MutationObserver(sync).observe(slide, { attributes: true, attributeFilter: ['class'] });
        document.addEventListener('visibilitychange', sync);
        reduced.addEventListener('change', sync);
        printing.addEventListener('change', sync);
        sync();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
