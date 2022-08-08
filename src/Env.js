export default new (class Env {
    constructor () {
        if (Env.instance)
            return Env.instance;

        if (!Handlebars)
            throw 'Ludr.js Requires handlebars.js to work';

        this.handlebars = Handlebars;

        this.container = { __meta: 'Name: Ludr. Author: Gabriel Phala.' };
        this.globalContainer = { __meta: 'Name: Ludr. Author: Gabriel Phala.' };

        Env.instance = this;
    }

    /**
     * Save key-value pairs
     * @date 2022-08-08
     * @param {string} key
     * @param {number | string | object} value
     * @param {boolean} isGlobal
     */
    put (key, value, isGlobal) {
        if (!isGlobal)
            return this.container[key] = value;

        this.globalContainer[key] = value;
    }

    /**
     * Returns a value associated with the given key
     * @date 2022-08-08
     * @param {key} key
     * @return {number | string | object}
     */
    get (key) {
        return this.container[key];
    }

    /**
     * Removes a value associated with the given key
     * @date 2022-08-08
     * @param {string} key
     */
    remove (key) {
        delete this.container[key];

        delete this.globalContainer[key];
    }
});