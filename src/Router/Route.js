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
};

export default (name, attr) => Router.add(name, new Route(name, attr));