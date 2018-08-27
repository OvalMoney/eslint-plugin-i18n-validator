# eslint-plugin-i18n-validator

Validate i18n keys existence

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-i18n-validator`:

```
$ npm install eslint-plugin-i18n-validator --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-i18n-validator` globally.

## Usage

Add `i18n-validator` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "i18n-validator"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "i18n-validator/json-key-exists": [2, {
            "locales": ["en", "it"],
            "jsonBaseURIs": [
                { "baseURI": "./my/locales/" }
            ]
        }]
    }
}
```

## Supported Rules

### `i18n-validator/json-key-exists`
Checks that each translation key in code has a correspondig translation in jsons locales files.

#### Options

* `locales`: [String] (Required):
    * Array of locales that will be used by the resolver.
* `jsonBaseURIs`: [Object | String] (Required)
    * Can contain objects:
        ```json
        "jsonBaseURIs": [
            {
                "baseURI": "./my/locales/",
                "resolver": "./scripts/myCustomPathResolver",
                "foo": "bar" 
            },
            {
                "baseURI": "https://my.base.url/locales/",
                "resolver": "./scripts/myCustomURLResolver" 
            }
        ]
        ```
    * Can contain strings pointing to a path or a URL:
        ```json
        "jsonBaseURIs": [
            "./my/locales/",
            "https://my.base.url/locales/"
        ]
        ```
        Strings will use the default base resolver

#### Resolver

Resolver gets `locales` and the entire `jsonURIObj` and must return an array of jsons to be checked and eventual errors.

```js
function(locales, jsonURIObj) {
    return {
        jsons: [
            {
                path: "path/of/my.json",
                content: jsonObj
            }
        ],
        errors: [
            "error1",
            "error2"
        ]
    };
}
```

