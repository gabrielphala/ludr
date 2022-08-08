import Router from "../Router";

export default new (class Groups {
    constructor () {
        if (Groups.instance)
            return Groups.instance;

        this.groups = {};

        Groups.instance = this;
    }

    /**
     * Caches the group
     * @date 2022-08-08
     * @param {string} name
     * @param {array} routes
     */
    add (name, routes) {
        this.groups[name] = routes;
    }

    /**
     * Checks whether the group exists
     * @date 2022-08-08
     * @param {name} name
     * @return {boolean}
     */
    exists (name) {
        return this.groups[name] ? true : false;
    }

    /**
     * Gets the group that matches the given name and loops through each route
     * and finds a route whose url(s) match(es) the current url and returns its component name
     * @date 2022-08-08
     * @param {name} name
     * @return {string}
     */
    getComponent (name) {
        let componentName;

        this.groups[name].forEach(route => {
            if ((route.urls && route.urls == Router.currentRoute.url) ||
                (route.urls && route.urls.includes(Router.currentRoute.url)) ||
                (route.url && route.url == Router.currentRoute.url))

                componentName = route.component;
        });

        if (!componentName)
            throw `Component not found: Group (${name}) has no component for endpoint (${location.pathname})`;

        return componentName;
    }
});