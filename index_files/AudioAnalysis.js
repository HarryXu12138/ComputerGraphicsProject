var analyserNode;

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

	var audioSource = document.getElementById("AudioSource");
	audioSource.autoplay = true;
	audioSource.loop = true;
	audioSource.controls = true;

	var sourceNode = audioCtx.createMediaElementSource(audioSource);
	var gainNode = audioCtx.createGain();
	analyserNode = audioCtx.createAnalyser();
	analyserNode.fftSize = 64;
	analyserNode.minDecibels = -130;
	analyserNode.maxDecibels = -10;
	analyserNode.smoothingTimeConstant = 0.8;

	sourceNode.connect(analyserNode);
	analyserNode.connect(gainNode);
	gainNode.connect(audioCtx.destination);
}

function showData() {
	var str = "";
	var data = getFrequencyData();
	for (var i = 0; i < data.length; ++i) {
		str += data[i] + "<br>";
	}
	document.getElementById("DataOutput").innerHTML = str;
	setTimeout(showData, 30);
}

function reloadFile() {
	document.getElementById("fileSelector").onchange = function(event) {
		var fileName = event.target.files[0];
		var objectURL = window.URL.createObjectURL(fileName);
		document.getElementById("AudioSource").src = objectURL;
		document.getElementById("AudioSource").load();
	}
}

window.onload = function() {
	reloadFile();
	AudioAnalysisInitialize();
	showData();
};