const CATALOG_URLS = [
	"/data/hipparcos.json",
	"/data/keplarian.json",
	"/data/messier.json"
]
var catalogs = [];
var objects = {};

let geolocation = JSON.parse(localStorage.getItem("geo")) || {lat: 0, lon: 0};

function getLocation() {
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition((position) => {
			geolocation.lat = position.coords.latitude;
			geolocation.lon = position.coords.longitude;
			localStorage.setItem("geo", JSON.stringify(geolocation))
		});
	}
}

async function loadData() {
	for (var i=0;i<CATALOG_URLS.length;i++) {
		displayLoad(CATALOG_URLS[i])
		try {
			catalogs.push(await (await fetch(CATALOG_URLS[i])).json())
		} catch {
			catalogs.push(await (await fetch("https://media.githubusercontent.com/media/cole-wilson/nightsky/main" + CATALOG_URLS[i])).json())
		}
	}
	for (var i=0;i<catalogs.length;i++) {
		for (var objectID in catalogs[i].objects) {
			catalogs[i].objects[objectID].catalog = {
				name: catalogs[i].name,
				url: catalogs[i].url,
				attribution: catalogs[i].attribution
			}
			objects[objectID] = catalogs[i].objects[objectID];
		}
	}
	requestAnimationFrame(draw)
}

function drawStar(star, x, y) {
	// let rgb = bvColor(star.color_index.value)
	// let mag = star.magnitude.hipparcos;
	// let size = Math.min(20/mag, 15);
	// // if (view.zoom > 2000) size += 2
	// // if (view.zoom > 4000) size += 2
	// // if (view.zoom > 7000)
	// 	size += view.zoom/500
	// // console.log(size)
	// ctx.font = size + "px monospace";
	// let adjusted_rgb = adjustRGBtoMagnitude(rgb, mag);
	// ctx.fillStyle = `rgb(${adjusted_rgb[0]}, ${adjusted_rgb[1]}, ${adjusted_rgb[2]})`
	// ctx.fillText(".", x, y);

	// clickable[[Math.floor(x),Math.floor(y)]] = star;

	// if (0.9*mag < view.zoom/400 && star.hip in names) {
	// 	ctx.font = Math.max(10, Math.min(size, 13)) + "px monospace";
	// 	ctx.fillText("  "+names[star.hip], x, y);
	// }
}

function drawHorizon() {
	let origin = xyToCanvasCoords({x:0,y:-Math.tan((-Math.PI/180)*(view.phi-90))}); // believe it or not this was pure guess and check to get this equation...
	let radius = Math.abs(origin.y - xyToCanvasCoords(projectAltAz(0,0, false)).y);

	let groundColor = AR_MODE ? "rgba(255, 255, 255, 0)" : "#002200";
	let skyColor = AR_MODE ? "rgba(255, 255, 255, 0)" : "black";

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
}

function draw() {
	let calcdate = getTime();
	setControls();
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;

	clickable = {};

	drawHorizon();

	for (var objectID in objects) {
		let object = objects[objectID];

		doObject(object, calcdate)
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

	// drawSquares();
	drawCursor();

	requestAnimationFrame(draw)
}
async function doObject(object, calcdate) {
	let altaz;

	if (object.position.type == 'equatorial') {
		altaz = radecToaltaz(object.position.ra, object.position.dec, geolocation.lat, geolocation.lon, calcdate)
	} else if (object.position.type == 'keplarian') {
		let keplarianProperties = calculateKeplarianProperties(object, daysSinceJ2000(calcdate));
		altaz = radecToaltaz(keplarianProperties.ra, keplarianProperties.dec, geolocation.lat, geolocation.lon, calcdate)
	}

	object.size = 1;
	object.altaz = altaz;

	if (altaz.altitude < 0) return;
	if (object.size < 0.5) return;

	// let alpha = size;

	let color;
	if (object.color) {color = rgb(...object.color, 1);}
	else {color = 'green';}

	let xy = projectAltAz(altaz.altitude, altaz.azimuth);
	let canvasxy = xyToCanvasCoords(xy);
	object.canvasxy = canvasxy;

	const over = 30;
	if (canvasxy.x > -over && canvasxy.y > -over && canvasxy.x < ctx.canvas.width+over && canvasxy.y < ctx.canvas.height+over) {
		drawCircle(canvasxy.x, canvasxy.y, object.size/2, color)

		let square = getSquare(canvasxy.x, canvasxy.y)
		// if (!(square in clickable))
			// clickable[square] = []
		if (!(square in clickable && clickable[square].size > object.size))
			clickable[square] = (object);

		if (object.name) {
			ctx.fillStyle = "red";
			ctx.font = "10px monospace";
			ctx.fillText(object.name, canvasxy.x, canvasxy.y)
		}
	}
}

function useHash() {
	hash = window.location.hash.slice(1).split(":");
	if (hash.length < 3) return
	view.phi = parseFloat(hash[0]) || 0.5;
	view.theta = parseFloat(hash[1]) || 0;
	view.zoom = parseFloat(hash[2]) || 300;
	if (hash[3] != 'null') {
		highlighted = hash[3]
		setTimeout(()=>showInfo(objects[highlighted]), 1000)
	}
	updateHash();
}
setInterval(updateHash,1000);
function updateHash() {window.location.hash = `${Math.round(view.phi)}:${Math.round(view.theta)}:${Math.round(view.zoom)}:${highlighted||null}`;}

useHash()

loadData()
getLocation()
