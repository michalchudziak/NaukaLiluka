import type { Book } from '@/types/book';

const zakupy: Book = {
  book: {
    title: 'Zakupy',
    pages: [
      {
        sentences: ['Mama kupuje chleb.'],
        image: require('./zakupy-page-01.png'),
      },
      {
        sentences: ['Karolcia kupuje słodycze.'],
        image: require('./zakupy-page-02.png'),
      },
      {
        sentences: ['Tata kupuje mleko.'],
        image: require('./zakupy-page-03.png'),
      },
      {
        sentences: ['Karol kupuje napój.'],
        image: require('./zakupy-page-04.png'),
      },
      {
        sentences: ['Wszyscy są w sklepie.'],
        image: require('./zakupy-page-05.png'),
      },
      {
        sentences: ['Lora jest w domu.'],
        image: require('./zakupy-page-06.png'),
      },
    ],
  },
  words: [
    ['sklepie', 'kupuje', 'chleb'],
    ['mleko', 'napój', 'słodycze'],
    ['sklep', 'i', 'razem'],
  ],
  sentences: [
    ['Tata jest w sklepie.', 'Gdzie jest chleb?', 'Karol jest w sklepie.'],
    ['Gdzie jest mleko?', 'Mama kupuje mleko.', 'Tata kupuje słodycze.'],
    ['Wszyscy są razem.', 'Mama i Lora są w sklepie.', 'Tata i Karol są w sklepie.'],
  ],
};

export default zakupy;
