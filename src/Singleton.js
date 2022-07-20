import Env from "./Env";

const put = (key, value, isGlobal = false) => Env.put(key, value, isGlobal);

const get = (key) => Env.get(key);

const remove = (key) => Env.remove(key)

export default {
    put,
    get,
    remove
};