<img src="https://github.com/universalbit-dev/gekko-m4/blob/master/images/snail.png" width="200" />

* backtest mode

| Plugin         | description     | enable  |
|--------------|-----------|------------|
| BackTest | Testing your strategy      | enabled        |
| CandleWriter | Store Candle in a database      | disabled        |
| PaperTrader      | Simulate Fake Trades  | enabled       |
| Importer | Import Exchange Data      | disabled        |
| TradingAdvisor | Advice Buy-Sell Orders      | enabled        |

```bash
node gekko -c backtest.js -b
```

* ##### Terminal OutPut:
---
```bash
(INFO):	Setting up Gekko in backtest mode
(INFO):	Setting up:
(INFO):		 Trading Advisor
(INFO):		 Calculate trading advice
(INFO):		 Using the strategy: INVERTER
(INFO):	Setting up:
(INFO):		 Paper Trader
(INFO):		 Paper trader that simulates fake trades.
(INFO):	Setting up:
(INFO):		 Performance Analyzer
(INFO):		 Analyzes performances of trades
(INFO):		WARNING: BACKTESTING FEATURE NEEDS PROPER TESTING
(INFO):		WARNING: ACT ON THESE NUMBERS AT YOUR OWN RISK!
```

* #### [backtest mode ] configuration file

backtest.js
```js
/*
The MIT License (MIT)
Copyright (c) 2014-2017 Mike van Rossum mike@mvr.me
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
Disclaimer:
                              USE AT YOUR OWN RISK!
The author of this project is NOT responsible for any damage or loss caused
by this software. There can be bugs and the bot may not perform as expected
or specified. Please consider testing it first with paper trading and/or
backtesting on historical data. Also look at the code to see what how
it is working.
*/

var config = {};
//General Settings
config.debug =true;

//import kraken exchange data
config.watch = {exchange: 'kraken',currency:'XBT',asset:'LTC',tickrate:5};

//Trading Advisor
config.tradingAdvisor = {enabled:true,candleSize:1,historySize:40,method:'INVERTER'};


//https://cs.stanford.edu/people/karpathy/convnetjs/demo/regression.html
config.NN={
threshold_buy:0.1,threshold_sell:-0.1,method:'adadelta',learning_rate:0.01,momentum:0.0,
l1_decay:0.001,l2_decay:0.001,threshold:1,price_buffer_len:100,min_predictions:3, hodl_threshold:1,scale:5,batch_size:1};

config.INVERTER={rsi:14,adx:14,dema:5,diplus:25.5,diminus:25,longema:240,shortema:50,threshold:3};

config.StochRSI={interval:14,threshold:1};
config.StochRSI.thresholds={low:30,high:70,persistence:5};

config.NNSTOCH={
threshold_buy:1,threshold_sell:-1,method:'adadelta',learning_rate:0.01,momentum:0.0,
l1_decay:0.001,l2_decay:0.001,threshold:1,price_buffer_len:100,min_predictions:1, hodl_threshold:1,scale:5,batch_size:1,i>
config.NNSTOCH.thresholds={low:30,high:70,persistence:3};

//Adapter
config.adapter='sqlite';

//Trader
config.trader={enabled:false,exchange:'',currency:'',asset:'',key:'',secret:''};

config.candleWriter={enabled:false,adapter:'sqlite'};

config.adviceLogger={enabled:true};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING BACKTESTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
config.backtest = {
  enabled:true,
  daterange: {
    from: "2021-01-02",to: "2021-03-01"
  },
batchSize: 60
};

config.backtestResultExporter = {
  enabled: true,
  writeToDisk: true,
  data: {
    stratUpdates: false,
    portfolioValues: true,
    stratCandles: false,
    roundtrips: true,
    trades: true
  }
};


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING PAPERTRADER
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
config.paperTrader = {enabled: true,
  reportInCurrency: true,
  simulationBalance: {asset: 100,currency: 1},
  feeMaker: 0.15,feeTaker: 0.25,feeUsing: 'maker',
  slippage: 0.05
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING PERFORMANCE ANALYZER
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
config.performanceAnalyzer = {enabled: true,riskFreeReturn: 5};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING IMPORTER
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
config.importer = {
  enabled:false,
  daterange:{from:"2021-01-01",to:"2021-03-01"}
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING DB
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

config.sqlite = {path: 'plugins/sqlite',dataDirectory: 'history',version:'4.1.2',dependencies:[{module: 'sqlite3',version:'5.1.4'}] };
config['I understand that Gekko only automates MY OWN trading strategies']=true;
module.exports = config;
```