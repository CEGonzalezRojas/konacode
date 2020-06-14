/* 
KonamiCodeJS
Author: Claudio Esteban Gonzalez Rojas @cegonzalezrojas

JS Implementation of the classic code. Features:
1. Support for desktop and mobile
2. Support for the original Konami Code sequence
3. You can make your own custom sequences
4. Skins for customize the experience
5. Sequences should start with UP, DOWN, LEFT or RIGHT
*/
class KonamiCode{
    
    /* Setup is an object with like:
    {
        codes: [    // Array of Objects.
            {
                sequence: [ KonamiCode.keys.UP, KonamiCode.keys.UP, ... ],    // Array with sequence. Allowed 'keys' values are in KonamiCode.keys. You can also use the values ( "UP", "DOWN", … ). 3 keys minimun
                then: _ => { ... }  // Function to be called when the sequence is complete,
                skin: KonamiCode.skins.SKIN // Skin for the joystick.
                color: KonamiCode.colors.COLOR  // Some skins have color variations
            },
            –
        ],
        event: 'keyup' // String that indicate the keyboard event to handler ( keyup || keydown )
    }
    */
    constructor( setup ){
        
        // Only one instance per machine
        if( KonamiCode.n_n ) throw new Error( 'Only one instance of KC allowed' );
        
        this.register( setup.codes );
        
        // If all the codes where invalid
        if( !this.codes.length ) throw new Error( 'You have to define at least 1 valid code' );
    
        // Saving reference
        KonamiCode.n_n = this;
        this.currentSequence = [];
        this.delayedDelta = 500;
        
        this.domParser = new DOMParser();
        KonamiCode.appendStyles();
        
        // Check event for handler keys
        if( !setup.event || ( setup.event && KonamiCode.keyboardEvent.indexOf( setup.event ) == -1 ) ){
            setup.event = 'keyup';
        }
        this.keyboardEvent = 'keyup';
        
        // For mobile support
        this.touchXStart = this.touchXEnd = this.touchYStart = this.touchYEnd = null;
        this.touchMinMovement = 15;
        
        this.activeJoystick = null;
        
        this.events();
    }
    
    // Register 1 or more codes
    register( codes ){
        
        // Parsing the setup, check everything is fine
        if( !codes ) throw new Error( 'You have to define at least 1 code' );
        
        if( !Array.isArray( codes ) ){
            codes = [ codes ];
        }
        
        const basicSetup = KonamiCode.basicSetup();
        if( !this.codes) this.codes = [];
        
        for( const code of codes ){
            
            // Check sequence. Remove invalid keys from it
            if( code.sequence ){
                
                if( !Array.isArray( code.sequence ) || code.sequence.length < 3 ) continue;
                
                code.sequence = code.sequence.map( k => k.toUpperCase ? k.toUpperCase() : k  );
                
                // Check if start with UP, DOWN, LEFT, RIGHT
                if( [ KonamiCode.keys.UP, KonamiCode.keys.DOWN, KonamiCode.keys.LEFT, KonamiCode.keys.RIGHT ].indexOf( code.sequence[0] ) == -1 ) continue;
                
                const keysValues = Object.values( KonamiCode.keys );
                if( code.sequence.join() != code.sequence.filter( key => keysValues.indexOf( key ) != -1 ).join() ){
                    continue;
                }
                
            }
            else{
                code.sequence = basicSetup.sequence;
            }
            
            // Check skin
            if( code.skin && ( typeof code.skin != "string" || Object.values( KonamiCode.skins ).indexOf( code.skin ) == -1 ) ){
                code.skin = basicSetup.skin;
            }
            
            // Check color
            if( code.color && ( typeof code.color != "string" || Object.values( KonamiCode.colors ).indexOf( code.color ) == -1 ) ){
                delete code.color;
            }
            
            // Remove previous code if exists
            if( this.codes.find( c => c.sequence.join() == code.sequence.join()) ){
                this.codes.splice( this.codes.findIndex( c => c.sequence.join() == code.sequence.join()), 1 );
            }
            
            // Save the sequence
            this.codes.push( code );
            
        }
        
    }
    
    // Set handler for both desktop & mobile
    events(){
        
        if( KonamiCode.isMobile() ){
            
            if( "ontouchstart" in window ){
                // Touch events
                window.addEventListener( "touchstart", e => { this.touchStart(e); })
                window.addEventListener( "touchend", e => { this.touchEnd(e); })
                window.addEventListener( "touchcancel", e => { this.touchCancel(e); })
            } 
            else{
                // Mouse events
                window.addEventListener( "mousedown", e => { this.touchStart(e); })
                window.addEventListener( "mouseup", e => { this.touchEnd(e); })
            }
            
        }
        else{
            // Keyboard
            window.addEventListener( this.keyboardEvent , e => { this.handler(e); } );
        }
        
    }
    
    // Handler event for keys
    handler( e ){
        
        this.cleanExecTimeout();
        
        if( !KonamiCode.n_n || ( !e.code && !e.keyCode ) ) return;
        
        const keyCode = this.transcript( e.code || e.keyCode );
        
        // Obtain the current index and check if there a sequence on the way
        const currentIndex = this.currentSequence.length;
        
        if( !this.validCodes ) this.validCodes = this.codes;
        
        const invalidCodes = this.validCodes.filter( code => code.sequence[ currentIndex ] != keyCode );
        this.validCodes = this.validCodes.filter( code => code.sequence[ currentIndex ] == keyCode );
        
        if( this.validCodes.length ){
            
            this.currentSequence.push( keyCode );    
            
            // Call to progress callback
            for( const code of this.validCodes ){
                
                if( code.progress && typeof code.progress == 'function' ){
                    code.progress( this.currentSequence.length , Math.floor( this.currentSequence.length / code.sequence.length * 100 ) );
                }
                
            }
            
            for( const code of invalidCodes ){
                
                if( code.progress && typeof code.progress == 'function' ){
                    code.progress( 0, 0 );
                }

            }
            
            // Sequence finish?
            const sequenceFinish = this.validCodes.filter( code => code.sequence.length == this.currentSequence.length );
            
            if( sequenceFinish.length ){
                
                // If only one, execute and reset (If there more than one, delayed the execution)
                this.exec( sequenceFinish[0], this.validCodes.length != 1 );
                
            }
            else{
                
                // Check for the next key. If there is a code that need joystick, show it! (If there are more than one, it use the first skin)
                const nextKeys = this.validCodes.filter( code => KonamiCode.needJoystick( this.transcript( code.sequence[ this.currentSequence.length ] ) ) );
                
                if( nextKeys.length ){
                    this.showJoystick( nextKeys[0] );
                }
                else{
                    this.hideJoystick();
                }
                
            }
            
        }
        else{
            this.resetCurrentSequence();
        }
    }
    
    // Execute the callback
    exec( code, delayed ){
        
        if( code && code.callback ){
            
            if( delayed ){
                
                // Wait for execution
                this.execTimeout = setTimeout( _ => { this.exec( code ) }, this.delayedDelta );
                
            }
            else{
                
                if( typeof code.callback == 'function' ) code.callback();
                
                this.resetCurrentSequence();
            }
            
        }
        else{
            this.resetCurrentSequence();
        }
        
    }
    
    // Clean the exec delayed
    cleanExecTimeout(){
        
        clearTimeout( this.execTimeout );
        
    }
    
    // Clean the sequence
    resetCurrentSequence(){
        
        // Reset progress
        for( const code of this.codes ){
                
            if( code.progress && typeof code.progress == 'function' ){
                code.progress( 0, 0 );
            }

        }
        
        this.hideJoystick();
        
        this.currentSequence.length = 0;
        delete this.validCodes;   
    }
    
    // Transcript e.code or e.keyCode to a valid member of a KC sequence
    transcript( code ){
        
        switch( code ){
            case "ArrowUp":
            case 38:
            case KonamiCode.keys.UP:
                return KonamiCode.keys.UP;
                break;
            case "ArrowDown":
            case 40:
            case KonamiCode.keys.DOWN:
                return KonamiCode.keys.DOWN;
                break;
            case "ArrowLeft":
            case 37:
            case KonamiCode.keys.LEFT:
                return KonamiCode.keys.LEFT;
                break;
            case "ArrowRight":
            case 39:
            case KonamiCode.keys.RIGHT:
                return KonamiCode.keys.RIGHT;
                break;
            case "KeyA":
            case 65:
            case KonamiCode.keys.A:
                return KonamiCode.keys.A;
                break;
            case "KeyB":
            case 66:
            case KonamiCode.keys.B:
                return KonamiCode.keys.B;
                break;
            case "KeyX":
            case 88:
            case KonamiCode.keys.X:
                return KonamiCode.keys.X;
                break;
            case "KeyY":
            case 89:
            case KonamiCode.keys.Y:
                return KonamiCode.keys.Y;
                break;
            default:
                return -1;
        }
        
    }
    
    // Touch/Mouse events
    
    // Save initial position
    touchStart( e ){
        
        if( "ontouchstart" in window ){
            // Touchstart: We only take care of the fisrt touch
            this.touchXStart = e.touches[0].clientX;
            this.touchYStart = e.touches[0].clientY;
        }
        else{
            // Mousedown
            this.touchXStart = e.clientX;
            this.touchYStart = e.clientY;
        }
    }
    
    // Cancel movement (Reset variables)
    touchEnd( e ){
        this.touchXStart = null;
        this.touchYStart = null;
    }
    
    // Check movement
    touchEnd( e ){
        
        if( this.touchXStart === null || this.touchYStart === null ) return;
        
        if( "ontouchend" in window ){
            // Touchendt: We only take care of the fisrt touch
            this.touchXEnd = e.changedTouches[0].clientX;
            this.touchYEnd = e.changedTouches[0].clientY;
        }
        else{
            // Mousedown
            this.touchXEnd = e.clientX;
            this.touchYEnd = e.clientY;
        }
        
        // The bigger difference is the direction ( Default vertical )
        // Check for vertical move, then horizontal. One movement allowed per "touch cycle"
        if( Math.abs( this.touchYEnd - this.touchYStart ) >= Math.abs( this.touchXEnd - this.touchXStart ) ){
            if( this.touchYEnd + this.touchMinMovement < this.touchYStart ){
                // Up
                this.handler( { code: "ArrowUp" } );
            }
            else if( this.touchYEnd - this.touchMinMovement > this.touchYStart ){
                // Down
                this.handler( { code: "ArrowDown" } );
            }
        }
        else{
            if( this.touchXEnd + this.touchMinMovement < this.touchXStart ){
                // Down
                this.handler( { code: "ArrowLeft" } );
            }
            else if( this.touchXEnd - this.touchMinMovement > this.touchXStart ){
                // Down
                this.handler( { code: "ArrowRight" } );
            }   
        }
        
    }
    
    // Create a Joystick
    showJoystick( setup ){
        
        if( this.activeJoystick ){
            
            if( this.currentSequence.length ){
                this.activeJoystick.classList.add( "show" );   
            }
            
            const color = setup && setup.color? setup.color : null;
            if( color ){
                // Only change color
                const skin = this.activeJoystick.dataset.skin.split( "-" )[0];
                this.activeJoystick.dataset.skin = `${skin}-${color}`;
            }
            
            return;
        }
        
        // Get the skin
        const skin = setup && setup.skin? setup.skin : KonamiCode.skins.SNES;
        const color = setup && setup.color? setup.color : null;
        
        // Create the html element, assign events and append to the body
        this.activeJoystick = this.domParser.parseFromString( KonamiCode.htmlTemplates[ skin ], 'text/html' ).body.firstChild;
        if( color ) this.activeJoystick.dataset.skin = `${skin}-${color}`;
        
        // Activete
        setTimeout( _ => { this.activeJoystick.classList.add( "show" ); }, 100 );
        
        // For removing on hide
        this.activeJoystick.addEventListener( "transitionend", e => {
           
            if( !this.activeJoystick.classList.contains( "show" ) ){
                this.activeJoystick.remove();
                this.activeJoystick = null;
            }
            
        });
        
        // Keys ( A, B, C, D )
        for( const key of [ 'a', 'b', 'x', 'y' ] ){
            const element = this.activeJoystick.querySelector( `[${key}]` );
            if( element ){
                
                element.addEventListener( "animationend", e => {
                    if( e.animationName == `${skin}-joystick-clicked`){
                        element.removeAttribute( 'clicked' );
                    }
                });
                
                element.addEventListener( "click", e => {
                    
                    element.setAttribute( 'clicked', true );
                    this.handler( { code: `Key${key.toUpperCase()}` } );
                    
                });
                
            }
        }
        
        document.body.append( this.activeJoystick );
        
    }
    
    // Remove the current joystick
    hideJoystick(){
        
        if( !this.activeJoystick ) return;
        
        this.activeJoystick.classList.remove( "show" );
        
    }
    
    /*========================
        Class Methods
    ========================*/
    
    // Get the basic setup
    static basicSetup(){
        return {
            sequence: [ KonamiCode.keys.UP, KonamiCode.keys.UP, KonamiCode.keys.DOWN, KonamiCode.keys.DOWN, KonamiCode.keys.LEFT, KonamiCode.keys.RIGHT, KonamiCode.keys.LEFT, KonamiCode.keys.RIGHT, KonamiCode.keys.B, KonamiCode.keys.A ],
            skin: KonamiCode.skins.SNES
        };
    }
    
    // Keys that need visual joystick
    static needJoystick( keyCode ){
        return [ KonamiCode.keys.A, KonamiCode.keys.B, KonamiCode.keys.X, KonamiCode.keys.Y ].indexOf( `${keyCode}` ) != -1;
    }
    
    // Check if it's a mobile device
    static isMobile( options ){
        
        const groups = [ /Android/i, /iPhone/i, /iPod/i, /iPad/i, /Windows Phone/i, /webOS/i, /SymbianOS/i, /RIM/i, /BB/i ];
        const useragent = navigator.userAgent;

        return groups.find( g => useragent.match( g ) )? true : false;
        
    }
    
    // Import the CSS style inline to the code
    static appendStyles(){
        
        this.htmlTemplates = {};
        
        // Load valid skins && html templates
        for( const skin of Object.values( this.skins ) ){
            
            const link = document.createElement( "LINK" );
            link.href = `${this.source}skins/${skin}/style.css`;
            link.type = "text/css";
            link.rel = "stylesheet";
            
            document.querySelector( "head" ).append( link );
            
            // HTML Template
            fetch( `src/skins/${skin}/config.json` )
            .then( response => response.json() )
            .then( json => {
                
                this.htmlTemplates[ skin ] = json.html? json.html : '<div></div>';
                
            })
            .catch( e => {
                this.htmlTemplates[ skin ] = '<div></div>';
            });
            
        }
        
    }
}

// Keys for codes
KonamiCode.keys = {
    UP: "UP",
    DOWN: "DOWN",
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    B: "B",
    A: "A",
    X: "X",
    Y: "Y",
};

// Skins
KonamiCode.skins = {
    SNES: "snes",
    SWITCH: "switch"
};

// Colors
KonamiCode.colors = {
    RED: "red",
    BLUE: "blue",
    YELLOW: "yellow",
    GREEN: "green",
    PINK: "pink",
    PURPLE: "purple",
    GRAY: "gray",
    RAINBOW: "rainbow"
};

// KeyboardEvent
KonamiCode.keyboardEvent = [ 'keyup', 'keydown' ];

// Save current script URL
KonamiCode.source = `${document.currentScript.src.split("/").slice(0,-1).join("/")}/`;