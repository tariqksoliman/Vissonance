function AudioAnalyser() {

    var audioanalyser = {
        audioCtx: null,
        source: null,
        analyser: null,
        gainNode: null,
        hasNewSong: false,
        init: function() {
            audioanalyser.audioCtx = new( window.AudioContext || window.webkitAudioContext )();
            audioanalyser.analyser = audioanalyser.audioCtx.createAnalyser();
            audioanalyser.gainNode = audioanalyser.audioCtx.createGain();
            audioanalyser.gainNode.gain.value = 0.2;
        },
        makeAudio: function( data ) {
            if( audioanalyser.source ) {
                audioanalyser.source.stop(0);
            }

            audioanalyser.source = audioanalyser.audioCtx.createBufferSource();

            if( audioanalyser.audioCtx.decodeAudioData ) {
                audioanalyser.audioCtx.decodeAudioData( data, function( buffer ) {
                    audioanalyser.source.buffer = buffer;
                    playAudio();
                } );
            }
            else {
                audioanalyser.source.buffer = audioanalyser.audioCtx.createBuffer( data, false );
                playAudio();
            }
            audioAnalyser.hasNewSong = true;
        }
    }

    function playAudio() {
        audioanalyser.source.connect( audioanalyser.analyser );
        audioanalyser.source.connect( audioanalyser.gainNode );
        audioanalyser.gainNode.connect( audioanalyser.audioCtx.destination );
        audioanalyser.source.start(0);
        audioAnalyser.hasNewSong = false;
    }

    return audioanalyser;

}