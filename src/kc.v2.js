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
    
    constructor(){
        
        // Only one instance per machine
        if( KonamiCode._T_T ) throw new Error( 'Only one instance of KC allowed' );
    
        // Saving reference
        KonamiCode._T_T = this;
        
        this.domParser = new DOMParser();
        
        // Stylizing
        this.appendStyles();
        
    }
    
    // Import the CSS style inline to the code
    appendStyles(){
        
        // Load valid skins
        for( const skin of KonamiCode.skins() ){
            
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
    // Get valid skins
    static skins(){
        return [ "snes", "switch" ];
    }
}
// Save current script URL
KonamiCode.source = `${document.currentScript.src.split("/").slice(0,-1).join("/")}/`;