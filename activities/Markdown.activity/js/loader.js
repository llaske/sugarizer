requirejs.config({
    baseUrl: "lib",
    paths: {
        activity: "../js",
        markdownconverter: "../lib/Markdown.Converter",
        markdowneditor: "../lib/Markdown.Editor",
        markdownsanitizer: "../lib/Markdown.Sanitizer",
    }
});

requirejs(["activity/activity"]);
