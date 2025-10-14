import {
  createInlineLocalizedText,
  type InlineLocalizedText,
} from "./localizedText";

type TranslationEntry = {
  de: string;
  en?: string;
};

const TABLE_TRANSLATIONS = {
  // Common units and labels
  "tables.common.unit.carat": { de: "Karat", en: "carats" },
  "tables.common.unit.ducats": { de: "Dukaten", en: "ducats" },
  "tables.common.unit.silvertalers": {
    de: "Silbertaler",
    en: "silverthaler",
  },
  "tables.common.unit.kreuzer": { de: "Kreuzer", en: "kreutzer" },
  "tables.common.unit.heller": { de: "Heller", en: "haler" },
  "tables.common.category.jewels": { de: "Juwelen", en: "jewels" },

  // NPC Loot table
  "tables.npc.section.main.description": {
    de: "Zusammenstellung des Schatzes",
    en: "Loot composition",
  },
  "tables.npc.section.money.description": {
    de: "Geld",
    en: "Coinage",
  },
  "tables.npc.section.personal.description": {
    de: "Persönliche Gegenstände",
    en: "Personal belongings",
  },
  "tables.npc.section.special.description": {
    de: "Besondere Gegenstände",
    en: "Special items",
  },
  "tables.npc.main.result.money": {
    de: "Geld",
    en: "Coinage",
  },
  "tables.npc.main.result.personal": {
    de: "Persönlicher Gegenstand",
    en: "Personal item",
  },
  "tables.npc.main.result.special": {
    de: "Besondere Gegenstände",
    en: "Special items",
  },
  "tables.npc.main.result.moneyPersonal": {
    de: "Geld und persönlicher Gegenstand",
    en: "Coinage and personal item",
  },
  "tables.npc.main.result.moneySpecial": {
    de: "Geld und besonderer Gegenstand",
    en: "Coinage and special item",
  },
  "tables.npc.main.result.personalSpecial": {
    de: "Persönlicher und besonderer Gegenstand",
    en: "Personal and special item",
  },
  "tables.npc.main.result.moneyPersonalSpecial": {
    de: "Geld, persönlicher und besonderer Gegenstand",
    en: "Coinage, personal, and special item",
  },
  "tables.npc.personal.item.eyeglasses": {
    de: "Augengläser",
    en: "Spectacles",
  },
  "tables.npc.personal.item.luckyCharm": {
    de: "Glücksbringer",
    en: "Lucky charm",
  },
  "tables.npc.personal.item.loverAmulet": {
    de: "Amulett mit dem Portrait des Geliebten",
    en: "Amulet with the portrait of a loved one",
  },
  "tables.npc.personal.item.oldCoin": {
    de: "alte Münze",
    en: "Old coin",
  },
  "tables.npc.personal.item.loveLetter": {
    de: "Liebesbrief",
    en: "Love letter",
  },
  "tables.npc.personal.item.nordlandBankNote": {
    de: "Schuldschein der Nordlandbank",
    en: "Promissory note of the Nordlandbank",
  },
  "tables.npc.personal.item.throatLozenges": {
    de: "Pastillen gegen Halsschmerzen",
    en: "Lozenges for sore throat",
  },
  "tables.npc.personal.item.waterskin": {
    de: "Wasserschlauch",
    en: "Waterskin",
  },
  "tables.npc.personal.item.scarf": {
    de: "Halstuch",
    en: "Scarf",
  },
  "tables.npc.personal.item.cap": { de: "Mütze", en: "Cap" },
  "tables.npc.personal.item.knife": { de: "Messer", en: "Knife" },
  "tables.npc.personal.item.perfumeVial": {
    de: "Parfümfläschchen",
    en: "Perfume vial",
  },
  "tables.npc.personal.item.emptyTinderbox": {
    de: "leere Zunderdose",
    en: "Empty tinderbox",
  },
  "tables.npc.personal.item.crowbar": {
    de: "Brecheisen",
    en: "Crowbar",
  },
  "tables.npc.personal.item.gloves": { de: "Handschuhe", en: "Gloves" },
  "tables.npc.personal.item.powderCompact": {
    de: "Puderdose",
    en: "Powder compact",
  },
  "tables.npc.personal.item.earrings": {
    de: "Ohrringe",
    en: "Earrings",
  },
  "tables.npc.personal.item.oilLamp": {
    de: "Öllampe",
    en: "Oil lamp",
  },
  "tables.npc.personal.item.sisterLetter": {
    de: "Brief der Schwester",
    en: "Letter from a sister",
  },
  "tables.npc.personal.item.tobaccoTin": {
    de: "Tabakdose",
    en: "Tobacco tin",
  },
  "tables.npc.special.item.secretNote": {
    de: "Notizzettel mit Geheimnissen",
    en: "Note with secrets",
  },
  "tables.npc.special.item.lint": { de: "Fusseln", en: "Lint" },
  "tables.npc.special.item.bindingRope": {
    de: "Fesselseil",
    en: "Binding rope",
  },
  "tables.npc.special.item.wirselkraut": {
    de: "1 Anwendung Wirselkraut",
    en: "1 dose of Wirsel herb",
  },
  "tables.npc.special.item.spyglass": {
    de: "Fernrohr, einziehbar",
    en: "Collapsible spyglass",
  },
  "tables.npc.special.item.compass": { de: "Kompass", en: "Compass" },
  "tables.npc.special.item.kelmon": {
    de: "1 Portion Kelmon",
    en: "1 portion of Kelmon",
  },
  "tables.npc.special.item.bandages": {
    de: "Verbandszeug",
    en: "Bandages",
  },
  "tables.npc.special.item.magicChalk": {
    de: "Zauberkreide",
    en: "Wizard's chalk",
  },
  "tables.npc.special.item.borbaradMosquitos": {
    de: "Kästchen mit {count} Borbarad-Moskitos",
    en: "Small box with {count} Borbarad mosquitoes",
  },
  "tables.npc.special.item.ilmenLeaf": {
    de: "1 Portion Ilmenblatt",
    en: "1 portion of Ilmen leaf",
  },
  "tables.npc.special.item.breviary": {
    de: "Brevier der zwölfgöttlichen Unterweisung",
    en: "Breviary of the Twelvegods' teachings",
  },
  "tables.npc.special.item.blessedWater": {
    de: "Flasche mit efferdgeweihtem Wasser",
    en: "Flask of Efferd-blessed water",
  },
  "tables.npc.special.item.shortMageStaff": {
    de: "kurzer Magierstab",
    en: "Short mage staff",
  },
  "tables.npc.special.item.healingPotionQS4": {
    de: "Heiltrank (QS 4)",
    en: "Healing potion (QS 4)",
  },
  "tables.npc.special.item.donf": {
    de: "1 Anwendung Donf",
    en: "1 dose of Donf",
  },
  "tables.npc.special.item.magicPotionQS4": {
    de: "Zaubertrank (QS 4)",
    en: "Magic potion (QS 4)",
  },
  "tables.npc.special.item.magicArtifact": {
    de: "magisches Artefakt",
    en: "Magical artifact",
  },
  "tables.npc.special.item.namelessArtifact": {
    de: "Namenloses oder dämonisches Artefakt",
    en: "Nameless or demonic artifact",
  },

  // Tavern table
  "tables.tavern.description": {
    de: "Gaststube/Taverne",
    en: "Taproom/Tavern",
  },
  "tables.tavern.name.label": { de: "Name", en: "Name" },
  "tables.tavern.namePrefix.gold": {
    de: "Zum/ Zur goldenen",
    en: "The Golden",
  },
  "tables.tavern.namePrefix.almadine": {
    de: "Zum/ Zur almadinenen",
    en: "The Almadine",
  },
  "tables.tavern.namePrefix.dancing": {
    de: "Zum/ Zur tanzenden",
    en: "The Dancing",
  },
  "tables.tavern.namePrefix.laughing": {
    de: "Zum/ Zur lachenden",
    en: "The Laughing",
  },
  "tables.tavern.namePrefix.drunken": {
    de: "Zum/ Zur betrunkenen",
    en: "The Drunken",
  },
  "tables.tavern.namePrefix.merry": {
    de: "Zum/ Zur fröhlichen",
    en: "The Merry",
  },
  "tables.tavern.namePrefix.lucky": {
    de: "Zum/ Zur glücklichen",
    en: "The Lucky",
  },
  "tables.tavern.namePrefix.leaping": {
    de: "Zum/ Zur springenden",
    en: "The Leaping",
  },
  "tables.tavern.namePrefix.black": {
    de: "Zum/ Zur schwarzen",
    en: "The Black",
  },
  "tables.tavern.namePrefix.white": {
    de: "Zum/ Zur weißen",
    en: "The White",
  },
  "tables.tavern.namePrefix.prancing": {
    de: "Zum/ Zur tänzelnden",
    en: "The Prancing",
  },
  "tables.tavern.namePrefix.lonely": {
    de: "Zum/ Zur einsamen",
    en: "The Lonely",
  },
  "tables.tavern.namePrefix.emperors": {
    de: "Des Kaisers",
    en: "Of the Emperor",
  },
  "tables.tavern.namePrefix.two": {
    de: "Die zwei",
    en: "The Two",
  },
  "tables.tavern.namePrefix.three": {
    de: "Die drei",
    en: "The Three",
  },
  "tables.tavern.namePrefix.four": {
    de: "Die vier",
    en: "The Four",
  },
  "tables.tavern.nameSpecial.homesteadMountain": {
    de: "Berghof",
    en: "Mountain Manor",
  },
  "tables.tavern.nameSpecial.homesteadForest": {
    de: "Waldhof",
    en: "Forest Manor",
  },
  "tables.tavern.nameSpecial.homesteadLinden": {
    de: "Lindenhof",
    en: "Linden Manor",
  },
  "tables.tavern.nameSpecial.homesteadOak": {
    de: "Eichenhof",
    en: "Oak Manor",
  },
  "tables.tavern.nameSpecial.homesteadImperial": {
    de: "Kaiserhof",
    en: "Imperial Court",
  },
  "tables.tavern.nameSpecial.homesteadRealm": {
    de: "Reichshof",
    en: "Realm Court",
  },
  "tables.tavern.nameSpecial.valpostube": {
    de: "Valpostube",
    en: "Valpostube",
  },
  "tables.tavern.nameSpecial.beiAlrik": {
    de: "Bei Alrik",
    en: "Bei Alrik",
  },
  "tables.tavern.nameSpecial.aroundCorner": {
    de: "Ums Eck",
    en: "Around the Corner",
  },
  "tables.tavern.nameSpecial.beerHall": {
    de: "Bierschwemme",
    en: "Beer Hall",
  },
  "tables.tavern.nameSpecial.traviaRest": {
    de: "Travias Einkehr",
    en: "Travia's Rest",
  },
  "tables.tavern.nameSpecial.anchor": {
    de: "Zum Anker",
    en: "At the Anchor",
  },
  // Tavern proper names singular
  "tables.tavern.proper.unicorn": { de: "Einhorn", en: "Unicorn" },
  "tables.tavern.proper.bull": { de: "Stier", en: "Bull" },
  "tables.tavern.proper.stag": { de: "Hirsch", en: "Stag" },
  "tables.tavern.proper.king": { de: "König", en: "King" },
  "tables.tavern.proper.princess": { de: "Prinzessin", en: "Princess" },
  "tables.tavern.proper.boar": { de: "Keiler", en: "Boar" },
  "tables.tavern.proper.eagle": { de: "Adler", en: "Eagle" },
  "tables.tavern.proper.crown": { de: "Krone", en: "Crown" },
  "tables.tavern.proper.executioner": {
    de: "Henker",
    en: "Executioner",
  },
  "tables.tavern.proper.traveler": { de: "Reisenden", en: "Traveler" },
  "tables.tavern.proper.jellyfish": { de: "Qualle", en: "Jellyfish" },
  "tables.tavern.proper.dolphin": { de: "Delphin", en: "Dolphin" },
  "tables.tavern.proper.carp": { de: "Karpfen", en: "Carp" },
  "tables.tavern.proper.pony": { de: "Pony", en: "Pony" },
  "tables.tavern.proper.boot": { de: "Stiefel", en: "Boot" },
  "tables.tavern.proper.vagabond": { de: "Vagabund", en: "Vagabond" },
  "tables.tavern.proper.mare": { de: "Stute", en: "Mare" },
  "tables.tavern.proper.bucket": { de: "Eimer", en: "Bucket" },
  "tables.tavern.proper.pilgrim": { de: "Pilger", en: "Pilgrim" },
  "tables.tavern.proper.drum": { de: "Trommel", en: "Drum" },
  // Tavern proper names plural
  "tables.tavern.properPlural.unicorns": {
    de: "Einhörner",
    en: "Unicorns",
  },
  "tables.tavern.properPlural.bulls": { de: "Stiere", en: "Bulls" },
  "tables.tavern.properPlural.stags": { de: "Hirsche", en: "Stags" },
  "tables.tavern.properPlural.kings": { de: "Könige", en: "Kings" },
  "tables.tavern.properPlural.princesses": {
    de: "Prinzessinnen",
    en: "Princesses",
  },
  "tables.tavern.properPlural.boars": { de: "Keiler", en: "Boars" },
  "tables.tavern.properPlural.eagles": { de: "Adler", en: "Eagles" },
  "tables.tavern.properPlural.crowns": { de: "Kronen", en: "Crowns" },
  "tables.tavern.properPlural.executioners": {
    de: "Henker",
    en: "Executioners",
  },
  "tables.tavern.properPlural.travelers": {
    de: "Reisenden",
    en: "Travelers",
  },
  "tables.tavern.properPlural.jellyfish": {
    de: "Quallen",
    en: "Jellyfish",
  },
  "tables.tavern.properPlural.dolphins": {
    de: "Delphine",
    en: "Dolphins",
  },
  "tables.tavern.properPlural.carp": { de: "Karpfen", en: "Carp" },
  "tables.tavern.properPlural.ponies": { de: "Ponys", en: "Ponies" },
  "tables.tavern.properPlural.boots": { de: "Stiefel", en: "Boots" },
  "tables.tavern.properPlural.vagabonds": {
    de: "Vagabunden",
    en: "Vagabonds",
  },
  "tables.tavern.properPlural.mares": { de: "Stuten", en: "Mares" },
  "tables.tavern.properPlural.buckets": { de: "Eimer", en: "Buckets" },
  "tables.tavern.properPlural.pilgrims": {
    de: "Pilger",
    en: "Pilgrims",
  },
  "tables.tavern.properPlural.drums": { de: "Trommeln", en: "Drums" },

  // Treasure loot table
  "tables.treasure.section.main.description": {
    de: "Zusammenstellung des Schatzes",
    en: "Treasure composition",
  },
  "tables.treasure.section.coins.description": {
    de: "Münzen",
    en: "Coins",
  },
  "tables.treasure.section.jewellery.description": {
    de: "Schmuck",
    en: "Jewellery",
  },
  "tables.treasure.section.gems.description": {
    de: "Edelsteine",
    en: "Gemstones",
  },
  "tables.treasure.section.artefacts.description": {
    de: "Artefakte",
    en: "Artifacts",
  },
  "tables.treasure.main.result.coins": {
    de: "Münzen",
    en: "Coins",
  },
  "tables.treasure.main.result.jewellery": {
    de: "Schmuck",
    en: "Jewellery",
  },
  "tables.treasure.main.result.gems": {
    de: "Edelsteine",
    en: "Gemstones",
  },
  "tables.treasure.main.result.coinsJewellery": {
    de: "Münzen und Schmuck",
    en: "Coins and jewellery",
  },
  "tables.treasure.main.result.coinsGems": {
    de: "Münzen und Edelsteine",
    en: "Coins and gemstones",
  },
  "tables.treasure.main.result.jewelleryGems": {
    de: "Schmuck und Edelsteine",
    en: "Jewellery and gemstones",
  },
  "tables.treasure.main.result.coinsJewelleryGems": {
    de: "Münzen, Schmuck und Edelsteine",
    en: "Coins, jewellery, and gemstones",
  },
  "tables.treasure.main.result.artefacts": {
    de: "Artefakte",
    en: "Artifacts",
  },
  "tables.treasure.jewellery.item.amulet": {
    de: "Amulett",
    en: "Amulet",
  },
  "tables.treasure.jewellery.item.bracelet": {
    de: "Armreif",
    en: "Bracelet",
  },
  "tables.treasure.jewellery.item.brooch": {
    de: "Brosche",
    en: "Brooch",
  },
  "tables.treasure.jewellery.item.diadem": {
    de: "Diadem",
    en: "Diadem",
  },
  "tables.treasure.jewellery.item.necklace": {
    de: "Kette",
    en: "Necklace",
  },
  "tables.treasure.jewellery.item.earring": {
    de: "Ohrring",
    en: "Earring",
  },
  "tables.treasure.jewellery.item.ring": {
    de: "Ring",
    en: "Ring",
  },
  "tables.treasure.material.iron": { de: "Eisen", en: "Iron" },
  "tables.treasure.material.tin": { de: "Zinn", en: "Tin" },
  "tables.treasure.material.brass": { de: "Messing", en: "Brass" },
  "tables.treasure.material.bronze": { de: "Bronze", en: "Bronze" },
  "tables.treasure.material.copper": { de: "Kupfer", en: "Copper" },
  "tables.treasure.material.silver": { de: "Silber", en: "Silver" },
  "tables.treasure.material.gold": { de: "Gold", en: "Gold" },
  "tables.treasure.material.electrum": {
    de: "Elektrum",
    en: "Electrum",
  },
  "tables.treasure.material.moonsilver": {
    de: "Mondsilber",
    en: "Moon-silver",
  },
  "tables.treasure.material.special": {
    de: "besonderes Metall",
    en: "Rare metal",
  },
  "tables.treasure.material.illuminium": {
    de: "Illuminium",
    en: "Illuminium",
  },
  "tables.treasure.material.cupritan": {
    de: "Cupritan",
    en: "Cupritan",
  },
  "tables.treasure.material.meteoricIron": {
    de: "Meteoreisen",
    en: "Meteoric iron",
  },
  "tables.treasure.material.mindorium": {
    de: "Mindorium",
    en: "Mindorium",
  },
  "tables.treasure.material.arcanium": {
    de: "Arkanium",
    en: "Arcanium",
  },
  "tables.treasure.gem.soapstone": {
    de: "Speckstein",
    en: "Soapstone",
  },
  "tables.treasure.gem.obsidian": { de: "Obsidian", en: "Obsidian" },
  "tables.treasure.gem.pearl": { de: "Perle", en: "Pearl" },
  "tables.treasure.gem.agate": { de: "Achat", en: "Agate" },
  "tables.treasure.gem.turquoise": {
    de: "Türkis",
    en: "Turquoise",
  },
  "tables.treasure.gem.aventurine": {
    de: "Aventurin",
    en: "Aventurine",
  },
  "tables.treasure.gem.tourmaline": {
    de: "Turmalin",
    en: "Tourmaline",
  },
  "tables.treasure.gem.rockCrystal": {
    de: "Bergkristall",
    en: "Rock crystal",
  },
  "tables.treasure.gem.jade": { de: "Jade", en: "Jade" },
  "tables.treasure.gem.topaz": { de: "Topas", en: "Topaz" },
  "tables.treasure.gem.opal": { de: "Opal", en: "Opal" },
  "tables.treasure.gem.amber": { de: "Bernstein", en: "Amber" },
  "tables.treasure.gem.emerald": {
    de: "Smaragd",
    en: "Emerald",
  },
  "tables.treasure.gem.sapphire": {
    de: "Saphir",
    en: "Sapphire",
  },
  "tables.treasure.gem.ruby": { de: "Rubin", en: "Ruby" },
  "tables.treasure.gem.diamond": {
    de: "Diamant",
    en: "Diamond",
  },
  "tables.treasure.artefact.spellPotion": {
    de: "Zaubertrank (QS {quality})",
    en: "Spell potion (QS {quality})",
  },
  "tables.treasure.artefact.healingPotion": {
    de: "Heiltrank (QS {quality})",
    en: "Healing potion (QS {quality})",
  },
  "tables.treasure.artefact.weaponBalm": {
    de: "Waffenbalsam (QS {quality})",
    en: "Weapon balm (QS {quality})",
  },
  "tables.treasure.artefact.invisibilityElixir": {
    de: "Unsichtbarkeitselixier",
    en: "Elixir of invisibility",
  },
  "tables.treasure.artefact.transformationPotion": {
    de: "Verwandlungstrank",
    en: "Transformation potion",
  },
  "tables.treasure.artefact.antidote": {
    de: "Antidot",
    en: "Antidote",
  },
  "tables.treasure.artefact.statuette": {
    de: "Statuette",
    en: "Statuette",
  },
  "tables.treasure.artefact.goblet": { de: "Pokal", en: "Goblet" },
  "tables.treasure.artefact.weapon": { de: "Waffe", en: "Weapon" },
  "tables.treasure.artefact.armor": { de: "Rüstung", en: "Armor" },
  "tables.treasure.artefact.magicArtifact": {
    de: "magisches Artefakt",
    en: "Magical artifact",
  },
} as const satisfies Record<string, TranslationEntry>;

export type TableTranslationKey = keyof typeof TABLE_TRANSLATIONS;

export function tableText(key: TableTranslationKey): InlineLocalizedText {
  const entry = TABLE_TRANSLATIONS[key];
  if (!entry) {
    throw new Error(`Unknown table translation key "${key}"`);
  }
  return createInlineLocalizedText(entry.de, entry.en);
}

export function tableTextWithParams(
  key: TableTranslationKey,
  params: Record<string, string | number>,
): InlineLocalizedText {
  const entry = TABLE_TRANSLATIONS[key];
  if (!entry) {
    throw new Error(`Unknown table translation key "${key}"`);
  }

  const interpolate = (input: string | undefined) => {
    if (input === undefined) {
      return undefined;
    }
    return Object.entries(params).reduce((acc, [paramKey, value]) => {
      return acc.replaceAll(`{${paramKey}}`, String(value));
    }, input);
  };

  return createInlineLocalizedText(
    interpolate(entry.de) ?? "",
    interpolate(entry.en),
  );
}
