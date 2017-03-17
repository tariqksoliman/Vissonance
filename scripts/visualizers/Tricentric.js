function Tricentric() {

    var group;
    var analyser;
    var view;
    var scene;

    var bufferLength;
    var dataArray;
    var visualArray;
    var fsize = 4096; 
    var numBars = 32;

    var cylinder;

    var spectrum;

    var vertexShader = [
            "void main() {",
                "gl_Position = gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        ].join('\n');
    var fragmentShader = [
            "uniform vec3 col;",
            "uniform float alpha;",
            "void main() {",
                "gl_FragColor = vec4( col.r, col.g, col.b, alpha );",
            "}"
        ].join('\n');


    var tricentric= {
        name: 'Tricentric',
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

            view.usePerspectiveCamera();
            view.camera.position.y = 0;

            var positionZ = 498;

            for( var i = 0; i < numBars; i++ ) {

                geometry = new THREE.CylinderBufferGeometry( 20, 20, 2, 3, 1, true );
                var uniforms = {
                    col: { type: 'c', value: new THREE.Color( 'hsl(250, 100%, 70%)' ) },
                    alpha: { type: 'f', value: 1 }
                };
                var material = new THREE.ShaderMaterial( {
                    uniforms: uniforms,
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                    side: THREE.DoubleSide
                });
                cylinder = new THREE.Mesh( geometry, material );
                cylinder.position.z = positionZ;
                cylinder.rotation.x = Math.PI / 2;

                positionZ -= 5;
                
                group.add( cylinder );
            }
            scene.add( group );
        },
        destroy: function() {
            scene.remove( group );
        },
        render: function() {
            analyser.getByteFrequencyData( dataArray );
            visualArray = spectrum.GetVisualBins( dataArray, 32, 0, 1300 );
            var avg = arrayAverage( visualArray );
            view.camera.rotation.z += (avg <= 1) ? 0 : Math.pow( (avg / 8192) + 1, 2 ) - 1;
            if( group ) {
                for(var i = 0; i < visualArray.length; i++) {
                    setUniformColor( i, 308 - ( visualArray[i] ), parseInt(avg / 255 * 40) + 60, parseInt(visualArray[i]/ 255 * 25) + 45, visualArray[i] );
                    group.children[i].scale.x = ( ( visualArray[i] / 255 ) * (avg / 255)) + 0.25;
                    group.children[i].scale.y = ( ( visualArray[i] / 255 ) * (avg / 255)) + 0.25;
                    group.children[i].scale.z = ( ( visualArray[i] / 255 ) * (avg / 255)) + 0.25;
                }
            }
        }
    }

    function setUniformColor( groupI, h, s, l, factor ) {
        //l = parseInt( (factor / 255) * 60 + 1 );
        group.children[groupI].material.uniforms.col.value = new THREE.Color( 'hsl(' + h + ', ' + s + '%, ' + l + '%)' );
        group.children[groupI].material.uniforms.alpha.value = s / 100;
    }

    function arrayAverage( arr ) {
        var sum = 0;
        for( var i = 0; i < arr.length; i ++ ) {
            sum += arr[i];
        }
        return sum / arr.length;
    }

    return tricentric;

}