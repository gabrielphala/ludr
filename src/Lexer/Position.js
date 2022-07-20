export default class Position {
    constructor () {
        this.index = -1;
        this.line = 1;
        this.col = 1;
    }

    next (char) {
        this.index++;
        this.col++;

        if (char == '\n') {
            this.line++;
            this.col = 1;
        }
    }
}