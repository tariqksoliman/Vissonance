function Barred() {

    var group;
    var analyser;
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


    var barred = {
        name: 'Barred',
        init: function( Analyser, Scene ) {
            analyser = Analyser;
            scene = Scene;
        },
        make: function() {
            group = new THREE.Object3D();

            positionX = -750;

            for( var i = 0; i < 128; i++ ) {

                geometry = new THREE.PlaneBufferGeometry( 10, 40, 1 )
                var uniforms = {};
                var material = new THREE.ShaderMaterial( {
                    uniforms: uniforms,
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader
                });
                plane = new THREE.Mesh( geometry, material );
                plane.position.x = positionX;
                positionX += 12;
                group.add( plane );
            }
            
            scene.add( group );
        },
        destroy: function() {
            scene.remove( group );
        },
        render: function() {
            analyser.fftSize = 256;
            var bufferLength = analyser.frequencyBinCount;
            var dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);
            if( group ) {
                for(var i = 0; i < bufferLength; i++) {
                    group.children[i].geometry.attributes.position.array[1] = dataArray[i];
                    group.children[i].geometry.attributes.position.array[4] = dataArray[i];       
                    group.children[i].geometry.attributes.position.needsUpdate = true;
                }
            }
        }
    }

    return barred;

}