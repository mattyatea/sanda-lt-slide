import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

test('matches unchanged content, separates changed and repeated content, and preserves fragments', () => {
    const directory = mkdtempSync(join(tmpdir(), 'slide-motion-'));

    try {
        const source = join(directory, 'input.md');
        const output = join(directory, 'output.html');
        writeFileSync(source, `---
marp: true
theme: mattyaski
transition: matcha 300ms
---
<!-- _class: lead -->
# 同じ見出し

同じ本文

同じ本文

---
# 同じ見出し

同じ本文

* 追加した項目

---
# 違う見出し

同じ本文

---
<!-- _class: statement motion-rise -->
# 下から現れる言葉
`);
        execFileSync(process.execPath, ['node_modules/@marp-team/marp-cli/marp-cli.js', source, '-o', output], { stdio: 'pipe' });
        const html = readFileSync(output, 'utf8');
        const slides = [...html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/g)].map(match => match[1]);
        const names = slides.map(slide => [...slide.matchAll(/view-transition-name: (matcha-[\w-]+)/g)].map(match => match[1]));

        assert.equal(slides.length, 4);
        assert.equal(names[0][0], names[1][0], 'unchanged headings must share their motion identity');
        assert.notEqual(names[1][0], names[2][0], 'different headings must not morph into one another');
        assert.equal(names[0][1], names[1][1], 'unchanged paragraphs must retain their motion identity');
        assert.notEqual(names[0][1], names[0][2], 'repeated content in one slide must have distinct identities');
        for (const slideNames of names) assert.equal(new Set(slideNames).size, slideNames.length);
        assert.match(slides[1], /data-marpit-fragment="1"/);
        assert.match(slides[0], /data-matcha-motion="wipe"/);
        assert.match(slides[3], /data-matcha-motion="rise"/);
        assert.match(html, /::view-transition-new\(matcha-[\w-]+\):only-child/);
        assert.match(html, /prefers-reduced-motion: reduce/);
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});

test('story shows one screen at a time and keeps answers off question pages', () => {
    const directory = mkdtempSync(join(tmpdir(), 'delivery-motion-'));
    try {
        const output = join(directory, 'slides.html');
        execFileSync(process.execPath, ['node_modules/@marp-team/marp-cli/marp-cli.js', 'slides/index.md', '-o', output], { stdio: 'pipe' });
        const html = readFileSync(output, 'utf8');
        const slides = [...html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/g)].map(match => match[1]);
        const sceneNames = ['familiar-reader', 'familiar-author', 'other-author', 'other-reader', 'reaction-arrived'];
        for (const sceneName of sceneNames) {
            const scene = slides.find(slide => slide.includes(`data-story-scene="${sceneName}"`));
            assert.ok(scene, sceneName);
            assert.equal((scene.match(/class="everyday-screen"/g) || []).length, 1);
            assert.match(scene, sceneName.startsWith('familiar') ? /やっとボス倒せた〜！！/ : /今日描いた絵、見て〜！/);
        }
        const questions = [...html.matchAll(/<section\b[^>]*class="[^"]*question-beat[^"]*"[^>]*>([\s\S]*?)<\/section>/g)];
        assert.ok(questions.length >= 2);
        for (const question of questions) {
            assert.doesNotMatch(question[1], /everyday-screen|everyday-post|everyday-reply/);
        }
        assert.doesNotMatch(html, /assets\/photos\//);
        const network = slides.find(slide => slide.includes('class="network-stage"'));
        assert.ok(network);
        assert.equal((network.match(/class="network-node"/g) || []).length, 5);
        assert.equal((network.match(/class="network-packet"/g) || []).length, 6);
        assert.doesNotMatch(network, /type="checkbox"/);
        assert.equal((network.match(/data-icon="mail"/g) || []).length, 7);
        assert.match(html, /network-delivery 3.5s/);
        assert.match(html, /animation-play-state:paused/);
        assert.match(html, /section:where\(\.bespoke-marp-active \*\) \.network-packet/);
        assert.match(html, /prefers-reduced-motion/);
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
