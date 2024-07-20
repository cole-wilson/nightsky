let right = document.getElementById("info_right");
let left = document.getElementById("info_left");
let top_left = document.getElementById("info_top_left");
let top_right = document.getElementById("info_top_right");
let modal = document.getElementById("modal");
let modalInner = document.getElementById("modal_content");
let intro = modalInner.innerHTML;

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
	out += `<b>Apparent/Pixel Size:</b> ${object.size}`;
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
		if (speedIndex < 0 && playing) {back.style.color = "white";forward.style.color = "grey";}
		else {forward.style.color = "grey";back.style.color = "grey";}
		speedEl.innerHTML = speedMult + "&times;";
	})

	forward.addEventListener("click", (_) => {
		speedIndex += 1;
		if (speedIndex == 0) speedIndex = 1;
		speedMult = Math.pow(speedIndex, 5);
		if (speedIndex > 0 && playing) {forward.style.color = "white";back.style.color = "grey";}
		else {forward.style.color = "grey";back.style.color = "grey";}
		speedEl.innerHTML = speedMult + "&times;";
	})

	nowel.addEventListener("click", (_) => {
		date = +new Date();
		speedMult = 1;
		forward.style.color = "grey";
		back.style.color = "grey";
	})

	document.getElementById("fullscreen").onclick = (_) => {
		document.documentElement.requestFullscreen()
	}

	document.getElementById("welcome").onclick = (_) => {
		sessionStorage.removeItem("welcome")
		showModal(intro)
	}

	document.getElementById("grid").onclick = (e) => {
		view.grid = !view.grid;
		if (view.grid) {
			e.target.style.color = "white";
		} else {
			e.target.style.color = "grey";
		}
	}

	document.getElementById("atmosphere").onclick = (e) => {
		view.atmosphere = !view.atmosphere;
		if (view.atmosphere) {
			e.target.style.color = "white";
		} else {
			e.target.style.color = "grey";
		}
	}

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
	console.log(e.key)
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
