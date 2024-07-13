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
		catalogs.push(await (await fetch(CATALOG_URLS[i])).json())
	}
	for (var i=0;i<catalogs.length;i++) {
		for (var objectID in catalogs[i].objects) {
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
	let origin = xyToCanvasCoords({x:0,y:-Math.tan((-Math.PI/180)*(view.phi))}); // believe it or not this was pure guess and check to get this equation...
	let radius = Math.abs(origin.y - xyToCanvasCoords(projectAltAz(0,270, false)).y);

	// let sky = ctx.createRadialGradient(origin.x,origin.y,1,origin.x, origin.y,radius);
	// sky.addColorStop(0, "rgb(100,100,2550)");
	// // sky.addColorStop(0.8, "rgb(100,100,2550)");
	// sky.addColorStop(1, "skyblue");
	sky = "rgba(0,0,0,0)"

	if (origin.y > ctx.canvas.height/2) {
		ctx.fillStyle = sky;
		ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height)
		drawCircle(origin.x, origin.y, radius, "black", true);
	} else {
		drawCircle(origin.x, origin.y, radius, sky, true);
	}
	drawCircle(origin.x, origin.y, radius, "grey", false);
}

function draw() {
	let calcdate = getTime();
	setControls();
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;


	drawHorizon();
	// ctx.beginPath()
	// ctx.fillStyle = "green";
	// ctx.shadowBlur = 1;
	// ctx.shadowColor = "red";
	// ctx.arc(0,0,100,0,2*Math.PI);
	// ctx.shadowBlur = 0;
	// ctx.fill();

	for (var objectID in objects) {
		let object = objects[objectID];

		let altaz;

		if (object.position.type == 'equatorial') {
			altaz = radecToaltaz(object.position.ra, object.position.dec, geolocation.lat, geolocation.lon, calcdate)
			object.size = Math.min(3, 4/object.magnitude) * ((1.4*view.zoom)/ctx.canvas.height);

		} else if (object.position.type == 'keplarian') {
			let keplarianProperties = calculateKeplarianProperties(object, daysSinceJ2000(calcdate));
			altaz = radecToaltaz(keplarianProperties.ra, keplarianProperties.dec, geolocation.lat, geolocation.lon, calcdate)
			// console.log(object.name, keplarianProperties.size);
			object.size = Math.max(10*arcsecondsToPixels(keplarianProperties.size, altaz.altitude, altaz.azimuth), 5);
			object.magnitude = 0;
		}

		if (altaz.altitude < 0 || object.magnitude > getVisibleMagnitude()) continue;

		// let size = 2;
		let size = object.size;
		let alpha = 3*size;

		let color;
		if (object.color) {color = rgb(...object.color, alpha);}
		else {color = 'green';}


		let canvasxy = xyToCanvasCoords(projectAltAz(altaz.altitude, altaz.azimuth));
		const over = 30;
		if (canvasxy.x > -over && canvasxy.y > -over && canvasxy.x < ctx.canvas.width+over && canvasxy.y < ctx.canvas.height+over) {
			drawCircle(canvasxy.x, canvasxy.y, size/2, color)
			// console.log(((size*ctx.canvas.height)/view.zoom) )
			if (object.name && size > 2) {
				ctx.fillStyle = "red";
				ctx.font = Math.min(20, Math.max(12, size+5))+"px monospace";
				ctx.fillText(object.name, canvasxy.x, canvasxy.y)
			}
		}
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

	requestAnimationFrame(draw)
}

function getVisibleMagnitude() {
	return 100;
}

function useHash() {
	hash = window.location.hash.slice(1).split(":");
	if (hash.length < 3) return
	view.phi = parseFloat(hash[0]) || 0;
	view.theta = parseFloat(hash[1]) || 0;
	view.zoom = parseFloat(hash[2]) || 300;
	updateHash();
}
setInterval(updateHash,1000);
function updateHash() {window.location.hash = `${Math.round(view.phi)}:${Math.round(view.theta)}:${Math.round(view.zoom)}`;}

useHash()

loadData()
getLocation()
