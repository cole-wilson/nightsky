let view = {zoom: window.innerHeight/2, phi: 0, theta: 0, rot: 0};
var clickable = {};
var cursor = {x:0,y:0}
var lastdrag = {};
var lastPinchDist = 0;
var dragging = false;
var moved = false;
var clickable = {};
var highlighted = null;

const GRID_STEPS_X = 10;
const GRID_STEPS_Y = 10;

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function rgb(r, g, b, a=1) {
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function drawCircle(x, y, r, color, fill=true) {
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2*Math.PI);
	if (fill) ctx.fill();
	else ctx.stroke();
}

document.getElementById("stars").addEventListener("wheel", e => {
	e.preventDefault()
	let delta = (view.zoom/100)*4*e.deltaY;
	let newzoom = view.zoom - delta;
	view.zoom = Math.max(Math.min(newzoom, 100000), 160);
}, {passive:false})

document.getElementById("stars").addEventListener("mousedown", e => {dragging=true;lastdrag={x:e.clientX, y:e.clientY}; moved=false})
document.getElementById("stars").addEventListener("touchstart", e => {
	e.preventDefault()
	if (e.touches.length == 2) {
		lastPinchDist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
	} else if (e.touches.length == 1) {
		dragging=true;
		lastdrag={x:e.touches[0].clientX, y:e.touches[0].clientY};
		moved=false;
	}
})
document.getElementById("stars").addEventListener("touchmove", e => {
	e.preventDefault();
	if (e.touches.length == 1) mouseMove(e.touches[0].clientX, e.touches[0].clientY)
	else if (e.touches.length == 2) {
		let nowPinchDist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
		let delta = 4.5*(lastPinchDist - nowPinchDist);
		view.zoom = Math.max(view.zoom - delta, 160);
		lastPinchDist = nowPinchDist;
	}
})
document.getElementById("stars").addEventListener("mousemove", e => mouseMove(e.clientX, e.clientY))


function mouseMove(x, y) {
	cursor = {x:x, y:y}
	if (!dragging) return;

	let deltaX = x - lastdrag.x;
	let deltaY = -(y - lastdrag.y);

	lastdrag=cursor

	moved = true;
	pan(deltaX, deltaY, x, y);
}

document.getElementById("stars").addEventListener("mouseup", e => mouseUp(e.clientX, e.clientY))
document.addEventListener("touchend", e => {if (e.touches.length == 1) mouseUp(e.touches[0].clientX, e.touches[0].clientY)})

function mouseUp(x,y) {
	dragging = false
	if (!moved) handleClick(x, y);
}

function getSquare(x, y) {
	let sizemult = Math.min(1, Math.max(1.5, 0.5 * view.zoom / ctx.canvas.height));
	let rx = Math.floor(x/(GRID_STEPS_X * sizemult));
	let ry = Math.floor(y/(GRID_STEPS_Y * sizemult));
	return rx+":"+ry;
}
function drawSquares() {
	ctx.strokeStyle = "green";
	ctx.globalAlpha = 0.6;

	let sizemult = Math.min(1, Math.max(1.5, 0.5 * view.zoom / ctx.canvas.height));
	let gsy = GRID_STEPS_Y * sizemult;
	let gsx = GRID_STEPS_X * sizemult;

	for (var x=0;x<ctx.canvas.width/gsx;x++) {
		for (var y=0;y<ctx.canvas.height/gsy;y++) {
			ctx.strokeRect(x*gsx, y*gsy, gsx, gsy);
		}
	}
	ctx.globalAlpha = 1;
}

function handleClick(x, y) {
	var star = false;

	let square = getSquare(x, y);

	console.log(square)

	if (square in clickable) {
		let object = clickable[square];
		highlighted = object.id;
		showInfo(object)
	}
}

function drawCursor() {
	if ((highlighted in objects)) {
		let object = objects[highlighted];
		ctx.lineWidth = 3;
		drawCircle(object.canvasxy.x, object.canvasxy.y, 8 + object.size/2, "red", false);
		ctx.lineWidth = 1;

	}
}

function pan(dx, dy, cx, cy) {
	let dphi = (dy/view.zoom) * 110;
	let dtheta = (-dx/view.zoom) * 110;

	var zenith = xyToCanvasCoords(projectAltAz(90, 0));
	let south = xyToCanvasCoords(projectAltAz(-90, 0))
	if ((Math.abs(zenith.y) > Math.abs(south.y) && cy > south.y) || (cy < zenith.y)) {
		dtheta *= -1;
		// dphi *= -1;
	}

	view.phi -= dphi;
	view.phi = Math.max(Math.min(90, view.phi), -90);
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

function flyTo(alt, az, zoom) {
	view.zoom = zoom;
	view.phi = alt;
	view.theta = az;
}
