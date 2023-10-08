export function isAnyStringInArrayB(arrayA: string[], arrayB: string[]): boolean {
    const setB = new Set(arrayB);
    return arrayA.some((itemA: string) => setB.has(itemA));
}