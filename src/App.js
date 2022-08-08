import Router from "./Router";
import Layouts from "./Layouts"
import Config from "./Config";
import Utils from "./Utils";
import Middleware from "./Middleware";

/**
 * Load route
 * @date 2022-08-08
 */
export const Load = () => {
    if (Config.showInfo) {
        console.log(
            `base views: ${Config.baseViews}` +
            `\ncomponent views: ${Config.componentViews}` +
            `\nlayout views: ${Config.layoutViews}`
        );
    }

    Utils.setUpHandleBarsHelpers();

    const route = Router.getRoute();

    Router.currentRoute = route;

    Layouts.build(route.layout);

    Middleware.run();
}

/**
 * Switch route 
 * @date 2022-08-08
 * @param {path} path
 */
export const Next = (path) => {
    const currentRoute = Router.currentRoute;
    const nextRoute = Router.getRoute(path);

    Router.currentRoute = nextRoute;

    Layouts.switch(currentRoute, nextRoute);

    Middleware.run();

    nextRoute.updateHistory(path);
}