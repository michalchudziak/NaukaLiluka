import type { Book } from '@/types/book';

const park: Book = {
  book: {
    title: 'Spacer w parku',
    pages: [
      {
        sentences: ['Dziś Karol idzie do parku.'],
        image: require('./park-page-01.png'),
      },
      {
        sentences: ['W parku pies szybko biegnie.'],
        image: require('./park-page-02.png'),
      },
      {
        sentences: ['Karol karmi ptaki w parku.'],
        image: require('./park-page-03.png'),
      },
      {
        sentences: ['Karolcia też wesoło biega na placu.'],
        image: require('./park-page-04.png'),
      },
      {
        sentences: ['Mama odpoczywa na ławce.'],
        image: require('./park-page-05.png'),
      },
      {
        sentences: ['Tata siedzi na ławce i czyta książkę.'],
        image: require('./park-page-06.png'),
      },
      {
        sentences: ['Potem Lora wraca do domu.'],
        image: require('./park-page-07.png'),
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
    ['Lora szybko biegnie na placu.', 'Karolcia wesoło biega w parku.', 'Tata siedzi na ławce.'],
    [
      'Kto karmi ptaki w parku?',
      'Potem mama wraca do domu.',
      'Lora szybko biegnie, potem odpoczywa.',
    ],
  ],
};

export default park;
