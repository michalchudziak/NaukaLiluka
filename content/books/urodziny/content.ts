import type { Book } from '@/types/book';

const urodziny: Book = {
  book: {
    title: 'Urodziny',
    pages: [
      {
        sentences: ['Dziś są urodziny Karola.'],
      },
      {
        sentences: ['Wszyscy są w domu.'],
      },
      {
        sentences: ['Mama ma prezent dla Karola.'],
      },
      {
        sentences: ['Tata też ma prezent dla Karola.'],
      },
      {
        sentences: ['Karolcia też ma prezent dla Karola.'],
      },
      {
        sentences: ['Ile lat ma Karol?'],
      },
      {
        sentences: ['Karol ma pięć lat.'],
      },
      {
        sentences: ['To są udane urodziny.'],
      },
    ],
  },
  words: [
    ['urodziny', 'Karola', 'prezent'],
    ['ma', 'pięć', 'lat'],
    ['Dziś', 'Ile', 'dla'],
  ],
  sentences: [
    ['Karolcia ma urodziny.', 'Lora ma prezent.', 'Tata ma prezent.'],
    ['Lora ma pięć lat.', 'Karolcia ma pięć lat.', 'Kto ma pięc lat?'],
    ['Ile lat ma tata?', 'Ile lat ma mama?', 'To są wesołe urodziny.'],
  ],
};

export default urodziny;
