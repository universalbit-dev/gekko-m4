const _ = require('../lodash3');require('lodash-migrate');
var util = require('../util');
var config = util.getConfig();
var dirs = util.dirs();
var log = require(dirs.core + 'log');
var moment = require('moment');

var adapter = config[config.adapter];
var Reader = require('../../plugins/sqlite/reader');
var daterange = config.backtest.daterange;
var requiredHistory = config.tradingAdvisor.candleSize * config.tradingAdvisor.historySize;

var to = moment.utc(daterange.to);
var from = moment.utc(daterange.from).subtract(requiredHistory, 'm');

if(to <= from)
  util.die('This daterange does not make sense.')

if(!config.paperTrader.enabled)
  util.die('You need to enable the \"Paper Trader\" first to run a backtest.')

if(!from.isValid())
  util.die('invalid `from`');

if(!to.isValid())
  util.die('invalid `to`');

var Market = function() {
  _.bindAll(this,_.functions(this));
  this.pushing = false;
  this.ended = false;
  this.closed = false;

  Readable.call(this, {objectMode: true});

  log.write('');
  log.info('\t=================================================');
  log.info('\tWARNING: BACKTESTING FEATURE NEEDS PROPER TESTING');
  log.info('\tWARNING: ACT ON THESE NUMBERS AT YOUR OWN RISK!');
  log.info('\t=================================================');
  log.write('');

  this.reader = new Reader();


  log.debug('*** Requested', requiredHistory, 'minutes of warmup history data, so reading db since', from.format(), 'UTC', 'and start backtest at', daterange.from, 'UTC');

  this.batchSize = config.backtest.batchSize;
  this.iterator = {
    from: from.clone(),
    to: from.clone().add(this.batchSize, 'm').subtract(1, 's')
  }
}
util.makeEventEmitter(Market);


var Readable = require('stream').Readable;

Market.prototype = Object.create(Readable.prototype, {
  constructor: { value: Market }
});

Market.prototype._read = _.once(function() {
  this.get();
});

Market.prototype.get = function() {
  if(this.iterator.to >= to) {
    this.iterator.to = to;
    this.ended = true;
  }

  this.reader.get(
    this.iterator.from.unix(),
    this.iterator.to.unix(),
    'full',
    this.processCandles
  )
}

Market.prototype.processCandles = function(err, candles) {
  this.pushing = true;
  var amount = _.size(candles);

  if(amount === 0) {
    if(this.ended) {
      this.closed = true;
      this.reader.close();
      this.push({isFinished: true});
    } else {
      util.die('Query returned no candles (do you have local data for the specified range?)');
    }
  }

  if(!this.ended && amount < this.batchSize) {
    var d = function(ts) {
      return moment.unix(ts).utc().format('YYYY-MM-DD');
    }
    var from = d(_.first(candles).start);
    var to = d(_.last(candles).start);
    log.warn(`Simulation based on incomplete market data (${this.batchSize - amount} missing between ${from} and ${to}).`);
  }

  _.each(candles, function(c, i) {
    c.start = moment.unix(c.start);
    this.push(c);
  }, this);

  this.pushing = false;

  this.iterator = {
    from: this.iterator.from.clone().add(this.batchSize, 'm'),
    to: this.iterator.from.clone().add(this.batchSize * 2, 'm').subtract(1, 's')
  }

  if(!this.closed) {
    setTimeout(() => {
      this.get();
    }, 5);
  }
}

module.exports = Market;
