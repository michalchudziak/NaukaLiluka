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
                    "Karolcia siedzi na kanapie."
                ]
            },
            {
                sentences: [
                    "Mama gotuje obiad."
                ]
            },
            {
                sentences: [
                    "Tata czyta książkę."
                ]
            },
            {
                sentences: [
                    "Gdzie jest Lora?"
                ]
            },
            {
                sentences: [
                    "Lora jest brudna."
                ]
            }
        ]
    },
    words: [
        ["w", "domu", "siedzi"],
        ["na", "kanapie", "gotuje"],
        ["obiad", "czyta", "książkę"]
    ],
    sentences: [
        ["Karolcia jest w domu.", "Gdzie jest mama?", "Lora siedzi."],
        ["Mama siedzi na kanapie.", "Tata jest na kanapie.", "Gdzie jest Karolcia?"],
        ["Mama czyta książkę.", "Tata gotuje obiad.", "Karolcia czyta książkę."]
    ]
};

export default dom;