var analyserNode;
var camera, scene, material, mesh, geometry, renderer;

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
		var data = getFrequencyData();

		canvasCtx.fillStyle = "rgb(255,255,255)";
		canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
		var barWidth = canvas.width / data.length - 2;
		var barHeight;
		var x = 0;

		for (var i = 0; i < data.length; ++i) {
			barHeight = data[i]*canvas.height/255;
			var r,g,b;
			r = 80;
			g = i*2;
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
    controls = new THREE.OrbitControls( camera, renderer.domElement );
}

function init() {
    // camera 
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / innerHeight, 1, 1000);
    camera.position.z = 300;
    scene.add(camera);

    // sphere object
    var radius = 50,
        segments = 30,
        rings = 5;
    geometry = new THREE.SphereGeometry(radius, segments, rings);
    material = new THREE.MeshNormalMaterial({color:0x002288});
    mesh = new THREE.Mesh(geometry, material);

    //scene 
    ;
    scene.add(mesh);

    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}


function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    //mesh.rotation.x += .01;
    //mesh.rotation.y += .02;
    renderer.render(scene, camera);
} 

window.onload = function() {
	veryFirstPreview();
	drawSphere();
};