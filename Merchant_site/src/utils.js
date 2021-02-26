/**  Copyright (c) 2021 Mastercard
 
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 
    http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 
*/
export function checkBrowser() {
    var agentObject = navigator.userAgent;
    var browserName = '';
    if (agentObject.match(/Edge|Edga/i)) {
        browserName = 'edge';
    } else if (agentObject.match(/UCBrowser|UBrowser/i)) {
        browserName = 'ucbrowser';
    } else if (agentObject.match(/Opera|OPR|Oupeng/i)) {
        browserName = 'opera';
    } else if (agentObject.match(/Firefox/i)) {
        browserName = 'firefox';
    } else if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
        browserName = 'chrome';
    } else if (agentObject.match(/iphone|iPad/i) && agentObject.match(/safari/i)) {
        //only Mobile safari
        browserName = 'safari';
    } else if (agentObject.match(/Opera|OPR/i)) {
        browserName = 'opera'
    } else if (agentObject.match(/safari/i)) {
        //Only Web safari
        browserName = 'safari';
    }
    return browserName;
}

export var isMobile = {
    Android: function () {
        return /Android/i.test(navigator.userAgent);
    },
    BlackBerry: function () {
        return /BlackBerry/i.test(navigator.userAgent);
    },
    iOS: function () {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    },
    Opera: function () {
        return /Opera Mini/i.test(navigator.userAgent);
    },
    Windows: function () {
        return /IEMobile/i.test(navigator.userAgent);
    },
    any: function () {
        return (/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent));
    }
};

export function formatCurrency(value, currencyCode) {
    if (typeof Intl === 'object' && typeof Intl.NumberFormat === 'function') {
        return new Intl.NumberFormat(
            'en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            currencyDisplay: "symbol",
        }
        ).format(value);
    } else {
        return value;
    }
}

export function generateId() {
    return Math.random().toString(36).replace('0.', '');
}

/**
 * Defines utility methods to work with the query string of a URL.
 */
export let urlSearchParams = {
    /**
     * Returns a Boolean indicating if such a given parameter exists.
     * @param {string} queryParam The name of the parameter to find.
     * @param {string} url_string URL as a string
     */
    has: function (queryParam, url_string) {
        try {
            let searchParams = (new URL(url_string)).searchParams;
            return searchParams.has(queryParam);
        } catch (error) {
            return url_string.indexOf(queryParam) >= 0;
        }
    },
    /**
     * Returns the first value associated with the given search parameter.
     * @param {string} queryParam The name of the parameter to find.
     * @param {string} url_string URL as a string
     */
    get: function (queryParam, url_string) {
        if (typeof URL === "function") {
            let url = new URL(url_string);
            let query = url.search.substring(1);
            let parms = query.split("&");

            //Iterate the search parameters.
            for (let i = 0; i < parms.length; i++) {
                let pos = parms[i].indexOf("=");
                if (pos > 0 && queryParam == parms[i].substring(0, pos)) {
                    return parms[i].substring(pos + 1);
                }
            }
            return "";
        } else {
            let href = url_string;
            //this expression is to get the query strings
            let reg = new RegExp('[?&]' + queryParam + '=([^&#]*)', 'i');
            let queryString = reg.exec(href);
            return queryString ? queryString[1] : null;
        }
    }
};


export function httpPost(url, data) {
    return new Promise(function (resolve, reject) {
        try {
            fetch(url, {
                credentials: 'include',
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then(function (response) {
                    return response.json()
                }).then(function (result) {
                    resolve(result);
                }).catch(function (error) {
                    reject(error);
                });
        } catch (error) {
            reject(error);
            console.log(error);
        }
    });
}