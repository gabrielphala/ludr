class Url {
    /**
     * Checks whether the url segment starts with a colon
     * @date 2022-08-08
     * @param {string} urlSegment
     * @return {boolean}
     */
    static isPlaceholder (urlSegment) {
        return urlSegment.charAt(0) == ':';
    };

    /**
     * Removes redundant forward slashes
     * @date 2022-08-08
     * @param {string} url
     * @return {string}
     */
    static cleanURL (url) {
        let cleanUrl = '';

        for (let i = 0; i < url.length; i++) {
            let currentChar = url.charAt(i), 
                nextChar = url.charAt(i + 1);

            if (nextChar && currentChar == nextChar && currentChar == '/')
                continue;

            cleanUrl += currentChar;
        }
        
        return cleanUrl;
    };

    /**
     * Makes a pair of arrays from a pair of url strings 
     * @date 2022-08-08
     * @param {string} unresolvedUrl
     * @param {string} resolvedUrl
     * @return {object}
     */
    static getUrlPair (unresolvedUrl, resolvedUrl) {
        return {
            unresolvedUrlArray: unresolvedUrl.split('/'),
            resolvedUrlArray: resolvedUrl.split('/')
        };
    }

    /**
     * Gets a key-value pair of url params
     * @date 2022-08-08
     * @param {string} unresolvedUrl
     * @param {string} resolvedUrl
     * @return {object}
     */
    static getParams (unresolvedUrl, resolvedUrl) {
        const { unresolvedUrlArray, resolvedUrlArray } = Url.getUrlPair(unresolvedUrl, resolvedUrl);

        let params = {};

        for (let i = 0; i < resolvedUrlArray.length; i++) {
            if (unresolvedUrlArray[i] && Url.isPlaceholder(unresolvedUrlArray[i]))
                params[unresolvedUrlArray[i].slice(1)] = resolvedUrlArray[i];
        }

        return params;
    }

    /**
     * Compares a 'variable' url string to a normal url string
     * @date 2022-08-08
     * @param {string} unresolvedUrl
     * @param {string} resolvedUrl
     * @return {boolean}
     */
    static compare (unresolvedUrl, resolvedUrl) {
        const { unresolvedUrlArray, resolvedUrlArray } = Url.getUrlPair(unresolvedUrl, resolvedUrl);

        let urlsSame = true;

        if (unresolvedUrlArray.length != resolvedUrlArray.length)
            return false;

        for (let i = 0; i < resolvedUrlArray.length; i++) {
            if (unresolvedUrlArray[i] && Url.isPlaceholder(unresolvedUrlArray[i]))
                continue;

            if (unresolvedUrlArray[i] != resolvedUrlArray[i])
                urlsSame = false;
        }

        return urlsSame;
    };
};

export default Url;