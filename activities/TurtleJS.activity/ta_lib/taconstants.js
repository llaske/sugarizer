SQUARE_DOCK = true;
ROUND_DOCK = false;
DEFAULT_LANG = 'en_US';

FACTORY_SIDE = 'factory';
BLOCK_SIDE = 'block';

VERT_ARRANGE = 1;
HORIZ_ARRANGE = 2;
NA_ARRANGE = 3;

MOBILE_VER = (/Android/i.test(navigator.userAgent)||navigator.userAgent.indexOf('Mozilla/5.0 (Mobile;')!=-1);
SUGAR_VER = (window.localStorage.getItem('sugar_settings') !== null || window.top.sugar);

COLOR_TABLE2 = [
    0xFF0000, 0xFF0D00, 0xFF1A00, 0xFF2600, 0xFF3300,
    0xFF4000, 0xFF4D00, 0xFF5900, 0xFF6600, 0xFF7300,
    0xFF8000, 0xFF8C00, 0xFF9900, 0xFFA600, 0xFFB300,
    0xFFBF00, 0xFFCC00, 0xFFD900, 0xFFE600, 0xFFF200,
    0xFFFF00, 0xE6FF00, 0xCCFF00, 0xB3FF00, 0x99FF00,
    0x80FF00, 0x66FF00, 0x4DFF00, 0x33FF00, 0x1AFF00,
    0x00FF00, 0x00FF0D, 0x00FF1A, 0x00FF26, 0x00FF33,
    0x00FF40, 0x00FF4D, 0x00FF59, 0x00FF66, 0x00FF73,
    0x00FF80, 0x00FF8C, 0x00FF99, 0x00FFA6, 0x00FFB3,
    0x00FFBF, 0x00FFCC, 0x00FFD9, 0x00FFE6, 0x00FFF2,
    0x00FFFF, 0x00F2FF, 0x00E6FF, 0x00D9FF, 0x00CCFF,
    0x00BFFF, 0x00B3FF, 0x00A6FF, 0x0099FF, 0x008CFF,
    0x0080FF, 0x0073FF, 0x0066FF, 0x0059FF, 0x004DFF,
    0x0040FF, 0x0033FF, 0x0026FF, 0x001AFF, 0x000DFF,
    0x0000FF, 0x0D00FF, 0x1A00FF, 0x2600FF, 0x3300FF,
    0x4000FF, 0x4D00FF, 0x5900FF, 0x6600FF, 0x7300FF,
    0x8000FF, 0x8C00FF, 0x9900FF, 0xA600FF, 0xB300FF,
    0xBF00FF, 0xCC00FF, 0xD900FF, 0xE600FF, 0xF200FF,
    0xFF00FF, 0xFF00E6, 0xFF00CC, 0xFF00B3, 0xFF0099,
    0xFF0080, 0xFF0066, 0xFF004D, 0xFF0033, 0xFF001A];
	
NORMAL_BLOCKS_NAMES = {};
NORMAL_BLOCKS_NAMES['forward_block'] = 'forward';
NORMAL_BLOCKS_NAMES['backward_block'] = 'back';
NORMAL_BLOCKS_NAMES['right_block'] = 'right';
NORMAL_BLOCKS_NAMES['left_block'] = 'left';
NORMAL_BLOCKS_NAMES['set_heading_block'] = 'seth';
NORMAL_BLOCKS_NAMES['clean_block'] = 'clean';

NORMAL_BLOCKS_NAMES['penup_block'] = 'penup';
NORMAL_BLOCKS_NAMES['pendown_block'] = 'pendown';
NORMAL_BLOCKS_NAMES['set_pen_size_block'] = 'setpensize';
NORMAL_BLOCKS_NAMES['start_fill_block'] = 'startfill';
NORMAL_BLOCKS_NAMES['end_fill_block'] = 'stopfill';
NORMAL_BLOCKS_NAMES['set_shade_block'] = 'setshade';
NORMAL_BLOCKS_NAMES['set_color_block'] = 'setcolor';
NORMAL_BLOCKS_NAMES['set_gray_block'] = 'setgray';

NORMAL_BLOCKS_NAMES['wait_block'] = 'wait';

NORMAL_BLOCKS_NAMES['start_block'] = 'start2';
NORMAL_BLOCKS_NAMES['action_make_block'] = 'hat';
NORMAL_BLOCKS_NAMES['action_call_block'] = 'stack';


NORMAL_RESIZE_BLOCK_NAMES = {};
NORMAL_RESIZE_BLOCK_NAMES['setxy_block'] = 'setxy2';
NORMAL_RESIZE_BLOCK_NAMES['arc_block'] = 'arc';
NORMAL_RESIZE_BLOCK_NAMES['space_block'] = 'vspace';

NORMAL_RESIZE_BLOCK_NAMES['fill_screen_block'] = 'fillscreen2';

NORMAL_RESIZE_BLOCK_NAMES['identity_block'] = 'identity2';
NORMAL_RESIZE_BLOCK_NAMES['sqrt_block'] = 'sqrt';

NORMAL_RESIZE_BLOCK_NAMES['store_in_box_block'] = 'storein';


STANDALONE_PARAM_BLOCK_NAMES = {};
STANDALONE_PARAM_BLOCK_NAMES['box_block'] = 'number';
STANDALONE_PARAM_BLOCK_NAMES['text_block'] = 'string';


SPECIAL_VAR_GET_BLOCK_NAMES = {};
SPECIAL_VAR_GET_BLOCK_NAMES['xcor_block'] = 'xcor';
SPECIAL_VAR_GET_BLOCK_NAMES['ycor_block'] = 'ycor';
SPECIAL_VAR_GET_BLOCK_NAMES['heading_block'] = 'heading';

SPECIAL_VAR_GET_BLOCK_NAMES['pensize_block'] = 'pensize';
SPECIAL_VAR_GET_BLOCK_NAMES['color_block'] = 'color';
SPECIAL_VAR_GET_BLOCK_NAMES['shade_block'] = 'shade';
SPECIAL_VAR_GET_BLOCK_NAMES['gray_block'] = 'gray';

SPECIAL_VAR_GET_BLOCK_NAMES['red_block'] = 'red';
SPECIAL_VAR_GET_BLOCK_NAMES['green_block'] = 'green';
SPECIAL_VAR_GET_BLOCK_NAMES['purple_block'] = 'purple';
SPECIAL_VAR_GET_BLOCK_NAMES['orange_block'] = 'orange';
SPECIAL_VAR_GET_BLOCK_NAMES['cyan_block'] = 'cyan';
SPECIAL_VAR_GET_BLOCK_NAMES['white_block'] = 'white';
SPECIAL_VAR_GET_BLOCK_NAMES['yellow_block'] = 'yellow';
SPECIAL_VAR_GET_BLOCK_NAMES['blue_block'] = 'blue';
SPECIAL_VAR_GET_BLOCK_NAMES['black_block'] = 'black';

SPECIAL_VAR_GET_BLOCK_NAMES['width_block'] = 'width';
SPECIAL_VAR_GET_BLOCK_NAMES['height_block'] = 'height';
SPECIAL_VAR_GET_BLOCK_NAMES['left2_block'] = 'leftpos';
SPECIAL_VAR_GET_BLOCK_NAMES['right2_block'] = 'rightpos';
SPECIAL_VAR_GET_BLOCK_NAMES['bottom_block'] = 'bottompos';
SPECIAL_VAR_GET_BLOCK_NAMES['top_block'] = 'toppos';


COMPLEX_PARAM_BLOCK_NAMES = {};
COMPLEX_PARAM_BLOCK_NAMES['substract_block'] = 'minus2';
COMPLEX_PARAM_BLOCK_NAMES['add_block'] = 'plus2';
COMPLEX_PARAM_BLOCK_NAMES['multiply_block'] = 'product2';
COMPLEX_PARAM_BLOCK_NAMES['divide_block'] = 'division2';
COMPLEX_PARAM_BLOCK_NAMES['rand_block'] = 'random';
COMPLEX_PARAM_BLOCK_NAMES['mod_block'] = 'remainder2';
COMPLEX_PARAM_BLOCK_NAMES['lowerthan_block'] = 'less2';
COMPLEX_PARAM_BLOCK_NAMES['equals_block'] = 'equal2';
COMPLEX_PARAM_BLOCK_NAMES['greaterthan_block'] = 'greater2';


COMPLEX_FLOW_BLOCK_NAMES = {};
COMPLEX_FLOW_BLOCK_NAMES['repeat_block'] = 'repeat';
COMPLEX_FLOW_BLOCK_NAMES['ifthen_block'] = 'if';
COMPLEX_FLOW_BLOCK_NAMES['while_block'] = 'while';
COMPLEX_FLOW_BLOCK_NAMES['until_block'] = 'until';

NORMAL_FLOW_BLOCK_NAMES = {};
NORMAL_FLOW_BLOCK_NAMES['forever_block'] = 'forever';
