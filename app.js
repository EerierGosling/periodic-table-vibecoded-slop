import { ELEMENTS } from './elements.js';

const COLORS = {
  'nonmetal':              '#2dd4bf',
  'noble gas':             '#a78bfa',
  'alkali metal':          '#f87171',
  'alkaline earth metal':  '#fb923c',
  'transition metal':      '#60a5fa',
  'metalloid':             '#a3e635',
  'post-transition metal': '#38bdf8',
  'halogen':               '#e879f9',
  'lanthanoid':            '#34d399',
  'actinoid':              '#fbbf24',
  'unknown':               '#94a3b8',
};

const table = document.getElementById('table');
const search = document.getElementById('search');
const modal = document.getElementById('modal');
const details = document.getElementById('details');
const close = document.getElementById('close');
const filters = document.getElementById('filters');

function makeGrid() {
  // create 18x9 grid (main 7 periods + lanthanides + actinides rows)
  const totalCells = 18 * 9;
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'blank';
    table.appendChild(cell);
  }

  ELEMENTS.forEach(el => {
    const col = (el.group || 0) - 1;
    const row = (el.period || 0) - 1;
    const idx = row * 18 + col;
    const elNode = document.createElement('button');
    elNode.className = 'element';
    elNode.setAttribute('role', 'button');
    elNode.dataset.number = el.number;
    elNode.dataset.col = el.group || '';
    elNode.dataset.row = el.period || '';
    const catClass = el.category ? ('cat-' + el.category.replace(/\s+/g, '-')) : '';
    if (catClass) elNode.classList.add(catClass);
    const color = COLORS[el.category] || '#4a5568';
    elNode.style.setProperty('--cat', color);
    elNode.innerHTML = `<div class="num">${el.number}</div><div class="sym">${el.symbol}</div><div class="name">${el.name}</div>`;
    elNode.addEventListener('click', () => showDetails(el));
    table.children[idx].replaceWith(elNode);
  });
}

function buildFilters() {
  const cats = Array.from(new Set(ELEMENTS.map(e => e.category).filter(Boolean)));
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn';
  allBtn.textContent = 'All';
  allBtn.setAttribute('aria-pressed', 'true');
  allBtn.addEventListener('click', () => setFilter(null, allBtn));
  filters.appendChild(allBtn);
  cats.forEach(c => {
    const b = document.createElement('button');
    b.className = 'filter-btn';
    b.textContent = c;
    b.dataset.cat = c;
    b.setAttribute('aria-pressed', 'false');
    b.style.setProperty('--cat', COLORS[c] || '#4a5568');
    b.addEventListener('click', () => setFilter(c, b));
    filters.appendChild(b);
  });
}

function setFilter(cat, btn) {
  for (const b of filters.querySelectorAll('.filter-btn')) b.setAttribute('aria-pressed', 'false');
  btn.setAttribute('aria-pressed', 'true');
  for (const el of table.querySelectorAll('.element')) {
    const n = el.dataset.number;
    const item = ELEMENTS.find(x => String(x.number) === n);
    const show = !cat || item.category === cat;
    el.style.display = show ? '' : 'none';
  }
}

function showDetails(el) {
  const color = COLORS[el.category] || '#94a3b8';
  details.style.setProperty('--cat', color);
  details.innerHTML = `
    <div class="symbol-hero">${el.symbol}</div>
    <h2>${el.name}</h2>
    <div class="props">
      <div class="prop"><div class="prop-label">Atomic Number</div><div class="prop-value">${el.number}</div></div>
      <div class="prop"><div class="prop-label">Atomic Mass</div><div class="prop-value">${el.mass || '—'}</div></div>
      <div class="prop"><div class="prop-label">Period</div><div class="prop-value">${el.period <= 7 ? el.period : '—'}</div></div>
      <div class="prop"><div class="prop-label">Group</div><div class="prop-value">${el.group || '—'}</div></div>
      <div class="prop" style="grid-column:1/-1"><div class="prop-label">Category</div><div class="prop-value" style="color:${color}">${el.category || '—'}</div></div>
    </div>`;
  modal.setAttribute('aria-hidden', 'false');
  close.focus();
}

function hideDetails() {
  modal.setAttribute('aria-hidden', 'true');
}

close.addEventListener('click', hideDetails);
modal.addEventListener('click', e => { if (e.target === modal) hideDetails(); });

search.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  for (const btn of table.querySelectorAll('.element')) {
    const n = btn.dataset.number;
    const el = ELEMENTS.find(x => String(x.number) === n);
    const match = !q || el.name.toLowerCase().includes(q) || el.symbol.toLowerCase().includes(q) || String(el.number) === q;
    btn.style.opacity = match ? '1' : '0.18';
    btn.style.display = match ? '' : 'none';
  }
});

// Keyboard navigation: move by row/col using data-row/data-col
document.addEventListener('keydown', (e) => {
  if (modal.getAttribute('aria-hidden') === 'false' && e.key === 'Escape') {
    hideDetails();
    return;
  }
  const active = document.activeElement;
  if (!active || !active.classList.contains('element')) return;
  const col = Number(active.dataset.col) || 0;
  const row = Number(active.dataset.row) || 0;
  let target;
  if (e.key === 'ArrowLeft') target = document.querySelector(`.element[data-row="${row}"][data-col="${col - 1}"]`);
  if (e.key === 'ArrowRight') target = document.querySelector(`.element[data-row="${row}"][data-col="${col + 1}"]`);
  if (e.key === 'ArrowUp') target = document.querySelector(`.element[data-row="${row - 1}"][data-col="${col}"]`);
  if (e.key === 'ArrowDown') target = document.querySelector(`.element[data-row="${row + 1}"][data-col="${col}"]`);
  if (e.key === 'Enter' || e.key === ' ') { active.click(); e.preventDefault(); }
  if (target) { target.focus(); e.preventDefault(); }
});

makeGrid();
buildFilters();

