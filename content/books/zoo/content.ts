import { Book } from '@/types/book';

const zoo: Book = {
    book: {
        title: "Wycieczka do Zoo",
        pages: [
            {
                sentences: [
                    "Karol widzi małpę."
                ],
            },
            {
                sentences: [
                    "Karolcia widzi słonia."
                ],
            },
            {
                sentences: [
                    "Karol widzi słonia."
                ],
            },
            {
                sentences: [
                    "Tata widzi lwa."
                ],
            },
            {
                sentences: [
                    "Mama widzi zwierzęta."
                ],
            },
        ]
    },
    words: [
        ["zoo", "widzi", "też"],
        ["małpę", "banana", "je"],
        ["słonia", "lwa", "zwierzęta"]
    ],
    sentences: [
        ["Lora idzie do zoo.", "Gdzie jest zoo?", "Karolcia widzi zwierzęta."],
        ["Karol je banana.", "Mama widzi małpę.", "Tata je banana."],
        ["Karolcia widzi słonia.", "Mama widzi lwa.", "Gdzie są zwierzęta?"]
    ]
};

export default zoo;