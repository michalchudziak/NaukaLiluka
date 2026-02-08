import type { Book } from '@/types/book';

const urodziny: Book = {
  book: {
    title: 'Urodziny',
    pages: [
      {
        sentences: ['Dziś są urodziny Karola.'],
        image: require('./urodziny-page-01.png'),
      },
      {
        sentences: ['Wszyscy są w domu.'],
        image: require('./urodziny-page-02.png'),
      },
      {
        sentences: ['Mama ma prezent dla Karola.'],
        image: require('./urodziny-page-03.png'),
      },
      {
        sentences: ['Tata też ma prezent dla Karola.'],
        image: require('./urodziny-page-04.png'),
      },
      {
        sentences: ['Karolcia też ma prezent dla Karola.'],
        image: require('./urodziny-page-05.png'),
      },
      {
        sentences: ['Ile lat ma Karol?'],
        image: require('./urodziny-page-06.png'),
      },
      {
        sentences: ['Karol ma pięć lat.'],
        image: require('./urodziny-page-07.png'),
      },
      {
        sentences: ['To są udane urodziny.'],
        image: require('./urodziny-page-08.png'),
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
    ['Lora ma pięć lat.', 'Karolcia ma pięć lat.', 'Kto ma pięć lat?'],
    ['Ile lat ma tata?', 'Ile lat ma mama?', 'To są wesołe urodziny.'],
  ],
};

export default urodziny;
