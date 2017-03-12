function View() {

    var container;
    var renderer;
    var cube, plane;
    var targetRotation = 0;
    var targetRotationOnMouseDown = 0;
    var mouseX = 0;
    var mouseXOnMouseDown = 0;
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;
    var geometry;
    var AudioAnalyser;
    
    var view = {
        scene: null,
        camera: null,
        init: function( audioAnalyser ) {
            AudioAnalyser = audioAnalyser;
            
            container = document.createElement( 'div' );
            container.width = '100%';
            container.height = '100%';
            document.body.appendChild( container );
            view.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
            view.camera.position.y = 150;
            view.camera.position.z = 500;
            view.scene = new THREE.Scene();
            // Plane
           
            renderer = new THREE.WebGLRenderer( { alpha: true } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
            container.appendChild( renderer.domElement );
            //
            window.addEventListener( 'resize', onWindowResize, false );

            animate();
        },
        usePerspectiveCamera: function() {
            view.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 1000 );
            view.camera.position.y = 150;
            view.camera.position.z = 500;
        },
        useOrthographicCamera: function() {
            view.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
            view.camera.position.y = 150;
            view.camera.position.z = 500;
        },
        renderVisualization: null
    }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        view.camera.aspect = window.innerWidth / window.innerHeight;
        view.camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    //
    function animate() {
        setTimeout( function() {

            requestAnimationFrame( animate );

        }, 1000 / 60 );
        render();
    }
    function render() {

        if( view.renderVisualization ) {
            view.renderVisualization();
        }

        renderer.render( view.scene, view.camera );
    }

    return view;
}