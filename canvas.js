let view = {zoom: window.innerHeight/2, phi: 0, theta: 0};
var clickable = {};
var cursor = {x:0,y:0}
var lastdrag = {};
var dragging = false;
var moved = false;
var clickable = {};


const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function rgb(r, g, b, a=1) {
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function drawCircle(x, y, r, color, fill=true, gradient=false) {
	// ctx.fillStyle = color;
	ctx.strokeStyle = color;
	// ctx.shadowBlur = 1;
	// ctx.shadowColor = "green";
	// ctx.font = r + "px monospace";
	// ctx.fillText(".", x, y)
	if (gradient) {
		const grd = ctx.createRadialGradient(x,y,1,x,y,r);
		grd.addColorStop(0, color);
		// grd.addColorStop(0.6, color);
		grd.addColorStop(1, "rgba(255,255,255,0.0)");
		ctx.fillStyle = grd;
	} else {
		ctx.fillStyle = color;
	}
	if (r > 1) {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2*Math.PI);
		if (fill) ctx.fill();
		else ctx.stroke();
	}
	else {
		ctx.fillRect(x, y, Math.ceil(r*2), Math.ceil(r*2));
	}
}

function drawStar(star, x, y) {
	let rgb = bvColor(star.color_index.value)
	let mag = star.magnitude.hipparcos;
	let size = Math.min(20/mag, 15);
	// if (view.zoom > 2000) size += 2
	// if (view.zoom > 4000) size += 2
	// if (view.zoom > 7000)
		size += view.zoom/500
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


// window.addEventListener("mousewheel", e => {view.zoom = Math.max(view.zoom - e.deltaY, 160);})
document.getElementById("stars").addEventListener("wheel", e => {
	e.preventDefault()
	view.zoom = Math.max(view.zoom - 2*e.deltaY, 160);
}, {passive:false})

document.getElementById("stars").addEventListener("mousedown", e => {dragging=true;lastdrag={x:e.clientX, y:e.clientY}; moved=false})
document.getElementById("stars").addEventListener("mousemove", e => {
	moved = true;
	cursor = {x:e.clientX, y:e.clientY}
	if (!dragging) return;
	let deltaX = e.clientX - lastdrag.x;
	let deltaY = -(e.clientY - lastdrag.y);
	lastdrag={x:e.clientX, y:e.clientY}
	pan(deltaX, deltaY, e.clientX, e.clientY);
})
document.getElementById("stars").addEventListener("mouseup", e=>{
	dragging = false
	if (!moved) handleClick(e);
})

window.addEventListener("click",()=>{
	DeviceOrientationEvent.requestPermission()
            .then( response => {
            if ( response == "granted" ) {
                window.addEventListener( "deviceorientation", handleOrientation)
            }
        })
});
// window.addEventListener("deviceorientation", handleOrientation, true);


function handleOrientation(event) {
	// view.zoom = 400;

	document.getElementById("debug").innerHTML = `
a = ${Math.round(event.alpha)}
b = ${Math.round(event.beta)}
g = ${Math.round(event.gamma)}
w = ${Math.round(event.webkitCompassHeading)}
	`;

	var compass = event.alpha;
	if (event.webkitCompassHeading)
		compass = event.webkitCompassHeading;
	compass = -(compass - 90);

	// if (event.beta > 90)
		// compass *= -1

	view.theta = compass;
	view.phi = (event.beta) - 180;
	window.E = event;
}


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
	if (star) {
		let altaz = radecToaltaz(star.RA, star.DEC, geolocation.lat, geolocation.lon, new Date());
		// flyTo(-(90 - altaz.altitude), -(90 + altaz.azimuth), 1000)
		// view.zoom = 160 * Math.pow(4, star.magnitude.hipparcos);
		console.log(names[star.hip] || star.hip, altaz.azimuth);
	}
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
	console.log(thetaBad, phiBad, zoomBad)
	return;
}
function pan(dx, dy, cx, cy) {
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


function xyToCanvasCoords(xy) {
	return {x:(ctx.canvas.width/2) + view.zoom * xy.x, y:(ctx.canvas.height/2) + view.zoom * xy.y};
}
function canvasCoordsToXY(coords) {
	return {x: (coords.x - (ctx.canvas.width/2)) / view.zoom, y: (coords.y - (ctx.canvas.width/2)) / view.zoom}
}

function arcsecondsToPixels(arcseconds, alt, az) {
	let ax = xyToCanvasCoords(projectAltAz(alt, az)).x;
	let bx = xyToCanvasCoords(projectAltAz(alt+(arcseconds/3600), az)).x;
	let ay = xyToCanvasCoords(projectAltAz(alt, az)).y;
	let by = xyToCanvasCoords(projectAltAz(alt+(arcseconds/3600), az)).y;
	let pixels = Math.hypot(ax-bx, ay-by);
	return pixels;
}
