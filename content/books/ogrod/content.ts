import { Book } from '@/types/book';

const ogrod: Book = {
    book: {
        title: "Ogród",
        pages: [
            {
                sentences: [
                    "To jest ogród."
                ]
            },
            {
                sentences: [
                    "Karol idzie do ogrodu."
                ]
            },
            {
                sentences: [
                    "W ogrodzie rosną kwiaty."
                ]
            },
            {
                sentences: [
                    "Mama podlewa kwiaty."
                ]
            },
            {
                sentences: [
                    "Tata kosi trawę."
                ]
            },
            {
                sentences: [
                    "Karolcia zbiera jabłka."
                ]
            },
            {
                sentences: [
                    "Lora biega po trawie."
                ]
            },
            {
                sentences: [
                    "Ogród jest piękny."
                ]
            }
        ]
    },
    words: [
        ["ogród", "idzie", "do"],
        ["ogrodu", "rosną", "kwiaty"],
        ["podlewa", "kosi", "trawę"]
    ],
    sentences: [
        ["Karol idzie do domu.", "Mama idzie do domu.", "Tata idzie do ogrodu."],
        ["Gdzie rosną kwiaty?", "Kwiaty rosną w ogrodzie.", "Karolcia idzie do ogrodu."],
        ["Kto podlewa kwiaty?", "Mama kosi trawę.", "Tata podlewa kwiaty."]
    ]
};

export default ogrod;