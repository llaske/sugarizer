//code from https://github.com/Wiebke/TangramGenerator 
//Copyright (c) 2019 Wiebke Köpp
/**
 * Class for a line segment connecting two points
 */

/* Constructor */
function LineSegment(point1, point2) {
    if (point1 === 'undefined') {
        this.point1 = new Point();
    } else {
        this.point1 = point1;
    }
    if (point2 === 'undefined') {
        this.point2 = new Point();
    } else {
        this.point2 = point2;
    }
    /* Order the points so that the point with lower x and lower y values is
     * saved in point1 */
    if (!this.point1.isZero() && !this.point2.isZero() || this.point2.isZero() && !this.point1.isZero()) {
        var compare = this.point1.compare(this.point2);
        if (compare === 1) {
            var point1Copy = this.point1;
            this.point1 = this.point2;
            this.point2 = point1Copy;
        }
    }
}

/* Duplication */
LineSegment.prototype.dup = function () {
    return new LineSegment(this.point1.dup(), this.point2.dup());
};

/* Properties of the segment */

LineSegment.prototype.length = function () {
    return this.point1.distance(this.point2);
};

LineSegment.prototype.direction = function () {
    return this.point2.dup().subtract(this.point1);
};

LineSegment.prototype.lineParameters = function () {
    /* For each point on a line segment the following equation holds: point_1 +
     * t*(point_2 - point_1). The points on the segment have t between 0 and 1,
     * for t outside that interval, the point lies only on the line formed by the
     * connection of the two points, not on the segment itself. By using one
     * equation for both x- and y-coordinates, solving for t and than setting the
     * two equations equal, the calculation below for the line parameters can be
     * derived. Cases where the line is parallel to either the x- or y-axis have
     * to be treated specially (as they would to lead to e.g. division by 0) */
    var parameters = [];
    if (this.point1.x.eq(this.point2.x)) {
        parameters[0] = 1.0;
        parameters[1] = 0.0;
        parameters[2] = this.point1.x.dup().neg().toFloat();
    } else if (this.point1.y.eq(this.point2.y)) {
        parameters[0] = 0.0;
        parameters[1] = 1.0;
        parameters[2] = this.point1.y.dup().neg().toFloat();
    } else {
        /* Comes from line equations using points -> solve for t, set equal */
        var direction = this.direction();
        parameters[0] = direction.toFloatX() / direction.toFloatY();
        parameters[1] = -1.0;
        parameters[2] = this.point2.determinant(this.point1).toFloat()
        / direction.toFloatX();
    }
    return parameters;
};

/* Comparison - equality of two line segments */
LineSegment.prototype.eq = function (other) {
    return (this.point1.eq(other.point1) && this.point2.eq(other.point2)) ||
        (this.point2.eq(other.point1) && this.point1.eq(other.point2));
};

/* Comparison for sorting such that the segment with a point with the lowest x-
 * and y-coordinate comes before (return of -1 is this should be before other, 0
 * for equal segments and +1 if this
 */
LineSegment.prototype.compare = function (other) {
    var point1Compare = this.point1.compare(other.point1);
    var point2Compare = this.point2.compare(other.point2);
    if (point1Compare === 'undefined' || point2Compare === 'undefined') {
        console.log("Comparison between the segments is not possible!");
        return;
    }
    if (point1Compare != 0) {
        return point1Compare;
    } else {
        return point2Compare;
    }
};

var compareLineSegments = function (segmentA, segmentB) {
    return segmentA.compare(segmentB);
};

/* Returns an array of LineSegments, created from this lineSegment when it is split
 * at the given splitPoints (given as an array)
 */
LineSegment.prototype.split = function (splitPoints) {
    /* If no points are given, return this segment in an array*/
    if (splitPoints.length === 0) {
        return [this];
    }
    /* Sort points along segment */
    splitPoints = splitPoints.sort(comparePoints);
    /* Create new segments - staring from the first point of this segment, all
     * following segments go from the last process point to the next split point */
    var segments = [];
    segments[0] = new LineSegment(this.point1, splitPoints[0]);
    var i;
    for (i = 1; i < splitPoints.length; i++) {
        segments[i] = new LineSegment(splitPoints[i - 1], splitPoints[i]);
    }
    segments[i] = new LineSegment(splitPoints[i - 1], this.point2);
    return segments;
};

/* Calculates the parameter for the projection of the given point onto the line
 * formed by the two points in this line segment (projected_point = point_1 +
 * t*(point_2 - point_1), t is calculated) */
LineSegment.prototype.projectedParameter = function (point) {
    if (this.point1.eq(this.point2)) {
        return 1;
    }
    /* Projection of point onto line is the same as projection of the vector start
     * to point onto the direction vector. This projection vector p is parallel
     * to the direction vector (thus just a scaled version of it) => p = s *
     * normalized_direction. s is equal to the length of the vector to project
     * times the cos of the angle the two vectors enclose. This again is equal
     * to the dot product of the vector to project and the normalized other vector,
     * leading to the calculation below */
    var startToPoint = point.dup().subtract(this.point1);
    var direction = this.direction();
    var parameter = startToPoint.dotProduct(direction).toFloat()
        / (direction.dotProduct(direction)).toFloat();
    return parameter;
};

/* Returns true if the given point is on the segment, but is not equal to either
 * of the endpoints */
LineSegment.prototype.onSegment = function (point) {
    if (point.eq(this.point1) || point.eq(this.point2) || this.point1.eq(this.point2)) {
        return false;
    }
    /* Calculate twice the area of the triangle of the two segment points and the
     * given point, if the area is 0, the three points are collinear */
    if (relativeOrientation(this.point1, this.point2, point) === 0) {
        var parameter = this.projectedParameter(point);
        /* Check if parameter is so that the point lies within the two segment points */
        if (parameter >= 0 && parameter <= 1) {
            return true;
        } else {
            return false;
        }
    }
    return false;
};

/* Returns true if the given point is on the segment, but is not equal to either
 * of the endpoints */
LineSegment.prototype.onSegmentIncludingEndpoints = function (point) {
    if (point.eq(this.point1) || point.eq(this.point2) || this.point1.eq(this.point2)) {
        return true;
    }
    /* Calculate twice the area of the triangle of the two segment points and the
     * given point, if the area is 0, the three points are collinear */
    if (relativeOrientation(this.point1, this.point2, point) === 0) {
        var parameter = this.projectedParameter(point);
        /* Check if parameter is so that the point lies within the two segment points */
        if (parameter >= 0 && parameter <= 1) {
            return true;
        } else {
            return false;
        }
    }
    return false;
};

LineSegment.prototype.intersectsOrientations = function (other) {
    /* Find the four relative orientations for all combinations of one line segments
     * and one point from the respective other line segment */
    var orient1 = relativeOrientation(this.point1, this.point2, other.point1);
    var orient2 = relativeOrientation(this.point1, this.point2, other.point2);
    var orient3 = relativeOrientation(other.point1, other.point2, this.point1);
    var orient4 = relativeOrientation(other.point1, other.point2, this.point2);
    /* The lines intersect if the points from one line segments do not lie on the
     * same side of the other line segment (and the other way around) */
    if (orient1 != orient2 && orient3 != orient4) {
        return true;
    } else {
        return false;
    }
};

/* Returns true if the this segment and the other segment intersect in exactly one
 * point but none of the endpoints are equal */
LineSegment.prototype.intersectsIncludingSegment = function (other) {
    if (this.point1.eq(other.point1) || this.point2.eq(other.point1)
        || this.point1.eq(other.point2) || this.point2.eq(other.point2)) {
        return false;
    }
    return this.intersectsOrientations(other);
};

/* Returns true if the this segment and the other segment intersect in exactly one
 * point which is not equal to either of the endpoints of either segment */
LineSegment.prototype.intersects = function (other) {
    /* First check if any of the endpoints are contained in the respective other
     * segment */
    if (this.onSegmentIncludingEndpoints(other.point1) || this.onSegmentIncludingEndpoints(other.point2) ||
        other.onSegmentIncludingEndpoints(this.point1) || other.onSegmentIncludingEndpoints(this.point2)) {
        return false;
    }
    return this.intersectsOrientations(other);
};

/* Returns the angle between two lineSegments if they have an endpoint in common */
LineSegment.prototype.angleTo = function (other) {
    /* Find common endpoint and calculate direction vectors from the common point
     * to two other points */
    var thisDirection;
    var otherDirection;
    if (this.point1.eq(other.point1)) {
        thisDirection = this.direction();
        otherDirection = other.direction();
    } else if (this.point1.eq(other.point2)) {
        thisDirection = this.direction();
        otherDirection = other.direction().scale(-1);
    } else if (this.point2.eq(other.point1)) {
        thisDirection = this.direction().scale(-1);
        otherDirection = other.direction();
    } else if (this.point2.eq(other.point2)) {
        thisDirection = this.direction().scale(-1);
        otherDirection = other.direction().scale(-1);
    } else {
        /* No common point */
        return;
    }
    /* Angle between those is Angle between the segments */
    return thisDirection.angleTo(otherDirection);
};
