let data = {
	name: "Planets, Sun, and Moon",
	url: "https://stjarnhimlen.se/comp/ppcomp.html",
	attribution: "Paul Schlyter, Stockholm, Sweden",
	objects: {
		sun: {
			id: 'sun',
			type: 'planet',
			magnitude: null,
			color: [0, 0, 255],
			name: 'sun',
			position: {
				type: "keplarian",
				N: [0.0, 0],
				i: [0.0, 0],
				w: [282.9404, +4.70935E-5],
				a: [1.000000, 0],
				e: [0.016709, -1.151E-9],
				M: [356.0470, +0.9856002585],
			}
		},
		moon: {
			id: 'moon',
			type: 'planet',
			magnitude: null,
			color: [0, 0, 255],
			name: 'moon',
			position: {
				type: "keplarian",
				N: [125.1228, -0.0529538083],
				i: [5.1454, 0],
				w: [318.0634, +0.1643573223],
				a: [60.2666, 0],
				e: [0.054900, 0],
				M: [115.3654, +13.0649929509],
			}
		},
		mercury: {
			id: 'mercury',
			type: 'planet',
			magnitude: null,
			color: [0, 0, 255],
			name: 'mercury',
			position: {
				type: "keplarian",
				N: [ 48.3313, +3.24587E-5],
				i: [7.0047, +5.00E-8],
				w: [ 29.1241, +1.01444E-5],
				a: [0.387098, 0],
				e: [0.205635, +5.59E-10],
				M: [168.6562, +4.0923344368],
			}
		},
		venus: {
			id: 'venus',
			type: 'planet',
			magnitude: null,
			color: [0, 0, 255],
			name: 'venus',
			position: {
				type: "keplarian",
				N: [ 76.6799, +2.46590E-5],
				i: [3.3946, +2.75E-8],
				w: [ 54.8910, +1.38374E-5],
				a: [0.723330, 0],
				e: [0.006773, -1.302E-9],
				M: [ 48.0052, +1.6021302244],
			}
		},
		mars: {
			id: 'mars',
			type: 'planet',
			magnitude: null,
			color: [0, 0, 255],
			name: 'mars',
			position: {
				type: "keplarian",
				N: [ 49.5574, +2.11081E-5],
				i: [1.8497, -1.78E-8],
				w: [286.5016, +2.92961E-5],
				a: [1.523688, 0],
				e: [0.093405, +2.516E-9],
				M: [ 18.6021, +0.5240207766],
			}
		},
		jupiter: {
			id: 'jupiter',
			type: 'planet',
			magnitude: null,
			color: [0, 0, 255],
			name: 'jupiter',
			position: {
				type: "keplarian",
				N: [100.4542, +2.76854E-5],
				i: [1.3030, -1.557E-7],
				w: [273.8777, +1.64505E-5],
				a: [5.20256, 0],
				e: [0.048498, +4.469E-9],
				M: [ 19.8950, +0.0830853001],
			}
		},
		saturn: {
			id: 'saturn',
			type: 'planet',
			magnitude: null,
			color: [0, 0, 255],
			name: 'saturn',
			position: {
				type: "keplarian",
				N: [113.6634, +2.38980E-5],
				i: [2.4886, -1.081E-7],
				w: [339.3939, +2.97661E-5],
				a: [9.55475, 0],
				e: [0.055546, -9.499E-9],
				M: [316.9670, +0.0334442282],
			}
		},
		uranus: {
			id: 'uranus',
			type: 'planet',
			magnitude: null,
			color: [0, 0, 255],
			name: 'uranus',
			position: {
				type: "keplarian",
				N: [ 74.0005, +1.3978E-5],
				i: [0.7733, +1.9E-8],
				w: [ 96.6612, +3.0565E-5],
				a: [19.18171, -1.55E-8],
				e: [0.047318, +7.45E-9],
				M: [142.5905, +0.011725806],
			}
		},
		neptune: {
			id: 'neptune',
			type: 'planet',
			magnitude: null,
			color: [0, 0, 255],
			name: 'neptune',
			position: {
				type: "keplarian",
				N: [131.7806, +3.0173E-5],
				i: [1.7700, -2.55E-7],
				w: [272.8461, -6.027E-6],
				a: [30.05826, +3.313E-8],
				e: [0.008606, +2.15E-9],
				M: [260.2471, +0.005995147],
			}
		}
	}
}




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
