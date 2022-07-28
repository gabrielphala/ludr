import Middleware from "../Middleware";
import Components from "../Components";
import Utils from "../Utils";
import Router from "../Router";

export default new (class Layouts {
    constructor () {
        if (Layouts.instance)
            return Layouts.instance;

        this.layouts = {}
        
        Layouts.instance = this;
    }

    add (name, layout) {
        this.layouts[name] = layout;
    }

    build (name) {
        if (!this.layouts[name])
            throw `No corresponding layout: there is no pre-defined layout with the name: (${name})`;

        this.layouts[name].build();

        Middleware.add(() => {
            Utils.prependToBody(this.layouts[name].content)

            Components.initHighlightNavItems();
            Components.initNavEvents();
        })
    }

    switch (oldRoute, currentRoute) {
        const layout = this.layouts[currentRoute.layout];

        if (!layout)
            throw `No corresponding layout: there is no pre-defined layout with the name: (${currentRoute.layout})`;

        Middleware.pop();
        Middleware.pop();

        layout.build();

        Middleware.add(() => {
            layout.removeUnusedElements(oldRoute.blueprint, Router.currentRoute.blueprint);
            layout.addNewElements(oldRoute.blueprint, Router.currentRoute.blueprint);
        })
    }
});