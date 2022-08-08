export default class Position {
    constructor () {
        this.index = -1;
        this.line = 1;
        this.col = 1;
    }

    /**
     * Increments current index by 1 if no new line is encountered
     * column is incremented by 1, otherwise, line is incremented by 1 and column reset to 1
     * @date 2022-08-08
     * @param {string} char
     */
    next (char) {
        this.index++;
        this.col++;

        if (char == '\n') {
            this.line++;
            this.col = 1;
        }
    }
}