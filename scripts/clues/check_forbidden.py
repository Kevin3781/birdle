import json, re, sys

forbidden = {
  "mountain-bluebird": ["bluebird","currucoides","mountain","sialia"],
  "cedar-waxwing": ["bombycilla","cedar","cedrorum","waxwing"],
  "black-crowned-night-heron": ["crowned","heron","night","nycticorax"],
  "tundra-swan": ["columbianus","cygnus","swan","tundra"],
  "northern-shoveler": ["clypeata","shoveler","spatula"],
  "ring-necked-duck": ["aythya","collaris","duck","necked","ring"],
  "sharp-shinned-hawk": ["accipiter","hawk","sharp","shinned","striatus"],
  "american-kestrel": ["falco","kestrel","sparverius"],
  "black-vulture": ["atratus","coragyps","vulture"],
  "eurasian-tree-sparrow": ["montanus","passer","sparrow","tree"],
  "mistle-thrush": ["mistle","thrush","turdus","viscivorus"],
  "sand-martin": ["martin","riparia","sand"],
  "carrion-crow": ["carrion","corone","corvus","crow"],
  "common-wood-pigeon": ["columba","palumbus","pigeon","wood"],
  "european-green-woodpecker": ["picus","viridis","woodpecker"],
  "black-tailed-godwit": ["godwit","limosa","tailed"],
  "eurasian-hobby": ["falco","hobby","subbuteo"],
  "red-billed-oxpecker": ["billed","buphagus","erythroryncha","oxpecker"],
  "spur-winged-goose": ["gambensis","goose","plectropterus","spur","winged"],
  "southern-ground-hornbill": ["bucorvus","ground","hornbill","leadbeateri"],
  "long-tailed-widowbird": ["euplectes","long","progne","tailed","widowbird"],
  "cape-sugarbird": ["cafer","cape","promerops","sugarbird"],
  "senegal-parrot": ["parrot","poicephalus","senegal","senegalus"],
  "african-penguin": ["african","demersus","penguin","spheniscus"],
  "indian-pond-heron": ["ardeola","grayii","heron","indian","pond"],
  "indian-roller": ["benghalensis","coracias","indian","roller"],
  "indian-grey-hornbill": ["birostris","hornbill","indian","ocyceros"],
  "hill-myna": ["gracula","hill","myna","religiosa"],
  "indian-paradise-flycatcher": ["flycatcher","indian","paradise","paradisi","terpsiphone"],
  "steppe-eagle": ["aquila","eagle","nipalensis","steppe"],
  "himalayan-monal": ["himalayan","impejanus","lophophorus","monal"],
  "long-tailed-shrike": ["lanius","long","schach","shrike","tailed"],
  "brown-fish-owl": ["fish","ketupa","zeylonensis"],
  "vernal-hanging-parrot": ["hanging","loriculus","parrot","vernal","vernalis"],
  "guianan-cock-of-the-rock": ["cock","guianan","rock","rupicola"],
  "humboldt-penguin": ["humboldt","humboldti","penguin","spheniscus"],
  "andean-flamingo": ["andean","andinus","flamingo","phoenicoparrus"],
  "american-flamingo": ["flamingo","phoenicopterus","ruber"],
  "blue-winged-kookaburra": ["dacelo","kookaburra","leachii","winged"],
  "australian-wood-duck": ["australian","chenonetta","duck","jubata","wood"],
}

with open(r"C:\src\birdle\scripts\clues\fixes.json") as f:
    data = json.load(f)

hits = []
for bird_id, words in forbidden.items():
    entry = data.get(bird_id, {})
    for field in ("region", "behavior"):
        text = entry.get(field, "").lower()
        for w in words:
            if re.search(r'\b' + re.escape(w.lower()) + r'\b', text):
                hits.append("  FAIL [%s] field=%s word='%s'" % (bird_id, field, w))

if hits:
    print("VIOLATIONS FOUND:")
    for h in hits: print(h)
    sys.exit(1)
else:
    print("ALL CLEAR - zero forbidden-word matches in region/behavior across all 40 birds.")
