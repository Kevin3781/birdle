/* birds.js — Bird dataset and lookup utilities */

const Birds = (() => {
  // All bird data is embedded to avoid CORS issues when opening index.html directly.
  // The JSON files in /data/ are the canonical source — keep them in sync if you update birds here.

  const GLOBAL_POOL = [
    {
      id: 'american-robin', commonName: 'American Robin', scientificName: 'Turdus migratorius',
      regions: ['north-america'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/American_robin_%2871307%29.jpg/960px-American_robin_%2871307%29.jpg',
      audioUrl: '', xenoCantoQuery: 'Turdus migratorius',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: 'About 25 cm (10 in) — similar in length to a starling',
        habitat: 'Lawns, parks, open woodlands, and gardens',
        diet: 'Earthworms, insects, and berries',
        migration: 'Short-distance migrant; some populations stay year-round in warmer areas',
      },
      hints: {
        region: 'Found year-round across North America, from Canada south to central Mexico',
        size: 'About the size of a large starling — roughly 25 cm from bill to tail tip',
        behavior: 'Famously runs across lawns in quick bursts, then stops and tilts its head to listen for earthworms underground',
      },
      funFact: 'American Robins can produce up to three clutches of chicks in a single breeding season.',
      ebirdUrl: 'https://ebird.org/species/amerob',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/american-robin',
    },
    {
      id: 'bald-eagle', commonName: 'Bald Eagle', scientificName: 'Haliaeetus leucocephalus',
      regions: ['north-america'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Bald_eagle_about_to_fly_in_Alaska_%282016%29.jpg/960px-Bald_eagle_about_to_fly_in_Alaska_%282016%29.jpg',
      audioUrl: '', xenoCantoQuery: 'Haliaeetus leucocephalus',
      focalPoint: { x: 0.5, y: 0.35 },
      facts: {
        size: '71–96 cm body length; wingspan up to 2.4 m',
        habitat: 'Coasts, large lakes, and rivers with tall trees for nesting',
        diet: 'Primarily fish, supplemented by waterfowl and carrion',
        migration: 'Mostly resident; northern populations migrate south in winter',
      },
      hints: {
        region: 'Found near large bodies of water across North America, from Alaska to Florida',
        size: 'One of North America\'s largest raptors — wingspan can reach over 2 metres',
        behavior: 'Swoops low to snatch live fish from just below the water\'s surface with its powerful talons',
      },
      funFact: 'Bald Eagles mate for life and return to the same nest each year, adding sticks until the nest can weigh over a tonne.',
      ebirdUrl: 'https://ebird.org/species/baleag',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/bald-eagle',
    },
    {
      id: 'atlantic-puffin', commonName: 'Atlantic Puffin', scientificName: 'Fratercula arctica',
      regions: ['europe'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Puffin_%28Fratercula_arctica%29.jpg/960px-Puffin_%28Fratercula_arctica%29.jpg',
      audioUrl: '', xenoCantoQuery: 'Fratercula arctica',
      focalPoint: { x: 0.5, y: 0.45 },
      facts: {
        size: 'About 25–30 cm, roughly the size of a pigeon',
        habitat: 'Open ocean in winter; grassy sea cliffs and islands in summer to breed',
        diet: 'Small fish, especially sand eels and herring',
        migration: 'Spends most of the year far out at sea; comes ashore only to breed',
      },
      hints: {
        region: 'Nests on rocky sea cliffs of the North Atlantic — Iceland, Norway, and the British Isles hold huge colonies',
        size: 'About the size of a pigeon — 25–30 cm — but surprisingly compact and round-bodied',
        behavior: 'Dives underwater and can carry a dozen small fish crosswise in its bill at once, flying back to its burrow to feed chicks',
      },
      funFact: 'Puffins are excellent swimmers, using their wings to "fly" underwater at depths of up to 60 metres.',
      ebirdUrl: 'https://ebird.org/species/atlpuf',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/atlantic-puffin',
    },
    {
      id: 'blue-jay', commonName: 'Blue Jay', scientificName: 'Cyanocitta cristata',
      regions: ['north-america'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Blue_jay_in_PP_%2830960%29.jpg/960px-Blue_jay_in_PP_%2830960%29.jpg',
      audioUrl: '', xenoCantoQuery: 'Cyanocitta cristata',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: 'About 25–30 cm — slightly larger than an American Robin',
        habitat: 'Mixed and deciduous forests, parks, and suburban areas',
        diet: 'Acorns, seeds, nuts, insects, and occasionally eggs of other birds',
        migration: 'Partially migratory; some populations move south in autumn',
      },
      hints: {
        region: 'Common across eastern and central North America, from southern Canada to Florida',
        size: 'A bit larger than a robin — around 25–30 cm, bold and upright in posture with a distinctive crest',
        behavior: 'Known for its loud, raucous calls and its ability to mimic the calls of Red-tailed Hawks to scare off competitors at feeders',
      },
      funFact: 'Blue Jays play a key ecological role by caching thousands of acorns each autumn — many of which they forget, sprouting into oak trees.',
      ebirdUrl: 'https://ebird.org/species/blujay',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/blue-jay',
    },
    {
      id: 'greater-flamingo', commonName: 'Greater Flamingo', scientificName: 'Phoenicopterus roseus',
      regions: ['europe', 'africa', 'asia'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/010_Greater_flamingos_male_and_female_in_the_Camargue_during_mating_season_Photo_by_Giles_Laurent.jpg/960px-010_Greater_flamingos_male_and_female_in_the_Camargue_during_mating_season_Photo_by_Giles_Laurent.jpg',
      audioUrl: '', xenoCantoQuery: 'Phoenicopterus roseus',
      focalPoint: { x: 0.5, y: 0.3 },
      facts: {
        size: '120–145 cm tall — one of the tallest wading birds',
        habitat: 'Shallow saltwater lagoons, estuaries, and mudflats',
        diet: 'Algae, brine shrimp, and small invertebrates filtered from the water',
        migration: 'Partially migratory; populations move in response to water levels',
      },
      hints: {
        region: 'Found in large flocks around shallow salty lakes and lagoons across southern Europe, Africa, and Asia',
        size: 'One of the tallest wading birds — standing up to 145 cm on long, spindly legs',
        behavior: 'Feeds by holding its distinctively kinked bill upside-down in the water, filtering tiny organisms through a comb-like structure on the tongue',
      },
      funFact: 'Flamingos get their pink colour from carotenoid pigments in the algae and crustaceans they eat — without this diet, they would be white.',
      ebirdUrl: 'https://ebird.org/species/grefla3',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/greater-flamingo',
    },
    {
      id: 'indian-peafowl', commonName: 'Indian Peafowl', scientificName: 'Pavo cristatus',
      regions: ['asia'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Peacock_on_tree_%2852077240794%29.jpg/960px-Peacock_on_tree_%2852077240794%29.jpg',
      audioUrl: '', xenoCantoQuery: 'Pavo cristatus',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: 'Body 100–120 cm; male display train up to 160 cm',
        habitat: 'Forests, grasslands, and farmland; also common near villages',
        diet: 'Seeds, insects, lizards, small snakes, and fruit',
        migration: 'Non-migratory; resident year-round',
      },
      hints: {
        region: 'Native to the Indian subcontinent; introduced widely across parks and estates worldwide',
        size: 'A large, ground-dwelling bird — body alone over a metre, with the male\'s trailing display plumage adding another 160 cm',
        behavior: 'Males spread and quiver their iridescent train feathers in elaborate courtship displays — the vibration produces an infrasonic rumble inaudible to humans',
      },
      funFact: 'The "tail" feathers of a peacock are actually elongated upper tail coverts — the real short tail beneath acts as a support strut for the display.',
      ebirdUrl: 'https://ebird.org/species/inopea1',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/indian-peafowl',
    },
    {
      id: 'keel-billed-toucan', commonName: 'Keel-billed Toucan', scientificName: 'Ramphastos sulfuratus',
      regions: ['central-america'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Keel-billed_toucan_%28Ramphastos_sulfuratus_sulfuratus%29_on_foxtail_palm_%28Wodyetia_bifurcata%29_Cayo.jpg/960px-Keel-billed_toucan_%28Ramphastos_sulfuratus_sulfuratus%29_on_foxtail_palm_%28Wodyetia_bifurcata%29_Cayo.jpg',
      audioUrl: '', xenoCantoQuery: 'Ramphastos sulfuratus',
      focalPoint: { x: 0.5, y: 0.45 },
      facts: {
        size: 'About 42–55 cm, including the large bill',
        habitat: 'Tropical and subtropical lowland rainforest',
        diet: 'Fruit (especially figs and berries), insects, small lizards, and eggs',
        migration: 'Non-migratory; may make short altitudinal movements',
      },
      hints: {
        region: 'Found in humid lowland forests from southern Mexico through Central America to Colombia and Venezuela',
        size: 'About 50 cm — roughly the size of a crow — but the enormous bill accounts for nearly a third of that length',
        behavior: 'Uses its long, lightweight bill to pluck fruit from branch tips, then tosses it into the air to catch it at the back of its throat',
      },
      funFact: 'Despite its enormous appearance, the toucan\'s bill is mostly hollow keratin — extremely lightweight and also serves as a heat radiator to regulate body temperature.',
      ebirdUrl: 'https://ebird.org/species/kebtou1',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/keel-billed-toucan',
    },
    {
      id: 'snowy-owl', commonName: 'Snowy Owl', scientificName: 'Bubo scandiacus',
      regions: ['north-america', 'europe'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/SnowyOwlAmericanBlackDuck.jpg/960px-SnowyOwlAmericanBlackDuck.jpg',
      audioUrl: '', xenoCantoQuery: 'Bubo scandiacus',
      focalPoint: { x: 0.5, y: 0.35 },
      facts: {
        size: '53–65 cm; wingspan 125–150 cm',
        habitat: 'Open Arctic tundra; moves to open farmland, airports, and coasts in winter',
        diet: 'Mainly lemmings; also voles, rabbits, and birds',
        migration: 'Irruptive migrant — numbers moving south vary dramatically with lemming population cycles',
      },
      hints: {
        region: 'Breeds on the Arctic tundra; in winter, individuals drift south to open country across Canada, the northern USA, and northern Europe',
        size: 'One of the largest owls by weight — 53–65 cm tall with a wingspan exceeding 1.5 metres',
        behavior: 'Unlike most owls, hunts by day on the treeless tundra; a single owl can consume over 1,600 lemmings in a year',
      },
      funFact: 'Female Snowy Owls are larger than males and more heavily barred — a reversal of the typical size difference seen in most birds of prey.',
      ebirdUrl: 'https://ebird.org/species/snoowl1',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/snowy-owl',
    },
    {
      id: 'european-robin', commonName: 'European Robin', scientificName: 'Erithacus rubecula',
      regions: ['europe'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Erithacus_rubecula_with_cocked_head.jpg/960px-Erithacus_rubecula_with_cocked_head.jpg',
      audioUrl: '', xenoCantoQuery: 'Erithacus rubecula',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: 'About 14 cm — roughly palm-sized',
        habitat: 'Deciduous woodlands, hedgerows, parks, and gardens',
        diet: 'Worms, insects, berries, and seeds',
        migration: 'Mostly resident in western Europe; eastern populations migrate to the Mediterranean in winter',
      },
      hints: {
        region: 'Found across Europe and western Asia — one of the most familiar garden birds in Britain and the western European mainland',
        size: 'Palm-sized at about 14 cm — much smaller than most people expect when they first see one up close',
        behavior: 'Aggressively territorial year-round; famously follows gardeners, dashing forward to snatch worms disturbed by digging',
      },
      funFact: 'The European Robin\'s rich song can be heard late into the evening and sometimes through the night — one of the few European birds known to sing in darkness.',
      ebirdUrl: 'https://ebird.org/species/eurrob1',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/european-robin',
    },
    {
      id: 'common-kingfisher', commonName: 'Common Kingfisher', scientificName: 'Alcedo atthis',
      regions: ['europe', 'asia'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Alcedo_atthis_-England-8_%28cropped%29.jpg/960px-Alcedo_atthis_-England-8_%28cropped%29.jpg',
      audioUrl: '', xenoCantoQuery: 'Alcedo atthis',
      focalPoint: { x: 0.5, y: 0.45 },
      facts: {
        size: 'About 16–17 cm — roughly the size of a sparrow',
        habitat: 'Clear, slow-moving rivers and streams; ponds and sheltered coasts in winter',
        diet: 'Small fish, aquatic insects, and occasionally tadpoles',
        migration: 'Mostly resident; some northern birds move south to sheltered coasts in hard winters',
      },
      hints: {
        region: 'Found along clear waterways across Europe, Asia, and North Africa — a fast-moving electric-blue flash low over the water',
        size: 'Surprisingly small — roughly sparrow-sized at 16–17 cm, though its vivid colour makes it appear much more striking',
        behavior: 'Perches motionless on a branch directly above the water, then dives beak-first to catch fish, returning to the same perch to stun and swallow its prey',
      },
      funFact: 'The Common Kingfisher\'s brilliant blue feathers contain no blue pigment — the colour is created entirely by microscopic feather structures that scatter light.',
      ebirdUrl: 'https://ebird.org/species/comkin1',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/common-kingfisher',
    },
    {
      id: 'northern-cardinal', commonName: 'Northern Cardinal', scientificName: 'Cardinalis cardinalis',
      regions: ['north-america'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Male_northern_cardinal_in_Central_Park_%2852612%29.jpg/960px-Male_northern_cardinal_in_Central_Park_%2852612%29.jpg',
      audioUrl: '', xenoCantoQuery: 'Cardinalis cardinalis',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: 'About 21–23 cm — similar to an American Robin but slimmer',
        habitat: 'Woodland edges, shrubby gardens, thickets, and hedgerows',
        diet: 'Seeds, fruit, insects, and berries',
        migration: 'Non-migratory; year-round resident',
      },
      hints: {
        region: 'Common across eastern and central North America, from southern Canada to northern Mexico; its range is slowly expanding northward',
        size: 'About 22 cm long — comparable to a robin in length, with a prominent pointed crest and a heavy, seed-cracking bill',
        behavior: 'Unusually among songbirds, female Northern Cardinals also sing — pairs often engage in duets, counter-singing to communicate food needs or warn of predators',
      },
      funFact: 'The Northern Cardinal is the official state bird of seven US states — more than any other species.',
      ebirdUrl: 'https://ebird.org/species/norcar',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/northern-cardinal',
    },
    {
      id: 'emperor-penguin', commonName: 'Emperor Penguin', scientificName: 'Aptenodytes forsteri',
      regions: ['antarctica'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Aptenodytes_forsteri_-Snow_Hill_Island%2C_Antarctica_-adults_and_juvenile-8.jpg',
      audioUrl: '', xenoCantoQuery: 'Aptenodytes forsteri',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: '100–130 cm tall — the tallest and heaviest penguin species',
        habitat: 'Antarctic sea ice and surrounding Southern Ocean',
        diet: 'Fish, squid, and krill caught by diving',
        migration: 'Non-migratory; travels between feeding grounds and breeding colonies on foot and by swimming',
      },
      hints: {
        region: 'Lives on and around Antarctica — the only penguin species that breeds during the Antarctic winter',
        size: 'The largest penguin — up to 130 cm tall and weighing up to 45 kg',
        behavior: 'Males incubate a single egg on their feet through the brutal Antarctic winter, huddling together in dense groups, fasting for up to four months',
      },
      funFact: 'Emperor Penguins can dive to depths over 550 metres and hold their breath for more than 20 minutes — deeper and longer than any other bird.',
      ebirdUrl: 'https://ebird.org/species/emppen1',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/emperor-penguin',
    },
    {
      id: 'ruby-throated-hummingbird', commonName: 'Ruby-throated Hummingbird', scientificName: 'Archilochus colubris',
      regions: ['north-america'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Archilochus_colubris_-flying_-male-8.jpg/960px-Archilochus_colubris_-flying_-male-8.jpg',
      audioUrl: '', xenoCantoQuery: 'Archilochus colubris',
      focalPoint: { x: 0.5, y: 0.45 },
      facts: {
        size: 'About 8–9 cm — roughly the length of your thumb',
        habitat: 'Open woodlands, forest edges, meadows, and gardens with flowering plants',
        diet: 'Nectar from flowers and small insects for protein',
        migration: 'Long-distance migrant — crosses the Gulf of Mexico non-stop to winter in Central America',
      },
      hints: {
        region: 'The only hummingbird that breeds in eastern North America; summers from Canada to the Gulf Coast, winters in Central America',
        size: 'Tiny — about 8–9 cm, no longer than your thumb, and weighing less than a 5-cent coin',
        behavior: 'Hovers in place by beating its wings up to 53 times per second; the only bird that can fly backwards and sustain upside-down flight',
      },
      funFact: 'Despite weighing just 3 grams, Ruby-throated Hummingbirds fly non-stop across the Gulf of Mexico — a 900 km journey — during migration.',
      ebirdUrl: 'https://ebird.org/species/rthhum',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/ruby-throated-hummingbird',
    },
    {
      id: 'sulphur-crested-cockatoo', commonName: 'Sulphur-crested Cockatoo', scientificName: 'Cacatua galerita',
      regions: ['australia'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Cacatua_galerita_Tas_2.jpg',
      audioUrl: '', xenoCantoQuery: 'Cacatua galerita',
      focalPoint: { x: 0.5, y: 0.35 },
      facts: {
        size: '44–55 cm — about the size of a large crow',
        habitat: 'Forests, woodlands, and increasingly urban parks and gardens',
        diet: 'Seeds, berries, nuts, roots, and leaf buds',
        migration: 'Non-migratory; resident and wide-ranging',
      },
      hints: {
        region: 'Native to Australia and New Guinea; noisy flocks are a familiar sight across Australian cities and bushland',
        size: 'About 50 cm — crow-sized — with a dramatic fan-shaped yellow crest it raises when alarmed or excited',
        behavior: 'Highly intelligent and social; noisy flocks roost communally and make significant noise at dawn and dusk; capable of complex mimicry',
      },
      funFact: 'Sulphur-crested Cockatoos can live for 70 years or more in captivity — longer than most humans — making them a true lifetime commitment.',
      ebirdUrl: 'https://ebird.org/species/sccoca1',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/sulphur-crested-cockatoo',
    },
    // ── GLOBAL ADDITIONS ──────────────────────────────────────────────────────
    {
      id: 'barn-swallow', commonName: 'Barn Swallow', scientificName: 'Hirundo rustica',
      regions: ['global', 'north-america', 'europe', 'asia', 'africa'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Rauchschwalbe_Hirundo_rustica.jpg/960px-Rauchschwalbe_Hirundo_rustica.jpg',
      audioUrl: '', xenoCantoQuery: 'Hirundo rustica',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: 'About 17–19 cm with long, deeply forked tail streamers',
        habitat: 'Open countryside, farmland, and anywhere near water; nests inside barns and outbuildings',
        diet: 'Flying insects caught on the wing',
        migration: 'One of the longest-distance migrants — breeding across the entire Northern Hemisphere and wintering in sub-Saharan Africa and South America',
      },
      hints: {
        region: 'Found on every continent except Antarctica — the most widespread swallow in the world',
        size: 'Small at about 18 cm body length, but the long forked tail streamers make it appear larger in flight',
        behavior: 'Skims low over fields and water at high speed, snapping insects out of the air; pairs return to the same nest site every year',
      },
      funFact: "The Barn Swallow's deeply forked tail is a signal of male fitness — females preferentially mate with males that have the longest, most symmetrical streamers.",
      ebirdUrl: 'https://ebird.org/species/barswa',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/barn-swallow',
    },
    {
      id: 'osprey', commonName: 'Osprey', scientificName: 'Pandion haliaetus',
      regions: ['global', 'north-america', 'europe', 'australia', 'asia', 'africa'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Osprey_Perched_Snag_Heislerville.jpg/960px-Osprey_Perched_Snag_Heislerville.jpg',
      audioUrl: '', xenoCantoQuery: 'Pandion haliaetus',
      focalPoint: { x: 0.5, y: 0.35 },
      facts: {
        size: '52–60 cm; wingspan 150–180 cm',
        habitat: 'Near large bodies of water — lakes, rivers, estuaries, and coasts',
        diet: 'Almost exclusively live fish',
        migration: 'Long-distance migrant in northern populations; some tropical populations are resident',
      },
      hints: {
        region: 'Found on every continent except Antarctica — one of the most widespread raptors on Earth',
        size: 'A large, rangy raptor — about 55 cm with a 1.7-metre wingspan, often seen hovering high above water before plunging',
        behavior: 'Hovers over water then plunges feet-first to catch fish, often submerging completely; reversible outer toe and spiny foot pads help grip slippery prey',
      },
      funFact: 'Ospreys can rotate one toe backward to grip fish with two toes on each side — a unique adaptation shared by no other raptor.',
      ebirdUrl: 'https://ebird.org/species/osprey',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/osprey',
    },
    {
      id: 'wandering-albatross', commonName: 'Wandering Albatross', scientificName: 'Diomedea exulans',
      regions: ['global', 'arctic'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Diomedea_exulans_-_SE_Tasmania.jpg/960px-Diomedea_exulans_-_SE_Tasmania.jpg',
      audioUrl: '', xenoCantoQuery: 'Diomedea exulans',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: 'Wingspan up to 3.5 m — the longest wingspan of any living bird; body 107–135 cm',
        habitat: 'Open Southern Ocean; breeds on remote sub-Antarctic islands',
        diet: 'Squid, fish, and carrion picked from the sea surface',
        migration: 'Circumnavigates the Southern Ocean continuously outside the breeding season',
      },
      hints: {
        region: 'Roams the Southern Ocean around Antarctica — circumnavigating the globe between nesting seasons on remote sub-Antarctic islands',
        size: 'The widest wingspan of any living bird — up to 3.5 metres tip to tip, wider than a small car is long',
        behavior: 'Uses dynamic soaring to travel thousands of kilometres without flapping; can glide for hours by exploiting differences in wind speed near the wave surface',
      },
      funFact: 'A Wandering Albatross may fly over 120,000 km in a single year — the equivalent of three laps around the Earth.',
      ebirdUrl: 'https://ebird.org/species/wanalb',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/wandering-albatross',
    },
    {
      id: 'arctic-tern', commonName: 'Arctic Tern', scientificName: 'Sterna paradisaea',
      regions: ['arctic', 'global'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Arctic_tern_%28Sterna_paradisaea%29_Flatey_3.jpg/960px-Arctic_tern_%28Sterna_paradisaea%29_Flatey_3.jpg',
      audioUrl: '', xenoCantoQuery: 'Sterna paradisaea',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: 'About 33–36 cm; wingspan 76–85 cm — a slender, graceful seabird',
        habitat: 'Breeds on Arctic and sub-Arctic coasts and tundra; spends the non-breeding season at sea near Antarctica',
        diet: 'Small fish and invertebrates caught by plunge-diving',
        migration: 'The longest migration of any animal — round trip of up to 90,000 km between Arctic and Antarctic',
      },
      hints: {
        region: 'Breeds in the Arctic and sub-Arctic; winters near Antarctica — migrating the full length of the Earth twice each year',
        size: 'Slender and lightweight at about 35 cm — similar to a small gull but far more aerodynamic, with a deeply forked tail',
        behavior: 'Hovers briefly then plunge-dives for fish; aggressively defends nesting colonies, dive-bombing and striking intruders — including humans — on the head',
      },
      funFact: 'An Arctic Tern banded as a chick in the UK was later found in Australia — it had travelled over 59,000 km in a single journey, a world record at the time.',
      ebirdUrl: 'https://ebird.org/species/arcte4',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/arctic-tern',
    },
    {
      id: 'wood-duck', commonName: 'Wood Duck', scientificName: 'Aix sponsa',
      regions: ['north-america'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Wood_Duck_Wissahickon_Creek.png/960px-Wood_Duck_Wissahickon_Creek.png',
      audioUrl: '', xenoCantoQuery: 'Aix sponsa',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: 'About 47–54 cm — medium-sized duck',
        habitat: 'Wooded swamps, ponds, and rivers with overhanging trees',
        diet: 'Seeds, acorns, berries, aquatic plants, and insects',
        migration: 'Short-distance migrant; northern populations move south in winter',
      },
      hints: {
        region: 'Found across North America wherever there are wooded waterways — eastern and western USA, wintering into Mexico',
        size: 'A medium-sized duck — about 50 cm — with the male having one of the most elaborate plumage patterns of any North American duck',
        behavior: 'Nests in tree cavities up to 9 metres off the ground; ducklings jump from the nest within 24 hours of hatching, often falling many metres to the ground unharmed',
      },
      funFact: 'Wood Duck ducklings leap from their tree-hole nest on their first day of life, surviving falls of up to 15 metres thanks to their light weight and downy fluffiness.',
      ebirdUrl: 'https://ebird.org/species/wooduc',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/wood-duck',
    },
    {
      id: 'painted-bunting', commonName: 'Painted Bunting', scientificName: 'Passerina ciris',
      regions: ['north-america'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Male_Painted_Bunting_Singing.jpg/960px-Male_Painted_Bunting_Singing.jpg',
      audioUrl: '', xenoCantoQuery: 'Passerina ciris',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: 'About 12–14 cm — sparrow-sized',
        habitat: 'Thickets, woodland edges, brushy fields, and suburban gardens',
        diet: 'Seeds and insects',
        migration: 'Medium-distance migrant — breeds in the southern USA, winters in Florida, Mexico, and Central America',
      },
      hints: {
        region: 'Breeds in the south-central and southeastern USA; winters in Florida, the Caribbean, and Central America',
        size: 'Sparrow-sized at about 13 cm — the male is sometimes called "the most beautiful bird in North America" for its vivid patchwork of red, blue, and green',
        behavior: 'Males sing from dense thicket perches and are fiercely territorial; females are a cryptic bright green — surprisingly hard to spot despite the male\'s vivid colours',
      },
      funFact: 'The male Painted Bunting is the only North American songbird with a completely blue head combined with a red underside and green back — three separate colours on one tiny bird.',
      ebirdUrl: 'https://ebird.org/species/paibun',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/painted-bunting',
    },
    {
      id: 'european-goldfinch', commonName: 'European Goldfinch', scientificName: 'Carduelis carduelis',
      regions: ['europe', 'asia', 'north-africa'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/072_Wild_European_goldfinch_at_the_Parc_Jura_vaudois_Photo_by_Giles_Laurent.jpg/960px-072_Wild_European_goldfinch_at_the_Parc_Jura_vaudois_Photo_by_Giles_Laurent.jpg',
      audioUrl: '', xenoCantoQuery: 'Carduelis carduelis',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: 'About 12–13 cm — smaller than a House Sparrow',
        habitat: 'Open woodland, orchards, gardens, and weedy fields',
        diet: 'Seeds, especially thistle and teasel; also insects in summer',
        migration: 'Partially migratory; northern populations move south and west in winter',
      },
      hints: {
        region: 'Found across Europe, western Asia, and North Africa — one of the most recognisable garden birds in Britain and Europe',
        size: 'Tiny at about 12–13 cm — with a bright red face, black-and-white head, and golden-yellow wing bars that flash in flight',
        behavior: 'Uses its pointed bill to extract seeds from thistles and teasels; flocks (called charms) feed acrobatically, hanging from seed heads',
      },
      funFact: 'A flock of European Goldfinches is called a "charm" — a name given because of the delightful tinkling sound the flock makes in flight.',
      ebirdUrl: 'https://ebird.org/species/eurgol',
      audubonUrl: '',
    },
    {
      id: 'hoopoe', commonName: 'Hoopoe', scientificName: 'Upupa epops',
      regions: ['europe', 'asia', 'africa'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Upupa_epops_Madrid_01.jpg/960px-Upupa_epops_Madrid_01.jpg',
      audioUrl: '', xenoCantoQuery: 'Upupa epops',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: 'About 25–29 cm — roughly thrush-sized',
        habitat: 'Open farmland, parkland, savanna, and woodland edges',
        diet: 'Insects, larvae, earthworms, and small lizards probed from soil',
        migration: 'Migratory in northern populations; winters in tropical Africa and southern Asia',
      },
      hints: {
        region: 'Breeds across Europe, Asia, and sub-Saharan Africa — the national bird of Israel; winters in tropical Africa',
        size: 'About 27 cm — thrush-sized, but the spectacular fan-shaped crest makes it unmistakable when erected',
        behavior: 'Probes soil with its long curved bill like a sewing machine; erects its striking orange-and-black fan crest when alarmed or in display',
      },
      funFact: 'Hoopoe chicks and incubating females produce a foul-smelling liquid from a preening gland and spray it at predators — earning them the nickname "stink bird" in some cultures.',
      ebirdUrl: 'https://ebird.org/species/hoopoe',
      audubonUrl: '',
    },
    {
      id: 'black-headed-gull', commonName: 'Black-headed Gull', scientificName: 'Chroicocephalus ridibundus',
      regions: ['europe', 'asia'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Chroicocephalus_ridibundus_%28summer%29.jpg/960px-Chroicocephalus_ridibundus_%28summer%29.jpg',
      audioUrl: '', xenoCantoQuery: 'Chroicocephalus ridibundus',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: 'About 37–44 cm — smaller than a Herring Gull',
        habitat: 'Coasts, estuaries, lakes, rivers, farmland, and urban parks',
        diet: 'Invertebrates, fish, scraps, and earthworms',
        migration: 'Partially migratory; northern and inland populations move to coasts in winter',
      },
      hints: {
        region: 'Abundant across Europe and Asia — one of the most common gulls inland, found on park lakes as readily as at the coast',
        size: 'A medium-small gull — about 40 cm — with distinctive red bill and legs; the "black" head is actually dark chocolate brown in summer and mostly white in winter',
        behavior: 'Highly adaptable and opportunistic — follows ploughs for earthworms, steals food from other birds, and readily takes bread in parks',
      },
      funFact: "Despite its name, the Black-headed Gull's summer hood is dark brown, not black — and it loses it entirely in winter, retaining only a dark ear-spot.",
      ebirdUrl: 'https://ebird.org/species/bkhgul',
      audubonUrl: '',
    },
    {
      id: 'mandarin-duck', commonName: 'Mandarin Duck', scientificName: 'Aix galericulata',
      regions: ['asia', 'europe'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Pair_of_mandarin_ducks.jpg/960px-Pair_of_mandarin_ducks.jpg',
      audioUrl: '', xenoCantoQuery: 'Aix galericulata',
      focalPoint: { x: 0.5, y: 0.4 },
      facts: {
        size: 'About 41–49 cm — similar in size to a Mallard but more compact',
        habitat: 'Wooded rivers and lakes with overhanging trees; parkland ponds',
        diet: 'Seeds, acorns, insects, small fish, and aquatic plants',
        migration: 'Partially migratory; east Asian populations move south in winter',
      },
      hints: {
        region: 'Native to east Asia — China, Japan, and Korea; feral populations established in Britain and western Europe',
        size: 'About 44 cm — a compact duck with the male displaying arguably the most ornate plumage of any duck in the world',
        behavior: 'Nests in tree cavities; ducklings jump from the nest hole on their first day and float down to the water below',
      },
      funFact: 'Mandarin Ducks are a traditional symbol of love and fidelity in Chinese and Korean culture — pairs are given as wedding gifts to wish couples a long and faithful marriage.',
      ebirdUrl: 'https://ebird.org/species/manduc',
      audubonUrl: '',
    },
    {
      id: 'wedge-tailed-eagle', commonName: 'Wedge-tailed Eagle', scientificName: 'Aquila audax',
      regions: ['australia'], globalPool: true,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Aquila_audax_-_Captain%27s_Flat.jpg/960px-Aquila_audax_-_Captain%27s_Flat.jpg",
      audioUrl: '', xenoCantoQuery: 'Aquila audax',
      focalPoint: { x: 0.5, y: 0.35 },
      facts: {
        size: '81–106 cm; wingspan up to 2.3 m — Australia\'s largest bird of prey',
        habitat: 'Open woodland, scrubland, grassland, and desert',
        diet: 'Rabbits, wallabies, lizards, carrion, and occasionally young lambs',
        migration: 'Non-migratory; wide-ranging over large home territories',
      },
      hints: {
        region: 'Found throughout mainland Australia and Tasmania — the largest raptor in Australia',
        size: "Australia's largest bird of prey — up to 106 cm long with a wingspan that can exceed 2 metres",
        behavior: 'Soars on thermals at great heights for hours; pairs perform spectacular aerial courtship displays, diving and rolling together',
      },
      funFact: "Wedge-tailed Eagles were once persecuted as a threat to livestock and killed in huge numbers; they are now fully protected and Australia's farmers have found they rarely take healthy animals.",
      ebirdUrl: 'https://ebird.org/species/wetea1',
      audubonUrl: '',
    },
    {
      id: 'barn-owl', commonName: 'Barn Owl', scientificName: 'Tyto alba',
      regions: ['north-america', 'europe', 'australia'], globalPool: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/American_Barn_Owl_%28Tyto_furcata_guatemalae%29%2C_Orange_Walk.jpg/960px-American_Barn_Owl_%28Tyto_furcata_guatemalae%29%2C_Orange_Walk.jpg',
      audioUrl: '', xenoCantoQuery: 'Tyto alba',
      focalPoint: { x: 0.5, y: 0.35 },
      facts: {
        size: '33–39 cm; wingspan 80–95 cm',
        habitat: 'Open farmland, grassland, and woodland edges; nests in old barns, church towers, and hollow trees',
        diet: 'Small mammals — especially voles, mice, and shrews',
        migration: 'Mostly resident; a sedentary species rarely moving far from its territory',
      },
      hints: {
        region: 'One of the most widespread land birds on Earth — found on every continent except Antarctica and most of the Arctic',
        size: 'Medium-sized owl — about 35 cm tall with a near-metre wingspan, but very lightweight at only 250–350 g',
        behavior: 'Hunts entirely by sound in darkness — its asymmetric ear placement allows millimetre-precise location of prey with zero light',
      },
      funFact: 'The Barn Owl\'s heart-shaped facial disc acts like a satellite dish, channelling sound waves to its ears — its hearing is the most sensitive of any animal ever tested.',
      ebirdUrl: 'https://ebird.org/species/brnowl',
      audubonUrl: 'https://www.audubon.org/field-guide/bird/barn-owl',
    },
  ];

  const REGIONAL_BIRDS = {
    'north-america': [
      {
        id: 'canada-goose', commonName: 'Canada Goose', scientificName: 'Branta canadensis',
        regions: ['north-america'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Canada_goose.jpg/960px-Canada_goose.jpg',
        audioUrl: '', xenoCantoQuery: 'Branta canadensis',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: '75–110 cm; wingspan up to 180 cm',
          habitat: 'Lakes, rivers, parks, golf courses, and suburban ponds',
          diet: 'Grasses, grains, aquatic vegetation, and berries',
          migration: 'Partially migratory; northern populations move south in autumn',
        },
        hints: {
          region: 'Found across North America — from Arctic Canada to the Gulf Coast; expanded greatly into urban areas',
          size: 'A large goose — up to 110 cm and weighing up to 6.5 kg, with a wingspan nearly as wide as a person is tall',
          behavior: 'Grazes in large flocks on lawns and open areas; aggressively defends nests near water and is known to hiss and chase people who approach',
        },
        funFact: 'Canada Geese fly in a V-formation because each bird benefits from the uplift created by the wingtip vortex of the bird ahead, reducing energy expenditure.',
        ebirdUrl: 'https://ebird.org/species/cangoo',
        audubonUrl: 'https://www.audubon.org/field-guide/bird/canada-goose',
      },
      {
        id: 'great-horned-owl', commonName: 'Great Horned Owl', scientificName: 'Bubo virginianus',
        regions: ['north-america'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Bubo_virginianus_06.jpg/960px-Bubo_virginianus_06.jpg',
        audioUrl: '', xenoCantoQuery: 'Bubo virginianus',
        focalPoint: { x: 0.5, y: 0.35 },
        facts: {
          size: '46–63 cm; wingspan 101–145 cm',
          habitat: 'Forests, deserts, swamps, and cities — one of the most adaptable owls',
          diet: 'Rabbits, hares, squirrels, mice, other birds (including smaller owls), and skunks',
          migration: 'Non-migratory; year-round resident',
        },
        hints: {
          region: 'Found across virtually all of North and South America — one of the most widespread owls on Earth',
          size: 'Large and powerful — up to 63 cm tall with a wingspan exceeding 1.4 metres and the strongest grip of any North American owl',
          behavior: 'Begins nesting in mid-winter while snow is still on the ground; its deep, resonant hoot is one of the most recognisable night sounds in North America',
        },
        funFact: 'Great Horned Owls have no true horns — the "ear tufts" are just feathers, used for camouflage and communication.',
        ebirdUrl: 'https://ebird.org/species/grhowl',
        audubonUrl: 'https://www.audubon.org/field-guide/bird/great-horned-owl',
      },
      {
        id: 'red-tailed-hawk', commonName: 'Red-tailed Hawk', scientificName: 'Buteo jamaicensis',
        regions: ['north-america'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Red-tailed_Hawk_%2845812546121%29.jpg/960px-Red-tailed_Hawk_%2845812546121%29.jpg',
        audioUrl: '', xenoCantoQuery: 'Buteo jamaicensis',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: '45–65 cm; wingspan 105–141 cm',
          habitat: 'Open areas with scattered trees — fields, roadsides, deserts, and forest edges',
          diet: 'Small mammals, especially rodents; also rabbits, snakes, and birds',
          migration: 'Partially migratory; many populations resident year-round',
        },
        hints: {
          region: 'The most common hawk in North America — seen year-round from Alaska to Panama, often perched on roadside poles',
          size: 'A large, stocky raptor — about 50 cm with a wingspan of over a metre; frequently seen circling high on thermals',
          behavior: 'Frequently perches on roadside poles watching for prey; the piercing screech used as the generic "hawk scream" in movies and television',
        },
        funFact: 'Adult Red-tailed Hawks only develop their distinctive red tail in their second year of life — juveniles have a brown-banded tail instead.',
        ebirdUrl: 'https://ebird.org/species/rethaw',
        audubonUrl: 'https://www.audubon.org/field-guide/bird/red-tailed-hawk',
      },
      {
        id: 'mallard', commonName: 'Mallard', scientificName: 'Anas platyrhynchos',
        regions: ['north-america', 'europe'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Anas_platyrhynchos_male_female_quadrat.jpg/960px-Anas_platyrhynchos_male_female_quadrat.jpg',
        audioUrl: '', xenoCantoQuery: 'Anas platyrhynchos',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: '50–65 cm; wingspan 81–98 cm',
          habitat: 'Lakes, rivers, ponds, wetlands, and urban park ponds',
          diet: 'Aquatic vegetation, seeds, insects, worms, and small fish',
          migration: 'Partially migratory; northern populations move south in winter',
        },
        hints: {
          region: 'Found across the entire northern hemisphere — one of the most abundant and widespread ducks in the world',
          size: 'A typical "duck-sized duck" — about 55–60 cm from bill to tail, stocky and low in the water',
          behavior: 'Dabbles for food at the water\'s surface rather than diving; the familiar "quack" is the female\'s call — males give a quieter, raspier call',
        },
        funFact: 'Most domestic duck breeds worldwide are descended from the wild Mallard, domesticated thousands of years ago in China.',
        ebirdUrl: 'https://ebird.org/species/mallar3',
        audubonUrl: 'https://www.audubon.org/field-guide/bird/mallard',
      },
      {
        id: 'american-goldfinch', commonName: 'American Goldfinch', scientificName: 'Spinus tristis',
        regions: ['north-america'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Carduelis_tristis_-Michigan%2C_USA_-male-8.jpg/960px-Carduelis_tristis_-Michigan%2C_USA_-male-8.jpg',
        audioUrl: '', xenoCantoQuery: 'Spinus tristis',
        focalPoint: { x: 0.5, y: 0.45 },
        facts: {
          size: 'About 11–13 cm — sparrow-sized',
          habitat: 'Open areas with weedy fields, roadsides, gardens, and woodland edges',
          diet: 'Almost exclusively seeds, especially thistles and sunflowers',
          migration: 'Short-distance migrant; moves south within North America in winter',
        },
        hints: {
          region: 'Found across North America — a common garden feeder bird in summer across the US and southern Canada',
          size: 'Tiny — about 12 cm and weighing only 11–20 grams, roughly the weight of three quarters',
          behavior: 'One of the strictest vegetarians among birds; feeds almost exclusively on seeds and even feeds its chicks regurgitated seeds rather than insects',
        },
        funFact: 'The American Goldfinch waits until mid-summer to breed — later than most North American birds — specifically timed to coincide with peak thistle seed availability.',
        ebirdUrl: 'https://ebird.org/species/amegfi',
        audubonUrl: 'https://www.audubon.org/field-guide/bird/american-goldfinch',
      },
    ],
    'california': [
      {
        id: 'california-quail', commonName: 'California Quail', scientificName: 'Callipepla californica',
        regions: ['california', 'north-america'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/California_quail_%28Callipepla_californica%29_male_Tricao.jpg/960px-California_quail_%28Callipepla_californica%29_male_Tricao.jpg',
        audioUrl: '', xenoCantoQuery: 'Callipepla californica',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 25 cm — similar to a small pigeon',
          habitat: 'Chaparral, oak woodland, and open scrubby areas',
          diet: 'Seeds, leaves, berries, and insects',
          migration: 'Non-migratory; resident year-round',
        },
        hints: {
          region: 'The state bird of California — common in chaparral, parks, and suburban gardens across the western USA',
          size: 'About 25 cm — compact and round, similar in size to a small pigeon',
          behavior: 'Moves in coveys (family groups) on the ground; the distinctive teardrop-shaped topknot is actually a cluster of six feathers curving forward over the bill',
        },
        funFact: 'California Quail chicks leave the nest within hours of hatching and can run and feed themselves almost immediately, though parents brood them at night for weeks.',
        ebirdUrl: 'https://ebird.org/species/calqua',
        audubonUrl: 'https://www.audubon.org/field-guide/bird/california-quail',
      },
      {
        id: 'annas-hummingbird', commonName: "Anna's Hummingbird", scientificName: 'Calypte anna',
        regions: ['california', 'north-america'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Anna%27s_hummingbird.jpg/960px-Anna%27s_hummingbird.jpg',
        audioUrl: '', xenoCantoQuery: 'Calypte anna',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 10 cm — slightly larger than most other North American hummingbirds',
          habitat: 'Coastal scrub, chaparral, open woodland, and suburban gardens',
          diet: 'Nectar from flowers, tree sap, and small insects',
          migration: 'Non-migratory; year-round resident along the Pacific Coast',
        },
        hints: {
          region: 'Common year-round along the Pacific Coast, particularly in California — the most widespread hummingbird on the west coast of North America',
          size: 'About 10 cm — tiny even by hummingbird standards, weighing around 4 grams',
          behavior: 'Males perform a dramatic J-shaped dive display, climbing 30+ metres then diving nearly straight down past the female, producing a sharp chirp with their tail feathers at the bottom',
        },
        funFact: "Anna's Hummingbirds are one of the few hummingbirds that sing — males perch and sing a complex buzzy song throughout the year.",
        ebirdUrl: 'https://ebird.org/species/annhum',
        audubonUrl: "https://www.audubon.org/field-guide/bird/annas-hummingbird",
      },
      {
        id: 'california-condor', commonName: 'California Condor', scientificName: 'Gymnogyps californianus',
        regions: ['california', 'north-america'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/California-condor-gymnogyps-californianus-078_%2821196759264%29.jpg/960px-California-condor-gymnogyps-californianus-078_%2821196759264%29.jpg',
        audioUrl: '', xenoCantoQuery: 'Gymnogyps californianus',
        focalPoint: { x: 0.5, y: 0.35 },
        facts: {
          size: '109–140 cm; wingspan up to 3 m — the largest flying bird in North America',
          habitat: 'Rocky scrubland, coniferous forests, and canyon country',
          diet: 'Carrion — almost exclusively large dead animals',
          migration: 'Non-migratory; wide-ranging over large territories',
        },
        hints: {
          region: 'Found in the mountains and canyons of California, Arizona, Utah, and Baja California — an iconic conservation success story',
          size: 'The largest flying land bird in North America — wingspan up to 3 metres, as wide as a small car',
          behavior: 'Soars on thermal updrafts for hours without flapping, covering enormous distances to find carrion; bare head is an adaptation for feeding inside large carcasses',
        },
        funFact: 'By 1987 only 27 California Condors remained alive — all were captured for a captive breeding programme that has since restored the wild population to over 500 birds.',
        ebirdUrl: 'https://ebird.org/species/calcon',
        audubonUrl: 'https://www.audubon.org/field-guide/bird/california-condor',
      },
      {
        id: 'black-phoebe', commonName: 'Black Phoebe', scientificName: 'Sayornis nigricans',
        regions: ['california', 'north-america'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Black_phoebe_%28Sayornis_nigricans_aquaticus%29_Palopo.jpg/960px-Black_phoebe_%28Sayornis_nigricans_aquaticus%29_Palopo.jpg',
        audioUrl: '', xenoCantoQuery: 'Sayornis nigricans',
        focalPoint: { x: 0.5, y: 0.45 },
        facts: {
          size: 'About 16–18 cm',
          habitat: 'Near water — streams, ponds, and coastal areas with overhanging vegetation',
          diet: 'Flying insects caught in mid-air',
          migration: 'Non-migratory; year-round resident',
        },
        hints: {
          region: 'Common year-round near water in California and the southwestern USA; extends through Central and South America',
          size: 'Small — about 17 cm, roughly sparrow-sized, and sits very upright on exposed perches close to water',
          behavior: 'Sallies out from a low perch to snap flying insects out of the air, always returning to the same spot — and constantly pumps its tail up and down',
        },
        funFact: 'Black Phoebes often build their mud nests under bridges and eaves, and the same individual will return to the exact same nest site year after year.',
        ebirdUrl: 'https://ebird.org/species/blkpho',
        audubonUrl: 'https://www.audubon.org/field-guide/bird/black-phoebe',
      },
      {
        id: 'western-meadowlark', commonName: 'Western Meadowlark', scientificName: 'Sturnella neglecta',
        regions: ['california', 'north-america'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Sturnella_neglecta_GNP_02.jpg/960px-Sturnella_neglecta_GNP_02.jpg',
        audioUrl: '', xenoCantoQuery: 'Sturnella neglecta',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 22–25 cm',
          habitat: 'Grasslands, prairies, meadows, and agricultural fields',
          diet: 'Insects in summer; seeds and grains in winter',
          migration: 'Partially migratory; northern populations move south in winter',
        },
        hints: {
          region: 'Common across western North America from Canada to Mexico — the state bird of six western US states',
          size: 'About 23 cm — robin-sized, plump, and short-tailed when perched on a fence post or grass stem',
          behavior: 'Sings one of the most celebrated bird songs in North America — a rich, flute-like bubbling melody delivered from fence posts and wire',
        },
        funFact: 'The Western Meadowlark has over a dozen distinct song types and sings them in different orders, creating the impression of improvisation.',
        ebirdUrl: 'https://ebird.org/species/wesmea',
        audubonUrl: 'https://www.audubon.org/field-guide/bird/western-meadowlark',
      },
    ],
    'europe': [
      {
        id: 'eurasian-blue-tit', commonName: 'Eurasian Blue Tit', scientificName: 'Cyanistes caeruleus',
        regions: ['europe'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Eurasian_blue_tit_%28Cyanistes_caeruleus_caeruleus%29_Biebrzanski.jpg/960px-Eurasian_blue_tit_%28Cyanistes_caeruleus_caeruleus%29_Biebrzanski.jpg',
        audioUrl: '', xenoCantoQuery: 'Cyanistes caeruleus',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 11–12 cm — smaller than a sparrow',
          habitat: 'Deciduous woodland, parks, hedgerows, and gardens',
          diet: 'Insects, caterpillars, seeds, and nuts',
          migration: 'Mostly resident; some cold-weather wandering in hard winters',
        },
        hints: {
          region: 'One of the most common garden birds across Europe and western Asia — the most frequent visitor to garden feeders in Britain',
          size: 'Tiny — about 11–12 cm, lighter than a 10-pence coin, and extremely acrobatic',
          behavior: 'Hangs upside-down to feed on caterpillars in tree canopies; pairs return to the same nest box every year and can raise over a dozen chicks in a single clutch',
        },
        funFact: 'Blue Tit clutch size is precisely timed to peak caterpillar abundance — pairs that start even a week too early or late have significantly fewer surviving chicks.',
        ebirdUrl: 'https://ebird.org/species/eusbti1',
        audubonUrl: '',
      },
      {
        id: 'common-blackbird', commonName: 'Common Blackbird', scientificName: 'Turdus merula',
        regions: ['europe', 'asia'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Common_Blackbird.jpg/960px-Common_Blackbird.jpg',
        audioUrl: '', xenoCantoQuery: 'Turdus merula',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 24–25 cm — similar to an American Robin',
          habitat: 'Gardens, parks, woodland, and hedgerows',
          diet: 'Worms, insects, berries, and fruit',
          migration: 'Largely resident; northern populations move south in winter',
        },
        hints: {
          region: 'One of the most widespread and familiar birds across Europe, from Scandinavia to North Africa and east into Asia',
          size: 'About 25 cm — similar in length to an American Robin, but slimmer and longer-tailed',
          behavior: 'Males sing a rich, melodious song from rooftops at dawn and dusk — one of the most celebrated bird songs in Europe; runs across lawns hunting for worms',
        },
        funFact: 'The Common Blackbird was primarily a woodland bird until the 19th century, when it rapidly colonised European cities — one of the fastest habitat shifts ever recorded.',
        ebirdUrl: 'https://ebird.org/species/combla2',
        audubonUrl: '',
      },
      {
        id: 'white-stork', commonName: 'White Stork', scientificName: 'Ciconia ciconia',
        regions: ['europe', 'africa'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/White_stork_%28Ciconia_ciconia%29_Bia%C5%82owieza.jpg/960px-White_stork_%28Ciconia_ciconia%29_Bia%C5%82owieza.jpg',
        audioUrl: '', xenoCantoQuery: 'Ciconia ciconia',
        focalPoint: { x: 0.5, y: 0.35 },
        facts: {
          size: '100–115 cm tall; wingspan 155–215 cm',
          habitat: 'Open farmland, meadows, and marshes near villages and towns',
          diet: 'Frogs, insects, small mammals, reptiles, and fish',
          migration: 'Long-distance migrant — breeds in Europe, winters in sub-Saharan Africa, covering up to 20,000 km',
        },
        hints: {
          region: 'Breeds across Europe from Iberia to central Asia; winters in Africa south of the Sahara — a highly visible long-distance migrant',
          size: 'A large, unmistakable wading bird — up to 115 cm tall with a wingspan of over 2 metres',
          behavior: 'Nests on rooftops and chimneys in villages; pairs reunite at the nest each spring and greet each other with loud, rattling bill-clattering displays',
        },
        funFact: 'White Storks are completely voiceless — they have no call muscles. Their only sound is loud bill-clattering during greeting displays at the nest.',
        ebirdUrl: 'https://ebird.org/species/whisto3',
        audubonUrl: '',
      },
      {
        id: 'great-tit', commonName: 'Great Tit', scientificName: 'Parus major',
        regions: ['europe', 'asia'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Great_tit_%28Parus_major%29_Heligan.jpg/960px-Great_tit_%28Parus_major%29_Heligan.jpg',
        audioUrl: '', xenoCantoQuery: 'Parus major',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 14 cm — slightly larger than a Blue Tit',
          habitat: 'Deciduous and mixed woodland, parks, and gardens',
          diet: 'Insects, caterpillars, seeds, and nuts',
          migration: 'Mostly resident; some dispersal in cold winters',
        },
        hints: {
          region: 'The most widespread tit in the world — found from western Europe across Asia to Japan; one of the most-studied birds in ornithology',
          size: 'About 14 cm — slightly larger than a House Sparrow, with a striking black-and-white head and bright yellow breast',
          behavior: 'Has one of the largest and most variable song repertoires of any bird — can learn new songs from neighbours and has been recorded using over 40 different call types',
        },
        funFact: 'Great Tit populations in urban areas have evolved slightly longer bills compared to rural birds over just decades of adaptation to bird feeders.',
        ebirdUrl: 'https://ebird.org/species/gretti1',
        audubonUrl: '',
      },
      {
        id: 'eurasian-jay', commonName: 'Eurasian Jay', scientificName: 'Garrulus glandarius',
        regions: ['europe', 'asia'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Garrulus_glandarius_1_Luc_Viatour.jpg/960px-Garrulus_glandarius_1_Luc_Viatour.jpg',
        audioUrl: '', xenoCantoQuery: 'Garrulus glandarius',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 34–35 cm — similar to a Jackdaw',
          habitat: 'Oak woodland, mixed forest, parks, and large gardens',
          diet: 'Acorns (primary), insects, eggs, nestlings, and berries',
          migration: 'Mostly resident; large irruptions in years of acorn failure',
        },
        hints: {
          region: 'Found across Europe and Asia from Britain to Japan — often shy and heard before seen in oak woodland',
          size: 'About 35 cm — larger than a Blackbird, with a streaked pinkish-brown body and striking azure-blue wing patches',
          behavior: 'Buries thousands of acorns each autumn and can accurately remember hundreds of individual cache locations; forgotten caches regularly germinate into oak trees',
        },
        funFact: 'Eurasian Jays have been shown to "plan for the future" by caching food based on what they anticipate needing tomorrow — a form of mental time travel once thought unique to humans.',
        ebirdUrl: 'https://ebird.org/species/eurjay1',
        audubonUrl: '',
      },
    ],
    // ── AFRICA ───────────────────────────────────────────────────────────────
    'africa': [
      {
        id: 'lilac-breasted-roller', commonName: 'Lilac-breasted Roller', scientificName: 'Coracias caudatus',
        regions: ['africa'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Lilac-breasted_Roller_%28Coracias_caudatus%29.jpg/960px-Lilac-breasted_Roller_%28Coracias_caudatus%29.jpg',
        audioUrl: '', xenoCantoQuery: 'Coracias caudatus',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 36–38 cm including the long outer tail feathers',
          habitat: 'Open woodland, savanna, and thornbush country',
          diet: 'Insects, spiders, small lizards, and rodents',
          migration: 'Mostly resident; some local seasonal movements',
        },
        hints: {
          region: 'Found across eastern and southern Africa — a dazzling fixture of the African savanna from Ethiopia to South Africa',
          size: 'About 37 cm — slightly smaller than a European Roller, but arguably the most colourful bird on the African savanna',
          behavior: 'Performs spectacular rolling and tumbling aerial displays during courtship — the source of its "roller" name; perches conspicuously on exposed branches to scan for prey',
        },
        funFact: "The Lilac-breasted Roller has up to eight distinct colours in its plumage — lilac, blue, turquoise, green, rufous, white, black, and buff — making it one of Africa's most photographed birds.",
        ebirdUrl: 'https://ebird.org/species/lilrol1',
        audubonUrl: '',
      },
      {
        id: 'secretary-bird', commonName: 'Secretary Bird', scientificName: 'Sagittarius serpentarius',
        regions: ['africa'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Secretary_bird_Mara_for_WC.jpg/960px-Secretary_bird_Mara_for_WC.jpg',
        audioUrl: '', xenoCantoQuery: 'Sagittarius serpentarius',
        focalPoint: { x: 0.5, y: 0.35 },
        facts: {
          size: 'About 112–152 cm tall — eagle-bodied on very long crane-like legs',
          habitat: 'Open grassland, savanna, and lightly wooded plains',
          diet: 'Snakes, lizards, insects, small mammals, and eggs',
          migration: 'Mostly resident; some local movements in response to rainfall',
        },
        hints: {
          region: 'Found across sub-Saharan Africa — in open grasslands from Senegal to South Africa; the national emblem of South Africa and Sudan',
          size: 'Unmistakable — eagle-sized body on stilt-like legs over a metre tall; often stalks across the savanna like a long-legged secretary',
          behavior: 'Hunts on foot, covering up to 20 km a day; kills prey by repeatedly stomping with powerful feet — can deliver a kick of five times its own body weight',
        },
        funFact: 'The Secretary Bird stamps on snakes so hard that the impact force can reach 195 Newtons — five times its body weight — enough to kill prey almost instantaneously.',
        ebirdUrl: 'https://ebird.org/species/secbir1',
        audubonUrl: '',
      },
      {
        id: 'african-fish-eagle', commonName: 'African Fish Eagle', scientificName: 'Haliaeetus vocifer',
        regions: ['africa'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/African_fish_eagle_%28Haliaeetus_vocifer%29.jpg/960px-African_fish_eagle_%28Haliaeetus_vocifer%29.jpg',
        audioUrl: '', xenoCantoQuery: 'Haliaeetus vocifer',
        focalPoint: { x: 0.5, y: 0.35 },
        facts: {
          size: '63–75 cm; wingspan 175–210 cm',
          habitat: 'Large bodies of open water — lakes, rivers, reservoirs, and estuaries',
          diet: 'Fish, waterfowl, and carrion',
          migration: 'Non-migratory; resident near water year-round',
        },
        hints: {
          region: 'Found near large water bodies throughout sub-Saharan Africa — the national bird of Zambia, Zimbabwe, South Sudan, and Namibia',
          size: 'A large eagle — up to 75 cm with a wingspan of over 2 metres — with a striking white head, chest, and tail contrasting with chestnut body',
          behavior: 'Swoops from a perch to snatch fish from just below the water surface with its powerful talons; its ringing, yelping call is one of the most iconic sounds of the African bush',
        },
        funFact: "The African Fish Eagle's call is so evocative that it is often used as a generic 'African wilderness' sound in films and documentaries filmed anywhere in the world.",
        ebirdUrl: 'https://ebird.org/species/affeag1',
        audubonUrl: '',
      },
      {
        id: 'superb-starling', commonName: 'Superb Starling', scientificName: 'Lamprotornis superbus',
        regions: ['africa'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Superb_Starling_Portrait.jpg/960px-Superb_Starling_Portrait.jpg',
        audioUrl: '', xenoCantoQuery: 'Lamprotornis superbus',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 18–19 cm — similar to a Common Starling',
          habitat: 'Open woodland, savanna, thornbush, and around human settlements in East Africa',
          diet: 'Insects, fruit, berries, and seeds',
          migration: 'Non-migratory; resident year-round',
        },
        hints: {
          region: 'Found across East Africa — Kenya, Tanzania, Ethiopia, and neighbouring countries; a common and conspicuous bird around safari lodges',
          size: 'Starling-sized at about 18 cm — but with an extraordinary iridescent blue-green back, rich chestnut underparts, and a bold white breast band',
          behavior: 'Bold and inquisitive around campsites and lodges; cooperatively breeds in groups where helpers assist the dominant pair in raising chicks',
        },
        funFact: 'Superb Starlings can remember the contact calls of specific individuals years after last hearing them — a form of long-term social memory rare among birds.',
        ebirdUrl: 'https://ebird.org/species/supsta1',
        audubonUrl: '',
      },
    ],
    // ── ASIA ─────────────────────────────────────────────────────────────────
    'asia': [
      {
        id: 'red-crowned-crane', commonName: 'Red-crowned Crane', scientificName: 'Grus japonensis',
        regions: ['asia'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Grus_japonensis_-Hokkaido%2C_Japan_-several-8_%281%29.jpg/960px-Grus_japonensis_-Hokkaido%2C_Japan_-several-8_%281%29.jpg',
        audioUrl: '', xenoCantoQuery: 'Grus japonensis',
        focalPoint: { x: 0.5, y: 0.35 },
        facts: {
          size: '150–158 cm tall; wingspan 220–250 cm — one of the largest cranes',
          habitat: 'Wetlands, marshes, and river floodplains in East Asia; winters in coastal areas',
          diet: 'Fish, amphibians, aquatic invertebrates, and plants',
          migration: 'Migratory; breeds in northeastern China, Russia, and Hokkaido; winters in Korea and eastern China',
        },
        hints: {
          region: 'Found in East Asia — nests in Manchuria, Siberia, and Hokkaido (Japan); winters in Korea and coastal China',
          size: 'One of the tallest birds in Asia — up to 158 cm, with an enormous 2.5-metre wingspan',
          behavior: 'Famous for its elaborate courtship dance — pairs leap, bow, call, and toss vegetation into the air in synchronised displays; mates for life',
        },
        funFact: 'The Red-crowned Crane is a symbol of longevity, luck, and fidelity in Japan, China, and Korea — in Japanese legend, cranes live for 1,000 years.',
        ebirdUrl: 'https://ebird.org/species/redcra1',
        audubonUrl: '',
      },
      {
        id: 'great-hornbill', commonName: 'Great Hornbill', scientificName: 'Buceros bicornis',
        regions: ['asia'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Great_hornbill_Photograph_by_Shantanu_Kuveskar.jpg',
        audioUrl: '', xenoCantoQuery: 'Buceros bicornis',
        focalPoint: { x: 0.5, y: 0.35 },
        facts: {
          size: '95–130 cm — one of the largest hornbills; wingspan up to 150 cm',
          habitat: 'Tall tropical and subtropical forests in South and Southeast Asia',
          diet: 'Fruit (especially figs), lizards, small mammals, and nestlings',
          migration: 'Non-migratory; resident in forest home ranges',
        },
        hints: {
          region: 'Found in the forests of India, Nepal, Bhutan, and Southeast Asia from Myanmar to Sumatra — the state bird of Kerala, India',
          size: 'A very large bird — up to 130 cm long with a 150 cm wingspan — dominated by a massive yellow-and-black bill topped with a hollow casque',
          behavior: 'Females seal themselves inside a tree hollow to incubate eggs, leaving only a slit through which the male passes food for weeks; a remarkable example of trust and cooperation',
        },
        funFact: 'The Great Hornbill casque is hollow and lightweight — it amplifies the bird\'s loud calls and plays a role in visual display, not in combat as once thought.',
        ebirdUrl: 'https://ebird.org/species/grehor1',
        audubonUrl: '',
      },
      {
        id: 'java-sparrow', commonName: 'Java Sparrow', scientificName: 'Lonchura oryzivora',
        regions: ['asia'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Java_Sparrow_-_Baluran_NP_-_East_Java_MG_8180_%2829726690101%29.jpg/960px-Java_Sparrow_-_Baluran_NP_-_East_Java_MG_8180_%2829726690101%29.jpg',
        audioUrl: '', xenoCantoQuery: 'Lonchura oryzivora',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 15–17 cm — slightly larger than a house sparrow',
          habitat: 'Grassland, ricefields, and open scrubby areas; also urban and suburban gardens',
          diet: 'Grass seeds, rice, and other grains',
          migration: 'Non-migratory; sedentary',
        },
        hints: {
          region: 'Native to Java and Bali in Indonesia; widely introduced across Southeast Asia, Africa, and Hawaii — a popular cage bird worldwide',
          size: 'Slightly larger than a house sparrow — about 16 cm — with a distinctive pearl-grey body, black head, white cheeks, and an enormous pink bill',
          behavior: 'Highly social; forms large flocks in ricefields — historically regarded as a pest of rice crops, hence the scientific name oryzivora meaning "rice eater"',
        },
        funFact: 'The Java Sparrow was once kept as a cage bird by Chinese emperors and was considered a luxury pet — its export was forbidden under penalty of death.',
        ebirdUrl: 'https://ebird.org/species/javspa1',
        audubonUrl: '',
      },
      {
        id: 'oriental-dollarbird', commonName: 'Oriental Dollarbird', scientificName: 'Eurystomus orientalis',
        regions: ['asia', 'australia'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Dollarbird_Samcem_Dec02.JPG',
        audioUrl: '', xenoCantoQuery: 'Eurystomus orientalis',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 26–29 cm — similar to a large thrush',
          habitat: 'Open forest, woodland edges, forest clearings, and farmland with tall trees',
          diet: 'Large flying insects — beetles, moths, and cicadas caught in flight',
          migration: 'Migratory in the southern part of its range; breeds in Australia and migrates north to New Guinea and Southeast Asia in winter',
        },
        hints: {
          region: 'Found from eastern Asia south through Southeast Asia to Australia — a summer visitor to eastern Australia and a resident in tropical Asia',
          size: 'About 28 cm — stocky and large-headed with a wide, flattened bill; dark blue-green with a distinctive turquoise-blue throat and a bright red bill',
          behavior: 'Sallies from a high exposed perch to catch large insects in dramatic aerial pursuits; the "dollar" name comes from pale circular spots visible on the underwing in flight',
        },
        funFact: 'The Dollarbird gets its name from the silver dollar-sized pale spots visible on its underwings when it banks in flight — a flash of "coins" on dark feathers.',
        ebirdUrl: 'https://ebird.org/species/ordolb1',
        audubonUrl: '',
      },
      {
        id: 'stork-billed-kingfisher', commonName: 'Stork-billed Kingfisher', scientificName: 'Pelargopsis capensis',
        regions: ['asia'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Stork-billed_Kingfisher_Baranagar_Kolkata_West_Bengal_India_21.04.2014.jpg',
        audioUrl: '', xenoCantoQuery: 'Pelargopsis capensis',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 35–38 cm — the largest kingfisher in mainland Asia',
          habitat: 'Forested rivers, lakes, mangroves, and coastal areas',
          diet: 'Fish, frogs, lizards, crabs, and even small birds and rodents',
          migration: 'Non-migratory; sedentary resident',
        },
        hints: {
          region: 'Found across South and Southeast Asia — from India through Sri Lanka, Myanmar, Thailand, and Indonesia',
          size: "The largest kingfisher in mainland Asia — about 37 cm, with an enormous red bill that appears almost too large for the bird's head",
          behavior: 'Perches quietly on branches overhanging water waiting for prey; dives steeply to catch fish; gives loud, distinctive laughing "ke-ke-ke-ke" calls',
        },
        funFact: "The Stork-billed Kingfisher is highly territorial and will aggressively chase away other kingfishers — and even eagles — that enter its stretch of river.",
        ebirdUrl: 'https://ebird.org/species/stbkin1',
        audubonUrl: '',
      },
    ],
    // ── SOUTH AMERICA ─────────────────────────────────────────────────────────
    'south-america': [
      {
        id: 'scarlet-macaw', commonName: 'Scarlet Macaw', scientificName: 'Ara macao',
        regions: ['south-america', 'central-america'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Scarlet_macaw_%28Ara_macao_cyanopterus%29_Copan.jpg/960px-Scarlet_macaw_%28Ara_macao_cyanopterus%29_Copan.jpg',
        audioUrl: '', xenoCantoQuery: 'Ara macao',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: '81–96 cm — including the long pointed tail; wingspan around 110 cm',
          habitat: 'Humid evergreen forest, deciduous forest, and forest edges near rivers',
          diet: 'Seeds, nuts, fruit, berries, and some insects and clay (for mineral detoxification)',
          migration: 'Non-migratory; resident but makes local movements to follow fruiting trees',
        },
        hints: {
          region: 'Found from southern Mexico through Central America to Bolivia and Brazil — a flagship bird of tropical forest from Belize to the Amazon',
          size: 'A large parrot — nearly a metre long including the tail — with brilliant scarlet, yellow, and blue plumage that is unmistakable',
          behavior: 'Flies in noisy pairs or small flocks; visits clay licks (colpas) to eat mineral-rich clay that neutralises toxins from unripe seeds in its diet',
        },
        funFact: 'Scarlet Macaws can live over 50 years in the wild and mate for life — a bonded pair preens each other constantly and rarely leaves the other\'s side.',
        ebirdUrl: 'https://ebird.org/species/scamac1',
        audubonUrl: 'https://www.audubon.org/field-guide/bird/scarlet-macaw',
      },
      {
        id: 'andean-condor', commonName: 'Andean Condor', scientificName: 'Vultur gryphus',
        regions: ['south-america'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/AndeanCondorMale.jpg/960px-AndeanCondorMale.jpg',
        audioUrl: '', xenoCantoQuery: 'Vultur gryphus',
        focalPoint: { x: 0.5, y: 0.35 },
        facts: {
          size: 'Wingspan 270–320 cm — one of the largest flying birds by wingspan; body 100–130 cm',
          habitat: 'Open grassland and alpine zones of the Andes Mountains; also Pacific coasts',
          diet: 'Carrion — exclusively large dead animals such as deer, cattle, and marine mammals',
          migration: 'Non-migratory; soars over enormous territories in the Andes',
        },
        hints: {
          region: 'Found along the Andes Mountains from Venezuela to Tierra del Fuego, and along Pacific coasts of Colombia and Peru',
          size: 'One of the largest flying birds in the world — wingspan up to 3.2 metres and weighing up to 15 kg',
          behavior: 'Soars on Andean thermals and updrafts for hours without flapping; finds carrion by sight, often following other scavengers',
        },
        funFact: 'The Andean Condor is the national bird of Bolivia, Chile, Colombia, and Ecuador — a symbol of power and health in Andean cultures for thousands of years.',
        ebirdUrl: 'https://ebird.org/species/andcon1',
        audubonUrl: 'https://www.audubon.org/field-guide/bird/andean-condor',
      },
      {
        id: 'resplendent-quetzal', commonName: 'Resplendent Quetzal', scientificName: 'Pharomachrus mocinno',
        regions: ['central-america', 'south-america'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Resplendent_quetzal_san_gerardo_de_dota_3.31.24_DSC_3989-topaz-denoiseraw.jpg/960px-Resplendent_quetzal_san_gerardo_de_dota_3.31.24_DSC_3989-topaz-denoiseraw.jpg',
        audioUrl: '', xenoCantoQuery: 'Pharomachrus mocinno',
        focalPoint: { x: 0.5, y: 0.35 },
        facts: {
          size: 'Body 36–40 cm; male tail streamers up to 65 cm additional; total up to 1 m',
          habitat: 'Humid montane cloud forest at 1,200–3,000 m elevation',
          diet: 'Wild avocados and other fruit, insects, lizards, frogs, and snails',
          migration: 'Altitudinal migrant; moves up and down the mountainside following fruiting trees',
        },
        hints: {
          region: 'Found in the cloud forests of Central America — from southern Mexico to western Panama; the national bird of Guatemala',
          size: 'The male\'s iridescent tail streamers can reach 65 cm beyond the body — making the total bird nearly a metre long',
          behavior: 'Swallows wild avocados whole and regurgitates the pits, making it a critical disperser of avocado-related trees in cloud forests',
        },
        funFact: "The Resplendent Quetzal was considered divine by the ancient Maya and Aztec — killing one was punishable by death. Guatemala's currency is named the Quetzal in its honour.",
        ebirdUrl: 'https://ebird.org/species/resq1',
        audubonUrl: 'https://www.audubon.org/field-guide/bird/resplendent-quetzal',
      },
      {
        id: 'blue-footed-booby', commonName: 'Blue-footed Booby', scientificName: 'Sula nebouxii',
        regions: ['south-america', 'central-america'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Blue-footed-booby.jpg/960px-Blue-footed-booby.jpg',
        audioUrl: '', xenoCantoQuery: 'Sula nebouxii',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 76–84 cm; wingspan 152 cm',
          habitat: 'Tropical and subtropical Pacific Ocean coasts and offshore islands',
          diet: 'Fish — primarily sardines and anchovies caught by plunge-diving',
          migration: 'Largely resident; may disperse at sea between breeding seasons',
        },
        hints: {
          region: 'Found along the Pacific coast of Central and South America — most famously on the Galápagos Islands where they breed in large colonies',
          size: 'A large seabird — about 80 cm — but completely unmistakable thanks to its brilliant turquoise-blue feet, the brighter the better',
          behavior: 'Plunge-dives from 25 metres at high speed to catch fish, using binocular vision to track prey; males show off their blue feet in an elaborate high-stepping dance to attract females',
        },
        funFact: "The brightness of a Blue-footed Booby's feet signals its health and diet quality — females consistently prefer males with the bluest feet, as faded feet indicate poor condition.",
        ebirdUrl: 'https://ebird.org/species/blufoo2',
        audubonUrl: 'https://www.audubon.org/field-guide/bird/blue-footed-booby',
      },
      {
        id: 'harpy-eagle', commonName: 'Harpy Eagle', scientificName: 'Harpia harpyja',
        regions: ['south-america', 'central-america'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Harpia_harpyja_001_800.jpg',
        audioUrl: '', xenoCantoQuery: 'Harpia harpyja',
        focalPoint: { x: 0.5, y: 0.35 },
        facts: {
          size: '86–107 cm; wingspan 176–224 cm — among the largest eagles in the world',
          habitat: 'Lowland tropical rainforest — requires large tracts of undisturbed primary forest',
          diet: 'Sloths, monkeys, opossums, large lizards, and snakes',
          migration: 'Non-migratory; sedentary within a large forest territory',
        },
        hints: {
          region: 'Found in lowland tropical rainforest from southern Mexico through Central America to Bolivia and Brazil — the national bird of Panama',
          size: "One of the world's largest and most powerful eagles — up to 107 cm long with talons the size of a grizzly bear's claws",
          behavior: 'Flies through the forest canopy at speed, manoeuvring between trees to ambush prey; can pluck a sloth off a branch with a single strike of its powerful feet',
        },
        funFact: "The Harpy Eagle's talons can be longer than a grizzly bear's claws — up to 13 cm — and its grip strength is among the most powerful of any bird of prey.",
        ebirdUrl: 'https://ebird.org/species/hareag1',
        audubonUrl: 'https://www.audubon.org/field-guide/bird/harpy-eagle',
      },
    ],
    'australia': [
      {
        id: 'laughing-kookaburra', commonName: 'Laughing Kookaburra', scientificName: 'Dacelo novaeguineae',
        regions: ['australia'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Laughing_Kookaburra_1.jpg/960px-Laughing_Kookaburra_1.jpg',
        audioUrl: '', xenoCantoQuery: 'Dacelo novaeguineae',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 38–47 cm — the largest member of the kingfisher family',
          habitat: 'Open woodland, forest edges, and suburban gardens',
          diet: 'Snakes, lizards, insects, and small rodents',
          migration: 'Non-migratory; territorial and resident year-round',
        },
        hints: {
          region: 'Native to eastern Australia and introduced to Western Australia and New Zealand — one of Australia\'s most iconic bird sounds',
          size: 'About 42 cm — the world\'s largest kingfisher, stocky and broad-headed with a very large bill',
          behavior: 'Starts each day with a loud, cackling call that sounds like hysterical human laughter — family groups chorus together to declare territory at dawn and dusk',
        },
        funFact: 'Kookaburras kill snakes by snatching them behind the head and repeatedly slamming them against a hard branch before swallowing them whole.',
        ebirdUrl: 'https://ebird.org/species/laukoo1',
        audubonUrl: '',
      },
      {
        id: 'rainbow-lorikeet', commonName: 'Rainbow Lorikeet', scientificName: 'Trichoglossus moluccanus',
        regions: ['australia'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Rainbow_lorikeet_%28Trichoglossus_moluccanus_moluccanus%29_Sydney.jpg/960px-Rainbow_lorikeet_%28Trichoglossus_moluccanus_moluccanus%29_Sydney.jpg',
        audioUrl: '', xenoCantoQuery: 'Trichoglossus moluccanus',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: 'About 25–30 cm',
          habitat: 'Rainforest, woodland, heathland, and suburban gardens with flowering trees',
          diet: 'Nectar, pollen, and soft fruit',
          migration: 'Nomadic; follows flowering events across the landscape',
        },
        hints: {
          region: 'Common across coastal eastern Australia — noisy flocks are a familiar sight in Australian cities and parks',
          size: 'About 28 cm — similar in size to a pigeon but dramatically more colourful, in vivid blue, green, red, orange, and yellow',
          behavior: 'Has a brush-tipped tongue for lapping nectar from flowers; travels in noisy, fast-moving flocks and roosts communally in thousands',
        },
        funFact: 'Rainbow Lorikeets have been observed playing — rolling around on branches, hanging upside-down, and wrestling with other birds, apparently just for fun.',
        ebirdUrl: 'https://ebird.org/species/rainlo1',
        audubonUrl: '',
      },
      {
        id: 'emu', commonName: 'Emu', scientificName: 'Dromaius novaehollandiae',
        regions: ['australia'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Emu_1_-_Tidbinbilla.jpg/960px-Emu_1_-_Tidbinbilla.jpg',
        audioUrl: '', xenoCantoQuery: 'Dromaius novaehollandiae',
        focalPoint: { x: 0.5, y: 0.35 },
        facts: {
          size: '150–190 cm tall; the world\'s second-largest living bird',
          habitat: 'Scrubland, grassland, and open woodland across mainland Australia',
          diet: 'Plants, seeds, fruits, insects, and grubs',
          migration: 'Nomadic; travels long distances in response to rainfall and food availability',
        },
        hints: {
          region: 'Found across mainland Australia — featured on the Australian coat of arms and a familiar sight in outback Australia',
          size: 'Up to 190 cm tall — the second-tallest bird in the world and a powerful runner reaching speeds of 50 km/h',
          behavior: 'Completely flightless; the male alone incubates the eggs and raises the chicks, fasting for eight weeks without food or water during incubation',
        },
        funFact: 'Australia fought an infamous "Emu War" in 1932 — soldiers armed with machine guns failed to significantly reduce Emu numbers threatening Western Australian wheat farms.',
        ebirdUrl: 'https://ebird.org/species/emu1',
        audubonUrl: '',
      },
      {
        id: 'australian-magpie', commonName: 'Australian Magpie', scientificName: 'Gymnorhina tibicen',
        regions: ['australia'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Cracticus_tibicen_hypoleuca_male_domain.jpg/960px-Cracticus_tibicen_hypoleuca_male_domain.jpg',
        audioUrl: '', xenoCantoQuery: 'Gymnorhina tibicen',
        focalPoint: { x: 0.5, y: 0.4 },
        facts: {
          size: '37–43 cm',
          habitat: 'Open woodland, parks, farmland, and suburban areas',
          diet: 'Invertebrates, insects, small lizards, and seeds',
          migration: 'Non-migratory; territorial and resident year-round',
        },
        hints: {
          region: 'Found across Australia and southern New Guinea — one of Australia\'s most common and familiar birds, particularly in cities',
          size: 'About 40 cm — slightly larger than a European Magpie, bold black-and-white with a distinctive pale grey-blue bill',
          behavior: 'Has one of the most complex and musical calls of any bird — groups perform carolling choruses at dawn; notorious for swooping cyclists and pedestrians near nesting sites',
        },
        funFact: 'Australian Magpies can recognise individual human faces and have been documented holding grudges against specific people who disturbed their nests in previous years.',
        ebirdUrl: 'https://ebird.org/species/ausmag1',
        audubonUrl: '',
      },
      {
        id: 'superb-fairywren', commonName: 'Superb Fairywren', scientificName: 'Malurus cyaneus',
        regions: ['australia'], globalPool: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Malurus_cyaneus_cyanochlamys_.jpg/960px-Malurus_cyaneus_cyanochlamys_.jpg',
        audioUrl: '', xenoCantoQuery: 'Malurus cyaneus',
        focalPoint: { x: 0.5, y: 0.45 },
        facts: {
          size: 'About 14 cm including the long cocked tail',
          habitat: 'Coastal scrub, heathland, and suburban gardens with dense low shrubs',
          diet: 'Insects and seeds',
          migration: 'Non-migratory; sedentary and territorial year-round',
        },
        hints: {
          region: 'Common across southeastern Australia — a beloved backyard bird that often becomes quite tame around gardens',
          size: 'Tiny — about 14 cm including its long, cocked tail — with the breeding male\'s brilliant electric-blue head being one of the most striking colours in Australian wildlife',
          behavior: 'Lives in cooperative family groups where younger males help raise the dominant pair\'s chicks, but females also mate with males from other groups — one of the most complex mating systems known',
        },
        funFact: 'Female Superb Fairywrens teach their eggs a "password" call before they hatch — chicks that include this call in their begging get fed more, helping parents identify cuckoo imposters.',
        ebirdUrl: 'https://ebird.org/species/supfai1',
        audubonUrl: '',
      },
    ],
  };

  // ── Silhouette body-type map ────────────────────────────────────────────────
  // Maps each bird id to one of 14 reusable body-plan silhouettes in
  // svg/silhouettes/<type>.svg. Conveys shape + relative size without colour.
  // TODO (v2): generate species-specific silhouettes from the Wikimedia photos via
  // canvas-based thresholding instead of these shared body-type shapes. Not built now.
  const SILHOUETTE_BY_ID = {
    // passerine — small perching songbird
    'american-robin': 'passerine', 'european-robin': 'passerine', 'northern-cardinal': 'passerine',
    'painted-bunting': 'passerine', 'european-goldfinch': 'passerine', 'american-goldfinch': 'passerine',
    'barn-swallow': 'passerine', 'common-blackbird': 'passerine', 'eurasian-blue-tit': 'passerine',
    'great-tit': 'passerine', 'western-meadowlark': 'passerine', 'java-sparrow': 'passerine',
    'superb-starling': 'passerine', 'black-phoebe': 'passerine', 'superb-fairywren': 'passerine',
    // corvid — medium crow/jay, upright
    'blue-jay': 'corvid', 'eurasian-jay': 'corvid', 'australian-magpie': 'corvid',
    // raptor — hawk/eagle, broad wings, hooked bill
    'bald-eagle': 'raptor', 'osprey': 'raptor', 'wedge-tailed-eagle': 'raptor',
    'red-tailed-hawk': 'raptor', 'african-fish-eagle': 'raptor', 'harpy-eagle': 'raptor',
    // owl
    'snowy-owl': 'owl', 'barn-owl': 'owl', 'great-horned-owl': 'owl',
    // waterfowl — duck/goose
    'mallard': 'waterfowl', 'wood-duck': 'waterfowl', 'mandarin-duck': 'waterfowl',
    'canada-goose': 'waterfowl',
    // wading-bird — long legs + neck
    'greater-flamingo': 'wading-bird', 'white-stork': 'wading-bird', 'red-crowned-crane': 'wading-bird',
    // penguin
    'emperor-penguin': 'penguin',
    // seabird-compact — puffin/booby
    'atlantic-puffin': 'seabird-compact', 'blue-footed-booby': 'seabird-compact',
    // tern-gull
    'arctic-tern': 'tern-gull', 'black-headed-gull': 'tern-gull',
    // large-soaring — albatross/condor
    'wandering-albatross': 'large-soaring', 'andean-condor': 'large-soaring',
    'california-condor': 'large-soaring',
    // hummingbird
    'ruby-throated-hummingbird': 'hummingbird', 'annas-hummingbird': 'hummingbird',
    // parrot — hooked bill, upright (+ quetzal as closest upright stout perching shape)
    'sulphur-crested-cockatoo': 'parrot', 'rainbow-lorikeet': 'parrot', 'scarlet-macaw': 'parrot',
    'resplendent-quetzal': 'parrot',
    // kingfisher — stocky, large-billed (incl. rollers/hornbill, same Coraciiformes body plan)
    'common-kingfisher': 'kingfisher', 'stork-billed-kingfisher': 'kingfisher',
    'laughing-kookaburra': 'kingfisher', 'hoopoe': 'kingfisher', 'great-hornbill': 'kingfisher',
    'oriental-dollarbird': 'kingfisher', 'lilac-breasted-roller': 'kingfisher',
    // large-terrestrial — large ground bird, upright or running
    'emu': 'large-terrestrial', 'indian-peafowl': 'large-terrestrial', 'california-quail': 'large-terrestrial',
    'keel-billed-toucan': 'large-terrestrial', 'secretary-bird': 'large-terrestrial',
  };

  // ── Merge into one flat pool ─────────────────────────────────────────────────
  // Order is fixed (GLOBAL_POOL, then regional buckets in key order) so the
  // date-seeded daily index is stable. Every bird is assigned a silhouetteType.
  // The `regions` field is intentionally kept for potential future use.
  const ALL_BIRDS = [];
  const ALL_BIRDS_MAP = new Map();
  function addBird(b) {
    if (ALL_BIRDS_MAP.has(b.id)) return; // dedupe by id
    // Explicit map wins; ingested birds carry their own silhouetteType; else fallback.
    b.silhouetteType = SILHOUETTE_BY_ID[b.id] || b.silhouetteType || 'passerine';
    delete b.globalPool; // no longer meaningful with a single pool
    ALL_BIRDS.push(b);
    ALL_BIRDS_MAP.set(b.id, b);
  }
  GLOBAL_POOL.forEach(addBird);
  Object.values(REGIONAL_BIRDS).forEach(arr => arr.forEach(addBird));
  // Generated mass pool (scripts/ingest_birds.py) — appended after curated birds.
  if (typeof BIRDS_INGESTED !== 'undefined' && Array.isArray(BIRDS_INGESTED)) {
    BIRDS_INGESTED.forEach(addBird);
  }

  function dailyIndexForOffset(daysAgo, n) {
    // Seed on the player's LOCAL date so the bird rolls over at their local
    // midnight (like Wordle), not at UTC midnight. Math.round absorbs the ±1h
    // DST wobble in the local-midnight-to-local-midnight span.
    const now = new Date();
    const epoch = new Date(2025, 0, 1).getTime();                              // local 2025-01-01
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    // +1 one-time shift: players who played the evening before the UTC→local fix had
    // already seen "today's" bird, so advance the whole sequence by a day.
    const DAILY_SHIFT = 1;
    const dayIndex = Math.round((today - epoch) / 86400000) + DAILY_SHIFT - (daysAgo || 0);
    const len = n || ALL_BIRDS.length;
    return ((dayIndex % len) + len) % len;
  }

  // ── Regions ──────────────────────────────────────────────────────────────────
  // 'global' = the full pool (today's existing daily). Each region maps to the
  // bird `regions` tags it includes (sparse/legacy tags folded into the 6 regions;
  // worldwide/arctic/antarctica/global seabirds stay Global-only).
  const REGIONS = [
    { key: 'global',        label: 'Global',                  emoji: '🌍', tags: null },
    { key: 'north-america', label: 'North America',           emoji: '🦅', tags: ['north-america', 'california'] },
    { key: 'south-america', label: 'South & Central America', emoji: '🦜', tags: ['south-america', 'central-america'] },
    { key: 'europe',        label: 'Europe',                  emoji: '🇪🇺', tags: ['europe'] },
    { key: 'africa',        label: 'Africa',                  emoji: '🦩', tags: ['africa', 'north-africa'] },
    { key: 'asia',          label: 'Asia',                    emoji: '🦚', tags: ['asia'] },
    { key: 'oceania',       label: 'Australia & Oceania',     emoji: '🦘', tags: ['australia'] },
  ];
  const REGION_BY_KEY = new Map(REGIONS.map(r => [r.key, r]));
  const _regionPools = new Map(); // key -> stable filtered array (cached)
  function poolForRegion(key) {
    const region = REGION_BY_KEY.get(key);
    if (!region || !region.tags) return ALL_BIRDS;        // global / unknown
    if (_regionPools.has(key)) return _regionPools.get(key);
    const tags = new Set(region.tags);
    // Filter ALL_BIRDS (fixed order) so the per-region daily index is stable.
    const pool = ALL_BIRDS.filter(b => (b.regions || []).some(t => tags.has(t)));
    _regionPools.set(key, pool);
    return pool;
  }

  return {
    getAllBirds() {
      return ALL_BIRDS;
    },

    getRegions() {
      return REGIONS;
    },

    isRegion(key) {
      return REGION_BY_KEY.has(key);
    },

    getBirdsForRegion(key) {
      return poolForRegion(key);
    },

    // Region-aware daily. key 'global' = full pool. daysAgo: 0 today, 1 yesterday…
    getDailyBirdForRegion(key, daysAgo) {
      const pool = poolForRegion(key);
      return pool[dailyIndexForOffset(daysAgo, pool.length)];
    },

    getDailyBird() {
      return ALL_BIRDS[dailyIndexForOffset(0)];
    },

    // daysAgo: 1 = yesterday, 2 = two days ago, … Used by Archive mode.
    getDailyBirdForOffset(daysAgo) {
      return ALL_BIRDS[dailyIndexForOffset(daysAgo)];
    },

    getById(id) {
      return ALL_BIRDS_MAP.get(id) || null;
    },

    search(query, pool) {
      const list = pool || ALL_BIRDS;
      const q = query.toLowerCase().trim();
      if (q.length < 1) return [];
      return list
        .filter(b => b.commonName.toLowerCase().includes(q))
        .sort((a, b) => {
          const aS = a.commonName.toLowerCase().startsWith(q) ? 0 : 1;
          const bS = b.commonName.toLowerCase().startsWith(q) ? 0 : 1;
          return aS - bS;
        })
        .slice(0, 8);
    },

    isExactMatch(query, pool) {
      const list = pool || ALL_BIRDS;
      const q = query.toLowerCase().trim();
      return list.some(b => b.commonName.toLowerCase() === q);
    },

    findExact(query, pool) {
      const list = pool || ALL_BIRDS;
      const q = query.toLowerCase().trim();
      return list.find(b => b.commonName.toLowerCase() === q) || null;
    },

    // Warmer/colder feedback for a wrong guess: is the guessed bird "close" to the
    // answer? Close = same group word (e.g. two macaws, two kingfishers) or same
    // genus (e.g. two Haliaeetus eagles). Returns { group } (the shared group word,
    // or null if related only by genus) when close, else null.
    closeness(guessName, answer, pool) {
      const list = pool || ALL_BIRDS;
      const q = (guessName || '').toLowerCase().trim();
      const guess = list.find(b => b.commonName.toLowerCase() === q);
      if (!guess || !answer || guess.id === answer.id) return null;
      const genus = b => (b.scientificName || '').toLowerCase().split(/\s+/)[0];
      const lastWord = b => {
        const t = b.commonName.toLowerCase().trim().split(/\s+/);
        return t[t.length - 1];
      };
      const gw = lastWord(guess);
      const sharedWord = (gw && gw.length >= 3 && gw === lastWord(answer)) ? gw : null;
      const sameGenus = !!genus(guess) && genus(guess) === genus(answer);
      if (sharedWord) return { group: sharedWord };
      if (sameGenus) return { group: null };
      return null;
    },
  };
})();
