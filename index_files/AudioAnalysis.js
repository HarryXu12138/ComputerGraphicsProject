
function AudioAnalysisInitialize() {
	var audioContext = window.AudioContext || window.webkitAudioContext;
	var audioCtx = new AudioContext();

	var audioSource = document.getElementById("AudioSource");
	audioSource.autoplay = true;

	var sourceNode = audioCtx.createMediaElementSource(audioSource);
	var gainNode = audioCtx.createGain();

	sourceNode.connect(gainNode);
	gainNode.connect(audioCtx.destination);
}

window.onload = function() {
	AudioAnalysisInitialize();
};