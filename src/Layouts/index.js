import Middleware from "../Middleware";
import Components from "../Components";
import Utils from "../Utils";
import Events from "../Events";
import Router from "../Router";

export default new (class Layouts {
    /**
     * @date 2022-08-08
     * @return {Layouts}
     */
    constructor () {
        if (Layouts.instance)
            return Layouts.instance;

        this.layouts = {}
        
        Layouts.instance = this;
    }

    /**
     * Add new layout to the cache and returns it
     * @date 2022-08-08
     * @param {string} name
     * @param {object} layout
     * @return {object}
     */
    add (name, layout) {
        return this.layouts[name] = layout;
    }

    /**
     * Returns a layout
     * @date 2022-08-08
     * @param {string} name
     * @return {object}
     */
    use (name) {
        if (!this.layouts[name])
            throw `No corresponding layout: there is no pre-defined layout with the name: (${name})`;
        
        return this.layouts[name];
    }

    /**
     * Populates layout with components' content
     * and prepends layout content to the document body 
     * @date 2022-08-08
     * @param {name} name
     */
    build (name) {
        if (!this.layouts[name])
            throw `No corresponding layout: there is no pre-defined layout with the name: (${name})`;

        this.layouts[name].build();

        Middleware.once(() => {
            Components.initEvents('beforeLoad');

            Utils.prependToBody(this.layouts[name].content)

            Components.initNavEvents();

            Components.initHighlightNavItems();

            const router = Router.use(Router.currentRoute.name);

            (new Events).setEventListeners(router.events);

            Components.initEvents('loaded');

            Router.initOnRouteReady()
        })
    }

    /**
     * Removes unused elements and adss new elements
     * @date 2022-08-08
     * @param {object} oldRoute
     * @param {object} currentRoute
     */
    switch (oldRoute, currentRoute) {
        const layout = this.layouts[currentRoute.layout];

        if (!layout)
            throw `No corresponding layout: there is no pre-defined layout with the name: (${currentRoute.layout})`;

        if (!currentRoute.blueprint)
            layout.build();
            
        Middleware.once((next) => {
            Components.initEvents('beforeLoad');

            layout.removeUnusedElements(oldRoute.blueprint, currentRoute.blueprint);
            layout.addNewElements(oldRoute.blueprint, currentRoute.blueprint);

            (new Events).setEventListeners(currentRoute.events);

            Components.initEvents('loaded');

            Router.initOnRouteReady()
            
            next()
        })
    }

    reload () {
        Components.initEvents('loaded');
    }
});