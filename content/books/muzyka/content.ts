import type { Book } from '@/types/book';

const muzyka: Book = {
  book: {
    title: 'Wieczór z muzyką',
    pages: [
      {
        sentences: ['Dziś Tata gra muzykę.'],
        image: require('./muzyka-page-01.png'),
      },
      {
        sentences: ['Karol tańczy w domu.'],
        image: require('./muzyka-page-02.png'),
      },
      {
        sentences: ['Karolcia głośno się śmieje.'],
        image: require('./muzyka-page-03.png'),
      },
      {
        sentences: ['Lora też tańczy w domu.'],
        image: require('./muzyka-page-04.png'),
      },
      {
        sentences: ['Mama cicho śpiewa.'],
        image: require('./muzyka-page-05.png'),
      },
      {
        sentences: ['Karol jest zmęczony.'],
        image: require('./muzyka-page-06.png'),
      },
      {
        sentences: ['Karolcia jest zmęczona.'],
        image: require('./muzyka-page-07.png'),
      },
      {
        sentences: ['Lora zasypia na kanapie.'],
        image: require('./muzyka-page-08.png'),
      },
      {
        sentences: ['Potem Tata czyta książkę.'],
        image: require('./muzyka-page-09.png'),
      },
    ],
  },
  words: [
    ['tańczy', 'śmieje', 'głośno'],
    ['muzykę', 'gra', 'cicho'],
    ['zmęczony', 'zmęczona', 'zasypia'],
  ],
  sentences: [
    ['Kto tańczy w domu?', 'Karol tańczy na placu.', 'Lora głośno się śmieje.'],
    ['Mama gra muzykę w domu.', 'Czy Tata gra muzykę?', 'Karolcia cicho śpiewa.'],
    ['Tata jest zmęczony.', 'Czy Karolcia jest zmęczona?', 'Lora zasypia w domu.'],
  ],
};

export default muzyka;
