define(['activity/data-model', 'webL10n'], function(DataModel, l10n) {

    'use strict';

    var canvas = document.querySelector('canvas'),
        ctx = canvas.getContext('2d'),
        moon = document.querySelector('img#moon');

    var _ = l10n.get;

    var IMAGE_SIZE, HALF_SIZE;

    if (!ctx.ellipse) {
        /*
            CanvasRenderingContext2D.ellipse() is esperimental at the time of writing
            Provide pollyfill
        */

        ctx.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
            /* for this project, we do not need: rotation, startAngle, endAngle, anticlockwise */
            x -= radiusX;
            y -= radiusY;
            radiusX *= 2;
            radiusY *= 2;

            var kappa = 0.5522848,
                ox = (radiusX / 2) * kappa, // control point offset horizontal
                oy = (radiusY / 2) * kappa, // control point offset vertical
                xe = x + radiusX, // x-end
                ye = y + radiusY, // y-end
                xm = x + radiusX / 2, // x-middle
                ym = y + radiusY / 2; // y-middle

            if (startAngle === Math.PI / 2 && endAngle === 3 * Math.PI / 2) {
                ctx.moveTo(xm, ye);
                ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym); /* 2nd quarter */
                ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y); /* 3rd quarter */
            } else if (startAngle === 3 * Math.PI / 2 && endAngle === Math.PI / 2) {
                ctx.moveTo(xm, y);
                ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym); /* 4th quarter */
                ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye); /* 1st quarter */
            } else if (startAngle === 0 && endAngle === 2 * Math.PI) {
                ctx.moveTo(xe, ym);
                ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye); /* 1st quarter */
                ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym); /* 2nd quarter */
                ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y); /* 3rd quarter */
                ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym); /* 4th quarter */
            }
        };
    }


    function drawMoon() {
        /*
            Draw mask corresponding to either shaded region or lit region
        */

        var phase_shadow_adjust = null;
        var arc_scale = null;

        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, IMAGE_SIZE, IMAGE_SIZE);

        if (DataModel.phase_of_moon < 0.25) {
            phase_shadow_adjust = DataModel.phase_of_moon - Math.abs(Math.sin(DataModel.phase_of_moon * Math.PI * 4) / 18.0);
            arc_scale = 1 - (4 * phase_shadow_adjust);

            ctx.fillStyle = 'white';
            ctx.fillRect(HALF_SIZE, 0, HALF_SIZE, IMAGE_SIZE);
            ctx.fillStyle = 'black';
            drawEllipse(HALF_SIZE - IMAGE_SIZE * arc_scale / 2, 0, IMAGE_SIZE * arc_scale, IMAGE_SIZE, 0, 3 * Math.PI / 2, Math.PI / 2);
            ctx.fill();

        } else if (DataModel.phase_of_moon < 0.50) {
            phase_shadow_adjust = DataModel.phase_of_moon + Math.abs(Math.sin(DataModel.phase_of_moon * Math.PI * 4) / 18.0);
            arc_scale = 4 * (phase_shadow_adjust - 0.25);

            ctx.fillStyle = 'white';
            ctx.fillRect(HALF_SIZE, 0, HALF_SIZE, IMAGE_SIZE);
            ctx.fillStyle = 'white';
            drawEllipse(HALF_SIZE - IMAGE_SIZE * arc_scale / 2, 0, IMAGE_SIZE * arc_scale, IMAGE_SIZE, 0, Math.PI / 2, 3 * Math.PI / 2);
            ctx.fill();

        } else if (DataModel.phase_of_moon < 0.75) {
            phase_shadow_adjust = DataModel.phase_of_moon - Math.abs(Math.sin(DataModel.phase_of_moon * Math.PI * 4) / 18.0);
            arc_scale = 1 - (4 * (phase_shadow_adjust - 0.5));

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, HALF_SIZE, IMAGE_SIZE);
            ctx.fillStyle = 'white';
            drawEllipse(HALF_SIZE - IMAGE_SIZE * arc_scale / 2, 0, IMAGE_SIZE * arc_scale, IMAGE_SIZE, 0, 3 * Math.PI / 2, Math.PI / 2);
            ctx.fill();

        } else {
            phase_shadow_adjust = DataModel.phase_of_moon + Math.abs(Math.sin(DataModel.phase_of_moon * Math.PI * 4) / 18.0);
            arc_scale = 4 * (phase_shadow_adjust - 0.75);

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, HALF_SIZE, IMAGE_SIZE);
            ctx.fillStyle = 'black';
            drawEllipse(HALF_SIZE - IMAGE_SIZE * arc_scale / 2, 0, IMAGE_SIZE * arc_scale, IMAGE_SIZE, 0, Math.PI / 2, 3 * Math.PI / 2);
            ctx.fill();
        }

        ctx.save();

        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(moon, 0, 0, IMAGE_SIZE, IMAGE_SIZE);

        ctx.globalAlpha = 0.5;
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(moon, 0, 0, IMAGE_SIZE, IMAGE_SIZE);

        ctx.restore();

        drawEclipse();
    }


    function drawEclipse() {
        if (
            (
                DataModel.next_lunar_eclipse_sec !== -1 ||
                DataModel.last_lunar_eclipse_sec <= 7200
            ) && (
                DataModel.next_lunar_eclipse_sec <= 7200 ||
                DataModel.last_lunar_eclipse_sec !== -1
            ) && (
                Math.min(DataModel.next_lunar_eclipse_sec, DataModel.last_lunar_eclipse_sec) <= 7200
            )
        ) {
            var eclipse_alpha;
            if (DataModel.next_lunar_eclipse_sec == -1) {
                eclipse_alpha = DataModel.last_lunar_eclipse_sec / 7200;
            }
            else if (DataModel.last_lunar_eclipse_sec == -1) {
                eclipse_alpha = DataModel.next_lunar_eclipse_sec / 7200;
            }
            else {
                eclipse_alpha = Math.min(DataModel.next_lunar_eclipse_sec, DataModel.last_lunar_eclipse_sec) / 7200;
            }

            ctx.save();

            ctx.globalAlpha = 0.25 * (1 - eclipse_alpha);
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, IMAGE_SIZE, IMAGE_SIZE);

            ctx.restore();
        }
    }


    function drawGrid(compass_text) {
        /*
            Draw longitudes at 0, +/-30 and +/-60 degrees
            Draw latitudes at 0, +/-30 and +/-60 degrees
            Draw compass
        */

        var needleLength = 0.08 * IMAGE_SIZE;

        ctx.font = '16px Sans';
        ctx.lineWidth = 3;

        /* Latitude Labels */
        ctx.fillStyle = 'blue';
        drawLabel(HALF_SIZE + 1, HALF_SIZE, 26, 22, '0\xB0');
        drawLabel(HALF_SIZE + 1, HALF_SIZE * 0.50, 36, 22, '30\xB0');
        drawLabel(HALF_SIZE + 1, HALF_SIZE * 1.5, 36, 22, '30\xB0');
        drawLabel(HALF_SIZE + 1, HALF_SIZE * 0.15, 36, 22, '60\xB0');
        drawLabel(HALF_SIZE + 1, HALF_SIZE * 1.85, 36, 22, '60\xB0');

        /* Longitude Labels */
        ctx.fillStyle = 'red';
        drawLabel((HALF_SIZE * 0.48), HALF_SIZE, 36, 22, '30\xB0');
        drawLabel((HALF_SIZE * 1.52), HALF_SIZE, 36, 22, '30\xB0');
        drawLabel((HALF_SIZE * 0.15), HALF_SIZE, 36, 22, '60\xB0');
        drawLabel((HALF_SIZE * 1.85), HALF_SIZE, 36, 22, '60\xB0');

        /* Latitude Lines*/
        ctx.strokeStyle = 'blue';
        drawLine(0, HALF_SIZE, IMAGE_SIZE, HALF_SIZE);
        drawLine(HALF_SIZE * 0.15, HALF_SIZE * 0.5, IMAGE_SIZE - HALF_SIZE * 0.15, HALF_SIZE * 0.5);
        drawLine(HALF_SIZE * 0.15, HALF_SIZE * 1.5, IMAGE_SIZE - HALF_SIZE * 0.15, HALF_SIZE * 1.5);
        drawLine(HALF_SIZE * 0.5, HALF_SIZE * 0.15, IMAGE_SIZE - HALF_SIZE * 0.5, HALF_SIZE * 0.15);
        drawLine(HALF_SIZE * 0.5, HALF_SIZE * 1.85, IMAGE_SIZE - HALF_SIZE * 0.5, HALF_SIZE * 1.85);

        /* Longitude Lines*/
        ctx.strokeStyle = 'red';
        drawLine(HALF_SIZE, 0, HALF_SIZE, IMAGE_SIZE);
        drawEllipse(HALF_SIZE * 0.15, 0, IMAGE_SIZE - IMAGE_SIZE * 0.15, IMAGE_SIZE, 0, 0, 2 * Math.PI);
        drawEllipse(HALF_SIZE * 0.48, 0, IMAGE_SIZE - IMAGE_SIZE * 0.48, IMAGE_SIZE, 0, 0, 2 * Math.PI);

        /* Compass */
        ctx.fillStyle = 'red';
        ctx.fillRect(0 + 16, needleLength, needleLength, 4);
        ctx.fillText(compass_text[3], 0, needleLength + 8);
        ctx.fillText(compass_text[2], needleLength + 16 + 4, needleLength + 8);
        ctx.fillText(_('Longitude'), 0, IMAGE_SIZE - 16);

        ctx.fillStyle = 'blue';
        ctx.fillRect(0.5 * needleLength + 16, 0.5 * needleLength, 4, needleLength);
        ctx.fillText(compass_text[0], 0.5 * needleLength + 16 - 4, 0.5 * needleLength - 8);
        ctx.fillText(compass_text[1], 0.5 * needleLength + 16 - 4, 1.5 * needleLength + 16 + 4);
        ctx.fillText(_('Latitude'), 0, IMAGE_SIZE - 40);
    }


    function drawEllipse(x, y, width, height, rotation, startAngle, endAngle, anticlockwise) {
        /*
            Wrapper for drawing ellipse on canvas
            converts bounding-box drawing instructions to center-axes instructions
        */

        ctx.beginPath();
        x += width / 2;
        y += height / 2;
        var radiusX = width / 2;
        var radiusY = height / 2;
        ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
        ctx.stroke();
    }


    function drawLine(x1, y1, x2, y2) {
        /*
            Wrapper for drawing line on canvas
        */

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }


    function drawLabel(x, y, width, height, text) {
        /*
            Wrapper for placing text on canvas
        */

        var labelColor = ctx.fillStyle;
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = 'white';
        ctx.fillText(text, x + 5, y + 18);
        ctx.fillStyle = labelColor;
    }


    function setImageSize(size) {
        /*
            Update IMAGE_SIZE as window resizes
        */

        IMAGE_SIZE = size;
        HALF_SIZE = 0.5 * IMAGE_SIZE;
    }


    return {
        moon: drawMoon,
        eclipse: drawEclipse,
        grid: drawGrid,
        setImageSize: setImageSize
    };
});
