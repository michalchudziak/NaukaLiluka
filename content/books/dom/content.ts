import { Book } from '@/types/book';

const dom: Book = {
    book: {
        title: "Dom",
        pages: [
            {
                sentences: [
                    "Karol jest w domu."
                ]
            },
            {
                sentences: [
                    "Karolcia jest w domu."
                ]
            },
            {
                sentences: [
                    "Mama czyta w domu."
                ]
            },
            {
                sentences: [
                    "Tata pracuje w domu."
                ]
            },
            {
                sentences: [
                    "Lora siedzi w domu."
                ]
            },
        ]
    },
    words: [
        ["w", "domu", "siedzi"],
        ["Mama", "kanapie", "pracuje"],
        ["Tata", "czyta", "książkę"]
    ],
    sentences: [
        ["Karol jest w domu.", "Gdzie jest mama?", "Lora siedzi na kanapie."],
        ["Mama siedzi w domu.", "Mama pracuje w domu.", "Gdzie jest Karolcia?"],
        ["Mama czyta książkę.", "Karol pracuje w domu.", "Karolcia czyta książkę."]
    ]
};

export default dom;