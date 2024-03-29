const _ = require('../lodash3');require('lodash-migrate');
const fs = require('node:fs');
var util = require('../util');
var config = require('../core/util.js').getConfig();
var dirs = util.dirs();

// build a config object out of a directory of JS files
module.exports = function() {
  const configDir = util.dirs().config;

  // attach the proper adapter
  let adapter = config.adapter;

  if(config.tradingAdvisor.enabled) {
    // also load the strat
    let strat = config.tradingAdvisor.method;
    let stratFile = configDir + 'strategies/conf/' + strat + '_conf' + '.js';
    if(!fs.existsSync(stratFile))
      util.die('Cannot find the strategy config file for ' + strat);
  }

  const mode = util.gekkoMode();

  if(mode === 'backtest')
  return config;
}

/*

The MIT License (MIT)
Copyright (c) 2014-2017 Mike van Rossum mike@mvr.me
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
