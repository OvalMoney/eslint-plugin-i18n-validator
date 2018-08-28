# eslint-plugin-i18n-validator
[![Coverage Status](https://coveralls.io/repos/github/OvalMoney/eslint-plugin-i18n-validator/badge.svg?branch=master)](https://coveralls.io/github/OvalMoney/eslint-plugin-i18n-validator?branch=master)
[![Build Status](https://travis-ci.org/OvalMoney/eslint-plugin-i18n-validator.svg?branch=master)](https://travis-ci.org/OvalMoney/eslint-plugin-i18n-validator)

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

## Examples

### Simple
This will search among all jsons for `foo` key

JS
```js
I18n.t(`foo`);
```
JSON
```json
{
    "foo": "Foo value"
}
```

### Nested
This will search among all jsons for plain or nested `foo1.foo2` key

JS
```js
I18n.t(`foo1.foo2`);
```
JSON
```json
{
    "foo1.foo2": "Foo value",
}
```
OR
```json
{
    "foo1": {
        "foo2": "Foo value"
    }
}
```

### Template Literals in translation key
This will search among all jsons for plain or nested `foo.bar1` and `foo.bar2` keys

JS
```js
I18n.t(`foo.${bar}`); /* eslint-plugin-i18n-validator/json-key-exists { "bar": ["bar1","bar2"]} */
```

JSON
```json
{
    "foo.bar1": "Bar1 value",
    "foo.bar2": "Bar2 value"
}
```
OR
```json
{
    "foo": {
        "bar1": "Bar1 value",
        "bar2": "Bar2 value"
    }
}
```

### Conditional Expression in translation key
This will search among all jsons for `foo` and `bar` keys

JS
```js
I18n.t(foo ? `foo` : `bar`);
```

JSON
```json
{
    "foo": "Foo value",
    "bar": "Bar value
}
```
