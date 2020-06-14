window.addEventListener( 'load', _ => {
                
    let completeKonami = false, completeSecretCode = completeSweetSecretCode = false;

    c = new KonamiCode({
            codes: [
                {
                    callback: _ =>{

                        document.querySelector( "[data-code=konami]" ).classList.add( "complete" );

                        // Reset
                        setTimeout( _ => {
                            completeKonami = false;
                            document.querySelector( "[data-code=konami]" ).classList.remove( "complete" );
                            const keys = Array.from( document.querySelectorAll( "[data-code=konami] > *" ) );
                            for( const k of keys ){ k.classList.remove( 'active' ); }
                        }, 1400 );

                        new Audio( 'assets/sounds/zapsplat_multimedia_game_sound_soft_warm_watery_positive_tone_003_52090.mp3' ).play();

                    },
                    progress: (count, percent) => {

                        if( completeKonami ) return;

                        const keys = Array.from( document.querySelectorAll( "[data-code=konami] > *" ) );

                        if( count ){
                            keys[ count - 1 ].classList.add( 'active' );
                        }
                        else{
                            for( const k of keys ){ k.classList.remove( 'active' ); }
                        }

                        completeKonami = percent == 100;

                    }
                },
                {
                    sequence: [  KonamiCode.keys.LEFT, KonamiCode.keys.X, KonamiCode.keys.Y, KonamiCode.keys.RIGHT, KonamiCode.keys.RIGHT, KonamiCode.keys.B ],
                    skin: KonamiCode.skins.SWITCH,
                    callback: exec =>{
                        document.querySelector( "[data-code=secret]" ).classList.add( "complete" );

                        // Reset
                        setTimeout( _ => {
                            completeSecretCode = false;
                            document.querySelector( "[data-code=secret]" ).classList.remove( "complete" );
                            const keys = Array.from( document.querySelectorAll( "[data-code=secret] > *" ) );
                            for( const k of keys ){ k.classList.remove( 'active' ); }
                        }, 1400 );

                        new Audio( 'assets/sounds/zapsplat_multimedia_game_sound_relaxed_zen_warm_positive_alert_003_52076.mp3' ).play();

                    },
                    progress: (count, percent) => {

                        if( completeSecretCode ) return;

                        const keys = Array.from( document.querySelectorAll( "[data-code=secret] > *" ) );

                        if( count ){
                            keys[ count - 1 ].classList.add( 'active' );
                        }
                        else{
                            for( const k of keys ){ k.classList.remove( 'active' ); }
                        }

                        completeSecretCode = percent == 100;

                    }
                },
                {
                    sequence: [  KonamiCode.keys.LEFT, KonamiCode.keys.RIGHT, KonamiCode.keys.X, KonamiCode.keys.X, KonamiCode.keys.Y, KonamiCode.keys.Y ],
                    skin: KonamiCode.skins.SWITCH,
                    color: KonamiCode.colors.BLUE,
                    callback: exec =>{
                        document.querySelector( "[data-code=sweet-secret]" ).classList.add( "complete" );

                        // Reset
                        setTimeout( _ => {
                            completeSweetSecretCode = false;
                            document.querySelector( "[data-code=sweet-secret]" ).classList.remove( "complete" );
                            const keys = Array.from( document.querySelectorAll( "[data-code=sweet-secret] > *" ) );
                            for( const k of keys ){ k.classList.remove( 'active' ); }
                        }, 1400 );

                        new Audio( 'assets/sounds/zapsplat_multimedia_game_sound_relaxed_zen_warm_positive_alert_003_52076.mp3' ).play();

                    },
                    progress: (count, percent) => {

                        if( completeSweetSecretCode ) return;

                        const keys = Array.from( document.querySelectorAll( "[data-code=sweet-secret] > *" ) );

                        if( count ){
                            keys[ count - 1 ].classList.add( 'active' );
                        }
                        else{
                            for( const k of keys ){ k.classList.remove( 'active' ); }
                        }

                        completeSweetSecretCode = percent == 100;

                    }
                }
            ]

        }
    );

});