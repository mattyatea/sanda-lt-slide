import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs';

// A static site with only the deck: index.html plus the images and fonts it loads.
// Speaker notes (HTML comments that are not Marp directives) are left out.
const outDir = 'dist/site';
const directive = /^<!--\s*_?[a-zA-Z][\w-]*\s*:/;

const markdown = readFileSync('slides/index.md', 'utf8')
    .replace(/\n?<!--[\s\S]*?-->/g, (comment) => directive.test(comment.trim()) ? comment : '');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

execFileSync(process.execPath, ['node_modules/@marp-team/marp-cli/marp-cli.js', '-o', `${outDir}/index.html`], {
    input: markdown,
    stdio: ['pipe', 'inherit', 'inherit'],
});

cpSync('slides/assets', `${outDir}/assets`, { recursive: true });
cpSync('slides/fonts', `${outDir}/fonts`, { recursive: true });
console.log(`Built ${outDir}/index.html`);
