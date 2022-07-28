import Middleware from "../Middleware";
import Components from "../Components";
import Utils from "../Utils";

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

    use (name) {
        if (!this.layouts[name])
            throw `No corresponding layout: there is no pre-defined layout with the name: (${name})`;
        
        return this.layouts[name];
    }

    build (name) {
        if (!this.layouts[name])
            throw `No corresponding layout: there is no pre-defined layout with the name: (${name})`;

        this.layouts[name].build();

        Middleware.once(() => {
            Utils.prependToBody(this.layouts[name].content)

            Components.initHighlightNavItems();
            Components.initNavEvents();
        })
    }

    switch (oldRoute, currentRoute) {
        const layout = this.layouts[currentRoute.layout];

        if (!layout)
            throw `No corresponding layout: there is no pre-defined layout with the name: (${currentRoute.layout})`;

        if (!currentRoute.blueprint)
            layout.build();
        Middleware.once((next) => {
            layout.removeUnusedElements(oldRoute.blueprint, currentRoute.blueprint);
            layout.addNewElements(oldRoute.blueprint, currentRoute.blueprint);

            next()
        })
    }
});