const moment=require('moment');
//lodash 4.17.15
const _=require('../../core/lodash');
const Errors=require('../exchangeErrors');
const marketData=require('./binance-markets.json');
const exchangeUtils=require('../exchangeUtils');
const retry=exchangeUtils.retry;const scientificToDecimal=exchangeUtils.scientificToDecimal;
const Binance=require('binance');

const Trader=function(config)
{_.bindAll(this, _.functionsIn(this),['roundAmount','roundPrice','isValidPrice','isValidLot']);
if(_.isObject(config))
{
  this.key=config.key;
  this.secret=config.secret;
  this.currency=config.currency.toUpperCase();
  this.asset=config.asset.toUpperCase();
}

let recvWindow=6000;if(config.optimizedConnection){recvWindow=500;}
this.pair=this.asset+this.currency;
this.name='binance';
this.market=_.find(Trader.getCapabilities().markets,(market)=>{return market.pair[0]===this.currency&&market.pair[1]===this.asset});
this.binance=new Binance.BinanceRest({key:this.key,secret:this.secret,timeout:15000,recvWindow,disableBeautification:false,handleDrift:true,});if(config.key&&config.secret){this.fee=0.001;this.getFee(_.noop);this.oldOrder=false;}};const recoverableErrors=['SOCKETTIMEDOUT','TIMEDOUT','CONNRESET','CONNREFUSED','NOTFOUND','Error -1021','Response code 429','Response code 5','Response code 403','ETIMEDOUT','EHOSTUNREACH','EAI_AGAIN','ENETUNREACH'];
const includes=(str,list)=>{if(!_.isString(str))
return false;return _.some(list,item=>str.includes(item));}
Trader.prototype.handleResponse=function(funcName,callback){return(error,body)=>{if(body&&body.code){error=new Error(`Error ${body.code}:${body.msg}`);}
if(error){if(_.isString(error)){error=new Error(error);}
if(includes(error.message,recoverableErrors)){error.notFatal=true;}
if(funcName==='cancelOrder'&&error.message.includes('UNKNOWN_ORDER')){console.log(new Date,'cancelOrder','UNKNOWN_ORDER');return callback(false,{filled:true});}
if(funcName==='checkOrder'&&error.message.includes('Order does not exist.')){console.log(new Date,'Binance doesnt know this order, retrying up to 10 times..');error.retry=10;}
if(funcName==='addOrder'&&error.message.includes('Account has insufficient balance')){console.log(new Date,'insufficientFunds');error.type='insufficientFunds';}
return callback(error);}
return callback(undefined,body);}};Trader.prototype.getTrades=function(since,callback,descending){const processResults=(err,data)=>{if(err)return callback(err);var parsedTrades=[];_.each(data,function(trade){parsedTrades.push({tid:trade.aggTradeId,date:moment(trade.timestamp).unix(),price:parseFloat(trade.price),amount:parseFloat(trade.quantity),});},this);if(descending)callback(null,parsedTrades.reverse());else callback(undefined,parsedTrades);};var reqData={symbol:this.pair,};if(since){var endTs=moment(since).add(1,'h').valueOf();var nowTs=moment().valueOf();reqData.startTime=moment(since).valueOf();reqData.endTime=endTs>nowTs?nowTs:endTs;}
const fetch=cb=>this.binance.aggTrades(reqData,this.handleResponse('getTrades',cb));retry(undefined,fetch,processResults);};Trader.prototype.getPortfolio=function(callback){const setBalance=(err,data)=>{if(err)return callback(err);const findAsset=item=>item.asset===this.asset;const assetAmount=parseFloat(_.find(data.balances,findAsset).free);const findCurrency=item=>item.asset===this.currency;const currencyAmount=parseFloat(_.find(data.balances,findCurrency).free);if(!_.isNumber(assetAmount)||_.isNaN(assetAmount)){assetAmount=0;}
if(!_.isNumber(currencyAmount)||_.isNaN(currencyAmount)){currencyAmount=0;}
const portfolio=[{name:this.asset,amount:assetAmount},{name:this.currency,amount:currencyAmount},];return callback(undefined,portfolio);};const fetch=cb=>this.binance.account({},this.handleResponse('getPortfolio',cb));retry(undefined,fetch,setBalance);};Trader.prototype.getFee=function(callback){const handle=(err,data)=>{if(err){return callback(err);}
const basepoints=data.makerCommission;this.fee=basepoints/10000;callback(undefined,this.fee);}
const fetch=cb=>this.binance.account({},this.handleResponse('getFee',cb));retry(undefined,fetch,handle);};Trader.prototype.getTicker=function(callback){const setTicker=(err,data)=>{if(err)
return callback(err);var result=_.find(data,ticker=>ticker.symbol===this.pair);if(!result)
return callback(new Error(`Market ${this.pair}not found on Binance`));var ticker={ask:parseFloat(result.askPrice),bid:parseFloat(result.bidPrice),};callback(undefined,ticker);};const handler=cb=>this.binance._makeRequest({},this.handleResponse('getTicker',cb),'api/v1/ticker/allBookTickers');retry(undefined,handler,setTicker);};Trader.prototype.getPrecision=function(tickSize){if(!isFinite(tickSize))return 0;var e=1,p=0;while(Math.round(tickSize*e)/e!==tickSize){e*=10;p++;}
return p;};Trader.prototype.round=function(amount,tickSize){var precision=100000000;var t=this.getPrecision(tickSize);if(Number.isInteger(t))
precision=Math.pow(10,t);amount*=precision;amount=Math.floor(amount);amount/=precision;amount=scientificToDecimal(amount);return amount;};Trader.prototype.roundAmount=function(amount){return this.round(amount,this.market.minimalOrder.amount);}
Trader.prototype.roundPrice=function(price){return this.round(price,this.market.minimalOrder.price);}
Trader.prototype.isValidPrice=function(price){return price>=this.market.minimalOrder.price;}
Trader.prototype.isValidLot=function(price,amount){return amount*price>=this.market.minimalOrder.order;}
Trader.prototype.outbidPrice=function(price,isUp){let newPrice;if(isUp){newPrice=price+this.market.minimalOrder.price;}else{newPrice=price-this.market.minimalOrder.price;}
return this.roundPrice(newPrice);}
Trader.prototype.addOrder=function(tradeType,amount,price,callback){const setOrder=(err,data)=>{if(err)return callback(err);const txid=data.orderId;callback(undefined,txid);};const reqData={symbol:this.pair,side:tradeType.toUpperCase(),type:'LIMIT',timeInForce:'GTC',quantity:amount,price:price,timestamp:new Date().getTime()};const handler=cb=>this.binance.newOrder(reqData,this.handleResponse('addOrder',cb));retry(undefined,handler,setOrder);};Trader.prototype.getOrder=function(order,callback){const get=(err,data)=>{if(err)return callback(err);let price=0;let amount=0;let date=moment(0);const fees={};if(!data.length){return callback(new Error('Binance did not return any trades'));}
const trades=_.filter(data,t=>{return t.orderId==order;});if(!trades.length){console.log('cannot find trades!',{order,list:data.map(t=>t.orderId).reverse()});const reqData={symbol:this.pair,orderId:order,};this.binance.queryOrder(reqData,(err,resp)=>{console.log('couldnt find any trade for order, here is order:',{err,resp});callback(new Error('Trades not found'));});return;}
_.each(trades,trade=>{date=moment(trade.time);price=((price*amount)+(+trade.price*trade.qty))/(+trade.qty+amount);amount+=+trade.qty;if(fees[trade.commissionAsset])
fees[trade.commissionAsset]+=(+trade.commission);else
fees[trade.commissionAsset]=(+trade.commission);});let feePercent;if(_.keys(fees).length===1){if(fees.BNB&&this.asset!=='BNB'&&this.currency!=='BNB'){feePercent=this.fee*0.75;}else{if(fees[this.asset]){feePercent=fees[this.asset]/amount*100;}else if(fees.currency){feePercent=fees[this.currency]/price/amount*100;}else{feePercent=this.fee;}}}else{feePercent=this.fee;}
callback(undefined,{price,amount,date,fees,feePercent});}
const reqData={symbol:this.pair,limit:1000,};const handler=cb=>this.binance.myTrades(reqData,this.handleResponse('getOrder',cb));retry(undefined,handler,get);};Trader.prototype.buy=function(amount,price,callback){this.addOrder('buy',amount,price,callback);};Trader.prototype.sell=function(amount,price,callback){this.addOrder('sell',amount,price,callback);};Trader.prototype.checkOrder=function(order,callback){const check=(err,data)=>{if(err){return callback(err);}
if(data.filled===true){return callback(undefined,{executed:true,open:false});}
const status=data.status;if(status==='CANCELED'||status==='REJECTED'||status==='EXPIRED'){return callback(undefined,{executed:false,open:false});}else if(status==='NEW'||status==='PARTIALLY_FILLED'){return callback(undefined,{executed:false,open:true,filledAmount:+data.executedQty});}else if(status==='FILLED'){return callback(undefined,{executed:true,open:false})}
console.log('what status?',status);throw status;};const reqData={symbol:this.pair,orderId:order,};const fetcher=cb=>this.binance.queryOrder(reqData,this.handleResponse('checkOrder',cb));retry(undefined,fetcher,check);};Trader.prototype.cancelOrder=function(order,callback){const cancel=(err,data)=>{this.oldOrder=order;if(err){return callback(err);}
if(data&&data.filled){return callback(undefined,true);}
return callback(undefined,false);};let reqData={symbol:this.pair,orderId:order,};const fetcher=cb=>this.binance.cancelOrder(reqData,this.handleResponse('cancelOrder',cb));retry(undefined,fetcher,cancel);};Trader.getCapabilities=function(){return{name:'Binance',slug:'binance',currencies:marketData.currencies,assets:marketData.assets,markets:marketData.markets,requires:['key','secret'],providesHistory:'date',providesFullHistory:true,tid:'tid',tradable:true,gekkoBroker:0.6,limitedCancelConfirmation:true};};module.exports=Trader;
