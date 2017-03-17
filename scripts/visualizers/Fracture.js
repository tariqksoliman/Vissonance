function Fracture() {

    var group;
    var group2;
    var analyser;
    var view;
    var scene;

    var bufferLength;
    var dataArray;
    var visualArray;
    var fsize = 4096; 
    var numBars = 128;
    var numBands = 64;
    var barLen = 150;
    var barGap = 10;

    var lastLoudness = 0;

    //3 for xyz, 2 for top and bottom plane verts, 2 for double-length planes
    var v = numBars * 3 * 2 * 2;

    var plane;

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
                "gl_FragColor = vec4( -pos.z/500.0 * col.r, -pos.z/500.0 * col.g, -pos.z/500.0 * col.b, 1 );",
            "}"
        ].join('\n');


    var fracture = {
        name: 'Fracture',
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
            
            view.renderer.autoClearColor = true;
            view.renderer.setClearColor( new THREE.Color( 'hsl( 0, 0%, 100%)' ), 1);

            view.usePerspectiveCamera();
            view.camera.position.y = 0;
            view.camera.position.z = 0;

            positionZ = 10;

            for( var i = 0; i < numBands; i++ ) {

                geometry = new THREE.PlaneBufferGeometry( barLen * 2, 10, (numBars * 2) - 1 )
                var uniforms = {
                    col: { type: 'c', value: new THREE.Color( 'hsl(240, 100%, 50%)' ) },
                };
                var material = new THREE.ShaderMaterial( {
                    uniforms: uniforms,
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader
                });
                //material = new THREE.MeshBasicMaterial({color:"red",wireframe:true});
                plane = new THREE.Mesh( geometry, material );
                plane.rotation.x = -Math.PI / 2;
                plane.position.y = -10;
                plane.position.z = positionZ;
                
                positionZ -= barGap;
                
                group.add( plane );
            }
            
            scene.add( group );

            //group2
            group2 = group.clone();
            group2.rotation.z = Math.PI;
            scene.add( group2 );
        },
        destroy: function() {
            scene.remove( group );
            scene.remove( group2 );
            view.renderer.autoClearColor = false;
        },
        render: function() {
            analyser.getByteFrequencyData( dataArray );
            visualArray = spectrum.GetVisualBins( dataArray, numBars, -200, 1300 );
            loudness = getLoudness( dataArray );
            //smooth loudness
            loudness = ( loudness + lastLoudness ) / 2;
            //view.renderer.setClearColor( new THREE.Color( 'hsl( ' + modn( 250 - (loudness*2.2), 360 ) + ', 100%, 15%)' ), 1);
            view.camera.rotation.z -= (loudness <= 1) ? 0 : (Math.pow( (loudness / 8192) + 1, 2 ) - 1) / 2;
            if( group ) {
                group.position.y = (loudness <= 1) ? -10 : -10 + Math.min( (loudness/255) * 20, 9.8);
                group2.position.y = (loudness <= 1) ? 10 : 10 - Math.min( (loudness/255) * 20, 9.8);   
                for( var c = 0; c < group.children.length; c ++ ) {
                    group.children[c].position.z += (loudness <= 1) ? 0 : (Math.pow( (loudness / 8192) + 1, 2 ) - 1) * loudness * 1.7;
                    group2.children[c].position.z += (loudness <= 1) ? 0 : (Math.pow( (loudness / 8192) + 1, 2 ) - 1) * loudness * 1.7;
                    //Put plane back when out of sight
                    if( group.children[c].position.z > 20 ) {
                        group.children[c].position.z -= numBands * barGap;
                        group2.children[c].position.z -= numBands * barGap;
                    }
                    for(var i = 0; i < visualArray.length; i++) {
                        setUniformColor( c, loudness );
                        if( c % 2 != 0 ) {
                            group.children[c].geometry.attributes.position.array[i*3 + 2] = visualArray[i] / 10;
                            //group.children[c].geometry.attributes.position.array[i*3 + 2 + (numBars*6)] = visualArray[i] / 10;
                            group.children[c].geometry.attributes.position.needsUpdate = true;
                        }
                        else {
                            group.children[c].geometry.attributes.position.array[(v/2 - 3) - ( (numBars*3) + (i*3) ) + 2 + (numBars*3)] = visualArray[i] / 10;
                            //group.children[c].geometry.attributes.position.array[( v - ( (i+numBars) * 3 ) ) + 2] = visualArray[i] / 20;
                            group.children[c].geometry.attributes.position.needsUpdate = true;
                        }
                    }
                }
            }
            lastLoudness = loudness;
        }
    }

    function setUniformColor( groupI, loudness ) {
        var h = modn( 250 - (loudness*2.2), 360 );
        group.children[groupI].material.uniforms.col.value = new THREE.Color( 'hsl(' + h + ', 100%, 50%)' );
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
    
    return fracture;

}