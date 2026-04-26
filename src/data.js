// Static catalog of items + seed bundles. User data is layered on top in app.js.
// Each item has: id, name, image (path or null), category.
// Categories: currency, resource, ore, magic-item

const ITEMS = [
  // Currency
  { id: 'gem',                   name: 'Gem',                   image: 'images/Icon_HV_Resource_Gem.png',                category: 'currency' },

  // Raw resources
  { id: 'gold',                  name: 'Gold',                  image: 'images/Icon_HV_Resource_Gold_1.png',             category: 'resource' },
  { id: 'elixir',                name: 'Elixir',                image: 'images/Icon_HV_Resource_Elixir_1.png',           category: 'resource' },
  { id: 'dark_elixir',           name: 'Dark Elixir',           image: 'images/Icon_HV_Resource_Dark_Elixir_1.png',      category: 'resource' },
  { id: 'builder_gold',          name: 'Builder Gold',          image: 'images/Icon_BB_Resource_Builder_Gold.png',       category: 'resource' },
  { id: 'builder_elixir',        name: 'Builder Elixir',        image: 'images/Icon_BB_Resource_Builder_Elixir.png',     category: 'resource' },

  // Ores (no images yet)
  { id: 'starry_ore',            name: 'Starry Ore',            image: 'images/Icon_HV_Resource_Starry_Ore.png',         category: 'ore' },
  { id: 'glowy_ore',             name: 'Glowy Ore',             image: 'images/Icon_HV_Resource_Glowy_Ore.png',          category: 'ore' },
  { id: 'shiny_ore',             name: 'Shiny Ore',             image: 'images/Icon_HV_Resource_Shiny_Ore.png',          category: 'ore' },

  // Magic items - books
  { id: 'book_of_fighting',      name: 'Book of Fighting',      image: 'images/Magic_Item_Book_of_Troops.png',           category: 'magic-item' },
  { id: 'book_of_heroes',        name: 'Book of Heroes',        image: 'images/Magic_Item_Book_of_Heroes.png',           category: 'magic-item' },
  { id: 'book_of_spells',        name: 'Book of Spells',        image: 'images/Magic_Item_Book_of_Spells.png',           category: 'magic-item' },
  { id: 'book_of_building',      name: 'Book of Building',      image: 'images/Magic_Item_Book_of_Buildings.png',        category: 'magic-item' },
  { id: 'book_of_everything',    name: 'Book of Everything',    image: 'images/Magic_Item_Book_of_Everything.png',       category: 'magic-item' },

  // Magic items - runes
  { id: 'rune_of_gold',          name: 'Rune of Gold',          image: 'images/Magic_Item_Rune_of_Gold.png',             category: 'magic-item' },
  { id: 'rune_of_elixir',        name: 'Rune of Elixir',        image: 'images/Magic_Item_Rune_of_Elixir.png',           category: 'magic-item' },
  { id: 'rune_of_dark_elixir',   name: 'Rune of Dark Elixir',   image: 'images/Magic_Item_Rune_of_Dark_Elixir.png',      category: 'magic-item' },
  { id: 'rune_of_builder_gold',  name: 'Rune of Builder Gold',  image: 'images/Magic_Item_Rune_of_Builder_Gold.png',     category: 'magic-item' },
  { id: 'rune_of_builder_elixir',name: 'Rune of Builder Elixir',image: 'images/Magic_Item_Rune_of_Builder_Elixir.png',   category: 'magic-item' },

  // Magic items - potions and other
  { id: 'shovel',                name: 'Shovel of Obstacles',   image: 'images/Magic_Item_Shovel_of_Obstacles.png',      category: 'magic-item' },
  { id: 'builder_potion',        name: 'Builder Potion',        image: 'images/Magic_Item_Builder_Potion.png',           category: 'magic-item' },
  { id: 'hero_potion',           name: 'Hero Potion',           image: null,                                             category: 'magic-item' },
  { id: 'power_potion',          name: 'Power Potion',          image: 'images/Magic_Item_Power_potion.png',             category: 'magic-item' },
  { id: 'resource_potion',       name: 'Resource Potion',       image: 'images/Magic_Item_Resource_Potion.png',          category: 'magic-item' },
  { id: 'research_potion',       name: 'Research Potion',       image: null,                                             category: 'magic-item' },
  { id: 'super_potion',          name: 'Super Potion',          image: 'images/Magic_Item_Super_Troop_Potion.png',       category: 'magic-item' },
  { id: 'builder_star_jar',      name: 'Builder Star Jar',      image: 'images/Magic_Item_Builder_Star_Jar.png',         category: 'magic-item' },
  { id: 'wall_ring',             name: 'Wall Ring',             image: 'images/Magic_Item_Wall_Ring.png',                category: 'magic-item' },
  { id: 'clock_tower_potion',    name: 'Clock Tower Potion',    image: null,                                             category: 'magic-item' },
  { id: 'pet_potion',            name: 'Pet Potion',            image: 'images/Magic_Item_Pet_Potion.png',               category: 'magic-item' },
];

// Bundle types:
//   'shop'     - bought with SEK; contents = items you receive
//   'gem-pack' - bought with SEK; contents = gems only
//   'trader'   - bought with gems; contents include negative gem qty as the "cost"
const SEED_BUNDLES = [
  // ----- Active SEK shop bundles -----
  {
    id: 'b_build_me_up',
    name: 'Build me up',
    type: 'shop',
    priceSEK: 65,
    contents: [
      { itemId: 'builder_potion', qty: 3 },
      { itemId: 'wall_ring',      qty: 20 },
    ],
    active: true, purchased: false, dateAdded: '2026-04-26', notes: '',
  },
  {
    id: 'b_pet_plus',
    name: 'Pet plus',
    type: 'shop',
    priceSEK: 27,
    contents: [
      { itemId: 'pet_potion',  qty: 2 },
      { itemId: 'dark_elixir', qty: 20000 },
    ],
    active: true, purchased: false, dateAdded: '2026-04-26', notes: '',
  },
  {
    id: 'b_battle_boost',
    name: 'Battle boost',
    type: 'shop',
    priceSEK: 13,
    contents: [
      { itemId: 'power_potion',    qty: 2 },
      { itemId: 'research_potion', qty: 2 },
      { itemId: 'resource_potion', qty: 1 },
    ],
    active: true, purchased: false, dateAdded: '2026-04-26', notes: '',
  },

  // ----- Ore bundles -----
  {
    id: 'b_starry_75',
    name: '75 Starry Ore',
    type: 'shop',
    priceSEK: 89,
    contents: [{ itemId: 'starry_ore', qty: 75 }],
    active: true, purchased: false, dateAdded: '2026-04-26', notes: '',
  },
  {
    id: 'b_shiny_12000',
    name: '12000 Shiny Ore',
    type: 'shop',
    priceSEK: 129,
    contents: [{ itemId: 'shiny_ore', qty: 12000 }],
    active: true, purchased: false, dateAdded: '2026-04-26', notes: '',
  },
  {
    id: 'b_shiny_6000',
    name: '6000 Shiny Ore',
    type: 'shop',
    priceSEK: 89,
    contents: [{ itemId: 'shiny_ore', qty: 6000 }],
    active: true, purchased: false, dateAdded: '2026-04-26', notes: '',
  },
  {
    id: 'b_glowy_750',
    name: '750 Glowy Ore',
    type: 'shop',
    priceSEK: 89,
    contents: [{ itemId: 'glowy_ore', qty: 750 }],
    active: true, purchased: false, dateAdded: '2026-04-26', notes: '',
  },

  // ----- Gem packs -----
  { id: 'gp_pocketful', name: 'Pocketful of Gems', type: 'gem-pack', priceSEK: 13,   contents: [{ itemId: 'gem', qty: 80 }],    active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 'gp_pile',      name: 'Pile of Gems',      type: 'gem-pack', priceSEK: 65,   contents: [{ itemId: 'gem', qty: 500 }],   active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 'gp_bag',       name: 'Bag of Gems',       type: 'gem-pack', priceSEK: 129,  contents: [{ itemId: 'gem', qty: 1200 }],  active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 'gp_helm',      name: 'Helm of Gems',      type: 'gem-pack', priceSEK: 199,  contents: [{ itemId: 'gem', qty: 1850 }],  active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 'gp_sack',      name: 'Sack of Gems',      type: 'gem-pack', priceSEK: 269,  contents: [{ itemId: 'gem', qty: 2500 }],  active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 'gp_box',       name: 'Box of Gems',       type: 'gem-pack', priceSEK: 695,  contents: [{ itemId: 'gem', qty: 6500 }],  active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 'gp_chest',     name: 'Chest of Gems',     type: 'gem-pack', priceSEK: 1395, contents: [{ itemId: 'gem', qty: 14000 }], active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 'gp_storage',   name: 'Storage of Gems',   type: 'gem-pack', priceSEK: 2795, contents: [{ itemId: 'gem', qty: 30000 }], active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },

  // ----- In-game trader (gems -> items). priceSEK=null; gem qty is negative (cost). -----
  { id: 't_starry',          name: 'Trader: 15 Starry Ore',         type: 'trader', priceSEK: null, contents: [{ itemId: 'starry_ore', qty: 15 },  { itemId: 'gem', qty: -275 }],  active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_glowy',           name: 'Trader: 60 Glowy Ore',          type: 'trader', priceSEK: null, contents: [{ itemId: 'glowy_ore',  qty: 60 },  { itemId: 'gem', qty: -150 }],  active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_shiny',           name: 'Trader: 300 Shiny Ore',         type: 'trader', priceSEK: null, contents: [{ itemId: 'shiny_ore',  qty: 300 }, { itemId: 'gem', qty: -150 }],  active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_star_jar',        name: 'Trader: Builder Star Jar',      type: 'trader', priceSEK: null, contents: [{ itemId: 'builder_star_jar', qty: 1 }, { itemId: 'gem', qty: -100 }], active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_resource_potion', name: 'Trader: Resource Potion',       type: 'trader', priceSEK: null, contents: [{ itemId: 'resource_potion', qty: 1 },  { itemId: 'gem', qty: -60 }],  active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_research_potion', name: 'Trader: Research Potion',       type: 'trader', priceSEK: null, contents: [{ itemId: 'research_potion', qty: 1 },  { itemId: 'gem', qty: -120 }], active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_pet_potion',      name: 'Trader: Pet Potion',            type: 'trader', priceSEK: null, contents: [{ itemId: 'pet_potion', qty: 1 },       { itemId: 'gem', qty: -120 }], active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_power_potion',    name: 'Trader: Power Potion',          type: 'trader', priceSEK: null, contents: [{ itemId: 'power_potion', qty: 1 },     { itemId: 'gem', qty: -150 }], active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_builder_potion',  name: 'Trader: Builder Potion',        type: 'trader', priceSEK: null, contents: [{ itemId: 'builder_potion', qty: 1 },   { itemId: 'gem', qty: -285 }], active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_rune_be',         name: 'Trader: Rune of Builder Elixir',type: 'trader', priceSEK: null, contents: [{ itemId: 'rune_of_builder_elixir', qty: 1 }, { itemId: 'gem', qty: -1000 }], active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_rune_e',          name: 'Trader: Rune of Elixir',        type: 'trader', priceSEK: null, contents: [{ itemId: 'rune_of_elixir', qty: 1 },        { itemId: 'gem', qty: -1000 }], active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_rune_g',          name: 'Trader: Rune of Gold',          type: 'trader', priceSEK: null, contents: [{ itemId: 'rune_of_gold', qty: 1 },          { itemId: 'gem', qty: -1000 }], active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_book_heroes',     name: 'Trader: Book of Heroes',        type: 'trader', priceSEK: null, contents: [{ itemId: 'book_of_heroes', qty: 1 },        { itemId: 'gem', qty: -500 }],  active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_book_fight',      name: 'Trader: Book of Fighting',      type: 'trader', priceSEK: null, contents: [{ itemId: 'book_of_fighting', qty: 1 },      { itemId: 'gem', qty: -925 }],  active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_shovel',          name: 'Trader: Shovel of Obstacles',   type: 'trader', priceSEK: null, contents: [{ itemId: 'shovel', qty: 1 },                { itemId: 'gem', qty: -500 }],  active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
  { id: 't_wall_rings',      name: 'Trader: 5 Wall Rings',          type: 'trader', priceSEK: null, contents: [{ itemId: 'wall_ring', qty: 5 },             { itemId: 'gem', qty: -175 }],  active: true, purchased: false, dateAdded: '2026-04-26', notes: '' },
];

const ITEM_BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));
