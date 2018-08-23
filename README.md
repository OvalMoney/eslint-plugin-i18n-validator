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
        "i18n-validator/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here





