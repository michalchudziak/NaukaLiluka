import { Book } from '@/types/book';

const wakacje: Book = {
    book: {
        title: "Wakacje",
        pages: [
            {
                sentences: [
                    "Są wakacje!"
                ],
            },
            {
                sentences: [
                    "Karol jedzie nad morze."
                ],
            },
            {
                sentences: [
                    "Karolcia jedzie nad morze."
                ],
            },
            {
                sentences: [
                    "Mama pakuje walizkę."
                ],
            },
            {
                sentences: [
                    "Tata jedzie."
                ],
            },
            {
                sentences: [
                    "Lora jedzie."
                ],
            },
            {
                sentences: [
                    "To jest morze."
                ],
            },
            {
                sentences: [
                    "Karol jest w domu."
                ],
            },
            {
                sentences: [
                    "Wakacje są w domu."
                ],
            }
        ]
    },
    words: [
        ["Są", "wakacje", "jedzie"],
        ["nad", "morze", "pakuje"],
        ["walizkę", "Mama", "Tata"]
    ],
    sentences: [
        ["Karol jedzie.", "Są wakacje.", "Lora jedzie."],
        ["Tata jedzie nad morze.", "Mama pakuje.", "Karolcia jedzie nad morze."],
        ["Mama pakuje walizkę.", "Tata jedzie.", "Gdzie jest Mama?"]
    ]
};

export default wakacje;