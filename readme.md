# Ludr.js
A JavaScript Single Page Application (SPA) Framework

`Under development`

## Usage
___

src\app.js
```JavaScript
import Ludr from "Ludr";

import layouts from "./layouts";
import components from "./components";
import routes from "./routes";
import events from "./events";

layouts();
components();
routes();
events();

Ludr.Config.showInfo = true;

Ludr.Load();
```

## Layouts
Define the layout of components to use on page load
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
Building blocks of the application, they are loaded individually and cached and re-used where necessary
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

```

src\components\profile.hbs

```handlebars
<p>This is my profile.</p>
<p>And i know stuff: {{ foo }}</p>
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