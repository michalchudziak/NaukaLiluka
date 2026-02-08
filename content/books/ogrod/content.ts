import type { Book } from '@/types/book';

const ogrod: Book = {
  book: {
    title: 'Ogród',
    pages: [
      {
        sentences: ['Mama podlewa kwiaty.'],
        image: require('./ogrod-page-01.png'),
      },
      {
        sentences: ['Mama podlewa trawę.'],
        image: require('./ogrod-page-02.png'),
      },
      {
        sentences: ['Mama podlewa drzewo.'],
        image: require('./ogrod-page-03.png'),
      },
      {
        sentences: ['Mama podlewa krzaki.'],
        image: require('./ogrod-page-04.png'),
      },
      {
        sentences: ['Mama podlewa warzywa.'],
        image: require('./ogrod-page-05.png'),
      },
    ],
  },
  words: [
    ['podlewa', 'kwiaty', 'trawę'],
    ['drzewo', 'krzaki', 'warzywa'],
    ['ogrodzie', 'rosną', 'piękne'],
  ],
  sentences: [
    ['Tata podlewa kwiaty.', 'Karolcia podlewa trawę.', 'Karol podlewa kwiaty.'],
    ['Tata podlewa drzewo.', 'Gdzie rosną krzaki?', 'Karolcia podlewa warzywa.'],
    ['Gdzie rosną warzywa?', 'Kwiaty rosną w ogrodzie.', 'Krzaki rosną w ogrodzie.'],
  ],
};

export default ogrod;
