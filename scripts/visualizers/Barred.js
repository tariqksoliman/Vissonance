function Barred() {

    var group;
    var analyser;
    var view;
    var scene;

    var bufferLength;
    var dataArray;
    var visualArray;
    var fsize = 4096; 
    var numBars = 64;

    var plane;

    var spectrum;

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
        init: function( Analyser, View ) {
            analyser = Analyser.analyser;
            view = View;
            scene = View.scene;
        },
        make: function() {
            group = new THREE.Object3D();
            spectrum = new Spectrum();
            analyser.fftSize = fsize;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            view.useOrthographicCamera();

            positionX = -20 * ( numBars / 2 );

            for( var i = 0; i < numBars; i++ ) {

                geometry = new THREE.PlaneBufferGeometry( 18, 5, 1 );
                var uniforms = {};
                var material = new THREE.ShaderMaterial( {
                    uniforms: uniforms,
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader
                });
                plane = new THREE.Mesh( geometry, material );
                plane.position.x = positionX;
                positionX += 20;
                
                group.add( plane );
            }
            
            scene.add( group );
        },
        destroy: function() {
            scene.remove( group );
        },
        render: function() {
            analyser.getByteFrequencyData( dataArray );
            visualArray = spectrum.GetVisualBins( dataArray, numBars, 4, 1300 );
            if( group ) {
                for(var i = 0; i < visualArray.length; i++) {
                    group.children[i].geometry.attributes.position.array[1] = visualArray[i];
                    group.children[i].geometry.attributes.position.array[4] = visualArray[i];
                    group.children[i].geometry.attributes.position.needsUpdate = true;
                }
            }
        }
    }

    return barred;

}