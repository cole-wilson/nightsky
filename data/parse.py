import json
import re
import math

with open("./hip2.dat.gz") as catalog:
    data = catalog.read().split('\n')

headerlinecount = 0
while headerlinecount < 2:
    if data[0].startswith('---'):
        headerlinecount += 1
    del data[0]

output = []

for index, line in enumerate(data):
    if line.startswith('-'):
        break
    print(f"{index}/{len(data)}", end="\r")
    cols = map(str.strip, line.split('|'))
    hip, sn, so, nc, radec, plx, pmra, pmde, era, ede, eplx, epmra, epmde, ntr, f2, f1, var, ic, hpmag, ehpmag, shp, va, bv, ebv, vi, uw = cols
    ra, dec = map(str.strip, re.split(r"\s+", radec.strip()))
    uw = map(str.strip, re.split(r"\s+", uw.strip()))
    star = {
        "hip": int(hip),
        "solution_types": {"new": int(sn), "old": int(so)},
        "components": int(nc),
        "RA": {"rad": float(ra), "error": float(era), "pm": float(pmra), "error_pm": float(epmra), "deg": math.degrees(float(ra))},
        "DEC":{"rad": float(dec),"error": float(ede), "pm": float(pmde), "error_pm": float(epmde), "deg": math.degrees(float(dec))},
        "parallax": {"value": float(plx), "error": float(eplx)},
        "n_field_transits": float(ntr),
        "gof": float(f2),
        "percent_rejected": float(f1),
        "cosmic_dispersion_added": float(var),
        "ic": float(ic),
        "magnitude": {"hipparcos": float(hpmag), "error": float(ehpmag), "scatter": float(shp)},
        "variability_reference": float(va),
        "color_index": {"value": float(bv), "error": float(ebv), "vi_color_index": float(vi)},
        "UW": list(map(float, uw))
    }
    output.append(star)

with open('out.json', 'w+') as outfile:
    outfile.write(json.dumps(output))

with open('out6.5.json', 'w+') as outfile:
    output = list(filter(lambda i: i['magnitude']['hipparcos'] <= 6.5, output))
    outfile.write(json.dumps(output))
