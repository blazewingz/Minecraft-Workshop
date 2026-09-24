(function () {
  const E = (name, max, bookJava, itemJava, applies, conflicts = []) => ({
    name, max, bookJava, itemJava, applies: new Set(applies), conflicts: new Set(conflicts)
  });

  const ALL = {};
  const add = (id, data) => { ALL[id] = { id, ...data }; };

  // Current vanilla enchantment set used by the planner. Multipliers are the anvil
  // enchantment multipliers; edition differences are handled in engine.js.
  add('protection', E('Protection', 4, 1, 1, ['helmet','chestplate','leggings','boots','elytra'], ['fire_protection','blast_protection','projectile_protection']));
  add('fire_protection', E('Fire Protection', 4, 2, 1, ['helmet','chestplate','leggings','boots'], ['protection','blast_protection','projectile_protection']));
  add('feather_falling', E('Feather Falling', 4, 2, 2, ['boots']));
  add('blast_protection', E('Blast Protection', 4, 2, 4, ['helmet','chestplate','leggings','boots'], ['protection','fire_protection','projectile_protection']));
  add('projectile_protection', E('Projectile Protection', 4, 1, 2, ['helmet','chestplate','leggings','boots'], ['protection','fire_protection','blast_protection']));
  add('thorns', E('Thorns', 3, 4, 8, ['helmet','chestplate','leggings','boots']));
  add('respiration', E('Respiration', 3, 2, 4, ['helmet']));
  add('depth_strider', E('Depth Strider', 3, 2, 4, ['boots'], ['frost_walker']));
  add('aqua_affinity', E('Aqua Affinity', 1, 2, 4, ['helmet']));
  add('sharpness', E('Sharpness', 5, 1, 1, ['sword','axe','spear'], ['smite','bane_of_arthropods','density','breach']));
  add('smite', E('Smite', 5, 1, 2, ['sword','axe','mace'], ['sharpness','bane_of_arthropods','density','breach']));
  add('bane_of_arthropods', E('Bane of Arthropods', 5, 1, 2, ['sword','axe','mace'], ['sharpness','smite','density','breach']));
  add('knockback', E('Knockback', 2, 1, 2, ['sword']));
  add('fire_aspect', E('Fire Aspect', 2, 2, 4, ['sword','mace','spear']));
  add('looting', E('Looting', 3, 2, 4, ['sword','spear']));
  add('sweeping_edge', E('Sweeping Edge', 3, 2, 4, ['sword']));
  add('efficiency', E('Efficiency', 5, 1, 1, ['pickaxe','axe','shovel','hoe']));
  add('silk_touch', E('Silk Touch', 1, 4, 8, ['pickaxe','axe','shovel','hoe'], ['fortune']));
  add('unbreaking', E('Unbreaking', 3, 1, 2, ['helmet','chestplate','leggings','boots','elytra','sword','axe','pickaxe','shovel','hoe','bow','crossbow','trident','mace','spear','shield']));
  add('fortune', E('Fortune', 3, 2, 4, ['pickaxe','axe','shovel','hoe'], ['silk_touch']));
  add('power', E('Power', 5, 1, 1, ['bow']));
  add('punch', E('Punch', 2, 2, 4, ['bow']));
  add('flame', E('Flame', 1, 2, 4, ['bow']));
  add('infinity', E('Infinity', 1, 4, 8, ['bow'], ['mending']));
  add('mending', E('Mending', 1, 2, 4, ['helmet','chestplate','leggings','boots','elytra','sword','axe','pickaxe','shovel','hoe','bow','crossbow','trident','mace','spear','shield'], ['infinity']));
  add('luck_of_the_sea', E('Luck of the Sea', 3, 2, 4, ['fishing_rod']));
  add('lure', E('Lure', 3, 2, 4, ['fishing_rod']));
  add('frost_walker', E('Frost Walker', 2, 2, 4, ['boots'], ['depth_strider']));
  add('soul_speed', E('Soul Speed', 3, 4, 8, ['boots']));
  add('swift_sneak', E('Swift Sneak', 3, 4, 8, ['leggings']));
  add('curse_of_binding', E('Curse of Binding', 1, 4, 8, ['helmet','chestplate','leggings','boots','elytra']));
  add('curse_of_vanishing', E('Curse of Vanishing', 1, 4, 8, ['helmet','chestplate','leggings','boots','elytra','sword','axe','pickaxe','shovel','hoe','bow','crossbow','trident','mace','spear','shield','fishing_rod']));
  add('riptide', E('Riptide', 3, 2, 4, ['trident'], ['loyalty','channeling']));
  add('loyalty', E('Loyalty', 3, 1, 1, ['trident'], ['riptide']));
  add('channeling', E('Channeling', 1, 4, 8, ['trident'], ['riptide']));
  add('multishot', E('Multishot', 1, 2, 4, ['crossbow'], ['piercing']));
  add('piercing', E('Piercing', 4, 1, 1, ['crossbow'], ['multishot']));
  add('quick_charge', E('Quick Charge', 3, 1, 2, ['crossbow']));
  add('impaling', E('Impaling', 5, 2, 4, ['trident']));
  add('wind_burst', E('Wind Burst', 3, 4, 4, ['mace']));
  add('density', E('Density', 5, 1, 2, ['mace'], ['breach','smite','bane_of_arthropods','sharpness']));
  add('breach', E('Breach', 4, 2, 4, ['mace'], ['density','smite','bane_of_arthropods','sharpness']));
  add('lunge', E('Lunge', 3, 1, 2, ['spear']));
  add('mending', ALL.mending);

  const ITEMS = [
    ['sword', 'Sword'], ['spear', 'Spear'], ['axe', 'Axe'], ['pickaxe', 'Pickaxe'], ['shovel', 'Shovel'], ['hoe', 'Hoe'],
    ['helmet', 'Helmet'], ['chestplate', 'Chestplate'], ['leggings', 'Leggings'], ['boots', 'Boots'], ['elytra', 'Elytra'],
    ['bow', 'Bow'], ['crossbow', 'Crossbow'], ['trident', 'Trident'], ['mace', 'Mace'], ['fishing_rod', 'Fishing Rod'], ['shield', 'Shield']
  ];

  window.MinecraftEnchantData = { enchantments: ALL, items: ITEMS };
})();
