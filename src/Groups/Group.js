import Groups from "./index";

/**
 * Creates a component group
 * @date 2022-08-08
 * @param {string} name
 * @param {array} routes
 */
export default (name, routes) => Groups.add(name, routes);