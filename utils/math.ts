export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function sum(arr: number[]): number {
    let sum = 0;
    arr.forEach(v => sum += v);
    return sum;
}
