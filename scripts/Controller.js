function Controller() {

    var analyser;
    var view;
    var scene;

    var controller = {
        visualizers: {
            'Hill Fog': new HillFog(),
            'Barred': new Barred(),
            'Triangular Tunnel': new TriangularTunnel()
        },
        activeViz: null,
        init: function( AudioAnalyser, View ) {
            analyser = AudioAnalyser.analyser;
            view = View;
            scene = View.scene;

            var selector = $( '<div></div>' );
                selector.attr( 'id', 'selector' );
            $( 'body' ).append( selector );
                        
            var list = $( '<ul></ul>' );
            $( '#selector' ).append( list );

            $( 'body' ).mousemove( function() {
                $( '#selector' ).stop().show().css( 'opacity', 1 ).delay( 2000 ).animate( {
                    opacity: 0
                }, 5000 );
                $( '#audioname' ).stop().show().css( 'opacity', 1 ).delay( 5000 ).animate( {
                    opacity: 0.1
                }, 12500 );
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

            $( '#vis_Barred' ).trigger( 'click' );

        }
    }

    return controller;

}