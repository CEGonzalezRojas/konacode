// Implementación del Konami Code en JS
// Author: Claudio Esteban Gonzalez Rojas @cegonzalezrojas
class KonamiCode{
    
    // Constructor de la clase: Guardado de opciones de usuario
    constructor( options ){
        
        // Si ya existe un KC activo
        if( window.ko_co ) return;
        
        // Guardar referencia a KC en window
        window.ko_co = this;
        
        // Realizar la carga de los estilos
        this.append_styles();
        
        // Definición de propiedades:
        this.step = 0,      // Para saber paso de secuencia
        this.count = 0;     // Número de veces que se ha ejecutado el código
        
        // Propiedades para compatibilidad móvil
        this.last_x = 0;
        this.last_y = 0;
        
        // Opciones por defecto
        this.options = {
            max: -1, // Cantidad de veces que puede ser usado el código por sesión.
            event: "keyup", // Solo un evento permitido para la revisión del código
            mobile_event_start: [ "mousedown", "touchstart" ], // Eventos para revisión compatible con dispositivos táctiles
            mobile_event_end: [ "mouseup", "touchend" ],
            secuence: [ 38, 38, 40, 40, 37, 39, 37, 39, 66, 65], // Secuencia base para el código
            mobile_secuence: [], // Secuencia móvil para el código,
            valid_keys: {   // Llaves y códigos válidos para el código
                "A": 65,
                "B": 66,
                "X": 88,
                "Y": 89,
                "UP": 38,
                "DOWN": 40,
                "LEFT": 37,
                "RIGHT": 39
            },
            need_keyboard: [ 65, 66, 88, 89 ],
            callback: null, // Función llamada al completar el código
        };
        
        // Si se configuro con opciones
        if( options && typeof options == "object" && !Array.isArray( options ) ){
            
            // Hacer merge manual para comprobaciones
            
            // Max
            if( options.max && parseInt( options.max ) ){
                this.options.max = parseInt( options.max );
            }
            
            // Event
            if( options.event && typeof options.event == "string" ){
                this.options.event = options.event;
            }
            
            // Obtención de las llaves y valores válidos
            var keys = Object.keys( this.options.valid_keys );
            var values = Object.values( this.options.valid_keys );
            
            // Secuencia de teclas
            if( options.secuence && Array.isArray( options.secuence ) && options.secuence.length > 1 ){
                
                // Mapear la secuencia para validar datos
                options.secuence = options.secuence.map( o => o.toUpperCase ? o.toUpperCase() : o  );
                
                // Revisión de los elementos de la secuencia del usuario
                options.secuence = options.secuence.filter( o => keys.indexOf( o ) != -1 || values.indexOf( o ) != -1 );
                
                // Si la nueva secuencia tiene al menos 2 elementos válidos
                if( options.secuence.length > 1 ){
                    
                    // Limpiar la secuencia actual
                    this.options.secuence = [];
                    
                    // Agregar valores
                    options.secuence.forEach( o => this.options.secuence.push( parseInt(o)? parseInt(o) : this.options.valid_keys[ o ] ) );
                    
                }
                                             
            }
            
            // Generar la secuencia móvil
            this.options.secuence.forEach( o => this.options.mobile_secuence.push( keys[ values.indexOf( o ) ] ) );
            
            // Callback
            if( options.callback && typeof options.callback == "function" ){
                this.options.callback = options.callback;
            }
            
        }
        
        // Aplicar evento para revisión
        window.addEventListener( this.options.event , this.handler , { passive: true });
        
        // Aplicar evento para la revisón compatible con dispositivos táctiles
        this.options.mobile_event_start.forEach( event => window.addEventListener( event , this.mobile_handler_start , { passive: true } ) );
        
        this.options.mobile_event_end.forEach( event => window.addEventListener( event , this.mobile_handler_end , { passive: true } ) );
        
    }
    
    // Método para la revisión de las teclas
    handler( e ){
        
        // Si no hay KonamiCode o no hay keyCode
        if( !window.ko_co || !e.keyCode ) return;
        
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
        
    }
    
    // Método para revisión de código en móviles o dispositivos táctiles
    mobile_handler_start( e ){
        
        // Si no hay KonamiCode
        if( !window.ko_co || window.ko_co.snes_joystick ) return;
                
        // Guardar los valores iniciales de X e Y
        window.ko_co.last_x = e.clientX || (e.originalEvent? e.originalEvent.pageX : 0) || (e.changedTouches && e.changedTouches[0]? e.changedTouches[0].clientX : 0);
        
        window.ko_co.last_y = e.clientY || (e.originalEvent? e.originalEvent.pageY : 0) || (e.changedTouches && e.changedTouches[0]? e.changedTouches[0].clientY : 0);
        
    }
    
    // Método para revisión de código en móviles o dispositivos táctiles
    mobile_handler_end( e ){
        
        // Si no hay KonamiCode
        if( !window.ko_co || window.ko_co.snes_joystick ) return;
                
        // Obtener los valores de cambio
        var move_x = e.clientX || (e.originalEvent? e.originalEvent.pageX : 0) || (e.changedTouches && e.changedTouches[0]? e.changedTouches[0].clientX : 0);
        
        var move_y = e.clientY || (e.originalEvent? e.originalEvent.pageY : 0) || (e.changedTouches && e.changedTouches[0]? e.changedTouches[0].clientY : 0);

        // Flag para saber si debe continuar o no
        var continue_flag = true;
        
        // Revisión de paso
        switch( window.ko_co.options.mobile_secuence[ window.ko_co.step ] ){
            case "UP":
                
                // Si no fue un movimiento hacia arriba
                if( move_y >= window.ko_co.last_y ) continue_flag = false;
                
                break;
            case "DOWN":
                
                // Si no fue un movimiento hacia abajo
                if( move_y <= window.ko_co.last_y ) continue_flag = false;
                
                break;
            case "LEFT":
                
                // Si no fue un movimiento hacia abajo
                if( move_x >= window.ko_co.last_x ) continue_flag = false;
                
                break;
            case "RIGHT":
                
                // Si no fue un movimiento hacia abajo
                if( move_x <= window.ko_co.last_x ) continue_flag = false;
                
                break;
            default:
                
                // Revisión de la tecla envíada ( A|B por ahora )
                if( e.key !== window.ko_co.options.mobile_secuence[ window.ko_co.step ] )  continue_flag = false;
                
                break;
        }
        
        // Revisar si debe continuar o no
        if( !continue_flag ){
            
            // Resetear valores
            window.ko_co.reset();

            return;
        }
        
        // Revisar si el siguiente paso requiere de teclado
        window.ko_co.request_keyboard( window.ko_co.step + 1 );
        
        // El step aumenta y se comprueba si es ya se supero el último paso
        if( ++(window.ko_co.step) >= window.ko_co.options.secuence.length ){
            
            // Se ejecuta el código
            window.ko_co.do();
            
        }
        
    }
    
    // Método activado cuando la ejecución del código fue éxitosa
    do(){
        
        // Reinicio de contador de pasos
        this.step = 0;
        
        // Aumentar el contador de veces
        this.count++;
        
        // Si existe un máximo de veces a ejecutar del código y fue igualado o sobrepasado, quitar evento
        if( this.options.max != -1 && this.count >= this.options.max ){
        
            // Quitar evento
            window.removeEventListener( this.options.event , this.handler );
           
        }
        
        // Llamar a callback si es que existe
        if( this.options.callback && typeof this.options.callback == "function" ){
            
            // Llamar a función
            this.options.callback( true );
            
            // Añadir evento para cancelación
            window.addEventListener( "click", this.cancel );
            window.addEventListener( "keyup", this.cancel );
            
        }
    }
    
    // Volver los valores de los pasos actuales a 0
    reset(){
        
        // Resetear pasos
        this.step = 0;

        // Ocultar teclado ( Si existe )
        this.keyboard( false );
        
    }
    
    // Método para llamar a callback y terminar la ejecución realizada
    cancel( e ){
        
        // Si no hay KonamiCode o no hay keyCode
        if( !window.ko_co || !window.ko_co.options.callback || typeof window.ko_co.options.callback != "function" ) return;
        
        // Remover evento para cancelación
        window.removeEventListener( "click", window.ko_co.cancel );
        window.removeEventListener( "keyup", window.ko_co.cancel );
        
        // Llamar a función para cancelar
        window.ko_co.options.callback( false );
        
    }
    
    // Revisión si el próximo paso requiere de teclado
    request_keyboard( step ){
        
        // Revisar si el siguiente paso requiere de teclado.
        if(  this.options.need_keyboard.indexOf( this.options.secuence[ step ] ) != -1 ){
            
            // Mostrar teclado
            this.keyboard( true );
            
        }
        else{
            
            // Ocultar teclado
            this.keyboard( false );
            
        }
        
    }
    
    // Agregar/Remover el teclado en pantalla para la ejecución del código
    keyboard( show ){
        
        // Si se necesita mostrar teclado
        if( show ){
            
            // Si ya existe teclado, retornar
            if( this.snes_joystick ) return;
            
            // Generar clon a partir del template
            this.snes_joystick = this.snes_joystick_generator();
            
            // Insertar en body
            document.body.append( this.snes_joystick );
            
            // Activar teclado
            setTimeout( e => this.snes_joystick.classList.add( "active" ), 100 );
            
        }
        else{
            
            // Comprobar existencia de teclado
            if( this.snes_joystick ){
                
                // Guardar referencia
                var last_keyboard = this.snes_joystick;
                
                // Eliminar referencia
                this.snes_joystick = null;
                
                // Desactivar y eliminar
                last_keyboard.addEventListener( "transitionend", e => {
                    last_keyboard.remove();
                });
                
                // Quitar la clase active
                last_keyboard.classList.remove( "active" );
                
            }
            
        }
        
    }
    
    // Generar de joystick de SNES
    snes_joystick_generator(){
        
        // Clonar elemento
        var joystick = new DOMParser().parseFromString( `<div class="snes"><div class="right"></div><div class="right d"></div><div class="back"></div><div class="front"></div><div class="patch"><div n></div><div s></div><div st></div></div><div class="circle"></div><div class="buttons"><div y></div><div x></div></div><div class="buttons down"><div b></div><div a></div></div></div>`, 'text/html' ).body.firstChild;
        
        // Obtener botones
        var buttons = joystick.querySelectorAll( ".buttons > div" );
        
        // Generar evento de click
        Array.from( buttons ).forEach( btn => {
            
            // Agregar evento para fin de animación
            btn.addEventListener( "animationend", e => {
                
                // Remover el atributo clicked
                btn.removeAttribute( "clicked" );
                
            });
            
            // Al hacer click, enviar evento
            btn.addEventListener( "click", e => {
                
                // Agregar el atributo clicked
                btn.setAttribute( "clicked", true );
                
                // Detener propagación
                e.stopPropagation();
                
                // Obtener llave y realizar acción
                var keyCode = this.options.valid_keys[  btn.attributes[0].name.toUpperCase() ];
                
                // Solo si existe la llave
                if( keyCode ){
                    
                    // Enviar evento con la tecla seleccionada
                    this.handler( { keyCode: keyCode } );
                    
                }
                
            });
            
        });
        
        
        
        return joystick;
        
    }
    
    // Agregar los estilos necesarios para el control de SNES
    append_styles(){
        
        // Crear elemento para cargar estilo
        var link = document.createElement( "LINK" );
        
        // Agregar la ruta correcta
        link.href = `${KonamiCode.source_url}kc.css`;
        
        // Incluir attributos necesarios
        link.type = "text/css";
        link.rel = "stylesheet";

        // Añadir al header
        document.querySelector( "head" ).appendChild( link );
        
    }
    
}

// Obtener URL actual del script y guardar para referenciar estilos
KonamiCode.source_url = ( src => { src.pop(); return `${src.join("/")}/`; } )( document.currentScript.src.split("/") );