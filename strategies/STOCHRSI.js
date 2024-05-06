const { spawn } = require('node:child_process');
const { setTimeout: setTimeoutPromise } = require('node:timers/promises');
var log = require('../core/log.js');
var config = require('../core/util.js').getConfig();
const _ = require('../core/lodash');
const fs = require('node:fs');
var async = require('async');

var settings = config.STOCHRSI;this.settings=settings;
var stoploss= require('./indicators/StopLoss.js');

var method = {};
method.init = function() {

  this.name = 'STOCHRSI';
  log.info('Start' ,this.name);
  this.trend = {
    direction: 'none',
    duration: 0,
    persisted: false,
    adviced: false
  };

  //optInTimePeriod : Fibonacci Sequence 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377 , 610 , 987 , 1597 , 2584 , 4181


  this.requiredHistory = this.settings.historySize;
  this.addTulipIndicator('rsi', 'rsi', {optInTimePeriod: this.settings.rsi});
  this.addIndicator('stoploss', 'StopLoss', {threshold : this.settings.stoploss});

  this.RSIhistory = [];
  log.info('================================================');
  log.info('keep calm and make somethig of amazing');
  log.info('================================================');
//Date
startTime = new Date();
}

method.update = function(candle) {
rsi=this.tulipIndicators.rsi.result.result;this.rsi=rsi;
this.RSIhistory.push(this.rsi);
if(_.size(this.RSIhistory) > this.settings.interval)
// remove oldest RSI value
this.RSIhistory.shift();
this.lowestRSI = _.min(this.RSIhistory);
this.highestRSI = _.max(this.RSIhistory);
this.stochRSI = ((this.rsi - this.lowestRSI) / (this.highestRSI - this.lowestRSI)) * 100;

//log book
fs.appendFile('logs/csv/'
+ config.watch.asset + ':'
+ config.watch.currency + '_' + this.name + '_'
+ startTime + '.csv',candle.start
+ "," + candle.open + "," + candle.high + "," + candle.low + ","
+ candle.close + "," + candle.vwp + "," + candle.volume + "," + candle.trades
+ "\n",
function(err) {if (err) {return console.log(err);}}
);

},

method.log = function() {
  log.debug('calculated StochRSI properties:');
  log.debug('RSI:', rsi);
  log.debug('StochRSI min:' + this.lowestRSI);
  log.debug('StochRSI max:' + this.highestRSI);
  log.debug('StochRSI Value:' + this.stochRSI);
},

method.wait = async function() {
  console.log('keep calm...');await new Promise(r => setTimeout(r, 1800000));//30'minutes'
  console.log('...make something of amazing');
  for (let i = 0; i < 3; i++)
  {if (i === 3) await new Promise(r => setTimeout(r, 600000));}
},

method.check = function(candle) {
    rsi=this.tulipIndicators.rsi.result.result;
	this.rsi=rsi;
	if(this.stochRSI > this.settings.thresholds.high) {
		// new trend detected
		if(this.trend.direction != 'high')
			this.trend = {
				duration: 0,
				persisted: false,
				direction: 'high',
				adviced: false
			};

		this.trend.duration++;

		log.debug('In high since', this.trend.duration, 'candle(s)');

		if(this.trend.duration >= this.settings.thresholds.persistence)
	   {this.trend.persisted = true;}

		if(this.trend.persisted && !this.trend.adviced && this.stochRSI !=100)
		{this.trend.adviced = true;this.advice('short');this.wait();}

		else {log.info('...wait data');}
	}

	else if(this.stochRSI < this.settings.thresholds.low)
	{
		if(this.trend.direction != 'low')
		{
		this.trend = {duration: 0,persisted: false,direction: 'low',adviced: false};
		this.trend.duration++;
		log.debug('In low since', this.trend.duration, 'candle(s)');
		}
		if(this.trend.duration >= this.settings.thresholds.persistence)
		{this.trend.persisted = true;}
		if(this.trend.persisted && !this.trend.adviced && this.stochRSI != 0)
		{this.trend.adviced = true;this.advice('long');this.wait();}

    else {log.info('...wait data');}
	}

	else {this.trend.duration = 0;log.debug('In no trend');log.info('...wait data');}
	//stoploss as Reinforcement Learning
    if ('stoploss' === this.indicators.stoploss.action)
    {log.info('Reinforcement Learning');this.brain();this.prevAction='sell';signal=false;}
}

module.exports = method;
