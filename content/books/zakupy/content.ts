import { Book } from '@/types/book';

const zakupy: Book = {
    book: {
        title: "Zakupy",
        pages: [
            {
                sentences: [
                    "Mama idzie do sklepu razem."
                ]
            },
            {
                sentences: [
                    "Karolcia też idzie do sklepu."
                ]
            },
            {
                sentences: [
                    "Wszyscy kupują chleb i mleko."
                ]
            },
            {
                sentences: [
                    "Chleb jest tanio, mleko jest drogo."
                ]
            },
            {
                sentences: [
                    "Wszyscy razem płacą kartą."
                ]
            }
        ]
    },
    words: [
        ["sklepu", "Kupują", "chleb"],
        ["mleko", "Płacą", "kartą"],
        ["tanio", "drogo", "razem"]
    ],
    sentences: [
        ["Tata idzie do sklepu.", "Gdzie jest chleb?", "Karol idzie do sklepu."],
        ["Gdzie jest mleko?", "Wszyscy kupują mleko.", "Wszyscy płacą."],
        ["Chleb jest drogo.", "Mleko jest tanio.", "Kupują razem."]
    ]
};

export default zakupy;