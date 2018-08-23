/**
 * @fileoverview Validate i18n keys existence
 * @author Fabio Todaro
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var requireIndex = require("requireindex");

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------


// import all rules in lib/rules
module.exports = {
  deprecatedRules: {},
  rules: requireIndex(__dirname + "/rules"),
}



