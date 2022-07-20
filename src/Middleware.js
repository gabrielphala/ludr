import Router from "./Router";

export default new (class Middleware {
    constructor () {
        if (!Middleware.instance) {
            this.middleware = [];

            this.reset();

            Middleware.instance = this;
        }

        return Middleware.instance;
    };

    get index () {
        return this.middlewareIndex++;
    }

    add (scope, callback) {
        let _scope = scope;

        scope = !callback ? null : scope;
        callback = !callback ? _scope : callback;

        scope = Array.isArray(scope) ? scope : [scope];

        this.middleware.push({
            scope,
            callback
        });
    };

    pop () {
        this.middleware.pop();
    }

    reset () {
        this.middlewareIndex = 0;
        this.readyMiddleware = [];
    }

    exec () {
        const { callback } = this.readyMiddleware[this.index] || { callback: 'done' };

        if (typeof callback != 'function')
            return;

        callback(() => this.exec());
    }

    run () {
        this.reset();

        this.middleware.forEach(({ scope, callback }) => {
            if (!(scope[0]) || (scope.includes(Router.currentRoute.name)))
                this.readyMiddleware.push({scope, callback});
        });

        this.exec();
    };
});