function Siphon() {

    var group;
    var analyser;
    var view;
    var scene;

    var bufferLength;
    var dataArray;
    var visualArray;
    var fsize = 4096; 
    var numBands = 36;
    var numBars = 128;
    var barLen = 10;
    var barGap = 8;
    
    var currentBand = 0;

    var v = numBars * 3 * 2 * 2;

    var lastLoudness = 0;

    var cylinder;
    var cylRadius = 100;

    var spectrum;

    var vertexShader = [
            "varying vec4 pos;",
            "void main() {",
                "pos = modelViewMatrix * vec4( position, 1.0 );",
                "gl_Position = gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        ].join('\n');
    var fragmentShader = [
            "uniform vec3 col;",
            "varying vec4 pos;",
            "void main() {",
                "gl_FragColor = vec4( col.r, col.g, col.b, 1.0 );",
            "}"
        ].join('\n');


    var siphon = {
        name: 'Siphon',
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
            view.camera.position.z = 0;

            view.renderer.autoClearColor = true;
            view.renderer.setClearColor( new THREE.Color( 'hsl( 0, 0%, 100%)' ), 1);

            var posX = 0;

            for( var i = 0; i < numBands; i++ ) {

                geometry = new THREE.CylinderBufferGeometry( cylRadius, cylRadius, barLen, (numBars * 2 ) - 1, 1, true );
                var uniforms = {
                    col: { type: 'c', value: new THREE.Color( 'hsl(240, 100%, 50%)' ) },
                };
                var material = new THREE.ShaderMaterial( {
                    uniforms: uniforms,
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                    side: THREE.BackSide
                });
                cylinder = new THREE.Mesh( geometry, material );
                cylinder.rotation.z = Math.PI / 2;
                cylinder.rotation.y = Math.PI / 2;
                cylinder.position.z = posX;
                
                posX -= barGap;

                group.add( cylinder );
            }
            group.rotation.z = -Math.PI / 2;
            scene.add( group );
        },
        destroy: function() {
            scene.remove( group );
            view.renderer.autoClearColor = false;
        },
        render: function() {
            analyser.getByteFrequencyData( dataArray );
            visualArray = spectrum.GetVisualBins( dataArray, numBars, 4, 1300 );
            loudness = getLoudness( dataArray );
            //smooth loudness
            loudness = ( loudness + lastLoudness ) / 2;
            if( group ) {
                group.scale.x = 1 - Math.min( loudness / 255, 0.80 );
                group.scale.y = 1 - Math.min( loudness / 255, 0.80 );
                
                for( var c = 0; c < group.children.length; c++ ) {
                   group.children[c].position.z += (loudness <= 1) ? 0 : (Math.pow( (loudness / 8192) + 1, 2 ) - 1) * loudness * 4;
                   //Put plane back when out of sight
                    if( group.children[c].position.z > 10 ) {
                        group.children[c].position.z -= numBands * barGap;
                        currentBand = c;
                    }
                }
                for(var i = 0; i < visualArray.length; i++) {
                    scaleGroupVectorLength( currentBand, i*3 + (numBars*6), -visualArray[i] / 3.5 - ( loudness / 7 ) );
                    scaleGroupVectorLength( currentBand, (v/2 - 3) - ( (numBars*3) + (i*3) ) + (numBars*3) + (numBars*6), -visualArray[i] / 3.5 - ( loudness / 7 ) );
                    group.children[currentBand].geometry.attributes.position.needsUpdate = true;
                }
                setUniformColor( currentBand, loudness );
            }
            lastLoudness = loudness;
        }
    }

    function scaleGroupVectorLength( groupC, groupI, length ) {
        var v3 = new THREE.Vector3(
            group.children[groupC].geometry.attributes.position.array[groupI + 0],
            group.children[groupC].geometry.attributes.position.array[groupI + 1],
            group.children[groupC].geometry.attributes.position.array[groupI + 2]
        );
        var scalar = (length + cylRadius ) / v3.distanceTo( new THREE.Vector3( 0, 0, 0 ) );

        group.children[groupC].geometry.attributes.position.array[groupI + 0] *= scalar; 
        group.children[groupC].geometry.attributes.position.array[groupI + 1] *= scalar;
        group.children[groupC].geometry.attributes.position.array[groupI + 2] *= scalar;
    }

    function setUniformColor( groupI, loudness ) {
        var h = modn( 250 - (loudness*7), 360 );
        group.children[groupI].material.uniforms.col.value = new THREE.Color( 'hsl(' + h + ', 100%, 50%)' );
        view.renderer.setClearColor( new THREE.Color( 'hsl(' + ( (h + 180) % 360 ) + ', 100%, 97%)' ), 1);
    }


    function getLoudness( arr ) {
        var sum = 0;
        for( var i = 0; i < arr.length; i ++ ) {
            sum += arr[i];
        }
        return sum / arr.length;
    }

    function modn( n, m ) {
        return ( (n % m) + m ) % m;
    }

    return siphon;

}