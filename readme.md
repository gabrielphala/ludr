# Ludr.js
A JavaScript Single Page Application (SPA) Framework

`Under development`, `Requires the handlebars framework`

## Usage
___

src\app.js
```JavaScript
import Ludr from "Ludr";

import layouts from "./layouts";
import components from "./components";
import routes from "./routes";
import events from "./events";
import groups from "./groups";
import middleware from "./middleware";

routes();
middleware();
layouts();
components();
groups();
events();

Ludr.Config.showInfo = true;

Ludr.Load();
```

## Layouts
Define the layout of components to use when a page loads
___

src\layouts\index.js

```JavaScript
import { Layout } from "Ludr";

Layout('basic.layout', 'basic', {
    name: 'John Doe'
})
```

src\layouts\basic.hbs

```handlebars
<p>My name is: {{ name }}</p>

{{{ component 'profile' }}}
```

## Components
Building blocks of the application, they are loaded individually, cached and re-used where necessary
___
src\components\index.js

```JavaScript
import { Component } from "Ludr";

Component('profile', {
    path: 'profile',
    data: { 
        foo: 'bar'
    }
});

Component('generic.component.1', {
    path: 'generic-component-1',
});

Component('generic.component.2', {
    path: 'generic-component-2'
});
```

src\components\profile.hbs

```handlebars
<p>This is my profile.</p>
<p>And i know stuff: {{ foo }}</p>
```

## Groups
Components can be grouped together and automatically chosen based on the current page
___
src\groups\index.js

```JavaScript
import { Group } from "Ludr";

// when browser is on /generic-page-1, generic.component.1 will be loaded as baisic-group
Group('basic.group', [
    { component: 'generic.component.1', url: '/generic-page-1' }
    { component: 'generic.component.2', url: '/generic-page-2' }
]);
```

src\components\another.hbs

```handlebars
<p>The following component is dynamic</p>

{{{ component 'basic.group' }}}
```

## Routes
Routes are pages :)
___
src\routes\index.js
```JavaScript
import { Route } from "Ludr";

export default () => {
    Route('profile', {
        title: 'User profile',
        uri: '/:user/profile',
        layout: 'basic.layout'
    });
};
```

## Events
___
src\events\index.js
```JavaScript
import { Events } from "Ludr";

export default () => {
    new (class User extends Events {
        constructor () {
            super(User)
        }

        SignIn (type, e) {
            e.preventDefault();

            // Auth logic here
        }
    });
};
```

src\component\logger.hbs
```handlebars
<form class="sign-in" onsubmit 'User.SignIn("Admin")'>
    <input type="email" placeholder="Email address">
    <input type="password" placeholder="Password">
    <button>Login</button>
</form>
```
## Middleware
Middleware are used for doing somethings before the whole app loads, `Middleware.add` can be overloaded (not recommended) use `Middleware.once` instead
___
src\middleware\index.js

```JavaScript
import { Middleware } from "Ludr";

// Run everywhere
Middleware.add('all', (next) => {
    // do stuff

    next() // goes to next middleware
    // returns, do more
})

// Runs once in the profile page
Middleware.once('profile', (next) => { next() })

// Runs once in the profile page and once in 'page.name.two'
Middleware.once(['profile', 'page.name.two'], (next) => { next() })
```
