let right = document.getElementById("info_right");
let left = document.getElementById("info_left");
let top_left = document.getElementById("info_top_left");
let top_right = document.getElementById("info_top_right");

var fps = [];
var speedMult = 1;
var speedIndex = 1;
var playing = true;
var lastCall = +new Date();
var date = +new Date();

function showInfo(object) {
	var out = `
	<h1>${object.name || object.id}</h1>
	<b>Catalog:</b> <a target="_blank" href="${object.catalog.url}" title="${object.catalog.attribution}">${object.catalog.name}</a><br>
	<b>ID:</b> ${object.id}<br>
	<b>Alt/Az:</b> ${object.altaz.altitude}°/${object.altaz.azimuth}°<br>
	`;
	if (object.magnitude)
		out += `<b>Magnitude:</b> `+object.magnitude+"<br>";
	out += `<b>Color:</b> <span style="color:${rgb(...object.color)};">${rgb(...object.color)}</span><br>`;
	out += `<b>Apparent/Pixel Size:</b> ${object.size}`;
	top_left.innerHTML = out;
}
function clearInfo() {
	top_left.innerHTML = "";
}
function formatRaDec(ra, dec) {
	return ra + "/" + dec;
}

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

	if (diff > 1) {
		fps.push(1000 / diff);
		if (fps.length > 60)
			fps.pop(0);
	}

	if (playing)
		date += diff * speedMult;

	lastCall = now;

	return new Date(date);
}

function setControls() {
	displaySetting();
}

function getFPS() {
	return Math.round(fps.reduce((a,b)=>a+b,0) / fps.length);
}

function displaySetting() {
	left.innerHTML = geolocation.lat + ", " + geolocation.lon + " " + getFPS() + "fps<br>" + getTime().toLocaleString();
}

window.addEventListener("keydown", (e) => {
	console.log(e.key)
	switch (e.key) {
		case 'Escape':
			highlighted = null;
			clearInfo();
			break;
		case ' ':
			if (highlighted) {
				let altaz = objects[highlighted].altaz;
				flyTo(altaz.altitude, altaz.azimuth, 2000)
			}
			break;
	}
})

setupButtons()
