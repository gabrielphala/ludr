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

    /**
     * Sets config options
     * @date 2022-08-08
     * @param {object} options
     */
    set (options) {
        this.options = Utils.merge({ refObj: this.options, mainObj: options });
    }

    /**
     * Returns warning log status
     * @date 2022-08-08
     * @return {boolean}
     */
    get showWarning () {
        return this.options.logs.warn;
    }

    /**
     * Sets info log status
     * @date 2022-08-08
     * @param {string} status
     */
    set showInfo (status) {
        this.options.logs.info = status;
    }

    /**
     * Returns info log status
     * @date 2022-08-08
     * @return {boolean}
     */
    get showInfo () {
        return this.options.logs.info;
    }

    /**
     * Sets main title
     * @date 2022-08-08
     * @param {string} pageTitle
     */
    set pageTitle (pageTitle) {
        this.options.page.title = pageTitle;
    }

    /**
     * Returns main title
     * @date 2022-08-08
     * @returns {string}
     */
    get pageTitle () {
        return this.options.page.title;
    }

    /**
     * Returns views' base path
     * @date 2022-08-08
     * @return {string}
     */
    get baseViews () {
        return Url.cleanURL(this.options.views.base);
    }

    /**
     *  Returns components' views' path
     * @date 2022-08-08
     * @return {string}
     */
    get componentViews () {
        return Url.cleanURL(this.options.views.base + '/' + this.options.views.components);
    }

    /**
     * Returns layouts' views' path
     * @date 2022-08-08
     * @return {string}
     */
    get layoutViews () {
        return Url.cleanURL(this.options.views.base + '/' + this.options.views.layouts);
    }

    /**
     * Returns preferred extenstion
     * @date 2022-08-08
     * @return {string}
     */
    get viewsExt () {
        return this.options.views.ext;
    }
});