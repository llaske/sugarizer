/* Test tangram - Square */
var anchorBT1 = new Point(new IntAdjoinSqrt2(12, 0), new IntAdjoinSqrt2(12, 0));
var bigTriangle1 = new Tan(0, anchorBT1, 1);
var anchorBT2 = new Point(new IntAdjoinSqrt2(12, 0), new IntAdjoinSqrt2(12, 0));
var bigTriangle2 = new Tan(0, anchorBT2, 7);
var anchorM = new Point(new IntAdjoinSqrt2(0, 0), new IntAdjoinSqrt2(0, 0));
var mediumTriangle = new Tan(1, anchorM, 0);
var anchorST1 = new Point(new IntAdjoinSqrt2(6, 0), new IntAdjoinSqrt2(18, 0));
var smallTriangle1 = new Tan(2, anchorST1, 3);
var anchorST2 = new Point(new IntAdjoinSqrt2(12, 0), new IntAdjoinSqrt2(12, 0));
var smallTriangle2 = new Tan(2, anchorST2, 5);
var anchorS = new Point(new IntAdjoinSqrt2(0, 0), new IntAdjoinSqrt2(12, 0));
var square = new Tan(3, anchorS, 7);
var anchorP = new Point(new IntAdjoinSqrt2(6, 0), new IntAdjoinSqrt2(6, 0));
var parallelogram = new Tan(5, anchorP, 0);

var squareTangram = new Tangram([bigTriangle1, bigTriangle2, mediumTriangle, smallTriangle1, smallTriangle2, square, parallelogram]);
/* Test tangram - Swan */
var anchorBT1_2 = new Point(new IntAdjoinSqrt2(-6, 12), new IntAdjoinSqrt2(30, 6));
var bigTriangle1_2 = new Tan(0, anchorBT1_2, 6);
var anchorBT2_2 = new Point(new IntAdjoinSqrt2(6, 12), new IntAdjoinSqrt2(42, -6));
var bigTriangle2_2 = new Tan(0, anchorBT2_2, 5);
var anchorM_2 = new Point(new IntAdjoinSqrt2(-6, 6), new IntAdjoinSqrt2(30, 0));
var mediumTriangle_2 = new Tan(1, anchorM_2, 7);
var anchorST1_2 = new Point(new IntAdjoinSqrt2(0, 6), new IntAdjoinSqrt2(0, 6));
var smallTriangle1_2 = new Tan(2, anchorST1_2, 4);
var anchorST2_2 = new Point(new IntAdjoinSqrt2(0, 6), new IntAdjoinSqrt2(24, 0));
var smallTriangle2_2 = new Tan(2, anchorST2_2, 3);
var anchorS_2 = new Point(new IntAdjoinSqrt2(0, 6), new IntAdjoinSqrt2(12, 0));
var square_2 = new Tan(3, anchorS_2, 1);
var anchorP_2 = new Point(new IntAdjoinSqrt2(0, 6), new IntAdjoinSqrt2(0, 0));
var parallelogram_2 = new Tan(5, anchorP_2, 2);

var swanTangram = new Tangram([bigTriangle1_2, bigTriangle2_2, mediumTriangle_2, smallTriangle1_2, smallTriangle2_2, square_2, parallelogram_2]);

/* Test tangram - Cat */
var anchorBT1_3 = new Point(new IntAdjoinSqrt2(18, 12), new IntAdjoinSqrt2(30, -6));
var bigTriangle1_3 = new Tan(0, anchorBT1_3, 3);
var anchorBT2_3 = new Point(new IntAdjoinSqrt2(18, 12), new IntAdjoinSqrt2(30, 6));
var bigTriangle2_3 = new Tan(0, anchorBT2_3, 4);
var anchorM_3 = new Point(new IntAdjoinSqrt2(6, 6), new IntAdjoinSqrt2(18, 0));
var mediumTriangle_3 = new Tan(1, anchorM_3, 7);
var anchorST1_3 = new Point(new IntAdjoinSqrt2(6, 0), new IntAdjoinSqrt2(6, 0));
var smallTriangle1_3 = new Tan(2, anchorST1_3, 3);
var anchorST2_3 = new Point(new IntAdjoinSqrt2(6, 0), new IntAdjoinSqrt2(6, 0));
var smallTriangle2_3 = new Tan(2, anchorST2_3, 7);
var anchorS_3 = new Point(new IntAdjoinSqrt2(6, 0), new IntAdjoinSqrt2(6, 0));
var square_3 = new Tan(3, anchorS_3, 1);
var anchorP_3 = new Point(new IntAdjoinSqrt2(6, 0), new IntAdjoinSqrt2(18, 0));
var parallelogram_3 = new Tan(4, anchorP_3, 7);

var catTangram = new Tangram([bigTriangle1_3, bigTriangle2_3, mediumTriangle_3, smallTriangle1_3, smallTriangle2_3, square_3, parallelogram_3]);

/* Test tangram - Bird */
var anchorBT1_4 = new Point(new IntAdjoinSqrt2(24, 0), new IntAdjoinSqrt2(0, 0));
var bigTriangle1_4 = new Tan(0, anchorBT1_4, 1);
var anchorBT2_4 = new Point(new IntAdjoinSqrt2(36, 0), new IntAdjoinSqrt2(12, 0));
var bigTriangle2_4 = new Tan(0, anchorBT2_4, 5);
var anchorM_4 = new Point(new IntAdjoinSqrt2(12, 18), new IntAdjoinSqrt2(12, 6));
var mediumTriangle_4 = new Tan(1, anchorM_4, 3);
var anchorST1_4 = new Point(new IntAdjoinSqrt2(6, 0), new IntAdjoinSqrt2(6, 0));
var smallTriangle1_4 = new Tan(2, anchorST1_4, 1);
var anchorST2_4 = new Point(new IntAdjoinSqrt2(12, 6), new IntAdjoinSqrt2(12, 0));
var smallTriangle2_4 = new Tan(2, anchorST2_4, 2);
var anchorS_4 = new Point(new IntAdjoinSqrt2(12, 6), new IntAdjoinSqrt2(12, 0));
var square_4 = new Tan(3, anchorS_4, 0);
var anchorP_4 = new Point(new IntAdjoinSqrt2(12, 12), new IntAdjoinSqrt2(12, 0));
var parallelogram_4 = new Tan(4, anchorP_4, 0);

var birdTangram = new Tangram([bigTriangle1_4, bigTriangle2_4, mediumTriangle_4, smallTriangle1_4, smallTriangle2_4, square_4, parallelogram_4]);

/* Test tangram - Mountain */
var anchorBT1_5 = new Point(new IntAdjoinSqrt2(0, 12), new IntAdjoinSqrt2(12, 6));
var bigTriangle1_5 = new Tan(0, anchorBT1_5, 4);
var anchorBT2_5 = new Point(new IntAdjoinSqrt2(0, 24), new IntAdjoinSqrt2(12, 6));
var bigTriangle2_5 = new Tan(0, anchorBT2_5, 6);
var anchorM_5 = new Point(new IntAdjoinSqrt2(0, 18), new IntAdjoinSqrt2(12, 0));
var mediumTriangle_5 = new Tan(1, anchorM_5, 7);
var anchorST1_5 = new Point(new IntAdjoinSqrt2(0, 12), new IntAdjoinSqrt2(12, 6));
var smallTriangle1_5 = new Tan(2, anchorST1_5, 6);
var anchorST2_5 = new Point(new IntAdjoinSqrt2(0, 18), new IntAdjoinSqrt2(12, 6));
var smallTriangle2_5 = new Tan(2, anchorST2_5, 6);
var anchorS_5 = new Point(new IntAdjoinSqrt2(0, 18), new IntAdjoinSqrt2(0, 0));
var square_5 = new Tan(3, anchorS_5, 1);
var anchorP_5 = new Point(new IntAdjoinSqrt2(0, 12), new IntAdjoinSqrt2(12, -6));
var parallelogram_5 = new Tan(4, anchorP_5, 1);

var mountainTangram = new Tangram([bigTriangle1_5, bigTriangle2_5, mediumTriangle_5, smallTriangle1_5, smallTriangle2_5, square_5, parallelogram_5]);

/* Test tangram - Arrow */
var anchorBT1_6 = new Point(new IntAdjoinSqrt2(0, 12), new IntAdjoinSqrt2(0, 0));
var bigTriangle1_6 = new Tan(0, anchorBT1_6, 0);
var anchorBT2_6 = new Point(new IntAdjoinSqrt2(0, 12), new IntAdjoinSqrt2(0, 24));
var bigTriangle2_6 = new Tan(0, anchorBT2_6, 6);
var anchorM_6 = new Point(new IntAdjoinSqrt2(0, 0), new IntAdjoinSqrt2(0, 12));
var mediumTriangle_6 = new Tan(1, anchorM_6, 7);
var anchorST1_6 = new Point(new IntAdjoinSqrt2(0, 12), new IntAdjoinSqrt2(0, 18));
var smallTriangle1_6 = new Tan(2, anchorST1_6, 2);
var anchorST2_6 = new Point(new IntAdjoinSqrt2(0, 12), new IntAdjoinSqrt2(0, 12));
var smallTriangle2_6 = new Tan(2, anchorST2_6, 4);
var anchorS_6 = new Point(new IntAdjoinSqrt2(0, 18), new IntAdjoinSqrt2(0, 12));
var square_6 = new Tan(3, anchorS_6, 0);
var anchorP_6 = new Point(new IntAdjoinSqrt2(0, 12), new IntAdjoinSqrt2(0, 0));
var parallelogram_6 = new Tan(5, anchorP_6, 3);

var arrowTangram = new Tangram([bigTriangle1_6, bigTriangle2_6, mediumTriangle_6, smallTriangle1_6, smallTriangle2_6, square_6, parallelogram_6]);


var standardTangrams = [{
  name: 'squareTangram',
  tangram: squareTangram
}, {
  name: 'swanTangram',
  tangram: swanTangram
}, {
  name: 'catTangram',
  tangram: catTangram
}, {
  name: 'birdTangram',
  tangram: birdTangram
}, {
  name: 'mountainTangram',
  tangram: mountainTangram
}, {
  name: 'arrowTangram',
  tangram: arrowTangram
}];
