function View() {

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
        renderer: null,
        camera: null,
        container: null,
        init: function( audioAnalyser ) {
            AudioAnalyser = audioAnalyser;
            
            view.container = document.createElement( 'div' );
            view.container.width = '100%';
            view.container.height = '100%';
            document.body.appendChild( view.container );
            view.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
            view.camera.position.y = 150;
            view.camera.position.z = 500;
            view.scene = new THREE.Scene();
            // Plane
           
            view.renderer = new THREE.WebGLRenderer( { alpha: true, preserveDrawingBuffer: true } );
            view.renderer.setPixelRatio( window.devicePixelRatio );
            view.renderer.setSize( window.innerWidth, window.innerHeight );
            view.container.appendChild( view.renderer.domElement );
            //
            window.addEventListener( 'resize', onWindowResize, false );

            animate();
        },
        usePerspectiveCamera: function() {
            view.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 2000 );
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
        view.renderer.setSize( window.innerWidth, window.innerHeight );
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

        view.renderer.render( view.scene, view.camera );
    }

    return view;
}