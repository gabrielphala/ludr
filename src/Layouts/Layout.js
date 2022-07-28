import Config from "../Config";
import Url from "../Url";
import Utils from "../Utils";
import Layouts from "./index";
import Components from "../Components";
import Env from "../Env";
import Middleware from "../Middleware";
import Blueprint from "../Lexer/Blueprint";
import Router from "../Router";

class Layout {
    constructor (name, path, data = {}) {
        this.name = name;
        this.content = '';
        this.data = { ...Env.globalContainer, ...data };

        path = Utils.hasExt(path) ? path : `${path}.${Config.viewsExt}`;

        this.path = Url.cleanURL(`${Config.layoutViews}/${path}`);
    }

    removeLabels () {
        this.content = this.content.replace(/ludr_component_start(.*?);/g, '');
        this.content = this.content.replace(/ludr_link_active_class(.*?);/g, '');
        this.content = this.content.replace(/ludr_component_end/g, '');
    }

    build () {
        Middleware.add(async next => {
            const layoutContent = await Utils.fetch(this.path);

            this.content = Env.handlebars.compile(layoutContent)(this.data);

            const components = Utils.extractComponentNames(this.content);

            for (let i = 0; i < components.length; i++) {
                const componentName = components[i].trim(),
                    component = Components.use(componentName);

                let componentHTML = await Utils.fetch(component.path);

                componentHTML = Env.handlebars.compile(componentHTML)(component.data);

                this.content = this.content.replace(
                    new RegExp(`@ludr_component${components[i]};`, 'gi'),
                    ` ludr_component_start ${componentName}; ${componentHTML} ludr_component_end `
                )

                component.linkActiveClass = Utils.extractLinkActiveClass(componentHTML).trim();
            }

            Router.currentRoute.blueprint = (new Blueprint(this.name, this.content)).makeBlueprint();

            this.removeLabels()

            next();
        })
    }

    removeClassElement (className) {
        document.getElementsByClassName(className)[0].remove()
    }

    removeIdElement (idName) {
        document.getElementById(idName).remove()
    }

    removeUnusedElements (oldBlueprint, currentBlueprint) {
        Utils.iterate(oldBlueprint, element => {
            if (!currentBlueprint[element]) {
                if (oldBlueprint[element].id.type == 'class')
                    return this.removeClassElement(oldBlueprint[element].id.value);

                return this.removeIdElement(oldBlueprint[element].id.value);
            }
        })
    }

    addNewElements (oldBlueprint, currentBlueprint) {
        Utils.iterate(currentBlueprint, elementName => {
            const element = currentBlueprint[elementName];

            if (!oldBlueprint[elementName]) {
                let parent = element.parent.id.value == 'root' ?
                    document.body :
                    (
                        element.parent.id.type == 'id' ?
                            document.getElementById(element.parent.id.value) :
                            document.getElementsByClassName(element.parent.id.value)[0]
                    )

                const newElement = document.createElement(element.element.type);

                if (element.component.isComponent)
                    newElement.innerHTML = element.component.innerHTML;

                else
                    newElement.innerText = element.element.innerText;

                parent.append(newElement);
            }
        })
    }
}

export default (name, path) => Layouts.add(name, new Layout(name, path));