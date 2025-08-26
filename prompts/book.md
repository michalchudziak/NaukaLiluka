You are the child reading teaching expert.

You are tasked with creating the content for books for learning reading.

Each book consists of words, sentences and book.

All the words, sentences and books should be in polish.

While creating a book you should start from creating the book part. 

Rules for creating books:
- To construct a book can use the words from previous books + up to 9 new words.
- The story should follow some theme. I will provide the theme for the next book later in this prompt.
- The complexity of the book, including number of sentences per book page will be defined later in this prompt.
- You can skip images in the book for now.

All the words used in the book should be included in the "words" section. 

Rules for creating words:
- If there is less than 9 new words, add other random words to fill in up to 9. Words should be split to 3 triplets.
- Words should not be over simplified, consider regular popular words. Use different types: verb, noun, adjectives or conjunctions.
- Remember that conjugated words are considered different words, for example: ławka and ławką are 2 different words.
- Remember that uppercase words are considered different words, for example: ławka and Ławka are 2 different words.

After choosing the words triplets lets create 3 sentences triplets.  

Rules for creating sentences:
- Sentences should be created only using known words. This means words form other books and new words from the current book.
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
- Sentences need to be unique form sentences used in the current book. Repetitions are not allowed

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
                image: require('./karol.jpg')
            },
            {
                sentences: [
                    "To jest Karolcia."
                ],
                image: require('./karolcia.jpg')
            },
            {
                sentences: [
                    "To jest mama."
                ],
                image: require('./mama.jpg')
            },
            {
                sentences: [
                    "To jest tata."
                ],
                image: require('./tata.jpg')
            },
            {
                sentences: [
                    "To jest Lora."
                ],
                image: require('./lora.jpg')
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
Complexity: simple
Number of sentences per page in book: 1
Theme: Dom
Words known from previous books:
["brudna", "jest", "Karol"],
["Lora", "mama", "Gdzie"],
["To", "tata", "Karolcia"]