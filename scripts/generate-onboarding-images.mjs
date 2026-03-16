#!/usr/bin/env node

/**
 * Generate onboarding illustrations using OpenAI GPT Image (gpt-image-1) API.
 *
 * Prerequisites:
 *   export OPENAI_API_KEY="sk-..."
 *
 * Usage:
 *   node scripts/generate-onboarding-images.mjs
 *
 * This will create 4 images in assets/images/onboarding/
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '../assets/images/onboarding');

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set.');
  process.exit(1);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const STYLE_SUFFIX =
  "Style: flat vector illustration, soft pastel colors using greens (#2f8653, #eef6e7), cream (#fffdf5), and soft earth tones. No text, no words, no letters, no numbers anywhere in the image. Clean, modern children's app illustration style. Warm and inviting.";

const images = [
  {
    filename: 'step1.png',
    prompt: `A cheerful, warm illustration of a parent and young child sitting together in a cozy forest clearing, surrounded by soft green trees and gentle golden sunlight filtering through leaves. The scene conveys the joy of learning together. The parent lovingly holds the child on their lap. Soft rounded shapes, friendly and approachable. ${STYLE_SUFFIX}`,
  },
  {
    filename: 'step2.png',
    prompt: `A warm illustration of a young child happily looking at large colorful word flash cards held by a caring parent, in a forest-themed setting with trees and leaves in the background. Flash cards with simple colorful shapes visible. The child is excited and engaged, reaching toward the cards. ${STYLE_SUFFIX}`,
  },
  {
    filename: 'step3.png',
    prompt: `A warm illustration of a curious toddler discovering colorful dots and circles arranged in playful patterns, set in a nature environment with soft green background and trees. The dots are scattered playfully like forest berries in reds, oranges, and yellows. The child looks delighted and curious. ${STYLE_SUFFIX}`,
  },
  {
    filename: 'step4.png',
    prompt: `A warm illustration of a wide-eyed young child looking through a magical glowing window or portal at various nature scenes including animals like deer, birds, and butterflies, plus plants, flowers, and stars. Set in a forest theme with green trees framing the scene. The child is amazed and full of wonder. ${STYLE_SUFFIX}`,
  },
];

function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'gpt-image-1.5',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'high',
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(json.error.message));
            return;
          }
          // gpt-image-1 returns b64_json by default
          const b64 = json.data[0].b64_json;
          if (b64) {
            resolve({ type: 'base64', data: b64 });
            return;
          }
          // fallback to url if present
          const url = json.data[0].url;
          if (url) {
            resolve({ type: 'url', data: url });
            return;
          }
          reject(new Error(`Unexpected response format: ${data.slice(0, 500)}`));
        } catch (_e) {
          reject(new Error(`Failed to parse response: ${data.slice(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          https
            .get(response.headers.location, (res2) => {
              res2.pipe(file);
              file.on('finish', () => file.close(resolve));
            })
            .on('error', reject);
          return;
        }
        response.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('Generating 4 onboarding illustrations with gpt-image-1...\n');

  for (let i = 0; i < images.length; i++) {
    const { filename, prompt } = images[i];
    const outputPath = path.join(OUTPUT_DIR, filename);

    console.log(`[${i + 1}/4] Generating ${filename}...`);
    try {
      const result = await generateImage(prompt);
      if (result.type === 'base64') {
        fs.writeFileSync(outputPath, Buffer.from(result.data, 'base64'));
        console.log(`  -> Saved to ${outputPath}`);
      } else {
        console.log('  -> Got URL, downloading...');
        await downloadImage(result.data, outputPath);
        console.log(`  -> Saved to ${outputPath}`);
      }
    } catch (err) {
      console.error(`  -> ERROR: ${err.message}`);
      process.exit(1);
    }
  }

  console.log('\nAll 4 onboarding images generated successfully!');
}

main();
