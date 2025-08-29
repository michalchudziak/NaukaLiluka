import { Book } from '@/types/book';

const ogrod: Book = {
    book: {
        title: "Ogród",
        pages: [
            {
                sentences: [
                    "Mama podlewa kwiaty."
                ]
            },
            {
                sentences: [
                    "Mama podlewa trawę."
                ]
            },
            {
                sentences: [
                    "Mama podlewa drzewo."
                ]
            },
            {
                sentences: [
                    "Mama podlewa krzaki."
                ]
            },
            {
                sentences: [
                    "Mama podlewa warzywa."
                ]
            }
        ]
    },
    words: [
        ["podlewa", "kwiaty", "trawę"],
        ["drzewo", "krzaki", "warzywa"],
        ["ogrodzie", "rosną", "piękne"]
    ],
    sentences: [
        ["Tata podlewa kwiaty.", "Karolcia podlewa trawę.", "Karol podlewa kwiaty."],
        ["Tata podlewa drzewo.", "Gdzie rosną krzaki?", "Karolcia podlewa warzywa."],
        ["Gdzie rosną warzywa?", "Kwiaty rosną w ogrodzie.", "Krzaki rosną w ogrodzie."]
    ]
};

export default ogrod;