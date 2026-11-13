const assert = require('assert');

// Computes properties (isClosed, level) for an array of strokes
function processStrokes(strokes) {
    for (let i = 0; i < strokes.length; i++) {
        let stroke = strokes[i];
        stroke.originalIndex = i;
        stroke.level = 0;

        // A stroke is closed if it has >2 points and the first/last point match
        stroke.isClosed = (stroke.length > 2 && stroke[0] === stroke[stroke.length - 1]);

        if (stroke.isClosed && stroke.fillColor) {
            for (let o = 0; o < i; o++) {
                let olderStroke = strokes[o];
                if (olderStroke.isClosed && olderStroke.fillColor) {
                    let completelyInsideThis = true;
                    for (let v = 0; v < stroke.length; v++) {
                        let dot = stroke[v];
                        let dotIsInside = false;
                        let ptX = dot.baseX, ptY = dot.baseY;

                        // Point-in-polygon math (ray casting algorithm)
                        for (let k = 0, l = olderStroke.length - 1; k < olderStroke.length; l = k++) {
                            let xi = olderStroke[k].baseX, yi = olderStroke[k].baseY;
                            let xj = olderStroke[l].baseX, yj = olderStroke[l].baseY;
                            let intersect = ((yi > ptY) != (yj > ptY)) && (ptX < (xj - xi) * (ptY - yi) / (yj - yi) + xi);
                            if (intersect) dotIsInside = !dotIsInside;
                        }

                        // If it's on the boundary, it's fine. If not inside and not on boundary, it's outside.
                        if (!dotIsInside && olderStroke.indexOf(dot) === -1) {
                            completelyInsideThis = false;
                            break;
                        }
                    }
                    if (completelyInsideThis) {
                        stroke.level = Math.max(stroke.level, olderStroke.level + 1);
                    }
                }
            }
        }
    }
}


// 2. Mock Data

function createDot(baseX, baseY) {
    return { baseX, baseY };
}

// Simulated Coordinates 
const dots = {
    // Outer box
    A: createDot(0, 0),
    B: createDot(100, 0),
    C: createDot(100, 100),
    D: createDot(0, 100),

    // Inner dots
    E: createDot(25, 25),
    F: createDot(75, 25),
    G: createDot(75, 75),
    H: createDot(25, 75),

    // Outside dots
    I: createDot(200, 200),
    J: createDot(300, 200),
    K: createDot(300, 300),
    L: createDot(200, 300),

    // Overlapping dots
    M: createDot(50, 50),
    N: createDot(150, 50),
    O: createDot(150, 150),
    P: createDot(50, 150)
};

function createStroke(points, color) {
    const stroke = [...points];
    stroke.fillColor = color;
    return stroke;
}


// 3. Tests

function runTests() {
    console.log("Running in-memory tests for ConnectTheDots logic...");

    try {
        // Test Rule 1: Closing a figure
        let strokesRule1 = [
            createStroke([dots.A, dots.B, dots.C, dots.D, dots.A], "red")
        ];
        processStrokes(strokesRule1);

        assert.strictEqual(strokesRule1[0].isClosed, true, "Rule 1 Failed");
        assert.strictEqual(strokesRule1[0].fillColor, "red", "Rule 1 Failed");
        console.log("Rule 1 Passed");

        // Test Rule 2: Closing figure inside another
        let strokesRule2 = [
            createStroke([dots.A, dots.B, dots.C, dots.D, dots.A], "red"),  // Outer shape
            createStroke([dots.E, dots.F, dots.G, dots.H, dots.E], "blue")  // Inner shape
        ];
        processStrokes(strokesRule2);

        assert.strictEqual(strokesRule2[1].isClosed, true, "Rule 2 Failed");
        assert.strictEqual(strokesRule2[1].fillColor, "blue", "Rule 2 Failed");
        // Level 1 indicates it's nested inside 1 other figure
        assert.strictEqual(strokesRule2[1].level, 1, "Rule 2 Failed: Inner figure should have level 1");
        console.log("Rule 2 Passed");

        // Test Rule 3: Closing figure outside another
        let strokesRule3 = [
            createStroke([dots.A, dots.B, dots.C, dots.D, dots.A], "red"),  // Shape 1
            createStroke([dots.I, dots.J, dots.K, dots.L, dots.I], "green") // Shape 2 (Outside)
        ];
        processStrokes(strokesRule3);

        assert.strictEqual(strokesRule3[1].isClosed, true, "Rule 3 Failed");
        assert.strictEqual(strokesRule3[1].fillColor, "green", "Rule 3 Failed");
        assert.strictEqual(strokesRule3[1].level, 0, "Rule 3 Failed: Outside figure should have level 0");
        assert.strictEqual(strokesRule3[0].fillColor, "red", "Rule 3 Failed: Inner figure must not change");
        console.log("Rule 3 Passed");

        // Test Rule 4: Closing overlapping figure
        let strokesRule4 = [
            createStroke([dots.A, dots.B, dots.C, dots.D, dots.A], "red"),  // Shape 1
            createStroke([dots.M, dots.N, dots.O, dots.P, dots.M], "yellow") // Shape 2 (Overlapping)
        ];
        processStrokes(strokesRule4);

        assert.strictEqual(strokesRule4[1].isClosed, true, "Rule 4 Failed");
        assert.strictEqual(strokesRule4[1].fillColor, "yellow", "Rule 4 Failed");
        // It is not completely inside, so the logic maintains it at level 0
        assert.strictEqual(strokesRule4[1].level, 0, "Rule 4 Failed: Overlapping figure should have level 0");
        console.log("Rule 4 Passed");

        console.log("All tests passed successfully");
    } catch (error) {
        console.error("Test Failed:", error.message);
    }
}

runTests();
