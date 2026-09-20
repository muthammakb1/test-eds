/**
 * Wall Paint Tool
 * A multi-screen guided selector. Screen 1 asks three mandatory questions and
 * keeps the "Proceed" button disabled until every question is answered.
 *
 * Authoring model (all content lives in DA, nothing is hardcoded):
 *   Row 1 : desktop background image | mobile background image
 *   Row 2 : heading (rich text; bold run becomes the highlighted colour text)
 *   Row 3+: question text | bullet list of answer options (one <li> per option)
 *
 * @param {Element} block The block element
 */

// slugify a label so it can be matched to a CSS class / swatch definition
function slug(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// finish options that render as gradient swatches (gradients live in the CSS)
const SWATCH_SLUGS = ['gloss', 'semi-gloss', 'matt'];

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // --- classify the authored rows --------------------------------------
  let bgRow = null;
  let headingRow = null;
  const questionRows = [];

  rows.forEach((row) => {
    if (row.querySelector('img, picture')) {
      bgRow = row;
    } else if (row.querySelector('ul, ol')) {
      questionRows.push(row);
    } else if (row.textContent.trim()) {
      headingRow = headingRow || row;
    }
  });

  // --- background images ------------------------------------------------
  const imgs = bgRow ? [...bgRow.querySelectorAll('img')] : [];
  const desktopSrc = imgs[0] ? (imgs[0].currentSrc || imgs[0].src).split('?')[0] : '';
  const mobileSrc = imgs[1] ? (imgs[1].currentSrc || imgs[1].src).split('?')[0] : desktopSrc;

  // --- heading (build the markup as an HTML string, then append) --------
  let headingHTML = '';
  let headingText = '';
  if (headingRow) {
    const source = headingRow.querySelector('p') || headingRow;
    // a bold run authored in DA becomes the highlighted colour text
    const clone = source.cloneNode(true);
    clone.querySelectorAll('strong, b, em').forEach((el) => {
      const span = document.createElement('span');
      span.className = 'color-text';
      span.innerHTML = el.innerHTML;
      el.replaceWith(span);
    });
    headingHTML = `<p>${clone.innerHTML}</p>`;
    headingText = source.textContent.trim();
  }

  const left = document.createElement('div');
  left.className = 'wallpainttool-left';
  left.innerHTML = `<div role="heading" aria-level="1" class="surface-layout-text-section" aria-label="${headingText}" tabindex="0">${headingHTML}</div>`;

  // --- questions --------------------------------------------------------
  const right = document.createElement('div');
  right.className = 'wallpainttool-right';

  const form = document.createElement('form');
  form.className = 'wallpainttool-form';
  form.setAttribute('novalidate', '');

  questionRows.forEach((row, qIndex) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    const optionsCell = cells[1] || cells[0];
    const options = [...optionsCell.querySelectorAll('li')];
    const isSwatch = options.some((li) => SWATCH_SLUGS.includes(slug(li.textContent)));

    const fieldset = document.createElement('fieldset');
    fieldset.className = 'wallpainttool-question';
    if (isSwatch) fieldset.classList.add('wallpainttool-question-swatch');

    const legend = document.createElement('legend');
    legend.className = 'wallpainttool-question-title';
    legend.textContent = labelCell.textContent.trim();
    fieldset.append(legend);

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'wallpainttool-options';

    options.forEach((li, oIndex) => {
      const value = li.textContent.trim();
      const id = `wpt-q${qIndex}-o${oIndex}`;
      const optSlug = slug(value);

      const optionLabel = document.createElement('label');
      optionLabel.className = 'wallpainttool-option';
      optionLabel.setAttribute('for', id);

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `wpt-q${qIndex}`;
      input.id = id;
      input.value = value;
      input.required = true;

      optionLabel.append(input);

      if (isSwatch && SWATCH_SLUGS.includes(optSlug)) {
        const swatch = document.createElement('span');
        swatch.className = `wallpainttool-swatch wallpainttool-swatch-${optSlug}`;
        swatch.setAttribute('aria-hidden', 'true');
        optionLabel.append(swatch);
      }

      const text = document.createElement('span');
      text.className = 'wallpainttool-option-text';
      text.textContent = value;
      optionLabel.append(text);

      optionsWrap.append(optionLabel);
    });

    fieldset.append(optionsWrap);
    form.append(fieldset);
  });

  // --- proceed button ---------------------------------------------------
  const proceed = document.createElement('button');
  proceed.type = 'submit';
  proceed.className = 'wallpainttool-proceed';
  proceed.disabled = true;
  proceed.innerHTML = '<span>Proceed</span>';

  const totalQuestions = questionRows.length;
  const updateProceed = () => {
    const answered = form.querySelectorAll('input[type="radio"]:checked').length;
    proceed.disabled = answered < totalQuestions;
  };
  form.addEventListener('change', updateProceed);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (proceed.disabled) return;
    block.dataset.screen = '2'; // advance to the next screen (screens 2 & 3 TBD)
  });

  form.append(proceed);
  right.append(form);

  // --- assemble ---------------------------------------------------------
  const screen = document.createElement('div');
  screen.className = 'wallpainttool-screen';
  screen.dataset.screen = '1';
  if (desktopSrc) screen.style.setProperty('--wpt-bg-desktop', `url("${desktopSrc}")`);
  if (mobileSrc) screen.style.setProperty('--wpt-bg-mobile', `url("${mobileSrc}")`);
  screen.append(left, right);

  block.textContent = '';
  block.dataset.screen = '1';
  block.append(screen);

  updateProceed();
}
