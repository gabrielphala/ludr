import Position from "./Position";
import { numbers, alpha, elements } from "./Chars";
import Utils from "../Utils";

export default class Blueprint {
    constructor (name, layout) {
        this.layoutName = name;
        this.layout = layout;
        this.blueprint = {};
        this.currentChar = null;
        this.pos = new Position()

        this.next();
    }

    next () {
        this.pos.next(this.currentChar);

        this.currentChar = this.pos.index < this.layout.length ? this.layout[this.pos.index] : null;
    }

    getParent (hierachy) {
        let parent = {
            id: {
                value: 'root'
            }
        };

        Utils.iterate(this.blueprint, elementName => {
            if (this.blueprint[elementName].hierachy == hierachy) {
                parent = {
                    id: {
                        type: this.blueprint[elementName].id.type,
                        value: this.blueprint[elementName].id.value
                    }
                };

                this.blueprint[elementName].isParent = true; 
            }
        })

        return parent;
    }

    getNonParents (callback) {
        Utils.iterate(this.blueprint, element => {
            if (!this.blueprint[element].isParent) {
                callback(this.blueprint[element])
            }
        })
    }
    
    getPastTokenChar (token, offset = 1) {
        return this.layout[this.pos.index - token.length - offset] || null;
    }

    getModifier (name, endPos) {
        const pos = this.layout.indexOf(`${name}=`, this.pos.index);
        let modifier = '', quotationMarks = 0, index = pos + name.length + 1;

        if (pos == -1 || pos >= endPos)
            return { modifier: null, pos };

        do {
            if (`"'`.includes(this.layout[index])) { quotationMarks++; index++; continue; }

            modifier += this.layout[index];

            index++;
        } while (quotationMarks < 2);

        return { modifier, pos };
    }

    makeString () {
        const letters = numbers + alpha + '_-.';
        let str = '';

        while (letters.includes(this.currentChar)) {
            str += this.currentChar;

            this.next();
        };

        return str;
    }

    makeBlueprint () {
        let previousToken,
            hierachy = 0,
            isInsideComponent = false,
            componentRootHierachy,
            componentName,
            componentLine,
            totalComponentLines = 1,
            classes = [];

        while (this.currentChar != null) {
            if (this.currentChar == "\n" && isInsideComponent) {
                componentLine++;
                totalComponentLines++;
            }

            if (" \t\r".includes(this.currentChar)) {
                this.next();

                continue;
            }

            let token = alpha.includes(this.currentChar) ? this.makeString() : this.currentChar;

            if (previousToken == 'ludr_component_start') {
                componentLine = 1;
                componentName = token;
                isInsideComponent = true;
                componentRootHierachy = hierachy + 1;
            }
            
            else if (token == 'ludr_component_end') {
                componentName = '';
                isInsideComponent = false;
                componentRootHierachy = null;
            }

            else if (elements.includes(token) && this.getPastTokenChar(token) == '<') {
                ++hierachy;

                if (isInsideComponent && hierachy != componentRootHierachy) 
                    continue;

                const lastCharPosOTag = this.layout.indexOf('>', this.pos.index);
                const modifiers = this.layout.substring(this.pos.index, lastCharPosOTag);

                let { modifier: id, pos: idPod } = this.getModifier('id', lastCharPosOTag);
                let { modifier: _class, pos: classPos } = this.getModifier('class', lastCharPosOTag);

                _class = _class ? _class.split(' ')[0] : null;

                let classIsUniq = false;

                if (!classes.includes(_class)) {
                    classes.push(_class)

                    classIsUniq = true;
                }

                let errorLine = isInsideComponent ? componentLine : this.pos.line - totalComponentLines + 1;

                let errorMsg = isInsideComponent ?  
                    `Element: ${token}, at line ${errorLine}, in component: ${componentName}, has no id or unique class` : 
                    `Element: ${token}, at line ${errorLine}, in layout: ${this.layoutName}, has no id or unique class`

                const hasId = !(id == null || id.trim() == '' || idPod > lastCharPosOTag);
                const hasClass = !(_class == null || _class.trim() == '' || classPos > lastCharPosOTag || !classIsUniq);

                if (!hasClass && !hasId)
                    throw errorMsg;

                const parent = this.getParent(hierachy - 1);

                id = id ? id : _class;

                let componentInnerHTML;

                let elementStartPos = this.layout.indexOf(`<${token}${modifiers}>`) + `<${token}${modifiers}>`.length;

                if (isInsideComponent) {
                    let componentEndPos = this.layout.indexOf(`</${token}> ludr_component_end`);

                    componentInnerHTML = this.layout.substring(elementStartPos, componentEndPos)
                }

                this.blueprint[id] = {
                    id: {
                        type: !_class ? 'id' : 'class',
                        value: !_class ? id : _class
                    },
                    isParent: false,
                    element: {
                        innerText: '',
                        type: token,
                        startPos: elementStartPos
                    },
                    component: {
                        isComponent: isInsideComponent,
                        innerHTML: componentInnerHTML
                    },
                    hierachy,
                    modifiers,
                    parent
                };
            }

            if (elements.includes(token) && this.getPastTokenChar(token) == '/' && this.getPastTokenChar(token, 2) == '<')
                hierachy--;
            
            previousToken = token;

            this.next()
        }

        this.getNonParents((element) => {
            let endPos = this.layout.indexOf(`</${element.element.type}>`, element.element.startPos);

            element.element.innerText = this.layout.substring(element.element.startPos, endPos);
        })

        return this.blueprint;
    }
};
