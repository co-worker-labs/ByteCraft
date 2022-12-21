import { randomInt } from "../../utils/math";
import { agsyllables, agwordlist } from './memorable_wordlist'

export const len_min = 2;
export const len_max = 15;
export const len_default = 4;

export interface ComparisonData {
    password: string[];
    timestamp: number;
}

export function printPassword(words: string[]): string {
    return words.join('<span class="text-danger">-</span>')
}

export function joinPassword(words: string[]): string {
    return words.join('-');
}

function random(list: string[], length: number): string[] {
    const result: string[] = [];
    while (result.length < length) {
        const word = list[randomInt(0, list.length)];
        if (result.includes(word)) {
            continue;
        }
        result.push(word);
    }
    return result;
}

export function generate(capitalized: boolean, fullwords: boolean, length: number): string[] {
    let result: string[];
    if (fullwords) {
        result = random(agwordlist, length);
    } else {
        result = random(agsyllables, length);
    }

    if (capitalized) {
        const word = result[0];
        if (word.charAt(0) >= 'a' && word.charAt(0) <= 'z') {
            result[0] = String.fromCharCode(word.charCodeAt(0) - 32).concat(word.substring(1));
        }
    }
    return result;
}