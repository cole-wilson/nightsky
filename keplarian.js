/**
 * HUGE thanks to https://stjarnhimlen.se/comp/ppcomp.html for all of the math in this file
 */
let pi = Math.PI;

function calculateSunRaDec(d) {
	let w = 282.9404 + 4.70935E-5 * d;
	let e = 0.016709 - 1.151E-9 * d;
	let M = 356.0470 + 0.9856002585 * d;
	let ecl = 23.4393 - 3.563E-7 * d;

	let E = M + e*(180/pi) * sin(M) * ( 1.0 + e * cos(M) );
	let xv = cos(E) - e
    let yv = sqrt(1.0 - e*e) * sin(E)

    let v = atan2( yv, xv )
    let r = sqrt( xv*xv + yv*yv )

	let lonsun = v + w

	let xs = r * cos(lonsun)
    let ys = r * sin(lonsun)

	let xe = xs
    let ye = ys * cos(ecl)
    let ze = ys * sin(ecl)

	let RA  = atan2( ye, xe )
    let Dec = atan2( ze, sqrt(xe*xe+ye*ye) )

	return {ra:RA, dec:Dec, r:r, lonsun: lonsun, Ms: M, ws: w, size: 1919.26}
}

function calculateKeplarianProperties(object, d) {
	let body = object.id;
	let sun = calculateSunRaDec(d);
	if (body == 'sun') return sun

	let N = object.position.N[0] + (object.position.N[1] * d);
	let i = object.position.i[0] + (object.position.i[1] * d);
	let w = object.position.w[0] + (object.position.w[1] * d);
	let a = object.position.a[0] + (object.position.a[1] * d);
	let e = object.position.e[0] + (object.position.e[1] * d);
	let M = object.position.M[0] + (object.position.M[1] * d);
	let d0= object.position.d0;
	let ecl = 23.4393 - 3.563E-7 * d;

	var E = M + e * (180/pi) * sin(M) * ( 1.0 + e * cos(M) );
	if (e > 0.05) {
		var E0;
		var E1 = E;
		while (Math.abs(E0 - E1) > 0.001) {
			E0 = E1;
			E1 = E0 - ( E0 - e*(180/pi) * sin(E0) - M ) / ( 1 - e * cos(E0) );
		}
		E = E1;
	}

	let xv = a * ( cos(E) - e );
    let yv = a * ( sqrt(1.0 - e*e) * sin(E) );

    let v = atan2( yv, xv )
    let r = sqrt( xv*xv + yv*yv )

	var xh = r * ( cos(N) * cos(v+w) - sin(N) * sin(v+w) * cos(i) )
    var yh = r * ( sin(N) * cos(v+w) + cos(N) * sin(v+w) * cos(i) )
    var zh = r * ( sin(v+w) * sin(i) )

	var lonecl = atan2( yh, xh )
    var latecl = atan2( zh, sqrt(xh*xh+yh*yh) )

	// let Epoch = 2000.0;
	// let lon_corr = 3.82394E-5 * ( 365.2422 * ( Epoch - 2000.0 ) - d );
	// lonecl += lon_corr;

	if (body == 'moon') {
		let Ms = sun.Ms;
		let Mm = M;
		let Nm = N;
		let ws = sun.ws;
		let wm = w;
		let Ls = Ms + ws;
		let Lm = Mm + wm + Nm  // Mean longitude of the Moon
    	let D = Lm - Ls        // Mean elongation of the Moon
    	let F = Lm - Nm        // Argument of latitude for the Moon

		latecl += ( -1.274 * sin(Mm - 2*D)          //(the Evection)
					+0.658 * sin(2*D)               //(the Variation)
					-0.186 * sin(Ms)                //(the Yearly Equation)
					-0.059 * sin(2*Mm - 2*D)
					-0.057 * sin(Mm - 2*D + Ms)
					+0.053 * sin(Mm + 2*D)
					+0.046 * sin(2*D - Ms)
					+0.041 * sin(Mm - Ms)
					-0.035 * sin(D)                 //(the Parallactic Equation)
					-0.031 * sin(Mm + Ms)
					-0.015 * sin(2*F - 2*D)
					+0.011 * sin(Mm - 4*D) );
		lonecl += ( -0.173 * sin(F - 2*D)
					-0.055 * sin(Mm - F - 2*D)
					-0.046 * sin(Mm + F - 2*D)
					+0.033 * sin(F + 2*D)
					+0.017 * sin(2*Mm + F) );
		r +=      ( -0.58 * cos(Mm - 2*D)
					-0.46 * cos(2*D) )
	} else if (body in ['jupiter', 'saturn', 'uranus']) {
		let Mj = getOrbitalParameters('jupiter', d).M;
		let Ms = getOrbitalParameters('saturn', d).M;
		let Mu = getOrbitalParameters('uranus', d).M;

		if (body == 'jupiter') {
			lonecl += ( -0.332 * sin(2*Mj - 5*Ms - 67.6)
						-0.056 * sin(2*Mj - 2*Ms + 21 )
						+0.042 * sin(3*Mj - 5*Ms + 21 )
						-0.036 * sin(Mj - 2*Ms)
						+0.022 * cos(Mj - Ms)
						+0.023 * sin(2*Mj - 3*Ms + 52 )
						-0.016 * sin(Mj - 5*Ms - 69 ) );
		} else if (body == 'saturn') {
			lonecl += ( +0.812 * sin(2*Mj - 5*Ms - 67.6 )
						-0.229 * cos(2*Mj - 4*Ms - 2 )
						+0.119 * sin(Mj - 2*Ms - 3 )
						+0.046 * sin(2*Mj - 6*Ms - 69 )
						+0.014 * sin(Mj - 3*Ms + 32 ) );
			latecl += ( -0.020 * cos(2*Mj - 4*Ms - 2 )
						+0.018 * sin(2*Mj - 6*Ms - 49 ) );
		} else if (body == 'uranus') {
			lonecl += ( +0.040 * sin(Ms - 2*Mu + 6 )
						+0.035 * sin(Ms - 3*Mu + 33 )
						-0.015 * sin(Mj - Mu + 20 ) );
		}
	}

	xh = r * cos(lonecl) * cos(latecl)
    yh = r * sin(lonecl) * cos(latecl)
    zh = r               * sin(latecl)

	let rs = sun.r;
	let lonsun = sun.lonsun;
	let xs = rs * cos(lonsun)
    let ys = rs * sin(lonsun)

	let xg = xh + xs
    let yg = yh + ys
    let zg = zh
	// let xg=xh,yg=yh,zg=zh;

	let xe = xg
    let ye = yg * cos(ecl) - zg * sin(ecl)
    let ze = yg * sin(ecl) + zg * cos(ecl)

	var RA  = atan2( ye, xe )
    var Dec = atan2( ze, sqrt(xe*xe+ye*ye) )

	let size;
	if (body == 'moon') size = 1873.7 * 60 / r;
	else if (body == 'sun') size = 1919.26;
	else size = d0 / r;

	let s = Math.hypot(xs, ys);
	let R = r;
	let hr = Math.hypot(xh, yh)

	let elong, FV;
	if (body == 'moon') {
		elong = acos( ( s*s + R*R - hr*hr ) / (2*s*R) );
		FV    = acos( ( hr*hr + R*R - s*s ) / (2*hr*R));
	}
	// else {
	// 	elong = acos( cos(slon - mlon) * cos(mlat) )
	// 	FV = 180 - elong
	// }
	// let phase =  hav(180 - FV);



	// if (body == 'moon') {
	// 	let mpar = asin( 1/r );
	// 	let gclat = lat - 0.1924 * sin(2*lat)
    	// let rho   = 0.99833 + 0.00167 * cos(2*lat)
	// }

	return {ra:RA, dec:Dec, size: size}
}

function sin(degrees) {return Math.sin((pi/180) * degrees);}
function cos(degrees) {return Math.cos((pi/180) * degrees);}
function tan(degrees) {return Math.tan((pi/180) * degrees);}
function sqrt(x) {return Math.sqrt(x);}
function atan2(b, a) {return (180/pi) * Math.atan2(b, a);}
function asin(a) {return (180/pi) * Math.asin(a);}
function acos(a) {return (180/pi) * Math.acos(a);}
function hav(degrees) {return sin(degrees/2) ** 2;}
