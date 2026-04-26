// Ridge-regularized least squares.
// Each bundle gives one equation: sum(qty_i * x_i) = priceSEK
// (For trader bundles, gems appear as a negative qty so the equation becomes
//   sum(item_qty * value) - gem_qty * gem_value = 0.)
//
// We solve x = argmin ||A x - b||^2 + lambda ||x||^2
// via the normal equations: (A^T A + lambda I) x = A^T b.
// Negative results are clipped to 0 in the output.

function transpose(M) {
  return M[0].map((_, j) => M.map(row => row[j]));
}

function matMul(A, B) {
  const m = A.length, n = B[0].length, k = B.length;
  const C = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let p = 0; p < k; p++) {
      const aip = A[i][p];
      if (aip === 0) continue;
      for (let j = 0; j < n; j++) C[i][j] += aip * B[p][j];
    }
  }
  return C;
}

function matVec(A, v) {
  return A.map(row => {
    let s = 0;
    for (let i = 0; i < row.length; i++) s += row[i] * v[i];
    return s;
  });
}

// Gaussian elimination with partial pivoting. Returns x or null if singular.
function solveLinear(A, b) {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let k = 0; k < n; k++) {
    let pivot = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(M[i][k]) > Math.abs(M[pivot][k])) pivot = i;
    }
    [M[k], M[pivot]] = [M[pivot], M[k]];
    if (Math.abs(M[k][k]) < 1e-12) return null;
    for (let i = k + 1; i < n; i++) {
      const f = M[i][k] / M[k][k];
      if (f === 0) continue;
      for (let j = k; j <= n; j++) M[i][j] -= f * M[k][j];
    }
  }
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return x;
}

// Build A and b from bundles.
// itemIds is the column order. Bundles with no items relevant to itemIds are skipped.
function buildSystem(bundles, itemIds) {
  const idx = Object.fromEntries(itemIds.map((id, i) => [id, i]));
  const A = [];
  const b = [];
  const used = []; // parallel array of bundle refs for diagnostics
  for (const bundle of bundles) {
    const row = new Array(itemIds.length).fill(0);
    let any = false;
    for (const c of bundle.contents) {
      if (idx[c.itemId] === undefined) continue;
      row[idx[c.itemId]] += c.qty;
      if (c.qty !== 0) any = true;
    }
    if (!any) continue;
    const target = bundle.type === 'trader' ? 0 : (bundle.priceSEK ?? 0);
    A.push(row);
    b.push(target);
    used.push(bundle);
  }
  return { A, b, used };
}

// Main entry point. Returns { values: {itemId: SEK}, equationsUsed, perItemCount }.
function computeValuation(bundles, itemIds, opts = {}) {
  const lambda = opts.lambda ?? 0.001;
  const { A, b } = buildSystem(bundles, itemIds);
  if (A.length === 0) {
    return { values: {}, equationsUsed: 0, perItemCount: {} };
  }

  // Count how many bundles each item appears in (for confidence display)
  const perItemCount = Object.fromEntries(itemIds.map(id => [id, 0]));
  for (const row of A) {
    row.forEach((v, i) => { if (v !== 0) perItemCount[itemIds[i]]++; });
  }

  // Normal equations with ridge: (A^T A + lambda I) x = A^T b
  const At = transpose(A);
  const AtA = matMul(At, A);
  for (let i = 0; i < AtA.length; i++) AtA[i][i] += lambda;
  const Atb = matVec(At, b);
  const xRaw = solveLinear(AtA, Atb);

  const values = {};
  if (xRaw) {
    for (let i = 0; i < itemIds.length; i++) {
      values[itemIds[i]] = Math.max(0, xRaw[i]);
    }
  }
  return { values, equationsUsed: A.length, perItemCount };
}

// Compute the SEK-equivalent value of a bundle's contents using a value map.
// For trader bundles (priceSEK==null), returns:
//   { itemValue, gemCost, score } where score = itemValue / gemCost.
// For SEK bundles: score = itemValue / priceSEK.
function scoreBundle(bundle, values) {
  let itemValue = 0;     // SEK value of positive-qty items
  let gemCostValue = 0;  // SEK value of gems consumed (for traders)
  for (const c of bundle.contents) {
    const v = values[c.itemId] ?? 0;
    if (c.qty > 0) itemValue += c.qty * v;
    else if (c.qty < 0 && c.itemId === 'gem') gemCostValue += -c.qty * v;
  }
  if (bundle.type === 'trader') {
    return {
      itemValue,
      cost: gemCostValue,
      score: gemCostValue > 0 ? itemValue / gemCostValue : null,
      costLabel: 'gems → SEK',
    };
  }
  return {
    itemValue,
    cost: bundle.priceSEK ?? 0,
    score: bundle.priceSEK > 0 ? itemValue / bundle.priceSEK : null,
    costLabel: 'SEK',
  };
}
