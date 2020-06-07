/* 
KonamiCodeJS
Author: Claudio Esteban Gonzalez Rojas @cegonzalezrojas

JS Implementation of the classic code. Features:
1. Support for desktop and mobile
2. Support for the original Konami Code sequence
3. You can make your own custom sequences
4. Skins for customize the experience
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
        if( KonamiCode._T_T ) throw new Error( 'Only one instance of KC allowed' );
        
        this.register( setup.codes );
        
        // If all the codes where invalid
        if( !this.codes.length ) throw new Error( 'You have to define at least 1 valid code' );
    
        // Saving reference
        KonamiCode._T_T = this;
        this.currentSequence = [];
        
        this.domParser = new DOMParser();
        this.appendStyles();
        
        // Check event for handler keys
        if( !setup.event || ( setup.event && KonamiCode.keyboardEvent.indexOf( setup.event ) == -1 ) ){
            setup.event = 'keyup';
        }
        this.keyboardEvent = 'keyup';
        
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
    
    // Import the CSS style inline to the code
    appendStyles(){
        
        // Load valid skins
        for( const skin of Object.values( KonamiCode.skins ) ){
            
            const link = document.createElement( "LINK" );
            link.href = `${KonamiCode.source}skins/${skin}.css`;
            link.type = "text/css";
            link.rel = "stylesheet";
            
            document.querySelector( "head" ).append( link );
            
        }
        
    }
    
    // Set handler for both desktop & mobile
    events(){
        
        // Keyboard
        window.addEventListener( this.keyboardEvent , e => { this.handler(e); } );
        
    }
    
    // Handler event for keys
    handler( e ){
        
        if( !KonamiCode._T_T || ( !e.code && !e.keyCode ) ) return;
        
        const keyCode = this.transcript( e.code || e.keyCode );
        
        // Obtain the current index and check if there a sequence on the way
        const currentIndex = this.currentSequence.length;
        
        if( !this.validSequences ) this.validSequences = this.codes;
        this.validSequences = this.validSequences.filter( code => code.sequence[ currentIndex ] == keyCode );
        
        if( this.validSequences.length ){
            console.log( this.validSequences );
            this.currentSequence.push( keyCode );
        }
        else{
            console.log( 'fail' );
            this.currentSequence.length = 0;
            delete this.validSequences;
        }
        
       /* 
        // Flag para saber si debe continuar o no
        var continue_flag = true;
        
        // Obtener código
        var key = e.keyCode;
        
        // Revisar si cumple con el paso actual
        if( key !== window.ko_co.options.secuence[ window.ko_co.step ] ) continue_flag = false;
        
        // Revisar si debe continuar o no
        if( !continue_flag ){
            
            // Resetear valores
            window.ko_co.reset();

            return;
        }
        
        // Ver si es necesario mostrar el teclado o no
        window.ko_co.request_keyboard( window.ko_co.step + 1 );
        
        // El step aumenta y se comprueba si es ya se supero el último paso
        if( ++(window.ko_co.step) >= window.ko_co.options.secuence.length ){
            
            // Se ejecuta el código
            window.ko_co.do();
            
        }
        */
    }
    
    // Transcript e.code or e.keyCode to a valid member of a KC sequence
    transcript( code ){
        
        switch( code ){
            case "ArrowUp":
            case 38:
                return KonamiCode.keys.UP;
                break;
            case "ArrowDown":
            case 40:
                return KonamiCode.keys.DOWN;
                break;
            case "ArrowLeft":
            case 37:
                return KonamiCode.keys.LEFT;
                break;
            case "ArrowRight":
            case 39:
                return KonamiCode.keys.RIGHT;
                break;
            case "KeyA":
            case 65:
                return KonamiCode.keys.A;
                break;
            case "KeyB":
            case 66:
                return KonamiCode.keys.B;
                break;
            case "KeyX":
            case 88:
                return KonamiCode.keys.X;
                break;
            case "KeyY":
            case 89:
                return KonamiCode.keys.Y;
                break;
            default:
                return -1;
        }
        
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
        return [65, 66, 88, 89, "KeyA", "KeyB", "KeyX", "KeyY" ].indexOf( keyCode ) != -1;
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