import type { Book } from '@/types/book';

const wakacje: Book = {
  book: {
    title: 'Wakacje',
    pages: [
      {
        sentences: ['Wakacje są długie.'],
      },
      {
        sentences: ['Wakacje są słoneczne.'],
      },
      {
        sentences: ['Wakacje są wesołe.'],
      },
      {
        sentences: ['Wakacje są ciepłe.'],
      },
      {
        sentences: ['Wakacje są udane.'],
      },
    ],
  },
  words: [
    ['Wakacje', 'są', 'długie'],
    ['słoneczne', 'wesołe', 'ciepłe'],
    ['spokojne', 'udane', 'beztroskie'],
  ],
  sentences: [
    ['To są piękne warzywa.', 'To jest Karol.', 'Mama pracuje w domu.'],
    ['To są wesołe warzywa.', 'To są słoneczne krzaki.', 'To jest ciepłe drzewo.'],
    ['To są spokojne kwiaty.', 'To są beztroskie warzywa.', 'To jest udane drzewo.'],
  ],
};

export default wakacje;
