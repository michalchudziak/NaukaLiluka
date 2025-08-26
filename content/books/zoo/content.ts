import { Book } from '@/types/book';

const zoo: Book = {
    book: {
        title: "Wycieczka do Zoo",
        pages: [
            {
                sentences: [
                    "Karol idzie do zoo."
                ],
            },
            {
                sentences: [
                    "Karolcia też idzie."
                ],
            },
            {
                sentences: [
                    "Mama idzie do zoo."
                ],
            },
            {
                sentences: [
                    "Tata też idzie."
                ],
            },
            {
                sentences: [
                    "To jest zoo."
                ],
            },
            {
                sentences: [
                    "Karol widzi zwierzęta."
                ],
            },
            {
                sentences: [
                    "Mama je banana."
                ],
            },
            {
                sentences: [
                    "Tata widzi słonia."
                ],
            },
            {
                sentences: [
                    "Lora widzi lwa."
                ],
            }
        ]
    },
    words: [
        ["zoo", "zwierzęta", "też"],
        ["małpę", "banana", "je"],
        ["słonia", "lwa", "widać"]
    ],
    sentences: [
        ["Lora idzie do zoo.", "Gdzie jest zoo?", "Karolcia widzi zwierzęta."],
        ["Karol je banana.", "Mama widzi małpę.", "Tata je banana."],
        ["Karolcia widzi słonia.", "Mama widzi lwa.", "Gdzie widać zwierzęta?"]
    ]
};

export default zoo;