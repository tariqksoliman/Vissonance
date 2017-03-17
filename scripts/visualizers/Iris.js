function Iris() {

    var group;
    var analyser;
    var view;
    var scene;

    var bufferLength;
    var dataArray;
    var visualArray;
    var fsize = 4096; 
    var numBars = 128;

    var plane;

    var spectrum;

    var vertexShader = [
            "varying vec4 pos;",
            "void main() {",
                "pos = modelViewMatrix * vec4( position, 1.0 );",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        ].join('\n');
    var fragmentShader = [
            "uniform vec3 col;",
            "varying vec4 pos;",
            "void main() {",
                "gl_FragColor = vec4( -pos.z/180.0 * col.r, -pos.z/180.0 * col.g, -pos.z/180.0 * col.b, 1.0 );",
            "}"
        ].join('\n');


    var iris = {
        name: 'Iris',
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
            view.camera.position.z = 250;

            for( var i = 0; i < numBars / 2; i++ ) {

                var uniforms = {
                    col: { type: 'c', value: new THREE.Color( 'hsl(240, 100%, 50%)' ) },
                };
                var material = new THREE.ShaderMaterial( {
                    uniforms: uniforms,
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader
                } );

                geometry = new THREE.PlaneBufferGeometry( 3, 500, 1 );
                geometry.rotateX( Math.PI / 1.8 );
                geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 60, 0 ) );
                plane = new THREE.Mesh( geometry, material );
                
                plane.rotation.z = i * ( Math.PI * 2 / numBars ) + ( Math.PI / numBars );

                group.add( plane );

                //

                geometry = new THREE.PlaneBufferGeometry( 3, 500, 1 );
                geometry.rotateX( Math.PI / 1.8 );
                geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 60, 0 ) );
                plane = new THREE.Mesh( geometry, material );
                
                plane.rotation.z = -i * ( Math.PI * 2 / numBars ) - ( Math.PI / numBars );

                group.add( plane );
            }
            scene.add( group );
        },
        destroy: function() {
            scene.remove( group );
        },
        render: function() {
            analyser.getByteFrequencyData( dataArray );
            var loudness = getLoudness( dataArray );
            visualArray = spectrum.GetVisualBins( dataArray, numBars, 4, 1300 );
            if( group ) {
                for(var i = 0; i < visualArray.length / 2; i++) {
                    
                    //Left and right share the same material hence why we don't need i*2+1
                    setUniformColor( i * 2, loudness );

                    group.children[i * 2].geometry.attributes.position.array[7] = visualArray[i] / 2 + ( 65 + (loudness/1.5) );
                    group.children[i * 2].geometry.attributes.position.array[10] = visualArray[i] / 2 + ( 65 + (loudness/1.5) );
                    group.children[i * 2].geometry.attributes.position.needsUpdate = true;

                    group.children[i * 2 + 1].geometry.attributes.position.array[7] = visualArray[i] / 2 + ( 65 + (loudness/1.5) );
                    group.children[i * 2 + 1].geometry.attributes.position.array[10] = visualArray[i] / 2 + ( 65 + (loudness/1.5) );
                    group.children[i * 2 + 1].geometry.attributes.position.needsUpdate = true;
                }
            }
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

    return iris;

}