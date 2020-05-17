// TamTam Micro database

TamTam = {};

TamTam.database = [
	"acguit","alarm","armbone","au_pipes","babylaugh","babyuhoh","banjo","basse","basse2","bird","bottle",
	"bubbles","byke","camera","car","carhorn","cat","cello","chiken","chimes","clang","clang2","clarinette",
	"clavinet","cling","cow","crash","cricket","diceinst","didjeridu","dog","door","duck","duck2","fingercymbals",
	"flugel","flute","foghorn","frogs","gam","guit","guit2","guitmute","guitshort","harmonica","harmonium",
	"harpsichord","hey","horse","kalimba","koto","laugh","mando","marimba","ocarina","ounk","ow","piano",
	"plane","rhodes","sarangi","saxo","saxsoprano","sheep","shenai","sitar","slap","templebell","triangle",
	"trumpet","tuba","ukulele","violin","voix","water","zap"
];

TamTam.collections = [
	{ name: "all", content: TamTam.database },
	{ name: "animals", content: [ 
		"bird", "cat", "chiken", "cow", "cricket", "dog", "duck", "duck2", "frogs", "horse", "ounk", "sheep"
	]},
	{ name: "concret", content: [
		"alarm", "bottle", "bubbles", "byke", "camera", "car", "carhorn", "clang", "cling", "crash", "diceinst",
		"door",	"plane", "slap", "water", "zap"
	]},
	{ name: "keyboard", content: [
		"clavinet", "harmonium", "harpsichord", "piano", "rhodes"
	]},
	{ name: "people", content: [
		"armbone", "babylaugh", "babyuhoh", "hey", "laugh", "ow", "voix"
	]},
	{ name: "percussions", content: [
		"chimes", "clang2", "fingercymbals", "gam", "kalimba", "marimba", "templebell", "triangle"
	]},
	{ name: "strings", content: [
		"acguit", "banjo", "basse", "basse2", "cello", "guit", "guit2", "guitmute", "guitshort", "koto",
		"mando", "sitar", "ukulele", "violin"
	]},
	{ name: "winds", content: [
		"au_pipes", "clarinette", "didjeridu", "flugel", "flute", "foghorn", "harmonica", "ocarina",
		"saxo", "saxsoprano", "shenai", "trumpet", "tuba"
	]},
];

// Current piano sound
var currentPianoMode = "piano";
var currentSimonMode = "piano";















