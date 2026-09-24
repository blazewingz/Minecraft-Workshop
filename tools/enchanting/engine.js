(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EnchantingOptimizer = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const DATA = () => (typeof MinecraftEnchantData !== 'undefined' ? MinecraftEnchantData : null);

  function pwp(work) {
    return Math.pow(2, work) - 1;
  }

  function cloneEnchants(m) { return Object.assign({}, m); }

  function sameEnchants(a, b) {
    const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
    if (ka.length !== kb.length) return false;
    return ka.every(k => a[k] === b[k]);
  }

  function formatEnchantMap(enchants, data) {
    const order = Object.keys(enchants).sort((a,b) => data.enchantments[a].name.localeCompare(data.enchantments[b].name));
    return order.map(id => `${data.enchantments[id].name} ${roman(enchants[id])}`).join(', ');
  }

  function roman(n) {
    const vals = [[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]; let s='';
    for (const [v,c] of vals) while (n >= v) { s += c; n -= v; }
    return s;
  }

  function applicable(id, itemType, data) {
    return Boolean(data.enchantments[id] && data.enchantments[id].applies.has(itemType));
  }

  function conflictsWithTarget(id, targetEnchants, data) {
    const e = data.enchantments[id];
    return Object.keys(targetEnchants).some(other => other !== id && (e.conflicts.has(other) || data.enchantments[other].conflicts.has(id)));
  }

  function mergePair(left, right, edition, itemType, data) {
    // Actual anvil slot ordering is enforced for target items; book-book is symmetric.
    const target = left.kind === 'target' ? left : right.kind === 'target' ? right : left;
    const sacrifice = left.kind === 'target' ? right : right.kind === 'target' ? left : right;
    const isTargetOperation = target.kind === 'target';
    const resultEnchants = cloneEnchants(target.enchants);
    let enchantCost = 0;
    let changes = 0;
    let incompatibleCount = 0;

    const ids = Object.keys(sacrifice.enchants);
    for (const id of ids) {
      const e = data.enchantments[id];
      if (!e) continue;

      if (isTargetOperation && !applicable(id, itemType, data)) {
        continue;
      }

      const current = resultEnchants[id] || 0;
      let final = current;

      if (conflictsWithTarget(id, resultEnchants, data)) {
        incompatibleCount++;
        if (edition === 'java') enchantCost += 1;
        continue;
      }

      if (current === 0) final = sacrifice.enchants[id];
      else if (sacrifice.enchants[id] > current) final = sacrifice.enchants[id];
      else if (sacrifice.enchants[id] === current && current < e.max) final = current + 1;

      if (final !== current) {
        resultEnchants[id] = Math.min(final, e.max);
        changes++;
      }

      const multiplier = sacrifice.kind === 'book'
        ? (edition === 'java' ? e.bookJava : e.bookJava)
        : (edition === 'java' ? e.itemJava : e.itemJava);

      if (edition === 'java') enchantCost += multiplier * resultEnchants[id];
      else enchantCost += multiplier * Math.max(0, resultEnchants[id] - current);
    }

    // A vanilla anvil needs an actual useful operation. For this calculator, an enchantment
    // merge that changes nothing is treated as invalid so the solver doesn't invent no-op steps.
    if (changes === 0) return null;

    const targetPenalty = pwp(left.work);
    const sacrificePenalty = pwp(right.work);
    const totalCost = targetPenalty + sacrificePenalty + enchantCost;
    const resultKind = target.kind === 'target' ? 'target' : 'book';
    const resultWork = Math.max(left.work, right.work) + 1;
    const result = {
      kind: resultKind,
      enchants: resultEnchants,
      work: resultWork,
      label: resultKind === 'target' ? target.label : `Combined book`,
      history: `${left.label} + ${right.label}`,
    };

    return {
      result,
      totalCost,
      targetPenalty,
      sacrificePenalty,
      enchantCost,
      incompatibleCount,
      changes,
      allowed: edition !== 'java' || totalCost < 40,
    };
  }

  function signatureComponent(c) {
    const ench = Object.keys(c.enchants).sort().map(id => `${id}:${c.enchants[id]}`).join(',');
    return `${c.kind}|${c.work}|${ench}`;
  }

  function stateKey(components) {
    return components.map(signatureComponent).sort().join('||');
  }

  function canonicalize(components) {
    return [...components].sort((a,b) => {
      if (a.kind !== b.kind) return a.kind === 'target' ? -1 : 1;
      return signatureComponent(a).localeCompare(signatureComponent(b));
    });
  }

  function better(a, b, objective) {
    if (!b) return true;
    if (objective === 'xp') {
      if (a.xp !== b.xp) return a.xp < b.xp;
      if (a.targetWork !== b.targetWork) return a.targetWork < b.targetWork;
      return a.maxStep < b.maxStep;
    }
    if (a.targetWork !== b.targetWork) return a.targetWork < b.targetWork;
    if (a.xp !== b.xp) return a.xp < b.xp;
    return a.maxStep < b.maxStep;
  }

  function solve(input) {
    const data = DATA();
    if (!data) throw new Error('Enchantment data is unavailable.');
    const { edition, itemType, targetWork, targetEnchants, books, objective } = input;
    if (!books.length) throw new Error('No enchanted books.');
    if (books.length > 8) throw new Error('This exact solver supports up to 8 books.');

    const target = {
      kind: 'target', label: data.items.find(x => x[0] === itemType)?.[1] || 'Target item',
      work: targetWork, enchants: cloneEnchants(targetEnchants)
    };
    const initialBooks = books.map((b, i) => ({
      kind: 'book', label: `Book ${i + 1} — ${data.enchantments[b.id].name} ${roman(b.level)}`,
      work: 0, enchants: { [b.id]: b.level }
    }));

    const memo = new Map();
    let explored = 0;

    function recurse(rawComponents) {
      const components = canonicalize(rawComponents);
      const key = stateKey(components);
      if (memo.has(key)) return memo.get(key);
      explored++;

      if (components.length === 1) {
        const t = components[0];
        const base = { xp: 0, targetWork: t.work, maxStep: 0, steps: [] };
        memo.set(key, base);
        return base;
      }

      let best = null;
      for (let i = 0; i < components.length; i++) {
        for (let j = i + 1; j < components.length; j++) {
          const a = components[i], b = components[j];
          let left = a, right = b;
          if (a.kind !== 'target' && b.kind === 'target') { left = b; right = a; }
          const op = mergePair(left, right, edition, itemType, data);
          if (!op || !op.allowed) continue;

          const next = components.filter((_, idx) => idx !== i && idx !== j);
          next.push(op.result);
          const tail = recurse(next);
          if (!tail) continue;
          const candidate = {
            xp: op.totalCost + tail.xp,
            targetWork: tail.targetWork,
            maxStep: Math.max(op.totalCost, tail.maxStep),
            steps: [{
              left: left.label, right: right.label, totalCost: op.totalCost,
              targetPenalty: op.targetPenalty, sacrificePenalty: op.sacrificePenalty,
              enchantCost: op.enchantCost, incompatibleCount: op.incompatibleCount,
              resultLabel: op.result.label, resultWork: op.result.work,
              resultEnchants: op.result.enchants,
              kind: op.result.kind
            }, ...tail.steps]
          };
          if (better(candidate, best, objective)) best = candidate;
        }
      }

      memo.set(key, best);
      return best;
    }

    const best = recurse([target, ...initialBooks]);
    if (!best) throw new Error(edition === 'java'
      ? 'No legal Java plan fits under the 39-level survival cap. Try fewer/more suitable books or start with a lower-work target.'
      : 'No legal plan was found. Check the enchantments and target item.');
    best.exploredStates = explored;
    best.edition = edition;
    best.itemType = itemType;
    best.objective = objective;
    return best;
  }

  function listApplicable(itemType) {
    const data = DATA();
    return Object.values(data.enchantments).filter(e => e.applies.has(itemType));
  }

  function listAll() {
    const data = DATA();
    return Object.values(data.enchantments);
  }

  return { solve, pwp, listApplicable, listAll, roman, formatEnchantMap };
});
