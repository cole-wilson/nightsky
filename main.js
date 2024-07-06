let data, names;
let geolocation = JSON.parse(localStorage.getItem("geo")) || {lat: 0, lon: 0};
let view = {zoom: 160, phi: 0, theta: 0};
var lastdrag = {};
var dragging = false;
var moved = false;
var clickable = {};
const J2000 = 2451545.0;

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function getLocation() {
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition((position) => {
			geolocation.lat = position.coords.latitude;
			geolocation.lon = position.coords.longitude;
			localStorage.setItem("geo", JSON.stringify(geolocation))
		});
	}
}

function daysSinceJ2000(date) {
	let jd = (date / 86400000) + 2440587.5;
	return jd - J2000;
}
function getSiderealTime(longitude, date) {
	let ut = date.getUTCHours() + (date.getUTCMinutes() / 60) + (date.getUTCSeconds() / 36000) + (date.getUTCMilliseconds() / 3.6e+6);
	let d = daysSinceJ2000(date);
	var lst = 100.46 + (0.985647 * d) + longitude + (15 * ut);
	if (lst < 0) {lst += 360};
	if (lst > 360) {lst -= 360};
	return lst;
}
function getHourAngle(longitude, date, ra_deg) {
	let siderealtime = getSiderealTime(longitude, date);
	let ha = siderealtime - ra_deg;
	if (ha < 0) ha += 360;
	return ha;
}
function radecToaltaz(ra, dec, latitude, longitude, date) {
	let ha = getHourAngle(longitude, date, ra.deg);

	let sinDEC = Math.sin(dec.rad);
	let cosDEC = Math.cos(dec.rad);
	let sinLAT = Math.sin((Math.PI/180) * latitude);
	let cosLAT = Math.cos((Math.PI/180) * latitude);
	let sinHA  = Math.sin((Math.PI/180) * ha);
	let cosHA  = Math.cos((Math.PI/180) * ha);

	var altitude = Math.asin((sinDEC*sinLAT) + (cosDEC*cosLAT*cosHA));
	var azimuth = (180/Math.PI) * Math.acos((sinDEC - (Math.sin(altitude)*sinLAT)) / (Math.cos(altitude)*cosLAT));
	altitude *= (180/Math.PI);
	if (sinHA > 0) azimuth = 360 - azimuth;

	return {altitude: altitude, azimuth: azimuth};
}

function rotateAltAz(alt, az) {
	let phi = (Math.PI/180) * (90 - alt);
	let theta = (Math.PI/180) * (az + view.theta);
	let dphi = (Math.PI/180) * view.phi;

	let x = Math.sin(phi) * Math.cos(theta);
	let y = Math.sin(phi) * Math.sin(theta);
	let z = Math.cos(phi);

	let x2 = x;
	let y2 = Math.sqrt(Math.pow(y, 2) + Math.pow(z, 2)) * Math.cos(dphi + Math.atan2(z, y));
	let z2 = Math.sqrt(Math.pow(y, 2) + Math.pow(z, 2)) * Math.sin(dphi + Math.atan2(z, y));

	let phi2 = Math.atan2(Math.sqrt(Math.pow(x2, 2) + Math.pow(y2, 2)), z2);
	let theta2 = Math.atan2(y2, x2);

	let alt2 = 90 - ((180/Math.PI) * phi2);
	let az2 =  ((180/Math.PI) * theta2);

	return {altitude: alt2, azimuth: az2};
}

function projectAltAz(alt, az) {

	newaltaz = rotateAltAz(alt, az);

	alt = newaltaz.altitude;
	az = newaltaz.azimuth;
	az *= -1;
	alt *= -1;
	let zenithAngle = (Math.PI/180)*(90 - alt);
	let r = 1/Math.tan(zenithAngle/2);
	let theta = (Math.PI/180)*az;
	return {x:r*Math.cos(theta), y:r*Math.sin(theta)};
}

async function loadData() {
	data = await (await fetch("./data/out6.5.json")).json();
	names = await (await fetch("./data/names.json")).json();
	requestAnimationFrame(draw)
}

function drawStar(star, x, y) {
	let rgb = bvColor(star.color_index.value)
	let mag = star.magnitude.hipparcos;
	let size = Math.min(20/mag, 15);
	if (view.zoom > 500) size += 2
	if (view.zoom > 700) size += 2
	if (view.zoom > 1000) size += view.zoom/400
	// console.log(size)
	ctx.font = size + "px monospace";
	let adjusted_rgb = adjustRGBtoMagnitude(rgb, mag);
	ctx.fillStyle = `rgb(${adjusted_rgb[0]}, ${adjusted_rgb[1]}, ${adjusted_rgb[2]})`
	ctx.fillText(".", x, y);

	clickable[[Math.floor(x),Math.floor(y)]] = star;

	if (0.9*mag < view.zoom/400 && star.hip in names) {
		ctx.font = Math.max(10, Math.min(size, 13)) + "px monospace";
		ctx.fillText("  "+names[star.hip], x, y);
	}
}

function draw() {
	clickable = {};
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	ctx.strokeStyle = "red";
	ctx.beginPath();
	// ctx.arc(ctx.canvas.width/2,ctx.canvas.height/2,9,0,2*Math.PI)
	ctx.stroke()

	data.forEach(star => {
		let altaz = (radecToaltaz(star.RA, star.DEC, geolocation.lat, geolocation.lon, new Date()));

		if (altaz.altitude < 0) return;

		let xy = projectAltAz(altaz.altitude, altaz.azimuth)
		let canvasxy = xyToCanvasCoords(xy);
		if (canvasxy.x > 0 && canvasxy.y > 0 && canvasxy.x < ctx.canvas.width && canvasxy.y < ctx.canvas.height) {
			drawStar(star, canvasxy.x, canvasxy.y)
		}
	})

	let labels = {"N":[0,0], "E":[0,90], "S":[0,180], "W":[0,270], "*":[90,0]}
	for (var label in labels) {
		ctx.font = "15px monospace";
		ctx.fillStyle = "red";
		let xytext = projectAltAz(...labels[label]);
		let canvasxytext = xyToCanvasCoords(xytext)
		ctx.fillText(label, canvasxytext.x, canvasxytext.y)
	}

	requestAnimationFrame(draw)
}
function xyToCanvasCoords(xy) {
	return {x:(ctx.canvas.width/2) + view.zoom * xy.x, y:(ctx.canvas.height/2) + view.zoom * xy.y};
}


// window.addEventListener("mousewheel", e => {view.zoom = Math.max(view.zoom - e.deltaY, 160);})
window.addEventListener("wheel", e => {
	e.preventDefault()
	updateHash()
	view.zoom = Math.max(view.zoom - 2*e.deltaY, 160);
}, {passive:false})

window.addEventListener("mousedown", e => {dragging=true;lastdrag={x:e.clientX, y:e.clientY}; moved=false})
window.addEventListener("mousemove", e => {
	moved = true;
	if (!dragging) return;
	let deltaX = e.clientX - lastdrag.x;
	let deltaY = -(e.clientY - lastdrag.y);
	lastdrag={x:e.clientX, y:e.clientY}
	pan(deltaX, deltaY, e.clientX, e.clientY);
})
window.addEventListener("mouseup", e=>{
	dragging = false
	if (!moved) handleClick(e);
})
function handleClick(e) {
	var star = false;
	for (i in clickable) {
		let sx = parseInt(i.split(',')[0]);
		let sy = parseInt(i.split(',')[1]);
		if (Math.abs(sx - e.clientX) < 10 && Math.abs(sy - e.clientY) < 10) {
			let thisstar = clickable[i];
			if (star && thisstar.magnitude.hipparcos < star.magnitude.hipparcos) {
				star = thisstar
			} else if (!star) {
				star = thisstar
			}
		}
	}
	let altaz = radecToaltaz(star.RA, star.DEC, geolocation.lat, geolocation.lon, new Date());
	flyTo(-(90 - altaz.altitude), -(90 + altaz.azimuth), 1000)
	// view.zoom = 160 * Math.pow(4, star.magnitude.hipparcos);
	console.log(names[star.hip] || star.hip, altaz.azimuth);
}

function flyTo(phi, theta, zoom) {
	const tolerance = 1;
	const ztolerance = 10;
	console.log(Math.abs(view.zoom - zoom))

	let thetaBad = Math.abs(view.theta - theta) > tolerance;
	let phiBad = Math.abs(view.phi - phi) > tolerance;
	let zoomBad = Math.abs(view.zoom - zoom) > ztolerance;
	if (thetaBad) view.theta -= 2 * Math.sign(view.theta - theta);
	if (phiBad) view.phi -= 2 * Math.sign(view.phi - phi);
	if (zoomBad) view.zoom -= 20 * Math.sign(view.zoom - zoom);
	if (thetaBad || phiBad || zoomBad) setTimeout(()=>flyTo(phi, theta, zoom), 10)
	else updateHash();
	console.log(thetaBad, phiBad, zoomBad)
	return;
}
function pan(dx, dy, cx, cy) {
	updateHash()
	let dphi = (dy/view.zoom) * 110;
	let dtheta = (dx/view.zoom) * 110;

	var zenith = xyToCanvasCoords(projectAltAz(90, 0));
	let south = xyToCanvasCoords(projectAltAz(-90, 0))
	if ((Math.abs(zenith.y) > Math.abs(south.y) && cy > south.y) || (cy < zenith.y)) {
		dtheta *= -1;
		// dphi *= -1;
	}

	view.phi -= dphi;
	view.phi = Math.max(Math.min(0, view.phi), -180);
	view.theta += dtheta;
	// console.log(dphi)
}

function adjustRGBtoMagnitude(rgb, magnitude) {
	// if (magnitude < 1.5) return [255,255,255]
	// if (magnitude < 2.5) return [200,200,200]
	// if (magnitude < 3.5) return [150,150,150]
	// if (magnitude < 4.5) return [100,100,100]
	// else return [50,50,50]
	return rgb
	// let adjust =  1 / Math.pow(9, 0.2 * (magnitude - 1));
	// // let adjust = 1;
	// return rgb.map(i=>adjust*i);
}

function bvColor(index) {
	if (index >= 1.4) return [255, 165, 0];
	if (index >= 0.8) return [255, 253, 208];
	if (index >= 0.6) return [253, 244, 220];
	if (index >= 0.3) return [255, 255, 255];
	if (index >= 0.0) return [216, 222, 236];
	else return [135, 206, 235];
}
function useHash() {
	hash = window.location.hash.slice(1).split(":");
	if (hash.length < 3) return
	view.phi = parseFloat(hash[0]);
	view.theta = parseFloat(hash[1]);
	view.zoom = parseFloat(hash[2]);
}
function updateHash() {
	window.location.hash = `${view.phi}:${view.theta}:${view.zoom}`;
}
// window.onhashchange = useHash;
useHash()

loadData()
getLocation()
// setInterval(convertDataAltAz, 1000);
