define(["sugar-web/graphics/xocolor"], function (xocolor) {
  var dots = [];
  var spacing = 55;
  var offsetX = 0;
  var offsetY = 0;

  // Grid
  var COLS = 15;
  var ROWS = 13;

  var user = null;
  var ai = null;
  var opponents = {};
  var onOpponentCountChangedCb = null;
  var sharedTotalPlayers = 1;
  var broadcastUpdateCb = null;
  var lastBroadcastTime = 0;
  var localPlayerName = null;
  var onNotificationCb = null;

  var isGameActive = false;
  var speed = 0.05; // Grid units per frame (speed)

  var isMouseDown = false;

  var aiLevel = 1; // 1 (Easy), 2 (Medium), 3 (Hard)

  var buddyStrokeColor = "#005fe4";
  var buddyFillColor = "#003380";
  var aiStrokeColor = null;
  var aiFillColor = null;

  function initAIColors() {
    if (aiStrokeColor && aiFillColor) return;
    if (xocolor && xocolor.colors) {
      var validPairs = [];
      for (var i = 0; i < xocolor.colors.length; i++) {
        if (
          xocolor.colors[i].stroke.toUpperCase() !==
            buddyStrokeColor.toUpperCase() &&
          xocolor.colors[i].fill.toUpperCase() !== buddyFillColor.toUpperCase()
        ) {
          validPairs.push(xocolor.colors[i]);
        }
      }
      var rnd = validPairs[Math.floor(Math.random() * validPairs.length)];
      aiStrokeColor = rnd.stroke;
      aiFillColor = rnd.fill;
    }
  }

  // Add keyboard listener
  window.addEventListener("keydown", function (e) {
    if (!isGameActive || !user || user.isDead) return;
    var oldNextDirX = user.nextDir.x;
    var oldNextDirY = user.nextDir.y;

    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      if (user.dir.y !== 1) user.nextDir = { x: 0, y: -1 };
    } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      if (user.dir.y !== -1) user.nextDir = { x: 0, y: 1 };
    } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      if (user.dir.x !== 1) user.nextDir = { x: -1, y: 0 };
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      if (user.dir.x !== -1) user.nextDir = { x: 1, y: 0 };
    }

    if (
      (user.nextDir.x !== oldNextDirX || user.nextDir.y !== oldNextDirY) &&
      broadcastUpdateCb
    ) {
      broadcastUpdateCb();
    }
  });

  function initPlayer(
    isAi,
    startCol,
    startRow,
    strokeColor,
    fillColor,
    headColor,
    dirX,
    dirY,
    name,
    networkId,
  ) {
    var territory = new Set();
    if (startCol >= 0 && startCol < COLS && startRow >= 0 && startRow < ROWS) {
      territory.add(startCol + "_" + startRow);
    }
    return {
      networkId: networkId,
      isAi: isAi,
      name: name || (isAi ? "Robot" : "Player"),
      col: startCol,
      row: startRow,
      dir: { x: dirX, y: dirY },
      nextDir: { x: dirX, y: dirY },
      strokeColor: strokeColor,
      fillColor: fillColor,
      headColor: headColor,
      territory: new Set([startCol + "_" + startRow]),
      territoryVersion: 1,
      trail: [], // array of {c, r} points
      isDead: false,
      lastSafe: { c: startCol, r: startRow },
    };
  }

  function getSpawns() {
    var p5 = sharedTotalPlayers >= 5;
    var p6 = sharedTotalPlayers >= 6;
    var p7 = sharedTotalPlayers >= 7;
    var p8 = sharedTotalPlayers >= 8;
    return [
      { c: 0, r: Math.floor(p5 ? (ROWS * 2) / 3 : ROWS / 2), dx: 1, dy: 0 },
      {
        c: COLS - 1,
        r: Math.floor(p6 ? (ROWS * 2) / 3 : ROWS / 2),
        dx: -1,
        dy: 0,
      },
      { c: Math.floor(p7 ? (COLS * 2) / 3 : COLS / 2), r: 0, dx: 0, dy: 1 },
      {
        c: Math.floor(p8 ? (COLS * 2) / 3 : COLS / 2),
        r: ROWS - 1,
        dx: 0,
        dy: -1,
      },
      { c: 0, r: Math.floor(ROWS / 3), dx: 1, dy: 0 },
      { c: COLS - 1, r: Math.floor(ROWS / 3), dx: -1, dy: 0 },
      { c: Math.floor(COLS / 3), r: 0, dx: 0, dy: 1 },
      { c: Math.floor(COLS / 3), r: ROWS - 1, dx: 0, dy: -1 },
    ];
  }

  function restartGame(isRobotOn, spawnIndex) {
    spawnIndex = spawnIndex || 0;
    var spawns = getSpawns();
    var sp = spawns[spawnIndex % spawns.length];

    initAIColors();
    user = initPlayer(
      false,
      sp.c,
      sp.r,
      buddyStrokeColor,
      buddyFillColor,
      buddyStrokeColor,
      sp.dx,
      sp.dy,
      localPlayerName || "Player",
      "local",
    );
    if (isRobotOn) {
      var aiSp = spawns[1];
      ai = initPlayer(
        true,
        aiSp.c,
        aiSp.r,
        aiStrokeColor,
        aiFillColor,
        aiStrokeColor,
        aiSp.dx,
        aiSp.dy,
        "Robot",
        "ai",
      );
    } else {
      ai = null;
    }
    opponents = {};
    if (onOpponentCountChangedCb) onOpponentCountChangedCb(0);
    isGameActive = true;
  }

  function getBaseCoords(col, row) {
    return {
      x: offsetX + col * spacing,
      y: offsetY + row * spacing,
    };
  }

  // Flood fill to capture territory
  function captureTerritory(player) {
    if (player.trail.length === 0) return;

    // Trail loop closed, create the boundary
    var boundary = new Set(player.territory);
    var minC = COLS,
      maxC = -1,
      minR = ROWS,
      maxR = -1;

    for (var i = 0; i < player.trail.length; i++) {
      var pt = player.trail[i];
      boundary.add(pt.c + "_" + pt.r);
    }

    // Add trail to territory first
    for (var i = 0; i < player.trail.length; i++) {
      player.territory.add(player.trail[i].c + "_" + player.trail[i].r);
    }
    player.trail = [];

    // Identify enclosed territory using an outward flood fill (BFS).
    // By starting the fill from the grid's outer edges, we map all outside space.
    // Any coordinate the fill cannot reach must therefore be enclosed inside the player's loop.

    var visited = new Set();
    var queue = [];

    // Add all grid edges to queue if not part of boundary
    for (var c = 0; c < COLS; c++) {
      if (!boundary.has(c + "_0")) queue.push({ c: c, r: 0 });
      if (!boundary.has(c + "_" + (ROWS - 1)))
        queue.push({ c: c, r: ROWS - 1 });
    }
    for (var r = 1; r < ROWS - 1; r++) {
      if (!boundary.has("0_" + r)) queue.push({ c: 0, r: r });
      if (!boundary.has(COLS - 1 + "_" + r)) queue.push({ c: COLS - 1, r: r });
    }

    for (var i = 0; i < queue.length; i++) {
      visited.add(queue[i].c + "_" + queue[i].r);
    }

    while (queue.length > 0) {
      var curr = queue.shift();
      var neighbors = [
        { c: curr.c + 1, r: curr.r },
        { c: curr.c - 1, r: curr.r },
        { c: curr.c, r: curr.r + 1 },
        { c: curr.c, r: curr.r - 1 },
      ];
      for (var i = 0; i < neighbors.length; i++) {
        var n = neighbors[i];
        if (n.c >= 0 && n.c < COLS && n.r >= 0 && n.r < ROWS) {
          var key = n.c + "_" + n.r;
          if (!visited.has(key) && !boundary.has(key)) {
            visited.add(key);
            queue.push(n);
          }
        }
      }
    }

    // Anything not visited and not boundary is captured
    for (var c = 0; c < COLS; c++) {
      for (var r = 0; r < ROWS; r++) {
        var key = c + "_" + r;
        if (!visited.has(key) && !boundary.has(key)) {
          player.territory.add(key);
          // If captured from opponent, remove it from opponent's territory
          if (player !== user && user && user.territory.has(key))
            user.territory.delete(key);
          if (player !== ai && ai && ai.territory.has(key))
            ai.territory.delete(key);
          var keys = Object.keys(opponents);
          for (var i = 0; i < keys.length; i++) {
            var opp = opponents[keys[i]];
            if (player !== opp && opp.territory.has(key))
              opp.territory.delete(key);
          }
        }
      }
    }

    // Also remove trail points from opponent's territory if stolen
    boundary.forEach(function (key) {
      if (player !== user && user && user.territory.has(key))
        user.territory.delete(key);
      if (player !== ai && ai && ai.territory.has(key))
        ai.territory.delete(key);
      var keys = Object.keys(opponents);
      for (var i = 0; i < keys.length; i++) {
        var opp = opponents[keys[i]];
        if (player !== opp && opp.territory.has(key)) opp.territory.delete(key);
      }
    });

    player.territoryVersion = (player.territoryVersion || 1) + 1;

    if (player === user && broadcastUpdateCb) {
      broadcastUpdateCb();
    }
  }

  function triggerConfetti() {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
      });
    }
  }

  function checkEliminations(isSharedMode) {
    if (!isGameActive) return;

    var notifyEvent = function (event, subject, object) {
      if (!onNotificationCb) return;
      // check if names are present
      var subjectName = subject ? subject.name || "Player" : "Player";
      var objectName = object ? object.name || "Player" : "";
      var subjectColor = subject
        ? subject.strokeColor
          ? { stroke: subject.strokeColor, fill: subject.fillColor }
          : null
        : null;

      var isSubLocal = subject === user;
      var isObjLocal = object === user;
      var subjectId = subject ? subject.networkId : null;
      var objectId = object ? object.networkId : null;

      onNotificationCb(
        event,
        subjectName,
        subjectColor,
        objectName,
        isSubLocal,
        isObjLocal,
        subjectId,
        objectId,
      );
    };

    var winThreshold = (COLS * ROWS) / 2;
    var oppList = [];
    if (isSharedMode) {
      var keys = Object.keys(opponents);
      for (var i = 0; i < keys.length; i++) {
        if (!opponents[keys[i]].isDead) oppList.push(opponents[keys[i]]);
      }
    } else if (ai && !ai.isDead) {
      oppList.push(ai);
    }

    if (user && !user.isDead && user.territory.size > winThreshold) {
      if (!user.winNotified && onNotificationCb) {
        user.winNotified = true;
        notifyEvent("win", user);
      }
      for (var i = 0; i < oppList.length; i++) oppList[i].isDead = true;
    } else if (
      !isSharedMode &&
      ai &&
      !ai.isDead &&
      ai.territory.size > winThreshold
    ) {
      if (!ai.winNotified && onNotificationCb) {
        ai.winNotified = true;
        notifyEvent("win", ai);
      }
      if (user) user.isDead = true;
    } else if (isSharedMode) {
      for (var i = 0; i < oppList.length; i++) {
        if (oppList[i].territory.size > winThreshold) {
          if (user) user.isDead = true;
          for (var j = 0; j < oppList.length; j++) {
            if (i !== j) oppList[j].isDead = true;
          }
          break;
        }
      }
    }

    var checkCollision = function (p, oppList) {
      var state = { pDead: false, oppDead: false };

      // To check p Hit wall
      if (p.hitWall) {
        if (
          !p.hitWallNotified &&
          (p === user || (!isSharedMode && p === ai)) &&
          onNotificationCb
        ) {
          p.hitWallNotified = true;
          notifyEvent("hitWall", p);
        }
        state.pDead = true;
        return state;
      }

      // To check if trail disconnected from territory or territory eliminated
      if (p.territory.size === 0) {
        state.pDead = true;
      } else if (p.trail.length > 0 && p.lastSafe) {
        var safeKey = p.lastSafe.c + "_" + p.lastSafe.r;
        if (!p.territory.has(safeKey)) {
          state.pDead = true;
        }
      }

      var headC = Math.round(p.col);
      var headR = Math.round(p.row);
      if (Math.abs(p.col - headC) < 0.2 && Math.abs(p.row - headR) < 0.2) {
        // To check if p hit opp's trail
        if (oppList && oppList.length > 0) {
          for (var k = 0; k < oppList.length; k++) {
            var opp = oppList[k];
            for (var i = 0; i < opp.trail.length; i++) {
              if (opp.trail[i].c === headC && opp.trail[i].r === headR) {
                state.oppDead = true; // Opponent's trail was hit, opponent eliminates
                if (!state.deadOpponents) state.deadOpponents = [];
                if (!opp.deadLogged) {
                  opp.deadLogged = true;
                  state.deadOpponents.push(opp);
                  notifyEvent("eliminated", p, opp);
                }
              }
            }
          }
        }
        // To check if p hit its own trail
        for (var i = 0; i < p.trail.length - 1; i++) {
          // exclude head
          if (p.trail[i].c === headC && p.trail[i].r === headR) {
            state.pDead = true; // Hit own trail, p eliminates
            if (
              !p.selfHitNotified &&
              (p === user || (!isSharedMode && p === ai)) &&
              onNotificationCb
            ) {
              p.selfHitNotified = true;
              notifyEvent("intercepted", p);
            }
          }
        }
      }
      return state;
    };

    if (user && !user.isDead) {
      var userStatus = checkCollision(user, oppList);
      if (userStatus.pDead) user.isDead = true;
      if (userStatus.oppDead && userStatus.deadOpponents) {
        for (var i = 0; i < userStatus.deadOpponents.length; i++) {
          var deadOpp = userStatus.deadOpponents[i];
          killPlayer(deadOpp);
        }
      }
    }

    if (!isSharedMode && ai && !ai.isDead) {
      var aiStatus = checkCollision(ai, [user]);
      if (aiStatus.pDead) ai.isDead = true;
      if (aiStatus.oppDead) user.isDead = true;
      if (userStatus && userStatus.oppDead) ai.isDead = true;
    } else if (isSharedMode) {
      for (var i = 0; i < oppList.length; i++) {
        var opp = oppList[i];
        var oppStatus = checkCollision(opp, [user]);
        if (oppStatus.oppDead) {
          user.isDead = true;
        }
        if (oppStatus.pDead) {
          killPlayer(opp);
        }
      }
    }

    // Head to head collision
    if (user && !user.isDead) {
      for (var i = 0; i < oppList.length; i++) {
        var opp = oppList[i];
        if (opp.isDead) continue;
				// Check actual pixels for accurate collision
        if (
          Math.abs(user.x - opp.x) < spacing * 0.8 &&
          Math.abs(user.y - opp.y) < spacing * 0.8
        ) {
          if (user.trail.length > 0 && opp.trail.length === 0) {
            user.isDead = true;
            notifyEvent("eliminated", opp, user);
          } else if (opp.trail.length > 0 && user.trail.length === 0) {
            killPlayer(opp);
            notifyEvent("eliminated", user, opp);
          } else if (user.territory.size < opp.territory.size) {
            user.isDead = true;
            notifyEvent("eliminated", opp, user);
          } else if (user.territory.size > opp.territory.size) {
            killPlayer(opp);
            notifyEvent("eliminated", user, opp);
          } else {
						// Multiplayer sync: resolve tie with opponent
            notifyEvent("headToHeadClaim", user, opp);
          }
        }
      }
    }

    if (user && user.isDead) {
      if (!isSharedMode) isGameActive = false;
      user.territory.clear();
      user.trail = [];
    } else if (!isSharedMode && ai && ai.isDead) {
      isGameActive = false;
      ai.territory.clear();
      ai.trail = [];
      triggerConfetti();
    }

    if (isSharedMode) {
      // Check if only 1 player is alive
      var aliveCount = 0;
      var oppKeys = Object.keys(opponents);
      for (var i = 0; i < oppKeys.length; i++) {
        if (!opponents[oppKeys[i]].isDead) aliveCount++;
      }
      if (user && !user.isDead) aliveCount++;

      if ((oppKeys.length > 0 || (user && user.isDead)) && aliveCount === 1) {
        isGameActive = false;
        var winner = user && !user.isDead ? user : null;
        if (!winner) {
          for (var i = 0; i < oppKeys.length; i++) {
            if (!opponents[oppKeys[i]].isDead) {
              winner = opponents[oppKeys[i]];
              break;
            }
          }
        }
        if (winner) {
          notifyEvent("gameWon", winner, null);
        }
        if (user && !user.isDead) {
          triggerConfetti();
        }
      } else if (aliveCount === 0 && oppKeys.length > 0) {
        isGameActive = false;
      }
    }
  }

  function killPlayer(player) {
    player.isDead = true;
    player.territory.clear();
    player.trail = [];
    if (typeof broadcastUpdateCb === "function") {
      broadcastUpdateCb();
    }
  }

  function updateAI() {
    if (!isGameActive || ai.isDead) return;

    // Only make decisions near grid intersections
    var cInt = Math.round(ai.col);
    var rInt = Math.round(ai.row);
    var dist = Math.abs(ai.col - cInt) + Math.abs(ai.row - rInt);
    if (dist > speed * 2) return;

    // To check if continuing current direction will go out of bounds
    var nextC = cInt + ai.dir.x;
    var nextR = rInt + ai.dir.y;
    var willHitWall = nextC < 0 || nextC >= COLS || nextR < 0 || nextR >= ROWS;

    // To build trail set for collision avoidance
    var trailSet = new Set();
    for (var i = 0; i < ai.trail.length; i++)
      trailSet.add(ai.trail[i].c + "_" + ai.trail[i].r);

    // Find all valid directions
    var dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    var validDirs = [];
    for (var i = 0; i < dirs.length; i++) {
      var d = dirs[i];
      if (d.x === -ai.dir.x && d.y === -ai.dir.y) continue; // no 180
      var nc = cInt + d.x,
        nr = rInt + d.y;
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
      if (trailSet.has(nc + "_" + nr)) continue;
      validDirs.push(d);
    }

    if (validDirs.length === 0) return; // Truly trapped

    // If current direction is still valid and we won't hit a wall,
    // check if we even need to decide
    var currentStillValid = false;
    if (!willHitWall) {
      for (var i = 0; i < validDirs.length; i++) {
        if (validDirs[i].x === ai.dir.x && validDirs[i].y === ai.dir.y) {
          currentStillValid = true;
          break;
        }
      }
    }

    // To check if this direction can reach AI territory
    function canReachTerritory(startC, startR) {
      if (ai.territory.has(startC + "_" + startR)) return true;
      var q = [{ c: startC, r: startR }];
      var vis = new Set();
      vis.add(startC + "_" + startR);
      vis.add(cInt + "_" + rInt);
      while (q.length > 0) {
        var curr = q.shift();
        if (ai.territory.has(curr.c + "_" + curr.r)) return true;
        for (var j = 0; j < dirs.length; j++) {
          var nc2 = curr.c + dirs[j].x,
            nr2 = curr.r + dirs[j].y;
          var key2 = nc2 + "_" + nr2;
          if (nc2 >= 0 && nc2 < COLS && nr2 >= 0 && nr2 < ROWS) {
            if (!vis.has(key2) && !trailSet.has(key2)) {
              vis.add(key2);
              q.push({ c: nc2, r: nr2 });
            }
          }
        }
      }
      return false;
    }

    // Filter to only directions that can reach territory
    var safeDirs = [];
    for (var i = 0; i < validDirs.length; i++) {
      var nc = cInt + validDirs[i].x;
      var nr = rInt + validDirs[i].y;
      if (canReachTerritory(nc, nr)) {
        safeDirs.push(validDirs[i]);
      }
    }
    if (safeDirs.length > 0) {
      validDirs = safeDirs;
    }

    var inTerritory = ai.territory.has(cInt + "_" + rInt);

    // Only panic when trail is getting too long
    var panicThreshold = 6;
    if (aiLevel === 1) panicThreshold = 9;
    if (aiLevel === 2) panicThreshold = 5;
    if (aiLevel === 3) panicThreshold = 3;
    var panic = ai.trail.length > panicThreshold;

    if (panic) {
      // BFS to find shortest path home
      var bfsQueue = [{ c: cInt, r: rInt, dir: null }];
      var bfsVisited = new Set();
      bfsVisited.add(cInt + "_" + rInt);
      var pathDir = null;
      var found = false;

      while (bfsQueue.length > 0) {
        var curr = bfsQueue.shift();
        if (
          ai.territory.has(curr.c + "_" + curr.r) &&
          !(curr.c === cInt && curr.r === rInt)
        ) {
          pathDir = curr.dir;
          found = true;
          break;
        }
        for (var i = 0; i < dirs.length; i++) {
          var d = dirs[i];
          var nc = curr.c + d.x,
            nr = curr.r + d.y;
          var key = nc + "_" + nr;
          if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS) {
            if (!bfsVisited.has(key) && !trailSet.has(key)) {
              if (curr.dir === null && d.x === -ai.dir.x && d.y === -ai.dir.y)
                continue;
              bfsVisited.add(key);
              bfsQueue.push({ c: nc, r: nr, dir: curr.dir || d });
            }
          }
        }
      }
      if (found && pathDir) {
        for (var i = 0; i < validDirs.length; i++) {
          if (validDirs[i].x === pathDir.x && validDirs[i].y === pathDir.y) {
            ai.nextDir = pathDir;
            return;
          }
        }
      }
    }

    var randomChance = 0.3;
    if (aiLevel === 1) randomChance = 0.6;
    if (aiLevel === 2) randomChance = 0.15;
    if (aiLevel === 3) randomChance = 0.0; // No randomness in hard mode

    if (
      willHitWall ||
      !currentStillValid ||
      Math.random() < randomChance ||
      inTerritory
    ) {
      var bestDir = null;
      var bestScore = -Infinity;

      for (var i = 0; i < validDirs.length; i++) {
        var d = validDirs[i];
        var nc = cInt + d.x,
          nr = rInt + d.y;
        var score = 0;

        // To attack user trail
        var attackScore = 1000;
        if (aiLevel === 1) attackScore = 100;
        if (aiLevel === 3) attackScore = 3000;

        var minDistToTrail = Infinity;
        for (var j = 0; j < user.trail.length; j++) {
          var dist =
            Math.abs(user.trail[j].c - nc) + Math.abs(user.trail[j].r - nr);
          if (dist === 0) score += attackScore;
          if (dist < minDistToTrail) minDistToTrail = dist;
        }

        // Actively pursue trail if nearby
        if (aiLevel >= 2 && user.trail.length > 0) {
          if (minDistToTrail === 1) score += aiLevel === 3 ? 2000 : 400;
          else if (minDistToTrail === 2) score += aiLevel === 3 ? 1000 : 200;
          else if (aiLevel === 3 && minDistToTrail < 15)
            score += (20 - minDistToTrail) * 100;
          else if (aiLevel === 2 && minDistToTrail < 6)
            score += (10 - minDistToTrail) * 15;
        }

        if (aiLevel >= 2 && user.trail.length > 0) {
          var distToHead =
            Math.abs(Math.round(user.col) - nc) +
            Math.abs(Math.round(user.row) - nr);
          if (aiLevel === 3 && distToHead < 10) {
            score += (15 - distToHead) * 80;
          } else if (aiLevel === 2 && distToHead < 6) {
            score += (10 - distToHead) * 25;
          }
        }

        // To capture user territory
        if (user.territory.has(nc + "_" + nr))
          score += aiLevel === 1 ? 10 : aiLevel === 3 ? 100 : 50;

        // Prefer unclaimed squares
        if (!ai.territory.has(nc + "_" + nr)) score += 20;

        // Prefer moving towards the center of the board
        if (aiLevel >= 2) {
          var centerDist = Math.abs(COLS / 2 - nc) + Math.abs(ROWS / 2 - nr);
          score += (15 - centerDist) * (aiLevel === 3 ? 15 : 10);
        }

        // Prefer to keep moving in the same direction
        if (d.x === ai.dir.x && d.y === ai.dir.y)
          score += aiLevel === 1 ? 5 : 10;

        // penalize moves toward grid edges
        var edgePenalty = aiLevel === 1 ? 5 : aiLevel === 3 ? 25 : 15;
        if (nc <= 0 || nc >= COLS - 1) score -= edgePenalty;
        if (nr <= 0 || nr >= ROWS - 1) score -= edgePenalty;

        // To add randomness for variety
        score += Math.random() * (aiLevel === 1 ? 50 : aiLevel === 3 ? 5 : 15);

        if (score > bestScore) {
          bestScore = score;
          bestDir = d;
        }
      }

      if (bestDir) {
        ai.nextDir = bestDir;
      }
    }
  }

  function updatePlayer(p, delta) {
    if (p.isDead) return;

    // Calculate time scaled speed, cap delta at 50ms to prevent jumps during lag
    var safeDelta =
      delta !== undefined && delta > 0 ? Math.min(delta, 50) : 16.666;
    var timeScale = safeDelta / 16.666;
    var currentSpeed = speed * timeScale;

    // Calculate next position
    var newCol = p.col + p.dir.x * currentSpeed;
    var newRow = p.row + p.dir.y * currentSpeed;

    // Don't allow movement outside the grid (added small margin to prevent floating point eliminations)
    var margin = currentSpeed * 0.5;
    if (newCol < -margin) {
      newCol = 0;
      p.hitWall = true;
    }
    if (newCol > COLS - 1 + margin) {
      newCol = COLS - 1;
      p.hitWall = true;
    }
    if (newRow < -margin) {
      newRow = 0;
      p.hitWall = true;
    }
    if (newRow > ROWS - 1 + margin) {
      newRow = ROWS - 1;
      p.hitWall = true;
    }

    p.col = newCol;
    p.row = newRow;

    // Checking grid intersection
    var cInt = Math.round(p.col);
    var rInt = Math.round(p.row);
    var dist = Math.abs(p.col - cInt) + Math.abs(p.row - rInt);

    if (dist < currentSpeed * 0.75) {
      p.col = cInt;
      p.row = rInt;

      // To handle trail
      var key = cInt + "_" + rInt;
      if (!p.territory.has(key)) {
        // Outside territory, add to trail
        if (
          p.trail.length === 0 ||
          p.trail[p.trail.length - 1].c !== cInt ||
          p.trail[p.trail.length - 1].r !== rInt
        ) {
          p.trail.push({ c: cInt, r: rInt });
        }
      } else {
        p.lastSafe = { c: cInt, r: rInt };
        // We are in territory, capture if we have a trail
        if (p.trail.length > 0) {
          captureTerritory(p);
        }
      }

      // Apply next direction
      if (
        !(p.nextDir.x === -p.dir.x && p.nextDir.y === -p.dir.y) &&
        (p.nextDir.x !== p.dir.x || p.nextDir.y !== p.dir.y)
      ) {
        p.dir = p.nextDir;
      }
    }
  }

  function updateGame(delta) {
    if (!isGameActive) return;
    updatePlayer(user, delta);
    var isSharedMode =
      Object.keys(opponents).length > 0 ||
      (broadcastUpdateCb &&
        document.getElementById("robot-button").style.display === "none");

    if (!isSharedMode && ai) {
      updateAI();
      updatePlayer(ai, delta);
    } else if (isSharedMode) {
      var keys = Object.keys(opponents);
      for (var i = 0; i < keys.length; i++) {
        var opp = opponents[keys[i]];
        if (!opp.isDead) {
          updatePlayer(opp, delta);
        }
      }
    }

    checkEliminations(isSharedMode);

    // Broadcast after eliminations
    if (isSharedMode) {
      var now = Date.now();
      if (now - lastBroadcastTime > 80) {
        if (broadcastUpdateCb && (!user || !user.isDead)) broadcastUpdateCb();
        lastBroadcastTime = now;
      }
      // Send one final broadcast when user eliminates
      if (user && user.isDead && broadcastUpdateCb && !user.deathBroadcasted) {
        broadcastUpdateCb();
        user.deathBroadcasted = true;
      }
    }
  }

  function drawRect(ctx, c, r, color, padding) {
    var b = getBaseCoords(c, r);
    ctx.fillStyle = color;
    var s = spacing - padding * 2;
    if (padding === 0) s += 2;
    ctx.fillRect(b.x - s / 2, b.y - s / 2, s, s);
  }

  var GameMode = {
    setSpeed: function (val) {
      speed = val;
    },
    getSpeed: function () {
      return speed;
    },
    setAiLevel: function (level) {
      aiLevel = level;
    },
    init: function (
      dotsArray,
      broadcastCallback,
      activitySpacing,
      onOpponentCountChanged,
      notificationCb,
    ) {
      sharedTotalPlayers = 1;
      dots = dotsArray || [];
      if (activitySpacing !== undefined) {
        spacing = activitySpacing;
      }
      broadcastUpdateCb = broadcastCallback;
      onOpponentCountChangedCb = onOpponentCountChanged;
      onNotificationCb = notificationCb;
      if (dots.length > 0) {
        offsetX = dots[0].baseX;
        offsetY = dots[0].baseY;

        var maxCol = 0;
        var maxRow = 0;
        for (var i = 0; i < dots.length; i++) {
          if (dots[i].col > maxCol) maxCol = dots[i].col;
          if (dots[i].row > maxRow) maxRow = dots[i].row;
        }
        COLS = maxCol + 1;
        ROWS = maxRow + 1;
      }
      restartGame();
    },
    getStats: function () {
      return getStats();
    },
    setTotalPlayers: function (count) {
      sharedTotalPlayers = count;
    },
    activate: function () {
      restartGame();
    },
    deactivate: function () {
      isGameActive = false;
    },
    resize: function () {},

    onMouseDown: function (mouseX, mouseY) {
      if (isGameActive && user && !user.isDead) {
        isMouseDown = true;

        var headCoords = getBaseCoords(user.col, user.row);
        var dx = mouseX - headCoords.x;
        var dy = mouseY - headCoords.y;

        // Steer towards the clicked position
        if (Math.abs(dx) > Math.abs(dy)) {
          user.nextDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        } else {
          user.nextDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        }
      }
    },
    onMouseMove: function (mouseX, mouseY, prevX, prevY) {
      if (!isGameActive || prevX === -1000 || !isMouseDown) return;
      var dx = mouseX - prevX;
      var dy = mouseY - prevY;

      // If dragged pixels, change direction
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        if (Math.abs(dx) > Math.abs(dy)) {
          user.nextDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        } else {
          user.nextDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        }
      }
    },
    onMouseUp: function () {
      isMouseDown = false;
    },

    drawBehindDots: function (ctx, delta) {
      if (!ctx) return;

      if (dots.length > 0 && offsetX === 0) {
        offsetX = dots[0].baseX;
        offsetY = dots[0].baseY;
      }

      // Update logic
      updateGame(delta);

      // Draw percentage bar
      if (user) {
        var total = COLS * ROWS;
        var userPct = user.territory.size / total;
        var aiPct = ai ? ai.territory.size / total : 0;

        var barWidth = (COLS - 1) * spacing;
        var barHeight = 12;
        var startX = offsetX;
        var startY = offsetY - spacing * 0.8;

        ctx.fillStyle = "#e0e0e0"; // Neutral
        ctx.fillRect(startX, startY, barWidth, barHeight);

        if (userPct > 0) {
          ctx.fillStyle = user.fillColor;
          ctx.fillRect(startX, startY, barWidth * userPct, barHeight);
        }

        var keys = Object.keys(opponents);
        var hasOpponents = keys.length > 0;
        var aiRender = hasOpponents ? opponents[keys[0]] : ai;
        if (aiRender) {
          var aiPct = aiRender.territory.size / total;
          if (aiPct > 0) {
            ctx.fillStyle = aiRender.fillColor;
            ctx.fillRect(
              startX + barWidth - barWidth * aiPct,
              startY,
              barWidth * aiPct,
              barHeight,
            );
          }
        }
      }

      // Draw territory
      var drawTerritory = function (player) {
        if (!player || player.isDead) return;
        player.territory.forEach(function (key) {
          var parts = key.split("_");
          var c = parseInt(parts[0]);
          var r = parseInt(parts[1]);
          drawRect(ctx, c, r, player.fillColor, 0);
        });


        // Draw outer border
        ctx.beginPath();
        ctx.strokeStyle = player.strokeColor;
        ctx.lineWidth = 6;
        ctx.lineCap = "square";
        var hs = spacing / 2;
        player.territory.forEach(function (key) {
          var parts = key.split("_");
          var c = parseInt(parts[0]);
          var r = parseInt(parts[1]);
          var b = getBaseCoords(c, r);

          if (!player.territory.has(c + "_" + (r - 1))) {
            ctx.moveTo(b.x - hs, b.y - hs);
            ctx.lineTo(b.x + hs, b.y - hs);
          }
          if (!player.territory.has(c + "_" + (r + 1))) {
            ctx.moveTo(b.x - hs, b.y + hs);
            ctx.lineTo(b.x + hs, b.y + hs);
          }
          if (!player.territory.has(c - 1 + "_" + r)) {
            ctx.moveTo(b.x - hs, b.y - hs);
            ctx.lineTo(b.x - hs, b.y + hs);
          }
          if (!player.territory.has(c + 1 + "_" + r)) {
            ctx.moveTo(b.x + hs, b.y - hs);
            ctx.lineTo(b.x + hs, b.y + hs);
          }
        });
        ctx.stroke();
      };
      if (user) drawTerritory(user);
      if (ai) drawTerritory(ai);
      var keys = Object.keys(opponents);
      for (var i = 0; i < keys.length; i++) drawTerritory(opponents[keys[i]]);

      // Draw trails
      var drawTrail = function (player) {
        if (!player || player.isDead || player.trail.length === 0) return;
        ctx.beginPath();

        var start = player.lastSafe
          ? getBaseCoords(player.lastSafe.c, player.lastSafe.r)
          : getBaseCoords(player.trail[0].c, player.trail[0].r);
        ctx.moveTo(start.x, start.y);
        for (var i = 0; i < player.trail.length; i++) {
          var pt = getBaseCoords(player.trail[i].c, player.trail[i].r);
          ctx.lineTo(pt.x, pt.y);
        }
        var head = getBaseCoords(player.col, player.row);
        ctx.lineTo(head.x, head.y);

        // Draw white outline
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 19;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        // Draw colored inner trail
        ctx.strokeStyle = player.strokeColor;
        ctx.lineWidth = 15;
        ctx.stroke();
      };
      if (user) drawTrail(user);
      if (ai) drawTrail(ai);
      var keys = Object.keys(opponents);
      for (var i = 0; i < keys.length; i++) drawTrail(opponents[keys[i]]);
    },

    drawFrontDots: function (ctx) {
      // Draw heads
      var drawHead = function (player) {
        if (!player || player.isDead) return;
        var pt = getBaseCoords(player.col, player.row);
        ctx.fillStyle = player.headColor;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      };
      if (user) drawHead(user);
      if (ai) drawHead(ai);
      var keys = Object.keys(opponents);
      for (var i = 0; i < keys.length; i++) drawHead(opponents[keys[i]]);
    },

    isDotCompleted: function (dot) {
      return false; // keep dots active
    },
    isDrawingActive: function () {
      return true;
    },
    getDotColor: function (dot) {
      if (!user) return null;
      var key = dot.col + "_" + dot.row;

      for (var i = 0; i < user.trail.length; i++) {
        if (user.trail[i].c === dot.col && user.trail[i].r === dot.row)
          return user.strokeColor;
      }
      if (ai) {
        for (var i = 0; i < ai.trail.length; i++) {
          if (ai.trail[i].c === dot.col && ai.trail[i].r === dot.row)
            return ai.strokeColor;
        }
      }
      var keys = Object.keys(opponents);
      for (var j = 0; j < keys.length; j++) {
        var opp = opponents[keys[j]];
        if (!opp.isDead) {
          for (var i = 0; i < opp.trail.length; i++) {
            if (opp.trail[i].c === dot.col && opp.trail[i].r === dot.row)
              return opp.strokeColor;
          }
        }
      }

      if (user && user.territory.has(key) && !user.isDead)
        return user.fillColor;
      if (ai && ai.territory.has(key) && !ai.isDead) return ai.fillColor;
      var keys = Object.keys(opponents);
      for (var j = 0; j < keys.length; j++) {
        if (opponents[keys[j]].territory.has(key) && !opponents[keys[j]].isDead)
          return opponents[keys[j]].fillColor;
      }
      return null;
    },

    // Wave animation
    getPlayerPositions: function () {
      if (!isGameActive || !user) return [];
      var positions = [getBaseCoords(user.col, user.row)];
      if (ai) positions.push(getBaseCoords(ai.col, ai.row));
      return positions;
    },

    serialize: function () {
      if (!user) return {};
      return {
        col: user.col,
        row: user.row,
        dir: user.dir,
        nextDir: user.nextDir,
        strokeColor: user.strokeColor,
        fillColor: user.fillColor,
        trail: user.trail,
        territory: Array.from(user.territory),
        territoryVersion: user.territoryVersion,
        isDead: user.isDead,
        lastSafe: user.lastSafe,
      };
    },
    deserialize: function (data, isInit, networkId, oppName) {
      if (!networkId || !data) return;
      var isNewOpponent = false;
      if (!opponents[networkId]) {
        // New opponent
        var stroke = data.strokeColor || "#ff2b34";
        var fill = data.fillColor || "#990000";
        opponents[networkId] = initPlayer(
          true,
          data.col,
          data.row,
          stroke,
          fill,
          stroke,
          data.dir.x,
          data.dir.y,
          oppName || "Player",
          networkId,
        );
        if (onOpponentCountChangedCb)
          onOpponentCountChangedCb(Object.keys(opponents).length);
        isNewOpponent = true;
      }

      var opp = opponents[networkId];
      if (oppName) opp.name = oppName;
      opp.strokeColor = data.strokeColor;
      opp.fillColor = data.fillColor;
      opp.headColor = data.strokeColor;

      var resurrected = false;
      if (data.isDead && !opp.isDead) {
        killPlayer(opp);
      } else if (!data.isDead && opp.isDead) {
        opp.isDead = false;
        resurrected = true;
      }

      if (!opp.isDead) {
        opp.nextDir = data.nextDir;
        var dist = Math.abs(opp.col - data.col) + Math.abs(opp.row - data.row);
        var trailCleared = opp.trail.length > 0 && data.trail.length === 0;

        var currentVersion = opp.territoryVersion || 1;
        var newVersion = data.territoryVersion || 1;

        // Keep track of which dots actually belong to them
        var resolvedTerritory = new Set();

        if (data.territory) {
          var isNewCapture = newVersion > currentVersion;
          for (var i = 0; i < data.territory.length; i++) {
            var key = data.territory[i];

            if (isNewCapture) {
              // The opponent just successfully captured this dot, so we must remove it from our territory and let them have it.
              if (user && user.territory.has(key)) user.territory.delete(key);
              if (ai && ai.territory.has(key)) ai.territory.delete(key);
              var keys = Object.keys(opponents);
              for (var j = 0; j < keys.length; j++) {
                var otherOpp = opponents[keys[j]];
                if (otherOpp !== opp && otherOpp.territory.has(key)) {
                  otherOpp.territory.delete(key);
                }
              }
              resolvedTerritory.add(key);
            } else {
              // If this is an old network message and we already own this dot
              // We should ignore their old message.
              var weStoleIt = user && user.territory.has(key);
              var aiStoleIt = ai && ai.territory.has(key);
              var anotherOppStoleIt = false;
              var keys = Object.keys(opponents);
              for (var j = 0; j < keys.length; j++) {
                var otherOpp = opponents[keys[j]];
                if (otherOpp !== opp && otherOpp.territory.has(key)) {
                  anotherOppStoleIt = true;
                }
              }

              if (!weStoleIt && !aiStoleIt && !anotherOppStoleIt) {
                resolvedTerritory.add(key);
              }
            }
          }
          opp.territoryVersion = newVersion;
        }

        if (
          dist > 0.5 ||
          trailCleared ||
          isInit ||
          isNewOpponent ||
          resurrected
        ) {
          opp.col = data.col;
          opp.row = data.row;
          opp.dir = data.dir;
          opp.trail = data.trail;
          opp.territory = resolvedTerritory;
          opp.lastSafe = data.lastSafe;
        } else {
          opp.territory = resolvedTerritory; // Keep territory in sync
        }
      }
    },
    restart: function (isRobotOn, spawnIndex) {
      restartGame(isRobotOn, spawnIndex);
    },
    previewGame: function (isRobotOn, spawnIndex, keepOpponents) {
      spawnIndex = spawnIndex || 0;
      var spawns = getSpawns();
      var sp = spawns[spawnIndex % spawns.length];

      initAIColors();
      user = initPlayer(
        false,
        sp.c,
        sp.r,
        buddyStrokeColor,
        buddyFillColor,
        buddyStrokeColor,
        sp.dx,
        sp.dy,
        localPlayerName || "Player",
        "local",
      );
      if (isRobotOn) {
        var aiSp = spawns[1];
        ai = initPlayer(
          true,
          aiSp.c,
          aiSp.r,
          aiStrokeColor,
          aiFillColor,
          aiStrokeColor,
          aiSp.dx,
          aiSp.dy,
          "Robot",
          "ai",
        );
      } else {
        ai = null;
      }
      if (!keepOpponents) {
        opponents = {};
        if (onOpponentCountChangedCb) onOpponentCountChangedCb(0);
      }
      isGameActive = false;
      if (broadcastUpdateCb) broadcastUpdateCb();
    },
    startGame: function (isRobotOn, spawnIndex) {
      isGameActive = true;
    },
    addOrRemoveAi: function (isRobotOn) {
      if (isRobotOn) {
        var midRow = Math.floor(ROWS / 2);
        initAIColors();
        if (!ai)
          ai = initPlayer(
            true,
            COLS - 1,
            midRow,
            aiStrokeColor,
            aiFillColor,
            aiStrokeColor,
            -1,
            0,
            "Robot",
            "ai",
          );
      } else {
        ai = null;
      }
    },
    getOpponentCount: function () {
      return Object.keys(opponents).length;
    },
    removeOpponent: function (networkId) {
      if (opponents[networkId]) {
        delete opponents[networkId];
        if (onOpponentCountChangedCb)
          onOpponentCountChangedCb(Object.keys(opponents).length);
      }
    },
    setBuddyColors: function (stroke, fill) {
      buddyStrokeColor = stroke;
      buddyFillColor = fill;
      if (user) {
        user.strokeColor = buddyStrokeColor;
        user.fillColor = buddyFillColor;
        user.headColor = buddyStrokeColor;
      }
    },
    setLocalPlayerName: function (name) {
      localPlayerName = name;
      if (user) user.name = name;
    },
    endGame: function () {
      isGameActive = false;
      triggerConfetti();
    },
    checkHeadToHeadAgreement: function (oppId) {
      var opp = opponents[oppId];
      if (user && opp && !user.isDead && !opp.isDead) {
				// Verify local physical touch
        if (
          Math.abs(user.x - opp.x) < spacing * 1.5 &&
          Math.abs(user.y - opp.y) < spacing * 1.5
        ) {
          user.isDead = true;
          killPlayer(opp);
          return true;
        }
      }
      return false;
    },
  };

  return GameMode;
});