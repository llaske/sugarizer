
// Database localisation if not local


//
Abcd.context.getDatabase = function() {
	if (!app || !app.hasDatabase) return "";
	return (app.hasDatabase() ? "" : Abcd.context.database);
}
