import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const reactionScriptPath = new URL('./reaction-demo.js', import.meta.url);
const motionCssPath = new URL('../styles/motion.css', import.meta.url);
const blockTypes = new Set(['heading_open', 'paragraph_open', 'list_item_open', 'table_open']);

// HTML blocks (illustrations, SNS screens, diagrams) are matched by layout, not by content:
// the same block in the same kind of slide crossfades in place, anything else fades in or out.
function nameHtmlBlock(token, sectionClasses, blockIndex, effect) {
    const tag = token.content.match(/^\s*<([a-zA-Z][\w-]*)\b([^>]*)>/);
    if (!tag) return null;

    const firstClass = (tag[2].match(/\bclass="([^"]*)"/) || [, ''])[1].split(/\s+/)[0];
    const key = `${sectionClasses}|${blockIndex}|${tag[1]}.${firstClass}`;
    const name = `matcha-block-${createHash('sha256').update(key).digest('hex').slice(0, 16)}`;
    const attrs = tag[2].includes('style="')
        ? tag[2].replace('style="', `style="view-transition-name: ${name}; `)
        : `${tag[2]} style="view-transition-name: ${name};"`;

    token.content = token.content.replace(tag[0], `<${tag[1]}${attrs} data-matcha-motion="${effect}">`);
    return name;
}

export function installSlideMotion(marp) {
    const effects = new Map();
    const blocks = new Set();

    marp.use((md) => {
        md.core.ruler.push('matcha_element_motion', (state) => {
            effects.clear();
            blocks.clear();
            const occurrences = new Map();
            let listDepth = 0;
            let tableDepth = 0;
            let effect = 'fade';
            let sectionClasses = '';
            let blockIndex = 0;

            for (let index = 0; index < state.tokens.length; index++) {
                const token = state.tokens[index];

                if (token.tag === 'section' && token.nesting === 1) {
                    occurrences.clear();
                    listDepth = 0;
                    tableDepth = 0;
                    blockIndex = 0;
                    const classes = (token.attrGet('class') || '').split(/\s+/);
                    // the layout family (first class) decides what counts as the same block, so `delivery write`
                    // and `delivery deliver` share their stage and only the post moves across
                    sectionClasses = classes.filter(Boolean)[0] || '';
                    effect = classes.includes('motion-rise') ? 'rise'
                        : classes.includes('motion-wipe') || classes.includes('lead') ? 'wipe' : 'fade';
                }

                if (token.type === 'html_block' && !token.content.trimStart().startsWith('<!--')) {
                    const name = nameHtmlBlock(token, sectionClasses, blockIndex++, effect);
                    if (name) blocks.add(name);
                }

                if (token.type === 'list_item_close') listDepth--;
                if (token.type === 'table_close') tableDepth--;

                const nestedParagraph = token.type === 'paragraph_open' && (listDepth > 0 || tableDepth > 0);

                if (blockTypes.has(token.type) && !token.hidden && !nestedParagraph) {
                    const closingType = token.type.replace('_open', '_close');
                    let depth = 1;
                    let content = '';

                    for (let next = index + 1; next < state.tokens.length; next++) {
                        const child = state.tokens[next];
                        if (child.type === token.type) depth++;
                        if (child.type === closingType && --depth === 0) break;
                        if (child.type !== 'inline') continue;

                        content += (child.children || []).map((part) => {
                            if (part.type === 'image') return `image:${part.attrGet('src')}:${part.content}`;
                            if (part.type === 'softbreak' || part.type === 'hardbreak') return ' ';
                            if (part.type === 'html_inline') return ' ';
                            return part.content;
                        }).join('') + ' ';
                    }

                    content = content.replace(/\s+/g, ' ').trim();

                    if (content) {
                        const hash = createHash('sha256').update(content).digest('hex').slice(0, 16);
                        const occurrence = occurrences.get(hash) || 0;
                        occurrences.set(hash, occurrence + 1);
                        const name = `matcha-${hash}-${occurrence}`;
                        token.attrJoin('style', `view-transition-name: ${name};`);
                        token.attrSet('data-matcha-motion', effect);
                        if (!effects.has(name)) effects.set(name, effect);
                    }
                }

                if (token.type === 'list_item_open') listDepth++;
                if (token.type === 'table_open') tableDepth++;
            }
        });
    });

    const render = marp.render.bind(marp);

    marp.render = (...args) => {
        const result = render(...args);
        const motionCss = readFileSync(motionCssPath, 'utf8');
        const overrides = [...effects].filter(([, effect]) => effect !== 'fade').map(([name, effect]) =>
            `::view-transition-new(${name}):only-child { animation-name: matcha-${effect}-in !important; }
             ::view-transition-old(${name}):only-child { animation-name: matcha-${effect}-out !important; }`
        ).join('\n');
        const crossfades = [...blocks].map((name) =>
            `::view-transition-old(${name}):not(:only-child) { animation: matcha-fade-out 300ms cubic-bezier(0.23, 1, 0.32, 1) both !important; mix-blend-mode: plus-lighter !important; }
   ::view-transition-new(${name}):not(:only-child) { animation: matcha-fade-in 300ms cubic-bezier(0.23, 1, 0.32, 1) both !important; mix-blend-mode: plus-lighter !important; }`
        ).join('\n');

        const html = result.html.includes('live-reactions')
            ? `${result.html}<script>${readFileSync(reactionScriptPath, 'utf8')}</script>` : result.html;
        return { ...result, html, css: `${result.css}\n${motionCss}\n@media screen {\n${overrides}\n${crossfades}\n}` };
    };

    return marp;
}
