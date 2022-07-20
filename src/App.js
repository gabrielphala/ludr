import Router from "./Router";
import Layouts from "./Layouts"
import Config from "./Config";
import Env from "./Env"
import Middleware from "./Middleware";

export const Load = () => {
    // Log info
    if (Config.showInfo) {
        console.log(`
            base views: ${Config.baseViews}
            component views: ${Config.componentViews}
            layout views: ${Config.layoutViews}
        `);
    }

    Env.handlebars.registerHelper('component', function (str) {
        return `@ludr_component ${str};`;
    })

    const route = Router.getRoute();

    Layouts.build(route.layout);

    Middleware.run();
}

export const Next = () => {
    // Log info
    if (Config.showInfo) {
        console.log(`
            base views: ${Config.baseViews}
            component views: ${Config.componentViews}
            layout views: ${Config.layoutViews}
        `);
    }

    const route = Router.getRoute();

    Layouts.build(route.layout);
}