import type { Book } from '@/types/book';

const deszcz: Book = {
  book: {
    title: 'Deszczowy dzień',
    pages: [
      {
        sentences: ['Dziś pada deszcz.'],
        image: require('./deszcz-page-01.png'),
      },
      {
        sentences: ['Mama ma parasol.'],
        image: require('./deszcz-page-02.png'),
      },
      {
        sentences: ['Karol ma kalosze.'],
        image: require('./deszcz-page-03.png'),
      },
      {
        sentences: ['Karolcia widzi kałuże na placu.'],
        image: require('./deszcz-page-04.png'),
      },
      {
        sentences: ['Lora szybko biegnie do domu.'],
        image: require('./deszcz-page-05.png'),
      },
      {
        sentences: ['Dziś kalosze są mokre.'],
        image: require('./deszcz-page-06.png'),
      },
      {
        sentences: ['Dziś chmury są ciemne.'],
        image: require('./deszcz-page-07.png'),
      },
      {
        sentences: ['Tata suszy parasol w domu.'],
        image: require('./deszcz-page-08.png'),
      },
      {
        sentences: ['Wszyscy są w domu.'],
        image: require('./deszcz-page-09.png'),
      },
    ],
  },
  words: [
    ['deszcz', 'pada', 'parasol'],
    ['kalosze', 'kałuże', 'mokre'],
    ['chmury', 'ciemne', 'suszy'],
  ],
  sentences: [
    ['Gdzie pada deszcz?', 'Tata ma parasol.', 'Tata idzie do domu.'],
    ['Karol ma mokre kalosze.', 'Czy kalosze są mokre?', 'Karolcia widzi kałuże.'],
    ['Dziś chmury są ciemne i mokre.', 'Tata suszy parasol.', 'Potem Karol wraca do domu.'],
  ],
};

export default deszcz;
