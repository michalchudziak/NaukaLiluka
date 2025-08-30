import type { Book } from '@/types/book';

const dom: Book = {
  book: {
    title: 'Dom',
    pages: [
      {
        sentences: ['Karol jest w domu.'],
        image: require('./karol-dom.png'),
      },
      {
        sentences: ['Karolcia jest w domu.'],
        image: require('./karolcia-dom.png'),
      },
      {
        sentences: ['Mama czyta w domu.'],
        image: require('./mama-dom.png'),
      },
      {
        sentences: ['Tata pracuje w domu.'],
        image: require('./tata-dom.png'),
      },
      {
        sentences: ['Lora siedzi w domu.'],
        image: require('./lora-dom.png'),
      },
    ],
  },
  words: [
    ['w', 'domu', 'siedzi'],
    ['Mama', 'kanapie', 'pracuje'],
    ['Tata', 'czyta', 'książkę'],
  ],
  sentences: [
    ['Karol jest w domu.', 'Gdzie jest mama?', 'Lora siedzi na kanapie.'],
    ['Mama siedzi w domu.', 'Mama pracuje w domu.', 'Gdzie jest Karolcia?'],
    ['Mama czyta książkę.', 'Karol pracuje w domu.', 'Karolcia czyta książkę.'],
  ],
};

export default dom;
