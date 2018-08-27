/* eslint-env mocha */
/* eslint-disable global-require */

'use strict';

const plugin = require('../lib');

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rules = fs.readdirSync(path.resolve(__dirname, '../lib/rules/'))
  .map(f => path.basename(f, '.js'));

const defaultSettings = {};

describe('all rule files should be exported by the plugin', () => {
  rules.forEach((ruleName) => {
    it('should export ' + ruleName, () => {
      assert.equal(
        plugin.rules[ruleName],
        require(path.join('../lib/rules', ruleName)) // eslint-disable-line import/no-dynamic-require
      );
    });

    it('should configure ' + ruleName + ' off by default', () => {
      assert.equal(
        plugin.rulesConfig[ruleName],
        0
      );
    });
  });
});
