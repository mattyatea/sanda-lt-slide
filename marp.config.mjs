import { installSlideMotion } from './lib/slide-motion.mjs';

export default {
    html: true,
    themeSet: './slides/themes',
    engine: ({ marp }) => installSlideMotion(marp),
};
