import type { Book } from '@/types/book';

const zoo: Book = {
  book: {
    title: 'Wycieczka do Zoo',
    pages: [
      {
        sentences: ['Karol widzi małpę.'],
        image: require('./zoo-page-01.png'),
      },
      {
        sentences: ['Karolcia widzi słonia.'],
        image: require('./zoo-page-02.png'),
      },
      {
        sentences: ['Karol widzi słonia.'],
        image: require('./zoo-page-03.png'),
      },
      {
        sentences: ['Tata widzi lwa.'],
        image: require('./zoo-page-04.png'),
      },
      {
        sentences: ['Mama widzi zwierzęta.'],
        image: require('./zoo-page-05.png'),
      },
    ],
  },
  words: [
    ['zoo', 'widzi', 'też'],
    ['małpę', 'banana', 'je'],
    ['słonia', 'lwa', 'zwierzęta'],
  ],
  sentences: [
    ['Lora idzie do zoo.', 'Gdzie jest zoo?', 'Karolcia widzi zwierzęta.'],
    ['Karol je banana.', 'Mama widzi małpę.', 'Tata je banana.'],
    ['Karolcia widzi słonia.', 'Mama widzi lwa.', 'Gdzie są zwierzęta?'],
  ],
};

export default zoo;
