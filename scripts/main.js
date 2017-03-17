if ( ! Detector.webgl ) {
    Detector.addGetWebGLMessage();
}
else {
    var audioAnalyser = new AudioAnalyser();
    audioAnalyser.init();

    var dragDropUpload = new DragDropUpload();
    dragDropUpload.init( audioAnalyser );

    var view = new View();
    view.init( audioAnalyser );

    var controller = new Controller();
    controller.init( audioAnalyser, view );
}