import Position from "./Position";
import { numbers, alpha } from "./Chars";

export default class Lexer {
    /**
     * @date 2022-08-08
     * @param {str} str
     */
    constructor (str) {
        this.str = str;
        this.currentChar = null;
        this.pos = new Position()

        this.next();
    }

    /**
     * Moves to the next character in the given string
     * @date 2022-08-08
     */
    next () {
        this.pos.next(this.currentChar);

        this.currentChar = this.pos.index < this.str.length ? this.str[this.pos.index] : null;
    }

    /**
     * Returns a char behind of the current char, at an offset
     * @date 2022-08-08
     * @param {string} token
     * @param {number} offset
     * @return {string}
     */
    lookBehind (token, offset = 1) {
        return this.str[this.pos.index - token.length - offset] || null;
    }

    /**
     * Returns a char ahead of the current char, at an offset
     * @date 2022-08-08
     * @param {number} offset
     * @return {string}
     */
    lookAhead (offset = 0) {
        return this.str[this.pos.index + offset] || null;
    }

    /**
     * Makes a string token from a larger string
     * @date 2022-08-08
     * @return {string}
     */
    makeString () {
        const letters = numbers + alpha + '_-.';
        let str = '';

        while (letters.includes(this.currentChar)) {
            str += this.currentChar;

            this.next();
        };

        return str;
    }
};
