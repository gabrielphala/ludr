import Config from "../Config";
import Layouts from "../Layouts";
import Router from "./index";

class Route {
    /**
     * Creates a new route
     * @date 2022-08-08
     * @param {string} name
     * @param {object} attr
     */
    constructor (name, { title, subTitle, url, tags, layout }) {
        this.name = name;
        this.title = title;
        this.subTitle = subTitle;
        this.url = url;
        this.tags = tags;
        this.params = {};
        this.query = {};
        this.layout = layout;

        this.blueprint = null;
    }

    /**
     * Updates the 'document' location of a browser without reloading the whole page
     * @date 2022-08-08
     * @param {string} path
     */
    updateHistory (path) {
        const pageTitle = Config.pageTitle + ' | ' + this.title;

        document.title = pageTitle;

        history.pushState(
            Layouts.use(this.layout).content,
            pageTitle,
            path
        );
    }
};

export default (name, attr) => Router.add(name, new Route(name, attr));