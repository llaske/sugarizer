# What is Video Viewer ?

Video Viewer is a viewer for a set of videos hosted on a server.
Two set of videos are linked natively with the activity: [Khan Academy](http://khanacademy.org/) and [Canopé](https://www.reseau-canope.fr/lesfondamentaux/accueil.html). But you're able to adapt easily the activity to point to your own set of videos.

# How it works ?

Video Viewer is a Sugar-Web activity, it could work both into Sugar Learning platform and in Sugarizer.

A standard set of libraries is set with the activity (see `constant.libraries` property in [constant.js](constant.js)). You could add your own library using the library dialog (click on the library icon on the toolbar). You should provide to the dialog the URL of a JSON file that include an object with all these properties:

	{
		name: "canope",
		title: "Canopé",
		image: "images/canope.png",
		database: "http://sugarizer.org/content/canope.php",
		videos: "https://videos.reseau-canope.fr/download.php?file=lesfondamentaux/%id%_sd",
		images: "https://www.reseau-canope.fr/lesfondamentaux/uploads/tx_cndpfondamentaux/%image%.png"
	}

Here what means each field:

* **name**: name is the unique identifier of the library.
* **image**: the image for the library. For included libraries, it's a local path but it could be a remote image as well.
* **title**: title is the description of the library. It's used as title for the library into the library selection window.
* **database**: database is the URL for the JSON file where the content is described (see below). You could include a `%language%` string into the URL that will be replaced by the language [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) of the current user.
* **videos**: videos is the URL used to retrieve the video when the user click on it. You could include `%id%`, `%image%`, `%category%`, `%title%` in the URL (see below). They will be replaced by values of these fields for the clicked video.
* **images**: images is the URL used for the preview image of the video. You could include `%id%`, `%image%`, `%category%`, `%title%` in the URL (see below). They will be replaced by values of these fields for the video.

To be able to display a library, the VideoViewer activity, you need to provide the content of the library. You could do that with the `%database%` field. This field must point to an URL that return a JSON file describing all items in the library. Here is a description of this JSON file:

	[
	    {"id":"...", "title":"...", "image":"...", "category": "..."},
	    {"id":"...", "title":"...", "image":"...", "category": "..."},
	    {"id":"...", "title":"...", "image":"...", "category": "..."},
		...
	]

Each line represent one video, fields are:

* **id**: unique identifier of the video (need),
* **title**: title of the video (need),
* **image**: preview image of the video (optional),
* **category**: category of the video (optional). If provided, it will allow user to filter videos by categories using the menu.

To compute the exact URL of the video and of the preview image, the activity will use the `videos` and `images` URL provided in the library settings and will replace `%id%`, `%category%`, `%image%` and `%title%` by value of these properties for the current video. So it's up to you to decide which field you need. For example, if you have a look on Khan Academy library settings you could see that: no `%category%` is present and that `%image%` is not used  because image preview URL is computed using only video the `%id%` field.

Note that items will be displayed by the VideoViewer activity in the order of your JSON file. So it's up to you to choose the optimal order for your user.

Finally, it's important to say that the JSON file for the database is not necessarily static, it could be generated dynamically.

# Image credits

* play-video by jayson lim from the Noun Project
* Filter by Kevin Augustine LO from the Noun Project
* Library by vicentnovoa from the Noun Project


# Video credits

All Khan Academy videos are under [Khan Academy Terms of Service](https://www.khanacademy.org/about/tos).

All Canopé videos are under [Canopé CNDP licence](https://www.reseau-canope.fr/lesfondamentaux/mentions-legales.html). Detailed credits follow:

## Direction de publication
M. Jean-Marc Merriaux, directeur général de Canopé-CNDP Téléport 1, 1 Avenue du Futuroscope, CS 80158, 86961 FUTUROSCOPE CEDEX, Chasseneuil-du-Poitou.

## Hébergement
Canopé

## Équipe Canopé
### Direction de l’édition transmédia Canopé
Directrice de l'édition transmédia et de la pédagogie : Michèle Briziou
Directeur délégué à l'édition transmédia : Thomas Schmitt, Jérôme Lecanu
Directrice déléguée à la pédagogie : Véronique Billard

### Conception pédagogique
Joël Benitez, Louisette Caux, Audrey David, Cécile Diaz, Isabelle Renault, Michelle Ros Dupont, Patricia Roux.

### Chefs de projet
Bernard Clouteau, Catherine Goupil, Bernard Kenkle, Guillaume Menesplier, Julien Philipponneau, Laura Zornitta.

### Direction d’écriture
Vanessa Grunberg, Nathalie Mars, Pascal Mirleau, Tony Scott.

### Production audiovisuelle
Xavier Achard, Emmanuel Bourdeau, Marie-Odile Dupont, Simon Gattegno, Virginie Héricourt, Romuald Herrero, Franck Hueso, Nicolas Jeanneau, Hervé Turri, Anna Souchaud.

### Chargés de suivi éditorial
Julie Betton, Nathalie Bidart, Aurélien Brault, Céline Cholet, Cécile Laugier, Julie Lavalard, Laetitia Pourel, Sophie Roue, Marguerite de la Taille.

### Directeur artistique
Jean-Jacques Lonni

### Graphisme Ergonomie
Thomas Cussonneau

### Développement
Bruno Caillaud

### Intégration
Aurélien Jean

### Contrôle de gestion

### Service juridique

### Direction de la valorisation des offres

## Auteurs
### Auteurs pédagogiques
Marie-Dominique Bauden, Marc Bégaries, Patricia Bégaries, Céline Berger, Claire Bézagu, Patrick Binisti, Lisbeth Brivois, Sophie Caux, Claudine Demiot, Renée Germe, Véronique Granville, Josiane Grenet, Jean-Louis Etienne, Marie-José Lantam, Bertrand Lebot, Marie-José Paquet, Jérôme Penot, Catherine Richet, Michelle Ros-Dupont, Geneviève Roy, Karine Savigny, Fabienne Schramm, Pascale Vergnaud, Marie-Laure Villedary, Marie-Pierre Visentin.

### Scénaristes
Yvan Amar, Dominique Amouyal, Sérine Barbin, Hervé Benedetti, Agnès Bidaud, Olivier Blond, Virginie Boda, Héloïse Capoccia, Fabien Champion, Nicolas Chrétien, Sabine Cipolla, Philippe Clerc, Camille Couasse, Catherine Cuenca, Vincent Détré, Jean-Marc Dobel, Marie Eynard, Marine Gacem, Vanessa Grunberg, Catherine Guillot-Bonte, Claire Kanny, Emmanuel Leduc, Jean-Jacques Lonni, Max Mamoud, Marie Manand, Mathilde Maraninchi, Nathalie Mars, Thomas Martinez, Pascal Mirleau, Diane Morel, Antonin Poiré, Christophe Poujol, Alexandre Reverend, Nathalie Reznikoff, Jean-Christophe Ribot, Benjamin Richard, Sylvie Rivière, David Robert, Armand Robin, Nicolas Robin, Françoise Ruscak, Tony Scott, Georges Tzanos, Patricia Valeix, Sébastien Vignaud, Séverine Vuillaume.

### Direction artistique des enregistrements
Marie-Odile Dupont

### Comédiens
Quentin Baillot, Nathalie Blanc, Olivier Blond, Joëlle Bobbio, Ségolène Bouët, Marc Brunet, Pauline Brunner, Arthur Dumas, Nathalie Kanoui, Magali Lange, Sandrine Le Berre, Frederic Le Bret, Antoine Lelandais, Bernadette Le Sachet, Sylvain Levitte, Johanna Nizard, Sébastien Perez, Bénédicte Rivière, Céline Ronté.

### Réalisateurs/Graphistes
Paul-Etienne Bourde, Lionel Brousse, Anne Calandre, Davy Drouineau, Fabrice Fouquet, Joanna Lurie, Christophe Nardi, Vannaseng Phimmasone, Christelle Soutif, Alexandrine Wagner.

### Studios d’animation
Amopix, Atomic soom, Cross river, Emakina, La Netscouade, La générale de production, Les Films du Poisson Rouge.

### Studios de sound-design
Au jour le jour, Vega Prod.

### Sous titrage
MFP
