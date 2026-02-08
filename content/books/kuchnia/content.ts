import type { Book } from '@/types/book';

const kuchnia: Book = {
  book: {
    title: 'Kuchnia',
    pages: [
      {
        sentences: ['Wszyscy są w domu.'],
        image: require('./kuchnia-page-01.png'),
      },
      {
        sentences: ['Tata siedzi na kanapie.'],
        image: require('./kuchnia-page-02.png'),
      },
      {
        sentences: ['Tata też siedzi na kanapie.'],
        image: require('./kuchnia-page-03.png'),
      },
      {
        sentences: ['Kto jest w kuchni?'],
        image: require('./kuchnia-page-04.png'),
      },
      {
        sentences: ['Mama jest w kuchni.'],
        image: require('./kuchnia-page-05.png'),
      },
      {
        sentences: ['Mama gotuje smaczny obiad.'],
        image: require('./kuchnia-page-06.png'),
      },
      {
        sentences: ['Karolcia pomaga w kuchni.'],
        image: require('./kuchnia-page-07.png'),
      },
    ],
  },
  words: [
    ['gotuje', 'kuchni', 'pomaga'],
    ['talerz', 'łyżka', 'obiad'],
    ['smaczny', 'ciepły', 'Kto'],
  ],
  sentences: [
    ['Tata gotuje w kuchni.', 'Tata pomaga w kuchni.', 'Karol pomaga w domu.'],
    ['Gdzie jest talerz?', 'Gdzie jest łyżka?', 'Tata ma talerz.'],
    ['Kto jest w domu?', 'Talerz jest ciepły.', 'Kto jest w lesie?'],
  ],
};

export default kuchnia;
