export const taxCalculations = (number: number, type: string) => {
    const taxRate = type === 'international' ? 1.06998 : 1.16;
    return number * taxRate;
}