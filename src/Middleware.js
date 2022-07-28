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
        this.addMiddleware(scope, callback)
    }

    once (scope, callback) {
        this.addMiddleware(scope, callback, true)
    }

    addMiddleware (scope, callback, once = false) {
        let _scope = scope;

        scope = !callback ? null : scope;
        callback = !callback ? _scope : callback;

        scope = Array.isArray(scope) ? scope : [scope];

        this.middleware.push({
            scope,
            once,
            hasRun: false,
            callback
        });
    };

    pop () {
        this.middleware.pop();
    }

    reset () {
        let newMiddleware = [];

        this.middlewareIndex = 0;
        this.readyMiddleware = [];

        this.middleware.forEach(middleware => {
            if (middleware.hasRun)
                return;

            newMiddleware.push(middleware);
        });

        this.middleware = newMiddleware;
    }

    exec () {
        let index = this.middlewareIndex;

        const { callback, once, hasRun } = this.readyMiddleware[this.index] || { callback: 'done' };

        if (typeof callback != 'function')
            return;

        if (once && hasRun)
            return this.exec();

        else if (once && !hasRun)
            this.readyMiddleware[index].hasRun = true;
        
        callback(() => this.exec());
    }

    run () {
        this.reset();

        this.middleware.forEach((middleware) => {
            if (!(middleware.scope[0]) || (middleware.scope.includes(Router.currentRoute.name)))
                this.readyMiddleware.push(middleware);
        });

        this.exec();
    };
});