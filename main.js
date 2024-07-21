const CATALOG_URLS = [
	"/data/keplarian.json",
	"/data/hipparcos_2.json",
	"/data/hipparcos_3.json",
	"/data/hipparcos_4.json",
	"/data/messier.json",
	"/data/hipparcos_5.json",
	"/data/hipparcos_6.json",
	"/data/hipparcos_7.json",
	"/data/hipparcos_8.json",
	"/data/hipparcos_9.json",

]

let view = {
	zoom: window.innerHeight/2,
	phi: 0,
	theta: 0,
	rot: 0,
	atmosphere: false,
	highlighted: null,
	time: new Date(),
	grid: false,
	geolocation: JSON.parse(localStorage.getItem("geo")) || {lat: 0, lon: 0}
};

var doneLoading = false;

var oopsies = 0;
var catalogs = [];
var objects = {};
var sunAltitude = 90;

function getLocation() {
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition((position) => {
			view.geolocation.lat = position.coords.latitude;
			view.geolocation.lon = position.coords.longitude;
			localStorage.setItem("geo", JSON.stringify(view.geolocation))
		});
	}
}

async function loadData() {
	for (var i=0;i<CATALOG_URLS.length;i++) {
		displayLoad(CATALOG_URLS[i])
		let catalog;
		try {
			catalog = await (await fetch(CATALOG_URLS[i])).json()
		} catch {
			catalog = await (await fetch("https://media.githubusercontent.com/media/cole-wilson/sky/main" + CATALOG_URLS[i])).json()
		}
		for (var objectID in catalog.objects) {
			catalog.objects[objectID].catalog = {
				name: catalog.name,
				url: catalog.url,
				attribution: catalog.attribution
			}
			objects[objectID] = catalog.objects[objectID];
		}
		catalogs.push(catalog)

	}
	doneLoading = true;
}

function getAtmosphere() {
	if (!view.atmosphere) return {color: "black", magnitude: 100}
	let dawn = [200,165,0];
	let day = [135, 206, 235];

	let color;
	let mag;
	if (sunAltitude < -6) {
		color = "black";
		mag = 100;
	} else if (sunAltitude < 0) {
		let p = (sunAltitude + 6) / 6;
		color = `rgb(${p*dawn[0]},${p*dawn[1]},${p*dawn[2]})`;
		mag = 100 - (95 * p);
	} else if (sunAltitude < 5) {
		let p = sunAltitude / 5;
		let dr = dawn[0] - day[0];
		let dg = dawn[1] - day[1];
		let db = dawn[2] - day[2];
		mag = 5 - (6 * p);
		color = `rgb(${dawn[0] - (p*dr)}, ${dawn[1] - (p*dg)}, ${dawn[2] - (p*db)})`;
	}
	else {
		mag = -1;
		color = "rgb(135, 206, 235)"
	}
	return {color: color, magnitude: mag}
}

function drawAltCircle(altitude, color="red") {
	let start = xyToCanvasCoords(projectAltAz(altitude, 0));
	var textCoords = {x:10000, y:0};
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(start.x, start.y)
	for (var i=0;i<361;i++) {
		let next = xyToCanvasCoords(projectAltAz(altitude, i));
		if (Math.abs(next.x) < Math.abs(textCoords.x) && next.y > 0)
			textCoords = next
		ctx.lineTo(next.x, next.y)
	}
	ctx.stroke();
	ctx.font = "10px monospace";
	ctx.fillText(altitude+"°", textCoords.x+5, Math.max(10, textCoords.y+2))
	// let horizonOrigin = -tan(90-view.phi - 4*altitude);
	// let zenithOrigin = projectAltAz(90, 0).y;

	// let diff = horizonOrigin - zenithOrigin;
	// let percent = -tan(altitude);

	// let origin = xyToCanvasCoords({x:0,
	// 	y: horizonOrigin
	// }); // believe it or not this was pure guess and check to get this equation...
	// let radius =Math.abs(origin.y - xyToCanvasCoords(projectAltAz(altitude,0, false)).y);
	// drawCircle(origin.x, origin.y, radius, color, false)
}

function drawAzLine(azimuth, color="red") {
	let start = xyToCanvasCoords(projectAltAz(0, azimuth));
	var textCoords = {x:0, y:canvas.height};
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(start.x, start.y)
	for (var i=0;i<91;i++) {
		let next = xyToCanvasCoords(projectAltAz(i, azimuth));
		if (Math.abs(next.x) < Math.abs(textCoords.x) && next.y > 0)
			textCoords = next
		ctx.lineTo(next.x, next.y)
	}
	ctx.stroke();
	ctx.font = "10px monospace";
	ctx.fillText(azimuth+"°", textCoords.x+5, Math.max(10, textCoords.y+2))
}

function drawHorizon() {
	let origin = xyToCanvasCoords({x:0,y:-tan(90-view.phi)}); // believe it or not this was pure guess and check to get this equation...
	let radius = Math.abs(origin.y - xyToCanvasCoords(projectAltAz(0,0, false)).y);

	let groundColor = AR_MODE ? "rgba(255, 255, 255, 0)" : "#002200";
	let skyColor = AR_MODE ? "rgba(255, 255, 255, 0)" : getAtmosphere().color;

	if (view.phi < 0) { // origin is ground
		ctx.fillStyle = skyColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		drawCircle(origin.x, origin.y, radius, groundColor)
	} else { // origin is sky
		ctx.fillStyle = groundColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = groundColor;
		drawCircle(origin.x, origin.y, radius, skyColor)
	}

	// drawCircle(origin.x, origin.y, radius, "red", false)
}

function draw() {
	if (view.phi == 0) view.phi += 0.001;
	let calcdate = getTime();
	setControls();
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;

	clickable = {};

	let atmosphere = getAtmosphere();

	drawHorizon(atmosphere);

	for (var objectID in objects) {
		let object = objects[objectID];

		doObject(object, calcdate, atmosphere)
	}

	// let source = (view.zoom < 2500) ? data : bigdata;

	let labels = {"N":[0,0], "E":[0,90], "S":[0,180], "W":[0,270], "*":[90,0]}//, "point screen towards sky!":[-90,0]}
	for (var label in labels) {
		ctx.font = "15px monospace";
		ctx.fillStyle = "red";
		let xytext = projectAltAz(...labels[label]);
		let canvasxytext = xyToCanvasCoords(xytext)
		ctx.fillText(label, canvasxytext.x, canvasxytext.y)
	}

	if (view.grid) {
		for (var j=0;j<37;j++) {
			let i = 10 * j;
			drawAzLine(i)

		}
		for (var j=1;j<10;j++) {
			let i = j*10;
			drawAltCircle(i)
		}
	}

	if (view.highlighted in objects) showInfo(objects[view.highlighted])
	// drawSquares();
	drawCursor();

	requestAnimationFrame(wrap)
}
function doObject(object, calcdate, atmosphere) {
	let altaz;

	if (object.position.type == 'equatorial') {
		altaz = radecToaltaz(object.position.ra, object.position.dec, view.geolocation.lat, view.geolocation.lon, calcdate)
	} else if (object.position.type == 'keplarian') {
		let keplarianProperties = calculateKeplarianProperties(object, daysSinceJ2000(calcdate));
		altaz = radecToaltaz(keplarianProperties.ra, keplarianProperties.dec, view.geolocation.lat, view.geolocation.lon, calcdate)
	}

	// object.size = 1;
	object.altaz = altaz;
	if (object.id == 'sun') sunAltitude = altaz.altitude;

	if (altaz.altitude < 0) return;
	if (view.highlighted != object.id && (object.magnitude > getVisibleMagnitude() || object.magnitude > atmosphere.magnitude)) return;

	if (object.size) {
		object.pixelSize = arcsecondsToPixels(4*object.size, altaz.altitude, altaz.azimuth)
		if (object.type == "dso") {
			object.pixelSize = Math.min(object.pixelSize, 5)
		}
	} else {
		object.pixelSize = 1.9 * Math.min(2, getVisibleMagnitude() / (Math.max(object.magnitude,0) * 3));
	}

	let alpha;
	if (object.pixelSize < 1) {
		alpha = object.pixelSize;
		// console.log(alpha)
	} else {
		alpha = 1;
	}

	let color;
	if (object.color) {color = rgb(...object.color, alpha);}
	else {color = 'green';}

	let xy = projectAltAz(altaz.altitude, altaz.azimuth);
	let canvasxy = xyToCanvasCoords(xy);
	object.canvasxy = canvasxy;


	const over = 30;
	if (canvasxy.x > -over && canvasxy.y > -over && canvasxy.x < ctx.canvas.width+over && canvasxy.y < ctx.canvas.height+over) {
		drawCircle(canvasxy.x, canvasxy.y, object.pixelSize/2, color)

		let square = getSquare(canvasxy.x, canvasxy.y)
		// if (!(square in clickable))
			// clickable[square] = []
		if (!(square in clickable && clickable[square].size > object.pixelSize))
			clickable[square] = (object);

		if (object.name) {
			ctx.fillStyle = "red";
			ctx.font = (5+object.pixelSize) + "px monospace";
			// ctx.fillText(object.name, canvasxy.x, canvasxy.y)
		}
	} else if (view.highlighted == object.id) {
		clearInfo();
	}
}

function getVisibleMagnitude() {
	return (6.5 * view.zoom/5000) + 4.5;
}

function useHash() {
	let hash = decodeURIComponent(location.hash.slice(1))

	let tempView;
	try {
	tempView = JSON.parse((hash));
	} catch (e) {console.error(e, hash);return;}
	if (tempView.time) {
		// date = +new Date(tempView.time);
	}
	view = tempView;
	updateHash();
}
setInterval(updateHash,1000);
function updateHash() {
	window.location.hash = (JSON.stringify(view))
}

function wrap(tryagain=false) {
	if (tryagain === 'yes') oopsies += 1;
	try {draw()}
	catch(e) {
		if (oopsies > 3) {location.hash = ""; location.reload();}
		console.error(e);
		showModal(`
<h2 style="color:red;">Oops!</h2>
<p>There was a little issue loading the interface, and the loop threw an error.</p>
<details><summary>show error...</summary>
<textarea style="width: 100%;min-height:100px;" readonly>${e.stack}</textarea>
</details>
<br>
<a href="#" style="color:red;" onclick="wrap('yes')">Try Again...</a>
`)
	}
}

if (!sessionStorage.getItem("welcome")) {
	showModal()
}

requestAnimationFrame(wrap)
useHash()
loadData()
getLocation()
