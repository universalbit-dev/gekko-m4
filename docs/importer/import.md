

* import mode

| Plugin         | description     | enable  |
|--------------|-----------|------------|
| BackTest | Testing your strategy      | disabled        |
| CandleWriter | Store Candle in a database      | enabled        |
| PaperTrader      | Simulate Fake Trades  | disabled       |
| Importer | Import Exchange Data      | enabled        |
| TradingAdvisor | Advice Buy-Sell Orders      | disabled        |



```
node gekko -c method.nn -i
```

##### *Terminal OutPut:
---
```
(INFO):	Setting up Gekko in importer mode
(INFO):
(INFO):	Setting up:
(INFO):		 Candle writer
(INFO):		 Store candles in a database
(INFO):
```

* import [mode]

method-nn.js

```
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
config.watch = {exchange: 'kraken',currency:'XBT',asset:'LTC',tickrate:10};

//Trading Advisor
config.tradingAdvisor = {enabled:false,candleSize:1,historySize:10};
config.tradingAdvisor.method= 'NN';

/*
|NO-BUY||NO-SELL|
*/

///https://cs.stanford.edu/people/karpathy/convnetjs/demo/trainers.html
config.NN= {
interval:3,threshold_buy:1.0,threshold_sell:-1.0,method:'sgd',learning_rate:0.01,momentum:0.9,
l1_decay:0.001,decay:0.001,DEMA:5,stoploss_enabled:false,stoploss_threshold:0.85,
hodl_threshold:1,price_buffer_len:100,min_predictions:9
};

//Adapter
config.adapter='sqlite';

//Trader
config.trader={enabled:false,exchange:'',currency:'',asset:'',key:'',secret:''};

config.candleWriter={enabled:true,adapter:'sqlite'};

config.adviceLogger={enabled:false};
config.backtestResultExporter={enabled:false};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING BACKTESTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
config.backtest = {
  enabled:false,
  daterange: {
    from: "2021-01-01",to: "2021-03-01"
  },
  batchSize: 50
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING PAPERTRADER
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
config.paperTrader = {enabled: false,
  reportInCurrency: true,
  simulationBalance: {asset: 1,currency: 100},
  feeMaker: 0.15,feeTaker: 0.25,feeUsing: 'maker',
  slippage: 0.05
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING PERFORMANCE ANALYZER
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
config.performanceAnalyzer = {enabled: false,riskFreeReturn: 5};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING IMPORTER
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
config.importer = {
  enabled:true,
  daterange:{from:"2021-01-01",to:"2021-03-01"}
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING DB
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

config.sqlite = {path: 'plugins/sqlite',dataDirectory: 'history',version:'4.1.2',dependencies:[{module: 'sqlite3',version:'5.1.4'}] };
config['I understand that Gekko only automates MY OWN trading strategies']=true;
module.exports = config;
```