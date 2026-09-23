import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Service Matrix
 * A heading/description header followed by a grid of image cards. Each card
 * shows a title and short description over a background image, with an arrow
 * link in the top-right corner.
 *
 * Authoring model (all content lives in DA):
 *   Row 1  : heading (rich text) | description (plain text)
 *   Row 2+ : image | title | description | link (url)
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // --- header: first row without an image is heading | description ------
  const headerRow = rows.find((row) => !row.querySelector('img, picture'));
  const cardRows = rows.filter((row) => row.querySelector('img, picture'));

  const header = document.createElement('div');
  header.className = 'service-matrix-header';
  if (headerRow) {
    const cells = [...headerRow.children];
    const heading = document.createElement('div');
    heading.className = 'service-matrix-heading';
    heading.innerHTML = (cells[0]?.querySelector('h1, h2, h3, p') || cells[0])?.innerHTML || '';
    header.append(heading);
    if (cells[1] && cells[1].textContent.trim()) {
      const desc = document.createElement('div');
      desc.className = 'service-matrix-intro';
      desc.innerHTML = (cells[1].querySelector('p') || cells[1]).innerHTML;
      header.append(desc);
    }
  }

  // --- cards ------------------------------------------------------------
  const grid = document.createElement('div');
  grid.className = 'service-matrix-cards';

  cardRows.forEach((row) => {
    const cells = [...row.children];
    const img = row.querySelector('img');
    // the remaining non-image cells: title, description, and an optional link
    const textCells = cells.filter((c) => !c.querySelector('img, picture'));
    const linkEl = row.querySelector('a');
    const href = linkEl ? linkEl.getAttribute('href') : '';
    const title = textCells[0] ? textCells[0].textContent.trim() : '';
    // description is the first remaining cell that isn't the title or a bare link
    const descCell = textCells.find((c, i) => i > 0 && !(c.querySelector('a') && c.textContent.trim() === (linkEl?.textContent.trim() || '')));
    const description = descCell ? descCell.textContent.trim() : '';

    // a card is an anchor when a link is authored, otherwise a plain article
    const card = document.createElement(href ? 'a' : 'article');
    card.className = 'service-matrix-card';
    if (href) {
      card.href = href;
      card.setAttribute('aria-label', title);
    }

    // background image
    if (img) {
      const optimized = createOptimizedPicture(
        img.src.split('?')[0],
        img.alt || title,
        false,
        [{ width: '750' }],
      );
      optimized.classList.add('service-matrix-card-bg');
      card.append(optimized);
    }

    // arrow indicator (top-right)
    const arrow = document.createElement('span');
    arrow.className = 'service-matrix-card-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    card.append(arrow);

    // title (top-left)
    const titleEl = document.createElement('h3');
    titleEl.className = 'service-matrix-card-title';
    titleEl.textContent = title;
    card.append(titleEl);

    // description (bottom)
    if (description) {
      const descEl = document.createElement('p');
      descEl.className = 'service-matrix-card-desc';
      descEl.textContent = description;
      card.append(descEl);
    }

    grid.append(card);
  });

  block.textContent = '';
  block.append(header, grid);
}
