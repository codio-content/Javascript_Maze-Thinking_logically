"use strict";

var audio = {};
(function(samplerate){
    this.SampleRate = samplerate || 44100;
    var SampleRate = this.SampleRate;

    // Do not modify parameters without changing code!
    var BitsPerSample = 16;
    var NumChannels = 1;
    var BlockAlign = NumChannels * BitsPerSample >> 3;
    var ByteRate = SampleRate * BlockAlign;

    // helper functions
    var chr = String.fromCharCode; // alias for getting converting int to char

    //////////////////////
    // Wave            ///
    //////////////////////

    var waveTag="data:audio/wav;base64,";
    // constructs a wave from sample array
    var constructWave = function(data){
        var l;
        return pack( ["RIFF",36+(l=data.length),"WAVEfmt ",16,1,NumChannels,SampleRate,
                       ByteRate,BlockAlign,BitsPerSample,"data",l,data],"s4s4224422s4s");
    };

    // creates an audio object from sample data
    this.make = function(arr){
        return new Audio(waveTag + btoa(constructWave(arrayToData(arr))))
    };

    // creates a wave file for downloading
    this.makeWaveFile = function(arr){
        dataToFile(waveTag + btoa(constructWave(arrayToData(arr))))
    };

    //////////////////////
    // General stuff   ///
    //////////////////////

    // Converts an integer to String representation
    //   a - number
    //   i - number of bytes
    var istr = function(a,i){
        var m8 = 0xff; // 8 bit mask
        return i?chr(a&m8)+istr(a>>8,i-1):"";
    };

    // Packs array of data to a string
    //   data   - array
    //   format - s is for string, numbers denote bytes to store in
    var pack = function(data,format){
        var out="";
        for(i=0;i<data.length;i++)
            out+=format[i]=="s"?data[i]:istr(data[i],format.charCodeAt(i)-48);
        return out;
    }

    var dataToFile = function(data){
        document.location.href = data;
    }

    //////////////////////
    // Audio Processing ///
    //////////////////////

    // Utilities
    //////////////////////

    // often used variables (just for convenience)
    var count,out,i,sfreq;
    var sin = Math.sin;
    var TAU = 2*Math.PI;
    var Arr = function(c){return new Array(c|0)}; // alias for creating a new array

    var clamp8bit  = function(a){return a<0?0:255<a?255:a}
    var sample8bit = function(a){return clamp((a*127+127)|0)}

    this.toTime    = function(a){return a/SampleRate}
    this.toSamples = function(a){return a*SampleRate}

    var arrayToData16bit = function(arr){
        var out="";
        var len = arr.length;
        for( i=0 ; i < len ; i++){
            var a = (arr[i] * 32767) | 0;
            a = a < -32768 ? -32768 : 32767 < a ? 32767 : a; // clamp
            a += a < 0 ? 65536 : 0;                       // 2-s complement
            out += String.fromCharCode(a & 255, a >> 8);
        };
        return out;
    }

    var arrayToData8bit = function(arr){
        var out="";
        var len = arr.length;
        for( i=0 ; i < len ; i++){
            var a = (arr[i] * 127 + 128) | 0;
            a = a < 0 ? 0 : 255 < a ? 255 : a;
            out += String.fromCharCode(a);
        };
        return out;
    }

    var arrayToData = function(arr){
        if( BitsPerSample == 16 )
            return arrayToData16bit(arr);
        else
            return arrayToData8bit(arr);
    }

    //////////////////////
    // Processing
    //////////////////////

    // adjusts volume of a buffer
    this.adjustVolume = function(data, v){
        for(i=0;i<data.length;i++)
            data[i] *= v;
        return data;
    }

    // Filters
    //////////////////////

    this.filter = function(data,func,from,to,A,B,C,D,E,F){
        from = from ? from : 1;
        to = to ? to : data.length;
        out = data.slice(0);
        for(i=from;i<to;i++)
            out[i] = func(data, out, from,to,i,A,B,C,D,E,F)
        return out;
    };
    var filter = this.filter;

    this.filters = {
        lowpass  :
            function(data, out, from, to, pos, A){
                return out[pos-1] + A * (data[pos] - out[pos-1]);
            },
        lowpassx :
            function(data, out, from, to, pos, A){
                return out[pos-1] + A*(to - pos)/(to-from) * (data[pos] - out[pos-1]);
            },
        highpass :
            function(data, out, from, to, pos, A){
                return A * (out[pos-1] + data[pos] - data[pos-1])
            }
    };
    var filters = this.filters;

    this.f = {
        lowpass  : function(data, from, to, A){return filter(data, filters.lowpass, from, to, A);},
        lowpassx : function(data, from, to, A){return filter(data, filters.lowpassx, from, to, A);},
        highpass : function(data, from, to, A){return filter(data, filters.highpass, from, to, A);}
    }

    // Generators
    //////////////////////

    // general sound generation
    // example:
    // generate(3, 440, Math.sin);
    this.generate = function(count, freq, func, A, B, C, D, E, F){
        var sfreq=freq*TAU/SampleRate;
        var out = Arr(count);
        for(i=0; i < count;i++)
            out[i] = func(i*sfreq,A,B,C,D,E,F);
        return out;
    }

    var lastNoise = 0;

    var generate = this.generate;
    this.generators =  {
        noise  : function(phase){
                    if(phase % TAU < 4){
                        lastNoise = Math.random() * 2 - 1;
                    }
                    return lastNoise;
                },
        uninoise : Math.random,
        sine   : Math.sin,
        synth  : function(phase){return sin(phase) + .5*sin(phase/2) + .3*sin(phase/4)},
        saw    : function(phase){return 2*(phase/TAU - ((phase/TAU + 0.5)|0))},
        triangle: function(phase){return Math.abs(4 * ((phase/TAU - 0.25)%1) - 2) - 1},
        square : function(phase,A){return sin(phase) > A ? 1.0 : sin(phase) < A ? -1.0 : A}
    };
    var generators = this.generators;

    this.g = {
        noise  : function(count){ return generate(count,0, generators.noise) },
        sine   : function(count, freq){ return generate(count, freq, generators.sine) },
        synth  : function(count, freq){ return generate(count, freq, generators.synth) },
        saw    : function(count, freq){ return generate(count, freq, generators.saw) },
        triangle : function(count, freq){ return generate(count, freq, generators.triangle) },
        square : function(count, freq, A){ return generate(count, freq, generators.square, A) }
    };
}).apply(audio);

"use strict";

var jsfx = {};
(function () {
    this.Parameters = []; // will be constructed in the end

    this.Generators = {
        square : audio.generators.square,
        saw    : audio.generators.saw,
        triangle : audio.generators.triangle,
        sine   : audio.generators.sine,
        noise  : audio.generators.noise,
        synth  : audio.generators.synth
    };

    this.getGeneratorNames = function(){
        var names = [];
        for(var e in this.Generators)
            names.push(e);
        return names;
    }

    var nameToParam = function(name){
        return name.replace(/ /g, "");
    }

    this.getParameters = function () {
        var params = [];

        var grp = 0;

        // add param
        var ap = function (name, min, max, def, step) {
            if (step === undefined)
                step = (max - min) / 1000;
            var param = { name: name, id: nameToParam(name),
                          min: min, max: max, step:step, def: def,
                          type: "range", group: grp};
            params.push(param);
        };

        // add option
        var ao = function(name, options, def){
            var param = {name: name, id: nameToParam(name),
                         options: options, def: def,
                         type: "option", group: grp };
            params.push(param);
        }

        var gens = this.getGeneratorNames();
        ao("Generator", gens, gens[0]);
        ap("Super Sampling Quality", 0, 16, 0, 1);
        ap("Master Volume",  0, 1, 0.4);
        grp++;

        ap("Attack Time",    0, 1, 0.1); // seconds
        ap("Sustain Time",   0, 2, 0.3); // seconds
        ap("Sustain Punch",  0, 3, 2);
        ap("Decay Time",     0, 2, 1); // seconds
        grp++;

        ap("Min Frequency",   20, 2400, 0, 1);
        ap("Start Frequency", 20, 2400, 440, 1);
        ap("Max Frequency",   20, 2400, 2000, 1);
        ap("Slide",           -1, 1, 0);
        ap("Delta Slide",     -1, 1, 0);

        grp++;
        ap("Vibrato Depth",     0, 1, 0);
        ap("Vibrato Frequency", 0.01, 48, 8);
        ap("Vibrato Depth Slide",   -0.3, 1, 0);
        ap("Vibrato Frequency Slide", -1, 1, 0);

        grp++;
        ap("Change Amount", -1, 1, 0);
        ap("Change Speed",  0, 1, 0.1);

        grp++;
        ap("Square Duty", 0, 0.5, 0);
        ap("Square Duty Sweep", -1, 1, 0);

        grp++;
        ap("Repeat Speed", 0, 0.8, 0);

        grp++;
        ap("Phaser Offset", -1, 1, 0);
        ap("Phaser Sweep", -1, 1, 0);

        grp++;
        ap("LP Filter Cutoff", 0, 1, 1);
        ap("LP Filter Cutoff Sweep", -1, 1, 0);
        ap("LP Filter Resonance",    0, 1, 0);
        ap("HP Filter Cutoff",       0, 1, 0);
        ap("HP Filter Cutoff Sweep", -1, 1, 0);

        return params;
    };


    /**
     * Input params object has the same parameters as described above
     * except all the spaces have been removed
     *
     * This returns an array of float values of the generated audio.
     *
     * To make it into a wave use:
     *    data = jsfx.generate(params)
     *    audio.make(data)
     */
    this.generate = function(params){
        // useful consts/functions
        var TAU = 2 * Math.PI,
            sin = Math.sin,
            cos = Math.cos,
            pow = Math.pow,
            abs = Math.abs;
        var SampleRate = audio.SampleRate;

        // super sampling
        var super_sampling_quality = params.SuperSamplingQuality | 0;
        if(super_sampling_quality < 1) super_sampling_quality = 1;
        SampleRate = SampleRate * super_sampling_quality;

        // enveloping initialization
        var _ss = 1.0 + params.SustainPunch;
        var envelopes = [ {from: 0.0, to: 1.0, time: params.AttackTime},
                          {from: _ss, to: 1.0, time: params.SustainTime},
                          {from: 1.0, to: 0.0, time: params.DecayTime}];
        var envelopes_len = envelopes.length;

        // envelope sample calculation
        for(var i = 0; i < envelopes_len; i++){
            envelopes[i].samples = 1 + ((envelopes[i].time * SampleRate) | 0);
        }
        // envelope loop variables
        var envelope = undefined;
        var envelope_cur = 0.0;
        var envelope_idx = -1;
        var envelope_increment = 0.0;
        var envelope_last = -1;

        // count total samples
        var totalSamples = 0;
        for(var i = 0; i < envelopes_len; i++){
            totalSamples += envelopes[i].samples;
        }

        // fix totalSample limit
        if( totalSamples < SampleRate / 2){
            totalSamples = SampleRate / 2;
        }

        var outSamples = (totalSamples / super_sampling_quality)|0;

        // out data samples
        var out = new Array(outSamples);
        var sample = 0;
        var sample_accumulator = 0;

        // main generator
        var generator = jsfx.Generators[params.Generator];
        if (generator === undefined)
            generator = this.Generators.square;
        var generator_A = 0;
        var generator_B = 0;

        // square generator
        generator_A = params.SquareDuty;
        var square_slide = params.SquareDutySweep / SampleRate;

        // phase calculation
        var phase = 0;
        var phase_speed = params.StartFrequency * TAU / SampleRate;

        // phase slide calculation
        var phase_slide = 1.0 + pow(params.Slide, 3.0) * 64.0 / SampleRate;
        var phase_delta_slide = pow(params.DeltaSlide, 3.0) / (SampleRate * 1000);
        if (super_sampling_quality !== undefined)
            phase_delta_slide /= super_sampling_quality; // correction

        // frequency limiter
        if(params.MinFrequency > params.StartFrequency)
            params.MinFrequency = params.StartFrequency;

        if(params.MaxFrequency < params.StartFrequency)
            params.MaxFrequency = params.StartFrequency;

        var phase_min_speed = params.MinFrequency * TAU / SampleRate;
        var phase_max_speed = params.MaxFrequency * TAU / SampleRate;

        // frequency vibrato
        var vibrato_phase = 0;
        var vibrato_phase_speed = params.VibratoFrequency * TAU / SampleRate;
        var vibrato_amplitude = params.VibratoDepth;

        // frequency vibrato slide
        var vibrato_phase_slide = 1.0 + pow(params.VibratoFrequencySlide, 3.0) * 3.0 / SampleRate;
        var vibrato_amplitude_slide = params.VibratoDepthSlide / SampleRate;

        // arpeggiator
        var arpeggiator_time = 0;
        var arpeggiator_limit = params.ChangeSpeed * SampleRate;
        var arpeggiator_mod   = pow(params.ChangeAmount, 2);
        if (params.ChangeAmount > 0)
            arpeggiator_mod = 1 + arpeggiator_mod * 10;
        else
            arpeggiator_mod = 1 - arpeggiator_mod * 0.9;

        // phaser
        var phaser_max = 1024;
        var phaser_mask = 1023;
        var phaser_buffer = new Array(phaser_max);
        for(var _i = 0; _i < phaser_max; _i++)
            phaser_buffer[_i] = 0;
        var phaser_pos = 0;
        var phaser_offset = pow(params.PhaserOffset, 2.0) * (phaser_max - 4);
        var phaser_offset_slide = pow(params.PhaserSweep, 3.0) * 4000 / SampleRate;
        var phaser_enabled = (abs(phaser_offset_slide) > 0.00001) ||
                             (abs(phaser_offset) > 0.00001);

        // lowpass filter
        var filters_enabled = (params.HPFilterCutoff > 0.001) || (params.LPFilterCutoff < 0.999);

        var lowpass_pos = 0;
        var lowpass_pos_slide = 0;
        var lowpass_cutoff = pow(params.LPFilterCutoff, 3.0) / 10;
        var lowpass_cutoff_slide = 1.0 + params.HPFilterCutoffSweep / 10000;
        var lowpass_damping = 5.0 / (1.0 + pow(params.LPFilterResonance, 2) * 20 ) *
                                    (0.01 + params.LPFilterCutoff);
        if ( lowpass_damping > 0.8)
            lowpass_damping = 0.8;
        lowpass_damping = 1.0 - lowpass_damping;
        var lowpass_enabled = params.LPFilterCutoff < 0.999;

        // highpass filter
        var highpass_accumulator = 0;
        var highpass_cutoff = pow(params.HPFilterCutoff, 2.0) / 10;
        var highpass_cutoff_slide = 1.0 + params.HPFilterCutoffSweep / 10000;

        // repeat
        var repeat_time  = 0;
        var repeat_limit = totalSamples;
        if (params.RepeatSpeed > 0){
            repeat_limit = pow(1 - params.RepeatSpeed, 2.0) * SampleRate + 32;
        }

        // master volume controller
        var master_volume = params.MasterVolume;

        var k = 0;
        for(var i = 0; i < totalSamples; i++){
            // main generator
            sample = generator(phase, generator_A, generator_B);

            // square generator
            generator_A += square_slide;
            if(generator_A < 0.0){
                generator_A = 0.0;
            } else if (generator_A > 0.5){
                generator_A = 0.5;
            }

            if( repeat_time > repeat_limit ){
                // phase reset
                phase = 0;
                phase_speed = params.StartFrequency * TAU / SampleRate;
                // phase slide reset
                phase_slide = 1.0 + pow(params.Slide, 3.0) * 3.0 / SampleRate;
                phase_delta_slide = pow(params.DeltaSlide, 3.0) / (SampleRate * 1000);
                if (super_sampling_quality !== undefined)
                    phase_delta_slide /= super_sampling_quality; // correction
                // arpeggiator reset
                arpeggiator_time = 0;
                arpeggiator_limit = params.ChangeSpeed * SampleRate;
                arpeggiator_mod   = 1 + (params.ChangeAmount | 0) / 12.0;
                // repeat reset
                repeat_time = 0;
            }
            repeat_time += 1;

            // phase calculation
            phase += phase_speed;

            // phase slide calculation
            phase_slide += phase_delta_slide;
            phase_speed *= phase_slide;

            // arpeggiator
            if ( arpeggiator_time > arpeggiator_limit ){
                phase_speed *= arpeggiator_mod;
                arpeggiator_limit = totalSamples;
            }
            arpeggiator_time += 1;

            // frequency limiter
            if (phase_speed > phase_max_speed){
                phase_speed = phase_max_speed;
            } else if(phase_speed < phase_min_speed){
                phase_speed = phase_min_speed;
            }

            // frequency vibrato
            vibrato_phase += vibrato_phase_speed;
            var _vibrato_phase_mod = phase_speed * sin(vibrato_phase) * vibrato_amplitude;
            phase += _vibrato_phase_mod;

            // frequency vibrato slide
            vibrato_phase_speed *= vibrato_phase_slide;
            if(vibrato_amplitude_slide){
                vibrato_amplitude += vibrato_amplitude_slide;
                if(vibrato_amplitude < 0){
                    vibrato_amplitude = 0;
                    vibrato_amplitude_slide = 0;
                } else if (vibrato_amplitude > 1){
                    vibrato_amplitude = 1;
                    vibrato_amplitude_slide = 0;
                }
            }

            // filters
            if( filters_enabled ){

                if( abs(highpass_cutoff) > 0.001){
                    highpass_cutoff *= highpass_cutoff_slide;
                    if(highpass_cutoff < 0.00001){
                        highpass_cutoff = 0.00001;
                    } else if(highpass_cutoff > 0.1){
                        highpass_cutoff = 0.1;
                    }
                }

                var _lowpass_pos_old = lowpass_pos;
                lowpass_cutoff *= lowpass_cutoff_slide;
                if(lowpass_cutoff < 0.0){
                    lowpass_cutoff = 0.0;
                } else if ( lowpass_cutoff > 0.1 ){
                    lowpass_cutoff = 0.1;
                }
                if(lowpass_enabled){
                    lowpass_pos_slide += (sample - lowpass_pos) * lowpass_cutoff;
                    lowpass_pos_slide *= lowpass_damping;
                } else {
                    lowpass_pos = sample;
                    lowpass_pos_slide = 0;
                }
                lowpass_pos += lowpass_pos_slide;

                highpass_accumulator += lowpass_pos - _lowpass_pos_old;
                highpass_accumulator *= 1.0 - highpass_cutoff;
                sample = highpass_accumulator;
            }

            // phaser
            if (phaser_enabled) {
                phaser_offset += phaser_offset_slide;
                if( phaser_offset < 0){
                    phaser_offset = -phaser_offset;
                    phaser_offset_slide = -phaser_offset_slide;
                }
                if( phaser_offset > phaser_mask){
                    phaser_offset = phaser_mask;
                    phaser_offset_slide = 0;
                }

                phaser_buffer[phaser_pos] = sample;
                // phaser sample modification
                var _p = (phaser_pos - (phaser_offset|0) + phaser_max) & phaser_mask;
                sample += phaser_buffer[_p];
                phaser_pos = (phaser_pos + 1) & phaser_mask;
            }

            // envelope processing
            if( i > envelope_last ){
                envelope_idx += 1;
                if(envelope_idx < envelopes_len) // fault protection
                    envelope = envelopes[envelope_idx];
                else // the trailing envelope is silence
                    envelope = {from: 0, to: 0, samples: totalSamples};
                envelope_cur = envelope.from;
                envelope_increment = (envelope.to - envelope.from) / (envelope.samples + 1);
                envelope_last += envelope.samples;
            }
            sample *= envelope_cur;
            envelope_cur += envelope_increment;

            // master volume controller
            sample *= master_volume;

            // prepare for next sample
            if(super_sampling_quality > 1){
                sample_accumulator += sample;
                if( (i + 1) % super_sampling_quality === 0){
                    out[k] = sample_accumulator / super_sampling_quality;
                    k += 1;
                    sample_accumulator = 0;
                }
            } else {
                out[i] = sample;
            }
        }

        // return out;

        // add padding 10ms
        var len = (SampleRate / 100)|0;
        var padding = new Array(len);
        for(var i = 0; i < len; i++)
            padding[i] = 0;
        return padding.concat(out).concat(padding);
    }

    this.Parameters = this.getParameters();

}).apply(jsfx);

"use strict";

var jsfxlib = {};
(function () {
    // takes object with param arrays
    // audiolib = {
    //   Sound : ["sine", 1, 2, 4, 1...
    // }
    //
    // returns object with audio samples
    // p.Sound.play()
    this.createWaves = function(lib){
        var sounds = {};
        for (var e in lib) {
            var data = lib[e];
            sounds[e] = this.createWave(data);
        }
        return sounds;
    }

    /* Create a single sound:
       var p = jsfxlib.createWave(["sine", 1,2,3, etc.]);
       p.play();
   */
    this.createWave = function(lib) {
        var params = this.arrayToParams(lib),
            data = jsfx.generate(params),
            wave = audio.make(data);

        return wave;
    }

    this.paramsToArray = function(params){
        var pararr = [];
        var len = jsfx.Parameters.length;
        for(var i = 0; i < len; i++){
            pararr.push(params[jsfx.Parameters[i].id]);
        }
        return pararr;
    }

    this.arrayToParams = function(pararr){
        var params = {};
        var len = jsfx.Parameters.length;
        for(var i = 0; i < len; i++){
            params[jsfx.Parameters[i].id] = pararr[i];
        }
        return params;
    }
}).apply(jsfxlib);


// browser keycodes to names
// used by keyevent
var keyMap = {
  13: 'ENTER',
  16: 'SHIFT',
  17: 'CTRL',
  18: 'ALT',
  27: 'ESCAPE',
  32: 'SPACE',
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN',
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',
  65: 'A',
  66: 'B',
  67: 'C',
  68: 'D',
  69: 'E',
  70: 'F',
  71: 'G',
  72: 'H',
  73: 'I',
  74: 'J',
  75: 'K',
  76: 'L',
  77: 'M',
  78: 'N',
  79: 'O',
  80: 'P',
  81: 'Q',
  82: 'R',
  83: 'S',
  84: 'T',
  85: 'U',
  86: 'V',
  87: 'W',
  88: 'X',
  89: 'Y',
  90: 'Z'
};

var canvas = null;
var context = null;

// now and old key state
var keyNow = {};
var keyOld = {};

// timeout to wait between raf ticks
var timeout = 40;

// raf last time stamp
var timestamp = 0;

// tile size (width and height) in pixels.
var ts = 10;

// maze wall and floor tiles.
var tiles = null;

// entities.
var entities = [];
var player = null;

// the message displayed at the bottom wall
var message = '';

// tile sheet with sprite definition and fonts, sound
var art = {}; 
var sound = {};

/**
 * Set to true to display the grid lines and numbers.
 */
var gridInfo = false;

/**
 * The maze width in tiles. Either set it before calling a createMaze... 
 * function or supply a width in the the createMaze... function.
 */
var mazeWidth = 7;

/**
 * The maze height in tiles. Either set it before calling a createMaze... 
 * function or supply a height in the the createMaze... function.
 */
var mazeHeight = 5;

/**
 * The number of steps taken by the player in the maze.
 */
var steps = 1;

/**
 * The global player energy used to calculate score.
 */
var energy = 10;

/**
 * The game score.
 */
var score = energy * 5 / steps;

function useCountryArt() {
  setTilesheet({
    src: '/lib/game/img/country.png',
    font: 'consolas',
    fontColor: '#000000',
    ts: 50,
    wall: {
      x: 0,
      y: 0
    },
    floor: {
      x: 1,
      y: 0
    },
    player: {
      x: 0,
      y: 0
    },
    monster: {
      x: 0,
      y: 0
    },
    energy: {
      x: 0,
      y: 0
    },
    goal: {
      x: 0,
      y: 0
    }
  });
}

function useDerekArt() {
  setTilesheet({
    src: '/lib/game/img/derek64.png',
    font: 'Georgia',
    fontColor: '#FFFFFF',
    ts: 64,
    wall: {
      x: 6,
      y: 1
    },
    floor: {
      x: 1,
      y: 0
    },
    player: {
      x: 0,
      y: 4
    },
    monster: {
      x: 11,
      y: 5
    },
    energy: {
      x: 0,
      y: 9
    },
    goal: {
      x: 2,
      y: 0
    }
  });
}

function setTilesheet(s) {
  art = s;
  art.image = new Image();
  art.image.src = art.src;
  ts = art.ts;
}

function createSounds() {
  sound = jsfxlib.createWaves({
    wall: ["saw",0.0000,0.4000,0.0000,0.0960,0.0000,0.1360,20.0000,251.0000,2400.0000,-0.4760,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000],
    monster: ["saw",0.0000,0.4000,0.0000,0.0800,0.0000,0.1860,20.0000,933.0000,2400.0000,-0.6960,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000],
    energy: ["square",0.0000,0.4000,0.0000,0.0940,0.4710,0.2980,20.0000,1077.0000,2400.0000,0.0000,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000],
    goal: ["square",0.0000,0.4000,0.0000,0.1400,0.0000,0.2820,20.0000,653.0000,2400.0000,0.4660,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.4310,0.0000,0.7856,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000]
  });
}

// called after a maze is created
function resizeCanvas() {
  canvas.width = ts * mazeWidth;
  canvas.height = ts * mazeHeight;
}

function resetKeys() {
  for(var key in keyNow) {
    keyOld[key] = false;
    keyNow[key] = false;
  }
}

function keyevent(e) {
  if(keyMap[e.which]) {
    keyNow[keyMap[e.which]] = (e.type == 'keydown');
  }
}

function update(delta) {
  for (var i = 0; i < entities.length; i++) {
    entities[i].update();
  }

  // move now key state to old key state
  for(var key in keyNow) {
    keyOld[key] = keyNow[key];
  }

  // entities
  for (var i = 0; i < entities.length; i++) {
    if(!entities[i].remove) {
      entities[i].render();
    }
  }

  // remove entities
  for (var i = entities.length - 1; i >= 0; i--) {
    if(entities[i].remove) {
      var e = entities[i];
      entities.splice(i, 1);
      tiles[e.x][e.y].entity = null;
    }
  }
}

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // tiles
  for (var x = 0; x < mazeWidth; x++) {
    for (var y = 0; y < mazeHeight; y++) {
      if(art[tiles[x][y].type]) {
        var q = art[tiles[x][y].type];
        context.drawImage(art.image, 
          q.x * ts, q.y * ts, ts, ts, 
          x * ts, y * ts, ts, ts
        );
      }
    }
  }

  // entities
  for (var i = 0; i < entities.length; i++) {
    entities[i].render();
  }

  // gridInfo 
  if(gridInfo) {
    context.strokeStyle = '#FFFFFF';
    context.fillStyle = '#FFFFFF';
    context.font = '12px Consolas';

    for (var x = 0; x < mazeWidth; x++) {
      for (var y = 0; y < mazeHeight; y++) {
        if(art[tiles[x][y].type]) {
          context.strokeRect(x * ts, y * ts, ts, ts);
          context.fillText('(' + x + ',' + y + ')', x * ts + 5, y * ts + 17);
        }
      }
    }    
  }

  // ui
  context.fillStyle = art.fontColor;
  context.font = Math.round(ts/2) + 'px ' + art.font;

  context.fillText('steps: ' + steps, Math.round(ts/3), Math.round(ts/1.5));
  context.fillText('energy: ' + energy, ts * 3.1, Math.round(ts/1.5));
  context.fillText('score: ' + Math.floor(score), ts * 6.5, Math.round(ts/1.5));

  if(message) {
    context.font = Math.round(ts/2) + 'px ' + art.font;
    context.fillText(message, Math.round(ts/3), (mazeHeight * ts) - Math.round(ts/3));
  }
}

// raf callback function
function tickBrowser(t) {  
  update(t - timestamp);
  render();

  // reference maze directly
  timestamp = t;
  
  // reference maze directly
  setTimeout(function() {
    requestAnimationFrame(tickBrowser);
  }, timeout);
}

function getEmptyTile(attempts) {
  attempts = attempts || 50;

  var i = 0;

  // random open
  while(i < attempts) {
    var x = Math.floor(Math.random() * (mazeWidth - 4) + 2);
    var y = Math.floor(Math.random() * (mazeHeight - 4) + 2);

    if(tiles[x][y].type == 'floor' && !tiles[x][y].entity) {
      return tiles[x][y];
    }

    i++;
  }

  // first open
  for (var x = 0; x < mazeWidth; x++) {
    for (var y = 0; y < mazeHeight; y++) {
      if(tiles[x][y].type == 'floor' && !tiles[x][y].entity) {
        return tiles[x][y];
      }
    }
  }

  // found nothing
  return null;
}

/**
 * Checks whether the named key was pressed. Provide an uppercase name.
 * 'UP', 'DOWN', 'LEFT', 'RIGHT'
 * @param {String} name the key name.
 */
function keyPressed(name) {
  return keyNow[name] && !keyOld[name];
}

/**
 * Add a wall at optional location. If no location is supplied a random
 * one will be chosen.
 * The wall will not be added if the location does not satisfy
 * x > 0 && x < w - 1 && y > 0 && y < h - 1
 * @param {Number} x optional x location.
 * @param {Number} y optional y location.
 * @return {Boolean} was the wall added.
 */
function addWall(x, y) {
  // random positon
  if(!x && !y) {
    var tile = getEmptyTile();

    if(!tile) {
      return false;
    }

    tile.type = 'wall';

    return true;
  }

  // supplied positon
  if(x > 0 && x < mazeWidth - 1 && y > 0 && y < mazeHeight - 1) {
    // no entity there
    if(!tiles[x][y].entity) {
      tiles[x][y].type = 'wall';

      return true;
    }
  }

  return false;
}

/**
 * Add n random wals. Caps n to 50.
 * @param {Number} n the number of monsters.
 */
function addRandomWalls(n) {
  if(!n) n = Math.floor(mazeWidth * mazeHeight / 15);
  if(n > 50) n = 50;

  for (var i = 0; i < n; i++) {
    addWall();
  }
}

function addEntity(e, x, y) {
  // check in inner wall bounds
  if(x > 0 && x < mazeWidth - 1 && y > 0 && y < mazeHeight - 1) {

    // no exiting entity there
    if(!tiles[x][y].entity) {
      
      // make sure adding on a floor tile
      tiles[x][y].type = 'floor';

      // add to entity array
      entities.push(e);

      // add to maze
      tiles[x][y].entity = e;

      // update entity location
      e.x = x;
      e.y = y;

      // return entity
      return e;
    }
  }

  // wasn't added
  return null;
}

/**
 * Remove entity from the maze.
 * todo: implementation. For now set entity.remove = true. 
 * @param {Entity} entity object. 
 */
function removeObject(object) {
  object.remove = true;
}

/**
 * Add Player at optional location. If no location is supplied, a location of
 * x: 1, y: mazeHeight - 2 is used.
 * The Player will not be added if the location is outside these bounds
 * x > 0 && x < w - 1 && y > 0 && y < h - 1
 * @param {Number} x optional x location.
 * @param {Number} y optional y location.
 * @return {Player|null} the added player or null.
 */
function addPlayer(x, y) {
  // remove exiting player reference
  for (var i = 0; i < entities.length; i++) {
    if(entities[i].type == 'player') {
      tiles[entities[i].x][entities[i].y].entity = null;
      entities.splice(i, 1);
      player = null;
      break;
    }
  };

  // default positon
  if(!x && !y) return addPlayer(1, mazeHeight - 2);

  // check in inner wall bounds
  // because we need to remove existing entity
  if(x > 0 && x < mazeWidth - 1 && y > 0 && y < mazeHeight - 1) {

    // remove existing entity
    if(tiles[x][y].entity) {
      entities.splice(entities.indexOf(tiles[x][y].entity), 1);
      tiles[x][y].entity = null;
    }

    // create
    player = new Player();
    return addEntity(player, x, y);
  }
  else {
    return null;
  }
}

/**
 * Add Goal at optional location. If no location is supplied, a location of
 * x: mazeWidth - 2, y: 1 is used.
 * The Goal will not be added if the location is outside these bounds
 * x > 0 && x < w - 1 && y > 0 && y < h - 1
 * @param {Number} x optional x location.
 * @param {Number} y optional y location.
 * @return {Goal} the added goal or null.
 */
function addGoal(x, y) {
  // default positon
  if(!x && !y) return addGoal(mazeWidth - 2, 1);

  // check in inner wall bounds
  // because we need to remove existing entity
  if(x > 0 && x < mazeWidth - 1 && y > 0 && y < mazeHeight - 1) {

    // remove existing entity
    if(tiles[x][y].entity) {
      entities.splice(entities.indexOf(tiles[x][y].entity), 1);
      tiles[x][y].entity = null;
    }

    // create
    return addEntity(new Goal(), x, y);
  }
  else {
    return null;
  }
}

/**
 * Add Monster at optional location. If no location is supplied a random
 * one will be chosen.
 * The Monster will not be added if the location is outside these bounds
 * x > 1 && x < w - 2 && y > 1 && y < h - 2
 * @param {Number} x optional x location.
 * @param {Number} y optional y location.
 * @return {Monster} the added monster or null.
 */
function addMonster(x, y) {
  if(!x && !y) {
    var tile = getEmptyTile();
    if(!tile) return null;
    return addEntity(new Monster(), tile.x, tile.y);
  }

  return addEntity(new Monster(), x, y);
}

/**
 * Add n random monsters. Caps n to 50.
 * @param {Number} n the number of monsters.
 */
function addRandomMonsters(n) {
  if(!n) n = Math.floor(mazeWidth * mazeHeight / 30); 
  if(n > 50) n = 50;

  for (var i = 0; i < n; i++) {
    addMonster();
  }
}

/**
 * Add Energy at location. If no location is supplied a random
 * one will be chosen.
 * The Energy will not be added if the location is outside these bounds
 * x > 1 && x < w - 2 && y > 1 && y < h - 2
 * @param {Number} x optional x location.
 * @param {Number} y optional y location.
 * @return {Energy} the added energy or null.
 */
function addEnergy(x, y) {
  if(!x && !y) {
    var tile = getEmptyTile();
    if(!tile) return null;
    return addEntity(new Energy(), tile.x, tile.y);
  }

  return addEntity(new Energy(), x, y);
}

/**
 * Add n random energies. Caps n to 50.
 * @param {Number} n the number of energies.
 */
function addRandomEnergies(n) {
  if(!n) n = Math.floor(mazeWidth * mazeHeight / 20);
  if(n > 50) n = 50;

  for (var i = 0; i < n; i++) {
    addEnergy();
  }
}

/**
 * Show a message in the game.
 * @param {String} message the message string.
 */
function showMessage(m) {
  message = m;
}

/**
 * Play a sound.
 * @param {String} name optional sound name.
 */
function playSound(name) {
  if(sound[name]) {
    sound[name].play();
  }
}

function resetMaze() {
  resetKeys();
  tiles = [];
  entities = [];
  player = null;  
  steps = 1;
  energy = 10;
  score = energy * 5 / steps;
  message = '';
  mazeWidth = 0;
  mazeHeight = 0;
}

/**
 * Create an empty maze surrounded by walls.
 * @param {Number} width the width of the maze in tiles.
 * @param {Number} height the height of the maze in tiles.
 */
function createEmptyMaze(width, height) {
  // supplied or existing or default
  width = width || mazeWidth || 16;
  height = height || mazeHeight || 8;

  resetMaze();

  mazeWidth = width;
  mazeHeight = height;

  tiles = [mazeWidth];

  for (var x = 0; x < mazeWidth; x++) {
    tiles[x] = [mazeHeight];
    for (var y = 0; y < mazeHeight; y++) {
      var type = 'floor';

      if (x === 0 || x == mazeWidth - 1 || y === 0 || y == mazeHeight - 1) {
        type = 'wall';
      }

      tiles[x][y] = {
        x: x,
        y: y,
        type: type
      };
    }
  }

  resizeCanvas();
}

/**
 * Create a random maze surrounded by walls.
 * Player will be put at bottom left. Goal at top right.
 * Adds random monsters, energies, walls. 
 * @param {Number} width the width of the maze in tiles.
 * @param {Number} height the height of the maze in tiles.
 */
function createRandomMaze(w, h) {
  createEmptyMaze(w, h);
  addRandomWalls();
  addRandomMonsters();
  addRandomEnergies();
  addPlayer();
  addGoal();
}

/**
 * Set and replace the player update function. Do custom keyPresed checks here.
 * @param {Function} fn the player update function.
 */
function playerUpdate(fn) {
  Player.prototype.update = fn;
}

/**
 * Set a custom event handler for when a player hits any entity 
 * (includes walls).
 * By default, the custom event handler function will not entirely replace 
 * the exiting collision processing, as the player will still expect to damage 
 * monsters and pickup energies etc. To stop the expected collision behavior 
 * with monsters, energies, goals and walls return 'true' from the
 * event handler. 
 * The event function receives one paramater, the object being hit.
 * @param {Function} fn the collsion event function.
 * @return {Boolean} true cancels the normal processing of collision events
 */
// actually sets the collisionEventHook so that the collisionEvent 
// functionality is not overriden.
// was implemented this way rather than wrapping the prototype outside of the 
// api so that the api was simpler to use by content creators.
function playerHitObject(fn) {
  Player.prototype.collisionHook = fn;
}

/**
 * Set and replace the event handler for when a player hits a wall tile.
 * The event function receives one paramater, the wall tile being hit.
 * @param {Function} fn the collsion event function.
 */
function playerHitWall(fn) {
  Player.prototype.wallCollisionEvent = fn;
}

/**
 * Set and replace the event handler for when a player hits a monster.
 * The event function receives one paramater, the monster being hit.
 * @param {Function} fn the collsion event function.
 */
function playerHitMonster(fn) {
  Player.prototype.monsterCollisionEvent = fn;
}

/**
 * Set and replace the event handler for when a player hits a energy.
 * The event function receives one paramater, the energy being hit.
 * @param {Function} fn the collsion event function.
 */
function playerHitEnergy(fn) {
  Player.prototype.energyCollisionEvent = fn;
}

/**
 * Set and replace the event handler for when a player hits a goal.
 * The event function receives one paramater, the goal being hit.
 * @param {Function} fn the collsion event function.
 */
function playerHitGoal(fn) {
  Player.prototype.goalCollisionEvent = fn;
}

/**
 * Set and replace the event handler for when a player takes a step.
 * @param {Function} fn the collsion event function.
 */
function playerStepTaken(fn) {
  Player.prototype.stepEvent = fn;
}

function countEntitiesOfType(type) {
  var count = 0;

  for (var i = 0; i < entities.length; i++) {
    if(entities[i].type == type) {
      count++;
    }
  }

  return count;
}

/**
 * Get the number of monsters in the maze.
 * @return {Number} the number of monsters in the maze.
 */
function getMonsterCount() {
  return countEntitiesOfType('monster');
}

/**
 * Get the number of energies in the maze.
 * @return {Number} the number of energies in the maze.
 */
function getEnergyCount() {
  return countEntitiesOfType('energy');
}

/**
 * Get the number of goals in the maze.
 * @return {Number} the number of goals in the maze.
 */
function getGoalCount() {
  return countEntitiesOfType('goal');
}

/**
 * Get the number of inner wall in the maze. Does not count boundary walls.
 * @return {Number} the number of goals in the maze.
 */
function getWallCount() {
  var count = 0;
  
  for (var x = 1; x < mazeWidth - 1; x++) {
    for (var y = 1; y < mazeHeight - 1; y++) {
      if (tiles[x][y].type == 'wall') {
        count++;
      } 
    }
  }

  return count;
}


function Entity() {}

// player, monster, energy, goal
Entity.prototype.type = '';

Entity.prototype.x = 0;
Entity.prototype.y = 0;

Entity.prototype.update = function(delta) {};

Entity.prototype.render = function() {
  var q = art[this.type];
  context.drawImage(art.image, q.x * ts, q.y * ts, ts, ts, 
    this.x * ts, this.y * ts, ts, ts
  );
};

Entity.prototype.moveUp = function() {
  message = '';

  // wall collision
  if(this.y-1 >= 0 && tiles[this.x][this.y-1].type == 'wall') {
    this.collisionEvent(tiles[this.x][this.y-1]);
  }
  // not wall
  else {
    // entity collision
    if(tiles[this.x][this.y-1].entity) {
      this.collisionEvent(tiles[this.x][this.y-1].entity);
    }
    // not wall, not entity, is other tile type
    else {
      tiles[this.x][this.y].entity = null;
      tiles[this.x][this.y-1].entity = this;
      this.y--;
      this.stepEvent();
    }
  }
};

Entity.prototype.moveDown = function() {
  message = '';

  // wall collision
  if(this.y+1 < mazeHeight && tiles[this.x][this.y+1].type == 'wall') {
    this.collisionEvent(tiles[this.x][this.y+1]);
  }
  else {
    // entity collision
    if(tiles[this.x][this.y + 1].entity) {
      this.collisionEvent(tiles[this.x][this.y + 1].entity);
    }
    // not wall, not entity, is other tile type
    else {
      tiles[this.x][this.y].entity = null;
      tiles[this.x][this.y + 1].entity = this;
      this.y++;
      this.stepEvent();
    }
  }
};

Entity.prototype.moveleft = function() {
  message = '';

  // wall collision
  if(this.x-1 >= 0 && tiles[this.x-1][this.y].type == 'wall') {
    this.collisionEvent(tiles[this.x-1][this.y]);
  }
  else {
    // entity collision
    if(tiles[this.x-1][this.y].entity) {
      this.collisionEvent(tiles[this.x-1][this.y].entity);
    }
    // not wall, not entity, is other tile type
    else {
      tiles[this.x][this.y].entity = null;
      tiles[this.x - 1][this.y].entity = this;
      this.x--;
      this.stepEvent();
    }
  }
};

Entity.prototype.moveRight = function() {
  message = '';

  // wall collision
  if(this.x+1 < mazeWidth && tiles[this.x+1][this.y].type == 'wall') {
    this.collisionEvent(tiles[this.x+1][this.y]);
  }
  else {
    // entity collision
    if(tiles[this.x+1][this.y].entity) {
      this.collisionEvent(tiles[this.x+1][this.y].entity);
    }
    // not wall, not entity, is other tile type
    else {
      tiles[this.x][this.y].entity = null;
      tiles[this.x + 1][this.y].entity = this;
      this.x++;
      this.stepEvent();
    }
  }
};

// hook into event without replace event
// return true to stop further event processing
Entity.prototype.collisionHook = function(object) { };

Entity.prototype.collisionEvent = function(object) {  
  // if returns true then cancel further collision processing
  if(this.collisionHook(object)) return;
  
  if      (object.type == 'wall')    this.wallCollisionEvent(object);
  else if (object.type == 'player')  this.playerCollisionEvent(object);
  else if (object.type == 'monster') this.monsterCollisionEvent(object);
  else if (object.type == 'energy')  this.energyCollisionEvent(object);
  else if (object.type == 'goal')    this.goalCollisionEvent(object);
};

Entity.prototype.wallCollisionEvent = function(object) {};
Entity.prototype.playerCollisionEvent = function(object) {};
Entity.prototype.monsterCollisionEvent = function(object) {};
Entity.prototype.energyCollisionEvent = function(object) {};
Entity.prototype.goalCollisionEvent = function(object) {};


function Player() { Entity.call(this); }
Player.prototype = Object.create(Entity.prototype);
Player.prototype.type = 'player';

Player.prototype.update = function() {
  if      (keyPressed('LEFT'))  this.moveleft();
  else if (keyPressed('RIGHT')) this.moveRight();
  else if (keyPressed('UP'))    this.moveUp(); 
  else if (keyPressed('DOWN'))  this.moveDown();
};

Player.prototype.wallCollisionEvent = function(object) {
  playSound('wall');
  showMessage('you bash into a wall');
};

Player.prototype.energyCollisionEvent = function(object) {
  playSound('energy');
  showMessage('you collect some needed energy');
  energy += 3;
  score = energy * 5 / steps;
  removeObject(object);
};

Player.prototype.monsterCollisionEvent = function(object) {
  playSound('monster');
  showMessage('you hit a monster');
  energy += 1;
  score = energy * 5 / steps;
  removeObject(object);
};

Player.prototype.goalCollisionEvent = function(goal) {
  playSound('goal');
  showMessage('you have found the exit');
};

Player.prototype.stepEvent = function(object) { 
  steps++;
  score = energy * 5 / steps;
};


function Monster() { Entity.call(this); }
Monster.prototype = Object.create(Entity.prototype);
Monster.prototype.type = 'monster';

function Energy() { Entity.call(this); }
Energy.prototype = Object.create(Entity.prototype);
Energy.prototype.type = 'energy';

function Goal() { Entity.call(this); }
Goal.prototype = Object.create(Entity.prototype);
Goal.prototype.type = 'goal';

// boot

document.addEventListener('DOMContentLoaded', function() {
  var container = document.body;
  var element = document.getElementById('game');
  if(element) container = element;

  canvas = document.createElement('canvas');
  container.appendChild(canvas);
  context = canvas.getContext('2d');

  document.addEventListener('keydown', keyevent);
  document.addEventListener('keyup', keyevent);

  createSounds();
  useDerekArt();
  createRandomMaze();
  tickBrowser();
});
