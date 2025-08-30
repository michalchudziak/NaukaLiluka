import type { Book } from '@/types/book';
import dom from './dom/content';
import las from './las/content';
import obiadUdziadkow from './obiad-u-dziadkow/content';
import ogrod from './ogrod/content';
import rodzina from './rodzina/content';
import wakacje from './wakacje/content';
import zakupy from './zakupy/content';
import zoo from './zoo/content';

export const books: Book[] = [rodzina, dom, ogrod, las, wakacje, zoo, obiadUdziadkow, zakupy];
