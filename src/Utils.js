import Env from "./Env";

class Utils {
    /**
     * Prepends html to document's body
     * @date 2022-08-08
     * @param {html} html
     */
    static prependToBody (html) {
        let ludrContainer = document.getElementsByClassName('ludr-container')[0];

        if (!ludrContainer) {
            ludrContainer = document.createElement('div');

            ludrContainer.className = 'ludr-container';
        }

        ludrContainer.innerHTML = html;

        document.body.prepend(ludrContainer);
    };

    /**
     * Fetch
     * @date 2022-08-08
     * @param {string} uri
     * @param {object} options
     * @return {string}
     */
    static async fetch (uri, { method = 'GET', headers = { 'Content-Type': 'application/json;charset=utf-8' }, body } = {}) {

        const response = await fetch(uri, { method, headers, body: JSON.stringify(body) });

        return await response.text();
    };

    /**
     * Converts array to object
     * @date 2022-08-08
     * @param {object} obj
     * @param {array} parents
     * @return {object}
     */
    static arrayToObject (obj, parents) {
        let replaceValue;

        for (let i = 0; i < parents.length; i++) {
            replaceValue = !replaceValue ? obj[parents[i]] : replaceValue[parents[i]];
        }

        return replaceValue;
    };

    /**
     * Loops through an object
     * @date 2022-08-08
     * @param {object} obj
     * @param {function} callback
     */
    static iterate (obj, callback) {
        for (const key in obj) {
            if (!obj.hasOwnProperty(key))
                continue;

            callback(key);
        }
    };

    /**
     * Combines two objects
     * @date 2022-08-08
     * @param { refObj, mainObj, parents = [] } data
     * @return {object}
     * @deprecated since development
     */
    static merge ({ refObj, mainObj, parents = [] }) {
        for (const key in refObj) {
            if (!refObj.hasOwnProperty(key))
                continue;

            parents.push(key);

            if (typeof refObj[key] != 'object') {
                let replaceValue = Utils.arrayToObject(mainObj, parents);

                if (replaceValue)
                    refObj[key] = replaceValue;

                parents.pop();

                continue;
            }

            Utils.merge({ refObj: refObj[key], mainObj, parents });

            parents.pop();
        }

        return mainObj;
    };

    /**
     * Extracts component names from a string
     * @date 2022-08-08
     * @param {string} string
     * @return {array}
     */
    static extractComponentNames (string) {
        const rawTags = string.match(/@ludr_component(.*?)end/gi) || [];

        let tags = [];

        rawTags.forEach(rawTag => {
            tags.push(rawTag.replace('@ludr_component', '').replace('end', ''));
        });

        return tags;
    };

    /**
     * Sets up handlebars helpers
     * @date 2022-08-08
     */
    static setUpHandleBarsHelpers () {
        Env.handlebars.registerHelper('component', function (str) {
            return `@ludr_component ${str} end`;
        })

        Env.handlebars.registerHelper('globalLinkActive', function (str) {
            const linkActiveClassArr = str.split('data:');

            return linkActiveClassArr.length == 1 ?
                `ludr_link_active_class ${str};` : 
                `ludr_link_active_class ${Env.get(linkActiveClassArr[1])};`
        })

        Env.handlebars.registerHelper('link', function (str) {
            return `data-linkaddress="${str}"`;
        })

        Env.handlebars.registerHelper('linkActive', function (str) {
            return `data-linkactive="${str}"`;
        })
    }

    /**
     * @date 2022-08-08
     * @param {string} string
     * @return {string}
     */
    static extractLinkActiveClass (string) {
        const linkActiveClasses = string.match(/ludr_link_active_class(.*?);/gi) || [];

        return linkActiveClasses[linkActiveClasses.length - 1] ? 
            linkActiveClasses[linkActiveClasses.length - 1].replace('ludr_link_active_class', '').replace(';', '') : 
            '';
    };

    /**
     * Checks whether a path has an extention
     * @date 2022-08-08
     * @param {string} path
     * @return {boolean}
     */
    static hasExt (path) {
        const pathArr = path.split('.');

        return pathArr[pathArr.length - 1] == 'hbs' ||
            pathArr[pathArr.length - 1] == 'handlebars';
    }
};

export default Utils;