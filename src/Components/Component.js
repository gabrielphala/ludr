import Components from "./index";
import Config from "../Config";
import Url from "../Url";
import Env from "../Env";
import Utils from "../Utils";

class Component {
    /**
     * Create component
     * @date 2022-08-08
     * @param {string} name
     * @param {object} attr
     */
    constructor (name, { path, nav, scope, data = {}} = null) {
        this.name = name;
        this.nav = nav;
        this.scope = scope;
        this.linkActiveClass = '';

        this._content = '';
        this.events = {}
        
        this.data = Utils.merge({ mainObj: Env.globalContainer, refObj: data });

        path = Utils.hasExt(path) ? path : `${path}.${Config.viewsExt}`;

        this.path = Url.cleanURL(`${Config.componentViews}/${path}`);
    }

    get content () {
        return this._content;
    }

    set content (content) {
        this._content = content;
    }

    onBeforeLoad (callback) {
        Components.beforeLoad(this.name);

        this.events.beforeLoad = callback;

        return this;
    }

    onLoaded (callback) {
        Components.loaded(this.name);

        this.events.loaded = callback;

        return this;
    }
};

/**
 * Create component
 * @date 2022-08-08
 * @param {string} name
 * @param {object} attr
 * @return {Component}
 */
export default (name, attr) => Components.add(name, new Component(name, attr));