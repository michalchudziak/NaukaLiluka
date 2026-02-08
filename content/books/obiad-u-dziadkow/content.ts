import type { Book } from '@/types/book';

const obiadUDziadkow: Book = {
  book: {
    title: 'Obiad u dziadków',
    pages: [
      {
        sentences: ['Karol jedzie do dziadków.'],
        image: require('./obiad-u-dziadkow-page-01.png'),
      },
      {
        sentences: ['Karolcia jedzie do dziadków.'],
        image: require('./obiad-u-dziadkow-page-02.png'),
      },
      {
        sentences: ['Babcia gotuje obiad.'],
        image: require('./obiad-u-dziadkow-page-03.png'),
      },
      {
        sentences: ['Dziadek gotuje zupę.'],
        image: require('./obiad-u-dziadkow-page-04.png'),
      },
      {
        sentences: ['Babcia jest szczęśliwa.'],
        image: require('./obiad-u-dziadkow-page-05.png'),
      },
      {
        sentences: ['Mama jest szczęśliwa.'],
        image: require('./obiad-u-dziadkow-page-06.png'),
      },
      {
        sentences: ['Karolcia jest szczęśliwa.'],
        image: require('./obiad-u-dziadkow-page-07.png'),
      },
    ],
  },
  words: [
    ['dziadków', 'Babcia', 'obiad'],
    ['stole', 'zupę', 'Dziadek'],
    ['pyszna', 'szczęśliwa', 'Wszyscy'],
  ],
  sentences: [
    ['Mama jedzie do dziadków.', 'Tata jedzie do dziadków.', 'Lora jedzie do dziadków.'],
    ['Mama gotuje zupę.', 'Dziadek jest w domu.', 'Wszyscy siedzą w domu.'],
    ['Karolcia jest szczęśliwa.', 'Wszyscy są w domu.', 'Lora jest szczęśliwa.'],
  ],
};

export default obiadUDziadkow;
