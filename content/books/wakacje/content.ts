import type { Book } from '@/types/book';

const wakacje: Book = {
  book: {
    title: 'Wakacje',
    pages: [
      {
        sentences: ['Wakacje są długie.'],
        image: require('./wakacje-page-01.png'),
      },
      {
        sentences: ['Wakacje są słoneczne.'],
        image: require('./wakacje-page-02.png'),
      },
      {
        sentences: ['Wakacje są wesołe.'],
        image: require('./wakacje-page-03.png'),
      },
      {
        sentences: ['Wakacje są ciepłe.'],
        image: require('./wakacje-page-04.png'),
      },
      {
        sentences: ['Wakacje są udane.'],
        image: require('./wakacje-page-05.png'),
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
