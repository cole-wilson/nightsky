import json
import csv
import re
import math

output = {
    "name": "NexStar DSO Messier",
    "url": "https://www.nexstarsite.com/Book/DSO.htm",
    "attribution": "nexstarsite.com",
    "objects": {}
}

def getSize(i):
    try:
        return float(i.strip("Size: ").split("x")[0]) * 71
    except:
        return None

def getName(n):
    matches = re.findall(r"NGC\s\d+\s(.*?)\s*$", n)
    if len(matches) > 0 and matches[0] != '':
        return matches[0]
    else:
        return n.strip()
def sign(pm):
    if pm.strip() == "+":
        return 1
    else:
        return -1
with open("./data.csv") as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        num, name, typ, const, rahour, ramin, decsign, decdeg, decminute, mag, info, dist = row
        print(row)

        output["objects"]["M"+num.strip()] = {
            "id": "M"+num.strip(),
            "type": "dso",
            "position": {
                "type": "equatorial",
                "ra": (float(rahour)*15) + (float(ramin)/60.0),
                "dec": sign(decsign) * (float(decdeg) + (float(decminute)/60.0)),
                "constellation": const
            },
            "magnitude": float(mag.split(" ")[0]),
            "color": [0,255,0],
            "size": getSize(info),
            "name": getName(name)
        }

# with open('../../data/out.json', 'w+') as outfile:
    # outfile.write(json.dumps(output))

with open('../../data/messier.json', 'w+') as outfile:
    outfile.write(json.dumps(output, separators=(',', ':')))
