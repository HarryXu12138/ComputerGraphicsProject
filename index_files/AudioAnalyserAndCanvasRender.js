// Some parameters
var firstPreviewHeight = 350;
var sphereHeight = 800;
var numLights = 64;
var fastForwardBackward = 10;

// Some global variables used inside program
var analyserNode;
var camera, scene, renderer;

// Enter point of the entire program
window.onload = function() {
    musicControllerInitialize();
    veryFirstPreview();
    drawSphere();
    generatePointsLightAndAddToScene();
};

function musicControllerInitialize() {
    var player = document.getElementById("audioSource");
    document.getElementById("playButton").addEventListener("click", function() {
        if (player.readyState != 4) {
            alert("You need to choose file first");
            return;
        }
        if (player.paused) {
            player.play();
        } else {
            player.pause();
        }
    });

    document.getElementById("backwardButton").addEventListener("click", function() {
        if (player.readyState != 4) {
            alert("You need to choose file first");
            return;
        }
        var now = player.currentTime;
        now -= fastForwardBackward;
        if (now < 0) {
            player.currentTime = 0;
        } else {
            player.currentTime = now;
        }
    });

    document.getElementById("forwardButton").addEventListener("click", function() {
        if (player.readyState != 4) {
            alert("You need to choose file first");
            return;
        }
        var now = player.currentTime;
        now += fastForwardBackward;
        if (now >= player.duration) {
            player.currentTime = player.duration;
            player.pause();
        } else {
            player.currentTime = now;
        }
    });

    function timeDraw() {
        setTimeout(timeDraw, 500);
        if (player.paused) return;
        if (formatSeconds(player.currentTime) == "") {
            document.getElementById("currentTime").innerHTML = "0s";
        } else {
            document.getElementById("currentTime").innerHTML = formatSeconds(player.currentTime);
        }
        document.getElementById("totalTime").innerHTML = formatSeconds(player.duration);
    }

    function progressDraw() {
        setTimeout(progressDraw, 50);
        if (player.paused) return;
        var progress = player.currentTime / player.duration * 100;
        document.getElementById("progress").setAttribute("style", "width: " + progress + "%");
    }

    document.getElementById("currentTime").innerHTML = "0s";
    document.getElementById("timer").innerHTML = "/";
    document.getElementById("totalTime").innerHTML = "infinity";
    timeDraw();
    progressDraw();
}

function formatSeconds(value) {
    var theTime = parseInt(value);
    var theTime1 = 0;
    var theTime2 = 0;
    var theTime3 = 0;
    if(theTime > 60) {
        theTime1 = parseInt(theTime/60);
        theTime = parseInt(theTime%60);
        if(theTime1 > 60) {
            theTime2 = parseInt(theTime1/60);
            theTime1 = parseInt(theTime1%60);
            if(theTime2 > 24){
                theTime3 = parseInt(theTime2/24);
                theTime2 = parseInt(theTime2%24);
            }
        }
    }
    var result = '';
    if(theTime > 0){
        result = ""+parseInt(theTime)+"s";
    }
    if(theTime1 > 0) {
        result = ""+parseInt(theTime1)+"m"+result;
    }
    if(theTime2 > 0) {
        result = ""+parseInt(theTime2)+"h"+result;
    }
    if(theTime3 > 0) {
        result = ""+parseInt(theTime3)+"d"+result;
    }
    return result;
}

// Return a Uint8Array represent the current music data in frequency domain
function getFrequencyData() {
    var data = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(data);
    return data;
}

// Return a Uint8Array represent the current music data in time domain
function getTimeDomainData() {
    var data = new Uint8Array(analyserNode.fftSize);
    analyserNode.getByteTimeDomainData();
    return data;
}

// Initialize the audio analyzer
function AudioAnalysisInitialize() {
    // Create audio context
    var audioContext = window.AudioContext || window.webkitAudioContext;
    var audioCtx = new AudioContext();

    // Set the audio player
    var audioSource = document.getElementById("audioSource");
    audioSource.autoplay = true;
    audioSource.loop = true;

    // Create some necessary nodes
    var sourceNode = audioCtx.createMediaElementSource(audioSource);
    var gainNode = audioCtx.createGain();
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 512;
    analyserNode.minDecibels = -200;
    analyserNode.maxDecibels = 0;
    analyserNode.smoothingTimeConstant = 0.8;

    // Connect them
    sourceNode.connect(analyserNode);
    analyserNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
}

// This is a basic preview of the audio data
function preview() {
    var canvas = document.getElementById("preview");
    canvas.width = document.body.clientWidth - 100;
    canvas.height = firstPreviewHeight;
    // Create canvas context and clear the canvas
    var canvasCtx = canvas.getContext("2d");
    canvasCtx.fillStyle = "rgb(255,255,255)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    function draw() {
        requestAnimationFrame(draw);
        // When audio pause, stop drawing
        if (document.getElementById("audioSource").paused) return;
        // Auto adjust the drawing with width of browser
        canvas.width = document.body.clientWidth - 100;
        canvas.height = firstPreviewHeight;
        var data = getFrequencyData();

        // Initialize some variable
        canvasCtx.fillStyle = "rgb(255,255,255)";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        var barWidth = canvas.width / data.length - 2;
        var barHeight;
        var x = 0;

        // Draw each bar
        for (var i = 0; i < data.length; ++i) {
            barHeight = data[i]*canvas.height/255;
            // The color of the bar related to the position of the bar
            var r,g,b;
            r = 100;
            g = i;
            b = 180;
            canvasCtx.fillStyle = "rgb(" + (r%255) + "," + (g%255) + "," + (b%255) + ")";
            canvasCtx.fillRect(x, canvas.height-barHeight, barWidth, barHeight);

            x += barWidth + 2;
        }
    }

    draw();
}

// Initialize the file loader
function reloadFile() {
    document.getElementById("fileSelector").onchange = function(event) {
        window.URL = window.URL || window.webkitURL;
        var fileName = event.target.files[0];
        var format = fileName.name.split(".");
        if (format.length < 2) {
            alert("File name error. Please choose another file.");
            return;
        }
        var last = format.length - 1;
        if (!(format[last] == "mp3" || format[last] == "MP3" || format[last] == "FLAC" || format[last] == "flac" || format[last] == "ogg" || format[last] == "OGG")) {
            alert("File format error. Please choose another file.");
            return;
        }
        var objectURL = window.URL.createObjectURL(fileName);
        var audio = document.getElementById("audioSource");
        audio.src = objectURL;
        audio.load();
    }
}

// Manage the preview
function veryFirstPreview() {
    reloadFile();
    AudioAnalysisInitialize();
    preview();
}

// Manage the sphere draw
function drawSphere() {
    init();
    animate();
}

// Generate point lights
// Basic idea is calculate coordinates of each point lights and then add them to the scene
function generatePointsLightAndAddToScene() {
    // fibonacciSphere is a function to calculte the position of each point light
    var points = fibonacciSphere(140, numLights, false);
    var ptlightSet = [];
    // Add those lights to the scene
    for (var i = 0; i < points.length; i++) {
        var ptlight = new THREE.PointLight(0xffffff, 0.3, 200); // (color, intensity, distance, decay)
        ptlight.position.set(points[i][0], points[i][1], points[i][2]);
        scene.add(ptlight);
        ptlightSet.push(ptlight);
    }

    var data_previous = [];
    // Change colors with the frequency of music
    function changeLightColor() {
        if (document.getElementById("audioSource").paused) {
            setTimeout(changeLightColor, 50);
            return;
        }
        // Get current music data and change the colors
        var data = getFrequencyData();
        for (var i = 0; i < numLights; i++) {
            var j = i*4;
            if (data_previous.length != data.length) var RGB = calculateRGB(data[j], 0);
            else var RGB = calculateRGB(data[j], data[j]-data_previous[j]);
            ptlightSet[i].color.setHex("0x" + RGB);
            var intensity = data[j]/256;
            if (intensity > 0.3) intensity = 0.3;
            ptlightSet[i].intensity = intensity;
        }
        data_previous = data;
        // Recursively call this function
        setTimeout(changeLightColor, 50);
    }

    changeLightColor();
}

// Process the RGB data and the data from music
function calculateRGB(color, difference) {
    var newColor = color;
    var newDifference = Math.trunc(difference * 1.5);
    if ((newColor + newDifference) > 255) newDifference = 255 - newColor;
    else if ((newColor + newDifference) < 0) newDifference = newColor * (-1);
    var R, G, B;
    if (newColor < 43) {
        R = 255;
        G = newColor + newDifference;
        B = 0;
    } else if (newColor < 43*2) {
        R = 255-(newColor + newDifference);
        G = 255;
        B = 0;
    } else if (newColor < 43*3) {
        R = 0;
        G = 255;
        B = newColor + newDifference;
    } else if (newColor < 43*4) {
        R = 0;
        G = 255-(newColor+newDifference);
        B = 255;
    } else if (newColor < 43*5) {
        R = newColor + newDifference;
        G = 0;
        B = 255;
    } else {
        R = 255;
        G = 0;
        B = 255-(newColor+newDifference);
    }

    // Calculate final RGB value
    var RGB = (R*65536) + (G*256) + B;
    RGB = Math.trunc(RGB).toString(16);     // Convert to Hex value
    return RGB;
}

// Calculate evenly distributed points in a sphere
function fibonacciSphere(amp, samples, randomize) {
    var rnd = 1.;
    if (randomize) {
        rnd = Math.random() * samples;
    }

    var points = [];
    var offset = 2./samples;
    var increment = Math.PI * (3. - Math.sqrt(5.));

    for (var i = 0; i < samples; ++i) {
        var y = ((i * offset) - 1) + (offset / 2);
        var r = Math.sqrt(1 - Math.pow(y,2));

        var phi = ((i + rnd) % samples) * increment;

        var x = Math.cos(phi) * r;
        var z = Math.sin(phi) * r;

        points.push([x*amp,y*amp,z*amp]);
    }

    return points;
}

// Initialize the three scene
function init() {
    // camera
    scene = new THREE.Scene();
    var texture = new THREE.TextureLoader().load( "./index_files/background.jpg" );
    scene.background = texture;
    camera = new THREE.PerspectiveCamera(50, (document.body.clientWidth-100)/sphereHeight, 1, 1000);
    camera.position.z = 300;
    scene.add(camera);

    // lights
    // Ambient Light
    var ambientlight = new THREE.AmbientLight( 0x000000 ); // soft white light (R, G, B)
    scene.add( ambientlight );

    // sphere object
    var radius = 100,
        segments = 40,
        rings = 80;
    var geometry = new THREE.SphereGeometry(radius, segments, rings);
    var material = new THREE.MeshPhongMaterial({wireframe: false, wireframeLinewidth: 2, lights: true});
    var mesh = new THREE.Mesh(geometry, material);

    //scene
    scene.add(mesh);

    // renderer
    renderer = new THREE.WebGLRenderer();
    document.getElementById("mainBody").appendChild(renderer.domElement);

    new THREE.OrbitControls(camera, renderer.domElement);
}

function animate() {
    render();
    requestAnimationFrame(animate);
}

function render() {
    renderer.setSize(document.body.clientWidth - 100, sphereHeight);
    camera.aspect = (document.body.clientWidth - 100)/sphereHeight;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
}