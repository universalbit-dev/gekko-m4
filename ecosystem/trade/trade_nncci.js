var config = {};
config.debug =true;
config.watch = {exchange:'kraken',currency:'XBT',asset:'LTC',tickrate:20};
config.trader={enabled:true,
exchange:'kraken',currency:'XBT',asset:'LTC',
key:'000000000-00000000000000-0000000000000000000',
secret:'000000000-00000000000000-0000000000000000000',tickrate:20
};

config.tradingAdvisor = {enabled:true,candleSize:15,historySize:10,method:'NNCCI'};
//requiredHistory = candleSize 15 * historySize 10 = 150 minutes

//optInTimePeriod : Fibonacci Sequence 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377 , 610 , 987
config.NNCCI={
threshold_buy:1,threshold_sell:-1,method:'adadelta',learning_rate:0.01,momentum:0.0,
l1_decay:0.001,l2_decay:0.001,threshold:1,price_buffer_len:987,min_predictions:144,
hodl_threshold:1,scale:1,batch_size:1,constant:0.015,history:89,cci:21,dema:1};
//history:89, make same or smaller than requiredHistory (history:89 requiredHistory:150)

config.NNCCI.thresholds={up:150,down:-30,persistence:3};
config.adapter='sqlite';config.adapter.path= 'plugins/sqlite';
config.sqlite = {path: 'plugins/sqlite',dataDirectory: 'history',version:'5.1.1',
dependencies:[{module: 'sqlite3',version:'5.1.7'}] };
config.candleWriter={enabled:true,adapter:'sqlite'};
config.adviceLogger={enabled:true};
config.backtest = {enabled:false};
config.backtestResultExporter = {enabled: false};
config.paperTrader = {enabled: false};
config.performanceAnalyzer = {enabled: true,riskFreeReturn: 5};
config.importer = {enabled:false};
config['I understand that Gekko only automates MY OWN trading strategies']=true;
module.exports = config;

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