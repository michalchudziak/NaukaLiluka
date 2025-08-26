import { Book } from '@/types/book';

const las: Book = {
    book: {
        title: "Las",
        pages: [
            {
                sentences: [
                    "Karol idzie do lasu."
                ],
            },
            {
                sentences: [
                    "W lesie rosną drzewa."
                ],
            },
            {
                sentences: [
                    "Karolcia widzi ptaki."
                ],
            },
            {
                sentences: [
                    "Tata słyszy ptaki."
                ],
            },
            {
                sentences: [
                    "Mama zbiera grzyby."
                ],
            },
            {
                sentences: [
                    "Lora jest w lesie."
                ],
            }
        ]
    },
    words: [
        ["lasu", "lesie", "drzewa"],
        ["widzi", "słyszy", "ptaki"],
        ["zbiera", "grzyby", "piękny"]
    ],
    sentences: [
        ["Tata idzie do lasu.", "Mama idzie do lasu.", "Lora idzie do lasu."],
        ["Karol widzi drzewa.", "Lora słyszy ptaki.", "Tata widzi ptaki."],
        ["Mama zbiera kwiaty.", "Karolcia zbiera grzyby.", "Ogród jest piękny."]
    ]
};

export default las;