export const getNumbersLearningScheme = (day: number) => {
    if (day > 30) {
        return {
        data: Array.from({ length: 10 }, () => Math.floor(Math.random() * 150)).sort(() => Math.random() - 0.5),
        actualNumbers: true,
        }
    }

    if (day > 15) {
        return {
        data: Array.from({ length: 10 }, (_, i) => i + (day - 16) * 10),  
        actualNumbers: true,
        }
    }

    return {
        data: Array.from({ length: 10 }, (_, i) => i + (day - 1) * 10),
        actualNumbers: false,
    }
}