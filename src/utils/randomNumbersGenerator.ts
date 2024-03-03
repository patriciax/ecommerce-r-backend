export const randomNumbersGenerator = (length: number) => {
    let creditCardNumber = '';
    for (let i = 0; i < length; i++) {
        creditCardNumber += Math.floor(Math.random() * 10);
    }
    return creditCardNumber
}