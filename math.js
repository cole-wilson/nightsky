const J2000 = 2451545.0;

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

function radecToaltaz(ra, dec, latitude, longitude, date, log=false) {
	let ha = getHourAngle(longitude, date, ra);

	let sinDEC = Math.sin((Math.PI/180) * dec);
	let cosDEC = Math.cos((Math.PI/180) * dec);
	let sinLAT = Math.sin((Math.PI/180) * latitude);
	let cosLAT = Math.cos((Math.PI/180) * latitude);
	let sinHA  = Math.sin((Math.PI/180) * ha);
	let cosHA  = Math.cos((Math.PI/180) * ha);

	if (log) console.log(ha, sinDEC, cosDEC, sinLAT, cosLAT, sinHA, cosHA);

	var altitude = Math.asin((sinDEC*sinLAT) + (cosDEC*cosLAT*cosHA));
	var azimuth = (180/Math.PI) * Math.acos((sinDEC - (Math.sin(altitude)*sinLAT)) / (Math.cos(altitude)*cosLAT));
	altitude *= (180/Math.PI);
	if (sinHA > 0) azimuth = 360 - azimuth;

	return {altitude: altitude, azimuth: azimuth};
}

function rotateAltAz(alt, az, changeAzimuth=true) {
	let phi = (Math.PI/180) * (90 - alt);
	let theta = (Math.PI/180) * (az + (changeAzimuth? view.theta : 0));
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

function projectAltAz(alt, az, changeAzimuth=true) {
	newaltaz = rotateAltAz(alt, az, changeAzimuth);
	alt = newaltaz.altitude;
	az = newaltaz.azimuth;

	az *= -1;
	alt *= -1;
	let zenithAngle = (Math.PI/180)*(90 - alt);
	let r = 1/Math.tan(zenithAngle/2);
	let theta = (Math.PI/180)*az;
	return {x:r*Math.cos(theta), y:r*Math.sin(theta)};
}
