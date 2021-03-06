/*
 * Omnibug
 * Intermediary between eventPage and devTools panel
 * (used for message passing only)
 *
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send
 * a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041,
 * USA.
 *
 */
( function() {

    /**
     * Callback for panelCreated event
     */
    var panelCreated = function( panel ) {
        var queuedMessages = [],
            panelWindow,  // reference to devtools_panel.html's `window` object
            port;

        port = browser.runtime.connect( { name: "omnibug-" + browser.devtools.inspectedWindow.tabId } );

        /**
         * Receieves messages from the eventPage
         */
        port.onMessage.addListener( function( msg ) {
            if( panelWindow ) {
                panelWindow.Omnibug.receive_message( msg );
            } else {
                queuedMessages.push( msg );
            }
        } );

        /**
         * Called when the devtools panel is first shown
         */
        panel.onShown.addListener( function tmp( _window ) {
            panel.onShown.removeListener( tmp ); // Run once only
            panelWindow = _window;

            // Release queued messages
            var msg;
            while( ( msg = queuedMessages.shift() ) ) {
                panelWindow.Omnibug.receive_message( msg );
            }

            // Inject a reply mechanism into the caller
            panelWindow.Omnibug.send_message = function( msg ) {
                port.postMessage( msg );
            };
        } );
    };


    /**
     * Create the panel
     */
    browser.devtools.panels.create( "Omnibug",
                                   "images/o-32.png",
                                   "devtools_panel.html",
                                   panelCreated
                                 );

    // public
    return {};

}() );
