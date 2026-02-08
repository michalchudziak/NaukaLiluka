#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-5-mini';
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5';
const IMAGE_QUALITY = process.env.IMAGE_QUALITY || 'low';
const IMAGE_SIZE = '1024x1024';
const IMAGE_CONCURRENCY = Number(process.env.IMAGE_CONCURRENCY || 1);
const MIN_IMAGE_INTERVAL_MS = Number(process.env.MIN_IMAGE_INTERVAL_MS || 13000);
const FORCE_REGENERATE = process.env.FORCE_REGENERATE === '1';
const INCLUDE_LEGACY_IMAGES = process.env.INCLUDE_LEGACY_IMAGES !== '0';
const FACTS_PER_ITEM = 5;

const ROOT_DIR = path.resolve(__dirname, '..');
const DRAWINGS_DIR = path.join(ROOT_DIR, 'content', 'drawings');
const DRAWINGS_INDEX_PATH = path.join(DRAWINGS_DIR, 'index.ts');
const GENERATED_FILE_PATH = path.join(DRAWINGS_DIR, 'generated-sets.ts');

let lastImageRequestAt = 0;

const sets = [
  {
    folder: 'vehicles-land',
    title: 'Pojazdy lądowe',
    items: [
      { slug: 'car', description: 'Samochód', prompt: 'compact family car, side view' },
      { slug: 'bus', description: 'Autobus', prompt: 'city bus with large windows, side view' },
      { slug: 'train', description: 'Pociąg', prompt: 'modern passenger train with several wagons' },
      { slug: 'tram', description: 'Tramwaj', prompt: 'city tram, side view' },
      { slug: 'bicycle', description: 'Rower', prompt: 'children bicycle with visible frame and wheels' },
      { slug: 'motorcycle', description: 'Motocykl', prompt: 'street motorcycle, side view' },
      { slug: 'tractor', description: 'Traktor', prompt: 'farm tractor with large rear wheels' },
      { slug: 'fire-truck', description: 'Wóz strażacki', prompt: 'fire truck with ladder, side view' },
    ],
  },
  {
    folder: 'vehicles-air-water',
    title: 'Pojazdy powietrzne i wodne',
    items: [
      { slug: 'airplane', description: 'Samolot', prompt: 'passenger airplane in flight, side view' },
      { slug: 'helicopter', description: 'Helikopter', prompt: 'rescue helicopter with visible rotor' },
      { slug: 'sailboat', description: 'Żaglówka', prompt: 'small sailboat with white sail on calm water' },
      { slug: 'ship', description: 'Statek', prompt: 'large cargo ship on sea, side view' },
      { slug: 'submarine', description: 'Okręt podwodny', prompt: 'yellow submarine with periscope, side view' },
      { slug: 'hot-air-balloon', description: 'Balon', prompt: 'colorful hot-air balloon with basket' },
      { slug: 'rocket', description: 'Rakieta', prompt: 'space rocket launching with small smoke clouds' },
      { slug: 'kayak', description: 'Kajak', prompt: 'kayak with paddle on river water, side view' },
    ],
  },
  {
    folder: 'vegetables2',
    title: 'Warzywa',
    items: [
      { slug: 'carrot', description: 'Marchewka', prompt: 'fresh orange carrot with green leaves' },
      { slug: 'cucumber', description: 'Ogórek', prompt: 'green cucumber' },
      { slug: 'tomato', description: 'Pomidor', prompt: 'ripe red tomato with green stem' },
      { slug: 'potato', description: 'Ziemniak', prompt: 'potato tuber with simple natural shape' },
      { slug: 'broccoli', description: 'Brokuł', prompt: 'broccoli head with green florets and stem' },
      { slug: 'pepper', description: 'Papryka', prompt: 'red bell pepper with stem' },
      { slug: 'onion', description: 'Cebula', prompt: 'golden onion with simple dry peel' },
      { slug: 'pumpkin', description: 'Dynia', prompt: 'orange pumpkin with short stem' },
    ],
  },
  {
    folder: 'birds',
    title: 'Ptaki',
    items: [
      { slug: 'eagle', description: 'Orzeł', prompt: 'eagle standing, side view' },
      { slug: 'owl', description: 'Sowa', prompt: 'owl on branch with large eyes' },
      { slug: 'sparrow', description: 'Wróbel', prompt: 'small sparrow perched on branch' },
      { slug: 'stork', description: 'Bocian', prompt: 'white stork with long red beak and legs' },
      { slug: 'duck', description: 'Kaczka', prompt: 'duck on calm water, side view' },
      { slug: 'swan', description: 'Łabędź', prompt: 'white swan on calm lake water' },
      { slug: 'penguin', description: 'Pingwin', prompt: 'penguin standing on ice' },
      { slug: 'woodpecker', description: 'Dzięcioł', prompt: 'woodpecker on tree trunk, side view' },
    ],
  },
  {
    folder: 'instruments',
    title: 'Instrumenty muzyczne',
    items: [
      { slug: 'piano', description: 'Fortepian', prompt: 'grand piano with visible keyboard' },
      { slug: 'guitar', description: 'Gitara', prompt: 'acoustic guitar, front view' },
      { slug: 'violin', description: 'Skrzypce', prompt: 'violin with bow placed next to it' },
      { slug: 'drums', description: 'Perkusja', prompt: 'drum set with cymbals' },
      { slug: 'flute', description: 'Flet', prompt: 'silver concert flute, side view' },
      { slug: 'trumpet', description: 'Trąbka', prompt: 'brass trumpet, side view' },
      { slug: 'saxophone', description: 'Saksofon', prompt: 'golden alto saxophone, front view' },
      { slug: 'accordion', description: 'Akordeon', prompt: 'accordion with bellows' },
    ],
  },
  {
    folder: 'jobs',
    title: 'Zawody',
    items: [
      { slug: 'doctor', description: 'Lekarz', prompt: 'friendly doctor in white coat with stethoscope' },
      { slug: 'firefighter', description: 'Strażak', prompt: 'firefighter in helmet and protective uniform' },
      { slug: 'teacher', description: 'Nauczyciel', prompt: 'teacher pointing at school board' },
      { slug: 'police-officer', description: 'Policjant', prompt: 'police officer in uniform with cap' },
      { slug: 'chef', description: 'Kucharz', prompt: 'chef with white hat holding spoon' },
      { slug: 'pilot', description: 'Pilot', prompt: 'airplane pilot in uniform' },
      { slug: 'farmer', description: 'Rolnik', prompt: 'farmer with straw hat and basket of vegetables' },
      { slug: 'astronaut', description: 'Astronauta', prompt: 'astronaut in white spacesuit with helmet' },
    ],
  },
  {
    folder: 'dinosaurs',
    title: 'Dinozaury',
    items: [
      { slug: 'tyrannosaurus', description: 'Tyranozaur', prompt: 'tyrannosaurus dinosaur standing, side view' },
      { slug: 'triceratops', description: 'Triceratops', prompt: 'triceratops dinosaur with three horns' },
      { slug: 'stegosaurus', description: 'Stegozaur', prompt: 'stegosaurus dinosaur with plates on back' },
      { slug: 'brachiosaurus', description: 'Brachiozaur', prompt: 'brachiosaurus dinosaur with long neck' },
      { slug: 'velociraptor', description: 'Welociraptor', prompt: 'velociraptor dinosaur running, side view' },
      { slug: 'ankylosaurus', description: 'Ankylozaur', prompt: 'ankylosaurus dinosaur with armored back and tail club' },
      { slug: 'diplodocus', description: 'Diplodok', prompt: 'diplodocus dinosaur with very long tail' },
      { slug: 'spinosaurus', description: 'Spinozaur', prompt: 'spinosaurus dinosaur with sail on back' },
    ],
  },
  {
    folder: 'sports',
    title: 'Sporty',
    items: [
      { slug: 'football', description: 'Piłka nożna', prompt: 'child kicking soccer ball' },
      { slug: 'basketball', description: 'Koszykówka', prompt: 'basketball ball and hoop on court' },
      { slug: 'tennis', description: 'Tenis', prompt: 'tennis racket and tennis ball on court' },
      { slug: 'volleyball', description: 'Siatkówka', prompt: 'volleyball ball above net' },
      { slug: 'swimming', description: 'Pływanie', prompt: 'swimming goggles and swim cap near pool lane' },
      { slug: 'skiing', description: 'Narciarstwo', prompt: 'skis and poles on snowy slope' },
      { slug: 'gymnastics', description: 'Gimnastyka', prompt: 'gymnastics ribbon and balance beam equipment' },
      { slug: 'athletics', description: 'Lekkoatletyka', prompt: 'running shoes on track lane with finish line' },
    ],
  },
  {
    folder: 'sea-animals',
    title: 'Zwierzęta morskie',
    items: [
      { slug: 'dolphin', description: 'Delfin', prompt: 'dolphin jumping above sea water' },
      { slug: 'whale', description: 'Wieloryb', prompt: 'blue whale swimming in ocean' },
      { slug: 'shark', description: 'Rekin', prompt: 'shark swimming underwater, side view' },
      { slug: 'octopus', description: 'Ośmiornica', prompt: 'octopus with spread tentacles underwater' },
      { slug: 'sea-turtle', description: 'Żółw morski', prompt: 'sea turtle swimming above coral reef' },
      { slug: 'seahorse', description: 'Konik morski', prompt: 'seahorse near sea plants' },
      { slug: 'jellyfish', description: 'Meduza', prompt: 'translucent jellyfish underwater' },
      { slug: 'crab', description: 'Krab', prompt: 'red crab on sandy seabed' },
    ],
  },
  {
    folder: 'space2',
    title: 'Kosmos',
    items: [
      { slug: 'sun', description: 'Słońce', prompt: 'Sun as bright yellow star with rays' },
      { slug: 'moon', description: 'Księżyc', prompt: 'Moon with visible craters on dark sky' },
      { slug: 'earth', description: 'Ziemia', prompt: 'planet Earth seen from space with continents and clouds' },
      { slug: 'mars', description: 'Mars', prompt: 'planet Mars in red colors with visible details' },
      { slug: 'jupiter', description: 'Jowisz', prompt: 'planet Jupiter with cloud bands' },
      { slug: 'saturn', description: 'Saturn', prompt: 'planet Saturn with large rings' },
      { slug: 'comet', description: 'Kometa', prompt: 'comet with long glowing tail in space' },
      { slug: 'space-station', description: 'Stacja kosmiczna', prompt: 'orbital space station with solar panels above Earth' },
    ],
  },
];

const animalLabels = {
  boar: 'wild boar',
  bull: 'bull',
  fox: 'red fox',
  monkey: 'monkey',
  mouse: 'mouse',
  rhino: 'rhinoceros',
  badger: 'badger',
  frog: 'frog',
  hare: 'hare',
  horse: 'horse',
  polecat: 'ferret',
  wolf: 'wolf',
};

const fruitLabels = {
  apple: 'apple',
  banana: 'banana',
  cherry: 'cherry',
  grape: 'grapes',
  lemon: 'lemon',
  orange: 'orange',
  pear: 'pear',
  pineapple: 'pineapple',
  strawberry: 'strawberry',
  watermelon: 'watermelon',
};

const flagLabels = {
  poland: 'Poland',
  germany: 'Germany',
  france: 'France',
  spain: 'Spain',
  italy: 'Italy',
  portugal: 'Portugal',
  sweden: 'Sweden',
  norway: 'Norway',
  finland: 'Finland',
  denmark: 'Denmark',
  czechia: 'Czech Republic',
  slovakia: 'Slovakia',
  hungary: 'Hungary',
  romania: 'Romania',
  bulgaria: 'Bulgaria',
  greece: 'Greece',
  croatia: 'Croatia',
  slovenia: 'Slovenia',
  lithuana: 'Lithuania',
  lativa: 'Latvia',
};

const sharedImageStylePrompt = [
  'Children educational flashcard illustration.',
  'Flat 2D vector style only.',
  'Solid colors, clean sharp outlines, minimal detail.',
  'No gradients, no texture, no realistic lighting, no shadows.',
  'Single clear centered subject, white background.',
  'No text, no letters, no numbers, no logo, no watermark.',
].join(' ');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeTsString(value) {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function extractJsonObject(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Nie znaleziono obiektu JSON w odpowiedzi modelu.');
  }

  return text.slice(start, end + 1);
}

async function openAiPost(pathname, body, maxRetries = 6) {
  const url = `${OPENAI_BASE_URL}${pathname}`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    if (response.ok) {
      try {
        return JSON.parse(responseText);
      } catch (error) {
        throw new Error(`Nie udało się sparsować JSON z ${pathname}: ${error.message}`);
      }
    }

    const retryableStatus = [408, 409, 429, 500, 502, 503, 504];
    const shouldRetry = retryableStatus.includes(response.status) && attempt < maxRetries;

    let errorMessage = `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(responseText);
      const apiMessage = parsed?.error?.message;
      if (apiMessage) {
        errorMessage = `${errorMessage}: ${apiMessage}`;
      }
    } catch (_error) {
      if (responseText) {
        errorMessage = `${errorMessage}: ${responseText.slice(0, 500)}`;
      }
    }

    if (!shouldRetry) {
      throw new Error(`Błąd API (${pathname}) - ${errorMessage}`);
    }

    const backoffMs = 1500 * 2 ** attempt + Math.floor(Math.random() * 700);
    console.log(`[retry ${attempt + 1}/${maxRetries}] ${pathname} -> ${errorMessage}. Czekam ${backoffMs} ms.`);
    await sleep(backoffMs);
  }

  throw new Error(`Nieoczekiwany błąd podczas wywołania ${pathname}.`);
}

function normalizeFacts(rawFactsBySlug, set) {
  const normalized = {};

  for (const item of set.items) {
    const value = rawFactsBySlug[item.slug];
    const facts = Array.isArray(value)
      ? value
          .map((fact) => String(fact).trim())
          .filter(Boolean)
          .map((fact) => (fact.endsWith('.') ? fact : `${fact}.`))
      : [];

    if (facts.length < FACTS_PER_ITEM) {
      throw new Error(
        `Model zwrócił za mało faktów dla "${item.slug}" w zestawie "${set.title}" (otrzymano: ${facts.length}).`
      );
    }

    normalized[item.slug] = facts.slice(0, FACTS_PER_ITEM);
  }

  return normalized;
}

async function generateFactsForSet(set) {
  const itemList = set.items.map((item) => `- ${item.slug} | ${item.description}`).join('\n');

  const userPrompt = [
    'Przygotuj fakty edukacyjne po polsku dla dzieci (wiek 4-8 lat).',
    `Dla KAŻDEGO elementu podaj dokładnie ${FACTS_PER_ITEM} krótkich faktów.`,
    'Zwróć WYŁĄCZNIE poprawny JSON bez markdown.',
    'Wymagania:',
    '- Każdy fakt ma być jednym zdaniem.',
    '- Maksymalnie 18 słów.',
    '- Fakty muszą być merytorycznie poprawne i neutralne.',
    '- Klucze JSON muszą być slugami z listy.',
    '',
    'Elementy:',
    itemList,
    '',
    'Schemat JSON:',
    '{"slug":["fakt1","fakt2","fakt3","fakt4","fakt5"]}',
  ].join('\n');

  const completion = await openAiPost('/chat/completions', {
    model: TEXT_MODEL,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Tworzysz krótkie fakty edukacyjne dla dzieci po polsku i zwracasz tylko obiekt JSON zgodny ze schematem.',
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const rawText = completion?.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error(`Brak treści odpowiedzi modelu tekstowego dla zestawu "${set.title}".`);
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (_error) {
    parsed = JSON.parse(extractJsonObject(rawText));
  }

  return normalizeFacts(parsed, set);
}

function promptForLegacyImage(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  const [folder, filename] = normalized.split('/');
  const slug = filename.replace(/\.png$/i, '');

  if (folder.startsWith('animals')) {
    if (slug.endsWith('-track')) {
      const animalSlug = slug.replace(/-track$/, '');
      const animalName = animalLabels[animalSlug] || animalSlug;
      return `footprint track of a ${animalName}, simple black print icon`;
    }

    const animalName = animalLabels[slug] || slug;
    return `${animalName}, full body, friendly wildlife character`;
  }

  if (folder === 'fruits') {
    const fruitName = fruitLabels[slug] || slug;
    return `${fruitName}, single fruit item`;
  }

  if (folder.startsWith('flags')) {
    const countryName = flagLabels[slug] || slug;
    return `official national flag of ${countryName}, rectangular shape`;
  }

  return slug.replaceAll('-', ' ');
}

async function collectLegacyImageSpecs() {
  const source = await fs.readFile(DRAWINGS_INDEX_PATH, 'utf8');
  const regex = /require\('\.\/([^']+\.png)'\)/g;
  const uniqueRelPaths = new Set();

  for (const match of source.matchAll(regex)) {
    uniqueRelPaths.add(match[1]);
  }

  return Array.from(uniqueRelPaths)
    .sort()
    .map((relPath) => ({
      outputPath: path.join(DRAWINGS_DIR, relPath),
      prompt: promptForLegacyImage(relPath),
      kind: 'legacy',
    }));
}

function collectGeneratedImageSpecs(setsWithFacts) {
  const specs = [];

  for (const set of setsWithFacts) {
    for (const item of set.items) {
      specs.push({
        outputPath: path.join(DRAWINGS_DIR, set.folder, `${item.slug}.png`),
        prompt: item.prompt,
        kind: 'generated',
      });
    }
  }

  return specs;
}

async function generateImage(outputPath, itemPrompt) {
  if (!FORCE_REGENERATE) {
    try {
      await fs.access(outputPath);
      return { skipped: true };
    } catch (_error) {
      // File does not exist.
    }
  }

  const now = Date.now();
  const waitMs = MIN_IMAGE_INTERVAL_MS - (now - lastImageRequestAt);
  if (waitMs > 0) {
    await sleep(waitMs);
  }

  lastImageRequestAt = Date.now();

  const imagePrompt = `${sharedImageStylePrompt} Subject: ${itemPrompt}.`;

  let response;
  try {
    response = await openAiPost('/images/generations', {
      model: IMAGE_MODEL,
      prompt: imagePrompt,
      size: IMAGE_SIZE,
      quality: IMAGE_QUALITY,
    });
  } catch (error) {
    const message = String(error?.message || '');
    const isSafetyRejection = message.includes('safety system') || message.includes('HTTP 400');

    if (!isSafetyRejection) {
      throw error;
    }

    const fallbackPrompt = `${sharedImageStylePrompt} Subject: simple neutral educational icon representing ${itemPrompt}.`;
    console.log(`[fallback] Safety retry for ${path.relative(ROOT_DIR, outputPath)}`);
    response = await openAiPost('/images/generations', {
      model: IMAGE_MODEL,
      prompt: fallbackPrompt,
      size: IMAGE_SIZE,
      quality: IMAGE_QUALITY,
    });
  }

  const b64 = response?.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error(`Brak danych obrazu b64 dla ${outputPath}.`);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, Buffer.from(b64, 'base64'));
  return { skipped: false };
}

async function runWithConcurrency(tasks, concurrency) {
  const safeConcurrency = Number.isFinite(concurrency) && concurrency > 0 ? Math.floor(concurrency) : 1;
  let index = 0;

  const workers = Array.from({ length: safeConcurrency }, async () => {
    while (true) {
      const taskIndex = index;
      index += 1;

      if (taskIndex >= tasks.length) {
        return;
      }

      await tasks[taskIndex]();
    }
  });

  await Promise.all(workers);
}

function buildGeneratedSetsTs(setsWithFacts) {
  const lines = [];
  lines.push('export default [');

  for (const set of setsWithFacts) {
    lines.push('  {');
    lines.push(`    title: '${escapeTsString(set.title)}',`);
    lines.push('    images: [');

    for (const item of set.items) {
      lines.push('      {');
      lines.push(`        image: require('./${set.folder}/${item.slug}.png'),`);
      lines.push(`        description: '${escapeTsString(item.description)}',`);
      lines.push('        facts: [');

      for (const fact of item.facts) {
        lines.push(`          '${escapeTsString(fact)}',`);
      }

      lines.push('        ],');
      lines.push('      },');
    }

    lines.push('    ],');
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');

  return lines.join('\n');
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Brak OPENAI_API_KEY. Ustaw zmienną środowiskową przed uruchomieniem skryptu.');
  }

  console.log(`Model tekstowy: ${TEXT_MODEL}`);
  console.log(`Model obrazów: ${IMAGE_MODEL} (${IMAGE_SIZE}, quality=${IMAGE_QUALITY})`);
  console.log(
    `FORCE_REGENERATE=${FORCE_REGENERATE ? '1' : '0'}, INCLUDE_LEGACY_IMAGES=${INCLUDE_LEGACY_IMAGES ? '1' : '0'}, MIN_IMAGE_INTERVAL_MS=${MIN_IMAGE_INTERVAL_MS}`
  );

  for (const set of sets) {
    await fs.mkdir(path.join(DRAWINGS_DIR, set.folder), { recursive: true });
  }

  const setsWithFacts = [];

  for (const set of sets) {
    console.log(`\n[FAKTY] Generuję fakty dla zestawu: ${set.title}`);
    const factsBySlug = await generateFactsForSet(set);

    setsWithFacts.push({
      ...set,
      items: set.items.map((item) => ({
        ...item,
        facts: factsBySlug[item.slug],
      })),
    });
  }

  const generatedTs = buildGeneratedSetsTs(setsWithFacts);
  await fs.writeFile(GENERATED_FILE_PATH, generatedTs, 'utf8');
  console.log(`\nZapisano: ${path.relative(ROOT_DIR, GENERATED_FILE_PATH)}`);

  const legacySpecs = INCLUDE_LEGACY_IMAGES ? await collectLegacyImageSpecs() : [];
  const generatedSpecs = collectGeneratedImageSpecs(setsWithFacts);
  const allSpecs = [...legacySpecs, ...generatedSpecs];

  const imageTasks = allSpecs.map((spec) => async () => {
    const result = await generateImage(spec.outputPath, spec.prompt);
    const state = result.skipped ? 'SKIP' : 'OK';
    const relative = path.relative(ROOT_DIR, spec.outputPath);
    console.log(`[${state}] (${spec.kind}) ${relative}`);
  });

  console.log(
    `\n[OBRAZY] Start generowania ${imageTasks.length} obrazów (legacy=${legacySpecs.length}, generated=${generatedSpecs.length}, concurrency=${IMAGE_CONCURRENCY})`
  );

  await runWithConcurrency(imageTasks, IMAGE_CONCURRENCY);

  console.log('\nGotowe.');
}

main().catch((error) => {
  console.error('\nBłąd:', error.message);
  process.exit(1);
});
