import { ImageSourcePropType } from 'react-native';

export interface BookPage {
  sentences: string[];
  image: ImageSourcePropType;
}

export interface BookContent {
  title: string;
  pages: BookPage[];
}

export interface Book {
  book: BookContent;
  words: string[][]; // Array of word triples
  sentences: string[][]; // Array of sentence triples
}