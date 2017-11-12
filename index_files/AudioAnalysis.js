var analyserNode;

function getFrequencyData() {
	var bufferLength = analyserNode.frequencyBinCount;
	var data = new Uint8Array(bufferLength);
	analyserNode.getByteFrequencyData(data);
	return data;
}

function getTimeDomainData() {
	var bufferLength = analyserNode.frequencyBinCount;
	var data = new Uint8Array(bufferLength);
	analyserNode.getByteTimeDomainData();
	return data;
}

function AudioAnalysisInitialize() {
	var audioContext = window.AudioContext || window.webkitAudioContext;
	var audioCtx = new AudioContext();

	var audioSource = document.getElementById("AudioSource");
	audioSource.autoplay = true;
	audioSource.loop = true;

	document.getElementById("playButton").onclick = function(event) {
		var audioSource = document.getElementById("AudioSource");
		if (audioSource.paused) audioSource.play();
		else audioSource.pause();
	};

	var sourceNode = audioCtx.createMediaElementSource(audioSource);
	var gainNode = audioCtx.createGain();
	analyserNode = audioCtx.createAnalyser();
	analyserNode.fftSize = 64;
	analyserNode.minDecibels = -130;
	analyserNode.maxDecibels = 0;
	analyserNode.smoothingTimeConstant = 0.8;

	sourceNode.connect(analyserNode);
	analyserNode.connect(gainNode);
	gainNode.connect(audioCtx.destination);
}

function showData() {
	var str = "<table>";
	var data = getFrequencyData();
	for (var i = 0; i < data.length; ++i) {
		str += "<tr><td>" + data[i] + "</td></tr>";
	}
	str += "</table>";
	document.getElementById("DataOutput").innerHTML = str;
	setTimeout(showData, 50);
}

window.onload = function() {
	AudioAnalysisInitialize();
	showData();
};