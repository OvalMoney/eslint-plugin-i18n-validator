/**
 * @fileoverview Check components keys exists in json files
 * @author Fabio Todaro
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/json-key-exists"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

const tests = {

    valid: [
        { code: "I18n.t('valid_key_1');" },
        { code: "I18n.translate('valid_key_1');" },
        {
            code: 'I18n.translate(`valid_key_${dynamic}`) /* eslint-plugin-i18n-validator/json-key-exists {\"dynamic\": [\"dynamic_1\",\"dynamic_2\"]} */',
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: 'I18n.translate(`valid_key_${dynamic}` /* eslint-plugin-i18n-validator/json-key-exists {\"dynamic\": [\"dynamic_1\",\"dynamic_2\"]} */\n);',
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: 'I18n.translate(`valid_key_${dynamic}`); /* eslint-plugin-i18n-validator/json-key-exists {\"dynamic\": [\"dynamic_1\",\"dynamic_2\"]} */',
            parserOptions: { ecmaVersion: 6 }
        },
    ],

    invalid: [
        {
            code: "I18n.t('invalid_key_1');",
            errors: [
                {message: "Missing key: invalid_key_1 in JSON: /Users/sharpedge/Projects/Utility/eslint-plugin-i18n-validator/tests/locales/it.json"},
                {message: "Missing key: invalid_key_1 in JSON: /Users/sharpedge/Projects/Utility/eslint-plugin-i18n-validator/tests/locales/en.json"},
            ],
        },
        {
            code: "I18n.translate('invalid_key_2');",
            errors: [
                {message: "Missing key: invalid_key_2 in JSON: /Users/sharpedge/Projects/Utility/eslint-plugin-i18n-validator/tests/locales/it.json"},
                {message: "Missing key: invalid_key_2 in JSON: /Users/sharpedge/Projects/Utility/eslint-plugin-i18n-validator/tests/locales/en.json"},
            ],
        },
        {
            code: 'I18n.translate(`valid_key_${invalid_dynamic}`); /* eslint-plugin-i18n-validator/json-key-exists {\"dynamic\": [\"dynamic_1\",\"dynamic_2\"]} */',
            errors: [
                {message: 'Missing template key: invalid_dynamic in Template JSON valid values: {"dynamic":["dynamic_1","dynamic_2"]}'},
            ],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: 'I18n.translate(`valid_key_${dynamic}`); /* eslint-plugin-i18n-validator/json-key-exists {\"dynamic\": [\"dynamic_1\",\"invalid_value_2\"]} */',
            errors: [
                {message: "Missing key: valid_key_invalid_value_2 in JSON: /Users/sharpedge/Projects/Utility/eslint-plugin-i18n-validator/tests/locales/it.json"},
                {message: "Missing key: valid_key_invalid_value_2 in JSON: /Users/sharpedge/Projects/Utility/eslint-plugin-i18n-validator/tests/locales/en.json"},
            ],
            parserOptions: { ecmaVersion: 6 }
        },
    ],
};


const config = {
    options: [{ 
        locales: ["it", "en"],
        jsonBaseURIs: [
          { baseURI: "./tests/locales/" }
        ]
    }],
};
  
tests.valid.forEach(t => Object.assign(t, config));
tests.invalid.forEach(t => Object.assign(t, config));

ruleTester.run("json-key-exists", rule, tests);
