import type { Book } from '@/types/book';

const kuchnia: Book = {
  book: {
    title: 'Kuchnia',
    pages: [
      {
        sentences: ['Wszyscy są w domu.'],
      },
      {
        sentences: ['Tata siedzi na kanapie.'],
      },
      {
        sentences: ['Tata też siedzi na kanapie.'],
      },
      {
        sentences: ['Kto jest w kuchni?'],
      },
      {
        sentences: ['Mama jest w kuchni.'],
      },
      {
        sentences: ['Mama gotuje smaczny obiad.'],
      },
      {
        sentences: ['Karolcia pomaga w kuchni.'],
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
