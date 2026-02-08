import type { Book } from '@/types/book';

const placZabaw: Book = {
  book: {
    title: 'Plac zabaw',
    pages: [
      {
        sentences: ['Karol bawi się na huśtawce.'],
        image: require('./plac-zabaw-page-01.png'),
      },
      {
        sentences: ['Karolcia bawi się na zjeżdżalni.'],
        image: require('./plac-zabaw-page-02.png'),
      },
      {
        sentences: ['Tata jest na placu.'],
        image: require('./plac-zabaw-page-03.png'),
      },
      {
        sentences: ['Mama też jest na placu.'],
        image: require('./plac-zabaw-page-04.png'),
      },
      {
        sentences: ['Czy Lora bawi się na placu?'],
        image: require('./plac-zabaw-page-05.png'),
      },
      {
        sentences: ['Gdzie jest Lora?'],
        image: require('./plac-zabaw-page-06.png'),
      },
      {
        sentences: ['Lora bawi się w piaskownicy.'],
        image: require('./plac-zabaw-page-07.png'),
      },
    ],
  },
  words: [
    ['bawi', 'się', 'na'],
    ['placu', 'huśtawce', 'zjeżdżalni'],
    ['piaskownicy', 'zabawa', 'Czy'],
  ],
  sentences: [
    ['Karol bawi się w domu.', 'Karolcia bawi się w lesie.', 'Lora bawi się w lesie.'],
    ['Tata jest na huśtawce.', 'Mama jest na huśtawce.', 'Mama jest na zjeżdżalni.'],
    ['Czy tata jest na huśtawce?', 'Tata jest na zjeżdżalni.', 'Czy tata jest na placu?'],
  ],
};

export default placZabaw;
