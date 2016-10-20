"use strict";

var assert = require("assert");
var d = require('../dlestx');

var DLE = d.DLE;
var STX = d.STX;
var ETX = d.ETX;

describe('the dlestx module', function() {
  it('should decode a simple message', function (done) {
    var decoder = new d.Decoder();
    decoder.on('data', function(data) {
      assert.deepEqual([0x31, 0x32, 0x33], data);
      done();
    });
    decoder.write(new Buffer([DLE, STX, 0x31, 0x32, 0x33, DLE, ETX]));
  });

  it('should decode two messages', function (done) {
    var decoder = new d.Decoder();
    var count = 0;
    decoder.on('data', function(data) {
      if (count++ === 0) {
        // first packet's data
        assert.deepEqual([0x31, 0x32, 0x33], data);
      } else {
        // second packet's data
        assert.deepEqual([0x34, 0x35, 0x36], data);
        done();
      }
    });
    decoder.write(new Buffer([DLE, STX, 0x31, 0x32, 0x33, DLE, ETX, DLE, STX, 0x34, 0x35, 0x36, DLE, ETX]));
  });

  it('should decode a message with byte stuffing', function (done) {
    var decoder = new d.Decoder();
    decoder.on('data', function(data) {
      assert.deepEqual([0x09, DLE, 0x11], data);
      done();
    });
    decoder.write(new Buffer([DLE, STX, 0x09, DLE, DLE, 0x11, DLE, ETX]));
  });

  it('should decode a message with nonsense preamble and postamble', function (done) {
    var decoder = new d.Decoder();
    decoder.on('data', function(data) {
      assert.deepEqual([0x31, 0x32, 0x33], data);
      done();
    });
    decoder.write(new Buffer([0x03, 0x04, DLE, STX, 0x31, 0x32, 0x33, DLE, ETX, 0x05, 0x06]));
  });

  it('should decode a zero-length message', function (done) {
    var decoder = new d.Decoder();
    decoder.on('data', function(data) {
      assert.deepEqual([], data);
      done();
    });
    decoder.write(new Buffer([DLE, STX, DLE, ETX]));
  });
});


