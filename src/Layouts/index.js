import Middleware from "../Middleware";
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

    build (name) {
        if (!this.layouts[name])
            throw `No corresponding layout: there is no pre-defined layout with the name: (${name})`;

        this.layouts[name].build();

        Middleware.add(() => {
            Utils.prependToBody(this.layouts[name].content)
        })
    }
});