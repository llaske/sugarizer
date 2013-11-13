# By Frank Leenaars
# University of Twente - Department of Instructional Technology
# Licensed under the MIT license
"use strict"

# imports
Point = window.gearsketch.Point
ArcSegment = window.gearsketch.ArcSegment
LineSegment = window.gearsketch.LineSegment
Util = window.gearsketch.Util

window.gearsketch.model = {}

# ---------------------------
# ---------- Gear -----------
# ---------------------------
class Gear
  constructor: (@location, @rotation, @numberOfTeeth, @id,
                @momentum = 0, @group = 0, @level = 0, @connections = {}) ->
    @id ?= Util.createUUID()
    @pitchRadius = Util.MODULE * (0.5 * @numberOfTeeth)
    @innerRadius = Util.MODULE * (0.5 * @numberOfTeeth - 1.25)
    @outerRadius = Util.MODULE * (0.5 * @numberOfTeeth + 1)

  getCircumference: ->
    2 * Math.PI * @pitchRadius

  distanceToPoint: (point) ->
    Math.max(0, @location.distance(point) - @pitchRadius)

  edgeDistance: (gear) ->
    axisDistance = @location.distance(gear.location)
    Math.abs(axisDistance - @pitchRadius - gear.pitchRadius)

  restore: (gear) ->
    @location = gear.location
    @rotation = gear.rotation
    @momentum = gear.momentum
    @group = gear.group
    @level = gear.level
    @connections = gear.connections

  clone: ->
    new Gear(@location.clone(), @rotation, @numberOfTeeth, @id,
      @momentum, @group, @level, Util.clone(@connections))

  @fromObject: (obj) ->
    new Gear(Point.fromObject(obj.location), obj.rotation, obj.numberOfTeeth, obj.id,
      obj.momentum, obj.group, obj.level, obj.connections)

window.gearsketch.model.Gear = Gear

# ---------------------------
# ---------- Chain ----------
# ---------------------------
class Chain
  @WIDTH: 8

  points: []
  segments: []

  constructor: (stroke, @id, @group = 0, @level = 0, @connections = {}) ->
    @id ?= Util.createUUID()
    @points = Util.clone(stroke)
    @rotation = 0

  getLength: ->
    @segments.reduce(((total, segment) -> total + segment.getLength()), 0)

  getCircumference: ->
    @getLength()

  # rotation of the chain is always expressed clockwise
  getStartingPoint: ->
    if @direction is Util.Direction.CLOCKWISE
      @rotation / (2 * Math.PI) * @getLength()
    else
      -@rotation / (2 * Math.PI) * @getLength()

  findPointOnChain: (distance) ->
    length = @getLength()
    distanceToGo = Util.mod(distance + @getStartingPoint(), length)
    for segment in @segments
      segmentLength = segment.getLength()
      if distanceToGo < segmentLength
        return segment.findPoint(distanceToGo)
      else
        distanceToGo -= segmentLength
    null

  findPointsOnChain: (numberOfPoints) ->
    delta = @getLength() / numberOfPoints
    @findPointOnChain(p * delta) for p in [0...numberOfPoints]

  distanceToPoint: (point) ->
    Math.min.apply(null, (segment.distanceToPoint(point) for segment in @segments))

  distanceToSegment: (s) ->
    Math.min.apply(null, (segment.distanceToSegment(s) for segment in @segments))

  distanceToChain: (chain) ->
    Math.min.apply(null, (chain.distanceToSegment(segment) for segment in @segments))

  intersectsPath: (path) ->
    for i in [0...path.length - 1]
      j = i + 1
      if @distanceToSegment(new LineSegment(path[i], path[j])) is 0
        return true
    false

  crossesNonSupportingGears: (board) ->
    for own id, gear of board.getGears()
      if !(id in @supportingGearIds) and !(id of @ignoredGearIds)
        if @distanceToPoint(gear.location) < gear.pitchRadius + Util.EPSILON
          return true
    return false

  # get the incoming or outgoing tangent point on the gear in @supportingGearIds with the given gearIndex
  findPointOnSupportingGear: (gearIndex, incoming) ->
    if incoming
      @points[Util.mod(2 * gearIndex - 1, @points.length)]
    else
      @points[2 * gearIndex]

  removeGear: (gear, board) ->
    while (index = @supportingGearIds.indexOf(gear.id)) isnt -1
      gears = board.getGearsWithIds(@supportingGearIds) # gear to remove will be undefined
      numberOfGears = gears.length
      beforeIndex = Util.mod((index - 1), numberOfGears)
      beforeGear = gears[beforeIndex]
      afterIndex = Util.mod((index + 1), numberOfGears)
      acknowledgedGears = board.getAcknowledgedGears(@ignoredGearIds)
      path = [
        @findPointOnSupportingGear(index, true)
        @findPointOnSupportingGear(index, false)
        @findPointOnSupportingGear(afterIndex, true)
      ]
      replacementGears = @findSupportingGearsOnPath(acknowledgedGears, beforeGear, path, 0, false)
      gears.splice.apply(gears, [index, 1].concat(replacementGears))
      @removeRepeatedGears(gears)
      @supportingGearIds = (g.id for g in gears)
    return @update(board)

  findChainTangentSide: (gear) ->
    if (@direction is Util.Direction.CLOCKWISE) is (gear.id of @innerGearIds)
      Util.Side.LEFT
    else
      Util.Side.RIGHT

  findReverseChainTangentSide: (gear) ->
    if @findChainTangentSide(gear) is Util.Side.LEFT
      Util.Side.RIGHT
    else
      Util.Side.LEFT

  findFirstSupportingGearOnPath: (path, gears) ->
    stepSize = 10
    pathLength = Util.getLength(path)
    supportingGear = null
    a = path[0]
    d = 0
    while d < pathLength and !supportingGear?
      d += stepSize
      b = Util.findPointOnPath(path, d)
      supportingGear = Util.findNearestIntersectingGear(gears, new LineSegment(a, b))
    [supportingGear, d]

  findSupportingGearsOnPath: (gears, firstSupportingGear, path, startDistance = 0, isClosed = true) ->
    stepSize = 10
    pathLength = Util.getLength(path, isClosed)
    supportingGear = firstSupportingGear
    supportingGears = []
    a = firstSupportingGear.location
    d = startDistance
    while d < pathLength
      d += stepSize
      b = Util.findPointOnPath(path, d)
      tangentSide = @findReverseChainTangentSide(supportingGear)
      tangentPoint = Util.findGearTangentPoints(b, supportingGear)[tangentSide]
      a = tangentPoint if tangentPoint? # in case point b is in gear
      lineSegment = new LineSegment(a, b)
      nextSupportingGear = Util.findNearestIntersectingGear(gears, lineSegment, Util.makeSet(supportingGear.id))
      if nextSupportingGear?
        supportingGear = nextSupportingGear
        supportingGears.push(supportingGear)
    supportingGears

  removeRepeatedGears: (gearsList) ->
    numberOfNoops = 0
    i = 0
    while numberOfNoops < (numberOfGears = gearsList.length)
      j = (i + 1) % numberOfGears
      g1 = gearsList[i]
      g2 = gearsList[j]
      if g1 is g2
        gearsList.splice(j, 1)
        numberOfNoops = 0
      else
        numberOfNoops++
        i = (i + 1) % numberOfGears
    gearsList

  containsSuccessiveOverlappingGears: (gearsList) ->
    numberOfGears = gearsList.length
    for i in [0...numberOfGears]
      j = (i + 1) % numberOfGears
      g1 = gearsList[i]
      g2 = gearsList[j]
      if g1.location.distance(g2.location) < (g1.outerRadius + g2.outerRadius)
        return true
    false

  findSupportingGearIds: (gears) ->
    [firstSupportingGear, startDistance] = @findFirstSupportingGearOnPath(@points, gears)
    supportingGears = [firstSupportingGear]
    nextSupportingGears = @findSupportingGearsOnPath(gears, firstSupportingGear, @points, startDistance)
    supportingGears = supportingGears.concat(nextSupportingGears)
    # if first point is not on first supporting gear, trace path connecting them
    tangentSide = @findChainTangentSide(firstSupportingGear)
    tangentPoint = Util.findGearTangentPoints(@points[0], firstSupportingGear)[tangentSide]
    if tangentPoint?
      finalSegment = [@points[0], tangentPoint]
      lastSupportingGear = supportingGears[supportingGears.length-1]
      nextSupportingGears = @findSupportingGearsOnPath(gears, lastSupportingGear, finalSegment, 0, false)
      supportingGears = supportingGears.concat(nextSupportingGears)
    gear.id for gear in @removeRepeatedGears(supportingGears)

  findIgnoredGearIds: (board) ->
    # find minimal distance of each level of gears in each group to the chain
    gears = board.getGears()
    minDistances = {}
    for own id, gear of gears
      group = gear.group
      level = gear.level
      d = Util.pointPathDistance(gear.location, @points) - gear.pitchRadius
      if !minDistances[group]?[level]? or d < minDistances[group][level]
        minDistances[group] ?= {}
        minDistances[group][level] = d

    # find the one level of each group of gears that is not ignored
    # this is currently the closest, nonoverlapping level, a heuristic that can be further improved
    acknowledgedLevels = {}
    for own group, levels of minDistances
      for own level, distance of levels
        currentLevel = acknowledgedLevels[group]
        if !currentLevel?
          acknowledgedLevels[group] = parseInt(level, 10)
        else if distance > 0
          currentDistance = minDistances[group][currentLevel]
          if currentDistance < 0 or distance < currentDistance
            acknowledgedLevels[group] = parseInt(level, 10)

    # ignore all gears not on an acknowledged level
    ignoredGearIds = {}
    for own id, gear of gears
      if acknowledgedLevels[gear.group] isnt gear.level
        ignoredGearIds[id] = true
    ignoredGearIds

  findIgnoredGearIdsInTightenedChain: (board) ->
    # find groups and levels of the gears in this chain
    # there can be more than one group and level due to recently moved gear
    groups = {}
    for gearId in @supportingGearIds
      gear = board.getGearWithId(gearId)
      group = gear.group
      level = gear.level
      if !groups[group]?
        groups[group] = {}
      groups[group][level] = true

    # ignore all gears that belong to a supporting gear's group but are on a different level
    updatedIgnoredGearIds = {}
    for own id, gear of board.getGears()
      group = gear.group
      level = gear.level
      if groups[group]? and !groups[group][level]?
        updatedIgnoredGearIds[id] = true
    @ignoredGearIds = updatedIgnoredGearIds

  # convert a list of segments to a polygon
  # used for finding gear centers inside a tightened chain
  toPolygon: (segments = @segments)->
    polygon = []
    for segment in segments
      if segment instanceof LineSegment
        polygon.push(segment.start)
      else # ArcSegment
        polygon.push(segment.findPoint(0))
        polygon.push(segment.findPoint(0.5 * segment.getLength()))
    polygon

  update: (board, gears = board.getGearsWithIds(@supportingGearIds)) ->
    if gears.length < 2
      return false

    if @containsSuccessiveOverlappingGears(gears)
      return false

    updatedIgnoredGearIds = @findIgnoredGearIdsInTightenedChain(board)
    acknowledgedGears = board.getAcknowledgedGears(updatedIgnoredGearIds)

    # first: update gear sequence
    i = 0
    while i < (numberOfGears = gears.length)
      j = (i + 1) % numberOfGears
      k = (i + 2) % numberOfGears
      g1 = gears[i]
      g2 = gears[j]
      g3 = gears[k]

      lineSegment1 = Util.findTangentLine(g1, g2, @innerGearIds, @direction)
      lineSegment2 = Util.findTangentLine(g2, g3, @innerGearIds, @direction)
      intersection = lineSegment1.findIntersection(lineSegment2)
      if intersection? # g2 cannot support chain
        tangentSideG1 = @findReverseChainTangentSide(g1)
        tangentPointG1 = Util.findGearTangentPoints(intersection, g1)[tangentSideG1]
        tangentSideG3 = @findChainTangentSide(g3)
        tangentPointG3 = Util.findGearTangentPoints(intersection, g3)[tangentSideG3]
        path = [tangentPointG1, intersection, tangentPointG3]
        replacementGears = @findSupportingGearsOnPath(acknowledgedGears, g1, path, 0, false)
        if g2 in replacementGears # rare bug due to floating point errors
          return false
        gears.splice.apply(gears, [j, 1].concat(replacementGears))
        @removeRepeatedGears(gears)
        return @update(board, gears) # start over
      gear = Util.findNearestIntersectingGear(acknowledgedGears, lineSegment1, Util.makeSet(g1.id, g2.id))
      if gear?
        gears.splice(j, 0, gear)
        if @containsSuccessiveOverlappingGears(gears)
          return false
      i++

    # second: update points & segments
    updatedPoints = []
    for i in [0...numberOfGears]
      j = (i + 1) % numberOfGears
      g1 = gears[i]
      g2 = gears[j]
      tangentLine = Util.findTangentLine(g1, g2, @innerGearIds, @direction)
      updatedPoints.push(tangentLine.start, tangentLine.end)
    updatedSegments = []
    for i in [0...numberOfGears]
      p0 = updatedPoints[2 * i]
      p1 = updatedPoints[2 * i + 1]
      p2 = updatedPoints[2 * ((i + 1) % numberOfGears)]
      gear = gears[(i + 1) % numberOfGears]
      lineSegment = new LineSegment(p0, p1)
      arcStart = Math.atan2(p1.y - gear.location.y, p1.x - gear.location.x)
      arcEnd = Math.atan2(p2.y - gear.location.y, p2.x - gear.location.x)
      direction = if (@direction is Util.Direction.CLOCKWISE) is (gear.id of @innerGearIds)
        Util.Direction.CLOCKWISE
      else
        Util.Direction.COUNTER_CLOCKWISE
      arcSegment = new ArcSegment(gear.location, gear.pitchRadius, arcStart, arcEnd, direction)
      updatedSegments.push(lineSegment, arcSegment)

    # third: check if chain doesn't touch itself
    numberOfSegments = updatedSegments.length
    for i in [0...numberOfSegments - 2]
      for j in [(i + 2)...numberOfSegments]
        if i isnt 0 or j isnt numberOfSegments - 1 # don't compare first and last segments
          s1 = updatedSegments[i]
          s2 = updatedSegments[j]
          if s1.distanceToSegment(s2) < Chain.WIDTH
            # make sure segments are not connected by a very small ArcSegment
            if (i + 2) is j
              middleSegment = updatedSegments[i + 1]
              if (middleSegment instanceof ArcSegment) and (middleSegment.getLength() < 2 * Chain.WIDTH)
                continue
            if ((j + 2) % numberOfSegments) is i # note: not else if, both can be true in chain with 4 segments
              middleSegment = updatedSegments[(j + 1) % numberOfSegments]
              if (middleSegment instanceof ArcSegment) and (middleSegment.getLength() < 2 * Chain.WIDTH)
                continue
            return false

    # fourth: check if no supporting gears have left innergears
    updatedIgnoredGearIds = @findIgnoredGearIdsInTightenedChain(board)
    updatedAcknowledgedGears = board.getAcknowledgedGears(updatedIgnoredGearIds)
    chainPolygon = @toPolygon(updatedSegments)
    updatedInnerGearIds = {}
    for own id, gear of updatedAcknowledgedGears when Util.isPointInsidePolygon(gear.location, chainPolygon)
      updatedInnerGearIds[id] = true
    for own gearId of @innerGearIds
      if !(gearId of updatedInnerGearIds) and (gearId in @supportingGearIds)
        return false

    # fifth: update chain properties
    @points = updatedPoints
    @segments = updatedSegments
    @ignoredGearIds = updatedIgnoredGearIds
    @innerGearIds = updatedInnerGearIds
    @supportingGearIds = (gear.id for gear in gears)
    true

  tighten: (board) ->
    @ignoredGearIds = @findIgnoredGearIds(board)
    acknowledgedGears = board.getAcknowledgedGears(@ignoredGearIds)
    @innerGearIds = Util.makeSetFromList(gear.id for gear in Util.findGearsInsidePolygon(@points, acknowledgedGears))
    if Object.keys(@innerGearIds).length < 2
      return false
    @direction = Util.findDirection(@points)
    @supportingGearIds = @findSupportingGearIds(acknowledgedGears)
    @update(board)

  clone: ->
    copy = new Chain(@points, @id, @group, @level, Util.clone(@connections))
    copy.segments = Util.clone(@segments)
    copy.ignoredGearIds = Util.clone(@ignoredGearIds)
    copy.innerGearIds = Util.clone(@innerGearIds)
    copy.direction = @direction
    copy.supportingGearIds = Util.clone(@supportingGearIds)
    copy

  @fromObject: (obj) ->
    createSegment = (obj) -> if obj.center? then ArcSegment.fromObject(obj) else LineSegment.fromObject(obj)
    points = (new Point(p.x, p.y) for p in obj.points)
    chain = new Chain(points, obj.id, obj.group, obj.level, obj.connections)
    chain.segments = (createSegment(segment) for segment in obj.segments)
    chain.ignoredGearIds = obj.ignoredGearIds
    chain.innerGearIds = obj.innerGearIds
    chain.direction = obj.direction
    chain.supportingGearIds = obj.supportingGearIds
    chain

window.gearsketch.model.Chain = Chain

# ---------------------------
# ---------- Board ----------
# ---------------------------
class Board
  # -- imported constants --
  MODULE = Util.MODULE
  AXIS_RADIUS = Util.AXIS_RADIUS
  MIN_STACKED_GEARS_TEETH_DIFFERENCE = Util.MIN_STACKED_GEARS_TEETH_DIFFERENCE
  SNAPPING_DISTANCE = Util.SNAPPING_DISTANCE
  EPSILON = Util.EPSILON

  ConnectionType = # connections are between two gears or a gear and a chain
    ANY: "any"
    MESHING: "meshing"
    AXIS: "axis"
    CHAIN_INSIDE: "chain_inside"
    CHAIN_OUTSIDE: "chain_outside"

  constructor: (@gears = {}, @chains = {}) ->

  restore: (board) ->
    for own id, gear of @gears
      gear.restore(board.gears[id])
    @chains = board.chains

  restoreAfterDemo: (board) ->
    @gears = board.gears
    @chains = board.chains

  clear: ->
    @gears = {}
    @chains = {}

  getNextGroup: ->
    nextGroup = 0
    for own id, gear of @gears
      nextGroup = Math.max(nextGroup, gear.group + 1)
    nextGroup

  getGears: ->
    @gears

  getGearList: ->
    gear for own id, gear of @gears

  getAcknowledgedGears: (ignoredGearIds) ->
    acknowledgedGears = {}
    acknowledgedGears[id] = gear for own id, gear of @gears when !(id of ignoredGearIds)
    acknowledgedGears

  getLevelScore: (gear) ->
    1000 * gear.group + gear.level

  getGearsSortedByGroupAndLevel: (gears = @getGearList()) ->
    gears.sort((g1, g2) => @getLevelScore(g1) - @getLevelScore(g2))

  removeConnection: (turningObject1, turningObject2) ->
    delete turningObject1.connections[turningObject2.id]
    delete turningObject2.connections[turningObject1.id]

  removeAllConnections: (turningObject) ->
    for own neighborId of turningObject.connections
      neighbor = @getTurningObjects()[neighborId]
      @removeConnection(turningObject, neighbor)
    @updateGroupsAndLevels()

  findNearestAxis: (gear) ->
    nearestAxis = null
    shortestDistance = Number.MAX_VALUE
    for own id, candidate of @gears
      if candidate isnt gear
        distance = gear.location.distance(candidate.location)
        if !nearestAxis or
        distance < (shortestDistance - EPSILON) or
        (distance < (shortestDistance + EPSILON) and
        candidate.numberOfTeeth < nearestAxis.numberOfTeeth)
          nearestAxis = candidate
          shortestDistance = distance
    nearestAxis

  updateGroupsAndLevelsFrom: (turningObjectId, group, level, updatedGroups, updatedLevels) ->
    turningObject = @getTurningObjects()[turningObjectId]
    updatedGroups[turningObjectId] = group
    updatedLevels[turningObjectId] = level
    connections = turningObject.connections
    sameLevelConnectionTypes = [ConnectionType.MESHING, ConnectionType.CHAIN_INSIDE, ConnectionType.CHAIN_OUTSIDE]
    for own neighborId, connectionType of connections
      if !(neighborId of updatedGroups)
        if connectionType in sameLevelConnectionTypes
          @updateGroupsAndLevelsFrom(neighborId, group, level, updatedGroups, updatedLevels)
        else
          gear = @gears[turningObjectId]
          neighbor = @gears[neighborId]
          if gear.numberOfTeeth > neighbor.numberOfTeeth
            @updateGroupsAndLevelsFrom(neighborId, group, level + 1, updatedGroups, updatedLevels)
          else
            @updateGroupsAndLevelsFrom(neighborId, group, level - 1, updatedGroups, updatedLevels)

  updateGroupsAndLevels: ->
    updatedGroups = {}
    updatedLevels = {}
    group = 0
    for own id of @gears # chains are always connected to gears, so will be updated as well
      if !(id of updatedGroups)
        @updateGroupsAndLevelsFrom(id, group, 0, updatedGroups, updatedLevels)
        group++
    for own id, turningObject of @getTurningObjects()
      turningObject.group = updatedGroups[id]
      turningObject.level = updatedLevels[id]
    null

  addConnection: (turningObject1, turningObject2, connectionType) ->
    turningObject1.connections[turningObject2.id] = connectionType
    turningObject2.connections[turningObject1.id] = connectionType
    @updateGroupsAndLevels()

  findMeshingNeighbors: (gear) ->
    meshingNeighbors = []
    for own candidateId, candidate of @gears
      if candidate isnt gear and gear.edgeDistance(candidate) < EPSILON
        if (candidate.group isnt gear.group) or (candidate.level is gear.level)
          meshingNeighbors.push(candidate)
    meshingNeighbors

  findRelativeAlignment: (gear1, gear2) ->
    # shorter names for readability
    p1 = gear1.location
    r1 = gear1.rotation
    p2 = gear2.location
    r2 = gear2.rotation

    # get angles of meshing point and phases at that point
    angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x)
    angle2 = angle1 + Math.PI
    shift1 = Util.mod(angle1 - r1, 2 * Math.PI)
    shift2 = Util.mod(angle2 - r2, 2 * Math.PI)
    toothAngle1 = (2 * Math.PI ) / gear1.numberOfTeeth
    toothAngle2 = (2 * Math.PI) / gear2.numberOfTeeth
    phase1 = (shift1 % toothAngle1) / toothAngle1
    phase2 = (shift2 % toothAngle2) / toothAngle2

    # find (mis)alignment of gear1 relative to gear2
    phaseSum = (phase1 + phase2) % 1
    (phaseSum - 0.25) * toothAngle1

  alignGearTeeth: (rotatingGear, meshingGear) ->
    rotatingGear.rotation += @findRelativeAlignment(rotatingGear, meshingGear)

  areMeshingGearsAligned: (gear1, gear2) ->
    Math.abs(@findRelativeAlignment(gear1, gear2)) < EPSILON

  rotateTurningObjectsFrom: (turningObject, angle, rotatedTurningObjectIds) ->
    unless turningObject.id of rotatedTurningObjectIds
      turningObject.rotation = Util.mod(turningObject.rotation + angle, 2 * Math.PI)
      rotatedTurningObjectIds[turningObject.id] = true

    for own neighborId, connectionType of turningObject.connections
      neighbor = @getTurningObjects()[neighborId]
      unless neighborId of rotatedTurningObjectIds
        ratio = @calculateRatio(turningObject, neighbor, connectionType)
        @rotateTurningObjectsFrom(neighbor, angle * ratio, rotatedTurningObjectIds)

  alignMeshingGears: (gear) ->
    rotatedGearIds = {}
    rotatedGearIds[gear.id] = true
    neighbors = @findMeshingNeighbors(gear)
    for neighbor in neighbors
      @addConnection(gear, neighbor, ConnectionType.MESHING)
      r = neighbor.rotation
      @alignGearTeeth(neighbor, gear)
      angle = neighbor.rotation - r
      rotatedGearIds[neighbor.id] = true
      @rotateTurningObjectsFrom(neighbor, angle, rotatedGearIds)

  connectToAxis: (upperGear, lowerGear) ->
    @addConnection(upperGear, lowerGear, ConnectionType.AXIS)
    upperGear.location = lowerGear.location.clone()
    upperGear.rotation = lowerGear.rotation
    @alignMeshingGears(upperGear)

  findNearestNeighbor: (gear, gearIdsToIgnore = {}) ->
    nearestNeighbor = null
    shortestEdgeDistance = Number.MAX_VALUE
    for own neighborId, neighbor of @gears
      if neighbor isnt gear and !(neighborId of gearIdsToIgnore)
        edgeDistance = gear.edgeDistance(neighbor)
        if edgeDistance < shortestEdgeDistance
          nearestNeighbor = neighbor
          shortestEdgeDistance = edgeDistance
    nearestNeighbor

  connectToOneMeshingGear: (gear, meshingGear) ->
    delta = gear.location.minus(meshingGear.location)
    angle = Math.atan2(delta.y, delta.x)
    gear.location = meshingGear.location.plus(Point.polar(angle, gear.pitchRadius + meshingGear.pitchRadius))
    @alignGearTeeth(gear, meshingGear)
    @addConnection(gear, meshingGear, ConnectionType.MESHING)

  connectToTwoMeshingGears: (gear, meshingGear1, meshingGear2) ->
    # Finding the correct location is finding the intersection of two circles
    # Based on http://paulbourke.net/geometry/circlesphere/
    p0 = meshingGear1.location
    p1 = meshingGear2.location
    r0 = meshingGear1.pitchRadius + gear.pitchRadius
    r1 = meshingGear2.pitchRadius + gear.pitchRadius

    d = p0.distance(p1)

    # check whether meshing gears are close enough to each other and not
    # on top of each other; connect gear to closest meshing gear otherwise
    if r0 + r1 < d or p0.distance(p1) < EPSILON
      if gear.edgeDistance(meshingGear1) < gear.edgeDistance(meshingGear2)
        @connectToOneMeshingGear(gear, meshingGear1)
        return
      else
        @connectToOneMeshingGear(gear, meshingGear2)
        return

    # connect gear to both gears
    a = (r0 * r0 - r1 * r1 + d * d) / (2 * d)
    h = Math.sqrt(r0 * r0 - a * a)

    p2 = p0.plus(p1.minus(p0).times(a / d))
    p3x1 = p2.x + h * (p1.y - p0.y) / d
    p3y1 = p2.y - h * (p1.x - p0.x) / d
    p3x2 = p2.x - h * (p1.y - p0.y) / d
    p3y2 = p2.y + h * (p1.x - p0.x) / d
    p3_1 = new Point(p3x1, p3y1)
    p3_2 = new Point(p3x2, p3y2)

    if gear.location.distance(p3_1) < gear.location.distance(p3_2)
      gear.location = p3_1
    else
      gear.location = p3_2

    # recursively align meshing gears
    # may include other gears besides meshingGear1 and meshingGear2
    @alignMeshingGears(gear)

  doChainsCrossNonSupportingGears: ->
    for own id, chain of @chains
      if chain.crossesNonSupportingGears(this)
        return true
    false

  doChainsCrossEachOther: (c1, c2) ->
    if (c1.group isnt c2.group) or (c1.level is c2.level)
      if c1.distanceToChain(c2) < Chain.WIDTH
        return true
    false

  doesChainCrossAnyOtherChain: (chain) ->
    for own id2, chain2 of @chains
      if chain isnt chain2
        if @doChainsCrossEachOther(chain, chain2)
          return true
    false

  doAnyChainsCrossEachOther: ->
    chainList = (chain for own id, chain of @chains)
    numberOfChains = chainList.length
    if numberOfChains < 2
      return false
    for i in [0...numberOfChains - 1]
      for j in [(i + 1)...numberOfChains]
        c1 = chainList[i]
        c2 = chainList[j]
        if @doChainsCrossEachOther(c1, c2)
          return true
    false

  areAllMeshingGearsAligned: ->
    gears = @getGearList()
    numberOfGears = gears.length
    if numberOfGears < 2
      return true
    for i in [0...numberOfGears - 1]
      for j in [(i + 1)...numberOfGears]
        g1 = gears[i]
        g2 = gears[j]
        if g1.connections[g2.id] is ConnectionType.MESHING
          if !@areMeshingGearsAligned(g1, g2)
            return false
    true

  calculateRatio: (turningObject1, turningObject2, connectionType) ->
    if connectionType is ConnectionType.AXIS
      1
    else if (connectionType is ConnectionType.MESHING) or (connectionType is ConnectionType.CHAIN_OUTSIDE)
      -turningObject1.getCircumference() / turningObject2.getCircumference()
    else # gear inside chain
      turningObject1.getCircumference() / turningObject2.getCircumference()

  calculatePathRatio: (path) ->
    ratio = 1
    pathLength = path.length
    for i in [0...pathLength - 1]
      turningObject1 = path[i]
      turningObject2 = path[i + 1]
      connectionType = turningObject1.connections[turningObject2.id]
      ratio *= @calculateRatio(turningObject1, turningObject2, connectionType)
    ratio

  areConnectionRatiosConsistent: ->
    ratios = {}
    paths = Util.findAllSimplePathsBetweenNeighbors(@getTurningObjects())
    for path in paths
      pathName = "#{path[0].id}-#{path[path.length - 1].id}"
      ratio = @calculatePathRatio(path)
      if !ratios[pathName]?
        ratios[pathName] = ratio
      else
        if Math.abs(ratios[pathName] - ratio) > EPSILON
          return false
    true

  isBoardValid: ->
    for own id1, gear1 of @gears
      group1 = gear1.group
      level1 = gear1.level
      for own id2, gear2 of @gears
        unless gear1 is gear2
          group2 = gear2.group
          level2 = gear2.level
          axisDistance = gear1.location.distance(gear2.location)
          maxOuterRadius = Math.max(gear1.outerRadius, gear2.outerRadius)
          combinedOuterRadius = gear1.outerRadius + gear2.outerRadius
          if axisDistance < EPSILON
            if (group1 isnt group2) or (level1 is level2)
              return false
          else if group1 is group2 and level1 is level2 and !gear1.connections[gear2.id]?
            if axisDistance < combinedOuterRadius
              return false
          else if axisDistance < maxOuterRadius + AXIS_RADIUS
            return false
    !@doChainsCrossNonSupportingGears() and
    !@doAnyChainsCrossEachOther() and
    @areAllMeshingGearsAligned() and
    @areConnectionRatiosConsistent()

  placeGear: (gear, location) ->
    oldBoard = @clone()
    @removeAllConnections(gear)
    gear.location = location.clone()
    nearestAxis = @findNearestAxis(gear)
    if nearestAxis and
    gear.location.distance(nearestAxis.location) < SNAPPING_DISTANCE and
    nearestAxis.numberOfTeeth - gear.numberOfTeeth > MIN_STACKED_GEARS_TEETH_DIFFERENCE
      # connect gear to axis of larger gear
      @connectToAxis(gear, nearestAxis)
    else
      neighbor1 = @findNearestNeighbor(gear)
      if neighbor1 and gear.edgeDistance(neighbor1) < SNAPPING_DISTANCE
        # make gear mesh with one or two neighbors
        neighbor2 = @findNearestNeighbor(gear, Util.makeSet(neighbor1.id))
        if neighbor2 and gear.edgeDistance(neighbor2) < SNAPPING_DISTANCE
          @connectToTwoMeshingGears(gear, neighbor1, neighbor2)
        else
          @connectToOneMeshingGear(gear, neighbor1)

    # update chains
    for own id, chain of @chains
      if chain.update(this)
        @updateChainConnections(chain)
      else
        @restore(oldBoard)
        return false

    # check if board is valid
    if @isBoardValid()
      true
    else
      @restore(oldBoard)
      false

  addGearToChains: (gear) ->
    for own id, chain of @chains
      if Util.isPointInsidePolygon(gear.location, chain.toPolygon())
        chain.innerGearIds[gear.id] = true

  removeGearFromChains: (gear) ->
    for own id, chain of @chains
      if !chain.removeGear(gear, this) or @doesChainCrossAnyOtherChain(chain)
        @removeChain(chain)
      else
        @updateChainConnections(chain)

  addGear: (gear) ->
    oldBoard = @clone()
    gear.group = @getNextGroup()
    @gears[gear.id] = gear
    @addGearToChains(gear)
    if !@placeGear(gear, gear.location)
      @removeGear(gear)
      @restore(oldBoard)
      false
    else
      true

  removeGear: (gear) ->
    @removeAllConnections(gear)
    delete @gears[gear.id]
    @removeGearFromChains(gear)

  getGearAt: (location, candidates = @gears) ->
    gear = null
    for own id, candidate of candidates
      distance = location.distance(candidate.location)
      if distance < candidate.outerRadius
        if !gear or candidate.numberOfTeeth < gear.numberOfTeeth
          gear = candidate
    gear

  isTopLevelGear: (gear) ->
    for own id, connectionType of gear.connections
      if connectionType is ConnectionType.AXIS and @gears[id].level > gear.level
        return false
    true

  getTopLevelGears: ->
    topLevelGears = {}
    topLevelGears[id] = gear for own id, gear of @gears when @isTopLevelGear(gear)
    topLevelGears

  getTopLevelGearAt: (location) ->
    @getGearAt(location, @getTopLevelGears())

  getGearWithId: (id) ->
    @gears[id]

  getGearsWithIds: (ids) ->
    @gears[id] for id in ids

  rotateAllTurningObjects: (delta) ->
    for own id, gear of @gears
      if gear.momentum
        angle = gear.momentum * (delta / 1000)
        @rotateTurningObjectsFrom(gear, angle, {})

  addChainConnections: (chain) ->
    for gearId in chain.supportingGearIds
      if gearId of chain.innerGearIds
        @addConnection(chain, @getGearWithId(gearId), ConnectionType.CHAIN_INSIDE)
      else
        @addConnection(chain, @getGearWithId(gearId), ConnectionType.CHAIN_OUTSIDE)

  updateChainConnections: (chain) ->
    @removeAllConnections(chain)
    @addChainConnections(chain)

  addChain: (chain) ->
    oldBoard = @clone()
    @chains[chain.id] = chain
    if chain.tighten(this)
      @chains[chain.id] = chain
      @addChainConnections(chain)
    else
      @restore(oldBoard)
      return false
    if @isBoardValid()
      true
    else
      @restore(oldBoard)
      false

  removeChain: (chain) ->
    @removeAllConnections(chain)
    delete @chains[chain.id]

  getChains: ->
    @chains

  getChainsInGroupOnLevel: (group, level) ->
    chain for own id, chain of @chains when (chain.group is group) and (chain.level is level)

  getTurningObjects: ->
    turningObjects = {}
    turningObjects[id] = gear for own id, gear of @gears
    turningObjects[id] = chain for own id, chain of @chains
    turningObjects

  clone: ->
    gears: Util.clone(@gears)
    chains: Util.clone(@chains)

  @fromObject: (obj) ->
    board = new Board()
    for id, gear of obj.gears
      board.gears[id] = Gear.fromObject(gear)
    for id, chain of obj.chains
      board.chains[id] = Chain.fromObject(chain)
    board

window.gearsketch.model.Board = Board