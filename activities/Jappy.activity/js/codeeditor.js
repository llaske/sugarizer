/* This file is generated, do not edit directly */
riot.tag2('code-editor', '<div id="vsplit" ref="vsplit"> <div id="split" ref="split"> <input ref="file_input" id="file-input" type="file" style="display: none;"> <div id="tabs"> <button onclick="{this.newtab}" id="newtab">&nbsp;</button><span class="{selected: name==parent.title}" each="{name in list(files)}"><button class="{selected: name==parent.title}" onclick="{parent.switchtab}">{str(name)}</button><button if="{name==parent.title && len(files)>1}" id="closetab" onclick="{parent.closetab}">&nbsp;</button></span><button class="pull-right" id="tray-button" ref="traybutton">&nbsp;</button> </div> <textarea id="code-container" ref="code"></textarea> </div> <iframe allowtransparency="false" ref="vmframe"></iframe> </div>', 'code-editor { display: flex; flex: 1 1; height: 100%; } code-editor .CodeMirror,[data-is="code-editor"] .CodeMirror{ height: 100%; width: 100%; font-size: 15pt; font-family: "Noto Mono", "DejaVu Sans Mono", monospace, "Noto Emoji"; flex: 1 1; } code-editor .CodeMirror-cursor,[data-is="code-editor"] .CodeMirror-cursor{ width: auto; border: 0; background: transparent; background: rgba(0, 200, 0, .4); } code-editor .CodeMirror-linenumber,[data-is="code-editor"] .CodeMirror-linenumber{ font-size: 14pt; } code-editor .cm-s-solarized .CodeMirror-cursor,[data-is="code-editor"] .cm-s-solarized .CodeMirror-cursor{ border: 0; } code-editor .error-marker,[data-is="code-editor"] .error-marker{ border: 1px solid red; background-color: rgba(255, 0, 0,0.2); border-radius: 3px; } code-editor iframe,[data-is="code-editor"] iframe{ border: 0px; display: none; flex: 1 1; } code-editor #split,[data-is="code-editor"] #split{ display: flex; width: 100%; flex-direction: column; flex: 1 1; height: 100%; float: left; } code-editor #vsplit,[data-is="code-editor"] #vsplit{ display: flex; flex-direction: row; flex: 1 1; height: 100%; } code-editor #tabs button,[data-is="code-editor"] #tabs button{ font-size: 13pt; border-radius: 0; padding: 10px 10px; border: 0px; margin: 0px; } code-editor #tabs button.selected,[data-is="code-editor"] #tabs button.selected{ background-color: #282828; } code-editor #tabs span.selected,[data-is="code-editor"] #tabs span.selected{ white-space: nowrap; } code-editor #closetab,[data-is="code-editor"] #closetab{ background-image: url(lib/sugar-web/graphics/icons/actions/entry-cancel-active.svg); background-repeat: no-repeat; background-color: #282828; width: 28px; background-position: center; background-size: 16px 16px; } code-editor #closetab:active,[data-is="code-editor"] #closetab:active{ background-image: url(lib/sugar-web/graphics/icons/actions/entry-cancel.svg); } code-editor #newtab,[data-is="code-editor"] #newtab{ background-image: url(icons/tab-add.svg); background-repeat: no-repeat; width: 28px; background-position: center; background-size: 20px 20px; } code-editor #tray-button,[data-is="code-editor"] #tray-button{ background-image: url(icons/tray-show.svg); background-repeat: no-repeat; width: 28px; background-position: center; background-size: 20px 20px; }', '', function(opts) {
var ρσ_modules = {};
ρσ_modules.re = {};

(function(){
    var _ALIAS_MAP, _ASCII_CONTROL_CHARS, _HEX_PAT, _NUM_PAT, _GROUP_PAT, _NAME_PAT, I, IGNORECASE, L, LOCALE, M, MULTILINE, D, DOTALL, U, UNICODE, X, VERBOSE, DEBUG, A, ASCII, supports_unicode, _RE_ESCAPE, _re_cache_map, _re_cache_items, error, has_prop;
    _ALIAS_MAP = (function(){
        var ρσ_d = {};
        ρσ_d["null"] = 0;
        ρσ_d["nul"] = 0;
        ρσ_d["start of heading"] = 1;
        ρσ_d["soh"] = 1;
        ρσ_d["start of text"] = 2;
        ρσ_d["stx"] = 2;
        ρσ_d["end of text"] = 3;
        ρσ_d["etx"] = 3;
        ρσ_d["end of transmission"] = 4;
        ρσ_d["eot"] = 4;
        ρσ_d["enquiry"] = 5;
        ρσ_d["enq"] = 5;
        ρσ_d["acknowledge"] = 6;
        ρσ_d["ack"] = 6;
        ρσ_d["alert"] = 7;
        ρσ_d["bel"] = 7;
        ρσ_d["backspace"] = 8;
        ρσ_d["bs"] = 8;
        ρσ_d["character tabulation"] = 9;
        ρσ_d["horizontal tabulation"] = 9;
        ρσ_d["ht"] = 9;
        ρσ_d["tab"] = 9;
        ρσ_d["line feed"] = 10;
        ρσ_d["new line"] = 10;
        ρσ_d["end of line"] = 10;
        ρσ_d["lf"] = 10;
        ρσ_d["nl"] = 10;
        ρσ_d["eol"] = 10;
        ρσ_d["line tabulation"] = 11;
        ρσ_d["vertical tabulation"] = 11;
        ρσ_d["vt"] = 11;
        ρσ_d["form feed"] = 12;
        ρσ_d["ff"] = 12;
        ρσ_d["carriage return"] = 13;
        ρσ_d["cr"] = 13;
        ρσ_d["shift out"] = 14;
        ρσ_d["locking-shift one"] = 14;
        ρσ_d["so"] = 14;
        ρσ_d["shift in"] = 15;
        ρσ_d["locking-shift zero"] = 15;
        ρσ_d["si"] = 15;
        ρσ_d["data link escape"] = 16;
        ρσ_d["dle"] = 16;
        ρσ_d["device control one"] = 17;
        ρσ_d["dc1"] = 17;
        ρσ_d["device control two"] = 18;
        ρσ_d["dc2"] = 18;
        ρσ_d["device control three"] = 19;
        ρσ_d["dc3"] = 19;
        ρσ_d["device control four"] = 20;
        ρσ_d["dc4"] = 20;
        ρσ_d["negative acknowledge"] = 21;
        ρσ_d["nak"] = 21;
        ρσ_d["synchronous idle"] = 22;
        ρσ_d["syn"] = 22;
        ρσ_d["end of transmission block"] = 23;
        ρσ_d["etb"] = 23;
        ρσ_d["cancel"] = 24;
        ρσ_d["can"] = 24;
        ρσ_d["end of medium"] = 25;
        ρσ_d["eom"] = 25;
        ρσ_d["substitute"] = 26;
        ρσ_d["sub"] = 26;
        ρσ_d["escape"] = 27;
        ρσ_d["esc"] = 27;
        ρσ_d["information separator four"] = 28;
        ρσ_d["file separator"] = 28;
        ρσ_d["fs"] = 28;
        ρσ_d["information separator three"] = 29;
        ρσ_d["group separator"] = 29;
        ρσ_d["gs"] = 29;
        ρσ_d["information separator two"] = 30;
        ρσ_d["record separator"] = 30;
        ρσ_d["rs"] = 30;
        ρσ_d["information separator one"] = 31;
        ρσ_d["unit separator"] = 31;
        ρσ_d["us"] = 31;
        ρσ_d["sp"] = 32;
        ρσ_d["delete"] = 127;
        ρσ_d["del"] = 127;
        ρσ_d["padding character"] = 128;
        ρσ_d["pad"] = 128;
        ρσ_d["high octet preset"] = 129;
        ρσ_d["hop"] = 129;
        ρσ_d["break permitted here"] = 130;
        ρσ_d["bph"] = 130;
        ρσ_d["no break here"] = 131;
        ρσ_d["nbh"] = 131;
        ρσ_d["index"] = 132;
        ρσ_d["ind"] = 132;
        ρσ_d["next line"] = 133;
        ρσ_d["nel"] = 133;
        ρσ_d["start of selected area"] = 134;
        ρσ_d["ssa"] = 134;
        ρσ_d["end of selected area"] = 135;
        ρσ_d["esa"] = 135;
        ρσ_d["character tabulation set"] = 136;
        ρσ_d["horizontal tabulation set"] = 136;
        ρσ_d["hts"] = 136;
        ρσ_d["character tabulation with justification"] = 137;
        ρσ_d["horizontal tabulation with justification"] = 137;
        ρσ_d["htj"] = 137;
        ρσ_d["line tabulation set"] = 138;
        ρσ_d["vertical tabulation set"] = 138;
        ρσ_d["vts"] = 138;
        ρσ_d["partial line forward"] = 139;
        ρσ_d["partial line down"] = 139;
        ρσ_d["pld"] = 139;
        ρσ_d["partial line backward"] = 140;
        ρσ_d["partial line up"] = 140;
        ρσ_d["plu"] = 140;
        ρσ_d["reverse line feed"] = 141;
        ρσ_d["reverse index"] = 141;
        ρσ_d["ri"] = 141;
        ρσ_d["single shift two"] = 142;
        ρσ_d["single-shift-2"] = 142;
        ρσ_d["ss2"] = 142;
        ρσ_d["single shift three"] = 143;
        ρσ_d["single-shift-3"] = 143;
        ρσ_d["ss3"] = 143;
        ρσ_d["device control string"] = 144;
        ρσ_d["dcs"] = 144;
        ρσ_d["private use one"] = 145;
        ρσ_d["private use-1"] = 145;
        ρσ_d["pu1"] = 145;
        ρσ_d["private use two"] = 146;
        ρσ_d["private use-2"] = 146;
        ρσ_d["pu2"] = 146;
        ρσ_d["set transmit state"] = 147;
        ρσ_d["sts"] = 147;
        ρσ_d["cancel character"] = 148;
        ρσ_d["cch"] = 148;
        ρσ_d["message waiting"] = 149;
        ρσ_d["mw"] = 149;
        ρσ_d["start of guarded area"] = 150;
        ρσ_d["start of protected area"] = 150;
        ρσ_d["spa"] = 150;
        ρσ_d["end of guarded area"] = 151;
        ρσ_d["end of protected area"] = 151;
        ρσ_d["epa"] = 151;
        ρσ_d["start of string"] = 152;
        ρσ_d["sos"] = 152;
        ρσ_d["single graphic character introducer"] = 153;
        ρσ_d["sgc"] = 153;
        ρσ_d["single character introducer"] = 154;
        ρσ_d["sci"] = 154;
        ρσ_d["control sequence introducer"] = 155;
        ρσ_d["csi"] = 155;
        ρσ_d["string terminator"] = 156;
        ρσ_d["st"] = 156;
        ρσ_d["operating system command"] = 157;
        ρσ_d["osc"] = 157;
        ρσ_d["privacy message"] = 158;
        ρσ_d["pm"] = 158;
        ρσ_d["application program command"] = 159;
        ρσ_d["apc"] = 159;
        ρσ_d["nbsp"] = 160;
        ρσ_d["shy"] = 173;
        ρσ_d["latin capital letter gha"] = 418;
        ρσ_d["latin small letter gha"] = 419;
        ρσ_d["cgj"] = 847;
        ρσ_d["alm"] = 1564;
        ρσ_d["syriac sublinear colon skewed left"] = 1801;
        ρσ_d["kannada letter llla"] = 3294;
        ρσ_d["lao letter fo fon"] = 3741;
        ρσ_d["lao letter fo fay"] = 3743;
        ρσ_d["lao letter ro"] = 3747;
        ρσ_d["lao letter lo"] = 3749;
        ρσ_d["tibetan mark bka- shog gi mgo rgyan"] = 4048;
        ρσ_d["fvs1"] = 6155;
        ρσ_d["fvs2"] = 6156;
        ρσ_d["fvs3"] = 6157;
        ρσ_d["mvs"] = 6158;
        ρσ_d["zwsp"] = 8203;
        ρσ_d["zwnj"] = 8204;
        ρσ_d["zwj"] = 8205;
        ρσ_d["lrm"] = 8206;
        ρσ_d["rlm"] = 8207;
        ρσ_d["lre"] = 8234;
        ρσ_d["rle"] = 8235;
        ρσ_d["pdf"] = 8236;
        ρσ_d["lro"] = 8237;
        ρσ_d["rlo"] = 8238;
        ρσ_d["nnbsp"] = 8239;
        ρσ_d["mmsp"] = 8287;
        ρσ_d["wj"] = 8288;
        ρσ_d["lri"] = 8294;
        ρσ_d["rli"] = 8295;
        ρσ_d["fsi"] = 8296;
        ρσ_d["pdi"] = 8297;
        ρσ_d["weierstrass elliptic function"] = 8472;
        ρσ_d["micr on us symbol"] = 9288;
        ρσ_d["micr dash symbol"] = 9289;
        ρσ_d["leftwards triangle-headed arrow with double vertical stroke"] = 11130;
        ρσ_d["rightwards triangle-headed arrow with double vertical stroke"] = 11132;
        ρσ_d["yi syllable iteration mark"] = 40981;
        ρσ_d["presentation form for vertical right white lenticular bracket"] = 65048;
        ρσ_d["vs1"] = 65024;
        ρσ_d["vs2"] = 65025;
        ρσ_d["vs3"] = 65026;
        ρσ_d["vs4"] = 65027;
        ρσ_d["vs5"] = 65028;
        ρσ_d["vs6"] = 65029;
        ρσ_d["vs7"] = 65030;
        ρσ_d["vs8"] = 65031;
        ρσ_d["vs9"] = 65032;
        ρσ_d["vs10"] = 65033;
        ρσ_d["vs11"] = 65034;
        ρσ_d["vs12"] = 65035;
        ρσ_d["vs13"] = 65036;
        ρσ_d["vs14"] = 65037;
        ρσ_d["vs15"] = 65038;
        ρσ_d["vs16"] = 65039;
        ρσ_d["byte order mark"] = 65279;
        ρσ_d["bom"] = 65279;
        ρσ_d["zwnbsp"] = 65279;
        ρσ_d["cuneiform sign nu11 tenu"] = 74452;
        ρσ_d["cuneiform sign nu11 over nu11 bur over bur"] = 74453;
        ρσ_d["byzantine musical symbol fthora skliron chroma vasis"] = 118981;
        ρσ_d["vs17"] = 917760;
        ρσ_d["vs18"] = 917761;
        ρσ_d["vs19"] = 917762;
        ρσ_d["vs20"] = 917763;
        ρσ_d["vs21"] = 917764;
        ρσ_d["vs22"] = 917765;
        ρσ_d["vs23"] = 917766;
        ρσ_d["vs24"] = 917767;
        ρσ_d["vs25"] = 917768;
        ρσ_d["vs26"] = 917769;
        ρσ_d["vs27"] = 917770;
        ρσ_d["vs28"] = 917771;
        ρσ_d["vs29"] = 917772;
        ρσ_d["vs30"] = 917773;
        ρσ_d["vs31"] = 917774;
        ρσ_d["vs32"] = 917775;
        ρσ_d["vs33"] = 917776;
        ρσ_d["vs34"] = 917777;
        ρσ_d["vs35"] = 917778;
        ρσ_d["vs36"] = 917779;
        ρσ_d["vs37"] = 917780;
        ρσ_d["vs38"] = 917781;
        ρσ_d["vs39"] = 917782;
        ρσ_d["vs40"] = 917783;
        ρσ_d["vs41"] = 917784;
        ρσ_d["vs42"] = 917785;
        ρσ_d["vs43"] = 917786;
        ρσ_d["vs44"] = 917787;
        ρσ_d["vs45"] = 917788;
        ρσ_d["vs46"] = 917789;
        ρσ_d["vs47"] = 917790;
        ρσ_d["vs48"] = 917791;
        ρσ_d["vs49"] = 917792;
        ρσ_d["vs50"] = 917793;
        ρσ_d["vs51"] = 917794;
        ρσ_d["vs52"] = 917795;
        ρσ_d["vs53"] = 917796;
        ρσ_d["vs54"] = 917797;
        ρσ_d["vs55"] = 917798;
        ρσ_d["vs56"] = 917799;
        ρσ_d["vs57"] = 917800;
        ρσ_d["vs58"] = 917801;
        ρσ_d["vs59"] = 917802;
        ρσ_d["vs60"] = 917803;
        ρσ_d["vs61"] = 917804;
        ρσ_d["vs62"] = 917805;
        ρσ_d["vs63"] = 917806;
        ρσ_d["vs64"] = 917807;
        ρσ_d["vs65"] = 917808;
        ρσ_d["vs66"] = 917809;
        ρσ_d["vs67"] = 917810;
        ρσ_d["vs68"] = 917811;
        ρσ_d["vs69"] = 917812;
        ρσ_d["vs70"] = 917813;
        ρσ_d["vs71"] = 917814;
        ρσ_d["vs72"] = 917815;
        ρσ_d["vs73"] = 917816;
        ρσ_d["vs74"] = 917817;
        ρσ_d["vs75"] = 917818;
        ρσ_d["vs76"] = 917819;
        ρσ_d["vs77"] = 917820;
        ρσ_d["vs78"] = 917821;
        ρσ_d["vs79"] = 917822;
        ρσ_d["vs80"] = 917823;
        ρσ_d["vs81"] = 917824;
        ρσ_d["vs82"] = 917825;
        ρσ_d["vs83"] = 917826;
        ρσ_d["vs84"] = 917827;
        ρσ_d["vs85"] = 917828;
        ρσ_d["vs86"] = 917829;
        ρσ_d["vs87"] = 917830;
        ρσ_d["vs88"] = 917831;
        ρσ_d["vs89"] = 917832;
        ρσ_d["vs90"] = 917833;
        ρσ_d["vs91"] = 917834;
        ρσ_d["vs92"] = 917835;
        ρσ_d["vs93"] = 917836;
        ρσ_d["vs94"] = 917837;
        ρσ_d["vs95"] = 917838;
        ρσ_d["vs96"] = 917839;
        ρσ_d["vs97"] = 917840;
        ρσ_d["vs98"] = 917841;
        ρσ_d["vs99"] = 917842;
        ρσ_d["vs100"] = 917843;
        ρσ_d["vs101"] = 917844;
        ρσ_d["vs102"] = 917845;
        ρσ_d["vs103"] = 917846;
        ρσ_d["vs104"] = 917847;
        ρσ_d["vs105"] = 917848;
        ρσ_d["vs106"] = 917849;
        ρσ_d["vs107"] = 917850;
        ρσ_d["vs108"] = 917851;
        ρσ_d["vs109"] = 917852;
        ρσ_d["vs110"] = 917853;
        ρσ_d["vs111"] = 917854;
        ρσ_d["vs112"] = 917855;
        ρσ_d["vs113"] = 917856;
        ρσ_d["vs114"] = 917857;
        ρσ_d["vs115"] = 917858;
        ρσ_d["vs116"] = 917859;
        ρσ_d["vs117"] = 917860;
        ρσ_d["vs118"] = 917861;
        ρσ_d["vs119"] = 917862;
        ρσ_d["vs120"] = 917863;
        ρσ_d["vs121"] = 917864;
        ρσ_d["vs122"] = 917865;
        ρσ_d["vs123"] = 917866;
        ρσ_d["vs124"] = 917867;
        ρσ_d["vs125"] = 917868;
        ρσ_d["vs126"] = 917869;
        ρσ_d["vs127"] = 917870;
        ρσ_d["vs128"] = 917871;
        ρσ_d["vs129"] = 917872;
        ρσ_d["vs130"] = 917873;
        ρσ_d["vs131"] = 917874;
        ρσ_d["vs132"] = 917875;
        ρσ_d["vs133"] = 917876;
        ρσ_d["vs134"] = 917877;
        ρσ_d["vs135"] = 917878;
        ρσ_d["vs136"] = 917879;
        ρσ_d["vs137"] = 917880;
        ρσ_d["vs138"] = 917881;
        ρσ_d["vs139"] = 917882;
        ρσ_d["vs140"] = 917883;
        ρσ_d["vs141"] = 917884;
        ρσ_d["vs142"] = 917885;
        ρσ_d["vs143"] = 917886;
        ρσ_d["vs144"] = 917887;
        ρσ_d["vs145"] = 917888;
        ρσ_d["vs146"] = 917889;
        ρσ_d["vs147"] = 917890;
        ρσ_d["vs148"] = 917891;
        ρσ_d["vs149"] = 917892;
        ρσ_d["vs150"] = 917893;
        ρσ_d["vs151"] = 917894;
        ρσ_d["vs152"] = 917895;
        ρσ_d["vs153"] = 917896;
        ρσ_d["vs154"] = 917897;
        ρσ_d["vs155"] = 917898;
        ρσ_d["vs156"] = 917899;
        ρσ_d["vs157"] = 917900;
        ρσ_d["vs158"] = 917901;
        ρσ_d["vs159"] = 917902;
        ρσ_d["vs160"] = 917903;
        ρσ_d["vs161"] = 917904;
        ρσ_d["vs162"] = 917905;
        ρσ_d["vs163"] = 917906;
        ρσ_d["vs164"] = 917907;
        ρσ_d["vs165"] = 917908;
        ρσ_d["vs166"] = 917909;
        ρσ_d["vs167"] = 917910;
        ρσ_d["vs168"] = 917911;
        ρσ_d["vs169"] = 917912;
        ρσ_d["vs170"] = 917913;
        ρσ_d["vs171"] = 917914;
        ρσ_d["vs172"] = 917915;
        ρσ_d["vs173"] = 917916;
        ρσ_d["vs174"] = 917917;
        ρσ_d["vs175"] = 917918;
        ρσ_d["vs176"] = 917919;
        ρσ_d["vs177"] = 917920;
        ρσ_d["vs178"] = 917921;
        ρσ_d["vs179"] = 917922;
        ρσ_d["vs180"] = 917923;
        ρσ_d["vs181"] = 917924;
        ρσ_d["vs182"] = 917925;
        ρσ_d["vs183"] = 917926;
        ρσ_d["vs184"] = 917927;
        ρσ_d["vs185"] = 917928;
        ρσ_d["vs186"] = 917929;
        ρσ_d["vs187"] = 917930;
        ρσ_d["vs188"] = 917931;
        ρσ_d["vs189"] = 917932;
        ρσ_d["vs190"] = 917933;
        ρσ_d["vs191"] = 917934;
        ρσ_d["vs192"] = 917935;
        ρσ_d["vs193"] = 917936;
        ρσ_d["vs194"] = 917937;
        ρσ_d["vs195"] = 917938;
        ρσ_d["vs196"] = 917939;
        ρσ_d["vs197"] = 917940;
        ρσ_d["vs198"] = 917941;
        ρσ_d["vs199"] = 917942;
        ρσ_d["vs200"] = 917943;
        ρσ_d["vs201"] = 917944;
        ρσ_d["vs202"] = 917945;
        ρσ_d["vs203"] = 917946;
        ρσ_d["vs204"] = 917947;
        ρσ_d["vs205"] = 917948;
        ρσ_d["vs206"] = 917949;
        ρσ_d["vs207"] = 917950;
        ρσ_d["vs208"] = 917951;
        ρσ_d["vs209"] = 917952;
        ρσ_d["vs210"] = 917953;
        ρσ_d["vs211"] = 917954;
        ρσ_d["vs212"] = 917955;
        ρσ_d["vs213"] = 917956;
        ρσ_d["vs214"] = 917957;
        ρσ_d["vs215"] = 917958;
        ρσ_d["vs216"] = 917959;
        ρσ_d["vs217"] = 917960;
        ρσ_d["vs218"] = 917961;
        ρσ_d["vs219"] = 917962;
        ρσ_d["vs220"] = 917963;
        ρσ_d["vs221"] = 917964;
        ρσ_d["vs222"] = 917965;
        ρσ_d["vs223"] = 917966;
        ρσ_d["vs224"] = 917967;
        ρσ_d["vs225"] = 917968;
        ρσ_d["vs226"] = 917969;
        ρσ_d["vs227"] = 917970;
        ρσ_d["vs228"] = 917971;
        ρσ_d["vs229"] = 917972;
        ρσ_d["vs230"] = 917973;
        ρσ_d["vs231"] = 917974;
        ρσ_d["vs232"] = 917975;
        ρσ_d["vs233"] = 917976;
        ρσ_d["vs234"] = 917977;
        ρσ_d["vs235"] = 917978;
        ρσ_d["vs236"] = 917979;
        ρσ_d["vs237"] = 917980;
        ρσ_d["vs238"] = 917981;
        ρσ_d["vs239"] = 917982;
        ρσ_d["vs240"] = 917983;
        ρσ_d["vs241"] = 917984;
        ρσ_d["vs242"] = 917985;
        ρσ_d["vs243"] = 917986;
        ρσ_d["vs244"] = 917987;
        ρσ_d["vs245"] = 917988;
        ρσ_d["vs246"] = 917989;
        ρσ_d["vs247"] = 917990;
        ρσ_d["vs248"] = 917991;
        ρσ_d["vs249"] = 917992;
        ρσ_d["vs250"] = 917993;
        ρσ_d["vs251"] = 917994;
        ρσ_d["vs252"] = 917995;
        ρσ_d["vs253"] = 917996;
        ρσ_d["vs254"] = 917997;
        ρσ_d["vs255"] = 917998;
        ρσ_d["vs256"] = 917999;
        return ρσ_d;
    }).call(this);
    _ASCII_CONTROL_CHARS = (function(){
        var ρσ_d = {};
        ρσ_d["a"] = 7;
        ρσ_d["b"] = 8;
        ρσ_d["f"] = 12;
        ρσ_d["n"] = 10;
        ρσ_d["r"] = 13;
        ρσ_d["t"] = 9;
        ρσ_d["v"] = 11;
        return ρσ_d;
    }).call(this);
    _HEX_PAT = /^[a-fA-F0-9]/;
    _NUM_PAT = /^[0-9]/;
    _GROUP_PAT = /<([^>]+)>/;
    _NAME_PAT = /^[a-zA-Z ]/;
    I = IGNORECASE = 2;
    L = LOCALE = 4;
    M = MULTILINE = 8;
    D = DOTALL = 16;
    U = UNICODE = 32;
    X = VERBOSE = 64;
    DEBUG = 128;
    A = ASCII = 256;
    supports_unicode = RegExp.prototype.unicode !== undefined;
    _RE_ESCAPE = /[-\/\\^$*+?.()|[\]{}]/g;
    _re_cache_map = {};
    _re_cache_items = [];
    error = SyntaxError;
    has_prop = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);
    function _expand(groups, repl, group_name_map) {
        var i, ans, ch;
        i = 0;
        function next() {
            return repl[i++];
        };

        function peek() {
            return repl[(typeof i === "number" && i < 0) ? repl.length + i : i];
        };

        function read_digits(count, pat, base, maxval, prefix) {
            var ans, greedy, nval;
            ans = prefix || "";
            greedy = count === Number.MAX_VALUE;
            while (count > 0) {
                count -= 1;
                if (!pat.test(peek())) {
                    if (greedy) {
                        break;
                    }
                    return ans;
                }
                ans += next();
            }
            nval = parseInt(ans, base);
            if (nval > maxval) {
                return ans;
            }
            return nval;
        };
        if (!read_digits.__argnames__) Object.defineProperties(read_digits, {
            __argnames__ : {value: ["count", "pat", "base", "maxval", "prefix"]}
        });

        function read_escape_sequence() {
            var q, ans, m, gn, code, name, key;
            q = next();
            if (!q || q === "\\") {
                return "\\";
            }
            if ("\"'".indexOf(q) !== -1) {
                return q;
            }
            if (_ASCII_CONTROL_CHARS[(typeof q === "number" && q < 0) ? _ASCII_CONTROL_CHARS.length + q : q]) {
                return String.fromCharCode(_ASCII_CONTROL_CHARS[(typeof q === "number" && q < 0) ? _ASCII_CONTROL_CHARS.length + q : q]);
            }
            if ("0" <= q && q <= "9") {
                ans = read_digits(Number.MAX_VALUE, _NUM_PAT, 10, Number.MAX_VALUE, q);
                if (typeof ans === "number") {
                    return groups[(typeof ans === "number" && ans < 0) ? groups.length + ans : ans] || "";
                }
                return "\\" + ans;
            }
            if (q === "g") {
                m = _GROUP_PAT.exec(repl.slice(i));
                if (m !== null) {
                    i += m[0].length;
                    gn = m[1];
                    if (isNaN(parseInt(gn, 10))) {
                        if (!has_prop(group_name_map, gn)) {
                            return "";
                        }
                        gn = (ρσ_expr_temp = group_name_map[(typeof gn === "number" && gn < 0) ? group_name_map.length + gn : gn])[ρσ_expr_temp.length-1];
                    }
                    return groups[(typeof gn === "number" && gn < 0) ? groups.length + gn : gn] || "";
                }
            }
            if (q === "x") {
                code = read_digits(2, _HEX_PAT, 16, 1114111);
                if (typeof code === "number") {
                    return String.fromCharCode(code);
                }
                return "\\x" + code;
            }
            if (q === "u") {
                code = read_digits(4, _HEX_PAT, 16, 1114111);
                if (typeof code === "number") {
                    return String.fromCharCode(code);
                }
                return "\\u" + code;
            }
            if (q === "U") {
                code = read_digits(8, _HEX_PAT, 16, 1114111);
                if (typeof code === "number") {
                    if (code <= 65535) {
                        return String.fromCharCode(code);
                    }
                    code -= 65536;
                    return String.fromCharCode(55296 + (code >> 10), 56320 + (code & 1023));
                }
                return "\\U" + code;
            }
            if (q === "N" && peek() === "{") {
                next();
                name = "";
                while (_NAME_PAT.test(peek())) {
                    name += next();
                }
                if (peek() !== "}") {
                    return "\\N{" + name;
                }
                next();
                key = (name || "").toLowerCase();
                if (!name || !has_prop(_ALIAS_MAP, key)) {
                    return "\\N{" + name + "}";
                }
                code = _ALIAS_MAP[(typeof key === "number" && key < 0) ? _ALIAS_MAP.length + key : key];
                if (code <= 65535) {
                    return String.fromCharCode(code);
                }
                code -= 65536;
                return String.fromCharCode(55296 + (code >> 10), 56320 + (code & 1023));
            }
            return "\\" + q;
        };

        ans = ch = "";
        while (ch = next()) {
            if (ch === "\\") {
                ans += read_escape_sequence();
            } else {
                ans += ch;
            }
        }
        return ans;
    };
    if (!_expand.__argnames__) Object.defineProperties(_expand, {
        __argnames__ : {value: ["groups", "repl", "group_name_map"]}
    });

    function transform_regex(source, flags) {
        var pos, previous_backslash, in_class, ans, group_map, group_count, ch, extension, close, flag_map, flgs, q, name;
        pos = 0;
        previous_backslash = in_class = false;
        ans = "";
        group_map = {};
        flags = flags || 0;
        group_count = 0;
        while (pos < source.length) {
            ch = source[pos++];
            if (previous_backslash) {
                ans += "\\" + ch;
                previous_backslash = false;
                continue;
            }
            if (in_class) {
                if (ch === "]") {
                    in_class = false;
                }
                ans += ch;
                continue;
            }
            if (ch === "\\") {
                previous_backslash = true;
                continue;
            }
            if (ch === "[") {
                in_class = true;
                if (source[(typeof pos === "number" && pos < 0) ? source.length + pos : pos] === "]") {
                    pos += 1;
                    ch = "[\\]";
                }
            } else if (ch === "(") {
                if (source[(typeof pos === "number" && pos < 0) ? source.length + pos : pos] === "?") {
                    extension = source[ρσ_bound_index(pos + 1, source)];
                    if (extension === "#") {
                        close = source.indexOf(")", pos + 1);
                        if (close === -1) {
                            throw new ValueError("Expecting a closing )");
                        }
                        pos = close + 1;
                        continue;
                    }
                    if ("aiLmsux".indexOf(extension) !== -1) {
                        flag_map = (function(){
                            var ρσ_d = {};
                            ρσ_d["a"] = ASCII;
                            ρσ_d["i"] = IGNORECASE;
                            ρσ_d["L"] = LOCALE;
                            ρσ_d["m"] = MULTILINE;
                            ρσ_d["s"] = DOTALL;
                            ρσ_d["u"] = UNICODE;
                            ρσ_d["x"] = VERBOSE;
                            return ρσ_d;
                        }).call(this);
                        close = source.indexOf(")", pos + 1);
                        if (close === -1) {
                            throw new SyntaxError("Expecting a closing )");
                        }
                        flgs = source.slice(pos + 1, close);
                        for (var i = 0; i < flgs.length; i++) {
                            q = flgs[(typeof i === "number" && i < 0) ? flgs.length + i : i];
                            if (!has_prop(flag_map, q)) {
                                throw new SyntaxError("Invalid flag: " + q);
                            }
                            flags |= flag_map[(typeof q === "number" && q < 0) ? flag_map.length + q : q];
                        }
                        pos = close + 1;
                        continue;
                    }
                    if (extension === "<") {
                        throw new SyntaxError("Look behind assertions are not supported in JavaScript");
                    }
                    if (extension === "(") {
                        throw new SyntaxError("Group existence assertions are not supported in JavaScript");
                    }
                    if (extension === "P") {
                        pos += 2;
                        q = source[(typeof pos === "number" && pos < 0) ? source.length + pos : pos];
                        if (q === "<") {
                            close = source.indexOf(">", pos);
                            if (close === -1) {
                                throw new SyntaxError("Named group not closed, expecting >");
                            }
                            name = source.slice(pos + 1, close);
                            if (!has_prop(group_map, name)) {
                                group_map[(typeof name === "number" && name < 0) ? group_map.length + name : name] = [];
                            }
                            group_map[(typeof name === "number" && name < 0) ? group_map.length + name : name].push(++group_count);
                            pos = close + 1;
                        } else if (q === "=") {
                            close = source.indexOf(")", pos);
                            if (close === -1) {
                                throw new SyntaxError("Named group back-reference not closed, expecting a )");
                            }
                            name = source.slice(pos + 1, close);
                            if (!isNaN(parseInt(name, 10))) {
                                ans += "\\" + name;
                            } else {
                                if (!has_prop(group_map, name)) {
                                    throw new SyntaxError("Invalid back-reference. The named group: " + name + " has not yet been defined.");
                                }
                                ans += "\\" + (ρσ_expr_temp = group_map[(typeof name === "number" && name < 0) ? group_map.length + name : name])[ρσ_expr_temp.length-1];
                            }
                            pos = close + 1;
                            continue;
                        } else {
                            throw new SyntaxError("Expecting < or = after (?P");
                        }
                    }
                } else {
                    group_count += 1;
                }
            } else if (ch === "." && flags & DOTALL) {
                ans += "[\\s\\S]";
                continue;
            }
            ans += ch;
        }
        return [ans, flags, group_map];
    };
    if (!transform_regex.__argnames__) Object.defineProperties(transform_regex, {
        __argnames__ : {value: ["source", "flags"]}
    });

    function MatchObject() {
        if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
        MatchObject.prototype.__bind_methods__.call(this);
        MatchObject.prototype.__init__.apply(this, arguments);
    }
    Object.defineProperty(MatchObject.prototype, "__bind_methods__", {value: function () {
        this._compute_extents = MatchObject.prototype._compute_extents.bind(this);
        this.groups = MatchObject.prototype.groups.bind(this);
        this._group_number = MatchObject.prototype._group_number.bind(this);
        this._group_val = MatchObject.prototype._group_val.bind(this);
        this.group = MatchObject.prototype.group.bind(this);
        this.start = MatchObject.prototype.start.bind(this);
        this.end = MatchObject.prototype.end.bind(this);
        this.span = MatchObject.prototype.span.bind(this);
        this.expand = MatchObject.prototype.expand.bind(this);
        this.groupdict = MatchObject.prototype.groupdict.bind(this);
        this.captures = MatchObject.prototype.captures.bind(this);
        this.capturesdict = MatchObject.prototype.capturesdict.bind(this);
    }});
    MatchObject.prototype.__init__ = function __init__(regex, match, pos, endpos) {
        var self = this;
        var ρσ_unpack;
        self.re = regex;
        self.string = match.input;
        self._start_pos = match.index;
        self._groups = match;
        ρσ_unpack = [pos, endpos];
        self.pos = ρσ_unpack[0];
        self.endpos = ρσ_unpack[1];
    };
    if (!MatchObject.prototype.__init__.__argnames__) Object.defineProperties(MatchObject.prototype.__init__, {
        __argnames__ : {value: ["regex", "match", "pos", "endpos"]}
    });
    MatchObject.__argnames__ = MatchObject.prototype.__init__.__argnames__;
    MatchObject.__handles_kwarg_interpolation__ = MatchObject.prototype.__init__.__handles_kwarg_interpolation__;
    MatchObject.prototype._compute_extents = function _compute_extents() {
        var self = this;
        var match, offset, extent, loc, g;
        match = self._groups;
        self._start = Array(match.length);
        self._end = Array(match.length);
        self._start[0] = self._start_pos;
        self._end[0] = self._start_pos + match[0].length;
        offset = self._start_pos;
        extent = match[0];
        loc = 0;
        for (var i = 1; i < match.length; i++) {
            g = match[(typeof i === "number" && i < 0) ? match.length + i : i];
            loc = extent.indexOf(g, loc);
            if (loc === -1) {
                (ρσ_expr_temp = self._start)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] = (ρσ_expr_temp = self._start)[ρσ_bound_index(i - 1, ρσ_expr_temp)];
                (ρσ_expr_temp = self._end)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] = (ρσ_expr_temp = self._end)[ρσ_bound_index(i - 1, ρσ_expr_temp)];
            } else {
                (ρσ_expr_temp = self._start)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] = offset + loc;
                loc += g.length;
                (ρσ_expr_temp = self._end)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] = offset + loc;
            }
        }
    };
    if (!MatchObject.prototype._compute_extents.__argnames__) Object.defineProperties(MatchObject.prototype._compute_extents, {
        __argnames__ : {value: []}
    });
    MatchObject.prototype.groups = function groups() {
        var self = this;
        var defval = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? groups.__defaults__.defval : arguments[0];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "defval")){
            defval = ρσ_kwargs_obj.defval;
        }
        var ans, val;
        ans = [];
        for (var i = 1; i < self._groups.length; i++) {
            val = (ρσ_expr_temp = self._groups)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
            if (val === undefined) {
                val = defval;
            }
            ans.push(val);
        }
        return ans;
    };
    if (!MatchObject.prototype.groups.__defaults__) Object.defineProperties(MatchObject.prototype.groups, {
        __defaults__ : {value: {defval:null}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["defval"]}
    });
    MatchObject.prototype._group_number = function _group_number(g) {
        var self = this;
        if (typeof g === "number") {
            return g;
        }
        if (has_prop(self.re.group_name_map, g)) {
            return (ρσ_expr_temp = (ρσ_expr_temp = self.re.group_name_map)[(typeof g === "number" && g < 0) ? ρσ_expr_temp.length + g : g])[ρσ_expr_temp.length-1];
        }
        return g;
    };
    if (!MatchObject.prototype._group_number.__argnames__) Object.defineProperties(MatchObject.prototype._group_number, {
        __argnames__ : {value: ["g"]}
    });
    MatchObject.prototype._group_val = function _group_val(q, defval) {
        var self = this;
        var val;
        val = undefined;
        if (typeof q === "number" && -1 < q && q < self._groups.length) {
            val = (ρσ_expr_temp = self._groups)[(typeof q === "number" && q < 0) ? ρσ_expr_temp.length + q : q];
        } else {
            if (has_prop(self.re.group_name_map, q)) {
                val = (ρσ_expr_temp = self._groups)[ρσ_bound_index((ρσ_expr_temp = (ρσ_expr_temp = self.re.group_name_map)[(typeof q === "number" && q < 0) ? ρσ_expr_temp.length + q : q])[ρσ_expr_temp.length-1], ρσ_expr_temp)];
            }
        }
        if (val === undefined) {
            val = defval;
        }
        return val;
    };
    if (!MatchObject.prototype._group_val.__argnames__) Object.defineProperties(MatchObject.prototype._group_val, {
        __argnames__ : {value: ["q", "defval"]}
    });
    MatchObject.prototype.group = function group() {
        var self = this;
        var ans, q;
        if (arguments.length === 0) {
            return self._groups[0];
        }
        ans = [];
        for (var i = 0; i < arguments.length; i++) {
            q = arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i];
            ans.push(self._group_val(q, null));
        }
        return (ans.length === 1) ? ans[0] : ans;
    };
    if (!MatchObject.prototype.group.__argnames__) Object.defineProperties(MatchObject.prototype.group, {
        __argnames__ : {value: []}
    });
    MatchObject.prototype.start = function start(g) {
        var self = this;
        var val;
        if (self._start === undefined) {
            self._compute_extents();
        }
        val = (ρσ_expr_temp = self._start)[ρσ_bound_index(self._group_number(g || 0), ρσ_expr_temp)];
        if (val === undefined) {
            val = -1;
        }
        return val;
    };
    if (!MatchObject.prototype.start.__argnames__) Object.defineProperties(MatchObject.prototype.start, {
        __argnames__ : {value: ["g"]}
    });
    MatchObject.prototype.end = function end(g) {
        var self = this;
        var val;
        if (self._end === undefined) {
            self._compute_extents();
        }
        val = (ρσ_expr_temp = self._end)[ρσ_bound_index(self._group_number(g || 0), ρσ_expr_temp)];
        if (val === undefined) {
            val = -1;
        }
        return val;
    };
    if (!MatchObject.prototype.end.__argnames__) Object.defineProperties(MatchObject.prototype.end, {
        __argnames__ : {value: ["g"]}
    });
    MatchObject.prototype.span = function span(g) {
        var self = this;
        return ρσ_list_decorate([ self.start(g), self.end(g) ]);
    };
    if (!MatchObject.prototype.span.__argnames__) Object.defineProperties(MatchObject.prototype.span, {
        __argnames__ : {value: ["g"]}
    });
    MatchObject.prototype.expand = function expand(repl) {
        var self = this;
        return _expand(repl, this._groups, this.re.group_name_map);
    };
    if (!MatchObject.prototype.expand.__argnames__) Object.defineProperties(MatchObject.prototype.expand, {
        __argnames__ : {value: ["repl"]}
    });
    MatchObject.prototype.groupdict = function groupdict() {
        var self = this;
        var defval = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? groupdict.__defaults__.defval : arguments[0];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "defval")){
            defval = ρσ_kwargs_obj.defval;
        }
        var gnm, names, ans, name, val;
        gnm = self.re.group_name_map;
        names = Object.keys(gnm);
        ans = {};
        for (var i = 0; i < names.length; i++) {
            name = names[(typeof i === "number" && i < 0) ? names.length + i : i];
            if (has_prop(gnm, name)) {
                val = (ρσ_expr_temp = self._groups)[ρσ_bound_index((ρσ_expr_temp = gnm[(typeof name === "number" && name < 0) ? gnm.length + name : name])[ρσ_expr_temp.length-1], ρσ_expr_temp)];
                if (val === undefined) {
                    val = defval;
                }
                ans[(typeof name === "number" && name < 0) ? ans.length + name : name] = val;
            }
        }
        return ans;
    };
    if (!MatchObject.prototype.groupdict.__defaults__) Object.defineProperties(MatchObject.prototype.groupdict, {
        __defaults__ : {value: {defval:null}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["defval"]}
    });
    MatchObject.prototype.captures = function captures(group_name) {
        var self = this;
        var ans, groups, val;
        ans = ρσ_list_decorate([]);
        if (!has_prop(self.re.group_name_map, group_name)) {
            return ans;
        }
        groups = (ρσ_expr_temp = self.re.group_name_map)[(typeof group_name === "number" && group_name < 0) ? ρσ_expr_temp.length + group_name : group_name];
        for (var i = 0; i < groups.length; i++) {
            val = (ρσ_expr_temp = self._groups)[ρσ_bound_index(groups[(typeof i === "number" && i < 0) ? groups.length + i : i], ρσ_expr_temp)];
            if (val !== undefined) {
                ans.push(val);
            }
        }
        return ans;
    };
    if (!MatchObject.prototype.captures.__argnames__) Object.defineProperties(MatchObject.prototype.captures, {
        __argnames__ : {value: ["group_name"]}
    });
    MatchObject.prototype.capturesdict = function capturesdict() {
        var self = this;
        var gnm, names, ans, name;
        gnm = self.re.group_name_map;
        names = Object.keys(gnm);
        ans = {};
        for (var i = 0; i < names.length; i++) {
            name = names[(typeof i === "number" && i < 0) ? names.length + i : i];
            ans[(typeof name === "number" && name < 0) ? ans.length + name : name] = self.captures(name);
        }
        return ans;
    };
    if (!MatchObject.prototype.capturesdict.__argnames__) Object.defineProperties(MatchObject.prototype.capturesdict, {
        __argnames__ : {value: []}
    });
    MatchObject.prototype.__repr__ = function __repr__ () {
                return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
    };
    MatchObject.prototype.__str__ = function __str__ () {
        return this.__repr__();
    };
    Object.defineProperty(MatchObject.prototype, "__bases__", {value: []});

    function RegexObject() {
        if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
        RegexObject.prototype.__bind_methods__.call(this);
        RegexObject.prototype.__init__.apply(this, arguments);
    }
    Object.defineProperty(RegexObject.prototype, "__bind_methods__", {value: function () {
        this._do_search = RegexObject.prototype._do_search.bind(this);
        this.search = RegexObject.prototype.search.bind(this);
        this.match = RegexObject.prototype.match.bind(this);
        this.split = RegexObject.prototype.split.bind(this);
        this.findall = RegexObject.prototype.findall.bind(this);
        this.finditer = RegexObject.prototype.finditer.bind(this);
        this.subn = RegexObject.prototype.subn.bind(this);
        this.sub = RegexObject.prototype.sub.bind(this);
    }});
    RegexObject.prototype.__init__ = function __init__(pattern, flags) {
        var self = this;
        var ρσ_unpack, modifiers;
        self.pattern = (ρσ_instanceof(pattern, RegExp)) ? pattern.source : pattern;
        ρσ_unpack = transform_regex(self.pattern, flags);
ρσ_unpack = ρσ_unpack_asarray(3, ρσ_unpack);
        self.js_pattern = ρσ_unpack[0];
        self.flags = ρσ_unpack[1];
        self.group_name_map = ρσ_unpack[2];
        modifiers = "";
        if (self.flags & IGNORECASE) {
            modifiers += "i";
        }
        if (self.flags & MULTILINE) {
            modifiers += "m";
        }
        if (!(self.flags & ASCII) && supports_unicode) {
            modifiers += "u";
        }
        self._modifiers = modifiers + "g";
        self._pattern = new RegExp(self.js_pattern, self._modifiers);
    };
    if (!RegexObject.prototype.__init__.__argnames__) Object.defineProperties(RegexObject.prototype.__init__, {
        __argnames__ : {value: ["pattern", "flags"]}
    });
    RegexObject.__argnames__ = RegexObject.prototype.__init__.__argnames__;
    RegexObject.__handles_kwarg_interpolation__ = RegexObject.prototype.__init__.__handles_kwarg_interpolation__;
    RegexObject.prototype._do_search = function _do_search(pat, string, pos, endpos) {
        var self = this;
        var n;
        pat.lastIndex = 0;
        if (endpos !== null) {
            string = string.slice(0, endpos);
        }
        while (true) {
            n = pat.exec(string);
            if (n === null) {
                return null;
            }
            if (n.index >= pos) {
                return new MatchObject(self, n, pos, endpos);
            }
        }
    };
    if (!RegexObject.prototype._do_search.__argnames__) Object.defineProperties(RegexObject.prototype._do_search, {
        __argnames__ : {value: ["pat", "string", "pos", "endpos"]}
    });
    RegexObject.prototype.search = function search() {
        var self = this;
        var string = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var pos = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? search.__defaults__.pos : arguments[1];
        var endpos = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? search.__defaults__.endpos : arguments[2];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "pos")){
            pos = ρσ_kwargs_obj.pos;
        }
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "endpos")){
            endpos = ρσ_kwargs_obj.endpos;
        }
        return self._do_search(self._pattern, string, pos, endpos);
    };
    if (!RegexObject.prototype.search.__defaults__) Object.defineProperties(RegexObject.prototype.search, {
        __defaults__ : {value: {pos:0, endpos:null}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["string", "pos", "endpos"]}
    });
    RegexObject.prototype.match = function match() {
        var self = this;
        var string = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var pos = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? match.__defaults__.pos : arguments[1];
        var endpos = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? match.__defaults__.endpos : arguments[2];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "pos")){
            pos = ρσ_kwargs_obj.pos;
        }
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "endpos")){
            endpos = ρσ_kwargs_obj.endpos;
        }
        return self._do_search(new RegExp("^" + self.js_pattern, self._modifiers), string, pos, endpos);
    };
    if (!RegexObject.prototype.match.__defaults__) Object.defineProperties(RegexObject.prototype.match, {
        __defaults__ : {value: {pos:0, endpos:null}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["string", "pos", "endpos"]}
    });
    RegexObject.prototype.split = function split() {
        var self = this;
        var string = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var maxsplit = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? split.__defaults__.maxsplit : arguments[1];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "maxsplit")){
            maxsplit = ρσ_kwargs_obj.maxsplit;
        }
        self._pattern.lastIndex = 0;
        return string.split(self._pattern, maxsplit || undefined);
    };
    if (!RegexObject.prototype.split.__defaults__) Object.defineProperties(RegexObject.prototype.split, {
        __defaults__ : {value: {maxsplit:0}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["string", "maxsplit"]}
    });
    RegexObject.prototype.findall = function findall(string) {
        var self = this;
        self._pattern.lastIndex = 0;
        return ρσ_list_decorate(string.match(self._pattern) || []);
    };
    if (!RegexObject.prototype.findall.__argnames__) Object.defineProperties(RegexObject.prototype.findall, {
        __argnames__ : {value: ["string"]}
    });
    RegexObject.prototype.finditer = function finditer(string) {
        var self = this;
        var pat, ans;
        pat = new RegExp(this._pattern.source, this._modifiers);
        ans = {'_string':string, '_r':pat, '_self':self};
        ans[ρσ_iterator_symbol] = function () {
            return this;
        };
        ans["next"] = function () {
            var m;
            m = this._r.exec(this._string);
            if (m === null) {
                return {'done':true};
            }
            return {'done':false, 'value':new MatchObject(this._self, m, 0, null)};
        };
        return ans;
    };
    if (!RegexObject.prototype.finditer.__argnames__) Object.defineProperties(RegexObject.prototype.finditer, {
        __argnames__ : {value: ["string"]}
    });
    RegexObject.prototype.subn = function subn() {
        var self = this;
        var repl = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var string = ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[1];
        var count = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? subn.__defaults__.count : arguments[2];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "count")){
            count = ρσ_kwargs_obj.count;
        }
        var expand, num, matches, m, start, end;
        expand = _expand;
        if (typeof repl === "function") {
            expand = (function() {
                var ρσ_anonfunc = function (m, repl, gnm) {
                    return "" + repl(new MatchObject(self, m, 0, null));
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["m", "repl", "gnm"]}
                });
                return ρσ_anonfunc;
            })();
        }
        this._pattern.lastIndex = 0;
        num = 0;
        matches = [];
        while (count < 1 || num < count) {
            m = this._pattern.exec(string);
            if (m === null) {
                break;
            }
            matches.push(m);
            num += 1;
        }
        for (var i = matches.length - 1; i > -1; i--) {
            m = matches[(typeof i === "number" && i < 0) ? matches.length + i : i];
            start = m.index;
            end = start + m[0].length;
            string = string.slice(0, start) + expand(m, repl, self.group_name_map) + string.slice(end);
        }
        return [string, matches.length];
    };
    if (!RegexObject.prototype.subn.__defaults__) Object.defineProperties(RegexObject.prototype.subn, {
        __defaults__ : {value: {count:0}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["repl", "string", "count"]}
    });
    RegexObject.prototype.sub = function sub() {
        var self = this;
        var repl = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var string = ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[1];
        var count = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? sub.__defaults__.count : arguments[2];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "count")){
            count = ρσ_kwargs_obj.count;
        }
        return self.subn(repl, string, count)[0];
    };
    if (!RegexObject.prototype.sub.__defaults__) Object.defineProperties(RegexObject.prototype.sub, {
        __defaults__ : {value: {count:0}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["repl", "string", "count"]}
    });
    RegexObject.prototype.__repr__ = function __repr__ () {
                return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
    };
    RegexObject.prototype.__str__ = function __str__ () {
        return this.__repr__();
    };
    Object.defineProperty(RegexObject.prototype, "__bases__", {value: []});

    function _get_from_cache(pattern, flags) {
        var key, ans;
        if (ρσ_instanceof(pattern, RegExp)) {
            pattern = pattern.source;
        }
        key = JSON.stringify([pattern, flags]);
        if (has_prop(_re_cache_map, key)) {
            return _re_cache_map[(typeof key === "number" && key < 0) ? _re_cache_map.length + key : key];
        }
        if (_re_cache_items.length >= 100) {
            delete _re_cache_map[_re_cache_items.shift()];
        }
        ans = new RegexObject(pattern, flags);
        _re_cache_map[(typeof key === "number" && key < 0) ? _re_cache_map.length + key : key] = ans;
        _re_cache_items.push(key);
        return ans;
    };
    if (!_get_from_cache.__argnames__) Object.defineProperties(_get_from_cache, {
        __argnames__ : {value: ["pattern", "flags"]}
    });

    function compile() {
        var pattern = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var flags = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? compile.__defaults__.flags : arguments[1];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "flags")){
            flags = ρσ_kwargs_obj.flags;
        }
        return _get_from_cache(pattern, flags);
    };
    if (!compile.__defaults__) Object.defineProperties(compile, {
        __defaults__ : {value: {flags:0}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["pattern", "flags"]}
    });

    function search() {
        var pattern = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var string = ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[1];
        var flags = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? search.__defaults__.flags : arguments[2];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "flags")){
            flags = ρσ_kwargs_obj.flags;
        }
        return _get_from_cache(pattern, flags).search(string);
    };
    if (!search.__defaults__) Object.defineProperties(search, {
        __defaults__ : {value: {flags:0}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["pattern", "string", "flags"]}
    });

    function match() {
        var pattern = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var string = ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[1];
        var flags = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? match.__defaults__.flags : arguments[2];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "flags")){
            flags = ρσ_kwargs_obj.flags;
        }
        return _get_from_cache(pattern, flags).match(string);
    };
    if (!match.__defaults__) Object.defineProperties(match, {
        __defaults__ : {value: {flags:0}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["pattern", "string", "flags"]}
    });

    function split() {
        var pattern = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var string = ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[1];
        var maxsplit = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? split.__defaults__.maxsplit : arguments[2];
        var flags = (arguments[3] === undefined || ( 3 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? split.__defaults__.flags : arguments[3];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "maxsplit")){
            maxsplit = ρσ_kwargs_obj.maxsplit;
        }
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "flags")){
            flags = ρσ_kwargs_obj.flags;
        }
        return _get_from_cache(pattern, flags).split(string);
    };
    if (!split.__defaults__) Object.defineProperties(split, {
        __defaults__ : {value: {maxsplit:0, flags:0}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["pattern", "string", "maxsplit", "flags"]}
    });

    function findall() {
        var pattern = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var string = ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[1];
        var flags = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? findall.__defaults__.flags : arguments[2];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "flags")){
            flags = ρσ_kwargs_obj.flags;
        }
        return _get_from_cache(pattern, flags).findall(string);
    };
    if (!findall.__defaults__) Object.defineProperties(findall, {
        __defaults__ : {value: {flags:0}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["pattern", "string", "flags"]}
    });

    function finditer() {
        var pattern = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var string = ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[1];
        var flags = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? finditer.__defaults__.flags : arguments[2];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "flags")){
            flags = ρσ_kwargs_obj.flags;
        }
        return _get_from_cache(pattern, flags).finditer(string);
    };
    if (!finditer.__defaults__) Object.defineProperties(finditer, {
        __defaults__ : {value: {flags:0}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["pattern", "string", "flags"]}
    });

    function sub() {
        var pattern = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var repl = ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[1];
        var string = ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[2];
        var count = (arguments[3] === undefined || ( 3 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? sub.__defaults__.count : arguments[3];
        var flags = (arguments[4] === undefined || ( 4 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? sub.__defaults__.flags : arguments[4];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "count")){
            count = ρσ_kwargs_obj.count;
        }
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "flags")){
            flags = ρσ_kwargs_obj.flags;
        }
        return _get_from_cache(pattern, flags).sub(repl, string, count);
    };
    if (!sub.__defaults__) Object.defineProperties(sub, {
        __defaults__ : {value: {count:0, flags:0}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["pattern", "repl", "string", "count", "flags"]}
    });

    function subn() {
        var pattern = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var repl = ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[1];
        var string = ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[2];
        var count = (arguments[3] === undefined || ( 3 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? subn.__defaults__.count : arguments[3];
        var flags = (arguments[4] === undefined || ( 4 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? subn.__defaults__.flags : arguments[4];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "count")){
            count = ρσ_kwargs_obj.count;
        }
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "flags")){
            flags = ρσ_kwargs_obj.flags;
        }
        return _get_from_cache(pattern, flags).subn(repl, string, count);
    };
    if (!subn.__defaults__) Object.defineProperties(subn, {
        __defaults__ : {value: {count:0, flags:0}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["pattern", "repl", "string", "count", "flags"]}
    });

    function escape(string) {
        return string.replace(_RE_ESCAPE, "\\$&");
    };
    if (!escape.__argnames__) Object.defineProperties(escape, {
        __argnames__ : {value: ["string"]}
    });

    function purge() {
        _re_cache_map = {};
        _re_cache_items = [];
    };

    ρσ_modules.re._ALIAS_MAP = _ALIAS_MAP;
    ρσ_modules.re._ASCII_CONTROL_CHARS = _ASCII_CONTROL_CHARS;
    ρσ_modules.re._HEX_PAT = _HEX_PAT;
    ρσ_modules.re._NUM_PAT = _NUM_PAT;
    ρσ_modules.re._GROUP_PAT = _GROUP_PAT;
    ρσ_modules.re._NAME_PAT = _NAME_PAT;
    ρσ_modules.re.I = I;
    ρσ_modules.re.IGNORECASE = IGNORECASE;
    ρσ_modules.re.L = L;
    ρσ_modules.re.LOCALE = LOCALE;
    ρσ_modules.re.M = M;
    ρσ_modules.re.MULTILINE = MULTILINE;
    ρσ_modules.re.D = D;
    ρσ_modules.re.DOTALL = DOTALL;
    ρσ_modules.re.U = U;
    ρσ_modules.re.UNICODE = UNICODE;
    ρσ_modules.re.X = X;
    ρσ_modules.re.VERBOSE = VERBOSE;
    ρσ_modules.re.DEBUG = DEBUG;
    ρσ_modules.re.A = A;
    ρσ_modules.re.ASCII = ASCII;
    ρσ_modules.re.supports_unicode = supports_unicode;
    ρσ_modules.re._RE_ESCAPE = _RE_ESCAPE;
    ρσ_modules.re._re_cache_map = _re_cache_map;
    ρσ_modules.re._re_cache_items = _re_cache_items;
    ρσ_modules.re.error = error;
    ρσ_modules.re.has_prop = has_prop;
    ρσ_modules.re._expand = _expand;
    ρσ_modules.re.transform_regex = transform_regex;
    ρσ_modules.re.MatchObject = MatchObject;
    ρσ_modules.re.RegexObject = RegexObject;
    ρσ_modules.re._get_from_cache = _get_from_cache;
    ρσ_modules.re.compile = compile;
    ρσ_modules.re.search = search;
    ρσ_modules.re.match = match;
    ρσ_modules.re.split = split;
    ρσ_modules.re.findall = findall;
    ρσ_modules.re.finditer = finditer;
    ρσ_modules.re.sub = sub;
    ρσ_modules.re.subn = subn;
    ρσ_modules.re.escape = escape;
    ρσ_modules.re.purge = purge;
})();
var tag;
print("RapydScript-ng " + RapydScript.rs_version);
var re = ρσ_modules.re;

tag = this;
this.marker = null;
window.files = {};
function compile() {
    var inputcode = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? compile.__defaults__.inputcode : arguments[0];
    var ρσ_kwargs_obj = arguments[arguments.length-1];
    if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
    if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "inputcode")){
        inputcode = ρσ_kwargs_obj.inputcode;
    }
    var editor, options, file, session, result, code;
    editor = window.editor;
    options = (function(){
        var ρσ_d = {};
        ρσ_d["basedir"] = "__stdlib__";
        ρσ_d["bare"] = true;
        ρσ_d["js_version"] = 5;
        ρσ_d["omit_baselib"] = true;
        return ρσ_d;
    }).call(this);
    var ρσ_Iter0 = ρσ_Iterable(window.files);
    for (var ρσ_Index0 = 0; ρσ_Index0 < ρσ_Iter0.length; ρσ_Index0++) {
        file = ρσ_Iter0[ρσ_Index0];
        if (file !== tag.title) {
            (ρσ_expr_temp = RapydScript.file_data)[ρσ_bound_index("__stdlib__/" + file, ρσ_expr_temp)] = (ρσ_expr_temp = window.files)[(typeof file === "number" && file < 0) ? ρσ_expr_temp.length + file : file].getValue();
        }
    }
    session = editor.getDoc();
    if (tag.marker && !inputcode) {
        tag.marker.clear();
    }
    try {
        result = RapydScript.compile(inputcode || editor.getValue(), tag.title, options);
        if (ρσ_in("print;", result)) {
            throw new SyntaxError("Missing parentheses in call to \"print\"");
        }
    } catch (ρσ_Exception) {
        ρσ_last_exception = ρσ_Exception;
        if (ρσ_Exception instanceof Error) {
            var e = ρσ_Exception;
            console.log(e);
            code = "print ('''" + e.name + ": " + e.message + "''')";
            if (e.line && e.col && !inputcode) {
                tag.marker = editor.markText(CodeMirror.Pos(e.line - 1, e.col), CodeMirror.Pos(e.line - 1, e.col + 1), (function(){
                    var ρσ_d = {};
                    ρσ_d["className"] = "error-marker";
                    return ρσ_d;
                }).call(this));
                editor.scrollIntoView(e.line - 1, e.col + 1);
            }
            result = compiler.compile(code);
        } else {
            throw ρσ_Exception;
        }
    }
    return result;
};
if (!compile.__defaults__) Object.defineProperties(compile, {
    __defaults__ : {value: {inputcode:null}},
    __handles_kwarg_interpolation__ : {value: true},
    __argnames__ : {value: ["inputcode"]}
});

window.compile = compile;
function init() {
    var editor, iframe;
    editor = CodeMirror.fromTextArea(this.refs.code, (function(){
        var ρσ_d = {};
        ρσ_d["lineNumbers"] = true;
        ρσ_d["matchBrackets"] = true;
        ρσ_d["indentUnit"] = 4;
        ρσ_d["fixedGutter"] = false;
        ρσ_d["mode"] = "python";
        ρσ_d["styleActiveLine"] = true;
        ρσ_d["theme"] = "solarized light";
        return ρσ_d;
    }).call(this));
    editor.setOption("extraKeys", (function(){
        var ρσ_d = {};
        ρσ_d["Ctrl-Enter"] = run;
        ρσ_d["Alt-R"] = run;
        ρσ_d["F9"] = toggle_tray;
        ρσ_d["Tab"] = function () {
            if (editor.somethingSelected()) {
                editor.indentSelection("add");
            } else {
                editor.execCommand("insertSoftTab");
            }
        };
        return ρσ_d;
    }).call(this));
    iframe = this.refs.vmframe;
    function load_datastore(activity) {
        var datastore, savedSession;
        datastore = activity.getDatastoreObject();
        function check_load(error, metadata, data) {
            var parsed_data, new_session, file;
            if (data) {
                window.files = {};
                parsed_data = JSON.parse(data);
                var ρσ_Iter1 = ρσ_Iterable(parsed_data);
                for (var ρσ_Index1 = 0; ρσ_Index1 < ρσ_Iter1.length; ρσ_Index1++) {
                    file = ρσ_Iter1[ρσ_Index1];
                    if (parsed_data[(typeof file === "number" && file < 0) ? parsed_data.length + file : file]) {
                        new_session = CodeMirror.Doc(parsed_data[(typeof file === "number" && file < 0) ? parsed_data.length + file : file]);
                        (ρσ_expr_temp = window.files)[(typeof file === "number" && file < 0) ? ρσ_expr_temp.length + file : file] = new_session;
                    }
                }
            }
            if (len(window.files) > 0) {
                tag.title = list(parsed_data)[0];
                editor.swapDoc((ρσ_expr_temp = window.files)[ρσ_bound_index(tag.title, ρσ_expr_temp)]);
                editor.setOption("mode", "python");
            }
            tag.update();
        };
        if (!check_load.__argnames__) Object.defineProperties(check_load, {
            __argnames__ : {value: ["error", "metadata", "data"]}
        });

        if (datastore.objectId !== undefined) {
            datastore.loadAsText(check_load);
        } else {
            event_bus.trigger("enable-standalone");
            savedSession = localStorage.getItem("jappySession");
            if (savedSession !== null) {
                check_load(null, null, savedSession);
            }
        }
        tag.update();
        window.activity = activity;
    };
    if (!load_datastore.__argnames__) Object.defineProperties(load_datastore, {
        __argnames__ : {value: ["activity"]}
    });

    event_bus.on("activity-ready", load_datastore);
    function update_tabs() {
        var toolbar_div, toolbar_style, tabs_div, tabs_style, target_size;
        toolbar_div = document.getElementById("main-toolbar");
        if ((getComputedStyle(toolbar_div).display === "none" || typeof getComputedStyle(toolbar_div).display === "object" && ρσ_equals(getComputedStyle(toolbar_div).display, "none"))) {
            return;
        }
        toolbar_style = window.getComputedStyle(toolbar_div);
        tabs_div = document.getElementById("tabs");
        tabs_style = window.getComputedStyle(tabs_div);
        target_size = window.innerHeight - int(toolbar_style.height) - int(tabs_style.height);
        editor.setSize(null, target_size);
        if (ρσ_equals(len(window.files), 0)) {
            tag.title = get_new_untitled();
            window.files = (function(){
                var ρσ_d = {};
                ρσ_d[tag.title] = editor.getDoc();
                return ρσ_d;
            }).call(this);
        }
    };

    this.on("update", update_tabs);
    window.addEventListener("resize", update_tabs);
    function make_do() {
        tag.update();
    };

    event_bus.on("activity-not-ready", make_do);
    function switchtab(e) {
        var editbox;
        if (tag.title !== e.target.innerHTML) {
            tag.title = e.target.innerHTML;
            editor.swapDoc((ρσ_expr_temp = window.files)[ρσ_bound_index(e.target.innerHTML, ρσ_expr_temp)]);
            editor.setOption("mode", "python");
            editor.focus();
        } else {
            e.target.style.display = "none";
            editbox = document.createElement("input");
            editbox.value = tag.title;
            function rename_tab() {
                if (!(ρσ_in(editbox.value, window.files))) {
                    (ρσ_expr_temp = window.files)[ρσ_bound_index(editbox.value, ρσ_expr_temp)] = editor.getDoc();
                    ρσ_delitem(window.files, tag.title);
                    tag.title = editbox.value;
                }
                e.target.style.display = "inline-block";
                e.target.parentNode.removeChild(editbox);
                tag.update();
                editor.focus();
            };

            editbox.onblur = rename_tab;
            editbox.onkeyup = (function() {
                var ρσ_anonfunc = function (e) {
                    if ((e.keyCode === 13 || typeof e.keyCode === "object" && ρσ_equals(e.keyCode, 13))) {
                        editor.focus();
                    }
                    if ((e.keyCode === 27 || typeof e.keyCode === "object" && ρσ_equals(e.keyCode, 27))) {
                        editbox.value = tag.title;
                        editor.focus();
                    }
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["e"]}
                });
                return ρσ_anonfunc;
            })();
            e.target.parentNode.insertBefore(editbox, e.target);
            editbox.focus();
            if (tag.title.indexOf(".") > 0) {
                editbox.setSelectionRange(0, tag.title.indexOf("."));
            } else {
                editbox.select();
            }
        }
    };
    if (!switchtab.__argnames__) Object.defineProperties(switchtab, {
        __argnames__ : {value: ["e"]}
    });

    tag.switchtab = switchtab;
    function closetab(e) {
        var file, index;
        if (len(window.files) > 1) {
            file = tag.title;
            index = list(window.files).index(file);
            ρσ_delitem(window.files, file);
            if (ρσ_in("__stdlib__/" + file, RapydScript.file_data)) {
                ρσ_delitem(RapydScript.file_data, ("__stdlib__/" + file));
            }
            if (index > 0) {
                index = index - 1;
            }
            tag.title = (ρσ_expr_temp = list(window.files))[(typeof index === "number" && index < 0) ? ρσ_expr_temp.length + index : index];
            editor.swapDoc((ρσ_expr_temp = window.files)[ρσ_bound_index(tag.title, ρσ_expr_temp)]);
            editor.setOption("mode", "python");
            tag.update();
            editor.focus();
        }
    };
    if (!closetab.__argnames__) Object.defineProperties(closetab, {
        __argnames__ : {value: ["e"]}
    });

    tag.closetab = closetab;
    function get_new_untitled() {
        var file = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? get_new_untitled.__defaults__.file : arguments[0];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "file")){
            file = ρσ_kwargs_obj.file;
        }
        var basename, extension, i;
        basename = file.substr(0, file.indexOf("."));
        extension = file.substr(file.indexOf("."));
        i = 1;
        while (ρσ_in(file, files)) {
            file = basename + "-" + i + extension;
            i = i + 1;
        }
        return file;
    };
    if (!get_new_untitled.__defaults__) Object.defineProperties(get_new_untitled, {
        __defaults__ : {value: {file:"untitled.pyj"}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["file"]}
    });

    function newtab(e) {
        var file, new_session;
        file = get_new_untitled();
        new_session = CodeMirror.Doc("");
        (ρσ_expr_temp = window.files)[(typeof file === "number" && file < 0) ? ρσ_expr_temp.length + file : file] = new_session;
        editor.swapDoc(new_session);
        editor.setOption("mode", "python");
        editor.focus();
        tag.title = file;
        tag.update();
    };
    if (!newtab.__argnames__) Object.defineProperties(newtab, {
        __argnames__ : {value: ["e"]}
    });

    tag.newtab = newtab;
    function toggle_tray() {
        if ((getComputedStyle(iframe).display === "none" || typeof getComputedStyle(iframe).display === "object" && ρσ_equals(getComputedStyle(iframe).display, "none"))) {
            event_bus.trigger("traybutton-open");
        } else {
            event_bus.trigger("traybutton-close");
        }
    };

    event_bus.on("toggle-tray", toggle_tray);
    this.refs.traybutton.onclick = toggle_tray;
    function traybutton_close() {
        iframe.style.display = "none";
        iframe.style.width = "0%";
        tag.refs.split.style.width = "100%";
        tag.refs.traybutton.style.backgroundImage = "url(icons/tray-show.svg)";
    };

    event_bus.on("traybutton-close", traybutton_close);
    function traybutton_open() {
        iframe.style.display = "block";
        iframe.style.width = "50%";
        iframe.style.height = "100%";
        tag.refs.split.style.width = "50%";
        tag.refs.traybutton.style.backgroundImage = "url(icons/tray-hide.svg)";
    };

    event_bus.on("traybutton-open", traybutton_open);
    function run() {
        var js_output;
        window.state = "run";
        event_bus.trigger("traybutton-open");
        riot.update();
        event_bus.trigger("activity-save");
        js_output = compile();
        function write_script() {
			var script = iframe.contentDocument.createElement("script");
			script.innerHTML = js_output;
            iframe.contentDocument.body.appendChild(script);
            iframe.contentDocument.close();
        };

        iframe.onload = write_script;
        iframe.contentWindow.location = "template.html";
        return iframe;
    };

    event_bus.on("run-code", run);
    function break_code() {
        var iwindow, highestTimeoutId, i, highestIntervalId, inputs;
        iwindow = iframe.contentWindow;
        highestTimeoutId = iwindow.setTimeout(";");
        for (var ρσ_Index2 = 0; ρσ_Index2 < highestTimeoutId; ρσ_Index2++) {
            i = ρσ_Index2;
            iwindow.clearTimeout(i);
        }
        highestIntervalId = iwindow.setInterval(";");
        for (var ρσ_Index3 = 0; ρσ_Index3 < highestIntervalId; ρσ_Index3++) {
            i = ρσ_Index3;
            iwindow.clearInterval(i);
        }
        iwindow.stop();
        iwindow.document.body.style.opacity = "0.5";
        inputs = iwindow.document.getElementsByTagName("input");
        var ρσ_Iter4 = ρσ_Iterable(inputs);
        for (var ρσ_Index4 = 0; ρσ_Index4 < ρσ_Iter4.length; ρσ_Index4++) {
            i = ρσ_Iter4[ρσ_Index4];
            i.disabled = true;
        }
        iwindow.addEventListener("click", (function() {
            var ρσ_anonfunc = function (ev) {
                ev.stopPropagation();
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["ev"]}
            });
            return ρσ_anonfunc;
        })(), true);
    };

    event_bus.on("break-code", break_code);
    function clear_output() {
        iframe.contentWindow.location = "about:blank";
    };

    event_bus.on("clear-output", clear_output);
    function serialize() {
        var result, file;
        result = {};
        var ρσ_Iter5 = ρσ_Iterable(window.files);
        for (var ρσ_Index5 = 0; ρσ_Index5 < ρσ_Iter5.length; ρσ_Index5++) {
            file = ρσ_Iter5[ρσ_Index5];
            result[(typeof file === "number" && file < 0) ? result.length + file : file] = (ρσ_expr_temp = window.files)[(typeof file === "number" && file < 0) ? ρσ_expr_temp.length + file : file].getValue();
        }
        return JSON.stringify(result);
    };

    function save_without_datastore() {
        localStorage.jappySession = serialize();
    };

    function save() {
        var activity = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? save.__defaults__.activity : arguments[0];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "activity")){
            activity = ρσ_kwargs_obj.activity;
        }
        var datastore;
        if (activity !== undefined) {
            datastore = activity.getDatastoreObject();
        }
        if (activity && datastore.objectId !== undefined) {
            datastore.setDataAsText(serialize());
            function check_save(error) {
                if (error === null) {
                    console.log("Saved");
                } else {
                    console.log("NOT Saved");
                }
            };
            if (!check_save.__argnames__) Object.defineProperties(check_save, {
                __argnames__ : {value: ["error"]}
            });

            datastore.save(check_save);
        } else {
            save_without_datastore();
        }
    };
    if (!save.__defaults__) Object.defineProperties(save, {
        __defaults__ : {value: {activity:window.activity}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["activity"]}
    });

    event_bus.on("activity-save", save);
    function example_load() {
        var file = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var execute = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? example_load.__defaults__.execute : arguments[1];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "execute")){
            execute = ρσ_kwargs_obj.execute;
        }
        var url_base;
        if (ρσ_in(file, window.files)) {
            tag.title = file;
            editor.swapDoc((ρσ_expr_temp = window.files)[(typeof file === "number" && file < 0) ? ρσ_expr_temp.length + file : file]);
            editor.setOption("mode", "python");
            tag.update();
            editor.focus();
            if (execute) {
                if (window.innerWidth > 720) {
                    event_bus.trigger("run-code");
                } else {
                    event_bus.trigger("run-fullscreen");
                }
            }
            return;
        }
        url_base = window.location.protocol;
        require(ρσ_list_decorate([ "text!examples/" + file ]), (function() {
            var ρσ_anonfunc = function (data) {
                var new_session;
                new_session = CodeMirror.Doc(data);
                files[(typeof file === "number" && file < 0) ? files.length + file : file] = new_session;
                editor.swapDoc(new_session);
                editor.setOption("mode", "python");
                tag.title = file;
                tag.update();
                editor.focus();
                if (execute) {
                    if (window.innerWidth > 720) {
                        event_bus.trigger("run-code");
                    } else {
                        event_bus.trigger("run-fullscreen");
                    }
                }
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["data"]}
            });
            return ρσ_anonfunc;
        })());
    };
    if (!example_load.__defaults__) Object.defineProperties(example_load, {
        __defaults__ : {value: {execute:true}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["file", "execute"]}
    });

    event_bus.on("example-load", example_load);
    function process_file() {
        var file, reader;
        file = tag.refs.file_input.files[0];
        reader = new FileReader;
        if ((file.type === "application/zip" || typeof file.type === "object" && ρσ_equals(file.type, "application/zip"))) {
            JSZip.loadAsync(file).then((function() {
                var ρσ_anonfunc = function (zip) {
                    zip.forEach((function() {
                        var ρσ_anonfunc = function (relpath, zippedfile) {
                            var basepath;
                            if (ρσ_equals(relpath.slice(0, 4), "src/") && (relpath !== "src/" && (typeof relpath !== "object" || ρσ_not_equals(relpath, "src/")))) {
                                if (ρσ_equals(relpath.slice(-4), ".pyj")) {
                                    basepath = relpath.slice(4);
                                    zippedfile.async("text").then((function() {
                                        var ρσ_anonfunc = function (data) {
                                            var new_session;
                                            new_session = CodeMirror.Doc(str(data));
                                            (ρσ_expr_temp = window.files)[(typeof basepath === "number" && basepath < 0) ? ρσ_expr_temp.length + basepath : basepath] = new_session;
                                            editor.swapDoc(new_session);
                                            editor.setOption("mode", "python");
                                            tag.title = basepath;
                                            tag.update();
                                        };
                                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                                            __argnames__ : {value: ["data"]}
                                        });
                                        return ρσ_anonfunc;
                                    })());
                                }
                            }
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["relpath", "zippedfile"]}
                        });
                        return ρσ_anonfunc;
                    })());
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["zip"]}
                });
                return ρσ_anonfunc;
            })());
        } else {
            reader.onload = function () {
                return (function() {
                    var ρσ_anonfunc = function (evt) {
                        var new_session;
                        new_session = CodeMirror.Doc(evt.target.result);
                        (ρσ_expr_temp = window.files)[ρσ_bound_index(file.name, ρσ_expr_temp)] = new_session;
                        tag.update();
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["evt"]}
                    });
                    return ρσ_anonfunc;
                })();
            }();
            reader.readAsText(file);
        }
    };

    tag.refs.file_input.onchange = process_file;
    function import_file() {
        tag.refs.file_input.click();
    };

    event_bus.on("import-file", import_file);
    function restore(e) {
        var code_editor, toolbar, toolbar_height, canvas;
        code_editor = tag.refs.split;
        code_editor.style.display = "block";
        toolbar = document.getElementById("main-toolbar");
        toolbar.style.display = "block";
        e.target.parentNode.removeChild(e.target);
        toolbar_height = window.getComputedStyle(toolbar)["height"];
        canvas = document.getElementById("canvas");
        canvas.style.top = toolbar_height;
        if (window.innerWidth > 720) {
            iframe.style.width = "50%";
        } else {
            window.state = "clean";
            event_bus.trigger("clear-output");
            event_bus.trigger("traybutton-close");
            riot.update();
        }
    };
    if (!restore.__argnames__) Object.defineProperties(restore, {
        __argnames__ : {value: ["e"]}
    });

    function run_fullscreen() {
        var execute = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? run_fullscreen.__defaults__.execute : arguments[0];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "execute")){
            execute = ρσ_kwargs_obj.execute;
        }
        var code_editor, toolbar, canvas, restore_button;
        code_editor = tag.refs.split;
        code_editor.style.display = "none";
        toolbar = document.getElementById("main-toolbar");
        toolbar.style.display = "none";
        canvas = document.getElementById("canvas");
        canvas.style.top = "0";
        if (execute) {
            run();
        }
        restore_button = document.createElement("button");
        restore_button.onclick = restore;
        restore_button.style.opacity = "0.5";
        restore_button.style.position = "fixed";
        restore_button.style.right = restore_button.style.top = "0";
        restore_button.style.padding = "0px";
        restore_button.style["border-radius"] = "0px";
        restore_button.style["background-image"] = "url(icons/view-return.svg)";
        restore_button.style["background-repeat"] = "no-repeat";
        restore_button.style["background-position"] = "center";
        restore_button.style.width = restore_button.style.height = "55px";
        document.body.appendChild(restore_button);
        iframe.style.width = "100%";
    };
    if (!run_fullscreen.__defaults__) Object.defineProperties(run_fullscreen, {
        __defaults__ : {value: {execute:true}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["execute"]}
    });

    event_bus.on("run-fullscreen", run_fullscreen);
    function save_zip() {
        var bundle_name, js_output, url_base;
        event_bus.trigger("activity-save", activity);
        bundle_name = tag.title.slice(0, tag.title.indexOf("."));
        js_output = compile();
        url_base = window.location.protocol;
        require(ρσ_list_decorate([ "text!template" ]), (function() {
            var ρσ_anonfunc = function (data) {
                var script, enc_js, closing_tag, html, external_files, ref, match, zip, name;
                script = iframe.contentDocument.createElement("script");
                script.innerHTML = js_output;
                enc_js = script.outerHTML + "\n";
                closing_tag = data.indexOf("</body>");
                html = data.slice(0, closing_tag) + enc_js + data.slice(closing_tag);
                external_files = ρσ_list_decorate([]);
                var ρσ_Iter6 = ρσ_Iterable(re.findall("script.*src=\"(.*)\"", data));
                for (var ρσ_Index6 = 0; ρσ_Index6 < ρσ_Iter6.length; ρσ_Index6++) {
                    match = ρσ_Iter6[ρσ_Index6];
                    ref = "text!" + match.slice(match.indexOf("=") + 2, -1);
                    ref = ref.replace("lib/", "");
                    external_files.append(ref);
                }
                zip = new JSZip;
                zip.file("index.html", html);
                var ρσ_Iter7 = ρσ_Iterable(window.files);
                for (var ρσ_Index7 = 0; ρσ_Index7 < ρσ_Iter7.length; ρσ_Index7++) {
                    name = ρσ_Iter7[ρσ_Index7];
                    zip.file("src/" + name, (ρσ_expr_temp = window.files)[(typeof name === "number" && name < 0) ? ρσ_expr_temp.length + name : name].getValue());
                }
                require(external_files, function () {
                    var data = Array.prototype.slice.call(arguments, 0);
                    if (arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) data.pop();
                    var index, file;
                    index = 0;
                    var ρσ_Iter8 = ρσ_Iterable(external_files);
                    for (var ρσ_Index8 = 0; ρσ_Index8 < ρσ_Iter8.length; ρσ_Index8++) {
                        file = ρσ_Iter8[ρσ_Index8];
                        file = file.slice(5);
                        if (!(ρσ_in("/", file))) {
                            file = "lib/" + file;
                        }
                        zip.file(file, data[(typeof index === "number" && index < 0) ? data.length + index : index]);
                        index = index + 1;
                    }
                    zip.generateAsync((function(){
                        var ρσ_d = {};
                        ρσ_d["type"] = "blob";
                        return ρσ_d;
                    }).call(this)).then((function() {
                        var ρσ_anonfunc = function (blob) {
                            saveAs(blob, bundle_name + ".zip");
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["blob"]}
                        });
                        return ρσ_anonfunc;
                    })());
                });
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["data"]}
            });
            return ρσ_anonfunc;
        })());
    };

    event_bus.on("save-as-zip", save_zip);
    this.editor = editor;
    window.editor = editor;
    editor.focus();
};

this.on("mount", init);
});
