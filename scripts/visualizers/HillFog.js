function HillFog() {

    var geometry;
    var analyser;
    var view;
    var scene;

    var plane;

    var vertexShader = [
            "void main() {",
                "gl_Position = gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        ].join('\n');
    var fragmentShader = [
            "void main() {",
                "gl_FragColor = vec4( gl_FragCoord.y/500.0, 0, gl_FragCoord.y/1000.0, 1.0 );",
            "}"
        ].join('\n');


    var hillfog = {
        name: 'Hill Fog',
        init: function( Analyser, View ) {
            analyser = Analyser.analyser;
            view = View;
            scene = View.scene;
        },
        make: function() {
            view.useOrthographicCamera();

            geometry = new THREE.PlaneBufferGeometry( 900, 40, 127 )
            var uniforms = {};
            var material = new THREE.ShaderMaterial( {
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader
            });
            plane = new THREE.Mesh( geometry, material );
            scene.add( plane );
        },
        destroy: function() {
            scene.remove( plane );
        },
        render: function() {
            analyser.fftSize = 256;
            var bufferLength = analyser.frequencyBinCount;
            var dataArray = new Uint8Array(bufferLength);
            analyser.getByteTimeDomainData( dataArray );
            if( geometry ) {
                for(var i = 0; i < bufferLength; i++) {
                    geometry.attributes.position.array[i*3 + 1] = dataArray[i] / 3;
                }
                geometry.attributes.position.needsUpdate = true;
            }
        }
    }

    return hillfog;

}