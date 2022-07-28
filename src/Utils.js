class Utils {
    static prependToBody (html) {
        let ludrContainer = document.getElementsByClassName('ludr-container')[0];

        if (!ludrContainer) {
            ludrContainer = document.createElement('div');

            ludrContainer.className = 'ludr-container';
        }

        ludrContainer.innerHTML = html;

        document.body.prepend(ludrContainer);
    };

    static async fetch (uri, { method = 'GET', headers = { 'Content-Type': 'application/json;charset=utf-8' }, body } = {}) {

        const response = await fetch(uri, { method, headers, body: JSON.stringify(body) });

        return await response.text();
    };

    static arrayToObject (obj, parents) {
        let replaceValue;

        for (let i = 0; i < parents.length; i++) {
            replaceValue = !replaceValue ? obj[parents[i]] : replaceValue[parents[i]];
        }

        return replaceValue;
    };

    static iterate (obj, callback) {
        for (const key in obj) {
            if (!obj.hasOwnProperty(key))
                continue;

            callback(key);
        }
    };

    // Deprecated
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

    static extractComponentNames (string) {
        const rawTags = string.match(/@ludr_component(.*?);/gi) || [];

        let tags = [];

        rawTags.forEach(rawTag => {
            tags.push(rawTag.replace('@ludr_component', '').replace(';', ''));
        });

        return tags;
    };

    static extractLinkActiveClass (string) {
        const linkActiveClasses = string.match(/ludr_link_active_class(.*?);/gi) || [];

        return linkActiveClasses[linkActiveClasses.length - 1] ? 
            linkActiveClasses[linkActiveClasses.length - 1].replace('ludr_link_active_class', '').replace(';', '') : 
            '';
    };

    static hasExt (path) {
        const pathArr = path.split('.');

        return pathArr[pathArr.length - 1] == 'hbs' ||
            pathArr[pathArr.length - 1] == 'handlebars';
    }
};

export default Utils;