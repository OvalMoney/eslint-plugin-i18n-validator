/**
 * @fileoverview Check components keys exists in json files
 * @author Fabio Todaro
 */
"use strict";

const path = require('path');
const dotty = require("dotty");
const render = require('es6-template-render');

function getCombinations(options, optionIndex, results, current) {
    var allKeys = Object.keys(options);

    if (allKeys.length === 0) return results;

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
                jsonBaseURIs: {
                    type: ['array'],
                    items: {
                        type: ['string', 'object'],
                    },
                },
            },
            type: 'object',
        }],
    },

    create: function(context) {
        let jsonBaseURIs = context.options[0] ? context.options[0].jsonBaseURIs : [];
        let jsons = [];
        const sourceCode = context.getSourceCode();

        jsonBaseURIs.forEach((jsonBaseURI) => {
            let resolver;
            try {
                if (typeof jsonBaseURI === 'string')
                    jsonBaseURI = {
                        baseURI: jsonBaseURI
                    }
                
                if (!jsonBaseURI.resolver)
                    resolver = require('../resolvers/baseResolver');
                else
                    resolver = require(path.resolve(jsonBaseURI.resolver));
                    
            } catch(e) {
                context.report({
                    message: "JSONBaseURI config: {{jsonBaseURI}} invalid resolver" + e,
                    data: {
                        jsonBaseURI: JSON.stringify(jsonBaseURI),
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
            
            let {
                jsons: resolverResults,
                errors: resolverErrors
            } = resolver(context.options[0].locales, jsonBaseURI);

            if (resolverErrors.length) {
                resolverErrors.forEach(error =>{
                    context.report({
                        message: "JSONBaseURI config: {{jsonBaseURI}} error: " + error,
                        data: {
                            jsonBaseURI: JSON.stringify(jsonBaseURI),
                        },
                        loc: {
                            start: {
                            line: 0,
                            col: 0,
                            },
                        },
                    });
                });
                return;
            }
            jsons = [...jsons, ...resolverResults];
        });

        if (!jsons.length) {
            context.report({
                message: "No JSONs to match with found",
                loc: {
                    start: {
                      line: 0,
                      col: 0,
                    },
                },
            });
            return {};
        }


        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------      

        function checkKeyExists(key) {
            let errors = []

            jsons.forEach((json) => {
                errors = [...errors, ...checkKeyExistsInJSON(json, key)];
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
            let valuesDict = {};
            let errors = [];

            comments.forEach((comment) => {
                if (comment.value.includes("eslint-plugin-i18n-validator/json-key-exists"))
                    try {
                        let templatingValues = JSON.parse(comment.value.match(/\{.*\}/)[0]);
                        valuesDict = Object.assign(valuesDict, templatingValues);
                    } catch(e) {
                        errors.push({
                            message: "Failed parsing comment JSON: {{comment}}",
                            data: {
                                comment: comment.value,
                            },
                        });
                    }
            });

            return {valuesDict, errors};
        }

        function renderTemplatedKey(key, templatingValuesDict) {

            let templateKeys = {};
            let renderedKeys = [];

            key.expressions.forEach((expression) => {
                let templateKey = sourceCode.getText(expression);
                if(!templatingValuesDict.hasOwnProperty(templateKey) && !dotty.exists(templatingValuesDict, templateKey)) {
                    context.report({
                        node: expression,
                        message: "Missing template key: {{templateKey}} in Template JSON valid values: {{json}}",
                        data: {
                            templateKey: templateKey,
                            json: JSON.stringify(templatingValuesDict),
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

                const comments = [...sourceCode.getCommentsInside(node), ...sourceCode.getCommentsAfter(node), ...sourceCode.getCommentsAfter(node.parent)]

                // Parse comments for templating keys valid values
                const {
                    valuesDict: templatingValuesDict,
                    errors: templatingErrors,
                } = parseComments(comments);

                if (templatingErrors.length) {
                    reportErrors(node, templatingErrors);
                    return
                }
                
                switch(firstArg.type) {
                    case 'Literal':
                        keys.push(firstArg.value)
                        break
                    case 'TemplateLiteral':
                        keys = [...keys, ...renderTemplatedKey(firstArg, templatingValuesDict)];
                        break
                    case 'ConditionalExpression':
                        if (firstArg.consequent.type === 'Literal')
                            keys.push(firstArg.consequent.value);
                        else if (firstArg.consequent.type === 'TemplateLiteral')
                            keys = [...keys, ...renderTemplatedKey(firstArg.consequent, templatingValuesDict)];
                        if (firstArg.alternate.type === 'Literal')
                            keys.push(firstArg.alternate.value);
                        else if (firstArg.alternate.type === 'TemplateLiteral')
                            keys = [...keys, ...renderTemplatedKey(firstArg.alternate, templatingValuesDict)];
                }

                keys.forEach((key) => {
                    errors = [...errors, ...checkKeyExists(key)];
                });

                reportErrors(firstArg, errors);
            },

        };
    },
};
