/*NeuralNetwork*/

/* */
const { spawn } = require('node:child_process');
const { setTimeout: setTimeoutPromise } = require('node:timers/promises');
var log = require('../core/log.js');
var util= require('../core/util.js')
var config = require('../core/util.js').getConfig();
var tulind = require('../core/tulind');
var _ = require('lodash');
//https://cs.stanford.edu/people/karpathy/convnetjs/started.html
var convnetjs = require('../core/convnet.js');
var deepqlearn= require('../core/deepqlearn');
var math = require('mathjs');var uuid = require('uuid');
var fs = require('node:fs');
var settings = config.NN;this.settings=settings;
const sleep = ms => new Promise(r => setTimeout(r, ms));

var method = {
  priceBuffer : [],
  predictionCount : 0,
  stoplossCounter : 0,
  prevPrice : 0,
  prevAction : 'none',
  hodl_threshold : 1,

  init : function() {

    this.requiredHistory = 40;
      this.RSIhistory = [];
    log.info('================================================');
    log.info('keep calm and make somethig of amazing');
    log.info('================================================');

    this.trend = {
    direction: 'none',
    duration: 0,
    persisted: false,
    adviced: false
  };
    //Date
    startTime = new Date();
    //indicators
    this.addIndicator('stoploss', 'StopLoss', {threshold : this.settings.threshold});
    //DEMA
    this.addTulipIndicator('emaFast', 'dema', {optInTimePeriod:9});
    //RSI
    this.addTulipIndicator('rsi', 'rsi', {optInTimePeriod:9});

    this.name = 'NN';
    this.nn = new convnetjs.Net();
    //https://cs.stanford.edu/people/karpathy/convnetjs/demo/regression.html
    const layers = [
      {type:'input', out_sx: 1, out_sy:1, out_depth: 1},
      {type:'fc', num_neurons:10, activation: 'relu'},
      {type:'fc', num_neurons:10, activation:'sigmoid'},
      {type:'regression', num_neurons:1}
    ];

    this.nn.makeLayers(layers);

    if(this.settings.method == 'sgd')
    {
      this.trainer = new convnetjs.SGDTrainer(this.nn, {
        learning_rate: this.settings.learning_rate,
        momentum: 0.9,
        batch_size:8,
        l2_decay: this.settings.l2_decay,
        l1_decay: this.settings.l1_decay
      });
    }
    else if(this.settings.method == 'adadelta')
    {
      this.trainer = new convnetjs.SGDTrainer(this.nn, {
        method: this.settings.method,
        learning_rate: this.settings.learning_rate,
        eps: 1e-6,
        ro:0.95,
        batch_size:1,
        l2_decay: this.settings.l2_decay
      });
    }
    else if(this.settings.method == 'adagrad')
    {
      this.trainer = new convnetjs.SGDTrainer(this.nn, {
        method: this.settings.method,
        learning_rate: this.settings.learning_rate,
        eps: 1e-6,
        batch_size:8,
        l2_decay: this.settings.l2_decay
      });
    }
    else if(this.settings.method == 'nesterov')
    {
      this.trainer = new convnetjs.SGDTrainer(this.nn, {
        method: this.settings.method,
        learning_rate: this.settings.learning_rate,
        momentum: 0.9,
        batch_size:8,
        l2_decay: this.settings.l2_decay
      });
    }
    else if(this.settings.method == 'windowgrad')
    {
      this.trainer = new convnetjs.SGDTrainer(this.nn, {
        method: this.settings.method,
        learning_rate: this.settings.learning_rate,
        eps: 1e-6,
        ro:0.95,
        batch_size:8,
        l2_decay: this.settings.l2_decay
      });
    }
    else
    {
      this.trainer = new convnetjs.Trainer(this.nn, {
        method: 'adadelta',
        learning_rate: 0.01,
        momentum: 0.0,
        batch_size:1,
        eps: 1e-6,
        ro:0.95,
        l2_decay: 0.001,
        l1_decay: 0.001
      });
    }

    this.hodl_threshold = this.settings.hodl_threshold || 1;
  },

  resetnet: function(){
  this.nn = new convnetjs.Net();
  },

  learn : function () {
    for (let i = 0; i < _.size(this.priceBuffer) - 1; i++) {
      let data = [this.priceBuffer[i]];
      let current_price = [this.priceBuffer[i + 1]];
      let vol = new convnetjs.Vol(data);
      this.trainer.train(vol, current_price);
      this.predictionCount++;
    }
  },
  setNormalizeFactor : function() {
    this.settings.scale = Math.pow(10,Math.trunc(candle.high).toString().length+2);
    log.debug('Set normalization factor to',this.settings.scale);
  },
  //Reinforcement Learning
  //https://cs.stanford.edu/people/karpathy/convnetjs/docs.html

  brain:function(){
  var brain = new deepqlearn.Brain(1, 2);
  var state = [Math.random(), Math.random(), Math.random()];
  for(var k=0;k < _.size(this.priceBuffer) - 1;k++)
  {
    var action = brain.forward(state); // returns index of chosen action
    var reward = action === 0 ? 1.0 : -1.0;
    brain.backward([reward]); // <-- learning magic happens here
    state[Math.floor(Math.random()*3)] += Math.random()*2-0.5;
  }
  brain.epsilon_test_time = 0.0; // don't make any more random choices
  brain.learning = true;

  var action = brain.forward([this.priceBuffer[k + 1]]);
  },

  update : function(candle)
  {
  rsi=this.tulipIndicators.rsi.result.result;this.rsi=rsi;
  this.RSIhistory.push(this.rsi);
  if(_.size(this.RSIhistory) > this.interval)
  //remove oldest RSI value
  this.RSIhistory.shift();
  this.lowestRSI = _.min(this.RSIhistory);
  this.highestRSI = _.max(this.RSIhistory);
  this.stochRSI = ((this.rsi - this.lowestRSI) / (this.highestRSI - this.lowestRSI)) * 100;

  if(_.size(this.priceBuffer) > this.settings.price_buffer_len)
  // remove oldest priceBuffer value
  this.priceBuffer.shift();
    emaFast=this.tulipIndicators.emaFast.result.result;
    if (1 === this.settings.scale && 1 < candle.high && 0 === this.predictionCount)
    this.setNormalizeFactor();
    this.priceBuffer.push(emaFast / this.settings.scale );
    if (2 > _.size(this.priceBuffer)) return;
     for (i=0;i<3;++i)
     this.learn();this.brain();
     while (this.settings.price_buffer_len < _.size(this.priceBuffer))
     this.priceBuffer.shift();

    fs.appendFile('logs/csv/' + config.watch.asset + ':' + config.watch.currency + '_' + this.name + '_' + startTime + '.csv',
  	candle.start + "," + candle.open + "," + candle.high + "," + candle.low + "," + candle.close + "," + candle.vwp + "," + candle.volume + "," + candle.trades + "\n", function(err) {
  	if (err) {return console.log(err);}
  	});
  },

  predictCandle : function(candle) {
    let vol = new convnetjs.Vol(this.priceBuffer);
    let prediction = this.nn.forward(vol);
    return prediction.w[0];
  },

  //https://www.investopedia.com/articles/investing/092115/alpha-and-beta-beginners.asp
  check : function(candle) {

    emaFast=this.tulipIndicators.emaFast.result.result;
    rsi=this.tulipIndicators.rsi.result.result;
    this.rsi=rsi;
	if(this.stochRSI > 70) {
		// new trend detected
		if(this.trend.direction !== 'high')
			this.trend = {
				duration: 0,
				persisted: false,
				direction: 'high',
				adviced: false
			};

		this.trend.duration++;

		log.debug('In high since', this.trend.duration, 'candle(s)');

		if(this.trend.duration >= 3)this.trend.persisted = true;

		if(this.trend.persisted && !this.trend.adviced && this.stochRSI !=100)
		{this.trend.adviced = true;}
		else{this.advice();}

	} else if(this.stochRSI < 30) {

		// new trend detected
		if(this.trend.direction !== 'low')
		this.trend = {duration: 0,persisted: false,direction: 'low',adviced: false};
		this.trend.duration++;

		log.debug('In low since', this.trend.duration, 'candle(s)');
		if(this.trend.duration >= 3){this.trend.persisted = true;}
		if(this.trend.persisted && !this.trend.adviced && this.stochRSI != 0)
		{this.trend.adviced = true;}
		else {this.advice();}

	} else {
		// trends must be on consecutive candles
		this.trend.duration = 0;
		log.debug('In no trend');this.advice();
	}



    if(this.predictionCount > this.settings.min_predictions)
    {
      var prediction = this.predictCandle() * this.settings.scale;
      var currentPrice = candle.close;
      var meanp = math.mean(prediction, currentPrice);
      //when alpha is the "excess" return over an index, what index are you using?
      var meanAlpha = (meanp - currentPrice) / currentPrice * 100;
      var signalSell = candle.close > this.prevPrice || candle.close <
      (this.prevPrice*this.settings.hodl_threshold);
      let signal = meanp < currentPrice;
    }
    if ((this.trend.adviced && this.stochRSI != 0 && 'buy' !== this.prevAction)&&
    ('buy' !== this.prevAction && signal === false  && meanAlpha > 1)){
    this.advice('long');sleep(900000);
    this.brain();
    }
    if ((this.trend.adviced && this.stochRSI != 100 &&'sell' !== this.prevAction)&&
    ('sell' !== this.prevAction && signal === true && meanAlpha < -1  &&
    signalSell === true)){
    this.advice('short');sleep(900000);
    this.brain();}

    if ('stoploss' === this.indicators.stoploss.action)
    {
    this.stoplossCounter++;log.info(':',this.indicators.stoploss.action);
    this.brain();this.prevAction='sell';signal=false;
    }

  },

  end : function() {log.info('THE END');}
};
module.exports = method;
