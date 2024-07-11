import json
import re
import math

with open("./hip2.dat.gz") as catalog:
    data = catalog.read().split('\n')

with open("./names.json") as namefile:
    names = json.loads(namefile.read())

headerlinecount = 0
while headerlinecount < 2:
    if data[0].startswith('---'):
        headerlinecount += 1
    del data[0]

output = {
    "name": "Hipparcos, the New Reduction",
    "url": "https://cdsarc.u-strasbg.fr/viz-bin/cat/I/311#/browse",
    "attribution": "van Leeuwen, 2007",
    "objects": {}
}

def bv_color(index):
    if (index >= 1.4): return [255, 165, 0];
    if (index >= 0.8): return [255, 253, 208];
    if (index >= 0.6): return [253, 244, 220];
    if (index >= 0.3): return [255, 255, 255];
    if (index >= 0.0): return [216, 222, 236];
    else: return [135, 206, 235];

for index, line in enumerate(data):
    if line.startswith('-'):
        break
    print(f"{index}/{len(data)}", end="\r")
    cols = map(str.strip, line.split('|'))
    hip, sn, so, nc, radec, plx, pmra, pmde, era, ede, eplx, epmra, epmde, ntr, f2, f1, var, ic, hpmag, ehpmag, shp, va, bv, ebv, vi, uw = cols
    ra, dec = map(str.strip, re.split(r"\s+", radec.strip()))
    uw = map(str.strip, re.split(r"\s+", uw.strip()))

    if float(hpmag) > 6.5:
        continue

    output["objects"]["HIP"+hip] = {
        "id": "HIP"+hip,
        "type": "star",
        "position": {
            "type": "equatorial",
            "ra": math.degrees(float(ra)),
            "dec": math.degrees(float(dec)),
        },
        "magnitude": float(hpmag),
        "color": bv_color(float(bv)),
        "size": None,
        "name": None if hip not in names else names[hip]
    }

# with open('../../data/out.json', 'w+') as outfile:
    # outfile.write(json.dumps(output))

with open('../../data/hipparcos.json', 'w+') as outfile:
    outfile.write(json.dumps(output, separators=(',', ':')))
