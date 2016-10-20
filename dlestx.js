"use strict";

var util = require('util');
var stream = require('stream');

var DLE = 0x10;
var STX = 0x02;
var ETX = 0x03;

function Decoder(options) {
  stream.Transform.call(this, options);

  this._readableState.objectMode = true; // stop re-concatenation
  this.buf_size = 1024; // TODO: this should double each time it is exceeded
  this.buf = new Buffer(this.buf_size); // TODO: this should be copied into a new buffer, every time buf_size changes
  this.buf_pos = 0;
  this.state = this.STATE_OUTFRAME_EXPECT_DLE;
}
util.inherits(Decoder, stream.Transform);

Decoder.prototype.STATE_OUTFRAME_EXPECT_DLE = function(c) {
  if (c === DLE) {
    this.state = this.STATE_OUTFRAME_EXPECT_STX;
  }
};

Decoder.prototype.STATE_OUTFRAME_EXPECT_STX = function(c) {
  if (c === STX) {
    this.state = this.STATE_INFRAME;
  } else if (c === DLE) {
    console.warn("unexpected DLE-DLE while not in a frame");
    this.state = this.STATE_OUTFRAME_EXPECT_DLE;
  } else if (c === ETX) {
    console.warn("BAD FRAMING: unexpected DLE-ETX while not in a frame");
    this.state = this.STATE_OUTFRAME_EXPECT_DLE;
  } else {
    console.warn("BAD FRAMING");
    this.state = this.STATE_OUTFRAME_EXPECT_DLE;
  }
};

Decoder.prototype.STATE_INFRAME = function(c) {
  if (c === DLE) {
    this.state = this.STATE_INFRAME_EXPECT_DLE_OR_ETX;
  } else {
    this.buf[this.buf_pos++] = c;
  }
};

Decoder.prototype.STATE_INFRAME_EXPECT_DLE_OR_ETX = function(c) {
  if (c === DLE) {
    this.buf[this.buf_pos++] = c;
    this.state = this.STATE_INFRAME;
  } else if (c === ETX) {
    var up = new Buffer(this.buf_pos);
    this.buf.copy(up, 0, 0, this.buf_pos);
    this.push(up);
    this.buf_pos = 0;
    this.state = this.STATE_OUTFRAME_EXPECT_DLE;
  } else {
    console.warn("BAD FRAMING: expected DLE or ETX");
    this.state = this.STATE_OUTFRAME_EXPECT_DLE;
  }
};

Decoder.prototype._transform = function(chunk, encoding, done) {
  for (var i = 0; i < chunk.length; i++) {
    this.state(chunk[i]);
  }
  done();
};

// This drops data from an unterminated final frames
Decoder.prototype._flush = function(done) {
  done();
};

module.exports.Decoder = Decoder;
module.exports.DLE = DLE;
module.exports.STX = STX;
module.exports.ETX = ETX;
