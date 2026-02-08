import type { Book } from '@/types/book';

const las: Book = {
  book: {
    title: 'Las',
    pages: [
      {
        sentences: ['Karol idzie do lasu.'],
        image: require('./las-page-01.png'),
      },
      {
        sentences: ['Karol biega w lesie.'],
        image: require('./las-page-02.png'),
      },
      {
        sentences: ['Karol śpiewa w lesie.'],
        image: require('./las-page-03.png'),
      },
      {
        sentences: ['Karol skacze w lesie.'],
        image: require('./las-page-04.png'),
      },
      {
        sentences: ['Karol odpoczywa w lesie.'],
        image: require('./las-page-05.png'),
      },
      {
        sentences: ['Karol wraca do domu.'],
        image: require('./las-page-06.png'),
      },
    ],
  },
  words: [
    ['idzie', 'do', 'lasu'],
    ['biega', 'lesie', 'śpiewa'],
    ['skacze', 'odpoczywa', 'wraca'],
  ],
  sentences: [
    ['Karolcia idzie do lasu.', 'Tata idzie do domu.', 'Mama idzie do domu.'],
    ['Lora biega w lesie.', 'Karolcia śpiewa w domu.', 'Tata biega w lesie.'],
    ['Karol skacze w domu.', 'Mama odpoczywa w domu.', 'Lora wraca do domu.'],
  ],
};

export default las;
