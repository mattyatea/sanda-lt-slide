import { installSlideMotion } from './lib/slide-motion.mjs';

export default {
    themeSet: './slides/themes',
    engine: ({ marp }) => installSlideMotion(marp),
};
