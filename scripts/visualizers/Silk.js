function Silk() {

    var group, group2, group3, group4;
    var audioAnalyser;
    var analyser;
    var view;
    var scene;

    var bufferLength;
    var dataArray;
    var visualArray;
    var fsize = 4096; 
    var numBars = 512;
    var barWidth = 10;
    var barGap = 0.12;

    var circle;

    var bgPlane;

    var loudness;
    var lastLoudness = 0;

    var spectrum;

    var vertexShader = [
            "void main() {",
                "gl_Position = gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        ].join('\n');
    var fragmentShader = [
            "uniform vec3 col;",
            "void main() {",
                "gl_FragColor = vec4( col.r, col.g, col.b, 1.0 );",
            "}"
        ].join('\n');

    var bgfragmentShader = [
            "void main() {",
                "gl_FragColor = vec4( 1.0, 1.0, 1.0, 0.2 );",
            "}"
        ].join('\n');


    var silk = {
        name: 'Silk',
        init: function( Analyser, View ) {
            audioAnalyser = Analyser;
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
            view.camera.position.x = 0;
            view.camera.position.y = 0;
            view.camera.position.z = 0;
            
            while( view.container.firstChild ) {
                view.container.removeChild( view.container.firstChild );
            }

            view.renderer = new THREE.WebGLRenderer( { alpha: true, preserveDrawingBuffer: true } );
            view.renderer.setPixelRatio( window.devicePixelRatio );
            view.renderer.setSize( window.innerWidth, window.innerHeight );
            view.container.appendChild( view.renderer.domElement );
            
            view.renderer.setClearColor( new THREE.Color( 0xfdfdfd ), 1);
            view.renderer.clear();
            view.renderer.autoClearColor = false;
            
            var posX = 3;
            //var spriteMap = new THREE.TextureLoader().load( "resources/glow.png" );
            for( var i = 0; i < numBars; i++ ) {
                
                geometry = new THREE.CircleBufferGeometry( 10, 6 );
                var uniforms = {
                    col: { type: 'c', value: new THREE.Color( 'hsl(240, 100%, 50%)' ) },
                };
                var material = new THREE.ShaderMaterial( {
                    uniforms: uniforms,
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                    side: THREE.DoubleSide
                });
                
                //material = new THREE.MeshBasicMaterial( {wireframe: true} );
                /*
                var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
                var sprite = new THREE.Sprite( spriteMaterial );
                sprite.position.x = posX;
                sprite.position.y = 0;
                sprite.position.z = -50;

                */
                circle = new THREE.Mesh( geometry, material );
                circle.position.x = posX;
                circle.position.y = 0;
                circle.position.z = -50;
                //circle.rotation.z = Math.PI/6;
                
                posX += barGap;

                var pivot = new THREE.Object3D();
                pivot.add( circle );
                
                group.add( pivot );
            }
            
            scene.add( group );

            //group2 //top left
            group2 = group.clone();
            //group2.position.x -= numBars * barGap;
            group2.rotation.z = Math.PI;
            scene.add( group2 );

            //group3 //bottom left
            group3 = group.clone();
            //group3.position.x -= numBars * barGap;
            group3.rotation.z = Math.PI;
            scene.add( group3 );

            //group4 //bottom right
            group4 = group.clone();
            scene.add( group4 );

            //bgPlane
            geometry = new THREE.PlaneBufferGeometry( 2000, 2000, 1, 1 );
            var material = new THREE.ShaderMaterial( {
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: bgfragmentShader,
                transparent: true,
                depthWrite: false
            });
            
            //material = new THREE.MeshBasicMaterial( {wireframe: true} );
            /*
            var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
            var sprite = new THREE.Sprite( spriteMaterial );
            sprite.position.x = posX;
            sprite.position.y = 0;
            sprite.position.z = -50;

            */
            bgPlane= new THREE.Mesh( geometry, material );
            bgPlane.position.x = 0;
            bgPlane.position.y = 0;
            bgPlane.position.z = -60;
            scene.add( bgPlane );
        },
        destroy: function() {
            scene.remove( group );
            scene.remove( group2 );
            scene.remove( group3 );
            scene.remove( group4 );
            
            scene.remove( bgPlane );

             while( view.container.firstChild ) {
                view.container.removeChild( view.container.firstChild );
            }

            view.renderer = new THREE.WebGLRenderer( { alpha: true } );
            view.renderer.setPixelRatio( window.devicePixelRatio );
            view.renderer.setSize( window.innerWidth, window.innerHeight );
            view.container.appendChild( view.renderer.domElement );

            view.renderer.autoClearColor = true;
            view.renderer.setClearColor( new THREE.Color( 0xffffff ), 0);
            view.renderer.clear();
        },
        reset: function() {
            if( group ) {
                for(var i = 0; i < group.children.length; i++) {
                    group.children[i].position.y = 0;
                    group2.children[i].position.y = 0;
                    group3.children[i].position.y = 0;
                    group4.children[i].position.y = 0;
                }       
            }
        },
        render: function() {
            if( audioAnalyser.hasNewSong ) {
                silk.reset();
            }

            analyser.getByteFrequencyData( dataArray );
            visualArray = dataArray;
            visualArray = spectrum.GetVisualBins( dataArray, numBars, 6, 1300 );
            //visualArray.reverse();
            loudness = getLoudness( dataArray );
            //smooth loudness
            loudness = ( loudness + lastLoudness ) / 2;
            if( group ) {
                for(var i = 0; i < visualArray.length; i++) {
                    group.children[i].children[0].scale.x = (visualArray[i] <= 1) ? 0.0001 : 4 * Math.log10( 1 + (visualArray[i] / 255 / 7 ) );
                    group.children[i].children[0].scale.y = (visualArray[i] <= 1) ? 0.0001 : 4 * Math.log10( 1 + (visualArray[i] / 255 / 7 ) );

                    group2.children[i].children[0].scale.x = (visualArray[i] <= 1) ? 0.0001 : 4 * Math.log10( 1 + (visualArray[i] / 255 / 7 ) );
                    group2.children[i].children[0].scale.y = (visualArray[i] <= 1) ? 0.0001 : 4 * Math.log10( 1 + (visualArray[i] / 255 / 7 ) );

                    group3.children[i].children[0].scale.x = (visualArray[i] <= 1) ? 0.0001 : 4 * Math.log10( 1 + (visualArray[i] / 255 / 7 ) );
                    group3.children[i].children[0].scale.y = (visualArray[i] <= 1) ? 0.0001 : 4 * Math.log10( 1 + (visualArray[i] / 255 / 7 ) );

                    group4.children[i].children[0].scale.x = (visualArray[i] <= 1) ? 0.0001 : 4 * Math.log10( 1 + (visualArray[i] / 255 / 7 ) );
                    group4.children[i].children[0].scale.y = (visualArray[i] <= 1) ? 0.0001 : 4 * Math.log10( 1 + (visualArray[i] / 255 / 7 ) );
                    //
                    
                    group.children[i].position.y += (visualArray[i] <= 1) ? 0.0001 : 4 * Math.log10( 1 + (visualArray[i] / 255 / 7 ) );

                    group2.children[i].position.y += (visualArray[i] <= 1) ? 0.0001 : 4 * Math.log10( 1 + (visualArray[i] / 255 / 7 ) );

                    group3.children[i].position.y -= (visualArray[i] <= 1) ? 0.0001 : 4 * Math.log10( 1 + (visualArray[i] / 255 / 7 ) );

                    group4.children[i].position.y -= (visualArray[i] <= 1) ? 0.0001 : 4 * Math.log10( 1 + (visualArray[i] / 255 / 7 ) );
                    
                    //
                    if( group.children[i].position.y > 30 || loudness <= 1 ) {
                        group.children[i].position.y = 0;
                    }
                    
                    if( group2.children[i].position.y > 30 || loudness <= 1) {
                        group2.children[i].position.y = 0;
                    }

                    if( group3.children[i].position.y < -30 || loudness <= 1) {
                        group3.children[i].position.y = 0;
                    }

                    if( group4.children[i].position.y < -30 || loudness <= 1) {
                        group4.children[i].position.y = 0;
                    }
                    
                    setUniformColor( i, visualArray[i] );
                }
            }
            lastLoudness = loudness;
        }
    }

    function getLoudness( arr ) {
        var sum = 0;
        for( var i = 0; i < arr.length; i ++ ) {
            sum += arr[i];
        }
        return sum / arr.length;
    }

    function setUniformColor( groupI, loudness ) {
        var h = modn( 250 - (loudness*0.9), 360 );
        //Just once since they share materials
        group.children[groupI].children[0].material.uniforms.col.value = new THREE.Color( 'hsl(' + h + ', 90%, ' + ( 100 - Math.min(40, parseInt( loudness ) ) ) + '%)' );
    }

    function modn( n, m ) {
        return ( (n % m) + m ) % m;
    }

    return silk;

}