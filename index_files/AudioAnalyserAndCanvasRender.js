var firstPreviewHeight = 350;
var sphereHeight = 800;

// Some global variables
var analyserNode;
var camera, scene, renderer;
var numLights = 64;

function getFrequencyData() {
	var data = new Uint8Array(analyserNode.frequencyBinCount);
	analyserNode.getByteFrequencyData(data);
	return data;
}

function getTimeDomainData() {
	var data = new Uint8Array(analyserNode.fftSize);
	analyserNode.getByteTimeDomainData();
	return data;
}

function AudioAnalysisInitialize() {
	var audioContext = window.AudioContext || window.webkitAudioContext;
	var audioCtx = new AudioContext();

	var audioSource = document.getElementById("audioSource");
	audioSource.autoplay = true;
	audioSource.loop = true;
	audioSource.controls = true;

	var sourceNode = audioCtx.createMediaElementSource(audioSource);
	var gainNode = audioCtx.createGain();
	analyserNode = audioCtx.createAnalyser();
	analyserNode.fftSize = 512;
	analyserNode.minDecibels = -200;
	analyserNode.maxDecibels = 0;
	analyserNode.smoothingTimeConstant = 0.8;

	sourceNode.connect(analyserNode);
	analyserNode.connect(gainNode);
	gainNode.connect(audioCtx.destination);
}

function preview() {
	var canvas = document.getElementById("preview");
	var canvasCtx = canvas.getContext("2d");
	canvasCtx.fillStyle = "rgb(255,255,255)";
	canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

	function draw() {
		requestAnimationFrame(draw);
		if (document.getElementById("audioSource").paused) return;
		canvas.width = document.body.clientWidth;
		canvas.height = firstPreviewHeight;
		var data = getFrequencyData();

		canvasCtx.fillStyle = "rgb(255,255,255)";
		canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
		var barWidth = canvas.width / data.length - 2;
		var barHeight;
		var x = 0;

		for (var i = 0; i < data.length; ++i) {
			barHeight = data[i]*canvas.height/255;
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

function reloadFile() {
	document.getElementById("fileSelector").onchange = function(event) {
		window.URL = window.URL || window.webkitURL;
		var fileName = event.target.files[0];
		var objectURL = window.URL.createObjectURL(fileName);
		document.getElementById("audioSource").src = objectURL;
		document.getElementById("audioSource").load();
	}
}

function veryFirstPreview() {
	reloadFile();
	AudioAnalysisInitialize();
	preview();
}

function drawSphere() {
	init();
	animate();
}

// Generate point lights according to music
function generatePointsLightAndAddToScene() {
	var points = fibonacciSphere(140, numLights, false);
	var ptlightSet = [];
	for (var i = 0; i < points.length; i++) {
		var ptlight = new THREE.PointLight(0xffffff, 0.3, 200); // (color, intensity, distance, decay)
		ptlight.position.set(points[i][0], points[i][1], points[i][2]);
		scene.add(ptlight);
		ptlightSet.push(ptlight);
	}

	var data_previous = [];
	function changeLightColor() {
		if (document.getElementById("audioSource").paused) {
			setTimeout(changeLightColor, 50);
			return;
		}
		// Get current music data
		var data = getFrequencyData();
		for (var i = 0; i < numLights; i++) {
			var j = i*4;
			// console.log(data.length);
			if (data_previous.length != data.length) var RGB = calculateRGB(data[j], 0);
			else var RGB = calculateRGB(data[j], data[j]-data_previous[j]);
			ptlightSet[i].color.setHex("0x" + RGB);
			var intensity = data[j]/256;
			if (intensity > 0.3) intensity = 0.3;
			ptlightSet[i].intensity = intensity;
		}
		data_previous = data;
		setTimeout(changeLightColor, 50);
	}

	changeLightColor();
}

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
	RGB = Math.trunc(RGB).toString(16);		// Convert to Hex value
	return RGB;
}

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

function init() {
	// camera 
	scene = new THREE.Scene();
	var texture = new THREE.TextureLoader().load( "./index_files/background.jpg" );
	scene.background = texture;
	camera = new THREE.PerspectiveCamera(50, document.body.clientWidth/sphereHeight, 1, 1000);
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
	renderer.setSize(document.body.clientWidth, sphereHeight);
	camera.aspect = document.body.clientWidth/sphereHeight;
	camera.updateProjectionMatrix();
	renderer.render(scene, camera);
}

window.onload = function() {
	veryFirstPreview();
	drawSphere();
	generatePointsLightAndAddToScene();
};