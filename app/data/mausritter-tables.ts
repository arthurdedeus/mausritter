export interface Birthsign {
  sign: string;
  dispositionPositive: string;
  dispositionNegative: string;
}

export interface BackgroundEntry {
  name: string;
  itemA: string;
  itemB: string;
}

export interface Weapon {
  name: string;
  damage: string;
  slots: ("mainPaw" | "offPaw" | "body")[];
}

export const BIRTHSIGNS: Birthsign[] = [
  { sign: "Star", dispositionPositive: "Brave", dispositionNegative: "Reckless" },
  { sign: "Wheel", dispositionPositive: "Industrious", dispositionNegative: "Stubborn" },
  { sign: "Acorn", dispositionPositive: "Inquisitive", dispositionNegative: "Meddlesome" },
  { sign: "Storm", dispositionPositive: "Generous", dispositionNegative: "Wasteful" },
  { sign: "Moon", dispositionPositive: "Calm", dispositionNegative: "Detached" },
  { sign: "Mother", dispositionPositive: "Nurturing", dispositionNegative: "Worrying" },
];

export const COAT_COLORS = ["Chocolate", "Black", "White", "Tan", "Grey", "Blue"] as const;
export const COAT_PATTERNS = ["Solid", "Brindle", "Patchy", "Banded", "Marbled", "Flecked"] as const;

export const PHYSICAL_DETAILS: Record<string, string> = {
  "11": "Scarred body",
  "12": "Groomed fur",
  "13": "Tattered ears",
  "14": "Bright eyes",
  "15": "Crooked tail",
  "16": "Plump",
  "21": "Tiny",
  "22": "Huge",
  "23": "Lean",
  "24": "Grizzled",
  "25": "Muscular",
  "26": "Wiry",
  "31": "Scruffy",
  "32": "Elegant",
  "33": "Missing ear",
  "34": "Nimble",
  "35": "Wild-eyed",
  "36": "Stooped",
  "41": "One-eyed",
  "42": "Long-snouted",
  "43": "Rotund",
  "44": "Patchy fur",
  "45": "Broken teeth",
  "46": "Silky fur",
  "51": "Twitchy",
  "52": "Sleek",
  "53": "Hulking",
  "54": "Short-snouted",
  "55": "Scarred face",
  "56": "Lithe",
  "61": "Lanky",
  "62": "Stout",
  "63": "Dainty",
  "64": "Rough fur",
  "65": "Delicate",
  "66": "Bristly whiskers",
};

export const BACKGROUNDS: BackgroundEntry[][] = [
  [
    { name: "Test subject", itemA: "Bottle of serum", itemB: "Syringe" },
    { name: "Kitchen forager", itemA: "Cookpots", itemB: "Herbs" },
    { name: "Cage dweller", itemA: "Lock picks", itemB: "Bent spoon" },
    { name: "Hedge witch", itemA: "Spell components", itemB: "Healing poultice" },
    { name: "Tinker", itemA: "Tinker's tools", itemB: "Metal scraps" },
    { name: "Grain farmer", itemA: "Sickle", itemB: "Bag of grain" },
  ],
  [
    { name: "Beekeeper", itemA: "Jar of honey", itemB: "Smoker" },
    { name: "Ale brewer", itemA: "Small barrel", itemB: "Yeast cakes" },
    { name: "Grave digger", itemA: "Shovel", itemB: "Lantern" },
    { name: "Ghost hunter", itemA: "Incense", itemB: "Spirit trap" },
    { name: "Herbalist", itemA: "Healing herbs", itemB: "Mortar & pestle" },
    { name: "Librarian", itemA: "Quill & ink", itemB: "Old scroll" },
  ],
  [
    { name: "Cat burglar", itemA: "Rope & grapple", itemB: "Mask" },
    { name: "Clockmaker", itemA: "Tiny gears", itemB: "Magnifying lens" },
    { name: "Cobbler", itemA: "Awl", itemB: "Leather scraps" },
    { name: "Fortune teller", itemA: "Tarot deck", itemB: "Crystal ball" },
    { name: "Gambler", itemA: "Loaded dice", itemB: "Card set" },
    { name: "Leatherworker", itemA: "Leather scraps", itemB: "Tanning oil" },
  ],
  [
    { name: "Mason", itemA: "Chisel", itemB: "Stone blocks" },
    { name: "Miller", itemA: "Bag of flour", itemB: "Millstone piece" },
    { name: "Minstrel", itemA: "Fiddle", itemB: "Songbook" },
    { name: "Moss tender", itemA: "Shears", itemB: "Moss sample" },
    { name: "Outlaw", itemA: "Disguise kit", itemB: "Treasure map" },
    { name: "Peddler", itemA: "Cart", itemB: "Assorted wares" },
  ],
  [
    { name: "Pilgrim", itemA: "Walking staff", itemB: "Holy symbol" },
    { name: "Playwright", itemA: "Quill & ink", itemB: "Manuscript" },
    { name: "Ratcatcher", itemA: "Trap", itemB: "Net" },
    { name: "Scout", itemA: "Spyglass", itemB: "Map" },
    { name: "Sewer guide", itemA: "Lantern", itemB: "Waterproof boots" },
    { name: "Ship mouse", itemA: "Compass", itemB: "Rope" },
  ],
  [
    { name: "Smuggler", itemA: "Secret pocket cloak", itemB: "Forged papers" },
    { name: "Soldier", itemA: "Shield", itemB: "Helmet" },
    { name: "Tax collector", itemA: "Ledger", itemB: "Strongbox" },
    { name: "Thief catcher", itemA: "Manacles", itemB: "Whistle" },
    { name: "Tunneler", itemA: "Pickaxe", itemB: "Lantern" },
    { name: "Woodcutter", itemA: "Hatchet", itemB: "Bundle of twigs" },
  ],
];

export const WEAPONS: Weapon[] = [
  { name: "Improvised", damage: "d6", slots: ["mainPaw"] },
  { name: "Light", damage: "d6", slots: ["mainPaw"] },
  { name: "Medium", damage: "d6/d8", slots: ["mainPaw"] },
  { name: "Heavy", damage: "d10", slots: ["mainPaw", "offPaw"] },
  { name: "Light ranged", damage: "d6", slots: ["mainPaw"] },
  { name: "Heavy ranged", damage: "d8", slots: ["mainPaw"] },
];
