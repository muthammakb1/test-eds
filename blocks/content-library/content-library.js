export default function decorate(block) {
  const rows = [...block.children];
  const titleRow = rows.shift();
  const title = titleRow?.querySelector('div');
  if (title) {
    const h2 = document.createElement('h2');
    h2.textContent = title.textContent.trim();
    titleRow.replaceWith(h2);
  }

  const carousel = document.createElement('div');
  carousel.className = 'content-library-carousel';

  rows.forEach((row) => {
    const card = document.createElement('div');
    card.className = 'content-library-card';

    const cols = [...row.children];
    const imageCol = cols[0];
    const textCol = cols[1];

    if (imageCol) {
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'content-library-card-image';
      imgWrapper.append(...imageCol.childNodes);
      card.append(imgWrapper);
    }

    if (textCol) {
      const body = document.createElement('div');
      body.className = 'content-library-card-body';
      body.append(...textCol.childNodes);
      card.append(body);
    }

    carousel.append(card);
    row.remove();
  });

  block.append(carousel);

  let isDown = false;
  let startX;
  let scrollLeft;

  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });

  carousel.addEventListener('mouseleave', () => { isDown = false; });
  carousel.addEventListener('mouseup', () => { isDown = false; });
  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2;
    carousel.scrollLeft = scrollLeft - walk;
  });
}
