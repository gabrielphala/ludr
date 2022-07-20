class Url {
    static isPlaceholder (urlSegment) {
        return urlSegment.charAt(0) == ':';
    };

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

    static getUrlPair (unresolvedUrl, resolvedUrl) {
        return {
            unresolvedUrlArray: unresolvedUrl.split('/'),
            resolvedUrlArray: resolvedUrl.split('/')
        };
    }

    static getParams (unresolvedUrl, resolvedUrl) {
        const { unresolvedUrlArray, resolvedUrlArray } = Url.getUrlPair(unresolvedUrl, resolvedUrl);

        let params = {};

        for (let i = 0; i < resolvedUrlArray.length; i++) {
            if (unresolvedUrlArray[i] && Url.isPlaceholder(unresolvedUrlArray[i]))
                params[unresolvedUrlArray[i].slice(1)] = resolvedUrlArray[i];
        }

        return params;
    }

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