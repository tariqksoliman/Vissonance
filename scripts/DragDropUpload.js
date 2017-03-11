function DragDropUpload() {

    var dragdropupload = {
        filename: null,
        init: function( audioAnalyser ) {
            document.body.addEventListener( 'drop', drop_handler, false );
            document.body.addEventListener( 'dragover', dragover_handler, false );

            var audioname = $( '<div></div>' );
                audioname.attr( 'id', 'audioname' );
            $( 'body' ).append( audioname );

            function drop_handler( e ) {
                e.preventDefault();

                var droppedFiles = e.target.files || e.dataTransfer.files;
                audioname.text( droppedFiles[0].name.replace(/\.[^/.]+$/, "") );

                var reader = new FileReader();

                reader.onload = function( fileEvent ) {
                    var data = fileEvent.target.result;
                    audioAnalyser.makeAudio( data );
                };
                reader.readAsArrayBuffer( droppedFiles[0] );

            }

            function dragover_handler( e ) {
                console.log( 'dragover' );
                e.preventDefault();
            }
        }

    }

    return dragdropupload;
}