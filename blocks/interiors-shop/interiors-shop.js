import { trackEvent, pushAdobeCtaClickEvent } from '../../scripts/analytics_1.js';

export default function decorate(block) {
  // Get heading and description
  const heading = block.querySelector('h2, h3, h4');
  const description = block.querySelector('p');

  // Get all rows after header
  const rows = [...block.querySelectorAll(':scope > div')];

  // Create main grid
  const wrapper = document.createElement('div');
  wrapper.className = 'interiors-shop-grid';

  // Create left column
  const leftColumn = document.createElement('div');
  leftColumn.className = 'interiors-shop-left-column';

  // Create text container
  const textDiv = document.createElement('div');
  textDiv.className = 'interiors-shop-text';

  if (heading) {
    const headingClone = heading.cloneNode(true);
    headingClone.classList.add('interiors-shop-heading');
    textDiv.appendChild(headingClone);
  }

  if (description) {
    const descriptionClone = description.cloneNode(true);
    descriptionClone.classList.add('interiors-shop-description');
    textDiv.appendChild(descriptionClone);
  }

  leftColumn.appendChild(textDiv);

  // Collect all cards
  const cards = [];

  rows.slice(1).forEach((row) => {
    const cells = [...row.children];

    cells.forEach((cell) => {
      const img = cell.querySelector('img');
      const title = cell.querySelector('strong');
      const desc = cell.querySelector('em');
      const link = cell.querySelector('a');

      if (!img && !title) return;

      const card = document.createElement('div');
      card.className = 'interiors-shop-card';

      if (img) {
        const imgDiv = document.createElement('div');
        imgDiv.className = 'interiors-shop-card-image';
        const imgClone = img.cloneNode(true);
        imgDiv.appendChild(imgClone);
        if (link) {
          imgDiv.style.cursor = 'pointer';
          imgDiv.addEventListener('click', () => {
            const cardTitle = title?.textContent?.trim() || '';
            trackEvent('cta_link_text', {
              cta_: link.textContent?.trim() || 'Explore now',
              parentTitle: cardTitle,
              param1: link.href,
            });
            pushAdobeCtaClickEvent({
              cta: link.textContent?.trim() || 'Explore now',
              parentTitle: cardTitle,
              destinationUrl: link.href,
              event: 'cta_link_text',
            });
            window.location.href = link.href;
          });
        }
        card.appendChild(imgDiv);
      }

      const contentDiv = document.createElement('div');
      contentDiv.className = 'interiors-shop-card-content';

      if (title) {
        const titleEl = document.createElement('div');
        titleEl.className = 'title';
        titleEl.textContent = title.textContent.trim();
        contentDiv.appendChild(titleEl);
      }

      if (desc) {
        const descEl = document.createElement('p');
        descEl.textContent = desc.textContent.trim();
        contentDiv.appendChild(descEl);
      }

      if (link) {
        const btn = document.createElement('a');
        btn.href = link.href;
        btn.className = 'interiors-shop-button';
        const btnText = link.textContent?.trim() || 'Explore now';
        btn.innerHTML = `${btnText} <span class="arrow"></span>`;
        btn.addEventListener('click', () => {
          const cardTitle = title?.textContent?.trim() || '';
          trackEvent('cta_link_text', {
            cta_: btnText,
            parentTitle: cardTitle,
            param1: btn.href,
          });

          pushAdobeCtaClickEvent({
            cta: btnText,
            parentTitle: cardTitle,
            destinationUrl: btn.href,
            event: 'cta_link_text',
          });
        });
        contentDiv.appendChild(btn);
      }

      card.appendChild(contentDiv);
      cards.push(card);
    });
  });

  // Clear and rebuild block
  block.innerHTML = '';

  if (cards.length > 0) {
    cards[0].classList.add('card-left');
    leftColumn.appendChild(cards[0]);
  }

  wrapper.appendChild(leftColumn);

  if (cards.length > 1) {
    cards[1].classList.add('card-middle');
    wrapper.appendChild(cards[1]);
  }

  if (cards.length > 2) {
    cards[2].classList.add('card-right');
    wrapper.appendChild(cards[2]);
  }

  block.appendChild(wrapper);

  // -------------------------------
  // Swiper Logic
  // -------------------------------
  let swiperInstance;
  let paginationEl;

  function initSwiper() {
    const grid = block.querySelector('.interiors-shop-grid');
    if (!grid || swiperInstance || !window.Swiper) return;

    grid.classList.add('swiper');

    const wrapperEl = document.createElement('div');
    wrapperEl.className = 'swiper-wrapper';

    const slideCards = [...grid.children].filter(
      (el) => !el.classList.contains('interiors-shop-left-column'),
    );

    slideCards.forEach((card) => {
      card.classList.add('swiper-slide');
      wrapperEl.appendChild(card);
    });

    grid.appendChild(wrapperEl);

    // 👉 Pagination OUTSIDE grid
    paginationEl = document.createElement('div');
    paginationEl.className = 'interiors-shop-pagination swiper-pagination';

    block.appendChild(paginationEl);

    swiperInstance = new window.Swiper(grid, {
      slidesPerView: 1,
      spaceBetween: 16,
      pagination: {
        el: paginationEl,
        clickable: false,
      },
    });
  }

  function destroySwiper() {
    if (!swiperInstance) return;

    swiperInstance.destroy(true, true);
    swiperInstance = null;

    const grid = block.querySelector('.interiors-shop-grid');
    if (!grid) return;

    const wrapperEl = grid.querySelector('.swiper-wrapper');
    if (!wrapperEl) return;

    const slides = [...wrapperEl.children];
    slides.forEach((slide) => {
      slide.classList.remove('swiper-slide');
      grid.appendChild(slide);
    });

    wrapperEl.remove();

    // Remove pagination outside
    if (paginationEl) {
      paginationEl.remove();
      paginationEl = null;
    }

    grid.classList.remove('swiper');
  }

  // -------------------------------
  // Mobile Layout Logic
  // -------------------------------
  const mobileQuery = window.matchMedia('(max-width: 899px)');

  function updateMobileLayout(e) {
    const isMobile = e?.matches ?? mobileQuery.matches;

    const grid = block.querySelector('.interiors-shop-grid');
    const leftCol = block.querySelector('.interiors-shop-left-column');
    const firstCard = block.querySelector('.card-left');

    if (!grid || !leftCol || !firstCard) return;

    if (isMobile) {
      // Move left column outside grid
      if (leftCol.parentElement === grid) {
        block.insertBefore(leftCol, grid);
      }

      // Move first card into grid
      if (firstCard.parentElement === leftCol) {
        grid.insertBefore(firstCard, grid.firstChild);
      }

      initSwiper();
    } else {
      // Restore desktop
      if (leftCol.parentElement === block) {
        block.insertBefore(grid, leftCol.nextSibling);
        grid.insertBefore(leftCol, grid.firstChild);
      }

      if (firstCard.parentElement === grid) {
        leftCol.appendChild(firstCard);
      }

      destroySwiper();
    }
  }

  updateMobileLayout();

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', updateMobileLayout);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(updateMobileLayout);
  }
}
