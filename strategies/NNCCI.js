const { spawn } = require('node:child_process');
const { setTimeout: setTimeoutPromise } = require('node:timers/promises');
var _ = require('../core/lodash');
var log = require('../core/log.js');
var config = require('../core/util.js').getConfig();
var tulind = require('../core/tulind');
const fs = require('node:fs');
var math = require('mathjs');

var settings = config.CCI;this.settings=settings;

var convnetjs = require('../core/convnet.js');
var deepqlearn= require('../core/deepqlearn');

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

   this.currentTrend;
   this.age = 0;
   //Date
   startTime = new Date();
   //Info Messages
   		log.info("=====================================");
   		log.info('Running', this.name);
   		log.info('=====================================');
  this.trend = {
    direction: 'undefined',
    duration: 0,
    persisted: false,
    adviced: false
  };
  this.historySize = this.settings.history;
  this.ppoadv = 'none';
  this.uplevel = this.settings.thresholds.up;
  this.downlevel = this.settings.thresholds.down;
  this.persisted = this.settings.thresholds.persistence;
  //CCI
  this.addTulipIndicator('cci', 'cci', {optInTimePeriod: 14 });
  //SMA
  this.addTulipIndicator('sma', 'sma', {optInTimePeriod: 14 });
  //DEMA
  this.addTulipIndicator('emaFast', 'dema', {optInTimePeriod:1});

  this.name = 'NNCCI';
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

  zzzsleep: async function () {
  const x= await sleep(900000);
  log.info('zzz...');
  },

  resetnet: function(){
  this.nn = new convnetjs.Net();
},

 learn : function () {
    for (var i = 0; i < _.size(this.priceBuffer) - 1; i++) {
      var data = [this.priceBuffer[i]];
      var current_price = [this.priceBuffer[i + 1]];
      var vol = new convnetjs.Vol(data);
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
    var action = brain.forward(state); //returns index of chosen action
    var reward = action === 0 ? 1.0 : -1.0;
    brain.backward([reward]); // <-- learning magic happens here
    state[Math.floor(Math.random()*3)] += Math.random()*2-0.5;
  }
  brain.epsilon_test_time = 0.0;//don't make any more random choices
  brain.learning = true;

  var action = brain.forward([this.priceBuffer[k + 1]]);
  },


update : function(candle) {
if(_.size(this.priceBuffer) > this.settings.price_buffer_len)
  //remove oldest priceBuffer value
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

//log book
    fs.appendFile('logs/csv/' + config.watch.asset + ':' + config.watch.currency + '_' + this.name + '_' + startTime + '.csv',
  	candle.start + "," + candle.open + "," + candle.high + "," + candle.low + "," + candle.close + "," + candle.vwp + "," + candle.volume + "," + candle.trades + "\n", function(err) {
  	if (err) {return console.log(err);}
  	});
  },

  predictCandle : function(candle) {
    var vol = new convnetjs.Vol(this.priceBuffer);
    var prediction = this.nn.forward(vol);
    return prediction.w[0];
  },

zzzsleep: async function () {
  const x= await sleep(900000);
  log.info('zzz...');
  },

log : function(candle) {
    var cci = this.tulipIndicators.cci.result.result;
    if (typeof(cci) == 'boolean') {
        log.debug('Insufficient data available. Age: ', cci.size, ' of ', cci.maxSize);
        return;
    }

    log.info('calculated CCI properties for candle:');
    log.info('\t', 'Price:\t\t', candle.close);


    if (typeof(cci) == 'boolean' )
        log.debug('\t In sufficient data available.');
    else
        log.debug('\t', 'CCI:\t\t', cci);
},

check : function(candle) {
    var lastPrice = candle.close;this.age++;
    var cci = this.tulipIndicators.cci.result.result;

    if(this.predictionCount > this.settings.min_predictions)
    {
      var prediction = this.predictCandle() * this.settings.scale;
      var currentPrice = candle.close;
      var meanp = math.mean(prediction, currentPrice);
      //when alpha is the "excess" return over an index, what index are you using?
      var meanAlpha = (meanp - currentPrice) / currentPrice * 100;
      var signalSell = (candle.close > this.prevPrice) || (candle.close <
      (this.prevPrice * this.settings.hodl_threshold));
      var signal = meanp < currentPrice;log.info('\t', 'meanAlpha:\t',meanAlpha);
    }


    if (typeof(cci) == 'number') {
    //overbought?
    if (cci >= this.uplevel && (this.trend.persisted || this.persisted == 0) && !this.trend.adviced && this.trend.direction == 'overbought' && meanAlpha < 0) {
            this.trend.adviced = true;
            this.trend.duration++;
            this.advice('short');
        }
        else if (cci >= this.uplevel && this.trend.direction != 'overbought') {
            this.trend.duration = 1;
            this.trend.direction = 'overbought';
            this.trend.persisted = false;
            this.trend.adviced = false;
            if (this.persisted == 0) {
                this.trend.adviced = true;
                this.advice('short');
            }
        }
        else if (cci >= this.uplevel) {
            this.trend.duration++;
            if (this.trend.duration >= this.persisted) {
                this.trend.persisted = true;
            }
        }
        else if (cci <= this.downlevel && (this.trend.persisted || this.persisted == 0) && !this.trend.adviced && this.trend.direction == 'oversold' && meanAlpha > 0) {
            this.trend.adviced = true;
            this.trend.duration++;
            this.advice('long');
        }
        else if (cci <= this.downlevel && this.trend.direction != 'oversold') {
            this.trend.duration = 1;
            this.trend.direction = 'oversold';
            this.trend.persisted = false;
            this.trend.adviced = false;
            if (this.persisted == 0) {
                this.trend.adviced = true;
                this.advice('long');
            }
        }
        else if (cci <= this.downlevel) {
            this.trend.duration++;
            if (this.trend.duration >= this.persisted) {
                this.trend.persisted = true;
            }
        }
        else {
            if( this.trend.direction != 'nodirection') {
                this.trend = {
                    direction: 'nodirection',
                    duration: 0,
                    persisted: false,
                    adviced: false
                };
            }
        else {
                this.trend.duration++;
            }
            this.advice();
        }

    } else {
        this.advice();
    }
    log.debug("Trend: ", this.trend.direction, " for ", this.trend.duration);

},
end : function() {log.info('THE END');}
};
module.exports = method;
