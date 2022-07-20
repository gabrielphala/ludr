export default new (class Env {
    constructor () {
        if (Env.instance)
            return Env.instance;

        if (!Handlebars)
            throw 'Ludr.js Requires handlebars.js to work';

        this.handlebars = Handlebars;

        this.container = { __meta: 'Name: Ludr; Author: Gabriel Phala;' };
        this.globalContainer = { __meta: 'Name: Ludr; Author: Gabriel Phala;' };

        Env.instance = this;
    }

    put (key, value, isGlobal) {
        if (!isGlobal)
            return this.container[key] = value;

        this.globalContainer[key] = value;
    }

    get (key) {
        return this.container[key];
    }

    remove (key) {
        delete this.container[key];

        delete this.globalContainer[key];
    }
});