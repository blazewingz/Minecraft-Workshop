(function () {
  const data = MinecraftEnchantData;
  const engine = EnchantingOptimizer;
  const $ = id => document.getElementById(id);

  const editionEl = $('edition');
  const itemEl = $('targetItem');
  const workEl = $('targetWork');
  const objectiveEl = $('objective');
  const targetRows = $('targetEnchants');
  const bookRows = $('books');
  const statusEl = $('status');
  const stepsEl = $('steps');
  const metricsEl = $('metrics');
  const resultTitle = $('resultTitle');
  const resultBadge = $('resultBadge');
  const planNote = $('planNote');
  const explanation = $('explanation');

  function fillItems() {
    itemEl.innerHTML = data.items.map(([id, name]) => `<option value="${id}">${name}</option>`).join('');
  }

  function makeEnchantOptions(itemType, includeAll = false) {
    const list = includeAll ? engine.listAll() : engine.listApplicable(itemType);
    return list.sort((a,b) => a.name.localeCompare(b.name)).map(e => `<option value="${e.id}">${e.name}</option>`).join('');
  }

  function addTargetRow(initial) {
    const itemType = itemEl.value;
    if (targetRows.classList.contains('empty-state')) targetRows.classList.remove('empty-state');
    const row = document.createElement('div');
    row.className = 'row target-row';
    row.innerHTML = `
      <select class="enchant-select">${makeEnchantOptions(itemType, false)}</select>
      <select class="level-select"></select>
      <button type="button" class="remove-btn" title="Remove">×</button>`;
    row.querySelector('.enchant-select').addEventListener('change', () => populateLevel(row));
    row.querySelector('.remove-btn').addEventListener('click', () => { row.remove(); ensureEmptyTarget(); });
    targetRows.appendChild(row);
    if (initial) row.querySelector('.enchant-select').value = initial.id;
    populateLevel(row, initial?.level || 1);
  }

  function populateLevel(row, selected) {
    const e = data.enchantments[row.querySelector('.enchant-select').value];
    row.querySelector('.level-select').innerHTML = Array.from({length:e.max}, (_,i) => `<option value="${i+1}">${engine.roman(i+1)}</option>`).join('');
    row.querySelector('.level-select').value = String(Math.min(selected || 1, e.max));
  }

  function ensureEmptyTarget() {
    if (!targetRows.children.length) {
      targetRows.classList.add('empty-state');
      targetRows.textContent = 'None — starting from a clean item.';
    }
  }

  function addBookRow(initial) {
    if (bookRows.querySelector('.empty-state')) bookRows.innerHTML = '';
    if (bookRows.children.length >= 8) return;
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <select class="enchant-select">${makeEnchantOptions(itemEl.value, true)}</select>
      <select class="level-select"></select>
      <button type="button" class="remove-btn" title="Remove">×</button>`;
    row.querySelector('.enchant-select').addEventListener('change', () => populateLevel(row));
    row.querySelector('.remove-btn').addEventListener('click', () => { row.remove(); updateBookCount(); });
    bookRows.appendChild(row);
    if (initial) row.querySelector('.enchant-select').value = initial.id;
    populateLevel(row, initial?.level || 1);
    updateBookCount();
  }

  function updateBookCount() {
    const count = [...bookRows.children].filter(x => x.classList.contains('row')).length;
    $('bookCount').textContent = `${count} / 8 books`;
    $('addBook').disabled = count >= 8;
    $('addBook').style.opacity = count >= 8 ? .5 : 1;
  }

  function collect() {
    const targetEnchants = {};
    for (const row of [...targetRows.querySelectorAll('.row')]) {
      const id = row.querySelector('.enchant-select').value;
      const level = Number(row.querySelector('.level-select').value);
      if (!targetEnchants[id] || level > targetEnchants[id]) targetEnchants[id] = level;
    }
    const books = [...bookRows.querySelectorAll('.row')].map(row => ({ id: row.querySelector('.enchant-select').value, level: Number(row.querySelector('.level-select').value) }));
    return {
      edition: editionEl.value,
      itemType: itemEl.value,
      targetWork: Math.max(0, Math.min(6, Number(workEl.value) || 0)),
      targetEnchants, books, objective: objectiveEl.value
    };
  }

  function setStatus(text, type = '') { statusEl.textContent = text; statusEl.className = `status ${type}`.trim(); }

  function render(result) {
    const itemName = data.items.find(x => x[0] === result.itemType)?.[1] || 'item';
    resultTitle.textContent = result.objective === 'xp' ? 'Cheapest legal order' : 'Lowest-work order';
    resultBadge.textContent = result.maxStep < 40 ? 'LEGAL PLAN' : 'CHECK PLAN';
    resultBadge.className = 'result-badge good';
    metricsEl.innerHTML = `
      <div class="metric"><span>LEVELS SPENT</span><strong>${result.xp}</strong></div>
      <div class="metric"><span>FINAL PWP</span><strong>${engine.pwp(result.targetWork)}</strong></div>
      <div class="metric"><span>MAX STEP</span><strong>${result.maxStep}</strong></div>`;

    planNote.textContent = `${result.steps.length} anvil operation${result.steps.length === 1 ? '' : 's'} · ${result.edition === 'java' ? 'Java' : 'Bedrock'}`;
    stepsEl.classList.remove('empty-state','large');
    stepsEl.innerHTML = result.steps.map((s, i) => `
      <div class="step">
        <div class="step-number">${i + 1}</div>
        <div class="step-main">
          <div class="step-title">${escapeHtml(s.left)} <span style="color:#75695e">+</span> ${escapeHtml(s.right)}</div>
          <div class="step-meta">PWP ${s.targetPenalty} + ${s.sacrificePenalty} · enchantment cost ${s.enchantCost} · result work ${s.resultWork}</div>
        </div>
        <div class="step-cost"><strong>${s.totalCost}</strong><span>levels</span></div>
      </div>`).join('');

    const targetStart = collect().targetWork;
    const bookCount = collect().books.length;
    const reason = result.objective === 'xp'
      ? `<strong>Why this order:</strong> the solver searched legal book merges and target applications, keeping the Java 39-level cap active where applicable. It found the lowest total level cost; ties prefer a lower final work count.`
      : `<strong>Why this order:</strong> the solver first minimizes the target's final anvil-work count (and therefore its future prior-work penalty), then minimizes total levels, then the most expensive individual step.`;
    explanation.innerHTML = `${reason} <span style="display:block;margin-top:6px;color:#6d655d">Starting target uses: ${targetStart} · books: ${bookCount} · explored states: ${result.exploredStates} · final item: ${escapeHtml(itemName)}</span>`;
    explanation.classList.remove('hidden');
    setStatus('Optimal plan found.', 'good');
  }

  function escapeHtml(s) { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

  function clearResults() {
    resultTitle.textContent = 'Ready for the anvil';
    resultBadge.textContent = 'WAITING'; resultBadge.className = 'result-badge';
    metricsEl.innerHTML = `<div class="metric"><span>LEVELS SPENT</span><strong>—</strong></div><div class="metric"><span>FINAL PWP</span><strong>—</strong></div><div class="metric"><span>MAX STEP</span><strong>—</strong></div>`;
    planNote.textContent = 'Your result will appear here.';
    stepsEl.className = 'steps empty-state large';
    stepsEl.textContent = 'Add at least one enchanted book, then run the optimizer.';
    explanation.classList.add('hidden');
  }

  function optimize() {
    try {
      setStatus('Searching legal anvil trees…');
      const input = collect();
      if (!input.books.length) throw new Error('Add at least one enchanted book.');
      const result = engine.solve(input);
      render(result);
    } catch (err) {
      clearResults();
      setStatus(err.message || 'Something went wrong.', 'error');
      resultBadge.textContent = 'NO PLAN'; resultBadge.className = 'result-badge bad';
    }
  }

  function loadExample() {
    editionEl.value = 'java';
    itemEl.value = 'sword';
    workEl.value = '0';
    objectiveEl.value = 'xp';
    targetRows.innerHTML = ''; ensureEmptyTarget();
    bookRows.innerHTML = '';
    [['sharpness',5],['looting',3],['unbreaking',3],['mending',1]].forEach(([id,level]) => addBookRow({id,level}));
    clearResults(); setStatus('Example loaded — run the optimizer.'); updateChip();
  }

  function reset() {
    editionEl.value = 'java'; itemEl.value = 'sword'; workEl.value = '0'; objectiveEl.value = 'xp';
    targetRows.innerHTML = ''; ensureEmptyTarget(); bookRows.innerHTML = '';
    updateBookCount(); clearResults(); setStatus('Reset.'); updateChip();
  }

  function updateChip() { $('editionChip').textContent = editionEl.value === 'java' ? 'JAVA' : 'BEDROCK'; }

  itemEl.addEventListener('change', () => {
    // Existing target enchant rows are intentionally left alone; their dropdowns can be refreshed
    // to the new item's applicable enchantments on target-item change.
    for (const row of targetRows.querySelectorAll('.row')) {
      const id = row.querySelector('.enchant-select').value;
      const opts = data.enchantments[id]?.applies.has(itemEl.value);
      row.querySelector('.enchant-select').innerHTML = makeEnchantOptions(itemEl.value, false);
      if (opts) row.querySelector('.enchant-select').value = id;
      populateLevel(row);
    }
    for (const row of bookRows.querySelectorAll('.row')) {
      const id = row.querySelector('.enchant-select').value;
      row.querySelector('.enchant-select').innerHTML = makeEnchantOptions(itemEl.value, true);
      row.querySelector('.enchant-select').value = id;
      populateLevel(row);
    }
    updateChip();
  });
  editionEl.addEventListener('change', updateChip);
  $('addTargetEnchant').addEventListener('click', () => addTargetRow());
  $('addBook').addEventListener('click', () => addBookRow());
  $('optimize').addEventListener('click', optimize);
  $('reset').addEventListener('click', reset);
  $('loadExample').addEventListener('click', loadExample);

  fillItems();
  reset();
})();
