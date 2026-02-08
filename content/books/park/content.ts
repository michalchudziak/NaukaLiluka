import type { Book } from '@/types/book';

const park: Book = {
  book: {
    title: 'Spacer w parku',
    pages: [
      {
        sentences: ['Dziś Karol idzie do parku.'],
      },
      {
        sentences: ['W parku pies biegnie szybko.'],
      },
      {
        sentences: ['Karol karmi ptaki w parku.'],
      },
      {
        sentences: ['Karolcia też biega wesoło na placu.'],
      },
      {
        sentences: ['Mama odpoczywa na ławce.'],
      },
      {
        sentences: ['Tata siedzi na ławce i czyta książkę.'],
      },
      {
        sentences: ['Potem Lora wraca do domu.'],
      },
    ],
  },
  words: [
    ['parku', 'pies', 'biegnie'],
    ['szybko', 'wesoło', 'ławce'],
    ['potem', 'karmi', 'ptaki'],
  ],
  sentences: [
    ['Kto idzie do parku?', 'Karol idzie do parku.', 'Pies biegnie w lesie.'],
    ['Lora biegnie szybko na placu.', 'Karolcia biega wesoło w parku.', 'Tata siedzi na ławce.'],
    ['Kto karmi ptaki w parku?', 'Potem mama wraca do domu.', 'Lora biegnie szybko, potem odpoczywa.'],
  ],
};

export default park;
