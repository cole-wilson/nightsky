var AR_MODE = false;
document.getElementById("use_ar").addEventListener("click",(e)=>{
	AR_MODE = !AR_MODE;

	if (AR_MODE) {
		e.target.style.color = "white";
		DeviceOrientationEvent.requestPermission()
            .then( response => {
					let video = document.getElementById("camera");
	navigator.mediaDevices
		.getUserMedia({ video: {facingMode: 'environment'}, audio: false })
		.then((stream) => {
			video.srcObject = stream;
			video.play();
		})
  .catch((err) => {
    console.error(`An error occurred: ${err}`);
  });
            if ( response == "granted" ) {
                window.addEventListener( "deviceorientation", handleOrientation)
            }
        })

	} else {
		e.target.style.color = "grey";
	}
});
// window.addEventListener("deviceorientation", handleOrientation, true);


function handleOrientation(event) {
	// view.zoom = 400;

	var compass = event.alpha;
	if (event.webkitCompassHeading)
		compass = event.webkitCompassHeading;
	compass = (compass);

	let vert;
	var rot;

	switch (screen.orientation.type) {
		case 'landscape-primary':
			// compass -= 90;
			rot = -event.beta;
			if (event.gamma > 0)
				vert = 180 - event.gamma;
			else
				vert = -event.gamma;
			break;
		case 'portrait-secondary':
			// compass -= 180;
			rot = 0;
			vert = -event.beta;
			break;
		case 'landscape-secondary':
			// compass -= 270;
			rot = event.beta;
			if (event.gamma < 0)
				vert = 180 + event.gamma;
			else
				vert = event.gamma;
			break;
		case 'portrait-primary':
			rot = 0;
			// compass -= 0;
			vert = event.beta;
			break;
	}

	document.getElementById("debug").innerHTML = `
a = ${Math.round(event.alpha)}<br>
b = ${Math.round(event.beta)}<br>
g = ${Math.round(event.gamma)}<br>
w = ${Math.round(event.webkitCompassHeading)}<br>
v = ${Math.round(vert)}<br>
c = ${compass}<br>
r = ${Math.round(rot)}
	`;
	// ctx.canvas.style.transform = "rotate("+rot+"deg)";

	if (vert > 135 || vert < -135)
		compass *= -1

	view.theta = compass;
	view.phi = (vert + 90) - 180;
}
