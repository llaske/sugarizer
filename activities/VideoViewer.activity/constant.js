

// Constants
var constant = {};

constant.pageCount = 4;
constant.libraries = [
	{
		name: "khanacademy",
		title: "Khan Academy",
		image: "images/khanacademy.png",
		database: "http://sugarizer.org/content/khan.php?lang=%language%",
		videos: "http://s3.amazonaws.com/KA-youtube-converted/%id%.mp4/%id%",
		images: "http://s3.amazonaws.com/KA-youtube-converted/%id%.mp4/%id%.png"
	},
	{
		name: "canope",
		title: "Canopé",
		image: "images/canope.png",
		database: "http://sugarizer.org/content/canope.php",
		videos: "https://videos.reseau-canope.fr/download.php?file=lesfondamentaux/%id%_sd",
		images: "https://www.reseau-canope.fr/lesfondamentaux/uploads/tx_cndpfondamentaux/%image%.png"
	}
];
constant.videoType = "mp4";


