import Url from "./Url";
import Utils from "./Utils";

export default new (class Config {
    constructor () {
        if (Config.instance == null) {
            this.options = {
                logs: {
                    warn: true,
                    info: false
                },
                views: {
                    base: '/assets/js/src/',
                    components: 'components',
                    layouts: 'layouts',
                    ext: 'hbs'
                },
                page: {
                    title: 'Made with Ludr'
                }
            };

            Config.instance = this;
        }

        return Config.instance;
    };

    set (options) {
        this.options = Utils.merge({ refObj: this.options, mainObj: options });
    }

    get showWarning () {
        return this.options.logs.warn;
    }

    set showInfo (status) {
        this.options.logs.info = status;
    }

    get showInfo () {
        return this.options.logs.info;
    }

    get pageTitle () {
        return this.options.page.title;
    }

    get baseViews () {
        return Url.cleanURL(this.options.views.base);
    }

    get componentViews () {
        return Url.cleanURL(this.options.views.base + '/' + this.options.views.components);
    }

    get layoutViews () {
        return Url.cleanURL(this.options.views.base + '/' + this.options.views.layouts);
    }

    get viewsExt () {
        return this.options.views.ext;
    }
});