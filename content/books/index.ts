import type { Book } from '@/types/book';
import dom from './dom/content';
import kuchnia from './kuchnia/content';
import las from './las/content';
import obiadUdziadkow from './obiad-u-dziadkow/content';
import ogrod from './ogrod/content';
import placZabaw from './plac-zabaw/content';
import rodzina from './rodzina/content';
import urodziny from './urodziny/content';
import wakacje from './wakacje/content';
import zakupy from './zakupy/content';
import zoo from './zoo/content';

export const books: Book[] = [rodzina, dom, ogrod, las, wakacje, zoo, obiadUdziadkow, zakupy, placZabaw, kuchnia, urodziny];
