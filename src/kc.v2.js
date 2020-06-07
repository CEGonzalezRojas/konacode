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
        codes: [    // Array of Objects
            {
                sequence: [ KonamiCode.keys.UP, KonamiCode.keys.UP, ... ],    // Array with sequence. Allowed 'keys' values are in KonamiCode.keys
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
    
        // Saving reference
        KonamiCode._T_T = this;
        
        this.domParser = new DOMParser();
        this.appendStyles();
        
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
            codes: []  
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
    GRAY: "gray"
};

// Save current script URL
KonamiCode.source = `${document.currentScript.src.split("/").slice(0,-1).join("/")}/`;