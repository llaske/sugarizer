// Copyright (c) 2014-16 Walter Bender
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the The GNU Affero General Public
// License as published by the Free Software Foundation; either
// version 3 of the License, or (at your option) any later version.
//
// You should have received a copy of the GNU Affero General Public
// License along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA

// Definition of basic blocks common to all branches

// Some names changed between the Python verison and the
// JS version so look up name in the conversion dictionary.
var NAMEDICT = {
    'fullscreen': 'vspace',
    'fillscreen2': 'fillscreen',
    'comment': 'print',
    'sandwichclampcollapsed': 'clamp',
    'ifelse': 'ifthenelse',
    'xcor': 'x',
    'ycor': 'y',
    'seth': 'setheading',
    'remainder2': 'mod',
    'plus2': 'plus',
    'product2': 'multiply',
    'division2': 'divide',
    'minus2': 'minus',
    'stack': 'do',
    'hat': 'action',
    'stopstack': 'break',
    'clean': 'clear',
    'setxy2': 'setxy',
    'greater2': 'greater',
    'less2': 'less',
    'equal2': 'equal',
    'random2': 'random',
    'setvalue': 'setshade',
    'setchroma': 'setgrey',
    'setgray': 'setgrey',
    'gray': 'grey',
    'chroma': 'grey',
    'value': 'shade',
    'hue': 'color',
    'startfill': 'beginfill',
    'stopfill': 'endfill',
    'string': 'text',
    'shell': 'turtleshell'
};


// Define blocks here. Note: The blocks are placed on the palettes
// from bottom to top, i.e., the block at the top of a palette will be
// the last block added to a palette.

function initBasicProtoBlocks(palettes, blocks) {
    blocks.palettes = palettes;

    // TURTLE PALETTE

    var headingBlock = new ProtoBlock('heading');
    headingBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['heading'] = headingBlock;
    headingBlock.staticLabels.push(_('heading'));
    headingBlock.adjustWidthToLabel();
    headingBlock.parameterBlock();

    var xBlock = new ProtoBlock('x');
    xBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['x'] = xBlock;
    xBlock.staticLabels.push(_('x'));
    xBlock.adjustWidthToLabel();
    xBlock.parameterBlock();

    var yBlock = new ProtoBlock('y');
    yBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['y'] = yBlock;
    yBlock.staticLabels.push(_('y'));
    yBlock.adjustWidthToLabel();
    yBlock.parameterBlock();

    var clearBlock = new ProtoBlock('clear');
    clearBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['clear'] = clearBlock;
    clearBlock.staticLabels.push(_('clear'));
    clearBlock.adjustWidthToLabel();
    clearBlock.zeroArgBlock();

    var controlPoint2Block = new ProtoBlock('controlpoint2');
    controlPoint2Block.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['controlpoint2'] = controlPoint2Block;
    controlPoint2Block.staticLabels.push(_('control point 2'), _('x'), _('y'));
    controlPoint2Block.adjustWidthToLabel();
    controlPoint2Block.twoArgBlock();
    controlPoint2Block.defaults.push(200);
    controlPoint2Block.defaults.push(100);
    controlPoint2Block.dockTypes[1] = 'numberin';
    controlPoint2Block.dockTypes[2] = 'numberin';

    var controlPoint1Block = new ProtoBlock('controlpoint1');
    controlPoint1Block.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['controlpoint1'] = controlPoint1Block;
    controlPoint1Block.staticLabels.push(_('control point 1'), _('x'), _('y'));
    controlPoint1Block.adjustWidthToLabel();
    controlPoint1Block.twoArgBlock();
    controlPoint1Block.defaults.push(0);
    controlPoint1Block.defaults.push(100);
    controlPoint1Block.dockTypes[1] = 'numberin';
    controlPoint1Block.dockTypes[2] = 'numberin';

    var bezierBlock = new ProtoBlock('bezier');
    bezierBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['bezier'] = bezierBlock;
    bezierBlock.staticLabels.push(_('bezier'), _('x'), _('y'));
    bezierBlock.adjustWidthToLabel();
    bezierBlock.twoArgBlock();
    bezierBlock.defaults.push(200);
    bezierBlock.defaults.push(0);
    bezierBlock.dockTypes[1] = 'numberin';
    bezierBlock.dockTypes[2] = 'numberin';

    var arcBlock = new ProtoBlock('arc');
    arcBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['arc'] = arcBlock;
    arcBlock.staticLabels.push(_('arc'), _('angle'), _('radius'));
    arcBlock.adjustWidthToLabel();
    arcBlock.twoArgBlock();
    arcBlock.defaults.push(90);
    arcBlock.defaults.push(100);
    arcBlock.dockTypes[1] = 'numberin';

    var setheadingBlock = new ProtoBlock('setheading');
    setheadingBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['setheading'] = setheadingBlock;
    setheadingBlock.staticLabels.push(_('set heading'));
    setheadingBlock.adjustWidthToLabel();
    setheadingBlock.oneArgBlock();
    setheadingBlock.defaults.push(0);

    var setxyBlock = new ProtoBlock('setxy');
    setxyBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['setxy'] = setxyBlock;
    setxyBlock.staticLabels.push(_('set xy'), _('x'), _('y'));
    setxyBlock.adjustWidthToLabel();
    setxyBlock.twoArgBlock();
    setxyBlock.defaults.push(0);
    setxyBlock.defaults.push(0);
    setxyBlock.dockTypes[1] = 'numberin';

    var rightBlock = new ProtoBlock('right');
    rightBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['right'] = rightBlock;
    rightBlock.staticLabels.push(_('right'));
    rightBlock.adjustWidthToLabel();
    rightBlock.oneArgBlock();
    rightBlock.defaults.push(90);

    var leftBlock = new ProtoBlock('left');
    leftBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['left'] = leftBlock;
    leftBlock.staticLabels.push(_('left'));
    leftBlock.adjustWidthToLabel();
    leftBlock.oneArgBlock();
    leftBlock.defaults.push(90);

    var backBlock = new ProtoBlock('back');
    backBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['back'] = backBlock;
    backBlock.staticLabels.push(_('back'));
    backBlock.adjustWidthToLabel();
    backBlock.oneArgBlock();
    backBlock.defaults.push(100);

    var forwardBlock = new ProtoBlock('forward');
    forwardBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['forward'] = forwardBlock;
    forwardBlock.staticLabels.push(_('forward'));
    forwardBlock.adjustWidthToLabel();
    forwardBlock.oneArgBlock();
    forwardBlock.defaults.push(100);

    // PEN PALETTE
    
    var beginFillBlock = new ProtoBlock('beginfill');
    beginFillBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['beginfill'] = beginFillBlock;
    beginFillBlock.hidden = true;
    beginFillBlock.staticLabels.push(_('begin fill'));
    beginFillBlock.adjustWidthToLabel();
    beginFillBlock.zeroArgBlock();

    var endFillBlock = new ProtoBlock('endfill');
    endFillBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['endfill'] = endFillBlock;
    endFillBlock.hidden = true;
    endFillBlock.staticLabels.push(_('end fill'));
    endFillBlock.adjustWidthToLabel();
    endFillBlock.zeroArgBlock();

    var fillscreenBlock = new ProtoBlock('fillscreen');
    fillscreenBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['fillscreen'] = fillscreenBlock;
    fillscreenBlock.hidden = true;
    fillscreenBlock.staticLabels.push(_('background'));
    fillscreenBlock.adjustWidthToLabel();
    fillscreenBlock.threeArgBlock();

    var colorBlock = new ProtoBlock('color');
    colorBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['color'] = colorBlock;
    colorBlock.staticLabels.push(_('color'));
    colorBlock.adjustWidthToLabel();
    colorBlock.parameterBlock();

    var shadeBlock = new ProtoBlock('shade');
    shadeBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['shade'] = shadeBlock;
    shadeBlock.staticLabels.push(_('shade'));
    shadeBlock.adjustWidthToLabel();
    shadeBlock.parameterBlock();

    var chromaBlock = new ProtoBlock('grey');
    chromaBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['grey'] = chromaBlock;
    chromaBlock.staticLabels.push(_('grey'));
    chromaBlock.adjustWidthToLabel();
    chromaBlock.parameterBlock();

    var pensizeBlock = new ProtoBlock('pensize');
    pensizeBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['pensize'] = pensizeBlock;
    pensizeBlock.staticLabels.push(_('pen size'));
    pensizeBlock.adjustWidthToLabel();
    pensizeBlock.parameterBlock();

    var setfontBlock = new ProtoBlock('setfont');
    setfontBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['setfont'] = setfontBlock;
    setfontBlock.staticLabels.push(_('set font'));
    setfontBlock.adjustWidthToLabel();
    setfontBlock.oneArgBlock();
    setfontBlock.defaults.push(DEFAULTFONT);
    setfontBlock.dockTypes[1] = 'textin';

    var backgroundBlock = new ProtoBlock('background');
    backgroundBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['background'] = backgroundBlock;
    backgroundBlock.staticLabels.push(_('background'));
    backgroundBlock.adjustWidthToLabel();
    backgroundBlock.zeroArgBlock();

    var hollowBlock = new ProtoBlock('hollowline');
    hollowBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['hollowline'] = hollowBlock;
    hollowBlock.staticLabels.push(_('hollow line'));
    hollowBlock.adjustWidthToLabel();
    hollowBlock.flowClampZeroArgBlock();

    var fillBlock = new ProtoBlock('fill');
    fillBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['fill'] = fillBlock;
    fillBlock.staticLabels.push(_('fill'));
    fillBlock.adjustWidthToLabel();
    fillBlock.flowClampZeroArgBlock();

    var penupBlock = new ProtoBlock('penup');
    penupBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['penup'] = penupBlock;
    penupBlock.staticLabels.push(_('pen up'));
    penupBlock.adjustWidthToLabel();
    penupBlock.zeroArgBlock();

    var pendownBlock = new ProtoBlock('pendown');
    pendownBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['pendown'] = pendownBlock;
    pendownBlock.staticLabels.push(_('pen down'));
    pendownBlock.adjustWidthToLabel();
    pendownBlock.zeroArgBlock();

    var setpensizeBlock = new ProtoBlock('setpensize');
    setpensizeBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['setpensize'] = setpensizeBlock;
    setpensizeBlock.staticLabels.push(_('set pen size'));
    setpensizeBlock.adjustWidthToLabel();
    setpensizeBlock.oneArgBlock();
    setpensizeBlock.defaults.push(5);

    var settranslucencyBlock = new ProtoBlock('settranslucency');
    settranslucencyBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['settranslucency'] = settranslucencyBlock;
    settranslucencyBlock.staticLabels.push(_('set translucency'));
    settranslucencyBlock.adjustWidthToLabel();
    settranslucencyBlock.oneArgBlock();
    settranslucencyBlock.defaults.push(50);

    var sethueBlock = new ProtoBlock('sethue');
    sethueBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['sethue'] = sethueBlock;
    sethueBlock.staticLabels.push(_('set hue'));
    sethueBlock.adjustWidthToLabel();
    sethueBlock.oneArgBlock();
    sethueBlock.defaults.push(0);

    var setshadeBlock = new ProtoBlock('setshade');
    setshadeBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['setshade'] = setshadeBlock;
    setshadeBlock.staticLabels.push(_('set shade'));
    setshadeBlock.adjustWidthToLabel();
    setshadeBlock.oneArgBlock();
    setshadeBlock.defaults.push(50);

    var setchromaBlock = new ProtoBlock('setgrey');
    setchromaBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['setgrey'] = setchromaBlock;
    setchromaBlock.staticLabels.push(_('set grey'));
    setchromaBlock.adjustWidthToLabel();
    setchromaBlock.oneArgBlock();
    setchromaBlock.defaults.push(100);

    var setcolorBlock = new ProtoBlock('setcolor');
    setcolorBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['setcolor'] = setcolorBlock;
    setcolorBlock.staticLabels.push(_('set color'));
    setcolorBlock.adjustWidthToLabel();
    setcolorBlock.oneArgBlock();
    setcolorBlock.defaults.push(0);

    // NUMBERS PALETTE
    
    var intBlock = new ProtoBlock('int');
    intBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['int'] = intBlock;
    intBlock.staticLabels.push(_('int'));
    intBlock.adjustWidthToLabel();
    intBlock.oneArgMathBlock();
    intBlock.defaults.push(100)

    var greaterBlock = new ProtoBlock('greater');
    greaterBlock.palette = palettes.dict['boolean'];
    blocks.protoBlockDict['greater'] = greaterBlock;
    greaterBlock.fontsize = 14;
    greaterBlock.staticLabels.push('&gt;');
    greaterBlock.extraWidth = 20;
    greaterBlock.booleanTwoArgBlock();

    var lessBlock = new ProtoBlock('less');
    lessBlock.palette = palettes.dict['boolean'];
    blocks.protoBlockDict['less'] = lessBlock;
    lessBlock.fontsize = 14;
    lessBlock.staticLabels.push('&lt;');
    lessBlock.extraWidth = 20;
    lessBlock.booleanTwoArgBlock();

    var equalBlock = new ProtoBlock('equal');
    equalBlock.palette = palettes.dict['boolean'];
    blocks.protoBlockDict['equal'] = equalBlock;
    equalBlock.fontsize = 14;
    equalBlock.staticLabels.push('=');
    equalBlock.extraWidth = 20;
    equalBlock.booleanTwoArgBlock();
    equalBlock.dockTypes[0] = 'booleanout';
    equalBlock.dockTypes[1] = 'anyin';
    equalBlock.dockTypes[2] = 'anyin';

    var andBlock = new ProtoBlock('and');
    andBlock.palette = palettes.dict['boolean'];
    blocks.protoBlockDict['and'] = andBlock;
    andBlock.extraWidth = 10;
    andBlock.staticLabels.push(_('and'));
    andBlock.booleanTwoBooleanArgBlock();

    var orBlock = new ProtoBlock('or');
    orBlock.palette = palettes.dict['boolean'];
    blocks.protoBlockDict['or'] = orBlock;
    orBlock.extraWidth = 10;
    orBlock.staticLabels.push(_('or'));
    orBlock.booleanTwoBooleanArgBlock();

    var notBlock = new ProtoBlock('not');
    notBlock.palette = palettes.dict['boolean'];
    blocks.protoBlockDict['not'] = notBlock;
    notBlock.extraWidth = 30;
    notBlock.staticLabels.push(_('not'));
    notBlock.booleanOneBooleanArgBlock();

    var modBlock = new ProtoBlock('mod');
    modBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['mod'] = modBlock;
    modBlock.staticLabels.push(_('mod'));
    modBlock.adjustWidthToLabel();
    modBlock.twoArgMathBlock();
    modBlock.defaults.push(100, 10)

    var sqrtBlock = new ProtoBlock('sqrt');
    sqrtBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['sqrt'] = sqrtBlock;
    sqrtBlock.staticLabels.push(_('sqrt'));
    sqrtBlock.adjustWidthToLabel();
    sqrtBlock.oneArgMathBlock();
    sqrtBlock.defaults.push(100)

    var divideBlock = new ProtoBlock('divide');
    divideBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['divide'] = divideBlock;
    divideBlock.fontsize = 14;
    divideBlock.staticLabels.push('/');
    divideBlock.twoArgMathBlock();
    divideBlock.defaults.push(100, 10)

    var powerBlock = new ProtoBlock('power');
    powerBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['power'] = powerBlock;
    powerBlock.fontsize = 14;
    powerBlock.staticLabels.push('^');
    powerBlock.twoArgMathBlock();
    powerBlock.defaults.push(2,4)

    var multiplyBlock = new ProtoBlock('multiply');
    multiplyBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['multiply'] = multiplyBlock;
    multiplyBlock.fontsize = 14;
    multiplyBlock.staticLabels.push('×');
    multiplyBlock.twoArgMathBlock();
    multiplyBlock.defaults.push(10, 10)

    var negBlock = new ProtoBlock('neg');
    negBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['neg'] = negBlock;
    negBlock.fontsize = 14;
    negBlock.staticLabels.push('–');
    negBlock.oneArgMathBlock();

    var minusBlock = new ProtoBlock('minus');
    minusBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['minus'] = minusBlock;
    minusBlock.fontsize = 14;
    minusBlock.staticLabels.push('–');
    minusBlock.twoArgMathBlock();
    minusBlock.defaults.push(100, 50)

    var plusBlock = new ProtoBlock('plus');
    plusBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['plus'] = plusBlock;
    plusBlock.fontsize = 14;
    plusBlock.staticLabels.push('+');
    plusBlock.twoArgMathBlock();
    plusBlock.dockTypes[0] = 'anyout';
    plusBlock.dockTypes[1] = 'anyin';
    plusBlock.dockTypes[2] = 'anyin';
    plusBlock.defaults.push(100, 100)

    var oneOfBlock = new ProtoBlock('oneOf');
    oneOfBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['oneOf'] = oneOfBlock;
    oneOfBlock.staticLabels.push(_('one of'), _('this'), _('that'));
    oneOfBlock.adjustWidthToLabel();
    oneOfBlock.twoArgMathBlock();
    oneOfBlock.dockTypes[0] = 'anyout';
    oneOfBlock.dockTypes[1] = 'anyin';
    oneOfBlock.dockTypes[2] = 'anyin';
    oneOfBlock.defaults.push(-90, 90);

    var randomBlock = new ProtoBlock('random');
    randomBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['random'] = randomBlock;
    randomBlock.staticLabels.push(_('random'), _('min'), _('max'));
    randomBlock.adjustWidthToLabel();
    randomBlock.twoArgMathBlock();
    randomBlock.defaults.push(0, 100);

    var numberBlock = new ProtoBlock('number');
    numberBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['number'] = numberBlock;
    numberBlock.valueBlock();

    // BLOCKS PALETTE

    var incrementOneBlock = new ProtoBlock('incrementOne');
    incrementOneBlock.palette = palettes.dict['boxes'];
    blocks.protoBlockDict['incrementOne'] = incrementOneBlock;
    incrementOneBlock.staticLabels.push(_('add 1 to'));
    incrementOneBlock.adjustWidthToLabel();
    incrementOneBlock.oneArgBlock();

    var incrementBlock = new ProtoBlock('increment');
    incrementBlock.palette = palettes.dict['boxes'];
    blocks.protoBlockDict['increment'] = incrementBlock;
    incrementBlock.staticLabels.push(_('add'), _('to'), _('value'));
    incrementBlock.adjustWidthToLabel();
    incrementBlock.twoArgBlock();
    incrementBlock.dockTypes[1] = 'anyin';
    incrementBlock.dockTypes[2] = 'anyin';

    var boxBlock = new ProtoBlock('box');
    boxBlock.palette = palettes.dict['boxes'];
    blocks.protoBlockDict['box'] = boxBlock;
    boxBlock.staticLabels.push(_('box'));
    boxBlock.extraWidth = 10;
    boxBlock.adjustWidthToLabel();
    boxBlock.oneArgMathBlock();
    boxBlock.defaults.push(_('box'));
    boxBlock.dockTypes[0] = 'anyout';
    // Show the value in the box as if it were a parameter.
    boxBlock.parameter = true;
    boxBlock.dockTypes[1] = 'anyin';

    var storeinBlock = new ProtoBlock('storein');
    storeinBlock.palette = palettes.dict['boxes'];
    blocks.protoBlockDict['storein'] = storeinBlock;
    storeinBlock.staticLabels.push(_('store in'), _('name'), _('value'));
    storeinBlock.adjustWidthToLabel();
    storeinBlock.twoArgBlock();
    storeinBlock.defaults.push(_('box'));
    storeinBlock.defaults.push(100);
    storeinBlock.dockTypes[1] = 'anyin';
    storeinBlock.dockTypes[2] = 'anyin';

    var namedBoxBlock = new ProtoBlock('namedbox');
    namedBoxBlock.palette = palettes.dict['boxes'];
    blocks.protoBlockDict['namedbox'] = namedBoxBlock;
    namedBoxBlock.staticLabels.push(_('box'));
    namedBoxBlock.extraWidth = 10;
    namedBoxBlock.adjustWidthToLabel();
    namedBoxBlock.parameterBlock();
    namedBoxBlock.dockTypes[0] = 'anyout';

    // ACTION PALETTE
    
    var doBlock = new ProtoBlock('do');
    doBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['do'] = doBlock;
    doBlock.staticLabels.push(_('do'));
    doBlock.adjustWidthToLabel();
    doBlock.oneArgBlock();
    doBlock.defaults.push(_('action'));
    doBlock.dockTypes[1] = 'anyin';

    var returnBlock = new ProtoBlock('return');
    returnBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['return'] = returnBlock;
    returnBlock.staticLabels.push(_('return'));
    returnBlock.extraWidth = 10;
    returnBlock.adjustWidthToLabel();
    returnBlock.oneArgBlock();
    returnBlock.defaults.push(100);
    returnBlock.dockTypes[1] = 'anyin';

    var returnToUrlBlock = new ProtoBlock('returnToUrl');
    returnToUrlBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['returnToUrl'] = returnToUrlBlock;
    returnToUrlBlock.staticLabels.push(_('return to URL'));
    returnToUrlBlock.extraWidth = 10;
    returnToUrlBlock.adjustWidthToLabel();
    returnToUrlBlock.oneArgBlock();
    returnToUrlBlock.defaults.push(_('100'));
    returnToUrlBlock.dockTypes[1] = 'anyin';

    var calcBlock = new ProtoBlock('calc');
    calcBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['calc'] = calcBlock;
    calcBlock.staticLabels.push(_('calculate'));
    calcBlock.adjustWidthToLabel();
    calcBlock.oneArgMathBlock();
    calcBlock.defaults.push(_('action'));
    calcBlock.dockTypes[0] = 'anyout';
    calcBlock.dockTypes[1] = 'anyin';

    var namedCalcBlock = new ProtoBlock('namedcalc');
    namedCalcBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['namedcalc'] = namedCalcBlock;
    namedCalcBlock.staticLabels.push(_('action'));
    namedCalcBlock.extraWidth = 10;
    namedCalcBlock.adjustWidthToLabel();
    namedCalcBlock.parameterBlock();

    var namedDoArgBlock = new ProtoBlock('nameddoArg');
    namedDoArgBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['nameddoArg'] = namedDoArgBlock;
    namedDoArgBlock.staticLabels.push(_('do'));
    namedDoArgBlock.adjustWidthToLabel();
    namedDoArgBlock.argClampBlock();
    namedDoArgBlock.dockTypes[1] = 'anyin';

    var namedCalcArgBlock = new ProtoBlock('namedcalcArg');
    namedCalcArgBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['namedcalcArg'] = namedCalcArgBlock;
    namedCalcArgBlock.staticLabels.push(_('calculate'));
    namedCalcArgBlock.adjustWidthToLabel();
    namedCalcArgBlock.argClampMathBlock();
    namedCalcArgBlock.dockTypes[0] = 'anyout';
    namedCalcArgBlock.dockTypes[1] = 'anyin';

    var doArgBlock = new ProtoBlock('doArg');
    doArgBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['doArg'] = doArgBlock;
    doArgBlock.staticLabels.push(_('do'));
    doArgBlock.adjustWidthToLabel();
    doArgBlock.argClampOneArgBlock();
    doArgBlock.defaults.push(_('action'));
    doArgBlock.dockTypes[1] = 'anyin';
    doArgBlock.dockTypes[2] = 'anyin';

    var calcArgBlock = new ProtoBlock('calcArg');
    calcArgBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['calcArg'] = calcArgBlock;
    calcArgBlock.staticLabels.push(_('calculate'));
    calcArgBlock.adjustWidthToLabel();
    calcArgBlock.argClampOneArgMathBlock();
    calcArgBlock.defaults.push(_('action'));
    calcArgBlock.dockTypes[0] = 'anyout';
    calcArgBlock.dockTypes[1] = 'anyin';
    calcArgBlock.dockTypes[2] = 'anyin';

    var argBlock = new ProtoBlock('arg');
    argBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['arg'] = argBlock;
    argBlock.staticLabels.push('arg');
    argBlock.adjustWidthToLabel();
    argBlock.oneArgMathBlock();
    argBlock.defaults.push(1);
    argBlock.dockTypes[0] = 'anyout';
    argBlock.dockTypes[1] = 'numberin';

    var namedArgBlock = new ProtoBlock('namedarg');
    namedArgBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['namedarg'] = namedArgBlock;
    namedArgBlock.staticLabels.push('arg ' + 1);
    namedArgBlock.adjustWidthToLabel();
    namedArgBlock.parameterBlock();

    var listenBlock = new ProtoBlock('listen');
    listenBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['listen'] = listenBlock;
    listenBlock.staticLabels.push(_('on'), _('event'), _('do'));
    listenBlock.adjustWidthToLabel();
    listenBlock.twoArgBlock();
    listenBlock.defaults.push(_('event'));
    listenBlock.defaults.push(_('action'));
    listenBlock.dockTypes[1] = 'textin';
    listenBlock.dockTypes[2] = 'textin';

    var dispatchBlock = new ProtoBlock('dispatch');
    dispatchBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['dispatch'] = dispatchBlock;
    dispatchBlock.staticLabels.push(_('broadcast'));
    dispatchBlock.adjustWidthToLabel();
    dispatchBlock.oneArgBlock();
    dispatchBlock.defaults.push(_('event'));
    dispatchBlock.dockTypes[1] = 'textin';

    var startBlock = new ProtoBlock('start');
    startBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['start'] = startBlock;
    startBlock.staticLabels.push(_('start'));
    startBlock.extraWidth = 10;
    startBlock.adjustWidthToLabel();
    startBlock.stackClampZeroArgBlock();

    var actionBlock = new ProtoBlock('action');
    actionBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['action'] = actionBlock;
    actionBlock.staticLabels.push(_('action'));
    actionBlock.extraWidth = 25;
    actionBlock.adjustWidthToLabel();
    actionBlock.stackClampOneArgBlock();
    actionBlock.defaults.push(_('action'));

    var namedDoBlock = new ProtoBlock('nameddo');
    namedDoBlock.palette = palettes.dict['action'];
    blocks.protoBlockDict['nameddo'] = namedDoBlock;
    namedDoBlock.hidden = true;
    namedDoBlock.staticLabels.push(_('action'));
    namedDoBlock.extraWidth = 10;
    namedDoBlock.adjustWidthToLabel();
    namedDoBlock.zeroArgBlock();

    // HEAP PALETTE
    
    var loadHeapFromApp = new ProtoBlock('loadHeapFromApp');
    loadHeapFromApp.palette = palettes.dict['heap'];
    blocks.protoBlockDict['loadHeapFromApp'] = loadHeapFromApp;
    loadHeapFromApp.staticLabels.push(_('load heap from App'));
    loadHeapFromApp.adjustWidthToLabel();
    loadHeapFromApp.twoArgBlock();
    loadHeapFromApp.dockTypes[1] = 'textin';
    loadHeapFromApp.dockTypes[2] = 'textin';
    loadHeapFromApp.defaults.push('appName')
    loadHeapFromApp.defaults.push('localhost');

    var saveHeapToApp = new ProtoBlock('saveHeapToApp');
    saveHeapToApp.palette = palettes.dict['heap'];
    blocks.protoBlockDict['saveHeapToApp'] = saveHeapToApp;
    saveHeapToApp.staticLabels.push(_('save heap to App'));
    saveHeapToApp.adjustWidthToLabel();
    saveHeapToApp.twoArgBlock();
    saveHeapToApp.dockTypes[1] = 'textin';
    saveHeapToApp.dockTypes[2] = 'textin';
    saveHeapToApp.defaults.push('appName')
    saveHeapToApp.defaults.push('localhost');

    var setHeapEntry = new ProtoBlock('setHeapEntry');
    setHeapEntry.palette = palettes.dict['heap'];
    blocks.protoBlockDict['setHeapEntry'] = setHeapEntry;
    setHeapEntry.staticLabels.push(_('set heap'), _('index'), _('value'));
    setHeapEntry.adjustWidthToLabel();
    setHeapEntry.twoArgBlock();
    setHeapEntry.dockTypes[1] = 'numberin';
    setHeapEntry.dockTypes[2] = 'anyin';
    setHeapEntry.defaults.push(1);
    setHeapEntry.defaults.push(100);

    var showHeap = new ProtoBlock('showHeap');
    showHeap.palette = palettes.dict['heap'];
    blocks.protoBlockDict['showHeap'] = showHeap;
    showHeap.staticLabels.push(_('show heap'));
    showHeap.adjustWidthToLabel();
    showHeap.zeroArgBlock();

    var heapLength = new ProtoBlock('heapLength');
    heapLength.palette = palettes.dict['heap'];
    blocks.protoBlockDict['heapLength'] = heapLength;
    heapLength.staticLabels.push(_('heap length'));
    heapLength.adjustWidthToLabel();
    heapLength.parameterBlock();
    heapLength.dockTypes[0] = 'numberout';

    var heapEmpty = new ProtoBlock('heapEmpty');
    heapEmpty.palette = palettes.dict['heap'];
    blocks.protoBlockDict['heapEmpty'] = heapEmpty;
    heapEmpty.staticLabels.push(_('heap empty?'));
    heapEmpty.adjustWidthToLabel();
    heapEmpty.booleanZeroArgBlock();

    var emptyHeap = new ProtoBlock('emptyHeap');
    emptyHeap.palette = palettes.dict['heap'];
    blocks.protoBlockDict['emptyHeap'] = emptyHeap;
    emptyHeap.staticLabels.push(_('empty heap'));
    emptyHeap.adjustWidthToLabel();
    emptyHeap.zeroArgBlock();

    var saveHeap = new ProtoBlock('saveHeap');
    saveHeap.palette = palettes.dict['heap'];
    blocks.protoBlockDict['saveHeap'] = saveHeap;
    saveHeap.staticLabels.push(_('save heap'));
    saveHeap.adjustWidthToLabel();
    saveHeap.oneArgBlock();
    saveHeap.defaults.push('heap.json');
    saveHeap.dockTypes[1] = 'textin';

    var loadHeap = new ProtoBlock('loadHeap');
    loadHeap.palette = palettes.dict['heap'];
    blocks.protoBlockDict['loadHeap'] = loadHeap;
    loadHeap.staticLabels.push(_('load heap'));
    loadHeap.adjustWidthToLabel();
    loadHeap.oneArgBlock();
    loadHeap.dockTypes[1] = 'filein';
    loadHeap.defaults = [[null, null]];

    var indexHeap = new ProtoBlock('indexHeap');
    indexHeap.palette = palettes.dict['heap'];
    blocks.protoBlockDict['indexHeap'] = indexHeap;
    indexHeap.staticLabels.push(_('index heap'));
    indexHeap.adjustWidthToLabel();
    indexHeap.oneArgMathBlock();
    indexHeap.dockTypes[1] = 'numberin';
    indexHeap.defaults.push(1);

    var pushBlk = new ProtoBlock('push');
    pushBlk.palette = palettes.dict['heap'];
    blocks.protoBlockDict['push'] = pushBlk;
    pushBlk.staticLabels.push(_('push'));
    pushBlk.adjustWidthToLabel();
    pushBlk.oneArgBlock();
    pushBlk.dockTypes[1] = 'anyin';

    var popBlk = new ProtoBlock('pop');
    popBlk.palette = palettes.dict['heap'];
    blocks.protoBlockDict['pop'] = popBlk;
    popBlk.staticLabels.push(_('pop'));
    popBlk.adjustWidthToLabel();
    popBlk.parameterBlock();

    // MEDIA PALETTE
    
    var speakBlock = new ProtoBlock('speak');
    speakBlock.palette = palettes.dict['media'];
    blocks.protoBlockDict['speak'] = speakBlock;
    speakBlock.staticLabels.push(_('speak'));
    speakBlock.adjustWidthToLabel();
    speakBlock.oneArgBlock();
    speakBlock.defaults.push('hello');
    speakBlock.dockTypes[1] = 'textin';

    var cameraBlock = new ProtoBlock('camera');
    cameraBlock.palette = palettes.dict['media'];
    cameraBlock.image = 'images/camera.svg'
    blocks.protoBlockDict['camera'] = cameraBlock;
    cameraBlock.mediaBlock();

    var videoBlock = new ProtoBlock('video');
    videoBlock.palette = palettes.dict['media'];
    videoBlock.image = 'images/video.svg'
    blocks.protoBlockDict['video'] = videoBlock;
    videoBlock.mediaBlock();

    var loadFile = new ProtoBlock('loadFile');
    loadFile.palette = palettes.dict['media'];
    blocks.protoBlockDict['loadFile'] = loadFile;
    loadFile.staticLabels.push('');
    loadFile.parameterBlock();
    loadFile.dockTypes[0] = 'fileout';

    var stopVideoCamBlock = new ProtoBlock('stopvideocam');
    stopVideoCamBlock.palette = palettes.dict['media'];
    blocks.protoBlockDict['stopvideocam'] = stopVideoCamBlock;
    stopVideoCamBlock.staticLabels.push(_('stop media'));
    stopVideoCamBlock.adjustWidthToLabel();
    stopVideoCamBlock.zeroArgBlock();

    var toneBlock = new ProtoBlock('tone2');
    toneBlock.palette = palettes.dict['media'];
    blocks.protoBlockDict['tone2'] = toneBlock;
    toneBlock.staticLabels.push(_('tone'),  _('frequency'), _('duration (ms)'));
    toneBlock.adjustWidthToLabel();
    toneBlock.defaults.push(440, 200);
    toneBlock.twoArgBlock();
    toneBlock.dockTypes[1] = 'numberin';
    toneBlock.dockTypes[2] = 'numberin';

    var toFrequencyBlock = new ProtoBlock('tofrequency');
    toFrequencyBlock.palette = palettes.dict['media'];
    blocks.protoBlockDict['tofrequency'] = toFrequencyBlock;
    toFrequencyBlock.staticLabels.push(_('note to frequency'), _('name'), _('octave'));
    toFrequencyBlock.adjustWidthToLabel();
    toFrequencyBlock.defaults.push('A');
    toFrequencyBlock.defaults.push('4');
    toFrequencyBlock.twoArgMathBlock();
    toFrequencyBlock.dockTypes[1] = 'anyin';
    toFrequencyBlock.dockTypes[2] = 'numberin';

    var shellBlock = new ProtoBlock('turtleshell');
    shellBlock.palette = palettes.dict['media'];
    blocks.protoBlockDict['turtleshell'] = shellBlock;
    shellBlock.staticLabels.push(_('shell'), _('size'), _('image'));
    shellBlock.adjustWidthToLabel();
    shellBlock.twoArgBlock();
    shellBlock.defaults.push(55);
    shellBlock.defaults.push(null);
    shellBlock.dockTypes[1] = 'numberin';
    shellBlock.dockTypes[2] = 'mediain';

    var showBlock = new ProtoBlock('show');
    showBlock.palette = palettes.dict['media'];
    blocks.protoBlockDict['show'] = showBlock;
    showBlock.staticLabels.push(_('show'), _('size'), _('obj'));
    showBlock.adjustWidthToLabel();
    showBlock.twoArgBlock();
    showBlock.defaults.push(24);
    showBlock.defaults.push(_('text'));
    showBlock.dockTypes[1] = 'numberin';
    showBlock.dockTypes[2] = 'anyin';

    var mediaBlock = new ProtoBlock('media');
    mediaBlock.palette = palettes.dict['media'];
    mediaBlock.image = 'images/load-media.svg'
    blocks.protoBlockDict['media'] = mediaBlock;
    mediaBlock.mediaBlock();
    mediaBlock.dockTypes[0] = 'mediaout';

    var textBlock = new ProtoBlock('text');
    textBlock.palette = palettes.dict['media'];
    blocks.protoBlockDict['text'] = textBlock;
    textBlock.valueBlock();
    textBlock.dockTypes[0] = 'textout';

    // FLOW PALETTE

    var hiddenNoFlowBlock = new ProtoBlock('hiddennoflow');
    hiddenNoFlowBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['hiddennoflow'] = hiddenNoFlowBlock;
    hiddenNoFlowBlock.hiddenNoFlow = true;
    hiddenNoFlowBlock.hiddenBlockNoFlow();
    hiddenNoFlowBlock.hidden = true;

    var hiddenBlock = new ProtoBlock('hidden');
    hiddenBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['hidden'] = hiddenBlock;
    hiddenBlock.hidden = true;
    hiddenBlock.hiddenBlockFlow();

    var clampBlock = new ProtoBlock('clamp');
    clampBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['clamp'] = clampBlock;
    clampBlock.hidden = true;
    clampBlock.flowClampBlock();

    var breakBlock = new ProtoBlock('break');
    breakBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['break'] = breakBlock;
    breakBlock.staticLabels.push(_('stop'));
    breakBlock.adjustWidthToLabel();
    breakBlock.basicBlockNoFlow();

    var waitForBlock = new ProtoBlock('waitFor');
    waitForBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['waitFor'] = waitForBlock;
    waitForBlock.staticLabels.push(_('wait for'));
    waitForBlock.adjustWidthToLabel();
    waitForBlock.oneBooleanArgBlock();

    var untilBlock = new ProtoBlock('until');
    untilBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['until'] = untilBlock;
    untilBlock.staticLabels.push(_('until'), _('do'));
    untilBlock.adjustWidthToLabel();
    untilBlock.flowClampBooleanArgBlock();

    var whileBlock = new ProtoBlock('while');
    whileBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['while'] = whileBlock;
    whileBlock.staticLabels.push(_('while'), _('do'));
    whileBlock.adjustWidthToLabel();
    whileBlock.flowClampBooleanArgBlock();

    var ifthenelseBlock = new ProtoBlock('ifthenelse');
    ifthenelseBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['ifthenelse'] = ifthenelseBlock;
    ifthenelseBlock.staticLabels.push(_('if'), _('then'), _('else'));
    ifthenelseBlock.adjustWidthToLabel();
    ifthenelseBlock.doubleFlowClampBooleanArgBlock();

    var ifBlock = new ProtoBlock('if');
    ifBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['if'] = ifBlock;
    ifBlock.staticLabels.push(_('if'), _('then'));
    ifBlock.adjustWidthToLabel();
    ifBlock.flowClampBooleanArgBlock();

    var foreverBlock = new ProtoBlock('forever');
    foreverBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['forever'] = foreverBlock;
    foreverBlock.staticLabels.push(_('forever'));
    foreverBlock.adjustWidthToLabel();
    foreverBlock.flowClampZeroArgBlock();

    var repeatBlock = new ProtoBlock('repeat');
    repeatBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['repeat'] = repeatBlock;
    repeatBlock.staticLabels.push(_('repeat'));
    repeatBlock.adjustWidthToLabel();
    repeatBlock.flowClampOneArgBlock();
    repeatBlock.defaults.push(4);

    // EXTRAS PALETTE

    // NOP blocks (used as placeholders when loaded blocks not found)
    var nopValueBlock = new ProtoBlock('nopValueBlock');
    blocks.protoBlockDict['nopValueBlock'] = nopValueBlock;
    nopValueBlock.hidden = true;
    nopValueBlock.palette = palettes.dict['extras'];
    nopValueBlock.staticLabels.push(_('unknown'));
    nopValueBlock.adjustWidthToLabel();
    nopValueBlock.valueBlock();
    nopValueBlock.dockTypes[0] = 'anyout';

    /*
    var nopOneArgMathBlock = new ProtoBlock('nopOneArgMathBlock');
    blocks.protoBlockDict['nopOneArgMathBlock'] = nopOneArgMathBlock;
    nopOneArgMathBlock.hidden = true;
    nopOneArgMathBlock.palette = palettes.dict['extras'];
    nopOneArgMathBlock.oneArgMathBlock();
    nopOneArgMathBlock.staticLabels.push(_('unknown'));
    nopOneArgMathBlock.dockTypes[0] = 'anyout';
    nopOneArgMathBlock.dockTypes[1] = 'anyin';

    var nopTwoArgMathBlock = new ProtoBlock('nopTwoArgMathBlock');
    blocks.protoBlockDict['nopTwoArgMathBlock'] = nopTwoArgMathBlock;
    nopTwoArgMathBlock.twoArgMathBlock();
    nopTwoArgMathBlock.hidden = true;
    nopTwoArgMathBlock.palette = palettes.dict['extras'];
    nopTwoArgMathBlock.staticLabels.push(_('unknown'));
    nopTwoArgMathBlock.dockTypes[0] = 'anyout';
    nopTwoArgMathBlock.dockTypes[1] = 'anyin';
    nopTwoArgMathBlock.dockTypes[2] = 'anyin';
    */

    var nopZeroArgBlock = new ProtoBlock('nopZeroArgBlock');
    blocks.protoBlockDict['nopZeroArgBlock'] = nopZeroArgBlock;
    nopZeroArgBlock.hidden = true;
    nopZeroArgBlock.palette = palettes.dict['extras'];
    nopZeroArgBlock.staticLabels.push(_('unknown'));
    nopZeroArgBlock.adjustWidthToLabel();
    nopZeroArgBlock.zeroArgBlock();

    var nopOneArgBlock = new ProtoBlock('nopOneArgBlock');
    blocks.protoBlockDict['nopOneArgBlock'] = nopOneArgBlock;
    nopOneArgBlock.hidden = true;
    nopOneArgBlock.palette = palettes.dict['extras'];
    nopOneArgBlock.staticLabels.push(_('unknown'));
    nopOneArgBlock.adjustWidthToLabel();
    nopOneArgBlock.oneArgBlock();
    nopOneArgBlock.dockTypes[1] = 'anyin';

    var nopTwoArgBlock = new ProtoBlock('nopTwoArgBlock');
    blocks.protoBlockDict['nopTwoArgBlock'] = nopTwoArgBlock;
    nopTwoArgBlock.hidden = true;
    nopTwoArgBlock.palette = palettes.dict['extras'];
    nopTwoArgBlock.staticLabels.push(_('unknown'));
    nopTwoArgBlock.adjustWidthToLabel();
    nopTwoArgBlock.twoArgBlock();
    nopTwoArgBlock.dockTypes[1] = 'anyin';
    nopTwoArgBlock.dockTypes[2] = 'anyin';

    var nopThreeArgBlock = new ProtoBlock('nopThreeArgBlock');
    blocks.protoBlockDict['nopThreeArgBlock'] = nopThreeArgBlock;
    nopThreeArgBlock.hidden = true;
    nopThreeArgBlock.palette = palettes.dict['extras'];
    nopThreeArgBlock.staticLabels.push(_('unknown'));
    nopThreeArgBlock.adjustWidthToLabel();
    nopThreeArgBlock.threeArgBlock();
    nopThreeArgBlock.dockTypes[1] = 'anyin';
    nopThreeArgBlock.dockTypes[2] = 'anyin';
    nopThreeArgBlock.dockTypes[3] = 'anyin';

    var audioBlock = new ProtoBlock('playback');
    audioBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['playback'] = audioBlock;
    audioBlock.defaults.push(null);
    audioBlock.staticLabels.push(_('play back'));
    audioBlock.adjustWidthToLabel();
    audioBlock.oneArgBlock();
    audioBlock.dockTypes[1] = 'mediain';

    var audioStopBlock = new ProtoBlock('stopplayback');
    audioStopBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['stopplayback'] = audioStopBlock;
    audioStopBlock.staticLabels.push(_('stop play'));
    audioStopBlock.adjustWidthToLabel();
    audioStopBlock.zeroArgBlock();

    var svgBlock = new ProtoBlock('savesvg');
    svgBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['savesvg'] = svgBlock;
    svgBlock.staticLabels.push(_('save svg'));
    svgBlock.adjustWidthToLabel();
    svgBlock.oneArgBlock();
    svgBlock.defaults.push(_('title') + '.svg');
    svgBlock.dockTypes[1] = 'textin';

    var publishBlock = new ProtoBlock('publish');
    publishBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['publish'] = publishBlock;
    publishBlock.staticLabels.push(_('publish to Facebook'));
    publishBlock.adjustWidthToLabel();
    publishBlock.oneArgBlock();
    publishBlock.defaults.push(_('title'));
    publishBlock.dockTypes[1] = 'textin';
    publishBlock.hidden = true;

    var getyTurtleBlock = new ProtoBlock('yturtle');
    getyTurtleBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['yturtle'] = getyTurtleBlock;
    getyTurtleBlock.staticLabels.push(_('turtle y'));
    getyTurtleBlock.adjustWidthToLabel();
    getyTurtleBlock.oneArgMathBlock();
    getyTurtleBlock.dockTypes[1] = 'anyin';
    getyTurtleBlock.defaults.push('0');

    var getxTurtleBlock = new ProtoBlock('xturtle');
    getxTurtleBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['xturtle'] = getxTurtleBlock;
    getxTurtleBlock.staticLabels.push(_('turtle x'));
    getxTurtleBlock.adjustWidthToLabel();
    getxTurtleBlock.oneArgMathBlock();
    getxTurtleBlock.dockTypes[1] = 'anyin';
    getxTurtleBlock.defaults.push('0');

    var startTurtleBlock = new ProtoBlock('startTurtle');
    startTurtleBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['startTurtle'] = startTurtleBlock;
    startTurtleBlock.staticLabels.push(_('start turtle'));
    startTurtleBlock.adjustWidthToLabel();
    startTurtleBlock.oneArgBlock();
    startTurtleBlock.dockTypes[1] = 'anyin';
    startTurtleBlock.defaults.push('0');

    var stopTurtleBlock = new ProtoBlock('stopTurtle');
    stopTurtleBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['stopTurtle'] = stopTurtleBlock;
    stopTurtleBlock.staticLabels.push(_('stop turtle'));
    stopTurtleBlock.adjustWidthToLabel();
    stopTurtleBlock.oneArgBlock();
    stopTurtleBlock.dockTypes[1] = 'anyin';
    stopTurtleBlock.defaults.push('0');

    var noBackgroundBlock = new ProtoBlock('nobackground');
    blocks.protoBlockDict['nobackground'] = noBackgroundBlock;
    noBackgroundBlock.palette = palettes.dict['extras'];
    noBackgroundBlock.staticLabels.push(_('no background'));
    noBackgroundBlock.adjustWidthToLabel();
    noBackgroundBlock.zeroArgBlock();

    var showBlocks = new ProtoBlock('showblocks');
    showBlocks.palette = palettes.dict['extras'];
    blocks.protoBlockDict['showblocks'] = showBlocks;
    showBlocks.staticLabels.push(_('show blocks'));
    showBlocks.adjustWidthToLabel();
    showBlocks.zeroArgBlock();

    var hideBlocks = new ProtoBlock('hideblocks');
    hideBlocks.palette = palettes.dict['extras'];
    blocks.protoBlockDict['hideblocks'] = hideBlocks;
    hideBlocks.staticLabels.push(_('hide blocks'));
    hideBlocks.adjustWidthToLabel();
    hideBlocks.zeroArgBlock();

    var openProjectBlock = new ProtoBlock('openProject');
    openProjectBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['openProject'] = openProjectBlock;
    openProjectBlock.staticLabels.push(_('open project'));
    openProjectBlock.adjustWidthToLabel();
    openProjectBlock.oneArgBlock();
    openProjectBlock.defaults.push('url');
    openProjectBlock.dockTypes[1] = 'textin';

    var vspaceBlock = new ProtoBlock('vspace');
    vspaceBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['vspace'] = vspaceBlock;
    vspaceBlock.staticLabels.push('↓');
    vspaceBlock.extraWidth = -10;
    vspaceBlock.zeroArgBlock();

    var hspaceBlock = new ProtoBlock('hspace');
    hspaceBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['hspace'] = hspaceBlock;
    hspaceBlock.oneArgMathBlock();
    hspaceBlock.staticLabels.push('←');
    hspaceBlock.dockTypes[0] = 'anyout';
    hspaceBlock.dockTypes[1] = 'anyin';

    var waitBlock = new ProtoBlock('wait');
    waitBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['wait'] = waitBlock;
    waitBlock.staticLabels.push(_('wait'));
    waitBlock.adjustWidthToLabel();
    waitBlock.oneArgBlock();
    waitBlock.defaults.push(1);

    var printBlock = new ProtoBlock('print');
    printBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['print'] = printBlock;
    printBlock.staticLabels.push(_('print'));
    printBlock.adjustWidthToLabel();
    printBlock.oneArgBlock();
    printBlock.dockTypes[1] = 'anyin';

    var turtleNameBlock = new ProtoBlock('turtlename');
    turtleNameBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['turtlename'] = turtleNameBlock;
    turtleNameBlock.staticLabels.push(_('turtle name'));
    turtleNameBlock.adjustWidthToLabel();
    turtleNameBlock.parameterBlock();
    turtleNameBlock.dockTypes[0] = 'textout';

    var setTurtleName = new ProtoBlock('setturtlename');
    setTurtleName.palette = palettes.dict['extras'];
    blocks.protoBlockDict['setturtlename'] = setTurtleName;
    setTurtleName.staticLabels.push(_('turtle name'));
    setTurtleName.staticLabels.push(_('source'));
    setTurtleName.staticLabels.push(_('target'));
    setTurtleName.adjustWidthToLabel();
    setTurtleName.twoArgBlock();
    setTurtleName.dockTypes[1] = 'anyin';
    setTurtleName.dockTypes[2] = 'anyin';
    setTurtleName.defaults.push('0');
    setTurtleName.defaults.push('Yertle');

    var statusBlock = new ProtoBlock('status');
    statusBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['status'] = statusBlock;
    statusBlock.staticLabels.push(_('status'));
    statusBlock.adjustWidthToLabel();
    statusBlock.stackClampZeroArgBlock();

    // SENSORS PALETTE

    var loudnessBlock = new ProtoBlock('loudness');
    loudnessBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['loudness'] = loudnessBlock;
    loudnessBlock.staticLabels.push(_('loudness'));
    loudnessBlock.adjustWidthToLabel();
    loudnessBlock.parameterBlock();

    // Turtle-specific click event
    var myClickBlock = new ProtoBlock('myclick');
    myClickBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['myclick'] = myClickBlock;
    myClickBlock.staticLabels.push(_('click'));
    myClickBlock.adjustWidthToLabel();
    myClickBlock.parameterBlock();
    myClickBlock.dockTypes[0] = 'textout';

    var getBlue = new ProtoBlock('getblue');
    getBlue.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['getblue'] = getBlue;
    getBlue.staticLabels.push(_('blue'));
    getBlue.adjustWidthToLabel();
    getBlue.parameterBlock();

    var getGreen = new ProtoBlock('getgreen');
    getGreen.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['getgreen'] = getGreen;
    getGreen.staticLabels.push(_('green'));
    getGreen.adjustWidthToLabel();
    getGreen.parameterBlock();

    var getRed = new ProtoBlock('getred');
    getRed.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['getred'] = getRed;
    getRed.staticLabels.push(_('red'));
    getRed.adjustWidthToLabel();
    getRed.parameterBlock();

    var getColorPixel = new ProtoBlock('getcolorpixel');
    getColorPixel.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['getcolorpixel'] = getColorPixel;
    getColorPixel.staticLabels.push(_('pixel color'));
    getColorPixel.adjustWidthToLabel();
    getColorPixel.parameterBlock();

    var timeBlock = new ProtoBlock('time');
    timeBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['time'] = timeBlock;
    timeBlock.staticLabels.push(_('time'));
    timeBlock.adjustWidthToLabel();
    timeBlock.parameterBlock();

    var mousexBlock = new ProtoBlock('mousex');
    mousexBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['mousex'] = mousexBlock;
    mousexBlock.staticLabels.push(_('mouse x'));
    mousexBlock.extraWidth = 15;
    mousexBlock.adjustWidthToLabel();
    mousexBlock.parameterBlock();

    var mouseyBlock = new ProtoBlock('mousey');
    mouseyBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['mousey'] = mouseyBlock;
    mouseyBlock.staticLabels.push(_('mouse y'));
    mouseyBlock.extraWidth = 15;
    mouseyBlock.adjustWidthToLabel();
    mouseyBlock.parameterBlock();

    var mousebuttonBlock = new ProtoBlock('mousebutton');
    mousebuttonBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['mousebutton'] = mousebuttonBlock;
    mousebuttonBlock.staticLabels.push(_('mouse button'));
    mousebuttonBlock.adjustWidthToLabel();
    mousebuttonBlock.booleanZeroArgBlock();

    var toASCIIBlock = new ProtoBlock('toascii');
    toASCIIBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['toascii'] = toASCIIBlock;
    toASCIIBlock.staticLabels.push(_('to ASCII'));
    toASCIIBlock.defaults.push(65);
    toASCIIBlock.oneArgMathBlock();

    var keyboardBlock = new ProtoBlock('keyboard');
    keyboardBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['keyboard'] = keyboardBlock;
    keyboardBlock.staticLabels.push(_('keyboard'));
    keyboardBlock.adjustWidthToLabel();
    keyboardBlock.parameterBlock();

    // REMOVED UNTIL WE PLUG THE SECURITY HOLE
    /*
    var evalBlock = new ProtoBlock('eval');
    evalBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['eval'] = evalBlock;
    evalBlock.staticLabels.push(_('eval'));
    evalBlock.staticLabels.push('f(x)');
    evalBlock.staticLabels.push('x');
    evalBlock.adjustWidthToLabel();
    evalBlock.twoArgMathBlock();
    evalBlock.dockTypes[1] = 'textin';
    evalBlock.defaults.push('x');
    evalBlock.defaults.push(100);
    */
    
    // Music Blocks that we ignore
    var transposition = new ProtoBlock('transpositionfactor');
    transposition.palette = palettes.dict['extras'];
    blocks.protoBlockDict['transpositionfactor'] = transposition;
    transposition.staticLabels.push(_('transposition'));
    transposition.adjustWidthToLabel();
    transposition.parameterBlock();
    transposition.hidden = true;

    var consonantStepDownBlock = new ProtoBlock('consonantstepsizedown');
    consonantStepDownBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['consonantstepsizedown'] = consonantStepDownBlock;
    //.TRANS: step down one note in current mode
    consonantStepDownBlock.staticLabels.push(_('consonant step down'));
    consonantStepDownBlock.adjustWidthToLabel();
    consonantStepDownBlock.parameterBlock();
    consonantStepDownBlock.hidden = true;

    var consonantStepUpBlock = new ProtoBlock('consonantstepsizeup');
    consonantStepUpBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['consonantstepsizeup'] = consonantStepUpBlock;
    //.TRANS: step up one note in current mode
    consonantStepUpBlock.staticLabels.push(_('consonant step up'));
    consonantStepUpBlock.adjustWidthToLabel();
    consonantStepUpBlock.parameterBlock();
    consonantStepUpBlock.hidden = true;

    var turtlePitchBlock = new ProtoBlock('turtlepitch');
    turtlePitchBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['turtlepitch'] = turtlePitchBlock;
    //.TRANS: convert current note for this turtle to piano key (1-88)
    turtlePitchBlock.staticLabels.push(_('mouse pitch number'));
    turtlePitchBlock.oneArgMathBlock();
    turtlePitchBlock.adjustWidthToLabel();
    turtlePitchBlock.dockTypes[1] = 'anyin';
    turtlePitchBlock.hidden = true;

    var setPitchNumberOffsetBlock = new ProtoBlock('setpitchnumberoffset');
    setPitchNumberOffsetBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['setpitchnumberoffset'] = setPitchNumberOffsetBlock;
    setPitchNumberOffsetBlock.staticLabels.push(_('set pitch number offset'), _('name'), _('octave'));
    setPitchNumberOffsetBlock.adjustWidthToLabel();
    setPitchNumberOffsetBlock.twoArgBlock();
    setPitchNumberOffsetBlock.defaults.push('4');
    setPitchNumberOffsetBlock.dockTypes[1] = 'notein';
    setPitchNumberOffsetBlock.dockTypes[2] = 'anyin';
    setPitchNumberOffsetBlock.hidden = true;

    var numberToPitchBlock = new ProtoBlock('number2pitch');
    numberToPitchBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['number2pitch'] = numberToPitchBlock;
    //.TRANS: convert piano key number (1-88) to pitch
    numberToPitchBlock.staticLabels.push(_('number to pitch'));
    numberToPitchBlock.oneArgMathBlock();
    numberToPitchBlock.adjustWidthToLabel();
    numberToPitchBlock.defaults.push(48);
    numberToPitchBlock.hidden = true;

    var numberToOctaveBlock = new ProtoBlock('number2octave');
    numberToOctaveBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['number2octave'] = numberToOctaveBlock;
    //.TRANS: convert piano key number (1-88) to octave
    numberToOctaveBlock.staticLabels.push(_('number to octave'));
    numberToOctaveBlock.oneArgMathBlock();
    numberToOctaveBlock.adjustWidthToLabel();
    numberToOctaveBlock.hidden = true;
    numberToOctaveBlock.defaults.push(48);

    // Value blocks
    var modenameBlock = new ProtoBlock('modename');
    modenameBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['modename'] = modenameBlock;
    modenameBlock.valueBlock();
    modenameBlock.dockTypes[0] = 'textout';
    modenameBlock.hidden = true;

    var notenameBlock = new ProtoBlock('notename');
    notenameBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['notename'] = notenameBlock;
    notenameBlock.valueBlock();
    notenameBlock.dockTypes[0] = 'noteout';
    notenameBlock.hidden = true;

    var solfegeBlock = new ProtoBlock('solfege');
    solfegeBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['solfege'] = solfegeBlock;
    solfegeBlock.valueBlock();
    solfegeBlock.dockTypes[0] = 'solfegeout';
    solfegeBlock.hidden = true;

    var eastindiansolfegeBlock = new ProtoBlock('eastindiansolfege');
    eastindiansolfegeBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['eastindiansolfege'] = eastindiansolfegeBlock;
    eastindiansolfegeBlock.valueBlock();
    eastindiansolfegeBlock.dockTypes[0] = 'solfegeout';
    eastindiansolfegeBlock.hidden = true;

    // Transposition blocks
    var invertBlock = new ProtoBlock('invert1');
    invertBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['invert1'] = invertBlock;
    invertBlock.staticLabels.push(_('invert'), _('name'), _('octave'), _('even') + '/' + _('odd'));
    invertBlock.adjustWidthToLabel();
    invertBlock.flowClampThreeArgBlock();
    invertBlock.adjustWidthToLabel();
    invertBlock.defaults.push('sol');
    invertBlock.defaults.push(4);
    invertBlock.defaults.push(_('even'));
    invertBlock.dockTypes[1] = 'solfegein';
    invertBlock.dockTypes[2] = 'anyin';
    invertBlock.dockTypes[3] = 'anyin';
    invertBlock.hidden = true;

    var transpositionBlock = new ProtoBlock('settransposition');
    transpositionBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['settransposition'] = transpositionBlock;
    transpositionBlock.staticLabels.push(_('adjust transposition'));
    transpositionBlock.adjustWidthToLabel();
    transpositionBlock.defaults.push('1');
    transpositionBlock.flowClampOneArgBlock();
    transpositionBlock.hidden = true;

    var octaveBlock = new ProtoBlock('octave');
    octaveBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['octave'] = octaveBlock;
    octaveBlock.staticLabels.push(_('octave'));
    octaveBlock.adjustWidthToLabel();
    octaveBlock.zeroArgBlock();
    octaveBlock.hidden = true;

    var flatBlock = new ProtoBlock('flat');
    flatBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['flat'] = flatBlock;
    flatBlock.staticLabels.push(_('flat'));
    flatBlock.adjustWidthToLabel();
    flatBlock.flowClampZeroArgBlock();
    flatBlock.hidden = true;

    var sharpBlock = new ProtoBlock('sharp');
    sharpBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['sharp'] = sharpBlock;
    sharpBlock.staticLabels.push(_('sharp'));
    sharpBlock.adjustWidthToLabel();
    sharpBlock.flowClampZeroArgBlock();
    sharpBlock.hidden = true;

    var hertzBlock = new ProtoBlock('hertz');
    hertzBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['hertz'] = hertzBlock;
    hertzBlock.staticLabels.push(_('hertz'));
    hertzBlock.adjustWidthToLabel();
    hertzBlock.oneArgBlock();
    hertzBlock.defaults.push(392);
    hertzBlock.hidden = true;

    var pitchNumberBlock = new ProtoBlock('pitchnumber');
    pitchNumberBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['pitchnumber'] = pitchNumberBlock;
    pitchNumberBlock.staticLabels.push(_('pitch number'));
    pitchNumberBlock.adjustWidthToLabel();
    pitchNumberBlock.oneArgBlock();
    pitchNumberBlock.defaults.push(7);
    pitchNumberBlock.dockTypes[1] = 'numberin';
    pitchNumberBlock.hidden = true;

    var scaleDegree = new ProtoBlock('scaledegree');
    scaleDegree.palette = palettes.dict['extras'];
    blocks.protoBlockDict['scaledegree'] = scaleDegree;
    scaleDegree.staticLabels.push(_('scale degree'), _('number'), _('octave'));
    scaleDegree.adjustWidthToLabel();
    scaleDegree.defaults.push(5); // G in C Major
    scaleDegree.defaults.push(4);
    scaleDegree.twoArgBlock();
    scaleDegree.dockTypes[1] = 'numberin';
    scaleDegree.dockTypes[2] = 'anyin';
    scaleDegree.hidden = true;

    var pitchStepBlock = new ProtoBlock('steppitch');
    pitchStepBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['steppitch'] = pitchStepBlock;
    //.TRANS: step some number of notes in current mode
    pitchStepBlock.staticLabels.push(_('step pitch'));
    pitchStepBlock.oneArgBlock();
    pitchStepBlock.adjustWidthToLabel();
    pitchStepBlock.dockTypes[1] = 'anyin';
    pitchStepBlock.defaults.push(1);
    pitchStepBlock.hidden = true;

    var pitch = new ProtoBlock('pitch');
    pitch.palette = palettes.dict['extras'];
    blocks.protoBlockDict['pitch'] = pitch;
    pitch.staticLabels.push(_('pitch'), _('name'), _('octave'));
    pitch.adjustWidthToLabel();
    pitch.defaults.push('sol');
    pitch.defaults.push(4);
    pitch.twoArgBlock();
    pitch.dockTypes[1] = 'solfegein';
    pitch.dockTypes[2] = 'anyin';
    pitch.hidden = true;

    var sixtyfourthNoteBlock = new ProtoBlock('sixtyfourthNote');
    sixtyfourthNoteBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['sixtyfourthNote'] = sixtyfourthNoteBlock;
    sixtyfourthNoteBlock.staticLabels.push(_('1/64 note') + ' 𝅘𝅥𝅱');
    sixtyfourthNoteBlock.adjustWidthToLabel();
    sixtyfourthNoteBlock.zeroArgBlock();
    sixtyfourthNoteBlock.hidden = true;

    var thirtysecondNoteBlock = new ProtoBlock('thirtysecondNote');
    thirtysecondNoteBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['thirtysecondNote'] = thirtysecondNoteBlock;
    thirtysecondNoteBlock.staticLabels.push(_('1/32 note') + ' 𝅘𝅥𝅰');
    thirtysecondNoteBlock.adjustWidthToLabel();
    thirtysecondNoteBlock.zeroArgBlock();
    thirtysecondNoteBlock.hidden = true;

    var sixteenthNoteBlock = new ProtoBlock('sixteenthNote');
    sixteenthNoteBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['sixteenthNote'] = sixteenthNoteBlock;
    sixteenthNoteBlock.staticLabels.push(_('1/16 note') + ' 𝅘𝅥𝅯');
    sixteenthNoteBlock.adjustWidthToLabel();
    sixteenthNoteBlock.zeroArgBlock();
    sixteenthNoteBlock.hidden = true;

    var eighthNoteBlock = new ProtoBlock('eighthNote');
    eighthNoteBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['eighthNote'] = eighthNoteBlock;
    eighthNoteBlock.staticLabels.push(_('eighth note') + ' ♪');
    eighthNoteBlock.adjustWidthToLabel();
    eighthNoteBlock.zeroArgBlock();
    eighthNoteBlock.hidden = true;

    var quarterNoteBlock = new ProtoBlock('quarterNote');
    quarterNoteBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['quarterNote'] = quarterNoteBlock;
    quarterNoteBlock.staticLabels.push(_('quarter note') + ' ♩');
    quarterNoteBlock.adjustWidthToLabel();
    quarterNoteBlock.zeroArgBlock();
    quarterNoteBlock.hidden = true;

    var halfNoteBlock = new ProtoBlock('halfNote');
    halfNoteBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['halfNote'] = halfNoteBlock;
    halfNoteBlock.staticLabels.push(_('half note') + ' 𝅗𝅥');
    halfNoteBlock.adjustWidthToLabel();
    halfNoteBlock.zeroArgBlock();
    halfNoteBlock.hidden = true;

    var wholeNoteBlock = new ProtoBlock('wholeNote');
    wholeNoteBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['wholeNote'] = wholeNoteBlock;
    wholeNoteBlock.staticLabels.push(_('whole note') + ' 𝅝');
    wholeNoteBlock.adjustWidthToLabel();
    wholeNoteBlock.zeroArgBlock();
    wholeNoteBlock.hidden = true;

    var tuplet4Block = new ProtoBlock('tuplet4');
    tuplet4Block.palette = palettes.dict['extras'];
    blocks.protoBlockDict['tuplet4'] = tuplet4Block;
    tuplet4Block.staticLabels.push(_('tuplet'), _('note value'));
    tuplet4Block.extraWidth = 20;
    tuplet4Block.adjustWidthToLabel();
    tuplet4Block.flowClampOneArgBlock();
    tuplet4Block.defaults.push(1 / 4);
    tuplet4Block.hidden = true;

    var simpleTupletBlock = new ProtoBlock('stuplet');
    simpleTupletBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['stuplet'] = simpleTupletBlock;
    simpleTupletBlock.staticLabels.push(_('simple tuplet'), _('number of notes'), _('note value'));
    simpleTupletBlock.adjustWidthToLabel();
    simpleTupletBlock.twoArgBlock();
    simpleTupletBlock.defaults.push(3);
    simpleTupletBlock.defaults.push(1 / 2);
    simpleTupletBlock.hidden = true;

    var rhythm2 = new ProtoBlock('rhythm2');
    rhythm2.palette = palettes.dict['extras'];
    blocks.protoBlockDict['rhythm2'] = rhythm2;
    rhythm2.staticLabels.push(_('rhythm'), _('number of notes'), _('note value'));
    rhythm2.extraWidth = 10;
    rhythm2.adjustWidthToLabel();
    rhythm2.defaults.push(3);
    rhythm2.defaults.push(4);
    rhythm2.twoArgBlock();
    rhythm2.dockTypes[1] = 'anyin';
    rhythm2.dockTypes[2] = 'anyin';
    rhythm2.hidden = true;

    var modewidgetBlock = new ProtoBlock('modewidget');
    modewidgetBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['modewidget'] = modewidgetBlock;
    modewidgetBlock.staticLabels.push(_('custom mode'));
    modewidgetBlock.adjustWidthToLabel();
    modewidgetBlock.stackClampZeroArgBlock();
    modewidgetBlock.hidden = true;

    var tempoBlock = new ProtoBlock('tempo');
    tempoBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['tempo'] = tempoBlock;
    tempoBlock.staticLabels.push(_('tempo'));
    tempoBlock.adjustWidthToLabel();
    tempoBlock.stackClampZeroArgBlock();
    tempoBlock.hidden = true;

    var pitchDrumMatrixBlock = new ProtoBlock('pitchdrummatrix');
    pitchDrumMatrixBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['pitchdrummatrix'] = pitchDrumMatrixBlock;
    pitchDrumMatrixBlock.staticLabels.push(_('pitch-drum matrix'));
    pitchDrumMatrixBlock.adjustWidthToLabel();
    pitchDrumMatrixBlock.stackClampZeroArgBlock();
    pitchDrumMatrixBlock.hidden = true;

    var pitchsliderBlock = new ProtoBlock('pitchslider');
    pitchsliderBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['pitchslider'] = pitchsliderBlock;
    //.TRANS: widget to generate pitches using a slider
    pitchsliderBlock.staticLabels.push(_('pitchslider'));
    pitchsliderBlock.adjustWidthToLabel();
    pitchsliderBlock.stackClampZeroArgBlock();
    pitchsliderBlock.hidden = true;

    var pitchstaircaseBlock = new ProtoBlock('pitchstaircase');
    pitchstaircaseBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['pitchstaircase'] = pitchstaircaseBlock;
    pitchstaircaseBlock.staticLabels.push(_('pitch staircase'));
    pitchstaircaseBlock.adjustWidthToLabel();
    pitchstaircaseBlock.stackClampZeroArgBlock();
    pitchstaircaseBlock.hidden = true;

    var rhythmrulerBlock = new ProtoBlock('rhythmruler');
    rhythmrulerBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['rhythmruler'] = rhythmrulerBlock;
    //.TRANS: widget for subdividing a measure into distinct rhythmic elements
    rhythmrulerBlock.staticLabels.push(_('rhythm ruler'));
    rhythmrulerBlock.adjustWidthToLabel();
    rhythmrulerBlock.stackClampOneArgBlock();
    rhythmrulerBlock.defaults.push(1);
    rhythmrulerBlock.hidden = true;

    var matrixBlock = new ProtoBlock('matrix');
    matrixBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['matrix'] = matrixBlock;
    matrixBlock.staticLabels.push(_('pitch-time matrix'));
    matrixBlock.adjustWidthToLabel();
    matrixBlock.stackClampZeroArgBlock();
    matrixBlock.hidden = true;

    var noteCounter = new ProtoBlock('notecounter');
    noteCounter.palette = palettes.dict['extras'];
    blocks.protoBlockDict['notecounter'] = noteCounter;
    noteCounter.staticLabels.push(_('note counter'));
    noteCounter.argFlowClampBlock();
    noteCounter.adjustWidthToLabel();
    noteCounter.hidden = true;

    var turtleNoteBlock2 = new ProtoBlock('turtlenote2');
    turtleNoteBlock2.palette = palettes.dict['extras'];
    blocks.protoBlockDict['turtlenote2'] = turtleNoteBlock2;
    turtleNoteBlock2.staticLabels.push(_('mouse note value'));
    turtleNoteBlock2.oneArgMathBlock();
    turtleNoteBlock2.adjustWidthToLabel();
    turtleNoteBlock2.dockTypes[1] = 'anyin';
    turtleNoteBlock2.hidden = true;

    var duplicateFactor = new ProtoBlock('duplicatefactor');
    duplicateFactor.palette = palettes.dict['extras'];
    blocks.protoBlockDict['duplicatefactor'] = duplicateFactor;
    duplicateFactor.staticLabels.push(_('duplicate factor'));
    duplicateFactor.adjustWidthToLabel();
    duplicateFactor.parameterBlock();
    duplicateFactor.hidden = true;

    var skipFactor = new ProtoBlock('skipfactor');
    skipFactor.palette = palettes.dict['extras'];
    blocks.protoBlockDict['skipfactor'] = skipFactor;
    skipFactor.staticLabels.push(_('skip factor'));
    skipFactor.adjustWidthToLabel();
    skipFactor.parameterBlock();
    skipFactor.hidden = true;

    var elapsedNotes = new ProtoBlock('elapsednotes');
    elapsedNotes.palette = palettes.dict['extras'];
    blocks.protoBlockDict['elapsednotes'] = elapsedNotes;
    //.TRANS: number of whole notes that have been played
    elapsedNotes.staticLabels.push(_('notes played'));
    elapsedNotes.adjustWidthToLabel();
    elapsedNotes.parameterBlock();
    elapsedNotes.hidden = true;

    var beatfactor = new ProtoBlock('beatfactor');
    beatfactor.palette = palettes.dict['extras'];
    blocks.protoBlockDict['beatfactor'] = beatfactor;
    //.TRANS: number of beats per minute
    beatfactor.staticLabels.push(_('beat factor'));
    beatfactor.adjustWidthToLabel();
    beatfactor.parameterBlock();
    beatfactor.hidden = true;

    var bpmBlock = new ProtoBlock('bpmfactor');
    bpmBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['bpmfactor'] = bpmBlock;
    bpmBlock.staticLabels.push(_('beats per minute'));
    bpmBlock.adjustWidthToLabel();
    bpmBlock.parameterBlock();
    bpmBlock.hidden = true;

    var driftBlock = new ProtoBlock('drift');
    driftBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['drift'] = driftBlock;
    driftBlock.staticLabels.push(_('free time'));
    driftBlock.adjustWidthToLabel();
    driftBlock.flowClampZeroArgBlock();
    driftBlock.hidden = true;

    var osctimeBlock = new ProtoBlock('osctime');
    osctimeBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['osctime'] = osctimeBlock;
    //.TRANS: oscillator time (in micro seconds)
    osctimeBlock.staticLabels.push(_('osctime'));
    osctimeBlock.adjustWidthToLabel();
    osctimeBlock.flowClampOneArgBlock();
    osctimeBlock.defaults.push(200);
    osctimeBlock.hidden = true;

    var newswingBlock = new ProtoBlock('newswing2');
    newswingBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['newswing2'] = newswingBlock;
    newswingBlock.staticLabels.push(_('swing'), _('swing value'), _('note value'));
    newswingBlock.extraWidth = 20;
    newswingBlock.adjustWidthToLabel();
    newswingBlock.flowClampTwoArgBlock();
    newswingBlock.defaults.push(1 / 24);
    newswingBlock.defaults.push(1 / 8);
    newswingBlock.hidden = true;

    var setbpmBlock = new ProtoBlock('setbpm');
    setbpmBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['setbpm'] = setbpmBlock;
    setbpmBlock.staticLabels.push(_('beats per minute'));
    setbpmBlock.adjustWidthToLabel();
    setbpmBlock.flowClampOneArgBlock();
    setbpmBlock.defaults.push(90);
    setbpmBlock.hidden = true;

    var backwardBlock = new ProtoBlock('backward');
    backwardBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['backward'] = backwardBlock;
    backwardBlock.staticLabels.push(_('backward'));
    backwardBlock.adjustWidthToLabel();
    backwardBlock.flowClampZeroArgBlock();
    backwardBlock.hidden = true;

    var skipNotesBlock = new ProtoBlock('skipnotes');
    skipNotesBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['skipnotes'] = skipNotesBlock;
    skipNotesBlock.staticLabels.push(_('skip notes'));
    skipNotesBlock.adjustWidthToLabel();
    skipNotesBlock.flowClampOneArgBlock();
    skipNotesBlock.defaults.push(2);
    skipNotesBlock.hidden = true;

    var duplicateNotesBlock = new ProtoBlock('duplicatenotes');
    duplicateNotesBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['duplicatenotes'] = duplicateNotesBlock;
    duplicateNotesBlock.staticLabels.push(_('duplicate notes'));
    duplicateNotesBlock.adjustWidthToLabel();
    duplicateNotesBlock.flowClampOneArgBlock();
    duplicateNotesBlock.defaults.push(2);
    duplicateNotesBlock.hidden = true;

    var beatFactorBlock = new ProtoBlock('multiplybeatfactor');
    beatFactorBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['multiplybeatfactor'] = beatFactorBlock;
    //.TRANS: speed up note duration by some factor, e.g. convert 1/4 to 1/8 notes by using a factor of 2
    beatFactorBlock.staticLabels.push(_('multiply beat value'));
    beatFactorBlock.adjustWidthToLabel();
    beatFactorBlock.flowClampOneArgBlock();
    beatFactorBlock.defaults.push(2);
    beatFactorBlock.hidden = true;

    var beatFactorBlock2 = new ProtoBlock('dividebeatfactor');
    beatFactorBlock2.palette = palettes.dict['extras'];
    blocks.protoBlockDict['dividebeatfactor'] = beatFactorBlock2;
    //.TRANS: slow down note duration by some factor, e.g. convert 1/8 to 1/4 notes by using a factor of 2
    beatFactorBlock2.staticLabels.push(_('divide beat value'));
    beatFactorBlock2.adjustWidthToLabel();
    beatFactorBlock2.flowClampOneArgBlock();
    beatFactorBlock2.defaults.push(2);
    beatFactorBlock2.hidden = true;

    var tieBlock = new ProtoBlock('tie');
    tieBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['tie'] = tieBlock;
    //.TRANS: tie notes together into one longer note
    tieBlock.staticLabels.push(_('tie'));
    tieBlock.adjustWidthToLabel();
    tieBlock.flowClampZeroArgBlock();
    tieBlock.hidden = true;

    var rhythmicdotBlock = new ProtoBlock('rhythmicdot');
    rhythmicdotBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['rhythmicdot'] = rhythmicdotBlock;
    rhythmicdotBlock.staticLabels.push(_('dot'));
    rhythmicdotBlock.adjustWidthToLabel();
    rhythmicdotBlock.flowClampZeroArgBlock();
    rhythmicdotBlock.hidden = true;

    var rest2Block = new ProtoBlock('rest2');
    rest2Block.palette = palettes.dict['extras'];
    blocks.protoBlockDict['rest2'] = rest2Block;
    rest2Block.staticLabels.push(_('silence'));
    rest2Block.adjustWidthToLabel();
    rest2Block.zeroArgBlock();
    rest2Block.hidden = true;

    var newnoteBlock = new ProtoBlock('newnote');
    newnoteBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['newnote'] = newnoteBlock;
    newnoteBlock.staticLabels.push(_('note value'));
    newnoteBlock.adjustWidthToLabel();
    newnoteBlock.flowClampOneArgBlock();
    newnoteBlock.defaults.push(1 / 4);
    newnoteBlock.hidden = true;

    var setkey2Block = new ProtoBlock('setkey2');
    setkey2Block.palette = palettes.dict['extras'];
    blocks.protoBlockDict['setkey2'] = setkey2Block;
    setkey2Block.staticLabels.push(_('set key'), _('key'), _('mode'));
    setkey2Block.adjustWidthToLabel();
    setkey2Block.twoArgBlock();
    setkey2Block.dockTypes[1] = 'anyin';
    setkey2Block.dockTypes[2] = 'anyin';
    setkey2Block.hidden = true;

    var keyBlock = new ProtoBlock('key');
    keyBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['key'] = keyBlock;
    keyBlock.staticLabels.push(_('key'));
    keyBlock.adjustWidthToLabel();
    keyBlock.parameterBlock();
    keyBlock.hidden = true;

    var meter = new ProtoBlock('meter');
    meter.palette = palettes.dict['extras'];
    blocks.protoBlockDict['meter'] = meter;
    meter.hidden = true;
    meter.staticLabels.push(_('meter'), _('numerator'), _('denominator'));
    meter.adjustWidthToLabel();
    meter.defaults.push(3);
    meter.defaults.push(4);
    meter.twoArgMathBlock();
    meter.dockTypes[1] = 'number';
    meter.dockTypes[2] = 'number';
    meter.hidden = true;

    var setMasterBPMBlock = new ProtoBlock('setmasterbpm');
    setMasterBPMBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['setmasterbpm'] = setMasterBPMBlock;
    setMasterBPMBlock.staticLabels.push(_('master beats per minute'));
    setMasterBPMBlock.adjustWidthToLabel();
    setMasterBPMBlock.oneArgBlock();
    setMasterBPMBlock.defaults.push(90);
    setMasterBPMBlock.hidden = true;

    var voicenameBlock = new ProtoBlock('voicename');
    voicenameBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['voicename'] = voicenameBlock;
    voicenameBlock.valueBlock();
    voicenameBlock.dockTypes[0] = 'textout';
    voicenameBlock.hidden = true;

    var vibratoBlock = new ProtoBlock('vibrato');
    vibratoBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['vibrato'] = vibratoBlock;
    vibratoBlock.staticLabels.push(_('vibrato'), _('intensity'), _('rate'));
    vibratoBlock.adjustWidthToLabel();
    vibratoBlock.flowClampTwoArgBlock();
    vibratoBlock.defaults.push(10);
    vibratoBlock.defaults.push(1 / 16);
    vibratoBlock.hidden = true;

    var voiceBlock = new ProtoBlock('setvoice');
    voiceBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['setvoice'] = voiceBlock;
    voiceBlock.staticLabels.push(_('set synth'));
    voiceBlock.adjustWidthToLabel();
    voiceBlock.flowClampOneArgBlock();
    voiceBlock.dockTypes[1] = 'textin';
    voiceBlock.defaults.push(_('violin'));
    voiceBlock.hidden = true;

    var articulationBlock = new ProtoBlock('articulation');
    articulationBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['articulation'] = articulationBlock;
    articulationBlock.staticLabels.push(_('set relative volume'));
    articulationBlock.adjustWidthToLabel();
    articulationBlock.flowClampOneArgBlock();
    articulationBlock.defaults.push(25);
    articulationBlock.hidden = true;

    var noteVolumeBlock2 = new ProtoBlock('setnotevolume2');
    noteVolumeBlock2.palette = palettes.dict['extras'];
    blocks.protoBlockDict['setnotevolume2'] = noteVolumeBlock2;
    noteVolumeBlock2.staticLabels.push(_('set volume'));
    noteVolumeBlock2.adjustWidthToLabel();
    noteVolumeBlock2.flowClampOneArgBlock();
    noteVolumeBlock2.defaults.push(50);
    noteVolumeBlock2.hidden = true;

    var crescendoBlock = new ProtoBlock('crescendo');
    crescendoBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['crescendo'] = crescendoBlock;
    crescendoBlock.staticLabels.push(_('crescendo')+" +/-");
    crescendoBlock.adjustWidthToLabel();
    crescendoBlock.flowClampOneArgBlock();
    crescendoBlock.defaults.push(5);
    crescendoBlock.hidden = true;

    var newslurBlock = new ProtoBlock('newslur');
    newslurBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['newslur'] = newslurBlock;
    newslurBlock.staticLabels.push(_('slur'));
    newslurBlock.adjustWidthToLabel();
    newslurBlock.flowClampOneArgBlock();
    newslurBlock.defaults.push(1 / 16);
    newslurBlock.hidden = true;

    var newstaccatoBlock = new ProtoBlock('newstaccato');
    newstaccatoBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['newstaccato'] = newstaccatoBlock;
    newstaccatoBlock.staticLabels.push(_('staccato'));
    newstaccatoBlock.adjustWidthToLabel();
    newstaccatoBlock.flowClampOneArgBlock();
    newstaccatoBlock.defaults.push(1 / 32);
    newstaccatoBlock.hidden = true;

    var diminishedxBlock = new ProtoBlock('diminishedx');
    diminishedxBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['diminishedx'] = diminishedxBlock;
    diminishedxBlock.staticLabels.push(_('diminished'), _('interval'), _('octave') + '+/-');
    diminishedxBlock.extraWidth = 20;
    diminishedxBlock.adjustWidthToLabel();
    diminishedxBlock.flowClampTwoArgBlock();
    diminishedxBlock.dockTypes[2] = 'anyin';
    diminishedxBlock.defaults.push(5);
    diminishedxBlock.defaults.push(0);
    diminishedxBlock.hidden = true;

    var augmentedxBlock = new ProtoBlock('augmentedx');
    augmentedxBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['augmentedx'] = augmentedxBlock;
    augmentedxBlock.staticLabels.push(_('augmented'), _('interval'), _('octave') + '+/-');
    augmentedxBlock.extraWidth = 20;
    augmentedxBlock.adjustWidthToLabel();
    augmentedxBlock.flowClampTwoArgBlock();
    augmentedxBlock.dockTypes[2] = 'anyin';
    augmentedxBlock.defaults.push(5);
    augmentedxBlock.defaults.push(0);
    augmentedxBlock.hidden = true;

    var perfectxBlock = new ProtoBlock('perfectx');
    perfectxBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['perfectx'] = perfectxBlock;
    perfectxBlock.staticLabels.push(_('perfect'), _('interval'), _('octave') + '+/-');
    perfectxBlock.extraWidth = 20;
    perfectxBlock.adjustWidthToLabel();
    perfectxBlock.flowClampTwoArgBlock();
    perfectxBlock.dockTypes[2] = 'anyin';
    perfectxBlock.defaults.push(5);
    perfectxBlock.defaults.push(0);
    perfectxBlock.hidden = true;

    var minorxBlock = new ProtoBlock('minorx');
    minorxBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['minorx'] = minorxBlock;
    minorxBlock.staticLabels.push(_('minor'), _('interval'), _('octave') + '+/-');
    minorxBlock.extraWidth = 20;
    minorxBlock.adjustWidthToLabel();
    minorxBlock.flowClampTwoArgBlock();
    minorxBlock.dockTypes[2] = 'anyin';
    minorxBlock.defaults.push(3);
    minorxBlock.defaults.push(0);
    minorxBlock.hidden = true;

    var majorxBlock = new ProtoBlock('majorx');
    majorxBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['majorx'] = majorxBlock;
    majorxBlock.staticLabels.push(_('major'), _('interval'), _('octave') + '+/-');
    majorxBlock.extraWidth = 20;
    majorxBlock.adjustWidthToLabel();
    majorxBlock.flowClampTwoArgBlock();
    majorxBlock.dockTypes[2] = 'anyin';
    majorxBlock.defaults.push(3);
    majorxBlock.defaults.push(0);
    majorxBlock.hidden = true;

    var intervalBlock = new ProtoBlock('interval');
    intervalBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['interval'] = intervalBlock;
    //.TRANS: calculate a relative step between notes based on the current mode
    intervalBlock.staticLabels.push(_('relative interval'));
    intervalBlock.adjustWidthToLabel();
    intervalBlock.flowClampOneArgBlock();
    intervalBlock.defaults.push(5);
    intervalBlock.hidden = true;

    var drumnameBlock = new ProtoBlock('drumname');
    drumnameBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['drumname'] = drumnameBlock;
    drumnameBlock.valueBlock();
    drumnameBlock.dockTypes[0] = 'textout';
    drumnameBlock.hidden = true;

    var setdrumBlock = new ProtoBlock('setdrum');
    setdrumBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['setdrum'] = setdrumBlock;
    //.TRANS: set the current drum sound for playback
    setdrumBlock.staticLabels.push(_('set drum'));
    setdrumBlock.adjustWidthToLabel();
    setdrumBlock.flowClampOneArgBlock();
    setdrumBlock.dockTypes[1] = 'anyin';
    setdrumBlock.hidden = true;

    var playdrumBlock = new ProtoBlock('playdrum');
    playdrumBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['playdrum'] = playdrumBlock;
    playdrumBlock.staticLabels.push(_('drum'));
    playdrumBlock.adjustWidthToLabel();
    playdrumBlock.oneArgBlock();
    playdrumBlock.dockTypes[1] = 'anyin';
    playdrumBlock.hidden = true;

    var lilypondBlock = new ProtoBlock('savelilypond');
    lilypondBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['savelilypond'] = lilypondBlock;
    lilypondBlock.staticLabels.push(_('save as lilypond'));
    lilypondBlock.adjustWidthToLabel();
    lilypondBlock.oneArgBlock();
    lilypondBlock.defaults.push(_('title') + '.ly');
    lilypondBlock.dockTypes[1] = 'textin';
    lilypondBlock.hidden = true;

    var notevolumeFactor = new ProtoBlock('notevolumefactor');
    notevolumeFactor.palette = palettes.dict['extras'];
    blocks.protoBlockDict['notevolumefactor'] = notevolumeFactor;
    //.TRANS: the volume at which notes are played
    notevolumeFactor.staticLabels.push(_('note volume'));
    notevolumeFactor.adjustWidthToLabel();
    notevolumeFactor.parameterBlock();

    // Push protoblocks onto their palettes.
    for (var protoblock in blocks.protoBlockDict) {
        if (blocks.protoBlockDict[protoblock].palette != null) {
            blocks.protoBlockDict[protoblock].palette.add(blocks.protoBlockDict[protoblock]);
        }
    }

    // Populate the lists of block types.
    blocks.findBlockTypes();
}
