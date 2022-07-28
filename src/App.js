import Router from "./Router";
import Layouts from "./Layouts"
import Config from "./Config";
import Env from "./Env"
import Middleware from "./Middleware";

export const Load = () => {
    // Log info
    if (Config.showInfo) {
        console.log(
            `base views: ${Config.baseViews}` +
            `\ncomponent views: ${Config.componentViews}` +
            `\nlayout views: ${Config.layoutViews}`
        );
    }

    Env.handlebars.registerHelper('component', function (str) {
        return `@ludr_component ${str};`;
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

    const route = Router.getRoute();

    Router.currentRoute = route;

    Layouts.build(route.layout);

    Middleware.run();
}

export const Next = (path) => {
    const currentRoute = Router.currentRoute;
    const nextRoute = Router.getRoute(path);

    Router.currentRoute = nextRoute;

    Layouts.switch(currentRoute, nextRoute);

    Middleware.run();

    nextRoute.updateHistory(path);
}