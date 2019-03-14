< !doctype html >
    <html>
        <head>
            <meta charset="utf-8">
                <title>tracking.js - first tracking</title>
                <script src="../build/tracking-min.js"></script>
</head>
            <body>
                <video id="myVideo" width="400" height="300" preload autoplay loop muted></video>
                <script>
                    var colors = new tracking.ColorTracker(['magenta', 'cyan', 'yellow']);
                  
  colors.on('track', function(event) {
    if (event.data.length === 0) {
                        // No colors were detected in this frame.
                    } else {
                        event.data.forEach(function (rect) {
                            console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
                        });
                    }
                  });
                
                  tracking.track('#myVideo', colors);
  </script>
            </body>
</html>
