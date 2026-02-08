import type { Book } from '@/types/book';

const rower: Book = {
  book: {
    title: 'Rower w parku',
    pages: [
      {
        sentences: ['Dziś Karol ma rower.'],
      },
      {
        sentences: ['Tata ma kask i dzwonek.'],
      },
      {
        sentences: ['Karol i Tata są w parku.'],
      },
      {
        sentences: ['Karol pedałuje na ścieżce.'],
      },
      {
        sentences: ['Na zakręcie Tata hamuje.'],
      },
      {
        sentences: ['Karol odpoczywa na moście.'],
      },
      {
        sentences: ['Mama odpoczywa spokojnie w domu.'],
      },
      {
        sentences: ['Potem Karol wraca do domu.'],
      },
      {
        sentences: ['Wszyscy są w domu.'],
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
