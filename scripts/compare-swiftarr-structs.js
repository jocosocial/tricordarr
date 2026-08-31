#!/usr/bin/env node
/**
 * Compare local ControllerStructs / SocketStructs (TypeScript and iOS kit)
 * against upstream Swiftarr DTOs. Prints a markdown report to stdout.
 *
 * Does not edit DTO files.
 *
 * Usage:
 *   node scripts/compare-swiftarr-structs.js
 *   node scripts/compare-swiftarr-structs.js --ref=master
 */

const fs = require('fs');
const path = require('path');

const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const REPO = 'jocosocial/swiftarr';

const STRUCT_PATHS = [
  'Sources/swiftarr/Controllers/Structs/ControllerStructs.swift',
  'Sources/swiftarr/Controllers/Structs/SocketStructs.swift',
];

const ENUM_PATHS = [
  'Sources/swiftarr/Enumerations/FezType.swift',
  'Sources/swiftarr/Enumerations/UserAccessLevel.swift',
  'Sources/swiftarr/Enumerations/UserRoleType.swift',
  'Sources/swiftarr/Enumerations/DinnerTeam.swift',
  'Sources/swiftarr/Enumerations/LikeType.swift',
  'Sources/swiftarr/Enumerations/AppFeatures.swift',
];

const LOCAL_STRUCT_FILES = [
  path.join(ROOT, 'src/Structs/ControllerStructs.tsx'),
  path.join(ROOT, 'src/Structs/SocketStructs.ts'),
];

const LOCAL_ENUM_FILES = [
  path.join(ROOT, 'src/Enums/FezType.ts'),
  path.join(ROOT, 'src/Enums/UserAccessLevel.ts'),
  path.join(ROOT, 'src/Enums/UserRoleType.ts'),
  path.join(ROOT, 'src/Enums/DinnerTeam.ts'),
  path.join(ROOT, 'src/Enums/LikeType.ts'),
  path.join(ROOT, 'src/Enums/AppFeatures.ts'),
];

const IOS_FILES = [
  path.join(ROOT, 'ios/TricordarrKit/Structs/ControllerStructs.swift'),
  path.join(ROOT, 'ios/TricordarrKit/Structs/SocketStructs.swift'),
];

/** Types the notification worker actually needs. Do not flag the rest of the TS catalog as missing on iOS. */
const IOS_KIT_TYPES = new Set([
  'UserHeader',
  'NotificationTypeData',
  'SocketNotificationData',
  'PhoneSocketServerAddress',
]);

const LOCAL_ONLY_TYPES = new Set(['SocketHealthcheckData']);

const SWIFT_TO_TS_PRIMITIVES = {
  UUID: 'string',
  Date: 'string',
  Data: 'string',
  URL: 'string',
  String: 'string',
  Bool: 'boolean',
  Int: 'number',
  UInt: 'number',
  Int8: 'number',
  Int16: 'number',
  Int32: 'number',
  Int64: 'number',
  UInt8: 'number',
  UInt16: 'number',
  UInt32: 'number',
  UInt64: 'number',
  Double: 'number',
  Float: 'number',
  HTTPResponseStatus: 'number',
};

const ENUM_TYPE_NAMES = new Set([
  'FezType',
  'UserAccessLevel',
  'UserRoleType',
  'DinnerTeam',
  'LikeType',
  'SwiftarrClientApp',
  'SwiftarrFeature',
  'NotificationTypeData',
]);

function parseArgs(argv) {
  let ref = 'master';
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/compare-swiftarr-structs.js [--ref=master]');
      process.exit(0);
    }
    if (arg.startsWith('--ref=')) {
      ref = arg.slice('--ref='.length);
      continue;
    }
    console.error(`Unknown argument: ${arg}`);
    process.exit(1);
  }
  return {ref};
}

function rawUrl(ref, filePath) {
  return `https://raw.githubusercontent.com/${REPO}/${ref}/${filePath}`;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {'User-Agent': 'tricordarr-compare-swiftarr-structs'},
  });
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  }
  return res.text();
}

async function fetchCommitSha(ref) {
  const url = `https://api.github.com/repos/${REPO}/commits/${encodeURIComponent(ref)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'tricordarr-compare-swiftarr-structs',
        Accept: 'application/vnd.github+json',
      },
    });
    if (!res.ok) {
      return null;
    }
    const body = await res.json();
    return body.sha || null;
  } catch {
    return null;
  }
}

function stripSwiftComments(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (c === '"') {
      const start = i;
      i += 1;
      while (i < src.length) {
        if (src[i] === '\\') {
          i += 2;
          continue;
        }
        if (src[i] === '"') {
          i += 1;
          break;
        }
        i += 1;
      }
      out += src.slice(start, i);
      continue;
    }
    if (c === '/' && n === '/') {
      while (i < src.length && src[i] !== '\n') {
        i += 1;
      }
      continue;
    }
    if (c === '/' && n === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') {
          out += '\n';
        }
        i += 1;
      }
      i += 2;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

function matchBrace(src, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < src.length; i++) {
    const c = src[i];
    if (c === '"') {
      i += 1;
      while (i < src.length) {
        if (src[i] === '\\') {
          i += 2;
          continue;
        }
        if (src[i] === '"') {
          break;
        }
        i += 1;
      }
      continue;
    }
    if (c === '{') {
      depth += 1;
    } else if (c === '}') {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

function countChar(line, ch) {
  let n = 0;
  let inString = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inString) {
      if (c === '\\') {
        i += 1;
        continue;
      }
      if (c === '"') {
        inString = false;
      }
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === ch) {
      n += 1;
    }
  }
  return n;
}

function splitAtDepth(src, sep) {
  let depth = 0;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === '[' || c === '(' || c === '<') {
      depth += 1;
    } else if (c === ']' || c === ')' || c === '>') {
      depth -= 1;
    } else if (c === sep && depth === 0) {
      return [src.slice(0, i), src.slice(i + 1)];
    }
  }
  return null;
}

function stripDefaultValue(typeSrc) {
  const split = splitAtDepth(typeSrc, '=');
  return split ? split[0].trim() : typeSrc.trim();
}

function parsePropertyLine(trimmed) {
  if (/\bstatic\b/.test(trimmed) || /\blazy\b/.test(trimmed)) {
    return null;
  }
  const m = trimmed.match(
    /^(?:(?:public|private|internal|fileprivate|open|weak|unowned|override)\s+)*(?:var|let)\s+(\w+)\s*:\s*(.+)$/,
  );
  if (!m) {
    return null;
  }
  let typeSrc = stripDefaultValue(m[2]);
  if (typeSrc.includes('{')) {
    return null;
  }
  return {name: m[1], swiftType: typeSrc};
}

function parseEnumCases(trimmed) {
  if (!trimmed.startsWith('case ')) {
    return [];
  }
  let rest = trimmed.slice(5).trim();
  rest = rest.replace(/\/\/.*$/, '').trim();
  const cases = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < rest.length; i++) {
    const c = rest[i];
    if (c === '(' || c === '[' || c === '<') {
      depth += 1;
      current += c;
    } else if (c === ')' || c === ']' || c === '>') {
      depth -= 1;
      current += c;
    } else if (c === ',' && depth === 0) {
      cases.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  if (current.trim()) {
    cases.push(current.trim());
  }
  return cases
    .map(part => {
      const nameMatch = part.match(/^(\w+)/);
      if (!nameMatch) {
        return null;
      }
      const rawMatch = part.match(/[=]\s*"([^"]*)"/);
      return {name: nameMatch[1], raw: rawMatch ? rawMatch[1] : nameMatch[1]};
    })
    .filter(Boolean);
}

function parseConformances(header) {
  const colon = header.indexOf(':');
  if (colon < 0) {
    return [];
  }
  let rest = header.slice(colon + 1);
  const whereAt = rest.search(/\bwhere\b/);
  if (whereAt >= 0) {
    rest = rest.slice(0, whereAt);
  }
  return rest
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function isDtoConformance(conformances) {
  return conformances.some(c => c === 'Content' || c === 'Codable');
}

function parseSwiftBody(body, kind) {
  const fields = [];
  const cases = [];
  let depth = 0;
  for (const line of body.split('\n')) {
    const opens = countChar(line, '{');
    const closes = countChar(line, '}');
    const trimmed = line.trim();
    if (depth === 0 && trimmed) {
      if (kind === 'enum') {
        cases.push(...parseEnumCases(trimmed));
      }
      if (kind === 'struct' || kind === 'enum') {
        const prop = parsePropertyLine(trimmed);
        if (prop) {
          fields.push(prop);
        }
      }
    }
    depth += opens - closes;
    if (depth < 0) {
      depth = 0;
    }
  }
  return {fields, cases};
}

function parseSwiftSource(source) {
  const stripped = stripSwiftComments(source);
  const types = {};
  const declRe = /(?:^|\n)[ \t]*(?:(?:public|private|internal|fileprivate|open)\s+)*(struct|enum|extension)\s+(\w+)/g;
  let match;
  while ((match = declRe.exec(stripped))) {
    const kind = match[1];
    const name = match[2];
    const after = match.index + match[0].length;
    const brace = stripped.indexOf('{', after);
    if (brace < 0) {
      continue;
    }
    const between = stripped.slice(after, brace);
    if (between.includes('}')) {
      continue;
    }
    const end = matchBrace(stripped, brace);
    if (end < 0) {
      continue;
    }
    if (kind === 'extension') {
      continue;
    }
    const body = stripped.slice(brace + 1, end);
    const parsed = parseSwiftBody(body, kind);
    const header = stripped.slice(after, brace);
    const conformances = parseConformances(header);
    if (kind === 'struct' && !isDtoConformance(conformances)) {
      continue;
    }
    types[name] = {
      kind,
      name,
      fields: parsed.fields,
      cases: parsed.cases,
      conformances,
    };
  }
  return types;
}

function mergeTypes(target, extra) {
  for (const [name, type] of Object.entries(extra)) {
    target[name] = type;
  }
  return target;
}

function unwrapOptionals(swiftType) {
  let s = swiftType.trim();
  let optional = false;
  while (s.endsWith('?')) {
    optional = true;
    s = s.slice(0, -1).trim();
  }
  const optMatch = s.match(/^Optional<(.+)>$/);
  if (optMatch) {
    optional = true;
    s = optMatch[1].trim();
  }
  return {core: s, optional};
}

function swiftToTs(swiftType) {
  const {core, optional} = unwrapOptionals(swiftType);
  const dict = (() => {
    if (!core.startsWith('[') || !core.endsWith(']')) {
      return null;
    }
    const inner = core.slice(1, -1);
    const split = splitAtDepth(inner, ':');
    if (!split) {
      return null;
    }
    return {key: split[0].trim(), value: split[1].trim()};
  })();
  if (dict) {
    const keyTs = swiftToTs(dict.key);
    const valTs = swiftToTs(dict.value);
    return {
      type: `Record<${keyTs.type}, ${valTs.type}>`,
      optional,
      original: swiftType,
    };
  }
  if (core.startsWith('[') && core.endsWith(']')) {
    const inner = swiftToTs(core.slice(1, -1));
    return {type: `${inner.type}[]`, optional, original: swiftType};
  }
  const generic = core.match(/^(\w+)\s*<(.+)>$/);
  if (generic) {
    const inner = generic[2].split(',').map(part => swiftToTs(part.trim()).type);
    return {type: `${generic[1]}<${inner.join(', ')}>`, optional, original: swiftType};
  }
  const mapped = SWIFT_TO_TS_PRIMITIVES[core];
  return {type: mapped || core, optional, original: swiftType};
}

function normalizeTsType(typeText, optional) {
  let t = typeText.replace(/\s+/g, ' ').trim();
  t = t.replace(/\bHttpStatusCode\b/g, 'number');
  t = t.replace(/^Array<(.+)>$/, '$1[]');
  if (t.includes('|')) {
    const parts = t.split('|').map(p => p.trim());
    const filtered = parts.filter(p => p !== 'undefined' && p !== 'null');
    if (filtered.length < parts.length) {
      optional = true;
    }
    t = filtered.join(' | ');
  }
  return {type: t, optional};
}

function compactType(typeText) {
  return typeText.replace(/\s+/g, '');
}

function isSocketEnumObject(tsType) {
  const n = compactType(tsType);
  return n === '{[key:string]:{}}' || n === 'Record<string,{}>';
}

function typesEquivalent(translated, localNorm, typeName, fieldName) {
  if (translated.type === 'NotificationTypeData' && isSocketEnumObject(localNorm.type)) {
    return translated.optional === localNorm.optional;
  }
  if (typeName === 'SocketNotificationData' && fieldName === 'type') {
    if (translated.type === 'NotificationTypeData' && isSocketEnumObject(localNorm.type)) {
      return true;
    }
  }
  return translated.type === localNorm.type && translated.optional === localNorm.optional;
}

function formatExpectedTs(translated) {
  const opt = translated.optional ? '?' : '';
  if (translated.original && /\bDate\b/.test(unwrapOptionals(translated.original).core)) {
    return `${translated.type}${opt} (ISO8601)`;
  }
  return `${translated.type}${opt}`;
}

function parseTsFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const scriptKind = filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, scriptKind);
  const types = {};

  function visit(node) {
    if (ts.isModuleDeclaration(node)) {
      return;
    }
    if (ts.isInterfaceDeclaration(node) && node.name) {
      const name = node.name.text;
      const fields = [];
      for (const member of node.members) {
        if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
          fields.push({
            name: member.name.text,
            optional: !!member.questionToken,
            tsType: member.type ? member.type.getText(sf) : 'any',
          });
        }
      }
      types[name] = {
        kind: 'interface',
        name,
        fields,
        localOnly: LOCAL_ONLY_TYPES.has(name),
      };
    }
    if (ts.isEnumDeclaration(node) && node.name) {
      const name = node.name.text;
      const cases = [];
      for (const member of node.members) {
        const caseName = ts.isIdentifier(member.name)
          ? member.name.text
          : member.name.getText(sf).replace(/^['"]|['"]$/g, '');
        let raw = caseName;
        if (member.initializer) {
          raw = member.initializer.getText(sf).replace(/^['"]|['"]$/g, '');
        }
        cases.push({name: caseName, raw});
      }
      types[name] = {kind: 'enum', name, cases, fields: []};
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return types;
}

function iosNote(typeName) {
  return IOS_KIT_TYPES.has(typeName) ? 'iOS kit: compare' : 'iOS kit: n/a (not in kit)';
}

function classifyTranslation(swiftType) {
  const {core, optional} = unwrapOptionals(swiftType);
  if (/\bDate\b/.test(core)) {
    return 'date';
  }
  if (/\bUUID\b/.test(core)) {
    return 'uuid';
  }
  if (core.startsWith('[') && core.includes(':')) {
    return 'dict';
  }
  const base = core
    .replace(/\[|\]|\?|<.*>/g, '')
    .trim()
    .split(/\s/)[0];
  if (ENUM_TYPE_NAMES.has(base) || ENUM_TYPE_NAMES.has(core)) {
    return 'enum';
  }
  if (optional) {
    return 'optionality';
  }
  if (/\bInt\b|\bUInt\b/.test(core)) {
    return 'int';
  }
  return 'other';
}

function fieldLine(typeName, fieldName, swiftType, localDesc) {
  const translated = swiftToTs(swiftType);
  const expected = formatExpectedTs(translated);
  const local = localDesc ? `; local: ${localDesc}` : '';
  return `${typeName}.${fieldName}: upstream \`${swiftType}\` → TS \`${expected}\`${local}; ${iosNote(typeName)}`;
}

function missingTypeLine(upType) {
  if (upType.kind === 'enum') {
    const cases = upType.cases.map(c => c.name).join(', ') || '(none)';
    return `${upType.name}: missing from TS. Cases: ${cases}`;
  }
  const fields = upType.fields
    .map(f => {
      const t = swiftToTs(f.swiftType);
      return `${f.name}: \`${f.swiftType}\` → \`${formatExpectedTs(t)}\``;
    })
    .join('; ');
  return `${upType.name}: missing from TS. Fields: ${fields || '(none)'}`;
}

function diffAgainstTs(upstream, local) {
  const mustPort = [];
  const consider = [];
  const dateTranslations = [];
  const dataTypeTranslations = [];
  const localOnly = [];

  const pushTranslation = (swiftType, line) => {
    const kind = classifyTranslation(swiftType);
    if (kind === 'date') {
      dateTranslations.push(line);
    } else {
      dataTypeTranslations.push(line);
    }
  };

  for (const [name, upType] of Object.entries(upstream)) {
    const loc = local[name];
    if (!loc || loc.localOnly) {
      consider.push(missingTypeLine(upType));
      for (const f of upType.fields || []) {
        if (classifyTranslation(f.swiftType) === 'date') {
          dateTranslations.push(fieldLine(name, f.name, f.swiftType, 'missing (type not in TS)'));
        }
      }
      continue;
    }

    if (upType.kind === 'enum' && loc.kind === 'enum') {
      const locCases = new Map(loc.cases.map(c => [c.name, c]));
      const upCases = new Map(upType.cases.map(c => [c.name, c]));
      for (const c of upType.cases) {
        if (!locCases.has(c.name)) {
          const line = `${name}.${c.name}: upstream case missing from TS; keep lowercase raw value \`${c.raw}\``;
          mustPort.push(line);
          dataTypeTranslations.push(line);
        }
      }
      for (const c of loc.cases) {
        if (!upCases.has(c.name)) {
          localOnly.push(`${name}.${c.name}`);
        }
      }
      continue;
    }

    if (upType.kind === 'struct' && loc.kind === 'interface') {
      const locFields = new Map(loc.fields.map(f => [f.name, f]));
      const upFields = new Map(upType.fields.map(f => [f.name, f]));
      for (const f of upType.fields) {
        const translated = swiftToTs(f.swiftType);
        const locField = locFields.get(f.name);
        if (!locField) {
          const line = fieldLine(name, f.name, f.swiftType, 'missing');
          mustPort.push(line);
          pushTranslation(f.swiftType, line);
          continue;
        }
        const locNorm = normalizeTsType(locField.tsType, locField.optional);
        if (!typesEquivalent(translated, locNorm, name, f.name)) {
          const optNote =
            locField.optional !== translated.optional
              ? locField.optional
                ? ' (optional, upstream required)'
                : ' (required, upstream optional)'
              : locField.optional
                ? ' (optional)'
                : '';
          const localDesc = `\`${locField.tsType}\`${optNote}`;
          const line = fieldLine(name, f.name, f.swiftType, localDesc);
          mustPort.push(line);
          pushTranslation(f.swiftType, line);
        }
      }
      for (const f of loc.fields) {
        if (!upFields.has(f.name)) {
          localOnly.push(f.name.startsWith('_') ? `${name}.${f.name} (intentional)` : `${name}.${f.name}`);
        }
      }
    }
  }

  for (const [name, loc] of Object.entries(local)) {
    if (LOCAL_ONLY_TYPES.has(name) || loc.localOnly) {
      localOnly.push(`${name} (intentional)`);
      continue;
    }
    if (!upstream[name]) {
      localOnly.push(name);
    }
  }

  const uniq = arr => [...new Set(arr)];
  return {
    mustPort: uniq(mustPort),
    consider: uniq(consider),
    dateTranslations: uniq(dateTranslations),
    dataTypeTranslations: uniq(dataTypeTranslations),
    localOnly: uniq(localOnly),
  };
}

function normalizeSwiftType(swiftType) {
  return unwrapOptionals(swiftType);
}

function swiftTypesEqual(a, b) {
  const na = normalizeSwiftType(a);
  const nb = normalizeSwiftType(b);
  return na.core === nb.core && na.optional === nb.optional;
}

function diffIosKit(upstream, ios) {
  const lines = [];
  for (const name of IOS_KIT_TYPES) {
    const upType = upstream[name];
    const kitType = ios[name];
    if (!upType) {
      lines.push(`${name}: present in kit but not found upstream`);
      continue;
    }
    if (!kitType) {
      lines.push(`${name}: used by kit but missing from TricordarrKit`);
      continue;
    }
    if (upType.kind === 'enum') {
      const kitCases = new Set((kitType.cases || []).map(c => c.name));
      const upCases = new Set((upType.cases || []).map(c => c.name));
      for (const c of upType.cases || []) {
        if (!kitCases.has(c.name)) {
          lines.push(`${name}.${c.name}: upstream case missing from kit`);
        }
      }
      for (const c of kitType.cases || []) {
        if (!upCases.has(c.name)) {
          lines.push(`${name}.${c.name}: kit-only case (not upstream)`);
        }
      }
      continue;
    }
    const kitFields = new Map((kitType.fields || []).map(f => [f.name, f]));
    const upFields = new Map((upType.fields || []).map(f => [f.name, f]));
    for (const f of upType.fields || []) {
      const kitField = kitFields.get(f.name);
      if (!kitField) {
        lines.push(`${name}.${f.name}: upstream \`${f.swiftType}\` missing from kit`);
        continue;
      }
      if (!swiftTypesEqual(f.swiftType, kitField.swiftType)) {
        lines.push(`${name}.${f.name}: upstream \`${f.swiftType}\` vs kit \`${kitField.swiftType}\``);
      }
    }
    for (const f of kitType.fields || []) {
      if (!upFields.has(f.name)) {
        lines.push(`${name}.${f.name}: kit-only field (not upstream)`);
      }
    }
  }
  return lines;
}

function bullets(items) {
  if (!items.length) {
    return '- (none)';
  }
  return items.map(item => `- ${item}`).join('\n');
}

function renderReport({ref, sha, fetchedAt, tsDiff, iosLines}) {
  const shaLabel = sha ? sha.slice(0, 40) : 'unknown';
  const urls = STRUCT_PATHS.map(p => rawUrl(ref, p)).join(', ');
  const needsPort = [
    ...tsDiff.mustPort.map(line => `**must port** ${line}`),
    ...tsDiff.consider.map(line => `**consider** ${line}`),
  ];
  return `# Swiftarr struct diff

Upstream: ${urls} @ ${shaLabel} (fetched ${fetchedAt})
Ref: \`${ref}\`

## Needs port (new or changed upstream)

${bullets(needsPort)}

## Date translations

${bullets(tsDiff.dateTranslations)}

## Data type translations

${bullets(tsDiff.dataTypeTranslations)}

## Local-only (not upstream)

${bullets(tsDiff.localOnly)}

## iOS kit

${bullets(iosLines)}
`;
}

async function main() {
  const {ref} = parseArgs(process.argv.slice(2));
  const fetchedAt = new Date().toISOString();

  const sha = await fetchCommitSha(ref);

  const remotePaths = [...STRUCT_PATHS, ...ENUM_PATHS];
  const sources = await Promise.all(
    remotePaths.map(async filePath => ({
      filePath,
      text: await fetchText(rawUrl(ref, filePath)),
    })),
  );

  const upstream = {};
  for (const {text} of sources) {
    mergeTypes(upstream, parseSwiftSource(text));
  }

  const local = {};
  for (const filePath of [...LOCAL_STRUCT_FILES, ...LOCAL_ENUM_FILES]) {
    mergeTypes(local, parseTsFile(filePath));
  }

  const ios = {};
  for (const filePath of IOS_FILES) {
    mergeTypes(ios, parseSwiftSource(fs.readFileSync(filePath, 'utf8')));
  }

  const tsDiff = diffAgainstTs(upstream, local);
  const iosLines = diffIosKit(upstream, ios);

  process.stdout.write(renderReport({ref, sha, fetchedAt, tsDiff, iosLines}));
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack || err.message : err);
  process.exit(1);
});
