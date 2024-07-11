function setControls() {
	let el = document.getElementById("info");
	el.innerText = geolocation.lat + ", " + geolocation.lon + " " + new Date();
}
