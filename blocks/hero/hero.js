export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  const desktopImg = rows[0].querySelector('img');
  const mobileImg = rows[1].querySelector('img');

  if (!desktopImg || !mobileImg) return;

  const desktopSrc = desktopImg.currentSrc || desktopImg.src;
  const mobileSrc = mobileImg.currentSrc || mobileImg.src;

  const picture = document.createElement('picture');

  const source = document.createElement('source');
  source.media = '(min-width: 600px)';
  source.srcset = `${desktopSrc}?width=2000&format=webply&optimize=medium`;
  picture.append(source);

  const img = document.createElement('img');
  img.src = `${mobileSrc}?width=750&format=webply&optimize=medium`;
  img.alt = desktopImg.alt || mobileImg.alt || '';
  img.loading = 'eager';
  img.width = 2000;
  img.height = 836;
  picture.append(img);

  block.textContent = '';
  block.append(picture);
}
