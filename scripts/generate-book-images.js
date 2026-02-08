#!/usr/bin/env node

/**
 * Generates missing book page images and updates content/books/<book>/content.ts.
 *
 * Workflow:
 * 1) Read all books and detect pages missing image requires.
 * 2) Detect mentioned characters per page.
 * 3) Reuse character references from prompts/images.
 * 4) Generate missing character references into prompts/images.
 * 5) Generate page images and write them into each book directory.
 * 6) Upsert image requires in content.ts.
 *
 * Requires OPENAI_API_KEY for image generation.
 */

const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const BOOKS_DIR = path.join(ROOT, 'content', 'books');
const PROMPTS_IMAGES_DIR = path.join(ROOT, 'prompts', 'images');

const SUPPORTED_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const FAMILY_CHARACTER_KEYS = new Set([
  'karol',
  'karolcia',
  'mama',
  'tata',
  'lora',
  'babcia',
  'dziadek',
]);

const STOPWORDS = new Set([
  'dzis',
  'wszyscy',
  'wakacje',
  'to',
  'czy',
  'gdzie',
  'ile',
  'kto',
  'potem',
  'w',
  'i',
]);

const CHARACTER_ALIASES = new Map([
  ['karola', 'karol'],
  ['karolowi', 'karol'],
  ['karolu', 'karol'],
  ['mame', 'mama'],
  ['mamie', 'mama'],
  ['mam', 'mama'],
  ['tate', 'tata'],
  ['taty', 'tata'],
  ['tacie', 'tata'],
  ['babcie', 'babcia'],
  ['babci', 'babcia'],
  ['babcia', 'babcia'],
  ['dziadka', 'dziadek'],
  ['dziadku', 'dziadek'],
  ['dziadkowi', 'dziadek'],
  ['lore', 'lora'],
]);

const CHARACTER_HINTS = new Map([
  ['karol', 'young boy'],
  ['karolcia', 'young girl'],
  ['mama', 'adult mother'],
  ['tata', 'adult father'],
  ['lora', 'friendly dog'],
  ['babcia', 'elderly grandmother'],
  ['dziadek', 'elderly grandfather'],
]);

const PAGE_REGEX =
  /(\{\s*\n\s*sentences:\s*\[[\s\S]*?\],\s*\n)(\s*image:\s*require\('(\.\/[^']+)'\),\s*\n)?(\s*\},)/g;
const SENTENCE_STRING_REGEX = /'([^']+)'/g;
const WORD_REGEX = /\p{L}+/gu;

function parseArgs(argv) {
  const options = {
    dryRun: false,
    force: false,
    books: [],
    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
    size: process.env.OPENAI_IMAGE_SIZE || '1024x1024',
    maxPages: Number.POSITIVE_INFINITY,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (arg === '--force') {
      options.force = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }
    if (arg === '--book' && argv[i + 1]) {
      options.books.push(
        ...argv[i + 1]
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      );
      i += 1;
      continue;
    }
    if (arg.startsWith('--book=')) {
      options.books.push(
        ...arg
          .slice('--book='.length)
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      );
      continue;
    }
    if (arg === '--model' && argv[i + 1]) {
      options.model = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith('--model=')) {
      options.model = arg.slice('--model='.length);
      continue;
    }
    if (arg === '--size' && argv[i + 1]) {
      options.size = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith('--size=')) {
      options.size = arg.slice('--size='.length);
      continue;
    }
    if (arg === '--max-pages' && argv[i + 1]) {
      options.maxPages = Number.parseInt(argv[i + 1], 10);
      i += 1;
      continue;
    }
    if (arg.startsWith('--max-pages=')) {
      options.maxPages = Number.parseInt(arg.slice('--max-pages='.length), 10);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isFinite(options.maxPages) || options.maxPages < 1) {
    options.maxPages = Number.POSITIVE_INFINITY;
  }

  options.books = [...new Set(options.books)];

  return options;
}

function printUsage() {
  console.log(`Usage: node scripts/generate-book-images.js [options]

Options:
  --dry-run               Show plan without writing files
  --force                 Regenerate pages that already have images
  --book <slug[,slug]>    Process only selected book folders
  --model <name>          Image model (default: gpt-image-1)
  --size <WxH>            Output size (default: 1024x1024)
  --max-pages <n>         Generate at most n pages in this run
  --help, -h              Show this help

Environment:
  OPENAI_API_KEY          Required for image generation
                           (also read from .env.local or .env)
  OPENAI_IMAGE_MODEL      Optional default model override
  OPENAI_IMAGE_SIZE       Optional default size override`);
}

function readValueFromDotEnv(envKey) {
  const envFiles = [path.join(ROOT, '.env.local'), path.join(ROOT, '.env')];

  for (const filePath of envFiles) {
    if (!fsSync.existsSync(filePath)) {
      continue;
    }

    const lines = fsSync.readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separator = trimmed.indexOf('=');
      if (separator < 0) {
        continue;
      }

      const key = trimmed.slice(0, separator).trim();
      if (key !== envKey) {
        continue;
      }

      const rawValue = trimmed.slice(separator + 1).trim();
      if (!rawValue) {
        return '';
      }

      if (
        (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
        (rawValue.startsWith("'") && rawValue.endsWith("'"))
      ) {
        return rawValue.slice(1, -1);
      }

      return rawValue;
    }
  }

  return '';
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeText(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function toSlug(text) {
  return normalizeText(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function toDisplayName(characterKey) {
  const raw = characterKey
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
  return raw || characterKey;
}

function normalizeCharacterToken(token) {
  const normalized = toSlug(token);
  if (!normalized) {
    return '';
  }

  return CHARACTER_ALIASES.get(normalized) || normalized;
}

function shouldTreatAsCharacter(token, normalizedToken, knownCharacterKeys) {
  if (!normalizedToken || STOPWORDS.has(normalizedToken)) {
    return false;
  }

  if (knownCharacterKeys.has(normalizedToken) || FAMILY_CHARACTER_KEYS.has(normalizedToken)) {
    return true;
  }

  const first = token[0] || '';
  const isUppercaseToken = first !== first.toLowerCase();

  if (!isUppercaseToken) {
    return false;
  }

  return normalizedToken.length >= 3 && !STOPWORDS.has(normalizedToken);
}

function extractSentencesFromPageBlock(pagePrefix) {
  const sentences = [];
  const matcher = pagePrefix.matchAll(SENTENCE_STRING_REGEX);
  for (const match of matcher) {
    sentences.push(match[1]);
  }
  return sentences;
}

function extractCharactersFromSentences(sentences, knownCharacterKeys) {
  const detected = new Set();

  for (const sentence of sentences) {
    const words = sentence.match(WORD_REGEX) || [];

    for (const token of words) {
      const normalizedToken = normalizeCharacterToken(token);
      if (shouldTreatAsCharacter(token, normalizedToken, knownCharacterKeys)) {
        detected.add(normalizedToken);
      }
    }
  }

  return [...detected];
}

function isCharacterFileName(baseName) {
  return /[A-Za-z]/.test(baseName);
}

function getMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.jpg' || extension === '.jpeg') {
    return 'image/jpeg';
  }
  if (extension === '.webp') {
    return 'image/webp';
  }
  return 'image/png';
}

function preferredStyleReferencePaths(referenceMap) {
  const preferred = ['karol', 'karolcia', 'mama', 'tata', 'lora'];
  const paths = [];

  for (const key of preferred) {
    const reference = referenceMap.get(key);
    if (reference) {
      paths.push(reference.filePath);
    }
  }

  if (paths.length >= 3) {
    return paths;
  }

  for (const reference of referenceMap.values()) {
    if (paths.length >= 5) {
      break;
    }
    if (!paths.includes(reference.filePath)) {
      paths.push(reference.filePath);
    }
  }

  return paths;
}

function characterPrompt(characterKey) {
  const display = toDisplayName(characterKey);
  const hint = CHARACTER_HINTS.get(characterKey);

  return [
    'Create a clean character reference illustration for a Polish children book.',
    `Character name: ${display}.`,
    hint ? `Character type: ${hint}.` : 'Character type: kid-friendly story character.',
    'Show one full-body character in a neutral standing pose.',
    'Keep style consistent with provided references.',
    'Use simple readable shapes for very young children.',
    'Render as monochrome coloring-page style line art.',
    'Strictly black and white only: black lines on white background.',
    'No colors and no gray tones.',
    'No text anywhere: no letters, numbers, logos, captions, signage, or watermark.',
  ].join(' ');
}

function pagePrompt(bookTitle, pageSentences, characters) {
  const pageText = pageSentences.join(' ');
  const characterLine = characters.length
    ? `Characters in scene: ${characters.map(toDisplayName).join(', ')}. Keep their appearance consistent with references.`
    : 'No specific named character is required, but keep the same visual style as references.';

  return [
    'Create one illustrated page for a Polish children reading book.',
    `Book title: ${bookTitle}.`,
    `Scene text: "${pageText}".`,
    characterLine,
    'Friendly child-safe coloring-page style with clean outlines.',
    'Simple composition, easy to understand for a child.',
    'Strictly black and white only: black lines on white background.',
    'No colors and no gray tones.',
    'No text anywhere: no letters, numbers, speech bubbles, signs, logos, or watermark.',
  ].join(' ');
}

function resolveTargetImageName(bookSlug, pageIndex) {
  return `${bookSlug}-page-${String(pageIndex + 1).padStart(2, '0')}.png`;
}

function collectPageReferences(pageCharacters, referenceMap, stylePaths) {
  const paths = [];

  for (const characterKey of pageCharacters) {
    const reference = referenceMap.get(characterKey);
    if (reference?.filePath && !paths.includes(reference.filePath)) {
      paths.push(reference.filePath);
    }
  }

  for (const stylePath of stylePaths) {
    if (paths.length >= 6) {
      break;
    }
    if (!paths.includes(stylePath)) {
      paths.push(stylePath);
    }
  }

  return paths;
}

async function withRetry(task, label, retries = 3) {
  let lastError;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const result = await task(attempt);
      return result;
    } catch (error) {
      lastError = error;
      const isLast = attempt === retries - 1;
      if (isLast) {
        throw error;
      }

      const delayMs = 1_000 * 2 ** attempt;
      console.warn(`${label} failed (attempt ${attempt + 1}/${retries}), retrying in ${delayMs}ms`);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

async function parseErrorBody(response) {
  const text = await response.text();
  if (!text) {
    return `HTTP ${response.status}`;
  }

  try {
    const parsed = JSON.parse(text);
    const message = parsed?.error?.message || parsed?.message;
    if (message) {
      return `HTTP ${response.status}: ${message}`;
    }
  } catch {
    // Ignore parse failures and return raw body.
  }

  return `HTTP ${response.status}: ${text}`;
}

async function extractImageBufferFromResponsePayload(payload) {
  const first = payload?.data?.[0];
  if (!first) {
    throw new Error('Image API response did not include data[0].');
  }

  if (first.b64_json) {
    return Buffer.from(first.b64_json, 'base64');
  }

  if (first.url) {
    const remote = await fetch(first.url);
    if (!remote.ok) {
      throw new Error(`Failed to download generated image from URL: HTTP ${remote.status}`);
    }
    const bytes = await remote.arrayBuffer();
    return Buffer.from(bytes);
  }

  throw new Error('Image API response is missing both b64_json and url.');
}

async function buildFormDataWithReferences(prompt, model, size, referencePaths) {
  const form = new FormData();
  form.append('model', model);
  form.append('prompt', prompt);
  form.append('size', size);

  for (const referencePath of referencePaths) {
    const bytes = await fs.readFile(referencePath);
    const blob = new Blob([bytes], { type: getMimeType(referencePath) });
    form.append('image[]', blob, path.basename(referencePath));
  }

  return form;
}

async function requestEditedImage(apiKey, prompt, model, size, referencePaths) {
  return withRetry(async () => {
    const form = await buildFormDataWithReferences(prompt, model, size, referencePaths);
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });

    if (!response.ok) {
      const message = await parseErrorBody(response);
      throw new Error(message);
    }

    const payload = await response.json();
    return extractImageBufferFromResponsePayload(payload);
  }, 'Image edit request');
}

async function requestGeneratedImage(apiKey, prompt, model, size) {
  return withRetry(async () => {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        size,
      }),
    });

    if (!response.ok) {
      const message = await parseErrorBody(response);
      throw new Error(message);
    }

    const payload = await response.json();
    return extractImageBufferFromResponsePayload(payload);
  }, 'Image generation request');
}

async function generateImageBuffer({ apiKey, prompt, model, size, referencePaths }) {
  if (referencePaths.length > 0) {
    return requestEditedImage(apiKey, prompt, model, size, referencePaths);
  }

  return requestGeneratedImage(apiKey, prompt, model, size);
}

async function readBooks(targetBooks) {
  const entries = await fs.readdir(BOOKS_DIR, { withFileTypes: true });
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const targetSet = targetBooks.length ? new Set(targetBooks) : null;
  const missingTargets = targetSet ? targetBooks.filter((slug) => !directories.includes(slug)) : [];
  if (missingTargets.length > 0) {
    throw new Error(`Unknown book folder(s): ${missingTargets.join(', ')}`);
  }

  const selected = targetSet ? directories.filter((slug) => targetSet.has(slug)) : directories;
  const books = [];

  for (const slug of selected) {
    const directory = path.join(BOOKS_DIR, slug);
    const contentPath = path.join(directory, 'content.ts');
    if (!fsSync.existsSync(contentPath)) {
      continue;
    }

    const rawContent = await fs.readFile(contentPath, 'utf8');
    const titleMatch = rawContent.match(/title:\s*'([^']+)'/);
    const title = titleMatch?.[1] || slug;

    PAGE_REGEX.lastIndex = 0;
    const pages = [];

    let match = PAGE_REGEX.exec(rawContent);
    while (match !== null) {
      const pagePrefix = match[1];
      const existingImagePath = match[3] || null;
      const sentences = extractSentencesFromPageBlock(pagePrefix);
      pages.push({
        index: pages.length,
        sentences,
        existingImagePath,
        finalImagePath: existingImagePath,
        characters: [],
      });
      match = PAGE_REGEX.exec(rawContent);
    }

    books.push({
      slug,
      title,
      directory,
      contentPath,
      rawContent,
      pages,
    });
  }

  return books;
}

async function readCharacterReferences() {
  await fs.mkdir(PROMPTS_IMAGES_DIR, { recursive: true });
  const entries = await fs.readdir(PROMPTS_IMAGES_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();

  const references = new Map();

  for (const fileName of files) {
    const extension = path.extname(fileName).toLowerCase();
    if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
      continue;
    }

    const baseName = path.basename(fileName, extension);
    if (!isCharacterFileName(baseName)) {
      continue;
    }

    const key = normalizeCharacterToken(baseName);
    if (!key) {
      continue;
    }

    if (!references.has(key)) {
      references.set(key, {
        key,
        displayName: toDisplayName(key),
        filePath: path.join(PROMPTS_IMAGES_DIR, fileName),
      });
    }
  }

  return references;
}

function upsertImagesInContent(rawContent, pages) {
  let cursor = 0;
  PAGE_REGEX.lastIndex = 0;

  const updated = rawContent.replace(
    PAGE_REGEX,
    (fullMatch, pagePrefix, imageLine, existingPath, pageSuffix) => {
      const page = pages[cursor];
      cursor += 1;

      if (!page?.finalImagePath) {
        return fullMatch;
      }

      if (imageLine && existingPath === page.finalImagePath) {
        return fullMatch;
      }

      const nextImageLine = `        image: require('${page.finalImagePath}'),\n`;
      return `${pagePrefix}${nextImageLine}${pageSuffix}`;
    }
  );

  if (cursor !== pages.length) {
    throw new Error('Could not update content.ts because page parsing count changed unexpectedly.');
  }

  return updated;
}

function summarizePlan(books, characterReferences, missingCharacters, pageTasks) {
  const totalPages = books.reduce((count, book) => count + book.pages.length, 0);
  const pagesWithImages = books.reduce(
    (count, book) => count + book.pages.filter((page) => page.existingImagePath).length,
    0
  );

  console.log('');
  console.log('Plan summary');
  console.log(`- Books: ${books.length}`);
  console.log(`- Pages: ${totalPages}`);
  console.log(`- Pages currently with image require: ${pagesWithImages}`);
  console.log(`- Character references found: ${characterReferences.size}`);
  console.log(`- New character references to create: ${missingCharacters.length}`);
  console.log(`- Page images to generate: ${pageTasks.length}`);
  console.log('');
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const books = await readBooks(options.books);
  const characterReferences = await readCharacterReferences();

  const knownCharacterKeys = new Set(characterReferences.keys());

  for (const book of books) {
    for (const page of book.pages) {
      page.characters = extractCharactersFromSentences(page.sentences, knownCharacterKeys);
    }
  }

  const discoveredCharacters = new Set();
  for (const book of books) {
    for (const page of book.pages) {
      for (const character of page.characters) {
        discoveredCharacters.add(character);
      }
    }
  }

  const missingCharacters = [...discoveredCharacters].filter(
    (character) => !characterReferences.has(character)
  );
  const styleReferencePaths = preferredStyleReferencePaths(characterReferences);

  const pageTasks = [];
  for (const book of books) {
    for (const page of book.pages) {
      if (page.existingImagePath && !options.force) {
        page.finalImagePath = page.existingImagePath;
        continue;
      }

      const targetRelativePath =
        page.existingImagePath || `./${resolveTargetImageName(book.slug, page.index)}`;
      const targetAbsolutePath = path.join(book.directory, targetRelativePath.replace('./', ''));
      page.finalImagePath = targetRelativePath;

      if (!options.force && fsSync.existsSync(targetAbsolutePath)) {
        continue;
      }

      pageTasks.push({
        bookSlug: book.slug,
        bookTitle: book.title,
        pageIndex: page.index,
        sentences: page.sentences,
        characters: page.characters,
        outputPath: targetAbsolutePath,
      });
    }
  }

  summarizePlan(books, characterReferences, missingCharacters, pageTasks);

  if (options.dryRun) {
    for (const character of missingCharacters) {
      console.log(
        `[dry-run] missing character ref: ${character} -> prompts/images/${character}.png`
      );
    }

    for (const task of pageTasks.slice(0, 20)) {
      const shortText = task.sentences.join(' ').slice(0, 120);
      console.log(
        `[dry-run] page image: ${task.bookSlug}#${task.pageIndex + 1} -> ${path.relative(ROOT, task.outputPath)} | "${shortText}"`
      );
    }

    if (pageTasks.length > 20) {
      console.log(`[dry-run] ... and ${pageTasks.length - 20} more pages`);
    }

    return;
  }

  const apiKey = process.env.OPENAI_API_KEY || readValueFromDotEnv('OPENAI_API_KEY');
  const needsApi = missingCharacters.length > 0 || pageTasks.length > 0;

  if (needsApi && !apiKey) {
    throw new Error(
      'OPENAI_API_KEY is missing. Set OPENAI_API_KEY and re-run this script (or use --dry-run to inspect the plan).'
    );
  }

  for (const character of missingCharacters) {
    const outputPath = path.join(PROMPTS_IMAGES_DIR, `${character}.png`);
    console.log(`Generating character reference: ${character}`);

    const prompt = characterPrompt(character);
    const referencePaths = preferredStyleReferencePaths(characterReferences);
    const imageBuffer = await generateImageBuffer({
      apiKey,
      prompt,
      model: options.model,
      size: options.size,
      referencePaths,
    });

    await fs.writeFile(outputPath, imageBuffer);
    characterReferences.set(character, {
      key: character,
      displayName: toDisplayName(character),
      filePath: outputPath,
    });
  }

  const limitedTasks = pageTasks.slice(0, options.maxPages);
  for (let i = 0; i < limitedTasks.length; i += 1) {
    const task = limitedTasks[i];
    console.log(
      `Generating page image (${i + 1}/${limitedTasks.length}): ${task.bookSlug}#${task.pageIndex + 1}`
    );

    const prompt = pagePrompt(task.bookTitle, task.sentences, task.characters);
    const referencePaths = collectPageReferences(
      task.characters,
      characterReferences,
      styleReferencePaths
    );
    const imageBuffer = await generateImageBuffer({
      apiKey,
      prompt,
      model: options.model,
      size: options.size,
      referencePaths,
    });

    await fs.writeFile(task.outputPath, imageBuffer);
  }

  if (limitedTasks.length < pageTasks.length) {
    console.warn(`Stopped after ${limitedTasks.length} pages because --max-pages was set.`);
    console.warn(
      'Skipping content.ts updates to avoid adding image requires for pages that were not generated yet.'
    );
    return;
  }

  for (const book of books) {
    const updatedContent = upsertImagesInContent(book.rawContent, book.pages);
    if (updatedContent !== book.rawContent) {
      await fs.writeFile(book.contentPath, updatedContent, 'utf8');
      console.log(`Updated: ${path.relative(ROOT, book.contentPath)}`);
    }
  }

  console.log('Done.');
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
