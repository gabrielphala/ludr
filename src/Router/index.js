import Utils from "../Utils";
import Url from "../Url";

export default new (class Router {
    constructor () {
        if (!Router.instance) {
            this.routes = {};
            this.currentRoute = {};
            
            this.preDefinedEvents = { onRouteReady: [] }
            this.events = []

            Router.instance = this;
        }

        return Router.instance;
    };

    /**
     * Returns params associated with the current route
     * @date 2022-08-08
     * @return {string}
     */
    get currentParams () {
        return this.currentRoute.params;
    }

    /**
     * Caches the route and returns it
     * @date 2022-08-08
     * @param {string} name
     * @param {object} route
     * @return {object}
     */
    add (name, route) {
        return this.routes[name] = route;
    };

    /**
     * Returns a route that matches the given name
     * @date 2022-08-08
     * @param {name} name
     * @return {object}
     */
    use (name) {
        if (!this.routes[name])
            throw `Non-existant route: trying to use route (${name}) that doesn't exist!`;

        return this.routes[name];
    };

    /**
     * Returns an array with routes that match the given tag
     * @date 2022-08-08
     * @param {string} tag
     * @param {string} attr
     * @return {array}
     */
    getRoutesByTag (tag, attr = 'name') {
        const routesToReturn = [];

        Utils.iterate(this.routes, (routeName) => {
            if (this.routes[routeName].tags && this.routes[routeName].tags.includes(tag))
                routesToReturn.push(this.routes[routeName][attr]);
        });

        return routesToReturn;
    };

    /**
     * Returns a route that matches the given url
     * @date 2022-08-08
     * @param {string} url
     * @return {object}
     */
    getRoute (url = location.pathname) {
        let route;

        Utils.iterate(this.routes, (routeName) => {
            if (Url.compare(this.routes[routeName].url, url))
                route = this.routes[routeName];
        });

        if (!route)
            throw `Route not found: there is no pre-defined route that matches the path: (${url})`;

        route.params = Url.getParams(route.url, url);

        return route;
    }

    initOnRouteReady () {
        this.preDefinedEvents.onRouteReady.forEach(eventHandler => {
            eventHandler()
        })
    }

    onRouteReady (callback) {
        this.preDefinedEvents.onRouteReady.push(callback);
    }
});