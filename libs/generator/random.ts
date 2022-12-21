import { randomInt, sum } from "../../utils/math";

export const len_min = 3;
export const len_max = 64;
export const len_default = 15;

export const uppercase_checked = 1;
export const lowercase_checked = 1 << 1;
export const numbers_checked = 1 << 2;
export const symbols_checked = 1 << 3;
export const avoid_amibugous_checked = 1 << 4;

export interface ComparisonData {
    password: string;
    characters: number;
    timestamp: number;
}

export function printPassword(raw: string): string {
    let html = '';
    for (var i = 0; i < raw.length; i++) {
        let char = raw.charAt(i);
        if (char >= '0' && char <= '9') {
            html += '<span class="text-primary">' + char + '</span>'
        } else if (characters_symbols.includes(char)) {
            html += '<span class="text-danger">' + char + '</span>'
        } else {
            html += char;
        }
    }
    return html;
}

const characters_symbols = '~!@#$%^&*()_-+=}]{[:;?<>,\'\"|\\';
const characters_amibugous = ['0', 'o', 'O', '1', 'i', 'I', 'l', '2', 'z', 'Z'];

const count_uppercase_index = 0;
const count_lowercase_index = 1;
const count_numbers_index = 2;
const count_symbols_index = 3;

function setupCharacterCount(characters: number, length: number): number[] {
    // uppercase, lowercase, numbers, symobals
    const count = [0, 0, 0, 0];
    let indexes = [];

    if ((characters & uppercase_checked) != 0) {
        count[count_uppercase_index] = 1;
        indexes.push(count_uppercase_index);
    }
    if ((characters & lowercase_checked) != 0) {
        count[count_lowercase_index] = 1;
        indexes.push(count_lowercase_index);
    }
    if ((characters & numbers_checked) != 0) {
        count[count_numbers_index] = 1;
        indexes.push(count_numbers_index);
    }
    if ((characters & symbols_checked) != 0) {
        count[count_symbols_index] = 1;
        indexes.push(count_symbols_index);
    }

    let balance = 0;
    do {
        balance = length - sum(count);
        if (balance == 0) {
            break;
        }
        const index: number = indexes[randomInt(0, indexes.length)];
        if (balance < 0) {
            count[index] = count[index] - 1;
            if (count[index] == 0) {
                indexes = indexes.filter(it => it != index);
            }
        } else if (balance > 0) {
            count[index] = count[index] + 1;
        }
    } while (true);

    return count;
}

function randomChars(length: number, chars: string, isAvoidAmibugous: boolean): string {
    let result = '';
    for (var i = 0; i < length; i++) {
        const char = chars.charAt(randomInt(0, chars.length));
        if (isAvoidAmibugous && characters_amibugous.includes(char)) {
            i--;
            continue;
        }
        result += char;
    }
    return result;
}

function randomRangeChars(length: number, startChar: number, endChar: number, isAvoidAmibugous: boolean): string {
    let result = '';
    for (var i = 0; i < length; i++) {
        const char = String.fromCharCode(randomInt(startChar, endChar + 1));
        if (isAvoidAmibugous && characters_amibugous.includes(char)) {
            i--;
            continue;
        }
        result += char;
    }
    return result;
}

function shuffleString(raw: string): string {
    var arr = raw.split('');           // Convert String to array
    var n = arr.length;              // Length of the array

    for (var i = 0; i < n - 1; ++i) {
        var j = randomInt(0, n);       // Get random of [0, n-1]

        var temp = arr[i];             // Swap arr[i] and arr[j]
        arr[i] = arr[j];
        arr[j] = temp;
    }

    return arr.join('');
}

export function generateRandom(characters: number, length: number): string {
    let isAvoidAmibugous = (characters & avoid_amibugous_checked) != 0;
    if (characters == (avoid_amibugous_checked | numbers_checked)) {
        isAvoidAmibugous = false;
    }

    const countArr = setupCharacterCount(characters, length);
    console.log("Finally count: " + JSON.stringify(countArr));

    let result = '';
    if (countArr[count_uppercase_index] > 0) {
        result += randomRangeChars(countArr[count_uppercase_index], 'A'.charCodeAt(0), 'Z'.charCodeAt(0), isAvoidAmibugous);
    }
    if (countArr[count_lowercase_index] > 0) {
        result += randomRangeChars(countArr[count_lowercase_index], 'a'.charCodeAt(0), 'z'.charCodeAt(0), isAvoidAmibugous);
    }
    if (countArr[count_numbers_index] > 0) {
        result += randomRangeChars(countArr[count_numbers_index], '0'.charCodeAt(0), '9'.charCodeAt(0), isAvoidAmibugous);
    }
    if (countArr[count_symbols_index] > 0) {
        result += randomChars(countArr[count_symbols_index], characters_symbols, false);
    }

    return shuffleString(result);
}