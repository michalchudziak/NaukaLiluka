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