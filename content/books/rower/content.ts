import type { Book } from '@/types/book';

const rower: Book = {
  book: {
    title: 'Rower w parku',
    pages: [
      {
        sentences: ['Dziś Karol ma rower.'],
        image: require('./rower-page-01.png'),
      },
      {
        sentences: ['Tata ma kask i dzwonek.'],
        image: require('./rower-page-02.png'),
      },
      {
        sentences: ['Karol i Tata są w parku.'],
        image: require('./rower-page-03.png'),
      },
      {
        sentences: ['Karol pedałuje na ścieżce.'],
        image: require('./rower-page-04.png'),
      },
      {
        sentences: ['Na zakręcie Tata hamuje.'],
        image: require('./rower-page-05.png'),
      },
      {
        sentences: ['Karol odpoczywa na moście.'],
        image: require('./rower-page-06.png'),
      },
      {
        sentences: ['Mama odpoczywa spokojnie w domu.'],
        image: require('./rower-page-07.png'),
      },
      {
        sentences: ['Potem Karol wraca do domu.'],
        image: require('./rower-page-08.png'),
      },
      {
        sentences: ['Wszyscy są w domu.'],
        image: require('./rower-page-09.png'),
      },
    ],
  },
  words: [
    ['rower', 'kask', 'dzwonek'],
    ['ścieżce', 'pedałuje', 'hamuje'],
    ['moście', 'zakręcie', 'spokojnie'],
  ],
  sentences: [
    ['Kto ma rower?', 'Karolcia ma kask.', 'Tata ma dzwonek.'],
    ['Tata pedałuje na ścieżce.', 'Karol hamuje na ścieżce.', 'Kto hamuje na ścieżce?'],
    ['Tata odpoczywa na moście.', 'Mama odpoczywa spokojnie.', 'Kto hamuje na zakręcie?'],
  ],
};

export default rower;
