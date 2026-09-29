import { loadCSS } from '../../scripts/aem.js';

/**
 * CWAP block group entry.
 * Blocks authored as "cwap-{name}" (e.g. cwap-banner) are routed here by
 * scripts.js and loaded from blocks/cwap/cwap-{name}/cwap-{name}.js/.css.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const name = block.dataset.groupBlockName;
  if (!name || !/^cwap-[a-z0-9-]+$/.test(name)) return;

  const base = `${window.hlx.codeBasePath}/blocks/cwap/${name}/${name}`;
  try {
    const [mod] = await Promise.all([import(`${base}.js`), loadCSS(`${base}.css`)]);
    if (mod.default) await mod.default(block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`failed to load ${name}`, error);
  }
}
