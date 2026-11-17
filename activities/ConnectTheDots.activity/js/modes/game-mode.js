define([
  "sugar-web/graphics/xocolor",
  "sugar-web/graphics/icon",
  "humane",
  "l10n",
], function (xocolor, icon, humane, l10n) {
  var MAX_PLAYERS = 8;
  var DEFAULT_OPP_STROKE = "#ff2b34";
  var DEFAULT_OPP_FILL = "#990000";
  var presence = null;
  var isHost = false;
  var activePlayerSlots = {}; // Maps each player ID to a spawn slot (1 to 7)
  var activePlayerMeta = {}; // Saved name, colors, and spawn slot per player
  var departedPlayers = {}; // Players who left, so late updates from them are ignored
  var userSpawnMap = {}; // Remembers spawn slots by player name and color
  var roomUsers = {};
  var roomUserSlots = {};
  var mySharedSpawnIndex = 0;
  var speedSyncTimer = null;
  var notificationIconCache = {};
  var recentNotifications = {};

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
  var messageSender = null;

  var isGameActive = false;
  var isSharedSession = false;
  var isExcluded = false;
  var currentRoundId = 1;
  var hostNetworkId = null;
  var lastHostPacketAt = 0;
  var admittedInitTokens = {};
  var deadPlayersInRound = {}; // Players already out this round so they stay out until rematch
  var pendingHeadToHeadPairs = {}; // Head to head hits waiting on the host to decide
  var lastTwoAliveInRound = null;
  var roundOutcomeNotified = false;
  var speed = 0.05; // Grid units per frame (speed)
  var restartTimer = null;
  var restartActivateAt = 0;
  var hasMatchStarted = false;

  var isMouseDown = false;

  var aiLevel = 1; // 1 (Easy), 2 (Medium), 3 (Hard)

  var buddyStrokeColor = "#005fe4";
  var buddyFillColor = "#003380";
  var aiStrokeColor = null;
  var aiFillColor = null;

  function getLocalUserInfo() {
    return presence && typeof presence.getUserInfo === "function"
      ? presence.getUserInfo()
      : null;
  }

  function getLocalNetworkId(fallback) {
    var info = getLocalUserInfo();
    return info && info.networkId ? info.networkId : fallback;
  }

  function isClientBlocked() {
    return isExcluded || (isSharedSession && !isHost && user === null);
  }

  function isRestartPending() {
    return restartTimer !== null || restartActivateAt > 0;
  }

  function clearRestartSchedule() {
    if (restartTimer) {
      clearTimeout(restartTimer);
      restartTimer = null;
    }
    restartActivateAt = 0;
  }

  function isInLobbyOrCountdown() {
    return !isGameActive && (!hasMatchStarted || isRestartPending());
  }

  function getUserColors(u) {
    var cv = u && u.colorvalue;
    return {
      stroke: cv && cv.stroke ? cv.stroke : DEFAULT_OPP_STROKE,
      fill: cv && cv.fill ? cv.fill : DEFAULT_OPP_FILL,
    };
  }

  function clearExcludedState() {
    user = null;
    ai = null;
    opponents = {};
    isGameActive = false;
  }

  function trySetUserNextDir(candidate) {
    if (
      !candidate ||
      (candidate.x === -user.dir.x && candidate.y === -user.dir.y)
    )
      return;
    var changed =
      candidate.x !== user.nextDir.x || candidate.y !== user.nextDir.y;
    user.nextDir = candidate;
    if (changed && broadcastUpdateCb) {
      broadcastUpdateCb();
      lastBroadcastTime = Date.now();
    }
  }

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
    if (!isGameActive || !user || user.isDead || isExcluded) return;
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      trySetUserNextDir({ x: 0, y: -1 });
    } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      trySetUserNextDir({ x: 0, y: 1 });
    } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      trySetUserNextDir({ x: -1, y: 0 });
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      trySetUserNextDir({ x: 1, y: 0 });
    }
  });

  function initPlayer(
    startCol,
    startRow,
    strokeColor,
    fillColor,
    dirX,
    dirY,
    name,
    networkId,
  ) {
    var initC = Math.round(startCol);
    var initR = Math.round(startRow);
    var territory = new Set();
    if (initC >= 0 && initC < COLS && initR >= 0 && initR < ROWS) {
      territory.add(initC + "_" + initR);
    }
    var player = {
      networkId: networkId,
      name: name || "Player",
      col: startCol,
      row: startRow,
      prevCol: startCol,
      prevRow: startRow,
      lastEvalCol: startCol,
      lastEvalRow: startRow,
      dir: { x: dirX, y: dirY },
      nextDir: { x: dirX, y: dirY },
      strokeColor: strokeColor,
      fillColor: fillColor,
      territory: territory,
      territoryVersion: 1,
      networkTerritoryVersion: 1,
      lastSentTerritoryVersion: 0,
      lastFullTerritoryAt: 0,
      territoryChangedAt: 0,
      networkSeq: 0,
      lastNetworkSeq: undefined,
      lastPacketAt: 0,
      lastNetCol: startCol,
      lastNetRow: startRow,
      syncDriftOffset: 0,
      visualOffsetCol: 0,
      visualOffsetRow: 0,
      awaitingStartAckUntil: 0,
      predictedCapture: null,
      pendingTurn: null,
      trail: [], // array of {c, r} points
      lastSafe: { c: initC, r: initR },
    };
    clearPlayerRoundFlags(player);
    return player;
  }

  function createLocalUser(sp, spawnIndex, localNetId) {
    var p = initPlayer(
      sp.c,
      sp.r,
      buddyStrokeColor,
      buddyFillColor,
      sp.dx,
      sp.dy,
      localPlayerName || "Player",
      localNetId,
    );
    p.spawnIndex = spawnIndex;
    return p;
  }

  function createAiPlayer(spawns) {
    initAIColors();
    var aiSp = spawns[1];
    return initPlayer(
      aiSp.c,
      aiSp.r,
      aiStrokeColor,
      aiFillColor,
      aiSp.dx,
      aiSp.dy,
      "Robot",
      "ai",
    );
  }

  function isSideTwoPlayers(side) {
    var s1 = side;
    var s2 = side + 4;
    var slots = {};
    var knownSlotCount = 0;

    if (isHost) {
      slots[0] = true;
      for (var netId in activePlayerSlots) {
        slots[activePlayerSlots[netId]] = true;
      }
    } else if (user && user.spawnIndex !== undefined) {
      slots[user.spawnIndex] = true;
      knownSlotCount++;
    }

    var oppKeys = Object.keys(opponents);
    for (var i = 0; i < oppKeys.length; i++) {
      var opp = opponents[oppKeys[i]];
      if (opp && opp.spawnIndex !== undefined) {
        slots[opp.spawnIndex] = true;
        knownSlotCount++;
      }
    }

    if (slots[s1] && slots[s2]) return true;
    if (isHost) return false;
    if (knownSlotCount > 1 && knownSlotCount >= sharedTotalPlayers)
      return false;

    return sharedTotalPlayers >= side + 5;
  }

  function getSpawns() {
    var twoOnLeft = isSideTwoPlayers(0);
    var twoOnRight = isSideTwoPlayers(1);
    var twoOnTop = isSideTwoPlayers(2);
    var twoOnBottom = isSideTwoPlayers(3);

    return [
      {
        c: 0,
        r: Math.floor(twoOnLeft ? (ROWS * 2) / 3 : ROWS / 2),
        dx: 1,
        dy: 0,
      },
      {
        c: COLS - 1,
        r: Math.floor(twoOnRight ? (ROWS * 2) / 3 : ROWS / 2),
        dx: -1,
        dy: 0,
      },
      {
        c: Math.floor(twoOnTop ? (COLS * 2) / 3 : COLS / 2),
        r: 0,
        dx: 0,
        dy: 1,
      },
      {
        c: Math.floor(twoOnBottom ? (COLS * 2) / 3 : COLS / 2),
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

  function restartGame(isRobotOn, spawnIndex, delayMs) {
    clearRestartSchedule();
    spawnIndex = spawnIndex || 0;
    hasMatchStarted = true;
    deadPlayersInRound = {};
    pendingHeadToHeadPairs = {};
    lastTwoAliveInRound = null;
    roundOutcomeNotified = false;

    // Collect all opponent IDs (existing opponents + host activePlayerSlots)
    var oppIdMap = {};
    var oppIds = [];
    var existingOppKeys = Object.keys(opponents);
    for (var i = 0; i < existingOppKeys.length; i++) {
      oppIdMap[existingOppKeys[i]] = true;
      oppIds.push(existingOppKeys[i]);
    }
    if (isHost && isSharedSession) {
      for (var activeNetId in activePlayerSlots) {
        if (!oppIdMap[activeNetId]) {
          oppIdMap[activeNetId] = true;
          oppIds.push(activeNetId);
        }
      }
    }

    if (
      isHost &&
      isSharedSession &&
      Object.keys(activePlayerSlots).length > 0
    ) {
      sharedTotalPlayers = Math.max(getTotalActivePlayers(), 1 + oppIds.length);
    } else if (isSharedSession && oppIds.length > 0) {
      sharedTotalPlayers = Math.max(sharedTotalPlayers, 1 + oppIds.length);
    }

    var spawns = getSpawns();
    var sp = spawns[spawnIndex % spawns.length];
    var localNetId = getLocalNetworkId(user ? user.networkId : "local");
    user = createLocalUser(sp, spawnIndex, localNetId);
    ai = isRobotOn ? createAiPlayer(spawns) : null;

    // Keep fallback spawns from overlapping already taken slots
    var claimedSlots = {};
    claimedSlots[spawnIndex % spawns.length] = true;
    for (var ci = 0; ci < oppIds.length; ci++) {
      var cOpp = opponents[oppIds[ci]];
      var cNetId = cOpp && cOpp.networkId ? cOpp.networkId : oppIds[ci];
      if (cOpp && cOpp.spawnIndex !== undefined) {
        claimedSlots[cOpp.spawnIndex % spawns.length] = true;
      } else if (activePlayerSlots[cNetId] !== undefined) {
        claimedSlots[activePlayerSlots[cNetId] % spawns.length] = true;
      }
    }

    // In shared mode, move opponents back to their spawns instead of removing them
    // so player info stays intact and nobody disappears on restart
    if (oppIds.length > 0) {
      for (var i = 0; i < oppIds.length; i++) {
        var oppKey = oppIds[i];
        var opp = opponents[oppKey];
        var meta =
          !opp && activePlayerMeta[oppKey] ? activePlayerMeta[oppKey] : {};
        var oppNetId = opp && opp.networkId ? opp.networkId : oppKey;

        var oppSpawnIdx = undefined;
        if (
          isHost &&
          isSharedSession &&
          activePlayerSlots[oppNetId] !== undefined
        ) {
          oppSpawnIdx = activePlayerSlots[oppNetId];
        } else if (opp && opp.spawnIndex !== undefined) {
          oppSpawnIdx = opp.spawnIndex;
        } else if (activePlayerSlots[oppNetId] !== undefined) {
          oppSpawnIdx = activePlayerSlots[oppNetId];
        } else {
          for (var fs = 0; fs < spawns.length; fs++) {
            if (!claimedSlots[fs]) {
              oppSpawnIdx = fs;
              claimedSlots[fs] = true;
              break;
            }
          }
          if (oppSpawnIdx === undefined) {
            oppSpawnIdx = (i + 1) % spawns.length;
          }
        }
        var oppSp = spawns[oppSpawnIdx % spawns.length];
        var resetOpp = initPlayer(
          oppSp.c,
          oppSp.r,
          (opp && opp.strokeColor) || meta.strokeColor || DEFAULT_OPP_STROKE,
          (opp && opp.fillColor) || meta.fillColor || DEFAULT_OPP_FILL,
          oppSp.dx,
          oppSp.dy,
          (opp && opp.name) || meta.name || "Player",
          oppNetId,
        );
        resetOpp.spawnIndex = oppSpawnIdx;
        opponents[oppKey] = resetOpp;
      }
    } else if (onOpponentCountChangedCb) {
      onOpponentCountChangedCb(0);
    }

    isGameActive = false;
    if (sharedTotalPlayers > 1 || (isSharedSession && oppIds.length > 0)) {
      var startDelay = delayMs !== undefined ? delayMs : 500;
      scheduleMatchActivation(startDelay);
    } else {
      isGameActive = true;
    }
  }

  function getBaseCoords(col, row) {
    return {
      x: offsetX + col * spacing,
      y: offsetY + row * spacing,
    };
  }

  function removeDotFromOthers(owner, key) {
    forEachPlayer(function (p) {
      if (p !== owner && p.territory && p.territory.has(key)) {
        p.territory.delete(key);
      }
    });
  }

  // Flood fill to capture territory
  function captureTerritory(player, isLocalPrediction, deferBroadcast) {
    if (player.trail.length === 0) return;

    // Trail loop closed, create the boundary and merge trail into territory
    var boundary = new Set(player.territory);
    for (var i = 0; i < player.trail.length; i++) {
      var tKey = player.trail[i].c + "_" + player.trail[i].r;
      boundary.add(tKey);
      player.territory.add(tKey);
    }
    player.trail = [];

    // Flood fill inward from the board edges to find what is outside
    var visited = new Set();
    var queue = [];
    var enqueueOutside = function (c, r) {
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
      var key = c + "_" + r;
      if (!visited.has(key) && !boundary.has(key)) {
        visited.add(key);
        queue.push({ c: c, r: r });
      }
    };

    for (var c = 0; c < COLS; c++) {
      enqueueOutside(c, 0);
      enqueueOutside(c, ROWS - 1);
    }
    for (var r = 1; r < ROWS - 1; r++) {
      enqueueOutside(0, r);
      enqueueOutside(COLS - 1, r);
    }

    while (queue.length > 0) {
      var curr = queue.shift();
      enqueueOutside(curr.c + 1, curr.r);
      enqueueOutside(curr.c - 1, curr.r);
      enqueueOutside(curr.c, curr.r + 1);
      enqueueOutside(curr.c, curr.r - 1);
    }

    // Anything not visited and not boundary is captured
    for (var c = 0; c < COLS; c++) {
      for (var r = 0; r < ROWS; r++) {
        var key = c + "_" + r;
        if (!visited.has(key) && !boundary.has(key)) {
          player.territory.add(key);
          if (!isLocalPrediction) {
            // If captured from opponent, remove it from opponent's territory
            removeDotFromOthers(player, key);
          }
        }
      }
    }

    if (!isLocalPrediction) {
      // Also remove trail points from opponent's territory if stolen
      boundary.forEach(function (key) {
        removeDotFromOthers(player, key);
      });

      player.territoryVersion = (player.territoryVersion || 1) + 1;
      player.territoryChangedAt = Date.now();

      if (!deferBroadcast && player === user && broadcastUpdateCb) {
        broadcastUpdateCb();
        lastBroadcastTime = Date.now();
      }
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

  function triggerWinnerConfetti() {
    if (!isExcluded && user && !user.isDead && !user.winConfettiTriggered) {
      user.winConfettiTriggered = true;
      triggerConfetti();
    }
  }

  function distToSegment(px, py, x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var lenSq = dx * dx + dy * dy;
    if (lenSq === 0) {
      var dpx = px - x1,
        dpy = py - y1;
      return Math.sqrt(dpx * dpx + dpy * dpy);
    }
    var t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    var projX = x1 + t * dx;
    var projY = y1 + t * dy;
    var distX = px - projX;
    var distY = py - projY;
    return Math.sqrt(distX * distX + distY * distY);
  }

  function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    function ccw(ax, ay, bx, by, cx, cy) {
      return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
    }
    return (
      ccw(x1, y1, x3, y3, x4, y4) !== ccw(x2, y2, x3, y3, x4, y4) &&
      ccw(x1, y1, x2, y2, x3, y3) !== ccw(x1, y1, x2, y2, x4, y4)
    );
  }

  function getPlayerTrailSegments(player) {
    if (!player || player.isDead || !player.trail || player.trail.length === 0)
      return [];

    var pts = [];
    if (player.lastSafe) {
      pts.push({ c: player.lastSafe.c, r: player.lastSafe.r });
    } else {
      pts.push({ c: player.trail[0].c, r: player.trail[0].r });
    }

    for (var i = 0; i < player.trail.length; i++) {
      var tc = player.trail[i].c;
      var tr = player.trail[i].r;
      if (pts[pts.length - 1].c !== tc || pts[pts.length - 1].r !== tr) {
        pts.push({ c: tc, r: tr });
      }
    }

    var hc = player.col;
    var hr = player.row;
    if (
      Math.abs(pts[pts.length - 1].c - hc) > 0.05 ||
      Math.abs(pts[pts.length - 1].r - hr) > 0.05
    ) {
      pts.push({ c: hc, r: hr });
    }

    var segments = [];
    for (var s = 0; s < pts.length - 1; s++) {
      segments.push({
        p1: pts[s],
        p2: pts[s + 1],
      });
    }
    return segments;
  }

  function trimSafeExitSegment(player, segs) {
    if (!player || !player.lastSafe || !player.territory || segs.length === 0)
      return;
    if (!player.territory.has(player.lastSafe.c + "_" + player.lastSafe.r))
      return;
    var s0 = segs[0];
    var sdx = s0.p2.c - s0.p1.c;
    var sdy = s0.p2.r - s0.p1.r;
    var sLen = Math.hypot(sdx, sdy);
    if (sLen > 1e-6) {
      var trim = Math.min(0.55, sLen * 0.55);
      segs[0] = {
        p1: {
          c: s0.p1.c + (sdx / sLen) * trim,
          r: s0.p1.r + (sdy / sLen) * trim,
        },
        p2: s0.p2,
      };
    }
  }

  function hitsTrailSegmentsOrPoints(
    mover,
    target,
    segs,
    segCount,
    pointCount,
    radius,
  ) {
    var headC = mover.col;
    var headR = mover.row;
    var prevC = mover.prevCol !== undefined ? mover.prevCol : headC;
    var prevR = mover.prevRow !== undefined ? mover.prevRow : headR;

    for (var i = 0; i < segCount; i++) {
      var seg = segs[i];
      if (
        distToSegment(headC, headR, seg.p1.c, seg.p1.r, seg.p2.c, seg.p2.r) <=
        radius
      ) {
        return true;
      }
      if (
        linesIntersect(
          prevC,
          prevR,
          headC,
          headR,
          seg.p1.c,
          seg.p1.r,
          seg.p2.c,
          seg.p2.r,
        )
      ) {
        return true;
      }
    }

    for (var k = 0; k < pointCount; k++) {
      var dc = Math.abs(headC - target.trail[k].c);
      var dr = Math.abs(headR - target.trail[k].r);
      if (dc <= radius && dr <= radius) {
        return true;
      }
    }

    return false;
  }

  function isInsideTerritoryDot(mover, owner) {
    var intC = Math.round(mover.col);
    var intR = Math.round(mover.row);
    if (owner.territory && owner.territory.has(intC + "_" + intR)) {
      return Math.hypot(mover.col - intC, mover.row - intR) < 0.48;
    }
    return false;
  }

  function checkHitsTrail(attacker, victim) {
    if (
      !attacker ||
      !victim ||
      attacker.isDead ||
      victim.isDead ||
      attacker === victim
    )
      return false;
    if (!victim.trail || victim.trail.length === 0) return false;
    if (isInsideTerritoryDot(attacker, victim)) return false;

    var segs = getPlayerTrailSegments(victim);
    trimSafeExitSegment(victim, segs);
    return hitsTrailSegmentsOrPoints(
      attacker,
      victim,
      segs,
      segs.length,
      victim.trail.length,
      0.45,
    );
  }

  function checkSelfIntercept(p) {
    if (!p || p.isDead || !p.trail || p.trail.length < 3) return false;
    // Returning into own safe territory completes capture rather than hitting own trail
    if (isInsideTerritoryDot(p, p)) return false;

    var segs = getPlayerTrailSegments(p);
    if (segs.length < 3) return false;
    trimSafeExitSegment(p, segs);

    // Exclude the last 2 segments (current head segment and segment just turned from)
    return hitsTrailSegmentsOrPoints(
      p,
      p,
      segs,
      segs.length - 2,
      p.trail.length - 2,
      0.42,
    );
  }

  function getPlayerIdentityKey(p) {
    if (!p) return "";
    return String(p.networkId || p.name || "");
  }

  function getHeadPairKeyById(idA, idB) {
    var a = String(idA || "");
    var b = String(idB || "");
    return a < b ? a + "|" + b : b + "|" + a;
  }

  function getHeadPairKey(p1, p2) {
    return getHeadPairKeyById(
      getPlayerIdentityKey(p1),
      getPlayerIdentityKey(p2),
    );
  }

  function computeHeadToHeadOutcome(
    p1,
    p2,
    p1TerrSize,
    p2TerrSize,
    p1TrailLen,
    p2TrailLen,
    p1InSafe,
    p2InSafe,
  ) {
    var maxTerritory = Math.max(p1TerrSize, p2TerrSize);
    var diffTerritory = Math.abs(p1TerrSize - p2TerrSize);
    var territoryTol =
      maxTerritory <= 2 ? 0 : Math.max(1, Math.floor(maxTerritory * 0.15));
    var sameTerritory = diffTerritory <= territoryTol;

    var maxTrail = Math.max(p1TrailLen, p2TrailLen);
    var diffTrail = Math.abs(p1TrailLen - p2TrailLen);
    var trailTol = maxTrail <= 2 ? 0 : Math.max(1, Math.floor(maxTrail * 0.15));
    var sameTrail = diffTrail <= trailTol;

    if (
      sameTerritory &&
      sameTrail &&
      !(p1TrailLen > 0 && p2InSafe) &&
      !(p2TrailLen > 0 && p1InSafe)
    ) {
      return { isMutual: true };
    }
    var p1Wins;
    if (p1TrailLen > 0 && p2InSafe) {
      p1Wins = false;
    } else if (p2TrailLen > 0 && p1InSafe) {
      p1Wins = true;
    } else if (p1TerrSize !== p2TerrSize) {
      p1Wins = p1TerrSize > p2TerrSize;
    } else {
      p1Wins = p1TrailLen > p2TrailLen;
    }
    return {
      isMutual: false,
      winner: p1Wins ? p1 : p2,
      loser: p1Wins ? p2 : p1,
    };
  }

  function resetRoundOutcomeTracking() {
    lastTwoAliveInRound = null;
    roundOutcomeNotified = false;
  }

  function recordLastTwoAliveSnapshot() {
    var alive = [];
    if (user && !user.isDead) alive.push(user);
    var keys = Object.keys(opponents);
    if (keys.length > 0) {
      for (var i = 0; i < keys.length; i++) {
        if (opponents[keys[i]] && !opponents[keys[i]].isDead) {
          alive.push(opponents[keys[i]]);
        }
      }
    } else if (ai && !ai.isDead) {
      alive.push(ai);
    }
    if (alive.length === 2) {
      lastTwoAliveInRound = [alive[0], alive[1]];
    }
    return alive;
  }

  function emitLastTwoTieIfNeeded(isSharedMode) {
    if (roundOutcomeNotified) return;
    var alive = [];
    if (user && !user.isDead) alive.push(user);
    if (isSharedMode) {
      var keys = Object.keys(opponents);
      for (var i = 0; i < keys.length; i++) {
        if (opponents[keys[i]] && !opponents[keys[i]].isDead) {
          alive.push(opponents[keys[i]]);
        }
      }
    } else if (ai && !ai.isDead) {
      alive.push(ai);
    }
    if (alive.length !== 0) return;

    var pair = lastTwoAliveInRound;
    if (
      (!pair || pair.length < 2) &&
      !isSharedMode &&
      user &&
      ai &&
      user.isDead &&
      ai.isDead
    ) {
      pair = [user, ai];
    }
    if (!pair || pair.length < 2 || !pair[0] || !pair[1] || pair[0] === pair[1])
      return;
    if (isSharedMode && !isHost) return;

    roundOutcomeNotified = true;
    isGameActive = false;
    var pA = pair[0];
    var pB = pair[1];
    var pAColor = pA.strokeColor
      ? { stroke: pA.strokeColor, fill: pA.fillColor }
      : null;
    emitGameNotification(
      "tie",
      pA.name || "Player",
      pAColor,
      pB.name || "Player",
      pA === user,
      pB === user,
      pA.networkId || null,
      pB.networkId || null,
    );
  }

  function applyHeadToHeadOutcome(
    outcome,
    p1,
    p2,
    allPlayers,
    canNotify,
    notifyEvent,
    eliminatePlayer,
  ) {
    if (outcome.isMutual) {
      var otherAlive = 0;
      for (var k = 0; k < allPlayers.length; k++) {
        if (
          !allPlayers[k].isDead &&
          allPlayers[k] !== p1 &&
          allPlayers[k] !== p2
        )
          otherAlive++;
      }
      var eventName = otherAlive === 0 ? "tie" : "eliminatedEachOther";
      if (eventName === "tie") roundOutcomeNotified = true;
      if (canNotify(p1, p2)) {
        var localUser = p1 === user ? p1 : p2;
        var localOpp = p1 === user ? p2 : p1;
        notifyEvent(eventName, localUser, localOpp);
      }
      eliminatePlayer(p1);
      eliminatePlayer(p2);
    } else {
      eliminatePlayer(outcome.loser);
      if (canNotify(p1, p2)) {
        notifyEvent("eliminated", outcome.winner, outcome.loser);
      }
    }
  }

  function checkEliminations(isSharedMode) {
    if (!isGameActive) return;

    recordLastTwoAliveSnapshot();
    var nowMs = Date.now();
    for (var hhKeyCleanup in pendingHeadToHeadPairs) {
      var cleanupEntry = pendingHeadToHeadPairs[hhKeyCleanup];
      if (
        !cleanupEntry ||
        cleanupEntry.suppressTrailUntil <= nowMs ||
        !cleanupEntry.p1 ||
        !cleanupEntry.p2 ||
        cleanupEntry.p1.isDead ||
        cleanupEntry.p2.isDead
      ) {
        delete pendingHeadToHeadPairs[hhKeyCleanup];
      }
    }

    var canNotify = function (p1, p2) {
      return (
        p1 === user ||
        p2 === user ||
        (!isSharedMode && (p1 === ai || p2 === ai)) ||
        isHost
      );
    };

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

      emitGameNotification(
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

    var markOthersDead = function (survivor) {
      if (user && user !== survivor) markDeadState(user);
      for (var i = 0; i < oppList.length; i++) {
        if (oppList[i] !== survivor) markDeadState(oppList[i]);
      }
    };

    if (user && !user.isDead && user.territory.size > winThreshold) {
      if (!user.winNotified && onNotificationCb) {
        user.winNotified = true;
        notifyEvent("win", user);
      }
      markOthersDead(user);
      if (isSharedMode || !ai) {
        isGameActive = false;
      }
      triggerWinnerConfetti();
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
      markOthersDead(ai);
    } else if (isSharedMode) {
      for (var i = 0; i < oppList.length; i++) {
        if (oppList[i].territory.size > winThreshold) {
          markOthersDead(oppList[i]);
          isGameActive = false;
          break;
        }
      }
    }

    var eliminatePlayer = function (p) {
      if (!p || p.isDead) return;
      if (p === user) {
        markDeadState(user);
      } else {
        killPlayer(p);
      }
    };

    var getAlivePlayers = function () {
      var list = [];
      if (user && !user.isDead) list.push(user);
      for (var i = 0; i < oppList.length; i++) {
        if (!oppList[i].isDead) list.push(oppList[i]);
      }
      return list;
    };

    // Wall hits and lost territory
    var initialPlayers = getAlivePlayers();

    var broadcastTerritoryElimination = function (p) {
      if (!isSharedMode || !presence || !messageSender || p.elimNotified)
        return;
      if (p !== user && !isHost) return;
      var targetId = p.networkId;
      if ((!targetId || targetId === "local") && p === user) {
        targetId = getLocalNetworkId(targetId);
      }
      if (!targetId || targetId === "local") return;
      p.elimNotified = true;
      messageSender({
        action: "notification",
        event: "eliminatedSync",
        roundId: currentRoundId,
        subjectId: targetId,
      });
    };

    for (var i = 0; i < initialPlayers.length; i++) {
      var p = initialPlayers[i];
      if (p.isDead) continue;

      if (p.hitWall) {
        if (!p.hitWallNotified && onNotificationCb) {
          p.hitWallNotified = true;
          if (canNotify(p)) {
            notifyEvent("hitWall", p);
          }
        }
        eliminatePlayer(p);
        continue;
      }

      if (
        p.territory.size === 0 ||
        (p.trail.length > 0 &&
          p.lastSafe &&
          !p.territory.has(p.lastSafe.c + "_" + p.lastSafe.r))
      ) {
        broadcastTerritoryElimination(p);
        eliminatePlayer(p);
      }
    }

    // Head to head collisions (checked first so running into each other doesn't count as hitting a trail)
    var allPlayers = getAlivePlayers();
    // Sort by color so every client checks pairs in the same order
    allPlayers.sort(function (a, b) {
      var colorA = String(a.strokeColor).toUpperCase();
      var colorB = String(b.strokeColor).toUpperCase();
      if (colorA < colorB) return -1;
      if (colorA > colorB) return 1;
      return 0;
    });

    // Visual head radius is 12px. Two heads touch when distance <= 24px
    // In grid units: 24 / spacing. With tiny buffer: touchDist + 0.1 (~0.65 to 0.85 units)
    var touchDist = spacing > 0 ? 24 / spacing : 0.7;
    var hhThreshold = isSharedMode
      ? Math.min(0.88, Math.max(0.65, touchDist + 0.1, speed * 8))
      : Math.max(0.65, touchDist + 0.1);

    for (var i = 0; i < allPlayers.length; i++) {
      var p1 = allPlayers[i];
      if (p1.isDead) continue;

      for (var j = i + 1; j < allPlayers.length; j++) {
        var p2 = allPlayers[j];
        if (p2.isDead) continue;

        var dCol = Math.abs(p1.col - p2.col);
        var dRow = Math.abs(p1.row - p2.row);
        var headDist = Math.sqrt(dCol * dCol + dRow * dRow);
        var p1PrevC =
          p1.lastEvalCol !== undefined
            ? p1.lastEvalCol
            : p1.prevCol !== undefined
              ? p1.prevCol
              : p1.col;
        var p1PrevR =
          p1.lastEvalRow !== undefined
            ? p1.lastEvalRow
            : p1.prevRow !== undefined
              ? p1.prevRow
              : p1.row;
        var p2PrevC =
          p2.lastEvalCol !== undefined
            ? p2.lastEvalCol
            : p2.prevCol !== undefined
              ? p2.prevCol
              : p2.col;
        var p2PrevR =
          p2.lastEvalRow !== undefined
            ? p2.lastEvalRow
            : p2.prevRow !== undefined
              ? p2.prevRow
              : p2.row;
        var crossed = linesIntersect(
          p1PrevC,
          p1PrevR,
          p1.col,
          p1.row,
          p2PrevC,
          p2PrevR,
          p2.col,
          p2.row,
        );
        var minHeadDist = crossed
          ? 0
          : Math.min(
              headDist,
              distToSegment(p1.col, p1.row, p2PrevC, p2PrevR, p2.col, p2.row),
              distToSegment(p2.col, p2.row, p1PrevC, p1PrevR, p1.col, p1.row),
              distToSegment(p1PrevC, p1PrevR, p2PrevC, p2PrevR, p2.col, p2.row),
              distToSegment(p2PrevC, p2PrevR, p1PrevC, p1PrevR, p1.col, p1.row),
            );

        if (minHeadDist > hhThreshold) continue;

        // Verify heads are colliding / moving toward each other
        var isOverlapping = minHeadDist < 0.5;
        var movingToward =
          crossed ||
          isOverlapping ||
          (p1.col < p2.col && p1.dir.x > 0 && p2.dir.x < 0) ||
          (p1.row < p2.row && p1.dir.y > 0 && p2.dir.y < 0) ||
          (((p1.col < p2.col && p1.dir.x > 0) ||
            (p1.col > p2.col && p1.dir.x < 0)) &&
            ((p2.row < p1.row && p2.dir.y > 0) ||
              (p2.row > p1.row && p2.dir.y < 0))) ||
          (((p2.col < p1.col && p2.dir.x > 0) ||
            (p2.col > p1.col && p2.dir.x < 0)) &&
            ((p1.row < p2.row && p1.dir.y > 0) ||
              (p1.row > p2.row && p1.dir.y < 0)));
        if (!movingToward) continue;

        var p1InSafe =
          p1.trail.length === 0 &&
          p1.territory.has(Math.round(p1.col) + "_" + Math.round(p1.row));
        var p2InSafe =
          p2.trail.length === 0 &&
          p2.territory.has(Math.round(p2.col) + "_" + Math.round(p2.row));

        if (isSharedMode && !isHost) {
          // Let the host decide head to head hits; if the host is slow or quiet,
          // the peer with the smaller ID decides after a wait (longer when the host is active online)
          var hhKey = getHeadPairKey(p1, p2);
          if (!pendingHeadToHeadPairs[hhKey]) {
            pendingHeadToHeadPairs[hhKey] = {
              firstSeenAt: nowMs,
              suppressTrailUntil: nowMs + 700,
              p1: p1,
              p2: p2,
              outcome: computeHeadToHeadOutcome(
                p1,
                p2,
                p1.territory.size,
                p2.territory.size,
                p1.trail.length,
                p2.trail.length,
                p1InSafe,
                p2InSafe,
              ),
            };
          }
          continue;
        }

        var hhOutcome = computeHeadToHeadOutcome(
          p1,
          p2,
          p1.territory.size,
          p2.territory.size,
          p1.trail.length,
          p2.trail.length,
          p1InSafe,
          p2InSafe,
        );
        applyHeadToHeadOutcome(
          hhOutcome,
          p1,
          p2,
          allPlayers,
          canNotify,
          notifyEvent,
          eliminatePlayer,
        );
        break;
      }
    }

    if (isSharedMode && !isHost) {
      var myPairNetId = getLocalNetworkId(user ? user.networkId : null);
      var isHostResponsive = !!(
        lastHostPacketAt > 0 && nowMs - lastHostPacketAt <= 600
      );
      var fallbackWaitPrimary = isHostResponsive ? 350 : 150;
      var fallbackWaitSecondary = isHostResponsive ? 500 : 260;
      for (var pendingKey in pendingHeadToHeadPairs) {
        var pendingEntry = pendingHeadToHeadPairs[pendingKey];
        if (!pendingEntry || pendingEntry.p1.isDead || pendingEntry.p2.isDead) {
          delete pendingHeadToHeadPairs[pendingKey];
          continue;
        }
        if (nowMs - pendingEntry.firstSeenAt >= fallbackWaitPrimary) {
          var isLocalPair =
            pendingEntry.p1 === user || pendingEntry.p2 === user;
          var otherPlayer =
            pendingEntry.p1 === user ? pendingEntry.p2 : pendingEntry.p1;
          var otherId = getPlayerIdentityKey(otherPlayer);
          var myIdKey = String(myPairNetId || getPlayerIdentityKey(user));
          var isPrimaryFallback = !!(myIdKey && otherId && myIdKey <= otherId);
          if (
            isLocalPair &&
            (isPrimaryFallback ||
              nowMs - pendingEntry.firstSeenAt >= fallbackWaitSecondary)
          ) {
            applyHeadToHeadOutcome(
              pendingEntry.outcome,
              pendingEntry.p1,
              pendingEntry.p2,
              allPlayers,
              canNotify,
              notifyEvent,
              eliminatePlayer,
            );
            delete pendingHeadToHeadPairs[pendingKey];
          }
        }
      }
    }

    // Trail hits and self hits
    var aliveRemaining = getAlivePlayers();

    // Self hit (each player checks their own in shared mode)
    for (var i = 0; i < aliveRemaining.length; i++) {
      var p = aliveRemaining[i];
      if (p.isDead) continue;
      if (isSharedMode && p !== user && p !== ai) continue;
      if (checkSelfIntercept(p)) {
        if (!p.selfHitNotified && onNotificationCb) {
          p.selfHitNotified = true;
          if (canNotify(p)) {
            notifyEvent("intercepted", p);
          }
        }
        eliminatePlayer(p);
      }
    }

    // Trail hits between players
    for (var i = 0; i < aliveRemaining.length; i++) {
      var attacker = aliveRemaining[i];
      if (attacker.isDead) continue;

      for (var j = 0; j < aliveRemaining.length; j++) {
        if (i === j) continue;
        var victim = aliveRemaining[j];
        if (victim.isDead) continue;
        var hhTrailEntry =
          pendingHeadToHeadPairs[getHeadPairKey(attacker, victim)];
        if (
          isSharedMode &&
          !isHost &&
          hhTrailEntry &&
          hhTrailEntry.suppressTrailUntil > nowMs
        ) {
          continue;
        }

        if (checkHitsTrail(attacker, victim)) {
          // Attacker ran into victim's trail, so victim is out
          if (!victim.elimNotified && onNotificationCb) {
            victim.elimNotified = true;
            if (canNotify(attacker, victim)) {
              notifyEvent("eliminated", attacker, victim);
            }
          }
          eliminatePlayer(victim);
        }
      }
    }

    if (user && user.isDead) {
      if (!isSharedMode) {
        isGameActive = false;
        if (ai && ai.isDead) emitLastTwoTieIfNeeded(false);
      }
    } else if (!isSharedMode && ai && ai.isDead) {
      isGameActive = false;
      triggerWinnerConfetti();
    }

    if (isSharedMode) {
      // Check if only 1 player is alive
      var aliveAfter = getAlivePlayers();
      var aliveCount = aliveAfter.length;
      var totalPlayers = Object.keys(opponents).length + (user ? 1 : 0);
      if (aliveCount === 2) {
        lastTwoAliveInRound = [aliveAfter[0], aliveAfter[1]];
      }

      if (
        totalPlayers >= 2 &&
        totalPlayers >= sharedTotalPlayers &&
        aliveCount === 1
      ) {
        isGameActive = false;
        var winner = aliveAfter[0];
        // Only fire gameWon if the local user is the winner to prevent duplicate notifications
        if (winner && winner === user && !user.gameWonNotified) {
          user.gameWonNotified = true;
          roundOutcomeNotified = true;
          notifyEvent("gameWon", winner, null);
          triggerWinnerConfetti();
        }
      } else if (aliveCount === 0 && totalPlayers > 0) {
        isGameActive = false;
        emitLastTwoTieIfNeeded(true);
      }
    }

    forEachPlayer(function (pl) {
      pl.lastEvalCol = pl.col;
      pl.lastEvalRow = pl.row;
    });
  }

  function markPlayerDeadInRound(p) {
    var netId = p && p.networkId;
    if ((!netId || netId === "local") && p === user) {
      var resolvedId = getLocalNetworkId(null);
      if (resolvedId) {
        netId = resolvedId;
        p.networkId = resolvedId;
      }
    }
    if (netId && netId !== "local") {
      deadPlayersInRound[netId] = true;
    }
  }

  function markDeadState(player) {
    if (!player) return;
    player.isDead = true;
    if (player.territory && typeof player.territory.clear === "function") {
      player.territory.clear();
    }
    player.trail = [];
    markPlayerDeadInRound(player);
  }

  function killPlayer(player, skipBroadcast) {
    if (!player) return;
    markDeadState(player);
    if (!skipBroadcast && typeof broadcastUpdateCb === "function") {
      broadcastUpdateCb();
    }
  }

  function killLocalUser() {
    if (user) killPlayer(user);
  }

  function killPlayerById(networkId) {
    if (!networkId) return;
    if (networkId !== "local") {
      deadPlayersInRound[networkId] = true;
    }
    if (user && user.networkId === networkId) {
      killLocalUser();
    } else if (opponents[networkId]) {
      markDeadState(opponents[networkId]);
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
      var attackScore = aiLevel === 1 ? 100 : aiLevel === 3 ? 3000 : 1000;

      for (var i = 0; i < validDirs.length; i++) {
        var d = validDirs[i];
        var nc = cInt + d.x,
          nr = rInt + d.y;
        var score = 0;

        var minDistToTrail = Infinity;
        for (var j = 0; j < user.trail.length; j++) {
          var dist =
            Math.abs(user.trail[j].c - nc) + Math.abs(user.trail[j].r - nr);
          if (dist === 0) score += attackScore;
          if (dist < minDistToTrail) minDistToTrail = dist;
        }

        // Actively pursue trail and player head if nearby
        if (aiLevel >= 2 && user.trail.length > 0) {
          if (minDistToTrail === 1) score += aiLevel === 3 ? 2000 : 400;
          else if (minDistToTrail === 2) score += aiLevel === 3 ? 1000 : 200;
          else if (aiLevel === 3 && minDistToTrail < 15)
            score += (20 - minDistToTrail) * 100;
          else if (aiLevel === 2 && minDistToTrail < 6)
            score += (10 - minDistToTrail) * 15;

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

  function applyIntersectionAt(p, cInt, rInt, snapStraightPosition) {
    var startCol = p.col;
    var startRow = p.row;
    var oldDirX = p.dir.x;
    var oldDirY = p.dir.y;

    var capturedOnDot = false;
    var turnedOnDot = false;
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
        if (p !== user && p !== ai) {
          p.predictedCapture = {
            networkVersion: p.networkTerritoryVersion || 1,
            captureC: cInt,
            captureR: rInt,
            dirX: p.dir.x,
            dirY: p.dir.y,
            time: Date.now(),
          };
          captureTerritory(p, true);
        } else {
          captureTerritory(p, false, true);
          capturedOnDot = true;
        }
      }
    }

    if (
      p.lastTurnCell &&
      (p.lastTurnCell.c !== cInt || p.lastTurnCell.r !== rInt)
    ) {
      p.lastTurnCell = null;
    }
    if (
      p.lastTurnCell &&
      p.lastTurnCell.c === cInt &&
      p.lastTurnCell.r === rInt
    ) {
      if (snapStraightPosition) {
        p.col = cInt;
        p.row = rInt;
      }
      if (capturedOnDot && p === user && broadcastUpdateCb) {
        broadcastUpdateCb();
        lastBroadcastTime = Date.now();
      }
      return;
    }

    // Apply a queued turn for this dot if one is waiting
    if (p.pendingTurn && cInt === p.pendingTurn.c && rInt === p.pendingTurn.r) {
      p.nextDir = p.pendingTurn.dir;
      p.pendingTurn = null;
    }

    // Apply next direction at each grid intersection
    if (
      !(p.nextDir.x === -p.dir.x && p.nextDir.y === -p.dir.y) &&
      (p.nextDir.x !== p.dir.x || p.nextDir.y !== p.dir.y)
    ) {
      p.dir = p.nextDir;
      p.lastTurnCell = { c: cInt, r: rInt };
      var crossedOvershoot =
        (startCol - cInt) * oldDirX + (startRow - rInt) * oldDirY;
      if (!snapStraightPosition && crossedOvershoot > 1e-4) {
        p.col = Math.max(
          0,
          Math.min(COLS - 1, cInt + p.dir.x * crossedOvershoot),
        );
        p.row = Math.max(
          0,
          Math.min(ROWS - 1, rInt + p.dir.y * crossedOvershoot),
        );
      } else {
        p.col = cInt;
        p.row = rInt;
      }
      if (p === user && isSharedGameMode()) {
        turnedOnDot = true;
      }
    } else if (snapStraightPosition) {
      p.col = cInt;
      p.row = rInt;
    }

    if (p === user && broadcastUpdateCb && (capturedOnDot || turnedOnDot)) {
      broadcastUpdateCb();
      lastBroadcastTime = Date.now();
    }
  }

  function clearLastTurnCellIfMoved(p, col, row, eps) {
    if (
      p.lastTurnCell &&
      (Math.abs(col - p.lastTurnCell.c) >= eps ||
        Math.abs(row - p.lastTurnCell.r) >= eps)
    ) {
      p.lastTurnCell = null;
    }
  }

  function getCrossedLine(oldPos, newPos, dirVal, boundEps) {
    if (dirVal > 0) {
      var crossPos = Math.floor(newPos + boundEps);
      if (oldPos < crossPos - boundEps && newPos >= crossPos - boundEps)
        return crossPos;
    } else if (dirVal < 0) {
      var crossNeg = Math.ceil(newPos - boundEps);
      if (oldPos > crossNeg + boundEps && newPos <= crossNeg + boundEps)
        return crossNeg;
    }
    return null;
  }

  function isSharedGameMode() {
    return (
      Object.keys(opponents).length > 0 ||
      (broadcastUpdateCb && isSharedSession)
    );
  }

  function updatePlayer(p, delta, speedFactor) {
    if (p.isDead || p.hitWall) return;
    if (delta !== undefined && delta <= 0) return;

    // Scale movement by frame time, capped at 50ms per substep so lag does not cause big jumps
    var safeDelta =
      delta !== undefined && delta > 0 ? Math.min(delta, 50) : 16.666;
    var timeScale = safeDelta / 16.666;
    var factor = speedFactor !== undefined ? speedFactor : 1.0;
    if (factor <= 0) return;

    var baseMove = speed * timeScale * factor;
    var totalMove = baseMove;

    // drift smoothly on opponents instead of abrupt teleports
    if (p !== user && p !== ai && p.syncDriftOffset) {
      if (p.syncDriftOffset > 1e-4) {
        var catchUpRate = Math.min(
          0.22,
          Math.max(0.05, p.syncDriftOffset * 0.35),
        );
        var extraMove = Math.min(p.syncDriftOffset, baseMove * catchUpRate);
        totalMove = baseMove + extraMove;
        p.syncDriftOffset -= extraMove;
        if (p.syncDriftOffset < 1e-4) p.syncDriftOffset = 0;
      } else if (p.syncDriftOffset < -1e-4) {
        var slowDownRate = Math.min(
          0.22,
          Math.max(0.05, -p.syncDriftOffset * 0.35),
        );
        var trimMove = Math.min(-p.syncDriftOffset, baseMove * slowDownRate);
        totalMove = Math.max(0, baseMove - trimMove);
        p.syncDriftOffset += trimMove;
        if (p.syncDriftOffset > -1e-4) p.syncDriftOffset = 0;
      } else {
        p.syncDriftOffset = 0;
      }
    }

    // Split movement into small steps (<= 0.45) so fast speeds don't skip dots
    var maxStep = 0.45;
    var stepsNeeded = Math.ceil(totalMove / maxStep);
    if (stepsNeeded < 1) stepsNeeded = 1;
    var stepSize = totalMove / stepsNeeded;

    p.prevCol = p.col;
    p.prevRow = p.row;

    var eps = 1e-6;
    var boundEps = 1e-9;

    for (var step = 0; step < stepsNeeded; step++) {
      if (p.isDead || p.hitWall) return;

      // If already on a dot, apply any waiting turn before stepping
      var exactC = Math.round(p.col);
      var exactR = Math.round(p.row);
      if (
        exactC >= 0 &&
        exactC < COLS &&
        exactR >= 0 &&
        exactR < ROWS &&
        Math.abs(p.col - exactC) < eps &&
        Math.abs(p.row - exactR) < eps
      ) {
        if (
          p.lastTurnCell &&
          (p.lastTurnCell.c !== exactC || p.lastTurnCell.r !== exactR)
        ) {
          p.lastTurnCell = null;
        }
        if (!p.lastTurnCell) {
          var hasPreTurn =
            (p.pendingTurn &&
              exactC === p.pendingTurn.c &&
              exactR === p.pendingTurn.r) ||
            (!(p.nextDir.x === -p.dir.x && p.nextDir.y === -p.dir.y) &&
              (p.nextDir.x !== p.dir.x || p.nextDir.y !== p.dir.y));
          if (hasPreTurn) {
            applyIntersectionAt(p, exactC, exactR, true);
          }
        }
      }

      var oldCol = p.col;
      var oldRow = p.row;

      // Calculate next position for this small step
      var newCol = oldCol + p.dir.x * stepSize;
      var newRow = oldRow + p.dir.y * stepSize;

      clearLastTurnCellIfMoved(p, newCol, newRow, eps);

      // Check capture and turns at the board edge before calling a wall hit
      if (
        newCol < -boundEps ||
        newCol > COLS - 1 + boundEps ||
        newRow < -boundEps ||
        newRow > ROWS - 1 + boundEps
      ) {
        var edgeC = Math.max(0, Math.min(COLS - 1, Math.round(newCol)));
        var edgeR = Math.max(0, Math.min(ROWS - 1, Math.round(newRow)));
        var distToEdge = Math.hypot(edgeC - oldCol, edgeR - oldRow);
        var overshoot = Math.max(0, stepSize - distToEdge);

        applyIntersectionAt(p, edgeC, edgeR, true);

        var nextEdgeC = edgeC + p.dir.x;
        var nextEdgeR = edgeR + p.dir.y;
        if (
          nextEdgeC < 0 ||
          nextEdgeC >= COLS ||
          nextEdgeR < 0 ||
          nextEdgeR >= ROWS
        ) {
          if (p !== user && p !== ai) {
            // Stop at the edge dot and wait for the opponent's turn or hitWall update
            p.col = edgeC;
            p.row = edgeR;
            return;
          }
          p.hitWall = true;
          return;
        }
        if (overshoot > boundEps) {
          p.col = Math.max(0, Math.min(COLS - 1, edgeC + p.dir.x * overshoot));
          p.row = Math.max(0, Math.min(ROWS - 1, edgeR + p.dir.y * overshoot));
          clearLastTurnCellIfMoved(p, p.col, p.row, eps);
        }
        continue;
      }

      // Clean up tiny floating point drift at the board edges
      if (newCol < 0) newCol = 0;
      if (newCol > COLS - 1) newCol = COLS - 1;
      if (newRow < 0) newRow = 0;
      if (newRow > ROWS - 1) newRow = ROWS - 1;

      p.col = newCol;
      p.row = newRow;

      // Checking grid intersection
      var cInt = Math.round(p.col);
      var rInt = Math.round(p.row);
      var crossed = false;
      if (p.dir.x !== 0) {
        var crossC = getCrossedLine(oldCol, newCol, p.dir.x, boundEps);
        if (crossC !== null) {
          cInt = crossC;
          rInt = Math.round(newRow);
          crossed = true;
        }
      } else if (p.dir.y !== 0) {
        var crossR = getCrossedLine(oldRow, newRow, p.dir.y, boundEps);
        if (crossR !== null) {
          cInt = Math.round(newCol);
          rInt = crossR;
          crossed = true;
        }
      }
      var dist = Math.abs(p.col - cInt) + Math.abs(p.row - rInt);

      // Only snap prior to crossing when turning or arriving close to a board boundary
      var preTurnOrEdge = false;
      if (!crossed && dist < stepSize * 0.75) {
        var hasQueuedTurn =
          !!(
            p.pendingTurn &&
            cInt === p.pendingTurn.c &&
            rInt === p.pendingTurn.r
          ) ||
          (!(p.nextDir.x === -p.dir.x && p.nextDir.y === -p.dir.y) &&
            (p.nextDir.x !== p.dir.x || p.nextDir.y !== p.dir.y) &&
            !(
              p.lastTurnCell &&
              p.lastTurnCell.c === cInt &&
              p.lastTurnCell.r === rInt
            ));
        var nextOutC = cInt + p.dir.x;
        var nextOutR = rInt + p.dir.y;
        var atBoardEdge =
          nextOutC < 0 || nextOutC >= COLS || nextOutR < 0 || nextOutR >= ROWS;
        if (
          hasQueuedTurn ||
          (atBoardEdge && dist < Math.min(0.035, stepSize * 0.75))
        ) {
          preTurnOrEdge = true;
        }
      }

      if (crossed || preTurnOrEdge) {
        applyIntersectionAt(p, cInt, rInt, preTurnOrEdge);
      }
    }
  }

  function updateGame(delta) {
    checkScheduledActivation();
    if (!isGameActive || isClientBlocked()) return;

    var isSharedMode = isSharedGameMode();

    if (delta === undefined || delta > 0) {
      var remaining = delta !== undefined ? Math.min(delta, 500) : 16.666;
      while (remaining > 1e-6) {
        var stepDelta = Math.min(50, remaining);
        remaining -= stepDelta;

        if (user) {
          updatePlayer(user, stepDelta);
        }

        if (!isSharedMode && ai) {
          updateAI();
          updatePlayer(ai, stepDelta);
        } else if (isSharedMode) {
          var keys = Object.keys(opponents);
          var oppTickNow = Date.now();
          for (var i = 0; i < keys.length; i++) {
            var opp = opponents[keys[i]];
            if (!opp.isDead) {
              if (opp.visualOffsetCol || opp.visualOffsetRow) {
                var visDist = Math.hypot(
                  opp.visualOffsetCol,
                  opp.visualOffsetRow,
                );
                if (visDist < 1e-4) {
                  opp.visualOffsetCol = 0;
                  opp.visualOffsetRow = 0;
                } else {
                  var expStep = visDist * (1 - Math.exp(-stepDelta / 75));
                  var maxVisStep =
                    Math.max(0.03, speed * 1.15) * (stepDelta / 16.666);
                  var reduceBy = Math.min(
                    visDist,
                    Math.min(expStep, maxVisStep),
                  );
                  var scaleKeep = (visDist - reduceBy) / visDist;
                  opp.visualOffsetCol *= scaleKeep;
                  opp.visualOffsetRow *= scaleKeep;
                }
              }
              if (
                opp.awaitingStartAckUntil &&
                oppTickNow < opp.awaitingStartAckUntil
              ) {
                continue;
              }
              var ageMs =
                opp.lastPacketAt > 0 ? oppTickNow - opp.lastPacketAt : 0;
              var stallFactor = 1.0;
              if (ageMs > 1200) {
                stallFactor = 0;
              } else if (ageMs > 550) {
                // Ease speed down smoothly from 1x to 0.15x during jitter before pausing at 1200ms
                stallFactor = 1.0 - ((ageMs - 550) / (1200 - 550)) * 0.85;
              }
              var oppNetDrift =
                opp.lastNetCol !== undefined && opp.lastNetRow !== undefined
                  ? Math.abs(opp.col - opp.lastNetCol) +
                    Math.abs(opp.row - opp.lastNetRow)
                  : 0;
              var driftCap = Math.max(4.5, speed * 45);
              var isCatchingUpBehind = opp.syncDriftOffset > 0.05;
              if (
                stallFactor > 0 &&
                (oppNetDrift < driftCap || isCatchingUpBehind)
              ) {
                updatePlayer(opp, stepDelta, stallFactor);
              }
            }
          }
        }

        checkEliminations(isSharedMode);
      }
    }

    // Broadcast after eliminations
    if (isSharedMode && broadcastUpdateCb) {
      var alivePlayersCount = user && !user.isDead ? 1 : 0;
      var aliveOppKeys = Object.keys(opponents);
      for (var ak = 0; ak < aliveOppKeys.length; ak++) {
        if (
          opponents[aliveOppKeys[ak]] &&
          !opponents[aliveOppKeys[ak]].isDead
        ) {
          alivePlayersCount++;
        }
      }
      var broadcastIntervalMs =
        alivePlayersCount >= 7 ? 80 : alivePlayersCount >= 5 ? 65 : 50;
      var now = Date.now();
      if (user && !user.isDead) {
        if (now - lastBroadcastTime >= broadcastIntervalMs) {
          broadcastUpdateCb();
          lastBroadcastTime = now;
        }
      } else if (user && user.isDead && !user.deathBroadcasted) {
        // Send one final broadcast when user eliminates
        broadcastUpdateCb();
        user.deathBroadcasted = true;
        lastBroadcastTime = now;
      } else if (
        isHost &&
        alivePlayersCount >= 2 &&
        now - lastBroadcastTime >= 450
      ) {
        // Keepalive from a spectating Host so peers know Host is still active
        broadcastUpdateCb();
        lastBroadcastTime = now;
      }
    }
  }

  function getL10n(key, fallback) {
    if (l10n && typeof l10n.get === "function") {
      var val = l10n.get(key);
      return val && val !== key && val !== "" ? val : fallback;
    }
    return fallback;
  }

  function logToast(msg, sColor, logOptions) {
    var now = Date.now();
    if (recentNotifications[msg] && now - recentNotifications[msg] < 1500) {
      return;
    }
    recentNotifications[msg] = now;

    for (var k in recentNotifications) {
      if (now - recentNotifications[k] > 2000) {
        delete recentNotifications[k];
      }
    }

    if (!humane || typeof humane.log !== "function") {
      console.log("[GameMode] " + msg);
      return;
    }

    var logWithIconUrl = function (url) {
      var iconHtml =
        "<br><img style='height:30px;vertical-align:middle;margin-top:5px;' src='" +
        url +
        "'>";
      humane.log(msg + iconHtml, logOptions);
    };

    if (
      sColor &&
      sColor.fill &&
      sColor.stroke &&
      icon &&
      typeof icon.load === "function"
    ) {
      var iconKey = sColor.fill + "_" + sColor.stroke;
      if (notificationIconCache[iconKey]) {
        logWithIconUrl(notificationIconCache[iconKey]);
        return;
      }
      icon.load(
        {
          uri: "icons/owner-icon.svg",
          fillColor: sColor.fill,
          strokeColor: sColor.stroke,
        },
        function (url) {
          notificationIconCache[iconKey] = url;
          logWithIconUrl(url);
        },
      );
    } else {
      humane.log(msg, logOptions);
    }
  }

  function showGameNotification(event, subjectName, subjectColor, objectName) {
    var myName = localPlayerName || "Player";
    var youStr = getL10n("You", "You");
    var sName = subjectName === myName ? youStr : subjectName;
    var oName = objectName ? (objectName === myName ? youStr : objectName) : "";
    var msg = "";

    if (event === "hitWall")
      msg = sName + " " + getL10n("hitTheWall", "hit the wall");
    else if (event === "win")
      msg =
        sName +
        " " +
        getL10n("fillMoreThan50", "fill more than 50% of the board");
    else if (event === "eliminated")
      msg = sName + " " + getL10n("eliminated", "eliminated") + " " + oName;
    else if (event === "intercepted")
      msg = sName + " " + getL10n("hasBeenIntercepted", "has been intercepted");
    else if (event === "eliminatedEachOther" || event === "tie") {
      var n1 = sName > oName ? oName : sName;
      var n2 = sName > oName ? sName : oName;
      msg =
        event === "tie"
          ? getL10n("itsTie", "It's a Tie!") + " " + n1 + " & " + n2
          : n1 +
            " " +
            getL10n("and", "and") +
            " " +
            n2 +
            " " +
            getL10n("eliminatedEachOther", "eliminated each other");
    } else if (event === "gameWon")
      msg = sName + " " + getL10n("wonTheGame", "won the game");

    logToast(msg, subjectColor || { fill: "#000000", stroke: "#ffffff" });
  }

  function emitGameNotification(
    event,
    subjectName,
    subjectColor,
    objectName,
    isSubLocal,
    isObjLocal,
    subjectId,
    objectId,
  ) {
    showGameNotification(event, subjectName, subjectColor, objectName);
    if (presence && messageSender) {
      var myId = getLocalNetworkId(null);
      messageSender({
        action: "notification",
        event: event,
        roundId: currentRoundId,
        subjectName: subjectName,
        subjectColor: subjectColor,
        objectName: objectName,
        subjectId: isSubLocal ? myId : subjectId,
        objectId: isObjLocal ? myId : objectId,
      });
    }
    if (event === "win" || event === "gameWon" || event === "tie") {
      roundOutcomeNotified = true;
    }
    if (event === "tie") {
      isGameActive = false;
    }
    if (onNotificationCb) {
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
    }
  }

  function showMaxPlayersNotification(userName, userColor, timeoutMs) {
    var baseMsg = getL10n(
      "MaxPlayersReached",
      "Maximum player count has been reached (8 players max)",
    );
    var msg = userName ? userName + ": " + baseMsg : baseMsg;
    var sColor = userColor;
    if (!sColor) {
      var pUser = getLocalUserInfo();
      if (pUser && pUser.colorvalue) {
        sColor = pUser.colorvalue;
      } else if (buddyStrokeColor && buddyFillColor) {
        sColor = { stroke: buddyStrokeColor, fill: buddyFillColor };
      }
    }
    logToast(msg, sColor, { timeout: timeoutMs || 5000 });
  }

  function getTotalActivePlayers() {
    var count = 1; // 1 for host (slot 0)
    for (var s = 1; s <= 7; s++) {
      for (var netId in activePlayerSlots) {
        if (activePlayerSlots[netId] === s) {
          count++;
          break;
        }
      }
    }
    return count;
  }

  function resetPlayerToSpawn(p, sp) {
    if (!p || !sp) return;
    p.col = sp.c;
    p.row = sp.r;
    p.prevCol = sp.c;
    p.prevRow = sp.r;
    p.lastEvalCol = sp.c;
    p.lastEvalRow = sp.r;
    p.lastPacketAt = 0;
    p.lastNetCol = sp.c;
    p.lastNetRow = sp.r;
    p.syncDriftOffset = 0;
    p.visualOffsetCol = 0;
    p.visualOffsetRow = 0;
    p.awaitingStartAckUntil = 0;
    p.lastSentTerritoryVersion = 0;
    p.lastFullTerritoryAt = 0;
    p.territoryChangedAt = 0;
    p.dir = { x: sp.dx, y: sp.dy };
    p.nextDir = { x: sp.dx, y: sp.dy };
    p.pendingTurn = null;
    p.lastTurnCell = null;
    p.predictedCapture = null;
    p.trail = [];
    p.lastSafe = { c: sp.c, r: sp.r };
    p.territory = new Set([sp.c + "_" + sp.r]);
  }

  function resetLobbyPlayersToSpawns(spawns, skipNetId) {
    forEachPlayer(function (p) {
      if (p === ai || p.spawnIndex === undefined) return;
      if (skipNetId && p !== user && p.networkId === skipNetId) return;
      if (!p.isDead && !(p.networkId && deadPlayersInRound[p.networkId])) {
        resetPlayerToSpawn(p, spawns[p.spawnIndex % spawns.length]);
      }
    });
  }

  function getRoomUserKey(u) {
    var userKey = u && u.name ? u.name : "Player";
    if (u && u.colorvalue) {
      userKey += "_" + u.colorvalue.stroke + "_" + u.colorvalue.fill;
    }
    return userKey;
  }

  function isSlotTakenInMap(slotMap, slot) {
    for (var nid in slotMap) {
      if (slotMap[nid] === slot) return true;
    }
    return false;
  }

  function isValidFreeSlot(slotMap, slot) {
    return (
      slot !== undefined &&
      slot >= 1 &&
      slot <= 7 &&
      !isSlotTakenInMap(slotMap, slot)
    );
  }

  function findAvailableSlot(slotMap, userKey, preferredSlot) {
    if (isValidFreeSlot(slotMap, preferredSlot)) {
      return preferredSlot;
    }
    var prev = userSpawnMap[userKey];
    if (isValidFreeSlot(slotMap, prev)) {
      return prev;
    }
    for (var s = 1; s <= 7; s++) {
      if (!isSlotTakenInMap(slotMap, s)) return s;
    }
    return undefined;
  }

  function assignNonGameModeSlot(joiningUser) {
    if (!joiningUser || !joiningUser.networkId) return 1;
    if (roomUserSlots[joiningUser.networkId] !== undefined) {
      return roomUserSlots[joiningUser.networkId];
    }
    var userKey = getRoomUserKey(joiningUser);
    var assignedSlot = findAvailableSlot(roomUserSlots, userKey);
    if (assignedSlot === undefined) {
      assignedSlot = 8 + Object.keys(roomUserSlots).length;
    }
    roomUserSlots[joiningUser.networkId] = assignedSlot;
    if (assignedSlot >= 1 && assignedSlot <= 7) {
      userSpawnMap[userKey] = assignedSlot;
    }
    return assignedSlot;
  }

  function handleUserJoin(joiningUser, preferredSlot) {
    if (!joiningUser) return { allowed: false, reason: "invalid-user" };
    if (joiningUser.networkId) {
      delete departedPlayers[joiningUser.networkId];
    }

    var userKey = getRoomUserKey(joiningUser);

    // Check if this user already has an active slot
    var assignedSlot = activePlayerSlots[joiningUser.networkId];
    if (assignedSlot === undefined) {
      assignedSlot = findAvailableSlot(
        activePlayerSlots,
        userKey,
        preferredSlot,
      );
    }
    if (assignedSlot === undefined) {
      console.log(
        "Max players reached in Game Mode (currently " +
          getTotalActivePlayers() +
          " players). Rejecting user: " +
          joiningUser.name,
      );
      return { allowed: false, reason: "max-players-reached" };
    }

    var colors = getUserColors(joiningUser);
    activePlayerSlots[joiningUser.networkId] = assignedSlot;
    userSpawnMap[userKey] = assignedSlot;
    activePlayerMeta[joiningUser.networkId] = {
      name: joiningUser.name || "Player",
      strokeColor: colors.stroke,
      fillColor: colors.fill,
      spawnIndex: assignedSlot,
    };

    var totalActive = getTotalActivePlayers();
    sharedTotalPlayers = totalActive;

    var spawns = getSpawns();

    // If lobby mode (game not started yet), adjust existing players' spawns if their side now has 2 players
    if (isInLobbyOrCountdown()) {
      resetLobbyPlayersToSpawns(spawns, joiningUser.networkId);
    }

    // Immediately add joining player into opponents on the host so their dot appears without delay
    var sp = spawns[assignedSlot % spawns.length];
    var spawnKey = sp.c + "_" + sp.r;
    var roundEndedAwaitingRematch = !!(
      hasMatchStarted &&
      !isGameActive &&
      !isRestartPending()
    );
    var isMidMatchNewJoin = !!(
      !opponents[joiningUser.networkId] &&
      hasMatchStarted &&
      !isRestartPending()
    );
    var isDeadInCurrentRound = !!(
      roundEndedAwaitingRematch ||
      isMidMatchNewJoin ||
      (joiningUser.networkId && deadPlayersInRound[joiningUser.networkId])
    );
    if (isDeadInCurrentRound && joiningUser.networkId) {
      deadPlayersInRound[joiningUser.networkId] = true;
    }
    if ((isGameActive || hasMatchStarted) && !isDeadInCurrentRound) {
      forEachPlayer(function (p) {
        if (
          p !== ai &&
          p.networkId !== joiningUser.networkId &&
          p.territory &&
          p.territory.size > 1 &&
          p.territory.has(spawnKey)
        ) {
          p.territory.delete(spawnKey);
        }
      });
    }
    if (!opponents[joiningUser.networkId]) {
      opponents[joiningUser.networkId] = initPlayer(
        sp.c,
        sp.r,
        colors.stroke,
        colors.fill,
        sp.dx,
        sp.dy,
        joiningUser.name || "Player",
        joiningUser.networkId,
      );
      opponents[joiningUser.networkId].spawnIndex = assignedSlot;
      if (isDeadInCurrentRound) {
        markDeadState(opponents[joiningUser.networkId]);
      }
      if (onOpponentCountChangedCb)
        onOpponentCountChangedCb(Object.keys(opponents).length);
    } else {
      var existingJoiningOpp = opponents[joiningUser.networkId];
      var preserveDead = !!(existingJoiningOpp.isDead || isDeadInCurrentRound);
      if (preserveDead) {
        markDeadState(existingJoiningOpp);
      } else if (!hasMatchStarted || isRestartPending()) {
        resetPlayerToSpawn(existingJoiningOpp, sp);
        clearPlayerRoundFlags(existingJoiningOpp);
        existingJoiningOpp.territoryVersion = 1;
        existingJoiningOpp.networkTerritoryVersion = 1;
      }
      existingJoiningOpp.spawnIndex = assignedSlot;
      existingJoiningOpp.strokeColor = colors.stroke;
      existingJoiningOpp.fillColor = colors.fill;
    }

    return {
      allowed: true,
      spawnIndex: assignedSlot,
      totalPlayers: totalActive,
    };
  }

  function handleUserLeave(leavingUser) {
    if (leavingUser && leavingUser.networkId) {
      departedPlayers[leavingUser.networkId] = true;
      delete admittedInitTokens[leavingUser.networkId];
      delete roomUsers[leavingUser.networkId];
      delete roomUserSlots[leavingUser.networkId];
      delete activePlayerSlots[leavingUser.networkId];
      delete activePlayerMeta[leavingUser.networkId];
      if (opponents[leavingUser.networkId]) {
        delete opponents[leavingUser.networkId];
        if (onOpponentCountChangedCb)
          onOpponentCountChangedCb(Object.keys(opponents).length);
      }
    }
    var totalActive = isHost
      ? getTotalActivePlayers()
      : (user ? 1 : 0) + Object.keys(opponents).length;
    if (totalActive < 1) totalActive = 1;
    sharedTotalPlayers = totalActive;

    if (isInLobbyOrCountdown()) {
      resetLobbyPlayersToSpawns(getSpawns());
    }

    return { totalPlayers: totalActive };
  }

  function syncOpponentsWithAllPlayers(allPlayers, myNetId) {
    if (
      !isSharedSession ||
      isHost ||
      !Array.isArray(allPlayers) ||
      allPlayers.length === 0
    )
      return;
    var validIds = {};
    for (var i = 0; i < allPlayers.length; i++) {
      var p = allPlayers[i];
      if (p && p.networkId) {
        delete departedPlayers[p.networkId];
        if (!myNetId || p.networkId !== myNetId) {
          validIds[p.networkId] = true;
        }
      }
    }
    var removed = false;
    var oppKeys = Object.keys(opponents);
    for (var j = 0; j < oppKeys.length; j++) {
      if (!validIds[oppKeys[j]]) {
        departedPlayers[oppKeys[j]] = true;
        delete opponents[oppKeys[j]];
        removed = true;
      }
    }
    if (removed && onOpponentCountChangedCb) {
      onOpponentCountChangedCb(Object.keys(opponents).length);
    }
  }

  function clearPlayerRoundFlags(p) {
    if (!p) return;
    p.isDead = false;
    p.hitWall = false;
    p.hitWallNotified = false;
    p.selfHitNotified = false;
    p.elimNotified = false;
    p.winNotified = false;
    p.gameWonNotified = false;
    p.winConfettiTriggered = false;
    p.deathBroadcasted = false;
    p.lastTurnCell = null;
  }

  function handleNetworkMessage(msg, myUserInfo) {
    if (!msg || !msg.content || isClientBlocked()) return;
    var myNetId =
      myUserInfo && myUserInfo.networkId
        ? myUserInfo.networkId
        : getLocalNetworkId(null);

    var syncUserToCurrentSpawn = function () {
      if (!user || user.spawnIndex === undefined) return;
      var spawns = getSpawns();
      resetPlayerToSpawn(user, spawns[user.spawnIndex % spawns.length]);
    };

    var syncPlayersAndRound = function (
      allowFallbackTotalUsers,
      allowMySpawnUpdate,
      shouldInitOppFn,
      skipExistingLiveOpponents,
    ) {
      if (msg.content.roundId !== undefined) {
        if (msg.content.roundId > currentRoundId) {
          deadPlayersInRound = {};
          pendingHeadToHeadPairs = {};
          resetRoundOutcomeTracking();
        }
        currentRoundId = msg.content.roundId;
      }
      if (msg.content.totalUsers !== undefined) {
        sharedTotalPlayers = msg.content.totalUsers;
      } else if (
        allowFallbackTotalUsers &&
        msg.content.allPlayers &&
        Array.isArray(msg.content.allPlayers) &&
        msg.content.allPlayers.length > sharedTotalPlayers
      ) {
        sharedTotalPlayers = Math.min(
          MAX_PLAYERS,
          msg.content.allPlayers.length,
        );
      }
      if (msg.content.allPlayers && Array.isArray(msg.content.allPlayers)) {
        syncOpponentsWithAllPlayers(msg.content.allPlayers, myNetId);
        for (var p = 0; p < msg.content.allPlayers.length; p++) {
          var pData = msg.content.allPlayers[p];
          if (!pData || !pData.networkId) continue;
          if (myNetId && pData.networkId === myNetId) {
            if (
              allowMySpawnUpdate &&
              user &&
              pData.data &&
              pData.data.spawnIndex !== undefined
            ) {
              user.spawnIndex = pData.data.spawnIndex;
            }
          } else if (skipExistingLiveOpponents && opponents[pData.networkId]) {
            var existingOpp = opponents[pData.networkId];
            if (pData.name) existingOpp.name = pData.name;
            if (pData.data && pData.data.spawnIndex !== undefined) {
              existingOpp.spawnIndex = pData.data.spawnIndex;
            }
            if (
              deadPlayersInRound[pData.networkId] ||
              (pData.data && pData.data.isDead)
            ) {
              if (!existingOpp.isDead) markDeadState(existingOpp);
            }
          } else {
            GameMode.deserialize(
              pData.data,
              shouldInitOppFn(pData.networkId),
              pData.networkId,
              pData.name,
            );
          }
        }
      }
    };

    if (
      !isHost &&
      msg.user &&
      msg.user.networkId &&
      (!hostNetworkId || msg.user.networkId === hostNetworkId)
    ) {
      if (
        !hostNetworkId &&
        (msg.content.action === "start-game" ||
          msg.content.action === "restart-game" ||
          msg.content.action === "update-spawns" ||
          msg.content.action === "update-speed")
      ) {
        hostNetworkId = msg.user.networkId;
      }
      if (msg.user.networkId === hostNetworkId) {
        lastHostPacketAt = Date.now();
      }
    }
    if (msg.content.action === "update-speed") {
      if (msg.content.speed !== undefined) {
        speed = msg.content.speed;
      }
      return;
    }

    if (
      msg.content.roundId !== undefined &&
      msg.content.roundId < currentRoundId
    ) {
      return;
    }

    switch (msg.content.action) {
      case "start-game":
        var wasPreStart = !isGameActive && !hasMatchStarted;
        hasMatchStarted = true;
        if (wasPreStart) {
          forEachPlayer(clearPlayerRoundFlags);
        }
        syncPlayersAndRound(
          true,
          wasPreStart,
          function (nid) {
            return (wasPreStart || !opponents[nid]) && !deadPlayersInRound[nid];
          },
          !wasPreStart,
        );
        if (wasPreStart) {
          syncUserToCurrentSpawn();
        }
        break;
      case "restart-game":
        hasMatchStarted = true;
        deadPlayersInRound = {};
        pendingHeadToHeadPairs = {};
        resetRoundOutcomeTracking();
        forEachPlayer(clearPlayerRoundFlags);
        syncPlayersAndRound(
          true,
          true,
          function () {
            return true;
          },
          false,
        );
        if (!isGameActive && isRestartPending()) {
          syncUserToCurrentSpawn();
        }
        break;
      case "update-spawns":
        var isPreStartSpawns = isInLobbyOrCountdown();
        syncPlayersAndRound(
          false,
          isPreStartSpawns,
          function (nid) {
            return (
              (isPreStartSpawns || !opponents[nid]) && !deadPlayersInRound[nid]
            );
          },
          !isPreStartSpawns,
        );
        if (isPreStartSpawns && user && user.spawnIndex !== undefined) {
          syncUserToCurrentSpawn();
          if (broadcastUpdateCb) {
            broadcastUpdateCb();
          }
        } else if (
          !isPreStartSpawns &&
          user &&
          user.isDead &&
          broadcastUpdateCb
        ) {
          broadcastUpdateCb();
        }
        break;
    }
  }

  function cloneTrail(trail) {
    if (!trail || !trail.length) return [];
    var copy = [];
    for (var i = 0; i < trail.length; i++) {
      copy.push({ c: trail[i].c, r: trail[i].r });
    }
    return copy;
  }

  function pushUniqueTrailPoint(trail, c, r, territory) {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return false;
    if (territory && territory.has(c + "_" + r)) return false;
    var len = trail.length;
    if (len === 0 || trail[len - 1].c !== c || trail[len - 1].r !== r) {
      trail.push({ c: c, r: r });
    }
    return true;
  }

  function getNextIntersectionAlongDir(col, row, dir) {
    if (dir.x === 1)
      return { c: Math.floor(col + 1e-6) + 1, r: Math.round(row) };
    if (dir.x === -1)
      return { c: Math.ceil(col - 1e-6) - 1, r: Math.round(row) };
    if (dir.y === 1)
      return { c: Math.round(col), r: Math.floor(row + 1e-6) + 1 };
    if (dir.y === -1)
      return { c: Math.round(col), r: Math.ceil(row - 1e-6) - 1 };
    return { c: Math.round(col), r: Math.round(row) };
  }

  function trimTrailAheadOfHead(trail, headC, headR, dir) {
    if (!trail || trail.length === 0 || !dir) return;
    while (trail.length > 0) {
      var last = trail[trail.length - 1];
      if (dir.x !== 0 && dir.y === 0) {
        if (
          Math.abs(last.r - headR) < 0.25 &&
          (last.c - headC) * dir.x > 1e-6
        ) {
          trail.pop();
        } else {
          break;
        }
      } else if (dir.y !== 0 && dir.x === 0) {
        if (
          Math.abs(last.c - headC) < 0.25 &&
          (last.r - headR) * dir.y > 1e-6
        ) {
          trail.pop();
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  function trimTrailBeforeCorner(
    trail,
    intC,
    intR,
    oldDir,
    newDir,
    oppCol,
    oppRow,
  ) {
    if (!trail || trail.length === 0) return;
    while (trail.length > 0) {
      var last = trail[trail.length - 1];
      if (last.c === intC && last.r === intR) {
        trail.pop();
        break;
      }
      var perpErr =
        newDir.x === 0 ? Math.abs(last.c - intC) : Math.abs(last.r - intR);
      var alongNew = (last.c - intC) * newDir.x + (last.r - intR) * newDir.y;
      if (perpErr < 0.25 && alongNew > 0) {
        trail.pop();
      } else {
        break;
      }
    }
    trimTrailAheadOfHead(trail, oppCol, oppRow, oldDir);
  }

  function hasCleanCornerInData(
    intC,
    intR,
    dataCol,
    dataRow,
    dataDir,
    dataTrail,
    dataLastSafe,
    resolvedTerritory,
  ) {
    var pastCorner =
      (dataCol - intC) * dataDir.x + (dataRow - intR) * dataDir.y;
    if (pastCorner < -0.05) return false;
    if (resolvedTerritory && resolvedTerritory.has(intC + "_" + intR)) {
      for (var i = dataTrail.length - 1; i >= 0; i--) {
        var pt = dataTrail[i];
        var perp =
          dataDir.x !== 0 ? Math.abs(pt.r - intR) : Math.abs(pt.c - intC);
        var along = (pt.c - intC) * dataDir.x + (pt.r - intR) * dataDir.y;
        if (perp > 0.25 || along <= 0) return false;
      }
      return !!(
        dataTrail.length === 0 ||
        (dataLastSafe && dataLastSafe.c === intC && dataLastSafe.r === intR)
      );
    }
    for (var i = dataTrail.length - 1; i >= 0; i--) {
      var pt = dataTrail[i];
      if (pt.c === intC && pt.r === intR) return true;
      var perp =
        dataDir.x !== 0 ? Math.abs(pt.r - intR) : Math.abs(pt.c - intC);
      var along = (pt.c - intC) * dataDir.x + (pt.r - intR) * dataDir.y;
      if (perp > 0.25 || along < 0) return false;
    }
    return false;
  }

  function advanceTrailAlongStraightSegment(
    opp,
    fromC,
    fromR,
    toC,
    toR,
    dir,
    allowPredictedCapture,
  ) {
    if (!dir || (dir.x === 0 && dir.y === 0)) return;
    var processDot = function (c, r) {
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
      var key = c + "_" + r;
      if (opp.territory && opp.territory.has(key)) {
        opp.lastSafe = { c: c, r: r };
        if (opp.trail.length > 0) {
          if (allowPredictedCapture) {
            opp.predictedCapture = {
              networkVersion: opp.networkTerritoryVersion || 1,
              captureC: c,
              captureR: r,
              dirX: dir.x,
              dirY: dir.y,
              time: Date.now(),
            };
            captureTerritory(opp, true);
          } else {
            opp.trail = [];
          }
        }
      } else {
        pushUniqueTrailPoint(opp.trail, c, r, opp.territory);
      }
    };

    if (dir.x === 1) {
      var rFixed = Math.round(fromR);
      var startC = Math.ceil(fromC - 1e-6);
      var endC = Math.floor(toC + 1e-6);
      for (var c = startC; c <= endC; c++) processDot(c, rFixed);
    } else if (dir.x === -1) {
      var rFixed = Math.round(fromR);
      var startC = Math.floor(fromC + 1e-6);
      var endC = Math.ceil(toC - 1e-6);
      for (var c = startC; c >= endC; c--) processDot(c, rFixed);
    } else if (dir.y === 1) {
      var cFixed = Math.round(fromC);
      var startR = Math.ceil(fromR - 1e-6);
      var endR = Math.floor(toR + 1e-6);
      for (var r = startR; r <= endR; r++) processDot(cFixed, r);
    } else if (dir.y === -1) {
      var cFixed = Math.round(fromC);
      var startR = Math.floor(fromR + 1e-6);
      var endR = Math.ceil(toR - 1e-6);
      for (var r = startR; r >= endR; r--) processDot(cFixed, r);
    }
  }

  function repairCollinearTrailGaps(opp) {
    if (!opp || opp.isDead) return;
    if (!opp.trail) opp.trail = [];

    // 1. Fill any missing dots in a straight line along the trail
    if (opp.trail.length > 0) {
      var expanded = [];
      var prevPt = opp.lastSafe
        ? { c: Math.round(opp.lastSafe.c), r: Math.round(opp.lastSafe.r) }
        : null;
      for (var i = 0; i < opp.trail.length; i++) {
        var curr = {
          c: Math.round(opp.trail[i].c),
          r: Math.round(opp.trail[i].r),
        };
        if (prevPt) {
          var dc = curr.c - prevPt.c;
          var dr = curr.r - prevPt.r;
          if (
            (dc === 0 && Math.abs(dr) > 1) ||
            (dr === 0 && Math.abs(dc) > 1)
          ) {
            var stepC = dc === 0 ? 0 : dc > 0 ? 1 : -1;
            var stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
            for (
              var gc = prevPt.c + stepC, gr = prevPt.r + stepR;
              gc !== curr.c || gr !== curr.r;
              gc += stepC, gr += stepR
            ) {
              pushUniqueTrailPoint(expanded, gc, gr, opp.territory);
            }
          }
        }
        pushUniqueTrailPoint(expanded, curr.c, curr.r, opp.territory);
        prevPt = curr;
      }
      opp.trail = expanded;
    }

    // 2. Make sure any dots between the last point (or lastSafe) and the head are filled in
    var tailStart =
      opp.trail.length > 0 ? opp.trail[opp.trail.length - 1] : opp.lastSafe;
    if (tailStart && opp.dir && (opp.dir.x !== 0 || opp.dir.y !== 0)) {
      var perpDiff =
        opp.dir.x !== 0
          ? Math.abs(opp.row - tailStart.r)
          : Math.abs(opp.col - tailStart.c);
      var along =
        (opp.col - tailStart.c) * opp.dir.x +
        (opp.row - tailStart.r) * opp.dir.y;
      if (perpDiff < 0.25 && along >= 1 - 1e-6) {
        advanceTrailAlongStraightSegment(
          opp,
          tailStart.c + opp.dir.x * 0.5,
          tailStart.r + opp.dir.y * 0.5,
          opp.col,
          opp.row,
          opp.dir,
          false,
        );
      }
    }
  }

  function clampEdgeCandidate(candidate, dx, dy, player, clickX, clickY) {
    if (!candidate || !player) return candidate;
    var margin = spacing * 0.45;
    if (
      clickX < offsetX - margin ||
      clickX > offsetX + (COLS - 1) * spacing + margin ||
      clickY < offsetY - margin ||
      clickY > offsetY + (ROWS - 1) * spacing + margin
    ) {
      return candidate;
    }

    var edgeEps = 0.15;
    var wouldDirExitEdge = function (dir) {
      return (
        (dir.x === -1 && player.col < edgeEps) ||
        (dir.x === 1 && player.col > COLS - 1 - edgeEps) ||
        (dir.y === -1 && player.row < edgeEps) ||
        (dir.y === 1 && player.row > ROWS - 1 - edgeEps)
      );
    };
    if (!wouldDirExitEdge(candidate)) return candidate;

    var alt = null;
    if (candidate.x !== 0 && Math.abs(dy) > 1e-6) {
      alt = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    } else if (candidate.y !== 0 && Math.abs(dx) > 1e-6) {
      alt = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    }
    if (
      alt &&
      !wouldDirExitEdge(alt) &&
      !(alt.x === -player.dir.x && alt.y === -player.dir.y)
    ) {
      return alt;
    }
    return null;
  }

  function forEachPlayer(fn) {
    if (user) fn(user);
    if (ai) fn(ai);
    var keys = Object.keys(opponents);
    for (var i = 0; i < keys.length; i++) {
      if (opponents[keys[i]]) fn(opponents[keys[i]]);
    }
  }

  function resetPlayerForMatchStart(p) {
    clearPlayerRoundFlags(p);
    p.prevCol = p.col;
    p.prevRow = p.row;
    p.lastEvalCol = p.col;
    p.lastEvalRow = p.row;
    p.lastPacketAt = 0;
    p.lastNetCol = p.col;
    p.lastNetRow = p.row;
    p.pendingTurn = null;
    p.predictedCapture = null;
    p.syncDriftOffset = 0;
    p.visualOffsetCol = 0;
    p.visualOffsetRow = 0;
    p.awaitingStartAckUntil = 0;
    p.lastSentTerritoryVersion = 0;
    p.lastFullTerritoryAt = 0;
    p.territoryChangedAt = 0;
  }

  function finalizeScheduledStart() {
    clearRestartSchedule();
    if (isExcluded) return;
    isGameActive = true;
    lastBroadcastTime = 0;
    forEachPlayer(function (p) {
      if (p !== user && p !== ai) {
        p.lastPacketAt = 0;
        p.lastNetCol = p.col;
        p.lastNetRow = p.row;
        p.syncDriftOffset = 0;
        p.visualOffsetCol = 0;
        p.visualOffsetRow = 0;
      }
    });
    if (isSharedGameMode() && broadcastUpdateCb) {
      broadcastUpdateCb();
      lastBroadcastTime = Date.now();
    }
  }

  function checkScheduledActivation() {
    if (
      restartActivateAt > 0 &&
      !isExcluded &&
      Date.now() >= restartActivateAt
    ) {
      finalizeScheduledStart();
      return true;
    }
    return false;
  }

  function scheduleMatchActivation(delayMs) {
    clearRestartSchedule();
    var safeDelay = delayMs !== undefined ? Math.max(0, delayMs) : 400;
    if (safeDelay === 0) {
      finalizeScheduledStart();
      return;
    }
    restartActivateAt = Date.now() + safeDelay;
    restartTimer = setTimeout(finalizeScheduledStart, safeDelay);
  }

  function activateAfterDelay(delayMs) {
    if (isExcluded) return;
    hasMatchStarted = true;
    isGameActive = false;
    scheduleMatchActivation(delayMs !== undefined ? delayMs : 400);
  }

  function getAllPlayersData() {
    var list = [];
    var localNetId = getLocalNetworkId(user ? user.networkId : null);
    if (user && localNetId && localNetId !== "local") {
      list.push({
        networkId: localNetId,
        name: user.name,
        data: GameMode.serialize(),
      });
    }
    var keys = Object.keys(opponents);
    for (var i = 0; i < keys.length; i++) {
      var opp = opponents[keys[i]];
      var netId = opp && opp.networkId ? opp.networkId : keys[i];
      if (opp && netId) {
        list.push({
          networkId: netId,
          name: opp.name,
          data: serializePlayer(opp),
        });
      }
    }
    return list;
  }

  function serializePlayer(p, includeTerritory) {
    var payload = {
      col: p.col,
      row: p.row,
      dir: { x: p.dir.x, y: p.dir.y },
      nextDir: { x: p.nextDir.x, y: p.nextDir.y },
      strokeColor: p.strokeColor,
      fillColor: p.fillColor,
      trail: cloneTrail(p.trail),
      territoryVersion: p.territoryVersion || 1,
      isDead: !!p.isDead,
      active: !!isGameActive,
      lastSafe: p.lastSafe ? { c: p.lastSafe.c, r: p.lastSafe.r } : null,
      spawnIndex: p.spawnIndex,
      roundId: currentRoundId,
      seq: p.networkSeq,
    };
    if (includeTerritory !== false) {
      payload.territory = p.territory ? Array.from(p.territory) : [];
    }
    return payload;
  }

  var GameMode = {
    setSpeed: function (val) {
      speed = val;
    },
    onLocalSpeedChange: function (val) {
      speed = val;
      if (!isHost || !presence || !messageSender) return;
      if (speedSyncTimer) clearTimeout(speedSyncTimer);
      speedSyncTimer = setTimeout(function () {
        messageSender({
          action: "update-speed",
          speed: val,
        });
      }, 150);
    },
    setAiLevel: function (level) {
      aiLevel = level;
    },
    setSharedSession: function (val) {
      isSharedSession = val;
    },
    getRoundId: function () {
      return currentRoundId;
    },
    incrementRoundId: function () {
      currentRoundId++;
      deadPlayersInRound = {};
      pendingHeadToHeadPairs = {};
      resetRoundOutcomeTracking();
      return currentRoundId;
    },
    getMySpawnIndex: function () {
      if (!presence) return 0;
      return mySharedSpawnIndex;
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
    setTotalPlayers: function (count) {
      sharedTotalPlayers = Math.min(8, Math.max(1, count));
    },
    deactivate: function () {
      isGameActive = false;
      clearRestartSchedule();
    },
    tickBackground: function (delta) {
      if (isClientBlocked()) return;
      checkScheduledActivation();
      if (!isGameActive) return;
      var remaining = Math.min(
        Math.max(delta !== undefined && delta > 0 ? delta : 16.666, 16.666),
        1000,
      );
      while (remaining > 0) {
        var step = Math.min(50, remaining);
        updateGame(step);
        remaining -= step;
      }
    },

    onMouseDown: function (mouseX, mouseY) {
      if (!isGameActive || !user || user.isDead || isExcluded) return;
      isMouseDown = true;

      var headCoords = getBaseCoords(user.col, user.row);
      var dx = mouseX - headCoords.x;
      var dy = mouseY - headCoords.y;

      // Turn toward the clicked spot (no 180 degree U turns)
      var candidate = null;
      if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) {
        candidate = null;
      } else if (Math.abs(Math.abs(dx) - Math.abs(dy)) < 1e-6) {
        // On an exact diagonal, pick the direction sideways to current travel
        candidate =
          user.dir.y !== 0
            ? dx > 0
              ? { x: 1, y: 0 }
              : { x: -1, y: 0 }
            : dy > 0
              ? { x: 0, y: 1 }
              : { x: 0, y: -1 };
      } else if (Math.abs(dx) > Math.abs(dy)) {
        candidate = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      } else {
        candidate = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      }
      candidate = clampEdgeCandidate(candidate, dx, dy, user, mouseX, mouseY);
      trySetUserNextDir(candidate);
    },
    onMouseMove: function (mouseX, mouseY, prevX, prevY) {
      if (
        !isGameActive ||
        !user ||
        user.isDead ||
        isExcluded ||
        prevX === -1000 ||
        !isMouseDown
      )
        return;
      var dx = mouseX - prevX;
      var dy = mouseY - prevY;

      // If dragged pixels, change direction
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        var candidate =
          Math.abs(dx) > Math.abs(dy)
            ? dx > 0
              ? { x: 1, y: 0 }
              : { x: -1, y: 0 }
            : dy > 0
              ? { x: 0, y: 1 }
              : { x: 0, y: -1 };
        candidate = clampEdgeCandidate(candidate, dx, dy, user, mouseX, mouseY);
        trySetUserNextDir(candidate);
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

      if (isClientBlocked()) {
        return;
      }

      // Update logic
      updateGame(delta);

      // Draw percentage bar
      if (user) {
        var total = COLS * ROWS;
        var userPct = user.territory.size / total;

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
        var aiRender = keys.length > 0 ? opponents[keys[0]] : ai;
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
        var cells = [];
        var fillSize = spacing + 2;
        var halfFill = fillSize / 2;
        ctx.fillStyle = player.fillColor;
        player.territory.forEach(function (key) {
          var parts = key.split("_");
          var c = parseInt(parts[0]);
          var r = parseInt(parts[1]);
          var b = getBaseCoords(c, r);
          cells.push({ c: c, r: r, x: b.x, y: b.y });
          ctx.fillRect(b.x - halfFill, b.y - halfFill, fillSize, fillSize);
        });

        // Draw outer border
        ctx.beginPath();
        ctx.strokeStyle = player.strokeColor;
        ctx.lineWidth = 6;
        ctx.lineCap = "square";
        var hs = spacing / 2;
        for (var i = 0; i < cells.length; i++) {
          var cell = cells[i];
          var c = cell.c,
            r = cell.r,
            bx = cell.x,
            by = cell.y;
          if (!player.territory.has(c + "_" + (r - 1))) {
            ctx.moveTo(bx - hs, by - hs);
            ctx.lineTo(bx + hs, by - hs);
          }
          if (!player.territory.has(c + "_" + (r + 1))) {
            ctx.moveTo(bx - hs, by + hs);
            ctx.lineTo(bx + hs, by + hs);
          }
          if (!player.territory.has(c - 1 + "_" + r)) {
            ctx.moveTo(bx - hs, by - hs);
            ctx.lineTo(bx - hs, by + hs);
          }
          if (!player.territory.has(c + 1 + "_" + r)) {
            ctx.moveTo(bx + hs, by - hs);
            ctx.lineTo(bx + hs, by + hs);
          }
        }
        ctx.stroke();
      };
      forEachPlayer(drawTerritory);

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
        var trailEndCol = player.col;
        var trailEndRow = player.row;
        var visHeadCol = player.col + (player.visualOffsetCol || 0);
        var visHeadRow = player.row + (player.visualOffsetRow || 0);
        var lastTrailAnchor = player.trail[player.trail.length - 1];
        if (player.dir && player.dir.x !== 0) {
          var minC = Math.min(lastTrailAnchor.c, trailEndCol);
          var maxC = Math.max(lastTrailAnchor.c, trailEndCol);
          trailEndCol = Math.max(minC, Math.min(maxC, visHeadCol));
        } else if (player.dir && player.dir.y !== 0) {
          var minR = Math.min(lastTrailAnchor.r, trailEndRow);
          var maxR = Math.max(lastTrailAnchor.r, trailEndRow);
          trailEndRow = Math.max(minR, Math.min(maxR, visHeadRow));
        }
        var head = getBaseCoords(trailEndCol, trailEndRow);
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
      forEachPlayer(drawTrail);
    },

    drawFrontDots: function (ctx) {
      if (isClientBlocked()) return;
      // Draw heads
      var drawHead = function (player) {
        if (!player || player.isDead) return;
        var pt = getBaseCoords(
          player.col + (player.visualOffsetCol || 0),
          player.row + (player.visualOffsetRow || 0),
        );
        ctx.fillStyle = player.strokeColor;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      };
      forEachPlayer(drawHead);
    },

    isDotCompleted: function (dot) {
      return false; // keep dots active
    },
    isDrawingActive: function () {
      return true;
    },
    getDotColor: function (dot) {
      if (isClientBlocked()) return null;
      var key = dot.col + "_" + dot.row;
      var color = null;
      forEachPlayer(function (p) {
        if (color || p.isDead) return;
        for (var i = 0; i < p.trail.length; i++) {
          if (p.trail[i].c === dot.col && p.trail[i].r === dot.row) {
            color = p.strokeColor;
            return;
          }
        }
      });
      if (color) return color;
      forEachPlayer(function (p) {
        if (!color && !p.isDead && p.territory.has(key)) {
          color = p.fillColor;
        }
      });
      return color;
    },

    // Wave animation
    getPlayerPositions: function () {
      if (isClientBlocked() || !isGameActive) return [];
      var positions = [];
      forEachPlayer(function (p) {
        if (!p.isDead)
          positions.push(
            getBaseCoords(
              p.col + (p.visualOffsetCol || 0),
              p.row + (p.visualOffsetRow || 0),
            ),
          );
      });
      return positions;
    },

    serialize: function () {
      if (isExcluded || !user) return {};
      user.networkSeq = (user.networkSeq || 0) + 1;
      return serializePlayer(user, true);
    },
    serializeNetworkUpdate: function () {
      if (isExcluded || !user) return {};
      user.networkSeq = (user.networkSeq || 0) + 1;
      var now = Date.now();
      var tv = user.territoryVersion || 1;
      var includeTerritory =
        !isGameActive ||
        user.lastSentTerritoryVersion !== tv ||
        (user.territoryChangedAt && now - user.territoryChangedAt < 250) ||
        !user.lastFullTerritoryAt ||
        now - user.lastFullTerritoryAt >= 1000;
      if (includeTerritory) {
        user.lastSentTerritoryVersion = tv;
        user.lastFullTerritoryAt = now;
      }
      return serializePlayer(user, includeTerritory);
    },
    deserialize: function (data, isInit, networkId, oppName) {
      if (isClientBlocked()) return;
      if (
        !networkId ||
        !data ||
        data.col === undefined ||
        data.row === undefined
      )
        return;
      var localNetId = getLocalNetworkId(null);
      if (localNetId && networkId === localNetId) return;
      if (
        !isHost &&
        isSharedSession &&
        ((hostNetworkId && networkId === hostNetworkId) ||
          (!hostNetworkId && data.spawnIndex === 0))
      ) {
        if (!hostNetworkId && data.spawnIndex === 0) hostNetworkId = networkId;
        lastHostPacketAt = Date.now();
      }
      if (data.roundId !== undefined && data.roundId !== currentRoundId) return; // Drop packets from other rounds
      if (isInit) {
        delete departedPlayers[networkId];
      } else {
        if (departedPlayers[networkId]) return;
        if (
          isHost &&
          isSharedSession &&
          !opponents[networkId] &&
          activePlayerSlots[networkId] === undefined
        ) {
          return;
        }
      }
      var isNewOpponent = false;
      if (!opponents[networkId]) {
        if (Object.keys(opponents).length >= 7) {
          return; // Maximum 8 players (1 local user + 7 opponents)
        }
        // New opponent
        var stroke = data.strokeColor || DEFAULT_OPP_STROKE;
        var fill = data.fillColor || DEFAULT_OPP_FILL;
        var dirX = data.dir && data.dir.x !== undefined ? data.dir.x : 0;
        var dirY = data.dir && data.dir.y !== undefined ? data.dir.y : 0;
        opponents[networkId] = initPlayer(
          data.col,
          data.row,
          stroke,
          fill,
          dirX,
          dirY,
          oppName || "Player",
          networkId,
        );
        if (data.spawnIndex !== undefined)
          opponents[networkId].spawnIndex = data.spawnIndex;
        if (onOpponentCountChangedCb)
          onOpponentCountChangedCb(Object.keys(opponents).length);
        isNewOpponent = true;
      }

      var opp = opponents[networkId];
      if (oppName) opp.name = oppName;
      if (data.spawnIndex !== undefined) opp.spawnIndex = data.spawnIndex;
      if (data.strokeColor) opp.strokeColor = data.strokeColor;
      if (data.fillColor) opp.fillColor = data.fillColor;

      if (data.isDead && !opp.isDead) {
        markDeadState(opp);
        return;
      } else if (deadPlayersInRound[networkId]) {
        if (!opp.isDead) {
          markDeadState(opp);
        }
        return;
      } else if (opp.isDead) {
        // Keep dead players dead during an active or finished round;
        // only pre start lobby or rematch resets can clear death state
        if (isInit && !data.isDead && isInLobbyOrCountdown()) {
          clearPlayerRoundFlags(opp);
        } else {
          markPlayerDeadInRound(opp);
          return;
        }
      } else if (!data.isDead && isInit && isInLobbyOrCountdown()) {
        clearPlayerRoundFlags(opp);
      }

      var dataDir =
        data.dir && data.dir.x !== undefined && data.dir.y !== undefined
          ? data.dir
          : opp.dir;
      var dataNextDir =
        data.nextDir &&
        data.nextDir.x !== undefined &&
        data.nextDir.y !== undefined
          ? data.nextDir
          : dataDir;
      var dataTrail = data.trail ? cloneTrail(data.trail) : [];

      if (
        !isInit &&
        !isInLobbyOrCountdown() &&
        data.seq !== undefined &&
        opp.lastNetworkSeq !== undefined &&
        data.seq < opp.lastNetworkSeq
      ) {
        return;
      }

      var currentNetVersion = opp.networkTerritoryVersion || 1;
      var newVersion = data.territoryVersion || 1;
      var isNewCapture = newVersion > currentNetVersion;
      var isStaleVersion = newVersion < currentNetVersion;
      if (isStaleVersion && !isInLobbyOrCountdown()) {
        return;
      }
      if (data.seq !== undefined) {
        opp.lastNetworkSeq = isInit
          ? data.seq
          : Math.max(opp.lastNetworkSeq || 0, data.seq);
        opp.networkSeq = opp.lastNetworkSeq;
      }
      opp.lastPacketAt = isInit ? 0 : Date.now();
      opp.lastNetCol = data.col;
      opp.lastNetRow = data.row;
      if (!isInit && data.active !== false) {
        opp.awaitingStartAckUntil = 0;
      }
      var isRestart = isStaleVersion && isInLobbyOrCountdown();
      var wasPredictedCapture = !!opp.predictedCapture;

      if (
        isNewCapture ||
        isRestart ||
        isInit ||
        isNewOpponent ||
        !isGameActive
      ) {
        opp.predictedCapture = null;
      }

      var isPerpTurn = function (d1, d2) {
        return (
          (d1.x !== d2.x || d1.y !== d2.y) && d1.x * d2.x + d1.y * d2.y === 0
        );
      };

      // Hold off reverting a predicted capture if the opponent is still heading toward that same dot
      if (!isNewCapture && !isRestart && !isInit && opp.predictedCapture) {
        var pc = opp.predictedCapture;
        var distPastCapture =
          (data.col - pc.captureC) * pc.dirX +
          (data.row - pc.captureR) * pc.dirY;
        var perpCapture =
          pc.dirX !== 0
            ? Math.abs(data.row - pc.captureR)
            : Math.abs(data.col - pc.captureC);
        var nextTurnBeforeCapture = false;
        if (
          dataDir.x === pc.dirX &&
          dataDir.y === pc.dirY &&
          isPerpTurn(dataNextDir, dataDir)
        ) {
          var nextTurnPt = getNextIntersectionAlongDir(
            data.col,
            data.row,
            dataDir,
          );
          if (
            (pc.captureC - nextTurnPt.c) * pc.dirX +
              (pc.captureR - nextTurnPt.r) * pc.dirY >
            0
          ) {
            nextTurnBeforeCapture = true;
          }
        }
        if (
          dataDir.x === pc.dirX &&
          dataDir.y === pc.dirY &&
          perpCapture < 0.25 &&
          distPastCapture < 0.05 &&
          distPastCapture > -3.0 &&
          !nextTurnBeforeCapture &&
          Date.now() - pc.time < 900
        ) {
          return;
        }
        opp.predictedCapture = null;
      }

      var dist = Math.abs(opp.col - data.col) + Math.abs(opp.row - data.row);

      // Keep track of which dots actually belong to them
      var resolvedTerritory = data.territory
        ? new Set()
        : opp.territory || new Set();

      if (data.territory) {
        var isPreStartPhase = isInLobbyOrCountdown();
        for (var i = 0; i < data.territory.length; i++) {
          var key = data.territory[i];

          if (isInit || isNewCapture || isRestart || dist > 10.0) {
            // On init or a new capture, take these dots from other players and give them to this opponent
            removeDotFromOthers(opp, key);
            resolvedTerritory.add(key);
          } else {
            // Skip old packets trying to take back dots someone else just captured
            var claimedByOther = false;
            forEachPlayer(function (other) {
              if (
                !claimedByOther &&
                other !== opp &&
                other.territory &&
                other.territory.has(key)
              ) {
                claimedByOther = true;
              }
            });
            if (!claimedByOther) {
              resolvedTerritory.add(key);
            }
          }
        }
        if (
          isPreStartPhase &&
          !data.isDead &&
          resolvedTerritory.size === 0 &&
          data.territory.length > 0
        ) {
          for (var rt = 0; rt < data.territory.length; rt++) {
            resolvedTerritory.add(data.territory[rt]);
          }
        }
        opp.territoryVersion = newVersion;
        opp.networkTerritoryVersion = newVersion;
      }

      var prevVisCol = opp.col + (opp.visualOffsetCol || 0);
      var prevVisRow = opp.row + (opp.visualOffsetRow || 0);
      var preserveVisualFromPrev = function () {
        var cap = 2.0;
        opp.visualOffsetCol = Math.max(
          -cap,
          Math.min(cap, prevVisCol - opp.col),
        );
        opp.visualOffsetRow = Math.max(
          -cap,
          Math.min(cap, prevVisRow - opp.row),
        );
      };
      // Ignore expected one way transit delta so real time dead reckoning does not pulse slower and faster
      var latencyDeadband = Math.min(1.5, Math.max(0.45, speed * 17));
      var computeDriftOffset = function (deltaAlongDir) {
        if (deltaAlongDir < 0) {
          return -deltaAlongDir <= latencyDeadband
            ? 0
            : Math.max(-2.5, deltaAlongDir + latencyDeadband);
        }
        return Math.min(3.0, deltaAlongDir);
      };

      var applyTerritoryAndSafe = function () {
        opp.territory = resolvedTerritory;
        if (data.lastSafe) {
          opp.lastSafe = {
            c: Math.round(data.lastSafe.c),
            r: Math.round(data.lastSafe.r),
          };
        }
      };

      var snapToData = function (allowSmooth) {
        opp.col = Math.max(0, Math.min(COLS - 1, data.col));
        opp.row = Math.max(0, Math.min(ROWS - 1, data.row));
        opp.prevCol = opp.col;
        opp.prevRow = opp.row;
        opp.dir = { x: dataDir.x, y: dataDir.y };
        opp.nextDir = { x: dataNextDir.x, y: dataNextDir.y };
        opp.pendingTurn = null;
        opp.lastTurnCell = null;
        opp.syncDriftOffset = 0;
        if (allowSmooth && dist <= 3.5) {
          preserveVisualFromPrev();
        } else {
          opp.visualOffsetCol = 0;
          opp.visualOffsetRow = 0;
        }
        applyTerritoryAndSafe();
        opp.trail = dataTrail;
        trimTrailAheadOfHead(opp.trail, opp.col, opp.row, opp.dir);
        repairCollinearTrailGaps(opp);
      };

      if (
        isInLobbyOrCountdown() ||
        dist > 10.0 ||
        isInit ||
        isNewOpponent ||
        isRestart
      ) {
        snapToData(false);
        return;
      }
      if (isNewCapture && !wasPredictedCapture) {
        if (dist > 2.5) {
          snapToData(dist <= 3.5);
          return;
        }
      }

      var syncQueuedNextDir = function () {
        if (
          !isPerpTurn(dataNextDir, dataDir) ||
          opp.dir.x !== dataDir.x ||
          opp.dir.y !== dataDir.y
        ) {
          opp.nextDir = { x: dataNextDir.x, y: dataNextDir.y };
          opp.pendingTurn = null;
          return;
        }
        var oppNext = getNextIntersectionAlongDir(opp.col, opp.row, opp.dir);
        var dataNext = getNextIntersectionAlongDir(data.col, data.row, dataDir);
        if (oppNext.c === dataNext.c && oppNext.r === dataNext.r) {
          opp.nextDir = { x: dataNextDir.x, y: dataNextDir.y };
          opp.pendingTurn = null;
        } else {
          opp.nextDir = { x: opp.dir.x, y: opp.dir.y };
          opp.pendingTurn = {
            c: dataNext.c,
            r: dataNext.r,
            dir: { x: dataNextDir.x, y: dataNextDir.y },
          };
        }
      };

      var sameDir = opp.dir.x === dataDir.x && opp.dir.y === dataDir.y;

      if (!sameDir) {
        var isPerp = opp.dir.x * dataDir.x + opp.dir.y * dataDir.y === 0;

        // Ignore old pre turn packets if we already predicted the turn locally
        if (
          isPerp &&
          opp.dir.x === dataNextDir.x &&
          opp.dir.y === dataNextDir.y
        ) {
          var cornerC = Math.round(opp.dir.x === 0 ? opp.col : data.col);
          var cornerR = Math.round(opp.dir.y === 0 ? opp.row : data.row);
          var oppOnLine =
            opp.dir.x === 0
              ? Math.abs(opp.col - cornerC) < 0.15
              : Math.abs(opp.row - cornerR) < 0.15;
          var dataOnLine =
            dataDir.x === 0
              ? Math.abs(data.col - cornerC) < 0.15
              : Math.abs(data.row - cornerR) < 0.15;
          var dataDistBeforeCorner =
            (cornerC - data.col) * dataDir.x + (cornerR - data.row) * dataDir.y;
          var oppDistPastCorner =
            (opp.col - cornerC) * opp.dir.x + (opp.row - cornerR) * opp.dir.y;

          if (
            oppOnLine &&
            dataOnLine &&
            dataDistBeforeCorner > 0 &&
            dataDistBeforeCorner < 1.5 &&
            oppDistPastCorner >= -0.05 &&
            oppDistPastCorner < 2.5
          ) {
            applyTerritoryAndSafe();
            repairCollinearTrailGaps(opp);
            return;
          }
        }

        if (!isPerp) {
          // Opposite direction means at least two turns happened between packets, so jump to the latest position
          snapToData(true);
          return;
        }

        // Line up a 90 degree turn around corner (intC, intR)
        var intC = Math.round(opp.dir.x === 0 ? opp.col : data.col);
        var intR = Math.round(opp.dir.y === 0 ? opp.row : data.row);
        var oppPerpErr =
          opp.dir.x !== 0 ? Math.abs(opp.row - intR) : Math.abs(opp.col - intC);
        var dataPerpErr =
          dataDir.x !== 0
            ? Math.abs(data.row - intR)
            : Math.abs(data.col - intC);
        var dataPastCorner =
          (data.col - intC) * dataDir.x + (data.row - intR) * dataDir.y;

        if (
          intC < 0 ||
          intC >= COLS ||
          intR < 0 ||
          intR >= ROWS ||
          oppPerpErr > 0.25 ||
          dataPerpErr > 0.25 ||
          dataPastCorner < -0.05 ||
          dataPastCorner > 5.0 ||
          !hasCleanCornerInData(
            intC,
            intR,
            data.col,
            data.row,
            dataDir,
            dataTrail,
            data.lastSafe,
            resolvedTerritory,
          )
        ) {
          snapToData(true);
          return;
        }

        var pivotOppAtCorner = function (pastDist) {
          opp.prevCol = intC;
          opp.prevRow = intR;
          opp.col = Math.max(
            0,
            Math.min(COLS - 1, intC + dataDir.x * pastDist),
          );
          opp.row = Math.max(
            0,
            Math.min(ROWS - 1, intR + dataDir.y * pastDist),
          );
          opp.dir = { x: dataDir.x, y: dataDir.y };
          syncQueuedNextDir();
          opp.lastTurnCell =
            Math.abs(pastDist) < 1e-6 ? { c: intC, r: intR } : null;
          opp.trail = dataTrail;
          preserveVisualFromPrev();
        };

        var signedOvershoot =
          (opp.col - intC) * opp.dir.x + (opp.row - intR) * opp.dir.y;
        applyTerritoryAndSafe();

        if (signedOvershoot >= 0 && signedOvershoot <= 2.5) {
          var turnLag = dataPastCorner - signedOvershoot;
          var newPast =
            signedOvershoot >= dataPastCorner || turnLag <= 1.25
              ? signedOvershoot
              : signedOvershoot + turnLag * 0.5;
          pivotOppAtCorner(newPast);
          opp.syncDriftOffset = computeDriftOffset(dataPastCorner - newPast);

          if (newPast < dataPastCorner) {
            trimTrailAheadOfHead(opp.trail, opp.col, opp.row, opp.dir);
          } else {
            advanceTrailAlongStraightSegment(
              opp,
              intC,
              intR,
              intC,
              intR,
              opp.dir,
              false,
            );
            advanceTrailAlongStraightSegment(
              opp,
              data.col,
              data.row,
              opp.col,
              opp.row,
              opp.dir,
              true,
            );
          }
          repairCollinearTrailGaps(opp);
        } else if (signedOvershoot < 0) {
          var lagBeforeCorner = -signedOvershoot;
          var totalLag = lagBeforeCorner + Math.max(0, dataPastCorner);
          var oppNextInt = getNextIntersectionAlongDir(
            opp.col,
            opp.row,
            opp.dir,
          );

          if (
            totalLag <= 3.5 &&
            lagBeforeCorner < 2.0 &&
            oppNextInt.c === intC &&
            oppNextInt.r === intR
          ) {
            if (totalLag <= 1.25) {
              // Keep moving smoothly along current line and round the corner at the intersection
              opp.nextDir = { x: dataDir.x, y: dataDir.y };
              opp.pendingTurn = null;
              opp.syncDriftOffset = Math.min(3.0, totalLag);
              opp.trail = dataTrail;
              trimTrailBeforeCorner(
                opp.trail,
                intC,
                intR,
                opp.dir,
                dataDir,
                opp.col,
                opp.row,
              );
              repairCollinearTrailGaps(opp);
            } else {
              var halfLag = totalLag * 0.5;
              if (halfLag >= lagBeforeCorner) {
                var cornerPast = Math.min(
                  dataPastCorner,
                  halfLag - lagBeforeCorner,
                );
                pivotOppAtCorner(cornerPast);
                opp.syncDriftOffset = computeDriftOffset(
                  dataPastCorner - cornerPast,
                );
                trimTrailAheadOfHead(opp.trail, opp.col, opp.row, opp.dir);
                repairCollinearTrailGaps(opp);
              } else {
                opp.col = Math.max(
                  0,
                  Math.min(COLS - 1, opp.col + opp.dir.x * halfLag),
                );
                opp.row = Math.max(
                  0,
                  Math.min(ROWS - 1, opp.row + opp.dir.y * halfLag),
                );
                preserveVisualFromPrev();
                opp.nextDir = { x: dataDir.x, y: dataDir.y };
                opp.pendingTurn = null;
                opp.syncDriftOffset = Math.min(3.0, totalLag - halfLag);
                opp.trail = dataTrail;
                trimTrailBeforeCorner(
                  opp.trail,
                  intC,
                  intR,
                  opp.dir,
                  dataDir,
                  opp.col,
                  opp.row,
                );
                repairCollinearTrailGaps(opp);
              }
            }
          } else {
            snapToData(true);
          }
        } else {
          snapToData(true);
        }
        return;
      }

      // Same direction: make sure they are still on the same line
      var perpDiff =
        opp.dir.x !== 0
          ? Math.abs(opp.row - data.row)
          : Math.abs(opp.col - data.col);
      if (perpDiff > 0.25) {
        snapToData(true);
        return;
      }

      // Fix small sideways drift back onto the grid line
      if (opp.dir.x !== 0) opp.row = data.row;
      else opp.col = data.col;

      applyTerritoryAndSafe();

      var forwardDelta =
        (data.col - opp.col) * opp.dir.x + (data.row - opp.row) * opp.dir.y;

      // If the opponent already passed a queued turn dot locally, turn them onto it
      if (forwardDelta <= 0 && isPerpTurn(dataNextDir, dataDir)) {
        var queuedTurnPt = getNextIntersectionAlongDir(
          data.col,
          data.row,
          dataDir,
        );
        var overshotTurn =
          (opp.col - queuedTurnPt.c) * opp.dir.x +
          (opp.row - queuedTurnPt.r) * opp.dir.y;
        if (
          overshotTurn >= -1e-6 &&
          overshotTurn < 2.0 &&
          queuedTurnPt.c >= 0 &&
          queuedTurnPt.c < COLS &&
          queuedTurnPt.r >= 0 &&
          queuedTurnPt.r < ROWS
        ) {
          var pivotAdvance = Math.max(0, overshotTurn);
          opp.trail = dataTrail;
          advanceTrailAlongStraightSegment(
            opp,
            data.col,
            data.row,
            queuedTurnPt.c,
            queuedTurnPt.r,
            dataDir,
            true,
          );
          opp.prevCol = queuedTurnPt.c;
          opp.prevRow = queuedTurnPt.r;
          opp.col = Math.max(
            0,
            Math.min(COLS - 1, queuedTurnPt.c + dataNextDir.x * pivotAdvance),
          );
          opp.row = Math.max(
            0,
            Math.min(ROWS - 1, queuedTurnPt.r + dataNextDir.y * pivotAdvance),
          );
          opp.dir = { x: dataNextDir.x, y: dataNextDir.y };
          opp.nextDir = { x: dataNextDir.x, y: dataNextDir.y };
          opp.pendingTurn = null;
          opp.lastTurnCell =
            Math.abs(pivotAdvance) < 1e-6
              ? { c: queuedTurnPt.c, r: queuedTurnPt.r }
              : null;
          preserveVisualFromPrev();
          var distBeforeTurn =
            Math.abs(queuedTurnPt.c - data.col) +
            Math.abs(queuedTurnPt.r - data.row);
          opp.syncDriftOffset = computeDriftOffset(
            -(distBeforeTurn + pivotAdvance),
          );
          advanceTrailAlongStraightSegment(
            opp,
            queuedTurnPt.c,
            queuedTurnPt.r,
            opp.col,
            opp.row,
            opp.dir,
            true,
          );
          repairCollinearTrailGaps(opp);
          return;
        }
      }

      if (forwardDelta > 0) {
        // Packet is ahead of where we have them
        if (forwardDelta > 3.5) {
          snapToData(false);
          return;
        }

        if (forwardDelta > 1.25) {
          var advDist = forwardDelta * 0.5;
          opp.col = Math.max(
            0,
            Math.min(COLS - 1, opp.col + opp.dir.x * advDist),
          );
          opp.row = Math.max(
            0,
            Math.min(ROWS - 1, opp.row + opp.dir.y * advDist),
          );
          opp.syncDriftOffset = Math.min(3.0, forwardDelta - advDist);
        } else {
          opp.syncDriftOffset = forwardDelta;
        }
        preserveVisualFromPrev();
        if (data.lastSafe) {
          var safeOnLine =
            opp.dir.x !== 0
              ? Math.abs(data.lastSafe.r - opp.row) < 0.25
              : Math.abs(data.lastSafe.c - opp.col) < 0.25;
          var dataPastSafe =
            (data.col - data.lastSafe.c) * opp.dir.x +
            (data.row - data.lastSafe.r) * opp.dir.y;
          var behindSafe =
            (data.lastSafe.c - opp.col) * opp.dir.x +
            (data.lastSafe.r - opp.row) * opp.dir.y;
          if (safeOnLine && dataPastSafe >= -0.05 && behindSafe > 1.25) {
            snapToData(true);
            return;
          }
        }
        syncQueuedNextDir();
        opp.trail = dataTrail;
        trimTrailAheadOfHead(opp.trail, opp.col, opp.row, opp.dir);

        // Keep every dot from lastSafe up to the head
        repairCollinearTrailGaps(opp);
      } else {
        // Our local position is ahead of or matching the packet
        if (-forwardDelta > 4.0) {
          snapToData(false);
          return;
        }
        preserveVisualFromPrev();
        opp.syncDriftOffset = computeDriftOffset(forwardDelta);
        syncQueuedNextDir();
        opp.trail = dataTrail;
        advanceTrailAlongStraightSegment(
          opp,
          data.col,
          data.row,
          opp.col,
          opp.row,
          opp.dir,
          true,
        );
        repairCollinearTrailGaps(opp);
      }
    },
    restart: function (isRobotOn, spawnIndex, delayMs) {
      if (isExcluded) {
        clearExcludedState();
        return;
      }
      if (spawnIndex === undefined) spawnIndex = GameMode.getMySpawnIndex();
      restartGame(isRobotOn, spawnIndex, delayMs);
    },
    previewGame: function (
      isRobotOn,
      spawnIndex,
      keepOpponents,
      skipBroadcast,
    ) {
      if (isExcluded) {
        clearExcludedState();
        if (onOpponentCountChangedCb) {
          onOpponentCountChangedCb(0);
        }
        return;
      }
      if (spawnIndex === undefined) spawnIndex = GameMode.getMySpawnIndex();
      spawnIndex = spawnIndex || 0;
      var spawns = getSpawns();
      var sp = spawns[spawnIndex % spawns.length];

      user = createLocalUser(sp, spawnIndex, getLocalNetworkId("local"));
      ai = isRobotOn ? createAiPlayer(spawns) : null;
      var shouldKeepOpponents =
        keepOpponents !== undefined
          ? !!keepOpponents
          : isSharedSession || presence !== null;
      if (!shouldKeepOpponents) {
        opponents = {};
        if (onOpponentCountChangedCb) onOpponentCountChangedCb(0);
      }
      clearRestartSchedule();
      hasMatchStarted = false;
      isGameActive = false;
      deadPlayersInRound = {};
      pendingHeadToHeadPairs = {};
      resetRoundOutcomeTracking();
      if (broadcastUpdateCb && !skipBroadcast) broadcastUpdateCb();
    },
    startGame: function (isRobotOn, spawnIndex, delayMs) {
      if (isExcluded) {
        clearExcludedState();
        return;
      }
      hasMatchStarted = true;
      if (user && (!user.networkId || user.networkId === "local")) {
        user.networkId = getLocalNetworkId(user.networkId);
      }
      var isSharedMode = isSharedGameMode();
      forEachPlayer(function (p) {
        if (p === ai && isSharedMode) return;
        if (!p.isDead && !(p.networkId && deadPlayersInRound[p.networkId])) {
          resetPlayerForMatchStart(p);
        }
      });
      if (!isSharedMode && isRobotOn && !ai) {
        ai = createAiPlayer(getSpawns());
      }
      if (delayMs && delayMs > 0) {
        activateAfterDelay(delayMs);
      } else {
        clearRestartSchedule();
        isGameActive = true;
        lastBroadcastTime = 0;
        if (isSharedMode && isHost) {
          var ackUntil = Date.now() + 180;
          forEachPlayer(function (p) {
            if (p !== user && p !== ai && !p.isDead && !p.lastPacketAt) {
              p.awaitingStartAckUntil = ackUntil;
            }
          });
        }
      }
    },
    getOpponentCount: function () {
      return Object.keys(opponents).length;
    },
    setBuddyColors: function (stroke, fill) {
      buddyStrokeColor = stroke;
      buddyFillColor = fill;
      if (user) {
        user.strokeColor = buddyStrokeColor;
        user.fillColor = buddyFillColor;
      }
    },
    setLocalPlayerName: function (name) {
      localPlayerName = name;
      if (user) user.name = name;
    },
    isGameActive: function () {
      return isGameActive;
    },
    refreshLobbySpawn: function (forceDuringRestartDelay, newSpawnIndex) {
      if (
        !user ||
        isGameActive ||
        user.isDead ||
        (user.networkId && deadPlayersInRound[user.networkId])
      )
        return;
      if (newSpawnIndex !== undefined) {
        user.spawnIndex = newSpawnIndex;
      }
      if (user.spawnIndex === undefined) return;
      if (hasMatchStarted && !forceDuringRestartDelay) return;
      var spawns = getSpawns();
      resetPlayerToSpawn(user, spawns[user.spawnIndex % spawns.length]);
    },
    setExcluded: function (val) {
      isExcluded = !!val;
      if (isExcluded) {
        clearExcludedState();
        clearRestartSchedule();
        if (onOpponentCountChangedCb) {
          onOpponentCountChangedCb(0);
        }
      }
    },
    isExcluded: function () {
      return isExcluded;
    },
    initNetwork: function (
      presenceObj,
      hostFlag,
      _activityObj,
      humaneObj,
      l10nObj,
      iconObj,
    ) {
      presence = presenceObj;
      isHost = hostFlag;
      if (humaneObj) humane = humaneObj;
      if (l10nObj) l10n = l10nObj;
      if (iconObj) icon = iconObj;

      if (isHost) {
        hostNetworkId = null;
        lastHostPacketAt = 0;
        admittedInitTokens = {};
        activePlayerSlots = {};
        activePlayerMeta = {};
        departedPlayers = {};
        deadPlayersInRound = {};
        pendingHeadToHeadPairs = {};
        resetRoundOutcomeTracking();
        userSpawnMap = {};
        roomUsers = {};
        roomUserSlots = {};
        mySharedSpawnIndex = 0;
        isExcluded = false;
        sharedTotalPlayers = 1;
        currentRoundId = 1;
      } else if (presence) {
        hostNetworkId = null;
        lastHostPacketAt = 0;
        departedPlayers = {};
        deadPlayersInRound = {};
        pendingHeadToHeadPairs = {};
        resetRoundOutcomeTracking();
        clearExcludedState();
        clearRestartSchedule();
      }
    },
    syncRoomUsersToGameMode: function () {
      if (!isHost || !presence) return;
      var ids = Object.keys(roomUsers);
      for (var i = 0; i < ids.length; i++) {
        var nid = ids[i];
        var u = roomUsers[nid];
        if (!u || activePlayerSlots[nid] !== undefined) continue;
        var jr = handleUserJoin(u, roomUserSlots[nid]);
        if (jr && jr.allowed) {
          roomUserSlots[nid] = jr.spawnIndex;
        }
      }
    },
    hasRoomUsers: function () {
      return Object.keys(roomUsers).length > 0;
    },
    getRoomTotalUsers: function () {
      return 1 + Object.keys(roomUsers).length;
    },
    buildRosterContent: function (action, extra) {
      var content = {
        action: action,
        mode: "game",
        roundId: currentRoundId,
        totalUsers: getTotalActivePlayers(),
        allPlayers: getAllPlayersData(),
      };
      if (extra) {
        for (var k in extra) content[k] = extra[k];
      }
      return content;
    },
    admitGameModeUser: function (targetUser, isFromRequestInit, initToken) {
      if (!isHost || !targetUser || !targetUser.networkId) return null;
      roomUsers[targetUser.networkId] = targetUser;
      var alreadyActiveSlot = activePlayerSlots[targetUser.networkId];
      var joinerSpawnIndex;
      var activeSlotCount;

      if (alreadyActiveSlot !== undefined && opponents[targetUser.networkId]) {
        joinerSpawnIndex = alreadyActiveSlot;
        var existingOpp = opponents[targetUser.networkId];
        var roundEnded = !!(
          hasMatchStarted &&
          !isGameActive &&
          !isRestartPending()
        );
        var isSameSessionRetry = !!(
          isFromRequestInit &&
          initToken &&
          admittedInitTokens[targetUser.networkId] === initToken
        );
        var isRejoinMidMatch = !!(
          !isFromRequestInit &&
          hasMatchStarted &&
          !isRestartPending()
        );
        var existingMovedMidMatch = false;
        if (
          isFromRequestInit &&
          !isSameSessionRetry &&
          hasMatchStarted &&
          !isRestartPending() &&
          !existingOpp.isDead
        ) {
          var activeSpawns = getSpawns();
          var activeSp = activeSpawns[alreadyActiveSlot % activeSpawns.length];
          var movedFromSpawn =
            Math.abs(existingOpp.col - activeSp.c) +
            Math.abs(existingOpp.row - activeSp.r);
          if (
            existingOpp.territoryVersion > 1 ||
            (existingOpp.territory && existingOpp.territory.size > 1) ||
            (existingOpp.trail && existingOpp.trail.length > 0) ||
            movedFromSpawn > 1.5
          ) {
            existingMovedMidMatch = true;
          }
        }
        if (
          isFromRequestInit &&
          initToken &&
          !existingMovedMidMatch &&
          !isRejoinMidMatch &&
          !existingOpp.isDead
        ) {
          admittedInitTokens[targetUser.networkId] = initToken;
        }
        if (
          (deadPlayersInRound[targetUser.networkId] ||
            roundEnded ||
            isRejoinMidMatch ||
            existingMovedMidMatch) &&
          !existingOpp.isDead
        ) {
          markDeadState(existingOpp);
        }
        activeSlotCount = getTotalActivePlayers();
      } else {
        var joinResult = handleUserJoin(
          targetUser,
          alreadyActiveSlot !== undefined
            ? alreadyActiveSlot
            : roomUserSlots[targetUser.networkId],
        );
        if (!joinResult.allowed) {
          delete roomUsers[targetUser.networkId];
          delete roomUserSlots[targetUser.networkId];
          return null;
        }
        joinerSpawnIndex = joinResult.spawnIndex;
        activeSlotCount = joinResult.totalPlayers;
        roomUserSlots[targetUser.networkId] = joinerSpawnIndex;
        if (isFromRequestInit && initToken) {
          admittedInitTokens[targetUser.networkId] = initToken;
        }
      }

      var allPlayersSnapshot = getAllPlayersData();
      return {
        initMessage: {
          action: "init",
          mode: "game",
          data: GameMode.serialize(),
          allPlayers: allPlayersSnapshot,
          spawnIndex: joinerSpawnIndex,
          totalUsers: activeSlotCount,
          gameSpeed: speed,
          roundId: currentRoundId,
          isGameActive: isGameActive,
          hasMatchStarted: hasMatchStarted,
          inRestartDelay: isRestartPending(),
          targetNetworkId: targetUser.networkId,
        },
        updateSpawnsMessage:
          alreadyActiveSlot === undefined
            ? {
                action: "update-spawns",
                mode: "game",
                roundId: currentRoundId,
                totalUsers: activeSlotCount,
                allPlayers: allPlayersSnapshot,
              }
            : null,
      };
    },
    admitNonGameModeUser: function (targetUser) {
      if (!targetUser || !targetUser.networkId)
        return { slot: 1, totalUsers: 1, roundId: currentRoundId };
      roomUsers[targetUser.networkId] = targetUser;
      var slot = assignNonGameModeSlot(targetUser);
      var totalUsersCount = 1 + Object.keys(roomUsers).length;
      GameMode.setTotalPlayers(Math.min(8, totalUsersCount));
      return {
        slot: slot,
        totalUsers: totalUsersCount,
        roundId: currentRoundId,
      };
    },
    syncSharedMetadata: function (content, myNetId, isInit) {
      if (!content) return false;
      if (
        !isInit &&
        content.roundId !== undefined &&
        content.roundId < currentRoundId
      ) {
        return false;
      }
      if (content.roundId !== undefined) {
        if (content.roundId > currentRoundId) {
          deadPlayersInRound = {};
          pendingHeadToHeadPairs = {};
          resetRoundOutcomeTracking();
        }
        currentRoundId = content.roundId;
      }
      if (content.spawnIndex !== undefined) {
        mySharedSpawnIndex = content.spawnIndex;
      }
      if (content.allPlayers && Array.isArray(content.allPlayers) && myNetId) {
        for (var i = 0; i < content.allPlayers.length; i++) {
          var p = content.allPlayers[i];
          if (
            p &&
            p.networkId === myNetId &&
            p.data &&
            p.data.spawnIndex !== undefined
          ) {
            mySharedSpawnIndex = p.data.spawnIndex;
            break;
          }
        }
      }
      if (content.gameSpeed !== undefined) {
        speed = content.gameSpeed;
      }
      if (content.totalUsers !== undefined) {
        GameMode.setTotalPlayers(content.totalUsers);
      } else if (content.allPlayers && Array.isArray(content.allPlayers)) {
        GameMode.setTotalPlayers(content.allPlayers.length);
      }
      return true;
    },
    applyHostInit: function (content, hostUser, myNetId, switchedIntoGame) {
      var spawnIdx = GameMode.getMySpawnIndex();
      if (!switchedIntoGame || !user) {
        GameMode.previewGame(false, spawnIdx, true, true);
      }
      var localAlreadyDeadInRound = false;
      var localFoundInAllPlayers = false;
      if (content.allPlayers && Array.isArray(content.allPlayers) && myNetId) {
        for (var pCheck = 0; pCheck < content.allPlayers.length; pCheck++) {
          var pCheckData = content.allPlayers[pCheck];
          if (pCheckData && pCheckData.networkId === myNetId) {
            localFoundInAllPlayers = true;
            if (pCheckData.data && pCheckData.data.isDead) {
              localAlreadyDeadInRound = true;
            }
            break;
          }
        }
      }
      if (hostUser && hostUser.networkId) {
        hostNetworkId = hostUser.networkId;
        lastHostPacketAt = Date.now();
        GameMode.deserialize(
          content.data,
          true,
          hostUser.networkId,
          hostUser.name,
        );
      }
      if (content.allPlayers && Array.isArray(content.allPlayers)) {
        for (var p = 0; p < content.allPlayers.length; p++) {
          var pData = content.allPlayers[p];
          if (pData && pData.networkId && pData.networkId !== myNetId) {
            GameMode.deserialize(pData.data, true, pData.networkId, pData.name);
          }
        }
      }
      if (
        (localAlreadyDeadInRound ||
          (content.hasMatchStarted &&
            !content.isGameActive &&
            !content.inRestartDelay) ||
          (!localFoundInAllPlayers &&
            content.hasMatchStarted &&
            !content.inRestartDelay)) &&
        user
      ) {
        if (myNetId && (!user.networkId || user.networkId === "local")) {
          user.networkId = myNetId;
        }
        markDeadState(user);
        user.deathBroadcasted = true;
      } else {
        GameMode.refreshLobbySpawn(true, spawnIdx);
      }
      if (content.isGameActive) {
        GameMode.startGame(false);
        return true;
      } else if (content.inRestartDelay) {
        activateAfterDelay(400);
        return true;
      } else if (content.hasMatchStarted) {
        hasMatchStarted = true;
        return true;
      }
      return false;
    },
    applyStartGame: function (msg, myUser, myNetId, isActiveMode) {
      var prevRoundId = currentRoundId;
      var wasStartedBefore = hasMatchStarted;
      if (!GameMode.syncSharedMetadata(msg.content, myNetId, false))
        return false;
      handleNetworkMessage(msg, myUser);
      if (isActiveMode && (!wasStartedBefore || currentRoundId > prevRoundId)) {
        var spawnIdx = GameMode.getMySpawnIndex();
        GameMode.refreshLobbySpawn(true, spawnIdx);
        GameMode.startGame(false, spawnIdx);
      }
      return true;
    },
    applyRestartGame: function (msg, myUser, myNetId, isActiveMode) {
      if (
        msg &&
        msg.content &&
        msg.content.roundId !== undefined &&
        msg.content.roundId <= currentRoundId
      ) {
        return false;
      }
      if (!GameMode.syncSharedMetadata(msg.content, myNetId, false))
        return false;
      if (isActiveMode) {
        var spawnIdx = GameMode.getMySpawnIndex();
        if (msg.content.allPlayers) {
          syncOpponentsWithAllPlayers(msg.content.allPlayers, myNetId);
        }
        // Use a deterministic local Rematch pause so cross device clock skew cannot desync starts
        GameMode.restart(false, spawnIdx, 350);
      }
      handleNetworkMessage(msg, myUser);
      return true;
    },
    markPlayerJoined: function (networkId) {
      if (networkId) {
        delete departedPlayers[networkId];
      }
    },
    handleUserLeave: handleUserLeave,
    handleNetworkMessage: handleNetworkMessage,
    showMaxPlayersNotification: showMaxPlayersNotification,
    setMessageSender: function (fn) {
      messageSender = fn;
    },
    handleNotificationMessage: function (c, myNetId, isActiveMode) {
      if (!c || (c.roundId !== undefined && c.roundId < currentRoundId)) return;
      if (isActiveMode) {
        recordLastTwoAliveSnapshot();
      }
      var killTarget = function (id) {
        if (!id) return;
        if (!c.roundId || c.roundId === currentRoundId) {
          deadPlayersInRound[id] = true;
        }
        if (!isActiveMode) return;
        if (id === myNetId) killLocalUser();
        else killPlayerById(id);
      };
      if (c.event === "eliminatedSync") {
        killTarget(c.subjectId);
        if (isActiveMode) emitLastTwoTieIfNeeded(true);
        return;
      }
      showGameNotification(
        c.event,
        c.subjectName,
        c.subjectColor,
        c.objectName,
      );
      if (c.event === "eliminatedEachOther" || c.event === "tie") {
        delete pendingHeadToHeadPairs[
          getHeadPairKeyById(c.subjectId, c.objectId)
        ];
        if (c.event === "tie") roundOutcomeNotified = true;
        killTarget(c.subjectId);
        killTarget(c.objectId);
        if (c.event === "tie" && isActiveMode) isGameActive = false;
        else if (isActiveMode) emitLastTwoTieIfNeeded(true);
      } else if (c.event === "eliminated") {
        delete pendingHeadToHeadPairs[
          getHeadPairKeyById(c.subjectId, c.objectId)
        ];
        killTarget(c.objectId);
        if (isActiveMode) emitLastTwoTieIfNeeded(true);
      } else if (c.event === "hitWall" || c.event === "intercepted") {
        killTarget(c.subjectId);
        if (isActiveMode) emitLastTwoTieIfNeeded(true);
      } else if ((c.event === "gameWon" || c.event === "win") && isActiveMode) {
        roundOutcomeNotified = true;
        isGameActive = false;
        hasMatchStarted = true;
      }
    },
  };

  return GameMode;
});
