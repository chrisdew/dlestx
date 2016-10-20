# dlestx
A NodeJS stream decoder for DLE STX / DLE ETX framed data.

This stream transformer decodes binary data, framed with DLE STX and DLE ETX pairs, and yields 'data' events containing the deframed data.

Literal DLEs (0x10) in the data become byte-stuffed (0x10 0x10) in this encoding.

The easiest illustration is one of the test cases:

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

Limitations:

* This is a development release, do not use until v1.0.0.
* It does not yet handle packets over 1KB.
* It includes only a decoder, no encoder is written yet.