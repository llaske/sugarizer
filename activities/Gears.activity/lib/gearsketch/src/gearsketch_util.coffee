# By Frank Leenaars
# University of Twente - Department of Instructional Technology
# Licensed under the MIT license
"use strict"

window.gearsketch = {}

# ---------------------------
# ---------- Point ----------
# ---------------------------
class Point
  constructor: (@x, @y) ->

  plus: (p) ->
    new Point(@x + p.x, @y + p.y)

  minus: (p) ->
    new Point(@x - p.x, @y - p.y)

  times: (n) ->
    new Point(n * @x, n * @y)

  distance: (p) ->
    Math.sqrt(Math.pow(@x - p.x, 2) + Math.pow(@y - p.y, 2))

  cross: (p) ->
    @x * p.y - @y * p.x

  clone: ->
    new Point(@x, @y)

  @polar: (theta, r) ->
    new Point(r * Math.cos(theta), r * Math.sin(theta))

  @fromObject: (obj) ->
    new Point(obj.x, obj.y)

window.gearsketch.Point = Point

# ---------------------------
# ------- ArcSegment --------
# ---------------------------
# Note: ArcSegment should be considered immutable, because @start and @end are
# calculated on construction, but not updated on change
class ArcSegment
  constructor: (@center, @radius, @startAngle, @endAngle, @direction) ->
    @start = @pointOnCircle(startAngle)
    @end = @pointOnCircle(endAngle)

  getLength: ->
    angle = if @direction is Util.Direction.CLOCKWISE
      Util.mod(@endAngle - @startAngle, 2 * Math.PI)
    else
      Util.mod(@startAngle - @endAngle, 2 * Math.PI)
    angle * @radius

  findPoint: (distanceToGo) ->
    angleToGo = distanceToGo / @radius
    angle = @startAngle + (if @direction is Util.Direction.CLOCKWISE then angleToGo else -angleToGo)
    @center.plus(Point.polar(angle, @radius))

  pointOnCircle: (angle) ->
    @center.plus(Point.polar(angle, @radius))

  containsAngle: (angle) ->
    if @direction is Util.Direction.CLOCKWISE
      Util.mod(@endAngle - @startAngle, 2 * Math.PI) > Util.mod(angle - @startAngle, 2 * Math.PI)
    else
      Util.mod(@startAngle - @endAngle, 2 * Math.PI) > Util.mod(@startAngle - angle, 2 * Math.PI)

  distanceToPoint: (point) ->
    angle = Math.atan2(point.y - @center.y, point.x - @center.x)
    if @containsAngle(angle)
      Math.abs(point.distance(@center) - @radius)
    else
      Math.min(point.distance(@start), point.distance(@end))

  intersectsLineSegment: (lineSegment) ->
    # check if circle intersects line
    # http://mathworld.wolfram.com/Circle-LineIntersection.html
    p1 = lineSegment.start.minus(@center)
    p2 = lineSegment.end.minus(@center)
    dx = p2.x - p1.x
    dy = p2.y - p1.y
    dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
    if dr is 0
      return false
    d = p1.x * p2.y - p2.x * p1.y
    discriminant = Math.pow(@radius, 2) * Math.pow(dr, 2) - Math.pow(d, 2)
    if discriminant < 0
      false
    else
      i1x = (d * dy + Util.sign(dy) * dx * Math.sqrt(discriminant)) / Math.pow(dr, 2)
      i1y = (-d * dx + Math.abs(dy) * Math.sqrt(discriminant)) / Math.pow(dr, 2)
      i1 = new Point(i1x, i1y).plus(@center)
      if lineSegment.distanceToPoint(i1) < Util.EPSILON and @distanceToPoint(i1) < Util.EPSILON
        return true
      i2x = (d * dy - Util.sign(dy) * dx * Math.sqrt(discriminant)) / Math.pow(dr, 2)
      i2y = (-d * dx - Math.abs(dy) * Math.sqrt(discriminant)) / Math.pow(dr, 2)
      i2 = new Point(i2x, i2y).plus(@center)
      if lineSegment.distanceToPoint(i2) < Util.EPSILON and @distanceToPoint(i2) < Util.EPSILON
        return true
      false

  # TODO: fix algorithms (current implementation works for current usage, but is incorrect)
  distanceToSegment: (segment) ->
    if segment instanceof ArcSegment
      if @center.distance(segment.center) > Util.EPSILON
        angle1 = Math.atan2(segment.center.y - @center.y, segment.center.x - @center.x)
        angle2 = Util.mod(angle1 + Math.PI, 2 * Math.PI)
        if @containsAngle(angle1) and segment.containsAngle(angle2)
          centerDistance = @center.distance(segment.center)
          return Math.max(0, centerDistance - @radius - segment.radius)
      Math.min(@distanceToPoint(segment.start)
      , @distanceToPoint(segment.end)
      , segment.distanceToPoint(@start)
      , segment.distanceToPoint(@end))
    else # segment is LineSegment
      if @intersectsLineSegment(segment)
        0
      else
        pointNearestToCenter = segment.findNearestPoint(@center)
        Math.min(@distanceToPoint(pointNearestToCenter)
        , @distanceToPoint(segment.start)
        , @distanceToPoint(segment.end)
        , segment.distanceToPoint(@start)
        , segment.distanceToPoint(@end))

  clone: ->
    new ArcSegment(@center.clone(), @radius, @startAngle, @endAngle, @direction)

  @fromObject: (obj) ->
    new ArcSegment(Point.fromObject(obj.center), obj.radius, obj.startAngle, obj.endAngle, obj.direction)

window.gearsketch.ArcSegment = ArcSegment

# ---------------------------
# ------- LineSegment -------
# ---------------------------
class LineSegment
  constructor: (@start, @end) ->

  getLength: ->
    @start.distance(@end)

  findPoint: (distanceToGo) ->
    fraction = distanceToGo / @start.distance(@end)
    @start.plus(@end.minus(@start).times(fraction))

  # http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
  findNearestPoint: (p) ->
    segmentLength = @getLength()
    if segmentLength is 0
      @start
    else
      t = ((p.x - @start.x) * (@end.x - @start.x) + (p.y - @start.y) * (@end.y - @start.y)) / Math.pow(segmentLength, 2)
      if t < 0
        @start
      else if t > 1
        @end
      else
        @start.plus(@end.minus(@start).times(t))

  distanceToPoint: (point) ->
    point.distance(@findNearestPoint(point))

  # http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
  findIntersection: (lineSegment) ->
    p = @start
    r = @end.minus(p)
    q = lineSegment.start
    s = lineSegment.end.minus(q)
    crossRS = r.cross(s)
    t = q.minus(p).cross(s) / crossRS
    u = q.minus(p).cross(r) / crossRS
    if Math.abs(crossRS) > Util.EPSILON and 0 <= t and t <= 1 and 0 <= u and u <= 1
      p.plus(r.times(t))
    else
      null

  distanceToSegment: (segment) ->
    if segment instanceof LineSegment
      if @findIntersection(segment)
        0
      else
        Math.min(
          @distanceToPoint(segment.start)
        , @distanceToPoint(segment.end)
        , segment.distanceToPoint(@start)
        , segment.distanceToPoint(@end))
    else # segment is ArcSegment
      segment.distanceToSegment(this)

  clone: ->
    new LineSegment(@start.clone(), @end.clone())

  @fromObject: (obj) ->
    new LineSegment(Point.fromObject(obj.start), Point.fromObject(obj.end))

window.gearsketch.LineSegment = LineSegment

# ---------------------------
# ---------- Util -----------
# ---------------------------
class Util
  # imports
  Point = window.gearsketch.Point

  # -- constants --
  @MODULE: 6
  @AXIS_RADIUS: 1.5 * @MODULE
  @MIN_STACKED_GEARS_TEETH_DIFFERENCE: 4
  @SNAPPING_DISTANCE: 2 * @MODULE
  @EPSILON: 0.000001

  # -- enums --
  @Direction:
    CLOCKWISE: "clockwise"
    COUNTER_CLOCKWISE: "counterclockwise"

  @Side:
    LEFT: "left"
    RIGHT: "right"

  # http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
  @clone: (obj) ->
    if !obj? or (typeof obj isnt "object")
      return obj

    knownClasses = ["Point", "Gear", "ArcSegment", "LineSegment", "Chain"]
    if obj.constructor.name in knownClasses
      return obj.clone()

    if obj instanceof Array
      copy = []
      for i in [0...obj.length]
        copy[i] = @clone(obj[i])
      return copy

    if obj instanceof Object
      copy = {}
      for own key of obj
        copy[key] = @clone(obj[key])
      return copy

    throw new Error("Unable to clone object. Its type is not supported.")

  # http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
  @createUUID: ->
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) ->
      r = Math.random() * 16 | 0
      v = if c is "x" then r else (r & 0x3 | 0x8)
      v.toString(16))

  @mod: (a, b) ->
    (a % b + b) % b

  @sign: (x) ->
    if x < 0 then -1 else 1

  @addAll: (set, elements) ->
    for element in elements
      set[element] = true
    set

  @makeSetFromList: (elements) ->
    @addAll({}, elements)

  @makeSet: (elements...) ->
    @makeSetFromList(elements)

  # find the point on the path at the given distance from its start
  @findPointOnPath: (path, distance) ->
    distanceToGo = distance
    i = 0
    numberOfPoints = path.length
    while distanceToGo > 0
      j = (i + 1) % numberOfPoints
      segment = new LineSegment(path[i], path[j])
      segmentLength = segment.getLength()
      if distanceToGo <= segmentLength
        return segment.findPoint(distanceToGo)
      else
        i = j
        distanceToGo -= segmentLength
    return null

  @getLength: (path, isPathClosed = true) ->
    length = 0
    numberOfPoints = path.length
    finalIndex = numberOfPoints - (if isPathClosed then 0 else 1)
    for i in [0...finalIndex]
      j = (i + 1) % numberOfPoints
      length += path[i].distance(path[j])
    length

  # http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  @isPointInsidePolygon: (point, polygon) ->
    isPointInPolygon = false
    x = point.x
    y = point.y
    numberOfVertices = polygon.length
    j = numberOfVertices - 1
    for i in [0...numberOfVertices]
      pix = polygon[i].x
      piy = polygon[i].y
      pjx = polygon[j].x
      pjy = polygon[j].y
      if ((piy > y) isnt (pjy > y)) and (x < ((pjx - pix) * (y - piy) / (pjy - piy) + pix))
        isPointInPolygon = !isPointInPolygon
      j = i
    isPointInPolygon

  @isGearInsidePolygon: (gear, polygon) ->
    edgePointAtAngle = (angle) ->
      gear.location.plus(Point.polar(angle, gear.innerRadius))
    edgePoints = (edgePointAtAngle(0.25 * Math.PI * i) for i in [0...8])
    edgePoints.every((p) => @isPointInsidePolygon(p, polygon))

  @findGearsInsidePolygon: (polygon, gears) ->
    gear for own id, gear of gears when @isGearInsidePolygon(gear, polygon)

  @doesGearIntersectLineSegment: (gear, segment) ->
    segment.distanceToPoint(gear.location) < (gear.pitchRadius + Util.EPSILON)

  @findGearsIntersectingSegment: (gears, segment) ->
    gear for own id, gear of gears when @doesGearIntersectLineSegment(gear, segment)

  @pointPathDistance: (point, path, isPathClosed = true) ->
    # using points instead of segments
    distance = Number.MAX_VALUE
    numberOfPoints = path.length
    finalIndex = numberOfPoints - (if isPathClosed then 0 else 1)
    for i in [0...finalIndex]
      j = (i + 1) % numberOfPoints
      segment = new LineSegment(path[i], path[j])
      d = Math.max(0, segment.distanceToPoint(point))
      distance = Math.min(distance, d)
    distance

  # return gear nearest to lineSegment.start that intersects lineSegment or null if no such gear exists
  # if ignoredGears is specified, these gears will never be returned
  @findNearestIntersectingGear: (gears, lineSegment, ignoredGearIds = {}) ->
    intersectingGears = @findGearsIntersectingSegment(gears, lineSegment)
    intersectingGears.sort((g1, g2) =>
      g1.distanceToPoint(lineSegment.start) - g2.distanceToPoint(lineSegment.start))
    for intersectingGear in intersectingGears
      unless intersectingGear.id of ignoredGearIds
        return intersectingGear
    null

  # http://stackoverflow.com/questions/451426/how-do-i-calculate-the-surface-area-of-a-2d-polygon
  @findDirection: (polygon) ->
    numberOfPoints = polygon.length
    doubleArea = 0
    for i in [0...numberOfPoints]
      j = (i + 1) % numberOfPoints
      doubleArea += polygon[i].x * polygon[j].y
      doubleArea -= polygon[i].y * polygon[j].x
    if doubleArea > 0
      @Direction.CLOCKWISE
    else
      @Direction.COUNTER_CLOCKWISE

  # get the two tangent points on a circle with center c and radius r from a given point p
  # tangent points are only valid if |pc| > r
  @findTangentPoints: (p, c, r) ->
    tangentPoints = {}
    d = p.distance(c)
    if Math.abs(d - r) < Util.EPSILON # p on circle
      tangentPoints[@Side.RIGHT] = p.clone()
      tangentPoints[@Side.LEFT] = p.clone()
    else
      l = Math.sqrt(d * d - r * r)
      alpha = Math.atan2(c.y - p.y, c.x - p.x)
      beta = Math.asin(r / d)
      tangentPoints[@Side.RIGHT] = p.plus(Point.polar(alpha + beta, l))
      tangentPoints[@Side.LEFT] = p.plus(Point.polar(alpha - beta, l))
    tangentPoints

  @findGearTangentPoints: (p, gear) ->
    @findTangentPoints(p, gear.location, gear.pitchRadius)

  # http://en.wikipedia.org/wiki/Tangent_lines_to_circles
  @findExternalTangents: (centers, radii) ->
    largest = if radii[0] >= radii[1] then 0 else 1
    o1 = centers[largest]
    o2 = centers[1 - largest]
    r1 = radii[largest]
    r2 = radii[1 - largest]
    r3 = r1 - r2
    if r3 is 0
      tangentPoints = {}
      tangentPoints[@Side.LEFT] = o1
      tangentPoints[@Side.RIGHT] = o1
      angle = Math.atan2(o2.y - o1.y, o2.x - o1.x)
      offset1 = Point.polar(angle + 0.5 * Math.PI, r1)
      offset2 = Point.polar(angle - 0.5 * Math.PI, r1)
    else
      tangentPoints = @findTangentPoints(o2, o1, r3)
      ratio = r2 / r3
      tpl = tangentPoints[@Side.LEFT]
      tpr = tangentPoints[@Side.RIGHT]
      offset1 = tpl.minus(o1).times(ratio)
      offset2 = tpr.minus(o1).times(ratio)
    tangentLine1 = [tangentPoints[@Side.LEFT].plus(offset1), o2.plus(offset1)]
    tangentLine2 = [tangentPoints[@Side.RIGHT].plus(offset2), o2.plus(offset2)]
    tangentLines = {}
    if o1 is centers[0]
      tangentLines[@Side.RIGHT] = new LineSegment(tangentLine1[0], tangentLine1[1])
      tangentLines[@Side.LEFT] = new LineSegment(tangentLine2[0], tangentLine2[1])
    else
      tangentLines[@Side.RIGHT] = new LineSegment(tangentLine2[1], tangentLine2[0])
      tangentLines[@Side.LEFT] = new LineSegment(tangentLine1[1], tangentLine1[0])
    tangentLines

  # http://en.wikipedia.org/wiki/Tangent_lines_to_circles
  @findInternalTangents: (centers, radii) ->
    largest = if radii[0] >= radii[1] then 0 else 1
    o1 = centers[largest]
    o2 = centers[1 - largest]
    r1 = radii[largest]
    r2 = radii[1 - largest]
    r3 = r1 + r2
    tangentPoints = @findTangentPoints(o2, o1, r3)
    ratio = r2 / r3
    tpl = tangentPoints[@Side.LEFT]
    tpr = tangentPoints[@Side.RIGHT]
    offset1 = o1.minus(tpl).times(ratio)
    offset2 = o1.minus(tpr).times(ratio)
    tangentLine1 = [tpl.plus(offset1), o2.plus(offset1)]
    tangentLine2 = [tpr.plus(offset2), o2.plus(offset2)]
    tangentLines = {}
    if o1 is centers[0]
      tangentLines[@Side.RIGHT] = new LineSegment(tangentLine1[0], tangentLine1[1])
      tangentLines[@Side.LEFT] = new LineSegment(tangentLine2[0], tangentLine2[1])
    else
      tangentLines[@Side.RIGHT] = new LineSegment(tangentLine1[1], tangentLine1[0])
      tangentLines[@Side.LEFT] = new LineSegment(tangentLine2[1], tangentLine2[0])
    tangentLines

  @findExternalTangentsOfGears: (gear1, gear2) ->
    @findExternalTangents([gear1.location, gear2.location], [gear1.pitchRadius, gear2.pitchRadius])

  @findInternalTangentsOfGears: (gear1, gear2) ->
    @findInternalTangents([gear1.location, gear2.location], [gear1.pitchRadius, gear2.pitchRadius])

  @findTangentLine: (gear1, gear2, innerGearIds, direction) ->
    gear1isInnerGear = (gear1.id of innerGearIds)
    if gear1isInnerGear is (direction is @Direction.CLOCKWISE)
      side = @Side.LEFT
    else
      side = @Side.RIGHT
    if gear1isInnerGear is (gear2.id of innerGearIds)
      @findExternalTangentsOfGears(gear1, gear2)[side]
    else
      @findInternalTangentsOfGears(gear1, gear2)[side]

  @findAllSimplePathsForNodes: (turningObjects, goalNode, nodesVisited) ->
    paths = []
    currentNode = nodesVisited[nodesVisited.length - 1]
    for own neighborId of currentNode.connections
      neighbor = turningObjects[neighborId]
      unless neighbor in nodesVisited
        updatedNodesVisited = nodesVisited.slice(0)
        updatedNodesVisited.push(neighbor)
        if neighbor is goalNode
          paths.push(updatedNodesVisited)
        else
          paths = paths.concat(@findAllSimplePathsForNodes(turningObjects, goalNode, updatedNodesVisited))
    return paths

  @findAllSimplePathsBetweenNeighbors: (turningObjects) ->
    paths = []
    nodes = (turningObject for own id, turningObject of turningObjects)
    if nodes.length < 2
      return []
    for i in [0...nodes.length - 1]
      for j in [(i + 1)...nodes.length]
        if nodes[i].connections[nodes[j].id]?
          paths = paths.concat(@findAllSimplePathsForNodes(turningObjects, nodes[j], [nodes[i]]))
    for i in [0...paths.length]
      paths.push(paths[i].slice(0).reverse())
    paths

  @sendGetRequest: (url) ->
    request = new XMLHttpRequest()
    request.open("GET", url, false)
    request.send(null)
    request.responseText

  @sendPostRequest: (data, url, callback) ->
    request = new XMLHttpRequest()
    request.open("POST", url, true)
    request.setRequestHeader("Content-type", "application/json; charset=UTF-8")
    request.onload = callback
    request.send(data)

window.gearsketch.Util = Util

# requestAnimationFrame polyfill
# http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
do ->
  lastTime = 0
  vendors = ["ms", "moz", "webkit", "o"]
  for vendor in vendors when !window.requestAnimationFrame
    window.requestAnimationFrame = window[vendor + "RequestAnimationFrame"]
    window.cancelAnimationFrame = window[vendor + "CancelAnimationFrame"] or
    window[vendor + "CancelRequestAnimationFrame"]

  if !window.requestAnimationFrame
    window.requestAnimationFrame = (callback) ->
      currTime = new Date().getTime()
      timeToCall = Math.max(0, 16 - (currTime - lastTime))
      id = window.setTimeout((->
        callback(currTime + timeToCall)
      ), timeToCall)
      lastTime = currTime + timeToCall
      id

  if !window.cancelAnimationFrame
    window.cancelAnimationFrame = (id) ->
      clearTimeout(id)

# Function.name support for IE
# http://matt.scharley.me/2012/03/09/monkey-patch-name-ie.html
do ->
  if !Function.prototype.name? and Object.defineProperty?
    Object.defineProperty(Function.prototype, "name",
      get: ->
        funcNameRegex = /function\s([^(]{1,})\(/
        results = (funcNameRegex).exec((this).toString())
        if (results? and results.length > 1) then results[1].trim() else ""
      set: (value) ->
    )
