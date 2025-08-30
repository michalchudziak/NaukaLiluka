import type { Book } from '@/types/book';

const las: Book = {
  book: {
    title: 'Las',
    pages: [
      {
        sentences: ['Karol idzie do lasu.'],
      },
      {
        sentences: ['Karol biega w lesie.'],
      },
      {
        sentences: ['Karol śpiewa w lesie.'],
      },
      {
        sentences: ['Karol skacze w lesie.'],
      },
      {
        sentences: ['Karol odpoczywa w lesie.'],
      },
      {
        sentences: ['Karol wraca do domu.'],
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
