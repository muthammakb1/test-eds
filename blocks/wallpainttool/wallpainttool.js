/**
 * Wall Paint Tool — a 3-step guided flow. All content is authored in DA.
 *
 * Steps are separated in the DA table by a marker row whose only text is
 * "Step 1", "Step 2" or "Step 3" (so authors are never confused about which
 * screen a row belongs to). Rows before the first marker fall into Step 1.
 *
 * STEP 1 — heading + mandatory questions
 *   image row     : desktop background | mobile background (shared by all steps)
 *   heading row   : rich text (a bold run becomes the highlighted colour text)
 *   question rows : question text | bullet list of options [| display|hide]
 *   cta row       : "CTA" | button label            (authorable button text)
 *
 * STEP 2 — lead form
 *   heading row    : rich text
 *   subheading row : plain text
 *   field labels   : Name | Email | Phone | Pincode          (column labels)
 *   field holders  : Enter your name | Enter your Email | …   (placeholders)
 *   whatsapp row   : Update me on WhatsApp | display|hide
 *   question rows  : question text | bullet list | display|hide
 *   consent row    : rich text with Terms / Privacy links
 *   cta row        : "CTA" | button label
 *
 * STEP 3 — recommendations (placeholder heading/text for now)
 *
 * @param {Element} block The block element
 */

// Normalise a label into a lowercase, hyphen-separated token.
// Used both to derive input `name`/`id`/CSS-class values and to match an
// authored label ("Semi Gloss") against a known key ("semi-gloss").
function slug(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// finish options that render as gradient swatches (gradients live in the CSS)
const SWATCH_SLUGS = ['gloss', 'semi-gloss', 'matt'];

// turn a bold/italic run authored in DA into the gold highlight span
function buildHeadingHTML(sourceEl) {
  const clone = sourceEl.cloneNode(true);
  clone.querySelectorAll('strong, b, em').forEach((el) => {
    const span = document.createElement('span');
    span.className = 'color-text';
    span.innerHTML = el.innerHTML;
    el.replaceWith(span);
  });
  return clone.innerHTML;
}

// Split the flat list of authored rows into per-step groups.
// A "Step N" marker row (a single cell reading e.g. "Step 2") starts a new
// group; every following row belongs to that step until the next marker.
// Rows that appear before any marker still form an implicit first group, so
// the block keeps working even if an author forgets the "Step 1" marker.
// Returns an array of row-arrays: [step1Rows, step2Rows, step3Rows].
function splitSteps(rows) {
  const steps = [];
  let current = null;
  rows.forEach((row) => {
    const isMarker = [...row.children].length <= 1 && /^step\s*\d+$/i.test(row.textContent.trim());
    if (isMarker) {
      current = [];
      steps.push(current);
      return;
    }
    if (!current) {
      current = [];
      steps.push(current);
    }
    current.push(row);
  });
  return steps;
}

// Read the optional visibility flag authors can put in a row's last cell.
// "display" -> render the element, "hide" -> omit it entirely.
// Returns null when the last cell is neither, so callers can tell an
// explicit flag apart from ordinary content.
function displayFlag(cells) {
  const last = cells[cells.length - 1]?.textContent.trim().toLowerCase();
  return last === 'display' || last === 'hide' ? last : null;
}

// build a radio-group fieldset from a question row
function buildQuestion(labelText, options, groupName) {
  const isSwatch = options.some((li) => SWATCH_SLUGS.includes(slug(li.textContent)));

  const fieldset = document.createElement('fieldset');
  fieldset.className = 'wallpainttool-question';
  if (isSwatch) fieldset.classList.add('wallpainttool-question-swatch');

  const legend = document.createElement('legend');
  legend.className = 'wallpainttool-question-title';
  legend.textContent = labelText;
  fieldset.append(legend);

  const optionsWrap = document.createElement('div');
  optionsWrap.className = 'wallpainttool-options';

  options.forEach((li, oIndex) => {
    const value = li.textContent.trim();
    const id = `${groupName}-o${oIndex}`;
    const optSlug = slug(value);

    const optionLabel = document.createElement('label');
    optionLabel.className = 'wallpainttool-option';
    optionLabel.setAttribute('for', id);

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = groupName;
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
  return fieldset;
}

/* ------------------------------------------------------------------ STEP 1 */
function buildStep1(rows) {
  let headingRow = null;
  let ctaText = 'Proceed';
  const questionRows = [];

  // Classify each authored row by what it contains, rather than by position,
  // so authors can reorder rows without breaking the block:
  //  - image row              -> skipped here (background is read at block level)
  //  - "CTA"/"Button" | label -> overrides the button text
  //  - row with a <ul>/<ol>   -> a question (label + options list)
  //  - first remaining text row -> the heading
  rows.forEach((row) => {
    if (row.querySelector('img, picture')) return; // bg handled at root level
    const cells = [...row.children];
    if (cells.length === 2 && ['cta', 'button'].includes(cells[0].textContent.trim().toLowerCase())) {
      ctaText = cells[1].textContent.trim() || ctaText;
    } else if (row.querySelector('ul, ol')) {
      questionRows.push(row);
    } else if (row.textContent.trim() && !headingRow) {
      headingRow = row;
    }
  });

  const screen = document.createElement('div');
  screen.className = 'wallpainttool-screen wallpainttool-screen-1';
  screen.dataset.step = '1';

  const left = document.createElement('div');
  left.className = 'wallpainttool-left';
  if (headingRow) {
    const source = headingRow.querySelector('p') || headingRow;
    left.innerHTML = `<div role="heading" aria-level="1" class="surface-layout-text-section" aria-label="${source.textContent.trim()}" tabindex="0"><p>${buildHeadingHTML(source)}</p></div>`;
  }

  const right = document.createElement('div');
  right.className = 'wallpainttool-right';

  const form = document.createElement('form');
  form.className = 'wallpainttool-form';
  form.setAttribute('novalidate', '');

  questionRows.forEach((row, qIndex) => {
    const cells = [...row.children];
    const optionsCell = cells[1] || cells[0];
    const options = [...optionsCell.querySelectorAll('li')];
    form.append(buildQuestion(cells[0].textContent.trim(), options, `wpt-s1-q${qIndex}`));
  });

  const proceed = document.createElement('button');
  proceed.type = 'submit';
  proceed.className = 'wallpainttool-proceed';
  proceed.disabled = true;
  proceed.innerHTML = `<span>${ctaText}</span>`;

  // Keep the CTA disabled until every question has a selected option.
  // One checked radio per group means checked-count === question-count.
  const total = questionRows.length;
  const update = () => {
    proceed.disabled = form.querySelectorAll('input[type="radio"]:checked').length < total;
  };
  form.addEventListener('change', update);
  update();

  form.append(proceed);
  right.append(form);
  screen.append(left, right);
  return { screen, form, proceed };
}

/* ------------------------------------------------------------------ STEP 2 */
// Infer the right input semantics from the authored field label so authors
// only type a label ("Phone") and get the correct type, on-screen keyboard
// (inputmode), autofill hint (autocomplete) and validation pattern for free.
// Note: pincode uses type="text" + inputmode="numeric" on purpose — type="number"
// strips leading zeros and adds unwanted spinner UI (see forms best-practices).
function fieldConfig(labelSlug) {
  if (labelSlug.includes('email')) return { type: 'email', autocomplete: 'email' };
  if (labelSlug.includes('phone') || labelSlug.includes('mobile')) {
    return {
      type: 'tel', autocomplete: 'tel-national', inputmode: 'numeric', pattern: '\\d{10}', maxlength: '10', prefix: '+91',
    };
  }
  if (labelSlug.includes('pin')) {
    return {
      type: 'text', autocomplete: 'postal-code', inputmode: 'numeric', pattern: '\\d{6}', maxlength: '6',
    };
  }
  return { type: 'text', autocomplete: 'name' };
}

function buildStep2(rows) {
  const screen = document.createElement('div');
  screen.className = 'wallpainttool-screen wallpainttool-screen-2';
  screen.dataset.step = '2';
  if (!rows || !rows.length) return { screen, form: null };

  let ctaText = 'View Recommendations';
  const textRows = []; // single-cell text rows -> heading + subheading (in order)
  const gridRows = []; // multi-cell rows -> [0] field labels, [1] placeholders
  const questionRows = []; // rows containing an options list -> radio questions
  let whatsapp = null; // the "Update me on WhatsApp" opt-in row, if present
  let consentRow = null; // the legal/consent paragraph (identified by its links)

  // Bucket every row by shape/content. Order matters: the checks are arranged
  // most-specific first so, e.g., the consent paragraph (which has links) is
  // caught before the generic multi-cell "grid row" branch.
  rows.forEach((row) => {
    const cells = [...row.children];
    const flag = displayFlag(cells);
    if (cells.length === 2 && ['cta', 'button'].includes(cells[0].textContent.trim().toLowerCase())) {
      ctaText = cells[1].textContent.trim() || ctaText;
    } else if (row.querySelector('ul, ol')) {
      questionRows.push({ cells, flag });
    } else if (row.querySelector('a') || row.textContent.trim().length > 120) {
      // links (Terms/Privacy) or a long paragraph => the consent text
      consentRow = row;
    } else if (flag && cells.length === 2) {
      // "<label> | display|hide" => the WhatsApp opt-in row
      whatsapp = { label: cells[0].textContent.trim(), show: flag === 'display' };
    } else if (cells.length >= 2) {
      // remaining multi-cell rows are the field labels row then placeholders row
      gridRows.push(cells);
    } else if (row.textContent.trim()) {
      textRows.push(row);
    }
  });

  const card = document.createElement('div');
  card.className = 'wallpainttool-card';

  const form = document.createElement('form');
  form.className = 'wallpainttool-form2';

  // heading + subheading (first two single-cell text rows)
  const header = document.createElement('div');
  header.className = 'wallpainttool-form2-header';
  if (textRows[0]) {
    const src = textRows[0].querySelector('p') || textRows[0];
    header.innerHTML = `<h2 class="wallpainttool-form2-title">${buildHeadingHTML(src)}</h2>`;
  }
  if (textRows[1]) {
    const p = document.createElement('p');
    p.className = 'wallpainttool-form2-sub';
    p.textContent = textRows[1].textContent.trim();
    header.append(p);
  }

  // Build the text inputs by pairing the two grid rows column-by-column:
  // labels row supplies the accessible <label>, placeholders row supplies the
  // input placeholder. Column N of the labels row maps to column N of the
  // placeholders row (e.g. "Phone" + "Enter mobile number").
  const grid = document.createElement('div');
  grid.className = 'wallpainttool-fields';
  const labels = gridRows[0] || [];
  const holders = gridRows[1] || [];
  labels.forEach((labelCell, i) => {
    const labelText = labelCell.textContent.trim();
    const placeholder = holders[i] ? holders[i].textContent.trim() : '';
    // skip columns with no placeholder (e.g. the blank "Book FREE Site Visit" column)
    if (!labelText || !placeholder) return;
    const cfg = fieldConfig(slug(labelText));
    const name = slug(labelText) || `field-${i}`;
    const id = `wpt-f-${name}`;

    const field = document.createElement('div');
    field.className = `wallpainttool-field wallpainttool-field-${name}`;

    // The visible cue is the placeholder, but a real <label> is still emitted
    // (visually hidden) so the field remains labelled for screen readers.
    const label = document.createElement('label');
    label.className = 'wallpainttool-visually-hidden';
    label.setAttribute('for', id);
    label.textContent = labelText;

    const control = document.createElement('div');
    control.className = 'wallpainttool-control';
    if (cfg.prefix) {
      const prefix = document.createElement('span');
      prefix.className = 'wallpainttool-tel-prefix';
      prefix.textContent = cfg.prefix;
      control.append(prefix);
    }

    const input = document.createElement('input');
    input.id = id;
    input.name = name;
    input.type = cfg.type;
    input.placeholder = placeholder;
    input.required = true;
    input.autocomplete = cfg.autocomplete;
    if (cfg.inputmode) input.inputMode = cfg.inputmode;
    if (cfg.pattern) input.pattern = cfg.pattern;
    if (cfg.maxlength) input.maxLength = Number(cfg.maxlength);
    control.append(input);

    field.append(label, control);
    grid.append(field);
  });

  // whatsapp opt-in checkbox (only when authored to "display")
  let whatsappEl = null;
  if (whatsapp && whatsapp.show) {
    whatsappEl = document.createElement('label');
    whatsappEl.className = 'wallpainttool-whatsapp';
    whatsappEl.innerHTML = '<input type="checkbox" name="whatsapp-optin" checked>';
    const span = document.createElement('span');
    span.textContent = whatsapp.label;
    whatsappEl.append(span);
  }

  // radio questions (only those authored to "display")
  const questionsWrap = document.createElement('div');
  questionsWrap.className = 'wallpainttool-form2-questions';
  questionRows.forEach(({ cells, flag }, qIndex) => {
    if (flag === 'hide') return;
    const optionsCell = cells[1] || cells[0];
    const options = [...optionsCell.querySelectorAll('li')];
    questionsWrap.append(buildQuestion(cells[0].textContent.trim(), options, `wpt-s2-q${qIndex}`));
  });

  // consent text (links preserved)
  let consentEl = null;
  if (consentRow) {
    consentEl = document.createElement('p');
    consentEl.className = 'wallpainttool-consent';
    const src = consentRow.querySelector('p') || consentRow;
    consentEl.innerHTML = src.innerHTML;
  }

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'wallpainttool-proceed wallpainttool-proceed-2';
  submit.innerHTML = `<span>${ctaText}</span>`;

  form.append(grid);
  if (whatsappEl) form.append(whatsappEl);
  if (questionsWrap.children.length) form.append(questionsWrap);
  if (consentEl) form.append(consentEl);
  form.append(submit);

  card.append(header, form);
  screen.append(card);
  return { screen, form };
}

/* ------------------------------------------------------------------ STEP 3 */
function buildStep3(rows) {
  const screen = document.createElement('div');
  screen.className = 'wallpainttool-screen wallpainttool-screen-3';
  screen.dataset.step = '3';

  const card = document.createElement('div');
  card.className = 'wallpainttool-card wallpainttool-card-3';

  (rows || []).forEach((row, i) => {
    if (!row.textContent.trim()) return;
    const src = row.querySelector('p') || row;
    if (i === 0) {
      const h = document.createElement('h2');
      h.className = 'wallpainttool-form2-title';
      h.innerHTML = buildHeadingHTML(src);
      card.append(h);
    } else {
      const p = document.createElement('p');
      p.className = 'wallpainttool-form2-sub';
      p.innerHTML = src.innerHTML;
      card.append(p);
    }
  });

  screen.append(card);
  return { screen };
}

export default function decorate(block) {
  const allRows = [...block.children];
  if (!allRows.length) return;

  // Background images are authored once (as the image row under Step 1) but
  // shared by every step, so they are read from the block and exposed as CSS
  // custom properties. First <img> = desktop, second = mobile; the "?"-strip
  // drops any DA rendition query so the source stays crisp.
  const imgs = [...block.querySelectorAll('img')];
  const desktopSrc = imgs[0] ? (imgs[0].currentSrc || imgs[0].src).split('?')[0] : '';
  const mobileSrc = imgs[1] ? (imgs[1].currentSrc || imgs[1].src).split('?')[0] : desktopSrc;

  // Build each step's DOM subtree from its authored rows.
  const steps = splitSteps(allRows);
  const step1 = buildStep1(steps[0] || []);
  const step2 = buildStep2(steps[1] || []);
  const step3 = buildStep3(steps[2] || []);

  // Navigation is driven by a single `data-screen` attribute on the block;
  // the CSS shows only the matching step and hides the rest. All three steps
  // stay in the DOM so form state is preserved when moving between them.
  step1.form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (step1.proceed.disabled) return; // guard: questions not all answered
    block.dataset.screen = '2';
  });

  if (step2.form) {
    step2.form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Let the browser run native constraint validation (required fields,
      // tel/pincode patterns) and surface its messages before advancing.
      if (!step2.form.checkValidity()) {
        step2.form.reportValidity();
        return;
      }
      block.dataset.screen = '3';
    });
  }

  // Replace the authored table with the assembled steps and start on step 1.
  block.textContent = '';
  if (desktopSrc) block.style.setProperty('--wpt-bg-desktop', `url("${desktopSrc}")`);
  if (mobileSrc) block.style.setProperty('--wpt-bg-mobile', `url("${mobileSrc}")`);
  block.dataset.screen = '1';
  block.append(step1.screen, step2.screen, step3.screen);
}
