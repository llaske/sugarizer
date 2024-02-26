//code from https://github.com/Wiebke/TangramGenerator
//Copyright (c) 2019 Wiebke Köpp
/** Class for a Tan */
var areaSum = new IntAdjoinSqrt2(576, 0);

/* Constructor: tanType is a number from 0 to 5, depending on which tan the object
 * describes where 0: big triangle, 1: medium triangle, 2: small triangle,
 * 3: square, 4: parallelogram and 5: flipped parallelogram, anchor is one specific
 * point, orientation is a number between
 * 0 (0 degrees) and 7 (315 degrees) */
function Tan(tanType, anchor, orientation) {
    this.tanType = tanType;
    this.anchor = anchor;
    this.orientation = orientation;
    if (!(typeof generating === 'undefined') && generating) {
        this.points = this.getPoints();
        this.segments = this.getSegments();
        this.insidePoints = this.getInsidePoints();
    }
}

Tan.prototype.dup = function () {
    return new Tan(this.tanType, this.anchor.dup(), this.orientation);
};

Tan.prototype.area = function () {
    var areas = [96, 48, 24, 48, 48, 48];
    return areas[this.tanType];
};

/* Calculate the points involved in this tan, using anchor point and pre-
 * calculated direction vectors */
Tan.prototype.getPoints = function () {
    if (generating && typeof this.points != 'undefined') {
        return this.points;
    }
    var points = [];
    points[0] = this.anchor.dup();
    var directions = Directions[this.tanType][this.orientation];
    for (var dirId = 0; dirId < directions.length; dirId++) {
        var current = this.anchor.dup();
        current.add(directions[dirId]);
        points[dirId + 1] = current;
    }
    return points;
};

/* Calculate segments from points (connect consecutive points to segments */
Tan.prototype.getSegments = function () {
    if (generating && typeof this.segments != 'undefined') {
        return this.segments;
    }
    var segments = [];
    var points = this.getPoints();
    for (var pointId = 0; pointId < points.length - 1; pointId++) {
        segments[pointId] = new LineSegment(points[pointId], points[(pointId + 1)]);
    }
    segments[pointId] = new LineSegment(points[pointId], points[0]);
    return segments;
};

Tan.prototype.center = function () {
    return this.anchor.dup().add(InsideDirections[this.tanType][this.orientation][0]);
};

/* Calculate points inside this tan from anchor and pre-calculated directions */
Tan.prototype.getInsidePoints = function () {
    if (generating && typeof this.insidePoints != 'undefined') {
        return this.insidePoints;
    }
    var insidePoints = [];
    var numInsidePoints = InsideDirections[this.tanType][this.orientation].length;
    for (var pointId = 0; pointId < numInsidePoints; pointId++) {
        insidePoints.push(this.anchor.dup().add(InsideDirections[this.tanType][this.orientation][pointId]));
    }
    return insidePoints;
};

Tan.prototype.toSVG = function () {
    var points = this.getPoints();
    var pointsString = "";
    for (var i = 0; i < points.length; i++) {
        pointsString += points[i].toFloatX() + ", " + points[i].toFloatY() + " ";
    }
    return pointsString;
};

/* Functions based on multiple tans */

var getAllPoints = function (tans) {
    var points = [];
    /* Add points of each tan */
    for (var i = 0; i < tans.length; i++) {
        var currentPoints = tans[i].getPoints();
        points = points.concat(currentPoints);
    }
    /* Eliminate duplicates */
    points = eliminateDuplicates(points, comparePoints, true);
    return points;
};

var outlineArea = function (outline) {
    var area = new IntAdjoinSqrt2(0, 0);
    for (var pointId = 0; pointId < outline.length - 1; pointId++) {
        /* Calculate the cross product of consecutive points. This corresponds
         * to twice the area of the triangle (0,0) - vertices[p] -
         * vertices[(p+1)%num_vertices]. This area is positive if the vertices
         * of that triangle are arranged in a counterclockwise order and negative
         * if the vertices are arranged in a clockwise order
         */
        area.add(outline[pointId].determinant(outline[(pointId + 1)]));
    }
    area.add(outline[pointId].determinant(outline[0]));
    area.abs();
    return area.scale(0.5);
};

var tanSumArea = function (tans) {
    var area = 0;
    for (var tanId = 0; tanId < tans.length; tanId++) {
        area += tans[tanId].area();
    }
    return area;
};

/* Check if a given outline contains all the given points */
var outlineContainsAll = function (outline, allPoints) {
    for (var pointId = 0; pointId < allPoints.length; pointId++) {
        var contains = containsPoint(outline, allPoints[pointId]);
        if (contains === -1) {
            return false;
        }
    }
    return true;
};

var computeSegments = function (allPoints, tans) {
    /* First calculate all line segments involved in the tangram. These line
     * segments are the segments of each individual tan however split up at points
     * from other tans */
    var allSegments = [];
    var currentSegments;
    for (var tanId = 0; tanId < tans.length; tanId++) {
        /* For the line segment of each tan, check if there exists points from
         * other tans on the segment, if that is the case, split the segment at
         * these points */
        currentSegments = tans[tanId].getSegments();
        for (var segmentId = 0; segmentId < currentSegments.length; segmentId++) {
            var splitPoints = [];
            for (var pointId = 0; pointId < allPoints.length; pointId++) {
                if (currentSegments[segmentId].onSegment(allPoints[pointId])) {
                    splitPoints.push(allPoints[pointId]);
                }
            }
            allSegments = allSegments.concat(currentSegments[segmentId].split(splitPoints));
        }
    }
    /* Throw out all line segments that occur twice (they will not be part of
     * the outline anyways */
    allSegments = eliminateDuplicates(allSegments, compareLineSegments, false);
    return allSegments;
};

/* Find segment with minimum angle to a given lastSegment */
var findMinSegments = function (lastSegment, segments) {
    var minAngle = 360;
    var minIndex = -1;
    for (var segmentId = 0; segmentId < segments.length; segmentId++) {
        var currentAngle = segments[segmentId].angleTo(lastSegment);
        if (currentAngle < minAngle) {
            minIndex = segmentId;
            minAngle = currentAngle;
        }
    }
    return [minIndex, minAngle];
};

/* Find segment with maximum angle to a given lastSegment */
var findMaxSegments = function (lastSegment, segments) {
    var maxAngle = 0;
    var maxIndex = -1;
    for (var segmentId = 0; segmentId < segments.length; segmentId++) {
        var currentAngle = segments[segmentId].angleTo(lastSegment);
        if (currentAngle > maxAngle) {
            maxIndex = segmentId;
            maxAngle = currentAngle;
        }
    }
    return [maxIndex, maxAngle];
};

var computeOutlinePart = function (allPoints, allSegments, angleFinder, hole, reduce) {
    if (allPoints.length === 0 || allSegments.length === 0) {
        return;
    }
    allPoints.sort(comparePoints);
    var lastPoint = allPoints[0];
    var helperPoint = lastPoint.dup();
    /* First last segment is a downwards horizontal segment*/
    helperPoint.subtract(new Point(new IntAdjoinSqrt2(0, 0), new IntAdjoinSqrt2(1, 0)));
    var outline = [];
    outline.push(lastPoint);
    var lastSegment = new LineSegment(helperPoint, lastPoint);
    var firstSegment = true;
    do {
        /* Get all segments that are adjacent to the lastPoint and find the segment
         * with maximum or minimum angle */
        var currentSegments = allSegments.filter(function (element) {
            return !lastSegment.eq(element) && (element.point1.eq(lastPoint) || element.point2.eq(lastPoint));
        });
        var foundAngle;
        /* On the first segment, always use the segment with maximum angle, so
         * that all outline parts are traversed anti-clockwise */
        if (firstSegment) {
            foundAngle = findMaxSegments(lastSegment, currentSegments);
        } else {
            foundAngle = angleFinder(lastSegment, currentSegments);
        }
        var index = foundAngle[0];
        var angle = foundAngle[1];
        if (index === -1) {
            break;
        }
        /* If the found segment continues in the same direction, remove the last
         * point, since it provides no additional information - taken out since
         * this complicates computation in evaluation */
        if (angle === 180 && !firstSegment && reduce) {
            outline.pop();
        }
        /* Add the other point of the found segment to the outline*/
        if (currentSegments[index].point1.eq(lastPoint)) {
            outline.push(currentSegments[index].point2);
            lastPoint = currentSegments[index].point2;
        } else {
            outline.push(currentSegments[index].point1);
            lastPoint = currentSegments[index].point1;
        }
        lastSegment = currentSegments[index];
        allSegments = allSegments.filter(function (element) {
            return !lastSegment.eq(element);
        });
        if (firstSegment) {
            firstSegment = false;
        }
    } while (!lastPoint.eq(allPoints[0]) || (!outlineContainsAll(outline, allPoints) && !hole));
    /* When the last point is equal to the first it can be deleted */
    outline.pop();
    return [outline, allSegments];
};

var computeHole = function (allPoints, allSegments, reduce) {
    if (allPoints.length === 0 || allSegments.length === 0) {
        return;
    }
    /* Filter out all points and segment that cannot be part of a closed sequence
     * of line segments anymore (all holes consist of such a sequence */
    var numPointsBefore = allSegments.length * 2;
    var numPointsAfter = 0;
    while (numPointsBefore != numPointsAfter) {
        numPointsBefore = allSegments.length * 2;
        var remainingPoints = [];
        for (var segmentsId = 0; segmentsId < allSegments.length; segmentsId++) {
            remainingPoints.push(allSegments[segmentsId].point1);
            remainingPoints.push(allSegments[segmentsId].point2);
        }
        /* Throw out segments where the endpoint occurs just once */
        allSegments = allSegments.filter(function (element) {
            return bothPointsMultipleTimes(remainingPoints, element.point1, element.point2);
        });
        /* Number of Points to consider changed if numPointsAfter is smaller
         * before */
        numPointsAfter = allSegments.length * 2;
    }
    allPoints = eliminateDuplicates(remainingPoints, comparePoints, true);
    /* Use a minimum angle for holes */
    return computeOutlinePart(allPoints, allSegments, findMinSegments, true, reduce);
};

var computeOutline = function (tans, reduce) {
    /* First calculate all line segments involved in the tangram. These line
     * segments are the segments of each individual tan however split up at points
     * from other tans */
    var outline = [];
    var outlineId = 0;
    var allPoints = getAllPoints(tans);
    var allSegments = computeSegments(allPoints, tans);
    var outlinePart = computeOutlinePart(allPoints, allSegments, findMaxSegments, false, reduce);
    outline[outlineId] = outlinePart[0];
    allSegments = outlinePart[1];
    var area = outlineArea(outline[0]);
    /* Compute possible holes */
    while ((!area.eq(areaSum) && area.toFloat() > 576) || !outlineContainsAll(outline[0], allPoints)) {
        outlineId++;
        outlinePart = computeHole(allPoints, allSegments, findMinSegments);
        if (typeof outlinePart === 'undefined') {
            /* Occurs for tangrams that consists of not connected, thus should
             * only occur when placing tans, and the result is not connected yet */
            return;
        }
        outline[outlineId] = outlinePart[0];
        allSegments = outlinePart[1];
        area.subtract(outlineArea(outline[outlineId]));
    }

    return outline;
};

var computeBoundingBox = function (tans, outline) {
    if (typeof outline === "undefined") {
        outline = getAllPoints(tans);
    } else {
        outline = outline[0];
    }
    var minX = new IntAdjoinSqrt2(100, 0);
    var minY = new IntAdjoinSqrt2(100, 0);
    var maxX = new IntAdjoinSqrt2(-100, 0);
    var maxY = new IntAdjoinSqrt2(-100, 0);
    /* Find min and max x and y coordinates */
    for (var pointId = 0; pointId < outline.length; pointId++) {
        var currentX = outline[pointId].x;
        var currentY = outline[pointId].y;
        if (currentX.compare(minX) < 0) minX = currentX;
        if (currentY.compare(minY) < 0) minY = currentY;
        if (currentX.compare(maxX) > 0) maxX = currentX;
        if (currentY.compare(maxY) > 0) maxY = currentY;
    }
    return [minX, minY, maxX, maxY];
};

/* Returns 1 if the given point is inside the polygon given by outline,
 * return -1 if the point lies on the outline and 0 is the point lies on the outline */
var containsPoint = function (outline, point) {
    /* Compute the winding number for the given point and the polygon, which
     * counts how often the polygon "winds" around the point. The point lies
     * outside, only when the winding number is 0 */
    var winding = 0;
    for (var pointId = 0; pointId < outline.length; pointId++) {
        var firstPoint = outline[pointId];
        var secondPoint = pointId === outline.length - 1 ? outline[0] : outline[(pointId + 1)];
        /* Check each segment for containment */
        if (point.eq(firstPoint) || point.eq(secondPoint)
            || new LineSegment(firstPoint, secondPoint).onSegment(point)) {
            return 0;
        }
        /* Line segments are only considered if they are either pointing upward or
         * downward (therefore excluding horizontal lines) and if the intersection
         * point is strictly to the right of the point, for upwards segments,
         * this means that the point must lie to the left of the segment for downwards
         * segments, this means that the point must lie to the right of the segment
         * (when looking into the segment direction) */
        if (outline[pointId].y.compare(point.y) <= 0) {
            /* Upwards edge */
            if (secondPoint.y.compare(point.y) === 1
                && relativeOrientation(secondPoint, point, firstPoint) > 0) {
                winding++;
            }
        } else {
            /* Downwards edge */
            if (secondPoint.y.compare(point.y) <= 0
                && relativeOrientation(secondPoint, point, firstPoint) < 0) {
                winding--;
            }
        }
    }
    return (winding === 0) ? -1 : 1;
};
