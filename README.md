# Konacode
Add secrets codes to your web! Desktop and mobile support. Inspired by Konami Code
Features:
1. Support for desktop and mobile
2. Support for the original Konami Code sequence (Default sequence)
3. You can make your own custom sequences
4. Skins for customize the experience
5. Sequences should start with UP, DOWN, LEFT or RIGHT

# How to use
First, include the kc.js or kc.min.js to your page:
```
<script type="application/javascript" src="src/kc.js"></script>
<script type="application/javascript" src="src/kc.min.js"></script>
```

Now, register your sequences:
```
…
const c = new KonaCode({
            codes: [
                {
                    callback: _ =>{
                        window.location = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
                    }
                },
                {
                    sequence: [  KonaCode.keys.LEFT, KonaCode.keys.X, KonaCode.keys.Y, KonaCode.keys.RIGHT, KonaCode.keys.RIGHT, KonaCode.keys.B ],
                    skin: KonaCode.skins.SWITCH,
                    callback: exec =>{
                        window.location = "https://www.youtube.com/watch?v=wOL3XQcAgsA";
                    }
                }
            ]
        }
    );
…
```

# Options
You can customize the sequences, the skin & color of the joysticks.

| Key | Default value | Required | Description |
| ------------- | ------------- | ------------- | ------------- |
| codes  |null|Yes|Array with one or more codes. |
| event  |keyup|No|String that indicate the keyboard event to handler ( keyup || keydown )|
| joystickEnable  |true|No|Select if you want to show the joystick when a key is required ( A,B,X,Y )|
| feedback  |false|No|Show feedback on screen|

Elements of 'codes' are objects with:
| Key | Default value | Required | Description |
| ------------- | ------------- | ------------- | ------------- |
|sequence|[UP,UP,DOWN,DOWN,LEFT,RIGHT,LEFT,RIGHT,B,A]|No|Array with sequence. Allowed 'keys' values are in KonaCode.keys. You can also use the values ( "UP", "DOWN", … ). 3 keys minimun|
|callback|null|No|Function to call when the sequence is complete,|
|progress|null|No|Function to call when the user is completing the sequence,|
|skin|KonaCode.skins.SNES|No|Skin for the joystick. Currently: SNES & SWITCH|
|color|null|No|Some skins have color variations. Currently: SWITCH|
