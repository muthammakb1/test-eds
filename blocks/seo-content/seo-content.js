/**
 * SEO Content
 * A list of titled text sections. Desktop flows them into two columns
 * (top-to-bottom, then the next column); mobile shows a single column.
 *
 * Authoring model (all content lives in DA):
 *   Each row : title | description (rich text, links allowed)
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const list = document.createElement('div');
  list.className = 'seo-content-list';

  [...block.children].forEach((row) => {
    const [titleCell, descCell] = row.children;
    const title = titleCell?.textContent.trim();
    if (!title && !descCell?.textContent.trim()) return;

    const item = document.createElement('section');
    item.className = 'seo-content-item';

    if (title) {
      const heading = document.createElement('h2');
      heading.className = 'seo-content-title';
      heading.textContent = title;
      item.append(heading);
    }

    if (descCell) {
      const desc = document.createElement('div');
      desc.className = 'seo-content-desc';
      // keep authored markup (paragraphs, links) but drop the wrapper cell
      desc.append(...descCell.childNodes);
      item.append(desc);
    }

    list.append(item);
  });

  block.replaceChildren(list);
}
