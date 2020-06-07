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
                sequence: [ KonamiCode.keys.UP, KonamiCode.keys.UP, ... ],    // Array with sequence. Allowed 'keys' values are in KonamiCode.keys. You can also use the values ( "UP", "DOWN", … )
                then: _ => { ... }  // Function to be called when the sequence is complete,
                skin: KonamiCode.skins.SKIN // Skin for the joystick.
                color: KonamiCode.colors.COLOR  // Some skins have color variations
            },
            –
        ]
    }
    */
    constructor( setup ){
        
        // Only one instance per machine
        if( KonamiCode._T_T ) throw new Error( 'Only one instance of KC allowed' );
        
        this.register( setup.codes );
        
        // If all the codes where invalid
        if( !this.codes.length ) throw new Error( 'You have to define at least 1 valid code' );
        
        console.log( this.codes );
    
        // Saving reference
        KonamiCode._T_T = this;
        
        this.domParser = new DOMParser();
        this.appendStyles();
        
    }
    
    // Registrate 1 or more codes
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
                
                if( !Array.isArray( code.sequence ) ) continue;
                
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

// Skins
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

// Save current script URL
KonamiCode.source = `${document.currentScript.src.split("/").slice(0,-1).join("/")}/`;