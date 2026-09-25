import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Category Showcase
 * A centred heading and intro above a row of category cards (image, title,
 * short description). Desktop shows four cards per row; mobile scrolls
 * horizontally with fixed-width cards.
 *
 * Authoring model (all content lives in DA):
 *   Row 1  : heading | description
 *   Row 2+ : image | title | description | link (optional)
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // the header is the first row without an image; every row with one is a card
  const headerRow = rows.find((row) => !row.querySelector('picture, img'));
  const cardRows = rows.filter((row) => row.querySelector('picture, img'));

  const header = document.createElement('div');
  header.className = 'category-showcase-header';
  if (headerRow) {
    const [headingCell, descCell] = headerRow.children;
    const heading = document.createElement('h2');
    heading.className = 'category-showcase-heading';
    heading.textContent = headingCell?.textContent.trim() || '';
    header.append(heading);
    if (descCell?.textContent.trim()) {
      const desc = document.createElement('p');
      desc.className = 'category-showcase-intro';
      desc.textContent = descCell.textContent.trim();
      header.append(desc);
    }
  }

  const list = document.createElement('ul');
  list.className = 'category-showcase-cards';

  cardRows.forEach((row) => {
    const img = row.querySelector('img');
    const textCells = [...row.children].filter((c) => !c.querySelector('picture, img'));
    const link = row.querySelector('a');
    const title = textCells[0]?.textContent.trim() || '';
    // description is the first text cell after the title that isn't just the link
    const descCell = textCells.slice(1).find((c) => !c.querySelector('a'));
    const description = descCell?.textContent.trim() || '';

    const item = document.createElement('li');
    item.className = 'category-showcase-card';

    // wrap the whole card in the authored link, when there is one
    const inner = link ? document.createElement('a') : item;
    if (link) {
      inner.href = link.getAttribute('href');
      inner.className = 'category-showcase-link';
      item.append(inner);
    }

    if (img) {
      const picture = createOptimizedPicture(img.src, img.alt || title, false, [{ width: '750' }]);
      picture.classList.add('category-showcase-image');
      inner.append(picture);
    }

    const titleEl = document.createElement('h3');
    titleEl.className = 'category-showcase-title';
    titleEl.textContent = title;
    inner.append(titleEl);

    if (description) {
      const descEl = document.createElement('p');
      descEl.className = 'category-showcase-desc';
      descEl.textContent = description;
      inner.append(descEl);
    }

    list.append(item);
  });

  block.replaceChildren(header, list);
}
