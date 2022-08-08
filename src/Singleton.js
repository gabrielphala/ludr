import Env from "./Env";

/**
 * Save key-value pairs
 * @date 2022-08-08
 * @param {string} key
 * @param {number | string | object} value
 * @param {boolean} isGlobal
 */
const put = (key, value, isGlobal = false) => Env.put(key, value, isGlobal);

/**
 * Returns a value associated with the given key
 * @date 2022-08-08
 * @param {key} key
 * @return {number | string | object}
 */
const get = (key) => Env.get(key);

/**
 * Removes a value associated with the given key
 * @date 2022-08-08
 * @param {string} key
 */
const remove = (key) => Env.remove(key)

export default {
    put,
    get,
    remove
};