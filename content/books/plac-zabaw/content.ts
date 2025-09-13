import type { Book } from '@/types/book';

const placZabaw: Book = {
  book: {
    title: 'Plac zabaw',
    pages: [
      {
        sentences: ['Karol bawi się na huśtawce.'],
      },
      {
        sentences: ['Karolcia bawi się na zjeżdżalni.'],
      },
      {
        sentences: ['Tata jest na placu.'],
      },
      {
        sentences: ['Mama też jest na placu.'],
      },
      {
        sentences: ['Czy Lora bawi się na placu?'],
      },
      {
        sentences: ['Gdzie jest Lora?'],
      },
      {
        sentences: ['Lora bawi się w piaskownicy.'],
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
