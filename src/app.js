// ===== State + persistence =====
const STORAGE_KEY = 'coc-price-checker-v1';

const state = {
  bundles: [],
  valuation: null,    // { values, equationsUsed, perItemCount }
  ui: {
    tab: 'bundles',
    bundleSearch: '',
    bundleFilterType: 'all',
    bundleFilterStatus: 'all',
    itemSearch: '',
    editingBundleId: null,
  },
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state.bundles = SEED_BUNDLES.map(b => structuredClone(b));
      saveState();
      return;
    }
    const parsed = JSON.parse(raw);
    state.bundles = parsed.bundles ?? [];
  } catch (e) {
    console.error('Failed to load state, resetting', e);
    state.bundles = SEED_BUNDLES.map(b => structuredClone(b));
    saveState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ bundles: state.bundles }));
}

function resetToDefault() {
  if (!confirm('Reset all data to default? All your changes will be lost.')) return;
  state.bundles = SEED_BUNDLES.map(b => structuredClone(b));
  state.valuation = null;
  saveState();
  recomputeValuation();
  renderAll();
}

// ===== Helpers =====
function fmtSEK(n) {
  if (n == null || !isFinite(n)) return '–';
  if (n === 0) return '0 kr';
  if (n < 0.01) return n.toFixed(4) + ' kr';
  if (n < 1)    return n.toFixed(3) + ' kr';
  if (n < 10)   return n.toFixed(2) + ' kr';
  return n.toFixed(0) + ' kr';
}

function fmtScore(s) {
  if (s == null || !isFinite(s)) return '–';
  return s.toFixed(2) + 'x';
}

function uid(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}

function itemImage(item) {
  if (item.image) return `<img src="${item.image}" alt="${item.name}" title="${item.name}">`;
  return `<span class="item-placeholder" style="width:24px;height:24px;font-size:12px">?</span>`;
}

// ===== Valuation =====
function recomputeValuation() {
  const itemIds = ITEMS.map(i => i.id);
  // Use ALL bundles for the model (active + inactive + trader). User can later
  // exclude individual bundles if we add that feature.
  state.valuation = computeValuation(state.bundles, itemIds);
}

// ===== Rendering =====
function renderAll() {
  renderBundles();
  renderItems();
  renderValuation();
  renderDataStats();
}

// ----- Bundles tab -----
function renderBundles() {
  const list = document.getElementById('bundles-list');
  const search = state.ui.bundleSearch.trim().toLowerCase();
  const fType = state.ui.bundleFilterType;
  const fStatus = state.ui.bundleFilterStatus;

  const filtered = state.bundles.filter(b => {
    if (fType !== 'all' && b.type !== fType) return false;
    if (fStatus === 'active' && !b.active) return false;
    if (fStatus === 'inactive' && b.active) return false;
    if (fStatus === 'purchased' && !b.purchased) return false;
    if (search) {
      const inName = b.name.toLowerCase().includes(search);
      const inItems = b.contents.some(c => {
        const it = ITEM_BY_ID[c.itemId];
        return it && it.name.toLowerCase().includes(search);
      });
      if (!inName && !inItems) return false;
    }
    return true;
  });

  // Sort: active first, then by score desc if available, else by name
  const values = state.valuation?.values ?? {};
  filtered.sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    const sa = scoreBundle(a, values).score ?? -Infinity;
    const sb = scoreBundle(b, values).score ?? -Infinity;
    if (sa !== sb) return sb - sa;
    return a.name.localeCompare(b.name);
  });

  if (filtered.length === 0) {
    list.innerHTML = '<p class="muted">No bundles matched.</p>';
    return;
  }

  list.innerHTML = filtered.map(b => bundleCardHTML(b, values)).join('');
  list.querySelectorAll('.bundle-card').forEach(el => {
    el.addEventListener('click', () => openBundleModal(el.dataset.id));
  });
}

function bundleCardHTML(b, values) {
  const score = scoreBundle(b, values);
  const priceLabel = b.type === 'trader'
    ? `${Math.abs(b.contents.find(c => c.itemId === 'gem')?.qty || 0)} gems`
    : `${b.priceSEK} kr`;
  const scoreClass = score.score == null ? '' : score.score >= 1 ? 'score-good' : 'score-bad';

  const chips = b.contents.map(c => {
    const item = ITEM_BY_ID[c.itemId];
    if (!item) return '';
    const img = item.image
      ? `<img src="${item.image}" alt="${item.name}">`
      : `<span style="display:inline-block;width:18px;height:18px;background:var(--bg-elev);border-radius:3px;text-align:center;font-size:11px;line-height:18px;color:var(--text-muted)">?</span>`;
    const negCls = c.qty < 0 ? 'negative' : '';
    return `<span class="content-chip ${negCls}" title="${item.name}">${img}<span class="qty">${c.qty > 0 ? '×' + c.qty : c.qty}</span></span>`;
  }).join('');

  return `
    <div class="bundle-card ${b.active ? '' : 'inactive'}" data-id="${b.id}">
      <div class="bundle-card-header">
        <div class="bundle-card-title">${escape(b.name)}</div>
        <div class="bundle-card-price ${b.type === 'trader' ? 'gems' : ''}">${priceLabel}</div>
      </div>
      <div class="bundle-card-meta">
        <span class="tag ${b.type}">${b.type}</span>
        ${b.active ? '' : '<span class="tag">inactive</span>'}
        ${b.purchased ? '<span class="tag purchased">purchased</span>' : ''}
        ${b.dateAdded ? `<span>${b.dateAdded}</span>` : ''}
      </div>
      <div class="bundle-card-contents">${chips}</div>
      <div class="bundle-card-score">
        <span class="muted">Value: ${fmtSEK(score.itemValue)}</span>
        <span class="${scoreClass}">${fmtScore(score.score)}</span>
      </div>
    </div>
  `;
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ----- Valuation tab -----
function renderValuation() {
  const tbody = document.querySelector('#item-values-table tbody');
  const status = document.getElementById('valuation-status');

  if (!state.valuation || Object.keys(state.valuation.values).length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="muted">Click "Recompute valuation".</td></tr>';
    status.textContent = '';
  } else {
    const { values, equationsUsed, perItemCount } = state.valuation;
    status.textContent = `${equationsUsed} bundles used for valuation.`;
    const rows = ITEMS
      .filter(i => values[i.id] !== undefined)
      .map(i => ({ item: i, value: values[i.id], count: perItemCount[i.id] || 0 }))
      .sort((a, b) => b.value - a.value);
    tbody.innerHTML = rows.map(r => {
      const per = r.value > 0 && r.value < 1 ? `(per ${r.item.name.toLowerCase()})` : '';
      const stack = bestStackHint(r.item, r.value);
      return `<tr>
        <td>${itemImage(r.item)}</td>
        <td>${escape(r.item.name)} <span class="muted small">${r.item.category}</span></td>
        <td class="num">${fmtSEK(r.value)}</td>
        <td class="num muted small">${stack}</td>
        <td class="num muted">${r.count}</td>
      </tr>`;
    }).join('');
  }

  // Bundle scores table
  const stbody = document.querySelector('#bundle-scores-table tbody');
  const values = state.valuation?.values ?? {};
  const scored = state.bundles
    .filter(b => b.active)
    .map(b => ({ b, ...scoreBundle(b, values) }))
    .filter(x => x.score != null)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    stbody.innerHTML = '<tr><td colspan="4" class="muted">Nothing to show yet.</td></tr>';
  } else {
    stbody.innerHTML = scored.map(x => {
      const cls = x.score >= 1 ? 'score-good' : 'score-bad';
      const cost = x.b.type === 'trader'
        ? `${Math.abs(x.b.contents.find(c => c.itemId === 'gem')?.qty || 0)}g (${fmtSEK(x.cost)})`
        : `${x.b.priceSEK} kr`;
      return `<tr>
        <td>${escape(x.b.name)} <span class="tag ${x.b.type}">${x.b.type}</span></td>
        <td class="num">${cost}</td>
        <td class="num">${fmtSEK(x.itemValue)}</td>
        <td class="num ${cls}">${fmtScore(x.score)}</td>
      </tr>`;
    }).join('');
  }
}

// Helper: for resources, show a useful "per 1000" type hint
function bestStackHint(item, value) {
  if (item.category === 'resource' && value < 0.01) {
    return `${(value * 1000).toFixed(2)} kr / 1k`;
  }
  if (item.category === 'ore' && value < 1) {
    return `${(value * 100).toFixed(2)} kr / 100`;
  }
  return '';
}

// ----- Items tab -----
function renderItems() {
  const grid = document.getElementById('items-grid');
  const search = state.ui.itemSearch.trim().toLowerCase();
  const values = state.valuation?.values ?? {};

  const filtered = search
    ? ITEMS.filter(i => i.name.toLowerCase().includes(search) || i.category.includes(search))
    : ITEMS;

  grid.innerHTML = filtered.map(i => {
    const v = values[i.id];
    const img = i.image
      ? `<img src="${i.image}" alt="${i.name}">`
      : `<div class="item-placeholder">?</div>`;
    return `<div class="item-card">
      ${img}
      <div class="item-name">${escape(i.name)}</div>
      <div class="item-cat">${i.category}</div>
      ${v !== undefined ? `<div class="item-value">${fmtSEK(v)}</div>` : ''}
    </div>`;
  }).join('');
}

// ----- Data tab -----
function renderDataStats() {
  const stats = document.getElementById('data-stats');
  const total = state.bundles.length;
  const active = state.bundles.filter(b => b.active).length;
  const purchased = state.bundles.filter(b => b.purchased).length;
  const totalSpent = state.bundles.filter(b => b.purchased && b.priceSEK).reduce((s, b) => s + b.priceSEK, 0);
  const types = {
    shop: state.bundles.filter(b => b.type === 'shop').length,
    'gem-pack': state.bundles.filter(b => b.type === 'gem-pack').length,
    trader: state.bundles.filter(b => b.type === 'trader').length,
  };
  stats.innerHTML = `
    <div class="stat"><div class="stat-value">${total}</div><div class="stat-label">Total bundles</div></div>
    <div class="stat"><div class="stat-value">${active}</div><div class="stat-label">Active</div></div>
    <div class="stat"><div class="stat-value">${purchased}</div><div class="stat-label">Purchased</div></div>
    <div class="stat"><div class="stat-value">${totalSpent} kr</div><div class="stat-label">Total spent</div></div>
    <div class="stat"><div class="stat-value">${types.shop}</div><div class="stat-label">Shop</div></div>
    <div class="stat"><div class="stat-value">${types['gem-pack']}</div><div class="stat-label">Gem packs</div></div>
    <div class="stat"><div class="stat-value">${types.trader}</div><div class="stat-label">Trader</div></div>
  `;
}

// ===== Bundle modal =====
function openBundleModal(bundleId) {
  const modal = document.getElementById('bundle-modal');
  const form = document.getElementById('bundle-form');
  const titleEl = document.getElementById('bundle-modal-title');
  const deleteBtn = document.getElementById('btn-delete-bundle');
  state.ui.editingBundleId = bundleId;

  const bundle = bundleId ? state.bundles.find(b => b.id === bundleId) : null;
  titleEl.textContent = bundle ? 'Edit bundle' : 'New bundle';
  deleteBtn.style.display = bundle ? '' : 'none';

  form.elements.name.value = bundle?.name ?? '';
  form.elements.type.value = bundle?.type ?? 'shop';
  form.elements.priceSEK.value = bundle?.priceSEK ?? '';
  form.elements.dateAdded.value = bundle?.dateAdded ?? new Date().toISOString().slice(0, 10);
  form.elements.active.checked = bundle?.active ?? true;
  form.elements.purchased.checked = bundle?.purchased ?? false;
  form.elements.notes.value = bundle?.notes ?? '';

  const rowsContainer = document.getElementById('bundle-contents-rows');
  rowsContainer.innerHTML = '';
  const contents = bundle?.contents ?? [{ itemId: ITEMS[0].id, qty: 1 }];
  contents.forEach(c => addContentRow(c));

  modal.classList.remove('hidden');
}

function closeBundleModal() {
  document.getElementById('bundle-modal').classList.add('hidden');
  state.ui.editingBundleId = null;
}

function addContentRow(content = { itemId: ITEMS[0].id, qty: 1 }) {
  const rowsContainer = document.getElementById('bundle-contents-rows');
  const row = document.createElement('div');
  row.className = 'content-row';
  const options = ITEMS.map(i =>
    `<option value="${i.id}" ${i.id === content.itemId ? 'selected' : ''}>${i.name}</option>`
  ).join('');
  row.innerHTML = `
    <select class="content-item">${options}</select>
    <input type="number" class="content-qty" step="any" value="${content.qty}">
    <button type="button" class="icon-btn content-remove" title="Remove">×</button>
  `;
  row.querySelector('.content-remove').addEventListener('click', () => row.remove());
  rowsContainer.appendChild(row);
}

function readBundleForm() {
  const form = document.getElementById('bundle-form');
  const rows = [...document.querySelectorAll('#bundle-contents-rows .content-row')];
  const contents = rows.map(r => ({
    itemId: r.querySelector('.content-item').value,
    qty: parseFloat(r.querySelector('.content-qty').value),
  })).filter(c => !isNaN(c.qty) && c.qty !== 0);

  const priceRaw = form.elements.priceSEK.value;
  return {
    name: form.elements.name.value.trim(),
    type: form.elements.type.value,
    priceSEK: priceRaw === '' ? null : parseFloat(priceRaw),
    dateAdded: form.elements.dateAdded.value,
    active: form.elements.active.checked,
    purchased: form.elements.purchased.checked,
    notes: form.elements.notes.value.trim(),
    contents,
  };
}

function saveBundleFromForm(e) {
  e.preventDefault();
  const data = readBundleForm();
  if (!data.name) { alert('Name is required.'); return; }
  if (data.contents.length === 0) { alert('Add at least one item.'); return; }

  if (state.ui.editingBundleId) {
    const bundle = state.bundles.find(b => b.id === state.ui.editingBundleId);
    Object.assign(bundle, data);
  } else {
    state.bundles.push({ id: uid('b'), ...data });
  }
  saveState();
  recomputeValuation();
  renderAll();
  closeBundleModal();
}

function deleteCurrentBundle() {
  if (!state.ui.editingBundleId) return;
  if (!confirm('Delete this bundle?')) return;
  state.bundles = state.bundles.filter(b => b.id !== state.ui.editingBundleId);
  saveState();
  recomputeValuation();
  renderAll();
  closeBundleModal();
}

// ===== Export / import =====
function exportJSON() {
  const blob = new Blob(
    [JSON.stringify({ bundles: state.bundles }, null, 2)],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `coc-price-checker-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data.bundles)) throw new Error('Invalid format.');
      if (!confirm(`Import ${data.bundles.length} bundles? Existing data will be replaced.`)) return;
      state.bundles = data.bundles;
      saveState();
      recomputeValuation();
      renderAll();
    } catch (err) {
      alert('Could not read file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ===== Tabs =====
function switchTab(tab) {
  state.ui.tab = tab;
  document.querySelectorAll('.tab').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-panel').forEach(el => {
    el.classList.toggle('active', el.id === 'tab-' + tab);
  });
}

// ===== Wire up =====
function init() {
  loadState();
  recomputeValuation();
  renderAll();

  // Tabs
  document.querySelectorAll('.tab').forEach(el => {
    el.addEventListener('click', () => switchTab(el.dataset.tab));
  });

  // Bundles toolbar
  document.getElementById('search-bundles').addEventListener('input', e => {
    state.ui.bundleSearch = e.target.value; renderBundles();
  });
  document.getElementById('filter-type').addEventListener('change', e => {
    state.ui.bundleFilterType = e.target.value; renderBundles();
  });
  document.getElementById('filter-status').addEventListener('change', e => {
    state.ui.bundleFilterStatus = e.target.value; renderBundles();
  });
  document.getElementById('btn-new-bundle').addEventListener('click', () => openBundleModal(null));

  // Items toolbar
  document.getElementById('search-items').addEventListener('input', e => {
    state.ui.itemSearch = e.target.value; renderItems();
  });

  // Valuation
  document.getElementById('btn-recalc').addEventListener('click', () => {
    recomputeValuation(); renderAll();
  });

  // Modal
  document.getElementById('bundle-modal-close').addEventListener('click', closeBundleModal);
  document.getElementById('btn-cancel-bundle').addEventListener('click', closeBundleModal);
  document.getElementById('btn-add-content-row').addEventListener('click', () => addContentRow());
  document.getElementById('bundle-form').addEventListener('submit', saveBundleFromForm);
  document.getElementById('btn-delete-bundle').addEventListener('click', deleteCurrentBundle);
  document.getElementById('bundle-modal').addEventListener('click', e => {
    if (e.target.id === 'bundle-modal') closeBundleModal();
  });

  // Data tab
  document.getElementById('btn-export').addEventListener('click', exportJSON);
  document.getElementById('btn-import').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', e => {
    if (e.target.files[0]) importJSON(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('btn-reset').addEventListener('click', resetToDefault);
}

document.addEventListener('DOMContentLoaded', init);
