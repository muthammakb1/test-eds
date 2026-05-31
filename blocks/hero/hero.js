export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  const desktopImg = rows[0].querySelector('img');
  const mobileImg = rows[1].querySelector('img');

  if (!desktopImg || !mobileImg) return;

  const desktopSrc = (desktopImg.currentSrc || desktopImg.src).split('?')[0];
  const mobileSrc = (mobileImg.currentSrc || mobileImg.src).split('?')[0];

  const picture = document.createElement('picture');

  const source = document.createElement('source');
  source.media = '(min-width: 600px)';
  source.srcset = desktopSrc;
  picture.append(source);

  const img = document.createElement('img');
  img.src = mobileSrc;
  img.alt = desktopImg.alt || mobileImg.alt || '';
  img.loading = 'eager';
  picture.append(img);

  block.textContent = '';
  block.append(picture);
}
