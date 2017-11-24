var firstPreviewHeight = 350;
var sphereHeight = 800;

// Some global variables
var analyserNode;
var camera, scene, renderer;

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
	analyserNode.minDecibels = -130;
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
		// Can choose to use time-domain data or frequency-domain data
		//var data = getTimeDomainData();
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
	// Get current music data
	var data = getFrequencyData();

	var ptlight = new THREE.PointLight( 0xffffff, 0.5, 200 ); // (color, intensity, distance, decay)
	ptlight.position.set( 100, 100, 100 );
	scene.add( ptlight );

	for (var i = 0; i < data.length; ++i) {
		console.log(data[i]);
		// Calculate light positions

		// Calculate light color and brightness
		
		// Generate point light
		ptlight.intensity = data[i];
	}
}

function init() {
	// camera 
	scene = new THREE.Scene()
	camera = new THREE.PerspectiveCamera(50, document.body.clientWidth/sphereHeight, 1, 1000);
	camera.position.z = 300;
	scene.add(camera);

	// lights
	// Ambient Light
	var ambientlight = new THREE.AmbientLight( 0x404040 ); // soft white light (R, G, B)
	scene.add( ambientlight );

	// sphere object
	var radius = 100,
		segments = 30,
		rings = 20;
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