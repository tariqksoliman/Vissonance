function Controller() {

    var analyser;
    var view;
    var scene;

    var controller = {
        visualizers: {
            'Hill Fog': new HillFog(),
            'Barred': new Barred(),
            'Tricentric': new Tricentric(),
            'Iris': new Iris(),
            'Fracture': new Fracture(),
            'Siphon': new Siphon(),
            'Silk': new Silk()
        },
        activeViz: null,
        init: function( AudioAnalyser, View ) {
            analyser = AudioAnalyser;
            view = View;
            scene = View.scene;

            /*
            var warning = $( '<div>WARNING<br>Contains Flashing Images</div>' );
                warning.attr( 'id', 'warning' );
            $( 'body' ).append( warning );
            */
            var selector = $( '<div></div>' );
                selector.attr( 'id', 'selector' );
            $( 'body' ).append( selector );
                        
            var list = $( '<ul></ul>' );
            $( '#selector' ).append( list );

            $( 'body' ).mousemove( function() {
                $( '#selector' ).stop().animate( {opacity: 1}, 150, function() {
                    setTimeout( function() {
                            $( '#selector' ).stop().animate( {
                                opacity: 0
                            }, 5000 );
                        }, 2000
                    );
                } );

                $( '#audioname' ).stop().animate( {opacity: 1}, 150, function() {
                    setTimeout( function() {
                            $( '#audioname' ).stop().animate( {
                                opacity: 0.1
                            }, 12500 );
                        }, 7000
                    );
                } );
            } );

            var vizkeys = Object.keys( controller.visualizers );
            for( var i = 0; i < vizkeys.length; i++ ) {
                var li = $( '<li>' + vizkeys[i] + '</li>' );
                    li.attr( 'id', 'vis_' + vizkeys[i] );
                    li.attr( 'class', 'visualizer' );
                list.append( li );
            }
            
            $( '.visualizer' ).each( function(i) {
                
                if( controller.visualizers.hasOwnProperty( $(this).text() ) ) {
                    controller.visualizers[ $(this).text() ].init( analyser, view );
                }

                $(this).on( 'click', function() {

                    $(this).siblings().removeClass( 'active' );
                    $(this).addClass( 'active' );

                    var name = $(this).text();
                    if( !controller.activeViz || controller.activeViz.name != name ) {
                        if( controller.visualizers.hasOwnProperty( name ) ) {
                            if( controller.activeViz ) {
                                controller.activeViz.destroy();
                            }
                            controller.activeViz = controller.visualizers[ name ];
                            controller.activeViz.make();
                            View.renderVisualization = controller.activeViz.render;
                        }
                    }
                } );
            } );

            $( '#vis_Iris' ).trigger( 'click' );

        }
    }

    return controller;

}