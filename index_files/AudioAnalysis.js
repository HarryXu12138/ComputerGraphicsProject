var analyserNode;

function getFrequencyData() {
	// Drop some data for better graph, remove that /3 if you don't want to drop those data.
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
	analyserNode.fftSize = 1024;
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
	WIDTH = canvas.width;
	HEIGHT = canvas.height;
	canvasCtx.fillStyle = "rgb(255,255,255)";
	canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

	function draw() {
		requestAnimationFrame(draw);
		if (document.getElementById("audioSource").paused) return;
		var data = getFrequencyData();

		canvasCtx.fillStyle = "rgb(255,255,255)";
		canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
		var barWidth = WIDTH / data.length - 1;
		var barHeight;
		var x = 0;

		for (var i = 0; i < data.length; ++i) {
			barHeight = data[i];
			var r,g,b;
			r = barHeight;
			g = i;
			b = 250-barHeight;
			canvasCtx.fillStyle = "rgb(" + (r%255) + "," + (g%255) + "," + (b%255) + ")";
			canvasCtx.fillRect(x, HEIGHT-barHeight, barWidth, barHeight);

			x += barWidth + 1;
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

window.onload = function() {
	reloadFile();
	AudioAnalysisInitialize();
	preview();
};