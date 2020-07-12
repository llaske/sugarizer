//code from https://github.com/Wiebke/TangramGenerator 
//Copyright (c) 2019 Wiebke Köpp
/**
 * Class for computation of evaluation measures, contains different measures
 * and final value of the evaluation function
 */

var evaluationMode = 0;
var faculty = [1,1, 2, 6, 24, 120, 720, 5040, 40320];

function Evaluation(tans, outline) {
    /* Vertices of the whole outline: between 3 and 29 (23+6)) */
    this.outlineVertices = 0;
    /* Vertices of the outer outline (not including holes): between 3 and 29 (23+6) */
    this.outerOutlineVertices = 0;
    /* Number of Holes: between 0 and 3*/
    this.numHoles = 0;
    /* Area of all holes: between 0 and ? */
    this.holeArea = 0;
    /* Number of vertices of the holes: between */
    this.holeVertices = 0;
    /* Type of the holes: 0 if there are no holes, 1 if all holes are inner holes
     * (their vertices do not touch the outer outline, 2 if all holes are touch
     * the outer outline and 3 in a mixed case */
    this.holeType = 0;
    /* Perimeter of the outer outline */
    this.perimeter = 0;
    /* Longest edge of the outer outline, can be at 24 max since outline points
     * on segments that continue are kept -> does not matter since shortest
     * longest Edge is interesting (?) */
    this.longestEdge = 0;
    /* Shortest edge of the outer outline */
    this.shortestEdge = 0;
    /* Range in x and y */
    this.rangeX = 0;
    this.rangeY = 0;
    /* Percentage of how much area the tangram covers of the convex hull */
    this.convexPercentage = 0;
    /* Size of the convex hull */
    this.convexHullArea = 0;
    /* Number of symmetry axes (x/y-axes): between 0 and 2 */
    this.symmetry = 0;
    /* Parts of the outline that are attached to the remainder only by one
     * other point: between 0 and 6 */
    this.hangingPieces = 0;
    /* Number of Edges that occur twice */
    this.matchedEdges = 0;
    /* Number of pairs of vertices in the same place */
    this.matchedVertices = 0;
    //this.finalEvaluation = 0;
    this.computeEvaluation(tans, outline);
}

/* TODO */
Evaluation.prototype.getValue = function (mode) {
    if (typeof mode === 'undefined') {
        mode = 0;
    }
    var evaluation;
    switch (evaluationMode) {
        case 0:
            /* Order according to a high convex percentage */
            evaluation = 1.0 - this.convexPercentage;
            break;
        case 1:
            /* Order according to a low number of outline vertices */
            evaluation = this.outlineVertices;
            break;
        case 2:
            /* Order according to a low number of outer Outline vertices */
            evaluation = this.outerOutlineVertices;
            break;
        case 3:
            /* Order according to a small perimeter */
            evaluation = this.perimeter;
            break;
        case 4:
            /* Order according to a high number of matched Vertices */
            evaluation = - this.matchedVertices;
            break;
        case 5:
            /* Order according to both a low number of outer outline vertices
             * and a high convex percentage */
            evaluation = (this.outerOutlineVertices - 3) / 26 + 1.0-this.convexPercentage ;
        default:
            evaluation = 0;
    }
    return evaluation
};

/* Convex hull for less than three points */
Evaluation.prototype.computeConvexHullLess3Points = function (points) {
    if (points.length <= 1) {
        return points;
    }
    if (points[0].eq(points[1])) {
        points.pop();
    }
    return points;
};

Evaluation.prototype.computeConvexHull = function (points, upperLeft) {
    if (points.length <= 2) {
        return this.computeConvexHullLess3Points(points);
    }
    /* Sort all points according to their polar angle to the most upper left most point */
    points = points.sort(function (pointA, pointB) {
        var angleA = clipAngle(pointA.dup().subtract(upperLeft).angle());
        var angleB = clipAngle(pointB.dup().subtract(upperLeft).angle());
        /* Put the one with the smaller angle first, if the angle is the same, put
         * the one with the smaller distance to  */
        var equal = numberEq(angleA, angleB);
        var distanceA = pointA.distance(upperLeft);
        var distanceB = pointB.distance(upperLeft);
        if (equal && numberEq(distanceA, distanceB)) {
            return 0;
        } else if ((!equal && angleA < angleB) || (equal && distanceA < distanceB)) {
            return -1;
        } else {
            return 1;
        }
    });
    var filteredPoints = [points[0]];
    /* Remove all points with the same polar angle (except the one furthest away
     * from upperLeft */
    for (var pointId = 1; pointId < points.length-1; pointId++) {
        filteredPoints.push(points[pointId]);
        if (numberEq(points[pointId].dup().subtract(upperLeft).angle(),
                points[pointId+1].dup().subtract(upperLeft).angle())) {
            filteredPoints.pop();
        }
    }
    filteredPoints.push(points[pointId]);
    if (filteredPoints.length <= 2) {
        return this.computeConvexHullLess3Points(filteredPoints);
    }
    var convexHull = [];
    convexHull.push(filteredPoints[0]);
    convexHull.push(filteredPoints[1]);
    /* Check if adding the next point leads to a concave path (last added point
     * is left of segment between the second to last added point and the new point */
    for (pointId = 2; pointId < filteredPoints.length; pointId++) {
        while (convexHull.length > 1 && relativeOrientation
        (convexHull[convexHull.length-1], filteredPoints[pointId], convexHull[convexHull.length-2]) <= 0) {
            convexHull.pop();
        }
        convexHull.push(filteredPoints[pointId]);
    }
    return convexHull;
};

/* Compare functions used symmetry calculations */
var horizontalCompare = function (center){
    return function (pointA, pointB){
        var distanceA = pointA.y.distance(center.y);
        var distanceB = pointB.y.distance(center.y);
        var compareDistance = distanceA.compare(distanceB);
        if (compareDistance === 0){
            return pointA.x.compare(pointB.x);
        } else {
            return compareDistance;
        }
    };
};

var verticalCompare = function (center){
    return function (pointA, pointB){
        var distanceA = pointA.x.distance(center.x);
        var distanceB = pointB.x.distance(center.x);
        var compareDistance = distanceA.compare(distanceB);
        if (compareDistance === 0){
            return pointA.y.compare(pointB.y);
        } else {
            return compareDistance;
        }
    };
};


Evaluation.prototype.computeEvaluation = function (tans, outline) {
    /* Number of vertices in the outer outline is given by the first outline in
     * the outline array, this counts vertices that occur multiple times also
     * multiple times */
    this.outerOutlineVertices = outline[0].length;

    /* If there are holes, they are saved in the outline array starting at index
     * 1, if there are none, the length of the outline array is 1 */
    this.numHoles = outline.length - 1;
    for (var outlineId = 0; outlineId < outline.length; outlineId++) {
        if (outlineId != 0) {
            this.holeArea += outlineArea(outline[outlineId]).toFloat();
            this.holeVertices += outline[outlineId].length;
        }
        this.outlineVertices += outline[outlineId].length;
    }
    /* Longest and shortest edge in the outer outline */
    this.longestEdge = -1;
    this.shortestEdge = 60;
    var currentEdge;
    for (var outerPointId = 0; outerPointId < outline[0].length; outerPointId++) {
        if (outerPointId != outline[0].length -1){
            currentEdge = outline[0][outerPointId].distance(outline[0][outerPointId + 1]);
            /* Point occurs multiple times in outer outline */
        } else {
            currentEdge = outline[0][outerPointId].distance(outline[0][0]);
        }
        if (currentEdge > this.longestEdge) {
            this.longestEdge = currentEdge;
        }
        if (currentEdge < this.shortestEdge) {
            this.shortestEdge = currentEdge;
        }
        this.perimeter += currentEdge;
    }
    var unreducedOutline = computeOutline(tans, false)[0];
    for (var outerPointId = 0; outerPointId < unreducedOutline[0].length; outerPointId++) {
        if (unreducedOutline[outerPointId].eq(unreducedOutline[outerPointId + 1])) {
            this.hangingPieces++;
        }
    }

    for (var outlineId = 1; outlineId < unreducedOutline.length; outlineId++){
        var innerTouch = false;
        for (var innerPointId = 0; innerPointId < unreducedOutline[outlineId].length; innerPointId++){
            for (var outerPointId = 0; outerPointId < unreducedOutline[0].length; outerPointId++) {
                innerTouch = innerTouch || unreducedOutline[0][outerPointId].eq(unreducedOutline[outlineId][innerPointId])
            }
            if (innerTouch) {
                break;
            }
        }
        switch (this.holeType){
            // This is the first hole being processed
            case 0:
                if (innerTouch) {
                    this.holeType = 2;
                } else {
                    this.holeType = 1;
                }
                break;
            // Another hole was completely inside
            case 1:
                if (innerTouch){
                    this.holeType = 3;
                }
                break;
            // Another touched the outline
            case 2:
                if (!innerTouch){
                    this.holeType = 3;
                }
                break;
            default:
                break;
        }
    }

    var boundingBox = computeBoundingBox(tans, outline);
    this.rangeX = boundingBox[2].dup().subtract(boundingBox[0]).toFloat();
    this.rangeY = boundingBox[3].dup().subtract(boundingBox[1]).toFloat();
    var center = new Point();
    center.x = boundingBox[0].dup().add(boundingBox[2]).scale(0.5);
    center.y = boundingBox[1].dup().add(boundingBox[3]).scale(0.5);

    var upperPoints = [];
    var lowerPoints = [];
    var leftPoints = [];
    var rightPoints = [];
    for (outerPointId = 0; outerPointId < outline[0].length; outerPointId++) {
        var compareX = outline[0][outerPointId].x.compare(center.x);
        var compareY = outline[0][outerPointId].y.compare(center.y);
        if (compareX < 0){
            leftPoints.push(outline[0][outerPointId]);
        } else if (compareX > 0) {
            rightPoints.push(outline[0][outerPointId]);
        }
        if (compareY < 0){
            upperPoints.push(outline[0][outerPointId]);
        } else if (compareY > 0) {
            lowerPoints.push(outline[0][outerPointId]);
        }
    }

    upperPoints.sort(horizontalCompare(center));
    lowerPoints.sort(horizontalCompare(center));
    leftPoints.sort(verticalCompare(center));
    rightPoints.sort(verticalCompare(center));
    var symmetryReject = false;
    if (upperPoints.length == lowerPoints.length){
        for (pointId = 0; pointId < upperPoints.length; pointId++){
            if (!upperPoints[pointId].x.eq(lowerPoints[pointId].x)
                || !upperPoints[pointId].y.distance(center.y).eq(lowerPoints[pointId].y.distance(center.y))) {
                symmetryReject = true;
                break;
            }
        }
    } else {
        symmetryReject = true;
    }
    if (!symmetryReject){
        this.symmetry++;
    }

    symmetryReject = false;
    if (leftPoints.length == rightPoints.length){
        for (pointId = 0; pointId < leftPoints.length; pointId++){
            if (!leftPoints[pointId].y.eq(rightPoints[pointId].y)
                || !leftPoints[pointId].x.distance(center.x).eq(rightPoints[pointId].x.distance(center.x))) {
                symmetryReject = true;
                break;
            }
        }
    } else {
        symmetryReject = true;
    }
    if (!symmetryReject){
        this.symmetry++;
    }
    /* Similar to segments computation in outline computation */
    var allPoints = getAllPoints(tans);
    var occurrences = [];
    for ( pointId = 0; pointId < allPoints.length; pointId++) {
        occurrences.push(0);
    }
    var allSegments = [];
    var currentSegments;
    var currentPoints;
    for (var tanId = 0; tanId < tans.length; tanId++) {
        /* For the line segment of each tan, check if there exist points from
         * other tans on the segment, if that is the case, split the segment at
         * these points */
        currentSegments = tans[tanId].getSegments();
        for (var segmentId = 0; segmentId < currentSegments.length; segmentId++) {
            var splitPoints = [];
            for (var pointId = 0; pointId < allPoints.length; pointId++) {
                if (currentSegments[segmentId].onSegment(allPoints[pointId])) {
                    splitPoints.push(allPoints[pointId]);
                }
                if (currentSegments[segmentId].point1.eq(allPoints[pointId]) ||
                    currentSegments[segmentId].point2.eq(allPoints[pointId])) {
                    occurrences[pointId]++;
                }
            }
            allSegments = allSegments.concat(currentSegments[segmentId].split(splitPoints));
        }
    }
    /* Count pairs of points that coincide */
    for (var pointId = 0; pointId < allPoints.length; pointId++) {
        occurrences[pointId] /= 2;
        if (occurrences[pointId] > 1){
            this.matchedVertices += faculty[occurrences[pointId] - 1];
        }
    }

    var numSegmentsBefore = allSegments.length;
    /* Throw out all line segments that occur twice */
    allSegments = eliminateDuplicates(allSegments, compareLineSegments, false);
    this.matchedEdges = (numSegmentsBefore - allSegments.length)/2;
    var convexHull = this.computeConvexHull(outline[0], allPoints.sort(comparePointsYX)[0]);
    this.convexHullArea = outlineArea(convexHull).toFloat();
    this.convexPercentage = 576/this.convexHullArea;
};
