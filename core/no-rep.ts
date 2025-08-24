import sentencesData from '@/content/sentences.json';
import wordsData from '@/content/words.json';
import { DefaultSettings } from '@/services/default-settings';
import { StorageService } from '@/services/storage';

function getRandomItems<T>(array: T[], count: number, exclude: T[] = []): T[] {
    const available = array.filter(item => !exclude.includes(item));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

export const chooseAndMarkWords = async () => {
    const displayedWords = await StorageService.getDisplayedWords();
    const randomWords = getRandomItems(wordsData, DefaultSettings.reading.noRep.words, displayedWords);
    
    if (randomWords.length === 0) {
      return [];
    } 

    await StorageService.addDisplayedWords(randomWords);
    await StorageService.markWordsCompleted();

    return randomWords;
}

export const chooseAndMarkSentences = async () => {
    const displayedSentences = await StorageService.getDisplayedSentences();
    const randomSentences = getRandomItems(sentencesData, DefaultSettings.reading.noRep.sentences, displayedSentences);
    
    if (randomSentences.length === 0) {
      return [];
    } 

    await StorageService.addDisplayedSentences(randomSentences);
    await StorageService.markSentencesCompleted();

    return randomSentences;
}   