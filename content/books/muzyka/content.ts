import type { Book } from '@/types/book';

const muzyka: Book = {
  book: {
    title: 'Wieczór z muzyką',
    pages: [
      {
        sentences: ['Dziś Tata gra muzykę.'],
      },
      {
        sentences: ['Karol tańczy w domu.'],
      },
      {
        sentences: ['Karolcia głośno się śmieje.'],
      },
      {
        sentences: ['Lora też tańczy w domu.'],
      },
      {
        sentences: ['Mama śpiewa cicho.'],
      },
      {
        sentences: ['Karol jest zmęczony.'],
      },
      {
        sentences: ['Karolcia jest zmęczona.'],
      },
      {
        sentences: ['Lora zasypia na kanapie.'],
      },
      {
        sentences: ['Potem Tata czyta książkę.'],
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
    ['Mama gra muzykę w domu.', 'Czy Tata gra muzykę?', 'Karolcia śpiewa cicho.'],
    ['Tata jest zmęczony.', 'Czy Karolcia jest zmęczona?', 'Lora zasypia w domu.'],
  ],
};

export default muzyka;
