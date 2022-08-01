import Router from "../Router";

export default new (class Groups {
    constructor () {
        if (Groups.instance)
            return Groups.instance;

        this.groups = {};

        Groups.instance = this;
    }

    add (name, routes) {
        this.groups[name] = routes;
    }

    exists (name) {
        return this.groups[name] ? true : false;
    }

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