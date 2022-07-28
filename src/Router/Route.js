import Config from "../Config";
import Layouts from "../Layouts";
import Router from "./index";

class Route {
    constructor (name, { title, subTitle, url, tags, layout }) {
        this.name = name;
        this.title = title;
        this.subTitle = subTitle;
        this.url = url;
        this.tags = tags;
        this.layout = layout;

        this.blueprint = null;
    }

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