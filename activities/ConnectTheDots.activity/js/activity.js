define(["sugar-web/activity/activity", "sugar-web/env"], function (activity, env) {
    activity.setup();

    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 400;


    var dots = [
        {x: 100, y: 100, n: 1}, // Top-Left
        {x: 500, y: 100, n: 2}, // Top-Right
        {x: 500, y: 300, n: 3}, // Bottom-Right
        {x: 100, y: 300, n: 4}  // Bottom-Left
    ];
    
    var nextDotIndex = 0;
    var connectedDots = [];
    var isGameComplete = false;

    function reDraw() {
        ctx.fillStyle = "#f8f8f8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Lines Draw Karo
        if (connectedDots.length > 1) {
            ctx.beginPath();
            ctx.moveTo(connectedDots[0].x, connectedDots[0].y);
            for (var i = 1; i < connectedDots.length; i++) {
                ctx.lineTo(connectedDots[i].x, connectedDots[i].y);
            }
            
            // AGAR GAME COMPLETE HAI, toh aakhri dot ko pehle se jodo (Rectangle Close)
            if (isGameComplete) {
                ctx.lineTo(connectedDots[0].x, connectedDots[0].y);
            }

            ctx.strokeStyle = "#005fe4"; 
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        // Dots Draw Karo
        dots.forEach(function(d, index) {
            ctx.beginPath();
            ctx.arc(d.x, d.y, 15, 0, Math.PI * 2);
            ctx.fillStyle = (index < nextDotIndex) ? "#4caf50" : "#ffffff";
            ctx.strokeStyle = "#404040";
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = (index < nextDotIndex) ? "#ffffff" : "#404040";
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(d.n, d.x, d.y);
        });
    }

    canvas.addEventListener('mousedown', function(e) {
        if (isGameComplete) return; // Game khatam hone ke baad click rok do

        var rect = canvas.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;

        var targetDot = dots[nextDotIndex];
        var distance = Math.sqrt(Math.pow(mouseX - targetDot.x, 2) + Math.pow(mouseY - targetDot.y, 2));

        if (distance < 25) {
            connectedDots.push(targetDot);
            nextDotIndex++;
            
            // Check if all dots are connected
            if (nextDotIndex === dots.length) {
                isGameComplete = true;
                reDraw(); // Rectangle close karne ke liye re-draw
                setTimeout(function() { 
                    alert("Rectangle Complete! Great job."); 
                }, 200);
            } else {
                reDraw();
            }
        }
    });

    reDraw();
});