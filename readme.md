# ENEI Editor

Enei Editor - InPlace html editor for ENEI CMS.

## Install

```shell
npm i @olton/enei-editor
```

## Using
```javascript
import {createEneiEditor} from "@olton/enei-editor"

createEneiEditor({
    shortcut: "alt+ctrl+e",
    serverEndpoint: "http://localhost:5232",
    maxHeight: 300
})
```

Copyright 2023 by [Serhii Pimenov](https://pimenov.com.ua). Licensed Under MIT license.