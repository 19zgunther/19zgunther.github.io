



async function buttonPress()
{
    var link = document.createElement('a');
    link.download = 'data.json';
    var blob = new Blob(["class WhiteNoiseProcessor extends AudioWorkletProcessor {process (inputs, outputs, parameters) {const output = outputs[0]output.forEach(channel => {for (let i = 0; i < channel.length; i++) {channel[i] = Math.random() * 2 - 1}})return true}}registerProcessor('white-noise-processor', WhiteNoiseProcessor);"], {type: 'text/plain'});
    link.href = window.URL.createObjectURL(blob);
    //link.click();
    console.log(link);
    console.log(blob);
    console.log(link.href);

    const audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule("class WhiteNoiseProcessor extends AudioWorkletProcessor {process (inputs, outputs, parameters) {const output = outputs[0]output.forEach(channel => {for (let i = 0; i < channel.length; i++) {channel[i] = Math.random() * 2 - 1}})return true}}registerProcessor('white-noise-processor', WhiteNoiseProcessor);");
    const whiteNoiseNode = new AudioWorkletNode(audioContext, 'white-noise-processor');
    whiteNoiseNode.connect(audioContext.destination);
}



function buttonPress_OLD()
{
    /*
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create an empty three-second stereo buffer at the sample rate of the AudioContext
    var myArrayBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate * 3, audioCtx.sampleRate);

    // Fill the buffer with white noise;
    // just random values between -1.0 and 1.0
    var freq = 500;
    for (var channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
        // This gives us the actual array that contains the data
        var nowBuffering = myArrayBuffer.getChannelData(channel);
        for (var i = 0; i < myArrayBuffer.length; i++) {
            // Math.random() is in [0; 1.0]
            // audio needs to be in [-1.0; 1.0]
            nowBuffering[i] = Math.sin(i * freq * 6.28 / 44100) + 0.5 * Math.sin(i * 2 * freq * 6.28/44100) + 0.2 * Math.sin(i * 3 * freq * 6.28/44100);
        }
    }

    // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer
    var source = audioCtx.createBufferSource();

    // set the buffer in the AudioBufferSourceNode
    source.buffer = myArrayBuffer;

    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
    source.connect(audioCtx.destination);

    // start the source playing
    source.start();

    console.log("HERE");*/
    const handleSuccess = function(stream) {
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const processor = context.createScriptProcessor(1024, 1, 1);
    
        source.connect(processor);
        processor.connect(context.destination);
    
        processor.onaudioprocess = function(e) {
          // Do something with the data, e.g. convert it to WAV
          console.log(e.inputBuffer);
        };
      };


    const player = document.getElementById('player');


    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(handleSuccess);

    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(1024, 1, 1);

    source.connect(processor);
    processor.connect(context.destination);

    processor.onaudioprocess = function(e) {
      // Do something with the data, e.g. convert it to WAV
      console.log(e.inputBuffer);
    };

}
