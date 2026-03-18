import sentencesData from '../../content/no-rep/sentences.json';
import wordsData from '../../content/no-rep/words.json';

export function getContentPool(contentType: 'words' | 'sentences'): string[] {
  return contentType === 'words' ? wordsData : sentencesData;
}
