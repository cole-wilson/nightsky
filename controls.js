let right = document.getElementById("info_right");
let left = document.getElementById("info_left");

var speedMult = 1;
var speedIndex = 1;
var playing = true;
var lastCall = +new Date();
var date = +new Date();

function setupButtons() {
	let back = document.getElementById("time_back")
	let playpause = document.getElementById("playpause")
	let nowel = document.getElementById("time_now")
	let forward = document.getElementById("time_forward")
	let speedEl = document.getElementById("speed")

	back.innerText = "⏮︎";
	playpause.innerText = "⏸︎";
	forward.innerText = "⏭︎";
	nowel.innerText = "⏺︎";

	playpause.addEventListener("click", (_) => {
		if (!playing) {
			playpause.innerText = "⏸︎";
			playing = true;
		} else {
			playpause.innerText = "⏵︎";
			playing = false;
		}
	})

	back.addEventListener("click", (_) => {
		speedIndex -= 1;
		if (speedIndex == 0) speedIndex = -1;
		speedMult = Math.pow(speedIndex, 5);

		speedEl.innerHTML = speedMult + "&times;";
	})

	forward.addEventListener("click", (_) => {
		speedIndex += 1;
		if (speedIndex == 0) speedIndex = 1;
		speedMult = Math.pow(speedIndex, 5);

		speedEl.innerHTML = speedMult + "&times;";
	})

	nowel.addEventListener("click", (_) => {
		date = +new Date();
		speedMult = 1;
	})
}

function getTime() {
	let now = +new Date();
	let diff = now - lastCall;

	if (playing)
		date += diff * speedMult;

	lastCall = now;

	return new Date(date);
}

function setControls() {
	displaySetting();
}

function displaySetting() {
	left.innerHTML = geolocation.lat + ", " + geolocation.lon + "<br>" + getTime().toLocaleString();
}

setupButtons()
