
// Database localisation if not local

// Remote database location
Abcd.context.database = "http://server.sugarizer.org/activities/Abecedarium.activity/";

// 
Abcd.context.getDatabase = function() {
	if (!app || !app.hasDatabase) return "";
	return (app.hasDatabase() ? "" : Abcd.context.database);
}
