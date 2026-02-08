You are the child reading teaching expert.

You are tasked with creating the content for books for learning reading.

Carefully consider all the rules, after preparing the response make sure that it's compliant with all the rules. Keep iterating after all rules are met.

Each book consists of words, sentences and book.

All the words, sentences and books should be in polish.

While creating a book you should start from creating the book part. 

Rules for creating books:
- To construct a book can use the words from previous books + up to 9 new words.
- The story should follow some theme. I will provide the theme for the next book later in this prompt.
- The book must tell one coherent short story with a clear beginning, middle and ending.
- Each next page should continue the same story, not a disconnected random sentence.
- Avoid near-duplicate pages. Do not create multiple pages that only swap names in the same sentence template.
- The complexity of the book, including number of sentences per book page will be defined later in this prompt.
- Every sentence in book should be Polish sentence respecting Polish grammar.
- On the SIMPLE complexity level we should still present one dominant pattern, but sentences must stay varied and story-driven (not almost identical clones). 

All the words used in the book should be included in the "words" section. 
- After generating a new book, append all new words from this book (all 3 triplets / 9 words) to "Words known from previous books" in BOOK INFO, keeping exact casing and inflection.

Rules for creating words:
- If there is less than 9 new words, add other theme-related words to fill in up to 9. Do not use unrelated random filler. Words should be split to 3 triplets.
- Words should not be over simplified, consider regular popular words. Use different types: verb, noun, adjectives or conjunctions.
- Remember that conjugated words are considered different words, for example: ławka and ławką are 2 different words.
- Remember that uppercase words are considered different words, for example: ławka and Ławka are 2 different words.

After choosing the words triplets lets create 3 sentences triplets.  

Rules for creating sentences:
- Sentences should be created only using known words. This means words form other books and new words from the current book.
- Sentences should have at least 3 words.
- Sentences in book.pages should be versatile: vary structure and details while keeping language simple for children.
- Each sentence in book.pages should move the story forward.
- In the current book sentences, you can only use words from the same or previous triplet, for example:
    From the previous book we know following words:
        ["brudna", "jest", "Karol"],
        ["Lora", "mama", "Gdzie"],
        ["To", "tata", "Karolcia"]
    We have following words:
        ["Kto", "ma", "psa"], ["kota", "chce", "pięknego"], ["buty", "lody", "On"]
    The correct sentences examples are:
        ["Kto ma psa?", "Karol ma psa.", "Karolcia ma psa."],
        ["Kto chce psa?", "Karol chce kota.", "Karolcia ma pięknego kota."],
        ["Kto ma buty?", "Karolcia ma psa.", "On chce lody."]
- Sentences need to be unique form sentences used in the current book. Repetitions are not allowed. This means that if sentence is used in book.pages.sentences it cant be included in this sentence pool.
- Every sentence should be Polish sentence respecting Polish grammar.

Response shape example:
```ts
import { Book } from '@/types/book';

const rodzina: Book = {
    book: {
        title: "Rodzina",
        pages: [
            {
                sentences: [
                    "To jest Karol."
                ],
            },
            {
                sentences: [
                    "To jest Karolcia."
                ],
            },
            {
                sentences: [
                    "To jest mama."
                ],
            },
            {
                sentences: [
                    "To jest tata."
                ],
            },
            {
                sentences: [
                    "To jest Lora."
                ],
            }
        ]
    },
    words: [
        ["brudna", "jest", "Karol"],
        ["Lora", "mama", "Gdzie"],
        ["To", "tata", "Karolcia"]
    ],
    sentences: [
        [],
        ["Gdzie jest mama?", "Gdzie jest Karol?", "Gdzie jest Lora?"],
        ["Karolcia jest brudna.", "Lora jest brudna.", "Gdzie jest tata?"]
    ]
};

export default rodzina;
```

BOOK INFO:
Complexity level: SIMPLE
Number of sentences per page in book: 1
Theme: Zoo
Words known from previous books:
["brudna", "jest", "Karol"],
["Lora", "mama", "Gdzie"],
["To", "tata", "Karolcia"],
["w", "domu", "siedzi"],
["Mama", "kanapie", "pracuje"],
["Tata", "czyta", "książkę"]
["podlewa", "kwiaty", "trawę"],
["drzewo", "krzaki", "warzywa"],
["ogrodzie", "rosną", "piękne"],
["idzie", "do", "lasu"],
["biega", "lesie", "śpiewa"],
["skacze", "odpoczywa", "wraca"],
["Wakacje", "są", "długie"],
["słoneczne", "wesołe", "ciepłe"],
["spokojne", "udane", "beztroskie"],
["zoo", "widzi", "też"],
["małpę", "banana", "je"],
["słonia", "lwa", "zwierzęta"],
["dziadków", "Babcia", "obiad"],
["stole", "zupę", "Dziadek"],
["pyszna", "szczęśliwa", "Wszyscy"],
["sklepie", "kupuje", "chleb"],
["mleko", "napój", "słodycze"],
["sklep", "i", "razem"],
['bawi', 'się', 'na'],
['placu', 'huśtawce', 'zjeżdżalni'],
['piaskownicy', 'zabawa', 'ciekawa'],
['gotuje', 'kuchni', 'pomaga'],
['talerz', 'łyżka', 'obiad'],
['smaczny', 'ciepły', 'Kto'],
['urodziny', 'Karola', 'prezent'],
['ma', 'pięć', 'lat'],
['Dziś', 'Ile', 'dla'],
['parku', 'pies', 'biegnie'],
['szybko', 'wesoło', 'ławce'],
['potem', 'karmi', 'ptaki'],
['deszcz', 'pada', 'parasol'],
['kalosze', 'kałuże', 'mokre'],
['chmury', 'ciemne', 'suszy'],
