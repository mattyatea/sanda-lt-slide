import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const motionCssPath = new URL('../styles/motion.css', import.meta.url);
const blockTypes = new Set(['heading_open', 'paragraph_open', 'list_item_open', 'table_open']);

export function installSlideMotion(marp) {
    const effects = new Map();

    marp.use((md) => {
        md.core.ruler.push('matcha_element_motion', (state) => {
            effects.clear();
            const occurrences = new Map();
            let listDepth = 0;
            let tableDepth = 0;
            let effect = 'fade';

            for (let index = 0; index < state.tokens.length; index++) {
                const token = state.tokens[index];

                if (token.tag === 'section' && token.nesting === 1) {
                    occurrences.clear();
                    listDepth = 0;
                    tableDepth = 0;
                    const classes = (token.attrGet('class') || '').split(/\s+/);
                    effect = classes.includes('motion-rise') ? 'rise'
                        : classes.includes('motion-wipe') || classes.includes('lead') ? 'wipe' : 'fade';
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

        return { ...result, css: `${result.css}\n${motionCss}\n@media screen {\n${overrides}\n}` };
    };

    return marp;
}
