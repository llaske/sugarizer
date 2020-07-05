//code from https://github.com/Wiebke/TangramGenerator 
//Copyright (c) 2019 Wiebke Köpp
/* Constructor: array of the 7 tan pieces, in order: BigTriangle, 2. Big Triangle
 * MediumTriangle, SmallTriangle, 2. SmallTriangle, */
function Tangram(tans) {
    this.tans = tans.sort(function (a, b) {
        return a.tanType - b.tanType;
    });
    /* Outline is an array of points describing the outline of the tangram */
    this.outline = computeOutline(this.tans, true);
    if (typeof this.outline != 'undefined') {
        this.evaluation = new Evaluation(this.tans, this.outline);
    }
}

/* Calculates the center of the bounding box of a tangram */
Tangram.prototype.center = function () {
    var center = new Point();
    var boundingBox = computeBoundingBox(this.tans, this.outline);
    center.x = boundingBox[0].dup().add(boundingBox[2]).scale(0.5);
    center.y = boundingBox[1].dup().add(boundingBox[3]).scale(0.5);
    return center;
};

/* Centers the tangram, so that its center is position at (30,30) */
Tangram.prototype.positionCentered = function () {
    var center = new Point(new IntAdjoinSqrt2(30, 0), new IntAdjoinSqrt2(30, 0));
    center.subtract(this.center());
    for (var tansId = 0; tansId < this.tans.length; tansId++) {
        this.tans[tansId].anchor.translate(center.x, center.y);
    }
    this.outline = computeOutline(this.tans, true);
};

/* Create an SVG element with the outline of this tangram */
Tangram.prototype.toSVGOutline = function (elementName) {
    var tangramSVG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
    /* Add each outline point to the path */
    var pathdata = "M " + this.outline[0][0].toFloatX() + ", " + this.outline[0][0].toFloatY() + " ";
    for (var pointId = 1; pointId < this.outline[0].length; pointId++) {
        pathdata += "L " + this.outline[0][pointId].toFloatX() + ", " + this.outline[0][pointId].toFloatY() + " ";
    }
    pathdata += "Z ";
    shape.setAttributeNS(null, "fill", '#3299BB');
    for (var outlineId = 1; outlineId < this.outline.length; outlineId++) {
        pathdata += "M " + this.outline[outlineId][0].toFloatX() + ", " + this.outline[outlineId][0].toFloatY() + " ";
        for (var pointId = 1; pointId < this.outline[outlineId].length; pointId++) {
            pathdata += "L " + this.outline[outlineId][pointId].toFloatX() + ", " + this.outline[outlineId][pointId].toFloatY() + " ";
        }
        pathdata += "Z";
    }
    shape.setAttributeNS(null, "d", pathdata);
    /* Set fill-rule for correctly displayed holes */
    shape.setAttributeNS(null, "fill-rule", "evenodd");
    tangramSVG.appendChild(shape);

    /*Test convex hull */
    /*var allPoints = getAllPoints(this.tans);
    allPoints = allPoints.sort(comparePointsYX);
    var convexHull = this.evaluation.computeConvexHull(this.outline[0],allPoints[0]);
    var pathdataHull = "M " + convexHull[0].toFloatX() + ", " + convexHull[0].toFloatY() + " ";
    for (var i = 1; i < convexHull.length; i++) {
        pathdataHull += "L " + convexHull[i].toFloatX() + ", " + convexHull[i].toFloatY() + " ";
    }
    pathdataHull += "Z ";
    var hull = document.createElementNS("http://www.w3.org/2000/svg", "path");
    hull.setAttributeNS(null, "stroke", '#FF9900');
    hull.setAttributeNS(null, "stroke-width", '0.45');
    hull.setAttributeNS(null, "fill", 'none');
    hull.setAttributeNS(null, "d", pathdataHull);
    tangramSVG.appendChild(hull);*/

    /* Clear old content */
    var element = document.getElementById(elementName);
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    /* Add new tangram */
    element.appendChild(tangramSVG);
};

/* Create svg element for each tan */
Tangram.prototype.toSVGTans = function (elementName) {
    var tangramSVG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    for (var i = 0; i < this.tans.length; i++) {
        var shape = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        shape.setAttributeNS(null, "points", this.tans[i].toSVG());
        shape.setAttributeNS(null, "fill", '#FF9900');
        shape.setAttributeNS(null, "stroke", "#3299BB");
        shape.setAttributeNS(null, "stroke-width", "0.05");
        tangramSVG.appendChild(shape);
    }
    document.getElementById(elementName).appendChild(tangramSVG);
};

/* Comparison of tangrams for sorting */
var compareTangrams = function (tangramA, tangramB) {
    return tangramA.evaluation.getValue() - tangramB.evaluation.getValue();
};
