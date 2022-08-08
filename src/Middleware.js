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

    /**
     * Creates middleware
     * 
     * Can be overloaded
     * @date 2022-08-08
     * @param {scope} scope
     * @param {callback} callback
     */
    add (scope, callback) {
        this.addMiddleware(scope, callback)
    }

    /**
     * Creates once off middleware
     * 
     * Can not be overloaded
     * @date 2022-08-08
     * @param {scope} scope
     * @param {callback} callback
     */
    once (scope, callback) {
        this.addMiddleware(scope, callback, true)
    }

    /**
     * @date 2022-08-08
     * @param {scope} scope
     * @param {callback} callback
     * @param {once = false} once
     */
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

    /**
     * Removes the last middleware
     * @date 2022-08-08
     */
    pop () {
        this.middleware.pop();
    }

    /**
     * Removes all used once-off middleware
     * Resets ready-middleware
     * @date 2022-08-08
     */
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

    /**
     * Executes the next inline middleware
     * @date 2022-08-08
     */
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

    /**
     * Readies all middleware that are in scope
     * Executes first inline middleware
     * @date 2022-08-08
     */
    run () {
        this.reset();

        this.middleware.forEach((middleware) => {
            if (!(middleware.scope[0]) || (middleware.scope.includes(Router.currentRoute.name)))
                this.readyMiddleware.push(middleware);
        });

        this.exec();
    };
});