import Components from "./index";
import Config from "../Config";
import Url from "../Url";
import Utils from "../Utils";

class Component {
    constructor(name, { path, nav, scope, data } = null) {
        this.name = name;
        this.nav = nav;
        this.scope = scope;
        this.linkActiveClass = '';

        this._rawContent = '';
        this._content = '';

        path = Utils.hasExt(path) ? path : `${path}.${Config.viewsExt}`;

        this.path = Url.cleanURL(`${Config.componentViews}/${path}`);
    }

    get rawContent () {
        return this._rawContent;
    }

    set rawContent (rawContent) {
        this._rawContent = rawContent;
    }

    get content () {
        return this._content;
    }

    set content (content) {
        this._content = content;
    }
};

export default (name, attr) => Components.add(name, new Component(name, attr));