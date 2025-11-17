import type {
  AttributeKey,
  AttributeSet,
  ParseResult,
  ParsedStatBlock,
  ParserWarning,
  ResourcePools,
  TalentRating,
  RatedEntry,
  WeaponStats,
  ArmorStats,
} from "../../types/optolith/stat-block";

type SectionKey =
  | "advantages"
  | "disadvantages"
  | "specialAbilities"
  | "combatSpecialAbilities"
  | "combatTechniques"
  | "scripts"
  | "languages"
  | "talents"
  | "armor"
  | "actions"
  | "spells"
  | "cantrips"
  | "liturgies"
  | "rituals"
  | "blessings"
  | "equipment"
  | "notes";

interface RawSection {
  heading: string;
  content: string;
}

const ATTRIBUTE_LINE_PATTERN =
  /^(MU|KL|IN|CH|FF|GE|KO|KK)(\s+\d{1,2})\s+(MU|KL|IN|CH|FF|GE|KO|KK)/;
const KEY_VALUE_PATTERN = /([A-Za-zÄÖÜäöüß/+\-]+)\s+([^\s]+)/g;
const HEADING_PATTERN = /^([A-Za-zÄÖÜäöüß0-9\s/+\-&]+):\s*(.*)$/;
const ATTRIBUTE_KEYS: AttributeKey[] = [
  "MU",
  "KL",
  "IN",
  "CH",
  "FF",
  "GE",
  "KO",
  "KK",
];

const SECTION_NORMALIZATION_MAP: Record<
  string,
  SectionKey | "advantages-disadvantages" | "notes"
> = {
  vorteile: "advantages",
  nachteile: "disadvantages",
  sonderfertigkeiten: "specialAbilities",
  kampfsonderfertigkeiten: "combatSpecialAbilities",
  kampfsonderfertigkeit: "combatSpecialAbilities",
  sprachen: "languages",
  schriften: "scripts",
  talente: "talents",
  rsbe: "armor",
  aktionen: "actions",
  liturgien: "liturgies",
  liturgie: "liturgies",
  zauber: "spells",
  zaubersprüche: "spells",
  zaubertricks: "cantrips",
  rituale: "rituals",
  rituellezauber: "rituals",
  ausrüstung: "equipment",
  gegenstände: "equipment",
  inventar: "equipment",
  segnungen: "blessings",
  kampftechniken: "combatTechniques",
  kampfverhalten: "notes",
  kampfverhaltenundflucht: "notes",
  flucht: "notes",
  schmerz: "notes",
  "vorteile/nachteile": "advantages-disadvantages",
  vorteilenachteile: "advantages-disadvantages",
};

const TYPO_CORRECTIONS: Record<string, string> = {
  sinesschärfe: "Sinnesschärfe",
  "angriff verbessern": "Attacke verbessern",
  schnelladen: "Schnellladen",
  eigne: "Eigene",
  "schlechte eigenschaften": "Schlechte Eigenschaft",
};

const ATTRIBUTE_ABBREVIATIONS: Record<string, string> = {
  MU: "Mut",
  KL: "Klugheit",
  IN: "Intuition",
  CH: "Charisma",
  FF: "Fingerfertigkeit",
  GE: "Gewandheit",
  KO: "Konstitution",
  KK: "Körperkraft",
};

const NUMBER_WORDS = new Set(
  [
    "ein",
    "eine",
    "einen",
    "einem",
    "einer",
    "eins",
    "zwei",
    "drei",
    "vier",
    "fünf",
    "sechs",
    "sieben",
    "acht",
    "neun",
    "zehn",
    "elf",
    "zwölf",
  ].map((value) => value.toLowerCase()),
);

const TALENT_CATEGORY_MARKERS = [
  "körper",
  "körperlich",
  "gesellschaft",
  "natur",
  "wissen",
  "handwerk",
  "sprachen",
  "sprachlich",
];

const TALENT_CATEGORY_PREFIX_PATTERN = new RegExp(
  `^(?:${TALENT_CATEGORY_MARKERS.join("|")})\\s*:\\s*`,
  "i",
);

const TALENT_CATEGORY_DELIMITER_PATTERN = new RegExp(
  `\\b(${TALENT_CATEGORY_MARKERS.join("|")})\\s*:\\s*`,
  "gi",
);

const LENGTH_MEASUREMENT_PATTERN =
  /^(\d+)\s+(schritte?|schritt|meter|metern|m)\b\s*(.*)$/iu;

const EQUIPMENT_ENTRY_OVERRIDES: Record<string, string> = {
  dietrichset: "Dietrich",
  dietrichsets: "Dietrich",
  dietrich: "Dietrich",
  seil: "Kletterseil, pro Schritt",
  "leichte shakagra platte": "Leichte Shakagra-Plattenrüstung",
  "shakara-hammer": "Kriegshammer",
};

const LIST_BULLET_PATTERN = /[•●◦‣∙]/g;
const SPLIT_WORD_EXCLUSIONS = new Set([
  "und",
  "oder",
  "bzw",
  "talente",
  "talent",
  "liturgien",
  "rituale",
  "sprach",
]);

export function parseStatBlock(raw: string): ParseResult {
  const warnings: ParserWarning[] = [];
  const normalizedSource = normalizeInput(raw);

  const lines = normalizedSource
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return {
      model: createEmptyModel(),
      warnings: [
        {
          type: "parse-error",
          message: "Eingabetext ist leer.",
        },
      ],
      normalizedSource,
    };
  }

  const workingLines = [...lines];
  const name = workingLines.shift() ?? "Unbekannt";

  const attributeLines: string[] = [];
  while (workingLines.length > 0) {
    const nextLine = workingLines[0];
    if (!nextLine || !ATTRIBUTE_LINE_PATTERN.test(nextLine)) {
      break;
    }
    attributeLines.push(workingLines.shift()!);
  }
  const attributes = parseAttributes(attributeLines.join(" "), warnings);

  const pools: ResourcePools = {};
  const resourceLine = workingLines[0];
  if (resourceLine?.startsWith("LeP")) {
    parseResourceLine(resourceLine, pools);
    workingLines.shift();
  } else {
    warnings.push({
      type: "missing-section",
      section: "resources",
      message: "LeP/AsP/KaP-Zeile nicht gefunden.",
    });
  }
  const secondResourceLine = workingLines[0];
  if (secondResourceLine?.startsWith("AW")) {
    parseResourceLine(secondResourceLine, pools);
    workingLines.shift();
  }
  consumeAdditionalResourceLines(workingLines, pools);

  const weapons: WeaponStats[] = [];
  let lineIndex = 0;
  while (lineIndex < workingLines.length) {
    const candidate = workingLines[lineIndex];
    if (candidate && isWeaponStartLine(candidate)) {
      const aggregatedParts = [candidate];
      workingLines.splice(lineIndex, 1);
      while (
        lineIndex < workingLines.length &&
        shouldContinueWeaponLine(workingLines[lineIndex])
      ) {
        const continuation = workingLines[lineIndex];
        if (!continuation) {
          break;
        }
        aggregatedParts.push(continuation);
        workingLines.splice(lineIndex, 1);
      }
      const weaponLine = aggregatedParts.join(" ").replace(/\s+/g, " ").trim();
      const weapon = parseWeaponLine(weaponLine, warnings);
      if (weapon) {
        weapons.push(weapon);
      }
      continue;
    }
    lineIndex += 1;
  }

  const residualLines = [...workingLines];
  for (let i = 0; i < residualLines.length; i += 1) {
    const line = residualLines[i];
    if (!line) {
      continue;
    }
    if (/^RS\s*\/\s*BE\b/i.test(line) && !/^RS\s*\/\s*BE\s*:/i.test(line)) {
      const remainder = line.replace(/^RS\s*\/\s*BE\s*/i, "").trim();
      residualLines[i] = `RS/BE: ${remainder}`;
    }
  }
  const { sections, extras } = collectSections(residualLines);

  const sectionBuckets: {
    combatTechniques: string[];
    scripts: string[];
    advantages: string[];
    disadvantages: string[];
    specialAbilities: string[];
    combatSpecialAbilities: string[];
    languages: string[];
    talents: string[];
    spells: string[];
    cantrips: string[];
    liturgies: string[];
    rituals: string[];
    blessings: string[];
    equipment: string[];
  } = {
    combatTechniques: [],
    scripts: [],
    advantages: [],
    disadvantages: [],
    specialAbilities: [],
    combatSpecialAbilities: [],
    languages: [],
    talents: [],
    spells: [],
    cantrips: [],
    liturgies: [],
    rituals: [],
    blessings: [],
    equipment: [],
  };

  const seenSections = new Set<SectionKey | "advantages-disadvantages">();
  const notes: Record<string, string> = {};
  let armor: ArmorStats | null = null;
  let actions: number | null | undefined;

  for (const section of sections) {
    const normalizedHeading = normalizeHeading(section.heading);
    const content = normalizeWhitespace(section.content);

    if (!normalizedHeading) {
      notes[section.heading] = content;
      continue;
    }

    seenSections.add(normalizedHeading);
    switch (normalizedHeading) {
      case "advantages":
        appendList(sectionBuckets.advantages, content);
        break;
      case "disadvantages":
        appendList(sectionBuckets.disadvantages, content);
        break;
      case "advantages-disadvantages":
        seenSections.add("advantages");
        seenSections.add("disadvantages");
        if (content.toLowerCase() !== "keine") {
          appendCombinedAdvantagesDisadvantages(sectionBuckets, content);
        }
        break;
      case "specialAbilities": {
        const { primary, trailing } = splitTrailingSection(content, "Talente:");
        appendAbilityList(sectionBuckets.specialAbilities, primary);
        if (trailing) {
          seenSections.add("talents");
          appendTalentList(sectionBuckets.talents, trailing);
        }
        break;
      }
      case "combatSpecialAbilities":
        appendAbilityList(sectionBuckets.combatSpecialAbilities, content);
        break;
      case "scripts":
        appendList(sectionBuckets.scripts, content);
        break;
      case "combatTechniques":
        appendList(sectionBuckets.combatTechniques, content);
        break;
      case "languages":
        appendList(sectionBuckets.languages, content);
        break;
      case "talents":
        appendTalentList(sectionBuckets.talents, content);
        break;
      case "spells":
        appendList(sectionBuckets.spells, content);
        break;
      case "cantrips":
        appendList(sectionBuckets.cantrips, content);
        break;
      case "liturgies":
        appendList(sectionBuckets.liturgies, content);
        break;
      case "rituals":
        appendList(sectionBuckets.rituals, content);
        break;
      case "blessings":
        appendList(sectionBuckets.blessings, content);
        break;
      case "equipment":
        appendList(sectionBuckets.equipment, content);
        break;
      case "armor":
        armor = parseArmorSection(content, warnings);
        break;
      case "actions":
        actions = parseNullableInteger(content);
        break;
      case "notes":
      default:
        notes[section.heading] = content;
        break;
    }
  }

  extractInlineLanguageEntries(
    sectionBuckets.specialAbilities,
    sectionBuckets.languages,
    sectionBuckets.scripts,
  );
  extractInlineLanguageEntries(
    sectionBuckets.combatSpecialAbilities,
    sectionBuckets.languages,
    sectionBuckets.scripts,
  );

  if (sectionBuckets.talents.length > 0) {
    seenSections.add("talents");
  }

  for (const requiredSection of [
    "advantages",
    "disadvantages",
    "specialAbilities",
    "talents",
  ] as const) {
    if (!seenSections.has(requiredSection)) {
      warnings.push({
        type: "missing-section",
        section: requiredSection,
        message: `Abschnitt "${requiredSection}" nicht gefunden.`,
      });
    }
  }

  const model: ParsedStatBlock = {
    name,
    attributes,
    pools,
    armor,
    actions: actions ?? null,
    weapons,
    combatTechniques: parseRatedEntries(
      sectionBuckets.combatTechniques,
      "combatTechniques",
      warnings,
    ),
    advantages: sanitizeList(sectionBuckets.advantages),
    disadvantages: sanitizeList(sectionBuckets.disadvantages),
    specialAbilities: sanitizeList(sectionBuckets.specialAbilities),
    combatSpecialAbilities: sanitizeList(sectionBuckets.combatSpecialAbilities),
    languages: sanitizeList(sectionBuckets.languages),
    scripts: sanitizeList(sectionBuckets.scripts),
    spells: parseRatedEntries(sectionBuckets.spells, "spells", warnings),
    cantrips: sanitizeList(sectionBuckets.cantrips),
    liturgies: parseRatedEntries(
      sectionBuckets.liturgies,
      "liturgies",
      warnings,
    ),
    rituals: parseRatedEntries(sectionBuckets.rituals, "rituals", warnings),
    blessings: sanitizeList(sectionBuckets.blessings),
    equipment: sanitizeEquipmentList(sectionBuckets.equipment),
    talents: parseTalentRatings(sectionBuckets.talents, warnings),
    notes,
    extras,
  };

  return {
    model,
    warnings,
    normalizedSource,
  };
}

function normalizeInput(raw: string): string {
  let text = raw.replace(/\r\n/g, "\n").replace(/\t/g, " ");
  text = text.replace(/([A-Za-zÄÖÜäöüß])-\s*\n\s*([A-Za-zÄÖÜäöüß])/g, "$1$2");
  text = text.replace(/–/g, "-");
  text = text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
  return text.trim();
}

function parseAttributes(
  source: string,
  warnings: ParserWarning[],
): AttributeSet {
  const attributes: AttributeSet = {};
  if (!source) {
    warnings.push({
      type: "missing-section",
      section: "attributes",
      message: "Eigenschaftszeilen nicht gefunden.",
    });
    return attributes;
  }

  const regex = /(MU|KL|IN|CH|FF|GE|KO|KK)\s+(\d{1,2})/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(source)) !== null) {
    const key = match[1];
    const valuePart = match[2];
    if (!key || !valuePart) {
      continue;
    }
    const attrKey = key as AttributeKey;
    const value = Number.parseInt(valuePart, 10);
    attributes[attrKey] = Number.isNaN(value) ? undefined : value;
  }

  for (const key of ATTRIBUTE_KEYS) {
    if (attributes[key] === undefined) {
      warnings.push({
        type: "parse-error",
        section: "attributes",
        message: `Eigenschaft ${key} konnte nicht gelesen werden.`,
      });
    }
  }

  return attributes;
}

function parseResourceLine(line: string, pools: ResourcePools): void {
  for (const match of line.matchAll(KEY_VALUE_PATTERN)) {
    const key = match[1];
    const rawValue = match[2];
    if (!key || !rawValue) {
      continue;
    }
    const numeric = parseNullableInteger(rawValue);
    switch (key) {
      case "LeP":
        pools.lep = numeric;
        break;
      case "AsP":
        pools.asp = numeric;
        break;
      case "KaP":
        pools.kap = numeric;
        break;
      case "INI":
        pools.ini = rawValue;
        break;
      case "AW":
        pools.aw = numeric;
        break;
      case "SK":
        pools.sk = numeric;
        break;
      case "ZK":
        pools.zk = numeric;
        break;
      case "GS":
        pools.gs = numeric;
        break;
      default:
        break;
    }
  }
}

function consumeAdditionalResourceLines(
  lines: string[],
  pools: ResourcePools,
): void {
  while (lines.length > 0) {
    const candidate = lines[0]?.trim() ?? "";
    if (!candidate) {
      lines.shift();
      continue;
    }
    const sanitized = candidate.replace(/^[–—-]\s*/, "").trim();
    if (!/^(LeP|AsP|KaP|INI|AW|SK|ZK|GS)\b/i.test(sanitized)) {
      break;
    }
    lines.shift();
    parseResourceLine(sanitized, pools);
  }
}

function parseNullableInteger(value: string): number | null {
  const sanitized = value.replace(/[^0-9\-]/g, "");
  if (!sanitized) {
    return null;
  }
  const parsed = Number.parseInt(sanitized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function isWeaponStartLine(line: string): boolean {
  return /^[^:]+:\s+(AT|FK)\s+/i.test(line);
}

function shouldContinueWeaponLine(line: string | undefined): boolean {
  if (!line) {
    return false;
  }
  const trimmed = line.trim();
  if (!trimmed) {
    return false;
  }
  if (isWeaponStartLine(trimmed)) {
    return false;
  }
  if (HEADING_PATTERN.test(trimmed)) {
    return false;
  }
  if (/^RS\s*\/\s*BE/i.test(trimmed)) {
    return false;
  }
  // Lines that begin with key tokens (RW, LZ, BEM, etc.) or standalone descriptors.
  return true;
}

function parseArmorSection(
  content: string,
  warnings: ParserWarning[],
): ArmorStats | null {
  const normalized = normalizeWhitespace(content);
  if (!normalized) {
    return null;
  }

  const raw = normalized;
  const match = normalized.match(/^(\d+)\s*\/\s*(\d+)(.*)$/);
  if (!match) {
    warnings.push({
      type: "parse-error",
      section: "armor",
      message: `Rüstungseintrag "${normalized}" konnte nicht interpretiert werden.`,
    });
    return {
      rs: null,
      be: null,
      description: null,
      notes: normalized,
      raw,
    };
  }

  const [, rsPartRaw, bePartRaw, remainderRaw = ""] = match;
  const remainder = remainderRaw ?? "";

  const parenthesesMatches = [...remainder.matchAll(/\(([^)]+)\)/g)].map(
    (result) => result[1]?.trim() ?? "",
  );

  let description = parenthesesMatches[0] ?? null;
  const notes =
    parenthesesMatches.length > 1
      ? parenthesesMatches.slice(1).filter(Boolean).join("; ")
      : null;

  if (!description) {
    const textualDescription = remainder
      .replace(/\([^)]*\)/g, " ")
      .replace(/[;,]+/g, " ")
      .trim();
    if (textualDescription) {
      description = normalizeWhitespace(textualDescription);
    }
  }

  return {
    rs: parseNullableInteger(rsPartRaw ?? ""),
    be: parseNullableInteger(bePartRaw ?? ""),
    description,
    notes,
    raw,
  };
}

function parseWeaponLine(
  line: string,
  warnings: ParserWarning[],
): WeaponStats | undefined {
  const [namePartRaw, statsPart] = line.split(":");
  if (!statsPart) {
    warnings.push({
      type: "parse-error",
      section: "weapons",
      message: `Zeile "${line}" enthält keinen Doppelpunkt.`,
    });
    return undefined;
  }

  const name = (namePartRaw ?? "").trim();
  const stats: Record<string, string> = {};
  for (const match of statsPart.matchAll(KEY_VALUE_PATTERN)) {
    const keyPart = match[1];
    const value = match[2];
    if (!keyPart || !value) {
      continue;
    }
    const key = keyPart.toUpperCase();
    stats[key] = value;
  }

  const attack = stats["AT"] ? parseNullableInteger(stats["AT"]) : null;
  const parry = stats["PA"] ? parseNullableInteger(stats["PA"]) : null;
  const rangedAttack = stats["FK"] ? parseNullableInteger(stats["FK"]) : null;
  const category = determineWeaponCategory(name, attack, rangedAttack);

  return {
    name,
    category,
    attack,
    parry,
    rangedAttack,
    damage: stats["TP"] ?? null,
    range: stats["RW"] ?? null,
    load: stats["LZ"] ?? null,
    reach: stats["RE"] ?? null,
    notes: stats["BEM"] ?? null,
    raw: stats,
    rawInput: line.trim(),
  };
}

function determineWeaponCategory(
  name: string,
  attack: number | null,
  rangedAttack: number | null,
): WeaponStats["category"] {
  const lower = name.toLowerCase();
  if (lower.includes("waffenlos")) {
    return "unarmed";
  }
  if (rangedAttack !== null) {
    return "ranged";
  }
  if (attack !== null) {
    return "melee";
  }
  return "unknown";
}

function collectSections(lines: string[]): {
  sections: RawSection[];
  extras: string[];
} {
  const sections: RawSection[] = [];
  const extras: string[] = [];
  let currentHeading: string | null = null;
  let currentContent: string[] = [];

  const flush = () => {
    if (currentHeading) {
      sections.push({
        heading: currentHeading,
        content: currentContent.join(" ").trim(),
      });
    } else if (currentContent.length > 0) {
      extras.push(currentContent.join(" ").trim());
    }
    currentHeading = null;
    currentContent = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    const headingMatch = line.match(HEADING_PATTERN);
    if (headingMatch) {
      const headingValue = headingMatch[1]?.trim();
      if (
        currentHeading &&
        currentHeading.toLowerCase().startsWith("talente") &&
        headingValue &&
        isTalentCategoryHeading(headingValue)
      ) {
        currentContent.push(line);
        continue;
      }
      flush();
      currentHeading =
        headingValue && headingValue.length > 0 ? headingValue : null;
      const remainder = headingMatch[2]?.trim();
      currentContent = remainder ? [remainder] : [];
      continue;
    }
    if (currentHeading) {
      currentContent.push(line);
    } else {
      extras.push(line);
    }
  }
  flush();
  return { sections, extras };
}

function normalizeHeading(
  heading: string,
): SectionKey | "advantages-disadvantages" | "notes" | null {
  const sanitized = heading
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()\/]/g, "");
  if (sanitized.startsWith("schmerz")) {
    return "notes";
  }
  if (sanitized === "kampfverhaltenflucht") {
    return "notes";
  }
  return (
    SECTION_NORMALIZATION_MAP[sanitized] ??
    inferHeadingFromLabel(heading) ??
    null
  );
}

function appendList(target: string[], content: string): void {
  if (!content) {
    return;
  }
  for (const item of splitList(content)) {
    target.push(item);
  }
}

function appendAbilityList(target: string[], content: string): void {
  if (!content) {
    return;
  }
  for (const item of splitList(content)) {
    const segments = splitCompositeAbilityEntry(item);
    segments.forEach((segment) => {
      if (segment) {
        target.push(segment);
      }
    });
  }
}

function appendTalentList(target: string[], content: string): void {
  if (!content || content.toLowerCase() === "keine") {
    return;
  }
  const normalizedContent = insertTalentCategoryDelimiters(content);
  for (const rawItem of splitList(normalizedContent)) {
    const item = stripTalentCategoryPrefix(rawItem);
    if (item) {
      target.push(item);
    }
  }
}

function insertTalentCategoryDelimiters(content: string): string {
  return content.replace(
    TALENT_CATEGORY_DELIMITER_PATTERN,
    (match: string, prefix: string, offset: number) => {
      if (!isTalentCategoryHeading(prefix)) {
        return match;
      }
      const separator = offset === 0 ? "" : "; ";
      return `${separator}${prefix}: `;
    },
  );
}

function stripTalentCategoryPrefix(value: string): string {
  return value.replace(TALENT_CATEGORY_PREFIX_PATTERN, "");
}

function isTalentCategoryHeading(value: string): boolean {
  const normalized = value.toLowerCase().replace(/\s+/g, "").replace(/-+/g, "");
  return TALENT_CATEGORY_MARKERS.some((marker) =>
    normalized.startsWith(marker.replace(/\s+/g, "")),
  );
}

function splitList(content: string): string[] {
  const sanitizedContent = content.replace(LIST_BULLET_PATTERN, ";");
  const results: string[] = [];
  let current = "";
  let depth = 0;
  for (const char of sanitizedContent) {
    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth = Math.max(depth - 1, 0);
    }

    if ((char === "," || char === ";") && depth === 0) {
      if (current.trim()) {
        results.push(current.trim());
      }
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) {
    results.push(current.trim());
  }
  const merged = results.map((value) => mergeSplitWords(value));
  return mergeRelativeClauses(merged);
}

function mergeRelativeClauses(entries: string[]): string[] {
  const result: string[] = [];
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (result.length > 0 && /^(den|die|das|dessen|deren)\b/i.test(trimmed)) {
      result[result.length - 1] = `${result[result.length - 1]}, ${trimmed}`;
    } else {
      result.push(trimmed);
    }
  }
  return result;
}

function extractInlineLanguageEntries(
  source: string[],
  languages: string[],
  scripts: string[],
): void {
  if (source.length === 0) {
    return;
  }
  const remaining: string[] = [];
  let activeTarget: "languages" | "scripts" | null = null;
  for (const entry of source) {
    const languageMatch = entry.match(
      /^(sprachen?|sprachkenntnisse)\s*:\s*(.+)$/i,
    );
    if (languageMatch) {
      appendList(languages, languageMatch[2]);
      activeTarget = "languages";
      continue;
    }
    const scriptMatch = entry.match(/^(schriften?|schrift)\s*:\s*(.+)$/i);
    if (scriptMatch) {
      appendList(scripts, scriptMatch[2]);
      activeTarget = "scripts";
      continue;
    }
    if (
      activeTarget === "languages" &&
      isInlineLanguageContinuation(entry)
    ) {
      languages.push(entry);
      continue;
    }
    if (activeTarget === "scripts" && isInlineScriptContinuation(entry)) {
      scripts.push(entry);
      continue;
    }
    activeTarget = null;
    remaining.push(entry);
  }
  source.length = 0;
  source.push(...remaining);
}

function inferHeadingFromLabel(
  label: string,
): SectionKey | "advantages-disadvantages" | null {
  const normalized = label.toLowerCase();
  if (normalized.includes("sonderfert")) {
    if (normalized.includes("kampf")) {
      return "combatSpecialAbilities";
    }
    return "specialAbilities";
  }
  if (normalized.includes("talent")) {
    return "talents";
  }
  if (normalized.includes("kampftechnik")) {
    return "combatTechniques";
  }
  if (normalized.includes("sprache")) {
    return "languages";
  }
  if (normalized.includes("schrift")) {
    return "scripts";
  }
  if (normalized.includes("liturgie")) {
    return "liturgies";
  }
  if (normalized.includes("ritual")) {
    return "rituals";
  }
  if (normalized.includes("segnung")) {
    return "blessings";
  }
  if (normalized.includes("zaubertrick") || normalized.includes("cantrip")) {
    return "cantrips";
  }
  if (normalized.includes("zauber")) {
    return "spells";
  }
  if (normalized.includes("ausrüstung") || normalized.includes("inventar")) {
    return "equipment";
  }
  if (normalized.includes("vorteil") && normalized.includes("nachteil")) {
    return "advantages-disadvantages";
  }
  if (normalized.includes("vorteil")) {
    return "advantages";
  }
  if (normalized.includes("nachteil")) {
    return "disadvantages";
  }
  if (normalized.includes("rs/be") || normalized.includes("rüst")) {
    return "armor";
  }
  return null;
}

function isInlineLanguageContinuation(entry: string): boolean {
  return /\b[IVXLCDM]+\b/i.test(entry) || /^muttersprache\b/i.test(entry);
}

function isInlineScriptContinuation(entry: string): boolean {
  return /zeichen|runen|glyph|schrift|piktogramm|alphabet|zhayad/i.test(entry);
}

function sanitizeEquipmentList(values: string[]): string[] {
  return sanitizeList(values)
    .map((value) => rewriteEquipmentEntry(value))
    .filter((value) => value.length > 0);
}

function rewriteEquipmentEntry(value: string): string {
  const stripped = stripTrailingQuantityAnnotation(stripLeadingQuantity(value));
  const measurementMatch = stripped.match(/\(\s*[^)]+\)\s*$/u);
  const measurement = measurementMatch ? measurementMatch[0] : "";
  const base =
    measurement && stripped.endsWith(measurement)
      ? stripped.slice(0, stripped.length - measurement.length).trim()
      : stripped;
  const override = EQUIPMENT_ENTRY_OVERRIDES[base.toLowerCase()];
  if (!override) {
    return stripped;
  }
  return measurement ? `${override} ${measurement}`.trim() : override;
}

function splitCompositeAbilityEntry(value: string): string[] {
  const parts = value
    .split(/(?<=\))\s+(?=[A-ZÄÖÜ][a-zäöüß])/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return parts.length > 0 ? parts : [value];
}

function appendCombinedAdvantagesDisadvantages(
  buckets: {
    advantages: string[];
    disadvantages: string[];
  },
  content: string,
): void {
  for (const entry of splitList(content)) {
    const parts = splitOnSlash(entry);
    for (const part of parts) {
      const classification = classifyAdvantageDisadvantage(part);
      if (classification === "disadvantage") {
        buckets.disadvantages.push(part);
      } else if (classification === "advantage") {
        buckets.advantages.push(part);
      } else {
        buckets.advantages.push(part);
        buckets.disadvantages.push(part);
      }
    }
  }
}

function classifyAdvantageDisadvantage(
  entry: string,
): "advantage" | "disadvantage" | "both" {
  const value = entry.toLowerCase();
  const disadvantageKeywords = [
    "schlechte eigenschaft",
    "verpflicht",
    "feindschaft",
    "hass",
    "arm",
    "krankheit",
    "unfähig",
    "vorurteil",
    "schulden",
    "angst",
    "zauberanfällig",
  ];
  if (disadvantageKeywords.some((keyword) => value.includes(keyword))) {
    return "disadvantage";
  }
  const advantageKeywords = [
    "begabung",
    "adelig",
    "gutaussehend",
    "vorteil",
    "resistenz",
    "richtungssinn",
    "entfernungssinn",
  ];
  if (advantageKeywords.some((keyword) => value.includes(keyword))) {
    return "advantage";
  }
  return "both";
}

function sanitizeList(values: string[]): string[] {
  return values
    .map((value) => normalizeWhitespace(value))
    .map((value) => mergeSplitWords(value))
    .map((value) => stripCitations(value))
    .map((value) => expandAttributeAbbreviations(value))
    .map((value) => normalizeTypos(value))
    .map((value) => stripFootnoteMarkers(value))
    .map((value) => normalizeWhitespace(value))
    .map((value) => (value.endsWith(".") ? value.slice(0, -1) : value))
    .filter((value) => value.length > 0)
    .filter((value) => {
      const lower = value.toLowerCase();
      return (
        lower !== "keine" &&
        lower !== "keiner" &&
        lower !== "keinen" &&
        lower !== "nein" &&
        lower !== "entfällt" &&
        lower !== "-" &&
        lower !== "—"
      );
    });
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function mergeSplitWords(value: string): string {
  return value.replace(
    /([A-Za-zÄÖÜäöüß]+)-\s+([A-Za-zÄÖÜäöüß]+)\b/g,
    (match, left: string, right: string) => {
      if (SPLIT_WORD_EXCLUSIONS.has(right.toLowerCase())) {
        return `${left}- ${right}`;
      }
      return `${left}${right}`;
    },
  );
}

function stripCitations(value: string): string {
  let result = value
    .replace(/([IVX]+)\s*AKO\d+/gi, "$1")
    .replace(/([IVX]+)AKO\d+/gi, "$1");
  result = result.replace(/AKO[IVX\d]+/gi, "");
  result = result.replace(/\s{2,}/g, " ");
  return result.trim();
}

function normalizeTypos(value: string): string {
  let normalized = value;
  for (const [typo, correction] of Object.entries(TYPO_CORRECTIONS)) {
    const regex = new RegExp(`\\b${typo}\\b`, "gi");
    normalized = normalized.replace(regex, correction);
  }
  return normalized;
}

function stripFootnoteMarkers(value: string): string {
  return value.replace(/\*+$/g, "").trim();
}

function expandAttributeAbbreviations(value: string): string {
  return value.replace(/\(([^)]+)\)/g, (_match, content: string) => {
    const tokens = content
      .split(/\s*[;,\/]\s*/)
      .map((token) => {
        const trimmed = token.trim();
        const upper = trimmed.toUpperCase();
        const mapped = ATTRIBUTE_ABBREVIATIONS[upper];
        return mapped ?? trimmed;
      })
      .filter((token) => token.length > 0);
    return `(${tokens.join(", ")})`;
  });
}

function stripLeadingQuantity(value: string): string {
  const working = value.trim();

  const measurementMatch = working.match(LENGTH_MEASUREMENT_PATTERN);
  if (measurementMatch && measurementMatch[3]) {
    const [, amount, rawUnit, remainder] = measurementMatch;
    if (rawUnit && remainder) {
      const restRaw = remainder.trim();
      if (restRaw) {
        const rest =
          restRaw.toLowerCase() === "seil"
            ? "Kletterseil, pro Schritt"
            : restRaw;
        const unitLower = rawUnit.toLowerCase();
        const displayUnit = unitLower.startsWith("schritt") ? "m" : rawUnit;
        return `${rest} (${amount} ${displayUnit})`.trim();
      }
    }
  }

  const numericMatch = working.match(/^(\d+)\s+(.*)$/u);
  if (numericMatch && numericMatch[2]) {
    return numericMatch[2].trim();
  }

  const wordMatch = working.match(/^([A-Za-zÄÖÜäöüß]+)\s+(.*)$/u);
  if (wordMatch && wordMatch[2]) {
    const word = wordMatch[1]?.toLowerCase();
    if (word && NUMBER_WORDS.has(word)) {
      return wordMatch[2].trim();
    }
  }

  return working;
}

function stripTrailingQuantityAnnotation(value: string): string {
  let working = value.trim();
  working = working.replace(/\(\s*(?:x\s*)?\d+\s*\)\s*$/iu, "").trim();
  return working;
}

function stripTrailingParentheticalNote(value: string): string {
  return value.replace(/\(\s*[^)]*\)\s*$/u, "").trim();
}

function splitOnSlash(value: string): string[] {
  const result: string[] = [];
  let buffer = "";
  let depth = 0;
  for (const char of value) {
    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth = Math.max(depth - 1, 0);
    }

    if (char === "/" && depth === 0) {
      if (buffer.trim()) {
        result.push(buffer.trim());
      }
      buffer = "";
      continue;
    }
    buffer += char;
  }
  if (buffer.trim()) {
    result.push(buffer.trim());
  }
  return result;
}

function splitTrailingSection(
  content: string,
  marker: string,
): { primary: string; trailing?: string } {
  const lowerContent = content.toLowerCase();
  const lowerMarker = marker.toLowerCase();
  const index = lowerContent.indexOf(lowerMarker);
  if (index === -1) {
    return { primary: content };
  }
  const primary = content
    .slice(0, index)
    .trim()
    .replace(/[;,]+$/, "");
  const trailing = content.slice(index + marker.length).trim();
  return {
    primary: primary.length > 0 ? primary : "",
    trailing: trailing.length > 0 ? trailing : undefined,
  };
}

function parseTalentRatings(
  rawValues: string[],
  warnings: ParserWarning[],
): TalentRating[] {
  const result: TalentRating[] = [];

  for (const entry of rawValues) {
    const cleaned = stripFootnoteMarkers(entry.trim());
    const spaced = cleaned.replace(
      /([^\s\d])(-?\d+)(\s*\([^)]*\))?$/,
      "$1 $2$3",
    );
    const match = spaced.match(/^(.+?)\s+(-?\d+)(?:\s*\([^)]*\))?$/);
    if (!match) {
      warnings.push({
        type: "parse-error",
        section: "talents",
        message: `Talent konnte nicht interpretiert werden: "${entry}"`,
      });
      continue;
    }
    const namePart = mergeSplitWords(match[1] ?? "");
    const valuePart = match[2];
    if (!namePart || !valuePart) {
      warnings.push({
        type: "parse-error",
        section: "talents",
        message: `Talent konnte nicht interpretiert werden: "${entry}"`,
      });
      continue;
    }
    const name = normalizeTypos(namePart.replace(/\*+$/, "").trim());
    const value = Number.parseInt(valuePart, 10);
    if (Number.isNaN(value)) {
      warnings.push({
        type: "parse-error",
        section: "talents",
        message: `Talentwert ist keine Zahl: "${entry}"`,
      });
      continue;
    }
    result.push({ name, value });
  }

  return result;
}

function parseRatedEntries(
  rawValues: string[],
  section: string,
  warnings: ParserWarning[],
): RatedEntry[] {
  const values: RatedEntry[] = [];
  for (const entry of sanitizeList(rawValues)) {
    const cleanedEntry = stripTrailingParentheticalNote(entry);
    const match = cleanedEntry.match(/^(.+?)\s+(-?\d+|[IVX]+)$/i);
    if (!match) {
      values.push({ name: entry, value: 0 });
      warnings.push({
        type: "parse-error",
        section,
        message: `Wert für ${section} konnte nicht ermittelt werden: "${entry}"`,
      });
      continue;
    }
    const namePart = mergeSplitWords(match[1] ?? "");
    const suffixPart = match[2];
    if (!namePart || !suffixPart) {
      warnings.push({
        type: "parse-error",
        section,
        message: `Wert für ${section} konnte nicht ermittelt werden: "${entry}"`,
      });
      continue;
    }
    const name = namePart.trim();
    const suffix = suffixPart.trim();
    let value: number | null = Number.parseInt(suffix, 10);
    if (Number.isNaN(value)) {
      value = romanToInteger(suffix.toUpperCase());
    }
    if (!value || Number.isNaN(value)) {
      warnings.push({
        type: "parse-error",
        section,
        message: `Numerischer Wert für ${section} ist ungültig: "${entry}"`,
      });
      continue;
    }
    values.push({ name, value });
  }
  return values;
}

function romanToInteger(value: string): number | null {
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };
  const chars = value.toUpperCase().split("");
  let total = 0;
  let previous = 0;
  for (const char of chars.reverse()) {
    const current = map[char];
    if (!current) {
      return null;
    }
    if (current < previous) {
      total -= current;
    } else {
      total += current;
      previous = current;
    }
  }
  return total;
}

function createEmptyModel(): ParsedStatBlock {
  return {
    name: "Unbekannt",
    attributes: {},
    pools: {},
    armor: null,
    actions: null,
    weapons: [],
    combatTechniques: [],
    scripts: [],
    advantages: [],
    disadvantages: [],
    specialAbilities: [],
    combatSpecialAbilities: [],
    languages: [],
    spells: [],
    cantrips: [],
    liturgies: [],
    rituals: [],
    blessings: [],
    equipment: [],
    talents: [],
    notes: {},
    extras: [],
  };
}
