export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  const desktopImg = rows[0].querySelector('img');
  const mobileImg = rows[1].querySelector('img');

  if (!desktopImg || !mobileImg) return;

  const picture = document.createElement('picture');

  const source = document.createElement('source');
  source.media = '(min-width: 600px)';
  source.srcset = desktopImg.currentSrc || desktopImg.src;
  picture.append(source);

  const img = document.createElement('img');
  img.src = mobileImg.currentSrc || mobileImg.src;
  img.alt = desktopImg.alt || mobileImg.alt || '';
  img.loading = 'eager';
  picture.append(img);

  block.textContent = '';
  block.append(picture);
}
