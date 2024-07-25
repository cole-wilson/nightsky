let right = document.getElementById("info_right");
let left = document.getElementById("info_left");
let top_left = document.getElementById("info_top_left");
let top_right = document.getElementById("info_top_right");
let modal = document.getElementById("modal");
let modalInner = document.getElementById("modal_content");
let intro = modalInner.innerHTML;
let back = document.getElementById("time_back")
let playpause = document.getElementById("playpause")
let nowel = document.getElementById("time_now")
let forward = document.getElementById("time_forward")
let speedEl = document.getElementById("speed")


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
	<b>Alt/Az:</b> ${round(object.altaz.altitude, 2)}°/${round(object.altaz.azimuth, 2)}°<br>
	`;
	if (object.magnitude)
		out += `<b>Magnitude:</b> `+object.magnitude+"<br>";
	out += `<b>Color:</b> <span style="color:${rgb(...object.color)};">${rgb(...object.color)}</span><br>`;
	out += `<b>Apparent/Pixel Size:</b> ${round(object.pixelSize,2)}`;
	top_left.innerHTML = out;
}
function clearInfo() {
	top_left.innerHTML = "";
}
function formatRaDec(ra, dec) {
	return ra + "/" + dec;
}
function round(x, n) {
	return Math.round(x * Math.pow(10, n)) / Math.pow(10, n)
}

function backButton(_) {
	speedIndex -= 1;
	if (speedIndex == 0) speedIndex = -1;
	speedMult = Math.pow(speedIndex, 5);
	if (speedIndex < 0 && playing) {back.style.color = "white";forward.style.color = "grey";}
	else {forward.style.color = "grey";back.style.color = "grey";}
	speedEl.innerHTML = speedMult + "&times;";
}

function forwardButton(_) {
	speedIndex += 1;
	if (speedIndex == 0) speedIndex = 1;
	speedMult = Math.pow(speedIndex, 5);
	if (speedIndex > 0 && playing) {forward.style.color = "white";back.style.color = "grey";}
	else {forward.style.color = "grey";back.style.color = "grey";}
	speedEl.innerHTML = speedMult + "&times;";
}

function nowButton(_) {
	date = +new Date();
	speedMult = 1;
	forward.style.color = "grey";
	back.style.color = "grey";
	speedEl.innerHTML = 1 + "&times;";
}

let fullscreenFunc = (_) => {
	document.documentElement.requestFullscreen()
}
let welcomeFunc = (_) => {
	sessionStorage.removeItem("welcome")
	showModal(intro)
}
let gridFunc = (_) => {
	let e = {target:document.getElementById("grid")};
	view.grid = !view.grid;
	if (view.grid) {
		e.target.style.color = "white";
	} else {
		e.target.style.color = "grey";
	}
}

let atmosFunc = (_) => {
	let e = {target:document.getElementById("atmosphere")};
	view.atmosphere = !view.atmosphere;
	if (view.atmosphere) {
		e.target.style.color = "white";
	} else {
		e.target.style.color = "grey";
	}
}
let playPauseFunc = (_) => {
	if (!playing) {
		playpause.innerText = "⏸︎";
		playing = true;
	} else {
		playpause.innerText = "⏵︎";
		playing = false;
	}
}

function setupButtons() {
	back.innerText = "⏮︎";
	playpause.innerText = "⏸︎";
	forward.innerText = "⏭︎";
	nowel.innerText = "⏺︎";

	playpause.addEventListener("click", playPauseFunc)

	back.addEventListener("click", backButton)

	forward.addEventListener("click", forwardButton)

	nowel.addEventListener("click", nowButton)

	document.getElementById("fullscreen").onclick = fullscreenFunc;

	document.getElementById("welcome").onclick = welcomeFunc;

	document.getElementById("grid").onclick = gridFunc;

	document.getElementById("atmosphere").onclick = atmosFunc;
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

	let output = new Date(date);

	view.time = output;

	return output;
}

function setControls() {
	displaySetting();
}

function getFPS() {
	return Math.round(fps.reduce((a,b)=>a+b,0) / fps.length);
}

function displaySetting() {
	if (!doneLoading) return;
	left.innerHTML = view.geolocation.lat + ", " + view.geolocation.lon + " " + getFPS() + "fps<br>" + getTime().toLocaleString();
}
function displayLoad(a) {
	left.innerHTML = "loading<br>" + a + "...";
}
window.addEventListener("keydown", (e) => {
	switch (e.key) {
		case 'Escape':
			view.highlighted = null;
			clearInfo();
			break;
		case ' ':
			if (view.highlighted) {
				let altaz = objects[view.highlighted].altaz;
				flyTo(altaz.altitude, altaz.azimuth, 2000)
			}
			break;
		case '?':
			welcomeFunc();
			break;
		case 'z':
			gridFunc();
			break;
		case 'a':
			atmosFunc();
			break;
		case 'p':
			playPauseFunc();
			break;
		case 'ArrowRight':
			forwardButton();
			break;
		case 'ArrowLeft':
			backButton();
			break;
		case 'f':
			fullscreenFunc();
			break;
		case 'n':
			nowButton();
			break;
		case 'r':
			arFunc();
			break;
		default:
			console.log(e.key)
			break;
	}
})
function closeModal() {
	modal.style.display = "none";
}
function showModal(html) {
	if (html) modalInner.innerHTML = html;
	modal.style.display = "block";
}
setupButtons()
