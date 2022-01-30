import * as R from "ramda";

const stringToArray = R.split("");

/* Question 1 */
function countVowel(c: string) {
    return ['a', 'e', 'i', 'o', 'u'].indexOf(c.toLocaleLowerCase()) >= 0 ? 1 : 0;
}

export const countVowels = (s: string) => stringToArray(s).reduce((acc: number, cur: string) => acc + countVowel(cur), 0);

/* Question 2 */
interface encAcc {
    lastChar: string;
    consecutiveAppearances: number;
    output: string;
}

const lengthEncoding = (acc: encAcc, currChar: string) => (currChar !== acc.lastChar) ?
    (acc.consecutiveAppearances === 1) ?
        { lastChar: currChar, consecutiveAppearances: 1, output: acc.output + acc.lastChar }
        : { lastChar: currChar, consecutiveAppearances: 1, output: acc.output + acc.lastChar + acc.consecutiveAppearances }
    : { lastChar: acc.lastChar, consecutiveAppearances: acc.consecutiveAppearances + 1, output: acc.output }

export const runLengthEncoding = (s: string) => {
    // If the string is empty, return empty string
    if (s.length === 0) {
        return "";

    }
    // Encode using the reduce method
    const encoding = stringToArray(s).reduce(lengthEncoding, { consecutiveAppearances: 0, lastChar: s[0], output: '' });

    // If a char appeared only once, we won't show the amount
    return (encoding.consecutiveAppearances === 1) ?
        encoding.output + encoding.lastChar
        : encoding.output + encoding.lastChar + encoding.consecutiveAppearances;
}

/* Question 3 */

function pairs(input: string, stack: string): boolean {
    // The stack must be empty for the string to be paired
    if (input.length == 0) {
        return stack.length === 0;
    }
    // Need to determine bracket type
    else {
        const currChar: string = input.charAt(0);
        switch (currChar) {
            case "(":
            case "{":
            case "[":
                return pairs(input.substring(1), stack.concat(currChar));
            case ")":
                if (stack.endsWith("(")) {
                    return pairs(input.substring(1), stack.substring(0, stack.length - 1));
                }
                else {
                    return false;
                }
            case "}":
                if (stack.endsWith("{")) {
                    return pairs(input.substring(1), stack.substring(0, stack.length - 1));
                }
                else {
                    return false;
                }
            case "]":
                if (stack.endsWith("[")) {
                    return pairs(input.substring(1), stack.substring(0, stack.length - 1));
                }
                else {
                    return false;
                }
            default:
                return pairs(input.substring(1), stack);
        }
    }
}

export const isPaired = (s: string) => {
    return pairs(s, "");
};