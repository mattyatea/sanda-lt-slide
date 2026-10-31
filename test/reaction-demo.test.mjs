import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('reaction demo increments one count per arrival and stops when leaving the slide', () => {
    let active = true;
    let sync;
    let pending;
    const badges = Array.from({ length: 6 }, () => ({
        hidden: false, count: { textContent: '1' },
        querySelector() { return this.count; },
        getAnimations() { return []; }, animate() {},
    }));
    const row = {
        closest: () => ({ classList: { contains: () => active } }),
        querySelectorAll: () => badges,
        classList: { toggle() {} },
    };
    runInNewContext(readFileSync(new URL('../lib/reaction-demo.js', import.meta.url), 'utf8'), {
        document: { readyState: 'complete', hidden: false, querySelector: () => row, addEventListener() {} },
        matchMedia: () => ({ matches: false, addEventListener() {} }),
        MutationObserver: class { constructor(callback) { sync = callback; } observe() {} },
        setTimeout(callback) { pending = callback; return 1; },
        clearTimeout() { pending = null; },
        Math,
    });
    assert.ok(badges.every(badge => badge.hidden));
    for (let i = 0; i < 20; i++) pending();
    assert.equal(badges.filter(b => !b.hidden).reduce((sum, b) => sum + Number(b.count.textContent), 0), 20);
    active = false;
    sync();
    assert.equal(pending, null);
    assert.ok(badges.every(badge => !badge.hidden));
    active = true;
    sync();
    assert.ok(badges.every(badge => badge.hidden));
    pending();
    assert.equal(badges.filter(b => !b.hidden).length, 1);
});
