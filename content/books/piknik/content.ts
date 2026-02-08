import type { Book } from '@/types/book';

const piknik: Book = {
  book: {
    title: 'Piknik w parku',
    pages: [
      {
        sentences: ['Dziś Wszyscy są w parku.'],
        image: require('./piknik-page-01.png'),
      },
      {
        sentences: ['To jest piknik w parku.'],
        image: require('./piknik-page-02.png'),
      },
      {
        sentences: ['Mama odpoczywa na kocu.'],
        image: require('./piknik-page-03.png'),
      },
      {
        sentences: ['Tata ma kosz i sok.'],
        image: require('./piknik-page-04.png'),
      },
      {
        sentences: ['Karol ma jabłko.'],
        image: require('./piknik-page-05.png'),
      },
      {
        sentences: ['Karolcia ma truskawki.'],
        image: require('./piknik-page-06.png'),
      },
      {
        sentences: ['Lora też odpoczywa na kocu.'],
        image: require('./piknik-page-07.png'),
      },
      {
        sentences: ['Dziś słońce świeci.'],
        image: require('./piknik-page-08.png'),
      },
      {
        sentences: ['Jabłko też smakuje.'],
        image: require('./piknik-page-09.png'),
      },
      {
        sentences: ['Wszyscy są w domu.'],
        image: require('./piknik-page-10.png'),
      },
    ],
  },
  words: [
    ['piknik', 'kocu', 'kosz'],
    ['jabłko', 'sok', 'truskawki'],
    ['słońce', 'świeci', 'smakuje'],
  ],
  sentences: [
    ['Gdzie jest piknik?', 'Mama siedzi na kocu.', 'Tata ma kosz.'],
    ['Karol ma sok.', 'Karolcia ma jabłko.', 'Kto ma truskawki?'],
    ['Dziś słońce świeci w parku.', 'Sok też smakuje w parku.', 'Karol też ma truskawki.'],
  ],
};

export default piknik;
