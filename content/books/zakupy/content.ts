import { Book } from '@/types/book';

const zakupy: Book = {
    book: {
        title: "Zakupy",
        pages: [
            {
                sentences: [
                    "Mama kupuje chleb."
                ]
            },
            {
                sentences: [
                    "Karolcia kupuje słodycze."
                ]
            },
            {
                sentences: [
                    "Tata kupuje mleko."
                ]
            },
            {
                sentences: [
                    "Karol kupuje napój."
                ]
            },
            {
                sentences: [
                    "Wszyscy są w sklepie."
                ]
            },
            {
                sentences: [
                    "Lora jest w domu."
                ]
            },
        ]
    },
    words: [
        ["sklepie", "kupuje", "chleb"],
        ["mleko", "napój", "słodycze"],
        ["sklep", "i", "razem"]
    ],
    sentences: [
        ["Tata jest w sklepie.", "Gdzie jest chleb?", "Karol jest w sklepie."],
        ["Gdzie jest mleko?", "Mama kupuje mleko.", "Tata kupuje słodycze."],
        ["Wszyscy są razem.", "Mama i Lora są w sklepie.", "Tata i Karol są w sklepie."]
    ]
};

export default zakupy;