/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Ryan Bennett
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

// define a shim require function so that a node/browserify require calls dont cause errors when ndn-js is used via <script> tag

var ndn = ndn || {}
var exports = ndn;

var module = {}
function require(){return ndn;}
/**
 * This module checks for the availability of various crypto.subtle api's at runtime,
 * exporting a function that returns the known availability of necessary NDN crypto apis
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Ryan Bennett <nomad.ry@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

function DetectSubtleCrypto(){
  var use = false;
  var baselineSupport = (
                            (typeof crypto !== 'undefined' && crypto && crypto.subtle)
                            && (
                                (location.protocol === "https:" || "chrome-extension:" || "chrome:")
                                || (location.hostname === "localhost" || location.hostname === "127.0.0.1")
                               )
                        ) ? true : false ;
  if (baselineSupport) {
    var algo = { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, hash:{name:"SHA-256"}, publicExponent: new Uint8Array([0x01, 0x00, 0x01])};
    var keypair;
    //try to perform every RSA crypto operation we need, if everything works, set use = true
    crypto.subtle.generateKey(
      algo,
      true, //exportable;
      ["sign", "verify"]).then(function(key){
        keypair = key;
        return crypto.subtle.sign(algo, key.privateKey, new Uint8Array([1,2,3,4,5]));
      }).then(function(signature){
        return crypto.subtle.verify(algo, keypair.publicKey, signature, new Uint8Array([1,2,3,4,5]));
      }).then(function(verified){
        return crypto.subtle.exportKey("pkcs8",keypair.privateKey);
      }).then(function(pkcs8){
        return crypto.subtle.importKey("pkcs8", pkcs8, algo, true, ["sign"]);
      }).then(function(importedKey){
        return crypto.subtle.exportKey("spki", keypair.publicKey);
      }).then(function(spki){
        return crypto.subtle.importKey("spki", spki, algo, true, ["verify"]);
      }).then(function(importedKey){
        var testDigest = new Uint8Array([1,2,3,4,5]);
        return crypto.subtle.digest({name:"SHA-256"}, testDigest.buffer);
      }).then(function(result){
        use = true;
      }, function(err){
        console.log("DetectSubtleCrypto encountered error, not using crypto.subtle: ", err)
      });
  }
  return function useSubtleCrypto(){
    return use;
  }
}

var UseSubtleCrypto = DetectSubtleCrypto();

exports.UseSubtleCrypto = UseSubtleCrypto;
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
associated documentation files (the "Software"), to deal in the Software without restriction, including 
without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

code.google.com/p/crypto-js/wiki/License
*/
/**
 * CryptoJS core components.
 */
var CryptoJS = CryptoJS || (function (Math, undefined) {
    /**
     * CryptoJS namespace.
     */
    var C = {};

    /**
     * Library namespace.
     */
    var C_lib = C.lib = {};

    /**
     * Base object for prototypal inheritance.
     */
    var Base = C_lib.Base = (function () {
        function F() {}

        return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function (overrides) {
                // Spawn
                F.prototype = this;
                var subtype = new F();

                // Augment
                if (overrides) {
                    subtype.mixIn(overrides);
                }

                // Create default initializer
                if (!subtype.hasOwnProperty('init')) {
                    subtype.init = function () {
                        subtype.$super.init.apply(this, arguments);
                    };
                }

                // Initializer's prototype is the subtype object
                subtype.init.prototype = subtype;

                // Reference supertype
                subtype.$super = this;

                return subtype;
            },

            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function () {
                var instance = this.extend();
                instance.init.apply(instance, arguments);

                return instance;
            },

            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function () {
            },

            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function (properties) {
                for (var propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        this[propertyName] = properties[propertyName];
                    }
                }

                // IE won't copy toString using the loop above
                if (properties.hasOwnProperty('toString')) {
                    this.toString = properties.toString;
                }
            },

            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function () {
                return this.init.prototype.extend(this);
            }
        };
    }());

    /**
     * An array of 32-bit words.
     *
     * @property {Array} words The array of 32-bit words.
     * @property {number} sigBytes The number of significant bytes in this word array.
     */
    var WordArray = C_lib.WordArray = Base.extend({
        /**
         * Initializes a newly created word array.
         *
         * @param {Array} words (Optional) An array of 32-bit words.
         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.create();
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
         */
        init: function (words, sigBytes) {
            words = this.words = words || [];

            if (sigBytes != undefined) {
                this.sigBytes = sigBytes;
            } else {
                this.sigBytes = words.length * 4;
            }
        },

        /**
         * Converts this word array to a string.
         *
         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
         *
         * @return {string} The stringified word array.
         *
         * @example
         *
         *     var string = wordArray + '';
         *     var string = wordArray.toString();
         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
         */
        toString: function (encoder) {
            return (encoder || Hex).stringify(this);
        },

        /**
         * Concatenates a word array to this word array.
         *
         * @param {WordArray} wordArray The word array to append.
         *
         * @return {WordArray} This word array.
         *
         * @example
         *
         *     wordArray1.concat(wordArray2);
         */
        concat: function (wordArray) {
            // Shortcuts
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;

            // Clamp excess bits
            this.clamp();

            // Concat
            if (thisSigBytes % 4) {
                // Copy one byte at a time
                for (var i = 0; i < thatSigBytes; i++) {
                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
                }
            } else if (thatWords.length > 0xffff) {
                // Copy one word at a time
                for (var i = 0; i < thatSigBytes; i += 4) {
                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
                }
            } else {
                // Copy all words at once
                thisWords.push.apply(thisWords, thatWords);
            }
            this.sigBytes += thatSigBytes;

            // Chainable
            return this;
        },

        /**
         * Removes insignificant bits.
         *
         * @example
         *
         *     wordArray.clamp();
         */
        clamp: function () {
            // Shortcuts
            var words = this.words;
            var sigBytes = this.sigBytes;

            // Clamp
            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
            words.length = Math.ceil(sigBytes / 4);
        },

        /**
         * Creates a copy of this word array.
         *
         * @return {WordArray} The clone.
         *
         * @example
         *
         *     var clone = wordArray.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);

            return clone;
        },

        /**
         * Creates a word array filled with random bytes.
         *
         * @param {number} nBytes The number of random bytes to generate.
         *
         * @return {WordArray} The random word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.random(16);
         */
        random: function (nBytes) {
            var words = [];
            for (var i = 0; i < nBytes; i += 4) {
                words.push((Math.random() * 0x100000000) | 0);
            }

            return new WordArray.init(words, nBytes);
        }
    });

    /**
     * Encoder namespace.
     */
    var C_enc = C.enc = {};

    /**
     * Hex encoding strategy.
     */
    var Hex = C_enc.Hex = {
        /**
         * Converts a word array to a hex string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The hex string.
         *
         * @static
         *
         * @example
         *
         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                hexChars.push((bite >>> 4).toString(16));
                hexChars.push((bite & 0x0f).toString(16));
            }

            return hexChars.join('');
        },

        /**
         * Converts a hex string to a word array.
         *
         * @param {string} hexStr The hex string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
         */
        parse: function (hexStr) {
            // Shortcut
            var hexStrLength = hexStr.length;

            // Convert
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
            }

            return new WordArray.init(words, hexStrLength / 2);
        }
    };

    /**
     * Latin1 encoding strategy.
     */
    var Latin1 = C_enc.Latin1 = {
        /**
         * Converts a word array to a Latin1 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Latin1 string.
         *
         * @static
         *
         * @example
         *
         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                latin1Chars.push(String.fromCharCode(bite));
            }

            return latin1Chars.join('');
        },

        /**
         * Converts a Latin1 string to a word array.
         *
         * @param {string} latin1Str The Latin1 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
         */
        parse: function (latin1Str) {
            // Shortcut
            var latin1StrLength = latin1Str.length;

            // Convert
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
            }

            return new WordArray.init(words, latin1StrLength);
        }
    };

    /**
     * UTF-8 encoding strategy.
     */
    var Utf8 = C_enc.Utf8 = {
        /**
         * Converts a word array to a UTF-8 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The UTF-8 string.
         *
         * @static
         *
         * @example
         *
         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
         */
        stringify: function (wordArray) {
            try {
                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
                throw new Error('Malformed UTF-8 data');
            }
        },

        /**
         * Converts a UTF-8 string to a word array.
         *
         * @param {string} utf8Str The UTF-8 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
         */
        parse: function (utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
        }
    };

    /**
     * Abstract buffered block algorithm template.
     *
     * The property blockSize must be implemented in a concrete subtype.
     *
     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
     */
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
        /**
         * Resets this block algorithm's data buffer to its initial state.
         *
         * @example
         *
         *     bufferedBlockAlgorithm.reset();
         */
        reset: function () {
            // Initial values
            this._data = new WordArray.init();
            this._nDataBytes = 0;
        },

        /**
         * Adds new data to this block algorithm's buffer.
         *
         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
         *
         * @example
         *
         *     bufferedBlockAlgorithm._append('data');
         *     bufferedBlockAlgorithm._append(wordArray);
         */
        _append: function (data) {
            // Convert string to WordArray, else assume WordArray already
            if (typeof data == 'string') {
                data = Utf8.parse(data);
            }

            // Append
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
        },

        /**
         * Processes available data blocks.
         *
         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
         *
         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
         *
         * @return {WordArray} The processed data.
         *
         * @example
         *
         *     var processedData = bufferedBlockAlgorithm._process();
         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
         */
        _process: function (doFlush) {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;

            // Count blocks ready
            var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (doFlush) {
                // Round up to include partial blocks
                nBlocksReady = Math.ceil(nBlocksReady);
            } else {
                // Round down to include only full blocks,
                // less the number of blocks that must remain in the buffer
                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }

            // Count words ready
            var nWordsReady = nBlocksReady * blockSize;

            // Count bytes ready
            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

            // Process blocks
            if (nWordsReady) {
                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                    // Perform concrete-algorithm logic
                    this._doProcessBlock(dataWords, offset);
                }

                // Remove processed words
                var processedWords = dataWords.splice(0, nWordsReady);
                data.sigBytes -= nBytesReady;
            }

            // Return processed words
            return new WordArray.init(processedWords, nBytesReady);
        },

        /**
         * Creates a copy of this object.
         *
         * @return {Object} The clone.
         *
         * @example
         *
         *     var clone = bufferedBlockAlgorithm.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone._data = this._data.clone();

            return clone;
        },

        _minBufferSize: 0
    });

    /**
     * Abstract hasher template.
     *
     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
     */
    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
        /**
         * Configuration options.
         */
        cfg: Base.extend(),

        /**
         * Initializes a newly created hasher.
         *
         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
         *
         * @example
         *
         *     var hasher = CryptoJS.algo.SHA256.create();
         */
        init: function (cfg) {
            // Apply config defaults
            this.cfg = this.cfg.extend(cfg);

            // Set initial values
            this.reset();
        },

        /**
         * Resets this hasher to its initial state.
         *
         * @example
         *
         *     hasher.reset();
         */
        reset: function () {
            // Reset data buffer
            BufferedBlockAlgorithm.reset.call(this);

            // Perform concrete-hasher logic
            this._doReset();
        },

        /**
         * Updates this hasher with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {Hasher} This hasher.
         *
         * @example
         *
         *     hasher.update('message');
         *     hasher.update(wordArray);
         */
        update: function (messageUpdate) {
            // Append
            this._append(messageUpdate);

            // Update the hash
            this._process();

            // Chainable
            return this;
        },

        /**
         * Finalizes the hash computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The hash.
         *
         * @example
         *
         *     var hash = hasher.finalize();
         *     var hash = hasher.finalize('message');
         *     var hash = hasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Final message update
            if (messageUpdate) {
                this._append(messageUpdate);
            }

            // Perform concrete-hasher logic
            var hash = this._doFinalize();

            return hash;
        },

        blockSize: 512/32,

        /**
         * Creates a shortcut function to a hasher's object interface.
         *
         * @param {Hasher} hasher The hasher to create a helper for.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
         */
        _createHelper: function (hasher) {
            return function (message, cfg) {
                return new hasher.init(cfg).finalize(message);
            };
        },

        /**
         * Creates a shortcut function to the HMAC's object interface.
         *
         * @param {Hasher} hasher The hasher to use in this HMAC helper.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
         */
        _createHmacHelper: function (hasher) {
            return function (message, key) {
                return new C_algo.HMAC.init(hasher, key).finalize(message);
            };
        }
    });

    /**
     * Algorithm namespace.
     */
    var C_algo = C.algo = {};

    return C;
}(Math));

exports.CryptoJS = CryptoJS;
module.exports = exports;
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
associated documentation files (the "Software"), to deal in the Software without restriction, including 
without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

code.google.com/p/crypto-js/wiki/License
*/

var C = require('./core.js').CryptoJS;
(function (Math) {
    // Shortcuts
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Initialization and round constants tables
    var H = [];
    var K = [];

    // Compute constants
    (function () {
        function isPrime(n) {
            var sqrtN = Math.sqrt(n);
            for (var factor = 2; factor <= sqrtN; factor++) {
                if (!(n % factor)) {
                    return false;
                }
            }

            return true;
        }

        function getFractionalBits(n) {
            return ((n - (n | 0)) * 0x100000000) | 0;
        }

        var n = 2;
        var nPrime = 0;
        while (nPrime < 64) {
            if (isPrime(n)) {
                if (nPrime < 8) {
                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
                }
                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

                nPrime++;
            }

            n++;
        }
    }());

    // Reusable object
    var W = [];

    /**
     * SHA-256 hash algorithm.
     */
    var SHA256 = C_algo.SHA256 = Hasher.extend({
        _doReset: function () {
            this._hash = new WordArray.init(H.slice(0));
        },

        _doProcessBlock: function (M, offset) {
            // Shortcut
            var H = this._hash.words;

            // Working variables
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];
            var f = H[5];
            var g = H[6];
            var h = H[7];

            // Computation
            for (var i = 0; i < 64; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var gamma0x = W[i - 15];
                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
                                   (gamma0x >>> 3);

                    var gamma1x = W[i - 2];
                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
                                   (gamma1x >>> 10);

                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
                }

                var ch  = (e & f) ^ (~e & g);
                var maj = (a & b) ^ (a & c) ^ (b & c);

                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

                var t1 = h + sigma1 + ch + K[i] + W[i];
                var t2 = sigma0 + maj;

                h = g;
                g = f;
                f = e;
                e = (d + t1) | 0;
                d = c;
                c = b;
                b = a;
                a = (t1 + t2) | 0;
            }

            // Intermediate hash value
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
            H[5] = (H[5] + f) | 0;
            H[6] = (H[6] + g) | 0;
            H[7] = (H[7] + h) | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            // Hash final blocks
            this._process();

            // Return final computed hash
            return this._hash;
        },

        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        }
    });

    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.SHA256('message');
     *     var hash = CryptoJS.SHA256(wordArray);
     */
    C.SHA256 = Hasher._createHelper(SHA256);

    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacSHA256(message, key);
     */
    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
}(Math));

exports.CryptoJS = C;
module.exports = exports;
// Copyright (c) 2003-2009  Tom Wu
// All Rights Reserved.
// 
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// See "jrsasig-THIRDPARTYLICENSE.txt" for details.

var b64map="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  , b64pad="="
  , BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";

function int2char(n) {
  return BI_RM.charAt(n); 
}

function hex2b64(h) {
  var i;
  var c;
  var ret = "";
  for(i = 0; i+3 <= h.length; i+=3) {
    c = parseInt(h.substring(i,i+3),16);
    ret += b64map.charAt(c >> 6) + b64map.charAt(c & 63);
  }
  if(i+1 == h.length) {
    c = parseInt(h.substring(i,i+1),16);
    ret += b64map.charAt(c << 2);
  }
  else if(i+2 == h.length) {
    c = parseInt(h.substring(i,i+2),16);
    ret += b64map.charAt(c >> 2) + b64map.charAt((c & 3) << 4);
  }
  if (b64pad) while((ret.length & 3) > 0) ret += b64pad;
  return ret;
}

// convert a base64 string to hex
function b64tohex(s) {
  var ret = ""
  var i;
  var k = 0; // b64 state, 0-3
  var slop;
  for(i = 0; i < s.length; ++i) {
    if(s.charAt(i) == b64pad) break;
    v = b64map.indexOf(s.charAt(i));
    if(v < 0) continue;
    if(k == 0) {
      ret += int2char(v >> 2);
      slop = v & 3;
      k = 1;
    }
    else if(k == 1) {
      ret += int2char((slop << 2) | (v >> 4));
      slop = v & 0xf;
      k = 2;
    }
    else if(k == 2) {
      ret += int2char(slop);
      ret += int2char(v >> 2);
      slop = v & 3;
      k = 3;
    }
    else {
      ret += int2char((slop << 2) | (v >> 4));
      ret += int2char(v & 0xf);
      k = 0;
    }
  }
  if(k == 1)
    ret += int2char(slop << 2);
  return ret;
}

// convert a base64 string to a byte/number array
function b64toBA(s) {
  //piggyback on b64tohex for now, optimize later
  var h = b64tohex(s);
  var i;
  var a = new Array();
  for(i = 0; 2*i < h.length; ++i) {
    a[i] = parseInt(h.substring(2*i,2*i+2),16);
  }
  return a;
}

exports.b64tohex = b64tohex;
exports.b64toBA  = b64toBA;
exports.hex2b64  = hex2b64;

module.exports = exports;
// Copyright (c) 2003-2009  Tom Wu
// All Rights Reserved.
// 
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// See "jrsasig-THIRDPARTYLICENSE.txt" for details.

// Depends on jsbn.js and rng.js
var intShim = require("jsbn");

var BigInteger = intShim.BigInteger ? intShim.BigInteger : intShim ;
// Version 1.1: support utf-8 encoding in pkcs1pad2

// convert a (hex) string to a bignum object
function parseBigInt(str,r) {
  return new BigInteger(str,r);
}

function linebrk(s,n) {
  var ret = "";
  var i = 0;
  while(i + n < s.length) {
    ret += s.substring(i,i+n) + "\n";
    i += n;
  }
  return ret + s.substring(i,s.length);
}

function byte2Hex(b) {
  if(b < 0x10)
    return "0" + b.toString(16);
  else
    return b.toString(16);
}

// PKCS#1 (type 2, random) pad input string s to n bytes, and return a bigint
function pkcs1pad2(s,n) {
  if(n < s.length + 11) { // TODO: fix for utf-8
    alert("Message too long for RSA");
    return null;
  }
  var ba = new Array();
  var i = s.length - 1;
  while(i >= 0 && n > 0) {
    var c = s.charCodeAt(i--);
    if(c < 128) { // encode using utf-8
      ba[--n] = c;
    }
    else if((c > 127) && (c < 2048)) {
      ba[--n] = (c & 63) | 128;
      ba[--n] = (c >> 6) | 192;
    }
    else {
      ba[--n] = (c & 63) | 128;
      ba[--n] = ((c >> 6) & 63) | 128;
      ba[--n] = (c >> 12) | 224;
    }
  }
  ba[--n] = 0;
  var rng = new SecureRandom();
  var x = new Array();
  while(n > 2) { // random non-zero pad
    x[0] = 0;
    while(x[0] == 0) rng.nextBytes(x);
    ba[--n] = x[0];
  }
  ba[--n] = 2;
  ba[--n] = 0;
  return new BigInteger(ba);
}

// PKCS#1 (OAEP) mask generation function
function oaep_mgf1_arr(seed, len, hash)
{
    var mask = '', i = 0;

    while (mask.length < len)
    {
        mask += hash(String.fromCharCode.apply(String, seed.concat([
                (i & 0xff000000) >> 24,
                (i & 0x00ff0000) >> 16,
                (i & 0x0000ff00) >> 8,
                i & 0x000000ff])));
        i += 1;
    }

    return mask;
}

var SHA1_SIZE = 20;

// PKCS#1 (OAEP) pad input string s to n bytes, and return a bigint
function oaep_pad(s, n, hash)
{
    if (s.length + 2 * SHA1_SIZE + 2 > n)
    {
        throw "Message too long for RSA";
    }

    var PS = '', i;

    for (i = 0; i < n - s.length - 2 * SHA1_SIZE - 2; i += 1)
    {
        PS += '\x00';
    }

    var DB = rstr_sha1('') + PS + '\x01' + s;
    var seed = new Array(SHA1_SIZE);
    new SecureRandom().nextBytes(seed);
    
    var dbMask = oaep_mgf1_arr(seed, DB.length, hash || rstr_sha1);
    var maskedDB = [];

    for (i = 0; i < DB.length; i += 1)
    {
        maskedDB[i] = DB.charCodeAt(i) ^ dbMask.charCodeAt(i);
    }

    var seedMask = oaep_mgf1_arr(maskedDB, seed.length, rstr_sha1);
    var maskedSeed = [0];

    for (i = 0; i < seed.length; i += 1)
    {
        maskedSeed[i + 1] = seed[i] ^ seedMask.charCodeAt(i);
    }

    return new BigInteger(maskedSeed.concat(maskedDB));
}

// "empty" RSA key constructor
var RSAKey = function RSAKey() {
  this.n = null;
  this.e = 0;
  this.d = null;
  this.p = null;
  this.q = null;
  this.dmp1 = null;
  this.dmq1 = null;
  this.coeff = null;
}

// Set the public key fields N and e from hex strings
function RSASetPublic(N,E) {
  if (typeof N !== "string")
  {
    this.n = N;
    this.e = E;
  }
  else if(N != null && E != null && N.length > 0 && E.length > 0) {
    this.n = parseBigInt(N,16);
    this.e = parseInt(E,16);
  }
  else
    alert("Invalid RSA public key");
}

// Perform raw public operation on "x": return x^e (mod n)
function RSADoPublic(x) {
  return x.modPowInt(this.e, this.n);
}

// Return the PKCS#1 RSA encryption of "text" as an even-length hex string
function RSAEncrypt(text) {
  var m = pkcs1pad2(text,(this.n.bitLength()+7)>>3);
  if(m == null) return null;
  var c = this.doPublic(m);
  if(c == null) return null;
  var h = c.toString(16);
  if((h.length & 1) == 0) return h; else return "0" + h;
}

// Return the PKCS#1 OAEP RSA encryption of "text" as an even-length hex string
function RSAEncryptOAEP(text, hash) {
  var m = oaep_pad(text, (this.n.bitLength()+7)>>3, hash);
  if(m == null) return null;
  var c = this.doPublic(m);
  if(c == null) return null;
  var h = c.toString(16);
  if((h.length & 1) == 0) return h; else return "0" + h;
}

// Return the PKCS#1 RSA encryption of "text" as a Base64-encoded string
//function RSAEncryptB64(text) {
//  var h = this.encrypt(text);
//  if(h) return hex2b64(h); else return null;
//}

// protected
RSAKey.prototype.doPublic = RSADoPublic;

// public
RSAKey.prototype.setPublic = RSASetPublic;
RSAKey.prototype.encrypt = RSAEncrypt;
RSAKey.prototype.encryptOAEP = RSAEncryptOAEP;
//RSAKey.prototype.encrypt_b64 = RSAEncryptB64;


exports.RSAKey = RSAKey;
module.exports = exports;
// Copyright (c) 2003-2009  Tom Wu
// All Rights Reserved.
// 
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// See "jrsasig-THIRDPARTYLICENSE.txt" for details.

// Depends on rsa.js and jsbn2.js

var intShim = require("jsbn");
var BigInteger = intShim.BigInteger ? intShim.BigInteger : intShim ;
var RSAKey = require('./rsa.js').RSAKey;


function parseBigInt(str,r) {
  return new BigInteger(str,r);
}
// Version 1.1: support utf-8 decoding in pkcs1unpad2

// Undo PKCS#1 (type 2, random) padding and, if valid, return the plaintext
function pkcs1unpad2(d,n) {
  var b = d.toByteArray();
  var i = 0;
  while(i < b.length && b[i] == 0) ++i;
  if(b.length-i != n-1 || b[i] != 2)
    return null;
  ++i;
  while(b[i] != 0)
    if(++i >= b.length) return null;
  var ret = "";
  while(++i < b.length) {
    var c = b[i] & 255;
    if(c < 128) { // utf-8 decode
      ret += String.fromCharCode(c);
    }
    else if((c > 191) && (c < 224)) {
      ret += String.fromCharCode(((c & 31) << 6) | (b[i+1] & 63));
      ++i;
    }
    else {
      ret += String.fromCharCode(((c & 15) << 12) | ((b[i+1] & 63) << 6) | (b[i+2] & 63));
      i += 2;
    }
  }
  return ret;
}

// PKCS#1 (OAEP) mask generation function
function oaep_mgf1_str(seed, len, hash)
{
    var mask = '', i = 0;

    while (mask.length < len)
    {
        mask += hash(seed + String.fromCharCode.apply(String, [
                (i & 0xff000000) >> 24,
                (i & 0x00ff0000) >> 16,
                (i & 0x0000ff00) >> 8,
                i & 0x000000ff]));
        i += 1;
    }

    return mask;
}

var SHA1_SIZE = 20;

// Undo PKCS#1 (OAEP) padding and, if valid, return the plaintext
function oaep_unpad(d, n, hash)
{
    d = d.toByteArray();

    var i;

    for (i = 0; i < d.length; i += 1)
    {
        d[i] &= 0xff;
    }

    while (d.length < n)
    {
        d.unshift(0);
    }

    d = String.fromCharCode.apply(String, d);

    if (d.length < 2 * SHA1_SIZE + 2)
    {
        throw "Cipher too short";
    }

    var maskedSeed = d.substr(1, SHA1_SIZE)
    var maskedDB = d.substr(SHA1_SIZE + 1);

    var seedMask = oaep_mgf1_str(maskedDB, SHA1_SIZE, hash || rstr_sha1);
    var seed = [], i;

    for (i = 0; i < maskedSeed.length; i += 1)
    {
        seed[i] = maskedSeed.charCodeAt(i) ^ seedMask.charCodeAt(i);
    }

    var dbMask = oaep_mgf1_str(String.fromCharCode.apply(String, seed),
                           d.length - SHA1_SIZE, rstr_sha1);

    var DB = [];

    for (i = 0; i < maskedDB.length; i += 1)
    {
        DB[i] = maskedDB.charCodeAt(i) ^ dbMask.charCodeAt(i);
    }

    DB = String.fromCharCode.apply(String, DB);

    if (DB.substr(0, SHA1_SIZE) !== rstr_sha1(''))
    {
        throw "Hash mismatch";
    }

    DB = DB.substr(SHA1_SIZE);

    var first_one = DB.indexOf('\x01');
    var last_zero = (first_one != -1) ? DB.substr(0, first_one).lastIndexOf('\x00') : -1;

    if (last_zero + 1 != first_one)
    {
        throw "Malformed data";
    }

    return DB.substr(first_one + 1);
}

// Set the private key fields N, e, and d from hex strings
function RSASetPrivate(N,E,D) {
  if (typeof N !== "string")
  {
    this.n = N;
    this.e = E;
    this.d = D;
  }
  else if(N != null && E != null && N.length > 0 && E.length > 0) {
    this.n = parseBigInt(N,16);
    this.e = parseInt(E,16);
    this.d = parseBigInt(D,16);
  }
  else
    alert("Invalid RSA private key");
}

// Set the private key fields N, e, d and CRT params from hex strings
function RSASetPrivateEx(N,E,D,P,Q,DP,DQ,C) {
  //alert("RSASetPrivateEx called");
  if (N == null) throw "RSASetPrivateEx N == null";
  if (E == null) throw "RSASetPrivateEx E == null";
  if (N.length == 0) throw "RSASetPrivateEx N.length == 0";
  if (E.length == 0) throw "RSASetPrivateEx E.length == 0";

  if (N != null && E != null && N.length > 0 && E.length > 0) {
    this.n = parseBigInt(N,16);
    this.e = parseInt(E,16);
    this.d = parseBigInt(D,16);
    this.p = parseBigInt(P,16);
    this.q = parseBigInt(Q,16);
    this.dmp1 = parseBigInt(DP,16);
    this.dmq1 = parseBigInt(DQ,16);
    this.coeff = parseBigInt(C,16);
  } else {
    alert("Invalid RSA private key in RSASetPrivateEx");
  }
}

// Generate a new random private key B bits long, using public expt E
function RSAGenerate(B,E) {
  var rng = new SecureRandom();
  var qs = B>>1;
  this.e = parseInt(E,16);
  var ee = new BigInteger(E,16);
  for(;;) {
    for(;;) {
      this.p = new BigInteger(B-qs,1,rng);
      if(this.p.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0 && this.p.isProbablePrime(10)) break;
    }
    for(;;) {
      this.q = new BigInteger(qs,1,rng);
      if(this.q.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0 && this.q.isProbablePrime(10)) break;
    }
    if(this.p.compareTo(this.q) <= 0) {
      var t = this.p;
      this.p = this.q;
      this.q = t;
    }
    var p1 = this.p.subtract(BigInteger.ONE);	// p1 = p - 1
    var q1 = this.q.subtract(BigInteger.ONE);	// q1 = q - 1
    var phi = p1.multiply(q1);
    if(phi.gcd(ee).compareTo(BigInteger.ONE) == 0) {
      this.n = this.p.multiply(this.q);	// this.n = p * q
      this.d = ee.modInverse(phi);	// this.d = 
      this.dmp1 = this.d.mod(p1);	// this.dmp1 = d mod (p - 1)
      this.dmq1 = this.d.mod(q1);	// this.dmq1 = d mod (q - 1)
      this.coeff = this.q.modInverse(this.p);	// this.coeff = (q ^ -1) mod p
      break;
    }
  }
}

// Perform raw private operation on "x": return x^d (mod n)
function RSADoPrivate(x) {
  if(this.p == null || this.q == null)
    return x.modPow(this.d, this.n);

  // TODO: re-calculate any missing CRT params
  var xp = x.mod(this.p).modPow(this.dmp1, this.p); // xp=cp?
  var xq = x.mod(this.q).modPow(this.dmq1, this.q); // xq=cq?

  while(xp.compareTo(xq) < 0)
    xp = xp.add(this.p);
  // NOTE:
  // xp.subtract(xq) => cp -cq
  // xp.subtract(xq).multiply(this.coeff).mod(this.p) => (cp - cq) * u mod p = h
  // xp.subtract(xq).multiply(this.coeff).mod(this.p).multiply(this.q).add(xq) => cq + (h * q) = M
  return xp.subtract(xq).multiply(this.coeff).mod(this.p).multiply(this.q).add(xq);
}

// Return the PKCS#1 RSA decryption of "ctext".
// "ctext" is an even-length hex string and the output is a plain string.
function RSADecrypt(ctext) {
  var c = parseBigInt(ctext, 16);
  var m = this.doPrivate(c);
  if(m == null) return null;
  return pkcs1unpad2(m, (this.n.bitLength()+7)>>3);
}

// Return the PKCS#1 OAEP RSA decryption of "ctext".
// "ctext" is an even-length hex string and the output is a plain string.
function RSADecryptOAEP(ctext, hash) {
  var c = parseBigInt(ctext, 16);
  var m = this.doPrivate(c);
  if(m == null) return null;
  return oaep_unpad(m, (this.n.bitLength()+7)>>3, hash);
}

// Return the PKCS#1 RSA decryption of "ctext".
// "ctext" is a Base64-encoded string and the output is a plain string.
//function RSAB64Decrypt(ctext) {
//  var h = b64tohex(ctext);
//  if(h) return this.decrypt(h); else return null;
//}

// protected
RSAKey.prototype.doPrivate = RSADoPrivate;

// public
RSAKey.prototype.setPrivate = RSASetPrivate;
RSAKey.prototype.setPrivateEx = RSASetPrivateEx;
RSAKey.prototype.generate = RSAGenerate;
RSAKey.prototype.decrypt = RSADecrypt;
RSAKey.prototype.decryptOAEP = RSADecryptOAEP;
//RSAKey.prototype.b64_decrypt = RSAB64Decrypt;

exports.RSAKey = RSAKey;
module.exports = exports;
/*! crypto-1.0.4.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
/*
 * crypto.js - Cryptographic Algorithm Provider class
 *
 * Copyright (c) 2013 Kenji Urushima (kenji.urushima@gmail.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * This software is licensed under the terms of the MIT License.
 * http://kjur.github.com/jsrsasign/license
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 */

/**
 * @fileOverview
 * @name crypto-1.0.js
 * @author Kenji Urushima kenji.urushima@gmail.com
 * @version 1.0.4 (2013-Mar-28)
 * @since 2.2
 * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
 */

var CryptoJS = require('./sha256.js').CryptoJS
  , intShim = require('jsbn');

var BigInteger = intShim.BigInteger ? intShim.BigInteger : intShim;

function parseBigInt(str,r) {
  return new BigInteger(str,r);
}

/** 
 * kjur's class library name space
 * @name KJUR
 * @namespace kjur's class library name space
 */
if (typeof KJUR == "undefined" || !KJUR) KJUR = {};
/**
 * kjur's cryptographic algorithm provider library name space
 * <p>
 * This namespace privides following crytpgrahic classes.
 * <ul>
 * <li>{@link KJUR.crypto.MessageDigest} - Java JCE(cryptograhic extension) style MessageDigest class</li>
 * <li>{@link KJUR.crypto.Signature} - Java JCE(cryptograhic extension) style Signature class</li>
 * <li>{@link KJUR.crypto.Util} - cryptographic utility functions and properties</li>
 * </ul>
 * NOTE: Please ignore method summary and document of this namespace. This caused by a bug of jsdoc2.
 * </p>
 * @name KJUR.crypto
 * @namespace
 */
if (typeof KJUR.crypto == "undefined" || !KJUR.crypto) KJUR.crypto = {};

/**
 * static object for cryptographic function utilities
 * @name KJUR.crypto.Util
 * @class static object for cryptographic function utilities
 * @property {Array} DIGESTINFOHEAD PKCS#1 DigestInfo heading hexadecimal bytes for each hash algorithms
 * @description
 */
KJUR.crypto.Util = new function() {
    this.DIGESTINFOHEAD = {
	'sha1':      "3021300906052b0e03021a05000414",
        'sha224':    "302d300d06096086480165030402040500041c",
	'sha256':    "3031300d060960864801650304020105000420",
	'sha384':    "3041300d060960864801650304020205000430",
	'sha512':    "3051300d060960864801650304020305000440",
	'md2':       "3020300c06082a864886f70d020205000410",
	'md5':       "3020300c06082a864886f70d020505000410",
	'ripemd160': "3021300906052b2403020105000414"
    };

    /**
     * get hexadecimal DigestInfo
     * @name getDigestInfoHex
     * @memberOf KJUR.crypto.Util
     * @function
     * @param {String} hHash hexadecimal hash value
     * @param {String} alg hash algorithm name (ex. 'sha1')
     * @return {String} hexadecimal string DigestInfo ASN.1 structure
     */
    this.getDigestInfoHex = function(hHash, alg) {
	if (typeof this.DIGESTINFOHEAD[alg] == "undefined")
	    throw "alg not supported in Util.DIGESTINFOHEAD: " + alg;
	return this.DIGESTINFOHEAD[alg] + hHash;
    };

    /**
     * get PKCS#1 padded hexadecimal DigestInfo
     * @name getPaddedDigestInfoHex
     * @memberOf KJUR.crypto.Util
     * @function
     * @param {String} hHash hexadecimal hash value
     * @param {String} alg hash algorithm name (ex. 'sha1')
     * @param {Integer} keySize key bit length (ex. 1024)
     * @return {String} hexadecimal string of PKCS#1 padded DigestInfo
     */
    this.getPaddedDigestInfoHex = function(hHash, alg, keySize) {
	var hDigestInfo = this.getDigestInfoHex(hHash, alg);
	var pmStrLen = keySize / 4; // minimum PM length

	if (hDigestInfo.length + 22 > pmStrLen) // len(0001+ff(*8)+00+hDigestInfo)=22
	    throw "key is too short for SigAlg: keylen=" + keySize + "," + alg;

	var hHead = "0001";
	var hTail = "00" + hDigestInfo;
	var hMid = "";
	var fLen = pmStrLen - hHead.length - hTail.length;
	for (var i = 0; i < fLen; i += 2) {
	    hMid += "ff";
	}
	var hPaddedMessage = hHead + hMid + hTail;
	return hPaddedMessage;
    };

    /**
     * get hexadecimal SHA1 hash of string
     * @name sha1
     * @memberOf KJUR.crypto.Util
     * @function
     * @param {String} s input string to be hashed
     * @return {String} hexadecimal string of hash value
     * @since 1.0.3
     */
    this.sha1 = function(s) {
        var md = new KJUR.crypto.MessageDigest({'alg':'sha1', 'prov':'cryptojs'});
        return md.digestString(s);
    };

    /**
     * get hexadecimal SHA256 hash of string
     * @name sha256
     * @memberOf KJUR.crypto.Util
     * @function
     * @param {String} s input string to be hashed
     * @return {String} hexadecimal string of hash value
     * @since 1.0.3
     */
    this.sha256 = function(s) {
        var md = new KJUR.crypto.MessageDigest({'alg':'sha256', 'prov':'cryptojs'});
        return md.digestString(s);
    };

    /**
     * get hexadecimal SHA512 hash of string
     * @name sha512
     * @memberOf KJUR.crypto.Util
     * @function
     * @param {String} s input string to be hashed
     * @return {String} hexadecimal string of hash value
     * @since 1.0.3
     */
    this.sha512 = function(s) {
        var md = new KJUR.crypto.MessageDigest({'alg':'sha512', 'prov':'cryptojs'});
        return md.digestString(s);
    };

    /**
     * get hexadecimal MD5 hash of string
     * @name md5
     * @memberOf KJUR.crypto.Util
     * @function
     * @param {String} s input string to be hashed
     * @return {String} hexadecimal string of hash value
     * @since 1.0.3
     */
    this.md5 = function(s) {
        var md = new KJUR.crypto.MessageDigest({'alg':'md5', 'prov':'cryptojs'});
        return md.digestString(s);
    };

    /**
     * get hexadecimal RIPEMD160 hash of string
     * @name ripemd160
     * @memberOf KJUR.crypto.Util
     * @function
     * @param {String} s input string to be hashed
     * @return {String} hexadecimal string of hash value
     * @since 1.0.3
     */
    this.ripemd160 = function(s) {
        var md = new KJUR.crypto.MessageDigest({'alg':'ripemd160', 'prov':'cryptojs'});
        return md.digestString(s);
    };
};

/**
 * MessageDigest class which is very similar to java.security.MessageDigest class
 * @name KJUR.crypto.MessageDigest
 * @class MessageDigest class which is very similar to java.security.MessageDigest class
 * @param {Array} params parameters for constructor
 * @description
 * <br/>
 * Currently this supports following algorithm and providers combination:
 * <ul>
 * <li>md5 - cryptojs</li>
 * <li>sha1 - cryptojs</li>
 * <li>sha224 - cryptojs</li>
 * <li>sha256 - cryptojs</li>
 * <li>sha384 - cryptojs</li>
 * <li>sha512 - cryptojs</li>
 * <li>ripemd160 - cryptojs</li>
 * <li>sha256 - sjcl (NEW from crypto.js 1.0.4)</li>
 * </ul>
 * @example
 * // CryptoJS provider sample
 * &lt;script src="http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/core.js"&gt;&lt;/script&gt;
 * &lt;script src="http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/sha1.js"&gt;&lt;/script&gt;
 * &lt;script src="crypto-1.0.js"&gt;&lt;/script&gt;
 * var md = new KJUR.crypto.MessageDigest({alg: "sha1", prov: "cryptojs"});
 * md.updateString('aaa')
 * var mdHex = md.digest()
 *
 * // SJCL(Stanford JavaScript Crypto Library) provider sample
 * &lt;script src="http://bitwiseshiftleft.github.io/sjcl/sjcl.js"&gt;&lt;/script&gt;
 * &lt;script src="crypto-1.0.js"&gt;&lt;/script&gt;
 * var md = new KJUR.crypto.MessageDigest({alg: "sha256", prov: "sjcl"}); // sjcl supports sha256 only
 * md.updateString('aaa')
 * var mdHex = md.digest()
 */
KJUR.crypto.MessageDigest = function(params) {
    var md = null;
    var algName = null;
    var provName = null;
    var _CryptoJSMdName = {
	'md5': 'CryptoJS.algo.MD5',
	'sha1': 'CryptoJS.algo.SHA1',
	'sha224': 'CryptoJS.algo.SHA224',
	'sha256': 'CryptoJS.algo.SHA256',
	'sha384': 'CryptoJS.algo.SHA384',
	'sha512': 'CryptoJS.algo.SHA512',
	'ripemd160': 'CryptoJS.algo.RIPEMD160'
    };

    /**
     * set hash algorithm and provider
     * @name setAlgAndProvider
     * @memberOf KJUR.crypto.MessageDigest
     * @function
     * @param {String} alg hash algorithm name
     * @param {String} prov provider name
     * @description
     * @example
     * // for SHA1
     * md.setAlgAndProvider('sha1', 'cryptojs');
     * // for RIPEMD160
     * md.setAlgAndProvider('ripemd160', 'cryptojs');
     */
    this.setAlgAndProvider = function(alg, prov) {
	if (':md5:sha1:sha224:sha256:sha384:sha512:ripemd160:'.indexOf(alg) != -1 &&
	    prov == 'cryptojs') {
	    try {
		this.md = eval(_CryptoJSMdName[alg]).create();
	    } catch (ex) {
		throw "setAlgAndProvider hash alg set fail alg=" + alg + "/" + ex;
	    }
	    this.updateString = function(str) {
		this.md.update(str);
	    };
	    this.updateHex = function(hex) {
		var wHex = CryptoJS.enc.Hex.parse(hex);
		this.md.update(wHex);
	    };
	    this.digest = function() {
		var hash = this.md.finalize();
		return hash.toString(CryptoJS.enc.Hex);
	    };
	    this.digestString = function(str) {
		this.updateString(str);
		return this.digest();
	    };
	    this.digestHex = function(hex) {
		this.updateHex(hex);
		return this.digest();
	    };
	}
	if (':sha256:'.indexOf(alg) != -1 &&
	    prov == 'sjcl') {
	    try {
		this.md = new sjcl.hash.sha256();
	    } catch (ex) {
		throw "setAlgAndProvider hash alg set fail alg=" + alg + "/" + ex;
	    }
	    this.updateString = function(str) {
		this.md.update(str);
	    };
	    this.updateHex = function(hex) {
		var baHex = sjcl.codec.hex.toBits(hex);
		this.md.update(baHex);
	    };
	    this.digest = function() {
		var hash = this.md.finalize();
		return sjcl.codec.hex.fromBits(hash);
	    };
	    this.digestString = function(str) {
		this.updateString(str);
		return this.digest();
	    };
	    this.digestHex = function(hex) {
		this.updateHex(hex);
		return this.digest();
	    };
	}
    };

    /**
     * update digest by specified string
     * @name updateString
     * @memberOf KJUR.crypto.MessageDigest
     * @function
     * @param {String} str string to update
     * @description
     * @example
     * md.updateString('New York');
     */
    this.updateString = function(str) {
	throw "updateString(str) not supported for this alg/prov: " + this.algName + "/" + this.provName;
    };

    /**
     * update digest by specified hexadecimal string
     * @name updateHex
     * @memberOf KJUR.crypto.MessageDigest
     * @function
     * @param {String} hex hexadecimal string to update
     * @description
     * @example
     * md.updateHex('0afe36');
     */
    this.updateHex = function(hex) {
	throw "updateHex(hex) not supported for this alg/prov: " + this.algName + "/" + this.provName;
    };

    /**
     * completes hash calculation and returns hash result
     * @name digest
     * @memberOf KJUR.crypto.MessageDigest
     * @function
     * @description
     * @example
     * md.digest()
     */
    this.digest = function() {
	throw "digest() not supported for this alg/prov: " + this.algName + "/" + this.provName;
    };

    /**
     * performs final update on the digest using string, then completes the digest computation
     * @name digestString
     * @memberOf KJUR.crypto.MessageDigest
     * @function
     * @param {String} str string to final update
     * @description
     * @example
     * md.digestString('aaa')
     */
    this.digestString = function(str) {
	throw "digestString(str) not supported for this alg/prov: " + this.algName + "/" + this.provName;
    };

    /**
     * performs final update on the digest using hexadecimal string, then completes the digest computation
     * @name digestHex
     * @memberOf KJUR.crypto.MessageDigest
     * @function
     * @param {String} hex hexadecimal string to final update
     * @description
     * @example
     * md.digestHex('0f2abd')
     */
    this.digestHex = function(hex) {
	throw "digestHex(hex) not supported for this alg/prov: " + this.algName + "/" + this.provName;
    };

    if (typeof params != "undefined") {
	if (typeof params['alg'] != "undefined") {
	    this.algName = params['alg'];
	    this.provName = params['prov'];
	    this.setAlgAndProvider(params['alg'], params['prov']);
	}
    }
};


/**
 * Signature class which is very similar to java.security.Signature class
 * @name KJUR.crypto.Signature
 * @class Signature class which is very similar to java.security.Signature class
 * @param {Array} params parameters for constructor
 * @property {String} state Current state of this signature object whether 'SIGN', 'VERIFY' or null
 * @description
 * <br/>
 * As for params of constructor's argument, it can be specify following attributes:
 * <ul>
 * <li>alg - signature algorithm name (ex. {MD5,SHA1,SHA224,SHA256,SHA384,SHA512,RIPEMD160}withRSA)</li>
 * <li>provider - currently 'cryptojs/jsrsa' only</li>
 * <li>prvkeypem - PEM string of signer's private key. If this specified, no need to call initSign(prvKey).</li>
 * </ul>
 * <h4>SUPPORTED ALGORITHMS AND PROVIDERS</h4>
 * Signature class supports {MD5,SHA1,SHA224,SHA256,SHA384,SHA512,RIPEMD160}
 * withRSA algorithm in 'cryptojs/jsrsa' provider.
 * <h4>EXAMPLES</h4>
 * @example
 * // signature generation
 * var sig = new KJUR.crypto.Signature({"alg": "SHA1withRSA", "prov": "cryptojs/jsrsa"});
 * sig.initSign(prvKey);
 * sig.updateString('aaa');
 * var hSigVal = sig.sign();
 *
 * // signature validation
 * var sig2 = new KJUR.crypto.Signature({"alg": "SHA1withRSA", "prov": "cryptojs/jsrsa"});
 * sig2.initVerifyByCertificatePEM(cert)
 * sig.updateString('aaa');
 * var isValid = sig2.verify(hSigVal);
 */
KJUR.crypto.Signature = function(params) {
    var prvKey = null; // RSAKey for signing
    var pubKey = null; // RSAKey for verifying

    var md = null; // KJUR.crypto.MessageDigest object
    var sig = null;
    var algName = null;
    var provName = null;
    var algProvName = null;
    var mdAlgName = null;
    var pubkeyAlgName = null;
    var state = null;

    var sHashHex = null; // hex hash value for hex
    var hDigestInfo = null;
    var hPaddedDigestInfo = null;
    var hSign = null;

    this._setAlgNames = function() {
	if (this.algName.match(/^(.+)with(.+)$/)) {
	    this.mdAlgName = RegExp.$1.toLowerCase();
	    this.pubkeyAlgName = RegExp.$2.toLowerCase();
	}
    };

    this._zeroPaddingOfSignature = function(hex, bitLength) {
	var s = "";
	var nZero = bitLength / 4 - hex.length;
	for (var i = 0; i < nZero; i++) {
	    s = s + "0";
	}
	return s + hex;
    };

    /**
     * set signature algorithm and provider
     * @name setAlgAndProvider
     * @memberOf KJUR.crypto.Signature
     * @function
     * @param {String} alg signature algorithm name
     * @param {String} prov provider name
     * @description
     * @example
     * md.setAlgAndProvider('SHA1withRSA', 'cryptojs/jsrsa');
     */
    this.setAlgAndProvider = function(alg, prov) {
	this._setAlgNames();
	if (prov != 'cryptojs/jsrsa')
	    throw "provider not supported: " + prov;

	if (':md5:sha1:sha224:sha256:sha384:sha512:ripemd160:'.indexOf(this.mdAlgName) != -1) {
	    try {
		this.md = new KJUR.crypto.MessageDigest({'alg':this.mdAlgName,'prov':'cryptojs'});
	    } catch (ex) {
		throw "setAlgAndProvider hash alg set fail alg=" + this.mdAlgName + "/" + ex;
	    }

	    this.initSign = function(prvKey) {
		this.prvKey = prvKey;
		this.state = "SIGN";
	    };

	    this.initVerifyByPublicKey = function(rsaPubKey) {
		this.pubKey = rsaPubKey;
		this.state = "VERIFY";
	    };

	    this.initVerifyByCertificatePEM = function(certPEM) {
		var x509 = new X509();
		x509.readCertPEM(certPEM);
		this.pubKey = x509.subjectPublicKeyRSA;
		this.state = "VERIFY";
	    };

	    this.updateString = function(str) {
		this.md.updateString(str);
	    };
	    this.updateHex = function(hex) {
		this.md.updateHex(hex);
	    };
	    this.sign = function() {
                var util = KJUR.crypto.Util;
		var keyLen = this.prvKey.n.bitLength();
		this.sHashHex = this.md.digest();
		this.hDigestInfo = util.getDigestInfoHex(this.sHashHex, this.mdAlgName);
		this.hPaddedDigestInfo = 
                    util.getPaddedDigestInfoHex(this.sHashHex, this.mdAlgName, keyLen);

		var biPaddedDigestInfo = parseBigInt(this.hPaddedDigestInfo, 16);
		this.hoge = biPaddedDigestInfo.toString(16);

		var biSign = this.prvKey.doPrivate(biPaddedDigestInfo);
		this.hSign = this._zeroPaddingOfSignature(biSign.toString(16), keyLen);
		return this.hSign;
	    };
	    this.signString = function(str) {
		this.updateString(str);
		this.sign();
	    };
	    this.signHex = function(hex) {
		this.updateHex(hex);
		this.sign();
	    };
	    this.verify = function(hSigVal) {
                var util = KJUR.crypto.Util;
		var keyLen = this.pubKey.n.bitLength();
		this.sHashHex = this.md.digest();

		var biSigVal = parseBigInt(hSigVal, 16);
		var biPaddedDigestInfo = this.pubKey.doPublic(biSigVal);
		this.hPaddedDigestInfo = biPaddedDigestInfo.toString(16);
                var s = this.hPaddedDigestInfo;
                s = s.replace(/^1ff+00/, '');

		var hDIHEAD = KJUR.crypto.Util.DIGESTINFOHEAD[this.mdAlgName];
                if (s.indexOf(hDIHEAD) != 0) {
		    return false;
		}
		var hHashFromDI = s.substr(hDIHEAD.length);
		//alert(hHashFromDI + "\n" + this.sHashHex);
		return (hHashFromDI == this.sHashHex);
	    };
	}
    };

    /**
     * Initialize this object for verifying with a public key
     * @name initVerifyByPublicKey
     * @memberOf KJUR.crypto.Signature
     * @function
     * @param {RSAKey} rsaPubKey RSAKey object of public key
     * @since 1.0.2
     * @description
     * @example
     * sig.initVerifyByPublicKey(prvKey)
     */
    this.initVerifyByPublicKey = function(rsaPubKey) {
	throw "initVerifyByPublicKey(rsaPubKeyy) not supported for this alg:prov=" + this.algProvName;
    };

    /**
     * Initialize this object for verifying with a certficate
     * @name initVerifyByCertificatePEM
     * @memberOf KJUR.crypto.Signature
     * @function
     * @param {String} certPEM PEM formatted string of certificate
     * @since 1.0.2
     * @description
     * @example
     * sig.initVerifyByCertificatePEM(certPEM)
     */
    this.initVerifyByCertificatePEM = function(certPEM) {
	throw "initVerifyByCertificatePEM(certPEM) not supported for this alg:prov=" + this.algProvName;
    };

    /**
     * Initialize this object for signing
     * @name initSign
     * @memberOf KJUR.crypto.Signature
     * @function
     * @param {RSAKey} prvKey RSAKey object of private key
     * @description
     * @example
     * sig.initSign(prvKey)
     */
    this.initSign = function(prvKey) {
	throw "initSign(prvKey) not supported for this alg:prov=" + this.algProvName;
    };

    /**
     * Updates the data to be signed or verified by a string
     * @name updateString
     * @memberOf KJUR.crypto.Signature
     * @function
     * @param {String} str string to use for the update
     * @description
     * @example
     * sig.updateString('aaa')
     */
    this.updateString = function(str) {
	throw "updateString(str) not supported for this alg:prov=" + this.algProvName;
    };

    /**
     * Updates the data to be signed or verified by a hexadecimal string
     * @name updateHex
     * @memberOf KJUR.crypto.Signature
     * @function
     * @param {String} hex hexadecimal string to use for the update
     * @description
     * @example
     * sig.updateHex('1f2f3f')
     */
    this.updateHex = function(hex) {
	throw "updateHex(hex) not supported for this alg:prov=" + this.algProvName;
    };

    /**
     * Returns the signature bytes of all data updates as a hexadecimal string
     * @name sign
     * @memberOf KJUR.crypto.Signature
     * @function
     * @return the signature bytes as a hexadecimal string
     * @description
     * @example
     * var hSigValue = sig.sign()
     */
    this.sign = function() {
	throw "sign() not supported for this alg:prov=" + this.algProvName;
    };

    /**
     * performs final update on the sign using string, then returns the signature bytes of all data updates as a hexadecimal string
     * @name signString
     * @memberOf KJUR.crypto.Signature
     * @function
     * @param {String} str string to final update
     * @return the signature bytes of a hexadecimal string
     * @description
     * @example
     * var hSigValue = sig.signString('aaa')
     */
    this.signString = function(str) {
	throw "digestString(str) not supported for this alg:prov=" + this.algProvName;
    };

    /**
     * performs final update on the sign using hexadecimal string, then returns the signature bytes of all data updates as a hexadecimal string
     * @name signHex
     * @memberOf KJUR.crypto.Signature
     * @function
     * @param {String} hex hexadecimal string to final update
     * @return the signature bytes of a hexadecimal string
     * @description
     * @example
     * var hSigValue = sig.signHex('1fdc33')
     */
    this.signHex = function(hex) {
	throw "digestHex(hex) not supported for this alg:prov=" + this.algProvName;
    };

    /**
     * verifies the passed-in signature.
     * @name verify
     * @memberOf KJUR.crypto.Signature
     * @function
     * @param {String} str string to final update
     * @return {Boolean} true if the signature was verified, otherwise false
     * @description
     * @example
     * var isValid = sig.verify('1fbcefdca4823a7(snip)')
     */
    this.verify = function(hSigVal) {
	throw "verify(hSigVal) not supported for this alg:prov=" + this.algProvName;
    };

    if (typeof params != "undefined") {
	if (typeof params['alg'] != "undefined") {
	    this.algName = params['alg'];
	    this.provName = params['prov'];
	    this.algProvName = params['alg'] + ":" + params['prov'];
	    this.setAlgAndProvider(params['alg'], params['prov']);
	    this._setAlgNames();
	}
	if (typeof params['prvkeypem'] != "undefined") {
	    if (typeof params['prvkeypas'] != "undefined") {
		throw "both prvkeypem and prvkeypas parameters not supported";
	    } else {
		try {
		    var prvKey = new RSAKey();
		    prvKey.readPrivateKeyFromPEMString(params['prvkeypem']);
		    this.initSign(prvKey);
		} catch (ex) {
		    throw "fatal error to load pem private key: " + ex;
		}
	    }
	}
    }
};

exports.KJUR = KJUR;
module.exports = exports;
/*! rsapem-1.1.js (c) 2012 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
//
// rsa-pem.js - adding function for reading/writing PKCS#1 PEM private key
//              to RSAKey class.
//
// version: 1.1.1 (2013-Apr-12)
//
// Copyright (c) 2010-2013 Kenji Urushima (kenji.urushima@gmail.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// This software is licensed under the terms of the MIT License.
// http://kjur.github.com/jsrsasign/license/
// 
//
// Depends on:
//
//
//
// _RSApem_pemToBase64(sPEM)
//
//   removing PEM header, PEM footer and space characters including
//   new lines from PEM formatted RSA private key string.
//
var ASN1HEX = require('./asn1hex-1.1.js').ASN1HEX;
var b64tohex = require('./base64.js').b64tohex;
var RSAKey = require('./rsa2.js').RSAKey;

/**
 * @fileOverview
 * @name rsapem-1.1.js
 * @author Kenji Urushima kenji.urushima@gmail.com
 * @version 1.1
 * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
 */
function _rsapem_pemToBase64(sPEMPrivateKey) {
  var s = sPEMPrivateKey;
  s = s.replace("-----BEGIN RSA PRIVATE KEY-----", "");
  s = s.replace("-----END RSA PRIVATE KEY-----", "");
  s = s.replace(/[ \n]+/g, "");
  return s;
}

function _rsapem_getPosArrayOfChildrenFromHex(hPrivateKey) {
  var a = new Array();
  var v1 = ASN1HEX.getStartPosOfV_AtObj(hPrivateKey, 0);
  var n1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, v1);
  var e1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, n1);
  var d1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, e1);
  var p1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, d1);
  var q1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, p1);
  var dp1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, q1);
  var dq1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, dp1);
  var co1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, dq1);
  a.push(v1, n1, e1, d1, p1, q1, dp1, dq1, co1);
  return a;
}

function _rsapem_getHexValueArrayOfChildrenFromHex(hPrivateKey) {
  var posArray = _rsapem_getPosArrayOfChildrenFromHex(hPrivateKey);
  var v =  ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[0]);
  var n =  ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[1]);
  var e =  ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[2]);
  var d =  ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[3]);
  var p =  ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[4]);
  var q =  ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[5]);
  var dp = ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[6]);
  var dq = ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[7]);
  var co = ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[8]);
  var a = new Array();
  a.push(v, n, e, d, p, q, dp, dq, co);
  return a;
}

/**
 * read RSA private key from a ASN.1 hexadecimal string
 * @name readPrivateKeyFromASN1HexString
 * @memberOf RSAKey#
 * @function
 * @param {String} keyHex ASN.1 hexadecimal string of PKCS#1 private key.
 * @since 1.1.1
 */
function _rsapem_readPrivateKeyFromASN1HexString(keyHex) {
  var a = _rsapem_getHexValueArrayOfChildrenFromHex(keyHex);
  this.setPrivateEx(a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8]);
}

/**
 * read PKCS#1 private key from a string
 * @name readPrivateKeyFromPEMString
 * @memberOf RSAKey#
 * @function
 * @param {String} keyPEM string of PKCS#1 private key.
 */
function _rsapem_readPrivateKeyFromPEMString(keyPEM) {
  var keyB64 = _rsapem_pemToBase64(keyPEM);
  var keyHex = b64tohex(keyB64) // depends base64.js
  var a = _rsapem_getHexValueArrayOfChildrenFromHex(keyHex);
  this.setPrivateEx(a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8]);
}

RSAKey.prototype.readPrivateKeyFromPEMString = _rsapem_readPrivateKeyFromPEMString;
RSAKey.prototype.readPrivateKeyFromASN1HexString = _rsapem_readPrivateKeyFromASN1HexString;

exports.RSAKey = RSAKey;
module.exports = exports;
/*! rsasign-1.2.2.js (c) 2012 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
//
// rsa-sign.js - adding signing functions to RSAKey class.
//
//
// version: 1.2.2 (13 May 2013)
//
// Copyright (c) 2010-2013 Kenji Urushima (kenji.urushima@gmail.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// This software is licensed under the terms of the MIT License.
// http://kjur.github.com/jsrsasign/license/
//
//
// Depends on:
//   function sha1.hex(s) of sha1.js
//   jsbn.js
//   jsbn2.js
//   rsa.js
//   rsa2.js
//
var intShim = require('jsbn');
var BigInteger = intShim.BigInteger ? intShim.BigInteger : intShim;
var RSAKey = require('./rsapem-1.1.js').RSAKey

function parseBigInt(str,r) {
  return new BigInteger(str,r);
}

// keysize / pmstrlen
//  512 /  128
// 1024 /  256
// 2048 /  512
// 4096 / 1024

/**
 * @fileOverview
 * @name rsasign-1.2.js
 * @author Kenji Urushima kenji.urushima@gmail.com
 * @version 1.2.2
 * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
 */

/**
 * @property {Dictionary} _RSASIGN_DIHEAD
 * @description Array of head part of hexadecimal DigestInfo value for hash algorithms.
 * You can add any DigestInfo hash algorith for signing.
 * See PKCS#1 v2.1 spec (p38).
 */
var _RSASIGN_DIHEAD = [];
_RSASIGN_DIHEAD['sha1'] =      "3021300906052b0e03021a05000414";
_RSASIGN_DIHEAD['sha256'] =    "3031300d060960864801650304020105000420";
_RSASIGN_DIHEAD['sha384'] =    "3041300d060960864801650304020205000430";
_RSASIGN_DIHEAD['sha512'] =    "3051300d060960864801650304020305000440";
_RSASIGN_DIHEAD['md2'] =       "3020300c06082a864886f70d020205000410";
_RSASIGN_DIHEAD['md5'] =       "3020300c06082a864886f70d020505000410";
_RSASIGN_DIHEAD['ripemd160'] = "3021300906052b2403020105000414";

/**
 * @property {Dictionary} _RSASIGN_HASHHEXFUNC
 * @description Array of functions which calculate hash and returns it as hexadecimal.
 * You can add any hash algorithm implementations.
 */
var _RSASIGN_HASHHEXFUNC = [];
_RSASIGN_HASHHEXFUNC['sha1'] =      function(s){return KJUR.crypto.Util.sha1(s);};
_RSASIGN_HASHHEXFUNC['sha256'] =    function(s){return KJUR.crypto.Util.sha256(s);}
_RSASIGN_HASHHEXFUNC['sha512'] =    function(s){return KJUR.crypto.Util.sha512(s);}
_RSASIGN_HASHHEXFUNC['md5'] =       function(s){return KJUR.crypto.Util.md5(s);};
_RSASIGN_HASHHEXFUNC['ripemd160'] = function(s){return KJUR.crypto.Util.ripemd160(s);};

//_RSASIGN_HASHHEXFUNC['sha1'] =   function(s){return sha1.hex(s);}   // http://user1.matsumoto.ne.jp/~goma/js/hash.html
//_RSASIGN_HASHHEXFUNC['sha256'] = function(s){return sha256.hex;}    // http://user1.matsumoto.ne.jp/~goma/js/hash.html

var _RE_HEXDECONLY = new RegExp("");
_RE_HEXDECONLY.compile("[^0-9a-f]", "gi");

// ========================================================================
// Signature Generation
// ========================================================================

function _rsasign_getHexPaddedDigestInfoForString(s, keySize, hashAlg) {
    var pmStrLen = keySize / 4;
    var hashFunc = _RSASIGN_HASHHEXFUNC[hashAlg];
    var sHashHex = hashFunc(s);

    var sHead = "0001";
    var sTail = "00" + _RSASIGN_DIHEAD[hashAlg] + sHashHex;
    var sMid = "";
    var fLen = pmStrLen - sHead.length - sTail.length;
    for (var i = 0; i < fLen; i += 2) {
	sMid += "ff";
    }
    sPaddedMessageHex = sHead + sMid + sTail;
    return sPaddedMessageHex;
}

function _zeroPaddingOfSignature(hex, bitLength) {
    var s = "";
    var nZero = bitLength / 4 - hex.length;
    for (var i = 0; i < nZero; i++) {
	s = s + "0";
    }
    return s + hex;
}

/**
 * sign for a message string with RSA private key.<br/>
 * @name signString
 * @memberOf RSAKey#
 * @function
 * @param {String} s message string to be signed.
 * @param {String} hashAlg hash algorithm name for signing.<br/>
 * @return returns hexadecimal string of signature value.
 */
function _rsasign_signString(s, hashAlg) {
    //alert("this.n.bitLength() = " + this.n.bitLength());
    var hPM = _rsasign_getHexPaddedDigestInfoForString(s, this.n.bitLength(), hashAlg);
    var biPaddedMessage = parseBigInt(hPM, 16);
    var biSign = this.doPrivate(biPaddedMessage);
    var hexSign = biSign.toString(16);
    return _zeroPaddingOfSignature(hexSign, this.n.bitLength());
}

function _rsasign_signStringWithSHA1(s) {
    return _rsasign_signString.call(this, s, 'sha1');
}

function _rsasign_signStringWithSHA256(s) {
    return _rsasign_signString.call(this, s, 'sha256');
}

// PKCS#1 (PSS) mask generation function
function pss_mgf1_str(seed, len, hash) {
    var mask = '', i = 0;

    while (mask.length < len) {
        mask += hash(seed + String.fromCharCode.apply(String, [
                (i & 0xff000000) >> 24,
                (i & 0x00ff0000) >> 16,
                (i & 0x0000ff00) >> 8,
                i & 0x000000ff]));
        i += 1;
    }

    return mask;
}

/**
 * sign for a message string with RSA private key by PKCS#1 PSS signing.<br/>
 * @name signStringPSS
 * @memberOf RSAKey#
 * @function
 * @param {String} s message string to be signed.
 * @param {String} hashAlg hash algorithm name for signing.<br/>
 * @return returns hexadecimal string of signature value.
 */
function _rsasign_signStringPSS(s, hashAlg, sLen) {
    var hashFunc = _RSASIGN_HASHRAWFUNC[hashAlg];
    var mHash = hashFunc(s);
    var hLen = mHash.length;
    var emBits = this.n.bitLength() - 1;
    var emLen = Math.ceil(emBits / 8);
    var i;

    if (sLen === -1) {
        sLen = hLen; // same has hash length
    } else if ((sLen === -2) || (sLen === undefined)) {
        sLen = emLen - hLen - 2; // maximum
    } else if (sLen < -2) {
        throw "invalid salt length";
    }

    if (emLen < (hLen + sLen + 2)) {
        throw "data too long";
    }

    var salt = '';

    if (sLen > 0) {
        salt = new Array(sLen);
        new SecureRandom().nextBytes(salt);
        salt = String.fromCharCode.apply(String, salt);
    }

    var H = hashFunc('\x00\x00\x00\x00\x00\x00\x00\x00' + mHash + salt);
    var PS = [];

    for (i = 0; i < emLen - sLen - hLen - 2; i += 1) {
        PS[i] = 0x00;
    }

    var DB = String.fromCharCode.apply(String, PS) + '\x01' + salt;
    var dbMask = pss_mgf1_str(H, DB.length, hashFunc);
    var maskedDB = [];

    for (i = 0; i < DB.length; i += 1) {
        maskedDB[i] = DB.charCodeAt(i) ^ dbMask.charCodeAt(i);
    }

    var mask = (0xff00 >> (8 * emLen - emBits)) & 0xff;
    maskedDB[0] &= ~mask;

    for (i = 0; i < hLen; i++) {
        maskedDB.push(H.charCodeAt(i));
    }

    maskedDB.push(0xbc);

    return _zeroPaddingOfSignature(
            this.doPrivate(new BigInteger(maskedDB)).toString(16),
            this.n.bitLength());
}

// ========================================================================
// Signature Verification
// ========================================================================

function _rsasign_getDecryptSignatureBI(biSig, hN, hE) {
    var rsa = new RSAKey();
    rsa.setPublic(hN, hE);
    var biDecryptedSig = rsa.doPublic(biSig);
    return biDecryptedSig;
}

function _rsasign_getHexDigestInfoFromSig(biSig, hN, hE) {
    var biDecryptedSig = _rsasign_getDecryptSignatureBI(biSig, hN, hE);
    var hDigestInfo = biDecryptedSig.toString(16).replace(/^1f+00/, '');
    return hDigestInfo;
}

function _rsasign_getAlgNameAndHashFromHexDisgestInfo(hDigestInfo) {
    for (var algName in _RSASIGN_DIHEAD) {
	var head = _RSASIGN_DIHEAD[algName];
	var len = head.length;
	if (hDigestInfo.substring(0, len) == head) {
	    var a = [algName, hDigestInfo.substring(len)];
	    return a;
	}
    }
    return [];
}

function _rsasign_verifySignatureWithArgs(sMsg, biSig, hN, hE) {
    var hDigestInfo = _rsasign_getHexDigestInfoFromSig(biSig, hN, hE);
    var digestInfoAry = _rsasign_getAlgNameAndHashFromHexDisgestInfo(hDigestInfo);
    if (digestInfoAry.length == 0) return false;
    var algName = digestInfoAry[0];
    var diHashValue = digestInfoAry[1];
    var ff = _RSASIGN_HASHHEXFUNC[algName];
    var msgHashValue = ff(sMsg);
    return (diHashValue == msgHashValue);
}

function _rsasign_verifyHexSignatureForMessage(hSig, sMsg) {
    var biSig = parseBigInt(hSig, 16);
    var result = _rsasign_verifySignatureWithArgs(sMsg, biSig,
						  this.n.toString(16),
						  this.e.toString(16));
    return result;
}

/**
 * verifies a sigature for a message string with RSA public key.<br/>
 * @name verifyString
 * @memberOf RSAKey#
 * @function
 * @param {String} sMsg message string to be verified.
 * @param {String} hSig hexadecimal string of siganture.<br/>
 *                 non-hexadecimal charactors including new lines will be ignored.
 * @return returns 1 if valid, otherwise 0
 */
function _rsasign_verifyString(sMsg, hSig) {
    hSig = hSig.replace(_RE_HEXDECONLY, '');
    if (hSig.length != this.n.bitLength() / 4) return 0;
    hSig = hSig.replace(/[ \n]+/g, "");
    var biSig = parseBigInt(hSig, 16);
    var biDecryptedSig = this.doPublic(biSig);
    var hDigestInfo = biDecryptedSig.toString(16).replace(/^1f+00/, '');
    var digestInfoAry = _rsasign_getAlgNameAndHashFromHexDisgestInfo(hDigestInfo);
  
    if (digestInfoAry.length == 0) return false;
    var algName = digestInfoAry[0];
    var diHashValue = digestInfoAry[1];
    var ff = _RSASIGN_HASHHEXFUNC[algName];
    var msgHashValue = ff(sMsg);
    return (diHashValue == msgHashValue);
}

/**
 * verifies a sigature for a message string with RSA public key by PKCS#1 PSS sign.<br/>
 * @name verifyStringPSS
 * @memberOf RSAKey#
 * @function
 * @param {String} sMsg message string to be verified.
 * @param {String} hSig hexadecimal string of siganture.<br/>
 *                 non-hexadecimal charactors including new lines will be ignored.
 * @return returns 1 if valid, otherwise 0
 */
function _rsasign_verifyStringPSS(sMsg, hSig, hashAlg, sLen) {
    if (hSig.length !== this.n.bitLength() / 4) {
        return false;
    }

    var hashFunc = _RSASIGN_HASHRAWFUNC[hashAlg];
    var mHash = hashFunc(sMsg);
    var hLen = mHash.length;
    var emBits = this.n.bitLength() - 1;
    var emLen = Math.ceil(emBits / 8);
    var i;

    if (sLen === -1) {
        sLen = hLen; // same has hash length
    } else if ((sLen === -2) || (sLen === undefined)) {
        sLen = emLen - hLen - 2; // maximum
    } else if (sLen < -2) {
        throw "invalid salt length";
    }

    if (emLen < (hLen + sLen + 2)) {
        throw "data too long";
    }

    var em = this.doPublic(parseBigInt(hSig, 16)).toByteArray();

    for (i = 0; i < em.length; i += 1) {
        em[i] &= 0xff;
    }

    while (em.length < emLen) {
        em.unshift(0);
    }

    if (em[emLen -1] !== 0xbc) {
        throw "encoded message does not end in 0xbc";
    }

    em = String.fromCharCode.apply(String, em);

    var maskedDB = em.substr(0, emLen - hLen - 1);
    var H = em.substr(maskedDB.length, hLen);

    var mask = (0xff00 >> (8 * emLen - emBits)) & 0xff;

    if ((maskedDB.charCodeAt(0) & mask) !== 0) {
        throw "bits beyond keysize not zero";
    }

    var dbMask = pss_mgf1_str(H, maskedDB.length, hashFunc);
    var DB = [];

    for (i = 0; i < maskedDB.length; i += 1) {
        DB[i] = maskedDB.charCodeAt(i) ^ dbMask.charCodeAt(i);
    }

    DB[0] &= ~mask;

    var checkLen = emLen - hLen - sLen - 2;

    for (i = 0; i < checkLen; i += 1) {
        if (DB[i] !== 0x00) {
            throw "leftmost octets not zero";
        }
    }

    if (DB[checkLen] !== 0x01) {
        throw "0x01 marker not found";
    }

    return H === hashFunc('\x00\x00\x00\x00\x00\x00\x00\x00' + mHash +
                          String.fromCharCode.apply(String, DB.slice(-sLen)));
}

RSAKey.prototype.signString = _rsasign_signString;
RSAKey.prototype.signStringWithSHA1 = _rsasign_signStringWithSHA1;
RSAKey.prototype.signStringWithSHA256 = _rsasign_signStringWithSHA256;
RSAKey.prototype.sign = _rsasign_signString;
RSAKey.prototype.signWithSHA1 = _rsasign_signStringWithSHA1;
RSAKey.prototype.signWithSHA256 = _rsasign_signStringWithSHA256;
RSAKey.prototype.signStringPSS = _rsasign_signStringPSS;
RSAKey.prototype.signPSS = _rsasign_signStringPSS;
RSAKey.SALT_LEN_HLEN = -1;
RSAKey.SALT_LEN_MAX = -2;

RSAKey.prototype.verifyString = _rsasign_verifyString;
RSAKey.prototype.verifyHexSignatureForMessage = _rsasign_verifyHexSignatureForMessage;
RSAKey.prototype.verify = _rsasign_verifyString;
RSAKey.prototype.verifyHexSignatureForByteArrayMessage = _rsasign_verifyHexSignatureForMessage;
RSAKey.prototype.verifyStringPSS = _rsasign_verifyStringPSS;
RSAKey.prototype.verifyPSS = _rsasign_verifyStringPSS;
RSAKey.SALT_LEN_RECOVER = -2;

/**
 * @name RSAKey
 * @class key of RSA public key algorithm
 * @description Tom Wu's RSA Key class and extension
 */

exports.RSAKey = RSAKey;
module.exports = exports;
/*! asn1hex-1.1.js (c) 2012 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
//
// asn1hex.js - Hexadecimal represented ASN.1 string library
//
// version: 1.1 (09-May-2012)
//
// Copyright (c) 2010-2012 Kenji Urushima (kenji.urushima@gmail.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// This software is licensed under the terms of the MIT License.
// http://kjur.github.com/jsrsasign/license/
//
// Depends on:
//
var intShim = require('jsbn')

var BigInteger = intShim.BigInteger ? intShim.BigInteger : intShim;
function parseBigInt(str,r) {
  return new BigInteger(str,r);
}
// MEMO:
//   f('3082025b02...', 2) ... 82025b ... 3bytes
//   f('020100', 2) ... 01 ... 1byte
//   f('0203001...', 2) ... 03 ... 1byte
//   f('02818003...', 2) ... 8180 ... 2bytes
//   f('3080....0000', 2) ... 80 ... -1
//
//   Requirements:
//   - ASN.1 type octet length MUST be 1. 
//     (i.e. ASN.1 primitives like SET, SEQUENCE, INTEGER, OCTETSTRING ...)
//   - 

/**
 * @fileOverview
 * @name asn1hex-1.1.js
 * @author Kenji Urushima kenji.urushima@gmail.com
 * @version 1.1
 * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
 */

/**
 * get byte length for ASN.1 L(length) bytes
 * @name getByteLengthOfL_AtObj
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} pos string index
 * @return byte length for ASN.1 L(length) bytes
 */
function _asnhex_getByteLengthOfL_AtObj(s, pos) {
  if (s.substring(pos + 2, pos + 3) != '8') return 1;
  var i = parseInt(s.substring(pos + 3, pos + 4));
  if (i == 0) return -1; 		// length octet '80' indefinite length
  if (0 < i && i < 10) return i + 1;	// including '8?' octet;
  return -2;				// malformed format
}


/**
 * get hexadecimal string for ASN.1 L(length) bytes
 * @name getHexOfL_AtObj
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} pos string index
 * @return {String} hexadecimal string for ASN.1 L(length) bytes
 */
function _asnhex_getHexOfL_AtObj(s, pos) {
  var len = _asnhex_getByteLengthOfL_AtObj(s, pos);
  if (len < 1) return '';
  return s.substring(pos + 2, pos + 2 + len * 2);
}

//
//   getting ASN.1 length value at the position 'idx' of
//   hexa decimal string 's'.
//
//   f('3082025b02...', 0) ... 82025b ... ???
//   f('020100', 0) ... 01 ... 1
//   f('0203001...', 0) ... 03 ... 3
//   f('02818003...', 0) ... 8180 ... 128
/**
 * get integer value of ASN.1 length for ASN.1 data
 * @name getIntOfL_AtObj
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} pos string index
 * @return ASN.1 L(length) integer value
 */
function _asnhex_getIntOfL_AtObj(s, pos) {
  var hLength = _asnhex_getHexOfL_AtObj(s, pos);
  if (hLength == '') return -1;
  var bi;
  if (parseInt(hLength.substring(0, 1)) < 8) {
     bi = parseBigInt(hLength, 16);
  } else {
     bi = parseBigInt(hLength.substring(2), 16);
  }
  return bi.intValue();
}

/**
 * get ASN.1 value starting string position for ASN.1 object refered by index 'idx'.
 * @name getStartPosOfV_AtObj
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} pos string index
 */
function _asnhex_getStartPosOfV_AtObj(s, pos) {
  var l_len = _asnhex_getByteLengthOfL_AtObj(s, pos);
  if (l_len < 0) return l_len;
  return pos + (l_len + 1) * 2;
}

/**
 * get hexadecimal string of ASN.1 V(value)
 * @name getHexOfV_AtObj
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} pos string index
 * @return {String} hexadecimal string of ASN.1 value.
 */
function _asnhex_getHexOfV_AtObj(s, pos) {
  var pos1 = _asnhex_getStartPosOfV_AtObj(s, pos);
  var len = _asnhex_getIntOfL_AtObj(s, pos);
  return s.substring(pos1, pos1 + len * 2);
}

/**
 * get hexadecimal string of ASN.1 TLV at
 * @name getHexOfTLV_AtObj
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} pos string index
 * @return {String} hexadecimal string of ASN.1 TLV.
 * @since 1.1
 */
function _asnhex_getHexOfTLV_AtObj(s, pos) {
  var hT = s.substr(pos, 2);
  var hL = _asnhex_getHexOfL_AtObj(s, pos);
  var hV = _asnhex_getHexOfV_AtObj(s, pos);
  return hT + hL + hV;
}

/**
 * get next sibling starting index for ASN.1 object string
 * @name getPosOfNextSibling_AtObj
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} pos string index
 * @return next sibling starting index for ASN.1 object string
 */
function _asnhex_getPosOfNextSibling_AtObj(s, pos) {
  var pos1 = _asnhex_getStartPosOfV_AtObj(s, pos);
  var len = _asnhex_getIntOfL_AtObj(s, pos);
  return pos1 + len * 2;
}

/**
 * get array of indexes of child ASN.1 objects
 * @name getPosArrayOfChildren_AtObj
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} start string index of ASN.1 object
 * @return {Array of Number} array of indexes for childen of ASN.1 objects
 */
function _asnhex_getPosArrayOfChildren_AtObj(h, pos) {
  var a = new Array();
  var p0 = _asnhex_getStartPosOfV_AtObj(h, pos);
  a.push(p0);

  var len = _asnhex_getIntOfL_AtObj(h, pos);
  var p = p0;
  var k = 0;
  while (1) {
    var pNext = _asnhex_getPosOfNextSibling_AtObj(h, p);
    if (pNext == null || (pNext - p0  >= (len * 2))) break;
    if (k >= 200) break;

    a.push(pNext);
    p = pNext;

    k++;
  }

  return a;
}

/**
 * get string index of nth child object of ASN.1 object refered by h, idx
 * @name getNthChildIndex_AtObj
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string of ASN.1 DER encoded data
 * @param {Number} idx start string index of ASN.1 object
 * @param {Number} nth for child
 * @return {Number} string index of nth child.
 * @since 1.1
 */
function _asnhex_getNthChildIndex_AtObj(h, idx, nth) {
  var a = _asnhex_getPosArrayOfChildren_AtObj(h, idx);
  return a[nth];
}

// ========== decendant methods ==============================

/**
 * get string index of nth child object of ASN.1 object refered by h, idx
 * @name getDecendantIndexByNthList
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string of ASN.1 DER encoded data
 * @param {Number} currentIndex start string index of ASN.1 object
 * @param {Array of Number} nthList array list of nth
 * @return {Number} string index refered by nthList
 * @since 1.1
 */
function _asnhex_getDecendantIndexByNthList(h, currentIndex, nthList) {
  if (nthList.length == 0) {
    return currentIndex;
  }
  var firstNth = nthList.shift();
  var a = _asnhex_getPosArrayOfChildren_AtObj(h, currentIndex);
  return _asnhex_getDecendantIndexByNthList(h, a[firstNth], nthList);
}

/**
 * get hexadecimal string of ASN.1 TLV refered by current index and nth index list.
 * @name getDecendantHexTLVByNthList
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string of ASN.1 DER encoded data
 * @param {Number} currentIndex start string index of ASN.1 object
 * @param {Array of Number} nthList array list of nth
 * @return {Number} hexadecimal string of ASN.1 TLV refered by nthList
 * @since 1.1
 */
function _asnhex_getDecendantHexTLVByNthList(h, currentIndex, nthList) {
  var idx = _asnhex_getDecendantIndexByNthList(h, currentIndex, nthList);
  return _asnhex_getHexOfTLV_AtObj(h, idx);
}

/**
 * get hexadecimal string of ASN.1 V refered by current index and nth index list.
 * @name getDecendantHexVByNthList
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string of ASN.1 DER encoded data
 * @param {Number} currentIndex start string index of ASN.1 object
 * @param {Array of Number} nthList array list of nth
 * @return {Number} hexadecimal string of ASN.1 V refered by nthList
 * @since 1.1
 */
function _asnhex_getDecendantHexVByNthList(h, currentIndex, nthList) {
  var idx = _asnhex_getDecendantIndexByNthList(h, currentIndex, nthList);
  return _asnhex_getHexOfV_AtObj(h, idx);
}

// ========== class definition ==============================

/**
 * ASN.1 DER encoded hexadecimal string utility class
 * @class ASN.1 DER encoded hexadecimal string utility class
 * @author Kenji Urushima
 * @version 1.1 (09 May 2012)
 * @see <a href="http://kjur.github.com/jsrsasigns/">'jwrsasign'(RSA Sign JavaScript Library) home page http://kjur.github.com/jsrsasign/</a>
 * @since 1.1
 */
var ASN1HEX = function ASN1HEX() {
  return ASN1HEX;
}

ASN1HEX.getByteLengthOfL_AtObj = _asnhex_getByteLengthOfL_AtObj;
ASN1HEX.getHexOfL_AtObj = _asnhex_getHexOfL_AtObj;
ASN1HEX.getIntOfL_AtObj = _asnhex_getIntOfL_AtObj;
ASN1HEX.getStartPosOfV_AtObj = _asnhex_getStartPosOfV_AtObj;
ASN1HEX.getHexOfV_AtObj = _asnhex_getHexOfV_AtObj;
ASN1HEX.getHexOfTLV_AtObj = _asnhex_getHexOfTLV_AtObj;
ASN1HEX.getPosOfNextSibling_AtObj = _asnhex_getPosOfNextSibling_AtObj;
ASN1HEX.getPosArrayOfChildren_AtObj = _asnhex_getPosArrayOfChildren_AtObj;
ASN1HEX.getNthChildIndex_AtObj = _asnhex_getNthChildIndex_AtObj;
ASN1HEX.getDecendantIndexByNthList = _asnhex_getDecendantIndexByNthList;
ASN1HEX.getDecendantHexVByNthList = _asnhex_getDecendantHexVByNthList;
ASN1HEX.getDecendantHexTLVByNthList = _asnhex_getDecendantHexTLVByNthList;

exports.ASN1HEX = ASN1HEX;
module.exports = exports;
/*! x509-1.1.js (c) 2012 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
// 
// x509.js - X509 class to read subject public key from certificate.
//
// version: 1.1 (10-May-2012)
//
// Copyright (c) 2010-2012 Kenji Urushima (kenji.urushima@gmail.com)
//
// Copyright (c) 2010-2013 Kenji Urushima (kenji.urushima@gmail.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// This software is licensed under the terms of the MIT License.
// http://kjur.github.com/jsrsasign/license
//
//
// Depends:
//   base64.js
//   rsa.js
//   asn1hex.js
var b64tohex = require('./base64.js').b64tohex;
var RSAKey = require('./rsa.js').RSAKey;
var ASN1HEX = require('./asn1hex-1.1.js').ASN1HEX;

/**
 * @fileOverview
 * @name x509-1.1.js
 * @author Kenji Urushima kenji.urushima@gmail.com
 * @version 1.1
 * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
 */

function _x509_pemToBase64(sCertPEM) {
  var s = sCertPEM;
  s = s.replace("-----BEGIN CERTIFICATE-----", "");
  s = s.replace("-----END CERTIFICATE-----", "");
  s = s.replace(/[ \n]+/g, "");
  return s;
}

function _x509_pemToHex(sCertPEM) {
  var b64Cert = _x509_pemToBase64(sCertPEM);
  var hCert = b64tohex(b64Cert);
  return hCert;
}

function _x509_getHexTbsCertificateFromCert(hCert) {
  var pTbsCert = ASN1HEX.getStartPosOfV_AtObj(hCert, 0);
  return pTbsCert;
}

// NOTE: privateKeyUsagePeriod field of X509v2 not supported.
// NOTE: v1 and v3 supported
function _x509_getSubjectPublicKeyInfoPosFromCertHex(hCert) {
  var pTbsCert = ASN1HEX.getStartPosOfV_AtObj(hCert, 0);
  var a = ASN1HEX.getPosArrayOfChildren_AtObj(hCert, pTbsCert); 
  if (a.length < 1) return -1;
  if (hCert.substring(a[0], a[0] + 10) == "a003020102") { // v3
    if (a.length < 6) return -1;
    return a[6];
  } else {
    if (a.length < 5) return -1;
    return a[5];
  }
}

// NOTE: Without BITSTRING encapsulation.
function _x509_getSubjectPublicKeyPosFromCertHex(hCert) {
  var pInfo = _x509_getSubjectPublicKeyInfoPosFromCertHex(hCert);
  if (pInfo == -1) return -1;    
  var a = ASN1HEX.getPosArrayOfChildren_AtObj(hCert, pInfo); 
  if (a.length != 2) return -1;
  var pBitString = a[1];
  if (hCert.substring(pBitString, pBitString + 2) != '03') return -1;
  var pBitStringV = ASN1HEX.getStartPosOfV_AtObj(hCert, pBitString);

  if (hCert.substring(pBitStringV, pBitStringV + 2) != '00') return -1;
  return pBitStringV + 2;
}

function _x509_getPublicKeyHexArrayFromCertHex(hCert) {
  var p = _x509_getSubjectPublicKeyPosFromCertHex(hCert);
  var a = ASN1HEX.getPosArrayOfChildren_AtObj(hCert, p); 
  if (a.length != 2) return [];
  var hN = ASN1HEX.getHexOfV_AtObj(hCert, a[0]);
  var hE = ASN1HEX.getHexOfV_AtObj(hCert, a[1]);
  if (hN != null && hE != null) {
    return [hN, hE];
  } else {
    return [];
  }
}

function _x509_getPublicKeyHexArrayFromCertPEM(sCertPEM) {
  var hCert = _x509_pemToHex(sCertPEM);
  var a = _x509_getPublicKeyHexArrayFromCertHex(hCert);
  return a;
}

// ===== get basic fields from hex =====================================
/**
 * get hexadecimal string of serialNumber field of certificate.<br/>
 * @name getSerialNumberHex
 * @memberOf X509#
 * @function
 */
function _x509_getSerialNumberHex() {
  return ASN1HEX.getDecendantHexVByNthList(this.hex, 0, [0, 1]);
}

/**
 * get hexadecimal string of issuer field of certificate.<br/>
 * @name getIssuerHex
 * @memberOf X509#
 * @function
 */
function _x509_getIssuerHex() {
  return ASN1HEX.getDecendantHexTLVByNthList(this.hex, 0, [0, 3]);
}

/**
 * get string of issuer field of certificate.<br/>
 * @name getIssuerString
 * @memberOf X509#
 * @function
 */
function _x509_getIssuerString() {
  return _x509_hex2dn(ASN1HEX.getDecendantHexTLVByNthList(this.hex, 0, [0, 3]));
}

/**
 * get hexadecimal string of subject field of certificate.<br/>
 * @name getSubjectHex
 * @memberOf X509#
 * @function
 */
function _x509_getSubjectHex() {
  return ASN1HEX.getDecendantHexTLVByNthList(this.hex, 0, [0, 5]);
}

/**
 * get string of subject field of certificate.<br/>
 * @name getSubjectString
 * @memberOf X509#
 * @function
 */
function _x509_getSubjectString() {
  return _x509_hex2dn(ASN1HEX.getDecendantHexTLVByNthList(this.hex, 0, [0, 5]));
}

/**
 * get notBefore field string of certificate.<br/>
 * @name getNotBefore
 * @memberOf X509#
 * @function
 */
function _x509_getNotBefore() {
  var s = ASN1HEX.getDecendantHexVByNthList(this.hex, 0, [0, 4, 0]);
  s = s.replace(/(..)/g, "%$1");
  s = decodeURIComponent(s);
  return s;
}

/**
 * get notAfter field string of certificate.<br/>
 * @name getNotAfter
 * @memberOf X509#
 * @function
 */
function _x509_getNotAfter() {
  var s = ASN1HEX.getDecendantHexVByNthList(this.hex, 0, [0, 4, 1]);
  s = s.replace(/(..)/g, "%$1");
  s = decodeURIComponent(s);
  return s;
}

// ===== read certificate =====================================

_x509_DN_ATTRHEX = {
    "0603550406": "C",
    "060355040a": "O",
    "060355040b": "OU",
    "0603550403": "CN",
    "0603550405": "SN",
    "0603550408": "ST",
    "0603550407": "L" };

function _x509_hex2dn(hDN) {
  var s = "";
  var a = ASN1HEX.getPosArrayOfChildren_AtObj(hDN, 0);
  for (var i = 0; i < a.length; i++) {
    var hRDN = ASN1HEX.getHexOfTLV_AtObj(hDN, a[i]);
    s = s + "/" + _x509_hex2rdn(hRDN);
  }
  return s;
}

function _x509_hex2rdn(hRDN) {
    var hType = ASN1HEX.getDecendantHexTLVByNthList(hRDN, 0, [0, 0]);
    var hValue = ASN1HEX.getDecendantHexVByNthList(hRDN, 0, [0, 1]);
    var type = "";
    try { type = _x509_DN_ATTRHEX[hType]; } catch (ex) { type = hType; }
    hValue = hValue.replace(/(..)/g, "%$1");
    var value = decodeURIComponent(hValue);
    return type + "=" + value;
}

// ===== read certificate =====================================


/**
 * read PEM formatted X.509 certificate from string.<br/>
 * @name readCertPEM
 * @memberOf X509#
 * @function
 * @param {String} sCertPEM string for PEM formatted X.509 certificate
 */
function _x509_readCertPEM(sCertPEM) {
  var hCert = _x509_pemToHex(sCertPEM);
  var a = _x509_getPublicKeyHexArrayFromCertHex(hCert);
  var rsa = new RSAKey();
  rsa.setPublic(a[0], a[1]);
  this.subjectPublicKeyRSA = rsa;
  this.subjectPublicKeyRSA_hN = a[0];
  this.subjectPublicKeyRSA_hE = a[1];
  this.hex = hCert;
}

function _x509_readCertPEMWithoutRSAInit(sCertPEM) {
  var hCert = _x509_pemToHex(sCertPEM);
  var a = _x509_getPublicKeyHexArrayFromCertHex(hCert);
  this.subjectPublicKeyRSA.setPublic(a[0], a[1]);
  this.subjectPublicKeyRSA_hN = a[0];
  this.subjectPublicKeyRSA_hE = a[1];
  this.hex = hCert;
}

/**
 * X.509 certificate class.<br/>
 * @class X.509 certificate class
 * @property {RSAKey} subjectPublicKeyRSA Tom Wu's RSAKey object
 * @property {String} subjectPublicKeyRSA_hN hexadecimal string for modulus of RSA public key
 * @property {String} subjectPublicKeyRSA_hE hexadecimal string for public exponent of RSA public key
 * @property {String} hex hexacedimal string for X.509 certificate.
 * @author Kenji Urushima
 * @version 1.0.1 (08 May 2012)
 * @see <a href="http://kjur.github.com/jsrsasigns/">'jwrsasign'(RSA Sign JavaScript Library) home page http://kjur.github.com/jsrsasign/</a>
 */
function X509() {
  this.subjectPublicKeyRSA = null;
  this.subjectPublicKeyRSA_hN = null;
  this.subjectPublicKeyRSA_hE = null;
  this.hex = null;
}

X509.prototype.readCertPEM = _x509_readCertPEM;
X509.prototype.readCertPEMWithoutRSAInit = _x509_readCertPEMWithoutRSAInit;
X509.prototype.getSerialNumberHex = _x509_getSerialNumberHex;
X509.prototype.getIssuerHex = _x509_getIssuerHex;
X509.prototype.getSubjectHex = _x509_getSubjectHex;
X509.prototype.getIssuerString = _x509_getIssuerString;
X509.prototype.getSubjectString = _x509_getSubjectString;
X509.prototype.getNotBefore = _x509_getNotBefore;
X509.prototype.getNotAfter = _x509_getNotAfter;

exports.X509 = X509;
module.exports = exports;
// Copyright (c) 2005  Tom Wu
// All Rights Reserved.
// 
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// See "jrsasig-THIRDPARTYLICENSE.txt" for details.

// Basic JavaScript BN library - subset useful for RSA encryption.

// Bits per digit
var dbits;

// JavaScript engine analysis
var canary = 0xdeadbeefcafe;
var j_lm = ((canary&0xffffff)==0xefcafe);

// (public) Constructor
var BigInteger = function BigInteger(a,b,c) {
  if(a != null)
    if("number" == typeof a) this.fromNumber(a,b,c);
    else if(b == null && "string" != typeof a) this.fromString(a,256);
    else this.fromString(a,b);
}

// return new, unset BigInteger
function nbi() { return new BigInteger(null); }

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
function am1(i,x,w,j,c,n) {
  while(--n >= 0) {
    var v = x*this[i++]+w[j]+c;
    c = Math.floor(v/0x4000000);
    w[j++] = v&0x3ffffff;
  }
  return c;
}
// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
function am2(i,x,w,j,c,n) {
  var xl = x&0x7fff, xh = x>>15;
  while(--n >= 0) {
    var l = this[i]&0x7fff;
    var h = this[i++]>>15;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
    c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
    w[j++] = l&0x3fffffff;
  }
  return c;
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
function am3(i,x,w,j,c,n) {
  var xl = x&0x3fff, xh = x>>14;
  while(--n >= 0) {
    var l = this[i]&0x3fff;
    var h = this[i++]>>14;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x3fff)<<14)+w[j]+c;
    c = (l>>28)+(m>>14)+xh*h;
    w[j++] = l&0xfffffff;
  }
  return c;
}
if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
  BigInteger.prototype.am = am2;
  dbits = 30;
}
else if(j_lm && (navigator.appName != "Netscape")) {
  BigInteger.prototype.am = am1;
  dbits = 26;
}
else { // Mozilla/Netscape seems to prefer am3
  BigInteger.prototype.am = am3;
  dbits = 28;
}

BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1<<dbits)-1);
BigInteger.prototype.DV = (1<<dbits);

var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2,BI_FP);
BigInteger.prototype.F1 = BI_FP-dbits;
BigInteger.prototype.F2 = 2*dbits-BI_FP;

// Digit conversions
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
var rr,vv;
rr = "0".charCodeAt(0);
for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = "a".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = "A".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

function int2char(n) { return BI_RM.charAt(n); }
function intAt(s,i) {
  var c = BI_RC[s.charCodeAt(i)];
  return (c==null)?-1:c;
}

// (protected) copy this to r
function bnpCopyTo(r) {
  for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
  r.t = this.t;
  r.s = this.s;
}

// (protected) set from integer value x, -DV <= x < DV
function bnpFromInt(x) {
  this.t = 1;
  this.s = (x<0)?-1:0;
  if(x > 0) this[0] = x;
  else if(x < -1) this[0] = x+DV;
  else this.t = 0;
}

// return bigint initialized to value
function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

// (protected) set from string and radix
function bnpFromString(s,b) {
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 256) k = 8; // byte array
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else { this.fromRadix(s,b); return; }
  this.t = 0;
  this.s = 0;
  var i = s.length, mi = false, sh = 0;
  while(--i >= 0) {
    var x = (k==8)?s[i]&0xff:intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-") mi = true;
      continue;
    }
    mi = false;
    if(sh == 0)
      this[this.t++] = x;
    else if(sh+k > this.DB) {
      this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
      this[this.t++] = (x>>(this.DB-sh));
    }
    else
      this[this.t-1] |= x<<sh;
    sh += k;
    if(sh >= this.DB) sh -= this.DB;
  }
  if(k == 8 && (s[0]&0x80) != 0) {
    this.s = -1;
    if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
  }
  this.clamp();
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) clamp off excess high words
function bnpClamp() {
  var c = this.s&this.DM;
  while(this.t > 0 && this[this.t-1] == c) --this.t;
}

// (public) return string representation in given radix
function bnToString(b) {
  if(this.s < 0) return "-"+this.negate().toString(b);
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else return this.toRadix(b);
  var km = (1<<k)-1, d, m = false, r = "", i = this.t;
  var p = this.DB-(i*this.DB)%k;
  if(i-- > 0) {
    if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
    while(i >= 0) {
      if(p < k) {
        d = (this[i]&((1<<p)-1))<<(k-p);
        d |= this[--i]>>(p+=this.DB-k);
      }
      else {
        d = (this[i]>>(p-=k))&km;
        if(p <= 0) { p += this.DB; --i; }
      }
      if(d > 0) m = true;
      if(m) r += int2char(d);
    }
  }
  return m?r:"0";
}

// (public) -this
function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

// (public) |this|
function bnAbs() { return (this.s<0)?this.negate():this; }

// (public) return + if this > a, - if this < a, 0 if equal
function bnCompareTo(a) {
  var r = this.s-a.s;
  if(r != 0) return r;
  var i = this.t;
  r = i-a.t;
  if(r != 0) return (this.s<0)?-r:r;
  while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
  return 0;
}

// returns bit length of the integer x
function nbits(x) {
  var r = 1, t;
  if((t=x>>>16) != 0) { x = t; r += 16; }
  if((t=x>>8) != 0) { x = t; r += 8; }
  if((t=x>>4) != 0) { x = t; r += 4; }
  if((t=x>>2) != 0) { x = t; r += 2; }
  if((t=x>>1) != 0) { x = t; r += 1; }
  return r;
}

// (public) return the number of bits in "this"
function bnBitLength() {
  if(this.t <= 0) return 0;
  return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
}

// (protected) r = this << n*DB
function bnpDLShiftTo(n,r) {
  var i;
  for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
  for(i = n-1; i >= 0; --i) r[i] = 0;
  r.t = this.t+n;
  r.s = this.s;
}

// (protected) r = this >> n*DB
function bnpDRShiftTo(n,r) {
  for(var i = n; i < this.t; ++i) r[i-n] = this[i];
  r.t = Math.max(this.t-n,0);
  r.s = this.s;
}

// (protected) r = this << n
function bnpLShiftTo(n,r) {
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<cbs)-1;
  var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
  for(i = this.t-1; i >= 0; --i) {
    r[i+ds+1] = (this[i]>>cbs)|c;
    c = (this[i]&bm)<<bs;
  }
  for(i = ds-1; i >= 0; --i) r[i] = 0;
  r[ds] = c;
  r.t = this.t+ds+1;
  r.s = this.s;
  r.clamp();
}

// (protected) r = this >> n
function bnpRShiftTo(n,r) {
  r.s = this.s;
  var ds = Math.floor(n/this.DB);
  if(ds >= this.t) { r.t = 0; return; }
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<bs)-1;
  r[0] = this[ds]>>bs;
  for(var i = ds+1; i < this.t; ++i) {
    r[i-ds-1] |= (this[i]&bm)<<cbs;
    r[i-ds] = this[i]>>bs;
  }
  if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
  r.t = this.t-ds;
  r.clamp();
}

// (protected) r = this - a
function bnpSubTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this[i]-a[i];
    r[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c -= a.s;
    while(i < this.t) {
      c += this[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c -= a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c -= a.s;
  }
  r.s = (c<0)?-1:0;
  if(c < -1) r[i++] = this.DV+c;
  else if(c > 0) r[i++] = c;
  r.t = i;
  r.clamp();
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
function bnpMultiplyTo(a,r) {
  var x = this.abs(), y = a.abs();
  var i = x.t;
  r.t = i+y.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
  r.s = 0;
  r.clamp();
  if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
}

// (protected) r = this^2, r != this (HAC 14.16)
function bnpSquareTo(r) {
  var x = this.abs();
  var i = r.t = 2*x.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < x.t-1; ++i) {
    var c = x.am(i,x[i],r,2*i,0,1);
    if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
      r[i+x.t] -= x.DV;
      r[i+x.t+1] = 1;
    }
  }
  if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
  r.s = 0;
  r.clamp();
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
function bnpDivRemTo(m,q,r) {
  var pm = m.abs();
  if(pm.t <= 0) return;
  var pt = this.abs();
  if(pt.t < pm.t) {
    if(q != null) q.fromInt(0);
    if(r != null) this.copyTo(r);
    return;
  }
  if(r == null) r = nbi();
  var y = nbi(), ts = this.s, ms = m.s;
  var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
  if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
  else { pm.copyTo(y); pt.copyTo(r); }
  var ys = y.t;
  var y0 = y[ys-1];
  if(y0 == 0) return;
  var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
  var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
  var i = r.t, j = i-ys, t = (q==null)?nbi():q;
  y.dlShiftTo(j,t);
  if(r.compareTo(t) >= 0) {
    r[r.t++] = 1;
    r.subTo(t,r);
  }
  BigInteger.ONE.dlShiftTo(ys,t);
  t.subTo(y,y);	// "negative" y so we can replace sub with am later
  while(y.t < ys) y[y.t++] = 0;
  while(--j >= 0) {
    // Estimate quotient digit
    var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
    if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
      y.dlShiftTo(j,t);
      r.subTo(t,r);
      while(r[i] < --qd) r.subTo(t,r);
    }
  }
  if(q != null) {
    r.drShiftTo(ys,q);
    if(ts != ms) BigInteger.ZERO.subTo(q,q);
  }
  r.t = ys;
  r.clamp();
  if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
  if(ts < 0) BigInteger.ZERO.subTo(r,r);
}

// (public) this mod a
function bnMod(a) {
  var r = nbi();
  this.abs().divRemTo(a,null,r);
  if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
  return r;
}

// Modular reduction using "classic" algorithm
function Classic(m) { this.m = m; }
function cConvert(x) {
  if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
  else return x;
}
function cRevert(x) { return x; }
function cReduce(x) { x.divRemTo(this.m,null,x); }
function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
function bnpInvDigit() {
  if(this.t < 1) return 0;
  var x = this[0];
  if((x&1) == 0) return 0;
  var y = x&3;		// y == 1/x mod 2^2
  y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
  y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
  y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly;
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
  // we really want the negative inverse, and -DV < y < DV
  return (y>0)?this.DV-y:-y;
}

// Montgomery reduction
function Montgomery(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp&0x7fff;
  this.mph = this.mp>>15;
  this.um = (1<<(m.DB-15))-1;
  this.mt2 = 2*m.t;
}

// xR mod m
function montConvert(x) {
  var r = nbi();
  x.abs().dlShiftTo(this.m.t,r);
  r.divRemTo(this.m,null,r);
  if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
  return r;
}

// x/R mod m
function montRevert(x) {
  var r = nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
}

// x = x/R mod m (HAC 14.32)
function montReduce(x) {
  while(x.t <= this.mt2)	// pad x so am has enough room later
    x[x.t++] = 0;
  for(var i = 0; i < this.m.t; ++i) {
    // faster way of calculating u0 = x[i]*mp mod DV
    var j = x[i]&0x7fff;
    var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
    // use am to combine the multiply-shift-add into one call
    j = i+this.m.t;
    x[j] += this.m.am(0,u0,x,i,0,this.m.t);
    // propagate carry
    while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
  }
  x.clamp();
  x.drShiftTo(this.m.t,x);
  if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = "x^2/R mod m"; x != r
function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = "xy/R mod m"; x,y != r
function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;

// (protected) true iff this is even
function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
function bnpExp(e,z) {
  if(e > 0xffffffff || e < 1) return BigInteger.ONE;
  var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
  g.copyTo(r);
  while(--i >= 0) {
    z.sqrTo(r,r2);
    if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
    else { var t = r; r = r2; r2 = t; }
  }
  return z.revert(r);
}

// (public) this^e % m, 0 <= e < 2^32
function bnModPowInt(e,m) {
  var z;
  if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
  return this.exp(e,z);
}

// protected
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;

// public
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;

// "constants"
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);
// Copyright (c) 2005-2009  Tom Wu
// All Rights Reserved.
// 
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// See "jrsasig-THIRDPARTYLICENSE.txt" for details.

// Extended JavaScript BN functions, required for RSA private ops.

// Version 1.1: new BigInteger("0", 10) returns "proper" zero
// Version 1.2: square() API, isProbablePrime fix

// (public)
function bnClone() { var r = nbi(); this.copyTo(r); return r; }

// (public) return value as integer
function bnIntValue() {
  if(this.s < 0) {
    if(this.t == 1) return this[0]-this.DV;
    else if(this.t == 0) return -1;
  }
  else if(this.t == 1) return this[0];
  else if(this.t == 0) return 0;
  // assumes 16 < DB < 32
  return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
}

// (public) return value as byte
function bnByteValue() { return (this.t==0)?this.s:(this[0]<<24)>>24; }

// (public) return value as short (assumes DB>=16)
function bnShortValue() { return (this.t==0)?this.s:(this[0]<<16)>>16; }

// (protected) return x s.t. r^x < DV
function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

// (public) 0 if this == 0, 1 if this > 0
function bnSigNum() {
  if(this.s < 0) return -1;
  else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
  else return 1;
}

// (protected) convert to radix string
function bnpToRadix(b) {
  if(b == null) b = 10;
  if(this.signum() == 0 || b < 2 || b > 36) return "0";
  var cs = this.chunkSize(b);
  var a = Math.pow(b,cs);
  var d = nbv(a), y = nbi(), z = nbi(), r = "";
  this.divRemTo(d,y,z);
  while(y.signum() > 0) {
    r = (a+z.intValue()).toString(b).substr(1) + r;
    y.divRemTo(d,y,z);
  }
  return z.intValue().toString(b) + r;
}

// (protected) convert from radix string
function bnpFromRadix(s,b) {
  this.fromInt(0);
  if(b == null) b = 10;
  var cs = this.chunkSize(b);
  var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
  for(var i = 0; i < s.length; ++i) {
    var x = intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
      continue;
    }
    w = b*w+x;
    if(++j >= cs) {
      this.dMultiply(d);
      this.dAddOffset(w,0);
      j = 0;
      w = 0;
    }
  }
  if(j > 0) {
    this.dMultiply(Math.pow(b,j));
    this.dAddOffset(w,0);
  }
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) alternate constructor
function bnpFromNumber(a,b,c) {
  if("number" == typeof b) {
    // new BigInteger(int,int,RNG)
    if(a < 2) this.fromInt(1);
    else {
      this.fromNumber(a,c);
      if(!this.testBit(a-1))	// force MSB set
        this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);
      if(this.isEven()) this.dAddOffset(1,0); // force odd
      while(!this.isProbablePrime(b)) {
        this.dAddOffset(2,0);
        if(this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a-1),this);
      }
    }
  }
  else {
    // new BigInteger(int,RNG)
    var x = new Array(), t = a&7;
    x.length = (a>>3)+1;
    b.nextBytes(x);
    if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
    this.fromString(x,256);
  }
}

// (public) convert to bigendian byte array
function bnToByteArray() {
  var i = this.t, r = new Array();
  r[0] = this.s;
  var p = this.DB-(i*this.DB)%8, d, k = 0;
  if(i-- > 0) {
    if(p < this.DB && (d = this[i]>>p) != (this.s&this.DM)>>p)
      r[k++] = d|(this.s<<(this.DB-p));
    while(i >= 0) {
      if(p < 8) {
        d = (this[i]&((1<<p)-1))<<(8-p);
        d |= this[--i]>>(p+=this.DB-8);
      }
      else {
        d = (this[i]>>(p-=8))&0xff;
        if(p <= 0) { p += this.DB; --i; }
      }
      if((d&0x80) != 0) d |= -256;
      if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
      if(k > 0 || d != this.s) r[k++] = d;
    }
  }
  return r;
}

function bnEquals(a) { return(this.compareTo(a)==0); }
function bnMin(a) { return(this.compareTo(a)<0)?this:a; }
function bnMax(a) { return(this.compareTo(a)>0)?this:a; }

// (protected) r = this op a (bitwise)
function bnpBitwiseTo(a,op,r) {
  var i, f, m = Math.min(a.t,this.t);
  for(i = 0; i < m; ++i) r[i] = op(this[i],a[i]);
  if(a.t < this.t) {
    f = a.s&this.DM;
    for(i = m; i < this.t; ++i) r[i] = op(this[i],f);
    r.t = this.t;
  }
  else {
    f = this.s&this.DM;
    for(i = m; i < a.t; ++i) r[i] = op(f,a[i]);
    r.t = a.t;
  }
  r.s = op(this.s,a.s);
  r.clamp();
}

// (public) this & a
function op_and(x,y) { return x&y; }
function bnAnd(a) { var r = nbi(); this.bitwiseTo(a,op_and,r); return r; }

// (public) this | a
function op_or(x,y) { return x|y; }
function bnOr(a) { var r = nbi(); this.bitwiseTo(a,op_or,r); return r; }

// (public) this ^ a
function op_xor(x,y) { return x^y; }
function bnXor(a) { var r = nbi(); this.bitwiseTo(a,op_xor,r); return r; }

// (public) this & ~a
function op_andnot(x,y) { return x&~y; }
function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a,op_andnot,r); return r; }

// (public) ~this
function bnNot() {
  var r = nbi();
  for(var i = 0; i < this.t; ++i) r[i] = this.DM&~this[i];
  r.t = this.t;
  r.s = ~this.s;
  return r;
}

// (public) this << n
function bnShiftLeft(n) {
  var r = nbi();
  if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
  return r;
}

// (public) this >> n
function bnShiftRight(n) {
  var r = nbi();
  if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
  return r;
}

// return index of lowest 1-bit in x, x < 2^31
function lbit(x) {
  if(x == 0) return -1;
  var r = 0;
  if((x&0xffff) == 0) { x >>= 16; r += 16; }
  if((x&0xff) == 0) { x >>= 8; r += 8; }
  if((x&0xf) == 0) { x >>= 4; r += 4; }
  if((x&3) == 0) { x >>= 2; r += 2; }
  if((x&1) == 0) ++r;
  return r;
}

// (public) returns index of lowest 1-bit (or -1 if none)
function bnGetLowestSetBit() {
  for(var i = 0; i < this.t; ++i)
    if(this[i] != 0) return i*this.DB+lbit(this[i]);
  if(this.s < 0) return this.t*this.DB;
  return -1;
}

// return number of 1 bits in x
function cbit(x) {
  var r = 0;
  while(x != 0) { x &= x-1; ++r; }
  return r;
}

// (public) return number of set bits
function bnBitCount() {
  var r = 0, x = this.s&this.DM;
  for(var i = 0; i < this.t; ++i) r += cbit(this[i]^x);
  return r;
}

// (public) true iff nth bit is set
function bnTestBit(n) {
  var j = Math.floor(n/this.DB);
  if(j >= this.t) return(this.s!=0);
  return((this[j]&(1<<(n%this.DB)))!=0);
}

// (protected) this op (1<<n)
function bnpChangeBit(n,op) {
  var r = BigInteger.ONE.shiftLeft(n);
  this.bitwiseTo(r,op,r);
  return r;
}

// (public) this | (1<<n)
function bnSetBit(n) { return this.changeBit(n,op_or); }

// (public) this & ~(1<<n)
function bnClearBit(n) { return this.changeBit(n,op_andnot); }

// (public) this ^ (1<<n)
function bnFlipBit(n) { return this.changeBit(n,op_xor); }

// (protected) r = this + a
function bnpAddTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this[i]+a[i];
    r[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c += a.s;
    while(i < this.t) {
      c += this[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c += a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += a.s;
  }
  r.s = (c<0)?-1:0;
  if(c > 0) r[i++] = c;
  else if(c < -1) r[i++] = this.DV+c;
  r.t = i;
  r.clamp();
}

// (public) this + a
function bnAdd(a) { var r = nbi(); this.addTo(a,r); return r; }

// (public) this - a
function bnSubtract(a) { var r = nbi(); this.subTo(a,r); return r; }

// (public) this * a
function bnMultiply(a) { var r = nbi(); this.multiplyTo(a,r); return r; }

// (public) this^2
function bnSquare() { var r = nbi(); this.squareTo(r); return r; }

// (public) this / a
function bnDivide(a) { var r = nbi(); this.divRemTo(a,r,null); return r; }

// (public) this % a
function bnRemainder(a) { var r = nbi(); this.divRemTo(a,null,r); return r; }

// (public) [this/a,this%a]
function bnDivideAndRemainder(a) {
  var q = nbi(), r = nbi();
  this.divRemTo(a,q,r);
  return new Array(q,r);
}

// (protected) this *= n, this >= 0, 1 < n < DV
function bnpDMultiply(n) {
  this[this.t] = this.am(0,n-1,this,0,0,this.t);
  ++this.t;
  this.clamp();
}

// (protected) this += n << w words, this >= 0
function bnpDAddOffset(n,w) {
  if(n == 0) return;
  while(this.t <= w) this[this.t++] = 0;
  this[w] += n;
  while(this[w] >= this.DV) {
    this[w] -= this.DV;
    if(++w >= this.t) this[this.t++] = 0;
    ++this[w];
  }
}

// A "null" reducer
function NullExp() {}
function nNop(x) { return x; }
function nMulTo(x,y,r) { x.multiplyTo(y,r); }
function nSqrTo(x,r) { x.squareTo(r); }

NullExp.prototype.convert = nNop;
NullExp.prototype.revert = nNop;
NullExp.prototype.mulTo = nMulTo;
NullExp.prototype.sqrTo = nSqrTo;

// (public) this^e
function bnPow(e) { return this.exp(e,new NullExp()); }

// (protected) r = lower n words of "this * a", a.t <= n
// "this" should be the larger one if appropriate.
function bnpMultiplyLowerTo(a,n,r) {
  var i = Math.min(this.t+a.t,n);
  r.s = 0; // assumes a,this >= 0
  r.t = i;
  while(i > 0) r[--i] = 0;
  var j;
  for(j = r.t-this.t; i < j; ++i) r[i+this.t] = this.am(0,a[i],r,i,0,this.t);
  for(j = Math.min(a.t,n); i < j; ++i) this.am(0,a[i],r,i,0,n-i);
  r.clamp();
}

// (protected) r = "this * a" without lower n words, n > 0
// "this" should be the larger one if appropriate.
function bnpMultiplyUpperTo(a,n,r) {
  --n;
  var i = r.t = this.t+a.t-n;
  r.s = 0; // assumes a,this >= 0
  while(--i >= 0) r[i] = 0;
  for(i = Math.max(n-this.t,0); i < a.t; ++i)
    r[this.t+i-n] = this.am(n-i,a[i],r,0,0,this.t+i-n);
  r.clamp();
  r.drShiftTo(1,r);
}

// Barrett modular reduction
function Barrett(m) {
  // setup Barrett
  this.r2 = nbi();
  this.q3 = nbi();
  BigInteger.ONE.dlShiftTo(2*m.t,this.r2);
  this.mu = this.r2.divide(m);
  this.m = m;
}

function barrettConvert(x) {
  if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
  else if(x.compareTo(this.m) < 0) return x;
  else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
}

function barrettRevert(x) { return x; }

// x = x mod m (HAC 14.42)
function barrettReduce(x) {
  x.drShiftTo(this.m.t-1,this.r2);
  if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
  this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
  this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
  while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
  x.subTo(this.r2,x);
  while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = x^2 mod m; x != r
function barrettSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = x*y mod m; x,y != r
function barrettMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Barrett.prototype.convert = barrettConvert;
Barrett.prototype.revert = barrettRevert;
Barrett.prototype.reduce = barrettReduce;
Barrett.prototype.mulTo = barrettMulTo;
Barrett.prototype.sqrTo = barrettSqrTo;

// (public) this^e % m (HAC 14.85)
function bnModPow(e,m) {
  var i = e.bitLength(), k, r = nbv(1), z;
  if(i <= 0) return r;
  else if(i < 18) k = 1;
  else if(i < 48) k = 3;
  else if(i < 144) k = 4;
  else if(i < 768) k = 5;
  else k = 6;
  if(i < 8)
    z = new Classic(m);
  else if(m.isEven())
    z = new Barrett(m);
  else
    z = new Montgomery(m);

  // precomputation
  var g = new Array(), n = 3, k1 = k-1, km = (1<<k)-1;
  g[1] = z.convert(this);
  if(k > 1) {
    var g2 = nbi();
    z.sqrTo(g[1],g2);
    while(n <= km) {
      g[n] = nbi();
      z.mulTo(g2,g[n-2],g[n]);
      n += 2;
    }
  }

  var j = e.t-1, w, is1 = true, r2 = nbi(), t;
  i = nbits(e[j])-1;
  while(j >= 0) {
    if(i >= k1) w = (e[j]>>(i-k1))&km;
    else {
      w = (e[j]&((1<<(i+1))-1))<<(k1-i);
      if(j > 0) w |= e[j-1]>>(this.DB+i-k1);
    }

    n = k;
    while((w&1) == 0) { w >>= 1; --n; }
    if((i -= n) < 0) { i += this.DB; --j; }
    if(is1) {	// ret == 1, don't bother squaring or multiplying it
      g[w].copyTo(r);
      is1 = false;
    }
    else {
      while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
      if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
      z.mulTo(r2,g[w],r);
    }

    while(j >= 0 && (e[j]&(1<<i)) == 0) {
      z.sqrTo(r,r2); t = r; r = r2; r2 = t;
      if(--i < 0) { i = this.DB-1; --j; }
    }
  }
  return z.revert(r);
}

// (public) gcd(this,a) (HAC 14.54)
function bnGCD(a) {
  var x = (this.s<0)?this.negate():this.clone();
  var y = (a.s<0)?a.negate():a.clone();
  if(x.compareTo(y) < 0) { var t = x; x = y; y = t; }
  var i = x.getLowestSetBit(), g = y.getLowestSetBit();
  if(g < 0) return x;
  if(i < g) g = i;
  if(g > 0) {
    x.rShiftTo(g,x);
    y.rShiftTo(g,y);
  }
  while(x.signum() > 0) {
    if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
    if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
    if(x.compareTo(y) >= 0) {
      x.subTo(y,x);
      x.rShiftTo(1,x);
    }
    else {
      y.subTo(x,y);
      y.rShiftTo(1,y);
    }
  }
  if(g > 0) y.lShiftTo(g,y);
  return y;
}

// (protected) this % n, n < 2^26
function bnpModInt(n) {
  if(n <= 0) return 0;
  var d = this.DV%n, r = (this.s<0)?n-1:0;
  if(this.t > 0)
    if(d == 0) r = this[0]%n;
    else for(var i = this.t-1; i >= 0; --i) r = (d*r+this[i])%n;
  return r;
}

// (public) 1/this % m (HAC 14.61)
function bnModInverse(m) {
  var ac = m.isEven();
  if((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
  var u = m.clone(), v = this.clone();
  var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
  while(u.signum() != 0) {
    while(u.isEven()) {
      u.rShiftTo(1,u);
      if(ac) {
        if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
        a.rShiftTo(1,a);
      }
      else if(!b.isEven()) b.subTo(m,b);
      b.rShiftTo(1,b);
    }
    while(v.isEven()) {
      v.rShiftTo(1,v);
      if(ac) {
        if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
        c.rShiftTo(1,c);
      }
      else if(!d.isEven()) d.subTo(m,d);
      d.rShiftTo(1,d);
    }
    if(u.compareTo(v) >= 0) {
      u.subTo(v,u);
      if(ac) a.subTo(c,a);
      b.subTo(d,b);
    }
    else {
      v.subTo(u,v);
      if(ac) c.subTo(a,c);
      d.subTo(b,d);
    }
  }
  if(v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
  if(d.compareTo(m) >= 0) return d.subtract(m);
  if(d.signum() < 0) d.addTo(m,d); else return d;
  if(d.signum() < 0) return d.add(m); else return d;
}

var lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];
var lplim = (1<<26)/lowprimes[lowprimes.length-1];

// (public) test primality with certainty >= 1-.5^t
function bnIsProbablePrime(t) {
  var i, x = this.abs();
  if(x.t == 1 && x[0] <= lowprimes[lowprimes.length-1]) {
    for(i = 0; i < lowprimes.length; ++i)
      if(x[0] == lowprimes[i]) return true;
    return false;
  }
  if(x.isEven()) return false;
  i = 1;
  while(i < lowprimes.length) {
    var m = lowprimes[i], j = i+1;
    while(j < lowprimes.length && m < lplim) m *= lowprimes[j++];
    m = x.modInt(m);
    while(i < j) if(m%lowprimes[i++] == 0) return false;
  }
  return x.millerRabin(t);
}

// (protected) true if probably prime (HAC 4.24, Miller-Rabin)
function bnpMillerRabin(t) {
  var n1 = this.subtract(BigInteger.ONE);
  var k = n1.getLowestSetBit();
  if(k <= 0) return false;
  var r = n1.shiftRight(k);
  t = (t+1)>>1;
  if(t > lowprimes.length) t = lowprimes.length;
  var a = nbi();
  for(var i = 0; i < t; ++i) {
    //Pick bases at random, instead of starting at 2
    a.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);
    var y = a.modPow(r,this);
    if(y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
      var j = 1;
      while(j++ < k && y.compareTo(n1) != 0) {
        y = y.modPowInt(2,this);
        if(y.compareTo(BigInteger.ONE) == 0) return false;
      }
      if(y.compareTo(n1) != 0) return false;
    }
  }
  return true;
}

// protected
BigInteger.prototype.chunkSize = bnpChunkSize;
BigInteger.prototype.toRadix = bnpToRadix;
BigInteger.prototype.fromRadix = bnpFromRadix;
BigInteger.prototype.fromNumber = bnpFromNumber;
BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
BigInteger.prototype.changeBit = bnpChangeBit;
BigInteger.prototype.addTo = bnpAddTo;
BigInteger.prototype.dMultiply = bnpDMultiply;
BigInteger.prototype.dAddOffset = bnpDAddOffset;
BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
BigInteger.prototype.modInt = bnpModInt;
BigInteger.prototype.millerRabin = bnpMillerRabin;

// public
BigInteger.prototype.clone = bnClone;
BigInteger.prototype.intValue = bnIntValue;
BigInteger.prototype.byteValue = bnByteValue;
BigInteger.prototype.shortValue = bnShortValue;
BigInteger.prototype.signum = bnSigNum;
BigInteger.prototype.toByteArray = bnToByteArray;
BigInteger.prototype.equals = bnEquals;
BigInteger.prototype.min = bnMin;
BigInteger.prototype.max = bnMax;
BigInteger.prototype.and = bnAnd;
BigInteger.prototype.or = bnOr;
BigInteger.prototype.xor = bnXor;
BigInteger.prototype.andNot = bnAndNot;
BigInteger.prototype.not = bnNot;
BigInteger.prototype.shiftLeft = bnShiftLeft;
BigInteger.prototype.shiftRight = bnShiftRight;
BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
BigInteger.prototype.bitCount = bnBitCount;
BigInteger.prototype.testBit = bnTestBit;
BigInteger.prototype.setBit = bnSetBit;
BigInteger.prototype.clearBit = bnClearBit;
BigInteger.prototype.flipBit = bnFlipBit;
BigInteger.prototype.add = bnAdd;
BigInteger.prototype.subtract = bnSubtract;
BigInteger.prototype.multiply = bnMultiply;
BigInteger.prototype.divide = bnDivide;
BigInteger.prototype.remainder = bnRemainder;
BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
BigInteger.prototype.modPow = bnModPow;
BigInteger.prototype.modInverse = bnModInverse;
BigInteger.prototype.pow = bnPow;
BigInteger.prototype.gcd = bnGCD;
BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

// JSBN-specific extension
BigInteger.prototype.square = bnSquare;

// BigInteger interfaces not implemented in jsbn:

// BigInteger(int signum, byte[] magnitude)
// double doubleValue()
// float floatValue()
// int hashCode()
// long longValue()
// static BigInteger valueOf(long val)

exports.BigInteger = BigInteger;
module.exports = exports;
/**
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Wentao Shang
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var ASN1HEX = require('../contrib/securityLib/asn1hex-1.1.js').ASN1HEX
var KJUR = require('../contrib/securityLib/crypto-1.0.js').KJUR
var RSAKey = require('../contrib/securityLib/rsasign-1.2.js').RSAKey
var b64tohex = require('../contrib/securityLib/base64.js').b64tohex

// Library namespace
var ndn = ndn || {};

var exports = ndn;


// Factory method to create hasher objects
exports.createHash = function(alg)
{
  if (alg != 'sha256')
    throw new Error('createHash: unsupported algorithm.');

  var obj = {};

  obj.md = new KJUR.crypto.MessageDigest({alg: "sha256", prov: "cryptojs"});

  obj.update = function(buf) {
    this.md.updateHex(buf.toString('hex'));
  };

  obj.digest = function(encoding) {
    var hexDigest = this.md.digest();
    if (encoding == 'hex')
      return hexDigest;
    else if (encoding == 'base64')
      return new Buffer(hexDigest, 'hex').toString('base64');
    else
      return new Buffer(hexDigest, 'hex');
  };

  return obj;
};

// Factory method to create RSA signer objects
exports.createSign = function(alg)
{
  if (alg != 'RSA-SHA256')
    throw new Error('createSign: unsupported algorithm.');

  var obj = {};

  obj.arr = [];

  obj.update = function(buf) {
    this.arr.push(buf);
  };

  obj.sign = function(keypem) {
    var rsa = new RSAKey();
    rsa.readPrivateKeyFromPEMString(keypem);
    var signer = new KJUR.crypto.Signature({alg: "SHA256withRSA", prov: "cryptojs/jsrsa"});
    signer.initSign(rsa);
    for (var i = 0; i < this.arr.length; ++i)
      signer.updateHex(this.arr[i].toString('hex'));

    return new Buffer(signer.sign(), 'hex');
  };

  return obj;
};

// Factory method to create RSA verifier objects
exports.createVerify = function(alg)
{
  if (alg != 'RSA-SHA256')
    throw new Error('createSign: unsupported algorithm.');

  var obj = {};

  obj.arr = [];

  obj.update = function(buf) {
    this.arr.push(buf);
  };

  var getSubjectPublicKeyPosFromHex = function(hPub) {
    var a = ASN1HEX.getPosArrayOfChildren_AtObj(hPub, 0);
    if (a.length != 2)
      return -1;
    var pBitString = a[1];
    if (hPub.substring(pBitString, pBitString + 2) != '03')
      return -1;
    var pBitStringV = ASN1HEX.getStartPosOfV_AtObj(hPub, pBitString);
    if (hPub.substring(pBitStringV, pBitStringV + 2) != '00')
      return -1;
    return pBitStringV + 2;
  };

  var publicKeyPemToDer = function(publicKeyPem) {
    // Remove the '-----XXX-----' from the beginning and the end of the public
    // key and also remove any \n in the public key string.
    var lines = publicKeyPem.split('\n');
    var pub = "";
    for (var i = 1; i < lines.length - 1; i++)
      pub += lines[i];
    return new Buffer(pub, 'base64');
  }

  var readPublicDER = function(pub_der) {
    var hex = pub_der.toString('hex');
    var p = getSubjectPublicKeyPosFromHex(hex);
    var a = ASN1HEX.getPosArrayOfChildren_AtObj(hex, p);
    if (a.length != 2)
      return null;
    var hN = ASN1HEX.getHexOfV_AtObj(hex, a[0]);
    var hE = ASN1HEX.getHexOfV_AtObj(hex, a[1]);
    var rsaKey = new RSAKey();
    rsaKey.setPublic(hN, hE);
    return rsaKey;
  };

  obj.verify = function(keypem, sig) {
    var rsa = readPublicDER(publicKeyPemToDer(keypem));
    var signer = new KJUR.crypto.Signature({alg: "SHA256withRSA", prov: "cryptojs/jsrsa"});
    signer.initVerifyByPublicKey(rsa);
    for (var i = 0; i < this.arr.length; i++)
      signer.updateHex(this.arr[i].toString('hex'));
    var hSig = sig.toString('hex');
    return signer.verify(hSig);
  };

  return obj;
};

exports.randomBytes = function(size)
{
  // TODO: Use a cryptographic random number generator.
  var result = new Buffer(size);
  for (var i = 0; i < size; ++i)
    result[i] = Math.floor(Math.random() * 256);
  return result;
};

// contrib/feross/buffer.js needs base64.toByteArray. Define it here so that
// we don't have to include the entire base64 module.
exports.toByteArray = function(str) {
  var hex = b64tohex(str);
  var result = [];
  hex.replace(/(..)/g, function(ss) {
    result.push(parseInt(ss, 16));
  });
  return result;
};

module.exports = exports
// After this we include contrib/feross/buffer.js to define the Buffer class.
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var base64js = {};

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
})(base64js);
var ieee = {};

ieee.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

ieee.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

exports.ieee = ieee;
/**
 * The buffer module from node.js, for the browser.
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 *
 * Copyright (C) 2013 Feross Aboukhadijeh, and other contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * @license  MIT
 */

var base64 = base64js;
var ieee754 = require('./ieee754.js').ieee

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = Buffer.stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = Buffer.coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = Buffer.coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (Buffer.isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str.toString()
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = Buffer.utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = Buffer.base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  Buffer.assert(Buffer.isArray(list), 'Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.compare = function (a, b) {
  Buffer.assert(Buffer.isBuffer(a) && Buffer.isBuffer(b), 'Arguments must be Buffers')
  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) {
    return -1
  }
  if (y < x) {
    return 1
  }
  return 0
}

// BUFFER INSTANCE METHODS
// =======================

Buffer.hexWrite = function(buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  Buffer.assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var b = parseInt(string.substr(i * 2, 2), 16)
    Buffer.assert(!isNaN(b), 'Invalid hex string')
    buf[offset + i] = b
  }
  return i
}

Buffer.utf8Write = function(buf, string, offset, length) {
  var charsWritten = Buffer.blitBuffer(Buffer.utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.asciiWrite = function(buf, string, offset, length) {
  var charsWritten = Buffer.blitBuffer(Buffer.asciiToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.binaryWrite = function(buf, string, offset, length) {
  return Buffer.asciiWrite(buf, string, offset, length)
}

Buffer.base64Write = function(buf, string, offset, length) {
  var charsWritten = Buffer.blitBuffer(Buffer.base64ToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.utf16leWrite = function(buf, string, offset, length) {
  var charsWritten = Buffer.blitBuffer(Buffer.utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = Buffer.hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = Buffer.utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = Buffer.asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = Buffer.binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = Buffer.base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = Buffer.utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end === undefined) ? self.length : Number(end)

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = Buffer.hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = Buffer.utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = Buffer.asciiSlice(self, start, end)
      break
    case 'binary':
      ret = Buffer.binarySlice(self, start, end)
      break
    case 'base64':
      ret = Buffer.base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

Buffer.prototype.equals = function (b) {
  Buffer.assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.compare = function (b) {
  Buffer.assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  Buffer.assert(end >= start, 'sourceEnd < sourceStart')
  Buffer.assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  Buffer.assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  Buffer.assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

Buffer.base64Slice = function(buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

Buffer.utf8Slice = function(buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += Buffer.decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + Buffer.decodeUtf8Char(tmp)
}

Buffer.asciiSlice = function(buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

Buffer.binarySlice = function(buf, start, end) {
  return Buffer.asciiSlice(buf, start, end)
}

Buffer.hexSlice = function(buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += Buffer.toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = Buffer.clamp(start, len, 0)
  end = Buffer.clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    Buffer.assert(offset !== undefined && offset !== null, 'missing offset')
    Buffer.assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

Buffer.readUInt16 = function(buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    Buffer.assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    Buffer.assert(offset !== undefined && offset !== null, 'missing offset')
    Buffer.assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return Buffer.readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return Buffer.readUInt16(this, offset, false, noAssert)
}

Buffer.readUInt32 = function(buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    Buffer.assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    Buffer.assert(offset !== undefined && offset !== null, 'missing offset')
    Buffer.assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return Buffer.readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return Buffer.readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    Buffer.assert(offset !== undefined && offset !== null,
        'missing offset')
    Buffer.assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

Buffer.readInt16 = function(buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    Buffer.assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    Buffer.assert(offset !== undefined && offset !== null, 'missing offset')
    Buffer.assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = Buffer.readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return Buffer.readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return Buffer.readInt16(this, offset, false, noAssert)
}

Buffer.readInt32 = function(buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    Buffer.assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    Buffer.assert(offset !== undefined && offset !== null, 'missing offset')
    Buffer.assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = Buffer.readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return Buffer.readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return Buffer.readInt32(this, offset, false, noAssert)
}

Buffer.readFloat = function(buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    Buffer.assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    Buffer.assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return Buffer.readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return Buffer.readFloat(this, offset, false, noAssert)
}

Buffer.readDouble = function(buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    Buffer.assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    Buffer.assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return Buffer.readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return Buffer.readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    Buffer.assert(value !== undefined && value !== null, 'missing value')
    Buffer.assert(offset !== undefined && offset !== null, 'missing offset')
    Buffer.assert(offset < this.length, 'trying to write beyond buffer length')
    Buffer.verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
  return offset + 1
}

Buffer.writeUInt16 = function(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    Buffer.assert(value !== undefined && value !== null, 'missing value')
    Buffer.assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    Buffer.assert(offset !== undefined && offset !== null, 'missing offset')
    Buffer.assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    Buffer.verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
  return offset + 2
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  return Buffer.writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  return Buffer.writeUInt16(this, value, offset, false, noAssert)
}

Buffer.writeUInt32 = function(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    Buffer.assert(value !== undefined && value !== null, 'missing value')
    Buffer.assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    Buffer.assert(offset !== undefined && offset !== null, 'missing offset')
    Buffer.assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    Buffer.verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
  return offset + 4
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  return Buffer.writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  return Buffer.writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    Buffer.assert(value !== undefined && value !== null, 'missing value')
    Buffer.assert(offset !== undefined && offset !== null, 'missing offset')
    Buffer.assert(offset < this.length, 'Trying to write beyond buffer length')
    Buffer.verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
  return offset + 1
}

Buffer.writeInt16 = function(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    Buffer.assert(value !== undefined && value !== null, 'missing value')
    Buffer.assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    Buffer.assert(offset !== undefined && offset !== null, 'missing offset')
    Buffer.assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    Buffer.verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    Buffer.writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    Buffer.writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
  return offset + 2
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  return Buffer.writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  return Buffer.writeInt16(this, value, offset, false, noAssert)
}

Buffer.writeInt32 = function(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    Buffer.assert(value !== undefined && value !== null, 'missing value')
    Buffer.assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    Buffer.assert(offset !== undefined && offset !== null, 'missing offset')
    Buffer.assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    Buffer.verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    Buffer.writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    Buffer.writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
  return offset + 4
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  return Buffer.writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  return Buffer.writeInt32(this, value, offset, false, noAssert)
}

Buffer.writeFloat = function(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    Buffer.assert(value !== undefined && value !== null, 'missing value')
    Buffer.assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    Buffer.assert(offset !== undefined && offset !== null, 'missing offset')
    Buffer.assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    Buffer.verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return Buffer.writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return Buffer.writeFloat(this, value, offset, false, noAssert)
}

Buffer.writeDouble = function(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    Buffer.assert(value !== undefined && value !== null, 'missing value')
    Buffer.assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    Buffer.assert(offset !== undefined && offset !== null, 'missing offset')
    Buffer.assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    Buffer.verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return Buffer.writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return Buffer.writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  Buffer.assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  Buffer.assert(start >= 0 && start < this.length, 'start out of bounds')
  Buffer.assert(end >= 0 && end <= this.length, 'end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = Buffer.utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = Buffer.toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

Buffer.stringtrim = function(str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

// slice(start, end)
Buffer.clamp = function(index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

Buffer.coerce = function(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

Buffer.isArray = function(subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

Buffer.isArrayish = function(subject) {
  return Buffer.isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

Buffer.toHex = function(n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

Buffer.utf8ToBytes = function(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

Buffer.asciiToBytes = function(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

Buffer.utf16leToBytes = function(str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

Buffer.base64ToBytes = function(str) {
  return base64.toByteArray(str)
}

Buffer.blitBuffer = function(src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

Buffer.decodeUtf8Char = function(str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
Buffer.verifuint = function(value, max) {
  Buffer.assert(typeof value === 'number', 'cannot write a non-number as a number')
  Buffer.assert(value >= 0, 'specified a negative value for writing an unsigned value')
  Buffer.assert(value <= max, 'value is larger than maximum value for type')
  Buffer.assert(Math.floor(value) === value, 'value has a fractional component')
}

Buffer.verifsint = function(value, max, min) {
  Buffer.assert(typeof value === 'number', 'cannot write a non-number as a number')
  Buffer.assert(value <= max, 'value larger than maximum allowed value')
  Buffer.assert(value >= min, 'value smaller than minimum allowed value')
  Buffer.assert(Math.floor(value) === value, 'value has a fractional component')
}

Buffer.verifIEEE754 = function(value, max, min) {
  Buffer.assert(typeof value === 'number', 'cannot write a non-number as a number')
  Buffer.assert(value <= max, 'value larger than maximum allowed value')
  Buffer.assert(value >= min, 'value smaller than minimum allowed value')
}

Buffer.assert = function(test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}
/**
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * The Log class holds the global static variable LOG.
 */
var Log = function Log()
{
}

exports.Log = Log;

/**
 * LOG is the level for logging debugging statements.  0 means no log messages.
 * @type Number
 */
Log.LOG = 0;
/**
 * Encapsulate a Buffer and support dynamic reallocation.
 * Copyright (C) 2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * NdnCommon has static NDN utility methods and constants.
 * @constructor
 */
var NdnCommon = {};

exports.NdnCommon = NdnCommon;

/**
 * The practical limit of the size of a network-layer packet. If a packet is
 * larger than this, the library or application MAY drop it. This constant is
 * defined in this low-level class so that internal code can use it, but
 * applications should use the static API method
 * Face.getMaxNdnPacketSize() which is equivalent.
 */
NdnCommon.MAX_NDN_PACKET_SIZE = 8800;
/**
 * Copyright (C) 2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * An ExponentialReExpress uses an internal onTimeout to express the interest again
 * with double the interestLifetime. See ExponentialReExpress.makeOnTimeout,
 * which you should call instead of the private constructor.
 * Create a new ExponentialReExpress where onTimeout expresses the interest
 * again with double the interestLifetime. If the interesLifetime goes
 * over settings.maxInterestLifetime, then call the given onTimeout. If this
 * internally gets onData, just call the given onData.
 */
var ExponentialReExpress = function ExponentialReExpress
  (face, onData, onTimeout, settings)
{
  settings = (settings || {});
  this.face = face;
  this.callerOnData = onData;
  this.callerOnTimeout = onTimeout;

  this.maxInterestLifetime = (settings.maxInterestLifetime || 16000);
};

exports.ExponentialReExpress = ExponentialReExpress;

/**
 * Return a callback to use in expressInterest for onTimeout which will express
 * the interest again with double the interestLifetime. If the interesLifetime
 * goes over maxInterestLifetime (see settings below), then call the provided
 * onTimeout. If a Data packet is received, this calls the provided onData.
 * Use it like this:
 *   var onData = function() { ... };
 *   var onTimeout = function() { ... };
 *   face.expressInterest
 *     (interest, onData,
 *      ExponentialReExpress.makeOnTimeout(face, onData, onTimeout));
 * @param {Face} face This calls face.expressInterest.
 * @param {function} onData When a matching data packet is received, this calls
 * onData(interest, data) where interest is the interest given to
 * expressInterest and data is the received Data object. This is normally the
 * same onData you initially passed to expressInterest.
 * @param {function} onTimeout If the interesLifetime goes over
 * maxInterestLifetime, this calls onTimeout(interest).
 * @param {Object} settings (optional) If not null, an associative array with
 * the following defaults:
 * {
 *   maxInterestLifetime: 16000 // milliseconds
 * }
 * @returns {function} The onTimeout callback to pass to expressInterest.
 */
ExponentialReExpress.makeOnTimeout = function(face, onData, onTimeout, settings)
{
  var reExpress = new ExponentialReExpress(face, onData, onTimeout, settings);
  return function(interest) { reExpress.onTimeout(interest); };
};

ExponentialReExpress.prototype.onTimeout = function(interest)
{
  var interestLifetime = interest.getInterestLifetimeMilliseconds();
  if (interestLifetime == null)
    // Can't re-express.
    return this.callerOnTimeout(interest);

  var nextInterestLifetime = interestLifetime * 2;
  if (nextInterestLifetime > this.maxInterestLifetime)
    return this.callerOnTimeout(interest);

  var nextInterest = interest.clone();
  nextInterest.setInterestLifetimeMilliseconds(nextInterestLifetime);
  var thisObject = this;
  this.face.expressInterest
    (nextInterest, this.callerOnData,
     function(localInterest) { thisObject.onTimeout(localInterest); });
};
/**
 * Copyright (C) 2013 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * A Blob holds an immutable byte array implemented as a Buffer.  This should be
 * treated like a string which is a pointer to an immutable string. (It is OK to
 * pass a pointer to the string because the new owner can’t change the bytes of
 * the string.)  Blob does not inherit from Buffer. Instead you must call buf()
 * to get the byte array which reminds you that you should not change the
 * contents.  Also remember that buf() can return null.
 * @param {Blob|Buffer|Array<number>} value (optional) If value is a Blob, take
 * another pointer to the Buffer without copying. If value is a Buffer or byte
 * array, copy to create a new Buffer.  If omitted, buf() will return null.
 * @param {boolean} copy (optional) (optional) If true, copy the contents of
 * value into a new Buffer.  If false, just use the existing value without
 * copying. If omitted, then copy the contents (unless value is already a Blob).
 * IMPORTANT: If copy is false, if you keep a pointer to the value then you must
 * treat the value as immutable and promise not to change it.
 */
var Blob = function Blob(value, copy)
{
  if (copy == null)
    copy = true;

  if (value == null)
    this.buffer = null;
  else if (typeof value === 'object' && value instanceof Blob)
    // Use the existing buffer.  Don't need to check for copy.
    this.buffer = value.buffer;
  else {
    if (typeof value === 'string')
      // Convert from a string to utf-8 byte encoding.
      this.buffer = new Buffer(value, 'utf8');
    else {
      if (copy)
        // We are copying, so just make another Buffer.
        this.buffer = new Buffer(value);
      else {
        if (Buffer.isBuffer(value))
          // We can use as-is.
          this.buffer = value;
        else
          // We need a Buffer, so copy.
          this.buffer = new Buffer(value);
      }
    }
  }

  // Set the length to be "JavaScript-like".
  this.length = this.buffer != null ? this.buffer.length : 0;
};

exports.Blob = Blob;

/**
 * Return the length of the immutable byte array.
 * @returns {number} The length of the array.  If buf() is null, return 0.
 */
Blob.prototype.size = function()
{
  if (this.buffer != null)
    return this.buffer.length;
  else
    return 0;
};

/**
 * Return the immutable byte array.  DO NOT change the contents of the Buffer.
 * If you need to change it, make a copy.
 * @returns {Buffer} The Buffer holding the immutable byte array, or null.
 */
Blob.prototype.buf = function()
{
  return this.buffer;
};

/**
 * Return true if the array is null, otherwise false.
 * @returns {boolean} True if the array is null.
 */
Blob.prototype.isNull = function()
{
  return this.buffer == null;
};

/**
 * Return the hex representation of the bytes in the byte array.
 * @returns {string} The hex string.
 */
Blob.prototype.toHex = function()
{
  if (this.buffer == null)
    return "";
  else
    return this.buffer.toString('hex');
};

/**
 * Decode the byte array as UTF8 and return the Unicode string.
 * @return A unicode string, or "" if the buffer is null.
 */
Blob.prototype.toString = function()
{
  if (this.buffer == null)
    return "";
  else
    return this.buffer.toString('utf8');
};

/**
 * Check if the value of this Blob equals the other blob.
 * @param {Blob} other The other Blob to check.
 * @returns {boolean} if this isNull and other isNull or if the bytes of this
 * blob equal the bytes of the other.
 */
Blob.prototype.equals = function(other)
{
  if (this.isNull())
    return other.isNull();
  else if (other.isNull())
    return false;
  else {
    if (this.buffer.length != other.buffer.length)
      return false;

    for (var i = 0; i < this.buffer.length; ++i) {
      if (this.buffer[i] != other.buffer[i])
        return false;
    }

    return true;
  }
};
/**
 * Copyright (C) 2013 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Blob = require('./blob.js').Blob;

/**
 * A SignedBlob extends Blob to keep the offsets of a signed portion (e.g., the
 * bytes of Data packet). This inherits from Blob, including Blob.size and Blob.buf.
 * @param {Blob|Buffer|Array<number>} value (optional) If value is a Blob, take
 * another pointer to the Buffer without copying. If value is a Buffer or byte
 * array, copy to create a new Buffer.  If omitted, buf() will return null.
 * @param {number} signedPortionBeginOffset (optional) The offset in the
 * encoding of the beginning of the signed portion. If omitted, set to 0.
 * @param {number} signedPortionEndOffset (optional) The offset in the encoding
 * of the end of the signed portion. If omitted, set to 0.
 */
var SignedBlob = function SignedBlob(value, signedPortionBeginOffset, signedPortionEndOffset)
{
  // Call the base constructor.
  Blob.call(this, value);

  if (this.buffer == null) {
    this.signedPortionBeginOffset = 0;
    this.signedPortionEndOffset = 0;
  }
  else if (typeof value === 'object' && value instanceof SignedBlob) {
    // Copy the SignedBlob, allowing override for offsets.
    this.signedPortionBeginOffset = signedPortionBeginOffset == null ?
      value.signedPortionBeginOffset : signedPortionBeginOffset;
    this.signedPortionEndOffset = signedPortionEndOffset == null ?
      value.signedPortionEndOffset : signedPortionEndOffset;
  }
  else {
    this.signedPortionBeginOffset = signedPortionBeginOffset || 0;
    this.signedPortionEndOffset = signedPortionEndOffset || 0;
  }

  if (this.buffer == null)
    this.signedBuffer = null;
  else
    this.signedBuffer = this.buffer.slice
      (this.signedPortionBeginOffset, this.signedPortionEndOffset);
};

SignedBlob.prototype = new Blob();
SignedBlob.prototype.name = "SignedBlob";

exports.SignedBlob = SignedBlob;

/**
 * Return the length of the signed portion of the immutable byte array.
 * @returns {number} The length of the signed portion.  If signedBuf() is null,
 * return 0.
 */
SignedBlob.prototype.signedSize = function()
{
  if (this.signedBuffer != null)
    return this.signedBuffer.length;
  else
    return 0;
};

/**
 * Return a the signed portion of the immutable byte array.
 * @returns {Buffer} A slice into the Buffer which is the signed portion.
 * If the pointer to the array is null, return null.
 */
SignedBlob.prototype.signedBuf = function()
{
  if (this.signedBuffer != null)
    return this.signedBuffer;
  else
    return null;
};

/**
 * Return the offset in the array of the beginning of the signed portion.
 * @returns {number} The offset in the array.
 */
SignedBlob.prototype.getSignedPortionBeginOffset = function()
{
  return this.signedPortionBeginOffset;
};

/**
 * Return the offset in the array of the end of the signed portion.
 * @returns {number} The offset in the array.
 */
SignedBlob.prototype.getSignedPortionEndOffset = function()
{
  return this.signedPortionEndOffset;
};
/**
 * Encapsulate a Buffer and support dynamic reallocation.
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * Create a DynamicBuffer where this.array is a Buffer of size length.
 * To access the array, use this.array or call slice.
 * @constructor
 * @param {number} length the initial length of the array.  If null, use a default.
 */
var DynamicBuffer = function DynamicBuffer(length)
{
  if (!length)
    length = 16;

  this.array = new Buffer(length);
};

exports.DynamicBuffer = DynamicBuffer;

/**
 * Ensure that this.array has the length, reallocate and copy if necessary.
 * Update the length of this.array which may be greater than length.
 * @param {number} length The minimum length for the array.
 */
DynamicBuffer.prototype.ensureLength = function(length)
{
  if (this.array.length >= length)
    return;

  // See if double is enough.
  var newLength = this.array.length * 2;
  if (length > newLength)
    // The needed length is much greater, so use it.
    newLength = length;

  var newArray = new Buffer(newLength);
  this.array.copy(newArray);
  this.array = newArray;
};

/**
 * Copy the value to this.array at offset, reallocating if necessary.
 * @param {Buffer} value The buffer to copy.
 * @param {number} offset The offset in the buffer to start copying into.
 * @returns {number} The new offset which is offset + value.length.
 */
DynamicBuffer.prototype.copy = function(value, offset)
{
  this.ensureLength(value.length + offset);

  if (Buffer.isBuffer(value))
    value.copy(this.array, offset);
  else
    // Need to make value a Buffer to copy.
    new Buffer(value).copy(this.array, offset);

  return offset + value.length;
};

/**
 * Ensure that this.array has the length. If necessary, reallocate the array
 *   and shift existing data to the back of the new array.
 * Update the length of this.array which may be greater than length.
 * @param {number} length The minimum length for the array.
 */
DynamicBuffer.prototype.ensureLengthFromBack = function(length)
{
  if (this.array.length >= length)
    return;

  // See if double is enough.
  var newLength = this.array.length * 2;
  if (length > newLength)
    // The needed length is much greater, so use it.
    newLength = length;

  var newArray = new Buffer(newLength);
  // Copy to the back of newArray.
  this.array.copy(newArray, newArray.length - this.array.length);
  this.array = newArray;
};

/**
 * First call ensureLengthFromBack to make sure the bytearray has
 * offsetFromBack bytes, then copy value into the array starting
 * offsetFromBack bytes from the back of the array.
 * @param {Buffer} value The buffer to copy.
 * @param {number} offsetFromBack The offset from the back of the array to start
 * copying.
 */
DynamicBuffer.prototype.copyFromBack = function(value, offsetFromBack)
{
  this.ensureLengthFromBack(offsetFromBack);

  if (Buffer.isBuffer(value))
    value.copy(this.array, this.array.length - offsetFromBack);
  else
    // Need to make value a Buffer to copy.
    new Buffer(value).copy(this.array, this.array.length - offsetFromBack);
};

/**
 * Return this.array.slice(begin, end);
 * @param {number} begin The begin index for the slice.
 * @param {number} end (optional) The end index for the slice.
 * @returns {Buffer} The buffer slice.
 */
DynamicBuffer.prototype.slice = function(begin, end)
{
  if (end == undefined)
    return this.array.slice(begin);
  else
    return this.array.slice(begin, end);
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * A ChangeCounter keeps a target object whose change count is tracked by a
 * local change count.  You can set to a new target which updates the local
 * change count, and you can call checkChanged to check if the target (or one of
 * the target's targets) has been changed. The target object must have a method
 * getChangeCount.
 *
 * Create a new ChangeCounter to track the given target.  This sets the local
 * change counter to target.getChangeCount().
 * @param {object} target The target to track, as an object with the method
 * getChangeCount().
 * @constructor
 */
var ChangeCounter = function ChangeCounter(target)
{
  this.target = target;
  this.changeCount = target.getChangeCount();
};

exports.ChangeCounter = ChangeCounter;

/**
 * Get the target object. If the target is changed, then checkChanged will
 * detect it.
 * @returns {object} The target, as an object with the method
 * getChangeCount().
 */
ChangeCounter.prototype.get = function()
{
  return this.target;
};

/**
 * Set the target to the given target. This sets the local change counter to
 * target.getChangeCount().
 * @param {object} target The target to track, as an object with the method
 * getChangeCount().
 */
ChangeCounter.prototype.set = function(target)
{
  this.target = target;
  this.changeCount = target.getChangeCount();
};

/**
 * If the target's change count is different than the local change count, then
 * update the local change count and return true. Otherwise return false,
 * meaning that the target has not changed. This is useful since the target (or
 * one of the target's targets) may be changed and you need to find out.
 * @returns {boolean} True if the change count has been updated, false if not.
 */
ChangeCounter.prototype.checkChanged = function()
{
  var targetChangeCount = this.target.getChangeCount();
  if (this.changeCount != targetChangeCount) {
    this.changeCount = targetChangeCount;
    return true;
  }
  else
    return false;
};
/**
 * Copyright (C) 2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * A SyncPromise is a promise which is immediately fulfilled or rejected, used
 * to return a promise in synchronous code.
 * This private constructor creates a SyncPromise fulfilled or rejected with the
 * given value. You should normally not call this constructor but call
 * SyncPromise.resolve or SyncPromise.reject. Note that we don't need a
 * constructor like SyncPromise(function(resolve, reject)) because this would be
 * for scheduling the function to be called later, which we don't do.
 * @param {any} value If isRejected is false, this is the value of the fulfilled
 * promise, else if isRejected is true, this is the error.
 * @param {boolean} isRejected True to create a promise in the rejected state,
 * where value is the error.
 * @constructor
 */
var SyncPromise = function SyncPromise(value, isRejected)
{
  this.value = value;
  this.isRejected = isRejected;
};

exports.SyncPromise = SyncPromise;

/**
 * If this promise is fulfilled, immediately call onFulfilled with the fulfilled
 * value as described below. Otherwise, if this promise is rejected, immediately
 * call onRejected with the error as described below.
 * @param {function} (optional) onFulfilled If this promise is fulfilled, this 
 * calls onFulfilled(value) with the value of this promise and returns the 
 * result. The function should return a promise. To use all synchronous code,
 * onFulfilled should return SyncPromise.resolve(newValue).
 * @param {function} (optional) onRejected If this promise is rejected, this
 * calls onRejected(err) with the error value of this promise and returns the
 * result. The function should return a promise. To use all synchronous code,
 * onFulfilled should return SyncPromise.resolve(newValue) (or throw an
 * exception).
 * @return {Promise|SyncPromise} If this promise is fulfilled, return the result
 * of calling onFulfilled(value). Note that this does not create a promise which
 * is scheduled to execute later. Rather it immediately calls onFulfilled which
 * should return a promise. But if onFulfilled is undefined, simply return this
 * promise to pass it forward. If this promise is rejected, return the result of
 * calling onRejected(err) with the error value. But if onRejected is undefined,
 * simply return this promise to pass it forward. However, if onFulfilled or
 * onRejected throws an exception, then return a new SyncPromise in the rejected
 * state with the exception.
 */
SyncPromise.prototype.then = function(onFulfilled, onRejected)
{
  if (this.isRejected) {
    if (onRejected) {
      try {
        return onRejected(this.value);
      }
      catch(err) {
        return new SyncPromise(err, true);
      }
    }
    else
      // Pass the error forward.
      return this;
  }
  else {
    if (onFulfilled) {
      try {
        return onFulfilled(this.value);
      }
      catch(err) {
        return new SyncPromise(err, true);
      }
    }
    else
      // Pass the fulfilled value forward.
      return this;
  }
};

/**
 * Call this.then(undefined, onRejected) and return the result. If this promise
 * is rejected then onRejected will process it. If this promise is fulfilled,
 * this simply passes it forward.
 */
SyncPromise.prototype.catch = function(onRejected)
{
  return this.then(undefined, onRejected);
};

/**
 * Return a new SyncPromise which is already fulfilled to the given value.
 * @param {any} value The value of the promise.
 */
SyncPromise.resolve = function(value)
{
  return new SyncPromise(value, false);
};

/**
 * Return a new SyncPromise which is already rejected with the given error.
 * @param {any} err The error for the rejected promise.
 */
SyncPromise.reject = function(err)
{
  return new SyncPromise(err, true);
};

/**
 * This static method checks if the promise is a SyncPromise and immediately
 * returns its value or throws the error if promise is rejected. If promise is
 * not a SyncPromise, this throws an exception since it is not possible to
 * immediately get the value. This can be used with "promise-based" code which
 * you expect to always return a SyncPromise to operate in synchronous mode.
 * @param {SyncPromise} promise The SyncPromise with the value to get.
 * @return {any} The value of the promise.
 * @throws {Error} If promise is not a SyncPromise.
 * @throws {any} If promise is a SyncPromise in the rejected state, this throws
 * the error.
 */
SyncPromise.getValue = function(promise)
{
  if (promise instanceof SyncPromise) {
    if (promise.isRejected)
      throw promise.value;
    else
      return promise.value;
  }
  else
    throw new Error("Cannot return immediately because promise is not a SyncPromise");
};

/**
 * This can be called with complete(onComplete, promise) or
 * complete(onComplete, onError, promise) to handle both synchronous and
 * asynchronous code based on whether the caller supplies the onComlete callback.
 * If onComplete is defined, call promise.then with a function which calls
 * onComplete(value) when fulfilled (possibly in asynchronous mode). If
 * onComplete is undefined, then we are in synchronous mode so return
 * SyncPromise.getValue(promise) which will throw an exception if the promise is
 * not a SyncPromise (or is a SyncPromise in the rejected state).
 * @param {function} onComplete If defined, this calls promise.then to fulfill
 * the promise, then calls onComplete(value) with the value of the promise.
 * If onComplete is undefined, the return value is described below.
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an error when this calls promise.then, this calls
 * onError(err) with the value of the error. If onComplete is undefined, then
 * onError is ignored and this will call SyncPromise.getValue(promise) which may
 * throw an exception.
 * @param {Promise|SyncPromise} promise If onComplete is defined, this calls
 * promise.then. Otherwise, this calls SyncPromise.getValue(promise).
 * @return {any} If onComplete is undefined, return SyncPromise.getValue(promise).
 * Otherwise, if onComplete is supplied then return undefined and use
 * onComplete as described above.
 * @throws {Error} If onComplete is undefined and promise is not a SyncPromise.
 * @throws {any} If onComplete is undefined and promise is a SyncPromise in the
 * rejected state.
 */
SyncPromise.complete = function(onComplete, onErrorOrPromise, promise)
{
  var onError;
  if (promise)
    onError = onErrorOrPromise;
  else {
    promise = onErrorOrPromise;
    onError = null;
  }
  
  if (onComplete)
    promise
    .then(function(value) {
      onComplete(value);
    }, function(err) {
      if (onError)
        onError(err);
      else {
        if (promise instanceof SyncPromise)
          throw err;
        else
          // We are in an async promise callback, so a thrown exception won't
          // reach the caller. Just log it.
          console.log("Uncaught exception from a Promise: " + err);
      }
    });
  else
    return SyncPromise.getValue(promise);
};
/**
 * This class contains utilities to help parse the data
 *
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Meki Cheraoui
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * A DataUtils has static methods for converting data.
 * @constructor
 */
var DataUtils = {};

exports.DataUtils = DataUtils;

/*
 * NOTE THIS IS CURRENTLY NOT BEING USED
 *
 */

DataUtils.keyStr = "ABCDEFGHIJKLMNOP" +
                   "QRSTUVWXYZabcdef" +
                   "ghijklmnopqrstuv" +
                   "wxyz0123456789+/" +
                   "=";

/**
 * Raw String to Base 64
 */
DataUtils.stringtoBase64 = function stringtoBase64(input)
{
   //input = escape(input);
   var output = "";
   var chr1, chr2, chr3 = "";
   var enc1, enc2, enc3, enc4 = "";
   var i = 0;

   do {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2))
       enc3 = enc4 = 64;
    else if (isNaN(chr3))
       enc4 = 64;

    output = output +
       DataUtils.keyStr.charAt(enc1) +
       DataUtils.keyStr.charAt(enc2) +
       DataUtils.keyStr.charAt(enc3) +
       DataUtils.keyStr.charAt(enc4);
    chr1 = chr2 = chr3 = "";
    enc1 = enc2 = enc3 = enc4 = "";
   } while (i < input.length);

   return output;
};

/**
 * Base 64 to Raw String
 */
DataUtils.base64toString = function base64toString(input)
{
  var output = "";
  var chr1, chr2, chr3 = "";
  var enc1, enc2, enc3, enc4 = "";
  var i = 0;

  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  var base64test = /[^A-Za-z0-9\+\/\=]/g;
  /* Test for invalid characters. */
  if (base64test.exec(input)) {
    alert("There were invalid base64 characters in the input text.\n" +
          "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
          "Expect errors in decoding.");
  }

  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

  do {
    enc1 = DataUtils.keyStr.indexOf(input.charAt(i++));
    enc2 = DataUtils.keyStr.indexOf(input.charAt(i++));
    enc3 = DataUtils.keyStr.indexOf(input.charAt(i++));
    enc4 = DataUtils.keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 != 64)
      output = output + String.fromCharCode(chr2);

    if (enc4 != 64)
      output = output + String.fromCharCode(chr3);

    chr1 = chr2 = chr3 = "";
    enc1 = enc2 = enc3 = enc4 = "";
  } while (i < input.length);

  return output;
};

/**
 * Buffer to Hex String
 */
DataUtils.toHex = function(buffer)
{
  return buffer.toString('hex');
};

/**
 * Raw string to hex string.
 */
DataUtils.stringToHex = function(args)
{
  var ret = "";
  for (var i = 0; i < args.length; ++i) {
    var value = args.charCodeAt(i);
    ret += (value < 16 ? "0" : "") + value.toString(16);
  }
  return ret;
};

/**
 * Buffer to raw string.
 */
DataUtils.toString = function(buffer)
{
  return buffer.toString('binary');
};

/**
 * Hex String to Buffer.
 */
DataUtils.toNumbers = function(str)
{
  return new Buffer(str, 'hex');
};

/**
 * Hex String to raw string.
 */
DataUtils.hexToRawString = function(str)
{
  if (typeof str =='string') {
  var ret = "";
  str.replace(/(..)/g, function(s) {
    ret += String.fromCharCode(parseInt(s, 16));
  });
  return ret;
  }
};

/**
 * Raw String to Buffer.
 */
DataUtils.toNumbersFromString = function(str)
{
  return new Buffer(str, 'binary');
};

/**
 * If value is a string, then interpret it as a raw string and convert to
 * a Buffer. Otherwise assume it is a Buffer or array type and just return it.
 * @param {string|any} value
 * @returns {Buffer}
 */
DataUtils.toNumbersIfString = function(value)
{
  if (typeof value === 'string')
    return new Buffer(value, 'binary');
  else
    return value;
};

/**
 * Encode str as utf8 and return as Buffer.
 */
DataUtils.stringToUtf8Array = function(str)
{
  return new Buffer(str, 'utf8');
};

/**
 * arrays is an array of Buffer. Return a new Buffer which is the concatenation of all.
 */
DataUtils.concatArrays = function(arrays)
{
  return Buffer.concat(arrays);
};

// TODO: Take Buffer and use TextDecoder when available.
DataUtils.decodeUtf8 = function(utftext)
{
  var string = "";
  var i = 0;
  var c = 0;
    var c1 = 0;
    var c2 = 0;

  while (i < utftext.length) {
    c = utftext.charCodeAt(i);

    if (c < 128) {
      string += String.fromCharCode(c);
      i++;
    }
    else if (c > 191 && c < 224) {
      c2 = utftext.charCodeAt(i + 1);
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    }
    else {
      c2 = utftext.charCodeAt(i+1);
      var c3 = utftext.charCodeAt(i+2);
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }
  }

  return string;
};

/**
 * Return true if a1 and a2 are the same length with equal elements.
 */
DataUtils.arraysEqual = function(a1, a2)
{
  // A simple sanity check that it is an array.
  if (!a1.slice)
    throw new Error("DataUtils.arraysEqual: a1 is not an array");
  if (!a2.slice)
    throw new Error("DataUtils.arraysEqual: a2 is not an array");

  if (a1.length != a2.length)
    return false;

  for (var i = 0; i < a1.length; ++i) {
    if (a1[i] != a2[i])
      return false;
  }

  return true;
};

/**
 * Convert the big endian Buffer to an unsigned int.
 * Don't check for overflow.
 */
DataUtils.bigEndianToUnsignedInt = function(bytes)
{
  var result = 0;
  for (var i = 0; i < bytes.length; ++i) {
    // Multiply by 0x100 instead of shift by 8 because << is restricted to 32 bits.
    result *= 0x100;
    result += bytes[i];
  }
  return result;
};

/**
 * Convert the int value to a new big endian Buffer and return.
 * If value is 0 or negative, return new Buffer(0).
 */
DataUtils.nonNegativeIntToBigEndian = function(value)
{
  value = Math.round(value);
  if (value <= 0)
    return new Buffer(0);

  // Assume value is not over 64 bits.
  var size = 8;
  var result = new Buffer(size);
  var i = 0;
  while (value != 0) {
    ++i;
    result[size - i] = value & 0xff;
    // Divide by 0x100 and floor instead of shift by 8 because >> is restricted to 32 bits.
    value = Math.floor(value / 0x100);
  }
  return result.slice(size - i, size);
};

/**
 * Modify array to randomly shuffle the elements.
 */
DataUtils.shuffle = function(array)
{
  for (var i = array.length - 1; i >= 1; --i) {
    // j is from 0 to i.
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

/**
 * Decode the base64-encoded private key PEM and return the binary DER.
 * @param {string} The PEM-encoded private key.
 * @returns {Buffer} The binary DER.
 *
 */
DataUtils.privateKeyPemToDer = function(privateKeyPem)
{
  // Remove the '-----XXX-----' from the beginning and the end of the key and
  // also remove any \n in the key string.
  var lines = privateKeyPem.split('\n');
  var privateKey = "";
  for (var i = 1; i < lines.length - 1; i++)
    privateKey += lines[i];

  return new Buffer(privateKey, 'base64');
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * Create a new DecodingException wrapping the given error object.
 * Call with: throw new DecodingException(new Error("message")).
 * @constructor
 * @param {Error} error The exception created with new Error.
 */
function DecodingException(error)
{
  if (error) {
    // Copy lineNumber, etc. from where new Error was called.
    for (var prop in error)
      this[prop] = error[prop];
    // Make sure these are copied.
    this.message = error.message;
    this.stack = error.stack;
  }
}
DecodingException.prototype = new Error();
DecodingException.prototype.name = "DecodingException";

exports.DecodingException = DecodingException;
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * The Tlv class has static type codes for the NDN-TLV wire format.
 * @constructor
 */
var Tlv = function Tlv()
{
};

exports.Tlv = Tlv;

Tlv.Interest =         5;
Tlv.Data =             6;
Tlv.Name =             7;
Tlv.NameComponent =    8;
Tlv.Selectors =        9;
Tlv.Nonce =            10;
// <Unassigned> =      11;
Tlv.InterestLifetime = 12;
Tlv.MinSuffixComponents = 13;
Tlv.MaxSuffixComponents = 14;
Tlv.PublisherPublicKeyLocator = 15;
Tlv.Exclude =          16;
Tlv.ChildSelector =    17;
Tlv.MustBeFresh =      18;
Tlv.Any =              19;
Tlv.MetaInfo =         20;
Tlv.Content =          21;
Tlv.SignatureInfo =    22;
Tlv.SignatureValue =   23;
Tlv.ContentType =      24;
Tlv.FreshnessPeriod =  25;
Tlv.FinalBlockId =     26;
Tlv.SignatureType =    27;
Tlv.KeyLocator =       28;
Tlv.KeyLocatorDigest = 29;
Tlv.FaceInstance =     128;
Tlv.ForwardingEntry =  129;
Tlv.StatusResponse =   130;
Tlv.Action =           131;
Tlv.FaceID =           132;
Tlv.IPProto =          133;
Tlv.Host =             134;
Tlv.Port =             135;
Tlv.MulticastInterface = 136;
Tlv.MulticastTTL =     137;
Tlv.ForwardingFlags =  138;
Tlv.StatusCode =       139;
Tlv.StatusText =       140;

Tlv.SignatureType_DigestSha256 = 0;
Tlv.SignatureType_SignatureSha256WithRsa = 1;
Tlv.SignatureType_SignatureSha256WithEcdsa = 3;

Tlv.ContentType_Default = 0;
Tlv.ContentType_Link =    1;
Tlv.ContentType_Key =     2;

Tlv.NfdCommand_ControlResponse = 101;
Tlv.NfdCommand_StatusCode =      102;
Tlv.NfdCommand_StatusText =      103;

Tlv.ControlParameters_ControlParameters =   104;
Tlv.ControlParameters_FaceId =              105;
Tlv.ControlParameters_Uri =                 114;
Tlv.ControlParameters_LocalControlFeature = 110;
Tlv.ControlParameters_Origin =              111;
Tlv.ControlParameters_Cost =                106;
Tlv.ControlParameters_Flags =               108;
Tlv.ControlParameters_Strategy =            107;
Tlv.ControlParameters_ExpirationPeriod =    109;

Tlv.LocalControlHeader_LocalControlHeader = 80;
Tlv.LocalControlHeader_IncomingFaceId = 81;
Tlv.LocalControlHeader_NextHopFaceId = 82;
Tlv.LocalControlHeader_CachingPolicy = 83;
Tlv.LocalControlHeader_NoCache = 96;

/**
 * Strip off the lower 32 bits of x and divide by 2^32, returning the "high
 * bytes" above 32 bits.  This is necessary because JavaScript << and >> are
 * restricted to 32 bits.
 * (This could be a general function, but we define it here so that the
 * Tlv encoder/decoder is self-contained.)
 * @param {number} x
 * @returns {number}
 */
Tlv.getHighBytes = function(x)
{
  // Don't use floor because we expect the caller to use & and >> on the result
  // which already strip off the fraction.
  return (x - (x % 0x100000000)) / 0x100000000;
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var DynamicBuffer = require('../../util/dynamic-buffer.js').DynamicBuffer;
var Tlv = require('./tlv.js').Tlv;

/**
 * Create a new TlvEncoder with an initialCapacity for the encoding buffer.
 * @constructor
 * @param {number} initialCapacity (optional) The initial capacity of the
 * encoding buffer. If omitted, use a default value.
 */
var TlvEncoder = function TlvEncoder(initialCapacity)
{
  initialCapacity = initialCapacity || 16;
  this.output = new DynamicBuffer(initialCapacity);
  // length is the number of bytes that have been written to the back of
  //  this.output.array.
  this.length = 0;
};

exports.TlvEncoder = TlvEncoder;

/**
 * Get the number of bytes that have been written to the output.  You can
 * save this number, write sub TLVs, then subtract the new length from this
 * to get the total length of the sub TLVs.
 * @returns {number} The number of bytes that have been written to the output.
 */
TlvEncoder.prototype.getLength = function()
{
  return this.length;
};

/**
 * Encode varNumber as a VAR-NUMBER in NDN-TLV and write it to this.output just
 * before this.length from the back.  Advance this.length.
 * @param {number} varNumber The non-negative number to encode.
 */
TlvEncoder.prototype.writeVarNumber = function(varNumber)
{
  if (varNumber < 253) {
    this.length += 1;
    this.output.ensureLengthFromBack(this.length);
    this.output.array[this.output.array.length - this.length] = varNumber & 0xff;
  }
  else if (varNumber <= 0xffff) {
    this.length += 3;
    this.output.ensureLengthFromBack(this.length);
    var offset = this.output.array.length - this.length;
    this.output.array[offset] = 253;
    this.output.array[offset + 1] = (varNumber >> 8) & 0xff;
    this.output.array[offset + 2] = varNumber & 0xff;
  }
  else if (varNumber <= 0xffffffff) {
    this.length += 5;
    this.output.ensureLengthFromBack(this.length);
    var offset = this.output.array.length - this.length;
    this.output.array[offset] = 254;
    this.output.array[offset + 1] = (varNumber >> 24) & 0xff;
    this.output.array[offset + 2] = (varNumber >> 16) & 0xff;
    this.output.array[offset + 3] = (varNumber >> 8) & 0xff;
    this.output.array[offset + 4] = varNumber & 0xff;
  }
  else {
    this.length += 9;
    this.output.ensureLengthFromBack(this.length);
    var offset = this.output.array.length - this.length;
    this.output.array[offset] = 255;
    var highBytes = Tlv.getHighBytes(varNumber);
    this.output.array[offset + 1] = (highBytes >> 24) & 0xff;
    this.output.array[offset + 2] = (highBytes >> 16) & 0xff;
    this.output.array[offset + 3] = (highBytes >> 8)  & 0xff;
    this.output.array[offset + 4] = (highBytes)       & 0xff;
    this.output.array[offset + 5] = (varNumber >> 24) & 0xff;
    this.output.array[offset + 6] = (varNumber >> 16) & 0xff;
    this.output.array[offset + 7] = (varNumber >> 8) & 0xff;
    this.output.array[offset + 8] = varNumber & 0xff;
  }
};

/**
 * Encode the type and length as VAR-NUMBER and write to this.output just before
 * this.length from the back.  Advance this.length.
 * @param {number} type The type of the TLV.
 * @param {number} length The non-negative length of the TLV.
 */
TlvEncoder.prototype.writeTypeAndLength = function(type, length)
{
  // Write backwards.
  this.writeVarNumber(length);
  this.writeVarNumber(type);
};

/**
 * Write value as a non-negative integer and write it to this.output just before
 * this.length from the back. Advance this.length.
 * @param {number} value The non-negative integer to encode.
 */
TlvEncoder.prototype.writeNonNegativeInteger = function(value)
{
  if (value < 0)
    throw new Error("TLV integer value may not be negative");

  // JavaScript doesn't distinguish int from float, so round.
  value = Math.round(value);

  if (value <= 0xff) {
    this.length += 1;
    this.output.ensureLengthFromBack(this.length);
    this.output.array[this.output.array.length - this.length] = value & 0xff;
  }
  else if (value <= 0xffff) {
    this.length += 2;
    this.output.ensureLengthFromBack(this.length);
    var offset = this.output.array.length - this.length;
    this.output.array[offset]     = (value >> 8) & 0xff;
    this.output.array[offset + 1] = value & 0xff;
  }
  else if (value <= 0xffffffff) {
    this.length += 4;
    this.output.ensureLengthFromBack(this.length);
    var offset = this.output.array.length - this.length;
    this.output.array[offset]     = (value >> 24) & 0xff;
    this.output.array[offset + 1] = (value >> 16) & 0xff;
    this.output.array[offset + 2] = (value >> 8) & 0xff;
    this.output.array[offset + 3] = value & 0xff;
  }
  else {
    this.length += 8;
    this.output.ensureLengthFromBack(this.length);
    var offset = this.output.array.length - this.length;
    var highBytes = Tlv.getHighBytes(value);
    this.output.array[offset]     = (highBytes >> 24) & 0xff;
    this.output.array[offset + 1] = (highBytes >> 16) & 0xff;
    this.output.array[offset + 2] = (highBytes >> 8)  & 0xff;
    this.output.array[offset + 3] = (highBytes)       & 0xff;
    this.output.array[offset + 4] = (value >> 24) & 0xff;
    this.output.array[offset + 5] = (value >> 16) & 0xff;
    this.output.array[offset + 6] = (value >> 8) & 0xff;
    this.output.array[offset + 7] = value & 0xff;
  }
};

/**
 * Write the type, then the length of the encoded value then encode value as a
 * non-negative integer and write it to this.output just before this.length from
 * the back. Advance this.length.
 * @param {number} type The type of the TLV.
 * @param {number} value The non-negative integer to encode.
 */
TlvEncoder.prototype.writeNonNegativeIntegerTlv = function(type, value)
{
  // Write backwards.
  var saveNBytes = this.length;
  this.writeNonNegativeInteger(value);
  this.writeTypeAndLength(type, this.length - saveNBytes);
};

/**
 * If value is negative or null then do nothing, otherwise call
 * writeNonNegativeIntegerTlv.
 * @param {number} type The type of the TLV.
 * @param {number} value If negative or None do nothing, otherwise the integer
 *   to encode.
 */
TlvEncoder.prototype.writeOptionalNonNegativeIntegerTlv = function(type, value)
{
  if (value != null && value >= 0)
    this.writeNonNegativeIntegerTlv(type, value);
};

/**
 * Write the type, then the length of the buffer then the buffer value to
 * this.output just before this.length from the back. Advance this.length.
 * @param {number} type The type of the TLV.
 * @param {Buffer} value The byte array with the bytes of the blob.  If value is
    null, then just write the type and length 0.
 */
TlvEncoder.prototype.writeBlobTlv = function(type, value)
{
  if (value == null) {
    this.writeTypeAndLength(type, 0);
    return;
  }

  // Write backwards, starting with the blob array.
  this.length += value.length;
  this.output.copyFromBack(value, this.length);

  this.writeTypeAndLength(type, value.length);
};

/**
 * If the byte array is null or zero length then do nothing, otherwise call
 * writeBlobTlv.
 * @param {number} type The type of the TLV.
 * @param {Buffer} value If null or zero length do nothing, otherwise the byte
 * array with the bytes of the blob.
 */
TlvEncoder.prototype.writeOptionalBlobTlv = function(type, value)
{
  if (value != null && value.length > 0)
    this.writeBlobTlv(type, value);
};

/**
 * Get a slice of the encoded bytes.
 * @returns {Buffer} A slice backed by the encoding Buffer.
 */
TlvEncoder.prototype.getOutput = function()
{
  return this.output.array.slice(this.output.array.length - this.length);
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var DecodingException = require('../decoding-exception.js').DecodingException;

/**
 * Create a new TlvDecoder for decoding the input in the NDN-TLV wire format.
 * @constructor
 * @param {Buffer} input The buffer with the bytes to decode.
 */
var TlvDecoder = function TlvDecoder(input)
{
  this.input = input;
  this.offset = 0;
};

exports.TlvDecoder = TlvDecoder;

/**
 * Decode VAR-NUMBER in NDN-TLV and return it. Update offset.
 * @returns {number} The decoded VAR-NUMBER.
 */
TlvDecoder.prototype.readVarNumber = function()
{
  // Assume array values are in the range 0 to 255.
  var firstOctet = this.input[this.offset];
  this.offset += 1;
  if (firstOctet < 253)
    return firstOctet;
  else
    return this.readExtendedVarNumber(firstOctet);
};

/**
 * A private function to do the work of readVarNumber, given the firstOctet
 * which is >= 253.
 * @param {number} firstOctet The first octet which is >= 253, used to decode
 * the remaining bytes.
 * @returns {number} The decoded VAR-NUMBER.
 */
TlvDecoder.prototype.readExtendedVarNumber = function(firstOctet)
{
  var result;
  // This is a private function so we know firstOctet >= 253.
  if (firstOctet == 253) {
    result = ((this.input[this.offset] << 8) +
           this.input[this.offset + 1]);
    this.offset += 2;
  }
  else if (firstOctet == 254) {
    // Use abs because << 24 can set the high bit of the 32-bit int making it negative.
    result = (Math.abs(this.input[this.offset] << 24) +
          (this.input[this.offset + 1] << 16) +
          (this.input[this.offset + 2] << 8) +
           this.input[this.offset + 3]);
    this.offset += 4;
  }
  else {
    // Get the high byte first because JavaScript << is restricted to 32 bits.
    // Use abs because << 24 can set the high bit of the 32-bit int making it negative.
    var highByte = Math.abs(this.input[this.offset] << 24) +
                           (this.input[this.offset + 1] << 16) +
                           (this.input[this.offset + 2] << 8) +
                            this.input[this.offset + 3];
    result = (highByte * 0x100000000 +
          (this.input[this.offset + 4] << 24) +
          (this.input[this.offset + 5] << 16) +
          (this.input[this.offset + 6] << 8) +
           this.input[this.offset + 7]);
    this.offset += 8;
  }

  return result;
};

/**
 * Decode the type and length from this's input starting at offset, expecting
 * the type to be expectedType and return the length. Update offset.  Also make
 * sure the decoded length does not exceed the number of bytes remaining in the
 * input.
 * @param {number} expectedType The expected type.
 * @returns {number} The length of the TLV.
 * @throws DecodingException if (did not get the expected TLV type or the TLV length
 * exceeds the buffer length.
 */
TlvDecoder.prototype.readTypeAndLength = function(expectedType)
{
  var type = this.readVarNumber();
  if (type != expectedType)
    throw new DecodingException(new Error("Did not get the expected TLV type"));

  var length = this.readVarNumber();
  if (this.offset + length > this.input.length)
    throw new DecodingException(new Error("TLV length exceeds the buffer length"));

  return length;
};

/**
 * Decode the type and length from the input starting at offset, expecting the
 * type to be expectedType.  Update offset.  Also make sure the decoded length
 * does not exceed the number of bytes remaining in the input. Return the offset
 * of the end of this parent TLV, which is used in decoding optional nested
 * TLVs. After reading all nested TLVs, call finishNestedTlvs.
 * @param {number} expectedType The expected type.
 * @returns {number} The offset of the end of the parent TLV.
 * @throws DecodingException if did not get the expected TLV type or the TLV
 * length exceeds the buffer length.
 */
TlvDecoder.prototype.readNestedTlvsStart = function(expectedType)
{
  return this.readTypeAndLength(expectedType) + this.offset;
};

/**
 * Call this after reading all nested TLVs to skip any remaining unrecognized
 * TLVs and to check if the offset after the final nested TLV matches the
 * endOffset returned by readNestedTlvsStart.
 * @param {number} endOffset The offset of the end of the parent TLV, returned
 * by readNestedTlvsStart.
 * @throws DecodingException if the TLV length does not equal the total length
 * of the nested TLVs.
 */
TlvDecoder.prototype.finishNestedTlvs = function(endOffset)
{
  // We expect offset to be endOffset, so check this first.
  if (this.offset == endOffset)
    return;

  // Skip remaining TLVs.
  while (this.offset < endOffset) {
    // Skip the type VAR-NUMBER.
    this.readVarNumber();
    // Read the length and update offset.
    var length = this.readVarNumber();
    this.offset += length;

    if (this.offset > this.input.length)
      throw new DecodingException(new Error("TLV length exceeds the buffer length"));
  }

  if (this.offset != endOffset)
    throw new DecodingException(new Error
      ("TLV length does not equal the total length of the nested TLVs"));
};

/**
 * Decode the type from this's input starting at offset, and if it is the
 * expectedType, then return true, else false.  However, if this's offset is
 * greater than or equal to endOffset, then return false and don't try to read
 * the type. Do not update offset.
 * @param {number} expectedType The expected type.
 * @param {number} endOffset The offset of the end of the parent TLV, returned
 * by readNestedTlvsStart.
 * @returns {boolean} true if the type of the next TLV is the expectedType,
 *  otherwise false.
 */
TlvDecoder.prototype.peekType = function(expectedType, endOffset)
{
  if (this.offset >= endOffset)
    // No more sub TLVs to look at.
    return false;
  else {
    var saveOffset = this.offset;
    var type = this.readVarNumber();
    // Restore offset.
    this.offset = saveOffset;

    return type == expectedType;
  }
};

/**
 * Decode a non-negative integer in NDN-TLV and return it. Update offset by
 * length.
 * @param {number} length The number of bytes in the encoded integer.
 * @returns {number} The integer.
 * @throws DecodingException if length is an invalid length for a TLV
 * non-negative integer.
 */
TlvDecoder.prototype.readNonNegativeInteger = function(length)
{
  var result;
  if (length == 1)
    result = this.input[this.offset];
  else if (length == 2)
    result = ((this.input[this.offset] << 8) +
           this.input[this.offset + 1]);
  else if (length == 4)
    // Use abs because << 24 can set the high bit of the 32-bit int making it negative.
    result = (Math.abs(this.input[this.offset] << 24) +
          (this.input[this.offset + 1] << 16) +
          (this.input[this.offset + 2] << 8) +
           this.input[this.offset + 3]);
  else if (length == 8) {
    // Use abs because << 24 can set the high bit of the 32-bit int making it negative.
    var highByte = Math.abs(this.input[this.offset] << 24) +
                       (this.input[this.offset + 1] << 16) +
                       (this.input[this.offset + 2] << 8) +
                        this.input[this.offset + 3];
    result = (highByte * 0x100000000 +
          Math.abs(this.input[this.offset + 4] << 24) +
          (this.input[this.offset + 5] << 16) +
          (this.input[this.offset + 6] << 8) +
           this.input[this.offset + 7]);
  }
  else
    throw new DecodingException(new Error("Invalid length for a TLV nonNegativeInteger"));

  this.offset += length;
  return result;
};

/**
 * Decode the type and length from this's input starting at offset, expecting
 * the type to be expectedType. Then decode a non-negative integer in NDN-TLV
 * and return it.  Update offset.
 * @param {number} expectedType The expected type.
 * @returns {number} The integer.
 * @throws DecodingException if did not get the expected TLV type or can't
 * decode the value.
 */
TlvDecoder.prototype.readNonNegativeIntegerTlv = function(expectedType)
{
  var length = this.readTypeAndLength(expectedType);
  return this.readNonNegativeInteger(length);
};

/**
 * Peek at the next TLV, and if it has the expectedType then call
 * readNonNegativeIntegerTlv and return the integer.  Otherwise, return null.
 * However, if this's offset is greater than or equal to endOffset, then return
 * null and don't try to read the type.
 * @param {number} expectedType The expected type.
 * @param {number} endOffset The offset of the end of the parent TLV, returned
 * by readNestedTlvsStart.
 * @returns {number} The integer or null if the next TLV doesn't have the
 * expected type.
 */
TlvDecoder.prototype.readOptionalNonNegativeIntegerTlv = function
  (expectedType, endOffset)
{
  if (this.peekType(expectedType, endOffset))
    return this.readNonNegativeIntegerTlv(expectedType);
  else
    return null;
};

/**
 * Decode the type and length from this's input starting at offset, expecting
 * the type to be expectedType. Then return an array of the bytes in the value.
 * Update offset.
 * @param {number} expectedType The expected type.
 * @returns {Buffer} The bytes in the value as a slice on the buffer.  This is
 * not a copy of the bytes in the input buffer.  If you need a copy, then you
 * must make a copy of the return value.
 * @throws DecodingException if did not get the expected TLV type.
 */
TlvDecoder.prototype.readBlobTlv = function(expectedType)
{
  var length = this.readTypeAndLength(expectedType);
  var result = this.input.slice(this.offset, this.offset + length);

  // readTypeAndLength already checked if length exceeds the input buffer.
  this.offset += length;
  return result;
};

/**
 * Peek at the next TLV, and if it has the expectedType then call readBlobTlv
 * and return the value.  Otherwise, return null. However, if this's offset is
 * greater than or equal to endOffset, then return null and don't try to read
 * the type.
 * @param {number} expectedType The expected type.
 * @param {number} endOffset The offset of the end of the parent TLV, returned
 * by readNestedTlvsStart.
 * @returns {Buffer} The bytes in the value as a slice on the buffer or null if
 * the next TLV doesn't have the expected type.  This is not a copy of the bytes
 * in the input buffer.  If you need a copy, then you must make a copy of the
 * return value.
 */
TlvDecoder.prototype.readOptionalBlobTlv = function(expectedType, endOffset)
{
  if (this.peekType(expectedType, endOffset))
    return this.readBlobTlv(expectedType);
  else
    return null;
};

/**
 * Peek at the next TLV, and if it has the expectedType then read a type and
 * value, ignoring the value, and return true. Otherwise, return false.
 * However, if this's offset is greater than or equal to endOffset, then return
 * false and don't try to read the type.
 * @param {number} expectedType The expected type.
 * @param {number} endOffset The offset of the end of the parent TLV, returned
 * by readNestedTlvsStart.
 * @returns {boolean} true, or else false if the next TLV doesn't have the
 * expected type.
 */
TlvDecoder.prototype.readBooleanTlv = function(expectedType, endOffset)
{
  if (this.peekType(expectedType, endOffset)) {
    var length = this.readTypeAndLength(expectedType);
    // We expect the length to be 0, but update offset anyway.
    this.offset += length;
    return true;
  }
  else
    return false;
};

/**
 * Get the offset into the input, used for the next read.
 * @returns {number} The offset.
 */
TlvDecoder.prototype.getOffset = function()
{
  return this.offset;
};

/**
 * Set the offset into the input, used for the next read.
 * @param {number} offset The new offset.
 */
TlvDecoder.prototype.seek = function(offset)
{
  this.offset = offset;
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var TlvDecoder = require('./tlv-decoder.js').TlvDecoder;

/**
 * Create and initialize a TlvStructureDecoder.
 */
var TlvStructureDecoder = function TlvStructureDecoder()
{
  this.gotElementEnd = false;
  this.offset = 0;
  this.state = TlvStructureDecoder.READ_TYPE;
  this.headerLength = 0;
  this.useHeaderBuffer = false;
  // 8 bytes is enough to hold the extended bytes in the length encoding
  // where it is an 8-byte number.
  this.headerBuffer = new Buffer(8);
  this.nBytesToRead = 0;
};

exports.TlvStructureDecoder = TlvStructureDecoder;

TlvStructureDecoder.READ_TYPE =         0;
TlvStructureDecoder.READ_TYPE_BYTES =   1;
TlvStructureDecoder.READ_LENGTH =       2;
TlvStructureDecoder.READ_LENGTH_BYTES = 3;
TlvStructureDecoder.READ_VALUE_BYTES =  4;

/**
 * Continue scanning input starting from this.offset to find the element end.
 * If the end of the element which started at offset 0 is found, this returns
 * true and getOffset() is the length of the element.  Otherwise, this returns
 * false which means you should read more into input and call again.
 * @param {Buffer} input The input buffer. You have to pass in input each time
 * because the buffer could be reallocated.
 * @returns {boolean} true if found the element end, false if not.
 */
TlvStructureDecoder.prototype.findElementEnd = function(input)
{
  if (this.gotElementEnd)
    // Someone is calling when we already got the end.
    return true;

  var decoder = new TlvDecoder(input);

  while (true) {
    if (this.offset >= input.length)
      // All the cases assume we have some input. Return and wait for more.
      return false;

    if (this.state == TlvStructureDecoder.READ_TYPE) {
      var firstOctet = input[this.offset];
      this.offset += 1;
      if (firstOctet < 253)
        // The value is simple, so we can skip straight to reading the length.
        this.state = TlvStructureDecoder.READ_LENGTH;
      else {
        // Set up to skip the type bytes.
        if (firstOctet == 253)
          this.nBytesToRead = 2;
        else if (firstOctet == 254)
          this.nBytesToRead = 4;
        else
          // value == 255.
          this.nBytesToRead = 8;

        this.state = TlvStructureDecoder.READ_TYPE_BYTES;
      }
    }
    else if (this.state == TlvStructureDecoder.READ_TYPE_BYTES) {
      var nRemainingBytes = input.length - this.offset;
      if (nRemainingBytes < this.nBytesToRead) {
        // Need more.
        this.offset += nRemainingBytes;
        this.nBytesToRead -= nRemainingBytes;
        return false;
      }

      // Got the type bytes. Move on to read the length.
      this.offset += this.nBytesToRead;
      this.state = TlvStructureDecoder.READ_LENGTH;
    }
    else if (this.state == TlvStructureDecoder.READ_LENGTH) {
      var firstOctet = input[this.offset];
      this.offset += 1;
      if (firstOctet < 253) {
        // The value is simple, so we can skip straight to reading
        //  the value bytes.
        this.nBytesToRead = firstOctet;
        if (this.nBytesToRead == 0) {
          // No value bytes to read. We're finished.
          this.gotElementEnd = true;
          return true;
        }

        this.state = TlvStructureDecoder.READ_VALUE_BYTES;
      }
      else {
        // We need to read the bytes in the extended encoding of
        //  the length.
        if (firstOctet == 253)
          this.nBytesToRead = 2;
        else if (firstOctet == 254)
          this.nBytesToRead = 4;
        else
          // value == 255.
          this.nBytesToRead = 8;

        // We need to use firstOctet in the next state.
        this.firstOctet = firstOctet;
        this.state = TlvStructureDecoder.READ_LENGTH_BYTES;
      }
    }
    else if (this.state == TlvStructureDecoder.READ_LENGTH_BYTES) {
      var nRemainingBytes = input.length - this.offset;
      if (!this.useHeaderBuffer && nRemainingBytes >= this.nBytesToRead) {
        // We don't have to use the headerBuffer. Set nBytesToRead.
        decoder.seek(this.offset);

        this.nBytesToRead = decoder.readExtendedVarNumber(this.firstOctet);
        // Update this.offset to the decoder's offset after reading.
        this.offset = decoder.getOffset();
      }
      else {
        this.useHeaderBuffer = true;

        var nNeededBytes = this.nBytesToRead - this.headerLength;
        if (nNeededBytes > nRemainingBytes) {
          // We can't get all of the header bytes from this input.
          // Save in headerBuffer.
          if (this.headerLength + nRemainingBytes > this.headerBuffer.length)
            // We don't expect this to happen.
            throw new Error
              ("Cannot store more header bytes than the size of headerBuffer");
          input.slice(this.offset, this.offset + nRemainingBytes).copy
            (this.headerBuffer, this.headerLength);
          this.offset += nRemainingBytes;
          this.headerLength += nRemainingBytes;

          return false;
        }

        // Copy the remaining bytes into headerBuffer, read the
        //   length and set nBytesToRead.
        if (this.headerLength + nNeededBytes > this.headerBuffer.length)
          // We don't expect this to happen.
          throw new Error
            ("Cannot store more header bytes than the size of headerBuffer");
        input.slice(this.offset, this.offset + nNeededBytes).copy
          (this.headerBuffer, this.headerLength);
        this.offset += nNeededBytes;

        // Use a local decoder just for the headerBuffer.
        var bufferDecoder = new TlvDecoder(this.headerBuffer);
        // Replace nBytesToRead with the length of the value.
        this.nBytesToRead = bufferDecoder.readExtendedVarNumber(this.firstOctet);
      }

      if (this.nBytesToRead == 0) {
        // No value bytes to read. We're finished.
        this.gotElementEnd = true;
        return true;
      }

      // Get ready to read the value bytes.
      this.state = TlvStructureDecoder.READ_VALUE_BYTES;
    }
    else if (this.state == TlvStructureDecoder.READ_VALUE_BYTES) {
      nRemainingBytes = input.length - this.offset;
      if (nRemainingBytes < this.nBytesToRead) {
        // Need more.
        this.offset += nRemainingBytes;
        this.nBytesToRead -= nRemainingBytes;
        return false;
      }

      // Got the bytes. We're finished.
      this.offset += this.nBytesToRead;
      this.gotElementEnd = true;
      return true;
    }
    else
      // We don't expect this to happen.
      throw new Error("findElementEnd: unrecognized state");
  }
};

/**
 * Get the current offset into the input buffer.
 * @returns {number} The offset.
 */
TlvStructureDecoder.prototype.getOffset = function()
{
  return this.offset;
};

/**
 * Set the offset into the input, used for the next read.
 * @param {number} offset The new offset.
 */
TlvStructureDecoder.prototype.seek = function(offset)
{
  this.offset = offset;
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var TlvEncoder = require('./tlv/tlv-encoder.js').TlvEncoder;
var TlvDecoder = require('./tlv/tlv-decoder.js').TlvDecoder;
var Blob = require('../util/blob.js').Blob;

/**
 * ProtobufTlv has static methods to encode and decode an Protobuf Message o
 * bject as NDN-TLV. The Protobuf tag value is used as the TLV type code. A
 * Protobuf message is encoded/decoded as a nested TLV encoding. Protobuf types
 * uint32, uint64 and enum are encoded/decoded as TLV nonNegativeInteger. (It is
 * an error if an enum value is negative.) Protobuf types bytes and string are
 * encoded/decoded as TLV bytes. The Protobuf type bool is encoded/decoded as a
 * TLV boolean (a zero length value for True, omitted for False). Other Protobuf
 * types are an error.
 *
 * Protobuf has no "outer" message type, so you need to put your TLV message
 * inside an outer "typeless" message.
 */
var ProtobufTlv = function ProtobufTlv()
{
};

exports.ProtobufTlv = ProtobufTlv;

// Load ProtoBuf.Reflect.Message.Field dynamically so that protobufjs is optional.
ProtobufTlv._Field = null;
ProtobufTlv.establishField = function()
{
  if (ProtobufTlv._Field === null) {
    try {
      // Using protobuf.min.js in the browser.
      ProtobufTlv._Field = dcodeIO.ProtoBuf.Reflect.Message.Field;
    }
    catch (ex) {
      // Using protobufjs in node.
      ProtobufTlv._Field = require("protobufjs").Reflect.Message.Field;
    }
  }
}

/**
 * Encode the Protobuf message object as NDN-TLV. This calls
 * message.encodeAB() to ensure that all required fields are present and
 * raises an exception if not. (This does not use the result of toArrayBuffer().)
 * @param {ProtoBuf.Builder.Message} message The Protobuf message object.
 * @param {ProtoBuf.Reflect.T} descriptor The reflection descriptor for the
 * message. For example, if the message is of type "MyNamespace.MyMessage" then
 * the descriptor is builder.lookup("MyNamespace.MyMessage").
 * @returns {Blob} The encoded buffer in a Blob object.
 */
ProtobufTlv.encode = function(message, descriptor)
{
  ProtobufTlv.establishField();

  message.encodeAB();
  var encoder = new TlvEncoder();
  ProtobufTlv._encodeMessageValue(message, descriptor, encoder);
  return new Blob(encoder.getOutput(), false);
};

/**
 * Decode the input as NDN-TLV and update the fields of the Protobuf message
 * object.
 * @param {ProtoBuf.Builder.Message} message The Protobuf message object. This
 * does not first clear the object.
 * @param {ProtoBuf.Reflect.T} descriptor The reflection descriptor for the
 * message. For example, if the message is of type "MyNamespace.MyMessage" then
 * the descriptor is builder.lookup("MyNamespace.MyMessage").
 * @param {Blob|Buffer} input The buffer with the bytes to decode.
 */
ProtobufTlv.decode = function(message, descriptor, input)
{
  ProtobufTlv.establishField();

  // If input is a blob, get its buf().
  var decodeBuffer = typeof input === 'object' && input instanceof Blob ?
                     input.buf() : input;

  var decoder = new TlvDecoder(decodeBuffer);
  ProtobufTlv._decodeMessageValue
    (message, descriptor, decoder, decodeBuffer.length);
};

ProtobufTlv._encodeMessageValue = function(message, descriptor, encoder)
{
  var fields = descriptor.getChildren(ProtobufTlv._Field);
  // Encode the fields backwards.
  for (var iField = fields.length - 1; iField >= 0; --iField) {
    var field = fields[iField];
    var tlvType = field.id;

    var values;
    if (field.repeated)
      values = message[field.name];
    else {
      if (message[field.name] != null)
        // Make a singleton list.
        values = [message[field.name]];
      else
        continue;
    }

    // Encode the values backwards.
    for (var iValue = values.length - 1; iValue >= 0; --iValue) {
      var value = values[iValue];

      if (field.type.name == "message") {
        var saveLength =  encoder.getLength();

        // Encode backwards.
        ProtobufTlv._encodeMessageValue(value, field.resolvedType, encoder);
        encoder.writeTypeAndLength(tlvType, encoder.getLength() - saveLength);
      }
      else if (field.type.name == "uint32" ||
               field.type.name == "uint64")
        encoder.writeNonNegativeIntegerTlv(tlvType, value);
      else if (field.type.name == "enum") {
        if (value < 0)
          throw new Error("ProtobufTlv::encode: ENUM value may not be negative");
        encoder.writeNonNegativeIntegerTlv(tlvType, value);
      }
      else if (field.type.name == "bytes") {
        var buffer = value.toBuffer();
        if (buffer.length == undefined)
          // We are not running in Node.js, so assume we are using the dcodeIO
          // browser implementation based on ArrayBuffer.
          buffer = new Uint8Array(value.toArrayBuffer());
        encoder.writeBlobTlv(tlvType, buffer);
      }
      else if (field.type.name == "string")
        // Use Blob to convert.
        encoder.writeBlobTlv(tlvType, new Blob(value, false).buf());
      else if (field.type.name == "bool") {
        if (value)
          encoder.writeTypeAndLength(tlvType, 0);
      }
      else
        throw new Error("ProtobufTlv::encode: Unknown field type");
    }
  }
};

ProtobufTlv._decodeMessageValue = function(message, descriptor, decoder, endOffset)
{
  var fields = descriptor.getChildren(ProtobufTlv._Field);
  for (var iField = 0; iField < fields.length; ++iField) {
    var field = fields[iField];
    var tlvType = field.id;

    if (!field.required && !decoder.peekType(tlvType, endOffset))
      continue;

    if (field.repeated) {
      while (decoder.peekType(tlvType, endOffset)) {
        if (field.type.name == "message") {
          var innerEndOffset = decoder.readNestedTlvsStart(tlvType);
          var value = new (field.resolvedType.build())();
          message.add(field.name, value);
          ProtobufTlv._decodeMessageValue
            (value, field.resolvedType, decoder, innerEndOffset);
          decoder.finishNestedTlvs(innerEndOffset);
        }
        else
          message.add
            (field.name,
             ProtobufTlv._decodeFieldValue(field, tlvType, decoder, endOffset));
      }
    }
    else {
      if (field.type.name == "message") {
        var innerEndOffset = decoder.readNestedTlvsStart(tlvType);
        var value = new (field.resolvedType.build())();
        message.set(field.name, value);
        ProtobufTlv._decodeMessageValue
          (value, field.resolvedType, decoder, innerEndOffset);
        decoder.finishNestedTlvs(innerEndOffset);
      }
      else
        message.set
          (field.name,
           ProtobufTlv._decodeFieldValue(field, tlvType, decoder, endOffset));
    }
  }
};

/**
 * This is a helper for _decodeMessageValue. Decode a single field and return
 * the value. Assume the field.type.name is not "message".
 */
ProtobufTlv._decodeFieldValue = function(field, tlvType, decoder, endOffset)
{
  if (field.type.name == "uint32" ||
      field.type.name == "uint64" ||
      field.type.name == "enum")
    return decoder.readNonNegativeIntegerTlv(tlvType);
  else if (field.type.name == "bytes")
    return decoder.readBlobTlv(tlvType);
  else if (field.type.name == "string")
    return decoder.readBlobTlv(tlvType).toString();
  else if (field.type.name == "bool")
    return decoder.readBooleanTlv(tlvType, endOffset);
  else
    throw new Error("ProtobufTlv.decode: Unknown field type");
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * @author: From code in ndn-cxx by Yingdi Yu <yingdi@cs.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var OID = function OID(oid)
{
  if (typeof oid === 'string') {
    var splitString = oid.split(".");
    this.oid = [];
    for (var i = 0; i < splitString.length; ++i)
      this.oid.push(parseInt(splitString[i]));
  }
  else
    // Assume oid is an array of int.  Make a copy.
    this.oid = oid.slice(0, oid.length);
};

exports.OID = OID;

OID.prototype.getIntegerList = function()
{
  return this.oid;
};

OID.prototype.setIntegerList = function(oid)
{
  // Make a copy.
  this.oid = oid.slice(0, oid.length);
};

OID.prototype.toString = function()
{
  var result = "";
  for (var i = 0; i < this.oid.length; ++i) {
    if (i !== 0)
      result += ".";
    result += this.oid[i];
  }

  return result;
};

OID.prototype.equals = function(other)
{
  if (!(other instanceof OID))
    return false;
  if (this.oid.length !== other.oid.length)
    return false;

  for (var i = 0; i < this.oid.length; ++i) {
    if (this.oid[i] != other.oid[i])
      return false;
  }
  return true;
};
/**
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * Create a WireFormat base class where the encode and decode methods throw an error. You should use a derived class like TlvWireFormat.
 * @constructor
 */
var WireFormat = function WireFormat() {
};

exports.WireFormat = WireFormat;

/**
 * Encode name and return the encoding.  Your derived class should override.
 * @param {Name} name The Name to encode.
 * @returns {Blob} A Blob containing the encoding.
 * @throws Error This always throws an "unimplemented" error. The derived class should override.
 */
WireFormat.prototype.encodeName = function(name)
{
  throw new Error("encodeName is unimplemented in the base WireFormat class.  You should use a derived class.");
};

/**
 * Decode input as a name and set the fields of the Name object.
 * Your derived class should override.
 * @param {Name} name The Name object whose fields are updated.
 * @param {Buffer} input The buffer with the bytes to decode.
 * @throws Error This always throws an "unimplemented" error. The derived class should override.
 */
WireFormat.prototype.decodeName = function(name, input)
{
  throw new Error("decodeName is unimplemented in the base WireFormat class.  You should use a derived class.");
};

/**
 * Encode interest and return the encoding.  Your derived class should override.
 * @param {Interest} interest The Interest to encode.
 * @returns {object} An associative array with fields
 * (encoding, signedPortionBeginOffset, signedPortionEndOffset) where encoding
 * is a Blob containing the encoding, signedPortionBeginOffset is the offset in
 * the encoding of the beginning of the signed portion, and
 * signedPortionEndOffset is the offset in the encoding of the end of the signed
 * portion. The signed portion starts from the first name component and ends
 * just before the final name component (which is assumed to be a signature for
 * a signed interest).
 * @throws Error This always throws an "unimplemented" error. The derived class should override.
 */
WireFormat.prototype.encodeInterest = function(interest)
{
  throw new Error("encodeInterest is unimplemented in the base WireFormat class.  You should use a derived class.");
};

/**
 * Decode input as an interest and set the fields of the interest object.
 * Your derived class should override.
 * @param {Interest} interest The Interest object whose fields are updated.
 * @param {Buffer} input The buffer with the bytes to decode.
 * @returns {object} An associative array with fields
 * (signedPortionBeginOffset, signedPortionEndOffset) where
 * signedPortionBeginOffset is the offset in the encoding of the beginning of
 * the signed portion, and signedPortionEndOffset is the offset in the encoding
 * of the end of the signed portion. The signed portion starts from the first
 * name component and ends just before the final name component (which is
 * assumed to be a signature for a signed interest).
 * @throws Error This always throws an "unimplemented" error. The derived class should override.
 */
WireFormat.prototype.decodeInterest = function(interest, input)
{
  throw new Error("decodeInterest is unimplemented in the base WireFormat class.  You should use a derived class.");
};

/**
 * Encode data and return the encoding and signed offsets. Your derived class
 * should override.
 * @param {Data} data The Data object to encode.
 * @returns {object} An associative array with fields
 * (encoding, signedPortionBeginOffset, signedPortionEndOffset) where encoding
 * is a Blob containing the encoding, signedPortionBeginOffset is the offset in
 * the encoding of the beginning of the signed portion, and
 * signedPortionEndOffset is the offset in the encoding of the end of the
 * signed portion.
 * @throws Error This always throws an "unimplemented" error. The derived class should override.
 */
WireFormat.prototype.encodeData = function(data)
{
  throw new Error("encodeData is unimplemented in the base WireFormat class.  You should use a derived class.");
};

/**
 * Decode input as a data packet, set the fields in the data object, and return
 * the signed offsets.  Your derived class should override.
 * @param {Data} data The Data object whose fields are updated.
 * @param {Buffer} input The buffer with the bytes to decode.
 * @returns {object} An associative array with fields
 * (signedPortionBeginOffset, signedPortionEndOffset) where
 * signedPortionBeginOffset is the offset in the encoding of the beginning of
 * the signed portion, and signedPortionEndOffset is the offset in the encoding
 * of the end of the signed portion.
 * @throws Error This always throws an "unimplemented" error. The derived class should override.
 */
WireFormat.prototype.decodeData = function(data, input)
{
  throw new Error("decodeData is unimplemented in the base WireFormat class.  You should use a derived class.");
};

/**
 * Encode controlParameters and return the encoding.  Your derived class should
 * override.
 * @param {ControlParameters} controlParameters The ControlParameters object to
 * encode.
 * @returns {Blob} A Blob containing the encoding.
 * @throws Error This always throws an "unimplemented" error. The derived class should override.
 */
WireFormat.prototype.encodeControlParameters = function(controlParameters)
{
  throw new Error("encodeControlParameters is unimplemented in the base WireFormat class.  You should use a derived class.");
};

/**
 * Decode input as a controlParameters and set the fields of the
 * controlParameters object. Your derived class should override.
 * @param {ControlParameters} controlParameters The ControlParameters object
 * whose fields are updated.
 * @param {Buffer} input The buffer with the bytes to decode.
 * @throws Error This always throws an "unimplemented" error. The derived class should override.
 */
WireFormat.prototype.decodeControlParameters = function(controlParameters, input)
{
  throw new Error("decodeControlParameters is unimplemented in the base WireFormat class.  You should use a derived class.");
};

/**
 * Encode signature as a SignatureInfo and return the encoding. Your derived
 * class should override.
 * @param {Signature} signature An object of a subclass of Signature to encode.
 * @returns {Blob} A Blob containing the encoding.
 * @throws Error This always throws an "unimplemented" error. The derived class should override.
 */
WireFormat.prototype.encodeSignatureInfo = function(signature)
{
  throw new Error("encodeSignatureInfo is unimplemented in the base WireFormat class.  You should use a derived class.");
};

/**
 * Decode signatureInfo as a signature info and signatureValue as the related
 * SignatureValue, and return a new object which is a subclass of Signature.
 * Your derived class should override.
 * @param {Buffer} signatureInfo The buffer with the signature info bytes to
 * decode.
 * @param {Buffer} signatureValue The buffer with the signature value to decode.
 * @returns {Signature} A new object which is a subclass of Signature.
 * @throws Error This always throws an "unimplemented" error. The derived class should override.
 */
WireFormat.prototype.decodeSignatureInfoAndValue = function
  (signatureInfo, signatureValue)
{
  throw new Error("decodeSignatureInfoAndValue is unimplemented in the base WireFormat class.  You should use a derived class.");
};

/**
 * Encode the signatureValue in the Signature object as a SignatureValue (the
 * signature bits) and return the encoding. Your derived class should override.
 * @param {Signature} signature An object of a subclass of Signature with the
 * signature value to encode.
 * @returns {Blob} A Blob containing the encoding.
 * @throws Error This always throws an "unimplemented" error. The derived class should override.
 */
WireFormat.prototype.encodeSignatureValue = function(signature)
{
  throw new Error("encodeSignatureValue is unimplemented in the base WireFormat class.  You should use a derived class.");
};

/**
 * Set the static default WireFormat used by default encoding and decoding
 * methods.
 * @param wireFormat {WireFormat} An object of a subclass of WireFormat.
 */
WireFormat.setDefaultWireFormat = function(wireFormat)
{
  WireFormat.defaultWireFormat = wireFormat;
};

/**
 * Return the default WireFormat used by default encoding and decoding methods
 * which was set with setDefaultWireFormat.
 * @returns {WireFormat} An object of a subclass of WireFormat.
 */
WireFormat.getDefaultWireFormat = function()
{
  return WireFormat.defaultWireFormat;
};

// Invoke TlvWireFormat to set the default format.
// Since tlv-wire-format.js includes this file, put this at the bottom
// to avoid problems with cycles of require.
var TlvWireFormat = require('./tlv-wire-format.js').TlvWireFormat;
/**
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var DataUtils = require('./data-utils.js').DataUtils;
var Tlv = require('./tlv/tlv.js').Tlv;
var TlvStructureDecoder = require('./tlv/tlv-structure-decoder.js').TlvStructureDecoder;
var DecodingException = require('./decoding-exception.js').DecodingException;
var NdnCommon = require('../util/ndn-common.js').NdnCommon;
var LOG = require('../log.js').Log.LOG;

/**
 * A ElementReader lets you call onReceivedData multiple times which uses a
 * TlvStructureDecoder to detect the end of a TLV element and calls 
 * elementListener.onReceivedElement(element) with the element.  This handles
 * the case where a single call to onReceivedData may contain multiple elements.
 * @constructor
 * @param {{onReceivedElement:function}} elementListener
 */
var ElementReader = function ElementReader(elementListener)
{
  this.elementListener = elementListener;
  this.dataParts = [];
  this.tlvStructureDecoder = new TlvStructureDecoder();
};

exports.ElementReader = ElementReader;

ElementReader.prototype.onReceivedData = function(/* Buffer */ data)
{
  // Process multiple objects in the data.
  while (true) {
    var gotElementEnd;
    var offset;

    try {
      if (this.dataParts.length == 0) {
        // This is the beginning of an element.
        if (data.length <= 0)
          // Wait for more data.
          return;
      }

      // Scan the input to check if a whole TLV object has been read.
      this.tlvStructureDecoder.seek(0);
      gotElementEnd = this.tlvStructureDecoder.findElementEnd(data);
      offset = this.tlvStructureDecoder.getOffset();
    } catch (ex) {
      // Reset to read a new element on the next call.
      this.dataParts = [];
      this.tlvStructureDecoder = new TlvStructureDecoder();

      throw ex;
    }

    if (gotElementEnd) {
      // Got the remainder of an object.  Report to the caller.
      this.dataParts.push(data.slice(0, offset));
      var element = DataUtils.concatArrays(this.dataParts);
      this.dataParts = [];

      // Reset to read a new object. Do this before calling onReceivedElement
      // in case it throws an exception.
      data = data.slice(offset, data.length);
      this.tlvStructureDecoder = new TlvStructureDecoder();

      this.elementListener.onReceivedElement(element);
      if (data.length == 0)
        // No more data in the packet.
        return;

      // else loop back to decode.
    }
    else {
      // Save a copy. We will call concatArrays later.
      var totalLength = data.length;
      for (var i = 0; i < this.dataParts.length; ++i)
        totalLength += this.dataParts[i].length;
      if (totalLength > NdnCommon.MAX_NDN_PACKET_SIZE) {
        // Reset to read a new element on the next call.
        this.dataParts = [];
        this.tlvStructureDecoder = new TlvStructureDecoder();

        throw new DecodingException(new Error
          ("The incoming packet exceeds the maximum limit Face.getMaxNdnPacketSize()"));
      }

      this.dataParts.push(new Buffer(data));
      if (LOG > 3) console.log('Incomplete packet received. Length ' + data.length + '. Wait for more input.');
        return;
    }
  }
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * Create a new DerDecodingException wrapping the given error object.
 * Call with: throw new DerDecodingException(new Error("message")).
 * @constructor
 * @param {Error} error The exception created with new Error.
 */
function DerDecodingException(error)
{
  if (error) {
    // Copy lineNumber, etc. from where new Error was called.
    for (var prop in error)
      this[prop] = error[prop];
    // Make sure these are copied.
    this.message = error.message;
    this.stack = error.stack;
  }
}
DerDecodingException.prototype = new Error();
DerDecodingException.prototype.name = "DerDecodingException";

exports.DerDecodingException = DerDecodingException;
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * Create a new DerEncodingException wrapping the given error object.
 * Call with: throw new DerEncodingException(new Error("message")).
 * @constructor
 * @param {Error} error The exception created with new Error.
 */
function DerEncodingException(error)
{
  if (error) {
    // Copy lineNumber, etc. from where new Error was called.
    for (var prop in error)
      this[prop] = error[prop];
    // Make sure these are copied.
    this.message = error.message;
    this.stack = error.stack;
  }
}
DerEncodingException.prototype = new Error();
DerEncodingException.prototype.name = "DerEncodingException";

exports.DerEncodingException = DerEncodingException;
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * @author: From PyNDN der.py by Adeola Bannis <thecodemaiden@gmail.com>.
 * @author: Originally from code in ndn-cxx by Yingdi Yu <yingdi@cs.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * The DerNodeType enum defines the known DER node types.
 */
var DerNodeType = function DerNodeType()
{
}

exports.DerNodeType = DerNodeType;

DerNodeType.Eoc = 0;
DerNodeType.Boolean = 1;
DerNodeType.Integer = 2;
DerNodeType.BitString = 3;
DerNodeType.OctetString = 4;
DerNodeType.Null = 5;
DerNodeType.ObjectIdentifier = 6;
DerNodeType.ObjectDescriptor = 7;
DerNodeType.External = 40;
DerNodeType.Real = 9;
DerNodeType.Enumerated = 10;
DerNodeType.EmbeddedPdv = 43;
DerNodeType.Utf8String = 12;
DerNodeType.RelativeOid = 13;
DerNodeType.Sequence = 48;
DerNodeType.Set = 49;
DerNodeType.NumericString = 18;
DerNodeType.PrintableString = 19;
DerNodeType.T61String = 20;
DerNodeType.VideoTexString = 21;
DerNodeType.Ia5String = 22;
DerNodeType.UtcTime = 23;
DerNodeType.GeneralizedTime = 24;
DerNodeType.GraphicString = 25;
DerNodeType.VisibleString = 26;
DerNodeType.GeneralString = 27;
DerNodeType.UniversalString = 28;
DerNodeType.CharacterString = 29;
DerNodeType.BmpString = 30;
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * @author: From PyNDN der_node.py by Adeola Bannis <thecodemaiden@gmail.com>.
 * @author: Originally from code in ndn-cxx by Yingdi Yu <yingdi@cs.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var DynamicBuffer = require('../../util/dynamic-buffer.js').DynamicBuffer;
var Blob = require('../../util/blob.js').Blob;
var DerDecodingException = require('./der-decoding-exception.js').DerDecodingException;
var DerEncodingException = require('./der-encoding-exception.js').DerEncodingException;
var DerNodeType = require('./der-node-type.js').DerNodeType;

/**
 * DerNode implements the DER node types used in encoding/decoding DER-formatted
 * data.
 *
 * Create a generic DER node with the given nodeType. This is a private
 * constructor used by one of the public DerNode subclasses defined below.
 * @param {number} nodeType One of the defined DER DerNodeType constants.
 */
var DerNode = function DerNode(nodeType)
{
  this.nodeType = nodeType;
  this.parent = null;
  this.header = new Buffer(0);
  this.payload = new DynamicBuffer(0);
  this.payloadPosition = 0;
};

exports.DerNode = DerNode;

/**
 * Return the number of bytes in DER
 * @returns {number}
 */
DerNode.prototype.getSize = function()
{
  return this.header.length + this.payloadPosition;
};

/**
 * Encode the given size and update the header.
 * @param {number} size
 */
DerNode.prototype.encodeHeader = function(size)
{
  var buffer = new DynamicBuffer(10);
  var bufferPosition = 0;
  buffer.array[bufferPosition++] = this.nodeType;
  if (size < 0)
    // We don't expect this to happen since this is an internal method and
    // always called with the non-negative size() of some buffer.
    throw new Error("encodeHeader: DER object has negative length");
  else if (size <= 127)
    buffer.array[bufferPosition++] = size & 0xff;
  else {
    var tempBuf = new DynamicBuffer(10);
    // We encode backwards from the back.

    var val = size;
    var n = 0;
    while (val != 0) {
      ++n;
      tempBuf.ensureLengthFromBack(n);
      tempBuf.array[tempBuf.array.length - n] = val & 0xff;
      val >>= 8;
    }
    var nTempBufBytes = n + 1;
    tempBuf.ensureLengthFromBack(nTempBufBytes);
    tempBuf.array[tempBuf.array.length - nTempBufBytes] = ((1<<7) | n) & 0xff;

    buffer.copy(tempBuf.slice(tempBuf.array.length - nTempBufBytes), bufferPosition);
    bufferPosition += nTempBufBytes;
  }

  this.header = buffer.slice(0, bufferPosition);
};

/**
 * Extract the header from an input buffer and return the size.
 * @param {Buffer} inputBuf The input buffer to read from.
 * @param {number} startIdx The offset into the buffer.
 * @returns {number} The parsed size in the header.
 */
DerNode.prototype.decodeHeader = function(inputBuf, startIdx)
{
  var idx = startIdx;

  var nodeType = inputBuf[idx] & 0xff;
  idx += 1;

  this.nodeType = nodeType;

  var sizeLen = inputBuf[idx] & 0xff;
  idx += 1;

  var header = new DynamicBuffer(10);
  var headerPosition = 0;
  header.array[headerPosition++] = nodeType;
  header.array[headerPosition++] = sizeLen;

  var size = sizeLen;
  var isLongFormat = (sizeLen & (1 << 7)) != 0;
  if (isLongFormat) {
    var lenCount = sizeLen & ((1<<7) - 1);
    size = 0;
    while (lenCount > 0) {
      var b = inputBuf[idx];
      idx += 1;
      header.ensureLength(headerPosition + 1);
      header.array[headerPosition++] = b;
      size = 256 * size + (b & 0xff);
      lenCount -= 1;
    }
  }

  this.header = header.slice(0, headerPosition);
  return size;
};

/**
 * Get the raw data encoding for this node.
 * @returns {Blob} The raw data encoding.
 */
DerNode.prototype.encode = function()
{
  var buffer = new Buffer(this.getSize());

  this.header.copy(buffer);
  this.payload.slice(0, this.payloadPosition).copy(buffer, this.header.length);

  return new Blob(buffer, false);
};

/**
 * Decode and store the data from an input buffer.
 * @param {Buffer} inputBuf The input buffer to read from. This reads from
 * startIdx (regardless of the buffer's position) and does not change the
 * position.
 * @param {number} startIdx The offset into the buffer.
 */
DerNode.prototype.decode = function(inputBuf, startIdx)
{
  var idx = startIdx;
  var payloadSize = this.decodeHeader(inputBuf, idx);
  var skipBytes = this.header.length;
  if (payloadSize > 0) {
    idx += skipBytes;
    this.payloadAppend(inputBuf.slice(idx, idx + payloadSize));
  }
};

/**
 * Copy buffer to this.payload at this.payloadPosition and update
 * this.payloadPosition.
 * @param {Buffer} buffer The buffer to copy.
 */
DerNode.prototype.payloadAppend = function(buffer)
{
  this.payloadPosition = this.payload.copy(buffer, this.payloadPosition);
}

/**
 * Parse the data from the input buffer recursively and return the root as an
 * object of a subclass of DerNode.
 * @param {type} inputBuf The input buffer to read from.
 * @param {type} startIdx (optional) The offset into the buffer. If omitted, use 0.
 * @returns {DerNode} An object of a subclass of DerNode.
 */
DerNode.parse = function(inputBuf, startIdx)
{
  if (startIdx == undefined)
    startIdx = 0;

  var nodeType = inputBuf[startIdx] & 0xff;
  // Don't increment idx. We're just peeking.

  var newNode;
  if (nodeType === DerNodeType.Boolean)
    newNode = new DerNode.DerBoolean();
  else if (nodeType === DerNodeType.Integer)
    newNode = new DerNode.DerInteger();
  else if (nodeType === DerNodeType.BitString)
    newNode = new DerNode.DerBitString();
  else if (nodeType === DerNodeType.OctetString)
    newNode = new DerNode.DerOctetString();
  else if (nodeType === DerNodeType.Null)
    newNode = new DerNode.DerNull();
  else if (nodeType === DerNodeType.ObjectIdentifier)
    newNode = new DerNode.DerOid();
  else if (nodeType === DerNodeType.Sequence)
    newNode = new DerNode.DerSequence();
  else if (nodeType === DerNodeType.PrintableString)
    newNode = new DerNode.DerPrintableString();
  else if (nodeType === DerNodeType.GeneralizedTime)
    newNode = new DerNode.DerGeneralizedTime();
  else
    throw new DerDecodingException(new Error("Unimplemented DER type " + nodeType));

  newNode.decode(inputBuf, startIdx);
  return newNode;
};

/**
 * Convert the encoded data to a standard representation. Overridden by some
 * subclasses (e.g. DerBoolean).
 * @returns {Blob} The encoded data as a Blob.
 */
DerNode.prototype.toVal = function()
{
  return this.encode();
};

/**
 * Get a copy of the payload bytes.
 * @return {Blob} A copy of the payload.
 */
DerNode.prototype.getPayload = function()
{
  return new Blob(this.payload.slice(0, this.payloadPosition), true);
};

/**
 * If this object is a DerNode.DerSequence, get the children of this node.
 * Otherwise, throw an exception. (DerSequence overrides to implement this
 * method.)
 * @returns {Array<DerNode>} The children as an array of DerNode.
 * @throws DerDecodingException if this object is not a DerSequence.
 */
DerNode.prototype.getChildren = function()
{
  throw new DerDecodingException(new Error
    ("getChildren: This DerNode is not DerSequence"));
};

/**
 * Check that index is in bounds for the children list, return children[index].
 * @param {Array<DerNode>} children The list of DerNode, usually returned by
 * another call to getChildren.
 * @param {number} index The index of the children.
 * @return {DerNode.DerSequence} children[index].
 * @throws DerDecodingException if index is out of bounds or if children[index]
 * is not a DerSequence.
 */
DerNode.getSequence = function(children, index)
{
  if (index < 0 || index >= children.length)
    throw new DerDecodingException(new Error
      ("getSequence: Child index is out of bounds"));

  if (!(children[index] instanceof DerNode.DerSequence))
    throw new DerDecodingException(new Error
      ("getSequence: Child DerNode is not a DerSequence"));

  return children[index];
};

/**
 * A DerStructure extends DerNode to hold other DerNodes.
 * Create a DerStructure with the given nodeType. This is a private
 * constructor. To create an object, use DerSequence.
 * @param {number} nodeType One of the defined DER DerNodeType constants.
 */
DerNode.DerStructure = function DerStructure(nodeType)
{
  // Call the base constructor.
  DerNode.call(this, nodeType);

  this.childChanged = false;
  this.nodeList = []; // Of DerNode.
  this.size = 0;
};
DerNode.DerStructure.prototype = new DerNode();
DerNode.DerStructure.prototype.name = "DerStructure";

/**
 * Get the total length of the encoding, including children.
 * @returns {number} The total (header + payload) length.
 */
DerNode.DerStructure.prototype.getSize = function()
{
  if (this.childChanged) {
    this.updateSize();
    this.childChanged = false;
  }

  this.encodeHeader(this.size);
  return this.size + this.header.length;
};

/**
 * Get the children of this node.
 * @returns {Array<DerNode>} The children as an array of DerNode.
 */
DerNode.DerStructure.prototype.getChildren = function()
{
  return this.nodeList;
};

DerNode.DerStructure.prototype.updateSize = function()
{
  var newSize = 0;

  for (var i = 0; i < this.nodeList.length; ++i) {
    var n = this.nodeList[i];
    newSize += n.getSize();
  }

  this.size = newSize;
  this.childChanged = false;
};

/**
 * Add a child to this node.
 * @param {DerNode} node The child node to add.
 * @param {boolean} (optional) notifyParent Set to true to cause any containing
 * nodes to update their size.  If omitted, use false.
 */
DerNode.DerStructure.prototype.addChild = function(node, notifyParent)
{
  node.parent = this;
  this.nodeList.push(node);

  if (notifyParent) {
    if (this.parent != null)
      this.parent.setChildChanged();
  }

  this.childChanged = true;
};

/**
 * Mark the child list as dirty, so that we update size when necessary.
 */
DerNode.DerStructure.prototype.setChildChanged = function()
{
  if (this.parent != null)
    this.parent.setChildChanged();
  this.childChanged = true;
};

/**
 * Override the base encode to return raw data encoding for this node and its
 * children.
 * @returns {Blob} The raw data encoding.
 */
DerNode.DerStructure.prototype.encode = function()
{
  var buffer = new DynamicBuffer(10);
  var bufferPosition = 0;
  this.updateSize();
  this.encodeHeader(this.size);
  bufferPosition = buffer.copy(this.header, bufferPosition);

  for (var i = 0; i < this.nodeList.length; ++i) {
    var n = this.nodeList[i];
    var encodedChild = n.encode();
    bufferPosition = buffer.copy(encodedChild.buf(), bufferPosition);
  }

  return new Blob(buffer.slice(0, bufferPosition), false);
};

/**
 * Override the base decode to decode and store the data from an input
 * buffer. Recursively populates child nodes.
 * @param {Buffer} inputBuf The input buffer to read from.
 * @param {number} startIdx The offset into the buffer.
 */
DerNode.DerStructure.prototype.decode = function(inputBuf, startIdx)
{
  var idx = startIdx;
  this.size = this.decodeHeader(inputBuf, idx);
  idx += this.header.length;

  var accSize = 0;
  while (accSize < this.size) {
    var node = DerNode.parse(inputBuf, idx);
    idx += node.getSize();
    accSize += node.getSize();
    this.addChild(node, false);
  }
};

////////
// Now for all the node types...
////////

/**
 * A DerByteString extends DerNode to handle byte strings.
 * Create a DerByteString with the given inputData and nodeType. This is a
 * private constructor used by one of the public subclasses such as
 * DerOctetString or DerPrintableString.
 * @param {Buffer} inputData An input buffer containing the string to encode.
 * @param {number} nodeType One of the defined DER DerNodeType constants.
 */
DerNode.DerByteString = function DerByteString(inputData, nodeType)
{
  // Call the base constructor.
  DerNode.call(this, nodeType);

  if (inputData != null) {
    this.payloadAppend(inputData);
    this.encodeHeader(inputData.length);
  }
};
DerNode.DerByteString.prototype = new DerNode();
DerNode.DerByteString.prototype.name = "DerByteString";

/**
 * Override to return just the byte string.
 * @returns {Blob} The byte string as a copy of the payload buffer.
 */
DerNode.DerByteString.prototype.toVal = function()
{
  return this.getPayload();
};

/**
 * DerBoolean extends DerNode to encode a boolean value.
 * Create a new DerBoolean for the value.
 * @param {boolean} value The value to encode.
 */
DerNode.DerBoolean = function DerBoolean(value)
{
  // Call the base constructor.
  DerNode.call(this, DerNodeType.Boolean);

  if (value != undefined) {
    var val = value ? 0xff : 0x00;
    this.payload.ensureLength(this.payloadPosition + 1);
    this.payload.array[this.payloadPosition++] = val;
    this.encodeHeader(1);
  }
};
DerNode.DerBoolean.prototype = new DerNode();
DerNode.DerBoolean.prototype.name = "DerBoolean";

DerNode.DerBoolean.prototype.toVal = function()
{
  var val = this.payload.array[0];
  return val != 0x00;
};

/**
 * DerInteger extends DerNode to encode an integer value.
 * Create a new DerInteger for the value.
 * @param {number} integer The value to encode.
 */
DerNode.DerInteger = function DerInteger(integer)
{
  // Call the base constructor.
  DerNode.call(this, DerNodeType.Integer);

  if (integer != undefined) {
    // JavaScript doesn't distinguish int from float, so round.
    integer = Math.round(integer);

    // Convert the integer to bytes the easy/slow way.
    var temp = new DynamicBuffer(10);
    // We encode backwards from the back.
    var length = 0;
    while (true) {
      ++length;
      temp.ensureLengthFromBack(length);
      temp.array[temp.array.length - length] = integer & 0xff;
      integer >>= 8;

      if (integer <= 0)
        // We check for 0 at the end so we encode one byte if it is 0.
        break;
    }

    this.payloadAppend(temp.slice(temp.array.length - length));
    this.encodeHeader(this.payloadPosition);
  }
};
DerNode.DerInteger.prototype = new DerNode();
DerNode.DerInteger.prototype.name = "DerInteger";

DerNode.DerInteger.prototype.toVal = function()
{
  var result = 0;
  for (var i = 0; i < this.payloadPosition; ++i) {
    result <<= 8;
    result += this.payload.array[i];
  }

  return result;
};

/**
 * A DerBitString extends DerNode to handle a bit string.
 * Create a DerBitString with the given padding and inputBuf.
 * @param {Buffer} inputBuf An input buffer containing the bit octets to encode.
 * @param {number} paddingLen The number of bits of padding at the end of the bit
 * string.  Should be less than 8.
 */
DerNode.DerBitString = function DerBitString(inputBuf, paddingLen)
{
  // Call the base constructor.
  DerNode.call(this, DerNodeType.BitString);

  if (inputBuf != undefined) {
    this.payload.ensureLength(this.payloadPosition + 1);
    this.payload.array[this.payloadPosition++] = paddingLen & 0xff;
    this.payloadAppend(inputBuf);
    this.encodeHeader(this.payloadPosition);
  }
};
DerNode.DerBitString.prototype = new DerNode();
DerNode.DerBitString.prototype.name = "DerBitString";

/**
 * DerOctetString extends DerByteString to encode a string of bytes.
 * Create a new DerOctetString for the inputData.
 * @param {Buffer} inputData An input buffer containing the string to encode.
 */
DerNode.DerOctetString = function DerOctetString(inputData)
{
  // Call the base constructor.
  DerNode.DerByteString.call(this, inputData, DerNodeType.OctetString);
};
DerNode.DerOctetString.prototype = new DerNode.DerByteString();
DerNode.DerOctetString.prototype.name = "DerOctetString";

/**
 * A DerNull extends DerNode to encode a null value.
 * Create a DerNull.
 */
DerNode.DerNull = function DerNull()
{
  // Call the base constructor.
  DerNode.call(this, DerNodeType.Null);
  this.encodeHeader(0);
};
DerNode.DerNull.prototype = new DerNode();
DerNode.DerNull.prototype.name = "DerNull";

/**
 * A DerOid extends DerNode to represent an object identifier.
 * Create a DerOid with the given object identifier. The object identifier
 * string must begin with 0,1, or 2 and must contain at least 2 digits.
 * @param {string|OID} oid The OID string or OID object to encode.
 */
DerNode.DerOid = function DerOid(oid)
{
  // Call the base constructor.
  DerNode.call(this, DerNodeType.ObjectIdentifier);

  if (oid != undefined) {
    if (typeof oid === 'string') {
      var splitString = oid.split(".");
      var parts = [];
      for (var i = 0; i < splitString.length; ++i)
        parts.push(parseInt(splitString[i]));

      this.prepareEncoding(parts);
    }
    else
      // Assume oid is of type OID.
      this.prepareEncoding(oid.getIntegerList());
  }
};
DerNode.DerOid.prototype = new DerNode();
DerNode.DerOid.prototype.name = "DerOid";

/**
 * Encode a sequence of integers into an OID object and set the payload.
 * @param {Array<number>} value The array of integers.
 */
DerNode.DerOid.prototype.prepareEncoding = function(value)
{
  var firstNumber;
  if (value.length == 0)
    throw new DerEncodingException(new Error("No integer in OID"));
  else {
    if (value[0] >= 0 && value[0] <= 2)
      firstNumber = value[0] * 40;
    else
      throw new DerEncodingException(new Error("First integer in OID is out of range"));
  }

  if (value.length >= 2) {
    if (value[1] >= 0 && value[1] <= 39)
      firstNumber += value[1];
    else
      throw new DerEncodingException(new Error("Second integer in OID is out of range"));
  }

  var encodedBuffer = new DynamicBuffer(10);
  var encodedBufferPosition = 0;
  encodedBufferPosition = encodedBuffer.copy
    (DerNode.DerOid.encode128(firstNumber), encodedBufferPosition);

  if (value.length > 2) {
    for (var i = 2; i < value.length; ++i)
      encodedBufferPosition = encodedBuffer.copy
        (DerNode.DerOid.encode128(value[i]), encodedBufferPosition);
  }

  this.encodeHeader(encodedBufferPosition);
  this.payloadAppend(encodedBuffer.slice(0, encodedBufferPosition));
};

/**
 * Compute the encoding for one part of an OID, where values greater than 128
 * must be encoded as multiple bytes.
 * @param {number} value A component of an OID.
 * @returns {Buffer} The encoded buffer.
 */
DerNode.DerOid.encode128 = function(value)
{
  var mask = (1 << 7) - 1;
  var outBytes = new DynamicBuffer(10);
  var outBytesLength = 0;
  // We encode backwards from the back.

  if (value < 128) {
    ++outBytesLength;
    outBytes.array[outBytes.array.length - outBytesLength] = value & mask;
  }
  else {
    ++outBytesLength;
    outBytes.array[outBytes.array.length - outBytesLength] = value & mask;
    value >>= 7;

    while (value != 0) {
      ++outBytesLength;
      outBytes.ensureLengthFromBack(outBytesLength);
      outBytes.array[outBytes.array.length - outBytesLength] =
        (value & mask) | (1 << 7);
      value >>= 7;
    }
  }

  return outBytes.slice(outBytes.array.length - outBytesLength);
};

/**
 * Convert an encoded component of the encoded OID to the original integer.
 * @param {number} offset The offset into this node's payload.
 * @param {Array<number>} skip Set skip[0] to the number of payload bytes to skip.
 * @returns {number} The original integer.
 */
DerNode.DerOid.prototype.decode128 = function(offset, skip)
{
  var flagMask = 0x80;
  var result = 0;
  var oldOffset = offset;

  while ((this.payload.array[offset] & flagMask) != 0) {
    result = 128 * result + (this.payload.array[offset] & 0xff) - 128;
    offset += 1;
  }

  result = result * 128 + (this.payload.array[offset] & 0xff);

  skip[0] = offset - oldOffset + 1;
  return result;
};

/**
 * Override to return the string representation of the OID.
 * @returns {string} The string representation of the OID.
 */
DerNode.DerOid.prototype.toVal = function()
{
  var offset = 0;
  var components = []; // of number.

  while (offset < this.payloadPosition) {
    var skip = [0];
    var nextVal = this.decode128(offset, skip);
    offset += skip[0];
    components.push(nextVal);
  }

  // For some odd reason, the first digits are represented in one byte.
  var firstByte = components[0];
  var firstDigit = Math.floor(firstByte / 40);
  var secondDigit = firstByte % 40;

  var result = firstDigit + "." + secondDigit;
  for (var i = 1; i < components.length; ++i)
    result += "." + components[i];

  return result;
};

/**
 * A DerSequence extends DerStructure to contains an ordered sequence of other
 * nodes.
 * Create a DerSequence.
 */
DerNode.DerSequence = function DerSequence()
{
  // Call the base constructor.
  DerNode.DerStructure.call(this, DerNodeType.Sequence);
};
DerNode.DerSequence.prototype = new DerNode.DerStructure();
DerNode.DerSequence.prototype.name = "DerSequence";

/**
 * A DerPrintableString extends DerByteString to handle a a printable string. No
 * escaping or other modification is done to the string.
 * Create a DerPrintableString with the given inputData.
 * @param {Buffer} inputData An input buffer containing the string to encode.
 */
DerNode.DerPrintableString = function DerPrintableString(inputData)
{
  // Call the base constructor.
  DerNode.DerByteString.call(this, inputData, DerNodeType.PrintableString);
};
DerNode.DerPrintableString.prototype = new DerNode.DerByteString();
DerNode.DerPrintableString.prototype.name = "DerPrintableString";

/**
 * A DerGeneralizedTime extends DerNode to represent a date and time, with
 * millisecond accuracy.
 * Create a DerGeneralizedTime with the given milliseconds since 1970.
 * @param {number} msSince1970 The timestamp as milliseconds since Jan 1, 1970.
 */
DerNode.DerGeneralizedTime = function DerGeneralizedTime(msSince1970)
{
  // Call the base constructor.
  DerNode.call(this, DerNodeType.GeneralizedTime);

  if (msSince1970 != undefined) {
    var derTime = DerNode.DerGeneralizedTime.toDerTimeString(msSince1970);
    // Use Blob to convert to a Buffer.
    this.payloadAppend(new Blob(derTime).buf());
    this.encodeHeader(this.payloadPosition);
  }
};
DerNode.DerGeneralizedTime.prototype = new DerNode();
DerNode.DerGeneralizedTime.prototype.name = "DerGeneralizedTime";

/**
 * Convert a UNIX timestamp to the internal string representation.
 * @param {type} msSince1970 Timestamp as milliseconds since Jan 1, 1970.
 * @returns {string} The string representation.
 */
DerNode.DerGeneralizedTime.toDerTimeString = function(msSince1970)
{
  var utcTime = new Date(Math.round(msSince1970));
  return utcTime.getUTCFullYear() +
         DerNode.DerGeneralizedTime.to2DigitString(utcTime.getUTCMonth() + 1) +
         DerNode.DerGeneralizedTime.to2DigitString(utcTime.getUTCDate()) +
         DerNode.DerGeneralizedTime.to2DigitString(utcTime.getUTCHours()) +
         DerNode.DerGeneralizedTime.to2DigitString(utcTime.getUTCMinutes()) +
         DerNode.DerGeneralizedTime.to2DigitString(utcTime.getUTCSeconds()) +
         "Z";
};

/**
 * A private method to zero pad an integer to 2 digits.
 * @param {number} x The number to pad.  Assume it is a non-negative integer.
 * @returns {string} The padded string.
 */
DerNode.DerGeneralizedTime.to2DigitString = function(x)
{
  var result = x.toString();
  return result.length === 1 ? "0" + result : result;
};

/**
 * Override to return the milliseconds since 1970.
 * @returns {number} The timestamp value as milliseconds since 1970.
 */
DerNode.DerGeneralizedTime.prototype.toVal = function()
{
  var timeStr = this.payload.slice(0, this.payloadPosition).toString();
  return Date.UTC
    (parseInt(timeStr.substr(0, 4)),
     parseInt(timeStr.substr(4, 2) - 1),
     parseInt(timeStr.substr(6, 2)),
     parseInt(timeStr.substr(8, 2)),
     parseInt(timeStr.substr(10, 2)),
     parseInt(timeStr.substr(12, 2)));
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From PyNDN boost_info_parser by Adeola Bannis.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var fs = require('fs');

/**
 * BoostInfoTree is provided for compatibility with the Boost INFO property list
 * format used in ndn-cxx.
 *
 * Each node in the tree may have a name and a value as well as associated
 * sub-trees. The sub-tree names are not unique, and so sub-trees are stored as
 * dictionaries where the key is a sub-tree name and the values are the
 * sub-trees sharing the same name.
 *
 * Nodes can be accessed with a path syntax, as long as nodes in the path do not
 * contain the path separator '/' in their names.
 */
var BoostInfoTree = function BoostInfoTree(value, parent)
{
  // subtrees is an array of {key: treeName, value: subtreeList} where
  // treeName is a string and subtreeList is an array of BoostInfoTree.
  // We can't use a dictionary because we want the keys to be in order.
  this.subtrees = [];
  this.value = value;
  this.parent = parent;

  this.lastChild = null;
};

/**
 * Insert a BoostInfoTree as a sub-tree with the given name.
 * @param {string} treeName The name of the new sub-tree.
 * @param {BoostInfoTree} newTree The sub-tree to add.
 */
BoostInfoTree.prototype.addSubtree = function(treeName, newTree)
{
  var subtreeList = this.find(treeName);
  if (subtreeList !== null)
    subtreeList.push(newTree);
  else
    this.subtrees.push({key: treeName, value: [newTree]});

  newTree.parent = this;
  this.lastChild = newTree;
};

/**
 * Create a new BoostInfo and insert it as a sub-tree with the given name.
 * @param {string} treeName The name of the new sub-tree.
 * @param {string} value The value associated with the new sub-tree.
 * @returns {BoostInfoTree} The created sub-tree.
 */
BoostInfoTree.prototype.createSubtree = function(treeName, value)
{
  var newTree = new BoostInfoTree(value, this);
  this.addSubtree(treeName, newTree);
  return newTree;
};

/**
 * Look up using the key and return a list of the subtrees.
 * @param {string} key The key which may be a path separated with '/'.
 * @returns {Array<BoostInfoTree>} A new array with pointers to the subtrees.
 */
BoostInfoTree.prototype.get = function(key)
{
  // Strip beginning '/'.
  key = key.replace(/^\/+/, "");
  if (key.length === 0)
    return [this];
  var path = key.split('/');

  var subtrees = this.find(path[0]);
  if (subtrees === null)
    return [];
  if (path.length == 1)
    return subtrees.slice(0);

  var newPath = path.slice(1).join('/');
  var foundVals = [];
  for (var i = 0; i < subtrees.length; ++i) {
    var t = subtrees[i];
    var partial = t.get(newPath);
    foundVals = foundVals.concat(partial);
  }
  return foundVals;
};

/**
 * Look up using the key and return string value of the first subtree.
 * @param {string} key The key which may be a path separated with '/'.
 * @returns {string} The string value or null if not found.
 */
BoostInfoTree.prototype.getFirstValue = function(key)
{
  var list = this.get(key);
  if (list.length >= 1)
    return list[0].value;
  else
    return null;
};

BoostInfoTree.prototype.getValue = function() { return this.value; };

BoostInfoTree.prototype.getParent = function() { return this.parent; };

BoostInfoTree.prototype.getLastChild = function() { return this.lastChild; };

BoostInfoTree.prototype.prettyPrint = function(indentLevel)
{
  indentLevel = indentLevel || 1;

  var prefix = Array(indentLevel + 1).join(' ');
  var s = "";

  if (this.parent != null) {
    if (this.value && this.value.length > 0)
      s += "\"" + this.value + "\"";
    s += "\n";
  }

  if (this.subtrees.length > 0) {
    if (this.parent)
      s += prefix + "{\n";
    var nextLevel = Array(indentLevel + 2 + 1).join(' ');
    for (var i = 0; i < this.subtrees.length; ++i) {
      for (var iSubTree = 0; iSubTree < this.subtrees[i].value.length; ++iSubTree)
        s += nextLevel + this.subtrees[i].key + " " +
             this.subtrees[i].value[iSubTree].prettyPrint(indentLevel + 2);
    }

    if (this.parent)
      s +=  prefix + "}\n";
  }

  return s;
};

BoostInfoTree.prototype.toString = function()
{
  return this.prettyPrint();
};

/**
 * Use treeName to find the array of BoostInfoTree in this.subtrees.
 * @param {string} treeName The key in this.subtrees to search for. This does a
 * flat search in subtrees_.  It does not split by '/' into a path.
 * @returns {Array<BoostInfoTree>} A array of BoostInfoTree, or null if not found.
 */
BoostInfoTree.prototype.find = function(treeName)
{
  for (var i = 0; i < this.subtrees.length; ++i) {
    if (this.subtrees[i].key == treeName)
      return this.subtrees[i].value;
  }

  return null;
};

/**
 * A BoostInfoParser reads files in Boost's INFO format and constructs a
 * BoostInfoTree.
 */
var BoostInfoParser = function BoostInfoParser()
{
  this.root = new BoostInfoTree();
};

exports.BoostInfoParser = BoostInfoParser;
exports.BoostInfoTree = BoostInfoTree; // debug

/**
 * Add the contents of the file or input string to the root BoostInfoTree. There
 * are two forms:
 * read(fileName) reads fileName from the file system.
 * read(input, inputName) reads from the input, in which case inputName is used
 * only for log messages, etc.
 * @param {string} fileName The path to the INFO file.
 * @param {string} input The contents of the INFO file, with lines separated by
 * "\n" or "\r\n".
 * @param {string} inputName Use with input for log messages, etc.
 */
BoostInfoParser.prototype.read = function(fileNameOrInput, inputName)
{
  var input;
  if (typeof inputName == 'string')
    input = fileNameOrInput;
  else {
    // No inputName, so assume the first arg is the file name.
    var fileName = fileNameOrInput;
    inputName = fileName;
    input = fs.readFileSync(fileName).toString();
  }

  var ctx = this.root;
  var thisParser = this;
  input.split(/\r?\n/).forEach(function(line) {
    ctx = thisParser.parseLine(line.trim(), ctx);
  });
};

/**
 * Write the root tree of this BoostInfoParser as file in Boost's INFO format.
 * @param {string} fileName The output path.
 */
BoostInfoParser.prototype.write = function(fileName)
{
  fs.writeFileSync(fileName, "" + this.root);
};

/**
 * Get the root tree of this parser.
 * @return {BoostInfoTree} The root BoostInfoTree.
 */
BoostInfoParser.prototype.getRoot = function() { return this.root; };

/**
 * Similar to Python's shlex.split, split s into an array of strings which are
 * separated by whitespace, treating a string within quotes as a single entity
 * regardless of whitespace between the quotes. Also allow a backslash to escape
 * the next character.
 * @param {string} s The input string to split.
 * @returns {Array<string>} An array of strings.
 */
BoostInfoParser.shlex_split = function(s)
{
  var result = [];
  if (s == "")
    return result;
  var whiteSpace = " \t\n\r";
  var iStart = 0;

  while (true) {
    // Move iStart past whitespace.
    while (whiteSpace.indexOf(s[iStart]) >= 0) {
      iStart += 1;
      if (iStart >= s.length)
        // Done.
        return result;
    }

    // Move iEnd to the end of the token.
    var iEnd = iStart;
    var inQuotation = false;
    var token = "";
    while (true) {
      if (s[iEnd] == '\\') {
        // Append characters up to the backslash, skip the backslash and
        //   move iEnd past the escaped character.
        token += s.substring(iStart, iEnd);
        iStart = iEnd + 1;
        iEnd = iStart;
        if (iEnd >= s.length)
          // An unusual case: A backslash at the end of the string.
          break;
      }
      else {
        if (inQuotation) {
          if (s[iEnd] == '\"') {
            // Append characters up to the end quote and skip.
            token += s.substring(iStart, iEnd);
            iStart = iEnd + 1;
            inQuotation = false;
          }
        }
        else {
          if (s[iEnd] == '\"') {
            // Append characters up to the start quote and skip.
            token += s.substring(iStart, iEnd);
            iStart = iEnd + 1;
            inQuotation = true;
          }
          else
            if (whiteSpace.indexOf(s[iEnd]) >= 0)
              break;
        }
      }

      iEnd += 1;
      if (iEnd >= s.length)
        break;
    }

    token += s.substring(iStart, iEnd);
    result.push(token);
    if (iEnd >= s.length)
      // Done.
      return result;

    iStart = iEnd;
  }
};

BoostInfoParser.prototype.parseLine = function(line, context)
{
  // Skip blank lines and comments.
  var commentStart = line.indexOf(';');
  if (commentStart >= 0)
    line = line.substring(0, commentStart).trim();
  if (line.length == 0)
    return context;

  // Usually we are expecting key and optional value.
  var strings = BoostInfoParser.shlex_split(line);
  var isSectionStart = false;
  var isSectionEnd = false;
  for (var i = 0; i < strings.length; ++i) {
    isSectionStart = (isSectionStart || strings[i] == "{");
    isSectionEnd = (isSectionEnd || strings[i] == "}");
  }

  if (!isSectionStart && !isSectionEnd) {
    var key = strings[0];
    var val;
    if (strings.length > 1)
      val = strings[1];
    context.createSubtree(key, val);

    return context;
  }

  // OK, who is the joker who put a { on the same line as the key name?!
  var sectionStart = line.indexOf('{');
  if (sectionStart > 0) {
    var firstPart = line.substring(0, sectionStart);
    var secondPart = line.substring(sectionStart);

    var ctx = this.parseLine(firstPart, context);
    return this.parseLine(secondPart, ctx);
  }

  // If we encounter a {, we are beginning a new context.
  // TODO: Error if there was already a subcontext here.
  if (line[0] == '{') {
    context = context.getLastChild();
    return context;
  }

  // If we encounter a }, we are ending a list context.
  if (line[0] == '}') {
    context = context.getParent();
    return context;
  }

  throw runtime_error("BoostInfoParser: input line is malformed");
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Name = require('../name.js').Name;
var LOG = require('../log.js').Log.LOG;

/**
 * A MemoryContentCache holds a set of Data packets and answers an Interest to
 * return the correct Data packet. The cache is periodically cleaned up to
 * remove each stale Data packet based on its FreshnessPeriod (if it has one).
 * @note This class is an experimental feature.  See the API docs for more detail at
 * http://named-data.net/doc/ndn-ccl-api/memory-content-cache.html .
 *
 * Create a new MemoryContentCache to use the given Face.
 *
 * @param {Face} face The Face to use to call registerPrefix and which will call
 * the OnInterest callback.
 * @param {number} cleanupIntervalMilliseconds (optional) The interval
 * in milliseconds between each check to clean up stale content in the cache. If
 * omitted, use a default of 1000 milliseconds. If this is a large number, then
 * effectively the stale content will not be removed from the cache.
 */
var MemoryContentCache = function MemoryContentCache
  (face, cleanupIntervalMilliseconds)
{
  cleanupIntervalMilliseconds = (cleanupIntervalMilliseconds || 1000.0);

  this.face = face;
  this.cleanupIntervalMilliseconds = cleanupIntervalMilliseconds;
  this.nextCleanupTime = new Date().getTime() + cleanupIntervalMilliseconds;

  this.onDataNotFoundForPrefix = {}; /**< The map key is the prefix.toUri().
                                          The value is an OnInterest function. */
  this.registeredPrefixIdList = []; /**< elements are number */
  this.noStaleTimeCache = []; /**< elements are MemoryContentCache.Content */
  this.staleTimeCache = [];   /**< elements are MemoryContentCache.StaleTimeContent */
  //StaleTimeContent::Compare contentCompare_;
  this.emptyComponent = new Name.Component();
  this.pendingInterestTable = [];

  var thisMemoryContentCache = this;
  this.storePendingInterestCallback = function
    (localPrefix, localInterest, localFace, localInterestFilterId, localFilter) {
       thisMemoryContentCache.storePendingInterest(localInterest, localFace);
    };
};

exports.MemoryContentCache = MemoryContentCache;

/**
 * Call registerPrefix on the Face given to the constructor so that this
 * MemoryContentCache will answer interests whose name has the prefix.
 * @param {Name} prefix The Name for the prefix to register. This copies the Name.
 * @param {function} onRegisterFailed If this fails to register the prefix for
 * any reason, this calls onRegisterFailed(prefix) where prefix is the prefix
 * given to registerPrefix.
 * @param {function} onDataNotFound (optional) If a data packet for an interest
 * is not found in the cache, this forwards the interest by calling
 * onDataNotFound(prefix, interest, face, interestFilterId, filter). Your
 * callback can find the Data packet for the interest and call
 * face.putData(data). If your callback cannot find the Data packet, it can
 * optionally call storePendingInterest(interest, face) to store the pending
 * interest in this object to be satisfied by a later call to add(data). If you
 * want to automatically store all pending interests, you can simply use
 * getStorePendingInterest() for onDataNotFound. If onDataNotFound is omitted or
 * null, this does not use it.
 * @param {ForwardingFlags} flags (optional) See Face.registerPrefix.
 * @param {WireFormat} wireFormat (optional) See Face.registerPrefix.
 */
MemoryContentCache.prototype.registerPrefix = function
  (prefix, onRegisterFailed, onDataNotFound, flags, wireFormat)
{
  if (onDataNotFound)
    this.onDataNotFoundForPrefix[prefix.toUri()] = onDataNotFound;
  var registeredPrefixId = this.face.registerPrefix
    (prefix, this.onInterest.bind(this), onRegisterFailed, flags, wireFormat);
  this.registeredPrefixIdList.push(registeredPrefixId);
};

/**
 * Call Face.removeRegisteredPrefix for all the prefixes given to the
 * registerPrefix method on this MemoryContentCache object so that it will not
 * receive interests any more. You can call this if you want to "shut down"
 * this MemoryContentCache while your application is still running.
 */
MemoryContentCache.prototype.unregisterAll = function()
{
  for (var i = 0; i < this.registeredPrefixIdList.length; ++i)
    this.face.removeRegisteredPrefix(this.registeredPrefixIdList[i]);
  this.registeredPrefixIdList = [];

  // Also clear each onDataNotFoundForPrefix given to registerPrefix.
  this.onDataNotFoundForPrefix = {};
};

/**
 * Add the Data packet to the cache so that it is available to use to answer
 * interests. If data.getMetaInfo().getFreshnessPeriod() is not null, set the
 * staleness time to now plus data.getMetaInfo().getFreshnessPeriod(), which is
 * checked during cleanup to remove stale content. This also checks if
 * cleanupIntervalMilliseconds milliseconds have passed and removes stale
 * content from the cache. After removing stale content, remove timed-out
 * pending interests from storePendingInterest(), then if the added Data packet
 * satisfies any interest, send it through the face and remove the interest
 * from the pending interest table.
 * @param {Data} data The Data packet object to put in the cache. This copies
 * the fields from the object.
 */
MemoryContentCache.prototype.add = function(data)
{
  this.doCleanup();

  if (data.getMetaInfo().getFreshnessPeriod() != null &&
      data.getMetaInfo().getFreshnessPeriod() >= 0.0) {
    // The content will go stale, so use staleTimeCache.
    var content = new MemoryContentCache.StaleTimeContent(data);
    // Insert into staleTimeCache, sorted on content.staleTimeMilliseconds.
    // Search from the back since we expect it to go there.
    var i = this.staleTimeCache.length - 1;
    while (i >= 0) {
      if (this.staleTimeCache[i].staleTimeMilliseconds <= content.staleTimeMilliseconds)
        break;
      --i;
    }
    // Element i is the greatest less than or equal to
    // content.staleTimeMilliseconds, so insert after it.
    this.staleTimeCache.splice(i + 1, 0, content);
  }
  else
    // The data does not go stale, so use noStaleTimeCache.
    this.noStaleTimeCache.push(new MemoryContentCache.Content(data));

  // Remove timed-out interests and check if the data packet matches any pending
  // interest.
  // Go backwards through the list so we can erase entries.
  var nowMilliseconds = new Date().getTime();
  for (var i = this.pendingInterestTable.length - 1; i >= 0; --i) {
    if (this.pendingInterestTable[i].isTimedOut(nowMilliseconds)) {
      this.pendingInterestTable.splice(i, 1);
      continue;
    }
    if (this.pendingInterestTable[i].getInterest().matchesName(data.getName())) {
      try {
        // Send to the same face from the original call to onInterest.
        // wireEncode returns the cached encoding if available.
        this.pendingInterestTable[i].getFace().send(data.wireEncode().buf());
      }
      catch (ex) {
        if (LOG > 0)
          console.log("" + ex);
        return;
      }

      // The pending interest is satisfied, so remove it.
      this.pendingInterestTable.splice(i, 1);
    }
  }
};

/**
 * Store an interest from an OnInterest callback in the internal pending
 * interest table (normally because there is no Data packet available yet to
 * satisfy the interest). add(data) will check if the added Data packet
 * satisfies any pending interest and send it through the face.
 * @param {Interest} interest The Interest for which we don't have a Data packet
 * yet. You should not modify the interest after calling this.
 * @param {Face} face The Face with the connection which received
 * the interest. This comes from the OnInterest callback.
 */
MemoryContentCache.prototype.storePendingInterest = function(interest, face)
{
  this.pendingInterestTable.push
    (new MemoryContentCache.PendingInterest(interest, face));
};

/**
 * Return a callback to use for onDataNotFound in registerPrefix which simply
 * calls storePendingInterest() to store the interest that doesn't match a
 * Data packet. add(data) will check if the added Data packet satisfies any
 * pending interest and send it.
 * @returns {function} A callback to use for onDataNotFound in registerPrefix().
 */
MemoryContentCache.prototype.getStorePendingInterest = function()
{
  return this.storePendingInterestCallback;
};

/**
 * This is the OnInterest callback which is called when the library receives
 * an interest whose name has the prefix given to registerPrefix. First check
 * if cleanupIntervalMilliseconds milliseconds have passed and remove stale
 * content from the cache. Then search the cache for the Data packet, matching
 * any interest selectors including ChildSelector, and send the Data packet
 * to the face. If no matching Data packet is in the cache, call
 * the callback in onDataNotFoundForPrefix (if defined).
 */
MemoryContentCache.prototype.onInterest = function
  (prefix, interest, face, interestFilterId, filter)
{
  this.doCleanup();

  var selectedComponent = 0;
  var selectedEncoding = null;
  // We need to iterate over both arrays.
  var totalSize = this.staleTimeCache.length + this.noStaleTimeCache.length;
  for (var i = 0; i < totalSize; ++i) {
    var content;
    if (i < this.staleTimeCache.length)
      content = this.staleTimeCache[i];
    else
      // We have iterated over the first array. Get from the second.
      content = this.noStaleTimeCache[i - this.staleTimeCache.length];

    if (interest.matchesName(content.getName())) {
      if (interest.getChildSelector() < 0) {
        // No child selector, so send the first match that we have found.
        face.send(content.getDataEncoding());
        return;
      }
      else {
        // Update selectedEncoding based on the child selector.
        var component;
        if (content.getName().size() > interest.getName().size())
          component = content.getName().get(interest.getName().size());
        else
          component = this.emptyComponent;

        var gotBetterMatch = false;
        if (selectedEncoding === null)
          // Save the first match.
          gotBetterMatch = true;
        else {
          if (interest.getChildSelector() == 0) {
            // Leftmost child.
            if (component.compare(selectedComponent) < 0)
              gotBetterMatch = true;
          }
          else {
            // Rightmost child.
            if (component.compare(selectedComponent) > 0)
              gotBetterMatch = true;
          }
        }

        if (gotBetterMatch) {
          selectedComponent = component;
          selectedEncoding = content.getDataEncoding();
        }
      }
    }
  }

  if (selectedEncoding !== null)
    // We found the leftmost or rightmost child.
    face.send(selectedEncoding);
  else {
    // Call the onDataNotFound callback (if defined).
    var onDataNotFound = this.onDataNotFoundForPrefix[prefix.toUri()];
    if (onDataNotFound)
      onDataNotFound(prefix, interest, face, interestFilterId, filter);
  }
};

/**
 * Check if now is greater than nextCleanupTime and, if so, remove stale
 * content from staleTimeCache and reset nextCleanupTime based on
 * cleanupIntervalMilliseconds. Since add(Data) does a sorted insert into
 * staleTimeCache, the check for stale data is quick and does not require
 * searching the entire staleTimeCache.
 */
MemoryContentCache.prototype.doCleanup = function()
{
  var now = new Date().getTime();
  if (now >= this.nextCleanupTime) {
    // staleTimeCache is sorted on staleTimeMilliseconds, so we only need to
    // erase the stale entries at the front, then quit.
    while (this.staleTimeCache.length > 0 && this.staleTimeCache[0].isStale(now))
      this.staleTimeCache.shift();

    this.nextCleanupTime = now + this.cleanupIntervalMilliseconds;
  }
};

/**
 * Content is a private class to hold the name and encoding for each entry
 * in the cache. This base class is for a Data packet without a FreshnessPeriod.
 *
 * Create a new Content entry to hold data's name and wire encoding.
 * @param {Data} data The Data packet whose name and wire encoding are copied.
 */
MemoryContentCache.Content = function MemoryContentCacheContent(data)
{
  // Allow an undefined data so that StaleTimeContent can set the prototype.
  if (data) {
    // Copy the name.
    this.name = new Name(data.getName());
    // wireEncode returns the cached encoding if available.
    this.dataEncoding = data.wireEncode().buf();
  }
};

MemoryContentCache.Content.prototype.getName = function() { return this.name; };

MemoryContentCache.Content.prototype.getDataEncoding = function() { return this.dataEncoding; };

/**
 * StaleTimeContent extends Content to include the staleTimeMilliseconds for
 * when this entry should be cleaned up from the cache.
 *
 * Create a new StaleTimeContent to hold data's name and wire encoding as well
 * as the staleTimeMilliseconds which is now plus
 * data.getMetaInfo().getFreshnessPeriod().
 * @param {Data} data The Data packet whose name and wire encoding are copied.
 */
MemoryContentCache.StaleTimeContent = function MemoryContentCacheStaleTimeContent
  (data)
{
  // Call the base constructor.
  MemoryContentCache.Content.call(this, data);

  // Set up staleTimeMilliseconds which is The time when the content becomse
  // stale in milliseconds according to new Date().getTime().
  this.staleTimeMilliseconds = new Date().getTime() +
    data.getMetaInfo().getFreshnessPeriod();
};

MemoryContentCache.StaleTimeContent.prototype = new MemoryContentCache.Content();
MemoryContentCache.StaleTimeContent.prototype.name = "StaleTimeContent";

/**
 * Check if this content is stale.
 * @param {number} nowMilliseconds The current time in milliseconds from
 * new Date().getTime().
 * @returns {boolean} True if this content is stale, otherwise false.
 */
MemoryContentCache.StaleTimeContent.prototype.isStale = function(nowMilliseconds)
{
  return this.staleTimeMilliseconds <= nowMilliseconds;
};

/**
 * A PendingInterest holds an interest which onInterest received but could
 * not satisfy. When we add a new data packet to the cache, we will also check
 * if it satisfies a pending interest.
 */
MemoryContentCache.PendingInterest = function MemoryContentCachePendingInterest
  (interest, face)
{
  this.interest = interest;
  this.face = face;

  if (this.interest.getInterestLifetimeMilliseconds() >= 0.0)
    this.timeoutMilliseconds = (new Date()).getTime() +
      this.interest.getInterestLifetimeMilliseconds();
  else
    this.timeoutMilliseconds = -1.0;
};

/**
 * Return the interest given to the constructor.
 */
MemoryContentCache.PendingInterest.prototype.getInterest = function()
{
  return this.interest;
};

/**
 * Return the face given to the constructor.
 */
MemoryContentCache.PendingInterest.prototype.getFace = function()
{
  return this.face;
};

/**
 * Check if this interest is timed out.
 * @param {number} nowMilliseconds The current time in milliseconds from
 * new Date().getTime().
 * @returns {boolean} True if this interest timed out, otherwise false.
 */
MemoryContentCache.PendingInterest.prototype.isTimedOut = function(nowMilliseconds)
{
  return this.timeoutTimeMilliseconds >= 0.0 &&
         nowMilliseconds >= this.timeoutTimeMilliseconds;
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From PyNDN ndn_regex.py by Adeola Bannis.
 * Originally from Yingdi Yu <http://irl.cs.ucla.edu/~yingdi/>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Name = require('../name.js').Name;

/**
 * An NdnRegexMatcher has static methods to convert an NDN regex
 * (http://redmine.named-data.net/projects/ndn-cxx/wiki/Regex) to a JavaScript
 * RegExp that can match against URIs.
 */
var NdnRegexMatcher = function NdnRegexMatcher()
{
};

exports.NdnRegexMatcher = NdnRegexMatcher;

/**
 * Determine if the provided NDN regex matches the given Name.
 * @param {string} pattern The NDN regex.
 * @param {Name} name The Name to match against the regex.
 * @returns {Object} The match object from String.match, or null if the pattern
 * does not match.
 */
NdnRegexMatcher.match = function(pattern, name)
{
  var nameUri = name.toUri();

  pattern = NdnRegexMatcher.sanitizeSets(pattern);

  pattern = pattern.replace(/<>/g, "(?:<.+?>)");
  pattern = pattern.replace(/>/g, "");
  pattern = pattern.replace(/<(?!!)/g, "/");

  return nameUri.match(new RegExp(pattern));
};

NdnRegexMatcher.sanitizeSets = function(pattern)
{
  var newPattern = pattern;

  // Positive sets can be changed to (comp1|comp2).
  // Negative sets must be changed to negative lookahead assertions.

  var regex1 = /\[(\^?)(.*?)\]/g;
  var match;
  while ((match = regex1.exec(pattern)) !== null) {
    // Insert | between components.
    // Match 2 is the last match, so we use the hack of working backwards from
    //   lastIndex.  If possible, this should be changed to a more direct solution.
    var start = regex1.lastIndex - "]".length - match[2].length;
    var end = start + match[2].length;
    if (start - end === 0)
      continue;
    var oldStr = match[2];
    var newStr = oldStr.replace(/></g, ">|<");
    newPattern = newPattern.substr(0, start) + newStr + newPattern.substr(end);
  }

  // Replace [] with (),  or (?! ) for negative lookahead.
  // If we use negative lookahead, we also have to consume one component.
  var isNegative = newPattern.indexOf("[^") >= 0;
  if (isNegative) {
    newPattern = newPattern.replace(/\[\^/g, "(?:(?!");
    newPattern = newPattern.replace(/\]/g, ")(?:/.*)*)");
  }
  else {
    newPattern = newPattern.replace(/\[/g, "(");
    newPattern = newPattern.replace(/\]/g, ")");
  }

  return newPattern;
};
/**
 * Copyright (C) 2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * @author: From ndn-cxx util/segment-fetcher https://github.com/named-data/ndn-cxx
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Interest = require('../interest.js').Interest;
var Blob = require('./blob.js').Blob;

/**
 * SegmentFetcher is a utility class to fetch the latest version of segmented data.
 *
 * SegmentFetcher assumes that the data is named /<prefix>/<version>/<segment>,
 * where:
 * - <prefix> is the specified name prefix,
 * - <version> is an unknown version that needs to be discovered, and
 * - <segment> is a segment number. (The number of segments is unknown and is
 *   controlled by the `FinalBlockId` field in at least the last Data packet.
 *
 * The following logic is implemented in SegmentFetcher:
 *
 * 1. Express the first Interest to discover the version:
 *
 *    >> Interest: /<prefix>?ChildSelector=1&MustBeFresh=true
 *
 * 2. Infer the latest version of the Data: <version> = Data.getName().get(-2)
 *
 * 3. If the segment number in the retrieved packet == 0, go to step 5.
 *
 * 4. Send an Interest for segment 0:
 *
 *    >> Interest: /<prefix>/<version>/<segment=0>
 *
 * 5. Keep sending Interests for the next segment while the retrieved Data does
 *    not have a FinalBlockId or the FinalBlockId != Data.getName().get(-1).
 *
 *    >> Interest: /<prefix>/<version>/<segment=(N+1))>
 *
 * 6. Call the onComplete callback with a Blob that concatenates the content
 *    from all the segmented objects.
 *
 * If an error occurs during the fetching process, the onError callback is called
 * with a proper error code.  The following errors are possible:
 *
 * - `INTEREST_TIMEOUT`: if any of the Interests times out
 * - `DATA_HAS_NO_SEGMENT`: if any of the retrieved Data packets don't have a segment
 *   as the last component of the name (not counting the implicit digest)
 * - `SEGMENT_VERIFICATION_FAILED`: if any retrieved segment fails
 *   the user-provided VerifySegment callback
 * - `IO_ERROR`: for I/O errors when sending an Interest.
 *
 * In order to validate individual segments, a verifySegment callback needs to
 * be specified. If the callback returns false, the fetching process is aborted
 * with SEGMENT_VERIFICATION_FAILED. If data validation is not required, the
 * provided DontVerifySegment object can be used.
 *
 * Example:
 *     var onComplete = function(content) { ... }
 *
 *     var onError = function(errorCode, message) { ... }
 *
 *     var interest = new Interest(new Name("/data/prefix"));
 *     interest.setInterestLifetimeMilliseconds(1000);
 *
 *     SegmentFetcher.fetch
 *       (face, interest, SegmentFetcher.DontVerifySegment, onComplete, onError);
 *
 * This is a private constructor to create a new SegmentFetcher to use the Face.
 * An application should use SegmentFetcher.fetch.
 * @param {Face} face This calls face.expressInterest to fetch more segments.
 * @param {function} verifySegment When a Data packet is received this calls
 * verifySegment(data) where data is a Data object. If it returns False then
 * abort fetching and call onError with
 * SegmentFetcher.ErrorCode.SEGMENT_VERIFICATION_FAILED.
 * @param {function} onComplete When all segments are received, call
 * onComplete(content) where content is a Blob which has the concatenation of
 * the content of all the segments.
 * @param {function} onError Call onError.onError(errorCode, message) for
 * timeout or an error processing segments. errorCode is a value from
 * SegmentFetcher.ErrorCode and message is a related string.
 * @constructor
 */
var SegmentFetcher = function SegmentFetcher
  (face, verifySegment, onComplete, onError)
{
  this.face = face;
  this.verifySegment = verifySegment;
  this.onComplete = onComplete;
  this.onError = onError;

  this.contentParts = []; // of Buffer
};

exports.SegmentFetcher = SegmentFetcher;

/**
 * An ErrorCode value is passed in the onError callback.
 */
SegmentFetcher.ErrorCode = {
  INTEREST_TIMEOUT: 1,
  DATA_HAS_NO_SEGMENT: 2,
  SEGMENT_VERIFICATION_FAILED: 3
};

/**
 * DontVerifySegment may be used in fetch to skip validation of Data packets.
 */
SegmentFetcher.DontVerifySegment = function(data)
{
  return true;
};

/**
 * Initiate segment fetching. For more details, see the documentation for the
 * class.
 * @param {Face} face This calls face.expressInterest to fetch more segments.
 * @param {Interest} baseInterest An Interest for the initial segment of the
 * requested data, where baseInterest.getName() has the name prefix. This
 * interest may include a custom InterestLifetime and selectors that will
 * propagate to all subsequent Interests. The only exception is that the initial
 * Interest will be forced to include selectors "ChildSelector=1" and
 * "MustBeFresh=true" which will be turned off in subsequent Interests.
 * @param {function} verifySegment When a Data packet is received this calls
 * verifySegment(data) where data is a Data object. If it returns False then
 * abort fetching and call onError with
 * SegmentFetcher.ErrorCode.SEGMENT_VERIFICATION_FAILED. If data validation is
 * not required, use SegmentFetcher.DontVerifySegment.
 * @param {function} onComplete When all segments are received, call
 * onComplete(content) where content is a Blob which has the concatenation of
 * the content of all the segments.
 * @param {function} onError Call onError.onError(errorCode, message) for
 * timeout or an error processing segments. errorCode is a value from
 * SegmentFetcher.ErrorCode and message is a related string.
 */
SegmentFetcher.fetch = function
  (face, baseInterest, verifySegment, onComplete, onError)
{
  new SegmentFetcher(face, verifySegment, onComplete, onError).fetchFirstSegment
    (baseInterest);
};

SegmentFetcher.prototype.fetchFirstSegment = function(baseInterest)
{
  var interest = new Interest(baseInterest);
  interest.setChildSelector(1);
  interest.setMustBeFresh(true);
  var thisSegmentFetcher = this;
  this.face.expressInterest
    (interest,
     function(originalInterest, data)
       { thisSegmentFetcher.onData(originalInterest, data); },
     function(interest) { thisSegmentFetcher.onTimeout(interest); });
};

SegmentFetcher.prototype.fetchNextSegment = function
  (originalInterest, dataName, segment)
{
  // Start with the original Interest to preserve any special selectors.
  var interest = new Interest(originalInterest);
  // Changing a field clears the nonce so that the library will generate a new
  // one.
  interest.setMustBeFresh(false);
  interest.setName(dataName.getPrefix(-1).appendSegment(segment));
  var thisSegmentFetcher = this;
  this.face.expressInterest
    (interest, function(originalInterest, data)
       { thisSegmentFetcher.onData(originalInterest, data); },
     function(interest) { thisSegmentFetcher.onTimeout(interest); });
};

SegmentFetcher.prototype.onData = function(originalInterest, data)
{
  if (!this.verifySegment(data)) {
    this.onError
      (SegmentFetcher.ErrorCode.SEGMENT_VERIFICATION_FAILED,
       "Segment verification failed");
    return;
  }

  if (!SegmentFetcher.endsWithSegmentNumber(data.getName()))
    // We don't expect a name without a segment number.  Treat it as a bad packet.
    this.onError
      (SegmentFetcher.ErrorCode.DATA_HAS_NO_SEGMENT,
       "Got an unexpected packet without a segment number: " +
        data.getName().toUri());
  else {
    var currentSegment = 0;
    try {
      currentSegment = data.getName().get(-1).toSegment();
    }
    catch (ex) {
      this.onError(
        SegmentFetcher.ErrorCode.DATA_HAS_NO_SEGMENT,
         "Error decoding the name segment number " +
         data.getName().get(-1).toEscapedString() + ": " + ex);
      return;
    }

    var expectedSegmentNumber = this.contentParts.length;
    if (currentSegment != expectedSegmentNumber)
      // Try again to get the expected segment.  This also includes the case
      // where the first segment is not segment 0.
      this.fetchNextSegment
        (originalInterest, data.getName(), expectedSegmentNumber);
    else {
      // Save the content and check if we are finished.
      this.contentParts.push(data.getContent().buf());

      if (data.getMetaInfo().getFinalBlockId().getValue().size() > 0) {
        var finalSegmentNumber = 0;
        try {
          finalSegmentNumber = (data.getMetaInfo().getFinalBlockId().toSegment());
        }
        catch (ex) {
          this.onError
            (SegmentFetcher.ErrorCode.DATA_HAS_NO_SEGMENT,
             "Error decoding the FinalBlockId segment number " +
             data.getMetaInfo().getFinalBlockId().toEscapedString() +
             ": " + ex);
          return;
        }

        if (currentSegment == finalSegmentNumber) {
          // We are finished.

          // Concatenate to get content.
          var content = Buffer.concat(this.contentParts);
          this.onComplete(new Blob(content, false));
          return;
        }
      }

      // Fetch the next segment.
      this.fetchNextSegment
        (originalInterest, data.getName(), expectedSegmentNumber + 1);
    }
  }
};

SegmentFetcher.prototype.onTimeout = function(interest)
{
  this.onError
    (SegmentFetcher.ErrorCode.INTEREST_TIMEOUT,
     "Time out for interest " + interest.getName().toUri());
};

/**
 * Check if the last component in the name is a segment number.
 * @param {Name} name The name to check.
 * @returns {boolean} True if the name ends with a segment number, otherwise false.
 */
SegmentFetcher.endsWithSegmentNumber = function(name)
{
  return name.size() >= 1 &&
         name.get(-1).getValue().size() >= 1 &&
         name.get(-1).getValue().buf()[0] == 0;
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * Transport is a base class for specific transport classes such as TcpTransport.
 */
var Transport = function Transport()
{
};

exports.Transport = Transport;

/**
 * Transport.ConnectionInfo is a base class for connection information used by
 * subclasses of Transport.
 */
Transport.ConnectionInfo = function TransportConnectionInfo()
{
};

/**
 * Determine whether this transport connecting according to connectionInfo is to
 * a node on the current machine. This affects the processing of
 * Face.registerPrefix(): if the NFD is local, registration occurs with the
 * '/localhost/nfd...' prefix; if non-local, the library will attempt to use
 * remote prefix registration using '/localhop/nfd...'
 * @param {Transport.ConnectionInfo} connectionInfo A ConnectionInfo with the
 * host to check.
 * @param {function} onResult On success, this calls onResult(isLocal) where
 * isLocal is true if the host is local, false if not. We use callbacks because
 * this may need to do an asynchronous DNS lookup.
 * @param {function} onError On failure for DNS lookup or other error, this
 * calls onError(message) where message is an error string.
 */
Transport.prototype.isLocal = function(connectionInfo, onResult, onError)
{
  onError("Transport.isLocal is not implemented");
};
/**
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Wentao Shang
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var ElementReader = require('../encoding/element-reader.js').ElementReader;
var LOG = require('../log.js').Log.LOG;
var Transport = require('./transport.js').Transport;
var Face;

/**
 * @constructor
 */
var WebSocketTransport = function WebSocketTransport()
{
  // Call the base constructor.
  Transport.call(this);

  if (!WebSocket)
    throw new Error("WebSocket support is not available on this platform.");

  this.ws = null;
  this.connectionInfo = null; // Read by Face.
  this.elementReader = null;
  this.defaultGetConnectionInfo = Face.makeShuffledHostGetConnectionInfo
    (["A.ws.ndn.ucla.edu", "B.ws.ndn.ucla.edu", "C.ws.ndn.ucla.edu", "D.ws.ndn.ucla.edu",
      "E.ws.ndn.ucla.edu", "F.ws.ndn.ucla.edu", "G.ws.ndn.ucla.edu", "H.ws.ndn.ucla.edu",
      "I.ws.ndn.ucla.edu", "J.ws.ndn.ucla.edu", "K.ws.ndn.ucla.edu", "L.ws.ndn.ucla.edu",
      "M.ws.ndn.ucla.edu", "N.ws.ndn.ucla.edu"],
     9696,
     function(host, port) { return new WebSocketTransport.ConnectionInfo(host, port); });
};

WebSocketTransport.prototype = new Transport();
WebSocketTransport.prototype.name = "WebSocketTransport";

WebSocketTransport.importFace = function(face){
  Face = face;
};

exports.WebSocketTransport = WebSocketTransport;

/**
 * Create a new WebSocketTransport.ConnectionInfo which extends
 * Transport.ConnectionInfo to hold the host and port info for the WebSocket
 * connection.
 * @param {string} host The host for the connection.
 * @param {number} port (optional) The port number for the connection. If
 * omitted, use 9696.
 */
WebSocketTransport.ConnectionInfo = function WebSocketTransportConnectionInfo
  (host, port)
{
  // Call the base constructor.
  Transport.ConnectionInfo .call(this);

  port = (port !== undefined ? port : 9696);

  this.host = host;
  this.port = port;
};

WebSocketTransport.ConnectionInfo.prototype = new Transport.ConnectionInfo();
WebSocketTransport.ConnectionInfo.prototype.name = "WebSocketTransport.ConnectionInfo";

/**
 * Check if the fields of this WebSocketTransport.ConnectionInfo equal the other
 * WebSocketTransport.ConnectionInfo.
 * @param {WebSocketTransport.ConnectionInfo} The other object to check.
 * @returns {boolean} True if the objects have equal fields, false if not.
 */
WebSocketTransport.ConnectionInfo.prototype.equals = function(other)
{
  if (other == null || other.host == undefined || other.port == undefined)
    return false;
  return this.host == other.host && this.port == other.port;
};

WebSocketTransport.ConnectionInfo.prototype.toString = function()
{
  return "{ host: " + this.host + ", port: " + this.port + " }";
};

/**
 * Determine whether this transport connecting according to connectionInfo is to
 * a node on the current machine. WebSocket transports are always non-local.
 * @param {WebSocketTransport.ConnectionInfo} connectionInfo This is ignored.
 * @param {function} onResult This calls onResult(false) because WebSocket
 * transports are always non-local.
 * @param {function} onError This is ignored.
 */
WebSocketTransport.prototype.isLocal = function(connectionInfo, onResult, onError)
{
  onResult(false);
};

/**
 * Connect to a WebSocket according to the info in connectionInfo. Listen on
 * the port to read an entire packet element and call
 * elementListener.onReceivedElement(element). Note: this connect method
 * previously took a Face object which is deprecated and renamed as the method
 * connectByFace.
 * @param {WebSocketTransport.ConnectionInfo} connectionInfo A
 * WebSocketTransport.ConnectionInfo with the host and port.
 * @param {object} elementListener The elementListener with function
 * onReceivedElement which must remain valid during the life of this object.
 * @param {function} onopenCallback Once connected, call onopenCallback().
 * @param {type} onclosedCallback If the connection is closed by the remote host,
 * call onclosedCallback().
 * @returns {undefined}
 */
WebSocketTransport.prototype.connect = function
  (connectionInfo, elementListener, onopenCallback, onclosedCallback)
{
  this.close();

  this.ws = new WebSocket('ws://' + connectionInfo.host + ':' + connectionInfo.port);
  if (LOG > 0) console.log('ws connection created.');
    this.connectionInfo = connectionInfo;

  this.ws.binaryType = "arraybuffer";

  this.elementReader = new ElementReader(elementListener);
  var self = this;
  this.ws.onmessage = function(ev) {
    var result = ev.data;
    //console.log('RecvHandle called.');

    if (result == null || result == undefined || result == "") {
      console.log('INVALID ANSWER');
    }
    else if (result instanceof ArrayBuffer) {
      // The Buffer constructor expects an instantiated array.
      var bytearray = new Buffer(new Uint8Array(result));

      if (LOG > 3) console.log('BINARY RESPONSE IS ' + bytearray.toString('hex'));

      try {
        // Find the end of the element and call onReceivedElement.
        self.elementReader.onReceivedData(bytearray);
      } catch (ex) {
        console.log("NDN.ws.onmessage exception: " + ex);
        return;
      }
    }
  }

  this.ws.onopen = function(ev) {
    if (LOG > 3) console.log(ev);
    if (LOG > 3) console.log('ws.onopen: WebSocket connection opened.');
    if (LOG > 3) console.log('ws.onopen: ReadyState: ' + this.readyState);
    // Face.registerPrefix will fetch the ndndid when needed.

    onopenCallback();
  }

  this.ws.onerror = function(ev) {
    console.log('ws.onerror: ReadyState: ' + this.readyState);
    console.log(ev);
    console.log('ws.onerror: WebSocket error: ' + ev.data);
  }

  this.ws.onclose = function(ev) {
    console.log('ws.onclose: WebSocket connection closed.');
    self.ws = null;

    onclosedCallback();
  }
};

/**
 * @deprecated This is deprecated. You should not call Transport.connect
 * directly, since it is called by Face methods.
 */
WebSocketTransport.prototype.connectByFace = function(face, onopenCallback)
{
  this.connect
    (face.connectionInfo, face, onopenCallback,
     function() { face.closeByTransport(); });
};

/**
 * Send the Uint8Array data.
 */
WebSocketTransport.prototype.send = function(data)
{
  if (this.ws != null) {
    // If we directly use data.buffer to feed ws.send(),
    // WebSocket may end up sending a packet with 10000 bytes of data.
    // That is, WebSocket will flush the entire buffer
    // regardless of the offset of the Uint8Array. So we have to create
    // a new Uint8Array buffer with just the right size and copy the
    // content from binaryInterest to the new buffer.
    //    ---Wentao
    var bytearray = new Uint8Array(data.length);
    bytearray.set(data);
    this.ws.send(bytearray.buffer);
    if (LOG > 3) console.log('ws.send() returned.');
  }
  else
    console.log('WebSocket connection is not established.');
};

/**
 * Close the connection.
 */
WebSocketTransport.prototype.close = function()
{
  if (this.ws != null)
    delete this.ws;
}

/**
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

// The Face constructor uses TcpTransport by default which is not available in the browser, so override to WebSocketTransport.
exports.TcpTransport = require("./transport/web-socket-transport").WebSocketTransport;
/**
 * This class represents a Name as an array of components where each is a byte array.
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Meki Cheraoui, Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Blob = require('./util/blob.js').Blob;
var DataUtils = require('./encoding/data-utils.js').DataUtils;
var LOG = require('./log.js').Log.LOG;

/**
 * Create a new Name from components.
 *
 * @constructor
 * @param {string|Name|Array<string|Array<number>|ArrayBuffer|Buffer|Name>} components if a string, parse it as a URI.  If a Name, add a deep copy of its components.
 * Otherwise it is an array of components which are appended according to Name.append, so
 * convert each and store it as an array of Buffer.  If a component is a string, encode as utf8.
 */
var Name = function Name(components)
{
  if (typeof components == 'string') {
    if (LOG > 3) console.log('Content Name String ' + components);
    this.components = Name.createNameArray(components);
  }
  else if (typeof components === 'object') {
    this.components = [];
    if (components instanceof Name)
      this.append(components);
    else {
      for (var i = 0; i < components.length; ++i)
        this.append(components[i]);
    }
  }
  else if (components == null)
    this.components = [];
  else
    if (LOG > 1) console.log("NO CONTENT NAME GIVEN");

  this.changeCount = 0;
};

exports.Name = Name;

/**
 *
 * @constructor
 * Create a new Name.Component with a copy of the given value.
 * @param {Name.Component|String|Array<number>|ArrayBuffer|Buffer} value If the value is a string, encode it as utf8 (but don't unescape).
 */
Name.Component = function NameComponent(value)
{
  if (typeof value === 'string')
    this.value = DataUtils.stringToUtf8Array(value);
  else if (typeof value === 'object' && value instanceof Name.Component)
    this.value = new Buffer(value.value);
  else if (typeof value === 'object' && value instanceof Blob) {
    if (value.isNull())
      this.value = new Buffer(0);
    else
      this.value = new Buffer(value.buf());
  }
  else if (Buffer.isBuffer(value))
    this.value = new Buffer(value);
  else if (typeof value === 'object' && typeof ArrayBuffer !== 'undefined' &&  value instanceof ArrayBuffer)
    // Make a copy.  Turn the value into a Uint8Array since the Buffer
    //   constructor doesn't take an ArrayBuffer.
    this.value = new Buffer(new Uint8Array(value));
  else if (!value)
    this.value = new Buffer(0);
  else if (typeof value === 'object')
    // Assume value is a byte array.  We can't check instanceof Array because
    //   this doesn't work in JavaScript if the array comes from a different module.
    this.value = new Buffer(value);
  else
    throw new Error("Name.Component constructor: Invalid type");
}

/**
 * Get the component value.
 * @returns {Blob} The component value.
 */
Name.Component.prototype.getValue = function()
{
  // For temporary backwards compatibility, leave this.value as a Buffer but return a Blob.
  return new Blob(this.value, false);
}

/**
 * @deprecated Use getValue. This method returns a Buffer which is the former
 * behavior of getValue, and should only be used while updating your code.
 */
Name.Component.prototype.getValueAsBuffer = function()
{
  return this.value;
};

/**
 * Convert this component value to a string by escaping characters according to the NDN URI Scheme.
 * This also adds "..." to a value with zero or more ".".
 * @returns {string} The escaped string.
 */
Name.Component.prototype.toEscapedString = function()
{
  return Name.toEscapedString(this.value);
};

/**
 * Interpret this name component as a network-ordered number and return an integer.
 * @returns {number} The integer number.
 */
Name.Component.prototype.toNumber = function()
{
  return DataUtils.bigEndianToUnsignedInt(this.value);
};

/**
 * Interpret this name component as a network-ordered number with a marker and
 * return an integer.
 * @param {number} marker The required first byte of the component.
 * @returns {number} The integer number.
 * @throws Error If the first byte of the component does not equal the marker.
 */
Name.Component.prototype.toNumberWithMarker = function(marker)
{
  if (this.value.length == 0 || this.value[0] != marker)
    throw new Error("Name component does not begin with the expected marker");

  return DataUtils.bigEndianToUnsignedInt(this.value.slice(1));
};

/**
 * Interpret this name component as a segment number according to NDN naming
 * conventions for "Segment number" (marker 0x00).
 * http://named-data.net/doc/tech-memos/naming-conventions.pdf
 * @returns {number} The integer segment number.
 * @throws Error If the first byte of the component is not the expected marker.
 */
Name.Component.prototype.toSegment = function()
{
  return this.toNumberWithMarker(0x00);
};

/**
 * Interpret this name component as a segment byte offset according to NDN
 * naming conventions for segment "Byte offset" (marker 0xFB).
 * http://named-data.net/doc/tech-memos/naming-conventions.pdf
 * @returns The integer segment byte offset.
 * @throws Error If the first byte of the component is not the expected marker.
 */
Name.Component.prototype.toSegmentOffset = function()
{
  return this.toNumberWithMarker(0xFB);
};

/**
 * Interpret this name component as a version number  according to NDN naming
 * conventions for "Versioning" (marker 0xFD). Note that this returns
 * the exact number from the component without converting it to a time
 * representation.
 * @returns {number} The integer version number.
 * @throws Error If the first byte of the component is not the expected marker.
 */
Name.Component.prototype.toVersion = function()
{
  return this.toNumberWithMarker(0xFD);
};

/**
 * Interpret this name component as a timestamp  according to NDN naming
 * conventions for "Timestamp" (marker 0xFC).
 * http://named-data.net/doc/tech-memos/naming-conventions.pdf
 * @returns The number of microseconds since the UNIX epoch (Thursday,
 * 1 January 1970) not counting leap seconds.
 * @throws Error If the first byte of the component is not the expected marker.
 */
Name.Component.prototype.toTimestamp = function()
{
  return this.toNumberWithMarker(0xFC);
};

/**
 * Interpret this name component as a sequence number according to NDN naming
 * conventions for "Sequencing" (marker 0xFE).
 * http://named-data.net/doc/tech-memos/naming-conventions.pdf
 * @returns The integer sequence number.
 * @throws Error If the first byte of the component is not the expected marker.
 */
Name.Component.prototype.toSequenceNumber = function()
{
  return this.toNumberWithMarker(0xFE);
};

/**
 * Create a component whose value is the nonNegativeInteger encoding of the
 * number.
 * @param {number} number
 * @returns {Name.Component}
 */
Name.Component.fromNumber = function(number)
{
  var encoder = new TlvEncoder(8);
  encoder.writeNonNegativeInteger(number);
  return new Name.Component(new Blob(encoder.getOutput(), false));
};

/**
 * Create a component whose value is the marker appended with the
 * nonNegativeInteger encoding of the number.
 * @param {number} number
 * @param {number} marker
 * @returns {Name.Component}
 */
Name.Component.fromNumberWithMarker = function(number, marker)
{
  var encoder = new TlvEncoder(9);
  // Encode backwards.
  encoder.writeNonNegativeInteger(number);
  encoder.writeNonNegativeInteger(marker);
  return new Name.Component(new Blob(encoder.getOutput(), false));
};

/**
 * Check if this is the same component as other.
 * @param {Name.Component} other The other Component to compare with.
 * @returns {Boolean} true if the components are equal, otherwise false.
 */
Name.Component.prototype.equals = function(other)
{
  return DataUtils.arraysEqual(this.value, other.value);
};

/**
 * Compare this to the other Component using NDN canonical ordering.
 * @param {Name.Component} other The other Component to compare with.
 * @returns {number} 0 if they compare equal, -1 if this comes before other in
 * the canonical ordering, or 1 if this comes after other in the canonical
 * ordering.
 *
 * @see http://named-data.net/doc/0.2/technical/CanonicalOrder.html
 */
Name.Component.prototype.compare = function(other)
{
  return Name.Component.compareBuffers(this.value, other.value);
};

/**
 * Do the work of Name.Component.compare to compare the component buffers.
 * @param {Buffer} component1
 * @param {Buffer} component2
 * @returns {number} 0 if they compare equal, -1 if component1 comes before
 * component2 in the canonical ordering, or 1 if component1 comes after
 * component2 in the canonical ordering.
 */
Name.Component.compareBuffers = function(component1, component2)
{
  if (component1.length < component2.length)
    return -1;
  if (component1.length > component2.length)
    return 1;

  for (var i = 0; i < component1.length; ++i) {
    if (component1[i] < component2[i])
      return -1;
    if (component1[i] > component2[i])
      return 1;
  }

  return 0;
};

/**
 * @deprecated Use toUri.
 */
Name.prototype.getName = function()
{
  return this.toUri();
};

/** Parse uri as a URI and return an array of Buffer components.
 */
Name.createNameArray = function(uri)
{
  uri = uri.trim();
  if (uri.length <= 0)
    return [];

  var iColon = uri.indexOf(':');
  if (iColon >= 0) {
    // Make sure the colon came before a '/'.
    var iFirstSlash = uri.indexOf('/');
    if (iFirstSlash < 0 || iColon < iFirstSlash)
      // Omit the leading protocol such as ndn:
      uri = uri.substr(iColon + 1, uri.length - iColon - 1).trim();
  }

  if (uri[0] == '/') {
    if (uri.length >= 2 && uri[1] == '/') {
      // Strip the authority following "//".
      var iAfterAuthority = uri.indexOf('/', 2);
      if (iAfterAuthority < 0)
        // Unusual case: there was only an authority.
        return [];
      else
        uri = uri.substr(iAfterAuthority + 1, uri.length - iAfterAuthority - 1).trim();
    }
    else
      uri = uri.substr(1, uri.length - 1).trim();
  }

  var array = uri.split('/');

  // Unescape the components.
  for (var i = 0; i < array.length; ++i) {
    var value = Name.fromEscapedString(array[i]);

    if (value.isNull()) {
      // Ignore the illegal componenent.  This also gets rid of a trailing '/'.
      array.splice(i, 1);
      --i;
      continue;
    }
    else
      array[i] = new Name.Component(value);
  }

  return array;
};

/**
 * Parse the uri according to the NDN URI Scheme and set the name with the
 * components.
 * @param {string} uri The URI string.
 */
Name.prototype.set = function(uri)
{
  this.components = Name.createNameArray(uri);
  ++this.changeCount;
};

/**
 * Convert the component to a Buffer and append to this Name.
 * Return this Name object to allow chaining calls to add.
 * @param {Name.Component|String|Array<number>|ArrayBuffer|Buffer|Name} component If a component is a string, encode as utf8 (but don't unescape).
 * @returns {Name}
 */
Name.prototype.append = function(component)
{
  if (typeof component == 'object' && component instanceof Name) {
    var components;
    if (component == this)
      // special case, when we need to create a copy
      components = this.components.slice(0, this.components.length);
    else
      components = component.components;

    for (var i = 0; i < components.length; ++i)
      this.components.push(new Name.Component(components[i]));
  }
  else
    // Just use the Name.Component constructor.
    this.components.push(new Name.Component(component));

  ++this.changeCount;
  return this;
};

/**
 * @deprecated Use append.
 */
Name.prototype.add = function(component)
{
  return this.append(component);
};

/**
 * Clear all the components.
 */
Name.prototype.clear = function()
{
  this.components = [];
  ++this.changeCount;
};

/**
 * Return the escaped name string according to NDN URI Scheme.
 * @param {boolean} includeScheme (optional) If true, include the "ndn:" scheme
 * in the URI, e.g. "ndn:/example/name". If false, just return the path, e.g.
 * "/example/name". If ommitted, then just return the path which is the default
 * case where toUri() is used for display.
 * @returns {String}
 */
Name.prototype.toUri = function(includeScheme)
{
  if (this.size() == 0)
    return includeScheme ? "ndn:/" : "/";

  var result = includeScheme ? "ndn:" : "";

  for (var i = 0; i < this.size(); ++i)
    result += "/"+ Name.toEscapedString(this.components[i].getValue().buf());

  return result;
};

/**
 * @deprecated Use toUri.
 */
Name.prototype.to_uri = function()
{
  return this.toUri();
};

/**
 * Append a component with the encoded segment number according to NDN
 * naming conventions for "Segment number" (marker 0x00).
 * http://named-data.net/doc/tech-memos/naming-conventions.pdf
 * @param {number} segment The segment number.
 * @returns {Name} This name so that you can chain calls to append.
 */
Name.prototype.appendSegment = function(segment)
{
  return this.append(Name.Component.fromNumberWithMarker(segment, 0x00));
};

/**
 * Append a component with the encoded segment byte offset according to NDN
 * naming conventions for segment "Byte offset" (marker 0xFB).
 * http://named-data.net/doc/tech-memos/naming-conventions.pdf
 * @param segmentOffset The segment byte offset.
 * @returns This name so that you can chain calls to append.
 */
Name.prototype.appendSegmentOffset = function(segmentOffset)
{
  return this.append(Name.Component.fromNumberWithMarker(segmentOffset, 0xFB));
};

/**
 * Append a component with the encoded version number according to NDN
 * naming conventions for "Versioning" (marker 0xFD).
 * http://named-data.net/doc/tech-memos/naming-conventions.pdf
 * Note that this encodes the exact value of version without converting from a time representation.
 * @param {number} version The version number.
 * @returns {Name} This name so that you can chain calls to append.
 */
Name.prototype.appendVersion = function(version)
{
  return this.append(Name.Component.fromNumberWithMarker(version, 0xFD));
};

/**
 * Append a component with the encoded timestamp according to NDN naming
 * conventions for "Timestamp" (marker 0xFC).
 * http://named-data.net/doc/tech-memos/naming-conventions.pdf
 * @param timestamp The number of microseconds since the UNIX epoch (Thursday,
 * 1 January 1970) not counting leap seconds.
 * @returns This name so that you can chain calls to append.
 */
Name.prototype.appendTimestamp = function(timestamp)
{
  return this.append(Name.Component.fromNumberWithMarker(timestamp, 0xFC));
};

/**
 * Append a component with the encoded sequence number according to NDN naming
 * conventions for "Sequencing" (marker 0xFE).
 * http://named-data.net/doc/tech-memos/naming-conventions.pdf
 * @param sequenceNumber The sequence number.
 * @returns This name so that you can chain calls to append.
 */
Name.prototype.appendSequenceNumber = function(sequenceNumber)
{
  return this.append(Name.Component.fromNumberWithMarker(sequenceNumber, 0xFE));
};

/**
 * @deprecated Use appendSegment.
 */
Name.prototype.addSegment = function(number)
{
  return this.appendSegment(number);
};

/**
 * Get a new name, constructed as a subset of components.
 * @param {number} iStartComponent The index if the first component to get. If
 * iStartComponent is -N then return return components starting from
 * name.size() - N.
 * @param {number} (optional) nComponents The number of components starting at iStartComponent.  If omitted,
 * return components starting at iStartComponent until the end of the name.
 * @returns {Name} A new name.
 */
Name.prototype.getSubName = function(iStartComponent, nComponents)
{
  if (iStartComponent < 0)
    iStartComponent = this.components.length - (-iStartComponent);

  if (nComponents == undefined)
    nComponents = this.components.length - iStartComponent;

  var result = new Name();

  var iEnd = iStartComponent + nComponents;
  for (var i = iStartComponent; i < iEnd && i < this.components.length; ++i)
    result.components.push(this.components[i]);

  return result;
};

/**
 * Return a new Name with the first nComponents components of this Name.
 * @param {number} nComponents The number of prefix components.  If nComponents is -N then return the prefix up
 * to name.size() - N. For example getPrefix(-1) returns the name without the final component.
 * @returns {Name} A new name.
 */
Name.prototype.getPrefix = function(nComponents)
{
  if (nComponents < 0)
    return this.getSubName(0, this.components.length + nComponents);
  else
    return this.getSubName(0, nComponents);
};

/**
 * @deprecated Use getPrefix(-nComponents).
 */
Name.prototype.cut = function(nComponents)
{
  return new Name(this.components.slice(0, this.components.length - nComponents));
};

/**
 * Return the number of name components.
 * @returns {number}
 */
Name.prototype.size = function()
{
  return this.components.length;
};

/**
 * Get a Name Component by index number.
 * @param {Number} i The index of the component, starting from 0.  However, if i is negative, return the component
 * at size() - (-i).
 * @returns {Name.Component}
 */
Name.prototype.get = function(i)
{
  if (i >= 0) {
    if (i >= this.components.length)
      throw new Error("Name.get: Index is out of bounds");

    return new Name.Component(this.components[i]);
  }
  else {
    // Negative index.
    if (i < -this.components.length)
      throw new Error("Name.get: Index is out of bounds");

    return new Name.Component(this.components[this.components.length - (-i)]);
  }
};

/**
 * @deprecated Use size().
 */
Name.prototype.getComponentCount = function()
{
  return this.components.length;
};

/**
 * @deprecated To get just the component value array, use get(i).getValue().buf().
 */
Name.prototype.getComponent = function(i)
{
  return new Buffer(this.components[i].getValue().buf());
};

/**
 * The "file name" in a name is the last component that isn't blank and doesn't start with one of the
 *   special marker octets (for version, etc.).  Return the index in this.components of
 *   the file name, or -1 if not found.
 */
Name.prototype.indexOfFileName = function()
{
  for (var i = this.size() - 1; i >= 0; --i) {
    var component = this.components[i].getValue().buf();
    if (component.length <= 0)
      continue;

    if (component[0] == 0 || component[0] == 0xC0 || component[0] == 0xC1 ||
        (component[0] >= 0xF5 && component[0] <= 0xFF))
      continue;

    return i;
  }

  return -1;
};

/**
 * Encode this Name for a particular wire format.
 * @param {WireFormat} wireFormat (optional) A WireFormat object  used to encode
 * this object. If omitted, use WireFormat.getDefaultWireFormat().
 * @returns {Blob} The encoded buffer in a Blob object.
 */
Name.prototype.wireEncode = function(wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());
  return wireFormat.encodeName(this);
};

/**
 * Decode the input using a particular wire format and update this Name.
 * @param {Blob|Buffer} input The buffer with the bytes to decode.
 * @param {WireFormat} wireFormat (optional) A WireFormat object used to decode
 * this object. If omitted, use WireFormat.getDefaultWireFormat().
 */
Name.prototype.wireDecode = function(input, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());
  // If input is a blob, get its buf().
  var decodeBuffer = typeof input === 'object' && input instanceof Blob ?
                     input.buf() : input;
  wireFormat.decodeName(this, decodeBuffer);
};

/**
 * Compare this to the other Name using NDN canonical ordering.  If the first
 * components of each name are not equal, this returns -1 if the first comes
 * before the second using the NDN canonical ordering for name components, or 1
 * if it comes after. If they are equal, this compares the second components of
 * each name, etc.  If both names are the same up to the size of the shorter
 * name, this returns -1 if the first name is shorter than the second or 1 if it
 * is longer. For example, std::sort gives: /a/b/d /a/b/cc /c /c/a /bb .  This
 * is intuitive because all names with the prefix /a are next to each other.
 * But it may be also be counter-intuitive because /c comes before /bb according
 * to NDN canonical ordering since it is shorter.
 * @param {Name} other The other Name to compare with.
 * @returns {boolean} If they compare equal, -1 if *this comes before other in
 * the canonical ordering, or 1 if *this comes after other in the canonical
 * ordering.
 *
 * @see http://named-data.net/doc/0.2/technical/CanonicalOrder.html
 */
Name.prototype.compare = function(other)
{
  for (var i = 0; i < this.size() && i < other.size(); ++i) {
    var comparison = this.components[i].compare(other.components[i]);
    if (comparison == 0)
      // The components at this index are equal, so check the next components.
      continue;

    // Otherwise, the result is based on the components at this index.
    return comparison;
  }

  // The components up to min(this.size(), other.size()) are equal, so the
  // shorter name is less.
  if (this.size() < other.size())
    return -1;
  else if (this.size() > other.size())
    return 1;
  else
    return 0;
};

/**
 * Return true if this Name has the same components as name.
 */
Name.prototype.equals = function(name)
{
  if (this.components.length != name.components.length)
    return false;

  // Start from the last component because they are more likely to differ.
  for (var i = this.components.length - 1; i >= 0; --i) {
    if (!this.components[i].equals(name.components[i]))
      return false;
  }

  return true;
};

/**
 * @deprecated Use equals.
 */
Name.prototype.equalsName = function(name)
{
  return this.equals(name);
};

/**
 * Find the last component in name that has a ContentDigest and return the digest value as Buffer,
 *   or null if not found.  See Name.getComponentContentDigestValue.
 */
Name.prototype.getContentDigestValue = function()
{
  for (var i = this.size() - 1; i >= 0; --i) {
    var digestValue = Name.getComponentContentDigestValue(this.components[i]);
    if (digestValue != null)
      return digestValue;
  }

  return null;
};

/**
 * If component is a ContentDigest, return the digest value as a Buffer slice (don't modify!).
 * If not a ContentDigest, return null.
 * A ContentDigest component is Name.ContentDigestPrefix + 32 bytes + Name.ContentDigestSuffix.
 */
Name.getComponentContentDigestValue = function(component)
{
  if (typeof component == 'object' && component instanceof Name.Component)
    component = component.getValue().buf();

  var digestComponentLength = Name.ContentDigestPrefix.length + 32 + Name.ContentDigestSuffix.length;
  // Check for the correct length and equal ContentDigestPrefix and ContentDigestSuffix.
  if (component.length == digestComponentLength &&
      DataUtils.arraysEqual(component.slice(0, Name.ContentDigestPrefix.length),
                            Name.ContentDigestPrefix) &&
      DataUtils.arraysEqual(component.slice
         (component.length - Name.ContentDigestSuffix.length, component.length),
                            Name.ContentDigestSuffix))
   return component.slice(Name.ContentDigestPrefix.length, Name.ContentDigestPrefix.length + 32);
 else
   return null;
};

// Meta GUID "%C1.M.G%C1" + ContentDigest with a 32 byte BLOB.
Name.ContentDigestPrefix = new Buffer([0xc1, 0x2e, 0x4d, 0x2e, 0x47, 0xc1, 0x01, 0xaa, 0x02, 0x85]);
Name.ContentDigestSuffix = new Buffer([0x00]);


/**
 * Return value as an escaped string according to NDN URI Scheme.
 * We can't use encodeURIComponent because that doesn't encode all the characters we want to.
 * @param {Buffer|Name.Component} component The value or Name.Component to escape.
 * @returns {string} The escaped string.
 */
Name.toEscapedString = function(value)
{
  if (typeof value == 'object' && value instanceof Name.Component)
    value = value.getValue().buf();
  else if (typeof value === 'object' && value instanceof Blob)
    value = value.buf();

  var result = "";
  var gotNonDot = false;
  for (var i = 0; i < value.length; ++i) {
    if (value[i] != 0x2e) {
      gotNonDot = true;
      break;
    }
  }
  if (!gotNonDot) {
    // Special case for component of zero or more periods.  Add 3 periods.
    result = "...";
    for (var i = 0; i < value.length; ++i)
      result += ".";
  }
  else {
    for (var i = 0; i < value.length; ++i) {
      var x = value[i];
      // Check for 0-9, A-Z, a-z, (+), (-), (.), (_)
      if (x >= 0x30 && x <= 0x39 || x >= 0x41 && x <= 0x5a ||
          x >= 0x61 && x <= 0x7a || x == 0x2b || x == 0x2d ||
          x == 0x2e || x == 0x5f)
        result += String.fromCharCode(x);
      else
        result += "%" + (x < 16 ? "0" : "") + x.toString(16).toUpperCase();
    }
  }
  return result;
};

/**
 * Make a blob value by decoding the escapedString according to NDN URI Scheme.
 * If escapedString is "", "." or ".." then return null, which means to skip the component in the name.
 * @param {string} escapedString The escaped string to decode.
 * @returns {Blob} The unescaped Blob value. If the escapedString is not a valid
 * escaped component, then the Blob isNull().
 */
Name.fromEscapedString = function(escapedString)
{
  var value = unescape(escapedString.trim());

  if (value.match(/[^.]/) == null) {
    // Special case for value of only periods.
    if (value.length <= 2)
      // Zero, one or two periods is illegal.  Ignore this componenent to be
      //   consistent with the C implementation.
      return new Blob();
    else
      // Remove 3 periods.
      return new Blob
        (DataUtils.toNumbersFromString(value.substr(3, value.length - 3)), false);
  }
  else
    return new Blob(DataUtils.toNumbersFromString(value), false);
};

/**
 * @deprecated Use fromEscapedString. This method returns a Buffer which is the former
 * behavior of fromEscapedString, and should only be used while updating your code.
 */
Name.fromEscapedStringAsBuffer = function(escapedString)
{
  return Name.fromEscapedString(escapedString).buf();
};

/**
 * Return true if the N components of this name are the same as the first N components of the given name.
 * @param {Name} name The name to check.
 * @returns {Boolean} true if this matches the given name.  This always returns true if this name is empty.
 */
Name.prototype.match = function(name)
{
  var i_name = this.components;
  var o_name = name.components;

  // This name is longer than the name we are checking it against.
  if (i_name.length > o_name.length)
    return false;

  // Check if at least one of given components doesn't match. Check from last to
  // first since the last components are more likely to differ.
  for (var i = i_name.length - 1; i >= 0; --i) {
    if (!i_name[i].equals(o_name[i]))
      return false;
  }

  return true;
};

/**
 * Get the change count, which is incremented each time this object is changed.
 * @returns {number} The change count.
 */
Name.prototype.getChangeCount = function()
{
  return this.changeCount;
};

// Put these requires at the bottom to avoid circular references.
var TlvEncoder = require('./encoding/tlv/tlv-encoder.js').TlvEncoder;
var WireFormat = require('./encoding/wire-format.js').WireFormat;
/**
 * This class represents an NDN KeyLocator object.
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Meki Cheraoui
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Blob = require('./util/blob.js').Blob;
var ChangeCounter = require('./util/change-counter.js').ChangeCounter;
var Name = require('./name.js').Name;
var LOG = require('./log.js').Log.LOG;

/**
 * KeyLocator
 */
var KeyLocatorType = {
  KEYNAME: 1,
  KEY_LOCATOR_DIGEST: 2
};

exports.KeyLocatorType = KeyLocatorType;

/**
 * @constructor
 */
var KeyLocator = function KeyLocator(input, type)
{
  if (typeof input === 'object' && input instanceof KeyLocator) {
    // Copy from the input KeyLocator.
    this.type_ = input.type_;
    this.keyName_ = new ChangeCounter(new Name(input.getKeyName()));
    this.keyData_ = input.keyData_;
  }
  else {
    this.type_ = type;
    this.keyName_ = new ChangeCounter(new Name());
    this.keyData_ = new Blob();

    if (type == KeyLocatorType.KEYNAME)
      this.keyName_.set(typeof input === 'object' && input instanceof Name ?
        new Name(input) : new Name());
    else if (type == KeyLocatorType.KEY_LOCATOR_DIGEST)
      this.keyData_ = new Blob(input);
  }

  this.changeCount_ = 0;
};

exports.KeyLocator = KeyLocator;

/**
 * Get the key locator type. If KeyLocatorType.KEYNAME, you may also
 * getKeyName().  If KeyLocatorType.KEY_LOCATOR_DIGEST, you may also
 * getKeyData() to get the digest.
 * @returns {number} The key locator type, or null if not specified.
 */
KeyLocator.prototype.getType = function() { return this.type_; };

/**
 * Get the key name.  This is meaningful if getType() is KeyLocatorType.KEYNAME.
 * @returns {Name} The key name. If not specified, the Name is empty.
 */
KeyLocator.prototype.getKeyName = function()
{
  return this.keyName_.get();
};

/**
 * Get the key data. If getType() is KeyLocatorType.KEY_LOCATOR_DIGEST, this is
 * the digest bytes.
 * @returns {Blob} The key data, or null if not specified.
 */
KeyLocator.prototype.getKeyData = function()
{
  return this.keyData_;
};

/**
 * @deprecated Use getKeyData. This method returns a Buffer which is the former
 * behavior of getKeyData, and should only be used while updating your code.
 */
KeyLocator.prototype.getKeyDataAsBuffer = function()
{
  return this.getKeyData().buf();
};

/**
 * Set the key locator type.  If KeyLocatorType.KEYNAME, you must also
 * setKeyName().  If KeyLocatorType.KEY_LOCATOR_DIGEST, you must also
 * setKeyData() to the digest.
 * @param {number} type The key locator type.  If null, the type is unspecified.
 */
KeyLocator.prototype.setType = function(type)
{
  this.type_ = type;
  ++this.changeCount_;
};

/**
 * Set key name to a copy of the given Name.  This is the name if getType()
 * is KeyLocatorType.KEYNAME.
 * @param {Name} name The key name which is copied.
 */
KeyLocator.prototype.setKeyName = function(name)
{
  this.keyName_.set(typeof name === 'object' && name instanceof Name ?
    new Name(name) : new Name());
  ++this.changeCount_;
};

/**
 * Set the key data to the given value. This is the digest bytes if getType() is
 * KeyLocatorType.KEY_LOCATOR_DIGEST.
 * @param {Blob} keyData A Blob with the key data bytes.
 */
KeyLocator.prototype.setKeyData = function(keyData)
{
  this.keyData_ = typeof keyData === 'object' && keyData instanceof Blob ?
    keyData : new Blob(keyData);
  ++this.changeCount_;
};

/**
 * Clear the keyData and set the type to not specified.
 */
KeyLocator.prototype.clear = function()
{
  this.type_ = null;
  this.keyName_.set(new Name());
  this.keyData_ = new Blob();
  ++this.changeCount_;
};

/**
 * If the signature is a type that has a KeyLocator (so that
 * getFromSignature will succeed), return true.
 * Note: This is a static method of KeyLocator instead of a method of
 * Signature so that the Signature base class does not need to be overloaded
 * with all the different kinds of information that various signature
 * algorithms may use.
 * @param {Signature} signature An object of a subclass of Signature.
 * @returns {boolean} True if the signature is a type that has a KeyLocator,
 * otherwise false.
 */
KeyLocator.canGetFromSignature = function(signature)
{
  return signature instanceof Sha256WithRsaSignature;
}

/**
 * If the signature is a type that has a KeyLocator, then return it. Otherwise
 * throw an error.
 * @param {Signature} signature An object of a subclass of Signature.
 * @returns {KeyLocator} The signature's KeyLocator. It is an error if signature
 * doesn't have a KeyLocator.
 */
KeyLocator.getFromSignature = function(signature)
{
  if (signature instanceof Sha256WithRsaSignature)
    return signature.getKeyLocator();
  else
    throw new Error
      ("KeyLocator.getFromSignature: Signature type does not have a KeyLocator");
}

/**
 * Get the change count, which is incremented each time this object (or a child
 * object) is changed.
 * @returns {number} The change count.
 */
KeyLocator.prototype.getChangeCount = function()
{
  // Make sure each of the checkChanged is called.
  var changed = this.keyName_.checkChanged();
  if (changed)
    // A child object has changed, so update the change count.
    ++this.changeCount_;

  return this.changeCount_;
};

// Define properties so we can change member variable types and implement changeCount_.
Object.defineProperty(KeyLocator.prototype, "type",
  { get: function() { return this.getType(); },
    set: function(val) { this.setType(val); } });
/**
 * @@deprecated Use getKeyData and setKeyData.
 */
Object.defineProperty(KeyLocator.prototype, "keyData",
  { get: function() { return this.getKeyDataAsBuffer(); },
    set: function(val) { this.setKeyData(val); } });

// Put this last to avoid a require loop.
var Sha256WithRsaSignature = require('./sha256-with-rsa-signature.js').Sha256WithRsaSignature;
/**
 * This class represents an NDN Data MetaInfo object.
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Meki Cheraoui
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Blob = require('./util/blob.js').Blob;
var KeyLocator = require('./key-locator.js').KeyLocator;
var KeyLocatorType = require('./key-locator.js').KeyLocatorType;
var Name = require('./name.js').Name;
var WireFormat = require('./encoding/wire-format.js').WireFormat;
var LOG = require('./log.js').Log.LOG;

var ContentType = {
  BLOB:0,
  LINK:1,
  KEY: 2,
  NACK:3
};

exports.ContentType = ContentType;

/**
 * Create a new MetaInfo with the optional values.
 * @constructor
 */
var MetaInfo = function MetaInfo(publisherOrMetaInfo, timestamp, type, locator, freshnessSeconds, finalBlockId)
{
  if (timestamp)
    throw new Error
      ("MetaInfo constructor: timestamp support has been removed.");
  if (locator)
    throw new Error
      ("MetaInfo constructor: locator support has been removed.");

  if (typeof publisherOrMetaInfo === 'object' &&
      publisherOrMetaInfo instanceof MetaInfo) {
    // Copy values.
    var metaInfo = publisherOrMetaInfo;
    this.publisher_ = metaInfo.publisher_;
    this.type_ = metaInfo.type_;
    this.freshnessPeriod_ = metaInfo.freshnessPeriod_;
    this.finalBlockId_ = metaInfo.finalBlockId_;
  }
  else {
    if (publisherOrMetaInfo)
      throw new Error
        ("MetaInfo constructor: publisher support has been removed.");

    this.type = type == null || type < 0 ? ContentType.BLOB : type;
    this.freshnessSeconds = freshnessSeconds; // deprecated
    this.finalBlockID = finalBlockId; // byte array // deprecated
  }

  this.changeCount_ = 0;
};

exports.MetaInfo = MetaInfo;

/**
 * Get the content type.
 * @returns {number} The content type as an int from ContentType.
 */
MetaInfo.prototype.getType = function()
{
  return this.type_;
};

/**
 * Get the freshness period.
 * @returns {number} The freshness period in milliseconds, or null if not
 * specified.
 */
MetaInfo.prototype.getFreshnessPeriod = function()
{
  return this.freshnessPeriod_;
};

/**
 * Get the final block ID.
 * @returns {Name.Component} The final block ID as a Name.Component. If the
 * Name.Component getValue().size() is 0, then the final block ID is not specified.
 */
MetaInfo.prototype.getFinalBlockId = function()
{
  return this.finalBlockId_;
};

/**
 * @deprecated Use getFinalBlockId.
 */
MetaInfo.prototype.getFinalBlockID = function()
{
  return this.getFinalBlockId();
};

/**
 * @deprecated Use getFinalBlockId. This method returns a Buffer which is the former
 * behavior of getFinalBlockId, and should only be used while updating your code.
 */
MetaInfo.prototype.getFinalBlockIDAsBuffer = function()
{
  return this.finalBlockId_.getValue().buf();
};

/**
 * Set the content type.
 * @param {number} type The content type as an int from ContentType.  If null,
 * this uses ContentType.BLOB.
 */
MetaInfo.prototype.setType = function(type)
{
  this.type_ = type == null || type < 0 ? ContentType.BLOB : type;
  ++this.changeCount_;
};

/**
 * Set the freshness period.
 * @param {type} freshnessPeriod The freshness period in milliseconds, or null
 * for not specified.
 */
MetaInfo.prototype.setFreshnessPeriod = function(freshnessPeriod)
{
  // Use attribute freshnessSeconds for backwards compatibility.
  if (freshnessPeriod == null || freshnessPeriod < 0)
    this.freshnessPeriod_ = null;
  else
    this.freshnessPeriod_ = freshnessPeriod;
  ++this.changeCount_;
};

MetaInfo.prototype.setFinalBlockId = function(finalBlockId)
{
  this.finalBlockId_ = typeof finalBlockId === 'object' &&
                       finalBlockId instanceof Name.Component ?
    finalBlockId : new Name.Component(finalBlockId);
  ++this.changeCount_;
};

/**
 * @deprecated Use setFinalBlockId.
 */
MetaInfo.prototype.setFinalBlockID = function(finalBlockId)
{
  this.setFinalBlockId(finalBlockId);
};

/**
 * Get the change count, which is incremented each time this object is changed.
 * @returns {number} The change count.
 */
MetaInfo.prototype.getChangeCount = function()
{
  return this.changeCount_;
};

// Define properties so we can change member variable types and implement changeCount_.
Object.defineProperty(MetaInfo.prototype, "type",
  { get: function() { return this.getType(); },
    set: function(val) { this.setType(val); } });
/**
 * @deprecated Use getFreshnessPeriod and setFreshnessPeriod.
 */
Object.defineProperty(MetaInfo.prototype, "freshnessSeconds",
  { get: function() {
      if (this.freshnessPeriod_ == null || this.freshnessPeriod_ < 0)
        return null;
      else
        // Convert from milliseconds.
        return this.freshnessPeriod_ / 1000.0;
    },
    set: function(val) {
      if (val == null || val < 0)
        this.freshnessPeriod_ = null;
      else
        // Convert to milliseconds.
        this.freshnessPeriod_ = val * 1000.0;
      ++this.changeCount_;
    } });
/**
 * @deprecated Use getFinalBlockId and setFinalBlockId.
 */
Object.defineProperty(MetaInfo.prototype, "finalBlockID",
  { get: function() { return this.getFinalBlockIDAsBuffer(); },
    set: function(val) { this.setFinalBlockId(val); } });
/**
 * This class represents an NDN Data Signature object.
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Meki Cheraoui
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Blob = require('./util/blob.js').Blob;
var ChangeCounter = require('./util/change-counter.js').ChangeCounter;
var KeyLocator = require('./key-locator.js').KeyLocator;
var LOG = require('./log.js').Log.LOG;
var WireFormat = require('./encoding/wire-format.js').WireFormat;

/**
 * Create a new Sha256WithRsaSignature object, possibly copying values from
 * another object.
 *
 * @param {Sha256WithRsaSignature} value (optional) If value is a
 * Sha256WithRsaSignature, copy its values.  If value is omitted, the keyLocator
 * is the default with unspecified values and the signature is unspecified.
 * @constructor
 */
var Sha256WithRsaSignature = function Sha256WithRsaSignature(value)
{
  if (typeof value === 'object' && value instanceof Sha256WithRsaSignature) {
    // Copy the values.
    this.keyLocator_ = new ChangeCounter(new KeyLocator(value.getKeyLocator()));
    this.signature_ = value.signature_;
  }
  else {
    this.keyLocator_ = new ChangeCounter(new KeyLocator());
    this.signature_ = new Blob();
  }

  this.changeCount_ = 0;
};

exports.Sha256WithRsaSignature = Sha256WithRsaSignature;

/**
 * Create a new Sha256WithRsaSignature which is a copy of this object.
 * @returns {Sha256WithRsaSignature} A new object which is a copy of this object.
 */
Sha256WithRsaSignature.prototype.clone = function()
{
  return new Sha256WithRsaSignature(this);
};

/**
 * Get the key locator.
 * @returns {KeyLocator} The key locator.
 */
Sha256WithRsaSignature.prototype.getKeyLocator = function()
{
  return this.keyLocator_.get();
};

/**
 * Get the data packet's signature bytes.
 * @returns {Blob} The signature bytes. If not specified, the value isNull().
 */
Sha256WithRsaSignature.prototype.getSignature = function()
{
  return this.signature_;
};

/**
 * @deprecated Use getSignature. This method returns a Buffer which is the former
 * behavior of getSignature, and should only be used while updating your code.
 */
Sha256WithRsaSignature.prototype.getSignatureAsBuffer = function()
{
  return this.signature_.buf();
};

/**
 * Set the key locator to a copy of the given keyLocator.
 * @param {KeyLocator} keyLocator The KeyLocator to copy.
 */
Sha256WithRsaSignature.prototype.setKeyLocator = function(keyLocator)
{
  this.keyLocator_.set(typeof keyLocator === 'object' &&
                       keyLocator instanceof KeyLocator ?
    new KeyLocator(keyLocator) : new KeyLocator());
  ++this.changeCount_;
};

/**
 * Set the data packet's signature bytes.
 * @param {Blob} signature
 */
Sha256WithRsaSignature.prototype.setSignature = function(signature)
{
  this.signature_ = typeof signature === 'object' && signature instanceof Blob ?
    signature : new Blob(signature);
  ++this.changeCount_;
};

/**
 * Get the change count, which is incremented each time this object (or a child
 * object) is changed.
 * @returns {number} The change count.
 */
Sha256WithRsaSignature.prototype.getChangeCount = function()
{
  // Make sure each of the checkChanged is called.
  var changed = this.keyLocator_.checkChanged();
  if (changed)
    // A child object has changed, so update the change count.
    ++this.changeCount_;

  return this.changeCount_;
};

// Define properties so we can change member variable types and implement changeCount_.
Object.defineProperty(Sha256WithRsaSignature.prototype, "keyLocator",
  { get: function() { return this.getKeyLocator(); },
    set: function(val) { this.setKeyLocator(val); } });
/**
 * @@deprecated Use getSignature and setSignature.
 */
Object.defineProperty(Sha256WithRsaSignature.prototype, "signature",
  { get: function() { return this.getSignatureAsBuffer(); },
    set: function(val) { this.setSignature(val); } });
/**
 * This class represents an NDN Data Signature object.
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Blob = require('./util/blob.js').Blob;

/**
 * A DigestSha256Signature extends Signature and holds the signature bits (which
 * are only the SHA256 digest) and an empty SignatureInfo for a data packet or
 * signed interest.
 *
 * Create a new DigestSha256Signature object, possibly copying values from
 * another object.
 *
 * @param {DigestSha256Signature} value (optional) If value is a
 * DigestSha256Signature, copy its values.  If value is omitted, the signature
 * is unspecified.
 * @constructor
 */
var DigestSha256Signature = function DigestSha256Signature(value)
{
  if (typeof value === 'object' && value instanceof DigestSha256Signature)
    // Copy the values.
    this.signature_ = value.signature_;
  else
    this.signature_ = new Blob();

  this.changeCount_ = 0;
};

exports.DigestSha256Signature = DigestSha256Signature;

/**
 * Create a new DigestSha256Signature which is a copy of this object.
 * @returns {DigestSha256Signature} A new object which is a copy of this object.
 */
DigestSha256Signature.prototype.clone = function()
{
  return new DigestSha256Signature(this);
};

/**
 * Get the signature bytes (which are only the digest).
 * @returns {Blob} The signature bytes. If not specified, the value isNull().
 */
DigestSha256Signature.prototype.getSignature = function()
{
  return this.signature_;
};

/**
 * Set the signature bytes to the given value.
 * @param {Blob} signature
 */
DigestSha256Signature.prototype.setSignature = function(signature)
{
  this.signature_ = typeof signature === 'object' && signature instanceof Blob ?
    signature : new Blob(signature);
  ++this.changeCount_;
};

/**
 * Get the change count, which is incremented each time this object is changed.
 * @returns {number} The change count.
 */
DigestSha256Signature.prototype.getChangeCount = function()
{
  return this.changeCount_;
};

// Define properties so we can change member variable types and implement changeCount_.
/**
 * @@deprecated Use getSignature and setSignature.
 */
Object.defineProperty(DigestSha256Signature.prototype, "signature",
  { get: function() { return this.getSignature(); },
    set: function(val) { this.setSignature(val); } });
/**
 * This class represents an NDN Data object.
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Meki Cheraoui
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Blob = require('./util/blob.js').Blob;
var SignedBlob = require('./util/signed-blob.js').SignedBlob;
var ChangeCounter = require('./util/change-counter.js').ChangeCounter;
var DataUtils = require('./encoding/data-utils.js').DataUtils;
var Name = require('./name.js').Name;
var Sha256WithRsaSignature = require('./sha256-with-rsa-signature.js').Sha256WithRsaSignature;
var MetaInfo = require('./meta-info.js').MetaInfo;
var KeyLocator = require('./key-locator.js').KeyLocator;
var WireFormat = require('./encoding/wire-format.js').WireFormat;

/**
 * Create a new Data with the optional values.  There are 2 forms of constructor:
 * new Data([name] [, content]);
 * new Data(name, metaInfo [, content]);
 *
 * @constructor
 * @param {Name} name
 * @param {MetaInfo} metaInfo
 * @param {Buffer} content
 */
var Data = function Data(nameOrData, metaInfoOrContent, arg3)
{
  if (nameOrData instanceof Data) {
    // The copy constructor.
    var data = nameOrData;

    // Copy the name.
    this.name_ = new ChangeCounter(new Name(data.getName()));
    this.metaInfo_ = new ChangeCounter(new MetaInfo(data.getMetaInfo()));
    this.signature_ = new ChangeCounter(data.getSignature().clone());
    this.content_ = data.content_;
    this.defaultWireEncoding_ = data.getDefaultWireEncoding();
    this.defaultWireEncodingFormat_ = data.defaultWireEncodingFormat_;
  }
  else {
    var name = nameOrData;
    if (typeof name === 'string')
      this.name_ = new ChangeCounter(new Name(name));
    else
      this.name_ = new ChangeCounter(typeof name === 'object' && name instanceof Name ?
         new Name(name) : new Name());

    var metaInfo;
    var content;
    if (typeof metaInfoOrContent === 'object' &&
        metaInfoOrContent instanceof MetaInfo) {
      metaInfo = metaInfoOrContent;
      content = arg3;
    }
    else {
      metaInfo = null;
      content = metaInfoOrContent;
    }

    this.metaInfo_ = new ChangeCounter(typeof metaInfo === 'object' && metaInfo instanceof MetaInfo ?
      new MetaInfo(metaInfo) : new MetaInfo());

    this.content_ = typeof content === 'object' && content instanceof Blob ?
      content : new Blob(content, true);

    this.signature_ = new ChangeCounter(new Sha256WithRsaSignature());
    this.defaultWireEncoding_ = new SignedBlob();
    this.defaultWireEncodingFormat_ = null;
  }

  this.getDefaultWireEncodingChangeCount_ = 0;
  this.changeCount_ = 0;
};

exports.Data = Data;

/**
 * Get the data packet's name.
 * @returns {Name} The name.
 */
Data.prototype.getName = function()
{
  return this.name_.get();
};

/**
 * Get the data packet's meta info.
 * @returns {MetaInfo} The meta info.
 */
Data.prototype.getMetaInfo = function()
{
  return this.metaInfo_.get();
};

/**
 * Get the data packet's signature object.
 * @returns {Signature} The signature object.
 */
Data.prototype.getSignature = function()
{
  return this.signature_.get();
};

/**
 * Get the data packet's content.
 * @returns {Blob} The content as a Blob, which isNull() if unspecified.
 */
Data.prototype.getContent = function()
{
  return this.content_;
};

/**
 * @deprecated Use getContent. This method returns a Buffer which is the former
 * behavior of getContent, and should only be used while updating your code.
 */
Data.prototype.getContentAsBuffer = function()
{
  return this.content_.buf();
};

/**
 * Return the default wire encoding, which was encoded with
 * getDefaultWireEncodingFormat().
 * @returns {SignedBlob} The default wire encoding, whose isNull() may be true
 * if there is no default wire encoding.
 */
Data.prototype.getDefaultWireEncoding = function()
{
  if (this.getDefaultWireEncodingChangeCount_ != this.getChangeCount()) {
    // The values have changed, so the default wire encoding is invalidated.
    this.defaultWireEncoding_ = new SignedBlob();
    this.defaultWireEncodingFormat_ = null;
    this.getDefaultWireEncodingChangeCount_ = this.getChangeCount();
  }

  return this.defaultWireEncoding_;
};

/**
 * Get the WireFormat which is used by getDefaultWireEncoding().
 * @returns {WireFormat} The WireFormat, which is only meaningful if the
 * getDefaultWireEncoding() is not isNull().
 */
Data.prototype.getDefaultWireEncodingFormat = function()
{
  return this.defaultWireEncodingFormat_;
};

/**
 * Set name to a copy of the given Name.
 * @param {Name} name The Name which is copied.
 * @returns {Data} This Data so that you can chain calls to update values.
 */
Data.prototype.setName = function(name)
{
  this.name_.set(typeof name === 'object' && name instanceof Name ?
    new Name(name) : new Name());
  ++this.changeCount_;
  return this;
};

/**
 * Set metaInfo to a copy of the given MetaInfo.
 * @param {MetaInfo} metaInfo The MetaInfo which is copied.
 * @returns {Data} This Data so that you can chain calls to update values.
 */
Data.prototype.setMetaInfo = function(metaInfo)
{
  this.metaInfo_.set(typeof metaInfo === 'object' && metaInfo instanceof MetaInfo ?
    new MetaInfo(metaInfo) : new MetaInfo());
  ++this.changeCount_;
  return this;
};

/**
 * Set the signature to a copy of the given signature.
 * @param {Signature} signature The signature object which is cloned.
 * @returns {Data} This Data so that you can chain calls to update values.
 */
Data.prototype.setSignature = function(signature)
{
  this.signature_.set(signature == null ?
    new Sha256WithRsaSignature() : signature.clone());
  ++this.changeCount_;
  return this;
};

/**
 * Set the content to the given value.
 * @param {Blob|Buffer} content The content bytes. If content is not a Blob,
 * then create a new Blob to copy the bytes (otherwise take another pointer to
 * the same Blob).
 * @returns {Data} This Data so that you can chain calls to update values.
 */
Data.prototype.setContent = function(content)
{
  this.content_ = typeof content === 'object' && content instanceof Blob ?
    content : new Blob(content, true);
  ++this.changeCount_;
  return this;
};

/**
 * Encode this Data for a particular wire format. If wireFormat is the default
 * wire format, also set the defaultWireEncoding field to the encoded result.
 * @param {WireFormat} wireFormat (optional) A WireFormat object used to encode
 * this object. If omitted, use WireFormat.getDefaultWireFormat().
 * @returns {SignedBlob} The encoded buffer in a SignedBlob object.
 */
Data.prototype.wireEncode = function(wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());

  if (!this.getDefaultWireEncoding().isNull() &&
      this.getDefaultWireEncodingFormat() == wireFormat)
    // We already have an encoding in the desired format.
    return this.getDefaultWireEncoding();

  var result = wireFormat.encodeData(this);
  var wireEncoding = new SignedBlob
    (result.encoding, result.signedPortionBeginOffset,
     result.signedPortionEndOffset);

  if (wireFormat == WireFormat.getDefaultWireFormat())
    // This is the default wire encoding.
    this.setDefaultWireEncoding
      (wireEncoding, WireFormat.getDefaultWireFormat());
  return wireEncoding;
};

/**
 * Decode the input using a particular wire format and update this Data. If
 * wireFormat is the default wire format, also set the defaultWireEncoding to
 * another pointer to the input.
 * @param {Blob|Buffer} input The buffer with the bytes to decode.
 * @param {WireFormat} wireFormat (optional) A WireFormat object used to decode
 * this object. If omitted, use WireFormat.getDefaultWireFormat().
 */
Data.prototype.wireDecode = function(input, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());

  // If input is a blob, get its buf().
  var decodeBuffer = typeof input === 'object' && input instanceof Blob ?
                     input.buf() : input;
  var result = wireFormat.decodeData(this, decodeBuffer);

  if (wireFormat == WireFormat.getDefaultWireFormat())
    // This is the default wire encoding.  In the Blob constructor, set copy
    // true, but if input is already a Blob, it won't copy.
    this.setDefaultWireEncoding(new SignedBlob
      (new Blob(input, true), result.signedPortionBeginOffset,
       result.signedPortionEndOffset),
      WireFormat.getDefaultWireFormat());
  else
    this.setDefaultWireEncoding(new SignedBlob(), null);
};

/**
 * Get the change count, which is incremented each time this object (or a child
 * object) is changed.
 * @returns {number} The change count.
 */
Data.prototype.getChangeCount = function()
{
  // Make sure each of the checkChanged is called.
  var changed = this.name_.checkChanged();
  changed = this.metaInfo_.checkChanged() || changed;
  changed = this.signature_.checkChanged() || changed;
  if (changed)
    // A child object has changed, so update the change count.
    ++this.changeCount_;

  return this.changeCount_;
};

Data.prototype.setDefaultWireEncoding = function
  (defaultWireEncoding, defaultWireEncodingFormat)
{
  this.defaultWireEncoding_ = defaultWireEncoding;
  this.defaultWireEncodingFormat_ = defaultWireEncodingFormat;
  // Set getDefaultWireEncodingChangeCount_ so that the next call to
  // getDefaultWireEncoding() won't clear _defaultWireEncoding.
  this.getDefaultWireEncodingChangeCount_ = this.getChangeCount();
};

// Define properties so we can change member variable types and implement changeCount_.
Object.defineProperty(Data.prototype, "name",
  { get: function() { return this.getName(); },
    set: function(val) { this.setName(val); } });
Object.defineProperty(Data.prototype, "metaInfo",
  { get: function() { return this.getMetaInfo(); },
    set: function(val) { this.setMetaInfo(val); } });
Object.defineProperty(Data.prototype, "signature",
  { get: function() { return this.getSignature(); },
    set: function(val) { this.setSignature(val); } });
/**
 * @deprecated Use getContent and setContent.
 */
Object.defineProperty(Data.prototype, "content",
  { get: function() { return this.getContentAsBuffer(); },
    set: function(val) { this.setContent(val); } });
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * Create a new SecurityException to report an exception from the security
 * library, wrapping the given error object.
 * Call with: throw new SecurityException(new Error("message")).
 * @constructor
 * @param {Error} error The exception created with new Error.
 */
function SecurityException(error)
{
  if (error) {
    // Copy lineNumber, etc. from where new Error was called.
    for (var prop in error)
      this[prop] = error[prop];
    // Make sure these are copied.
    this.message = error.message;
    this.stack = error.stack;
  }
}

SecurityException.prototype = new Error();
SecurityException.prototype.name = "SecurityException";

exports.SecurityException = SecurityException;

function UnrecognizedKeyFormatException(error)
{
  // Call the base constructor.
  SecurityException.call(this, error);
}
UnrecognizedKeyFormatException.prototype = new SecurityException();
UnrecognizedKeyFormatException.prototype.name = "UnrecognizedKeyFormatException";

exports.UnrecognizedKeyFormatException = UnrecognizedKeyFormatException;

function UnrecognizedDigestAlgorithmException(error)
{
  // Call the base constructor.
  SecurityException.call(this, error);
}
UnrecognizedDigestAlgorithmException.prototype = new SecurityException();
UnrecognizedDigestAlgorithmException.prototype.name = "UnrecognizedDigestAlgorithmException";

exports.UnrecognizedDigestAlgorithmException = UnrecognizedDigestAlgorithmException;
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * This module defines constants used by the security library.
 */

/**
 * The KeyType integer is used by the Sqlite key storage, so don't change them.
 * Make these the same as ndn-cxx in case the storage file is shared.
 * @constructor
 */
var KeyType = function KeyType()
{
}

exports.KeyType = KeyType;

KeyType.RSA = 0;
KeyType.ECDSA = 1;
KeyType.AES = 128;

var KeyClass = function KeyClass()
{
};

exports.KeyClass = KeyClass;

KeyClass.PUBLIC = 1;
KeyClass.PRIVATE = 2;
KeyClass.SYMMETRIC = 3;

var DigestAlgorithm = function DigestAlgorithm()
{
};

exports.DigestAlgorithm = DigestAlgorithm;

DigestAlgorithm.SHA256 = 1;
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var KeyType = require('./security-types').KeyType;

/**
 * KeyParams is a base class for key parameters. Its subclasses are used to
 * store parameters for key generation. You should create one of the subclasses,
 * for example RsaKeyParams.
 * @constructor
 */
var KeyParams = function KeyParams(keyType)
{
  this.keyType = keyType;
};

exports.KeyParams = KeyParams;

KeyParams.prototype.getKeyType = function()
{
  return this.keyType;
};

var RsaKeyParams = function RsaKeyParams(size)
{
  // Call the base constructor.
  KeyParams.call(this, RsaKeyParams.getType());

  if (size == null)
    size = RsaKeyParams.getDefaultSize();
  this.size = size;
};

RsaKeyParams.prototype = new KeyParams();
RsaKeyParams.prototype.name = "RsaKeyParams";

exports.RsaKeyParams = RsaKeyParams;

RsaKeyParams.prototype.getKeySize = function()
{
  return this.size;
};

RsaKeyParams.getDefaultSize = function() { return 2048; };

RsaKeyParams.getType = function() { return KeyType.RSA; };

var EcdsaKeyParams = function EcdsaKeyParams(size)
{
  // Call the base constructor.
  KeyParams.call(this, EcdsaKeyParams.getType());

  if (size == null)
    size = EcdsaKeyParams.getDefaultSize();
  this.size = size;
};

EcdsaKeyParams.prototype = new KeyParams();
EcdsaKeyParams.prototype.name = "EcdsaKeyParams";

exports.EcdsaKeyParams = EcdsaKeyParams;

EcdsaKeyParams.prototype.getKeySize = function()
{
  return this.size;
};

EcdsaKeyParams.getDefaultSize = function() { return 256; };

EcdsaKeyParams.getType = function() { return KeyType.ECDSA; };
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

// Use capitalized Crypto to not clash with the browser's crypto.subtle.
var Crypto = require("crypto");
var Blob = require('../../util/blob.js').Blob;
var DerDecodingException = require('../../encoding/der/der-decoding-exception.js').DerDecodingException;
var DerNode = require('../../encoding/der/der-node.js').DerNode;
var SecurityException = require('../security-exception.js').SecurityException;
var UnrecognizedKeyFormatException = require('../security-exception.js').UnrecognizedKeyFormatException;
var KeyType = require('../security-types.js').KeyType;
var DigestAlgorithm = require('../security-types.js').DigestAlgorithm;

/**
 * Create a new PublicKey by decoding the keyDer. Set the key type from the
 * decoding.
 * @param {Blob} keyDer The blob of the SubjectPublicKeyInfo DER.
 * @throws {UnrecognizedKeyFormatException} if can't decode the key DER.
 */
var PublicKey = function PublicKey(keyDer)
{
  if (!keyDer) {
    this.keyDer = new Blob();
    this.keyType = null;
    return;
  }

  this.keyDer = keyDer;

  // Get the public key OID.
  var oidString = null;
  try {
    var parsedNode = DerNode.parse(keyDer.buf(), 0);
    var rootChildren = parsedNode.getChildren();
    var algorithmIdChildren = DerNode.getSequence(rootChildren, 0).getChildren();
    oidString = algorithmIdChildren[0].toVal();
  }
  catch (ex) {
    throw new UnrecognizedKeyFormatException(new Error
      ("PublicKey.decodeKeyType: Error decoding the public key: " + ex.message));
  }

  // Verify that the we can decode.
  if (oidString == PublicKey.RSA_ENCRYPTION_OID) {
    this.keyType = KeyType.RSA;
    // TODO: Check RSA decoding.
  }
  else if (oidString == PublicKey.EC_ENCRYPTION_OID) {
    this.keyType = KeyType.ECDSA;
    // TODO: Check EC decoding.
  }
};

exports.PublicKey = PublicKey;

/**
 * Encode the public key into DER.
 * @returns {DerNode} The encoded DER syntax tree.
 */
PublicKey.prototype.toDer = function()
{
  return DerNode.parse(this.keyDer.buf());
};

/**
 * Get the key type.
 * @returns {number} The key type as an int from KeyType.
 */
PublicKey.prototype.getKeyType = function()
{
  return this.keyType;
};

/**
 * Get the digest of the public key.
 * @param {number} digestAlgorithm (optional) The integer from DigestAlgorithm,
 * such as DigestAlgorithm.SHA256. If omitted, use DigestAlgorithm.SHA256 .
 * @returns {Blob} The digest value.
 */
PublicKey.prototype.getDigest = function(digestAlgorithm)
{
  if (digestAlgorithm == undefined)
    digestAlgorithm = DigestAlgorithm.SHA256;

  if (digestAlgorithm == DigestAlgorithm.SHA256) {
    var hash = Crypto.createHash('sha256');
    hash.update(this.keyDer.buf());
    return new Blob(hash.digest(), false);
  }
  else
    throw new SecurityException(new Error("Wrong format!"));
};

/**
 * Get the raw bytes of the public key in DER format.
 * @returns {Blob} The public key DER.
 */
PublicKey.prototype.getKeyDer = function()
{
  return this.keyDer;
};

PublicKey.RSA_ENCRYPTION_OID = "1.2.840.113549.1.1.1";
PublicKey.EC_ENCRYPTION_OID = "1.2.840.10045.2.1";
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var DerNode = require('../../encoding/der/der-node.js').DerNode;
var OID = require('../../encoding/oid.js').OID;

/**
 * A CertificateExtension represents the Extension entry in a certificate.
 * Create a new CertificateExtension.
 * @param {string|OID} oid The oid of subject description entry.
 * @param {boolean} isCritical If true, the extension must be handled.
 * @param {Blob} value The extension value.
 */
var CertificateExtension = function CertificateExtension(oid, isCritical, value)
{
  if (typeof oid === 'string')
    this.extensionId = new OID(oid);
  else
    // Assume oid is already an OID.
    this.extensionId = oid;

  this.isCritical = isCritical;
  this.extensionValue = value;
};

exports.CertificateExtension = CertificateExtension;

/**
 * Encode the object into a DER syntax tree.
 * @returns {DerNode} The encoded DER syntax tree.
 */
CertificateExtension.prototype.toDer = function()
{
  var root = new DerNode.DerSequence();

  var extensionId = new DerNode.DerOid(this.extensionId);
  var isCritical = new DerNode.DerBoolean(this.isCritical);
  var extensionValue = new DerNode.DerOctetString(this.extensionValue.buf());

  root.addChild(extensionId);
  root.addChild(isCritical);
  root.addChild(extensionValue);

  root.getSize();

  return root;
};

CertificateExtension.prototype.toDerBlob = function()
{
  return this.toDer().encode();
};

CertificateExtension.prototype.getOid = function()
{
  return this.extensionId;
};

CertificateExtension.prototype.getIsCritical = function()
{
  return this.isCritical;
};

CertificateExtension.prototype.getValue = function()
{
  return this.extensionValue;
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Blob = require('../../util/blob.js').Blob;
var OID = require('../../encoding/oid.js').OID;
var DerNode = require('../../encoding/der/der-node.js').DerNode;

/**
 * A CertificateSubjectDescription represents the SubjectDescription entry in a
 * Certificate.
 * Create a new CertificateSubjectDescription.
 * @param {string|OID} oid The oid of the subject description entry.
 * @param {string} value The value of the subject description entry.
 */
var CertificateSubjectDescription = function CertificateSubjectDescription
  (oid, value)
{
  if (typeof oid === 'string')
    this.oid = new OID(oid);
  else
    // Assume oid is already an OID.
    this.oid = oid;

  this.value = value;
};

exports.CertificateSubjectDescription = CertificateSubjectDescription;

/**
 * Encode the object into a DER syntax tree.
 * @returns {DerNode} The encoded DER syntax tree.
 */
CertificateSubjectDescription.prototype.toDer = function()
{
  var root = new DerNode.DerSequence();

  var oid = new DerNode.DerOid(this.oid);
  // Use Blob to convert the String to a ByteBuffer.
  var value = new DerNode.DerPrintableString(new Blob(this.value).buf());

  root.addChild(oid);
  root.addChild(value);

  return root;
};

CertificateSubjectDescription.prototype.getOidString = function()
{
  return this.oid.toString();
};

CertificateSubjectDescription.prototype.getValue = function()
{
  return this.value;
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Data = require('../../data.js').Data;
var ContentType = require('../../meta-info.js').ContentType;
var WireFormat = require('../../encoding/wire-format.js').WireFormat;
var DerNode = require('../../encoding/der/der-node.js').DerNode;
var KeyType = require('../../security/security-types.js').KeyType;
var PublicKey = require('./public-key.js').PublicKey;
var CertificateSubjectDescription = require('./certificate-subject-description.js').CertificateSubjectDescription;
var CertificateExtension = require('./certificate-extension.js').CertificateExtension;

/**
 * Create a Certificate from the content in the data packet (if not omitted).
 * @param {Data} data (optional) The data packet with the content to decode.
 * If omitted, create a Certificate with default values and the Data content
 * is empty.
 */
var Certificate = function Certificate(data)
{
  // Call the base constructor.
  if (data != undefined)
    Data.call(this, data);
  else
    Data.call(this);

  this.subjectDescriptionList = [];  // of CertificateSubjectDescription
  this.extensionList = [];           // of CertificateExtension
  this.notBefore = Number.MAX_VALUE; // MillisecondsSince1970
  this.notAfter = -Number.MAX_VALUE; // MillisecondsSince1970
  this.key = new PublicKey();

  if (data != undefined)
    this.decode();
};
Certificate.prototype = new Data();
Certificate.prototype.name = "Certificate";

exports.Certificate = Certificate;

/**
 * Encode the contents of the certificate in DER format and set the Content
 * and MetaInfo fields.
 */
Certificate.prototype.encode = function()
{
  var root = this.toDer();
  this.setContent(root.encode());
  this.getMetaInfo().setType(ContentType.KEY);
};

/**
 * Add a subject description.
 * @param {CertificateSubjectDescription} description The description to be added.
 */
Certificate.prototype.addSubjectDescription = function(description)
{
  this.subjectDescriptionList.push(description);
};

/**
 * Get the subject description list.
 * @returns {Array<CertificateSubjectDescription>} The subject description list.
 */
Certificate.prototype.getSubjectDescriptionList = function()
{
  return this.subjectDescriptionList;
};

/**
 * Add a certificate extension.
 * @param {CertificateSubjectDescription} extension The extension to be added.
 */
Certificate.prototype.addExtension = function(extension)
{
  this.extensionList.push(extension);
};

/**
 * Get the certificate extension list.
 * @returns {Array<CertificateExtension>} The extension list.
 */
Certificate.prototype.getExtensionList = function()
{
  return this.extensionList;
};

Certificate.prototype.setNotBefore = function(notBefore)
{
  this.notBefore = notBefore;
};

Certificate.prototype.getNotBefore = function()
{
  return this.notBefore;
};

Certificate.prototype.setNotAfter = function(notAfter)
{
  this.notAfter = notAfter;
};

Certificate.prototype.getNotAfter = function()
{
  return this.notAfter;
};

Certificate.prototype.setPublicKeyInfo = function(key)
{
  this.key = key;
};

Certificate.prototype.getPublicKeyInfo = function()
{
  return this.key;
};

/**
 * Check if the certificate is valid.
 * @returns {Boolean} True if the current time is earlier than notBefore.
 */
Certificate.prototype.isTooEarly = function()
{
  var now = new Date().getTime();
  return now < this.notBefore;
};

/**
 * Check if the certificate is valid.
 * @returns {Boolean} True if the current time is later than notAfter.
 */
Certificate.prototype.isTooLate = function()
{
  var now = new Date().getTime();
  return now > this.notAfter;
};

/**
 * Encode the certificate fields in DER format.
 * @returns {DerSequence} The DER encoded contents of the certificate.
 */
Certificate.prototype.toDer = function()
{
  var root = new DerNode.DerSequence();
  var validity = new DerNode.DerSequence();
  var notBefore = new DerNode.DerGeneralizedTime(this.notBefore);
  var notAfter = new DerNode.DerGeneralizedTime(this.notAfter);

  validity.addChild(notBefore);
  validity.addChild(notAfter);

  root.addChild(validity);

  var subjectList = new DerNode.DerSequence();
  for (var i = 0; i < this.subjectDescriptionList.length; ++i)
    subjectList.addChild(this.subjectDescriptionList[i].toDer());

  root.addChild(subjectList);
  root.addChild(this.key.toDer());

  if (this.extensionList.length > 0) {
    var extensionList = new DerNode.DerSequence();
    for (var i = 0; i < this.extensionList.length; ++i)
      extensionList.addChild(this.extensionList[i].toDer());
    root.addChild(extensionList);
  }

  return root;
};

/**
 * Populate the fields by the decoding DER data from the Content.
 */
Certificate.prototype.decode = function()
{
  var root = DerNode.parse(this.getContent().buf());

  // We need to ensure that there are:
  //   validity (notBefore, notAfter)
  //   subject list
  //   public key
  //   (optional) extension list

  var rootChildren = root.getChildren();
  // 1st: validity info
  var validityChildren = DerNode.getSequence(rootChildren, 0).getChildren();
  this.notBefore = validityChildren[0].toVal();
  this.notAfter = validityChildren[1].toVal();

  // 2nd: subjectList
  var subjectChildren = DerNode.getSequence(rootChildren, 1).getChildren();
  for (var i = 0; i < subjectChildren.length; ++i) {
    var sd = DerNode.getSequence(subjectChildren, i);
    var descriptionChildren = sd.getChildren();
    var oidStr = descriptionChildren[0].toVal();
    var value = descriptionChildren[1].toVal().buf().toString('binary');

    this.addSubjectDescription(new CertificateSubjectDescription(oidStr, value));
  }

  // 3rd: public key
  var publicKeyInfo = rootChildren[2].encode();
  this.key =  new PublicKey(publicKeyInfo);

  if (rootChildren.length > 3) {
    var extensionChildren = DerNode.getSequence(rootChildren, 3).getChildren();
    for (var i = 0; i < extensionChildren.length; ++i) {
      var extInfo = DerNode.getSequence(extensionChildren, i);

      var children = extInfo.getChildren();
      var oidStr = children[0].toVal();
      var isCritical = children[1].toVal();
      var value = children[2].toVal();
      this.addExtension(new CertificateExtension(oidStr, isCritical, value));
    }
  }
};

/**
 * Override to call the base class wireDecode then populate the certificate
 * fields.
 * @param {Blob|Buffer} input The buffer with the bytes to decode.
 * @param {WireFormat} wireFormat (optional) A WireFormat object used to decode
 * this object. If omitted, use WireFormat.getDefaultWireFormat().
 */
Certificate.prototype.wireDecode = function(input, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());

  Data.prototype.wireDecode.call(this, input, wireFormat);
  this.decode();
};

Certificate.prototype.toString = function()
{
  var s = "Certificate name:\n";
  s += "  " + this.getName().toUri() + "\n";
  s += "Validity:\n";

  var notBeforeStr = Certificate.toIsoString(Math.round(this.notBefore));
  var notAfterStr = Certificate.toIsoString(Math.round(this.notAfter));

  s += "  NotBefore: " + notBeforeStr + "\n";
  s += "  NotAfter: " + notAfterStr + "\n";
  for (var i = 0; i < this.subjectDescriptionList.length; ++i) {
    var sd = this.subjectDescriptionList[i];
    s += "Subject Description:\n";
    s += "  " + sd.getOidString() + ": " + sd.getValue() + "\n";
  }

  s += "Public key bits:\n";
  var keyDer = this.key.getKeyDer();
  var encodedKey = keyDer.buf().toString('base64');
  for (var i = 0; i < encodedKey.length; i += 64)
    s += encodedKey.substring(i, Math.min(i + 64, encodedKey.length)) + "\n";

  if (this.extensionList.length > 0) {
    s += "Extensions:\n";
    for (var i = 0; i < this.extensionList.length; ++i) {
      var ext = this.extensionList[i];
      s += "  OID: " + ext.getOid() + "\n";
      s += "  Is critical: " + (ext.getIsCritical() ? 'Y' : 'N') + "\n";

      s += "  Value: " + ext.getValue().toHex() + "\n" ;
    }
  }

  return s;
};

/**
 * Convert a UNIX timestamp to ISO time representation with the "T" in the middle.
 * @param {type} msSince1970 Timestamp as milliseconds since Jan 1, 1970.
 * @returns {string} The string representation.
 */
Certificate.toIsoString = function(msSince1970)
{
  var utcTime = new Date(Math.round(msSince1970));
  return utcTime.getUTCFullYear() +
         Certificate.to2DigitString(utcTime.getUTCMonth() + 1) +
         Certificate.to2DigitString(utcTime.getUTCDate()) +
         "T" +
         Certificate.to2DigitString(utcTime.getUTCHours()) +
         Certificate.to2DigitString(utcTime.getUTCMinutes()) +
         Certificate.to2DigitString(utcTime.getUTCSeconds());
};

/**
 * A private method to zero pad an integer to 2 digits.
 * @param {number} x The number to pad.  Assume it is a non-negative integer.
 * @returns {string} The padded string.
 */
Certificate.to2DigitString = function(x)
{
  var result = x.toString();
  return result.length === 1 ? "0" + result : result;
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Data = require('../../data.js').Data;
var Name = require('../../name.js').Name;
var SecurityException = require('../../security//security-exception.js').SecurityException;
var Certificate = require('./certificate.js').Certificate;
var WireFormat = require('../../encoding/wire-format.js').WireFormat;

var IdentityCertificate = function IdentityCertificate(data)
{
  // Call the base constructor.
  if (data != undefined)
    // This works if data is Data or IdentityCertificate.
    Certificate.call(this, data);
  else
    Certificate.call(this);

  this.publicKeyName = new Name();

  if (data instanceof IdentityCertificate) {
    // The copy constructor.
    this.publicKeyName = new Name(data.publicKeyName);
  }
  else if (data instanceof Data) {
    if (!IdentityCertificate.isCorrectName(data.getName()))
      throw new SecurityException(new Error("Wrong Identity Certificate Name!"));

    this.setPublicKeyName();
  }
};
IdentityCertificate.prototype = new Certificate();
IdentityCertificate.prototype.name = "IdentityCertificate";

exports.IdentityCertificate = IdentityCertificate;

/**
 * Override the base class method to check that the name is a valid identity
 * certificate name.
 * @param {Name} name The identity certificate name which is copied.
 * @returns {Data} This Data so that you can chain calls to update values.
 */
IdentityCertificate.prototype.setName = function(name)
{
  if (!IdentityCertificate.isCorrectName(name))
    throw new SecurityException(new Error("Wrong Identity Certificate Name!"));

  // Call the super class method.
  Certificate.prototype.setName.call(this, name);
  this.setPublicKeyName();
  return this;
};

/**
 * Override to call the base class wireDecode then update the public key name.
 * @param {Blob|Buffer} input The buffer with the bytes to decode.
 * @param {WireFormat} wireFormat (optional) A WireFormat object used to decode
 * this object. If omitted, use WireFormat.getDefaultWireFormat().
 */
IdentityCertificate.prototype.wireDecode = function(input, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());

  Certificate.prototype.wireDecode.call(this, input, wireFormat);
  this.setPublicKeyName();
};

IdentityCertificate.prototype.getPublicKeyName = function()
{
  return this.publicKeyName;
};

IdentityCertificate.isIdentityCertificate = function(certificate)
{
  return IdentityCertificate.isCorrectName(certificate.getName());
};

/**
 * Get the public key name from the full certificate name.
 * @param {Name} certificateName The full certificate name.
 * @returns {Name} The related public key name.
 */
IdentityCertificate.certificateNameToPublicKeyName = function(certificateName)
{
  var idString = "ID-CERT";
  var foundIdString = false;
  var idCertComponentIndex = certificateName.size() - 1;
  for (; idCertComponentIndex + 1 > 0; --idCertComponentIndex) {
    if (certificateName.get(idCertComponentIndex).toEscapedString() == idString) {
      foundIdString = true;
      break;
    }
  }

  if (!foundIdString)
    throw new Error
      ("Incorrect identity certificate name " + certificateName.toUri());

  var tempName = certificateName.getSubName(0, idCertComponentIndex);
  var keyString = "KEY";
  var foundKeyString = false;
  var keyComponentIndex = 0;
  for (; keyComponentIndex < tempName.size(); keyComponentIndex++) {
    if (tempName.get(keyComponentIndex).toEscapedString() == keyString) {
      foundKeyString = true;
      break;
    }
  }

  if (!foundKeyString)
    throw new Error
      ("Incorrect identity certificate name " + certificateName.toUri());

  return tempName
    .getSubName(0, keyComponentIndex)
    .append(tempName.getSubName
            (keyComponentIndex + 1, tempName.size() - keyComponentIndex - 1));
};

IdentityCertificate.isCorrectName = function(name)
{
  var i = name.size() - 1;

  var idString = "ID-CERT";
  for (; i >= 0; i--) {
    if (name.get(i).toEscapedString() == idString)
      break;
  }

  if (i < 0)
    return false;

  var keyIdx = 0;
  var keyString = "KEY";
  for (; keyIdx < name.size(); keyIdx++) {
    if(name.get(keyIdx).toEscapedString() == keyString)
      break;
  }

  if (keyIdx >= name.size())
    return false;

  return true;
};

IdentityCertificate.prototype.setPublicKeyName = function()
{
  this.publicKeyName = IdentityCertificate.certificateNameToPublicKeyName
    (this.getName());
};

/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Name = require('../../name.js').Name;
var SecurityException = require('../security-exception.js').SecurityException;
var SyncPromise = require('../../util/sync-promise').SyncPromise;

/**
 * IdentityStorage is a base class for the storage of identity, public keys and
 * certificates. Private keys are stored in PrivateKeyStorage.
 * This is an abstract base class.  A subclass must implement the methods.
 * @constructor
 */
var IdentityStorage = function IdentityStorage()
{
};

exports.IdentityStorage = IdentityStorage;

/**
 * Check if the specified identity already exists.
 * @param {Name} identityName The identity name.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @returns {Promise|SyncPromise} A promise which returns true if the identity
 * exists.
 */
IdentityStorage.prototype.doesIdentityExistPromise = function
  (identityName, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.doesIdentityExistPromise is not implemented"));
};

/**
 * Check if the specified identity already exists.
 * @param {Name} identityName The identity name.
 * @returns {boolean} true if the identity exists, otherwise false.
 * @throws {Error} If doesIdentityExistPromise doesn't return a SyncPromise which
 * is already fulfilled.
 */
IdentityStorage.prototype.doesIdentityExist = function(identityName)
{
  return SyncPromise.getValue(this.doesIdentityExistPromise(identityName, true));
};

/**
 * Add a new identity. Do nothing if the identity already exists.
 * @param {Name} identityName The identity name to be added.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which fulfills when the identity is
 * added.
 */
IdentityStorage.prototype.addIdentityPromise = function(identityName, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.addIdentityPromise is not implemented"));
};

/**
 * Add a new identity. Do nothing if the identity already exists.
 * @param {Name} identityName The identity name to be added.
 * @throws {Error} If addIdentityPromise doesn't return a SyncPromise which
 * is already fulfilled.
 */
IdentityStorage.prototype.addIdentity = function(identityName)
{
  return SyncPromise.getValue(this.addIdentityPromise(identityName, true));
};

/**
 * Revoke the identity.
 * @returns {boolean} true if the identity was revoked, false if not.
 */
IdentityStorage.prototype.revokeIdentity = function()
{
  return SyncPromise.reject(Error
    ("IdentityStorage.revokeIdentity is not implemented"));
};

/**
 * Generate a name for a new key belonging to the identity.
 * @param {Name} identityName The identity name.
 * @param {boolean} useKsk If true, generate a KSK name, otherwise a DSK name.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @returns {Promise|SyncPromise} A promise that returns the generated key Name.
 */
IdentityStorage.prototype.getNewKeyNamePromise = function
  (identityName, useKsk, useSync)
{
  var timestamp = Math.floor(new Date().getTime() / 1000.0);
  while (timestamp <= IdentityStorage.lastTimestamp)
    // Make the timestamp unique.
    timestamp += 1;
  IdentityStorage.lastTimestamp = timestamp;

  // Get the number of seconds as a string.
  var seconds = "" + timestamp;

  var keyIdStr;
  if (useKsk)
    keyIdStr = "ksk-" + seconds;
  else
    keyIdStr = "dsk-" + seconds;

  var keyName = new Name(identityName).append(keyIdStr);

  return this.doesKeyExistPromise(keyName, useSync)
  .then(function(exists) {
    if (exists)
      throw new SecurityException(new Error("Key name already exists"));

    return SyncPromise.resolve(keyName);
  });
};

/**
 * Generate a name for a new key belonging to the identity.
 * @param {Name} identityName The identity name.
 * @param {boolean} useKsk If true, generate a KSK name, otherwise a DSK name.
 * @returns {Name} The generated key name.
 * @throws {Error} If getNewKeyNamePromise doesn't return a SyncPromise which
 * is already fulfilled.
 */
IdentityStorage.prototype.getNewKeyName = function(identityName, useKsk)
{
  return SyncPromise.getValue
    (this.getNewKeyNamePromise(identityName, useKsk, true));
};

/**
 * Check if the specified key already exists.
 * @param {Name} keyName The name of the key.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which returns true if the key exists.
 */
IdentityStorage.prototype.doesKeyExistPromise = function(keyName, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.doesKeyExistPromise is not implemented"));
};

/**
 * Check if the specified key already exists.
 * @param {Name} keyName The name of the key.
 * @returns {boolean} true if the key exists, otherwise false.
 * @throws {Error} If doesKeyExistPromise doesn't return a SyncPromise which
 * is already fulfilled.
 */
IdentityStorage.prototype.doesKeyExist = function(keyName)
{
  return SyncPromise.getValue(this.doesKeyExistPromise(keyName, true));
};

/**
 * Add a public key to the identity storage. Also call addIdentity to ensure
 * that the identityName for the key exists.
 * @param {Name} keyName The name of the public key to be added.
 * @param {number} keyType Type of the public key to be added from KeyType, such
 * as KeyType.RSA..
 * @param {Blob} publicKeyDer A blob of the public key DER to be added.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which fulfills when the key is added,
 * or a promise rejected with SecurityException if a key with the keyName already
 * exists.
 */
IdentityStorage.prototype.addKeyPromise = function
  (keyName, keyType, publicKeyDer, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.addKeyPromise is not implemented"));
};

/**
 * Add a public key to the identity storage. Also call addIdentity to ensure
 * that the identityName for the key exists.
 * @param {Name} keyName The name of the public key to be added.
 * @param {number} keyType Type of the public key to be added from KeyType, such
 * as KeyType.RSA..
 * @param {Blob} publicKeyDer A blob of the public key DER to be added.
 * @throws {SecurityException} if a key with the keyName already exists.
 * @throws {Error} If addKeyPromise doesn't return a SyncPromise which
 * is already fulfilled.
 */
IdentityStorage.prototype.addKey = function(keyName, keyType, publicKeyDer)
{
  return SyncPromise.getValue
    (this.addKeyPromise(keyName, keyType, publicKeyDer, true));
};

/**
 * Get the public key DER blob from the identity storage.
 * @param {Name} keyName The name of the requested public key.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which returns the DER Blob, or a Blob
 * with a null pointer if not found.
 */
IdentityStorage.prototype.getKeyPromise = function(keyName, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.getKeyPromise is not implemented"));
};

/**
 * Get the public key DER blob from the identity storage.
 * @param {Name} keyName The name of the requested public key.
 * @returns {Blob} The DER Blob.  If not found, return a Blob with a null pointer.
 * @throws {Error} If getKeyPromise doesn't return a SyncPromise which
 * is already fulfilled.
 */
IdentityStorage.prototype.getKey = function(keyName)
{
  return SyncPromise.getValue(this.getKeyPromise(keyName, true));
};

/**
 * Activate a key.  If a key is marked as inactive, its private part will not be
 * used in packet signing.
 * @param {Name} keyName name of the key
 */
IdentityStorage.prototype.activateKey = function(keyName)
{
  throw new Error("IdentityStorage.activateKey is not implemented");
};

/**
 * Deactivate a key. If a key is marked as inactive, its private part will not
 * be used in packet signing.
 * @param {Name} keyName name of the key
 */
IdentityStorage.prototype.deactivateKey = function(keyName)
{
  throw new Error("IdentityStorage.deactivateKey is not implemented");
};

/**
 * Check if the specified certificate already exists.
 * @param {Name} certificateName The name of the certificate.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which returns true if the certificate
 * exists.
 */
IdentityStorage.prototype.doesCertificateExistPromise = function
  (certificateName, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.doesCertificateExistPromise is not implemented"));
};

/**
 * Check if the specified certificate already exists.
 * @param {Name} certificateName The name of the certificate.
 * @returns {boolean} true if the certificate exists, otherwise false.
 * @throws {Error} If doesCertificateExistPromise doesn't return a SyncPromise
 * which is already fulfilled.
 */
IdentityStorage.prototype.doesCertificateExist = function(certificateName)
{
  return SyncPromise.getValue
    (this.doesCertificateExistPromise(certificateName, true));
};

/**
 * Add a certificate to the identity storage.
 * @param {IdentityCertificate} certificate The certificate to be added.  This
 * makes a copy of the certificate.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which fulfills when the certificate
 * is added, or a promise rejected with SecurityException if the certificate is
 * already installed.
 */
IdentityStorage.prototype.addCertificatePromise = function(certificate, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.addCertificatePromise is not implemented"));
};

/**
 * Add a certificate to the identity storage.
 * @param {IdentityCertificate} certificate The certificate to be added.  This
 * makes a copy of the certificate.
 * @throws {SecurityException} if the certificate is already installed.
 * @throws {Error} If addCertificatePromise doesn't return a SyncPromise which
 * is already fulfilled.
 */
IdentityStorage.prototype.addCertificate = function(certificate)
{
  return SyncPromise.getValue(this.addCertificatePromise(certificate, true));
};

/**
 * Get a certificate from the identity storage.
 * @param {Name} certificateName The name of the requested certificate.
 * @param {boolean} allowAny If false, only a valid certificate will be returned,
 * otherwise validity is disregarded.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which returns the requested
 * IdentityCertificate or null if not found.
 */
IdentityStorage.prototype.getCertificatePromise = function
  (certificateName, allowAny, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.getCertificatePromise is not implemented"));
};

/**
 * Get a certificate from the identity storage.
 * @param {Name} certificateName The name of the requested certificate.
 * @param {boolean} allowAny If false, only a valid certificate will be returned,
 * otherwise validity is disregarded.
 * @returns {IdentityCertificate} The requested certificate.  If not found, return a shared_ptr
 * with a null pointer.
 * @throws {Error} If getCertificatePromise doesn't return a SyncPromise which
 * is already fulfilled.
 */
IdentityStorage.prototype.getCertificate = function(certificateName, allowAny)
{
  return SyncPromise.getValue
    (this.getValuePromise(certificateName, allowAny, true));
};

/*****************************************
 *           Get/Set Default             *
 *****************************************/

/**
 * Get the default identity.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which returns the Name of default
 * identity, or a promise rejected with SecurityException if the default
 * identity is not set.
 */
IdentityStorage.prototype.getDefaultIdentityPromise = function(useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.getDefaultIdentityPromise is not implemented"));
};

/**
 * Get the default identity.
 * @returns {Name} The name of default identity.
 * @throws SecurityException if the default identity is not set.
 * @throws {Error} If getDefaultIdentityPromise doesn't return a SyncPromise
 * which is already fulfilled.
 */
IdentityStorage.prototype.getDefaultIdentity = function()
{
  return SyncPromise.getValue
    (this.getDefaultIdentityPromise(true));
};

/**
 * Get the default key name for the specified identity.
 * @param {Name} identityName The identity name.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which returns the default key Name,
 * or a promise rejected with SecurityException if the default key name for the
 * identity is not set.
 */
IdentityStorage.prototype.getDefaultKeyNameForIdentityPromise = function
  (identityName, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.getDefaultKeyNameForIdentityPromise is not implemented"));
};

/**
 * Get the default key name for the specified identity.
 * @param {Name} identityName The identity name.
 * @returns {Name} The default key name.
 * @throws SecurityException if the default key name for the identity is not set.
 * @throws {Error} If getDefaultKeyNameForIdentityPromise doesn't return a
 * SyncPromise which is already fulfilled.
 */
IdentityStorage.prototype.getDefaultKeyNameForIdentity = function(identityName)
{
  return SyncPromise.getValue
    (this.getDefaultKeyNameForIdentityPromise(identityName, true));
};

/**
 * Get the default certificate name for the specified identity.
 * @param {Name} identityName The identity name.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which returns the default certificate
 * Name, or a promise rejected with SecurityException if the default key name
 * for the identity is not set or the default certificate name for the key name
 * is not set.
 */
IdentityStorage.prototype.getDefaultCertificateNameForIdentityPromise = function
  (identityName, useSync)
{
  var thisStorage = this;
  return this.getDefaultKeyNameForIdentityPromise(identityName)
  .then(function(keyName) {
    return thisStorage.getDefaultCertificateNameForKeyPromise(keyName);
  });
};

/**
 * Get the default certificate name for the specified identity.
 * @param {Name} identityName The identity name.
 * @returns {Name} The default certificate name.
 * @throws SecurityException if the default key name for the identity is not
 * set or the default certificate name for the key name is not set.
 * @throws {Error} If getDefaultCertificateNameForIdentityPromise doesn't return
 * a SyncPromise which is already fulfilled.
 */
IdentityStorage.prototype.getDefaultCertificateNameForIdentity = function
  (identityName)
{
  return SyncPromise.getValue
    (this.getDefaultCertificateNameForIdentityPromise(identityName, true));
};

/**
 * Get the default certificate name for the specified key.
 * @param {Name} keyName The key name.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which returns the default certificate
 * Name, or a promise rejected with SecurityException if the default certificate
 * name for the key name is not set.
 */
IdentityStorage.prototype.getDefaultCertificateNameForKeyPromise = function
  (keyName, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.getDefaultCertificateNameForKeyPromise is not implemented"));
};

/**
 * Get the default certificate name for the specified key.
 * @param {Name} keyName The key name.
 * @returns {Name} The default certificate name.
 * @throws SecurityException if the default certificate name for the key name
 * is not set.
 * @throws {Error} If getDefaultCertificateNameForKeyPromise doesn't return a
 * SyncPromise which is already fulfilled.
 */
IdentityStorage.prototype.getDefaultCertificateNameForKey = function(keyName)
{
  return SyncPromise.getValue
    (this.getDefaultCertificateNameForKeyPromise(keyName, true));
};

/**
 * Append all the key names of a particular identity to the nameList.
 * @param identityName {Name} The identity name to search for.
 * @param nameList {Array<Name>} Append result names to nameList.
 * @param isDefault {boolean} If true, add only the default key name. If false,
 * add only the non-default key names.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which fulfills when the names are
 * added to nameList.
 */
IdentityStorage.prototype.getAllKeyNamesOfIdentityPromise = function
  (identityName, nameList, isDefault, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.getAllKeyNamesOfIdentityPromise is not implemented"));
};

/**
 * Append all the key names of a particular identity to the nameList.
 * @param identityName {Name} The identity name to search for.
 * @param nameList {Array<Name>} Append result names to nameList.
 * @param isDefault {boolean} If true, add only the default key name. If false,
 * add only the non-default key names.
 * @throws {Error} If getAllKeyNamesOfIdentityPromise doesn't return a
 * SyncPromise which is already fulfilled.
 */
IdentityStorage.prototype.getAllKeyNamesOfIdentity = function
  (identityName, nameList, isDefault)
{
  return SyncPromise.getValue
    (this.getAllKeyNamesOfIdentityPromise(identityName, nameList, isDefault, true));
};

/**
 * Set the default identity.  If the identityName does not exist, then clear the
 * default identity so that getDefaultIdentity() throws an exception.
 * @param {Name} identityName The default identity name.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which fulfills when the default
 * identity is set.
 */
IdentityStorage.prototype.setDefaultIdentityPromise = function
  (identityName, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.setDefaultIdentityPromise is not implemented"));
};

/**
 * Set the default identity.  If the identityName does not exist, then clear the
 * default identity so that getDefaultIdentity() throws an exception.
 * @param {Name} identityName The default identity name.
 * @throws {Error} If setDefaultIdentityPromise doesn't return a SyncPromise which
 * is already fulfilled.
 */
IdentityStorage.prototype.setDefaultIdentity = function(identityName)
{
  return SyncPromise.getValue
    (this.setDefaultIdentityPromise(identityName, true));
};

/**
 * Set a key as the default key of an identity. The identity name is inferred
 * from keyName.
 * @param {Name} keyName The name of the key.
 * @param {Name} identityNameCheck (optional) The identity name to check that the
 * keyName contains the same identity name. If an empty name, it is ignored.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which fulfills when the default key
 * name is set.
 */
IdentityStorage.prototype.setDefaultKeyNameForIdentityPromise = function
  (keyName, identityNameCheck, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.setDefaultKeyNameForIdentityPromise is not implemented"));
};

/**
 * Set a key as the default key of an identity. The identity name is inferred
 * from keyName.
 * @param {Name} keyName The name of the key.
 * @param {Name} identityNameCheck (optional) The identity name to check that the
 * keyName contains the same identity name. If an empty name, it is ignored.
 * @throws {Error} If setDefaultKeyNameForIdentityPromise doesn't return a
 * SyncPromise which is already fulfilled.
 */
IdentityStorage.prototype.setDefaultKeyNameForIdentity = function
  (keyName, identityNameCheck)
{
  return SyncPromise.getValue
    (this.setDefaultKeyNameForIdentityPromise(keyName, identityNameCheck, true));
};

/**
 * Set the default key name for the specified identity.
 * @param {Name} keyName The key name.
 * @param {Name} certificateName The certificate name.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which fulfills when the default
 * certificate name is set.
 */
IdentityStorage.prototype.setDefaultCertificateNameForKeyPromise = function
  (keyName, certificateName, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.setDefaultCertificateNameForKeyPromise is not implemented"));
};

/**
 * Set the default key name for the specified identity.
 * @param {Name} keyName The key name.
 * @param {Name} certificateName The certificate name.
 * @throws {Error} If setDefaultCertificateNameForKeyPromise doesn't return a
 * SyncPromise which is already fulfilled.
 */
IdentityStorage.prototype.setDefaultCertificateNameForKey = function
  (keyName, certificateName)
{
  return SyncPromise.getValue
    (this.setDefaultCertificateNameForKeyPromise(keyName, certificateName, true));
};

/*****************************************
 *            Delete Methods             *
 *****************************************/

/**
 * Delete a certificate.
 * @param {Name} certificateName The certificate name.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which fulfills when the certificate
 * info is deleted.
 */
IdentityStorage.prototype.deleteCertificateInfoPromise = function
  (certificateName, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.deleteCertificateInfoPromise is not implemented"));
};

/**
 * Delete a certificate.
 * @param {Name} certificateName The certificate name.
 * @throws {Error} If deleteCertificateInfoPromise doesn't return a SyncPromise
 * which is already fulfilled.
 */
IdentityStorage.prototype.deleteCertificateInfo = function(certificateName)
{
  return SyncPromise.getValue
    (this.deleteCertificateInfoPromise(certificateName, true));
};

/**
 * Delete a public key and related certificates.
 * @param {Name} keyName The key name.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which fulfills when the public key
 * info is deleted.
 */
IdentityStorage.prototype.deletePublicKeyInfoPromise = function(keyName, useSync)
{
  return SyncPromise.reject
    (Error("IdentityStorage.deletePublicKeyInfoPromise is not implemented"));
};

/**
 * Delete a public key and related certificates.
 * @param {Name} keyName The key name.
 * @throws {Error} If deletePublicKeyInfoPromise doesn't return a SyncPromise
 * which is already fulfilled.
 */
IdentityStorage.prototype.deletePublicKeyInfo = function(keyName)
{
  return SyncPromise.getValue
    (this.deletePublicKeyInfoPromise(keyName, true));
};

/**
 * Delete an identity and related public keys and certificates.
 * @param {Name} identity The identity name.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which fulfills when the identity info
 * is deleted.
 */
IdentityStorage.prototype.deleteIdentityInfoPromise = function(identity, useSync)
{
  return SyncPromise.reject(Error
    ("IdentityStorage.deleteIdentityInfoPromise is not implemented"));
};

/**
 * Delete an identity and related public keys and certificates.
 * @param {Name} identity The identity name.
 * @throws {Error} If deleteIdentityInfoPromise doesn't return a SyncPromise
 * which is already fulfilled.
 */
IdentityStorage.prototype.deleteIdentityInfo = function(identity)
{
  return SyncPromise.getValue
    (this.deleteIdentityInfoPromise(identity, true));
};

// Track the lastTimestamp so that each timestamp is unique.
IdentityStorage.lastTimestamp = Math.floor(new Date().getTime() / 1000.0);
/**
 * Copyright (C) 2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

// Don't require modules since this is meant for the browser, not Node.js.

/**
 * IndexedDbIdentityStorage extends IdentityStorage and implements its methods
 * to store identity, public key and certificate objects using the browser's
 * IndexedDB service.
 * @constructor
 */
var IndexedDbIdentityStorage = function IndexedDbIdentityStorage()
{
  IdentityStorage.call(this);

  this.database = new Dexie("ndnsec-public-info");
  // The database schema imitates MemoryIdentityStorage.
  this.database.version(1).stores({
    // A table for global values. It currently only has the defaultIdentityUri.
    // "key" is the key like "defaultIdentityUri" // string
    // "value" is the value. For "defaultIdentityUri" the value is the
    //         default identity name URI, or absent if not defined. // string
    globals: "key",

    // "identityNameUri" is the identity name URI          // string
    // "defaultKeyUri" is the default key name URI or null // string
    identity: "identityNameUri",

    // "keyNameUri" is the key name URI                             // string
    // "keyType" is the type of the public key            // number from KeyType
    // "keyDer" is the public key DER                               // Uint8Array
    // "defaultCertificateUri" is the default cert name URI or null // string
    publicKey: "keyNameUri",

    // "certificateNameUri" is the certificate name URI // string
    // "encoding" is the certificate wire encoding      // Uint8Array
    certificate: "certificateNameUri"
  });
  this.database.open();
};

IndexedDbIdentityStorage.prototype = new IdentityStorage();
IndexedDbIdentityStorage.prototype.name = "IndexedDbIdentityStorage";

/**
 * Check if the specified identity already exists.
 * @param {Name} identityName The identity name.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @returns {Promise} A promise which returns true if the identity exists.
 */
IndexedDbIdentityStorage.prototype.doesIdentityExistPromise = function
  (identityName, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.doesIdentityExistPromise is only supported for async")));

  return this.database.identity.where("identityNameUri").equals
    (identityName.toUri())
  .count()
  .then(function(count) {
    return Promise.resolve(count > 0);
  });
};

/**
 * Add a new identity. Do nothing if the identity already exists.
 * @param {Name} identityName The identity name to be added.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which fulfills when the identity is added.
 */
IndexedDbIdentityStorage.prototype.addIdentityPromise = function
  (identityName, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.addIdentityPromise is only supported for async")));

  var thisStorage = this;
  return this.doesIdentityExistPromise(identityName)
  .then(function(exists) {
    if (exists)
      // Do nothing.
      return Promise.resolve();

    return thisStorage.database.identity.put
      ({ identityNameUri: identityName.toUri(), defaultKeyUri: null });
  });
};

/**
 * Check if the specified key already exists.
 * @param {Name} keyName The name of the key.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which returns true if the key exists.
 */
IndexedDbIdentityStorage.prototype.doesKeyExistPromise = function
  (keyName, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.doesKeyExistPromise is only supported for async")));

  return this.database.publicKey.where("keyNameUri").equals(keyName.toUri())
  .count()
  .then(function(count) {
    return Promise.resolve(count > 0);
  });
};

/**
 * Add a public key to the identity storage. Also call addIdentity to ensure
 * that the identityName for the key exists.
 * @param {Name} keyName The name of the public key to be added.
 * @param {number} keyType Type of the public key to be added from KeyType, such
 * as KeyType.RSA..
 * @param {Blob} publicKeyDer A blob of the public key DER to be added.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which fulfills when the key is added, or a
 * promise rejected with SecurityException if a key with the keyName already
 * exists.
 */
IndexedDbIdentityStorage.prototype.addKeyPromise = function
  (keyName, keyType, publicKeyDer, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.addKeyPromise is only supported for async")));

  var identityName = keyName.getSubName(0, keyName.size() - 1);

  var thisStorage = this;
  return this.addIdentityPromise(identityName)
  .then(function() {
    return thisStorage.doesKeyExistPromise(keyName);
  })
  .then(function(exists) {
    if (exists)
      throw new SecurityException(new Error
        ("A key with the same name already exists!"));

    return thisStorage.database.publicKey.put
      ({ keyNameUri: keyName.toUri(), keyType: keyType,
         keyDer: new Blob(publicKeyDer, true).buf(),
         defaultCertificate: null });
  });
};

/**
 * Get the public key DER blob from the identity storage.
 * @param {Name} keyName The name of the requested public key.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which returns the DER Blob, or a Blob with a
 * null pointer if not found.
 */
IndexedDbIdentityStorage.prototype.getKeyPromise = function(keyName, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.getKeyPromise is only supported for async")));

  return this.database.publicKey.get(keyName.toUri())
  .then(function(publicKeyEntry) {
    if (publicKeyEntry)
      return Promise.resolve(new Blob(publicKeyEntry.keyDer));
    else
      // Not found.  Silently return a null Blob.
      return Promise.resolve(new Blob());
  });
};

/**
 * Check if the specified certificate already exists.
 * @param {Name} certificateName The name of the certificate.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which returns true if the certificate exists.
 */
IndexedDbIdentityStorage.prototype.doesCertificateExistPromise = function
  (certificateName, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.doesCertificateExistPromise is only supported for async")));

  return this.database.certificate.where("certificateNameUri").equals
    (certificateName.toUri())
  .count()
  .then(function(count) {
    return Promise.resolve(count > 0);
  });
};

/**
 * Add a certificate to the identity storage.
 * @param {IdentityCertificate} certificate The certificate to be added.  This
 * makes a copy of the certificate.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which fulfills when the certificate is added,
 * or a promise rejected with SecurityException if the certificate is already
 * installed.
 */
IndexedDbIdentityStorage.prototype.addCertificatePromise = function
  (certificate, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.addCertificatePromise is only supported for async")));

  var certificateName = certificate.getName();
  var keyName = certificate.getPublicKeyName();

  var thisStorage = this;
  return this.doesKeyExistPromise(keyName)
  .then(function(exists) {
    if (!exists)
      throw new SecurityException(new Error
        ("No corresponding Key record for certificate! " +
         keyName.toUri() + " " + certificateName.toUri()));

    // Check if the certificate already exists.
    return thisStorage.doesCertificateExistPromise(certificateName);
  })
  .then(function(exists) {
    if (exists)
      throw new SecurityException(new Error
        ("Certificate has already been installed!"));

    // Check if the public key of the certificate is the same as the key record.
    return thisStorage.getKeyPromise(keyName);
  })
  .then(function(keyBlob) {
    if (keyBlob.isNull() ||
        !DataUtils.arraysEqual(keyBlob.buf(),
          certificate.getPublicKeyInfo().getKeyDer().buf()))
      throw new SecurityException(new Error
        ("The certificate does not match the public key!"));

    // Insert the certificate.
    // wireEncode returns the cached encoding if available.
    return thisStorage.database.certificate.put
      ({ certificateNameUri: certificateName.toUri(),
         encoding: certificate.wireEncode().buf() });
  });
};

/**
 * Get a certificate from the identity storage.
 * @param {Name} certificateName The name of the requested certificate.
 * @param {boolean} allowAny If false, only a valid certificate will
 * be returned, otherwise validity is disregarded.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which returns the requested
 * IdentityCertificate or null if not found.
 */
IndexedDbIdentityStorage.prototype.getCertificatePromise = function
  (certificateName, allowAny, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.getCertificatePromise is only supported for async")));

  if (!allowAny)
    return Promise.reject(new Error
      ("IndexedDbIdentityStorage.getCertificate for !allowAny is not implemented"));

  return this.database.certificate.get(certificateName.toUri())
  .then(function(certificateEntry) {
    if (certificateEntry) {
      var certificate = new IdentityCertificate();
      certificate.wireDecode(certificateEntry.encoding);
      return Promise.resolve(certificate);
    }
    else
      // Not found.  Silently return null.
      return Promise.resolve(null);
  });
};

/*****************************************
 *           Get/Set Default             *
 *****************************************/

/**
 * Get the default identity.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which returns the Name of default identity,
 * or a promise rejected with SecurityException if the default identity is not
 * set.
 */
IndexedDbIdentityStorage.prototype.getDefaultIdentityPromise = function(useSync)
{
  return this.database.globals.get("defaultIdentityUri")
  .then(function(defaultIdentityEntry) {
    if (defaultIdentityEntry)
      return Promise.resolve(new Name(defaultIdentityEntry.value));
    else
      throw new SecurityException(new Error
        ("IndexedDbIdentityStorage.getDefaultIdentity: The default identity is not defined"));
  });
};

/**
 * Get the default key name for the specified identity.
 * @param {Name} identityName The identity name.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which returns the default key Name, or a
 * promise rejected with SecurityException if the default key name for the
 * identity is not set.
 */
IndexedDbIdentityStorage.prototype.getDefaultKeyNameForIdentityPromise = function
  (identityName, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.getDefaultKeyNameForIdentityPromise is only supported for async")));

  return this.database.identity.get(identityName.toUri())
  .then(function(identityEntry) {
    if (identityEntry) {
      if (identityEntry.defaultKeyUri != null)
        return Promise.resolve(new Name(identityEntry.defaultKeyUri));
      else
        throw new SecurityException(new Error("No default key set."));
    }
    else
      throw new SecurityException(new Error("Identity not found."));
  });
};

/**
 * Get the default certificate name for the specified key.
 * @param {Name} keyName The key name.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which returns the default certificate Name,
 * or a promise rejected with SecurityException if the default certificate name
 * for the key name is not set.
 */
IndexedDbIdentityStorage.prototype.getDefaultCertificateNameForKeyPromise = function
  (keyName, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.getDefaultCertificateNameForKeyPromise is only supported for async")));

  return this.database.publicKey.get(keyName.toUri())
  .then(function(publicKeyEntry) {
    if (publicKeyEntry) {
      if (publicKeyEntry.defaultCertificateUri != null)
        return Promise.resolve(new Name(publicKeyEntry.defaultCertificateUri));
      else
        throw new SecurityException(new Error("No default certificate set."));
    }
    else
      throw new SecurityException(new Error("Key not found."));
  });
};

/**
 * Append all the key names of a particular identity to the nameList.
 * @param identityName {Name} The identity name to search for.
 * @param nameList {Array<Name>} Append result names to nameList.
 * @param isDefault {boolean} If true, add only the default key name. If false,
 * add only the non-default key names.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which fulfills when the names are added to
 * nameList.
 */
IndexedDbIdentityStorage.prototype.getAllKeyNamesOfIdentityPromise = function
  (identityName, nameList, isDefault, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.getAllKeyNamesOfIdentityPromise is only supported for async")));

  var defaultKeyName = null;
  var thisStorage = this;
  return this.getDefaultKeyNameForIdentityPromise(identityName)
  .then(function(localDefaultKeyName) {
    defaultKeyName = localDefaultKeyName;
    return SyncPromise.resolve();
  }, function(err) {
    // The default key name was not found.
    return SyncPromise.resolve();
  })
  .then(function() {
    // Iterate through each publicKey a to find ones that match identityName.
    // This is a little inefficient, but we don't expect the in-browswer
    // database to be very big, we don't expect to use this function often (for
    // deleting an identity), and this is simpler than complicating the database
    // schema to store the identityName with each publicKey.
    return thisStorage.database.publicKey.each(function(publicKeyEntry) {
      var keyName = new Name(publicKeyEntry.keyNameUri);
      var keyIdentityName = keyName.getPrefix(-1);
      
      if (keyIdentityName.equals(identityName)) {
        var keyNameIsDefault = 
          (defaultKeyName != null && keyName.equals(defaultKeyName));
        if (isDefault && keyNameIsDefault)
          nameList.push(keyName);
        else if (!isDefault && !keyNameIsDefault)
          nameList.push(keyName);
      }
    });
  });
};

/**
 * Set the default identity.  If the identityName does not exist, then clear the
 * default identity so that getDefaultIdentity() throws an exception.
 * @param {Name} identityName The default identity name.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which fulfills when the default identity is set.
 */
IndexedDbIdentityStorage.prototype.setDefaultIdentityPromise = function
  (identityName, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.setDefaultIdentityPromise is only supported for async")));

  var thisStorage = this;
  return this.doesIdentityExistPromise(identityName)
  .then(function(exists) {
    if (exists)
      return thisStorage.database.globals.put
        ({ key: "defaultIdentityUri", value: identityName.toUri() });
    else
      // The identity doesn't exist, so clear the default.
      return thisStorage.database.globals.delete("defaultIdentityUri");
  });
};

/**
 * Set a key as the default key of an identity. The identity name is inferred
 * from keyName.
 * @param {Name} keyName The name of the key.
 * @param {Name} identityNameCheck (optional) The identity name to check that the
 * keyName contains the same identity name. If an empty name, it is ignored.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which fulfills when the default key name is
 * set.
 */
IndexedDbIdentityStorage.prototype.setDefaultKeyNameForIdentityPromise = function
  (keyName, identityNameCheck, useSync)
{
  useSync = (typeof identityNameCheck === "boolean") ? identityNameCheck : useSync;
  identityNameCheck = (identityNameCheck instanceof Name) ? identityNameCheck : null;

  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.setDefaultKeyNameForIdentityPromise is only supported for async")));

  var identityName = keyName.getPrefix(-1);

  if (identityNameCheck != null && identityNameCheck.size() > 0 &&
      !identityNameCheck.equals(identityName))
    return Promise.reject(new SecurityException(new Error
      ("The specified identity name does not match the key name")));

  // update does nothing if the identityName doesn't exist.
  return this.database.identity.update
    (identityName.toUri(), { defaultKeyUri: keyName.toUri() });
};

/**
 * Set the default key name for the specified identity.
 * @param {Name} keyName The key name.
 * @param {Name} certificateName The certificate name.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which fulfills when the default certificate
 * name is set.
 */
IndexedDbIdentityStorage.prototype.setDefaultCertificateNameForKeyPromise = function
  (keyName, certificateName, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.setDefaultCertificateNameForKeyPromise is only supported for async")));

  // update does nothing if the keyName doesn't exist.
  return this.database.publicKey.update
    (keyName.toUri(), { defaultCertificateUri: certificateName.toUri() });
};

/*****************************************
 *            Delete Methods             *
 *****************************************/

/**
 * Delete a certificate.
 * @param {Name} certificateName The certificate name.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which fulfills when the certificate info is
 * deleted.
 */
IndexedDbIdentityStorage.prototype.deleteCertificateInfoPromise = function
  (certificateName, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.deleteCertificateInfoPromise is only supported for async")));

  if (certificateName.size() == 0)
    return Promise.resolve();

  return this.database.certificate.delete(certificateName.toUri());
};

/**
 * Delete a public key and related certificates.
 * @param {Name} keyName The key name.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which fulfills when the public key info is
 * deleted.
 */
IndexedDbIdentityStorage.prototype.deletePublicKeyInfoPromise = function
  (keyName, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.deletePublicKeyInfoPromise is only supported for async")));

  if (keyName.size() == 0)
    return Promise.resolve();

  var thisStorage = this;
  return this.database.publicKey.delete(keyName.toUri())
  .then(function() {
    // Iterate through each certificate to find ones that match keyName. This is
    // a little inefficient, but we don't expect the in-browswer database to be
    // very big, we don't expect to delete often, and this is simpler than
    // complicating the database schema to store the keyName with each certificate.
    return thisStorage.database.certificate.each(function(certificateEntry) {
      if (IdentityCertificate.certificateNameToPublicKeyName
          (new Name(certificateEntry.certificateNameUri)).equals(keyName))
        thisStorage.database.certificate.delete
          (certificateEntry.certificateNameUri);
    });
  });
};

/**
 * Delete an identity and related public keys and certificates.
 * @param {Name} identityName The identity name.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which fulfills when the identity info is
 * deleted.
 */
IndexedDbIdentityStorage.prototype.deleteIdentityInfoPromise = function
  (identityName, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbIdentityStorage.deleteIdentityInfoPromise is only supported for async")));

  var thisStorage = this;
  return this.database.identity.delete(identityName.toUri())
  // Iterate through each publicKey and certificate to find ones that match
  // identityName. This is a little inefficient, but we don't expect the
  // in-browswer database to be very big, we don't expect to delete often, and
  // this is simpler than complicating the database schema to store the
  // identityName with each publicKey and certificate.
  .then(function() {
    return thisStorage.database.publicKey.each(function(publicKeyEntry) {
      var keyIdentityName = new Name(publicKeyEntry.keyNameUri).getPrefix(-1);
      if (keyIdentityName.equals(identityName))
        thisStorage.database.publicKey.delete(publicKeyEntry.keyNameUri);
    });
  })
  .then(function() {
    return thisStorage.database.certificate.each(function(certificateEntry) {
      var certificateKeyName = IdentityCertificate.certificateNameToPublicKeyName
        (new Name(certificateEntry.certificateNameUri));
      var certificateIdentityName = certificateKeyName.getPrefix(-1);
      if (certificateIdentityName.equals(identityName))
        thisStorage.database.certificate.delete
          (certificateEntry.certificateNameUri);
    });
  });
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Data = require('../../data.js').Data;
var Name = require('../../name.js').Name;
var Blob = require('../../util/blob.js').Blob;
var KeyType = require('../security-types.js').KeyType;
var DataUtils = require('../../encoding/data-utils.js').DataUtils;
var SecurityException = require('../security-exception.js').SecurityException;
var SyncPromise = require('../../util/sync-promise').SyncPromise;
var IdentityStorage = require('./identity-storage.js').IdentityStorage;

/**
 * MemoryIdentityStorage extends IdentityStorage and implements its methods to
 * store identity, public key and certificate objects in memory. The application
 * must get the objects through its own means and add the objects to the
 * MemoryIdentityStorage object. To use permanent file-based storage, see
 * BasicIdentityStorage.
 * @constructor
 */
var MemoryIdentityStorage = function MemoryIdentityStorage()
{
  // Call the base constructor.
  IdentityStorage.call(this);

  // The map key is the identityName.toUri(). The value is the object
  //   {defaultKey // Name
  //   }.
  this.identityStore = {};
  // The default identity in identityStore, or "" if not defined.
  this.defaultIdentity = "";
  // The key is the keyName.toUri(). The value is the object
  //  {keyType, // number from KeyType
  //   keyDer   // Blob
  //   defaultCertificate // Name
  //  }.
  this.keyStore = {};
  // The key is the key is the certificateName.toUri(). The value is the
  //   encoded certificate.
  this.certificateStore = {};
};

MemoryIdentityStorage.prototype = new IdentityStorage();
MemoryIdentityStorage.prototype.name = "MemoryIdentityStorage";

exports.MemoryIdentityStorage = MemoryIdentityStorage;
/**
 * Check if the specified identity already exists.
 * @param {Name} identityName The identity name.
 * @returns {SyncPromise} A promise which returns true if the identity exists.
 */
MemoryIdentityStorage.prototype.doesIdentityExistPromise = function(identityName)
{
  return SyncPromise.resolve
    (this.identityStore[identityName.toUri()] !== undefined);
};

/**
 * Add a new identity. Do nothing if the identity already exists.
 * @param {Name} identityName The identity name to be added.
 * @return {SyncPromise} A promise which fulfills when the identity is added.
 */
MemoryIdentityStorage.prototype.addIdentityPromise = function(identityName)
{
  var identityUri = identityName.toUri();
  if (this.identityStore[identityUri] === undefined)
    this.identityStore[identityUri] = { defaultKey: null };

  return SyncPromise.resolve();
};

/**
 * Check if the specified key already exists.
 * @param {Name} keyName The name of the key.
 * @return {SyncPromise} A promise which returns true if the key exists.
 */
MemoryIdentityStorage.prototype.doesKeyExistPromise = function(keyName)
{
  return SyncPromise.resolve(this.keyStore[keyName.toUri()] !== undefined);
};

/**
 * Add a public key to the identity storage. Also call addIdentity to ensure
 * that the identityName for the key exists.
 * @param {Name} keyName The name of the public key to be added.
 * @param {number} keyType Type of the public key to be added from KeyType, such
 * as KeyType.RSA..
 * @param {Blob} publicKeyDer A blob of the public key DER to be added.
 * @return {SyncPromise} A promise which fulfills when the key is added, or a
 * promise rejected with SecurityException if a key with the keyName already
 * exists.
 */
MemoryIdentityStorage.prototype.addKeyPromise = function
  (keyName, keyType, publicKeyDer)
{
  var identityName = keyName.getSubName(0, keyName.size() - 1);

  this.addIdentity(identityName);

  if (this.doesKeyExist(keyName))
    return SyncPromise.reject(new SecurityException(new Error
      ("A key with the same name already exists!")));

  this.keyStore[keyName.toUri()] =
    { keyType: keyType, keyDer: new Blob(publicKeyDer), defaultCertificate: null };

  return SyncPromise.resolve();
};

/**
 * Get the public key DER blob from the identity storage.
 * @param {Name} keyName The name of the requested public key.
 * @return {SyncPromise} A promise which returns the DER Blob, or a Blob with a
 * null pointer if not found.
 */
MemoryIdentityStorage.prototype.getKeyPromise = function(keyName)
{
  var keyNameUri = keyName.toUri();
  var entry = this.keyStore[keyNameUri];
  if (entry === undefined)
    // Not found.  Silently return a null Blob.
    return SyncPromise.resolve(new Blob());

  return SyncPromise.resolve(entry.keyDer);
};

/**
 * Check if the specified certificate already exists.
 * @param {Name} certificateName The name of the certificate.
 * @return {SyncPromise} A promise which returns true if the certificate exists.
 */
MemoryIdentityStorage.prototype.doesCertificateExistPromise = function
  (certificateName)
{
  return SyncPromise.resolve
    (this.certificateStore[certificateName.toUri()] !== undefined);
};

/**
 * Add a certificate to the identity storage.
 * @param {IdentityCertificate} certificate The certificate to be added.  This
 * makes a copy of the certificate.
 * @return {SyncPromise} A promise which fulfills when the certificate is added,
 * or a promise rejected with SecurityException if the certificate is already
 * installed.
 */
MemoryIdentityStorage.prototype.addCertificatePromise = function(certificate)
{
  var certificateName = certificate.getName();
  var keyName = certificate.getPublicKeyName();

  if (!this.doesKeyExist(keyName))
    return SyncPromise.reject(new SecurityException(new Error
      ("No corresponding Key record for certificate! " +
       keyName.toUri() + " " + certificateName.toUri())));

  // Check if the certificate already exists.
  if (this.doesCertificateExist(certificateName))
    return SyncPromise.reject(new SecurityException(new Error
      ("Certificate has already been installed!")));

  // Check if the public key of the certificate is the same as the key record.
  var keyBlob = this.getKey(keyName);
  if (keyBlob.isNull() ||
      !DataUtils.arraysEqual(keyBlob.buf(),
        certificate.getPublicKeyInfo().getKeyDer().buf()))
    return SyncPromise.reject(new SecurityException(new Error
      ("The certificate does not match the public key!")));

  // Insert the certificate.
  // wireEncode returns the cached encoding if available.
  this.certificateStore[certificateName.toUri()] = certificate.wireEncode();

  return SyncPromise.resolve();
};

/**
 * Get a certificate from the identity storage.
 * @param {Name} certificateName The name of the requested certificate.
 * @param {boolean} allowAny If false, only a valid certificate will
 * be returned, otherwise validity is disregarded.
 * @return {SyncPromise} A promise which returns the requested
 * IdentityCertificate or null if not found.
 */
MemoryIdentityStorage.prototype.getCertificatePromise = function
  (certificateName, allowAny)
{
  if (!allowAny)
    return SyncPromise.reject(new Error
      ("MemoryIdentityStorage.getCertificate for !allowAny is not implemented"));

  var certificateNameUri = certificateName.toUri();
  if (this.certificateStore[certificateNameUri] === undefined)
    // Not found.  Silently return null.
    return SyncPromise.resolve(null);

  var certificiate = new IdentityCertificate();
  certificiate.wireDecode(this.certificateStore[certificateNameUri]);
  return SyncPromise.resolve(certificiate);
};

/*****************************************
 *           Get/Set Default             *
 *****************************************/

/**
 * Get the default identity.
 * @return {SyncPromise} A promise which returns the Name of default identity,
 * or a promise rejected with SecurityException if the default identity is not
 * set.
 */
MemoryIdentityStorage.prototype.getDefaultIdentityPromise = function()
{
  if (this.defaultIdentity.length === 0)
    return SyncPromise.reject(new SecurityException(new Error
      ("MemoryIdentityStorage.getDefaultIdentity: The default identity is not defined")));

  return SyncPromise.resolve(new Name(this.defaultIdentity));
};

/**
 * Get the default key name for the specified identity.
 * @param {Name} identityName The identity name.
 * @return {SyncPromise} A promise which returns the default key Name, or a
 * promise rejected with SecurityException if the default key name for the
 * identity is not set.
 */
MemoryIdentityStorage.prototype.getDefaultKeyNameForIdentityPromise = function
  (identityName)
{
  var identityUri = identityName.toUri();
  if (this.identityStore[identityUri] !== undefined) {
    if (this.identityStore[identityUri].defaultKey != null)
      return SyncPromise.resolve(this.identityStore[identityUri].defaultKey);
    else
      return SyncPromise.reject(new SecurityException(new Error
        ("No default key set.")));
  }
  else
    return SyncPromise.reject(new SecurityException(new Error("Identity not found.")));
};

/**
 * Get the default certificate name for the specified key.
 * @param {Name} keyName The key name.
 * @return {SyncPromise} A promise which returns the default certificate Name,
 * or a promise rejected with SecurityException if the default certificate name
 * for the key name is not set.
 */
MemoryIdentityStorage.prototype.getDefaultCertificateNameForKeyPromise = function
  (keyName)
{
  var keyUri = keyName.toUri();
  if (this.keyStore[keyUri] !== undefined) {
    if (this.keyStore[keyUri].defaultCertificate != null)
      return SyncPromise.resolve(this.keyStore[keyUri].defaultCertificate);
    else
      return SyncPromise.reject(new SecurityException(new Error
        ("No default certificate set.")));
  }
  else
    return SyncPromise.reject(new SecurityException(new Error("Key not found.")));
};

/**
 * Set the default identity.  If the identityName does not exist, then clear the
 * default identity so that getDefaultIdentity() throws an exception.
 * @param {Name} identityName The default identity name.
 * @return {SyncPromise} A promise which fulfills when the default identity is set.
 */
MemoryIdentityStorage.prototype.setDefaultIdentityPromise = function
  (identityName)
{
  var identityUri = identityName.toUri();
  if (this.identityStore[identityUri] !== undefined)
    this.defaultIdentity = identityUri;
  else
    // The identity doesn't exist, so clear the default.
    this.defaultIdentity = "";

  return SyncPromise.resolve();
};

/**
 * Set a key as the default key of an identity. The identity name is inferred
 * from keyName.
 * @param {Name} keyName The name of the key.
 * @param {Name} identityNameCheck (optional) The identity name to check that the
 * keyName contains the same identity name. If an empty name, it is ignored.
 * @return {SyncPromise} A promise which fulfills when the default key name is
 * set.
 */
MemoryIdentityStorage.prototype.setDefaultKeyNameForIdentityPromise = function
  (keyName, identityNameCheck)
{
  identityNameCheck = (identityNameCheck instanceof Name) ? identityNameCheck : null;

  var identityName = keyName.getPrefix(-1);

  if (identityNameCheck != null && identityNameCheck.size() > 0 &&
      !identityNameCheck.equals(identityName))
    return SyncPromise.reject(new SecurityException(new Error
      ("The specified identity name does not match the key name")));

  var identityUri = identityName.toUri();
  if (this.identityStore[identityUri] !== undefined)
    this.identityStore[identityUri].defaultKey = new Name(keyName);

  return SyncPromise.resolve();
};

/**
 * Set the default key name for the specified identity.
 * @param {Name} keyName The key name.
 * @param {Name} certificateName The certificate name.
 * @return {SyncPromise} A promise which fulfills when the default certificate
 * name is set.
 */
MemoryIdentityStorage.prototype.setDefaultCertificateNameForKeyPromise = function
  (keyName, certificateName)
{
  var keyUri = keyName.toUri();
  if (this.keyStore[keyUri] !== undefined)
    this.keyStore[keyUri].defaultCertificate = new Name(certificateName);

  return SyncPromise.resolve();
};

/*****************************************
 *            Delete Methods             *
 *****************************************/

/**
 * Delete a certificate.
 * @param {Name} certificateName The certificate name.
 * @return {SyncPromise} A promise which fulfills when the certificate
 * info is deleted.
 */
MemoryIdentityStorage.prototype.deleteCertificateInfoPromise = function
  (certificateName)
{
  return SyncPromise.reject(new Error
    ("MemoryIdentityStorage.deleteCertificateInfoPromise is not implemented"));
};

/**
 * Delete a public key and related certificates.
 * @param {Name} keyName The key name.
 * @return {SyncPromise} A promise which fulfills when the public key info is
 * deleted.
 */
MemoryIdentityStorage.prototype.deletePublicKeyInfoPromise = function(keyName)
{
  return SyncPromise.reject(new Error
    ("MemoryIdentityStorage.deletePublicKeyInfoPromise is not implemented"));
};

/**
 * Delete an identity and related public keys and certificates.
 * @param {Name} identity The identity name.
 * @return {SyncPromise} A promise which fulfills when the identity info is
 * deleted.
 */
MemoryIdentityStorage.prototype.deleteIdentityInfoPromise = function(identity)
{
  return SyncPromise.reject(new Error
    ("MemoryIdentityStorage.deleteIdentityInfoPromise is not implemented"));
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var SyncPromise = require('../../util/sync-promise').SyncPromise;

/**
 * PrivateKeyStorage is an abstract class which declares methods for working
 * with a private key storage. You should use a subclass.
 * @constructor
 */
var PrivateKeyStorage = function PrivateKeyStorage()
{
};

exports.PrivateKeyStorage = PrivateKeyStorage;

/**
 * Generate a pair of asymmetric keys.
 * @param {Name} keyName The name of the key pair.
 * @param {KeyParams} params The parameters of the key.
 * @param {boolean} (optional) useSync If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise that fulfills when the pair is
 * generated.
 */
PrivateKeyStorage.prototype.generateKeyPairPromise = function
  (keyName, params, useSync)
{
  return SyncPromise.reject(Error
    ("PrivateKeyStorage.generateKeyPairPromise is not implemented"));
};

/**
 * Generate a pair of asymmetric keys.
 * @param {Name} keyName The name of the key pair.
 * @param {KeyParams} params The parameters of the key.
 * @throws {Error} If generateKeyPairPromise doesn't return a SyncPromise which
 * is already fulfilled.
 */
PrivateKeyStorage.prototype.generateKeyPair = function(keyName, params)
{
  SyncPromise.getValue(this.generateKeyPairPromise(keyName, params, true));
};

/**
 * Delete a pair of asymmetric keys. If the key doesn't exist, do nothing.
 * @param {Name} keyName The name of the key pair.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise that fulfills when the key pair is
 * deleted.
 */
PrivateKeyStorage.prototype.deleteKeyPairPromise = function(keyName, useSync)
{
  return SyncPromise.reject(Error
    ("PrivateKeyStorage.deleteKeyPairPromise is not implemented"));
};

/**
 * Delete a pair of asymmetric keys. If the key doesn't exist, do nothing.
 * @param {Name} keyName The name of the key pair.
 * @throws {Error} If deleteKeyPairPromise doesn't return a SyncPromise which
 * is already fulfilled.
 */
PrivateKeyStorage.prototype.deleteKeyPair = function(keyName)
{
  SyncPromise.getValue(this.deleteKeyPairPromise(keyName, true));
};

/**
 * Get the public key
 * @param {Name} keyName The name of public key.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise that returns the PublicKey.
 */
PrivateKeyStorage.prototype.getPublicKeyPromise = function(keyName, useSync)
{
  return SyncPromise.reject(Error
    ("PrivateKeyStorage.getPublicKeyPromise is not implemented"));
};

/**
 * Get the public key
 * @param {Name} keyName The name of public key.
 * @return {PublicKey} The public key.
 * @throws {Error} If getPublicKeyPromise doesn't return a SyncPromise which
 * is already fulfilled.
 */
PrivateKeyStorage.prototype.getPublicKey = function(keyName)
{
  return SyncPromise.getValue(this.getPublicKeyPromise(keyName, true));
};

/**
 * Fetch the private key for keyName and sign the data to produce a signature Blob.
 * @param {Buffer} data Pointer to the input byte array.
 * @param {Name} keyName The name of the signing key.
 * @param {number} digestAlgorithm (optional) The digest algorithm from
 * DigestAlgorithm, such as DigestAlgorithm.SHA256. If omitted, use
 * DigestAlgorithm.SHA256.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise that returns the signature Blob.
 */
PrivateKeyStorage.prototype.signPromise = function
  (data, keyName, digestAlgorithm, useSync)
{
  return SyncPromise.reject(Error("PrivateKeyStorage.sign is not implemented"));
};

/**
 * Fetch the private key for keyName and sign the data to produce a signature Blob.
 * @param {Buffer} data Pointer to the input byte array.
 * @param {Name} keyName The name of the signing key.
 * @param {number} digestAlgorithm (optional) The digest algorithm from
 * DigestAlgorithm, such as DigestAlgorithm.SHA256. If omitted, use
 * DigestAlgorithm.SHA256.
 * @return {Blob} The signature Blob.
 * @throws {Error} If signPromise doesn't return a SyncPromise which is already
 * fulfilled.
 */
PrivateKeyStorage.prototype.sign = function(data, keyName, digestAlgorithm)
{
  return SyncPromise.getValue
    (this.signPromise(data, keyName, digestAlgorithm, true));
};

/**
 * Decrypt data.
 * @param {Name} keyName The name of the decrypting key.
 * @param {Buffer} data The byte to be decrypted.
 * @param {boolean} isSymmetric (optional) If true symmetric encryption is used,
 * otherwise asymmetric encryption is used. If omitted, use asymmetric
 * encryption.
 * @return {Blob} The decrypted data.
 */
PrivateKeyStorage.prototype.decrypt = function(keyName, data, isSymmetric)
{
  throw new Error("PrivateKeyStorage.decrypt is not implemented");
};

/**
 * Encrypt data.
 * @param {Name} keyName The name of the encrypting key.
 * @param {Buffer} data The byte to be encrypted.
 * @param {boolean} isSymmetric (optional) If true symmetric encryption is used,
 * otherwise asymmetric encryption is used. If omitted, use asymmetric
 * encryption.
 * @return {Blob} The encrypted data.
 */
PrivateKeyStorage.prototype.encrypt = function(keyName, data, isSymmetric)
{
  throw new Error("PrivateKeyStorage.encrypt is not implemented");
};

/**
 * @brief Generate a symmetric key.
 * @param {Name} keyName The name of the key.
 * @param {KeyParams} params The parameters of the key.
 */
PrivateKeyStorage.prototype.generateKey = function(keyName, params)
{
  throw new Error("PrivateKeyStorage.generateKey is not implemented");
};

/**
 * Check if a particular key exists.
 * @param {Name} keyName The name of the key.
 * @param {number} keyClass The class of the key, e.g. KeyClass.PUBLIC,
 * KeyClass.PRIVATE, or KeyClass.SYMMETRIC.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which returns true if the key exists.
 */
PrivateKeyStorage.prototype.doesKeyExistPromise = function
  (keyName, keyClass, useSync)
{
  return SyncPromise.reject(Error
    ("PrivateKeyStorage.doesKeyExist is not implemented"));
};

/**
 * Check if a particular key exists.
 * @param {Name} keyName The name of the key.
 * @param {number} keyClass The class of the key, e.g. KeyClass.PUBLIC,
 * KeyClass.PRIVATE, or KeyClass.SYMMETRIC.
 * @return {boolean} True if the key exists.
 * @throws {Error} If doesKeyExistPromise doesn't return a SyncPromise which
 * is already fulfilled.
 */
PrivateKeyStorage.prototype.doesKeyExist = function(keyName, keyClass)
{
  return SyncPromise.getValue(this.doesKeyExistPromise(keyName, keyClass, true));
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

// Use capitalized Crypto to not clash with the browser's crypto.subtle.
var Crypto = require("crypto");
var Blob = require('../../util/blob.js').Blob;
var SecurityException = require('../security-exception.js').SecurityException;
var PublicKey = require('../certificate/public-key.js').PublicKey;
var KeyClass = require('../security-types.js').KeyClass;
var KeyType = require('../security-types').KeyType;
var DigestAlgorithm = require('../security-types.js').DigestAlgorithm;
var DataUtils = require('../../encoding/data-utils.js').DataUtils;
var PrivateKeyStorage = require('./private-key-storage.js').PrivateKeyStorage;
var DerNode = require('../../encoding/der/der-node').DerNode;
var OID = require('../../encoding/oid').OID;
var SyncPromise = require('../../util/sync-promise').SyncPromise;
var UseSubtleCrypto = require('../../use-subtle-crypto-node.js').UseSubtleCrypto;
var rsaKeygen = null;
try {
  // This should be installed with: sudo npm install rsa-keygen
  rsaKeygen = require('rsa-keygen');
}
catch (e) {}

/**
 * MemoryPrivateKeyStorage class extends PrivateKeyStorage to implement private
 * key storage in memory.
 * @constructor
 */
var MemoryPrivateKeyStorage = function MemoryPrivateKeyStorage()
{
  // Call the base constructor.
  PrivateKeyStorage.call(this);

  // The key is the keyName.toUri(). The value is security.certificate.PublicKey.
  this.publicKeyStore = {};
  // The key is the keyName.toUri(). The value is the object
  //  {keyType,     // number from KeyType
  //   privateKey   // The PEM-encoded private key.
  //  }.
  this.privateKeyStore = {};
};

MemoryPrivateKeyStorage.prototype = new PrivateKeyStorage();
MemoryPrivateKeyStorage.prototype.name = "MemoryPrivateKeyStorage";

exports.MemoryPrivateKeyStorage = MemoryPrivateKeyStorage;

/**
 * Set the public key for the keyName.
 * @param {Name} keyName The key name.
 * @param {number} keyType The KeyType, such as KeyType.RSA.
 * @param {Buffer} publicKeyDer The public key DER byte array.
 */
MemoryPrivateKeyStorage.prototype.setPublicKeyForKeyName = function
  (keyName, keyType, publicKeyDer)
{
  this.publicKeyStore[keyName.toUri()] = new PublicKey
    (new Blob(publicKeyDer, true));
};

/**
 * Set the private key for the keyName.
 * @param {Name} keyName The key name.
 * @param {number} keyType The KeyType, such as KeyType.RSA.
 * @param {Buffer} privateKeyDer The private key DER byte array.
 */
MemoryPrivateKeyStorage.prototype.setPrivateKeyForKeyName = function
  (keyName, keyType, privateKeyDer)
{
  // Encode the DER as PEM.
  var keyBase64 = privateKeyDer.toString('base64');
  var keyPem = "-----BEGIN RSA PRIVATE KEY-----\n";
  for (var i = 0; i < keyBase64.length; i += 64)
    keyPem += (keyBase64.substr(i, 64) + "\n");
  keyPem += "-----END RSA PRIVATE KEY-----";

  this.privateKeyStore[keyName.toUri()] =
    { keyType: keyType, privateKey: keyPem };
};

/**
 * Set the public and private key for the keyName.
 * @param {Name} keyName The key name.
 * @param {number} keyType The KeyType, such as KeyType.RSA.
 * @param {Buffer} publicKeyDer The public key DER byte array.
 * @param {Buffer} privateKeyDer The private key DER byte array.
 */
MemoryPrivateKeyStorage.prototype.setKeyPairForKeyName = function
  (keyName, keyType, publicKeyDer, privateKeyDer)
{
  this.setPublicKeyForKeyName(keyName, keyType, publicKeyDer);
  this.setPrivateKeyForKeyName(keyName, keyType, privateKeyDer);
};

/**
 * Generate a pair of asymmetric keys.
 * @param {Name} keyName The name of the key pair.
 * @param {KeyParams} params The parameters of the key.
 * @param {boolean} useSync (optional) If true then use blocking crypto and
 * return a SyncPromise which is already fulfilled. If omitted or false, if
 * possible use crypto.subtle and return an async Promise, otherwise use
 * blocking crypto and return a SyncPromise.
 * @return {Promise|SyncPromise} A promise that fulfills when the pair is
 * generated.
 */
MemoryPrivateKeyStorage.prototype.generateKeyPairPromise = function
  (keyName, params, useSync)
{
  if (this.doesKeyExist(keyName, KeyClass.PUBLIC))
    return SyncPromise.reject(new SecurityException(new Error
      ("Public key already exists")));
  if (this.doesKeyExist(keyName, KeyClass.PRIVATE))
    return SyncPromise.reject(new SecurityException(new Error
      ("Private key already exists")));

  if (UseSubtleCrypto() && !useSync) {
    var thisStore = this;
    
    if (params.getKeyType() === KeyType.RSA) {
      var privateKey = null;
      var publicKeyDer = null;
      
      return crypto.subtle.generateKey
        ({ name: "RSASSA-PKCS1-v1_5", modulusLength: params.getKeySize(),
           publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
           hash: {name: "SHA-256"} },
         true, ["sign", "verify"])
      .then(function(key) {
        privateKey = key.privateKey;

        // Export the public key to DER.
        return crypto.subtle.exportKey("spki", key.publicKey);
      })
      .then(function(exportedPublicKey) {
        publicKeyDer = new Blob(new Uint8Array(exportedPublicKey), false).buf();

        // Export the private key to DER.
        return crypto.subtle.exportKey("pkcs8", privateKey);
      })
      .then(function(pkcs8Der) {
        // Crypto.subtle exports the private key as PKCS #8. Decode it to find
        // the inner private key DER.
        var parsedNode = DerNode.parse
          (new Blob(new Uint8Array(pkcs8Der), false).buf());
        // Get the value of the 3rd child which is the octet string.
        var privateKeyDer = parsedNode.getChildren()[2].toVal();

        // Save the key pair.
        thisStore.setKeyPairForKeyName
          (keyName, params.getKeyType(), publicKeyDer, privateKeyDer.buf());

        // sign will use subtleKey directly.
        thisStore.privateKeyStore[keyName.toUri()].subtleKey = privateKey;

        return Promise.resolve();
      });
    }
    else
      return SyncPromise.reject(new SecurityException(new Error
        ("Only RSA key generation currently supported")));
  }
  else {
    var publicKeyDer;
    var privateKeyPem;

    if (params.getKeyType() === KeyType.RSA) {
      if (!rsaKeygen)
        return SyncPromise.reject(new SecurityException(new Error
          ("Need to install rsa-keygen: sudo npm install rsa-keygen")));

      var keyPair = rsaKeygen.generate(params.getKeySize());

      // Get the public key DER from the PEM string.
      var publicKeyBase64 = keyPair.public_key.toString().replace
        ("-----BEGIN PUBLIC KEY-----", "").replace
        ("-----END PUBLIC KEY-----", "");
      publicKeyDer = new Buffer(publicKeyBase64, 'base64');

      privateKeyPem = keyPair.private_key.toString();
    }
    else
      return SyncPromise.reject(new SecurityException(new Error
        ("Only RSA key generation currently supported")));

    this.setPublicKeyForKeyName(keyName, params.getKeyType(), publicKeyDer);
    this.privateKeyStore[keyName.toUri()] =
      { keyType: params.getKeyType(), privateKey: privateKeyPem };

    return SyncPromise.resolve();
  }
};

/**
 * Delete a pair of asymmetric keys. If the key doesn't exist, do nothing.
 * @param {Name} keyName The name of the key pair.
 * @return {SyncPromise} A promise that fulfills when the key pair is deleted.
 */
MemoryPrivateKeyStorage.prototype.deleteKeyPairPromise = function(keyName)
{
  var keyUri = keyName.toUri();

  delete this.publicKeyStore[keyUri];
  delete this.privateKeyStore[keyUri];

  return SyncPromise.resolve();
};

/**
 * Get the public key
 * @param {Name} keyName The name of public key.
 * @return {SyncPromise} A promise that returns the PublicKey.
 */
MemoryPrivateKeyStorage.prototype.getPublicKeyPromise = function(keyName)
{
  var keyUri = keyName.toUri();
  var publicKey = this.publicKeyStore[keyUri];
  if (publicKey === undefined)
    return SyncPromise.reject(new SecurityException(new Error
      ("MemoryPrivateKeyStorage: Cannot find public key " + keyName.toUri())));

  return SyncPromise.resolve(publicKey);
};

/**
 * Encode the private key to a PKCS #8 private key. We do this explicitly here
 * to avoid linking to extra OpenSSL libraries.
 * @param {Buffer} privateKeyDer The input private key DER.
 * @param {OID} oid The OID of the privateKey.
 * @param {DerNode} parameters The DerNode of the parameters for the OID.
 * @return {Blob} The PKCS #8 private key DER.
 */
MemoryPrivateKeyStorage.encodePkcs8PrivateKey = function
  (privateKeyDer, oid, parameters)
{
  var algorithmIdentifier = new DerNode.DerSequence();
  algorithmIdentifier.addChild(new DerNode.DerOid(oid));
  algorithmIdentifier.addChild(parameters);

  var result = new DerNode.DerSequence();
  result.addChild(new DerNode.DerInteger(0));
  result.addChild(algorithmIdentifier);
  result.addChild(new DerNode.DerOctetString(privateKeyDer));

  return result.encode();
};


MemoryPrivateKeyStorage.RSA_ENCRYPTION_OID = "1.2.840.113549.1.1.1";

/**
 * Fetch the private key for keyName and sign the data to produce a signature Blob.
 * @param {Buffer} data Pointer to the input byte array.
 * @param {Name} keyName The name of the signing key.
 * @param {number} digestAlgorithm (optional) The digest algorithm from
 * DigestAlgorithm, such as DigestAlgorithm.SHA256. If omitted, use
 * DigestAlgorithm.SHA256.
 * @param {boolean} useSync (optional) If true then use blocking crypto and
 * return a SyncPromise which is already fulfilled. If omitted or false, if
 * possible use crypto.subtle and return an async Promise, otherwise use
 * blocking crypto and return a SyncPromise.
 * @return {Promise|SyncPromise} A promise that returns the signature Blob.
 */
MemoryPrivateKeyStorage.prototype.signPromise = function
  (data, keyName, digestAlgorithm, useSync)
{
  useSync = (typeof digestAlgorithm === "boolean") ? digestAlgorithm : useSync;
  digestAlgorithm = (typeof digestAlgorithm === "boolean" || !digestAlgorithm) ? DigestAlgorithm.SHA256 : digestAlgorithm;

  if (digestAlgorithm != DigestAlgorithm.SHA256)
    return SyncPromise.reject(new SecurityException(new Error
      ("MemoryPrivateKeyStorage.sign: Unsupported digest algorithm")));

  // Find the private key.
  var keyUri = keyName.toUri();
  var privateKey = this.privateKeyStore[keyUri];
  if (privateKey === undefined)
    return SyncPromise.reject(new SecurityException(new Error
      ("MemoryPrivateKeyStorage: Cannot find private key " + keyUri)));

  if (UseSubtleCrypto() && !useSync){
    var algo = {name:"RSASSA-PKCS1-v1_5",hash:{name:"SHA-256"}};

    if (!privateKey.subtleKey){
      //this is the first time in the session that we're using crypto subtle with this key
      //so we have to convert to pkcs8 and import it.
      //assigning it to privateKey.subtleKey means we only have to do this once per session,
      //giving us a small, but not insignificant, performance boost.
      var privateDER = DataUtils.privateKeyPemToDer(privateKey.privateKey);
      var pkcs8 = MemoryPrivateKeyStorage.encodePkcs8PrivateKey
        (privateDER, new OID(MemoryPrivateKeyStorage.RSA_ENCRYPTION_OID),
         new DerNode.DerNull()).buf();

      var promise = crypto.subtle.importKey("pkcs8", pkcs8.buffer, algo, true, ["sign"]).then(function(subtleKey){
        //cache the crypto.subtle key object
        privateKey.subtleKey = subtleKey;
        return crypto.subtle.sign(algo, subtleKey, data);
      });
    } else {
      // The crypto.subtle key has been cached on a previous sign or from keygen.
      var promise = crypto.subtle.sign(algo, privateKey.subtleKey, data);
    }

    return promise.then(function(signature){
      var result = new Blob(new Uint8Array(signature), true);
      return Promise.resolve(result);
    });
  } else {
    var rsa = Crypto.createSign('RSA-SHA256');
    rsa.update(data);

    var signature = new Buffer
      (DataUtils.toNumbersIfString(rsa.sign(privateKey.privateKey)));
    var result = new Blob(signature, false);

    return SyncPromise.resolve(result);
  }
};

/**
 * Check if a particular key exists.
 * @param {Name} keyName The name of the key.
 * @param {number} keyClass The class of the key, e.g. KeyClass.PUBLIC,
 * KeyClass.PRIVATE, or KeyClass.SYMMETRIC.
 * @return {SyncPromise} A promise which returns true if the key exists.
 */
MemoryPrivateKeyStorage.prototype.doesKeyExistPromise = function
  (keyName, keyClass)
{
  var keyUri = keyName.toUri();
  var result = false;
  if (keyClass == KeyClass.PUBLIC)
    result = this.publicKeyStore[keyUri] !== undefined;
  else if (keyClass == KeyClass.PRIVATE)
    result = this.privateKeyStore[keyUri] !== undefined;

  return SyncPromise.resolve(result);
};
/**
 * Copyright (C) 2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

// Use capitalized Crypto to not clash with the browser's crypto.subtle.
var Crypto = require('crypto');
// Don't require other modules since this is meant for the browser, not Node.js.

/**
 * IndexedDbPrivateKeyStorage extends PrivateKeyStorage to implement private key
 * storage using the browser's IndexedDB service.
 * @constructor
 */
var IndexedDbPrivateKeyStorage = function IndexedDbPrivateKeyStorage()
{
  PrivateKeyStorage.call(this);

  this.database = new Dexie("ndnsec-tpm");
  this.database.version(1).stores({
    // "nameHash" is transformName(keyName) // string
    // "encoding" is the public key DER     // Uint8Array
    publicKey: "nameHash",

    // "nameHash" is transformName(keyName)     // string
    // "encoding" is the PKCS 8 private key DER // Uint8Array
    privateKey: "nameHash"
  });
  this.database.open();
};

IndexedDbPrivateKeyStorage.prototype = new PrivateKeyStorage();
IndexedDbPrivateKeyStorage.prototype.name = "IndexedDbPrivateKeyStorage";

/**
 * Generate a pair of asymmetric keys.
 * @param {Name} keyName The name of the key pair.
 * @param {KeyParams} params The parameters of the key.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise that fulfills when the pair is generated.
 */
IndexedDbPrivateKeyStorage.prototype.generateKeyPairPromise = function
  (keyName, params, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbPrivateKeyStorage.generateKeyPairPromise is only supported for async")));

  var thisStorage = this;

  return thisStorage.doesKeyExistPromise(keyName, KeyClass.PUBLIC)
  .then(function(exists) {
    if (exists)
      throw new Error("Public key already exists");

    return thisStorage.doesKeyExistPromise(keyName, KeyClass.PRIVATE);
  })
  .then(function(exists) {
    if (exists)
      throw new Error("Private key already exists");

    if (params.getKeyType() === KeyType.RSA) {
      var privateKey = null;
      var publicKeyDer = null;

      return crypto.subtle.generateKey
        ({ name: "RSASSA-PKCS1-v1_5", modulusLength: params.getKeySize(),
           publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
           hash: {name: "SHA-256"} },
         true, ["sign", "verify"])
      .then(function(key) {
        privateKey = key.privateKey;

        // Export the public key to DER.
        return crypto.subtle.exportKey("spki", key.publicKey);
      })
      .then(function(exportedPublicKey) {
        publicKeyDer = new Uint8Array(exportedPublicKey);

        // Export the private key to DER.
        return crypto.subtle.exportKey("pkcs8", privateKey);
      })
      .then(function(pkcs8Der) {
        // Save the key pair
        return thisStorage.database.transaction
          ("rw", thisStorage.database.privateKey, thisStorage.database.publicKey, function () {
            thisStorage.database.publicKey.put
              ({nameHash: IndexedDbPrivateKeyStorage.transformName(keyName),
                encoding: publicKeyDer});
            thisStorage.database.privateKey.put
              ({nameHash: IndexedDbPrivateKeyStorage.transformName(keyName),
                encoding: new Uint8Array(pkcs8Der)});
          });
      });
    }
    else
      throw new Error("Only RSA key generation currently supported");
  });
};


/**
 * Delete a pair of asymmetric keys. If the key doesn't exist, do nothing.
 * @param {Name} keyName The name of the key pair.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise that fulfills when the key pair is deleted.
 */
IndexedDbPrivateKeyStorage.prototype.deleteKeyPairPromise = function
  (keyName, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbPrivateKeyStorage.deleteKeyPairPromise is only supported for async")));

  var thisStorage = this;
  // delete does nothing if the key doesn't exist.
  return this.database.publicKey.delete
    (IndexedDbPrivateKeyStorage.transformName(keyName))
  .then(function() {
    return thisStorage.database.privateKey.delete
      (IndexedDbPrivateKeyStorage.transformName(keyName));
  });
};

/**
 * Get the public key
 * @param {Name} keyName The name of public key.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise that returns the PublicKey.
 */
IndexedDbPrivateKeyStorage.prototype.getPublicKeyPromise = function
  (keyName, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbPrivateKeyStorage.getPublicKeyPromise is only supported for async")));

  return this.database.publicKey.get
    (IndexedDbPrivateKeyStorage.transformName(keyName))
  .then(function(publicKeyEntry) {
    return Promise.resolve(new PublicKey(new Blob(publicKeyEntry.encoding)));
  });
};

/**
 * Fetch the private key for keyName and sign the data to produce a signature Blob.
 * @param {Buffer} data Pointer to the input byte array.
 * @param {Name} keyName The name of the signing key.
 * @param {number} digestAlgorithm (optional) The digest algorithm from
 * DigestAlgorithm, such as DigestAlgorithm.SHA256. If omitted, use
 * DigestAlgorithm.SHA256.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise that returns the signature Blob.
 */
IndexedDbPrivateKeyStorage.prototype.signPromise = function
  (data, keyName, digestAlgorithm, useSync)
{
  useSync = (typeof digestAlgorithm === "boolean") ? digestAlgorithm : useSync;
  digestAlgorithm = (typeof digestAlgorithm === "boolean" || !digestAlgorithm) ? DigestAlgorithm.SHA256 : digestAlgorithm;

  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbPrivateKeyStorage.signPromise is only supported for async")));

  if (digestAlgorithm != DigestAlgorithm.SHA256)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbPrivateKeyStorage.sign: Unsupported digest algorithm")));
  
  // TODO: Support non-RSA keys.
  var algo = { name: "RSASSA-PKCS1-v1_5", hash: {name: "SHA-256" }};

  // Find the private key.
  return this.database.privateKey.get
    (IndexedDbPrivateKeyStorage.transformName(keyName))
  .then(function(privateKeyEntry) {
    return crypto.subtle.importKey
      ("pkcs8", new Blob(privateKeyEntry.encoding).buf(), algo, true, ["sign"]);
  })
  .then(function(privateKey) {
    return crypto.subtle.sign(algo, privateKey, data);
  })
  .then(function(signature) {
    return Promise.resolve(new Blob(new Uint8Array(signature), true));
  });
};

/**
 * Check if a particular key exists.
 * @param {Name} keyName The name of the key.
 * @param {number} keyClass The class of the key, e.g. KeyClass.PUBLIC,
 * KeyClass.PRIVATE, or KeyClass.SYMMETRIC.
 * @param {boolean} useSync (optional) If true then return a rejected promise
 * since this only support async code.
 * @return {Promise} A promise which returns true if the key exists.
 */
IndexedDbPrivateKeyStorage.prototype.doesKeyExistPromise = function
  (keyName, keyClass, useSync)
{
  if (useSync)
    return Promise.reject(new SecurityException(new Error
      ("IndexedDbPrivateKeyStorage.doesKeyExistPromise is only supported for async")));

  var table = null;
  if (keyClass == KeyClass.PUBLIC)
    table = this.database.publicKey;
  else if (keyClass == KeyClass.PRIVATE)
    table = this.database.privateKey;
  else
    // Silently say that anything else doesn't exist.
    return Promise.resolve(false);

  return table.where("nameHash").equals
    (IndexedDbPrivateKeyStorage.transformName(keyName))
  .count()
  .then(function(count) {
    return Promise.resolve(count > 0);
  });
};

/**
 * Transform the key name into the base64 encoding of the hash (the same as in
 * FilePrivateKeyStorage without the file name extension).
 */
IndexedDbPrivateKeyStorage.transformName = function(keyName)
{
  var hash = Crypto.createHash('sha256');
  hash.update(new Buffer(keyName.toUri()));
  var fileName = hash.digest('base64');
  return fileName.replace(/\//g, '%');
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

// Use capitalized Crypto to not clash with the browser's crypto.subtle.
var Crypto = require("crypto");
var Name = require('../../name.js').Name;
var Data = require('../../data.js').Data;
var Blob = require('../../util/blob.js').Blob;
var DigestSha256Signature = require('../../digest-sha256-signature.js').DigestSha256Signature;
var Sha256WithRsaSignature = require('../../sha256-with-rsa-signature.js').Sha256WithRsaSignature;
var KeyLocatorType = require('../../key-locator.js').KeyLocatorType;
var WireFormat = require('../../encoding/wire-format.js').WireFormat;
var SecurityException = require('../security-exception.js').SecurityException;
var DigestAlgorithm = require('../security-types.js').DigestAlgorithm;
var KeyType = require('../security-types.js').KeyType;
var RsaKeyParams = require('../key-params.js').RsaKeyParams;
var IdentityCertificate = require('../certificate/identity-certificate.js').IdentityCertificate;
var PublicKey = require('../certificate/public-key.js').PublicKey;
var CertificateSubjectDescription = require('../certificate/certificate-subject-description.js').CertificateSubjectDescription;
var SyncPromise = require('../../util/sync-promise').SyncPromise;

/**
 * An IdentityManager is the interface of operations related to identity, keys,
 * and certificates.
 *
 * Create a new IdentityManager to use the given IdentityStorage and
 * PrivateKeyStorage.
 * @param {IdentityStorage} identityStorage An object of a subclass of
 * IdentityStorage.
 * @param {PrivateKeyStorage} privateKeyStorage An object of a subclass of
 * PrivateKeyStorage.
 * @constructor
 */
var IdentityManager = function IdentityManager
  (identityStorage, privateKeyStorage)
{
  this.identityStorage = identityStorage;
  this.privateKeyStorage = privateKeyStorage;
};

exports.IdentityManager = IdentityManager;

/**
 * Create an identity by creating a pair of Key-Signing-Key (KSK) for this
 * identity and a self-signed certificate of the KSK. If a key pair or
 * certificate for the identity already exists, use it.
 * @param {Name} identityName The name of the identity.
 * @params {KeyParams} params The key parameters if a key needs to be generated
 * for the identity.
 * @param {function} onComplete (optional) This calls onComplete(certificateName)
 * with the name of the default certificate of the identity. If omitted, the
 * return value is described below. (Some crypto libraries only use a callback,
 * so onComplete is required to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @return {Name} If onComplete is omitted, return the name of the default
 * certificate of the identity. Otherwise, if onComplete is supplied then return
 * undefined and use onComplete as described above.
 */
IdentityManager.prototype.createIdentityAndCertificate = function
  (identityName, params, onComplete, onError)
{
  var useSync = !onComplete;
  var thisManager = this;

  var generateKey = true;
  var keyName = null;

  var mainPromise = this.identityStorage.addIdentityPromise(identityName, useSync)
  .then(function() {
    return thisManager.identityStorage.getDefaultKeyNameForIdentityPromise
      (identityName, useSync)
    .then(function(localKeyName) {
      keyName = localKeyName;

      // Set generateKey.
      return thisManager.identityStorage.getKeyPromise(keyName, useSync)
      .then(function(publicKeyDer) {
        var key = new PublicKey(publicKeyDer);
        if (key.getKeyType() == params.getKeyType())
          // The key exists and has the same type, so don't need to generate one.
          generateKey = false;
        return SyncPromise.resolve();
      });
    }, function(err) {
      if (!(err instanceof SecurityException))
        throw err;
      
      // The key doesn't exist, so leave generateKey true.
      return SyncPromise.resolve();
    });
  })
  .then(function() {
    if (generateKey)
      return thisManager.generateKeyPairPromise(identityName, true, params, useSync)
      .then(function(localKeyName) {
        keyName = localKeyName;
        return thisManager.identityStorage.setDefaultKeyNameForIdentityPromise
          (keyName, useSync);
      });
    else
      // Don't generate a key pair. Use the existing keyName.
      return SyncPromise.resolve();
  })
  .then(function() {
    return thisManager.identityStorage.getDefaultCertificateNameForKeyPromise
      (keyName, useSync)
    .then(function(certName) {
      // The cert exists, so don't need to make it.
      return SyncPromise.resolve(certName);
    }, function(err) {
      if (!(err instanceof SecurityException))
        throw err;

      // The cert doesn't exist, so make one.
      var certName;
      return thisManager.selfSignPromise(keyName, useSync)
      .then(function(selfCert) {
        certName = selfCert.getName();
        return thisManager.addCertificateAsIdentityDefaultPromise(selfCert, useSync);
      })
      .then(function() {
        return SyncPromise.resolve(certName);
      });
    });
  });

  return SyncPromise.complete(onComplete, onError, mainPromise);
};

/**
 * Create an identity by creating a pair of Key-Signing-Key (KSK) for this
 * identity and a self-signed certificate of the KSK. If a key pair or
 * certificate for the identity already exists, use it.
 * @deprecated Use createIdentityAndCertificate which returns the
 * certificate name instead of the key name. You can use
 * IdentityCertificate.certificateNameToPublicKeyName to convert the
 * certificate name to the key name.
 * @param {Name} identityName The name of the identity.
 * @params {KeyParams} params The key parameters if a key needs to be generated
 * for the identity.
 * @return {Name} The key name of the auto-generated KSK of the identity.
 */
IdentityManager.prototype.createIdentity = function(identityName, params)
{
  return IdentityCertificate.certificateNameToPublicKeyName
    (this.createIdentityAndCertificate(identityName, params));
};

/**
 * Delete the identity from the public and private key storage. If the
 * identity to be deleted is the current default system default, this will not
 * delete the identity and will return immediately.
 * @param identityName {Name} The name of the identity.
 * @param {function} onComplete (optional) This calls onComplete() when the
 * operation is complete. If omitted, do not use it. (Some database libraries
 * only use a callback, so onComplete is required to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 */
IdentityManager.prototype.deleteIdentity = function
  (identityName, onComplete, onError)
{
  var useSync = !onComplete;
  var thisManager = this;

  var doDelete = true;

  var mainPromise = this.identityStorage.getDefaultIdentityPromise(identityName)
  .then(function(defaultIdentityName) {
    if (defaultIdentityName.equals(identityName))
      // Don't delete the default identity!
      doDelete = false;
    
    return SyncPromise.resolve();
  }, function(err) {
    // There is no default identity to check.
    return SyncPromise.resolve();
  })
  .then(function() {
    if (!doDelete)
      return SyncPromise.resolve();

    var keysToDelete = [];
    return thisManager.identityStorage.getAllKeyNamesOfIdentityPromise
      (identityName, keysToDelete, true)
    .then(function() {
      return thisManager.identityStorage.getAllKeyNamesOfIdentityPromise
        (identityName, keysToDelete, false);
    })
    .then(function() {
      return thisManager.identityStorage.deleteIdentityInfoPromise(identityName);
    })
    .then(function() {
      // Recursively loop through keysToDelete, calling deleteKeyPairPromise.
      function deleteKeyLoop(i) {
        if (i >= keysToDelete.length)
          return SyncPromise.resolve();

        return thisManager.privateKeyStorage.deleteKeyPairPromise(keysToDelete[i])
        .then(function() {
          return deleteKeyLoop(i + 1);
        });
      }

      return deleteKeyLoop(0);
    });
  });

  return SyncPromise.complete(onComplete, mainPromise, onError);
};

/**
 * Set the default identity.  If the identityName does not exist, then clear the
 * default identity so that getDefaultIdentity() throws an exception.
 * @param {Name} identityName The default identity name.
 * @param {function} onComplete (optional) This calls onComplete() when complete.
 * (Some database libraries only use a callback, so onComplete is required to
 * use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 */
IdentityManager.prototype.setDefaultIdentity = function
  (identityName, onComplete, onError)
{
  return SyncPromise.complete(onComplete, onError,
    this.identityStorage.setDefaultIdentityPromise(identityName, !onComplete));
};

/**
 * Get the default identity.
 * @param {function} onComplete (optional) This calls onComplete(identityName)
 * with name of the default identity. If omitted, the return value is described
 * below. (Some crypto libraries only use a callback, so onComplete is required
 * to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @returns {Name} If onComplete is omitted, return the name of the default
 * identity. Otherwise, if onComplete is supplied then return undefined and use
 * onComplete as described above.
 * @throws SecurityException if the default identity is not set. However, if
 * onComplete and onError are defined, then if there is an exception return
 * undefined and call onError(exception).
 */
IdentityManager.prototype.getDefaultIdentity = function(onComplete, onError)
{
  return SyncPromise.complete(onComplete, onError,
    this.identityStorage.getDefaultIdentityPromise(!onComplete));
};

/**
 * Generate a pair of RSA keys for the specified identity.
 * @param {Name} identityName The name of the identity.
 * @param {boolean} isKsk (optional) true for generating a Key-Signing-Key (KSK),
 * false for a Data-Signing-Key (DSK). If omitted, generate a Data-Signing-Key.
 * @param {number} keySize (optional) The size of the key. If omitted, use a
 * default secure key size.
 * @return {Name} The generated key name.
 */
IdentityManager.prototype.generateRSAKeyPair = function
  (identityName, isKsk, keySize)
{
  // For now, require sync. This method may be removed from the API.
  return SyncPromise.getValue
    (this.generateKeyPairPromise
     (identityName, isKsk, new RsaKeyParams(keySize), true));
};

/**
 * Set a key as the default key of an identity. The identity name is inferred
 * from keyName.
 * @param {Name} keyName The name of the key.
 * @param {Name} identityNameCheck (optional) The identity name to check that the
 * keyName contains the same identity name. If an empty name, it is ignored.
 * @param {function} onComplete (optional) This calls onComplete() when complete.
 * (Some database libraries only use a callback, so onComplete is required to
 * use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 */
IdentityManager.prototype.setDefaultKeyForIdentity = function
  (keyName, identityNameCheck, onComplete, onError)
{
  onError = (typeof identityNameCheck === "function") ? onComplete : onError;
  onComplete = (typeof identityNameCheck === "function") ?
    identityNameCheck : onComplete;
  identityNameCheck = (typeof identityNameCheck === "function" || !identityNameCheck) ?
    new Name() : identityNameCheck;

  return SyncPromise.complete(onComplete, onError,
    this.identityStorage.setDefaultKeyNameForIdentityPromise
      (keyName, identityNameCheck, !onComplete));
};

/**
 * Get the default key for an identity.
 * @param {Name} identityName The name of the identity.
 * @param {function} onComplete (optional) This calls onComplete(keyName)
 * with name of the default key. If omitted, the return value is described
 * below. (Some crypto libraries only use a callback, so onComplete is required
 * to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @return {Name} If onComplete is omitted, return the default key name.
 * Otherwise, if onComplete is supplied then return undefined and use onComplete
 * as described above.
 * @throws SecurityException if the default key name for the identity is not set.
 * However, if onComplete and onError are defined, then if there is an exception
 * return undefined and call onError(exception).
 */
IdentityManager.prototype.getDefaultKeyNameForIdentity = function
  (identityName, onComplete, onError)
{
  return SyncPromise.complete(onComplete, onError,
    this.identityStorage.getDefaultKeyNameForIdentityPromise
      (identityName, !onComplete));
};

/**
 * Generate a pair of RSA keys for the specified identity and set it as default
 * key for the identity.
 * @param {Name} identityName The name of the identity.
 * @param {boolean} isKsk (optional) true for generating a Key-Signing-Key (KSK),
 * false for a Data-Signing-Key (DSK). If omitted, generate a Data-Signing-Key.
 * @param {number} keySize (optional) The size of the key. If omitted, use a
 * default secure key size.
 * @return {Name} The generated key name.
 */
IdentityManager.prototype.generateRSAKeyPairAsDefault = function
  (identityName, isKsk, keySize)
{
  var newKeyName = this.generateRSAKeyPair(identityName, isKsk, keySize);
  this.identityStorage.setDefaultKeyNameForIdentity(newKeyName);
  return newKeyName;
};

/**
 * Get the public key with the specified name.
 * @param {Name} keyName The name of the key.
 * @param {function} onComplete (optional) This calls onComplete(publicKey)
 * with PublicKey. If omitted, the return value is described below. (Some crypto
 * libraries only use a callback, so onComplete is required to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @return {PublicKey} If onComplete is omitted, return the public key.
 * Otherwise, if onComplete is supplied then return undefined and use onComplete
 * as described above.
 */
IdentityManager.prototype.getPublicKey = function(keyName, onComplete, onError)
{
  return SyncPromise.complete(onComplete, onError,
    this.identityStorage.getKeyPromise(keyName, !onComplete)
    .then(function(keyDer) {
      return SyncPromise.resolve(new PublicKey(keyDer));
    }));
};

// TODO: Add two versions of createIdentityCertificate.

/**
 * Add a certificate into the public key identity storage.
 * @param {IdentityCertificate} certificate The certificate to to added. This
 * makes a copy of the certificate.
 * @param {function} onComplete (optional) This calls onComplete() when complete.
 * (Some database libraries only use a callback, so onComplete is required to
 * use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 */
IdentityManager.prototype.addCertificate = function
  (certificate, onComplete, onError)
{
  return SyncPromise.complete(onComplete, onError,
    this.identityStorage.addCertificatePromise(certificate, !onComplete));
};

/**
 * Set the certificate as the default for its corresponding key.
 * @param {IdentityCertificate} certificate The certificate.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If false, this may return a SyncPromise or an async
 * Promise.
 * @return {Promise|SyncPromise} A promise which fulfills when the default
 * certificate is set.
 */
IdentityManager.prototype.setDefaultCertificateForKeyPromise = function
  (certificate, useSync)
{
  var thisManager = this;
  
  var keyName = certificate.getPublicKeyName();
  return this.identityStorage.doesKeyExistPromise(keyName, useSync)
  .then(function(exists) {
    if (!exists)
      throw new SecurityException(new Error
        ("No corresponding Key record for certificate!"));

    return thisManager.identityStorage.setDefaultCertificateNameForKeyPromise
      (keyName, certificate.getName(), useSync);
  });
};

/**
 * Set the certificate as the default for its corresponding key.
 * @param {IdentityCertificate} certificate The certificate.
 * @param {function} onComplete (optional) This calls onComplete() when complete.
 * (Some database libraries only use a callback, so onComplete is required to
 * use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 */
IdentityManager.prototype.setDefaultCertificateForKey = function
  (certificate, onComplete, onError)
{
  return SyncPromise.complete(onComplete, onError,
    this.setDefaultCertificateForKeyPromise(certificate, !onComplete));
};

/**
 * Add a certificate into the public key identity storage and set the
 * certificate as the default for its corresponding identity.
 * @param {IdentityCertificate} certificate The certificate to be added. This
 * makes a copy of the certificate.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If false, this may return a SyncPromise or an async
 * Promise.
 * @return {Promise|SyncPromise} A promise which fulfills when the certificate
 * is added.
 */
IdentityManager.prototype.addCertificateAsIdentityDefaultPromise = function
  (certificate, useSync)
{
  var thisManager = this;
  return this.identityStorage.addCertificatePromise(certificate, useSync)
  .then(function() {
    var keyName = certificate.getPublicKeyName();
    return thisManager.identityStorage.setDefaultKeyNameForIdentityPromise
      (keyName, useSync);
  })
  .then(function() {
    return thisManager.setDefaultCertificateForKeyPromise(certificate, useSync);
  });
};

/**
 * Add a certificate into the public key identity storage and set the
 * certificate as the default of its corresponding key.
 * @param {IdentityCertificate} certificate The certificate to be added. This
 * makes a copy of the certificate.
 * @param {function} onComplete (optional) This calls onComplete() when complete.
 * (Some crypto libraries only use a callback, so onComplete is required to use
 * these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 */
IdentityManager.prototype.addCertificateAsDefault = function
  (certificate, onComplete, onError)
{
  var useSync = !onComplete;
  var thisManager = this;

  return SyncPromise.complete(onComplete, onError,
    this.identityStorage.addCertificatePromise(certificate, useSync)
    .then(function() {
      return thisManager.setDefaultCertificateForKeyPromise(certificate, useSync);
    }));
};

/**
 * Get a certificate which is still valid with the specified name.
 * @param {Name} certificateName The name of the requested certificate.
 * @param {function} onComplete (optional) This calls onComplete(certificate)
 * with the requested IdentityCertificate which is valid. If omitted, the return
 * value is described below. (Some crypto libraries only use a callback, so
 * onComplete is required to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @return {IdentityCertificate} If onComplete is omitted, return the requested
 * certificate which is valid. Otherwise, if onComplete is supplied then return
 * undefined and use onComplete as described above.
 */
IdentityManager.prototype.getCertificate = function
  (certificateName, onComplete, onError)
{
  return SyncPromise.complete(onComplete, onError,
    this.identityStorage.getCertificatePromise
      (certificateName, false, !onComplete));
};

/**
 * Get a certificate even if the certificate is not valid anymore.
 * @param {Name} certificateName The name of the requested certificate.
 * @param {function} onComplete (optional) This calls onComplete(certificate)
 * with the requested IdentityCertificate. If omitted, the return value is
 * described below. (Some crypto libraries only use a callback, so onComplete is
 * required to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @return {IdentityCertificate} If onComplete is omitted, return the requested
 * certificate. Otherwise, if onComplete is supplied then return undefined and
 * use onComplete as described above.
 */
IdentityManager.prototype.getAnyCertificate = function
  (certificateName, onComplete, onError)
{
  return SyncPromise.complete(onComplete, onError,
    this.identityStorage.getCertificatePromise
      (certificateName, true, !onComplete));
};

/**
 * Get the default certificate name for the specified identity.
 * @param {Name} identityName The identity name.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which returns the default certificate
 * Name, or a promise rejected with SecurityException if the default key name
 * for the identity is not set or the default certificate name for the key name
 * is not set.
 */
IdentityManager.prototype.getDefaultCertificateNameForIdentityPromise = function
  (identityName, useSync)
{
  return this.identityStorage.getDefaultCertificateNameForIdentityPromise
    (identityName, useSync);
}

/**
 * Get the default certificate name for the specified identity, which will be
 * used when signing is performed based on identity.
 * @param {Name} identityName The name of the specified identity.
 * @param {function} onComplete (optional) This calls onComplete(certificateName)
 * with name of the default certificate. If omitted, the return value is described
 * below. (Some crypto libraries only use a callback, so onComplete is required
 * to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @return {Name} If onComplete is omitted, return the default certificate name.
 * Otherwise, if onComplete is supplied then return undefined and use
 * onComplete as described above.
 * @throws SecurityException if the default key name for the identity is not
 * set or the default certificate name for the key name is not set. However, if
 * onComplete and onError are defined, then if there is an exception return
 * undefined and call onError(exception).
 */
IdentityManager.prototype.getDefaultCertificateNameForIdentity = function
  (identityName, onComplete, onError)
{
  return SyncPromise.complete(onComplete, onError,
    this.identityStorage.getDefaultCertificateNameForIdentityPromise
      (identityName, !onComplete));
};

/**
 * Get the default certificate name of the default identity, which will be used
 * when signing is based on identity and the identity is not specified.
 * @param {function} onComplete (optional) This calls onComplete(certificateName)
 * with name of the default certificate. If omitted, the return value is described
 * below. (Some crypto libraries only use a callback, so onComplete is required
 * to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @return {Name} If onComplete is omitted, return the default certificate name.
 * Otherwise, if onComplete is supplied then return undefined and use
 * onComplete as described above.
 * @throws SecurityException if the default identity is not set or the default
 * key name for the identity is not set or the default certificate name for
 * the key name is not set. However, if onComplete and onError are defined, then
 * if there is an exception return undefined and call onError(exception).
 */
IdentityManager.prototype.getDefaultCertificateName = function
  (onComplete, onError)
{
  var useSync = !onComplete;
  var thisManager = this;

  return SyncPromise.complete(onComplete, onError,
    this.getDefaultIdentityPromise(useSync)
    .then(function(identityName) {
      return thisManager.identityStorage.getDefaultCertificateNameForIdentityPromise
        (identityName, useSync)     ;
    }));
};

/**
 * Sign the Data packet or byte array data based on the certificate name.
 * @param {Data|Buffer} target If this is a Data object, wire encode for signing,
 * update its signature and key locator field and wireEncoding. If it is a
 * Buffer, sign it to produce a Signature object.
 * @param {Name} certificateName The Name identifying the certificate which
 * identifies the signing key.
 * @param {WireFormat} (optional) The WireFormat for calling encodeData, or
 * WireFormat.getDefaultWireFormat() if omitted.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise that returns the generated Signature
 * object (if target is a Buffer) or the target (if target is Data).
 */
IdentityManager.prototype.signByCertificatePromise = function
  (target, certificateName, wireFormat, useSync)
{
  useSync = (typeof wireFormat === "boolean") ? wireFormat : useSync;
  wireFormat = (typeof wireFormat === "boolean" || !wireFormat) ? WireFormat.getDefaultWireFormat() : wireFormat;

  var keyName = IdentityManager.certificateNameToPublicKeyName(certificateName);

  var thisManager = this;
  if (target instanceof Data) {
    var data = target;
    var digestAlgorithm = [0];

    return this.makeSignatureByCertificatePromise
      (certificateName, digestAlgorithm, useSync)
    .then(function(signature) {
      data.setSignature(signature);
      // Encode once to get the signed portion.
      var encoding = data.wireEncode(wireFormat);

      return thisManager.privateKeyStorage.signPromise
        (encoding.signedBuf(), keyName, digestAlgorithm[0], useSync);
    })
    .then(function(signatureValue) {
      data.getSignature().setSignature(signatureValue);
      // Encode again to include the signature.
      data.wireEncode(wireFormat);

      return SyncPromise.resolve(data);
    });
  }
  else {
    var digestAlgorithm = [0];
    return this.makeSignatureByCertificatePromise
      (certificateName, digestAlgorithm, useSync)
    .then(function(signature) {
      return thisManager.privateKeyStorage.signPromise
        (target, keyName, digestAlgorithm[0], useSync);
    })
    .then(function (signatureValue) {
      signature.setSignature(signatureValue);
      return SyncPromise.resolve(signature);
    });
  }
};

/**
 * Sign the Data packet or byte array data based on the certificate name.
 * @param {Data|Buffer} target If this is a Data object, wire encode for signing,
 * update its signature and key locator field and wireEncoding. If it is a
 * Buffer, sign it to produce a Signature object.
 * @param {Name} certificateName The Name identifying the certificate which
 * identifies the signing key.
 * @param {WireFormat} (optional) The WireFormat for calling encodeData, or
 * WireFormat.getDefaultWireFormat() if omitted.
 * @param {function} onComplete (optional) If target is a Data object, this calls
 * onComplete(data) with the supplied Data object which has been modified to set
 * its signature. If target is a Buffer, this calls onComplete(signature) where
 * signature is the produced Signature object. If omitted, the return value is
 * described below. (Some crypto libraries only use a callback, so onComplete is
 * required to use these.)
 * @return {Signature} If onComplete is omitted, return the generated Signature
 * object (if target is a Buffer) or the target (if target is Data). Otherwise,
 * if onComplete is supplied then return undefined and use onComplete as described
 * above.
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 */
IdentityManager.prototype.signByCertificate = function
  (target, certificateName, wireFormat, onComplete, onError)
{
  onError = (typeof wireFormat === "function") ? onComplete : onError;
  onComplete = (typeof wireFormat === "function") ? wireFormat : onComplete;
  wireFormat = (typeof wireFormat === "function" || !wireFormat) ? WireFormat.getDefaultWireFormat() : wireFormat;

  return SyncPromise.complete(onComplete, onError,
    this.signByCertificatePromise
      (target, certificateName, wireFormat, !onComplete));
};

/**
 * Append a SignatureInfo to the Interest name, sign the name components and
 * append a final name component with the signature bits.
 * @param {Interest} interest The Interest object to be signed. This appends
 * name components of SignatureInfo and the signature bits.
 * @param {Name} certificateName The certificate name of the key to use for
 * signing.
 * @param {WireFormat} wireFormat (optional) A WireFormat object used to encode
 * the input. If omitted, use WireFormat getDefaultWireFormat().
 * @param {function} onComplete (optional) This calls onComplete(interest) with
 * the supplied Interest object which has been modified to set its signature. If
 * omitted, then return when the interest has been signed. (Some crypto
 * libraries only use a callback, so onComplete is required to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 */
IdentityManager.prototype.signInterestByCertificate = function
  (interest, certificateName, wireFormat, onComplete, onError)
{
  onError = (typeof wireFormat === "function") ? onComplete : onError;
  onComplete = (typeof wireFormat === "function") ? wireFormat : onComplete;
  wireFormat = (typeof wireFormat === "function" || !wireFormat) ? WireFormat.getDefaultWireFormat() : wireFormat;

  var useSync = !onComplete;

  var thisManager = this;
  var signature;
  var digestAlgorithm = [0];
  return SyncPromise.complete(onComplete, onError,
    this.makeSignatureByCertificatePromise
      (certificateName, digestAlgorithm, useSync)
    .then(function(localSignature) {
      signature = localSignature;
      // Append the encoded SignatureInfo.
      interest.getName().append(wireFormat.encodeSignatureInfo(signature));

      // Append an empty signature so that the "signedPortion" is correct.
      interest.getName().append(new Name.Component());
      // Encode once to get the signed portion.
      var encoding = interest.wireEncode(wireFormat);
      var keyName = IdentityManager.certificateNameToPublicKeyName
        (certificateName);

      return thisManager.privateKeyStorage.signPromise
        (encoding.signedBuf(), keyName, digestAlgorithm[0], useSync);
    })
    .then(function(signatureValue) {
      signature.setSignature(signatureValue);

      // Remove the empty signature and append the real one.
      interest.setName(interest.getName().getPrefix(-1).append
        (wireFormat.encodeSignatureValue(signature)));
      return SyncPromise.resolve(interest);
    }));
};

/**
 * Wire encode the Data object, digest it and set its SignatureInfo to a
 * DigestSha256.
 * @param {Data} data The Data object to be signed. This updates its signature
 * and wireEncoding.
 * @param {WireFormat} (optional) The WireFormat for calling encodeData, or
 * WireFormat.getDefaultWireFormat() if omitted.
 */
IdentityManager.prototype.signWithSha256 = function(data, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());

  data.setSignature(new DigestSha256Signature());
  // Encode once to get the signed portion.
  var encoding = data.wireEncode(wireFormat);

  // Digest and set the signature.
  var hash = Crypto.createHash('sha256');
  hash.update(encoding.signedBuf());
  data.getSignature().setSignature(new Blob(hash.digest(), false));

  // Encode again to include the signature.
  data.wireEncode(wireFormat);
};

/**
 * Append a SignatureInfo for DigestSha256 to the Interest name, digest the
   * name components and append a final name component with the signature bits
   * (which is the digest).
 * @param {Interest} interest The Interest object to be signed. This appends
 * name components of SignatureInfo and the signature bits.
 * @param {WireFormat} wireFormat (optional) A WireFormat object used to encode
 * the input. If omitted, use WireFormat getDefaultWireFormat().
 */
IdentityManager.prototype.signInterestWithSha256 = function(interest, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());

  var signature = new DigestSha256Signature();

  // Append the encoded SignatureInfo.
  interest.getName().append(wireFormat.encodeSignatureInfo(signature));

  // Append an empty signature so that the "signedPortion" is correct.
  interest.getName().append(new Name.Component());
  // Encode once to get the signed portion.
  var encoding = interest.wireEncode(wireFormat);

  // Digest and set the signature.
  var hash = Crypto.createHash('sha256');
  hash.update(encoding.signedBuf());
  signature.setSignature(new Blob(hash.digest(), false));

  // Remove the empty signature and append the real one.
  interest.setName(interest.getName().getPrefix(-1).append
    (wireFormat.encodeSignatureValue(signature)));
};

/**
 * Generate a self-signed certificate for a public key.
 * @param {Name} keyName The name of the public key.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If false, this may return a SyncPromise or an async
 * Promise.
 * @return {Promise|SyncPromise} A promise which returns the generated
 * IdentityCertificate.
 */
IdentityManager.prototype.selfSignPromise = function(keyName, useSync)
{
  var certificate = new IdentityCertificate();

  var thisManager = this;
  return this.identityStorage.getKeyPromise(keyName, useSync)
  .then(function(keyBlob) {
    var publicKey = new PublicKey(keyBlob);

    var notBefore = new Date().getTime();
    var notAfter = notBefore + 2 * 365 * 24 * 3600 * 1000; // about 2 years

    certificate.setNotBefore(notBefore);
    certificate.setNotAfter(notAfter);

    var certificateName = keyName.getPrefix(-1).append("KEY").append
      (keyName.get(-1)).append("ID-CERT").appendVersion(certificate.getNotBefore());
    certificate.setName(certificateName);

    certificate.setPublicKeyInfo(publicKey);
    certificate.addSubjectDescription(new CertificateSubjectDescription
      ("2.5.4.41", keyName.toUri()));
    certificate.encode();

    return thisManager.signByCertificatePromise
      (certificate, certificate.getName(), useSync);
  })
};

/**
 * Generate a self-signed certificate for a public key.
 * @param {Name} keyName The name of the public key.
 * @param {function} onComplete (optional) This calls onComplete(certificate)
 * with the the generated IdentityCertificate. If omitted, the return value is
 * described below. (Some crypto libraries only use a callback, so onComplete is
 * required to use these.)
 * @return {IdentityCertificate} If onComplete is omitted, return the
 * generated certificate. Otherwise, if onComplete is supplied then return
 * undefined and use onComplete as described above.
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 */
IdentityManager.prototype.selfSign = function(keyName, onComplete, onError)
{
  return SyncPromise.complete(onComplete, onError,
    this.selfSignPromise(keyName, !onComplete));
};

/**
 * Get the public key name from the full certificate name.
 *
 * @param {Name} certificateName The full certificate name.
 * @return {Name} The related public key name.
 * TODO: Move this to IdentityCertificate
 */
IdentityManager.certificateNameToPublicKeyName = function(certificateName)
{
  var i = certificateName.size() - 1;
  var idString = "ID-CERT";
  while (i >= 0) {
    if (certificateName.get(i).toEscapedString() == idString)
      break;
    --i;
  }

  var tmpName = certificateName.getSubName(0, i);
  var keyString = "KEY";
  i = 0;
  while (i < tmpName.size()) {
    if (tmpName.get(i).toEscapedString() == keyString)
      break;
    ++i;
  }

  return tmpName.getSubName(0, i).append(tmpName.getSubName
    (i + 1, tmpName.size() - i - 1));
};

/**
 * Return a new Signature object based on the signature algorithm of the public
 * key with keyName (derived from certificateName).
 * @param {Name} certificateName The certificate name.
 * @param {Array} digestAlgorithm Set digestAlgorithm[0] to the signature
 * algorithm's digest algorithm, e.g. DigestAlgorithm.SHA256.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If false, this may return a SyncPromise or an async
 * Promise.
 * @return {Promise|SyncPromise} A promise which returns a new object of the
 * correct subclass of Signature.
 */
IdentityManager.prototype.makeSignatureByCertificatePromise = function
  (certificateName, digestAlgorithm, useSync)
{
  var keyName = IdentityManager.certificateNameToPublicKeyName(certificateName);
  return this.privateKeyStorage.getPublicKeyPromise(keyName, useSync)
  .then(function(publicKey) {
    var keyType = publicKey.getKeyType();

    var signature = null;
    if (keyType == KeyType.RSA) {
      signature = new Sha256WithRsaSignature();
      digestAlgorithm[0] = DigestAlgorithm.SHA256;

      signature.getKeyLocator().setType(KeyLocatorType.KEYNAME);
      signature.getKeyLocator().setKeyName(certificateName.getPrefix(-1));
    }
    else
      throw new SecurityException(new Error("Key type is not recognized"));

    return SyncPromise.resolve(signature);
  });
};

/**
 * A private method to generate a pair of keys for the specified identity.
 * @param {Name} identityName The name of the identity.
 * @param {boolean} isKsk true for generating a Key-Signing-Key (KSK), false for
 * a Data-Signing-Key (DSK).
 * @param {KeyParams} params The parameters of the key.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If false, this may return a SyncPromise or an async
 * Promise.
 * @return {Promise|SyncPromise} A promise which returns the generated key name.
 */
IdentityManager.prototype.generateKeyPairPromise = function
  (identityName, isKsk, params, useSync)
{
  var keyName;
  var thisManager = this;
  return this.identityStorage.getNewKeyNamePromise(identityName, isKsk, useSync)
  .then(function(localKeyName) {
    keyName = localKeyName;
    return thisManager.privateKeyStorage.generateKeyPairPromise
      (keyName, params, useSync);
  })
  .then(function() {
    return thisManager.privateKeyStorage.getPublicKeyPromise
      (keyName, useSync);
  })
  .then(function(publicKey) {
    return thisManager.identityStorage.addKeyPromise
      (keyName, params.getKeyType(), publicKey.getKeyDer());
  })
  .then(function() {
    return SyncPromise.resolve(keyName);
  });
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * A ValidationRequest is used to return information from
 * PolicyManager.checkVerificationPolicy.
 *
 * Create a new ValidationRequest with the given values.
 * @param {Interest} interest An interest for fetching more data.
 * @param {function} onVerified If the signature is verified, this calls
 * onVerified(data).
 * @param {function} onVerifyFailed If the signature check fails, this calls
 * onVerifyFailed(data).
 * @param {boolean} retry
 * @param {number} stepCount  The number of verification steps that have been
 * done, used to track the verification progress.
 * @constructor
 */
var ValidationRequest = function ValidationRequest
  (interest, onVerified, onVerifyFailed, retry, stepCount)
{
  this.interest = interest;
  this.onVerified = onVerified;
  this.onVerifyFailed = onVerifyFailed;
  this.retry = retry;
  this.stepCount = stepCount;
};

exports.ValidationRequest = ValidationRequest;
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

// Use capitalized Crypto to not clash with the browser's crypto.subtle.
var Crypto = require("crypto");
var Blob = require('../../util/blob.js').Blob;
var DataUtils = require('../../encoding/data-utils.js').DataUtils;
var SecurityException = require('../security-exception.js').SecurityException;
var DigestSha256Signature = require('../../digest-sha256-signature.js').DigestSha256Signature;
var Sha256WithRsaSignature = require('../../sha256-with-rsa-signature.js').Sha256WithRsaSignature;
var UseSubtleCrypto = require("../../use-subtle-crypto-node.js").UseSubtleCrypto;

/**
 * A PolicyManager is an abstract base class to represent the policy for
 * verifying data packets. You must create an object of a subclass.
 * @constructor
 */
var PolicyManager = function PolicyManager()
{
};

exports.PolicyManager = PolicyManager;

/**
 * Check if the received data packet or signed interest can escape from
 * verification and be trusted as valid.
 * Your derived class should override.
 *
 * @param {Data|Interest} dataOrInterest The received data packet or interest.
 * @returns {boolean} True if the data or interest does not need to be verified
 * to be trusted as valid, otherwise false.
 */
PolicyManager.prototype.skipVerifyAndTrust = function(dataOrInterest)
{
  throw new Error("PolicyManager.skipVerifyAndTrust is not implemented");
};

/**
 * Check if this PolicyManager has a verification rule for the received data
 * packet or signed interest.
 * Your derived class should override.
 *
 * @param {Data|Interest} dataOrInterest The received data packet or interest.
 * @returns {boolean} True if the data or interest must be verified, otherwise
 * false.
 */
PolicyManager.prototype.requireVerify = function(dataOrInterest)
{
  throw new Error("PolicyManager.requireVerify is not implemented");
};

/**
 * Check whether the received data packet complies with the verification policy,
 * and get the indication of the next verification step.
 * Your derived class should override.
 *
 * @param {Data|Interest} dataOrInterest The Data object or interest with the
 * signature to check.
 * @param {number} stepCount The number of verification steps that have been
 * done, used to track the verification progress.
 * @param {function} onVerified If the signature is verified, this calls
 * onVerified(dataOrInterest).
 * @param {function} onVerifyFailed If the signature check fails, this calls
 * onVerifyFailed(dataOrInterest).
 * @param {WireFormat} wireFormat
 * @returns {ValidationRequest} The indication of next verification step, or
 * null if there is no further step.
 */
PolicyManager.prototype.checkVerificationPolicy = function
  (dataOrInterest, stepCount, onVerified, onVerifyFailed, wireFormat)
{
  throw new Error("PolicyManager.checkVerificationPolicy is not implemented");
};

/**
 * Check if the signing certificate name and data name satisfy the signing
 * policy.
 * Your derived class should override.
 *
 * @param {Name} dataName The name of data to be signed.
 * @param {Name} certificateName The name of signing certificate.
 * @returns {boolean} True if the signing certificate can be used to sign the
 * data, otherwise false.
 */
PolicyManager.prototype.checkSigningPolicy = function(dataName, certificateName)
{
  throw new Error("PolicyManager.checkSigningPolicy is not implemented");
};

/**
 * Infer the signing identity name according to the policy. If the signing
 * identity cannot be inferred, return an empty name.
 * Your derived class should override.
 *
 * @param {Name} dataName The name of data to be signed.
 * @returns {Name} The signing identity or an empty name if cannot infer.
 */
PolicyManager.prototype.inferSigningIdentity = function(dataName)
{
  throw new Error("PolicyManager.inferSigningIdentity is not implemented");
};

// The first time verifySha256WithRsaSignature is called, it sets this to
// determine if a signature buffer needs to be converted to a string for the
// crypto verifier.
PolicyManager.verifyUsesString = null;

/**
 * Check the type of signature and use the publicKeyDer to verify the
 * signedBlob using the appropriate signature algorithm.
 * @param signature {Signature} An object of a subclass of Signature, e.g.
 * Sha256WithRsaSignature.
 * @param signedBlob {SignedBlob} the SignedBlob with the signed portion to
 * verify.
 * @param publicKeyDer {Blob} The DER-encoded public key used to verify the
 * signature.
 * @param onComplete {function} This calls onComplete(true) if the signature
 * verifies, otherwise onComplete(false).
 * @throws {SecurityException} if the signature type is not recognized or if
 * publicKeyDer can't be decoded.
 */
PolicyManager.verifySignature = function
  (signature, signedBlob, publicKeyDer, onComplete)
{
  if (signature instanceof Sha256WithRsaSignature) {
    if (publicKeyDer.isNull()) {
      onComplete(false);
      return;
    }
    PolicyManager.verifySha256WithRsaSignature
      (signature.getSignature(), signedBlob, publicKeyDer, onComplete);
  }
  else if (signature instanceof DigestSha256Signature)
    PolicyManager.verifyDigestSha256Signature
      (signature.getSignature(), signedBlob, onComplete);
  else
    // We don't expect this to happen.
    throw new SecurityException(new Error
      ("PolicyManager.verify: Signature type is unknown"));
};

/**
 * Verify the RSA signature on the SignedBlob using the given public key.
 * @param signature {Blob} The signature bits.
 * @param signedBlob {SignedBlob} the SignedBlob with the signed portion to
 * verify.
 * @param publicKeyDer {Blob} The DER-encoded public key used to verify the
 * signature.
 * @param onComplete {function} This calls onComplete(true) if the signature
 * verifies, otherwise onComplete(false).
 */
PolicyManager.verifySha256WithRsaSignature = function
  (signature, signedBlob, publicKeyDer, onComplete)
{
  if (UseSubtleCrypto()){
    var algo = {name:"RSASSA-PKCS1-v1_5",hash:{name:"SHA-256"}};

    crypto.subtle.importKey("spki", publicKeyDer.buf().buffer, algo, true, ["verify"]).then(function(publicKey){
      return crypto.subtle.verify(algo, publicKey, signature.buf(), signedBlob.signedBuf())
    }).then(function(verified){
      onComplete(verified);
    });
  } else {
    if (PolicyManager.verifyUsesString === null) {
      var hashResult = Crypto.createHash('sha256').digest();
      // If the hash result is a string, we assume that this is a version of
      //   crypto where verify also uses a string signature.
      PolicyManager.verifyUsesString = (typeof hashResult === 'string');
    }

    // The crypto verifier requires a PEM-encoded public key.
    var keyBase64 = publicKeyDer.buf().toString('base64');
    var keyPem = "-----BEGIN PUBLIC KEY-----\n";
    for (var i = 0; i < keyBase64.length; i += 64)
      keyPem += (keyBase64.substr(i, 64) + "\n");
    keyPem += "-----END PUBLIC KEY-----";

    var verifier = Crypto.createVerify('RSA-SHA256');
    verifier.update(signedBlob.signedBuf());
    var signatureBytes = PolicyManager.verifyUsesString ?
      DataUtils.toString(signature.buf()) : signature.buf();
    onComplete(verifier.verify(keyPem, signatureBytes));
  }
};

/**
 * Verify the DigestSha256 signature on the SignedBlob by verifying that the
 * digest of SignedBlob equals the signature.
 * @param signature {Blob} The signature bits.
 * @param signedBlob {SignedBlob} the SignedBlob with the signed portion to
 * verify.
 * @param onComplete {function} This calls onComplete(true) if the signature
 * verifies, otherwise onComplete(false).
 */
PolicyManager.verifyDigestSha256Signature = function
  (signature, signedBlob, onComplete)
{
  // Set signedPortionDigest to the digest of the signed portion of the signedBlob.
  var hash = Crypto.createHash('sha256');
  hash.update(signedBlob.signedBuf());
  var signedPortionDigest = new Blob(hash.digest(), false);

  onComplete(signedPortionDigest.equals(signature));
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From PyNDN certificate_cache.py by Adeola Bannis.
 * Originally from Yingdi Yu <http://irl.cs.ucla.edu/~yingdi/>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var IdentityCertificate = require('../certificate/identity-certificate.js').IdentityCertificate;

/**
 * A CertificateCache is used to save other users' certificate during
 * verification.
 */
var CertificateCache = function CertificateCache()
{
  // The key is the certificate name URI. The value is the wire encoding Blob.
  this.cache = {};
};

exports.CertificateCache = CertificateCache;

/**
 * Insert the certificate into the cache. Assumes the timestamp is not yet
 * removed from the name.
 * @param {IdentityCertificate} certificate The certificate to insert.
 */
CertificateCache.prototype.insertCertificate = function(certificate)
{
  var certName = certificate.getName().getPrefix(-1);
  this.cache[certName.toUri()] = certificate.wireEncode();
};

/**
 * Remove a certificate from the cache. This does nothing if it is not present.
 * @param {Name} certificateName The name of the certificate to remove. This
 * assumes there is no timestamp in the name.
 */
CertificateCache.prototype.deleteCertificate = function(certificateName)
{
  delete this.cache[certificateName.toUri()];
};

/**
 * Fetch a certificate from the cache.
 * @param {Name} certificateName The name of the certificate to remove. This
 * assumes there is no timestamp in the name.
 * @return {IdentityCertificate} A new copy of the IdentityCertificate, or null
 * if not found.
 */
CertificateCache.prototype.getCertificate = function(certificateName)
{
  var certData = this.cache[certificateName.toUri()];
  if (certData === undefined)
    return null;

  var cert = new IdentityCertificate();
  cert.wireDecode(certData);
  return cert;
};

/**
 * Clear all certificates from the store.
 */
CertificateCache.prototype.reset = function()
{
  this.cache = {};
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From PyNDN config_policy_manager.py by Adeola Bannis.
 * Originally from Yingdi Yu <http://irl.cs.ucla.edu/~yingdi/>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var fs = require('fs');
var path = require('path');
var Name = require('../../name.js').Name;
var Data = require('../../data.js').Data;
var Interest = require('../../interest.js').Interest;
var KeyLocator = require('../../key-locator.js').KeyLocator;
var KeyLocatorType = require('../../key-locator.js').KeyLocatorType;
var Blob = require('../../util/blob.js').Blob;
var IdentityCertificate = require('../certificate/identity-certificate.js').IdentityCertificate;
var BoostInfoParser = require('../../util/boost-info-parser.js').BoostInfoParser;
var NdnRegexMatcher = require('../../util/ndn-regex-matcher.js').NdnRegexMatcher;
var CertificateCache = require('./certificate-cache.js').CertificateCache;
var ValidationRequest = require('./validation-request.js').ValidationRequest;
var SecurityException = require('../security-exception.js').SecurityException;
var WireFormat = require('../../encoding/wire-format.js').WireFormat;
var PolicyManager = require('./policy-manager.js').PolicyManager;

/**
 * ConfigPolicyManager manages trust according to a configuration file in the
 * Validator Configuration File Format
 * (http://redmine.named-data.net/projects/ndn-cxx/wiki/CommandValidatorConf)
 *
 * Once a rule is matched, the ConfigPolicyManager looks in the
 * CertificateCache for the IdentityCertificate matching the name in the KeyLocator
 * and uses its public key to verify the data packet or signed interest. If the
 * certificate can't be found, it is downloaded, verified and installed. A chain
 * of certificates will be followed to a maximum depth.
 * If the new certificate is accepted, it is used to complete the verification.
 *
 * The KeyLocators of data packets and signed interests MUST contain a name for
 * verification to succeed.
 *
 * Create a new ConfigPolicyManager which will act on the rules specified in the
 * configuration and download unknown certificates when necessary.
 *
 * @param {string} configFileName (optional) If not null or empty, the path to
 * the configuration file containing verification rules. (This only works in
 * Node.js since it reads files using the "fs" module.) Otherwise, you should
 * separately call load().
 * @param {CertificateCache} certificateCache (optional) A CertificateCache to
 * hold known certificates. If this is null or omitted, then create an internal
 * CertificateCache.
 * @param {number} searchDepth (optional) The maximum number of links to follow
 * when verifying a certificate chain. If omitted, use a default.
 * @param {number} graceInterval (optional) The window of time difference
 * (in milliseconds) allowed between the timestamp of the first interest signed with
 * a new public key and the validation time. If omitted, use a default value.
 * @param {number} keyTimestampTtl (optional) How long a public key's last-used
 * timestamp is kept in the store (milliseconds). If omitted, use a default value.
 * @param {number} maxTrackedKeys The maximum number of public key use
 * timestamps to track. If omitted, use a default.
 */
var ConfigPolicyManager = function ConfigPolicyManager
  (configFileName, certificateCache, searchDepth, graceInterval,
   keyTimestampTtl, maxTrackedKeys)
{
  // Call the base constructor.
  PolicyManager.call(this);

  if (certificateCache == undefined)
    certificateCache = null;
  if (searchDepth == undefined)
    searchDepth = 5;
  if (graceInterval == undefined)
    graceInterval = 3000;
  if (keyTimestampTtl == undefined)
    keyTimestampTtl = 3600000;
  if (maxTrackedKeys == undefined)
    maxTrackedKeys = 1000;

  if (certificateCache == null)
    this.certificateCache = new CertificateCache();
  else
    this.certificateCache = certificateCache;
  this.maxDepth = searchDepth;
  this.keyGraceInterval = graceInterval;
  this.keyTimestampTtl = keyTimestampTtl;
  this.maxTrackedKeys = maxTrackedKeys;

  this.reset();

  if (configFileName != null && configFileName != "")
    this.load(configFileName);
};

ConfigPolicyManager.prototype = new PolicyManager();
ConfigPolicyManager.prototype.name = "ConfigPolicyManager";

exports.ConfigPolicyManager = ConfigPolicyManager;

/**
 * Reset the certificate cache and other fields to the constructor state.
 */
ConfigPolicyManager.prototype.reset = function()
{
  this.certificateCache.reset();

  // Stores the fixed-signer certificate name associated with validation rules
  // so we don't keep loading from files.
  this.fixedCertificateCache = {};

  // Stores the timestamps for each public key used in command interests to
  // avoid replay attacks.
  // Key is public key name, value is last timestamp.
  this.keyTimestamps = {};

  this.requiresVerification = true;

  this.config = new BoostInfoParser();
  this.refreshManager = new ConfigPolicyManager.TrustAnchorRefreshManager();
};

/**
 * Call reset() and load the configuration rules from the file name or the input
 * string. There are two forms:
 * load(configFileName) reads configFileName from the file system. (This only
 * works in Node.js since it reads files using the "fs" module.)
 * load(input, inputName) reads from the input, in which case inputName is used
 * only for log messages, etc.
 * @param {string} configFileName The path to the file containing configuration
 * rules.
 * @param {string} input The contents of the configuration rules, with lines
 * separated by "\n" or "\r\n".
 * @param {string} inputName Use with input for log messages, etc.
 */
ConfigPolicyManager.prototype.load = function(configFileNameOrInput, inputName)
{
  this.reset();
  this.config.read(configFileNameOrInput, inputName);
  this.loadTrustAnchorCertificates();
}

/**
 * Check if this PolicyManager has a verification rule for the received data.
 * If the configuration file contains the trust anchor 'any', nothing is
 * verified.
 *
 * @param {Data|Interest} dataOrInterest The received data packet or interest.
 * @returns {boolean} true if the data must be verified, otherwise false.
 */
ConfigPolicyManager.prototype.requireVerify = function(dataOrInterest)
{
  return this.requiresVerification;
};

/**
 * Override to always indicate that the signing certificate name and data name
 * satisfy the signing policy.
 *
 * @param {Name} dataName The name of data to be signed.
 * @param {Name} certificateName The name of signing certificate.
 * @returns {boolean} True to indicate that the signing certificate can be used
 * to sign the data.
 */
ConfigPolicyManager.prototype.checkSigningPolicy = function
  (dataName, certificateName)
{
  return true;
};

/**
 * Check if the received signed interest can escape from verification and be
 * trusted as valid. If the configuration file contains the trust anchor
 * 'any', nothing is verified.
 *
 * @param {Data|Interest} dataOrInterest The received data packet or interest.
 * @returns {boolean} true if the data or interest does not need to be verified
 * to be trusted as valid, otherwise false.
 */
ConfigPolicyManager.prototype.skipVerifyAndTrust = function(dataOrInterest)
{
  return !this.requiresVerification;
};

/**
 * Check whether the received data packet or interest complies with the
 * verification policy, and get the indication of the next verification step.
 *
 * @param {Data|Interest} dataOrInterest The Data object or interest with the
 * signature to check.
 * @param {number} stepCount The number of verification steps that have been
 * done, used to track the verification progress.
 * @param {function} onVerified If the signature is verified, this calls
 * onVerified(dataOrInterest).
 * @param {function} onVerifyFailed If the signature check fails, this calls
 * onVerifyFailed(dataOrInterest).
 * @param {WireFormat} wireFormat
 * @returns {ValidationRequest} The indication of next verification step, or
 * null if there is no further step.
 */
ConfigPolicyManager.prototype.checkVerificationPolicy = function
  (dataOrInterest, stepCount, onVerified, onVerifyFailed, wireFormat)
{
  if (stepCount > this.maxDepth) {
    onVerifyFailed(dataOrInterest);
    return null;
  }

  var signature = ConfigPolicyManager.extractSignature(dataOrInterest, wireFormat);
  // No signature -> fail.
  if (signature == null) {
    onVerifyFailed(dataOrInterest);
    return null;
  }

  if (!KeyLocator.canGetFromSignature(signature)) {
    // We only support signature types with key locators.
    onVerifyFailed(dataOrInterest);
    return null;
  }

  var keyLocator = null;
  try {
    keyLocator = KeyLocator.getFromSignature(signature);
  }
  catch (ex) {
    // No key locator -> fail.
    onVerifyFailed(dataOrInterest);
    return null;
  }

  var signatureName = keyLocator.getKeyName();
  // No key name in KeyLocator -> fail.
  if (signatureName.size() == 0) {
    onVerifyFailed(dataOrInterest);
    return null;
  }

  var objectName = dataOrInterest.getName();
  var matchType = "data";

  // For command interests, we need to ignore the last 4 components when
  // matching the name.
  if (dataOrInterest instanceof Interest) {
    objectName = objectName.getPrefix(-4);
    matchType = "interest";
  }

  // First see if we can find a rule to match this packet.
  var matchedRule = this.findMatchingRule(objectName, matchType);

  // No matching rule -> fail.
  if (matchedRule == null) {
    onVerifyFailed(dataOrInterest);
    return null;
  }

  var signatureMatches = this.checkSignatureMatch
    (signatureName, objectName, matchedRule);
  if (!signatureMatches) {
    onVerifyFailed(dataOrInterest);
    return null;
  }

  // Before we look up keys, refresh any certificate directories.
  this.refreshManager.refreshAnchors();

  // Now finally check that the data or interest was signed correctly.
  // If we don't actually have the certificate yet, create a
  // ValidationRequest for it.
  var foundCert = this.refreshManager.getCertificate(signatureName);
  if (foundCert == null)
    foundCert = this.certificateCache.getCertificate(signatureName);
  var thisManager = this;
  if (foundCert == null) {
    var certificateInterest = new Interest(signatureName);
    var onCertificateDownloadComplete = function(data) {
      var certificate = new IdentityCertificate(data);
      thisManager.certificateCache.insertCertificate(certificate);
      thisManager.checkVerificationPolicy
        (dataOrInterest, stepCount + 1, onVerified, onVerifyFailed);
    };

    var nextStep = new ValidationRequest
      (certificateInterest, onCertificateDownloadComplete, onVerifyFailed,
       2, stepCount + 1);

    return nextStep;
  }

  // For interests, we must check that the timestamp is fresh enough.
  // We do this after (possibly) downloading the certificate to avoid
  // filling the cache with bad keys.
  if (dataOrInterest instanceof Interest) {
    var keyName = foundCert.getPublicKeyName();
    var timestamp = dataOrInterest.getName().get(-4).toNumber();

    if (!this.interestTimestampIsFresh(keyName, timestamp)) {
      onVerifyFailed(dataOrInterest);
      return null;
    }
  }

  // Certificate is known, so verify the signature.
  this.verify(signature, dataOrInterest.wireEncode(), function (verified) {
    if (verified) {
      onVerified(dataOrInterest);
      if (dataOrInterest instanceof Interest)
        thisManager.updateTimestampForKey(keyName, timestamp);
    }
    else
      onVerifyFailed(dataOrInterest);
  });
};

/**
 * The configuration file allows 'trust anchor' certificates to be preloaded.
 * The certificates may also be loaded from a directory, and if the 'refresh'
 * option is set to an interval, the certificates are reloaded at the specified
 * interval.
 */
ConfigPolicyManager.prototype.loadTrustAnchorCertificates = function()
{
  var anchors = this.config.getRoot().get("validator/trust-anchor");

  for (var i = 0; i < anchors.length; ++i) {
    var anchor = anchors[i];

    var typeName = anchor.get("type")[0].getValue();
    var isPath = false;
    var certID;
    if (typeName == 'file') {
      certID = anchor.get("file-name")[0].getValue();
      isPath = true;
    }
    else if (typeName == 'base64') {
      certID = anchor.get("base64-string")[0].getValue();
      isPath = false;
    }
    else if (typeName == "dir") {
      var dirName = anchor.get("dir")[0].getValue();

      var refreshPeriod = 0;
      var refreshTrees = anchor.get("refresh");
      if (refreshTrees.length >= 1) {
        var refreshPeriodStr = refreshTrees[0].getValue();

        var refreshMatch = refreshPeriodStr.match(/(\d+)([hms])/);
        if (refreshMatch == null)
          refreshPeriod = 0;
        else {
          refreshPeriod = parseInt(refreshMatch[1]);
          if (refreshMatch[2] != 's') {
            refreshPeriod *= 60;
            if (refreshMatch[2] != 'm')
              refreshPeriod *= 60;
          }
        }
      }

      // Convert refreshPeriod from seconds to milliseconds.
      this.refreshManager.addDirectory(dirName, refreshPeriod * 1000);
      continue;
    }
    else if (typeName == "any") {
      // This disables all security!
      this.requiresVerification = false;
      break;
    }

    this.lookupCertificate(certID, isPath);
  }
};

/**
 * Once a rule is found to match data or a signed interest, the name in the
 * KeyLocator must satisfy the condition in the 'checker' section of the rule,
 * else the data or interest is rejected.
 * @param {Name} signatureName The certificate name from the KeyLocator.
 * @param {Name} objectName The name of the data packet or interest. In the case
 * of signed interests, this excludes the timestamp, nonce and signature
 * components.
 * @param {BoostInfoTree} rule The rule from the configuration file that matches
 * the data or interest.
 * @returns {boolean} True if matches.
 */
ConfigPolicyManager.prototype.checkSignatureMatch = function
  (signatureName, objectName, rule)
{
  var checker = rule.get("checker")[0];
  var checkerType = checker.get("type")[0].getValue();
  if (checkerType == "fixed-signer") {
    var signerInfo = checker.get("signer")[0];
    var signerType = signerInfo.get("type")[0].getValue();

    var cert;
    if (signerType == "file")
      cert = this.lookupCertificate
        (signerInfo.get("file-name")[0].getValue(), true);
    else if (signerType == "base64")
      cert = this.lookupCertificate
        (signerInfo.get("base64-string")[0].getValue(), false);
    else
      return false;

    if (cert == null)
      return false;
    else
      return cert.getName().equals(signatureName);
  }
  else if (checkerType == "hierarchical") {
    // This just means the data/interest name has the signing identity as a prefix.
    // That means everything before "ksk-?" in the key name.
    var identityRegex = "^([^<KEY>]*)<KEY>(<>*)<ksk-.+><ID-CERT>";
    var identityMatch = NdnRegexMatcher.match(identityRegex, signatureName);
    if (identityMatch != null) {
      var identityPrefix = new Name(identityMatch[1]).append
        (new Name(identityMatch[2]));
      return ConfigPolicyManager.matchesRelation(objectName, identityPrefix, "is-prefix-of");
    }
    else
      return false;
  }
  else if (checkerType == "customized") {
    var keyLocatorInfo = checker.get("key-locator")[0];
    // Not checking type - only name is supported.

    // Is this a simple relation?
    var relationType = keyLocatorInfo.getFirstValue("relation");
    if (relationType != null) {
      var matchName = new Name(keyLocatorInfo.get("name")[0].getValue());
      return ConfigPolicyManager.matchesRelation(signatureName, matchName, relationType);
    }

    // Is this a simple regex?
    var keyRegex = keyLocatorInfo.getFirstValue("regex");
    if (keyRegex != null)
      return NdnRegexMatcher.match(keyRegex, signatureName) != null;

    // Is this a hyper-relation?
    var hyperRelationList = keyLocatorInfo.get("hyper-relation");
    if (hyperRelationList.length >= 1) {
      var hyperRelation = hyperRelationList[0];

      var keyRegex = hyperRelation.getFirstValue("k-regex");
      var keyExpansion = hyperRelation.getFirstValue("k-expand");
      var nameRegex = hyperRelation.getFirstValue("p-regex");
      var nameExpansion = hyperRelation.getFirstValue("p-expand");
      var relationType = hyperRelation.getFirstValue("h-relation");
      if (keyRegex != null && keyExpansion != null && nameRegex != null &&
          nameExpansion != null && relationType != null) {
        var keyMatch = NdnRegexMatcher.match(keyRegex, signatureName);
        if (keyMatch == null || keyMatch[1] === undefined)
          return false;
        var keyMatchPrefix = ConfigPolicyManager.expand(keyMatch, keyExpansion);

        var nameMatch = NdnRegexMatcher.match(nameRegex, objectName);
        if (nameMatch == null || nameMatch[1] === undefined)
          return false;
        var nameMatchStr = ConfigPolicyManager.expand(nameMatch, nameExpansion);

        return ConfigPolicyManager.matchesRelation
          (new Name(nameMatchStr), new Name(keyMatchPrefix), relationType);
      }
    }
  }

  // unknown type
  return false;
};

/**
 * Similar to Python expand, return expansion where every \1, \2, etc. is
 * replaced by match[1], match[2], etc.  Note: Even though this is a general
 * utility function, we define it locally because it is only tested to work in
 * the cases used by this class.
 * @param {Object} match The match object from String.match.
 * @param {string} expansion The string with \1, \2, etc. to replace from match.
 * @returns {string} The expanded string.
 */
ConfigPolicyManager.expand = function(match, expansion)
{
  return expansion.replace
    (/\\(\d)/g,
     function(fullMatch, n) { return match[parseInt(n)];})
};

/**
 * This looks up certificates specified as base64-encoded data or file names.
 * These are cached by filename or encoding to avoid repeated reading of files
 * or decoding.
 * @param {string} certID
 * @param {boolean} isPath
 * @returns {IdentityCertificate}
 */
ConfigPolicyManager.prototype.lookupCertificate = function(certID, isPath)
{
  var cert;

  var cachedCertUri = this.fixedCertificateCache[certID];
  if (cachedCertUri === undefined) {
    if (isPath)
      // load the certificate data (base64 encoded IdentityCertificate)
      cert = ConfigPolicyManager.TrustAnchorRefreshManager.loadIdentityCertificateFromFile
        (certID);
    else {
      var certData = new Buffer(certID, 'base64');
      cert = new IdentityCertificate();
      cert.wireDecode(certData);
    }

    var certUri = cert.getName().getPrefix(-1).toUri();
    this.fixedCertificateCache[certID] = certUri;
    this.certificateCache.insertCertificate(cert);
  }
  else
    cert = this.certificateCache.getCertificate(new Name(cachedCertUri));

  return cert;
};

/**
 * Search the configuration file for the first rule that matches the data or
 * signed interest name. In the case of interests, the name to match should
 * exclude the timestamp, nonce, and signature components.
 * @param {Name} objName The name to be matched.
 * @param {string} matchType The rule type to match, "data" or "interest".
 * @returns {BoostInfoTree} The matching rule, or null if not found.
 */
ConfigPolicyManager.prototype.findMatchingRule = function(objName, matchType)
{
  var rules = this.config.getRoot().get("validator/rule");
  for (var iRule = 0; iRule < rules.length; ++iRule) {
    var r = rules[iRule];

    if (r.get('for')[0].getValue() == matchType) {
      var passed = true;
      var filters = r.get('filter');
      if (filters.length == 0)
        // No filters means we pass!
        return r;
      else {
        for (var iFilter = 0; iFilter < filters.length; ++iFilter) {
          var f = filters[iFilter];

          // Don't check the type - it can only be name for now.
          // We need to see if this is a regex or a relation.
          var regexPattern = f.getFirstValue("regex");
          if (regexPattern === null) {
            var matchRelation = f.get('relation')[0].getValue();
            var matchUri = f.get('name')[0].getValue();
            var matchName = new Name(matchUri);
            passed = ConfigPolicyManager.matchesRelation(objName, matchName, matchRelation);
          }
          else
            passed = (NdnRegexMatcher.match(regexPattern, objName) !== null);

          if (!passed)
            break;
        }

        if (passed)
          return r;
      }
    }
  }

  return null;
};

/**
 * Determines if a name satisfies the relation to matchName.
 * @param {Name} name
 * @param {Name} matchName
 * @param {string} matchRelation Can be one of:
 *   'is-prefix-of' - passes if the name is equal to or has the other
 *      name as a prefix
 *   'is-strict-prefix-of' - passes if the name has the other name as a
 *      prefix, and is not equal
 *   'equal' - passes if the two names are equal
 * @returns {boolean}
 */
ConfigPolicyManager.matchesRelation = function(name, matchName, matchRelation)
{
  var passed = false;
  if (matchRelation == 'is-strict-prefix-of') {
    if (matchName.size() == name.size())
      passed = false;
    else if (matchName.match(name))
      passed = true;
  }
  else if (matchRelation == 'is-prefix-of') {
    if (matchName.match(name))
      passed = true;
  }
  else if (matchRelation == 'equal') {
    if (matchName.equals(name))
      passed = true;
  }
  return passed;
};

/**
 * Extract the signature information from the interest name or from the data
 * packet or interest.
 * @param {Data|Interest} dataOrInterest The object whose signature is needed.
 * @param {WireFormat} wireFormat (optional) The wire format used to decode
 * signature information from the interest name.
 * @returns {Signature} The object of a sublcass of Signature or null if can't
 * decode.
 */
ConfigPolicyManager.extractSignature = function(dataOrInterest, wireFormat)
{
  if (dataOrInterest instanceof Data)
    return dataOrInterest.getSignature();
  else if (dataOrInterest instanceof Interest) {
    wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());
    try {
      var signature = wireFormat.decodeSignatureInfoAndValue
        (dataOrInterest.getName().get(-2).getValue().buf(),
         dataOrInterest.getName().get(-1).getValue().buf());
    }
    catch (e) {
      return null;
    }

    return signature;
  }

  return null;
};

/**
 * Determine whether the timestamp from the interest is newer than the last use
 * of this key, or within the grace interval on first use.
 * @param {Name} keyName The name of the public key used to sign the interest.
 * @param {number} timestamp The timestamp extracted from the interest name.
 * @returns {boolean} True if timestamp is fresh as described above.
 */
ConfigPolicyManager.prototype.interestTimestampIsFresh = function
  (keyName, timestamp)
{
  var lastTimestamp = this.keyTimestamps[keyName.toUri()];
  if (lastTimestamp == undefined) {
    var now = new Date().getTime();
    var notBefore = now - this.keyGraceInterval;
    var notAfter = now + this.keyGraceInterval;
    return timestamp > notBefore && timestamp < notAfter;
  }
  else
    return timestamp > lastTimestamp;
};

/**
 * Trim the table size down if necessary, and insert/update the latest interest
 * signing timestamp for the key. Any key which has not been used within the TTL
 * period is purged. If the table is still too large, the oldest key is purged.
 * @param {Name} keyName The name of the public key used to sign the interest.
 * @param {number} timestamp The timestamp extracted from the interest name.
 */
ConfigPolicyManager.prototype.updateTimestampForKey = function
  (keyName, timestamp)
{
  this.keyTimestamps[keyName.toUri()] = timestamp;

  // JavaScript does have a direct way to get the number of entries, so first
  //   get the keysToErase while counting.
  var keyTimestampsSize = 0;
  var keysToErase = [];

  var now = new Date().getTime();
  var oldestTimestamp = now;
  var oldestKey = null;
  for (var keyUri in this.keyTimestamps) {
    ++keyTimestampsSize;
    var ts = this.keyTimestamps[keyUri];
    if (now - ts > this.keyTimestampTtl)
      keysToErase.push(keyUri);
    else if (ts < oldestTimestamp) {
      oldestTimestamp = ts;
      oldestKey = keyUri;
    }
  }

  if (keyTimestampsSize >= this.maxTrackedKeys) {
    // Now delete the expired keys.
    for (var i = 0; i < keysToErase.length; ++i) {
      delete this.keyTimestamps[keysToErase[i]];
      --keyTimestampsSize;
    }

    if (keyTimestampsSize > this.maxTrackedKeys)
      // We have not removed enough.
      delete this.keyTimestamps[oldestKey];
  }
};

/**
 * Check the type of signatureInfo to get the KeyLocator. Look in the
 * IdentityStorage for the public key with the name in the KeyLocator and use it
 * to verify the signedBlob. If the public key can't be found, return false.
 * (This is a generalized method which can verify both a data packet and an
 * interest.)
 * @param {Signature} signatureInfo An object of a subclass of Signature, e.g.
 * Sha256WithRsaSignature.
 * @param {SignedBlob} signedBlob The SignedBlob with the signed portion to
 * verify.
 * @param onComplete {function} This calls onComplete(true) if the signature
 * verifies, otherwise onComplete(false).
 */
ConfigPolicyManager.prototype.verify = function
  (signatureInfo, signedBlob, onComplete)
{
  // We have already checked once that there is a key locator.
  var keyLocator = KeyLocator.getFromSignature(signatureInfo);

  if (keyLocator.getType() == KeyLocatorType.KEYNAME) {
    // Assume the key name is a certificate name.
    var signatureName = keyLocator.getKeyName();
    var certificate = this.refreshManager.getCertificate(signatureName);
    if (certificate == null)
      certificate = this.certificateCache.getCertificate(signatureName);
    if (certificate == null)
      return onComplete(false);

    var publicKeyDer = certificate.getPublicKeyInfo().getKeyDer();
    if (publicKeyDer.isNull())
      // Can't find the public key with the name.
      return onComplete(false);

    return PolicyManager.verifySignature
      (signatureInfo, signedBlob, publicKeyDer, onComplete);
  }
  else
    // Can't find a key to verify.
    return onComplete(false);
};

ConfigPolicyManager.TrustAnchorRefreshManager =
  function ConfigPolicyManagerTrustAnchorRefreshManager()
{
  this.certificateCache = new CertificateCache();
  // Maps the directory name to certificate names so they can be deleted when
  // necessary. The key is the directory name string. The value is the object
  //  {certificateNames,  // array of string
  //   nextRefresh,       // number
  //   refreshPeriod      // number
  //  }.
  this.refreshDirectories = {};
};

ConfigPolicyManager.TrustAnchorRefreshManager.loadIdentityCertificateFromFile =
  function(fileName)
{
  var encodedData = fs.readFileSync(fileName).toString();
  var decodedData = new Buffer(encodedData, 'base64');
  var cert = new IdentityCertificate();
  cert.wireDecode(new Blob(decodedData, false));
  return cert;
};

ConfigPolicyManager.TrustAnchorRefreshManager.prototype.getCertificate = function
  (certificateName)
{
  // This assumes the timestamp is already removed.
  return this.certificateCache.getCertificate(certificateName);
};

// refreshPeriod in milliseconds.
ConfigPolicyManager.TrustAnchorRefreshManager.prototype.addDirectory = function
  (directoryName, refreshPeriod)
{
  var allFiles;
  try {
    allFiles = fs.readdirSync(directoryName);
  }
  catch (e) {
    throw new SecurityException(new Error
      ("Cannot list files in directory " + directoryName));
  }

  var certificateNames = [];
  for (var i = 0; i < allFiles.length; ++i) {
    var cert;
    try {
      var fullPath = path.join(directoryName, allFiles[i]);
      cert = ConfigPolicyManager.TrustAnchorRefreshManager.loadIdentityCertificateFromFile
        (fullPath);
    }
    catch (e) {
      // Allow files that are not certificates.
      continue;
    }

    // Cut off the timestamp so it matches the KeyLocator Name format.
    var certUri = cert.getName().getPrefix(-1).toUri();
    this.certificateCache.insertCertificate(cert);
    certificateNames.push(certUri);
  }

  this.refreshDirectories[directoryName] = {
    certificates: certificateNames,
    nextRefresh: new Date().getTime() + refreshPeriod,
    refreshPeriod: refreshPeriod };
};

ConfigPolicyManager.TrustAnchorRefreshManager.prototype.refreshAnchors = function()
{
  var refreshTime =  new Date().getTime();
  for (var directory in this.refreshDirectories) {
    var info = this.refreshDirectories[directory];
    var nextRefreshTime = info.nextRefresh;
    if (nextRefreshTime <= refreshTime) {
      var certificateList = info.certificates.slice(0);
      // Delete the certificates associated with this directory if possible
      //   then re-import.
      // IdentityStorage subclasses may not support deletion.
      for (var c in certificateList)
        this.certificateCache.deleteCertificate(new Name(c));

      this.addDirectory(directory, info.refreshPeriod);
    }
  }
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Name = require('../../name.js').Name;
var PolicyManager = require('./policy-manager.js').PolicyManager;

/**
 * @constructor
 */
var NoVerifyPolicyManager = function NoVerifyPolicyManager()
{
  // Call the base constructor.
  PolicyManager.call(this);
};

NoVerifyPolicyManager.prototype = new PolicyManager();
NoVerifyPolicyManager.prototype.name = "NoVerifyPolicyManager";

exports.NoVerifyPolicyManager = NoVerifyPolicyManager;

/**
 * Override to always skip verification and trust as valid.
 *
 * @param {Data|Interest} dataOrInterest The received data packet or interest.
 * @returns {boolean} True.
 */
NoVerifyPolicyManager.prototype.skipVerifyAndTrust = function(dataOrInterest)
{
  return true;
};

/**
 * Override to return false for no verification rule for the received data or
 * signed interest.
 *
 * @param {Data|Interest} dataOrInterest The received data packet or interest.
 * @returns {boolean} False.
 */
NoVerifyPolicyManager.prototype.requireVerify = function(dataOrInterest)
{
  return false;
};

/**
 * Override to call onVerified(data) and to indicate no further verification
 * step.
 *
 * @param {Data|Interest} dataOrInterest The Data object or interest with the
 * signature to check.
 * @param {number} stepCount The number of verification steps that have been
 * done, used to track the verification progress.
 * @param {function} onVerified This does override to call
 * onVerified(dataOrInterest).
 * @param {function} onVerifyFailed Override to ignore this.
 * @param {WireFormat} wireFormat
 * @returns {ValidationRequest} null for no further step for looking up a
 * certificate chain.
 */
NoVerifyPolicyManager.prototype.checkVerificationPolicy = function
  (dataOrInterest, stepCount, onVerified, onVerifyFailed, wireFormat)
{
  onVerified(dataOrInterest);
  return null;
};

/**
 * Override to always indicate that the signing certificate name and data name
 * satisfy the signing policy.
 *
 * @param {Name} dataName The name of data to be signed.
 * @param {Name} certificateName The name of signing certificate.
 * @returns {boolean} True to indicate that the signing certificate can be used
 * to sign the data.
 */
NoVerifyPolicyManager.prototype.checkSigningPolicy = function
  (dataName, certificateName)
{
  return true;
};

/**
 * Override to indicate that the signing identity cannot be inferred.
 *
 * @param {Name} dataName The name of data to be signed.
 * @returns {Name} An empty name because cannot infer.
 */
NoVerifyPolicyManager.prototype.inferSigningIdentity = function(dataName)
{
  return new Name();
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Name = require('../../name.js').Name;
var Interest = require('../../interest.js').Interest;
var Data = require('../../data.js').Data;
var Blob = require('../../util/blob.js').Blob;
var IdentityCertificate = require('../certificate/identity-certificate.js').IdentityCertificate;
var KeyLocator = require('../../key-locator.js').KeyLocator;
var KeyLocatorType = require('../../key-locator.js').KeyLocatorType;
var SecurityException = require('../security-exception.js').SecurityException;
var WireFormat = require('../../encoding/wire-format.js').WireFormat;
var SyncPromise = require('../../util/sync-promise').SyncPromise;
var PolicyManager = require('./policy-manager.js').PolicyManager;

/**
 * A SelfVerifyPolicyManager implements a PolicyManager to look in the
 * IdentityStorage for the public key with the name in the KeyLocator (if
 * available) and use it to verify the data packet, without searching a
 * certificate chain.  If the public key can't be found, the verification fails.
 *
 * @param {IdentityStorage} identityStorage (optional) The IdentityStorage for
 * looking up the public key. This object must remain valid during the life of
 * this SelfVerifyPolicyManager. If omitted, then don't look for a public key
 * with the name in the KeyLocator and rely on the KeyLocator having the full
 * public key DER.
 * @constructor
 */
var SelfVerifyPolicyManager = function SelfVerifyPolicyManager(identityStorage)
{
  // Call the base constructor.
  PolicyManager.call(this);

  this.identityStorage = identityStorage;
};

SelfVerifyPolicyManager.prototype = new PolicyManager();
SelfVerifyPolicyManager.prototype.name = "SelfVerifyPolicyManager";

exports.SelfVerifyPolicyManager = SelfVerifyPolicyManager;

/**
 * Never skip verification.
 *
 * @param {Data|Interest} dataOrInterest The received data packet or interest.
 * @returns {boolean} False.
 */
SelfVerifyPolicyManager.prototype.skipVerifyAndTrust = function(dataOrInterest)
{
  return false;
};

/**
 * Always return true to use the self-verification rule for the received data.
 *
 * @param {Data|Interest} dataOrInterest The received data packet or interest.
 * @returns {boolean} True.
 */
SelfVerifyPolicyManager.prototype.requireVerify = function(dataOrInterest)
{
  return true;
};

/**
 * Look in the IdentityStorage for the public key with the name in the
 * KeyLocator (if available) and use it to verify the data packet.  If the
 * public key can't be found, call onVerifyFailed.
 *
 * @param {Data|Interest} dataOrInterest The Data object or interest with the
 * signature to check.
 * @param {number} stepCount The number of verification steps that have been
 * done, used to track the verification progress.
 * @param {function} onVerified If the signature is verified, this calls
 * onVerified(dataOrInterest).
 * @param {function} onVerifyFailed If the signature check fails, this calls
 * onVerifyFailed(dataOrInterest).
 * @param {WireFormat} wireFormat
 * @returns {ValidationRequest} null for no further step for looking up a
 * certificate chain.
 */
SelfVerifyPolicyManager.prototype.checkVerificationPolicy = function
  (dataOrInterest, stepCount, onVerified, onVerifyFailed, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());

  if (dataOrInterest instanceof Data) {
    var data = dataOrInterest;
    // wireEncode returns the cached encoding if available.
    this.verify(data.getSignature(), data.wireEncode(), function(verified) {
      if (verified) onVerified(data); else onVerifyFailed(data);
    });
  }
  else if (dataOrInterest instanceof Interest) {
    var interest = dataOrInterest;
    // Decode the last two name components of the signed interest
    var signature = wireFormat.decodeSignatureInfoAndValue
      (interest.getName().get(-2).getValue().buf(),
       interest.getName().get(-1).getValue().buf());

    // wireEncode returns the cached encoding if available.
    this.verify(signature, interest.wireEncode(), function(verified) {
      if (verified) onVerified(interest); else onVerifyFailed(interest);
    });
  }
  else
    throw new SecurityException(new Error
      ("checkVerificationPolicy: unrecognized type for dataOrInterest"));

  // No more steps, so return a None.
  return null;
};

/**
 * Override to always indicate that the signing certificate name and data name
 * satisfy the signing policy.
 *
 * @param {Name} dataName The name of data to be signed.
 * @param {Name} certificateName The name of signing certificate.
 * @returns {boolean} True to indicate that the signing certificate can be used
 * to sign the data.
 */
SelfVerifyPolicyManager.prototype.checkSigningPolicy = function
  (dataName, certificateName)
{
  return true;
};

/**
 * Override to indicate that the signing identity cannot be inferred.
 *
 * @param {Name} dataName The name of data to be signed.
 * @returns {Name} An empty name because cannot infer.
 */
SelfVerifyPolicyManager.prototype.inferSigningIdentity = function(dataName)
{
  return new Name();
};

/**
 * Check the type of signatureInfo to get the KeyLocator. Look in the
 * IdentityStorage for the public key with the name in the KeyLocator (if
 * available) and use it to verify the signedBlob. If the public key can't be
 * found, return false. (This is a generalized method which can verify both a
 * Data packet and an interest.)
 * @param {Signature} signatureInfo An object of a subclass of Signature, e.g.
 * Sha256WithRsaSignature.
 * @param {SignedBlob} signedBlob the SignedBlob with the signed portion to
 * verify.
 * @param onComplete {function} This calls onComplete(true) if the signature
 * verifies, otherwise onComplete(false).
 */
SelfVerifyPolicyManager.prototype.verify = function
  (signatureInfo, signedBlob, onComplete)
{
  if (KeyLocator.canGetFromSignature(signatureInfo)) {
    this.getPublicKeyDer
      (KeyLocator.getFromSignature(signatureInfo), function(publicKeyDer) {
        if (publicKeyDer.isNull())
          onComplete(false);
        else
          PolicyManager.verifySignature
            (signatureInfo, signedBlob, publicKeyDer, onComplete);
      });
  }
  else
    // Assume that the signature type does not require a public key.
    PolicyManager.verifySignature
      (signatureInfo, signedBlob, null, onComplete);
};

/**
 * Look in the IdentityStorage for the public key with the name in the
 * KeyLocator (if available). If the public key can't be found, return and empty
 * Blob.
 * @param {KeyLocator} keyLocator The KeyLocator.
 * @param onComplete {function} This calls onComplete(publicKeyDer) where
 * publicKeyDer is the public key DER Blob or an isNull Blob if not found.
 */
SelfVerifyPolicyManager.prototype.getPublicKeyDer = function
  (keyLocator, onComplete)
{
  if (keyLocator.getType() == KeyLocatorType.KEYNAME &&
           this.identityStorage != null)
    // Assume the key name is a certificate name.
    SyncPromise.complete
      (onComplete, this.identityStorage.getKeyPromise
       (IdentityCertificate.certificateNameToPublicKeyName
        (keyLocator.getKeyName())));
  else
    // Can't find a key to verify.
    onComplete(new Blob());
};
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * From ndn-cxx security by Yingdi Yu <yingdi@cs.ucla.edu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Name = require('../name.js').Name;
var Interest = require('../interest.js').Interest;
var Data = require('../data.js').Data;
var KeyLocatorType = require('../key-locator.js').KeyLocatorType;
var Sha256WithRsaSignature = require('../sha256-with-rsa-signature.js').Sha256WithRsaSignature;
var WireFormat = require('../encoding/wire-format.js').WireFormat;
var Tlv = require('../encoding/tlv/tlv.js').Tlv;
var TlvEncoder = require('../encoding/tlv/tlv-encoder.js').TlvEncoder;
var SecurityException = require('./security-exception.js').SecurityException;
var RsaKeyParams = require('./key-params.js').RsaKeyParams;
var IdentityCertificate = require('./certificate/identity-certificate.js').IdentityCertificate;
var SyncPromise = require('../util/sync-promise').SyncPromise;

/**
 * A KeyChain provides a set of interfaces to the security library such as
 * identity management, policy configuration and packet signing and verification.
 * Note: This class is an experimental feature. See the API docs for more detail at
 * http://named-data.net/doc/ndn-ccl-api/key-chain.html .
 *
 * Create a new KeyChain with the given IdentityManager and PolicyManager.
 * @param {IdentityManager} identityManager An object of a subclass of
 * IdentityManager.
 * @param {PolicyManager} policyManager An object of a subclass of
 * PolicyManager.
 * @constructor
 */
var KeyChain = function KeyChain(identityManager, policyManager)
{
  this.identityManager = identityManager;
  this.policyManager = policyManager;
  this.face = null;
  this.maxSteps = 100;
};

exports.KeyChain = KeyChain;

/*****************************************
 *          Identity Management          *
 *****************************************/

/**
 * Create an identity by creating a pair of Key-Signing-Key (KSK) for this
 * identity and a self-signed certificate of the KSK. If a key pair or
 * certificate for the identity already exists, use it.
 * @param {Name} identityName The name of the identity.
 * @param {KeyParams} params (optional) The key parameters if a key needs to be
 * generated for the identity. If omitted, use KeyChain.DEFAULT_KEY_PARAMS.
 * @param {function} onComplete (optional) This calls onComplete(certificateName)
 * with name of the default certificate of the identity. If omitted, the return
 * value is described below. (Some crypto libraries only use a callback, so
 * onComplete is required to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @returns {Name} If onComplete is omitted, return the name of the default
 * certificate of the identity. Otherwise, if onComplete is supplied then return
 * undefined and use onComplete as described above.
 */
KeyChain.prototype.createIdentityAndCertificate = function
  (identityName, params, onComplete, onError)
{
  onError = (typeof params === "function") ? onComplete : onError;
  onComplete = (typeof params === "function") ? params : onComplete;
  params = (typeof params === "function" || !params) ?
    KeyChain.DEFAULT_KEY_PARAMS : params;

  return this.identityManager.createIdentityAndCertificate
    (identityName, params, onComplete, onError);
};

/**
 * Create an identity by creating a pair of Key-Signing-Key (KSK) for this
 * identity and a self-signed certificate of the KSK. If a key pair or
 * certificate for the identity already exists, use it.
 * @deprecated Use createIdentityAndCertificate which returns the
 * certificate name instead of the key name. You can use
 * IdentityCertificate.certificateNameToPublicKeyName to convert the
 * certificate name to the key name.
 * @param {Name} identityName The name of the identity.
 * @param {KeyParams} params (optional) The key parameters if a key needs to be
 * generated for the identity. If omitted, use KeyChain.DEFAULT_KEY_PARAMS.
 * @returns {Name} The key name of the auto-generated KSK of the identity.
 */
KeyChain.prototype.createIdentity = function(identityName, params)
{
  return IdentityCertificate.certificateNameToPublicKeyName
    (this.createIdentityAndCertificate(identityName, params));
};

/**
 * Delete the identity from the public and private key storage. If the
 * identity to be deleted is the current default system default, this will not
 * delete the identity and will return immediately.
 * @param identityName {Name} The name of the identity.
 * @param {function} onComplete (optional) This calls onComplete() when the
 * operation is complete. If omitted, do not use it. (Some database libraries
 * only use a callback, so onComplete is required to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 */
KeyChain.prototype.deleteIdentity = function
  (identityName, onComplete, onError)
{
  this.identityManager.deleteIdentity(identityName, onComplete, onError);
};

/**
 * Get the default identity.
 * @param {function} onComplete (optional) This calls onComplete(identityName)
 * with name of the default identity. If omitted, the return value is described
 * below. (Some crypto libraries only use a callback, so onComplete is required
 * to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @returns {Name} If onComplete is omitted, return the name of the default
 * identity. Otherwise, if onComplete is supplied then return undefined and use
 * onComplete as described above.
 * @throws SecurityException if the default identity is not set. However, if
 * onComplete and onError are defined, then if there is an exception return
 * undefined and call onError(exception).
 */
KeyChain.prototype.getDefaultIdentity = function(onComplete, onError)
{
  return this.identityManager.getDefaultIdentity(onComplete, onError);
};

/**
 * Get the default certificate name of the default identity, which will be used
 * when signing is based on identity and the identity is not specified.
 * @param {function} onComplete (optional) This calls onComplete(certificateName)
 * with name of the default certificate. If omitted, the return value is described
 * below. (Some crypto libraries only use a callback, so onComplete is required
 * to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @return {Name} If onComplete is omitted, return the default certificate name.
 * Otherwise, if onComplete is supplied then return undefined and use onComplete
 * as described above.
 * @throws SecurityException if the default identity is not set or the default
 * key name for the identity is not set or the default certificate name for
 * the key name is not set. However, if onComplete and onError are defined, then
 * if there is an exception return undefined and call onError(exception).
 */
KeyChain.prototype.getDefaultCertificateName = function(onComplete, onError)
{
  return this.identityManager.getDefaultCertificateName();
};

/**
 * Generate a pair of RSA keys for the specified identity.
 * @param {Name} identityName The name of the identity.
 * @param {boolean} isKsk (optional) true for generating a Key-Signing-Key (KSK),
 * false for a Data-Signing-Key (DSK). If omitted, generate a Data-Signing-Key.
 * @param {number} keySize (optional) The size of the key. If omitted, use a
 * default secure key size.
 * @returns {Name} The generated key name.
 */
KeyChain.prototype.generateRSAKeyPair = function(identityName, isKsk, keySize)
{
  return this.identityManager.generateRSAKeyPair(identityName, isKsk, keySize);
};

/**
 * Set a key as the default key of an identity. The identity name is inferred
 * from keyName.
 * @param {Name} keyName The name of the key.
 * @param {Name} identityNameCheck (optional) The identity name to check that the
 * keyName contains the same identity name. If an empty name, it is ignored.
 * @param {function} onComplete (optional) This calls onComplete() when complete.
 * (Some database libraries only use a callback, so onComplete is required to
 * use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 */
KeyChain.prototype.setDefaultKeyForIdentity = function
  (keyName, identityNameCheck, onComplete, onError)
{
  return this.identityManager.setDefaultKeyForIdentity
    (keyName, identityNameCheck, onComplete, onError);
};

/**
 * Generate a pair of RSA keys for the specified identity and set it as default
 * key for the identity.
 * @param {Name} identityName The name of the identity.
 * @param {boolean} isKsk (optional) true for generating a Key-Signing-Key (KSK),
 * false for a Data-Signing-Key (DSK). If omitted, generate a Data-Signing-Key.
 * @param {number} keySize (optional) The size of the key. If omitted, use a
 * default secure key size.
 * @returns {Name} The generated key name.
 */
KeyChain.prototype.generateRSAKeyPairAsDefault = function
  (identityName, isKsk, keySize)
{
  return this.identityManager.generateRSAKeyPairAsDefault
    (identityName, isKsk, keySize);
};

/**
 * Create a public key signing request.
 * @param {Name} keyName The name of the key.
 * @returns {Blob} The signing request data.
 */
KeyChain.prototype.createSigningRequest = function(keyName)
{
  return this.identityManager.getPublicKey(keyName).getKeyDer();
};

/**
 * Install an identity certificate into the public key identity storage.
 * @param {IdentityCertificate} certificate The certificate to to added.
 * @param {function} onComplete (optional) This calls onComplete() when complete.
 * (Some database libraries only use a callback, so onComplete is required to
 * use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 */
KeyChain.prototype.installIdentityCertificate = function
  (certificate, onComplete, onError)
{
  this.identityManager.addCertificate(certificate, onComplete, onError);
};

/**
 * Set the certificate as the default for its corresponding key.
 * @param {IdentityCertificate} certificate The certificate.
 * @param {function} onComplete (optional) This calls onComplete() when complete.
 * (Some database libraries only use a callback, so onComplete is required to
 * use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 */
KeyChain.prototype.setDefaultCertificateForKey = function
  (certificate, onComplete, onError)
{
  this.identityManager.setDefaultCertificateForKey
    (certificate, onComplete, onError);
};

/**
 * Get a certificate which is still valid with the specified name.
 * @param {Name} certificateName The name of the requested certificate.
 * @param {function} onComplete (optional) This calls onComplete(certificate)
 * with the requested IdentityCertificate which is valid. If omitted, the return
 * value is described below. (Some crypto libraries only use a callback, so
 * onComplete is required to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @return {IdentityCertificate} If onComplete is omitted, return the requested
 * certificate which is valid. Otherwise, if onComplete is supplied then return
 * undefined and use onComplete as described above.
 */
KeyChain.prototype.getCertificate = function
  (certificateName, onComplete, onError)
{
  return this.identityManager.getCertificate
    (certificateName, onComplete, onError);
};

/**
 * Get a certificate even if the certificate is not valid anymore.
 * @param {Name} certificateName The name of the requested certificate.
 * @param {function} onComplete (optional) This calls onComplete(certificate)
 * with the requested IdentityCertificate. If omitted, the return value is
 * described below. (Some crypto libraries only use a callback, so onComplete is
 * required to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @return {IdentityCertificate} If onComplete is omitted, return the requested
 * certificate. Otherwise, if onComplete is supplied then return undefined and
 * use onComplete as described above.
 */
KeyChain.prototype.getAnyCertificate = function
  (certificateName, onComplete, onError)
{
  return this.identityManager.getAnyCertificate
    (certificateName, onComplete, onError);
};

/**
 * Get an identity certificate which is still valid with the specified name.
 * @param {Name} certificateName The name of the requested certificate.
 * @param {function} onComplete (optional) This calls onComplete(certificate)
 * with the requested IdentityCertificate which is valid. If omitted, the return
 * value is described below. (Some crypto libraries only use a callback, so
 * onComplete is required to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @return {IdentityCertificate} If onComplete is omitted, return the requested
 * certificate which is valid. Otherwise, if onComplete is supplied then return
 * undefined and use onComplete as described above.
 */
KeyChain.prototype.getIdentityCertificate = function
  (certificateName, onComplete, onError)
{
  return this.identityManager.getCertificate
    (certificateName, onComplete, onError);
};

/**
 * Get an identity certificate even if the certificate is not valid anymore.
 * @param {Name} certificateName The name of the requested certificate.
 * @param {function} onComplete (optional) This calls onComplete(certificate)
 * with the requested IdentityCertificate. If omitted, the return value is
 * described below. (Some crypto libraries only use a callback, so onComplete is
 * required to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @return {IdentityCertificate} If onComplete is omitted, return the requested
 * certificate. Otherwise, if onComplete is supplied then return undefined and
 * use onComplete as described above.
 */
KeyChain.prototype.getAnyIdentityCertificate = function
  (certificateName, onComplete, onError)
{
  return this.identityManager.getAnyCertificate
    (certificateName, onComplete, onError);
};

/**
 * Revoke a key.
 * @param {Name} keyName The name of the key that will be revoked.
 */
KeyChain.prototype.revokeKey = function(keyName)
{
  //TODO: Implement
};

/**
 * Revoke a certificate.
 * @param {Name} certificateName The name of the certificate that will be
 * revoked.
 */
KeyChain.prototype.revokeCertificate = function(certificateName)
{
  //TODO: Implement
};

/**
 * Get the identity manager given to or created by the constructor.
 * @returns {IdentityManager} The identity manager.
 */
KeyChain.prototype.getIdentityManager = function()
{
  return this.identityManager;
};

/*****************************************
 *           Policy Management           *
 *****************************************/

/**
 * Get the policy manager given to or created by the constructor.
 * @returns {PolicyManager} The policy manager.
 */
KeyChain.prototype.getPolicyManager = function()
{
  return this.policyManager;
};

/*****************************************
 *              Sign/Verify              *
 *****************************************/

/**
 * Sign the target. If it is a Data or Interest object, set its signature. If it
 * is an array, produce a Signature object.
 * @param {Data|Interest|Buffer} target If this is a Data object, wire encode for
 * signing, update its signature and key locator field and wireEncoding. If this
 * is an Interest object, wire encode for signing, append a SignatureInfo to the
 * Interest name, sign the name components and append a final name component
 * with the signature bits. If it is an array, sign it and produce a Signature
 * object.
 * @param {Name} certificateName The certificate name of the key to use for
 * signing.
 * @param {WireFormat} wireFormat (optional) A WireFormat object used to encode
 * the input. If omitted, use WireFormat getDefaultWireFormat().
 * @param {function} onComplete (optional) If target is a Data object, this calls
 * onComplete(data) with the supplied Data object which has been modified to set
 * its signature. If target is an Interest object, this calls
 * onComplete(interest) with the supplied Interest object which has been
 * modified to set its signature. If target is a Buffer, this calls
 * onComplete(signature) where signature is the produced Signature object. If
 * omitted, the return value is described below. (Some crypto libraries only use
 * a callback, so onComplete is required to use these.)
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 * @returns {Signature} If onComplete is omitted, return the generated Signature
 * object (if target is a Buffer) or undefined (if target is Data or Interest).
 * Otherwise, if onComplete is supplied then return undefined and use onComplete as
 * described above.
 */
KeyChain.prototype.sign = function
  (target, certificateName, wireFormat, onComplete, onError)
{
  if (target instanceof Interest)
    return this.identityManager.signInterestByCertificate
      (target, certificateName, wireFormat, onComplete, onError);
  else if (target instanceof Data)
    return this.identityManager.signByCertificate
      (target, certificateName, wireFormat, onComplete, onError);
  else
    return this.identityManager.signByCertificate
      (target, certificateName, onComplete, onError);
};

/**
 * Sign the target. If it is a Data object, set its signature. If it is an
 * array, produce a signature object.
 * @param {Data|Buffer} target If this is a Data object, wire encode for
 * signing, update its signature and key locator field and wireEncoding. If it
 * is an array, sign it and return a Signature object.
 * @param identityName (optional) The identity name for the key to use for
 * signing.  If omitted, infer the signing identity from the data packet name.
 * @param wireFormat (optional) A WireFormat object used to encode the input. If
 * omitted, use WireFormat getDefaultWireFormat().
 * @param {function} onComplete (optional) If target is a Data object, this calls
 * onComplete(data) with the supplied Data object which has been modified to set
 * its signature. If target is a Buffer, this calls
 * onComplete(signature) where signature is the produced Signature object. If
 * omitted, the return value is described below. (Some crypto libraries only use
 * a callback, so onComplete is required to use these.)
 * @returns {Signature} If onComplete is omitted, return the generated Signature
 * object (if target is a Buffer) or undefined (if target is Data).
 * Otherwise, if onComplete is supplied then return undefined and use onComplete
 * as described above.
 * @param {function} onError (optional) If defined, then onComplete must be
 * defined and if there is an exception, then this calls onError(exception)
 * with the exception. If onComplete is defined but onError is undefined, then
 * this will log any thrown exception. (Some database libraries only use a
 * callback, so onError is required to be notified of an exception.)
 */
KeyChain.prototype.signByIdentity = function
  (target, identityName, wireFormat, onComplete, onError)
{
  onError = (typeof wireFormat === "function") ? onComplete : onError;
  onComplete = (typeof wireFormat === "function") ? wireFormat : onComplete;
  wireFormat = (typeof wireFormat === "function" || !wireFormat) ? WireFormat.getDefaultWireFormat() : wireFormat;

  var useSync = !onComplete;
  var thisKeyChain = this;
  
  if (identityName == null)
    identityName = new Name();

  if (target instanceof Data) {
    var data = target;

    var mainPromise = SyncPromise.resolve()
    .then(function() {
      if (identityName.size() == 0) {
        var inferredIdentity = thisKeyChain.policyManager.inferSigningIdentity
          (data.getName());
        if (inferredIdentity.size() == 0)
          return thisKeyChain.identityManager.getDefaultCertificateNamePromise
            (useSync);
        else
          return thisKeyChain.identityManager.getDefaultCertificateNameForIdentityPromise
              (inferredIdentity, useSync);
      }
      else
        return thisKeyChain.identityManager.getDefaultCertificateNameForIdentityPromise
          (identityName, useSync);
    })
    .then(function(signingCertificateName) {
      if (signingCertificateName.size() == 0)
        throw new SecurityException(new Error
          ("No qualified certificate name found!"));

      if (!thisKeyChain.policyManager.checkSigningPolicy
           (data.getName(), signingCertificateName))
        throw new SecurityException(new Error
          ("Signing Cert name does not comply with signing policy"));

      return thisKeyChain.identityManager.signByCertificatePromise
        (data, signingCertificateName, wireFormat, useSync);
    });

    return SyncPromise.complete(onComplete, onError, mainPromise);
  }
  else {
    var array = target;

    return SyncPromise.complete(onComplete, onError,
      this.identityManager.getDefaultCertificateNameForIdentityPromise
        (identityName, useSync)
      .then(function(signingCertificateName) {
        if (signingCertificateName.size() == 0)
          throw new SecurityException(new Error
            ("No qualified certificate name found!"));

        return thisKeyChain.identityManager.signByCertificatePromise
          (array, signingCertificateName, wireFormat, useSync);
      }));
  }
};

/**
 * Sign the target using DigestSha256.
 * @param {Data|Interest} target If this is a Data object, wire encode for
 * signing, digest it and set its SignatureInfo to a DigestSha256, updating its
 * signature and wireEncoding. If this is an Interest object, wire encode for
 * signing, append a SignatureInfo for DigestSha256 to the Interest name, digest
 * the name components and append a final name component with the signature bits.
 * @param {WireFormat} wireFormat (optional) A WireFormat object used to encode
 * the input. If omitted, use WireFormat getDefaultWireFormat().
 */
KeyChain.prototype.signWithSha256 = function(target, wireFormat)
{
  if (target instanceof Interest)
    this.identityManager.signInterestWithSha256(target, wireFormat);
  else
    this.identityManager.signWithSha256(target, wireFormat);
};

/**
 * Check the signature on the Data object and call either onVerify or
 * onVerifyFailed. We use callback functions because verify may fetch
 * information to check the signature.
 * @param {Data} data The Data object with the signature to check.
 * @param {function} onVerified If the signature is verified, this calls
 * onVerified(data).
 * @param {function} onVerifyFailed If the signature check fails, this calls
 * onVerifyFailed(data).
 * @param {number} stepCount
 */
KeyChain.prototype.verifyData = function
  (data, onVerified, onVerifyFailed, stepCount)
{
  if (this.policyManager.requireVerify(data)) {
    var nextStep = this.policyManager.checkVerificationPolicy
      (data, stepCount, onVerified, onVerifyFailed);
    if (nextStep != null) {
      var thisKeyChain = this;
      this.face.expressInterest
        (nextStep.interest,
         function(callbackInterest, callbackData) {
           thisKeyChain.onCertificateData(callbackInterest, callbackData, nextStep);
         },
         function(callbackInterest) {
           thisKeyChain.onCertificateInterestTimeout
             (callbackInterest, nextStep.retry, onVerifyFailed, data, nextStep);
         });
    }
  }
  else if (this.policyManager.skipVerifyAndTrust(data))
    onVerified(data);
  else
    onVerifyFailed(data);
};

/**
 * Check the signature on the signed interest and call either onVerify or
 * onVerifyFailed. We use callback functions because verify may fetch
 * information to check the signature.
 * @param {Interest} interest The interest with the signature to check.
 * @param {function} onVerified If the signature is verified, this calls
 * onVerified(interest).
 * @param {function} onVerifyFailed If the signature check fails, this calls
 * onVerifyFailed(interest).
 */
KeyChain.prototype.verifyInterest = function
  (interest, onVerified, onVerifyFailed, stepCount, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());

  if (this.policyManager.requireVerify(interest)) {
    var nextStep = this.policyManager.checkVerificationPolicy
      (interest, stepCount, onVerified, onVerifyFailed, wireFormat);
    if (nextStep != null) {
      var thisKeyChain = this;
      this.face.expressInterest
        (nextStep.interest,
         function(callbackInterest, callbackData) {
           thisKeyChain.onCertificateData(callbackInterest, callbackData, nextStep);
         },
         function(callbackInterest) {
           thisKeyChain.onCertificateInterestTimeout
             (callbackInterest, nextStep.retry, onVerifyFailed, data, nextStep);
         });
    }
  }
  else if (this.policyManager.skipVerifyAndTrust(interest))
    onVerified(interest);
  else
    onVerifyFailed(interest);
};

/**
 * Set the Face which will be used to fetch required certificates.
 * @param {Face} face A pointer to the Face object.
 */
KeyChain.prototype.setFace = function(face)
{
  this.face = face;
};

KeyChain.DEFAULT_KEY_PARAMS = new RsaKeyParams();

KeyChain.prototype.onCertificateData = function(interest, data, nextStep)
{
  // Try to verify the certificate (data) according to the parameters in nextStep.
  this.verifyData
    (data, nextStep.onVerified, nextStep.onVerifyFailed, nextStep.stepCount);
};

KeyChain.prototype.onCertificateInterestTimeout = function
  (interest, retry, onVerifyFailed, originalDataOrInterest, nextStep)
{
  if (retry > 0) {
    // Issue the same expressInterest as in verifyData except decrement retry.
    var thisKeyChain = this;
    this.face.expressInterest
      (interest,
       function(callbackInterest, callbackData) {
         thisKeyChain.onCertificateData(callbackInterest, callbackData, nextStep);
       },
       function(callbackInterest) {
         thisKeyChain.onCertificateInterestTimeout
           (callbackInterest, retry - 1, onVerifyFailed, originalDataOrInterest, nextStep);
       });
  }
  else
    onVerifyFailed(originalDataOrInterest);
};
/**
 * This class represents an Interest Exclude.
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Meki Cheraoui
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Name = require('./name.js').Name;
var DataUtils = require('./encoding/data-utils.js').DataUtils;
var Blob = require('./util/blob.js').Blob;

/**
 * Create a new Exclude.
 * @constructor
 * @param {Array<Name.Component|Buffer|Exclude.ANY>} values (optional) An array where each element is either a Name.Component, Buffer component or Exclude.ANY.
 */
var Exclude = function Exclude(values)
{
  this.values = [];

  if (typeof values === 'object' && values instanceof Exclude)
    // Copy the exclude.
    this.values = values.values.slice(0);
  else if (values) {
    // Set the changeCount now since append expects it.
    this.changeCount = 0;
    for (var i = 0; i < values.length; ++i) {
      if (values[i] == Exclude.ANY)
        this.appendAny();
      else
        this.appendComponent(values[i]);
    }
  }

  this.changeCount = 0;
};

exports.Exclude = Exclude;

Exclude.ANY = "*";

/**
 * Get the number of entries.
 * @returns {number} The number of entries.
 */
Exclude.prototype.size = function() { return this.values.length; };

/**
 * Get the entry at the given index.
 * @param {number} i The index of the entry, starting from 0.
 * @returns {Exclude.ANY|Name.Component} Exclude.ANY or a Name.Component.
 */
Exclude.prototype.get = function(i) { return this.values[i]; };

/**
 * Append an Exclude.ANY element.
 * @returns This Exclude so that you can chain calls to append.
 */
Exclude.prototype.appendAny = function()
{
  this.values.push(Exclude.ANY);
  ++this.changeCount;
  return this;
};

/**
 * Append a component entry, copying from component.
 * @param {Name.Component|Buffer} component
 * @returns This Exclude so that you can chain calls to append.
 */
Exclude.prototype.appendComponent = function(component)
{
  this.values.push(new Name.Component(component));
  ++this.changeCount;
  return this;
};

/**
 * Clear all the entries.
 */
Exclude.prototype.clear = function()
{
  ++this.changeCount;
  this.values = [];
};

/**
 * Return a string with elements separated by "," and Exclude.ANY shown as "*".
 */
Exclude.prototype.toUri = function()
{
  if (this.values == null || this.values.length == 0)
    return "";

  var result = "";
  for (var i = 0; i < this.values.length; ++i) {
    if (i > 0)
      result += ",";

    if (this.values[i] == Exclude.ANY)
      result += "*";
    else
      result += Name.toEscapedString(this.values[i].getValue().buf());
  }
  return result;
};

/**
 * Return true if the component matches any of the exclude criteria.
 */
Exclude.prototype.matches = function(/*Buffer*/ component)
{
  if (typeof component == 'object' && component instanceof Name.Component)
    component = component.getValue().buf();
  else if (typeof component === 'object' && component instanceof Blob)
    component = component.buf();

  for (var i = 0; i < this.values.length; ++i) {
    if (this.values[i] == Exclude.ANY) {
      var lowerBound = null;
      if (i > 0)
        lowerBound = this.values[i - 1];

      // Find the upper bound, possibly skipping over multiple ANY in a row.
      var iUpperBound;
      var upperBound = null;
      for (iUpperBound = i + 1; iUpperBound < this.values.length; ++iUpperBound) {
        if (this.values[iUpperBound] != Exclude.ANY) {
          upperBound = this.values[iUpperBound];
          break;
        }
      }

      // If lowerBound != null, we already checked component equals lowerBound on the last pass.
      // If upperBound != null, we will check component equals upperBound on the next pass.
      if (upperBound != null) {
        if (lowerBound != null) {
          if (Exclude.compareComponents(component, lowerBound) > 0 &&
              Exclude.compareComponents(component, upperBound) < 0)
            return true;
        }
        else {
          if (Exclude.compareComponents(component, upperBound) < 0)
            return true;
        }

        // Make i equal iUpperBound on the next pass.
        i = iUpperBound - 1;
      }
      else {
        if (lowerBound != null) {
            if (Exclude.compareComponents(component, lowerBound) > 0)
              return true;
        }
        else
          // this.values has only ANY.
          return true;
      }
    }
    else {
      if (DataUtils.arraysEqual(component, this.values[i].getValue().buf()))
        return true;
    }
  }

  return false;
};

/**
 * Return -1 if component1 is less than component2, 1 if greater or 0 if equal.
 * A component is less if it is shorter, otherwise if equal length do a byte comparison.
 */
Exclude.compareComponents = function(component1, component2)
{
  if (typeof component1 == 'object' && component1 instanceof Name.Component)
    component1 = component1.getValue().buf();
  if (typeof component2 == 'object' && component2 instanceof Name.Component)
    component2 = component2.getValue().buf();

  return Name.Component.compareBuffers(component1, component2);
};

/**
 * Get the change count, which is incremented each time this object is changed.
 * @returns {number} The change count.
 */
Exclude.prototype.getChangeCount = function()
{
  return this.changeCount;
};
/**
 * This class represents Interest Objects
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Meki Cheraoui
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Blob = require('./util/blob.js').Blob;
var SignedBlob = require('./util/signed-blob.js').SignedBlob;
var ChangeCounter = require('./util/change-counter.js').ChangeCounter;
var Name = require('./name.js').Name;
var Exclude = require('./exclude.js').Exclude;
var KeyLocator = require('./key-locator.js').KeyLocator;
var WireFormat = require('./encoding/wire-format.js').WireFormat;

/**
 * Create a new Interest with the optional values.
 *
 * @constructor
 * @param {Name|Interest} nameOrInterest If this is an Interest, copy values from the interest and ignore the
 * other arguments.  Otherwise this is the optional name for the new Interest.
 * @param {number} minSuffixComponents
 * @param {number} maxSuffixComponents
 */
var Interest = function Interest
   (nameOrInterest, minSuffixComponents, maxSuffixComponents, 
    publisherPublicKeyDigest, exclude, childSelector, answerOriginKind, scope,
    interestLifetimeMilliseconds, nonce)
{
  if (publisherPublicKeyDigest)
    throw new Error
      ("Interest constructor: PublisherPublicKeyDigest support has been removed.");
  if (answerOriginKind)
    throw new Error
      ("Interest constructor: answerOriginKind support has been removed. Use setMustBeFresh().");
  if (scope)
    throw new Error("Interest constructor: scope support has been removed.");

  if (typeof nameOrInterest === 'object' && nameOrInterest instanceof Interest) {
    // Special case: this is a copy constructor.  Ignore all but the first argument.
    var interest = nameOrInterest;
    // Copy the name.
    this.name_ = new ChangeCounter(new Name(interest.getName()));
    this.maxSuffixComponents_ = interest.maxSuffixComponents_;
    this.minSuffixComponents_ = interest.minSuffixComponents_;

    this.keyLocator_ = new ChangeCounter(new KeyLocator(interest.getKeyLocator()));
    this.exclude_ = new ChangeCounter(new Exclude(interest.getExclude()));
    this.childSelector_ = interest.childSelector_;
    this.mustBeFresh_ = interest.mustBeFresh_;
    this.interestLifetimeMilliseconds_ = interest.interestLifetimeMilliseconds_;
    this.nonce_ = interest.nonce_;
    this.defaultWireEncoding_ = interest.getDefaultWireEncoding();
    this.defaultWireEncodingFormat_ = interest.defaultWireEncodingFormat_;
  }
  else {
    this.name_ = new ChangeCounter(typeof nameOrInterest === 'object' &&
                                   nameOrInterest instanceof Name ?
      new Name(nameOrInterest) : new Name());
    this.maxSuffixComponents_ = maxSuffixComponents;
    this.minSuffixComponents_ = minSuffixComponents;

    this.keyLocator_ = new ChangeCounter(new KeyLocator());
    this.exclude_ = new ChangeCounter(typeof exclude === 'object' && exclude instanceof Exclude ?
      new Exclude(exclude) : new Exclude());
    this.childSelector_ = childSelector;
    this.mustBeFresh_ = true;
    this.interestLifetimeMilliseconds_ = interestLifetimeMilliseconds;
    this.nonce_ = typeof nonce === 'object' && nonce instanceof Blob ?
      nonce : new Blob(nonce, true);
    this.defaultWireEncoding_ = new SignedBlob();
    this.defaultWireEncodingFormat_ = null;
  }

  this.getNonceChangeCount_ = 0;
  this.getDefaultWireEncodingChangeCount_ = 0;
  this.changeCount_ = 0;
};

exports.Interest = Interest;

Interest.RECURSIVE_POSTFIX = "*";

Interest.CHILD_SELECTOR_LEFT = 0;
Interest.CHILD_SELECTOR_RIGHT = 1;

/**
 * Check if this interest's name matches the given name (using Name.match) and
 * the given name also conforms to the interest selectors.
 * @param {Name} name The name to check.
 * @returns {boolean} True if the name and interest selectors match, False otherwise.
 */
Interest.prototype.matchesName = function(/*Name*/ name)
{
  if (!this.getName().match(name))
    return false;

  if (this.minSuffixComponents_ != null &&
      // Add 1 for the implicit digest.
      !(name.size() + 1 - this.getName().size() >= this.minSuffixComponents_))
    return false;
  if (this.maxSuffixComponents_ != null &&
      // Add 1 for the implicit digest.
      !(name.size() + 1 - this.getName().size() <= this.maxSuffixComponents_))
    return false;
  if (this.getExclude() != null && name.size() > this.getName().size() &&
      this.getExclude().matches(name.get(this.getName().size())))
    return false;

  return true;
};

/**
 * @deprecated Use matchesName.
 */
Interest.prototype.matches_name = function(/*Name*/ name)
{
  return this.matchesName(name);
};

/**
 * Return a new Interest with the same fields as this Interest.
 */
Interest.prototype.clone = function()
{
  return new Interest(this);
};

/**
 * Get the interest Name.
 * @returns {Name} The name.  The name size() may be 0 if not specified.
 */
Interest.prototype.getName = function() { return this.name_.get(); };

/**
 * Get the min suffix components.
 * @returns number} The min suffix components, or null if not specified.
 */
Interest.prototype.getMinSuffixComponents = function()
{
  return this.minSuffixComponents_;
};

/**
 * Get the max suffix components.
 * @returns {number} The max suffix components, or null if not specified.
 */
Interest.prototype.getMaxSuffixComponents = function()
{
  return this.maxSuffixComponents_;
};

/**
 * Get the interest key locator.
 * @returns {KeyLocator} The key locator. If its getType() is null,
 * then the key locator is not specified.
 */
Interest.prototype.getKeyLocator = function()
{
  return this.keyLocator_.get();
};

/**
 * Get the exclude object.
 * @returns {Exclude} The exclude object. If the exclude size() is zero, then
 * the exclude is not specified.
 */
Interest.prototype.getExclude = function() { return this.exclude_.get(); };

/**
 * Get the child selector.
 * @returns {number} The child selector, or null if not specified.
 */
Interest.prototype.getChildSelector = function()
{
  return this.childSelector_;
};

/**
 * Get the must be fresh flag. If not specified, the default is true.
 * @returns {boolean} The must be fresh flag.
 */
Interest.prototype.getMustBeFresh = function()
{
  return this.mustBeFresh_;
};

/**
 * Return the nonce value from the incoming interest.  If you change any of the
 * fields in this Interest object, then the nonce value is cleared.
 * @returns {Blob} The nonce. If not specified, the value isNull().
 */
Interest.prototype.getNonce = function()
{
  if (this.getNonceChangeCount_ != this.getChangeCount()) {
    // The values have changed, so the existing nonce is invalidated.
    this.nonce_ = new Blob();
    this.getNonceChangeCount_ = this.getChangeCount();
  }

  return this.nonce_;
};

/**
 * @deprecated Use getNonce. This method returns a Buffer which is the former
 * behavior of getNonce, and should only be used while updating your code.
 */
Interest.prototype.getNonceAsBuffer = function()
{
  return this.getNonce().buf();
};

/**
 * Get the interest lifetime.
 * @returns {number} The interest lifetime in milliseconds, or null if not
 * specified.
 */
Interest.prototype.getInterestLifetimeMilliseconds = function()
{
  return this.interestLifetimeMilliseconds_;
};

/**
 * Return the default wire encoding, which was encoded with
 * getDefaultWireEncodingFormat().
 * @returns {SignedBlob} The default wire encoding, whose isNull() may be true
 * if there is no default wire encoding.
 */
Interest.prototype.getDefaultWireEncoding = function()
{
  if (this.getDefaultWireEncodingChangeCount_ != this.getChangeCount()) {
    // The values have changed, so the default wire encoding is invalidated.
    this.defaultWireEncoding_ = new SignedBlob();
    this.defaultWireEncodingFormat_ = null;
    this.getDefaultWireEncodingChangeCount_ = this.getChangeCount();
  }

  return this.defaultWireEncoding_;
};

/**
 * Get the WireFormat which is used by getDefaultWireEncoding().
 * @returns {WireFormat} The WireFormat, which is only meaningful if the
 * getDefaultWireEncoding() is not isNull().
 */
Interest.prototype.getDefaultWireEncodingFormat = function()
{
  return this.defaultWireEncodingFormat_;
};

/**
 * Set the interest name.
 * Note: You can also call getName and change the name values directly.
 * @param {Name} name The interest name. This makes a copy of the name.
 * @returns {Interest} This Interest so that you can chain calls to update values.
 */
Interest.prototype.setName = function(name)
{
  this.name_.set(typeof name === 'object' && name instanceof Name ?
    new Name(name) : new Name());
  ++this.changeCount_;
  return this;
};

/**
 * Set the min suffix components count.
 * @param {number} minSuffixComponents The min suffix components count. If not
 * specified, set to undefined.
 * @returns {Interest} This Interest so that you can chain calls to update values.
 */
Interest.prototype.setMinSuffixComponents = function(minSuffixComponents)
{
  this.minSuffixComponents_ = minSuffixComponents;
  ++this.changeCount_;
  return this;
};

/**
 * Set the max suffix components count.
 * @param {number} maxSuffixComponents The max suffix components count. If not
 * specified, set to undefined.
 * @returns {Interest} This Interest so that you can chain calls to update values.
 */
Interest.prototype.setMaxSuffixComponents = function(maxSuffixComponents)
{
  this.maxSuffixComponents_ = maxSuffixComponents;
  ++this.changeCount_;
  return this;
};

/**
 * Set this interest to use a copy of the given exclude object. Note: You can
 * also call getExclude and change the exclude entries directly.
 * @param {Exclude} exclude The Exclude object. This makes a copy of the object.
 * If no exclude is specified, set to a new default Exclude(), or to an Exclude
 * with size() 0.
 * @returns {Interest} This Interest so that you can chain calls to update values.
 */
Interest.prototype.setExclude = function(exclude)
{
  this.exclude_.set(typeof exclude === 'object' && exclude instanceof Exclude ?
    new Exclude(exclude) : new Exclude());
  ++this.changeCount_;
  return this;
};

/**
 * Set the child selector.
 * @param {number} childSelector The child selector. If not specified, set to
 * undefined.
 * @returns {Interest} This Interest so that you can chain calls to update values.
 */
Interest.prototype.setChildSelector = function(childSelector)
{
  this.childSelector_ = childSelector;
  ++this.changeCount_;
  return this;
};

/**
 * Set the MustBeFresh flag.
 * @param {boolean} mustBeFresh True if the content must be fresh, otherwise
 * false. If you do not set this flag, the default value is true.
 * @returns {Interest} This Interest so that you can chain calls to update values.
 */
Interest.prototype.setMustBeFresh = function(mustBeFresh)
{
  this.mustBeFresh_ = (mustBeFresh ? true : false);
  ++this.changeCount_;
  return this;
};

/**
 * Set the interest lifetime.
 * @param {number} interestLifetimeMilliseconds The interest lifetime in
 * milliseconds. If not specified, set to -1.
 * @returns {Interest} This Interest so that you can chain calls to update values.
 */
Interest.prototype.setInterestLifetimeMilliseconds = function(interestLifetimeMilliseconds)
{
  this.interestLifetimeMilliseconds_ = interestLifetimeMilliseconds;
  ++this.changeCount_;
  return this;
};

/**
 * @deprecated You should let the wire encoder generate a random nonce
 * internally before sending the interest.
 */
Interest.prototype.setNonce = function(nonce)
{
  this.nonce_ = typeof nonce === 'object' && nonce instanceof Blob ?
    nonce : new Blob(nonce, true);
  // Set _getNonceChangeCount so that the next call to getNonce() won't clear
  // this.nonce_.
  ++this.changeCount_;
  this.getNonceChangeCount_ = this.getChangeCount();
  return this;
};

/**
 * Encode the name according to the "NDN URI Scheme".  If there are interest selectors, append "?" and
 * added the selectors as a query string.  For example "/test/name?ndn.ChildSelector=1".
 * Note: This is an experimental feature.  See the API docs for more detail at
 * http://named-data.net/doc/ndn-ccl-api/interest.html#interest-touri-method .
 * @returns {string} The URI string.
 */
Interest.prototype.toUri = function()
{
  var selectors = "";

  if (this.minSuffixComponents_ != null)
    selectors += "&ndn.MinSuffixComponents=" + this.minSuffixComponents_;
  if (this.maxSuffixComponents_ != null)
    selectors += "&ndn.MaxSuffixComponents=" + this.maxSuffixComponents_;
  if (this.childSelector_ != null)
    selectors += "&ndn.ChildSelector=" + this.childSelector_;
  selectors += "&ndn.MustBeFresh=" + (this.mustBeFresh_ ? 1 : 0);
  if (this.interestLifetimeMilliseconds_ != null)
    selectors += "&ndn.InterestLifetime=" + this.interestLifetimeMilliseconds_;
  if (this.getNonce().size() > 0)
    selectors += "&ndn.Nonce=" + Name.toEscapedString(this.getNonce().buf());
  if (this.getExclude() != null && this.getExclude().size() > 0)
    selectors += "&ndn.Exclude=" + this.getExclude().toUri();

  var result = this.getName().toUri();
  if (selectors != "")
    // Replace the first & with ?.
    result += "?" + selectors.substr(1);

  return result;
};

/**
 * Encode this Interest for a particular wire format. If wireFormat is the
 * default wire format, also set the defaultWireEncoding field to the encoded
 * result.
 * @param {WireFormat} wireFormat (optional) A WireFormat object  used to encode
 * this object. If omitted, use WireFormat.getDefaultWireFormat().
 * @returns {SignedBlob} The encoded buffer in a SignedBlob object.
 */
Interest.prototype.wireEncode = function(wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());

  if (!this.getDefaultWireEncoding().isNull() &&
      this.getDefaultWireEncodingFormat() == wireFormat)
    // We already have an encoding in the desired format.
    return this.getDefaultWireEncoding();

  var result = wireFormat.encodeInterest(this);
  var wireEncoding = new SignedBlob
    (result.encoding, result.signedPortionBeginOffset,
     result.signedPortionEndOffset);

  if (wireFormat == WireFormat.getDefaultWireFormat())
    // This is the default wire encoding.
    this.setDefaultWireEncoding
      (wireEncoding, WireFormat.getDefaultWireFormat());
  return wireEncoding;
};

/**
 * Decode the input using a particular wire format and update this Interest. If
 * wireFormat is the default wire format, also set the defaultWireEncoding to
 * another pointer to the input.
 * @param {Blob|Buffer} input The buffer with the bytes to decode.
 * @param {WireFormat} wireFormat (optional) A WireFormat object used to decode
 * this object. If omitted, use WireFormat.getDefaultWireFormat().
 */
Interest.prototype.wireDecode = function(input, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());

  // If input is a blob, get its buf().
  var decodeBuffer = typeof input === 'object' && input instanceof Blob ?
    input.buf() : input;
  var result = wireFormat.decodeInterest(this, decodeBuffer);

  if (wireFormat == WireFormat.getDefaultWireFormat())
    // This is the default wire encoding.  In the Blob constructor, set copy
    // true, but if input is already a Blob, it won't copy.
    this.setDefaultWireEncoding(new SignedBlob
      (new Blob(input, true), result.signedPortionBeginOffset,
       result.signedPortionEndOffset),
      WireFormat.getDefaultWireFormat());
  else
    this.setDefaultWireEncoding(new SignedBlob(), null);
};

/**
 * Get the change count, which is incremented each time this object (or a child
 * object) is changed.
 * @returns {number} The change count.
 */
Interest.prototype.getChangeCount = function()
{
  // Make sure each of the checkChanged is called.
  var changed = this.name_.checkChanged();
  changed = this.keyLocator_.checkChanged() || changed;
  changed = this.exclude_.checkChanged() || changed;
  if (changed)
    // A child object has changed, so update the change count.
    ++this.changeCount_;

  return this.changeCount_;
};

Interest.prototype.setDefaultWireEncoding = function
  (defaultWireEncoding, defaultWireEncodingFormat)
{
  this.defaultWireEncoding_ = defaultWireEncoding;
  this.defaultWireEncodingFormat_ = defaultWireEncodingFormat;
  // Set getDefaultWireEncodingChangeCount_ so that the next call to
  // getDefaultWireEncoding() won't clear _defaultWireEncoding.
  this.getDefaultWireEncodingChangeCount_ = this.getChangeCount();
};

// Define properties so we can change member variable types and implement changeCount_.
Object.defineProperty(Interest.prototype, "name",
  { get: function() { return this.getName(); },
    set: function(val) { this.setName(val); } });
Object.defineProperty(Interest.prototype, "minSuffixComponents",
  { get: function() { return this.getMinSuffixComponents(); },
    set: function(val) { this.setMinSuffixComponents(val); } });
Object.defineProperty(Interest.prototype, "maxSuffixComponents",
  { get: function() { return this.getMaxSuffixComponents(); },
    set: function(val) { this.setMaxSuffixComponents(val); } });
Object.defineProperty(Interest.prototype, "keyLocator",
  { get: function() { return this.getKeyLocator(); },
    set: function(val) { this.setKeyLocator(val); } });
Object.defineProperty(Interest.prototype, "exclude",
  { get: function() { return this.getExclude(); },
    set: function(val) { this.setExclude(val); } });
Object.defineProperty(Interest.prototype, "childSelector",
  { get: function() { return this.getChildSelector(); },
    set: function(val) { this.setChildSelector(val); } });
/**
 * @deprecated Use getInterestLifetimeMilliseconds and setInterestLifetimeMilliseconds.
 */
Object.defineProperty(Interest.prototype, "interestLifetime",
  { get: function() { return this.getInterestLifetimeMilliseconds(); },
    set: function(val) { this.setInterestLifetimeMilliseconds(val); } });
/**
 * @deprecated Use getNonce and setNonce.
 */
Object.defineProperty(Interest.prototype, "nonce",
  { get: function() { return this.getNonceAsBuffer(); },
    set: function(val) { this.setNonce(val); } });
/**
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * A ForwardingFlags object holds the flags which specify how the forwarding daemon should forward an interest for
 * a registered prefix.  We use a separate ForwardingFlags object to retain future compatibility if the daemon forwarding
 * bits are changed, amended or deprecated.
 * Create a new ForwardingFlags with "active" and "childInherit" set and all other flags cleared.
 */
var ForwardingFlags = function ForwardingFlags(value)
{
  if (typeof value === 'object' && value instanceof ForwardingFlags) {
    // Make a copy.
    this.childInherit = value.childInherit;
    this.capture = value.capture;
  }
  else {
    this.childInherit = true;
    this.capture = false;
  }
};

exports.ForwardingFlags = ForwardingFlags;

ForwardingFlags.NfdForwardingFlags_CHILD_INHERIT = 1;
ForwardingFlags.NfdForwardingFlags_CAPTURE       = 2;

/**
 * Get an integer with the bits set according to the NFD forwarding flags as
 * used in the ControlParameters of the command interest.
 * @returns {number} An integer with the bits set.
 */
ForwardingFlags.prototype.getNfdForwardingFlags = function()
{
  var result = 0;

  if (this.childInherit)
    result |= ForwardingFlags.NfdForwardingFlags_CHILD_INHERIT;
  if (this.capture)
    result |= ForwardingFlags.NfdForwardingFlags_CAPTURE;

  return result;
};

/**
 * Set the flags according to the NFD forwarding flags as used in the
 * ControlParameters of the command interest.
 * @param {number} nfdForwardingFlags An integer with the bits set.
 */
ForwardingFlags.prototype.setNfdForwardingFlags = function(nfdForwardingFlags)
{
  this.childInherit =
    ((nfdForwardingFlags & ForwardingFlags.NfdForwardingFlags_CHILD_INHERIT) != 0);
  this.capture =
    ((nfdForwardingFlags & ForwardingFlags.NfdForwardingFlags_CAPTURE) != 0);
};

/**
 * Get the value of the "childInherit" flag.
 * @returns {Boolean} true if the flag is set, false if it is cleared.
 */
ForwardingFlags.prototype.getChildInherit = function() { return this.childInherit; };

/**
 * Get the value of the "capture" flag.
 * @returns {Boolean} true if the flag is set, false if it is cleared.
 */
ForwardingFlags.prototype.getCapture = function() { return this.capture; };

/**
 * Set the value of the "childInherit" flag
 * @param {number} value true to set the flag, false to clear it.
 */
ForwardingFlags.prototype.setChildInherit = function(value) { this.childInherit = value; };

/**
 * Set the value of the "capture" flag
 * @param {number} value true to set the flag, false to clear it.
 */
ForwardingFlags.prototype.setCapture = function(value) { this.capture = value; };
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var ForwardingFlags = require('./forwarding-flags.js').ForwardingFlags;
var Name = require('./name.js').Name;
var WireFormat = require('./encoding/wire-format.js').WireFormat;
var Blob = require('./util/blob').Blob;

/**
 * A ControlParameters which holds a Name and other fields for a
 * ControlParameters which is used, for example, in the command interest to
 * register a prefix with a forwarder. See
 * http://redmine.named-data.net/projects/nfd/wiki/ControlCommand#ControlParameters
 * @constructor
 */
var ControlParameters = function ControlParameters(value)
{
  if (typeof value === 'object' && value instanceof ControlParameters) {
    // Make a deep copy.
    this.name = value.name == null ? null : new Name(value.name);
    this.faceId = value.faceId;
    this.uri = value.uri;
    this.localControlFeature = value.localControlFeature;
    this.origin = value.origin;
    this.cost = value.cost;
    this.forwardingFlags = new ForwardingFlags(value.forwardingFlags);
    this.strategy = new Name(value.strategy);
    this.expirationPeriod = value.expirationPeriod;
  }
  else {
    this.name = null;
    this.faceId = null;
    this.uri = '';
    this.localControlFeature = null;
    this.origin = null;
    this.cost = null;
    this.forwardingFlags = new ForwardingFlags();
    this.strategy = new Name();
    this.expirationPeriod = null;
  }
};

exports.ControlParameters = ControlParameters;

ControlParameters.prototype.clear = function()
{
  this.name = null;
  this.faceId = null;
  this.uri = '';
  this.localControlFeature = null;
  this.origin = null;
  this.cost = null;
  this.forwardingFlags = new ForwardingFlags();
  this.strategy = new Name();
  this.expirationPeriod = null;
};

/**
 * Encode this ControlParameters for a particular wire format.
 * @param {WireFormat} wireFormat (optional) A WireFormat object  used to encode
 * this object. If omitted, use WireFormat.getDefaultWireFormat().
 * @returns {Blob} The encoded buffer in a Blob object.
 */
ControlParameters.prototype.wireEncode = function(wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());
  return wireFormat.encodeControlParameters(this);
};

/**
 * Decode the input using a particular wire format and update this
 * ControlParameters.
 * @param {Blob|Buffer} input The buffer with the bytes to decode.
 * @param {WireFormat} wireFormat (optional) A WireFormat object used to decode
 * this object. If omitted, use WireFormat.getDefaultWireFormat().
 */
ControlParameters.prototype.wireDecode = function(input, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());
  // If input is a blob, get its buf().
  var decodeBuffer = typeof input === 'object' && input instanceof Blob ?
                     input.buf() : input;
  wireFormat.decodeControlParameters(this, decodeBuffer);
};

/**
 * Get the name.
 * @returns {Name} The name. If not specified, return null.
 */
ControlParameters.prototype.getName = function()
{
  return this.name;
};

/**
 * Get the face ID.
 * @returns {number} The face ID, or null if not specified.
 */
ControlParameters.prototype.getFaceId = function()
{
  return this.faceId;
};

/**
 * Get the URI.
 * @returns {string} The face URI, or an empty string if not specified.
 */
ControlParameters.prototype.getUri = function()
{
  return this.uri;
};

/**
 * Get the local control feature value.
 * @returns {number} The local control feature value, or null if not specified.
 */
ControlParameters.prototype.getLocalControlFeature = function()
{
  return this.localControlFeature;
};

/**
 * Get the origin value.
 * @returns {number} The origin value, or null if not specified.
 */
ControlParameters.prototype.getOrigin = function()
{
  return this.origin;
};

/**
 * Get the cost value.
 * @returns {number} The cost value, or null if not specified.
 */
ControlParameters.prototype.getCost = function()
{
  return this.cost;
};

/**
 * Get the ForwardingFlags object.
 * @returns {ForwardingFlags} The ForwardingFlags object.
 */
ControlParameters.prototype.getForwardingFlags = function()
{
  return this.forwardingFlags;
};

/**
 * Get the strategy.
 * @returns {Name} The strategy or an empty Name
 */
ControlParameters.prototype.getStrategy = function()
{
  return this.strategy;
};

/**
 * Get the expiration period.
 * @returns {number} The expiration period in milliseconds, or null if not specified.
 */
ControlParameters.prototype.getExpirationPeriod = function()
{
  return this.expirationPeriod;
};

/**
 * Set the name.
 * @param {Name} name The name. If not specified, set to null. If specified, this
 * makes a copy of the name.
 */
ControlParameters.prototype.setName = function(name)
{
  this.name = typeof name === 'object' && name instanceof Name ?
              new Name(name) : null;
};

/**
 * Set the Face ID.
 * @param {number} faceId The new face ID, or null for not specified.
 */
ControlParameters.prototype.setFaceId = function(faceId)
{
  this.faceId = faceId;
};

/**
 * Set the URI.
 * @param {string} uri The new uri, or an empty string for not specified.
 */
ControlParameters.prototype.setUri = function(uri)
{
  this.uri = uri || '';
};

/**
 * Set the local control feature value.
 * @param {number} localControlFeature The new local control feature value, or
 * null for not specified.
 */
ControlParameters.prototype.setLocalControlFeature = function(localControlFeature)
{
  this.localControlFeature = localControlFeature;
};

/**
 * Set the origin value.
 * @param {number} origin The new origin value, or null for not specified.
 */
ControlParameters.prototype.setOrigin = function(origin)
{
  this.origin = origin;
};

/**
 * Set the cost value.
 * @param {number} cost The new cost value, or null for not specified.
 */
ControlParameters.prototype.setCost = function(cost)
{
  this.cost = cost;
};

/**
 * Set the ForwardingFlags object to a copy of forwardingFlags. You can use
 * getForwardingFlags() and change the existing ForwardingFlags object.
 * @param {ForwardingFlags} forwardingFlags The new cost value, or null for not specified.
 */
ControlParameters.prototype.setForwardingFlags = function(forwardingFlags)
{
  this.forwardingFlags =
    typeof forwardingFlags === 'object' && forwardingFlags instanceof ForwardingFlags ?
      new ForwardingFlags(forwardingFlags) : new ForwardingFlags();
};

/**
 * Set the strategy to a copy of the given Name.
 * @param {Name} strategy The Name to copy, or an empty Name if not specified.
 */
ControlParameters.prototype.setStrategy = function(strategy)
{
  this.strategy = typeof strategy === 'object' && strategy instanceof Name ?
              new Name(strategy) : new Name();
};

/**
 * Set the expiration period.
 * @param {number} expirationPeriod The expiration period in milliseconds, or
 * null for not specified.
 */
ControlParameters.prototype.setExpirationPeriod = function(expirationPeriod)
{
  this.expirationPeriod = expirationPeriod;
};
/**
 * Copyright (C) 2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Name = require('./name.js').Name;
var NdnRegexMatcher = require('./util/ndn-regex-matcher.js').NdnRegexMatcher;

/**
 * An InterestFilter holds a Name prefix and optional regex match expression for
 * use in Face.setInterestFilter.
 *
 * Create an InterestFilter to match any Interest whose name starts with the
 * given prefix. If the optional regexFilter is provided then the remaining
 * components match the regexFilter regular expression as described in doesMatch.
 * @param {Name|string} prefix The prefix. If a Name then this makes a copy of
 * the Name. Otherwise it create a Name from the URI string.
 * @param {string} regexFilter (optional) The regular expression for matching
 * the remaining name components.
 * @constructor
 */
var InterestFilter = function InterestFilter(prefix, regexFilter)
{
  if (typeof prefix === 'object' && prefix instanceof InterestFilter) {
    // The copy constructor.
    var interestFilter = prefix;
    this.prefix = new Name(interestFilter.prefix);
    this.regexFilter = interestFilter.regexFilter;
    this.regexFilterPattern = interestFilter.regexFilterPattern;
  }
  else {
    this.prefix = new Name(prefix);
    if (regexFilter) {
      this.regexFilter = regexFilter;
      this.regexFilterPattern = InterestFilter.makePattern(regexFilter);
    }
    else {
      this.regexFilter = null;
      this.regexFilterPattern = null;
    }
  }
};

exports.InterestFilter = InterestFilter;

/**
 * Check if the given name matches this filter. Match if name starts with this
 * filter's prefix. If this filter has the optional regexFilter then the
 * remaining components match the regexFilter regular expression.
 * For example, the following InterestFilter:
 *
 *    InterestFilter("/hello", "<world><>+")
 *
 * will match all Interests, whose name has the prefix `/hello` which is
 * followed by a component `world` and has at least one more component after it.
 * Examples:
 *
 *    /hello/world/!
 *    /hello/world/x/y/z
 *
 * Note that the regular expression will need to match all remaining components
 * (e.g., there are implicit heading `^` and trailing `$` symbols in the
 * regular expression).
 * @param {Name} name The name to check against this filter.
 * @returns {boolean} True if name matches this filter, otherwise false.
 */
InterestFilter.prototype.doesMatch = function(name)
{
  if (name.size() < this.prefix.size())
    return false;

  if (this.hasRegexFilter()) {
    // Perform a prefix match and regular expression match for the remaining
    // components.
    if (!this.prefix.match(name))
      return false;

    return null != NdnRegexMatcher.match
      (this.regexFilterPattern, name.getSubName(this.prefix.size()));
  }
  else
    // Just perform a prefix match.
    return this.prefix.match(name);
};

/**
 * Get the prefix given to the constructor.
 * @returns {Name} The prefix Name which you should not modify.
 */
InterestFilter.prototype.getPrefix = function() { return this.prefix; };

/**
 * Check if a regexFilter was supplied to the constructor.
 * @returns {boolean} True if a regexFilter was supplied to the constructor.
 */
InterestFilter.prototype.hasRegexFilter = function()
{
  return this.regexFilter != null;
};

/**
 * Get the regex filter. This is only valid if hasRegexFilter() is true.
 * @returns {string} The regular expression for matching the remaining name
 * components.
 */
InterestFilter.prototype.getRegexFilter = function() { return this.regexFilter; };

/**
 * If regexFilter doesn't already have them, add ^ to the beginning and $ to
 * the end since these are required by NdnRegexMatcher.match.
 * @param {string} regexFilter The regex filter.
 * @returns {string} The regex pattern with ^ and $.
 */
InterestFilter.makePattern = function(regexFilter)
{
  if (regexFilter.length == 0)
    // We don't expect this.
    return "^$";

  var pattern = regexFilter;
  if (pattern[0] != '^')
    pattern = "^" + pattern;
  if (pattern[pattern.length - 1] != '$')
    pattern = pattern + "$";

  return pattern;
};
/**
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var Crypto = require('../crypto.js');
var Blob = require('../util/blob.js').Blob;
var Name = require('../name').Name;
var ForwardingFlags = require('../forwarding-flags').ForwardingFlags;
var Tlv = require('./tlv/tlv.js').Tlv;
var TlvEncoder = require('./tlv/tlv-encoder.js').TlvEncoder;
var TlvDecoder = require('./tlv/tlv-decoder.js').TlvDecoder;
var WireFormat = require('./wire-format.js').WireFormat;
var Exclude = require('../exclude.js').Exclude;
var ContentType = require('../meta-info.js').ContentType;
var KeyLocator = require('../key-locator.js').KeyLocator;
var KeyLocatorType = require('../key-locator.js').KeyLocatorType;
var Sha256WithRsaSignature = require('../sha256-with-rsa-signature.js').Sha256WithRsaSignature;
var DigestSha256Signature = require('../digest-sha256-signature.js').DigestSha256Signature;
var ForwardingFlags = require('../forwarding-flags.js').ForwardingFlags;
var DecodingException = require('./decoding-exception.js').DecodingException;

/**
 * A Tlv0_1_1WireFormat implements the WireFormat interface for encoding and
 * decoding with the NDN-TLV wire format, version 0.1.1.
 * @constructor
 */
var Tlv0_1_1WireFormat = function Tlv0_1_1WireFormat()
{
  // Inherit from WireFormat.
  WireFormat.call(this);
};

Tlv0_1_1WireFormat.prototype = new WireFormat();
Tlv0_1_1WireFormat.prototype.name = "Tlv0_1_1WireFormat";

exports.Tlv0_1_1WireFormat = Tlv0_1_1WireFormat;

// Default object.
Tlv0_1_1WireFormat.instance = null;

/**
 * Encode interest as NDN-TLV and return the encoding.
 * @param {Name} interest The Name to encode.
 * @returns {Blobl} A Blob containing the encoding.
 */
Tlv0_1_1WireFormat.prototype.encodeName = function(name)
{
  var encoder = new TlvEncoder();
  Tlv0_1_1WireFormat.encodeName(name, encoder);
  return new Blob(encoder.getOutput(), false);
};

/**
 * Decode input as a NDN-TLV name and set the fields of the Name object.
 * @param {Name} name The Name object whose fields are updated.
 * @param {Buffer} input The buffer with the bytes to decode.
 */
Tlv0_1_1WireFormat.prototype.decodeName = function(name, input)
{
  var decoder = new TlvDecoder(input);
  Tlv0_1_1WireFormat.decodeName(name, decoder);
};

/**
 * Encode the interest using NDN-TLV and return a Buffer.
 * @param {Interest} interest The Interest object to encode.
 * @returns {object} An associative array with fields
 * (encoding, signedPortionBeginOffset, signedPortionEndOffset) where encoding
 * is a Blob containing the encoding, signedPortionBeginOffset is the offset in
 * the encoding of the beginning of the signed portion, and
 * signedPortionEndOffset is the offset in the encoding of the end of the signed
 * portion. The signed portion starts from the first name component and ends
 * just before the final name component (which is assumed to be a signature for
 * a signed interest).
 */
Tlv0_1_1WireFormat.prototype.encodeInterest = function(interest)
{
  var encoder = new TlvEncoder(256);
  var saveLength = encoder.getLength();

  // Encode backwards.
  encoder.writeOptionalNonNegativeIntegerTlv
    (Tlv.InterestLifetime, interest.getInterestLifetimeMilliseconds());

  // Encode the Nonce as 4 bytes.
  if (interest.getNonce().isNull() || interest.getNonce().size() == 0)
    // This is the most common case. Generate a nonce.
    encoder.writeBlobTlv(Tlv.Nonce, Crypto.randomBytes(4));
  else if (interest.getNonce().size() < 4) {
    var nonce = Buffer(4);
    // Copy existing nonce bytes.
    interest.getNonce().buf().copy(nonce);

    // Generate random bytes for remaining bytes in the nonce.
    for (var i = interest.getNonce().size(); i < 4; ++i)
      nonce[i] = Crypto.randomBytes(1)[0];

    encoder.writeBlobTlv(Tlv.Nonce, nonce);
  }
  else if (interest.getNonce().size() == 4)
    // Use the nonce as-is.
    encoder.writeBlobTlv(Tlv.Nonce, interest.getNonce().buf());
  else
    // Truncate.
    encoder.writeBlobTlv(Tlv.Nonce, interest.getNonce().buf().slice(0, 4));

  Tlv0_1_1WireFormat.encodeSelectors(interest, encoder);
  var tempOffsets = Tlv0_1_1WireFormat.encodeName(interest.getName(), encoder);
  var signedPortionBeginOffsetFromBack =
    encoder.getLength() - tempOffsets.signedPortionBeginOffset;
  var signedPortionEndOffsetFromBack =
    encoder.getLength() - tempOffsets.signedPortionEndOffset;

  encoder.writeTypeAndLength(Tlv.Interest, encoder.getLength() - saveLength);
  var signedPortionBeginOffset =
    encoder.getLength() - signedPortionBeginOffsetFromBack;
  var signedPortionEndOffset =
    encoder.getLength() - signedPortionEndOffsetFromBack;

  return { encoding: new Blob(encoder.getOutput(), false),
           signedPortionBeginOffset: signedPortionBeginOffset,
           signedPortionEndOffset: signedPortionEndOffset };
};

/**
 * Decode input as an NDN-TLV interest and set the fields of the interest
 * object.
 * @param {Interest} interest The Interest object whose fields are updated.
 * @param {Buffer} input The buffer with the bytes to decode.
 * @returns {object} An associative array with fields
 * (signedPortionBeginOffset, signedPortionEndOffset) where
 * signedPortionBeginOffset is the offset in the encoding of the beginning of
 * the signed portion, and signedPortionEndOffset is the offset in the encoding
 * of the end of the signed portion. The signed portion starts from the first
 * name component and ends just before the final name component (which is
 * assumed to be a signature for a signed interest).
 */
Tlv0_1_1WireFormat.prototype.decodeInterest = function(interest, input)
{
  var decoder = new TlvDecoder(input);

  var endOffset = decoder.readNestedTlvsStart(Tlv.Interest);
  var offsets = Tlv0_1_1WireFormat.decodeName(interest.getName(), decoder);
  if (decoder.peekType(Tlv.Selectors, endOffset))
    Tlv0_1_1WireFormat.decodeSelectors(interest, decoder);
  // Require a Nonce, but don't force it to be 4 bytes.
  var nonce = decoder.readBlobTlv(Tlv.Nonce);
  interest.setInterestLifetimeMilliseconds
    (decoder.readOptionalNonNegativeIntegerTlv(Tlv.InterestLifetime, endOffset));

  // Set the nonce last because setting other interest fields clears it.
  interest.setNonce(nonce);

  decoder.finishNestedTlvs(endOffset);
  return offsets;
};

/**
 * Encode data as NDN-TLV and return the encoding and signed offsets.
 * @param {Data} data The Data object to encode.
 * @returns {object} An associative array with fields
 * (encoding, signedPortionBeginOffset, signedPortionEndOffset) where encoding
 * is a Blob containing the encoding, signedPortionBeginOffset is the offset in
 * the encoding of the beginning of the signed portion, and
 * signedPortionEndOffset is the offset in the encoding of the end of the
 * signed portion.
 */
Tlv0_1_1WireFormat.prototype.encodeData = function(data)
{
  var encoder = new TlvEncoder(1500);
  var saveLength = encoder.getLength();

  // Encode backwards.
  encoder.writeBlobTlv(Tlv.SignatureValue, data.getSignature().getSignature().buf());
  var signedPortionEndOffsetFromBack = encoder.getLength();

  Tlv0_1_1WireFormat.encodeSignatureInfo_(data.getSignature(), encoder);
  encoder.writeBlobTlv(Tlv.Content, data.getContent().buf());
  Tlv0_1_1WireFormat.encodeMetaInfo(data.getMetaInfo(), encoder);
  Tlv0_1_1WireFormat.encodeName(data.getName(), encoder);
  var signedPortionBeginOffsetFromBack = encoder.getLength();

  encoder.writeTypeAndLength(Tlv.Data, encoder.getLength() - saveLength);
  var signedPortionBeginOffset =
    encoder.getLength() - signedPortionBeginOffsetFromBack;
  var signedPortionEndOffset = encoder.getLength() - signedPortionEndOffsetFromBack;

  return { encoding: new Blob(encoder.getOutput(), false),
           signedPortionBeginOffset: signedPortionBeginOffset,
           signedPortionEndOffset: signedPortionEndOffset };
};

/**
 * Decode input as an NDN-TLV data packet, set the fields in the data object,
 * and return the signed offsets.
 * @param {Data} data The Data object whose fields are updated.
 * @param {Buffer} input The buffer with the bytes to decode.
 * @returns {object} An associative array with fields
 * (signedPortionBeginOffset, signedPortionEndOffset) where
 * signedPortionBeginOffset is the offset in the encoding of the beginning of
 * the signed portion, and signedPortionEndOffset is the offset in the encoding
 * of the end of the signed portion.
 */
Tlv0_1_1WireFormat.prototype.decodeData = function(data, input)
{
  var decoder = new TlvDecoder(input);

  var endOffset = decoder.readNestedTlvsStart(Tlv.Data);
  var signedPortionBeginOffset = decoder.getOffset();

  Tlv0_1_1WireFormat.decodeName(data.getName(), decoder);
  Tlv0_1_1WireFormat.decodeMetaInfo(data.getMetaInfo(), decoder);
  data.setContent(decoder.readBlobTlv(Tlv.Content));
  Tlv0_1_1WireFormat.decodeSignatureInfo(data, decoder);

  var signedPortionEndOffset = decoder.getOffset();
  data.getSignature().setSignature
    (new Blob(decoder.readBlobTlv(Tlv.SignatureValue), true));

  decoder.finishNestedTlvs(endOffset);
  return { signedPortionBeginOffset: signedPortionBeginOffset,
           signedPortionEndOffset: signedPortionEndOffset };
};

/**
 * Encode controlParameters as NDN-TLV and return the encoding.
 * @param {ControlParameters} controlParameters The ControlParameters object to
 * encode.
 * @returns {Blob} A Blob containing the encoding.
 */
Tlv0_1_1WireFormat.prototype.encodeControlParameters = function(controlParameters)
{
  var encoder = new TlvEncoder(256);
  var saveLength = encoder.getLength();

  // Encode backwards.
  encoder.writeOptionalNonNegativeIntegerTlv
    (Tlv.ControlParameters_ExpirationPeriod,
     controlParameters.getExpirationPeriod());

  if (controlParameters.getStrategy().size() > 0){
    var strategySaveLength = encoder.getLength();
    Tlv0_1_1WireFormat.encodeName(controlParameters.getStrategy(), encoder);
    encoder.writeTypeAndLength(Tlv.ControlParameters_Strategy,
      encoder.getLength() - strategySaveLength);
  }

  var flags = controlParameters.getForwardingFlags().getNfdForwardingFlags();
  if (flags != new ForwardingFlags().getNfdForwardingFlags())
      // The flags are not the default value.
      encoder.writeNonNegativeIntegerTlv
        (Tlv.ControlParameters_Flags, flags);

  encoder.writeOptionalNonNegativeIntegerTlv
    (Tlv.ControlParameters_Cost, controlParameters.getCost());
  encoder.writeOptionalNonNegativeIntegerTlv
    (Tlv.ControlParameters_Origin, controlParameters.getOrigin());
  encoder.writeOptionalNonNegativeIntegerTlv
    (Tlv.ControlParameters_LocalControlFeature,
     controlParameters.getLocalControlFeature());

  if (controlParameters.getUri().length != 0)
    encoder.writeBlobTlv
      (Tlv.ControlParameters_Uri, new Blob(controlParameters.getUri()).buf());

  encoder.writeOptionalNonNegativeIntegerTlv
    (Tlv.ControlParameters_FaceId, controlParameters.getFaceId());
  if (controlParameters.getName() != null)
    Tlv0_1_1WireFormat.encodeName(controlParameters.getName(), encoder);

  encoder.writeTypeAndLength
    (Tlv.ControlParameters_ControlParameters, encoder.getLength() - saveLength);

  return new Blob(encoder.getOutput(), false);
};

/**
  * Decode controlParameters in NDN-TLV and return the encoding.
  * @param controlParameters The ControlParameters object to encode.
  * @param input
  * @throws EncodingException For invalid encoding
  */
Tlv0_1_1WireFormat.prototype.decodeControlParameters = function(controlParameters, input)
{
  controlParameters.clear();
  var decoder = new TlvDecoder(input);
  var endOffset = decoder.
    readNestedTlvsStart(Tlv.ControlParameters_ControlParameters);

  // decode name
  if (decoder.peekType(Tlv.Name, endOffset)) {
    var name = new Name();
    Tlv0_1_1WireFormat.decodeName(name, decoder);
    controlParameters.setName(name);
  }

  // decode face ID
  controlParameters.setFaceId(decoder.readOptionalNonNegativeIntegerTlv
    (Tlv.ControlParameters_FaceId, endOffset));

  // decode URI
  if (decoder.peekType(Tlv.ControlParameters_Uri, endOffset)) {
    var uri = new Blob
      (decoder.readOptionalBlobTlv(Tlv.ControlParameters_Uri, endOffset), false);
    controlParameters.setUri(uri.toString());
  }

  // decode integers
  controlParameters.setLocalControlFeature(decoder.
    readOptionalNonNegativeIntegerTlv(
      Tlv.ControlParameters_LocalControlFeature, endOffset));
  controlParameters.setOrigin(decoder.
    readOptionalNonNegativeIntegerTlv(Tlv.ControlParameters_Origin,
      endOffset));
  controlParameters.setCost(decoder.readOptionalNonNegativeIntegerTlv(
    Tlv.ControlParameters_Cost, endOffset));

  // set forwarding flags
  if (decoder.peekType(Tlv.ControlParameters_Flags, endOffset)) {
    var flags = new ForwardingFlags();
    flags.setNfdForwardingFlags(decoder.
      readNonNegativeIntegerTlv(Tlv.ControlParameters_Flags, endOffset));
    controlParameters.setForwardingFlags(flags);
  }

  // decode strategy
  if (decoder.peekType(Tlv.ControlParameters_Strategy, endOffset)) {
    var strategyEndOffset = decoder.readNestedTlvsStart(Tlv.ControlParameters_Strategy);
    Tlv0_1_1WireFormat.decodeName(controlParameters.getStrategy(), decoder);
    decoder.finishNestedTlvs(strategyEndOffset);
  }

  // decode expiration period
  controlParameters.setExpirationPeriod(
    decoder.readOptionalNonNegativeIntegerTlv(
      Tlv.ControlParameters_ExpirationPeriod, endOffset));

  decoder.finishNestedTlvs(endOffset);
};

/**
 * Encode signature as a SignatureInfo and return the encoding.
 * @param {Signature} signature An object of a subclass of Signature to encode.
 * @returns {Blob} A Blob containing the encoding.
 */
Tlv0_1_1WireFormat.prototype.encodeSignatureInfo = function(signature)
{
  var encoder = new TlvEncoder(256);
  Tlv0_1_1WireFormat.encodeSignatureInfo_(signature, encoder);

  return new Blob(encoder.getOutput(), false);
};

// SignatureHolder is used by decodeSignatureInfoAndValue.
Tlv0_1_1WireFormat.SignatureHolder = function Tlv0_1_1WireFormatSignatureHolder()
{
};

Tlv0_1_1WireFormat.SignatureHolder.prototype.setSignature = function(signature)
{
  this.signature = signature;
};

Tlv0_1_1WireFormat.SignatureHolder.prototype.getSignature = function()
{
  return this.signature;
};

/**
 * Decode signatureInfo as a signature info and signatureValue as the related
 * SignatureValue, and return a new object which is a subclass of Signature.
 * @param {Buffer} signatureInfo The buffer with the signature info bytes to
 * decode.
 * @param {Buffer} signatureValue The buffer with the signature value to decode.
 * @returns {Signature} A new object which is a subclass of Signature.
 */
Tlv0_1_1WireFormat.prototype.decodeSignatureInfoAndValue = function
  (signatureInfo, signatureValue)
{
  // Use a SignatureHolder to imitate a Data object for decodeSignatureInfo.
  var signatureHolder = new Tlv0_1_1WireFormat.SignatureHolder();
  var decoder = new TlvDecoder(signatureInfo);
  Tlv0_1_1WireFormat.decodeSignatureInfo(signatureHolder, decoder);

  decoder = new TlvDecoder(signatureValue);
  signatureHolder.getSignature().setSignature
    (new Blob(decoder.readBlobTlv(Tlv.SignatureValue), true));

  return signatureHolder.getSignature();
};

/**
 * Encode the signatureValue in the Signature object as a SignatureValue (the
 * signature bits) and return the encoding.
 * @param {Signature} signature An object of a subclass of Signature with the
 * signature value to encode.
 * @returns {Blob} A Blob containing the encoding.
 */
Tlv0_1_1WireFormat.prototype.encodeSignatureValue = function(signature)
{
  var encoder = new TlvEncoder(256);
  encoder.writeBlobTlv(Tlv.SignatureValue, signature.getSignature().buf());

  return new Blob(encoder.getOutput(), false);
};

/**
 * Get a singleton instance of a Tlv0_1_1WireFormat.  To always use the
 * preferred version NDN-TLV, you should use TlvWireFormat.get().
 * @returns {Tlv0_1_1WireFormat} The singleton instance.
 */
Tlv0_1_1WireFormat.get = function()
{
  if (Tlv0_1_1WireFormat.instance === null)
    Tlv0_1_1WireFormat.instance = new Tlv0_1_1WireFormat();
  return Tlv0_1_1WireFormat.instance;
};

/**
 * Encode the name to the encoder.
 * @param {Name} name The name to encode.
 * @param {TlvEncoder} encoder The encoder to receive the encoding.
 * @returns {object} An associative array with fields
 * (signedPortionBeginOffset, signedPortionEndOffset) where
 * signedPortionBeginOffset is the offset in the encoding of the beginning of
 * the signed portion, and signedPortionEndOffset is the offset in the encoding
 * of the end of the signed portion. The signed portion starts from the first
 * name component and ends just before the final name component (which is
 * assumed to be a signature for a signed interest).
 */
Tlv0_1_1WireFormat.encodeName = function(name, encoder)
{
  var saveLength = encoder.getLength();

  // Encode the components backwards.
  var signedPortionEndOffsetFromBack;
  for (var i = name.size() - 1; i >= 0; --i) {
    encoder.writeBlobTlv(Tlv.NameComponent, name.get(i).getValue().buf());
    if (i == name.size() - 1)
      signedPortionEndOffsetFromBack = encoder.getLength();
  }

  var signedPortionBeginOffsetFromBack = encoder.getLength();
  encoder.writeTypeAndLength(Tlv.Name, encoder.getLength() - saveLength);

  var signedPortionBeginOffset =
    encoder.getLength() - signedPortionBeginOffsetFromBack;
  var signedPortionEndOffset;
  if (name.size() == 0)
    // There is no "final component", so set signedPortionEndOffset arbitrarily.
    signedPortionEndOffset = signedPortionBeginOffset;
  else
    signedPortionEndOffset = encoder.getLength() - signedPortionEndOffsetFromBack;

  return { signedPortionBeginOffset: signedPortionBeginOffset,
           signedPortionEndOffset: signedPortionEndOffset };
};

/**
 * Clear the name, decode a Name from the decoder and set the fields of the name
 * object.
 * @param {Name} name The name object whose fields are updated.
 * @param {TlvDecoder} decoder The decoder with the input.
 * @returns {object} An associative array with fields
 * (signedPortionBeginOffset, signedPortionEndOffset) where
 * signedPortionBeginOffset is the offset in the encoding of the beginning of
 * the signed portion, and signedPortionEndOffset is the offset in the encoding
 * of the end of the signed portion. The signed portion starts from the first
 * name component and ends just before the final name component (which is
 * assumed to be a signature for a signed interest).
 */
Tlv0_1_1WireFormat.decodeName = function(name, decoder)
{
  name.clear();

  var endOffset = decoder.readNestedTlvsStart(Tlv.Name);
  var signedPortionBeginOffset = decoder.getOffset();
  // In case there are no components, set signedPortionEndOffset arbitrarily.
  var signedPortionEndOffset = signedPortionBeginOffset;

  while (decoder.getOffset() < endOffset) {
    signedPortionEndOffset = decoder.getOffset();
    name.append(decoder.readBlobTlv(Tlv.NameComponent));
  }

  decoder.finishNestedTlvs(endOffset);

  return { signedPortionBeginOffset: signedPortionBeginOffset,
           signedPortionEndOffset: signedPortionEndOffset };
};

/**
 * Encode the interest selectors.  If no selectors are written, do not output a
 * Selectors TLV.
 */
Tlv0_1_1WireFormat.encodeSelectors = function(interest, encoder)
{
  var saveLength = encoder.getLength();

  // Encode backwards.
  if (interest.getMustBeFresh())
    encoder.writeTypeAndLength(Tlv.MustBeFresh, 0);
  encoder.writeOptionalNonNegativeIntegerTlv(
    Tlv.ChildSelector, interest.getChildSelector());
  if (interest.getExclude().size() > 0)
    Tlv0_1_1WireFormat.encodeExclude(interest.getExclude(), encoder);

  if (interest.getKeyLocator().getType() != null)
    Tlv0_1_1WireFormat.encodeKeyLocator
      (Tlv.PublisherPublicKeyLocator, interest.getKeyLocator(), encoder);

  encoder.writeOptionalNonNegativeIntegerTlv(
    Tlv.MaxSuffixComponents, interest.getMaxSuffixComponents());
  encoder.writeOptionalNonNegativeIntegerTlv(
    Tlv.MinSuffixComponents, interest.getMinSuffixComponents());

  // Only output the type and length if values were written.
  if (encoder.getLength() != saveLength)
    encoder.writeTypeAndLength(Tlv.Selectors, encoder.getLength() - saveLength);
};

Tlv0_1_1WireFormat.decodeSelectors = function(interest, decoder)
{
  var endOffset = decoder.readNestedTlvsStart(Tlv.Selectors);

  interest.setMinSuffixComponents(decoder.readOptionalNonNegativeIntegerTlv
    (Tlv.MinSuffixComponents, endOffset));
  interest.setMaxSuffixComponents(decoder.readOptionalNonNegativeIntegerTlv
    (Tlv.MaxSuffixComponents, endOffset));

  if (decoder.peekType(Tlv.PublisherPublicKeyLocator, endOffset))
    Tlv0_1_1WireFormat.decodeKeyLocator
      (Tlv.PublisherPublicKeyLocator, interest.getKeyLocator(), decoder);
  else
    interest.getKeyLocator().clear();

  if (decoder.peekType(Tlv.Exclude, endOffset))
    Tlv0_1_1WireFormat.decodeExclude(interest.getExclude(), decoder);
  else
    interest.getExclude().clear();

  interest.setChildSelector(decoder.readOptionalNonNegativeIntegerTlv
    (Tlv.ChildSelector, endOffset));
  interest.setMustBeFresh(decoder.readBooleanTlv(Tlv.MustBeFresh, endOffset));

  decoder.finishNestedTlvs(endOffset);
};

Tlv0_1_1WireFormat.encodeExclude = function(exclude, encoder)
{
  var saveLength = encoder.getLength();

  // TODO: Do we want to order the components (except for ANY)?
  // Encode the entries backwards.
  for (var i = exclude.size() - 1; i >= 0; --i) {
    var entry = exclude.get(i);

    if (entry == Exclude.ANY)
      encoder.writeTypeAndLength(Tlv.Any, 0);
    else
      encoder.writeBlobTlv(Tlv.NameComponent, entry.getValue().buf());
  }

  encoder.writeTypeAndLength(Tlv.Exclude, encoder.getLength() - saveLength);
};

Tlv0_1_1WireFormat.decodeExclude = function(exclude, decoder)
{
  var endOffset = decoder.readNestedTlvsStart(Tlv.Exclude);

  exclude.clear();
  while (true) {
    if (decoder.peekType(Tlv.NameComponent, endOffset))
      exclude.appendComponent(decoder.readBlobTlv(Tlv.NameComponent));
    else if (decoder.readBooleanTlv(Tlv.Any, endOffset))
      exclude.appendAny();
    else
      // Else no more entries.
      break;
  }

  decoder.finishNestedTlvs(endOffset);
};

Tlv0_1_1WireFormat.encodeKeyLocator = function(type, keyLocator, encoder)
{
  var saveLength = encoder.getLength();

  // Encode backwards.
  if (keyLocator.getType() != null) {
    if (keyLocator.getType() == KeyLocatorType.KEYNAME)
      Tlv0_1_1WireFormat.encodeName(keyLocator.getKeyName(), encoder);
    else if (keyLocator.getType() == KeyLocatorType.KEY_LOCATOR_DIGEST &&
             keyLocator.getKeyData().size() > 0)
      encoder.writeBlobTlv(Tlv.KeyLocatorDigest, keyLocator.getKeyData().buf());
    else
      throw new Error("Unrecognized KeyLocatorType " + keyLocator.getType());
  }

  encoder.writeTypeAndLength(type, encoder.getLength() - saveLength);
};

Tlv0_1_1WireFormat.decodeKeyLocator = function
  (expectedType, keyLocator, decoder)
{
  var endOffset = decoder.readNestedTlvsStart(expectedType);

  keyLocator.clear();

  if (decoder.getOffset() == endOffset)
    // The KeyLocator is omitted, so leave the fields as none.
    return;

  if (decoder.peekType(Tlv.Name, endOffset)) {
    // KeyLocator is a Name.
    keyLocator.setType(KeyLocatorType.KEYNAME);
    Tlv0_1_1WireFormat.decodeName(keyLocator.getKeyName(), decoder);
  }
  else if (decoder.peekType(Tlv.KeyLocatorDigest, endOffset)) {
    // KeyLocator is a KeyLocatorDigest.
    keyLocator.setType(KeyLocatorType.KEY_LOCATOR_DIGEST);
    keyLocator.setKeyData(decoder.readBlobTlv(Tlv.KeyLocatorDigest));
  }
  else
    throw new DecodingException(new Error
      ("decodeKeyLocator: Unrecognized key locator type"));

  decoder.finishNestedTlvs(endOffset);
};

/**
 * An internal method to encode signature as the appropriate form of
 * SignatureInfo in NDN-TLV.
 * @param {Signature} signature An object of a subclass of Signature to encode.
 * @param {TlvEncoder} encoder The encoder.
 */
Tlv0_1_1WireFormat.encodeSignatureInfo_ = function(signature, encoder)
{
  var saveLength = encoder.getLength();

  // Encode backwards.
  if (signature instanceof Sha256WithRsaSignature) {
    Tlv0_1_1WireFormat.encodeKeyLocator
      (Tlv.KeyLocator, signature.getKeyLocator(), encoder);
    encoder.writeNonNegativeIntegerTlv
      (Tlv.SignatureType, Tlv.SignatureType_SignatureSha256WithRsa);
  }
  else if (signature instanceof DigestSha256Signature)
    encoder.writeNonNegativeIntegerTlv
      (Tlv.SignatureType, Tlv.SignatureType_DigestSha256);
  else
    throw new Error("encodeSignatureInfo: Unrecognized Signature object type");

  encoder.writeTypeAndLength(Tlv.SignatureInfo, encoder.getLength() - saveLength);
};

Tlv0_1_1WireFormat.decodeSignatureInfo = function(data, decoder)
{
  var endOffset = decoder.readNestedTlvsStart(Tlv.SignatureInfo);

  var signatureType = decoder.readNonNegativeIntegerTlv(Tlv.SignatureType);
  if (signatureType == Tlv.SignatureType_SignatureSha256WithRsa) {
      data.setSignature(new Sha256WithRsaSignature());
      // Modify data's signature object because if we create an object
      //   and set it, then data will have to copy all the fields.
      var signatureInfo = data.getSignature();
      Tlv0_1_1WireFormat.decodeKeyLocator
        (Tlv.KeyLocator, signatureInfo.getKeyLocator(), decoder);
  }
  else if (signatureType == Tlv.SignatureType_DigestSha256)
      data.setSignature(new DigestSha256Signature());
  else
      throw new DecodingException(new Error
       ("decodeSignatureInfo: unrecognized SignatureInfo type" + signatureType));

  decoder.finishNestedTlvs(endOffset);
};

Tlv0_1_1WireFormat.encodeMetaInfo = function(metaInfo, encoder)
{
  var saveLength = encoder.getLength();

  // Encode backwards.
  var finalBlockIdBuf = metaInfo.getFinalBlockId().getValue().buf();
  if (finalBlockIdBuf != null && finalBlockIdBuf.length > 0) {
    // FinalBlockId has an inner NameComponent.
    var finalBlockIdSaveLength = encoder.getLength();
    encoder.writeBlobTlv(Tlv.NameComponent, finalBlockIdBuf);
    encoder.writeTypeAndLength
      (Tlv.FinalBlockId, encoder.getLength() - finalBlockIdSaveLength);
  }

  encoder.writeOptionalNonNegativeIntegerTlv
    (Tlv.FreshnessPeriod, metaInfo.getFreshnessPeriod());
  if (metaInfo.getType() != ContentType.BLOB) {
    // Not the default, so we need to encode the type.
    if (metaInfo.getType() == ContentType.LINK ||
        metaInfo.getType() == ContentType.KEY)
      // The ContentType enum is set up with the correct integer for
      // each NDN-TLV ContentType.
      encoder.writeNonNegativeIntegerTlv(Tlv.ContentType, metaInfo.getType());
    else
      throw new Error("unrecognized TLV ContentType");
  }

  encoder.writeTypeAndLength(Tlv.MetaInfo, encoder.getLength() - saveLength);
};

Tlv0_1_1WireFormat.decodeMetaInfo = function(metaInfo, decoder)
{
  var endOffset = decoder.readNestedTlvsStart(Tlv.MetaInfo);

  // The ContentType enum is set up with the correct integer for each
  // NDN-TLV ContentType.  If readOptionalNonNegativeIntegerTlv returns
  // None, then setType will convert it to BLOB.
  metaInfo.setType(decoder.readOptionalNonNegativeIntegerTlv
    (Tlv.ContentType, endOffset));
  metaInfo.setFreshnessPeriod
    (decoder.readOptionalNonNegativeIntegerTlv(Tlv.FreshnessPeriod, endOffset));
  if (decoder.peekType(Tlv.FinalBlockId, endOffset)) {
    var finalBlockIdEndOffset = decoder.readNestedTlvsStart(Tlv.FinalBlockId);
    metaInfo.setFinalBlockId(decoder.readBlobTlv(Tlv.NameComponent));
    decoder.finishNestedTlvs(finalBlockIdEndOffset);
  }
  else
    metaInfo.setFinalBlockId(null);

  decoder.finishNestedTlvs(endOffset);
};
/**
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var WireFormat = require('./wire-format.js').WireFormat;
var Tlv0_1_1WireFormat = require('./tlv-0_1_1-wire-format.js').Tlv0_1_1WireFormat;

/**
 * A Tlv0_1WireFormat extends Tlv0_1_1WireFormat so that it is an alias in case
 * any applications use Tlv0_1WireFormat directly.  These two wire formats are
 * the same except that Tlv0_1_1WireFormat adds support for
 * Sha256WithEcdsaSignature.
 * @constructor
 */
var Tlv0_1WireFormat = function Tlv0_1WireFormat()
{
  // Inherit from Tlv0_1_1WireFormat.
  Tlv0_1_1WireFormat.call(this);
};

Tlv0_1WireFormat.prototype = new Tlv0_1_1WireFormat();
Tlv0_1WireFormat.prototype.name = "Tlv0_1WireFormat";

exports.Tlv0_1WireFormat = Tlv0_1WireFormat;

// Default object.
Tlv0_1WireFormat.instance = null;

/**
 * Get a singleton instance of a Tlv0_1WireFormat.
 * @returns {Tlv0_1WireFormat} The singleton instance.
 */
Tlv0_1WireFormat.get = function()
{
  if (Tlv0_1WireFormat.instance === null)
    Tlv0_1WireFormat.instance = new Tlv0_1WireFormat();
  return Tlv0_1WireFormat.instance;
};
/**
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var WireFormat = require('./wire-format.js').WireFormat;
var Tlv0_1_1WireFormat = require('./tlv-0_1_1-wire-format.js').Tlv0_1_1WireFormat;

/**
 * A TlvWireFormat extends WireFormat to override its methods to
 * implement encoding and decoding using the preferred implementation of NDN-TLV.
 * @constructor
 */
var TlvWireFormat = function TlvWireFormat()
{
  // Inherit from Tlv0_1_1WireFormat.
  Tlv0_1_1WireFormat.call(this);
};

TlvWireFormat.prototype = new Tlv0_1_1WireFormat();
TlvWireFormat.prototype.name = "TlvWireFormat";

exports.TlvWireFormat = TlvWireFormat;

// Default object.
TlvWireFormat.instance = null;

/**
 * Get a singleton instance of a TlvWireFormat.  Assuming that the default
 * wire format was set with WireFormat.setDefaultWireFormat(TlvWireFormat.get()),
 * you can check if this is the default wire encoding with
 * if WireFormat.getDefaultWireFormat() == TlvWireFormat.get().
 * @returns {TlvWireFormat} The singleton instance.
 */
TlvWireFormat.get = function()
{
  if (TlvWireFormat.instance === null)
    TlvWireFormat.instance = new TlvWireFormat();
  return TlvWireFormat.instance;
};

// On loading this module, make this the default wire format.
// This module will be loaded because WireFormat loads it.
WireFormat.setDefaultWireFormat(TlvWireFormat.get());
/**
 * This file contains utilities to help encode and decode NDN objects.
 * Copyright (C) 2013-2015 Regents of the University of California.
 * author: Meki Cheraoui
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var DataUtils = require('./data-utils.js').DataUtils;
var KeyLocatorType = require('../key-locator.js').KeyLocatorType;
var Interest = require('../interest.js').Interest;
var Data = require('../data.js').Data;
var WireFormat = require('./wire-format.js').WireFormat;
var LOG = require('../log.js').Log.LOG;

/**
 * An EncodingUtils has static methods for encoding data.
 * @constructor
 */
var EncodingUtils = function EncodingUtils()
{
};

exports.EncodingUtils = EncodingUtils;

EncodingUtils.encodeToHexInterest = function(interest, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());
  return DataUtils.toHex(interest.wireEncode(wireFormat).buf());
};

EncodingUtils.encodeToHexData = function(data, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());
  return DataUtils.toHex(data.wireEncode(wireFormat).buf());
};

EncodingUtils.decodeHexInterest = function(input, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());
  var interest = new Interest();
  interest.wireDecode(DataUtils.toNumbers(input), wireFormat);
  return interest;
};

EncodingUtils.decodeHexData = function(input, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());
  var data = new Data();
  data.wireDecode(DataUtils.toNumbers(input), wireFormat);
  return data;
};

/**
 * Decode the Buffer array which holds SubjectPublicKeyInfo and return an RSAKey.
 */
EncodingUtils.decodeSubjectPublicKeyInfo = function(array)
{
  var hex = DataUtils.toHex(array).toLowerCase();
  var a = _x509_getPublicKeyHexArrayFromCertHex(hex, _x509_getSubjectPublicKeyPosFromCertHex(hex, 0));
  var rsaKey = new RSAKey();
  rsaKey.setPublic(a[0], a[1]);
  return rsaKey;
}

/**
 * Return a user friendly HTML string with the contents of data.
 */
EncodingUtils.dataToHtml = function(/* Data */ data)
{
  if (data == -1)
    return "NO CONTENT FOUND";
  if (data == -2)
    return "CONTENT NAME IS EMPTY";

  var output = "";
  function append(message) {
    message = message.replace(/&/g, "&amp;");
    message = message.replace(/</g, "&lt;");

    output += message;
    output += "<br/>";
  }

  // Imitate dumpData in examples/node/test-encode-decode-data.js
  
  append("name: " + data.getName().toUri());
  if (data.getContent().size() > 0) {
    append("content (raw): " + data.getContent().buf().toString('binary'));
    append("content (hex): " + data.getContent().toHex());
  }
  else
    append("content: <empty>");

  if (!(data.getMetaInfo().getType() == ContentType.BLOB)) {
    if (data.getMetaInfo().getType() == ContentType.KEY)
      append("metaInfo.type: KEY");
    else if (data.getMetaInfo().getType() == ContentType.LINK)
      append("metaInfo.type: LINK");
    else if (data.getMetaInfo().getType() == ContentType.NACK)
      append("metaInfo.type: NACK");
  }
  append("metaInfo.freshnessPeriod (milliseconds): " +
    (data.getMetaInfo().getFreshnessPeriod() >= 0 ?
      "" + data.getMetaInfo().getFreshnessPeriod() : "<none>"));
  append("metaInfo.finalBlockId: " +
    (data.getMetaInfo().getFinalBlockId().getValue().size() > 0 ?
     data.getMetaInfo().getFinalBlockId().getValue().toHex() : "<none>"));

  var keyLocator = null;
  var signature = data.getSignature();
  if (signature instanceof Sha256WithRsaSignature) {
    var signature = data.getSignature();
    append("Sha256WithRsa signature.signature: " +
      (signature.getSignature().size() > 0 ?
       signature.getSignature().toHex() : "<none>"));
    keyLocator = signature.getKeyLocator();
  }
  else if (signature instanceof DigestSha256Signature) {
    var signature = data.getSignature();
    append("DigestSha256 signature.signature: " +
      (signature.getSignature().size() > 0 ?
       signature.getSignature().toHex() : "<none>"));
  }
  if (keyLocator !== null) {
    if (keyLocator.getType() == KeyLocatorType.NONE)
      append("signature.keyLocator: <none>");
    else if (keyLocator.getType() == KeyLocatorType.KEY_LOCATOR_DIGEST)
      append("signature.keyLocator: KeyLocatorDigest: " + keyLocator.getKeyData().toHex());
    else if (keyLocator.getType() == KeyLocatorType.KEYNAME)
      append("signature.keyLocator: KeyName: " + keyLocator.getKeyName().toUri());
    else
      append("signature.keyLocator: <unrecognized ndn_KeyLocatorType>");
  }

  return output;
};

//
// Deprecated: For the browser, define these in the global scope.  Applications should access as member of EncodingUtils.
//

var encodeToHexInterest = function(interest) { return EncodingUtils.encodeToHexInterest(interest); }
var decodeHexInterest = function(input) { return EncodingUtils.decodeHexInterest(input); }
var decodeSubjectPublicKeyInfo = function(input) { return EncodingUtils.decodeSubjectPublicKeyInfo(input); }

/**
 * @deprecated Use interest.wireEncode().
 */
function encodeToBinaryInterest(interest) { return interest.wireEncode().buf(); }
/**
 * This class represents the digest tree for chrono-sync2013.
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Zhehao Wang, based on Jeff T.'s implementation in ndn-cpp
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

var DigestTree = require('./digest-tree.js').DigestTree;
var Interest = require('../interest.js').Interest;
var Data = require('../data.js').Data;
var Name = require('../name.js').Name;
var Blob = require('../util/blob.js').Blob;
var MemoryContentCache = require('../util/memory-content-cache.js').MemoryContentCache;
var SyncStateProto = require('./sync-state').SyncStateProto;

/**
 * ChronoSync2013 implements the NDN ChronoSync protocol as described in the
 * 2013 paper "Let's ChronoSync: Decentralized Dataset State Synchronization in
 * Named Data Networking". http://named-data.net/publications/chronosync .
 * @note The support for ChronoSync is experimental and the API is not finalized.
 * See the API docs for more detail at
 * http://named-data.net/doc/ndn-ccl-api/chrono-sync2013.html .
 *
 * Create a new ChronoSync2013 to communicate using the given face. Initialize
 * the digest log with a digest of "00" and and empty content. Register the
 * applicationBroadcastPrefix to receive interests for sync state messages and
 * express an interest for the initial root digest "00".
 * @param {function} onReceivedSyncState When ChronoSync receives a sync state message,
 * this calls onReceivedSyncState(syncStates, isRecovery) where syncStates is the
 * list of SyncState messages and isRecovery is true if this is the initial
 * list of SyncState messages or from a recovery interest. (For example, if
 * isRecovery is true, a chat application would not want to re-display all
 * the associated chat messages.) The callback should send interests to fetch
 * the application data for the sequence numbers in the sync state.
 * @param {function} onInitialized This calls onInitialized() when the first sync data
 * is received (or the interest times out because there are no other
 * publishers yet).
 * @param {Name} applicationDataPrefix The prefix used by this application instance
 * for application data. For example, "/my/local/prefix/ndnchat4/0K4wChff2v".
 * This is used when sending a sync message for a new sequence number.
 * In the sync message, this uses applicationDataPrefix.toUri().
 * @param {Name} applicationBroadcastPrefix The broadcast name prefix including the
 * application name. For example, "/ndn/broadcast/ChronoChat-0.3/ndnchat1".
 * This makes a copy of the name.
 * @param {int} sessionNo The session number used with the applicationDataPrefix in
 * sync state messages.
 * @param {Face} face The Face for calling registerPrefix and expressInterest. The
 * Face object must remain valid for the life of this ChronoSync2013 object.
 * @param {KeyChain} keyChain To sign a data packet containing a sync state message, this
 * calls keyChain.sign(data, certificateName).
 * @param {Name} certificateName The certificate name of the key to use for signing a
 * data packet containing a sync state message.
 * @param {Milliseconds} syncLifetime The interest lifetime in milliseconds for sending
 * sync interests.
 * @param {function} onRegisterFailed If failed to register the prefix to receive
 * interests for the applicationBroadcastPrefix, this calls
 * onRegisterFailed(applicationBroadcastPrefix).
 */
var ChronoSync2013 = function ChronoSync2013
  (onReceivedSyncState, onInitialized, applicationDataPrefix,
   applicationBroadcastPrefix, sessionNo, face, keyChain, certificateName,
   syncLifetime, onRegisterFailed)
{
  // assigning function pointers
  this.onReceivedSyncState = onReceivedSyncState;
  this.onInitialized = onInitialized;
  this.applicationDataPrefixUri = applicationDataPrefix.toUri();
  this.applicationBroadcastPrefix = applicationBroadcastPrefix;
  this.session = sessionNo;
  this.face = face;
  this.keyChain = keyChain;
  this.certificateName = certificateName;
  this.sync_lifetime = syncLifetime;
  this.usrseq = -1;

  this.digest_tree = new DigestTree();
  this.contentCache = new MemoryContentCache(face);

  this.digest_log = new Array();
  this.digest_log.push(new ChronoSync2013.DigestLogEntry("00",[]));

  this.contentCache.registerPrefix
    (this.applicationBroadcastPrefix, onRegisterFailed,
     this.onInterest.bind(this));
  this.enabled = true;

  var interest = new Interest(this.applicationBroadcastPrefix);
  interest.getName().append("00");

  interest.setInterestLifetimeMilliseconds(1000);

  var Sync;
  try {
    // Using protobuf.min.js in the browser.
    Sync = dcodeIO.ProtoBuf.newBuilder().import(SyncStateProto).build("Sync");
  }
  catch (ex) {
    // Using protobufjs in node.
    Sync = require("protobufjs").newBuilder().import(SyncStateProto).build("Sync");
  }
  this.SyncStateMsg = Sync.SyncStateMsg;
  this.SyncState = Sync.SyncState;

  this.face.expressInterest(interest, this.onData.bind(this), this.initialTimeOut.bind(this));
};

exports.ChronoSync2013 = ChronoSync2013;

ChronoSync2013.prototype.getProducerSequenceNo = function(dataPrefix, sessionNo)
{
  var index = this.digest_tree.find(dataPrefix, sessionNo);
  if (index < 0)
    return -1;
  else
    return this.digest_tree.get(index).getSequenceNo();
};

/**
 * Increment the sequence number, create a sync message with the new sequence number,
 * and publish a data packet where the name is applicationBroadcastPrefix + root
 * digest of current digest tree. Then add the sync message to digest tree and digest
 * log which creates a new root digest. Finally, express an interest for the next sync
 * update with the name applicationBroadcastPrefix + the new root digest.
 * After this, application should publish the content for the new sequence number.
 * Get the new sequence number with getSequenceNo().
 */
ChronoSync2013.prototype.publishNextSequenceNo = function()
{
  this.usrseq ++;
  var content = [new this.SyncState({ name:this.applicationDataPrefixUri,
                                 type:'UPDATE',
                                 seqno:{
                                   seq:this.usrseq,
                                   session:this.session
                                  }
                                })];
  var content_t = new this.SyncStateMsg({ss:content});
  this.broadcastSyncState(this.digest_tree.getRoot(), content_t);

  if (!this.update(content))
    console.log("Warning: ChronoSync: update did not create a new digest log entry");

  var interest = new Interest(this.applicationBroadcastPrefix);
  interest.getName().append(this.digest_tree.getRoot());
  interest.setInterestLifetimeMilliseconds(this.sync_lifetime);

  this.face.expressInterest(interest, this.onData.bind(this), this.syncTimeout.bind(this));
};

/**
 * Get the sequence number of the latest data published by this application instance.
 * @return {int} the sequence number
 */
ChronoSync2013.prototype.getSequenceNo = function()
{
  return this.usrseq;
};

// DigestLogEntry class

ChronoSync2013.DigestLogEntry = function ChronoSync2013DisgestLogEntry(digest, data)
{
  this.digest = digest;
  this.data = data;
};

ChronoSync2013.DigestLogEntry.prototype.getDigest = function()
{
  return this.digest;
};

ChronoSync2013.DigestLogEntry.prototype.getData = function()
{
  return this.data;
};

/**
 * Unregister callbacks so that this does not respond to interests anymore.
 * If you will dispose this ChronoSync2013 object while your application is
 * still running, you should call shutdown() first.  After calling this, you
 * should not call publishNextSequenceNo() again since the behavior will be
 * undefined.
 */
ChronoSync2013.prototype.shutdown = function()
{
  this.enabled = false;
  this.contentCache.unregisterAll();
};

// SyncState class
/**
 * A SyncState holds the values of a sync state message which is passed to the
 * onReceivedSyncState callback which was given to the ChronoSyn2013
 * constructor. Note: this has the same info as the Protobuf class
 * Sync::SyncState, but we make a separate class so that we don't need the
 * Protobuf definition in the ChronoSync API.
 */
ChronoSync2013.SyncState = function ChronoSync2013SyncState(dataPrefixUri, sessionNo, sequenceNo)
{
  this.dataPrefixUri_ = dataPrefixUri;
  this.sessionNo_ = sessionNo;
  this.sequenceNo_ = sequenceNo;
};

/**
 * Get the application data prefix for this sync state message.
 * @return The application data prefix as a Name URI string.
 */
ChronoSync2013.SyncState.prototype.getDataPrefix = function()
{
  return this.dataPrefixUri_;
}

/**
 * Get the session number associated with the application data prefix for
 * this sync state message.
 * @return The session number.
 */
ChronoSync2013.SyncState.prototype.getSessionNo = function()
{
  return this.sessionNo_;
}

/**
 * Get the sequence number for this sync state message.
 * @return The sequence number.
 */
ChronoSync2013.SyncState.prototype.getSequenceNo = function()
{
  return this.sequenceNo_;
}

// Private methods for ChronoSync2013 class,
/**
 * Make a data packet with the syncMessage and with name applicationBroadcastPrefix_ + digest.
 * Sign and send.
 * @param {string} The root digest as a hex string for the data packet name.
 * @param {SyncStateMsg} The syncMessage updates the digest tree state with the given digest.
 */
ChronoSync2013.prototype.broadcastSyncState = function(digest, syncMessage)
{
  var array = new Uint8Array(syncMessage.toArrayBuffer());
  var data = new Data(this.applicationBroadcastPrefix);
  data.getName().append(digest);
  data.setContent(new Blob(array, false));
  this.keyChain.sign(data, this.certificateName);
  this.contentCache.add(data);
};

/**
 * Update the digest tree with the messages in content. If the digest tree root is not in
 * the digest log, also add a log entry with the content.
 * @param {SyncStates[]} The sync state messages
 * @return {bool} True if added a digest log entry (because the updated digest tree root
 * was not in the log), false if didn't add a log entry.
 */
 // Whatever's received by ondata, is pushed into digest log as its data directly
ChronoSync2013.prototype.update = function(content)
{
  for (var i = 0; i < content.length; i++) {
    if (content[i].type == 0) {
      if (this.digest_tree.update(content[i].name, content[i].seqno.session, content[i].seqno.seq)) {
        if (this.applicationDataPrefixUri == content[i].name)
          this.usrseq = content[i].seqno.seq;
      }
    }
  }

  if (this.logfind(this.digest_tree.getRoot()) == -1) {
    var newlog = new ChronoSync2013.DigestLogEntry(this.digest_tree.getRoot(), content);
    this.digest_log.push(newlog);
    return true;
  }
  else
    return false;
};

ChronoSync2013.prototype.logfind = function(digest)
{
  for (var i = 0; i < this.digest_log.length; i++) {
    if(digest == this.digest_log[i].digest)
      return i;
  }
  return -1;
};

/**
 * Process the sync interest from the applicationBroadcastPrefix. If we can't
 * satisfy the interest, add it to the pending interest table in
 * this.contentCache so that a future call to contentCacheAdd may satisfy it.
 */
ChronoSync2013.prototype.onInterest = function
  (prefix, interest, face, interestFilterId, filter)
{
  if (!this.enabled)
    // Ignore callbacks after the application calls shutdown().
    return;

  //search if the digest is already exist in the digest log

  var syncdigest = interest.getName().get(this.applicationBroadcastPrefix.size()).toEscapedString();
  if (interest.getName().size() == this.applicationBroadcastPrefix.size() + 2) {
    syncdigest = interest.getName().get(this.applicationBroadcastPrefix.size() + 1).toEscapedString();
  }
  if (interest.getName().size() == this.applicationBroadcastPrefix.size() + 2 || syncdigest == "00") {
    this.processRecoveryInst(interest, syncdigest, face);
  }
  else {
    this.contentCache.storePendingInterest(interest, face);

    if (syncdigest != this.digest_tree.getRoot()) {
      var index = this.logfind(syncdigest);
      var content = [];
      if(index == -1) {
        var self = this;
        // Are we sure that using a "/timeout" interest is the best future call approach?
        var timeout = new Interest(new Name("/timeout"));
        timeout.setInterestLifetimeMilliseconds(2000);
        this.face.expressInterest
          (timeout, this.dummyOnData,
           this.judgeRecovery.bind(this, timeout, syncdigest, face));
      }
      else {
        //common interest processing
        this.processSyncInst(index, syncdigest, face);
      }
    }
  }
};

/**
 * Process sync/recovery data.
 * @param {Interest}
 * @param {Data}
 */
ChronoSync2013.prototype.onData = function(interest, co)
{
  if (!this.enabled)
    // Ignore callbacks after the application calls shutdown().
    return;

  var arr = new Uint8Array(co.getContent().size());
  arr.set(co.getContent().buf());
  var content_t = this.SyncStateMsg.decode(arr.buffer);
  var content = content_t.ss;

  var isRecovery = false;

  if (this.digest_tree.getRoot() == "00") {
    isRecovery = true;
    this.initialOndata(content);
  }
  else {
    this.update(content);
    if (interest.getName().size() == this.applicationBroadcastPrefix.size() + 2)
      // Assume this is a recovery interest.
      isRecovery = true;
    else
      isRecovery = false;
  }

  var syncStates = [];

  for (var i = 0; i < content.length; i++) {
    if (content[i].type == 0) {
      syncStates.push(new ChronoSync2013.SyncState
        (content[i].name, content[i].seqno.session, content[i].seqno.seq));
    }
  }

  // Instead of using Protobuf, use our own definition of SyncStates to pass to onReceivedSyncState.
  this.onReceivedSyncState(syncStates, isRecovery);

  var n = new Name(this.applicationBroadcastPrefix);
  n.append(this.digest_tree.getRoot());

  var interest = new Interest(n);
  interest.setInterestLifetimeMilliseconds(this.sync_lifetime);

  this.face.expressInterest(interest, this.onData.bind(this), this.syncTimeout.bind(this));
};

/**
 * Interest variable not actually in use here
 */
ChronoSync2013.prototype.initialTimeOut = function(interest)
{
  if (!this.enabled)
    // Ignore callbacks after the application calls shutdown().
    return;

  console.log("no other people");

  this.usrseq++;
  this.onInitialized();
  var content = [new this.SyncState({ name:this.applicationDataPrefixUri,
                                 type:'UPDATE',
                                 seqno: {
                                   seq:this.usrseq,
                                   session:this.session
                                 }
                               })];
  this.update(content);
  var n = new Name(this.applicationBroadcastPrefix);
  n.append(this.digest_tree.getRoot());
  var retryInterest = new Interest(n);
  retryInterest.setInterestLifetimeMilliseconds(this.sync_lifetime);

  this.face.expressInterest(retryInterest, this.onData.bind(this), this.syncTimeout.bind(this));
};

ChronoSync2013.prototype.processRecoveryInst = function(interest, syncdigest, face)
{
  if (this.logfind(syncdigest) != -1) {
    var content = [];

    for(var i = 0; i < this.digest_tree.digestnode.length; i++) {
      content[i] = new this.SyncState({ name:this.digest_tree.digestnode[i].getDataPrefix(),
                                   type:'UPDATE',
                                   seqno:{
                                     seq:this.digest_tree.digestnode[i].getSequenceNo(),
                                     session:this.digest_tree.digestnode[i].getSessionNo()
                                    }
                                 });
    }

    if (content.length != 0) {
      var content_t = new this.SyncStateMsg({ss:content});
      var str = new Uint8Array(content_t.toArrayBuffer());
      var co = new Data(interest.getName());
      co.setContent(new Blob(str, false));
      this.keyChain.sign(co, this.certificateName);
      try {
        face.putData(co);
      } catch (e) {
        console.log(e.toString());
      }
    }
  }
};

/**
 * Common interest processing, using digest log to find the difference after syncdigest_t
 * @return True if sent a data packet to satisfy the interest.
 */
ChronoSync2013.prototype.processSyncInst = function(index, syncdigest_t, face)
{
  var content = [];
  var data_name = [];
  var data_seq = [];
  var data_ses = [];

  for (var j = index + 1; j < this.digest_log.length; j++) {
    var temp = this.digest_log[j].getData();
    for (var i = 0 ; i < temp.length ; i++) {
      if (temp[i].type != 0) {
        continue;
      }
      if (this.digest_tree.find(temp[i].name, temp[i].seqno.session) != -1) {
        var n = data_name.indexOf(temp[i].name);
        if (n == -1) {
          data_name.push(temp[i].name);
          data_seq.push(temp[i].seqno.seq);
          data_ses.push(temp[i].seqno.session);
        }
        else {
          data_seq[n] = temp[i].seqno.seq;
          data_ses[n] = temp[i].seqno.session;
        }
      }
    }
  }

  for(var i = 0; i < data_name.length; i++) {
    content[i] = new this.SyncState({ name:data_name[i],
                                 type:'UPDATE',
                                 seqno: {
                                   seq:data_seq[i],
                                   session:data_ses[i]
                                 }
                               });
  }
  if (content.length != 0) {
    var content_t = new this.SyncStateMsg({ss:content});
    var str = new Uint8Array(content_t.toArrayBuffer());
    var n = new Name(this.prefix)
    n.append(this.chatroom).append(syncdigest_t);

    var co = new Data(n);
    co.setContent(new Blob(str, false));
    this.keyChain.sign(co, this.certificateName);
    try {
      face.putData(co);
    }
    catch (e) {
      console.log(e.toString());
    }
  }
};

/**
 * Send recovery interset.
 * @param {string} syncdigest_t
 */
ChronoSync2013.prototype.sendRecovery = function(syncdigest_t)
{
  var n = new Name(this.applicationBroadcastPrefix);
  n.append("recovery").append(syncdigest_t);

  var interest = new Interest(n);

  interest.setInterestLifetimeMilliseconds(this.sync_lifetime);

  this.face.expressInterest(interest, this.onData.bind(this), this.syncTimeout.bind(this));
};

/**
 * This is called by onInterest after a timeout to check if a recovery is needed.
 * This method has an interest argument because we use it as the onTimeout for
 * Face.expressInterest.
 * @param {Interest}
 * @param {string}
 * @param {Face}
 */
ChronoSync2013.prototype.judgeRecovery = function(interest, syncdigest_t, face)
{
  //console.log("*** judgeRecovery interest " + interest.getName().toUri() + " times out. Digest: " + syncdigest_t + " ***");
  var index = this.logfind(syncdigest_t);
  if (index != -1) {
    if (syncdigest_t != this.digest_tree.root)
      this.processSyncInst(index, syncdigest_t, face);
  }
  else
    this.sendRecovery(syncdigest_t);
};

ChronoSync2013.prototype.syncTimeout = function(interest)
{
  if (!this.enabled)
    // Ignore callbacks after the application calls shutdown().
    return;

  var component = interest.getName().get(4).toEscapedString();
  if (component == this.digest_tree.root) {
    var n = new Name(interest.getName());
    var newInterest = new Interest(n);

    interest.setInterestLifetimeMilliseconds(this.sync_lifetime);
    this.face.expressInterest(newInterest, this.onData.bind(this), this.syncTimeout.bind(this));
  }
};

ChronoSync2013.prototype.initialOndata = function(content)
{
  this.update(content);

  var digest_t = this.digest_tree.getRoot();
  for (var i = 0; i < content.length; i++) {
    if (content[i].name == this.applicationDataPrefixUri && content[i].seqno.session == this.session) {
      //if the user was an old comer, after add the static log he need to increase his seqno by 1
      var content_t = [new this.SyncState({ name:this.applicationDataPrefixUri,
                                       type:'UPDATE',
                                       seqno: {
                                         seq:content[i].seqno.seq + 1,
                                         session:this.session
                                       }
                                     })];
      if (this.update(content_t)) {
        var newlog = new ChronoSync2013.DigestLogEntry(this.digest_tree.getRoot(), content_t);
        this.digest_log.push(newlog);
        this.onInitialized();
      }
    }
  }

  var content_t;
  if (this.usrseq >= 0) {
    //send the data packet with new seqno back
    content_t = new this.SyncState({ name:this.applicationDataPrefixUri,
                                   type:'UPDATE',
                                   seqno: {
                                     seq:this.usrseq,
                                     session:this.session
                                   }
                                 });
  }
  else
    content_t = new this.SyncState({ name:this.applicationDataPrefixUri,
                                   type:'UPDATE',
                                   seqno: {
                                     seq:0,
                                     session:this.session
                                   }
                                 });
  var content_tt = new this.SyncStateMsg({ss:content_t});
  this.broadcastSyncState(digest_t, content_tt);

  if (this.digest_tree.find(this.applicationDataPrefixUri, this.session) == -1) {
    //the user haven't put himself in the digest tree
    this.usrseq++;
    var content = [new this.SyncState({ name:this.applicationDataPrefixUri,
                                   type:'UPDATE',
                                   seqno: {
                                     seq:this.usrseq,
                                     session:this.session
                                   }
                                 })];
    if (this.update(content)) {
      this.onInitialized();
    }
  }
};

ChronoSync2013.prototype.dummyOnData = function(interest, data)
{
  console.log("*** dummyOnData called. ***");
};/**
 * This class represents the digest tree for chrono-sync2013.
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Zhehao Wang, based on Jeff T.'s implementation in ndn-cpp
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

// Use capitalized Crypto to not clash with the browser's crypto.subtle.
var Crypto = require("crypto");
var DataUtils = require("../encoding/data-utils.js").DataUtils;

var DigestTree = function DigestTree()
{
  this.root = "00";
  this.digestnode = [];
};

exports.DigestTree = DigestTree;

// The meaning of a session is explained here:
// http://named-data.net/doc/ndn-ccl-api/chrono-sync2013.html
// DigestTree.Node works with seqno_seq and seqno_session, without protobuf definition,
DigestTree.Node = function DigestTreeNode(dataPrefix, seqno_session, seqno_seq)
{
  // In this context, this should mean DigestTree.Node instead
  this.dataPrefix = dataPrefix;
  this.seqno_session = seqno_session;
  this.seqno_seq = seqno_seq;

  this.recomputeDigest();
};

DigestTree.Node.prototype.getDataPrefix = function()
{
  return this.dataPrefix;
};

DigestTree.Node.prototype.getSessionNo = function()
{
  return this.seqno_session;
};

DigestTree.Node.prototype.getSequenceNo = function()
{
  return this.seqno_seq;
};

DigestTree.Node.prototype.getDigest = function()
{
  return this.digest;
};

DigestTree.Node.prototype.setSequenceNo = function(sequenceNo)
{
  this.seqno_seq = sequenceNo;
  this.recomputeDigest();
};

// Using Node.JS buffer, as documented here http://nodejs.org/api/buffer.html.
DigestTree.Node.prototype.Int32ToBuffer = function(value) {
  var result = new Buffer(4);
  for (var i = 0; i < 4; i++) {
    result[i] = value % 256;
    value = Math.floor(value / 256);
  }
  return result;
}

DigestTree.Node.prototype.recomputeDigest = function()
{
  var seqHash = Crypto.createHash('sha256');

  seqHash.update(this.Int32ToBuffer(this.seqno_session));
  seqHash.update(this.Int32ToBuffer(this.seqno_seq));

  var digest_seq = seqHash.digest();

  var nameHash = Crypto.createHash('sha256');
  nameHash.update(this.dataPrefix);
  var digest_name = nameHash.digest();

  var hash = Crypto.createHash('sha256');
  hash.update(digest_name);
  hash.update(digest_seq);

  this.digest = hash.digest('hex');
};

// Do the work of string and then sequence number compare
DigestTree.Node.Compare = function(node1, node2)
{
  if (node1.dataPrefix != node2.dataPrefix)
    return node1.dataPrefix < node2.dataPrefix;
  return node1.seqno_session < node2.seqno_session;
};

/**
 * Update the digest tree and recompute the root digest. If the combination of dataPrefix
 * and sessionNo already exists in the tree then update its sequenceNo (only if the given
 * sequenceNo is newer), otherwise add a new node.
 * @param {string} The name prefix.
 * @param {int} sessionNo The session number.
 * @param {int} sequenceNo The sequence number.
 * @return True if the digest tree is updated, false if not
 */
DigestTree.prototype.update = function(dataPrefix, sessionNo, sequenceNo)
{
  var n_index = this.find(dataPrefix, sessionNo);
  if (n_index >= 0) {
    if (this.digestnode[n_index].getSequenceNo() < sequenceNo)
      this.digestnode[n_index].setSequenceNo(sequenceNo);
    else
      return false;
  }
  else {
    var temp = new DigestTree.Node(dataPrefix, sessionNo, sequenceNo);
    this.digestnode.push(temp);
    this.digestnode.sort(this.sortNodes);
  }
  this.recomputeRoot();
  return true;
};

// Need to confirm this sort works with the insertion in ndn-cpp.
DigestTree.prototype.sortNodes = function()
{
  var temp;
  for (var i = this.digestnode.length; i > 0; i--) {
    for (var j = 0; j < i - 1; j++) {
      if (this.digestnode[j].getDataPrefix() > this.digestnode[j + 1].getDataPrefix()) {
        temp = this.digestnode[j];
        this.digestnode[j] = this.digestnode[j + 1];
        this.digestnode[j + 1] = temp;
      }
    }
  }
};

DigestTree.prototype.sortNodes = function (node1, node2)
{
  if (node1.getDataPrefix() == node2.getDataPrefix() &&
     node1.getSessionNo() == node2.getSessionNo())
    return 0;

  if ((node1.getDataPrefix() > node2.getDataPrefix()) ||
     ((node1.getDataPrefix() == node2.getDataPrefix()) &&
     (node1.getSessionNo() >node2.getSessionNo())))
    return 1;
  else
    return -1;
}

DigestTree.prototype.find = function(dataPrefix, sessionNo)
{
  for (var i = 0; i < this.digestnode.length; ++i) {
    if (this.digestnode[i].getDataPrefix() == dataPrefix &&
        this.digestnode[i].getSessionNo() == sessionNo)
      return i;
  }
  return -1;
};

DigestTree.prototype.size = function()
{
  return this.digestnode.size();
};

// Not really used
DigestTree.prototype.get = function(i)
{
  return this.digestnode[i];
};

DigestTree.prototype.getRoot = function()
{
  return this.root;
};

DigestTree.prototype.recomputeRoot = function()
{
  var md = Crypto.createHash('sha256');
  // The result of updateHex is related with the sequence of participants,
  // I don't think that should be the case.
  for (var i = 0; i < this.digestnode.length; i++) {
    md.update(new Buffer(this.digestnode[i].digest, 'hex'));
  }
  this.root = md.digest('hex');
};
// Just define the SyncStateProto object. We do a Protobuf import dynamically
// when we need it so that protobufjs is optional.
var SyncStateProto = {
    "package": "Sync",
    "messages": [
        {
            "name": "SyncState",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "name",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "required",
                    "type": "ActionType",
                    "name": "type",
                    "id": 2,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "SeqNo",
                    "name": "seqno",
                    "id": 3,
                    "options": {}
                }
            ],
            "enums": [
                {
                    "name": "ActionType",
                    "values": [
                        {
                            "name": "UPDATE",
                            "id": 0
                        },
                        {
                            "name": "DELETE",
                            "id": 1
                        },
                        {
                            "name": "OTHER",
                            "id": 2
                        }
                    ],
                    "options": {}
                }
            ],
            "messages": [
                {
                    "name": "SeqNo",
                    "fields": [
                        {
                            "rule": "required",
                            "type": "uint32",
                            "name": "seq",
                            "id": 1,
                            "options": {}
                        },
                        {
                            "rule": "required",
                            "type": "uint32",
                            "name": "session",
                            "id": 2,
                            "options": {}
                        }
                    ],
                    "enums": [],
                    "messages": [],
                    "options": {}
                }
            ],
            "options": {}
        },
        {
            "name": "SyncStateMsg",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "SyncState",
                    "name": "ss",
                    "id": 1,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        }
    ],
    "enums": [],
    "imports": [],
    "options": {}
};

exports.SyncStateProto = SyncStateProto;
/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

// Use capitalized Crypto to not clash with the browser's crypto.subtle.
var Crypto = require("crypto");
var WireFormat = require('../encoding/wire-format.js').WireFormat;
var TlvEncoder = require('../encoding/tlv/tlv-encoder.js').TlvEncoder;
var Blob = require('./blob.js').Blob;

/**
 * A CommandInterestGenerator keeps track of a timestamp and generates command
 * interests according to the NFD Signed Command Interests protocol:
 * http://redmine.named-data.net/projects/nfd/wiki/Command_Interests
 *
 * Create a new CommandInterestGenerator and initialize the timestamp to now.
 * @constructor
 */
var CommandInterestGenerator = function CommandInterestGenerator()
{
  this.lastTimestamp = Math.round(new Date().getTime());
};

exports.CommandInterestGenerator = CommandInterestGenerator;

/**
 * Append a timestamp component and a random value component to interest's name.
 * This ensures that the timestamp is greater than the timestamp used in the
 * previous call. Then use keyChain to sign the interest which appends a
 * SignatureInfo component and a component with the signature bits. If the
 * interest lifetime is not set, this sets it.
 * @param {Interest} interest The interest whose name is append with components.
 * @param {KeyChain} keyChain The KeyChain for calling sign.
 * @param {Name} certificateName The certificate name of the key to use for
 * signing.
 * @param {WireFormat} wireFormat (optional) A WireFormat object used to encode
 * the SignatureInfo and to encode interest name for signing. If omitted, use
 * WireFormat.getDefaultWireFormat().
 * @param {function} onComplete (optional) This calls onComplete() when complete.
 * (Some crypto/database libraries only use a callback, so onComplete is
 * required to use these.)
 */
CommandInterestGenerator.prototype.generate = function
  (interest, keyChain, certificateName, wireFormat, onComplete)
{
  onComplete = (typeof wireFormat === "function") ? wireFormat : onComplete;
  wireFormat = (typeof wireFormat === "function" || !wireFormat) ?
    WireFormat.getDefaultWireFormat() : wireFormat;

  var timestamp = Math.round(new Date().getTime());
  while (timestamp <= this.lastTimestamp)
    timestamp += 1.0;

  // The timestamp is encoded as a TLV nonNegativeInteger.
  var encoder = new TlvEncoder(8);
  encoder.writeNonNegativeInteger(timestamp);
  interest.getName().append(new Blob(encoder.getOutput(), false));

  // The random value is a TLV nonNegativeInteger too, but we know it is 8
  // bytes, so we don't need to call the nonNegativeInteger encoder.
  interest.getName().append(new Blob(Crypto.randomBytes(8), false));

  // Update the timestamp before calling async sign.
  this.lastTimestamp = timestamp;

  keyChain.sign(interest, certificateName, wireFormat, function() {
    if (interest.getInterestLifetimeMilliseconds() == null ||
        interest.getInterestLifetimeMilliseconds() < 0)
      // The caller has not set the interest lifetime, so set it here.
      interest.setInterestLifetimeMilliseconds(1000.0);

    if (onComplete)
      onComplete();
  });
};
/**
 * This class represents the top-level object for communicating with an NDN host.
 * Copyright (C) 2013-2015 Regents of the University of California.
 * @author: Meki Cherkaoui, Jeff Thompson <jefft0@remap.ucla.edu>, Wentao Shang
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

// Use capitalized Crypto to not clash with the browser's crypto.subtle.
var Crypto = require('crypto');
var DataUtils = require('./encoding/data-utils.js').DataUtils;
var Name = require('./name.js').Name;
var Interest = require('./interest.js').Interest;
var Data = require('./data.js').Data;
var MetaInfo = require('./meta-info.js').MetaInfo;
var ControlParameters = require('./control-parameters.js').ControlParameters;
var InterestFilter = require('./interest-filter.js').InterestFilter;
var WireFormat = require('./encoding/wire-format.js').WireFormat;
var TlvWireFormat = require('./encoding/tlv-wire-format.js').TlvWireFormat;
var Tlv = require('./encoding/tlv/tlv.js').Tlv;
var TlvDecoder = require('./encoding/tlv/tlv-decoder.js').TlvDecoder;
var KeyLocatorType = require('./key-locator.js').KeyLocatorType;
var ForwardingFlags = require('./forwarding-flags.js').ForwardingFlags;
var Transport = require('./transport/transport.js').Transport;
var TcpTransport = require('./transport/tcp-transport.js').TcpTransport;
var UnixTransport = require('./transport/unix-transport.js').UnixTransport;
var CommandInterestGenerator = require('./util/command-interest-generator.js').CommandInterestGenerator;
var NdnCommon = require('./util/ndn-common.js').NdnCommon;
var fs = require('fs');
var LOG = require('./log.js').Log.LOG;

/**
 * Create a new Face with the given settings.
 * This throws an exception if Face.supported is false.
 * There are two forms of the constructor.  The first form takes the transport and connectionInfo:
 * Face(transport, connectionInfo).  The second form takes an optional settings object:
 * Face([settings]).
 * @constructor
 * @param {Transport} transport An object of a subclass of Transport to use for
 * communication.
 * @param {Transport.ConnectionInfo} connectionInfo This must be a ConnectionInfo
 * from the same subclass of Transport as transport. If omitted and transport is
 * a new UnixTransport() then attempt to create to the Unix socket for the local
 * forwarder.
 * @param {Object} settings (optional) An associative array with the following defaults:
 * {
 *   getTransport: function() { return new WebSocketTransport(); }, // If in the browser.
 *              OR function() { return new TcpTransport(); },       // If in Node.js.
 *              // If getTransport creates a UnixTransport and connectionInfo is null,
 *              // then connect to the local forwarder's Unix socket.
 *   getConnectionInfo: transport.defaultGetConnectionInfo, // a function, on each call it returns a new Transport.ConnectionInfo or null if there are no more hosts.
 *                                                          // If connectionInfo or host is not null, getConnectionInfo is ignored.
 *   connectionInfo: null,
 *   host: null, // If null and connectionInfo is null, use getConnectionInfo when connecting.
 *               // However, if connectionInfo is not null, use it instead.
 *   port: 9696, // If in the browser.
 *      OR 6363, // If in Node.js.
 *               // However, if connectionInfo is not null, use it instead.
 *   onopen: function() { if (LOG > 3) console.log("NDN connection established."); },
 *   onclose: function() { if (LOG > 3) console.log("NDN connection closed."); },
 * }
 */
var Face = function Face(transportOrSettings, connectionInfo)
{
  if (!Face.supported)
    throw new Error("The necessary JavaScript support is not available on this platform.");

  var settings;
  if (typeof transportOrSettings == 'object' && transportOrSettings instanceof Transport) {
    this.getConnectionInfo = null;
    this.transport = transportOrSettings;
    this.connectionInfo = (connectionInfo || null);
    // Use defaults for other settings.
    settings = {};

    if (this.connectionInfo == null) {
      if (this.transport && this.transport.__proto__ &&
          this.transport.__proto__.name == "UnixTransport") {
        // Try to create the default connectionInfo for UnixTransport.
        var filePath = Face.getUnixSocketFilePathForLocalhost();
        if (filePath != null)
          this.connectionInfo = new UnixTransport.ConnectionInfo(filePath);
        else
          console.log
            ("Face constructor: Cannot determine the default Unix socket file path for UnixTransport");
        console.log("Using " + this.connectionInfo.toString());
      }
    }
  }
  else {
    settings = (transportOrSettings || {});
    // For the browser, browserify-tcp-transport.js replaces TcpTransport with WebSocketTransport.
    var getTransport = (settings.getTransport || function() { return new TcpTransport(); });
    this.transport = getTransport();
    this.getConnectionInfo = (settings.getConnectionInfo || this.transport.defaultGetConnectionInfo);

    this.connectionInfo = (settings.connectionInfo || null);
    if (this.connectionInfo == null) {
      var host = (settings.host !== undefined ? settings.host : null);

      if (this.transport && this.transport.__proto__ &&
          this.transport.__proto__.name == "UnixTransport") {
        // We are using UnixTransport on Node.js. There is no IP-style host and port.
        if (host != null)
          // Assume the host is the local Unix socket path.
          this.connectionInfo = new UnixTransport.ConnectionInfo(host);
        else {
          // If getConnectionInfo is not null, it will be used instead so no
          // need to set this.connectionInfo.
          if (this.getConnectionInfo == null) {
            var filePath = Face.getUnixSocketFilePathForLocalhost();
            if (filePath != null)
              this.connectionInfo = new UnixTransport.ConnectionInfo(filePath);
            else
              console.log
                ("Face constructor: Cannot determine the default Unix socket file path for UnixTransport");
          }
        }
      }
      else {
        if (host != null) {
          if (typeof WebSocketTransport != 'undefined')
            this.connectionInfo = new WebSocketTransport.ConnectionInfo
              (host, settings.port || 9696);
          else
            this.connectionInfo = new TcpTransport.ConnectionInfo
              (host, settings.port || 6363);
        }
      }
    }
  }

  // Deprecated: Set this.host and this.port for backwards compatibility.
  if (this.connectionInfo == null) {
    this.host = null;
    this.host = null;
  }
  else {
    this.host = this.connectionInfo.host;
    this.host = this.connectionInfo.port;
  }

  this.readyStatus = Face.UNOPEN;

  // Event handler
  this.onopen = (settings.onopen || function() { if (LOG > 3) console.log("Face connection established."); });
  this.onclose = (settings.onclose || function() { if (LOG > 3) console.log("Face connection closed."); });
  // This is used by reconnectAndExpressInterest.
  this.onConnectedCallbacks = [];
  this.commandKeyChain = null;
  this.commandCertificateName = new Name();
  this.commandInterestGenerator = new CommandInterestGenerator();
  this.timeoutPrefix = new Name("/local/timeout");

  this.pendingInterestTable = new Array();  // of Face.PendingInterest
  this.pitRemoveRequests = new Array();     // of number
  this.registeredPrefixTable = new Array(); // of Face.RegisteredPrefix
  this.registeredPrefixRemoveRequests = new Array(); // of number
  this.interestFilterTable = new Array();   // of Face.InterestFilterEntry
  this.lastEntryId = 0;
};

exports.Face = Face;

Face.UNOPEN = 0;  // the Face is created but not opened yet
Face.OPEN_REQUESTED = 1;  // requested to connect but onopen is not called.
Face.OPENED = 2;  // connection to the forwarder opened
Face.CLOSED = 3;  // connection to the forwarder closed

TcpTransport.importFace(Face);

/**
 * If the forwarder's Unix socket file path exists, then return the file path.
 * Otherwise return an empty string. This uses Node.js blocking file system
 * utilities.
 * @return The Unix socket file path to use, or an empty string.
 */
Face.getUnixSocketFilePathForLocalhost = function()
{
  var filePath = "/var/run/nfd.sock";
  if (fs.existsSync(filePath))
    return filePath;
  else {
    filePath = "/tmp/.ndnd.sock";
    if (fs.existsSync(filePath))
      return filePath;
    else
      return "";
  }
}

/**
 * Return true if necessary JavaScript support is available, else log an error and return false.
 */
Face.getSupported = function()
{
  try {
    var dummy = new Buffer(1).slice(0, 1);
  }
  catch (ex) {
    console.log("NDN not available: Buffer not supported. " + ex);
    return false;
  }

  return true;
};

Face.supported = Face.getSupported();

Face.prototype.createRoute = function(hostOrConnectionInfo, port)
{
  if (hostOrConnectionInfo instanceof Transport.ConnectionInfo)
    this.connectionInfo = hostOrConnectionInfo;
  else
    this.connectionInfo = new TcpTransport.ConnectionInfo(hostOrConnectionInfo, port);

  // Deprecated: Set this.host and this.port for backwards compatibility.
  this.host = this.connectionInfo.host;
  this.host = this.connectionInfo.port;
};

Face.prototype.close = function()
{
  if (this.readyStatus != Face.OPENED)
    return;

  this.readyStatus = Face.CLOSED;
  this.transport.close();
};

/**
 * An internal method to get the next unique entry ID for the pending interest
 * table, interest filter table, etc. Most entry IDs are for the pending
 * interest table (there usually are not many interest filter table entries) so
 * we use a common pool to only have to have one method which is called by Face.
 *
 * @returns {number} The next entry ID.
 */
Face.prototype.getNextEntryId = function()
{
  return ++this.lastEntryId;
};

/**
 * A PendingInterestTable is an internal class to hold a list of pending
 * interests with their callbacks.
 * @constructor
 */
Face.PendingInterest = function FacePendingInterest
  (pendingInterestId, interest, onData, onTimeout)
{
  this.pendingInterestId = pendingInterestId;
  this.interest = interest;
  this.onData = onData;
  this.onTimeout = onTimeout;
  this.timerID = -1;
};

/**
 * Find all entries from this.pendingInterestTable where the name conforms to the entry's
 * interest selectors, remove the entries from the table, cancel their timeout
 * timers and return them.
 * @param {Name} name The name to find the interest for (from the incoming data
 * packet).
 * @returns {Array<Face.PendingInterest>} The matching entries from this.pendingInterestTable, or [] if
 * none are found.
 */
Face.prototype.extractEntriesForExpressedInterest = function(name)
{
  var result = [];

  // Go backwards through the list so we can erase entries.
  for (var i = this.pendingInterestTable.length - 1; i >= 0; --i) {
    var entry = this.pendingInterestTable[i];
    if (entry.interest.matchesName(name)) {
      // Cancel the timeout timer.
      clearTimeout(entry.timerID);

      result.push(entry);
      this.pendingInterestTable.splice(i, 1);
    }
  }

  return result;
};

/**
 * A RegisteredPrefix holds a registeredPrefixId and information necessary to
 * remove the registration later. It optionally holds a related interestFilterId
 * if the InterestFilter was set in the same registerPrefix operation.
 * @param {number} registeredPrefixId A unique ID for this entry, which you
 * should get with getNextEntryId().
 * @param {Name} prefix The name prefix.
 * @param {number} relatedInterestFilterId (optional) The related
 * interestFilterId for the filter set in the same registerPrefix operation. If
 * omitted, set to 0.
 * @constructor
 */
Face.RegisteredPrefix = function FaceRegisteredPrefix
  (registeredPrefixId, prefix, relatedInterestFilterId)
{
  this.registeredPrefixId = registeredPrefixId;
  this.prefix = prefix;
  this.relatedInterestFilterId = relatedInterestFilterId;
};

/**
 * Get the registeredPrefixId given to the constructor.
 * @returns {number} The registeredPrefixId.
 */
Face.RegisteredPrefix.prototype.getRegisteredPrefixId = function()
{
  return this.registeredPrefixId;
};

/**
 * Get the name prefix given to the constructor.
 * @returns {Name} The name prefix.
 */
Face.RegisteredPrefix.prototype.getPrefix = function()
{
  return this.prefix;
};

/**
 * Get the related interestFilterId given to the constructor.
 * @returns {number} The related interestFilterId.
 */
Face.RegisteredPrefix.prototype.getRelatedInterestFilterId = function()
{
  return this.relatedInterestFilterId;
};

/**
 * An InterestFilterEntry holds an interestFilterId, an InterestFilter and the
 * OnInterest callback with its related Face.
 * Create a new InterestFilterEntry with the given values.
 * @param {number} interestFilterId The ID from getNextEntryId().
 * @param {InterestFilter} filter The InterestFilter for this entry.
 * @param {function} onInterest The callback to call.
 * @constructor
 */
Face.InterestFilterEntry = function FaceInterestFilterEntry
  (interestFilterId, filter, onInterest)
{
  this.interestFilterId = interestFilterId;
  this.filter = filter;
  this.onInterest = onInterest;
};

/**
 * Get the interestFilterId given to the constructor.
 * @returns {number} The interestFilterId.
 */
Face.InterestFilterEntry.prototype.getInterestFilterId = function()
{
  return this.interestFilterId;
};

/**
 * Get the InterestFilter given to the constructor.
 * @returns {InterestFilter} The InterestFilter.
 */
Face.InterestFilterEntry.prototype.getFilter = function()
{
  return this.filter;
};

/**
 * Get the onInterest callback given to the constructor.
 * @returns {function} The onInterest callback.
 */
Face.InterestFilterEntry.prototype.getOnInterest = function()
{
  return this.onInterest;
};

/**
 * Return a function that selects a host at random from hostList and returns
 * makeConnectionInfo(host, port), and if no more hosts remain, return null.
 * @param {Array<string>} hostList An array of host names.
 * @param {number} port The port for the connection.
 * @param {function} makeConnectionInfo This calls makeConnectionInfo(host, port)
 * to make the Transport.ConnectionInfo. For example:
 * function(host, port) { return new TcpTransport.ConnectionInfo(host, port); }
 * @returns {function} A function which returns a Transport.ConnectionInfo.
 */
Face.makeShuffledHostGetConnectionInfo = function(hostList, port, makeConnectionInfo)
{
  // Make a copy.
  hostList = hostList.slice(0, hostList.length);
  DataUtils.shuffle(hostList);

  return function() {
    if (hostList.length == 0)
      return null;

    return makeConnectionInfo(hostList.splice(0, 1)[0], port);
  };
};

/**
 * Send the interest through the transport, read the entire response and call onData.
 * If the interest times out according to interest lifetime, call onTimeout (if not omitted).
 * There are two forms of expressInterest.  The first form takes the exact interest (including lifetime):
 * expressInterest(interest, onData [, onTimeout]).  The second form creates the interest from
 * a name and optional interest template:
 * expressInterest(name [, template], onData [, onTimeout]).
 * @param {Interest} interest The Interest to send which includes the interest lifetime for the timeout.
 * @param {function} onData When a matching data packet is received, this calls onData(interest, data) where
 * interest is the interest given to expressInterest and data is the received
 * Data object. NOTE: You must not change the interest object - if you need to
 * change it then make a copy.
 * @param {function} onTimeout (optional) If the interest times out according to the interest lifetime,
 *   this calls onTimeout(interest) where:
 *   interest is the interest given to expressInterest.
 * @param {Name} name The Name for the interest. (only used for the second form of expressInterest).
 * @param {Interest} template (optional) If not omitted, copy the interest selectors from this Interest.
 * If omitted, use a default interest lifetime. (only used for the second form of expressInterest).
 * @returns {number} The pending interest ID which can be used with removePendingInterest.
 * @throws Error If the encoded interest size exceeds Face.getMaxNdnPacketSize().

 */
Face.prototype.expressInterest = function(interestOrName, arg2, arg3, arg4)
{
  var interest;
  var onData;
  var onTimeout;
  // expressInterest(Interest interest, function onData);
  // expressInterest(Interest interest, function onData, function onTimeout);
  if (typeof interestOrName == 'object' && interestOrName instanceof Interest) {
    // Just use a copy of the interest.
    interest = new Interest(interestOrName);
    onData = arg2;
    onTimeout = (arg3 ? arg3 : function() {});
  }
  else {
    // The first argument is a name. Make the interest from the name and possible template.

    // expressInterest(Name name, Interest template, function onData);
    // expressInterest(Name name, Interest template, function onData, function onTimeout);
    if (arg2 && typeof arg2 == 'object' && arg2 instanceof Interest) {
      var template = arg2;
      // Copy the template.
      interest = new Interest(template);
      interest.setName(interestOrName);

      onData = arg3;
      onTimeout = (arg4 ? arg4 : function() {});
    }
    // expressInterest(Name name, function onData);
    // expressInterest(Name name, function onData,   function onTimeout);
    else {
      interest = new Interest(interestOrName);
      interest.setInterestLifetimeMilliseconds(4000);   // default interest timeout
      onData = arg2;
      onTimeout = (arg3 ? arg3 : function() {});
    }
  }

  var pendingInterestId = this.getNextEntryId();

  if (this.connectionInfo == null) {
    if (this.getConnectionInfo == null)
      console.log('ERROR: connectionInfo is NOT SET');
    else {
      var thisFace = this;
      this.connectAndExecute(function() {
        thisFace.reconnectAndExpressInterest
          (pendingInterestId, interest, onData, onTimeout);
      });
    }
  }
  else
    this.reconnectAndExpressInterest(pendingInterestId, interest, onData, onTimeout);

  return pendingInterestId;
};

/**
 * If the host and port are different than the ones in this.transport, then call
 *   this.transport.connect to change the connection (or connect for the first time).
 * Then call expressInterestHelper.
 */
Face.prototype.reconnectAndExpressInterest = function
  (pendingInterestId, interest, onData, onTimeout)
{
  var thisFace = this;
  if (!this.connectionInfo.equals(this.transport.connectionInfo) || this.readyStatus === Face.UNOPEN) {
    this.readyStatus = Face.OPEN_REQUESTED;
    this.onConnectedCallbacks.push
      (function() { 
        thisFace.expressInterestHelper(pendingInterestId, interest, onData, onTimeout);
      });

    this.transport.connect
     (this.connectionInfo, this,
      function() {
        thisFace.readyStatus = Face.OPENED;

        // Execute each action requested while the connection was opening.
        while (thisFace.onConnectedCallbacks.length > 0) {
          try {
            thisFace.onConnectedCallbacks.shift()();
          } catch (ex) {
            console.log("Face.reconnectAndExpressInterest: ignoring exception from onConnectedCallbacks: " + ex);
          }
        }

        if (thisFace.onopen)
          // Call Face.onopen after success
          thisFace.onopen();
      },
      function() { thisFace.closeByTransport(); });
  }
  else {
    if (this.readyStatus === Face.OPEN_REQUESTED)
      // The connection is still opening, so add to the interests to express.
      this.onConnectedCallbacks.push
        (function() { 
          thisFace.expressInterestHelper(pendingInterestId, interest, onData, onTimeout);
        });
    else if (this.readyStatus === Face.OPENED)
      this.expressInterestHelper(pendingInterestId, interest, onData, onTimeout);
    else
      throw new Error
        ("reconnectAndExpressInterest: unexpected connection is not opened");
  }
};

/**
 * Do the work of reconnectAndExpressInterest once we know we are connected.
 * Add the PendingInterest and call this.transport.send to send the interest.
 */
Face.prototype.expressInterestHelper = function
  (pendingInterestId, interest, onData, onTimeout)
{
  var binaryInterest = interest.wireEncode();
  if (binaryInterest.size() > Face.getMaxNdnPacketSize())
    throw new Error
      ("The encoded interest size exceeds the maximum limit getMaxNdnPacketSize()");

  var removeRequestIndex = removeRequestIndex = this.pitRemoveRequests.indexOf
    (pendingInterestId);
  if (removeRequestIndex >= 0)
    // removePendingInterest was called with the pendingInterestId returned by
    //   expressInterest before we got here, so don't add a PIT entry.
    this.pitRemoveRequests.splice(removeRequestIndex, 1);
  else {
    var pitEntry = new Face.PendingInterest
      (pendingInterestId, interest, onData, onTimeout);
    this.pendingInterestTable.push(pitEntry);

    // Set interest timer.
    var timeoutMilliseconds = (interest.getInterestLifetimeMilliseconds() || 4000);
    var thisFace = this;
    var timeoutCallback = function() {
      if (LOG > 1) console.log("Interest time out: " + interest.getName().toUri());

      // Remove PIT entry from thisFace.pendingInterestTable.
      var index = thisFace.pendingInterestTable.indexOf(pitEntry);
      if (index >= 0)
        thisFace.pendingInterestTable.splice(index, 1);

      // Call onTimeout.
      if (pitEntry.onTimeout)
        pitEntry.onTimeout(pitEntry.interest);
    };

    pitEntry.timerID = setTimeout(timeoutCallback, timeoutMilliseconds);
  }

  // Special case: For timeoutPrefix we don't actually send the interest.
  if (!this.timeoutPrefix.match(interest.getName()))
    this.transport.send(binaryInterest.buf());
};

/**
 * Remove the pending interest entry with the pendingInterestId from the pending
 * interest table. This does not affect another pending interest with a
 * different pendingInterestId, even if it has the same interest name.
 * If there is no entry with the pendingInterestId, do nothing.
 * @param {number} pendingInterestId The ID returned from expressInterest.
 */
Face.prototype.removePendingInterest = function(pendingInterestId)
{
  if (pendingInterestId == null)
    return;

  // Go backwards through the list so we can erase entries.
  // Remove all entries even though pendingInterestId should be unique.
  var count = 0;
  for (var i = this.pendingInterestTable.length - 1; i >= 0; --i) {
    var entry = this.pendingInterestTable[i];
    if (entry.pendingInterestId == pendingInterestId) {
      // Cancel the timeout timer.
      clearTimeout(entry.timerID);

      this.pendingInterestTable.splice(i, 1);
      ++count;
    }
  }

  if (count == 0)
    if (LOG > 0) console.log
      ("removePendingInterest: Didn't find pendingInterestId " + pendingInterestId);

  if (count == 0) {
    // The pendingInterestId was not found. Perhaps this has been called before
    //   the callback in expressInterest can add to the PIT. Add this
    //   removal request which will be checked before adding to the PIT.
    if (this.pitRemoveRequests.indexOf(pendingInterestId) < 0)
      // Not already requested, so add the request.
      this.pitRemoveRequests.push(pendingInterestId);
  }
};

/**
 * Set the KeyChain and certificate name used to sign command interests (e.g.
 * for registerPrefix).
 * @param {KeyChain} keyChain The KeyChain object for signing interests, which
 * must remain valid for the life of this Face. You must create the KeyChain
 * object and pass it in. You can create a default KeyChain for your system with
 * the default KeyChain constructor.
 * @param {Name} certificateName The certificate name for signing interests.
 * This makes a copy of the Name. You can get the default certificate name with
 * keyChain.getDefaultCertificateName() .
 */
Face.prototype.setCommandSigningInfo = function(keyChain, certificateName)
{
  this.commandKeyChain = keyChain;
  this.commandCertificateName = new Name(certificateName);
};

/**
 * Set the certificate name used to sign command interest (e.g. for
 * registerPrefix), using the KeyChain that was set with setCommandSigningInfo.
 * @param {Name} certificateName The certificate name for signing interest. This
 * makes a copy of the Name.
 */
Face.prototype.setCommandCertificateName = function(certificateName)
{
  this.commandCertificateName = new Name(certificateName);
};

/**
 * Append a timestamp component and a random value component to interest's name.
 * Then use the keyChain and certificateName from setCommandSigningInfo to sign
 * the interest. If the interest lifetime is not set, this sets it.
 * @note This method is an experimental feature. See the API docs for more
 * detail at
 * http://named-data.net/doc/ndn-ccl-api/face.html#face-makecommandinterest-method .
 * @param {Interest} interest The interest whose name is appended with
 * components.
 * @param {WireFormat} wireFormat (optional) A WireFormat object used to encode
 * the SignatureInfo and to encode the interest name for signing.  If omitted,
 * use WireFormat.getDefaultWireFormat().
 */
Face.prototype.makeCommandInterest = function(interest, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());
  this.nodeMakeCommandInterest
    (interest, this.commandKeyChain, this.commandCertificateName, wireFormat);
};

/**
 * Append a timestamp component and a random value component to interest's name.
 * Then use the keyChain and certificateName from setCommandSigningInfo to sign
 * the interest. If the interest lifetime is not set, this sets it.
 * @param {Interest} interest The interest whose name is appended with
 * components.
 * @param {KeyChain} keyChain The KeyChain for calling sign.
 * @param {Name} certificateName The certificate name of the key to use for
 * signing.
 * @param {WireFormat} wireFormat A WireFormat object used to encode
 * the SignatureInfo and to encode the interest name for signing.
 * @param {function} onComplete (optional) This calls onComplete() when complete.
 * (Some crypto/database libraries only use a callback, so onComplete is
 * required to use these.)
 */
Face.prototype.nodeMakeCommandInterest = function
  (interest, keyChain, certificateName, wireFormat, onComplete)
{
  this.commandInterestGenerator.generate
    (interest, keyChain, certificateName, wireFormat, onComplete);
};

/**
 * Register prefix with the connected NDN hub and call onInterest when a 
 * matching interest is received. To register a prefix with NFD, you must
 * first call setCommandSigningInfo.
 * This uses the form:
 * @param {Name} prefix The Name prefix.
 * @param {function} onInterest (optional) If not None, this creates an interest
 * filter from prefix so that when an Interest is received which matches the
 * filter, this calls
 * onInterest(prefix, interest, face, interestFilterId, filter).
 * NOTE: You must not change the prefix object - if you need to change it then
 * make a copy. If onInterest is null, it is ignored and you must call
 * setInterestFilter.
 * @param {function} onRegisterFailed If register prefix fails for any reason,
 * this calls onRegisterFailed(prefix) where:
 *   prefix is the prefix given to registerPrefix.
 * @param {ForwardingFlags} flags (optional) The ForwardingFlags object for 
 * finer control of which interests are forward to the application. If omitted,
 * use the default flags defined by the default ForwardingFlags constructor.
 * @returns {number} The registered prefix ID which can be used with
 * removeRegisteredPrefix.
 */
Face.prototype.registerPrefix = function
  (prefix, onInterest, onRegisterFailed, flags)
{
  if (!onRegisterFailed)
    onRegisterFailed = function() {};
  if (!flags)
    flags = new ForwardingFlags();
  
  var registeredPrefixId = this.getNextEntryId();
  var thisFace = this;
  var onConnected = function() {
    thisFace.nfdRegisterPrefix
      (registeredPrefixId, prefix, onInterest, flags, onRegisterFailed,
       thisFace.commandKeyChain, thisFace.commandCertificateName);
  };

  if (this.connectionInfo == null) {
    if (this.getConnectionInfo == null)
      console.log('ERROR: connectionInfo is NOT SET');
    else
      this.connectAndExecute(onConnected);
  }
  else
    onConnected();

  return registeredPrefixId;
};

/**
 * Get the practical limit of the size of a network-layer packet. If a packet
 * is larger than this, the library or application MAY drop it.
 * @return {number} The maximum NDN packet size.
 */
Face.getMaxNdnPacketSize = function() { return NdnCommon.MAX_NDN_PACKET_SIZE; };

/**
 * A RegisterResponse has onData to receive the response Data packet from the
 * register prefix interest sent to the connected NDN hub. If this gets a bad
 * response or onTimeout is called, then call onRegisterFailed.
 */
Face.RegisterResponse = function RegisterResponse
  (face, prefix, onInterest, onRegisterFailed, flags, wireFormat)
{
  this.face = face;
  this.prefix = prefix;
  this.onInterest = onInterest;
  this.onRegisterFailed = onRegisterFailed;
  this.flags = flags;
  this.wireFormat = wireFormat;
};

Face.RegisterResponse.prototype.onData = function(interest, responseData)
{
  // Decode responseData.getContent() and check for a success code.
  // TODO: Move this into the TLV code.
  var statusCode;
  try {
    var decoder = new TlvDecoder(responseData.getContent().buf());
    decoder.readNestedTlvsStart(Tlv.NfdCommand_ControlResponse);
    statusCode = decoder.readNonNegativeIntegerTlv(Tlv.NfdCommand_StatusCode);
  }
  catch (e) {
    // Error decoding the ControlResponse.
    if (LOG > 0)
      console.log("Register prefix failed: Error decoding the NFD response: " + e);
    if (this.onRegisterFailed)
      this.onRegisterFailed(this.prefix);
    return;
  }

  // Status code 200 is "OK".
  if (statusCode != 200) {
    if (LOG > 0)
      console.log("Register prefix failed: Expected NFD status code 200, got: " +
                  statusCode);
    if (this.onRegisterFailed)
      this.onRegisterFailed(this.prefix);
    return;
  }

  if (LOG > 2)
    console.log("Register prefix succeeded with the NFD forwarder for prefix " +
                this.prefix.toUri());
};

/**
 * We timed out waiting for the response.
 */
Face.RegisterResponse.prototype.onTimeout = function(interest)
{
  if (LOG > 2)
    console.log("Timeout for NFD register prefix command.");
  if (this.onRegisterFailed)
    this.onRegisterFailed(this.prefix);
};

/**
 * Do the work of registerPrefix to register with NFD.
 * @param {number} registeredPrefixId The Face.getNextEntryId() which
 * registerPrefix got so it could return it to the caller. If this is 0, then
 * don't add to registeredPrefixTable (assuming it has already been done).
 * @param {Name} prefix
 * @param {function} onInterest
 * @param {ForwardingFlags} flags
 * @param {function} onRegisterFailed
 * @param {KeyChain} commandKeyChain
 * @param {Name} commandCertificateName
 */
Face.prototype.nfdRegisterPrefix = function
  (registeredPrefixId, prefix, onInterest, flags, onRegisterFailed, commandKeyChain,
   commandCertificateName)
{
  var removeRequestIndex = -1;
  if (removeRequestIndex != null)
    removeRequestIndex = this.registeredPrefixRemoveRequests.indexOf
      (registeredPrefixId);
  if (removeRequestIndex >= 0) {
    // removeRegisteredPrefix was called with the registeredPrefixId returned by
    //   registerPrefix before we got here, so don't add a registeredPrefixTable
    //   entry.
    this.registeredPrefixRemoveRequests.splice(removeRequestIndex, 1);
    return;
  }

  if (commandKeyChain == null)
      throw new Error
        ("registerPrefix: The command KeyChain has not been set. You must call setCommandSigningInfo.");
  if (commandCertificateName.size() == 0)
      throw new Error
        ("registerPrefix: The command certificate name has not been set. You must call setCommandSigningInfo.");

  var controlParameters = new ControlParameters();
  controlParameters.setName(prefix);
  controlParameters.setForwardingFlags(flags);

  // Make the callback for this.isLocal().
  var thisFace = this;
  var onIsLocalResult = function(isLocal) {
    var commandInterest = new Interest();
    if (isLocal) {
      commandInterest.setName(new Name("/localhost/nfd/rib/register"));
      // The interest is answered by the local host, so set a short timeout.
      commandInterest.setInterestLifetimeMilliseconds(2000.0);
    }
    else {
      commandInterest.setName(new Name("/localhop/nfd/rib/register"));
      // The host is remote, so set a longer timeout.
      commandInterest.setInterestLifetimeMilliseconds(4000.0);
    }
    // NFD only accepts TlvWireFormat packets.
    commandInterest.getName().append
      (controlParameters.wireEncode(TlvWireFormat.get()));
    thisFace.nodeMakeCommandInterest
      (commandInterest, commandKeyChain, commandCertificateName,
       TlvWireFormat.get(), function() {
      if (registeredPrefixId != 0) {
        var interestFilterId = 0;
        if (onInterest != null)
          // registerPrefix was called with the "combined" form that includes the
          // callback, so add an InterestFilterEntry.
          interestFilterId = thisFace.setInterestFilter
            (new InterestFilter(prefix), onInterest);

        thisFace.registeredPrefixTable.push
          (new Face.RegisteredPrefix(registeredPrefixId, prefix, interestFilterId));
      }

      // Send the registration interest.
      var response = new Face.RegisterResponse
         (thisFace, prefix, onInterest, onRegisterFailed, flags,
          TlvWireFormat.get());
      thisFace.reconnectAndExpressInterest
        (null, commandInterest, response.onData.bind(response),
         response.onTimeout.bind(response));
    });
  };

  this.isLocal
    (onIsLocalResult,
     function(message) {
       if (LOG > 0)
         console.log("Error in Transport.isLocal: " + message);
       if (onRegisterFailed)
         onRegisterFailed(prefix);
     });
};

/**
 * Remove the registered prefix entry with the registeredPrefixId from the
 * registered prefix table. This does not affect another registered prefix with
 * a different registeredPrefixId, even if it has the same prefix name. If an
 * interest filter was automatically created by registerPrefix, also remove it.
 * If there is no entry with the registeredPrefixId, do nothing.
 *
 * @param {number} registeredPrefixId The ID returned from registerPrefix.
 */
Face.prototype.removeRegisteredPrefix = function(registeredPrefixId)
{
  // Go backwards through the list so we can erase entries.
  // Remove all entries even though registeredPrefixId should be unique.
  var count = 0;
  for (var i = this.registeredPrefixTable.length - 1; i >= 0; --i) {
    var entry = this.registeredPrefixTable[i];
    if (entry.getRegisteredPrefixId() == registeredPrefixId) {
      ++count;

      if (entry.getRelatedInterestFilterId() > 0)
        // Remove the related interest filter.
        this.unsetInterestFilter(entry.getRelatedInterestFilterId());

      this.registeredPrefixTable.splice(i, 1);
    }
  }

  if (count == 0)
    if (LOG > 0) console.log
      ("removeRegisteredPrefix: Didn't find registeredPrefixId " + registeredPrefixId);

  if (count == 0) {
    // The registeredPrefixId was not found. Perhaps this has been called before
    //   the callback in registerPrefix can add to the registeredPrefixTable. Add
    //   this removal request which will be checked before adding to the
    //   registeredPrefixTable.
    if (this.registeredPrefixRemoveRequests.indexOf(registeredPrefixId) < 0)
      // Not already requested, so add the request.
      this.registeredPrefixRemoveRequests.push(registeredPrefixId);
  }
};

/**
 * Add an entry to the local interest filter table to call the onInterest
 * callback for a matching incoming Interest. This method only modifies the
 * library's local callback table and does not register the prefix with the
 * forwarder. It will always succeed. To register a prefix with the forwarder,
 * use registerPrefix. There are two forms of setInterestFilter.
 * The first form uses the exact given InterestFilter:
 * setInterestFilter(filter, onInterest).
 * The second form creates an InterestFilter from the given prefix Name:
 * setInterestFilter(prefix, onInterest).
 * @param {InterestFilter} filter The InterestFilter with a prefix and optional
 * regex filter used to match the name of an incoming Interest. This makes a
 * copy of filter.
 * @param {Name} prefix The Name prefix used to match the name of an incoming
 * Interest.
 * @param {function} onInterest When an Interest is received which matches the
 * filter, this calls onInterest(prefix, interest, face, interestFilterId, filter).
 */
Face.prototype.setInterestFilter = function(filterOrPrefix, onInterest)
{
  var filter;
  if (typeof filterOrPrefix === 'object' && filterOrPrefix instanceof InterestFilter)
    filter = filterOrPrefix;
  else
    // Assume it is a prefix Name.
    filter = new InterestFilter(filterOrPrefix);

  var interestFilterId = this.getNextEntryId();

  this.interestFilterTable.push(new Face.InterestFilterEntry
    (interestFilterId, filter, onInterest));

  return interestFilterId;
};

/**
 * Remove the interest filter entry which has the interestFilterId from the
 * interest filter table. This does not affect another interest filter with a
 * different interestFilterId, even if it has the same prefix name. If there is
 * no entry with the interestFilterId, do nothing.
 * @param {number} interestFilterId The ID returned from setInterestFilter.
 */
Face.prototype.unsetInterestFilter = function(interestFilterId)
{
  // Go backwards through the list so we can erase entries.
  // Remove all entries even though interestFilterId should be unique.
  var count = 0;
  for (var i = this.interestFilterTable.length - 1; i >= 0; --i) {
    if (this.interestFilterTable[i].getInterestFilterId() == interestFilterId) {
      ++count;

      this.interestFilterTable.splice(i, 1);
    }
  }

  if (count == 0)
    if (LOG > 0) console.log
      ("unsetInterestFilter: Didn't find interestFilterId " + interestFilterId);
};

/**
 * The OnInterest callback calls this to put a Data packet which satisfies an
 * Interest.
 * @param {Data} data The Data packet which satisfies the interest.
 * @param {WireFormat} wireFormat (optional) A WireFormat object used to encode
 * the Data packet. If omitted, use WireFormat.getDefaultWireFormat().
 * @throws Error If the encoded Data packet size exceeds getMaxNdnPacketSize().
 */
Face.prototype.putData = function(data, wireFormat)
{
  wireFormat = (wireFormat || WireFormat.getDefaultWireFormat());

  var encoding = data.wireEncode(wireFormat);
  if (encoding.size() > Face.getMaxNdnPacketSize())
    throw new Error
      ("The encoded Data packet size exceeds the maximum limit getMaxNdnPacketSize()");

  this.transport.send(encoding.buf());
};

/**
 * Send the encoded packet out through the transport.
 * @param {Buffer} encoding The Buffer with the encoded packet to send.
 * @throws Error If the encoded packet size exceeds getMaxNdnPacketSize().
 */
Face.prototype.send = function(encoding)
{
  if (encoding.length > Face.getMaxNdnPacketSize())
    throw new Error
      ("The encoded packet size exceeds the maximum limit getMaxNdnPacketSize()");

  this.transport.send(encoding);
};

/**
 * Check if the face is local based on the current connection through the
 * Transport; some Transport may cause network I/O (e.g. an IP host name lookup).
 * @param {function} onResult On success, this calls onResult(isLocal) where
 * isLocal is true if the host is local, false if not. We use callbacks because
 * this may need to do network I/O (e.g. an IP host name lookup).
 * @param {function} onError On failure for DNS lookup or other error, this
 * calls onError(message) where message is an error string.
 */
Face.prototype.isLocal = function(onResult, onError)
{
  // TODO: How to call transport.isLocal when this.connectionInfo is null? (This
  // happens when the application does not supply a host but relies on the
  // getConnectionInfo function to select a host.) For now return true to keep
  // the same behavior from before we added Transport.isLocal.
  if (this.connectionInfo == null)
    onResult(false);
  else
    this.transport.isLocal(this.connectionInfo, onResult, onError);
};

/**
 * This is called when an entire element is received, such as a Data or Interest.
 */
Face.prototype.onReceivedElement = function(element)
{
  if (LOG > 3) console.log('Complete element received. Length ' + element.length + '. Start decoding.');
  // First, decode as Interest or Data.
  var interest = null;
  var data = null;
  if (element[0] == Tlv.Interest || element[0] == Tlv.Data) {
    var decoder = new TlvDecoder (element);
    if (decoder.peekType(Tlv.Interest, element.length)) {
      interest = new Interest();
      interest.wireDecode(element, TlvWireFormat.get());
    }
    else if (decoder.peekType(Tlv.Data, element.length)) {
      data = new Data();
      data.wireDecode(element, TlvWireFormat.get());
    }
  }

  // Now process as Interest or Data.
  if (interest !== null) {
    if (LOG > 3) console.log('Interest packet received.');

    // Call all interest filter callbacks which match.
    for (var i = 0; i < this.interestFilterTable.length; ++i) {
      var entry = this.interestFilterTable[i];
      if (entry.getFilter().doesMatch(interest.getName())) {
        if (LOG > 3)
          console.log("Found interest filter for " + interest.getName().toUri());
        entry.getOnInterest()
          (entry.getFilter().getPrefix(), interest, this,
           entry.getInterestFilterId(), entry.getFilter());
      }
    }
  }
  else if (data !== null) {
    if (LOG > 3) console.log('Data packet received.');

    var pendingInterests = this.extractEntriesForExpressedInterest(data.getName());
    // Process each matching PIT entry (if any).
    for (var i = 0; i < pendingInterests.length; ++i) {
      var pendingInterest = pendingInterests[i];
      pendingInterest.onData(pendingInterest.interest, data);
    }
  }
};

/**
 * Assume this.getConnectionInfo is not null.  This is called when
 * this.connectionInfo is null or its host is not alive.
 * Get a connectionInfo, connect, then execute onConnected().
 */
Face.prototype.connectAndExecute = function(onConnected)
{
  var connectionInfo = this.getConnectionInfo();
  if (connectionInfo == null) {
    console.log('ERROR: No more connectionInfo from getConnectionInfo');
    this.connectionInfo = null;
    // Deprecated: Set this.host and this.port for backwards compatibility.
    this.host = null;
    this.host = null;

    return;
  }

  if (connectionInfo.equals(this.connectionInfo)) {
    console.log
      ('ERROR: The host returned by getConnectionInfo is not alive: ' +
       this.connectionInfo.toString());
    return;
  }

  this.connectionInfo = connectionInfo;
  if (LOG>0) console.log("connectAndExecute: trying host from getConnectionInfo: " +
                         this.connectionInfo.toString());
  // Deprecated: Set this.host and this.port for backwards compatibility.
  this.host = this.connectionInfo.host;
  this.host = this.connectionInfo.port;

  // Fetch any content.
  var interest = new Interest(new Name("/"));
  interest.setInterestLifetimeMilliseconds(4000);

  var thisFace = this;
  var timerID = setTimeout(function() {
    if (LOG>0) console.log("connectAndExecute: timeout waiting for host " + thisFace.host);
      // Try again.
      thisFace.connectAndExecute(onConnected);
  }, 3000);

  this.reconnectAndExpressInterest
    (null, interest,
     function(localInterest, localData) {
        // The host is alive, so cancel the timeout and continue with onConnected().
        clearTimeout(timerID);

        if (LOG>0)
          console.log("connectAndExecute: connected to host " + thisFace.host);
        onConnected();
     },
     function(localInterest) { /* Ignore timeout */ });
};

/**
 * This is called by the Transport when the connection is closed by the remote host.
 */
Face.prototype.closeByTransport = function()
{
  this.readyStatus = Face.CLOSED;
  this.onclose();
};
(function(n,t,i){"use strict";function s(n,t){return typeof t!="object"&&(t=t()),Object.keys(t).forEach(function(i){n[i]=t[i]}),n}function y(n){return{from:function(t){return n.prototype=Object.create(t.prototype),n.prototype.constructor=n,{extend:function(i){s(n.prototype,typeof i!="object"?i(t.prototype):i)}}}}}function p(n,t){return t(n)}function u(n,t){function cr(){w.on("versionchange",function(){w.close();w.on("error").fire(new g("Database version changed by other database connection."))})}function di(n){this._cfg={version:n,storesSource:null,dbschema:{},tables:{},contentUpgrade:null};this.stores({})}function lr(n,t,i,u){var e,f,s,h,l,c;if(n===0)Object.keys(st).forEach(function(n){gi(t,n,st[n].primKey,st[n].indexes)}),e=w._createTransaction(yt,ui,st),e.idbtrans=t,e.idbtrans.onerror=o(i,["populating database"]),e.on("error").subscribe(i),r.newPSD(function(){r.PSD.trans=e;try{w.on("populate").fire(e)}catch(n){u.onerror=t.onerror=function(n){n.preventDefault()};try{t.abort()}catch(f){}t.db.close();i(n)}});else{if(f=[],s=ri.filter(function(t){return t._cfg.version===n})[0],!s)throw new g("Dexie specification of currently installed DB version is missing");st=w._dbSchema=s._cfg.dbschema;h=!1;l=ri.filter(function(t){return t._cfg.version>n});l.forEach(function(n){var e=st,r=n._cfg.dbschema,u;fr(e,t);fr(r,t);st=w._dbSchema=r;u=ar(e,r);u.add.forEach(function(n){f.push(function(t,i){gi(t,n[0],n[1].primKey,n[1].indexes);i()})});u.change.forEach(function(n){if(n.recreate)throw new g("Not yet support for changing primary key");else f.push(function(t,i){var r=t.objectStore(n.name);n.add.forEach(function(n){nr(r,n)});n.change.forEach(function(n){r.deleteIndex(n.name);nr(r,n)});n.del.forEach(function(n){r.deleteIndex(n)});i()})});n._cfg.contentUpgrade&&f.push(function(t,u){var f,e;h=!0;f=w._createTransaction(yt,[].slice.call(t.db.objectStoreNames,0),r);f.idbtrans=t;e=0;f._promise=p(f._promise,function(n){return function(t,i,r){function f(n){return function(){n.apply(this,arguments);--e==0&&u()}}return++e,n.call(this,t,function(n,t){arguments[0]=f(n);arguments[1]=f(t);i.apply(this,arguments)},r)}});t.onerror=o(i,["running upgrader function for version",n._cfg.version]);f.on("error").subscribe(i);n._cfg.contentUpgrade(f);e===0&&u()});h&&dr()||f.push(function(n,t){yr(r,n);t()})});c=function(){try{f.length?f.shift()(t,c):vr(st,t)}catch(n){u.onerror=t.onerror=function(n){n.preventDefault()};try{t.abort()}catch(r){}t.db.close();i(n)}};c()}}function ar(n,t){var f={del:[],add:[],change:[]},r,e,o,i,c,s,u,l,h;for(r in n)t[r]||f.del.push(r);for(r in t)if(e=n[r],o=t[r],e)if(i={name:r,def:t[r],recreate:!1,del:[],add:[],change:[]},e.primKey.src!==o.primKey.src)i.recreate=!0,f.change.push(i);else{c=e.indexes.reduce(function(n,t){return n[t.name]=t,n},{});s=o.indexes.reduce(function(n,t){return n[t.name]=t,n},{});for(u in c)s[u]||i.del.push(u);for(u in s)l=c[u],h=s[u],l?l.src!==h.src&&i.change.push(h):i.add.push(h);(i.recreate||i.del.length>0||i.add.length>0||i.change.length>0)&&f.change.push(i)}else f.add.push([r,o]);return f}function gi(n,t,i,r){var u=n.db.createObjectStore(t,i.keyPath?{keyPath:i.keyPath,autoIncrement:i.auto}:{autoIncrement:i.auto});return r.forEach(function(n){nr(u,n)}),u}function vr(n,t){Object.keys(n).forEach(function(i){t.db.objectStoreNames.contains(i)||gi(t,i,n[i].primKey,n[i].indexes)})}function yr(n,t){for(var u,r=0;r<t.db.objectStoreNames.length;++r)u=t.db.objectStoreNames[r],(n[u]===null||n[u]===i)&&t.db.deleteObjectStore(u)}function nr(n,t){n.createIndex(t.name,t.keyPath,{unique:t.unique,multiEntry:t.multi})}function pr(n,t){throw new g("Table "+t[0]+" not part of transaction. Original Scope Function Source: "+u.Promise.PSD.trans.scopeFunc.toString());}function ei(n,t,i,r){this.name=n;this.schema=i;this.hook=ni[n]?ni[n].hook:v(null,{creating:[at,f],reading:[lt,nt],updating:[vt,f],deleting:[wt,f]});this._tpf=t;this._collClass=r||li}function tr(n,t,i,r){ei.call(this,n,t,i,r||rr)}function ir(n,t,i,r){function o(n,t,i,r){return s._promise(n,i,r)}var s=this,f,u,e;for(this.db=w,this.mode=n,this.storeNames=t,this.idbtrans=null,this.on=v(this,["complete","error"],"abort"),this._reculock=0,this._blockedFuncs=[],this._psd=null,this.active=!0,this._dbschema=i,r&&(this.parent=r),this._tpf=o,this.tables=Object.create(ki),f=t.length-1;f!==-1;--f)u=t[f],e=w._tableFactory(n,i[u],o),this.tables[u]=e,this[u]||(this[u]=e)}function ci(n,t,i){this._ctx={table:n,index:t===":id"?null:t,collClass:n._collClass,or:i}}function li(n,t){var r=null,u=null,i;if(t)try{r=t()}catch(f){u=f}i=n._ctx;this._ctx={table:i.table,index:i.index,isPrimKey:!i.index||i.table.schema.primKey.keyPath&&i.index===i.table.schema.primKey.name,range:r,op:"openCursor",dir:"next",unique:"",algorithm:null,filter:null,isMatch:null,offset:0,limit:Infinity,error:u,or:i.or}}function rr(){li.apply(this,arguments)}function wr(n,t){return n._cfg.version-t._cfg.version}function ur(n,t,i,u,f,e){i.forEach(function(i){var o=w._tableFactory(u,f[i],t);n.forEach(function(n){n[i]||(e?Object.defineProperty(n,i,{configurable:!0,enumerable:!0,get:function(){var n=r.PSD&&r.PSD.trans;return n&&n.db===w?n.tables[i]:o}}):n[i]=o)})})}function br(n){n.forEach(function(n){for(var t in n)n[t]instanceof ei&&delete n[t]})}function pi(n,t,i,u,f,e){var s=r.PSD;e=e||nt;n.onerror||(n.onerror=o(f));n.onsuccess=t?k(function(){var r=n.result,o;r?(o=function(){r.continue()},t(r,function(n){o=n},u,f)&&i(e(r.value),r,function(n){o=n}),o()):u()},f,s):k(function(){var t=n.result,r;t?(r=function(){t.continue()},i(e(t.value),t,function(n){r=n}),r()):u()},f,s)}function kr(n){var t=[];return n.split(",").forEach(function(n){n=n.trim();var i=n.replace("&","").replace("++","").replace("*",""),r=i.indexOf("[")!==0?i:n.substring(n.indexOf("[")+1,n.indexOf("]")).split("+");t.push(new a(i,r||null,n.indexOf("&")!==-1,n.indexOf("*")!==-1,n.indexOf("++")!==-1,Array.isArray(r),r.indexOf(".")!==-1))}),t}function wi(n,t){return n<t?-1:n>t?1:0}function or(n,t){return n<t?1:n>t?-1:0}function sr(n){return function(t,i){for(var r=0,u;;){if(u=n(t[r],i[r]),u!==0)return u;if(++r,r===t.length||r===i.length)return n(t.length,i.length)}}}function bi(n,t){return n?t?function(){return n.apply(this,arguments)&&t.apply(this,arguments)}:n:t}function dr(){return navigator.userAgent.indexOf("Trident")>=0||navigator.userAgent.indexOf("MSIE")>=0}function gr(){if(w.verno=et.version/10,w._dbSchema=st={},ui=[].slice.call(et.objectStoreNames,0),ui.length!==0){var n=et.transaction(ft(ui),"readonly");ui.forEach(function(t){for(var u,s,r=n.objectStore(t),i=r.keyPath,f=i&&typeof i=="string"&&i.indexOf(".")!==-1,h=new a(i,i||"",!1,!1,!!r.autoIncrement,i&&typeof i!="string",f),o=[],e=0;e<r.indexNames.length;++e)u=r.index(r.indexNames[e]),i=u.keyPath,f=i&&typeof i=="string"&&i.indexOf(".")!==-1,s=new a(u.name,i,!!u.unique,!!u.multiEntry,!1,i&&typeof i!="string",f),o.push(s);st[t]=new ut(t,h,o,{})});ur([ni],w._transPromiseFactory,Object.keys(st),yt,st)}}function fr(n,t){for(var i,r,u,o,s=t.db.objectStoreNames,f=0;f<s.length;++f)for(i=s[f],r=t.objectStore(i),u=0;u<r.indexNames.length;++u){var h=r.indexNames[u],e=r.index(h).keyPath,c=typeof e=="string"?e:"["+[].slice.call(e).join("+")+"]";n[i]&&(o=n[i].idxByName[c],o&&(o.name=h))}}var hr=t&&t.addons||u.addons,oi=u.dependencies,ai=oi.indexedDB,kt=oi.IDBKeyRange,nu=oi.IDBTransaction,tu=oi.DOMError,yi=oi.TypeError,g=oi.Error,st=this._dbSchema={},ri=[],ui=[],ni={},ki={},et=null,si=!0,fi=null,vi=!1,ti="readonly",yt="readwrite",w=this,ii=[],hi=!1,er=!!ct();this.version=function(n){if(et)throw new g("Cannot add version when database is open");this.verno=Math.max(this.verno,n);var t=ri.filter(function(t){return t._cfg.version===n})[0];return t?t:(t=new di(n),ri.push(t),ri.sort(wr),t)};s(di.prototype,{stores:function(n){var i,t;return this._cfg.storesSource=this._cfg.storesSource?s(this._cfg.storesSource,n):n,i={},ri.forEach(function(n){s(i,n._cfg.storesSource)}),t=this._cfg.dbschema={},this._parseStoresSpec(i,t),st=w._dbSchema=t,br([ni,w,ki]),ur([ki],pr,Object.keys(t),yt,t),ur([ni,w,this._cfg.tables],w._transPromiseFactory,Object.keys(t),yt,t,!0),ui=Object.keys(t),this},upgrade:function(n){var t=this;return e(function(){n(w._createTransaction(yt,Object.keys(t._cfg.dbschema),t._cfg.dbschema))}),this._cfg.contentUpgrade=n,this},_parseStoresSpec:function(n,t){Object.keys(n).forEach(function(i){if(n[i]!==null){var u={},f=kr(n[i]),r=f.shift();if(r.multi)throw new g("Primary key cannot be multi-valued");r.keyPath&&r.auto&&h(u,r.keyPath,0);f.forEach(function(n){if(n.auto)throw new g("Only primary key can be marked as autoIncrement (++)");if(!n.keyPath)throw new g("Index must have a name and cannot be an empty string");h(u,n.keyPath,n.compound?n.keyPath.map(function(){return""}):"")});t[i]=new ut(i,r,f,u)}})}});this._allTables=ni;this._tableFactory=function(n,t,i){return n===ti?new ei(t.name,i,t,li):new tr(t.name,i,t)};this._createTransaction=function(n,t,i,r){return new ir(n,t,i,r)};this._transPromiseFactory=function(n,t,i){var f,u;return!si||r.PSD&&r.PSD.letThrough?(u=w._createTransaction(n,t,st),u._promise(n,function(n,t){u.error(function(n){w.on("error").fire(n)});i(function(t){u.complete(function(){n(t)})},t,u)})):f=new r(function(r,u){ii.push({resume:function(){var e=w._transPromiseFactory(n,t,i);f.onuncatched=e.onuncatched;e.then(r,u)}})})};this._whenReady=function(n){return si&&(!r.PSD||!r.PSD.letThrough)?new r(function(t,i){e(function(){new r(function(){n(t,i)})});ii.push({resume:function(){n(t,i)}})}):new r(n)};this.verno=0;this.open=function(){return new r(function(t,i){function f(n){try{u.transaction.abort()}catch(t){}vi=!1;fi=n;si=!1;i(fi);ii.forEach(function(n){n.resume()});ii=[]}if(et||vi)throw new g("Database already opened or being opened");var u,e=!1;try{if(fi=null,vi=!0,ri.length===0&&(hi=!0),!ai)throw new g("indexedDB API not found. If using IE10+, make sure to run your code on a server URL (not locally). If using Safari, make sure to include indexedDB polyfill.");u=hi?ai.open(n):ai.open(n,Math.round(w.verno*10));u.onerror=o(f,["opening database",n]);u.onblocked=function(n){w.on("blocked").fire(n)};u.onupgradeneeded=k(function(t){var i,r;hi&&!w._allowEmptyDB?(u.onerror=function(n){n.preventDefault()},u.transaction.abort(),u.result.close(),i=ai.deleteDatabase(n),i.onsuccess=i.onerror=function(){f(new g("Database '"+n+"' doesnt exist"))}):(t.oldVersion===0&&(e=!0),u.transaction.onerror=o(f),r=t.oldVersion>Math.pow(2,62)?0:t.oldVersion,lr(r/10,u.transaction,f,u))},f);u.onsuccess=k(function(){vi=!1;et=u.result;hi?gr():et.objectStoreNames.length>0&&fr(st,et.transaction(ft(et.objectStoreNames),ti));et.onversionchange=w.on("versionchange").fire;er||rt(function(t){if(t.indexOf(n)===-1)return t.push(n)});r.newPSD(function(){function i(){si=!1;ii.forEach(function(n){n.resume()});ii=[];t()}r.PSD.letThrough=!0;try{var n=w.on.ready.fire();n&&typeof n.then=="function"?n.then(i,function(n){et.close();et=null;f(n)}):b(i)}catch(u){f(u)}})},f)}catch(s){f(s)}})};this.close=function(){et&&(et.close(),et=null,si=!0,fi=null)};this.delete=function(){var t=arguments;return new r(function(i,r){function u(){w.close();var t=ai.deleteDatabase(n);t.onsuccess=function(){er||rt(function(t){var i=t.indexOf(n);if(i>=0)return t.splice(i,1)});i()};t.onerror=o(r,["deleting",n]);t.onblocked=function(){w.on("blocked").fire()}}if(t.length>0)throw new g("Arguments not allowed in db.delete()");vi?ii.push({resume:u}):u()})};this.backendDB=function(){return et};this.isOpen=function(){return et!==null};this.hasFailed=function(){return fi!==null};this.dynamicallyOpened=function(){return hi};this.name=n;Object.defineProperty(this,"tables",{get:function(){return Object.keys(ni).map(function(n){return ni[n]})}});this.on=v(this,"error","populate","blocked",{ready:[bt,f],versionchange:[pt,f]});this.on.ready.subscribe=p(this.on.ready.subscribe,function(n){return function(t,i){function r(){return i||w.on.ready.unsubscribe(r),t.apply(this,arguments)}n.call(this,r);w.isOpen()&&(si?ii.push({resume:r}):r())}});e(function(){w.on("populate").fire(w._createTransaction(yt,ui,st));w.on("error").fire(new g)});this.transaction=function(n,t,i){function s(t,e){var s=null,c,a,h;try{if(f)throw f;s=w._createTransaction(n,o,st,u);c=o.map(function(n){return s.tables[n]});c.push(s);h=0;r.newPSD(function(){r.PSD.trans=s;s.scopeFunc=i;u&&(s.idbtrans=u.idbtrans,s._promise=p(s._promise,function(n){return function(t,i,u){function f(n){return function(t){var i;return r._rootExec(function(){i=n(t);r._tickFinalize(function(){--h==0&&s.active&&(s.active=!1,s.on.complete.fire())})}),i}}return++h,n.call(this,t,function(n,t,r){return i(f(n),f(t),r)},u)}}));s.complete(function(){t(a)});s.error(function(n){s.idbtrans&&(s.idbtrans.onerror=ht);try{s.abort()}catch(i){}u&&(u.active=!1,u.on.error.fire(n));var t=e(n);u||t||w.on.error.fire(n)});r._rootExec(function(){a=i.apply(s,c)})});(!s.idbtrans||u&&h===0)&&s._nop()}catch(l){s&&s.idbtrans&&(s.idbtrans.onerror=ht);s&&s.abort();u&&u.on.error.fire(l);b(function(){e(l)||w.on("error").fire(l)})}}var u,e;t=[].slice.call(arguments,1,arguments.length-1);i=arguments[arguments.length-1];u=r.PSD&&r.PSD.trans;u&&u.db===w&&n.indexOf("!")===-1||(u=null);e=n.indexOf("?")!==-1;n=n.replace("!","").replace("?","");var h=Array.isArray(t[0])?t.reduce(function(n,t){return n.concat(t)}):t,f=null,o=h.map(function(n){return typeof n=="string"?n:(n instanceof ei||(f=f||new yi("Invalid type. Arguments following mode must be instances of Table or String")),n.name)});return n=="r"||n==ti?n=ti:n=="rw"||n==yt?n=yt:f=new g("Invalid transaction mode: "+n),u&&(f||(u&&u.mode===ti&&n===yt&&(e?u=null:f=f||new g("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY")),u&&o.forEach(function(n){u.tables.hasOwnProperty(n)||(e?u=null:f=f||new g("Table "+n+" not included in parent transaction. Parent Transaction function: "+u.scopeFunc.toString()))}))),u?u._promise(n,s,"lock"):w._whenReady(s)};this.table=function(n){if(!hi&&!ni.hasOwnProperty(n))throw new g("Table does not exist");return ni[n]};s(ei.prototype,function(){function n(){throw new g("Current Transaction is READONLY");}return{_trans:function(n,t,i){return this._tpf(n,[this.name],t,i)},_idbstore:function(n,t,i){var r=this;return this._tpf(n,[this.name],function(n,i,u){t(n,i,u.idbtrans.objectStore(r.name),u)},i)},get:function(n,t){var i=this;return e(function(){t(i.schema.instanceTemplate)}),this._idbstore(ti,function(t,r,u){var f=u.get(n);f.onerror=o(r,["getting",n,"from",i.name]);f.onsuccess=function(){t(i.hook.reading.fire(f.result))}}).then(t)},where:function(n){return new ci(this,n)},count:function(n){return this.toCollection().count(n)},offset:function(n){return this.toCollection().offset(n)},limit:function(n){return this.toCollection().limit(n)},reverse:function(){return this.toCollection().reverse()},filter:function(n){return this.toCollection().and(n)},each:function(n){var t=this;return e(function(){n(t.schema.instanceTemplate)}),this._idbstore(ti,function(i,r,u){var f=u.openCursor();f.onerror=o(r,["calling","Table.each()","on",t.name]);pi(f,null,n,i,r,t.hook.reading.fire)})},toArray:function(n){var t=this;return e(function(){n([t.schema.instanceTemplate])}),this._idbstore(ti,function(n,i,r){var u=[],f=r.openCursor();f.onerror=o(i,["calling","Table.toArray()","on",t.name]);pi(f,null,function(n){u.push(n)},function(){n(u)},i,t.hook.reading.fire)}).then(n)},orderBy:function(n){return new this._collClass(new ci(this,n))},toCollection:function(){return new this._collClass(new ci(this))},mapToClass:function(n,t){var i,r;return this.schema.mappedClass=n,i=Object.create(n.prototype),this.schema.primKey.keyPath&&(h(i,this.schema.primKey.keyPath,this.schema.primKey.auto?0:""),ot(n.prototype,this.schema.primKey.keyPath)),t&&it(i,t),this.schema.instanceTemplate=i,r=Object.setPrototypeOf?function(t){return t?(Object.setPrototypeOf(t,n.prototype),t):t}:function(t){var r,i;if(!t)return t;r=Object.create(n.prototype);for(i in t)t.hasOwnProperty(i)&&(r[i]=t[i]);return r},this.schema.readHook&&this.hook.reading.unsubscribe(this.schema.readHook),this.schema.readHook=r,this.hook("reading",r),n},defineClass:function(n){return this.mapToClass(u.defineClass(n),n)},add:n,put:n,"delete":n,clear:n,update:n}});y(tr).from(ei).extend(function(){return{add:function(n,t){var u=this,r=this.hook.creating.fire;return this._idbstore(yt,function(e,s,l,a){var v={},w,y,p;r!==f&&(w=t||(l.keyPath?c(n,l.keyPath):i),y=r.call(v,w,n,a),w===i&&y!==i&&(l.keyPath?h(n,l.keyPath,y):t=y));p=t?l.add(n,t):l.add(n);p.onerror=o(function(n){if(v.onerror)v.onerror(n);return s(n)},["adding",n,"into",u.name]);p.onsuccess=function(t){var i=l.keyPath;if(i&&h(n,i,t.target.result),v.onsuccess)v.onsuccess(t.target.result);e(p.result)}})},put:function(n,t){var r=this,u=this.hook.creating.fire,e=this.hook.updating.fire;return u!==f||e!==f?this._trans(yt,function(u,f,e){var o=t||r.schema.primKey.keyPath&&c(n,r.schema.primKey.keyPath);o===i?e.tables[r.name].add(n).then(u,f):(e._lock(),n=l(n),e.tables[r.name].where(":id").equals(o).modify(function(){this.value=n}).then(function(i){return i===0?e.tables[r.name].add(n,t):o}).finally(function(){e._unlock()}).then(u,f))}):this._idbstore(yt,function(i,u,f){var e=t?f.put(n,t):f.put(n);e.onerror=o(u,["putting",n,"into",r.name]);e.onsuccess=function(t){var r=f.keyPath;r&&h(n,r,t.target.result);i(e.result)}})},"delete":function(n){return this.hook.deleting.subscribers.length?this.where(":id").equals(n).delete():this._idbstore(yt,function(t,i,r){var u=r.delete(n);u.onerror=o(i,["deleting",n,"from",r.name]);u.onsuccess=function(){t(u.result)}})},clear:function(){return this.hook.deleting.subscribers.length?this.toCollection().delete():this._idbstore(yt,function(n,t,i){var r=i.clear();r.onerror=o(t,["clearing",i.name]);r.onsuccess=function(){n(r.result)}})},update:function(n,t){if(typeof t!="object"||Array.isArray(t))throw new g("db.update(keyOrObject, modifications). modifications must be an object.");if(typeof n!="object"||Array.isArray(n))return this.where(":id").equals(n).modify(t);Object.keys(t).forEach(function(i){h(n,i,t[i])});var u=c(n,this.schema.primKey.keyPath);return u===i&&r.reject(new g("Object does not contain its primary key")),this.where(":id").equals(u).modify(t)}}});s(ir.prototype,{_lock:function(){return++this._reculock,this._reculock===1&&r.PSD&&(r.PSD.lockOwnerFor=this),this},_unlock:function(){if(--this._reculock==0)for(r.PSD&&(r.PSD.lockOwnerFor=null);this._blockedFuncs.length>0&&!this._locked();){var n=this._blockedFuncs.shift();try{n()}catch(t){}}return this},_locked:function(){return this._reculock&&(!r.PSD||r.PSD.lockOwnerFor!==this)},_nop:function(n){this.tables[this.storeNames[0]].get(0).then(n)},_promise:function(n,t,i){var f=this;return r.newPSD(function(){var e;return f._locked()?e=new r(function(r,u){f._blockedFuncs.push(function(){f._promise(n,t,i).then(r,u)})}):(e=f.active?new r(function(r,e){if(!f.idbtrans&&n){if(!et)throw fi?new g("Database not open. Following error in populate, ready or upgrade function made Dexie.open() fail: "+fi):new g("Database not open");var o=f.idbtrans=et.transaction(ft(f.storeNames),f.mode);o.onerror=function(n){f.on("error").fire(n&&n.target.error);n.preventDefault();f.abort()};o.onabort=function(n){f.active=!1;f.on("abort").fire(n)};o.oncomplete=function(n){f.active=!1;f.on("complete").fire(n)}}i&&f._lock();try{t(r,e,f)}catch(s){u.ignoreTransaction(function(){f.on("error").fire(s)});f.abort();e(s)}}):r.reject(gt(new g("Transaction is inactive. Original Scope Function Source: "+f.scopeFunc.toString()))),f.active&&i&&e.finally(function(){f._unlock()})),e.onuncatched=function(n){u.ignoreTransaction(function(){f.on("error").fire(n)});f.abort()},e})},complete:function(n){return this.on("complete",n)},error:function(n){return this.on("error",n)},abort:function(){if(this.idbtrans&&this.active)try{this.active=!1;this.idbtrans.abort();this.on.error.fire(new g("Transaction Aborted"))}catch(n){}},table:function(n){if(!this.tables.hasOwnProperty(n))throw new g("Table "+n+" not in transaction");return this.tables[n]}});s(ci.prototype,function(){function n(n,t){try{throw t;}catch(i){n._ctx.error=i}return n}function i(n){return Array.prototype.slice.call(n.length===1&&Array.isArray(n[0])?n[0]:n)}function r(n){return n==="next"?function(n){return n.toUpperCase()}:function(n){return n.toLowerCase()}}function u(n){return n==="next"?function(n){return n.toLowerCase()}:function(n){return n.toUpperCase()}}function f(n,t,i,r,u,f){for(var h,s=Math.min(n.length,r.length),o=-1,e=0;e<s;++e){if(h=t[e],h!==r[e])return u(n[e],i[e])<0?n.substr(0,e)+i[e]+i.substr(e+1):u(n[e],r[e])<0?n.substr(0,e)+r[e]+i.substr(e+1):o>=0?n.substr(0,o)+t[o]+i.substr(o+1):null;u(n[e],h)<0&&(o=e)}return s<r.length&&f==="next"?n+i.substr(n.length):s<n.length&&f==="prev"?n.substr(0,i.length):o<0?null:n.substr(0,o)+r[o]+i.substr(o+1)}function t(n,t,i){function a(n){s=r(n);e=u(n);h=n==="next"?wi:or;c=s(i);o=e(i);l=n}var s,e,h,c,o,l;a("next");n._ondirectionchange=function(n){a(n)};n._addAlgorithm(function(n,i,r){var u=n.key,s,a;return typeof u!="string"?!1:(s=e(u),t(s,o)?(i(function(){n.continue()}),!0):(a=f(u,s,c,o,h,l),a?i(function(){n.continue(a)}):i(r),!1))})}return{between:function(n,t,i,r){return(i=i!==!1,r=r===!0,n>t||n===t&&(i||r)&&!(i&&r))?new this._ctx.collClass(this,function(){return kt.only(n)}).limit(0):new this._ctx.collClass(this,function(){return kt.bound(n,t,!i,!r)})},equals:function(n){return new this._ctx.collClass(this,function(){return kt.only(n)})},above:function(n){return new this._ctx.collClass(this,function(){return kt.lowerBound(n,!0)})},aboveOrEqual:function(n){return new this._ctx.collClass(this,function(){return kt.lowerBound(n)})},below:function(n){return new this._ctx.collClass(this,function(){return kt.upperBound(n,!0)})},belowOrEqual:function(n){return new this._ctx.collClass(this,function(){return kt.upperBound(n)})},startsWith:function(t){return typeof t!="string"?n(new this._ctx.collClass(this),new yi("String expected")):this.between(t,t+String.fromCharCode(65535),!0,!0)},startsWithIgnoreCase:function(i){if(typeof i!="string")return n(new this._ctx.collClass(this),new yi("String expected"));if(i==="")return this.startsWith(i);var r=new this._ctx.collClass(this,function(){return kt.bound(i.toUpperCase(),i.toLowerCase()+String.fromCharCode(65535))});return t(r,function(n,t){return n.indexOf(t)===0},i),r._ondirectionchange=function(){n(r,new g("reverse() not supported with WhereClause.startsWithIgnoreCase()"))},r},equalsIgnoreCase:function(i){if(typeof i!="string")return n(new this._ctx.collClass(this),new yi("String expected"));var r=new this._ctx.collClass(this,function(){return kt.bound(i.toUpperCase(),i.toLowerCase())});return t(r,function(n,t){return n===t},i),r},anyOf:function(){var f=this._ctx,e=f.table.schema,o=f.index?e.idxByName[f.index]:e.primKey,s=o&&o.compound,n=i(arguments),t=s?sr(wi):wi,u,r;return(n.sort(t),n.length===0)?new this._ctx.collClass(this,function(){return kt.only("")}).limit(0):(u=new this._ctx.collClass(this,function(){return kt.bound(n[0],n[n.length-1])}),u._ondirectionchange=function(i){t=i==="next"?wi:or;s&&(t=sr(t));n.sort(t)},r=0,u._addAlgorithm(function(i,u,f){for(var e=i.key;t(e,n[r])>0;)if(++r,r===n.length)return u(f),!1;return t(e,n[r])===0?(u(function(){i.continue()}),!0):(u(function(){i.continue(n[r])}),!1)}),u)}}});s(li.prototype,function(){function t(n,t){n.filter=bi(n.filter,t)}function f(n,t){n.isMatch=bi(n.isMatch,t)}function r(n,t){if(n.isPrimKey)return t;var i=n.table.schema.idxByName[n.index];if(!i)throw new g("KeyPath "+n.index+" on object store "+t.name+" is not indexed");return n.isPrimKey?t:t.index(i.name)}function u(n,t){return r(n,t)[n.op](n.range||null,n.dir+n.unique)}function i(n,t,i,r,f){n.or?function(){function e(){++c==2&&i()}function h(n,i,u){if(!o||o(i,u,e,r)){var f=i.primaryKey.toString();s.hasOwnProperty(f)||(s[f]=!0,t(n,i,u))}}var o=n.filter,s={},l=n.table.schema.primKey.keyPath,c=0;n.or._iterate(h,e,r,f);pi(u(n,f),n.algorithm,h,e,r,n.table.hook.reading.fire)}():pi(u(n,f),bi(n.algorithm,n.filter),t,i,r,n.table.hook.reading.fire)}function n(n){return n.table.schema.instanceTemplate}return{_read:function(n,t){var i=this._ctx;return i.error?i.table._trans(null,function(n,t){t(i.error)}):i.table._idbstore(ti,n).then(t)},_write:function(n){var t=this._ctx;return t.error?t.table._trans(null,function(n,i){i(t.error)}):t.table._idbstore(yt,n,"locked")},_addAlgorithm:function(n){var t=this._ctx;t.algorithm=bi(t.algorithm,n)},_iterate:function(n,t,r,u){return i(this._ctx,n,t,r,u)},each:function(t){var r=this._ctx;return e(function(){t(n(r))}),this._read(function(n,u,f){i(r,t,n,u,f)})},count:function(n){var f,t,u;return e(function(){n(0)}),f=this,t=this._ctx,t.filter||t.algorithm||t.or?(u=0,this._read(function(n,r,f){i(t,function(){return++u,!1},function(){n(u)},r,f)},n)):this._read(function(n,i,u){var e=r(t,u),s=t.range?e.count(t.range):e.count();s.onerror=o(i,["calling","count()","on",f.name]);s.onsuccess=function(i){n(Math.min(i.target.result,Math.max(0,t.limit-t.offset)))}},n)},sortBy:function(t,i){function u(n,t){return t?u(n[r[t]],t-1):n[h]}function c(n,t){var i=u(n,o),r=u(t,o);return i<r?-f:i>r?f:0}var s=this._ctx,f;e(function(){i([n(s)])});var r=t.split(".").reverse(),h=r[0],o=r.length-1;return f=this._ctx.dir==="next"?1:-1,this.toArray(function(n){return n.sort(c)}).then(i)},toArray:function(t){var r=this._ctx;return e(function(){t([n(r)])}),this._read(function(n,t,u){var f=[];i(r,function(n){f.push(n)},function(){n(f)},t,u)},t)},offset:function(n){var i=this._ctx;return n<=0?this:(i.offset+=n,i.or||i.algorithm||i.filter?t(i,function(){return--n<0}):t(i,function(t,i){return n===0?!0:n===1?(--n,!1):(i(function(){t.advance(n);n=0}),!1)}),this)},limit:function(n){return this._ctx.limit=Math.min(this._ctx.limit,n),t(this._ctx,function(t,i,r){return--n<=0&&i(r),n>=0}),this},until:function(i,r){var u=this._ctx;return e(function(){i(n(u))}),t(this._ctx,function(n,t,u){return i(n.value)?(t(u),r):!0}),this},first:function(t){var i=this;return e(function(){t(n(i._ctx))}),this.limit(1).toArray(function(n){return n[0]}).then(t)},last:function(n){return this.reverse().first(n)},and:function(i){var r=this;return e(function(){i(n(r._ctx))}),t(this._ctx,function(n){return i(n.value)}),f(this._ctx,i),this},or:function(n){return new ci(this._ctx.table,n,this)},reverse:function(){return this._ctx.dir=this._ctx.dir==="prev"?"next":"prev",this._ondirectionchange&&this._ondirectionchange(this._ctx.dir),this},desc:function(){return this.reverse()},eachKey:function(t){var i=this,r=this._ctx;return e(function(){t(n(i._ctx)[i._ctx.index])}),r.isPrimKey||(r.op="openKeyCursor"),this.each(function(n,i){t(i.key,i)})},eachUniqueKey:function(n){return this._ctx.unique="unique",this.eachKey(n)},keys:function(t){var u,i,r;return e(function(){t([n(i)[u._ctx.index]])}),u=this,i=this._ctx,i.isPrimKey||(i.op="openKeyCursor"),r=[],this.each(function(n,t){r.push(t.key)}).then(function(){return r}).then(t)},uniqueKeys:function(n){return this._ctx.unique="unique",this.keys(n)},firstKey:function(n){var t=this;return this.limit(1).keys(function(n){return n[0]}).then(n)},lastKey:function(n){return this.reverse().firstKey(n)},distinct:function(){var n={};return t(this._ctx,function(t){var i=t.primaryKey.toString(),r=n.hasOwnProperty(i);return n[i]=!0,!r}),this}}});y(rr).from(li).extend({modify:function(n){var a=this,t=this._ctx,r=t.table.hook,i=r.updating.fire,u=r.deleting.fire;return e(function(){typeof n=="function"&&n.call({value:t.table.schema.instanceTemplate},t.table.schema.instanceTemplate)}),this._write(function(r,e,v,y){function st(n,i){var r,u,f;if(et=i.primaryKey,r={primKey:i.primaryKey,value:n},w.call(r,n)!==!1)u=!r.hasOwnProperty("value"),f=u?i.delete():i.update(r.value),++ut,f.onerror=o(function(n){if(p.push(n),nt.push(r.primKey),r.onerror)r.onerror(n);return it(),!0},u?["deleting",n,"from",t.table.name]:["modifying",n,"on",t.table.name]),f.onsuccess=function(){if(r.onsuccess)r.onsuccess(r.value);++b;it()};else if(r.onsuccess)r.onsuccess(r.value)}function ot(n){return n&&(p.push(n),nt.push(et)),e(new d("Error modifying one or more objects",p,b,nt))}function it(){ft&&b+p.length===ut&&(p.length>0?ot():r(b))}var w,k,rt,g;typeof n=="function"?w=i===f&&u===f?n:function(t){var f=l(t),e,r;if(n.call(this,t)===!1)return!1;this.hasOwnProperty("value")?(e=dt(f,this.value),r=i.call(this,e,this.primKey,f,y),r&&(t=this.value,Object.keys(r).forEach(function(n){h(t,n,r[n])}))):u.call(this,this.primKey,t,y)}:i===f?(k=Object.keys(n),rt=k.length,w=function(t){for(var i,u,f=!1,r=0;r<rt;++r)i=k[r],u=n[i],c(t,i)!==u&&(h(t,i,u),f=!0);return f}):(g=n,n=tt(g),w=function(t){var u=!1,r=i.call(this,n,this.primKey,l(t),y);return r&&s(n,r),Object.keys(n).forEach(function(i){var r=n[i];c(t,i)!==r&&(h(t,i,r),u=!0)}),r&&(n=tt(g)),u});var ut=0,b=0,ft=!1,p=[],nt=[],et=null;a._iterate(st,function(){ft=!0;it()},ot,v)})},"delete":function(){return this.modify(function(){delete this.value})}});s(this,{Collection:li,Table:ei,Transaction:ir,Version:di,WhereClause:ci,WriteableCollection:rr,WriteableTable:tr});cr();hr.forEach(function(n){n(w)})}function f(){}function nt(n){return n}function lt(n,t){return n===nt?t:function(i){return t(n(i))}}function w(n,t){return function(){n.apply(this,arguments);t.apply(this,arguments)}}function at(n,t){return n===f?t:function(){var f=n.apply(this,arguments),r,u,e;return f!==i&&(arguments[0]=f),r=this.onsuccess,u=this.onerror,delete this.onsuccess,delete this.onerror,e=t.apply(this,arguments),r&&(this.onsuccess=this.onsuccess?w(r,this.onsuccess):r),u&&(this.onerror=this.onerror?w(u,this.onerror):u),e!==i?e:f}}function vt(n,t){return n===f?t:function(){var r=n.apply(this,arguments),f,e,u;return r!==i&&s(arguments[0],r),f=this.onsuccess,e=this.onerror,delete this.onsuccess,delete this.onerror,u=t.apply(this,arguments),f&&(this.onsuccess=this.onsuccess?w(f,this.onsuccess):f),e&&(this.onerror=this.onerror?w(e,this.onerror):e),r===i?u===i?i:u:u===i?r:s(r,u)}}function yt(n,t){return n===f?t:function(){return n.apply(this,arguments)===!1?!1:t.apply(this,arguments)}}function pt(n,t){return n===f?t:function(){return t.apply(this,arguments)===!1?!1:n.apply(this,arguments)}}function wt(n,t){return n===f?t:function(){n.apply(this,arguments);t.apply(this,arguments)}}function bt(n,t){return n===f?t:function(){var i=n.apply(this,arguments),r,u;return i&&typeof i.then=="function"?(r=this,u=arguments,i.then(function(){return t.apply(r,u)})):t.apply(this,arguments)}}function v(t){function i(n,t,i){if(Array.isArray(n))return c(n);if(typeof n=="object")return h(n);t||(t=yt);i||(i=f);var r={subscribers:[],fire:i,subscribe:function(n){r.subscribers.push(n);r.fire=t(r.fire,n)},unsubscribe:function(n){r.subscribers=r.subscribers.filter(function(t){return t!==n});r.fire=r.subscribers.reduce(t,i)}};return u[n]=e[n]=r,r}function h(t){Object.keys(t).forEach(function(r){var f=t[r],u;if(Array.isArray(f))i(r,t[r][0],t[r][1]);else if(f==="asap")u=i(r,null,function(){var t=arguments;u.subscribers.forEach(function(i){b(function(){i.apply(n,t)})})}),u.subscribe=function(n){u.subscribers.indexOf(n)===-1&&u.subscribers.push(n)},u.unsubscribe=function(n){var t=u.subscribers.indexOf(n);t!==-1&&u.subscribers.splice(t,1)};else throw new Error("Invalid event config");})}function c(n){function r(){if(t)return!1;t=!0}var t=!1;n.forEach(function(n){i(n).subscribe(r)})}var o=arguments,u={},e=function(n,i){if(i){var f=[].slice.call(arguments,1),r=u[n];return r.subscribe.apply(r,f),t}if(typeof n=="string")return u[n]},r,s;for(e.addEventType=i,r=1,s=o.length;r<s;++r)i(o[r]);return e}function kt(n){if(!n)throw new Error("Assertion failed");}function b(t){n.setImmediate?setImmediate(t):setTimeout(t,0)}function et(n){var t=setTimeout(n,1e3);clearTimeout(t)}function k(n,t,i){return function(){var u=r.PSD;r.PSD=i;try{n.apply(this,arguments)}catch(f){t(f)}finally{r.PSD=u}}}function c(n,t){var f,r,o,s,u,e;if(n.hasOwnProperty(t))return n[t];if(!t)return n;if(typeof t!="string"){for(f=[],r=0,o=t.length;r<o;++r)s=c(n,t[r]),f.push(s);return f}return(u=t.indexOf("."),u!==-1)?(e=n[t.substr(0,u)],e===i?i:c(e,t.substr(u+1))):i}function h(n,t,r){var u,c,e,f,s,o;if(n&&t!==i)if(typeof t!="string"&&"length"in t)for(kt(typeof r!="string"&&"length"in r),u=0,c=t.length;u<c;++u)h(n,t[u],r[u]);else e=t.indexOf("."),e!==-1?(f=t.substr(0,e),s=t.substr(e+1),s===""?r===i?delete n[f]:n[f]=r:(o=n[f],o||(o=n[f]={}),h(o,s,r))):r===i?delete n[t]:n[t]=r}function ot(n,t){h(n,t,i)}function tt(n){var i={};for(var t in n)n.hasOwnProperty(t)&&(i[t]=n[t]);return i}function l(n){var t,i,u,r;if(!n||typeof n!="object")return n;if(Array.isArray(n))for(t=[],i=0,u=n.length;i<u;++i)t.push(l(n[i]));else if(n instanceof Date)t=new Date,t.setTime(n.getTime());else{t=n.constructor?Object.create(n.constructor.prototype):{};for(r in n)n.hasOwnProperty(r)&&(t[r]=l(n[r]))}return t}function dt(n,t){var u={};for(var r in n)n.hasOwnProperty(r)&&(t.hasOwnProperty(r)?n[r]!==t[r]&&JSON.stringify(n[r])!=JSON.stringify(t[r])&&(u[r]=t[r]):u[r]=i);for(r in t)t.hasOwnProperty(r)&&!n.hasOwnProperty(r)&&(u[r]=t[r]);return u}function st(n){if(typeof n=="function")return new n;if(Array.isArray(n))return[st(n[0])];if(n&&typeof n=="object"){var t={};return it(t,n),t}return n}function it(n,t){Object.keys(t).forEach(function(i){var r=st(t[i]);n[i]=r})}function o(n,t){return function(i){var r=i&&i.target.error||new Error,u;return t&&(u=" occurred when "+t.map(function(n){switch(typeof n){case"function":return n();case"string":return n;default:return JSON.stringify(n)}}).join(" "),r.name?r.toString=function(){return r.name+u+(r.message?". "+r.message:"")}:r=r+u),n(r),i&&(i.stopPropagation&&i.stopPropagation(),i.preventDefault&&i.preventDefault()),!1}}function gt(n){try{throw n;}catch(t){return t}}function ht(n){n.preventDefault()}function rt(n){var t,i=u.dependencies.localStorage;if(!i)return n([]);try{t=JSON.parse(i.getItem("Dexie.DatabaseNames")||"[]")}catch(r){t=[]}n(t)&&i.setItem("Dexie.DatabaseNames",JSON.stringify(t))}function a(n,t,i,r,u,f,e){this.name=n;this.keyPath=t;this.unique=i;this.multi=r;this.auto=u;this.compound=f;this.dotted=e;var o=typeof t=="string"?t:t&&"["+[].join.call(t,"+")+"]";this.src=(i?"&":"")+(r?"*":"")+(u?"++":"")+o}function ut(n,t,i,r){this.name=n;this.primKey=t||new a;this.indexes=i||[new a];this.instanceTemplate=r;this.mappedClass=null;this.idxByName=i.reduce(function(n,t){return n[t.name]=t,n},{})}function d(n,t,i,r){this.name="ModifyError";this.failures=t;this.failedKeys=r;this.successCount=i;this.message=t.join("\n")}function ft(n){return n.length===1?n[0]:n}function ct(){var n=u.dependencies.indexedDB,t=n&&(n.getDatabaseNames||n.webkitGetDatabaseNames);return t&&t.bind(n)}var r=function(){function y(n){u.push([n,a.call(arguments,1)])}function p(){var r=u,t,f,i;for(u=[],t=0,f=r.length;t<f;++t)i=r[t],i[0].apply(n,i[1])}function t(n){if(typeof this!="object")throw new TypeError("Promises must be constructed via new");if(typeof n!="function")throw new TypeError("not a function");this._state=null;this._value=null;this._deferreds=[];this._catched=!1;var r=this,u=!0;this._PSD=t.PSD;try{k(this,n,function(n){u?i(c,r,n):c(r,n)},function(n){return u?(i(s,r,n),!1):s(r,n)})}finally{u=!1}}function o(n,f){var s,o,l,a,b,c;if(n._state===null){n._deferreds.push(f);return}if(s=n._state?f.onFulfilled:f.onRejected,s===null)return(n._state?f.resolve:f.reject)(n._value);l=r;r=!1;i=y;try{a=t.PSD;t.PSD=n._PSD;o=s(n._value);n._state||o&&typeof o.then=="function"&&o._state===!1||w(n);f.resolve(o)}catch(v){if(b=f.reject(v),!b&&n.onuncatched)try{n.onuncatched(v)}catch(v){}}finally{if(t.PSD=a,l){do{while(u.length>0)p();if(c=e.pop(),c)try{c()}catch(v){}}while(e.length>0||u.length>0);i=h;r=!0}}}function d(n){var f=r,t;r=!1;i=y;try{n()}finally{if(f){do{while(u.length>0)p();if(t=e.pop(),t)try{t()}catch(o){}}while(e.length>0||u.length>0);i=h;r=!0}}}function w(n){n._catched=!0;n._parent&&w(n._parent)}function c(n,i){var r=t.PSD;t.PSD=n._PSD;try{if(i===n)throw new TypeError("A promise cannot be resolved with itself.");if(i&&(typeof i=="object"||typeof i=="function")&&typeof i.then=="function"){k(n,function(n,t){i.then(n,t)},function(t){c(n,t)},function(t){s(n,t)});return}n._state=!0;n._value=i;b.call(n)}catch(u){s(u)}finally{t.PSD=r}}function s(n,i){var r=t.PSD;if(t.PSD=n._PSD,n._state=!1,n._value=i,b.call(n),!n._catched)try{if(n.onuncatched)n.onuncatched(n._value);t.on.error.fire(n._value)}catch(u){}return t.PSD=r,n._catched}function b(){for(var n=0,t=this._deferreds.length;n<t;n++)o(this,this._deferreds[n]);this._deferreds=[]}function l(n,t,i,r){this.onFulfilled=typeof n=="function"?n:null;this.onRejected=typeof t=="function"?t:null;this.resolve=i;this.reject=r}function k(n,t,i,r){var u=!1;try{t(function(n){u||(u=!0,i(n))},function(t){return u?n._catched:(u=!0,r(t))})}catch(f){return u?void 0:r(f)}}var a=[].slice,h=typeof setImmediate=="undefined"?function(t){var i=arguments;setTimeout(function(){t.apply(n,a.call(i,1))},0)}:setImmediate,i=h,r=!0,u=[],e=[];return t.on=v(null,"error"),t.all=function(){var n=Array.prototype.slice.call(arguments.length===1&&Array.isArray(arguments[0])?arguments[0]:arguments);return new t(function(t,i){function f(r,e){try{if(e&&(typeof e=="object"||typeof e=="function")){var o=e.then;if(typeof o=="function"){o.call(e,function(n){f(r,n)},i);return}}n[r]=e;--u==0&&t(n)}catch(s){i(s)}}var u,r;if(n.length===0)return t([]);for(u=n.length,r=0;r<n.length;r++)f(r,n[r])})},t.prototype.then=function(n,r){var f=this,u=new t(function(t,u){f._state===null?o(f,new l(n,r,t,u)):i(o,f,new l(n,r,t,u))});return u._PSD=this._PSD,u.onuncatched=this.onuncatched,u._parent=this,u},t.prototype._then=function(n,t){o(this,new l(n,t,f,f))},t.prototype["catch"]=function(n){if(arguments.length===1)return this.then(null,n);var i=arguments[0],r=arguments[1];return typeof i=="function"?this.then(null,function(n){return n instanceof i?r(n):t.reject(n)}):this.then(null,function(n){return n&&n.name===i?r(n):t.reject(n)})},t.prototype["finally"]=function(n){return this.then(function(t){return n(),t},function(i){return n(),t.reject(i)})},t.prototype.onuncatched=null,t.resolve=function(n){var i=new t(function(){});return i._state=!0,i._value=n,i},t.reject=function(n){var i=new t(function(){});return i._state=!1,i._value=n,i},t.race=function(n){return new t(function(t,i){n.map(function(n){n.then(t,i)})})},t.PSD=null,t.newPSD=function(n){var i=t.PSD;t.PSD=i?Object.create(i):{};try{return n()}finally{t.PSD=i}},t._rootExec=d,t._tickFinalize=function(n){if(r)throw new Error("Not in a virtual tick");e.push(n)},t}(),e=function(){},g;y(d).from(Error);u.delete=function(n){var t=new u(n),i=t.delete();return i.onblocked=function(n){t.on("blocked",n);return this},i};u.getDatabaseNames=function(n){return new r(function(n,t){var r=ct(),i;r?(i=r(),i.onsuccess=function(t){n([].slice.call(t.target.result,0))},i.onerror=o(t)):rt(function(t){return n(t),!1})}).then(n)};u.defineClass=function(n){function t(n){n&&s(this,n)}return it(t.prototype,n),t};u.ignoreTransaction=function(n){return r.newPSD(function(){return r.PSD.trans=null,n()})};u.spawn=function(){return n.console&&console.warn("Dexie.spawn() is deprecated. Use Dexie.ignoreTransaction() instead."),u.ignoreTransaction.apply(this,arguments)};u.vip=function(n){return r.newPSD(function(){return r.PSD.letThrough=!0,n()})};Object.defineProperty(u,"currentTransaction",{get:function(){return r.PSD&&r.PSD.trans||null}});u.Promise=r;u.derive=y;u.extend=s;u.override=p;u.events=v;u.getByKeyPath=c;u.setByKeyPath=h;u.delByKeyPath=ot;u.shallowClone=tt;u.deepClone=l;u.addons=[];u.fakeAutoComplete=e;u.asap=b;u.ModifyError=d;u.MultiModifyError=d;u.IndexSpec=a;u.TableSchema=ut;g=n.idbModules&&n.idbModules.shimIndexedDB?n.idbModules:{};u.dependencies={indexedDB:g.shimIndexedDB||n.indexedDB||n.mozIndexedDB||n.webkitIndexedDB||n.msIndexedDB,IDBKeyRange:g.IDBKeyRange||n.IDBKeyRange||n.webkitIDBKeyRange,IDBTransaction:g.IDBTransaction||n.IDBTransaction||n.webkitIDBTransaction,Error:n.Error||String,SyntaxError:n.SyntaxError||String,TypeError:n.TypeError||String,DOMError:n.DOMError||String,localStorage:(typeof chrome!="undefined"&&chrome!==null?chrome.storage:void 0)!=null?null:n.localStorage};u.version=1.1;t("Dexie",u);et(function(){e=et})}).apply(null,typeof define=="function"&&define.amd?[self||window,function(n,t){define(n,function(){return t})}]:typeof global!="undefined"&&typeof module!="undefined"&&module.exports?[global,function(n,t){module.exports=t}]:[self||window,function(n,t){(self||window)[n]=t}]);
//# sourceMappingURL=Dexie.min.js.map
