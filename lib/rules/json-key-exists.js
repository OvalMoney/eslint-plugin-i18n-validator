/**
 * @fileoverview Check components keys exists in json files
 * @author Fabio Todaro
 */
"use strict";

const fs = require('fs');
const dotty = require("dotty");
const render = require('es6-template-render');

function getCombinations(options, optionIndex, results, current) {
    var allKeys = Object.keys(options);
    var optionKey = allKeys[optionIndex];

    var vals = options[optionKey];

    for (var i = 0; i < vals.length; i++) {
        current[optionKey] = vals[i];

        if (optionIndex + 1 < allKeys.length) {
            getCombinations(options, optionIndex + 1, results, current);
        } else {
            // The easiest way to clone an object.
            var res = JSON.parse(JSON.stringify(current));
            results.push(res);
        }
    }

    return results;
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Check components keys exists in json files",
            category: "Fill me in",
            recommended: false,
        },
        fixable: null,  // or "code" or "whitespace"
        schema: [{
            properties: {    
                jsonFilePaths: {
                    type: ['array'],
                    items: {
                        type: "string",
                    },
                },
            },
            type: 'object',
        }],
    },

    create: function(context) {

        let jsonFilePaths = context.options[0].jsonFilePaths;
        let jsons = [];
        const sourceCode = context.getSourceCode();
        
        jsonFilePaths.forEach((jsonFilePath) => {
            try {
                let jsonContent = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
                jsons.push( {
                    path: jsonFilePath,
                    content: jsonContent,
                });
            } catch(e) {
                context.report({
                    message: "Invalid JSON: {{jsonFilePath}}",
                    data: {
                        jsonFilePath,
                    },
                    loc: {
                        start: {
                          line: 0,
                          col: 0,
                        },
                    },
                });
                return;
            }
        });

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------      

        function checkKeyExists(key) {
            let errors = []

            jsons.forEach((json) => {
                errors = errors.concat(checkKeyExistsInJSON(json, key));
            });

            return errors;
        }

        function checkKeyExistsInJSON(json, key) {
            if(!json.content.hasOwnProperty(key) && !dotty.exists(json.content, key)) {
                return [{
                    message: "Missing key: {{key}} in JSON: {{jsonPath}}",
                    data: {
                        key: key,
                        jsonPath: json.path,
                    },
                }];
            }
            return [];
        }

        function parseComments(comments) {
            let templatingValuesDict = {};
            let templatingErrors = [];

            comments.forEach((comment) => {
                if (comment.value.includes("eslint-plugin-i18n-validator/json-key-exists"))
                    try {
                        let templatingValues = JSON.parse(comment.value.match(/\{.*\}/)[0]);
                        templatingValuesDict = Object.assign(templatingValuesDict, templatingValues);
                    } catch(e) {
                        templatingErrors.push({
                            message: "Failed parsing comment JSON: {{comment}}",
                            data: {
                                comment: comment.value,
                            },
                        });
                    }
            });

            return {templatingValuesDict, templatingErrors};
        }

        function renderTemplatedKey(key, templatingValuesDict) {

            let templateKeys = {};
            let renderedKeys = [];

            key.expressions.forEach((expression) => {
                let templateKey = sourceCode.getText(expression);
                if(!templatingValuesDict.hasOwnProperty(templateKey) && !dotty.exists(templatingValuesDict, templateKey)) {
                    context.report({
                        node: key,
                        message: "Missing template key: {{templateKey}} in Template JSON valid values: {{json}}",
                        data: {
                            templateKey: templateKey,
                            json: templatingValuesDict,
                        },
                    });
                    return;
                }
                templateKeys[templateKey] = templatingValuesDict[templateKey] || dotty.get(templatingValuesDict, templateKey);
            });

            getCombinations(templateKeys, 0, [], {}).forEach((combination) => {
                let keyText = sourceCode.getText(key);
                keyText = keyText.substring(1, keyText.length-1);
                renderedKeys.push( render(keyText, combination) );
            });

            return renderedKeys;
        }

        function reportErrors(node, errors) {
            errors.forEach((error) => {
                error.node = node;
                context.report(error);
            });
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {

            "CallExpression[callee.object.name='I18n']:matches([callee.property.name='t'],[callee.property.name='translate'])": function(node) {
                let keys = [];
                let errors = [];
                const firstArg = node.arguments[0];

                // Parse comments for templating keys valid values
                const {
                    templatingValuesDict,
                    templatingErrors,
                } = parseComments(context.getCommentsInside(node));

                if (templatingErrors.length) {
                    reportErrors(node, templatingErrors);
                    return
                }
                
                switch(firstArg.type) {
                    case 'Literal':
                        keys.push(firstArg.value)
                        break
                    case 'TemplateLiteral':
                        keys = keys.concat(renderTemplatedKey(firstArg, templatingValuesDict));
                        break
                    case 'ConditionalExpression':
                        if (firstArg.consequent.type === 'Literal')
                            keys.push(firstArg.consequent.value);
                        else if (firstArg.consequent.type === 'TemplateLiteral')
                            keys = keys.concat(renderTemplatedKey(firstArg.consequent, templatingValuesDict));
                        if (firstArg.alternate.type === 'Literal')
                            keys.push(firstArg.alternate.value);
                        else if (firstArg.alternate.type === 'TemplateLiteral')
                            keys = keys.concat(renderTemplatedKey(firstArg.alternate, templatingValuesDict));
                }

                keys.forEach((key) => {
                    errors = errors.concat(checkKeyExists(key));
                });

                reportErrors(node, errors);
            },

        };
    },
};
