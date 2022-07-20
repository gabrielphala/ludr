import Utils from "../Utils";
import Url from "../Url";

export default new (class Router {
    constructor() {
        if (!Router.instance) {
            this.routes = {};
            this.currentRoute = {};

            Router.instance = this;
        }

        return Router.instance;
    };

    get currentParams () {
        return this.currentRoute.params;
    }

    add (name, route) {
        this.routes[name] = route;
    };

    use (name) {
        if (!this.routes[name])
            throw `Non-existant route: trying to use route (${name}) that doesn't exist!`;

        return this.routes[name];
    };

    getRoutesByTag (tag, attr = 'name') {
        const routesToReturn = [];

        Utils.iterate(this.routes, (routeName) => {
            if (this.routes[routeName].tags && this.routes[routeName].tags.includes(tag))
                routesToReturn.push(this.routes[routeName][attr]);
        });

        return routesToReturn;
    };

    getRoute (url = location.pathname) {
        let route;

        Utils.iterate(this.routes, (routeName) => {
            if (Url.compare(this.routes[routeName].url, url))
                route = this.routes[routeName];
        });

        if (!route)
            throw `No corresponding route: there is no pre-defined route that matches the path: (${url})`;

        route.params = Url.getParams(route.url, url);

        return route;
    }
});