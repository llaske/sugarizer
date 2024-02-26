// Copyright (c) 2017 Walter Bender
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the The GNU Affero General Public
// License as published by the Free Software Foundation; either
// version 3 of the License, or (at your option) any later version.
//
// You should have received a copy of the GNU Affero General Public
// License along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA

// Macro expansions

function blockIsMacro (blkname) {

    const BUILTINMACROS = ['setturtlename', 'fill', 'hollowline', 'status', 'xturtle', 'yturtle'];
    return BUILTINMACROS.indexOf(blkname) > -1;
};


function getMacroExpansion (blkname, x, y) {
        // Some blocks are expanded on load.
        const FILLOBJ = [[0, 'fill', x, y, [null, null, 1]], [1, 'hidden', 0, 0, [0, null]]];
        const HOLLOWOBJ = [[0, 'hollowline', x, y, [null, null, 1]], [1, 'hidden', 0, 0, [0, null]]];
        const SETTURTLENAMEOBJ = [[0, 'setturtlename', x, y, [null, 1, 2, null]], [1, 'turtlename', 0, 0, [0]], [2, ['text', {'value': 'Mozart'}], 0, 0, [0]]];
        const STATUSOBJ = [[0, 'status', x, y, [null, 1, null]], [1, 'print', 0, 0, [0, 2, 3]], [2, 'x', 0, 0, [1]], [3, 'print', 0, 0, [1, 4, 5]], [4, 'y', 0, 0, [3]], [5, 'print', 0, 0, [3, 6, null]], [6, 'heading', 0, 0, [5]]];
        const XTURTLEOBJ = [[0, 'xturtle', x, y, [null, 1, null]], [1, 'turtlename', 0, 0, [0]]];
        const YTURTLEOBJ = [[0, 'yturtle', x, y, [null, 1, null]], [1, 'turtlename', 0, 0, [0]]];

        const BUILTINMACROS = {
            'fill': FILLOBJ,
            'hollowline': HOLLOWOBJ,
            'setturtlename': SETTURTLENAMEOBJ,
            'status': STATUSOBJ,
            'xturtle': XTURTLEOBJ,
            'yturtle': YTURTLEOBJ,
        };

    if (['namedbox', 'nameddo', 'namedcalc', 'namedarg', 'nameddoArg'].indexOf(blkname) === -1 && blkname in BUILTINMACROS) {
        return BUILTINMACROS[blkname];
    } else {
        return null;
    }
};
