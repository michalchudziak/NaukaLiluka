#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets', 'images');

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5';
const IMAGE_SIZE = process.env.OPENAI_IMAGE_SIZE || '1024x1024';
const IMAGE_QUALITY = process.env.IMAGE_QUALITY || 'high';

const THEME = {
  background: '#eef6e7',
  backgroundAlt: '#e2efd7',
  primary: '#2f8653',
  primaryStrong: '#205f3b',
  card: '#fffdf5',
  accent: '#f8f6df',
  warning: '#e7b95a',
};

const assetsToGenerate = [
  {
    fileName: 'app-icon.png',
    prompt: [
      'Design a premium, child-friendly mobile app icon for a reading-learning app.',
      'Square composition suitable for iOS and Android launcher icon.',
      `Use only this fixed palette and close tints/shades: ${THEME.background}, ${THEME.backgroundAlt}, ${THEME.primary}, ${THEME.primaryStrong}, ${THEME.card}, ${THEME.accent}, ${THEME.warning}.`,
      `Background should be a light tone matching ${THEME.background}.`,
      'Main motif: open storybook shaped like a gentle forest camp scene, with simple leaves and small glow dots.',
      'Flat modern vector illustration, soft depth, clean edges, high contrast, minimal clutter.',
      'No text, no letters, no numbers, no watermark, no logo marks.',
    ].join(' '),
    extraParams: {},
  },
  {
    fileName: 'splash-icon.png',
    prompt: [
      'Create a centered splash emblem for a children reading app as a standalone symbol.',
      'The output must be a PNG with transparent background and absolutely no background panel.',
      'Only the central emblem should be visible, with large transparent margins around it.',
      `Keep the exact same palette: ${THEME.background}, ${THEME.backgroundAlt}, ${THEME.primary}, ${THEME.primaryStrong}, ${THEME.card}, ${THEME.accent}, ${THEME.warning}.`,
      'Main motif: open storybook with subtle forest leaves and three tiny glow dots above it.',
      'Flat modern vector illustration, friendly, clean, calm, no glow effects outside the emblem.',
      'No text, no letters, no numbers, no watermark.',
    ].join(' '),
    extraParams: {
      background: 'transparent',
    },
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function openAiPost(pathname, body, maxRetries = 5) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable.');
  }

  const url = `${OPENAI_BASE_URL}${pathname}`;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const raw = await response.text();
    let parsed = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch (_error) {
      // Keep raw for error path.
    }

    if (response.ok && parsed) {
      return parsed;
    }

    const retryableStatus = new Set([408, 409, 429, 500, 502, 503, 504]);
    const shouldRetry = retryableStatus.has(response.status) && attempt < maxRetries;
    const message =
      parsed?.error?.message ||
      (raw ? raw.slice(0, 350) : `HTTP ${response.status} with empty response body`);

    if (!shouldRetry) {
      throw new Error(`OpenAI API error on ${pathname}: HTTP ${response.status} - ${message}`);
    }

    const backoffMs = 1500 * 2 ** attempt + Math.floor(Math.random() * 500);
    console.log(
      `[retry ${attempt + 1}/${maxRetries}] ${pathname}: ${message}. Waiting ${backoffMs}ms...`
    );
    await sleep(backoffMs);
  }

  throw new Error(`Unexpected retry exhaustion for ${pathname}.`);
}

async function responseToBuffer(response) {
  const first = response?.data?.[0];
  if (!first) {
    throw new Error('Image API response has no data entries.');
  }

  if (first.b64_json) {
    return Buffer.from(first.b64_json, 'base64');
  }

  if (first.url) {
    const imageResponse = await fetch(first.url);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download generated image from URL. HTTP ${imageResponse.status}`);
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error('Image API response is missing both b64_json and url.');
}

async function generateOneAsset(asset) {
  const outputPath = path.join(ASSETS_DIR, asset.fileName);
  const imageResponse = await openAiPost('/images/generations', {
    model: IMAGE_MODEL,
    prompt: asset.prompt,
    size: IMAGE_SIZE,
    quality: IMAGE_QUALITY,
    ...(asset.extraParams || {}),
  });

  const imageBuffer = await responseToBuffer(imageResponse);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, imageBuffer);
  console.log(`Generated ${path.relative(ROOT_DIR, outputPath)}`);
}

async function main() {
  console.log(
    `Generating brand assets with model=${IMAGE_MODEL}, size=${IMAGE_SIZE}, quality=${IMAGE_QUALITY}`
  );

  for (const asset of assetsToGenerate) {
    await generateOneAsset(asset);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
