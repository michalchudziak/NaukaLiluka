import type { Book } from '@/types/book';

const piknik: Book = {
  book: {
    title: 'Piknik w parku',
    pages: [
      {
        sentences: ['Dziś Wszyscy są w parku.'],
      },
      {
        sentences: ['To jest piknik w parku.'],
      },
      {
        sentences: ['Mama odpoczywa na kocu.'],
      },
      {
        sentences: ['Tata ma kosz i sok.'],
      },
      {
        sentences: ['Karol ma jabłko.'],
      },
      {
        sentences: ['Karolcia ma truskawki.'],
      },
      {
        sentences: ['Lora też odpoczywa na kocu.'],
      },
      {
        sentences: ['Dziś słońce świeci.'],
      },
      {
        sentences: ['Jabłko też smakuje.'],
      },
      {
        sentences: ['Wszyscy są w domu.'],
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
