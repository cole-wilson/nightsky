/**
 * HUGE thanks to https://stjarnhimlen.se/comp/ppcomp.html for all of the math in this file
 */
let pi = Math.PI;

function getOrbitalParameters(body, jd) {
	var N, i, w, a, e, M;
	let d = jd;
	switch (body) {
		case 'sun':
			N = 0.0
			i = 0.0
			w = 282.9404 + 4.70935E-5 * d
			a = 1.000000
			e = 0.016709 - 1.151E-9 * d
			M = 356.0470 + 0.9856002585 * d
			break;
		case 'moon':
			N = 125.1228 - 0.0529538083 * d
			i = 5.1454
			w = 318.0634 + 0.1643573223 * d
			a = 60.2666
			e = 0.054900
			M = 115.3654 + 13.0649929509 * d
			break;
		case 'mercury':
			N =  48.3313 + 3.24587E-5 * d
			i = 7.0047 + 5.00E-8 * d
			w =  29.1241 + 1.01444E-5 * d
			a = 0.387098
			e = 0.205635 + 5.59E-10 * d
			M = 168.6562 + 4.0923344368 * d
			break;
		case 'venus':
			N =  76.6799 + 2.46590E-5 * d
			i = 3.3946 + 2.75E-8 * d
			w =  54.8910 + 1.38374E-5 * d
			a = 0.723330
			e = 0.006773 - 1.302E-9 * d
			M =  48.0052 + 1.6021302244 * d
			break;
		case 'mars':
			N =  49.5574 + 2.11081E-5 * d
			i = 1.8497 - 1.78E-8 * d
			w = 286.5016 + 2.92961E-5 * d
			a = 1.523688
			e = 0.093405 + 2.516E-9 * d
			M =  18.6021 + 0.5240207766 * d
			break;
		case 'jupiter':
			N = 100.4542 + 2.76854E-5 * d
			i = 1.3030 - 1.557E-7 * d
			w = 273.8777 + 1.64505E-5 * d
			a = 5.20256
			e = 0.048498 + 4.469E-9 * d
			M =  19.8950 + 0.0830853001 * d
			break;
		case 'saturn':
			N = 113.6634 + 2.38980E-5 * d
			i = 2.4886 - 1.081E-7 * d
			w = 339.3939 + 2.97661E-5 * d
			a = 9.55475
			e = 0.055546 - 9.499E-9 * d
			M = 316.9670 + 0.0334442282 * d
			break;
		case 'uranus':
			N =  74.0005 + 1.3978E-5 * d
			i = 0.7733 + 1.9E-8 * d
			w =  96.6612 + 3.0565E-5 * d
			a = 19.18171 - 1.55E-8 * d
			e = 0.047318 + 7.45E-9 * d
			M = 142.5905 + 0.011725806 * d
			break;
		case 'neptune':
			N = 131.7806 + 3.0173E-5 * d
			i = 1.7700 - 2.55E-7 * d
			w = 272.8461 - 6.027E-6 * d
			a = 30.05826 + 3.313E-8 * d
			e = 0.008606 + 2.15E-9 * d
			M = 260.2471 + 0.005995147 * d
			break;
		default:
			return;
	}
	let ecl = 23.4393 - 3.563E-7 * d;
	return {N:N,i:i,w:w,a:a,e:e,M:M,ecl:ecl}
}

function calculateSunRaDec(d) {
	let params = getOrbitalParameters('sun', d);
	let N = params.N;
	let i = params.i;
	let w = params.w;
	let a = params.a;
	let e = params.e;
	let M = params.M;
	let ecl = params.ecl;

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

	return {ra:{deg:RA, rad:(pi/180)*RA}, dec:{deg:Dec, rad:(pi/180)*Dec}, r:r, lonsun: lonsun, Ms: M, ws: w, }
}

function calculateKeplarianRaDec(body, d) {
	let sun = calculateSunRaDec(d);
	if (body == 'sun') return sun

	let params = getOrbitalParameters(body, d);
	let N = params.N;
	let i = params.i;
	let w = params.w;
	let a = params.a;
	let e = params.e;
	let M = params.M;
	let ecl = params.ecl;

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

	// if (body == 'moon') {
	// 	let mpar = asin( 1/r );
	// 	let gclat = lat - 0.1924 * sin(2*lat)
    	// let rho   = 0.99833 + 0.00167 * cos(2*lat)
	// }

	return {ra:{deg:RA, rad:(pi/180)*RA}, dec:{deg:Dec, rad:(pi/180)*Dec}}
}

function sin(degrees) {return Math.sin((pi/180) * degrees);}
function cos(degrees) {return Math.cos((pi/180) * degrees);}
function sqrt(x) {return Math.sqrt(x);}
function atan2(b, a) {return (180/pi) * Math.atan2(b, a);}
function asin(a) {return (180/pi) * Math.asin(a);}
