/*
Custom event emitter.Turns sync events from LIFO into a FIFO stack based model
(https://forum.gekko.wizb.it/thread-56579.html)
*/
const _ = require('./lodash3');require('lodash-migrate');
const trailingStop=require('../exchange/triggers/trailingStop');
const util = require('node:util');
const events = require('node:events');
var NativeEventEmitter = events.EventEmitter;
var GekkoEventEmitter = function() {
  _.bindAll(this,_.functions(this));
  NativeEventEmitter.call(this);
  this.defferedEvents = [];
}
util.inherits(GekkoEventEmitter, NativeEventEmitter);

GekkoEventEmitter.prototype.deferredEmit = function(name, payload) {
  this.defferedEvents.push({name, payload});
}
GekkoEventEmitter.prototype.broadcastDeferredEmit = function() {
  if(this.defferedEvents.length === 0)
    return false;
  var event = this.defferedEvents.shift();
  this.emit(event.name, event.payload);
  return true;
}

module.exports = GekkoEventEmitter;

/*
The MIT License (MIT)
Copyright (c) 2014-2017 Mike van Rossum mike@mvr.me
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
