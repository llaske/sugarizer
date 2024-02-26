define([], function() {
	var conversionFactor = 0.0264;

	var getAutomaticStyles = function() {
		return automaticStyles;
	}

	var addLevelStyles = function(levels) {
		for(let key in levels) {
			automaticStyles += `
			<style:style style:name="level${key}" style:family="text">
				<style:text-properties fo:color="${levels[key].colors.fill == '#FFFFFF' ? '#838383' : levels[key].colors.fill}" style:font-name="Arial" fo:font-size="10pt" fo:font-weight="bold" style:font-size-asian="10pt" style:font-weight-asian="bold" style:font-size-complex="10pt" style:font-weight-complex="bold"/>
			</style:style>`;
			automaticStyles += `
			<style:style style:name="levelbar${key}" style:family="paragraph">
				<loext:graphic-properties draw:fill-color="${levels[key].colors.fill == '#FFFFFF' ? '#838383' : levels[key].colors.fill}" />
			</style:style>`;
			automaticStyles += `
			<style:style style:name="levelbargr${key}" style:family="graphic">
				<style:graphic-properties svg:stroke-color="${levels[key].colors.stroke}" draw:fill-color="${levels[key].colors.fill == '#FFFFFF' ? '#838383' : levels[key].colors.fill}" draw:textarea-horizontal-align="center" draw:textarea-vertical-align="middle" fo:min-height="0cm" fo:min-width="0cm" style:run-through="foreground" style:wrap="run-through" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="from-top" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" draw:wrap-influence-on-position="once-concurrent" loext:allow-overlap="true" style:flow-with-text="false"/>
			</style:style>`;
		}
	}

	var addCover = function(templateTitle, imageURL, userName) {
		return `<text:p text:style-name="P3"><draw:frame text:anchor-type="paragraph" draw:z-index="0" draw:style-name="gr7" draw:text-style-name="P54" svg:width="19.03cm" svg:height="0.996cm" svg:x="0.975cm" svg:y="6.325cm">
		<draw:text-box>
		 <text:p text:style-name="P49"><text:span text:style-name="T2">${parseString(templateTitle)}</text:span></text:p>
		</draw:text-box>
	 </draw:frame><draw:frame text:anchor-type="paragraph" draw:z-index="2" draw:style-name="gr7" draw:text-style-name="P54" svg:width="19.03cm" svg:height="0.996cm" svg:x="0.975cm" svg:y="11.257cm">
		<draw:text-box>
		 <text:p text:style-name="P49"><text:span text:style-name="T2">${parseString(userName)}</text:span></text:p>
		</draw:text-box>
	 </draw:frame><text:s text:c="2"/>
	 <draw:frame draw:style-name="fr9" text:anchor-type="char" svg:y="7.426cm" svg:width="3.441cm" svg:height="3.424cm" draw:z-index="1">
	 	<draw:image loext:mime-type="image/jpeg">
		 <office:binary-data>${imageURL.substring(imageURL.indexOf(',') + 1)}</office:binary-data>
		</draw:image>
	 </draw:frame></text:p>`;
	}

	var addStatsTable = function(levels) {
		let table = '';
		table += `<text:p text:style-name="P41">Statistics</text:p> `;
		table += `
		<text:p />
		<table:table table:name="Table1" table:style-name="Table1">
			<table:table-column table:style-name="Table1.A"/>
			<table:table-column table:style-name="Table1.B"/>
			<table:table-column table:style-name="Table1.C"/>
		`;
		for(let key in levels) {
			let width = (levels[levels.length-1-key].percent/100)*14;
			table += `<table:table-row>
			<table:table-cell table:style-name="Table1.A1" office:value-type="string">
				<text:p text:style-name="P44">${levels[levels.length-1-key].text}</text:p>
			</table:table-cell>
			<table:table-cell table:style-name="Table1.B1" office:value-type="string">
				<text:p text:style-name="P42">
				<draw:custom-shape text:anchor-type="as-char" draw:z-index="31" draw:style-name="levelbargr${levels.length-1-key}" draw:text-style-name="levelbar${levels.length-1-key}" svg:y="-0.402cm" svg:width="${width}cm" svg:height="0.456cm">
					<text:p/>
					<draw:enhanced-geometry svg:viewBox="0 0 21600 21600" draw:mirror-horizontal="false" draw:mirror-vertical="false" draw:type="rectangle" draw:enhanced-path="M 0 0 L 21600 0 21600 21600 0 21600 0 0 Z N"/>
				</draw:custom-shape>
				</text:p>
			</table:table-cell>
			<table:table-cell table:style-name="Table1.C1" office:value-type="string">
				<text:p text:style-name="P43">${levels[levels.length-1-key].percent}%</text:p>
			</table:table-cell>
			</table:table-row>
			`;
		}

		table += `</table:table>`;
		return table;
	}

	var addRewards = function(achievements) {
		let rewards = '';
		rewards += `
		<text:p text:style-name="P32"/>
		<text:p text:style-name="P32"/>
		<text:p text:style-name="P33">Rewards</text:p>
		<text:p text:style-name="P33">
		`;
		for(let achievement of achievements) {
			rewards += `<draw:frame draw:style-name="fr4"  text:anchor-type="as-char" svg:width="4.113cm" draw:z-index="11">
			<draw:text-box fo:min-height="5.583cm">
				<text:p text:style-name="P28"><draw:frame draw:style-name="fr8"  text:anchor-type="as-char" svg:width="3.905cm" svg:height="4.232cm" draw:z-index="12"><draw:image loext:mime-type="image/jpeg">
					<office:binary-data>${achievement.imageURL.substring(achievement.imageURL.indexOf(',') + 1)}</office:binary-data>
					</draw:image>
				</draw:frame>${achievement.title}</text:p>
				<text:p text:style-name="P29">${achievement.time}</text:p>
			</draw:text-box>
			</draw:frame>
			`;
		}
		rewards += `</text:p>`;
		return rewards;
	}

	var addCategoryTitle = function(category) {
		let style = `<style:style style:name="cat${category.id}" style:family="paragraph">
		<loext:graphic-properties draw:fill-color="${category.color}"/>
	 </style:style>`;
	 automaticStyles += style;

		return `<text:p text:style-name="P27">${parseString(category.title)}</text:p>
		<text:p text:style-name="P26">
			<draw:custom-shape text:anchor-type="as-char" draw:z-index="6" draw:style-name="gr6" draw:text-style-name="cat${category.id}" svg:width="20.862cm" svg:height="0.324cm">
				<text:p/>
				<draw:enhanced-geometry svg:viewBox="0 0 21600 21600" draw:type="rectangle" draw:enhanced-path="M 0 0 L 21600 0 21600 21600 0 21600 0 0 Z N"/>
			</draw:custom-shape>
		</text:p>`;
	}

	var addImage = function(imageURL, width, height) {
		let code = '';
		code += `<draw:frame draw:style-name="fr5"  text:anchor-type="char" svg:x="-0.152cm" svg:y="-0.152cm" svg:width="6.392cm" svg:height="${height}cm" draw:z-index="32">
		<draw:image loext:mime-type="image/jpeg">
		<office:binary-data>${imageURL.substring(imageURL.indexOf(',') + 1)}</office:binary-data>
		</draw:image>
	 </draw:frame>`;
	 return code;
	}

	var addSkillLevel = function(level) {
		return `<draw:frame text:anchor-type="paragraph" draw:z-index="31" draw:style-name="gr1" draw:text-style-name="P48" svg:width="3.151cm" svg:height="0.479cm" svg:x="16.955cm" svg:y="0.004cm">
		<draw:text-box>
		 <text:p text:style-name="P47"><text:span text:style-name="level${level.level}">${level.text}</text:span></text:p>
		</draw:text-box>
	 </draw:frame>`;
	}

	var addSkillTitle = function(title, innerData) {
		
		return `<text:p text:style-name="P23">${innerData}${parseString(title)}</text:p>
		<text:p text:style-name="P18">
			<draw:line text:anchor-type="as-char" svg:y="-0.131cm" draw:z-index="23" draw:style-name="gr2" draw:text-style-name="P49" svg:x2="13.864cm" svg:y2="-0.035cm">
				<text:p/>
			</draw:line><text:s/>
		</text:p>`;
	}

	var addSkillTimestamp = function(timestampText) {
		return `<text:p text:style-name="P39">${timestampText} <text:s/></text:p>`;
	}

	var addToSkillFrame = function(innerData) {
		return `<text:p text:style-name="P20">
			<draw:frame draw:style-name="fr3"  text:anchor-type="as-char" svg:y="-3.884cm" svg:width="20.597cm" draw:z-index="3">
			<draw:text-box fo:min-height="6.041cm">
			${innerData}
			</draw:text-box>
			</draw:frame>
			</text:p>
			`;
	}

	var addMediaFrame = function(mediaElement) {
		return `<draw:frame draw:style-name="fr1" text:anchor-type="as-char" svg:width="4.413cm" draw:z-index="16">
			<draw:text-box fo:min-height="3.286cm">
			<text:p text:style-name="P29"><draw:frame draw:style-name="fr7" text:anchor-type="char" svg:width="4.269cm" svg:height="${mediaElement.height}cm" draw:z-index="17">
				<draw:image loext:mime-type="image/jpeg">
					<office:binary-data>${mediaElement.imageURL.substring(mediaElement.imageURL.indexOf(',') + 1)}</office:binary-data>
				</draw:image>
				</draw:frame>${mediaElement.time}</text:p>
			</draw:text-box>
		</draw:frame>`;
	}

	var addToMediaContainerFrame = function(innerData) {
		return `<text:p text:style-name="P22"><draw:frame draw:style-name="fr2" text:anchor-type="as-char" svg:y="-2.191cm" svg:width="13.651cm" draw:z-index="15">
		<draw:text-box fo:min-height="6.189cm">
		 	<text:p text:style-name="P30">
		 		${innerData}
		 	</text:p>
		</draw:text-box>
		</draw:frame></text:p>
		`;
	}

	var parseString = function(str) {
		str = str.replace('&nbsp;', ' ');
		let parsedText = document.createElement('p');
		parsedText.innerHTML = str;
		return str;
	}

	var header = `<?xml version="1.0" encoding="UTF-8"?>

	<office:document xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:ooo="http://openoffice.org/2004/office" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:dr3d="urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" xmlns:chart="urn:oasis:names:tc:opendocument:xmlns:chart:1.0" xmlns:rpt="http://openoffice.org/2005/report" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0" xmlns:ooow="http://openoffice.org/2004/writer" xmlns:oooc="http://openoffice.org/2004/calc" xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2" xmlns:css3t="http://www.w3.org/TR/css3-text/" xmlns:tableooo="http://openoffice.org/2009/table" xmlns:calcext="urn:org:documentfoundation:names:experimental:calc:xmlns:calcext:1.0" xmlns:drawooo="http://openoffice.org/2010/draw" xmlns:loext="urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0" xmlns:grddl="http://www.w3.org/2003/g/data-view#" xmlns:field="urn:openoffice:names:experimental:ooo-ms-interop:xmlns:field:1.0" xmlns:math="http://www.w3.org/1998/Math/MathML" xmlns:form="urn:oasis:names:tc:opendocument:xmlns:form:1.0" xmlns:script="urn:oasis:names:tc:opendocument:xmlns:script:1.0" xmlns:dom="http://www.w3.org/2001/xml-events" xmlns:xforms="http://www.w3.org/2002/xforms" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:formx="urn:openoffice:names:experimental:ooxml-odf-interop:xmlns:form:1.0" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:officeooo="http://openoffice.org/2009/office" office:version="1.2" office:mimetype="application/vnd.oasis.opendocument.text">
	<office:meta><meta:creation-date>2020-07-03T14:42:37.072000000</meta:creation-date><dc:date>2020-07-04T16:51:15.540000000</dc:date><meta:editing-duration>PT1H35M12S</meta:editing-duration><meta:editing-cycles>24</meta:editing-cycles><meta:generator>LibreOffice/6.4.5.2$Windows_X86_64 LibreOffice_project/a726b36747cf2001e06b58ad5db1aa3a9a1872d6</meta:generator><meta:document-statistic meta:table-count="0" meta:image-count="7" meta:object-count="0" meta:page-count="2" meta:paragraph-count="12" meta:word-count="17" meta:character-count="82" meta:non-whitespace-character-count="67"/></office:meta>
	<office:settings>
		<config:config-item-set config:name="ooo:view-settings">
		<config:config-item config:name="ViewAreaTop" config:type="long">37486</config:config-item>
		<config:config-item config:name="ViewAreaLeft" config:type="long">0</config:config-item>
		<config:config-item config:name="ViewAreaWidth" config:type="long">33657</config:config-item>
		<config:config-item config:name="ViewAreaHeight" config:type="long">17020</config:config-item>
		<config:config-item config:name="ShowRedlineChanges" config:type="boolean">true</config:config-item>
		<config:config-item config:name="InBrowseMode" config:type="boolean">false</config:config-item>
		<config:config-item-map-indexed config:name="Views">
			<config:config-item-map-entry>
			<config:config-item config:name="ViewId" config:type="string">view2</config:config-item>
			<config:config-item config:name="ViewLeft" config:type="long">12929</config:config-item>
			<config:config-item config:name="ViewTop" config:type="long">44589</config:config-item>
			<config:config-item config:name="VisibleLeft" config:type="long">0</config:config-item>
			<config:config-item config:name="VisibleTop" config:type="long">37486</config:config-item>
			<config:config-item config:name="VisibleRight" config:type="long">33655</config:config-item>
			<config:config-item config:name="VisibleBottom" config:type="long">54504</config:config-item>
			<config:config-item config:name="ZoomType" config:type="short">0</config:config-item>
			<config:config-item config:name="ViewLayoutColumns" config:type="short">1</config:config-item>
			<config:config-item config:name="ViewLayoutBookMode" config:type="boolean">false</config:config-item>
			<config:config-item config:name="ZoomFactor" config:type="short">100</config:config-item>
			<config:config-item config:name="IsSelectedFrame" config:type="boolean">true</config:config-item>
			<config:config-item config:name="AnchoredTextOverflowLegacy" config:type="boolean">false</config:config-item>
			</config:config-item-map-entry>
		</config:config-item-map-indexed>
		</config:config-item-set>
		<config:config-item-set config:name="ooo:configuration-settings">
		<config:config-item config:name="ProtectForm" config:type="boolean">false</config:config-item>
		<config:config-item-map-indexed config:name="ForbiddenCharacters">
			<config:config-item-map-entry>
			<config:config-item config:name="Language" config:type="string">en</config:config-item>
			<config:config-item config:name="Country" config:type="string">US</config:config-item>
			<config:config-item config:name="Variant" config:type="string"/>
			<config:config-item config:name="BeginLine" config:type="string"/>
			<config:config-item config:name="EndLine" config:type="string"/>
			</config:config-item-map-entry>
		</config:config-item-map-indexed>
		<config:config-item config:name="PrinterName" config:type="string"/>
		<config:config-item config:name="EmbeddedDatabaseName" config:type="string"/>
		<config:config-item config:name="CurrentDatabaseDataSource" config:type="string"/>
		<config:config-item config:name="LinkUpdateMode" config:type="short">1</config:config-item>
		<config:config-item config:name="AddParaTableSpacingAtStart" config:type="boolean">true</config:config-item>
		<config:config-item config:name="FloattableNomargins" config:type="boolean">false</config:config-item>
		<config:config-item config:name="UnbreakableNumberings" config:type="boolean">false</config:config-item>
		<config:config-item config:name="FieldAutoUpdate" config:type="boolean">true</config:config-item>
		<config:config-item config:name="AddVerticalFrameOffsets" config:type="boolean">false</config:config-item>
		<config:config-item config:name="EmbedLatinScriptFonts" config:type="boolean">true</config:config-item>
		<config:config-item config:name="BackgroundParaOverDrawings" config:type="boolean">false</config:config-item>
		<config:config-item config:name="AddParaTableSpacing" config:type="boolean">true</config:config-item>
		<config:config-item config:name="ChartAutoUpdate" config:type="boolean">true</config:config-item>
		<config:config-item config:name="CurrentDatabaseCommand" config:type="string"/>
		<config:config-item config:name="AlignTabStopPosition" config:type="boolean">true</config:config-item>
		<config:config-item config:name="PrinterSetup" config:type="base64Binary"/>
		<config:config-item config:name="PrinterPaperFromSetup" config:type="boolean">false</config:config-item>
		<config:config-item config:name="IsKernAsianPunctuation" config:type="boolean">false</config:config-item>
		<config:config-item config:name="CharacterCompressionType" config:type="short">0</config:config-item>
		<config:config-item config:name="ApplyUserData" config:type="boolean">true</config:config-item>
		<config:config-item config:name="DoNotJustifyLinesWithManualBreak" config:type="boolean">false</config:config-item>
		<config:config-item config:name="SaveThumbnail" config:type="boolean">true</config:config-item>
		<config:config-item config:name="SaveGlobalDocumentLinks" config:type="boolean">false</config:config-item>
		<config:config-item config:name="SmallCapsPercentage66" config:type="boolean">false</config:config-item>
		<config:config-item config:name="CurrentDatabaseCommandType" config:type="int">0</config:config-item>
		<config:config-item config:name="SaveVersionOnClose" config:type="boolean">false</config:config-item>
		<config:config-item config:name="UpdateFromTemplate" config:type="boolean">true</config:config-item>
		<config:config-item config:name="DoNotCaptureDrawObjsOnPage" config:type="boolean">false</config:config-item>
		<config:config-item config:name="UseFormerObjectPositioning" config:type="boolean">false</config:config-item>
		<config:config-item config:name="PrintSingleJobs" config:type="boolean">false</config:config-item>
		<config:config-item config:name="EmbedSystemFonts" config:type="boolean">false</config:config-item>
		<config:config-item config:name="PrinterIndependentLayout" config:type="string">high-resolution</config:config-item>
		<config:config-item config:name="IsLabelDocument" config:type="boolean">false</config:config-item>
		<config:config-item config:name="AddFrameOffsets" config:type="boolean">false</config:config-item>
		<config:config-item config:name="AddExternalLeading" config:type="boolean">true</config:config-item>
		<config:config-item config:name="UseOldNumbering" config:type="boolean">false</config:config-item>
		<config:config-item config:name="OutlineLevelYieldsNumbering" config:type="boolean">false</config:config-item>
		<config:config-item config:name="DoNotResetParaAttrsForNumFont" config:type="boolean">false</config:config-item>
		<config:config-item config:name="IgnoreFirstLineIndentInNumbering" config:type="boolean">false</config:config-item>
		<config:config-item config:name="AllowPrintJobCancel" config:type="boolean">true</config:config-item>
		<config:config-item config:name="UseFormerLineSpacing" config:type="boolean">false</config:config-item>
		<config:config-item config:name="AddParaSpacingToTableCells" config:type="boolean">true</config:config-item>
		<config:config-item config:name="UseFormerTextWrapping" config:type="boolean">false</config:config-item>
		<config:config-item config:name="RedlineProtectionKey" config:type="base64Binary"/>
		<config:config-item config:name="ConsiderTextWrapOnObjPos" config:type="boolean">false</config:config-item>
		<config:config-item config:name="EmbedFonts" config:type="boolean">false</config:config-item>
		<config:config-item config:name="TableRowKeep" config:type="boolean">false</config:config-item>
		<config:config-item config:name="TabsRelativeToIndent" config:type="boolean">true</config:config-item>
		<config:config-item config:name="IgnoreTabsAndBlanksForLineCalculation" config:type="boolean">false</config:config-item>
		<config:config-item config:name="RsidRoot" config:type="int">466880</config:config-item>
		<config:config-item config:name="LoadReadonly" config:type="boolean">false</config:config-item>
		<config:config-item config:name="ClipAsCharacterAnchoredWriterFlyFrames" config:type="boolean">false</config:config-item>
		<config:config-item config:name="UnxForceZeroExtLeading" config:type="boolean">false</config:config-item>
		<config:config-item config:name="UseOldPrinterMetrics" config:type="boolean">false</config:config-item>
		<config:config-item config:name="TabAtLeftIndentForParagraphsInList" config:type="boolean">false</config:config-item>
		<config:config-item config:name="Rsid" config:type="int">1336091</config:config-item>
		<config:config-item config:name="EmbedOnlyUsedFonts" config:type="boolean">false</config:config-item>
		<config:config-item config:name="MsWordCompTrailingBlanks" config:type="boolean">false</config:config-item>
		<config:config-item config:name="MathBaselineAlignment" config:type="boolean">true</config:config-item>
		<config:config-item config:name="InvertBorderSpacing" config:type="boolean">false</config:config-item>
		<config:config-item config:name="CollapseEmptyCellPara" config:type="boolean">true</config:config-item>
		<config:config-item config:name="TabOverflow" config:type="boolean">true</config:config-item>
		<config:config-item config:name="StylesNoDefault" config:type="boolean">false</config:config-item>
		<config:config-item config:name="ClippedPictures" config:type="boolean">false</config:config-item>
		<config:config-item config:name="EmbedAsianScriptFonts" config:type="boolean">true</config:config-item>
		<config:config-item config:name="EmptyDbFieldHidesPara" config:type="boolean">true</config:config-item>
		<config:config-item config:name="EmbedComplexScriptFonts" config:type="boolean">true</config:config-item>
		<config:config-item config:name="TabOverMargin" config:type="boolean">false</config:config-item>
		<config:config-item config:name="TreatSingleColumnBreakAsPageBreak" config:type="boolean">false</config:config-item>
		<config:config-item config:name="SurroundTextWrapSmall" config:type="boolean">false</config:config-item>
		<config:config-item config:name="ApplyParagraphMarkFormatToNumbering" config:type="boolean">false</config:config-item>
		<config:config-item config:name="PropLineSpacingShrinksFirstLine" config:type="boolean">true</config:config-item>
		<config:config-item config:name="SubtractFlysAnchoredAtFlys" config:type="boolean">false</config:config-item>
		<config:config-item config:name="DisableOffPagePositioning" config:type="boolean">false</config:config-item>
		<config:config-item config:name="ContinuousEndnotes" config:type="boolean">false</config:config-item>
		<config:config-item config:name="PrintAnnotationMode" config:type="short">0</config:config-item>
		<config:config-item config:name="PrintGraphics" config:type="boolean">true</config:config-item>
		<config:config-item config:name="PrintBlackFonts" config:type="boolean">false</config:config-item>
		<config:config-item config:name="PrintProspect" config:type="boolean">false</config:config-item>
		<config:config-item config:name="PrintLeftPages" config:type="boolean">true</config:config-item>
		<config:config-item config:name="PrintControls" config:type="boolean">true</config:config-item>
		<config:config-item config:name="PrintPageBackground" config:type="boolean">true</config:config-item>
		<config:config-item config:name="PrintTextPlaceholder" config:type="boolean">false</config:config-item>
		<config:config-item config:name="PrintDrawings" config:type="boolean">true</config:config-item>
		<config:config-item config:name="PrintHiddenText" config:type="boolean">false</config:config-item>
		<config:config-item config:name="PrintTables" config:type="boolean">true</config:config-item>
		<config:config-item config:name="PrintProspectRTL" config:type="boolean">false</config:config-item>
		<config:config-item config:name="PrintReversed" config:type="boolean">false</config:config-item>
		<config:config-item config:name="PrintRightPages" config:type="boolean">true</config:config-item>
		<config:config-item config:name="PrintFaxName" config:type="string"/>
		<config:config-item config:name="PrintPaperFromSetup" config:type="boolean">false</config:config-item>
		<config:config-item config:name="PrintEmptyPages" config:type="boolean">true</config:config-item>
		</config:config-item-set>
	</office:settings>
	<office:scripts>
		<office:script script:language="ooo:Basic">
		<ooo:libraries xmlns:ooo="http://openoffice.org/2004/office" xmlns:xlink="http://www.w3.org/1999/xlink">
			<ooo:library-embedded ooo:name="Standard"/>
		</ooo:libraries>
		</office:script>
	</office:scripts>
	<office:font-face-decls>
		<style:font-face style:name="OpenSymbol" svg:font-family="OpenSymbol" style:font-charset="x-symbol"/>
		<style:font-face style:name="Arial2" svg:font-family="Arial" style:font-family-generic="swiss"/>
		<style:font-face style:name="Liberation Serif" svg:font-family="&apos;Liberation Serif&apos;" style:font-family-generic="roman" style:font-pitch="variable"/>
		<style:font-face style:name="Arial" svg:font-family="Arial" style:font-family-generic="swiss" style:font-pitch="variable"/>
		<style:font-face style:name="Liberation Sans" svg:font-family="&apos;Liberation Sans&apos;" style:font-family-generic="swiss" style:font-pitch="variable"/>
		<style:font-face style:name="Arial1" svg:font-family="Arial" style:font-family-generic="system" style:font-pitch="variable"/>
		<style:font-face style:name="Microsoft YaHei" svg:font-family="&apos;Microsoft YaHei&apos;" style:font-family-generic="system" style:font-pitch="variable"/>
		<style:font-face style:name="NSimSun" svg:font-family="NSimSun" style:font-family-generic="system" style:font-pitch="variable"/>
	</office:font-face-decls>
	`;

	var automaticStyles = `<office:automatic-styles>
  <style:style style:name="Table1" style:family="table" style:master-page-name="">
   <style:table-properties style:width="20.701cm" style:page-number="auto" table:align="left"/>
  </style:style>
  <style:style style:name="Table1.A" style:family="table-column">
   <style:table-column-properties style:column-width="4.403cm"/>
  </style:style>
  <style:style style:name="Table1.B" style:family="table-column">
   <style:table-column-properties style:column-width="14.288cm"/>
  </style:style>
  <style:style style:name="Table1.C" style:family="table-column">
   <style:table-column-properties style:column-width="2.011cm"/>
  </style:style>
  <style:style style:name="Table1.A1" style:family="table-cell">
   <style:table-cell-properties fo:padding="0.097cm" fo:border="none"/>
  </style:style>
  <style:style style:name="Table1.B1" style:family="table-cell">
   <style:table-cell-properties fo:background-color="transparent" fo:padding="0.097cm" fo:border="none">
    <style:background-image/>
   </style:table-cell-properties>
  </style:style>
  <style:style style:name="Table1.C1" style:family="table-cell">
   <style:table-cell-properties fo:background-color="transparent" fo:padding="0.097cm" fo:border="none">
    <style:background-image/>
   </style:table-cell-properties>
  </style:style>
  <style:style style:name="Table1.B2" style:family="table-cell">
   <style:table-cell-properties fo:background-color="transparent" fo:padding="0.097cm" fo:border-left="0.5pt solid #ffbf00" fo:border-right="none" fo:border-top="none" fo:border-bottom="0.5pt solid #ffbf00">
    <style:background-image/>
   </style:table-cell-properties>
  </style:style>
  <style:style style:name="Table1.B3" style:family="table-cell">
   <style:table-cell-properties fo:background-color="transparent" fo:padding="0.097cm" fo:border-left="0.5pt solid #ff0000" fo:border-right="none" fo:border-top="none" fo:border-bottom="0.5pt solid #ff0000">
    <style:background-image/>
   </style:table-cell-properties>
  </style:style>
  <style:style style:name="P1" style:family="paragraph" style:parent-style-name="Standard">
   <style:paragraph-properties fo:text-align="center" style:justify-single-word="false"/>
  </style:style>
  <style:style style:name="P2" style:family="paragraph" style:parent-style-name="Standard">
   <style:text-properties style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P3" style:family="paragraph" style:parent-style-name="Standard">
   <style:text-properties style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" officeooo:paragraph-rsid="000d609d" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P4" style:family="paragraph" style:parent-style-name="Standard">
   <style:text-properties style:font-name="Arial" fo:font-size="12pt" fo:font-weight="normal" officeooo:rsid="000b54b6" officeooo:paragraph-rsid="000b54b6" style:font-size-asian="12pt" style:font-weight-asian="normal" style:font-size-complex="12pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P5" style:family="paragraph" style:parent-style-name="Standard">
   <style:text-properties officeooo:paragraph-rsid="000b54b6"/>
  </style:style>
  <style:style style:name="P6" style:family="paragraph" style:parent-style-name="Standard">
   <style:paragraph-properties fo:text-align="end" style:justify-single-word="false"/>
   <style:text-properties fo:color="#ff8000"/>
  </style:style>
  <style:style style:name="P7" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill="none" draw:fill-color="#ffffff"/>
   <style:paragraph-properties fo:text-align="end" style:justify-single-word="false" fo:background-color="transparent"/>
   <style:text-properties fo:color="#ff8000" style:font-name="Arial" fo:font-size="10pt" fo:font-weight="bold" style:font-size-asian="10pt" style:font-weight-asian="bold" style:font-size-complex="10pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P8" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill-color="#ffff00"/>
  </style:style>
  <style:style style:name="P9" style:family="paragraph" style:parent-style-name="Standard">
   <style:paragraph-properties fo:text-align="end" style:justify-single-word="false"/>
  </style:style>
  <style:style style:name="P10" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill="none" draw:fill-color="#ffffff"/>
   <style:paragraph-properties fo:text-align="center" style:justify-single-word="false" fo:background-color="transparent" style:writing-mode="lr-tb"/>
   <style:text-properties style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P11" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill="none" draw:fill-color="#ffffff"/>
   <style:paragraph-properties fo:text-align="end" style:justify-single-word="false" fo:background-color="transparent" style:writing-mode="lr-tb"/>
   <style:text-properties fo:color="#ff8000" style:font-name="Arial" fo:font-size="10pt" fo:font-weight="bold" style:font-size-asian="10pt" style:font-weight-asian="bold" style:font-size-complex="10pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P12" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:paragraph-properties fo:line-height="115%"/>
   <style:text-properties officeooo:rsid="000b54b6" officeooo:paragraph-rsid="000b54b6"/>
  </style:style>
  <style:style style:name="P13" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:text-properties officeooo:paragraph-rsid="000b54b6"/>
  </style:style>
  <style:style style:name="P14" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:paragraph-properties fo:line-height="115%"/>
   <style:text-properties style:font-name="Arial" officeooo:rsid="000b54b6" officeooo:paragraph-rsid="000b54b6"/>
  </style:style>
  <style:style style:name="P15" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:paragraph-properties fo:text-align="center" style:justify-single-word="false"/>
   <style:text-properties fo:color="#999999" style:font-name="Arial" officeooo:rsid="0014631b" officeooo:paragraph-rsid="0014631b"/>
  </style:style>
  <style:style style:name="P16" style:family="paragraph" style:parent-style-name="Standard">
   <style:paragraph-properties fo:margin-top="0.101cm" fo:margin-bottom="0.101cm" loext:contextual-spacing="false" fo:line-height="200%" fo:break-before="page"/>
   <style:text-properties style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" officeooo:rsid="000b54b6" officeooo:paragraph-rsid="000b54b6" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P17" style:family="paragraph" style:parent-style-name="Standard">
   <style:paragraph-properties fo:margin-top="0.201cm" fo:margin-bottom="0.201cm" loext:contextual-spacing="false" fo:line-height="150%" fo:break-before="page"/>
   <style:text-properties style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" officeooo:rsid="000b54b6" officeooo:paragraph-rsid="000cedc1" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P18" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-indent="0cm" style:auto-text-indent="false" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties style:font-name="Arial" fo:font-size="12pt" fo:font-weight="normal" officeooo:rsid="000d609d" officeooo:paragraph-rsid="000e2863" style:font-size-asian="10.5pt" style:font-weight-asian="normal" style:font-size-complex="12pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P19" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-indent="0cm" style:auto-text-indent="false" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties style:font-name="Arial" fo:font-size="12pt" fo:font-weight="normal" officeooo:rsid="000d609d" officeooo:paragraph-rsid="001157b9" style:font-size-asian="10.5pt" style:font-weight-asian="normal" style:font-size-complex="12pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P20" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-indent="0cm" style:auto-text-indent="false" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties style:font-name="Arial" fo:font-size="12pt" fo:font-weight="normal" officeooo:rsid="000d609d" officeooo:paragraph-rsid="0013477b" style:font-size-asian="10.5pt" style:font-weight-asian="normal" style:font-size-complex="12pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P21" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-align="end" style:justify-single-word="false" fo:text-indent="0cm" style:auto-text-indent="false" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties fo:color="#999999" style:font-name="Arial" fo:font-size="10pt" fo:font-weight="normal" officeooo:rsid="001928ce" officeooo:paragraph-rsid="001928ce" style:font-size-asian="10pt" style:font-weight-asian="normal" style:font-size-complex="10pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P22" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-align="start" style:justify-single-word="false" fo:text-indent="0cm" style:auto-text-indent="false" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties fo:color="#999999" style:font-name="Arial" fo:font-size="10pt" fo:font-weight="normal" officeooo:rsid="001928ce" officeooo:paragraph-rsid="001928ce" style:font-size-asian="10pt" style:font-weight-asian="normal" style:font-size-complex="10pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P23" style:family="paragraph" style:parent-style-name="Standard" style:master-page-name="">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-indent="0cm" style:auto-text-indent="false" style:page-number="auto" fo:break-before="page" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties style:font-name="Arial" fo:font-size="12pt" fo:font-weight="normal" officeooo:rsid="000d609d" officeooo:paragraph-rsid="000e2863" style:font-size-asian="10.5pt" style:font-weight-asian="normal" style:font-size-complex="12pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P24" style:family="paragraph" style:parent-style-name="Standard" style:master-page-name="">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-indent="0cm" style:auto-text-indent="false" style:page-number="auto" fo:break-before="page" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties style:font-name="Arial" fo:font-size="12pt" fo:font-weight="normal" officeooo:rsid="000d609d" officeooo:paragraph-rsid="001157b9" style:font-size-asian="10.5pt" style:font-weight-asian="normal" style:font-size-complex="12pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P25" style:family="paragraph" style:parent-style-name="Standard" style:master-page-name="">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-indent="0cm" style:auto-text-indent="false" style:page-number="auto" fo:break-before="page" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties style:font-name="Arial" fo:font-size="12pt" fo:font-weight="normal" officeooo:rsid="000d609d" officeooo:paragraph-rsid="0013477b" style:font-size-asian="10.5pt" style:font-weight-asian="normal" style:font-size-complex="12pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P26" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0.201cm" fo:margin-bottom="0.201cm" loext:contextual-spacing="false" fo:line-height="150%" fo:text-indent="0cm" style:auto-text-indent="false" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" officeooo:rsid="000b54b6" officeooo:paragraph-rsid="0013db33" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P27" style:family="paragraph" style:parent-style-name="Standard" style:master-page-name="">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0.201cm" fo:margin-bottom="0.201cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-indent="0cm" style:auto-text-indent="false" style:page-number="auto" fo:break-before="page" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" officeooo:rsid="000b54b6" officeooo:paragraph-rsid="0013db33" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P28" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:paragraph-properties fo:text-align="center" style:justify-single-word="false"/>
   <style:text-properties style:font-name="Arial" officeooo:rsid="001bca1b" officeooo:paragraph-rsid="001bca1b"/>
  </style:style>
  <style:style style:name="P29" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:paragraph-properties fo:text-align="center" style:justify-single-word="false"/>
   <style:text-properties fo:color="#808080" style:font-name="Arial" fo:font-size="10pt" officeooo:rsid="001bdec0" officeooo:paragraph-rsid="001bdec0" style:font-size-asian="10pt" style:font-size-complex="10pt"/>
  </style:style>
  <style:style style:name="P30" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:paragraph-properties fo:text-align="start" style:justify-single-word="false"/>
   <style:text-properties officeooo:rsid="001bdec0" officeooo:paragraph-rsid="001bdec0"/>
  </style:style>
  <style:style style:name="P31" style:family="paragraph" style:parent-style-name="Standard">
   <style:text-properties style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" officeooo:paragraph-rsid="000d609d" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P32" style:family="paragraph" style:parent-style-name="Standard">
   <style:text-properties style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" officeooo:rsid="001a709a" officeooo:paragraph-rsid="001a709a" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P33" style:family="paragraph" style:parent-style-name="Standard">
   <style:text-properties style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" officeooo:rsid="001bca1b" officeooo:paragraph-rsid="001bca1b" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P34" style:family="paragraph" style:parent-style-name="Standard" style:master-page-name="">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-indent="0cm" style:auto-text-indent="false" style:page-number="auto" fo:break-before="page" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties style:font-name="Arial" fo:font-size="12pt" fo:font-weight="normal" officeooo:rsid="000d609d" officeooo:paragraph-rsid="000e2863" style:font-size-asian="10.5pt" style:font-weight-asian="normal" style:font-size-complex="12pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P35" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-indent="0cm" style:auto-text-indent="false" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties style:font-name="Arial" fo:font-size="12pt" fo:font-weight="normal" officeooo:rsid="000d609d" officeooo:paragraph-rsid="000e2863" style:font-size-asian="10.5pt" style:font-weight-asian="normal" style:font-size-complex="12pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P36" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-indent="0cm" style:auto-text-indent="false" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties style:font-name="Arial" fo:font-size="12pt" fo:font-weight="normal" officeooo:rsid="000d609d" officeooo:paragraph-rsid="0013477b" style:font-size-asian="10.5pt" style:font-weight-asian="normal" style:font-size-complex="12pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P37" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-align="end" style:justify-single-word="false" fo:text-indent="0cm" style:auto-text-indent="false" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties fo:color="#999999" style:font-name="Arial" fo:font-size="10pt" fo:font-weight="normal" officeooo:rsid="001928ce" officeooo:paragraph-rsid="001928ce" style:font-size-asian="10pt" style:font-weight-asian="normal" style:font-size-complex="10pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P38" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-align="start" style:justify-single-word="false" fo:text-indent="0cm" style:auto-text-indent="false" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties fo:color="#999999" style:font-name="Arial" fo:font-size="10pt" fo:font-weight="normal" officeooo:rsid="001928ce" officeooo:paragraph-rsid="001928ce" style:font-size-asian="10pt" style:font-weight-asian="normal" style:font-size-complex="10pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P39" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-align="end" style:justify-single-word="false" fo:text-indent="0cm" style:auto-text-indent="false" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties fo:color="#808080" style:font-name="Arial" fo:font-size="10pt" fo:font-weight="normal" officeooo:rsid="001928ce" officeooo:paragraph-rsid="001928ce" style:font-size-asian="10pt" style:font-weight-asian="normal" style:font-size-complex="10pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P40" style:family="paragraph" style:parent-style-name="Standard" style:master-page-name="">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false" fo:line-height="100%" fo:text-indent="0cm" style:auto-text-indent="false" style:page-number="auto" fo:break-before="page" fo:background-color="transparent">
    <style:tab-stops>
     <style:tab-stop style:position="0.318cm"/>
    </style:tab-stops>
   </style:paragraph-properties>
   <style:text-properties style:font-name="Arial" fo:font-size="12pt" fo:font-weight="normal" officeooo:rsid="000d609d" officeooo:paragraph-rsid="000e2863" style:font-size-asian="10.5pt" style:font-weight-asian="normal" style:font-size-complex="12pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P41" style:family="paragraph" style:parent-style-name="Standard">
   <style:paragraph-properties fo:break-before="page"/>
   <style:text-properties style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" officeooo:rsid="001a709a" officeooo:paragraph-rsid="001a709a" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P42" style:family="paragraph" style:parent-style-name="Table_20_Contents">
   <style:text-properties style:font-name="Arial" fo:font-size="12pt" style:font-size-asian="12pt" style:font-size-complex="12pt"/>
  </style:style>
  <style:style style:name="P43" style:family="paragraph" style:parent-style-name="Table_20_Contents">
   <style:text-properties fo:color="#808080" style:font-name="Arial" fo:font-size="12pt" officeooo:rsid="001bca1b" officeooo:paragraph-rsid="001bca1b" style:font-size-asian="12pt" style:font-size-complex="12pt"/>
  </style:style>
  <style:style style:name="P44" style:family="paragraph" style:parent-style-name="Table_20_Contents">
   <loext:graphic-properties draw:fill="none"/>
   <style:paragraph-properties fo:margin-left="0cm" fo:margin-right="0.3cm" fo:text-align="end" style:justify-single-word="false" fo:text-indent="0cm" style:auto-text-indent="false" fo:background-color="transparent" text:number-lines="false" text:line-number="0"/>
   <style:text-properties fo:color="#808080" style:font-name="Arial" fo:font-size="12pt" officeooo:rsid="001a709a" officeooo:paragraph-rsid="001a709a" style:font-size-asian="12pt" style:font-size-complex="12pt"/>
  </style:style>
  <style:style style:name="P45" style:family="paragraph" style:parent-style-name="Table_20_Contents">
   <style:paragraph-properties fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false"/>
   <style:text-properties style:font-name="Arial" fo:font-size="12pt" style:font-size-asian="12pt" style:font-size-complex="12pt"/>
  </style:style>
  <style:style style:name="P46" style:family="paragraph" style:parent-style-name="Table_20_Contents">
   <style:paragraph-properties fo:margin-top="0cm" fo:margin-bottom="0cm" loext:contextual-spacing="false"/>
   <style:text-properties fo:color="#808080" style:font-name="Arial" fo:font-size="12pt" officeooo:rsid="001bca1b" officeooo:paragraph-rsid="001bca1b" style:font-size-asian="12pt" style:font-size-complex="12pt"/>
  </style:style>
  <style:style style:name="P47" style:family="paragraph">
   <style:paragraph-properties fo:text-align="end"/>
  </style:style>
  <style:style style:name="P48" style:family="paragraph">
   <loext:graphic-properties draw:fill="none" draw:fill-color="#ffffff"/>
   <style:paragraph-properties fo:text-align="end" style:writing-mode="lr-tb"/>
   <style:text-properties fo:color="#ff8000" style:font-name="Arial" fo:font-size="10pt" fo:font-weight="bold" style:font-size-asian="10pt" style:font-weight-asian="bold" style:font-size-complex="10pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P49" style:family="paragraph">
   <style:paragraph-properties fo:text-align="center"/>
  </style:style>
  <style:style style:name="P50" style:family="paragraph">
   <loext:graphic-properties draw:fill-color="#ff6d6d"/>
  </style:style>
  <style:style style:name="P51" style:family="paragraph">
   <loext:graphic-properties draw:fill-color="#ffde59"/>
  </style:style>
  <style:style style:name="P52" style:family="paragraph">
   <loext:graphic-properties draw:fill-color="#77bc65"/>
  </style:style>
  <style:style style:name="P53" style:family="paragraph">
   <loext:graphic-properties draw:fill-color="#ffff00"/>
  </style:style>
  <style:style style:name="P54" style:family="paragraph">
   <loext:graphic-properties draw:fill="none" draw:fill-color="#ffffff"/>
   <style:paragraph-properties fo:text-align="center" style:writing-mode="lr-tb"/>
   <style:text-properties style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="T1" style:family="text">
   <style:text-properties style:font-name="Arial"/>
  </style:style>
  <style:style style:name="T2" style:family="text">
   <style:text-properties style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="T3" style:family="text">
   <style:text-properties style:font-name="Arial" fo:font-size="12pt" fo:font-weight="normal" officeooo:rsid="000b54b6" style:font-size-asian="12pt" style:font-weight-asian="normal" style:font-size-complex="12pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="T4" style:family="text">
   <style:text-properties style:font-name="Arial" officeooo:rsid="000c4700"/>
  </style:style>
  <style:style style:name="T5" style:family="text">
   <style:text-properties fo:color="#ff8000" style:font-name="Arial" fo:font-size="10pt" fo:font-weight="bold" style:font-size-asian="10pt" style:font-weight-asian="bold" style:font-size-complex="10pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="T6" style:family="text">
   <style:text-properties officeooo:rsid="000e2863"/>
  </style:style>
  <style:style style:name="T7" style:family="text">
   <style:text-properties officeooo:rsid="000f3bd8"/>
  </style:style>
  <style:style style:name="T8" style:family="text">
   <style:text-properties officeooo:rsid="00104787"/>
  </style:style>
  <style:style style:name="T9" style:family="text">
   <style:text-properties officeooo:rsid="001134f1"/>
  </style:style>
  <style:style style:name="T10" style:family="text">
   <style:text-properties officeooo:rsid="001bdec0"/>
  </style:style>
  <style:style style:name="fr1" style:family="graphic" style:parent-style-name="Frame">
   <style:graphic-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm" style:wrap="parallel" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="middle" style:vertical-rel="baseline" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" fo:padding="0cm" fo:border="none" draw:wrap-influence-on-position="once-concurrent" loext:allow-overlap="true"/>
  </style:style>
  <style:style style:name="fr2" style:family="graphic" style:parent-style-name="Frame">
   <style:graphic-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0.199cm" fo:margin-bottom="0.199cm" style:wrap="parallel" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="from-top" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" fo:padding="0cm" fo:border="none" draw:wrap-influence-on-position="once-concurrent" loext:allow-overlap="true">
    <style:columns fo:column-count="1" fo:column-gap="0cm"/>
   </style:graphic-properties>
  </style:style>
  <style:style style:name="fr3" style:family="graphic" style:parent-style-name="Frame">
   <style:graphic-properties style:run-through="foreground" style:wrap="dynamic" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="from-top" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" fo:padding="0.15cm" fo:border="none"/>
  </style:style>
  <style:style style:name="fr4" style:family="graphic" style:parent-style-name="Frame">
   <style:graphic-properties style:wrap="parallel" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="middle" style:vertical-rel="baseline" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" fo:padding="0.15cm" fo:border="none"/>
  </style:style>
  <style:style style:name="fr5" style:family="graphic" style:parent-style-name="Graphics">
   <style:graphic-properties style:run-through="foreground" style:wrap="right" style:number-wrapped-paragraphs="no-limit" style:wrap-contour="false" style:vertical-pos="from-top" style:vertical-rel="paragraph" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" style:mirror="none" fo:clip="rect(0cm, 0cm, 0cm, 0cm)" draw:luminance="0%" draw:contrast="0%" draw:red="0%" draw:green="0%" draw:blue="0%" draw:gamma="100%" draw:color-inversion="false" draw:image-opacity="100%" draw:color-mode="standard"/>
  </style:style>
  <style:style style:name="fr6" style:family="graphic" style:parent-style-name="Graphics">
   <style:graphic-properties style:vertical-pos="top" style:vertical-rel="paragraph" style:horizontal-pos="center" style:horizontal-rel="paragraph" style:mirror="none" fo:clip="rect(0cm, 0cm, 0cm, 0cm)" draw:luminance="0%" draw:contrast="0%" draw:red="0%" draw:green="0%" draw:blue="0%" draw:gamma="100%" draw:color-inversion="false" draw:image-opacity="100%" draw:color-mode="standard"/>
  </style:style>
  <style:style style:name="fr7" style:family="graphic" style:parent-style-name="Graphics">
   <style:graphic-properties style:horizontal-pos="center" style:horizontal-rel="paragraph" style:mirror="none" fo:clip="rect(0cm, 0cm, 0cm, 0cm)" draw:luminance="0%" draw:contrast="0%" draw:red="0%" draw:green="0%" draw:blue="0%" draw:gamma="100%" draw:color-inversion="false" draw:image-opacity="100%" draw:color-mode="standard"/>
  </style:style>
  <style:style style:name="fr8" style:family="graphic" style:parent-style-name="Graphics">
   <style:graphic-properties style:vertical-pos="middle" style:vertical-rel="baseline" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" style:mirror="none" fo:clip="rect(0cm, 0cm, 0cm, 0cm)" draw:luminance="0%" draw:contrast="0%" draw:red="0%" draw:green="0%" draw:blue="0%" draw:gamma="100%" draw:color-inversion="false" draw:image-opacity="100%" draw:color-mode="standard"/>
  </style:style>
  <style:style style:name="fr9" style:family="graphic" style:parent-style-name="Graphics">
   <style:graphic-properties style:run-through="foreground" style:wrap="dynamic" style:number-wrapped-paragraphs="no-limit" style:wrap-contour="false" style:vertical-pos="from-top" style:vertical-rel="paragraph" style:horizontal-pos="center" style:horizontal-rel="paragraph" style:mirror="none" fo:clip="rect(0cm, 0cm, 0cm, 0cm)" draw:luminance="0%" draw:contrast="0%" draw:red="0%" draw:green="0%" draw:blue="0%" draw:gamma="100%" draw:color-inversion="false" draw:image-opacity="100%" draw:color-mode="standard"/>
  </style:style>
  <style:style style:name="gr1" style:family="graphic">
   <style:graphic-properties draw:stroke="none" svg:stroke-color="#000000" draw:fill="none" draw:fill-color="#ffffff" fo:min-height="0.478cm" style:run-through="foreground" style:wrap="left" style:number-wrapped-paragraphs="no-limit" style:wrap-contour="true" style:wrap-contour-mode="full" style:vertical-pos="from-top" style:vertical-rel="paragraph" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" draw:wrap-influence-on-position="once-concurrent" loext:allow-overlap="true" style:flow-with-text="false"/>
   <style:paragraph-properties style:writing-mode="lr-tb"/>
  </style:style>
  <style:style style:name="gr2" style:family="graphic">
   <style:graphic-properties svg:stroke-color="#000000" draw:textarea-horizontal-align="center" draw:textarea-vertical-align="middle" style:run-through="foreground" style:wrap="run-through" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="from-top" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" draw:wrap-influence-on-position="once-concurrent" loext:allow-overlap="true" style:flow-with-text="false"/>
  </style:style>
  <style:style style:name="gr3" style:family="graphic">
   <style:graphic-properties draw:stroke="none" draw:fill-color="#ff6d6d" draw:textarea-horizontal-align="justify" draw:textarea-vertical-align="middle" draw:auto-grow-height="false" fo:min-height="0.699cm" fo:min-width="9.885cm" style:run-through="foreground" style:wrap="run-through" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="from-top" style:vertical-rel="paragraph" style:horizontal-pos="from-left" style:horizontal-rel="paragraph"/>
  </style:style>
  <style:style style:name="gr4" style:family="graphic">
   <style:graphic-properties draw:stroke="none" draw:fill-color="#ffde59" draw:textarea-horizontal-align="justify" draw:textarea-vertical-align="middle" draw:auto-grow-height="false" fo:min-height="0.699cm" fo:min-width="1.609cm" style:run-through="foreground" style:wrap="run-through" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="from-top" style:vertical-rel="paragraph" style:horizontal-pos="from-left" style:horizontal-rel="paragraph"/>
  </style:style>
  <style:style style:name="gr5" style:family="graphic">
   <style:graphic-properties draw:stroke="none" draw:fill-color="#77bc65" draw:textarea-horizontal-align="justify" draw:textarea-vertical-align="middle" draw:auto-grow-height="false" fo:min-height="0.699cm" fo:min-width="4.763cm" style:run-through="foreground" style:wrap="run-through" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="from-top" style:vertical-rel="paragraph" style:horizontal-pos="from-left" style:horizontal-rel="paragraph"/>
  </style:style>
  <style:style style:name="gr6" style:family="graphic">
   <style:graphic-properties draw:stroke="none" draw:fill-color="#ffff00" draw:textarea-horizontal-align="justify" draw:textarea-vertical-align="middle" draw:auto-grow-height="false" fo:min-height="0.323cm" fo:min-width="20.862cm" style:run-through="foreground" style:wrap="run-through" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="middle" style:vertical-rel="baseline" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" draw:wrap-influence-on-position="once-concurrent" loext:allow-overlap="true" style:flow-with-text="false"/>
  </style:style>
  <style:style style:name="gr7" style:family="graphic">
   <style:graphic-properties draw:stroke="none" svg:stroke-color="#000000" draw:fill="none" draw:fill-color="#ffffff" fo:min-height="0.995cm" style:run-through="foreground" style:wrap="run-through" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="from-top" style:vertical-rel="paragraph" style:horizontal-pos="center" style:horizontal-rel="paragraph" draw:wrap-influence-on-position="once-concurrent" loext:allow-overlap="true" style:flow-with-text="false"/>
   <style:paragraph-properties style:writing-mode="lr-tb"/>
  </style:style>
  <style:page-layout style:name="pm1">
   <style:page-layout-properties fo:page-width="21.59cm" fo:page-height="27.94cm" style:num-format="1" style:print-orientation="portrait" fo:margin-top="0.305cm" fo:margin-bottom="0.305cm" fo:margin-left="0.305cm" fo:margin-right="0.305cm" style:writing-mode="lr-tb" style:layout-grid-color="#c0c0c0" style:layout-grid-lines="20" style:layout-grid-base-height="0.706cm" style:layout-grid-ruby-height="0.353cm" style:layout-grid-mode="none" style:layout-grid-ruby-below="false" style:layout-grid-print="false" style:layout-grid-display="false" style:footnote-max-height="0cm">
    <style:footnote-sep style:width="0.018cm" style:distance-before-sep="0.101cm" style:distance-after-sep="0.101cm" style:line-style="solid" style:adjustment="left" style:rel-width="25%" style:color="#000000"/>
   </style:page-layout-properties>
   <style:header-style/>
   <style:footer-style/>
  </style:page-layout>
`;

	var automaticStylesEnd = ` </office:automatic-styles>
	<office:master-styles>
	<style:master-page style:name="Standard" style:page-layout-name="pm1"/>
	</office:master-styles>
	`;

	var xml = `<office:body>
	<office:text text:use-soft-page-breaks="true">
	<office:forms form:automatic-focus="false" form:apply-design-mode="false"/>
	<text:sequence-decls>
		<text:sequence-decl text:display-outline-level="0" text:name="Illustration"/>
		<text:sequence-decl text:display-outline-level="0" text:name="Table"/>
		<text:sequence-decl text:display-outline-level="0" text:name="Text"/>
		<text:sequence-decl text:display-outline-level="0" text:name="Drawing"/>
		<text:sequence-decl text:display-outline-level="0" text:name="Figure"/>
	</text:sequence-decls>
	`;

	var footer = `</office:text>
	</office:body>
	</office:document>
	`;

	var styles = ` <office:styles>
	<style:default-style style:family="graphic">
	<style:graphic-properties svg:stroke-color="#3465a4" draw:fill-color="#729fcf" fo:wrap-option="no-wrap" draw:shadow-offset-x="8.5pt" draw:shadow-offset-y="8.5pt" draw:start-line-spacing-horizontal="8.02pt" draw:start-line-spacing-vertical="8.02pt" draw:end-line-spacing-horizontal="8.02pt" draw:end-line-spacing-vertical="8.02pt" style:flow-with-text="false"/>
	<style:paragraph-properties style:text-autospace="ideograph-alpha" style:line-break="strict" style:font-independent-line-spacing="false">
		<style:tab-stops/>
	</style:paragraph-properties>
	<style:text-properties style:use-window-font-color="true" style:font-name="Liberation Serif" fo:font-size="12pt" fo:language="en" fo:country="US" style:letter-kerning="true" style:font-name-asian="NSimSun" style:font-size-asian="10.5pt" style:language-asian="zh" style:country-asian="CN" style:font-name-complex="Arial1" style:font-size-complex="12pt" style:language-complex="hi" style:country-complex="IN"/>
	</style:default-style>
	<style:default-style style:family="paragraph">
	<style:paragraph-properties fo:orphans="2" fo:widows="2" fo:hyphenation-ladder-count="no-limit" style:text-autospace="ideograph-alpha" style:punctuation-wrap="hanging" style:line-break="strict" style:tab-stop-distance="35.46pt" style:writing-mode="page"/>
	<style:text-properties style:use-window-font-color="true" style:font-name="Liberation Serif" fo:font-size="12pt" fo:language="en" fo:country="US" style:letter-kerning="true" style:font-name-asian="NSimSun" style:font-size-asian="10.5pt" style:language-asian="zh" style:country-asian="CN" style:font-name-complex="Arial1" style:font-size-complex="12pt" style:language-complex="hi" style:country-complex="IN" fo:hyphenate="false" fo:hyphenation-remain-char-count="2" fo:hyphenation-push-char-count="2" loext:hyphenation-no-caps="false"/>
	</style:default-style>
	<style:default-style style:family="table">
	<style:table-properties table:border-model="collapsing"/>
	</style:default-style>
	<style:default-style style:family="table-row">
	<style:table-row-properties fo:keep-together="auto"/>
	</style:default-style>
	<style:style style:name="Standard" style:family="paragraph" style:class="text"/>
	<style:style style:name="Heading" style:family="paragraph" style:parent-style-name="Standard" style:next-style-name="Text_20_body" style:class="text">
	<style:paragraph-properties fo:margin-top="11.99pt" fo:margin-bottom="6.01pt" loext:contextual-spacing="false" fo:keep-with-next="always"/>
	<style:text-properties style:font-name="Liberation Sans" fo:font-family="&apos;Liberation Sans&apos;" style:font-family-generic="swiss" style:font-pitch="variable" fo:font-size="14pt" style:font-name-asian="Microsoft YaHei" style:font-family-asian="&apos;Microsoft YaHei&apos;" style:font-family-generic-asian="system" style:font-pitch-asian="variable" style:font-size-asian="14pt" style:font-name-complex="Arial1" style:font-family-complex="Arial" style:font-family-generic-complex="system" style:font-pitch-complex="variable" style:font-size-complex="14pt"/>
	</style:style>
	<style:style style:name="Text_20_body" style:display-name="Text body" style:family="paragraph" style:parent-style-name="Standard" style:class="text">
	<style:paragraph-properties fo:margin-top="0pt" fo:margin-bottom="7pt" loext:contextual-spacing="false" fo:line-height="115%"/>
	</style:style>
	<style:style style:name="List" style:family="paragraph" style:parent-style-name="Text_20_body" style:class="list">
	<style:text-properties style:font-size-asian="12pt" style:font-name-complex="Arial2" style:font-family-complex="Arial" style:font-family-generic-complex="swiss"/>
	</style:style>
	<style:style style:name="Caption" style:family="paragraph" style:parent-style-name="Standard" style:class="extra">
	<style:paragraph-properties fo:margin-top="6.01pt" fo:margin-bottom="6.01pt" loext:contextual-spacing="false" text:number-lines="false" text:line-number="0"/>
	<style:text-properties fo:font-size="12pt" fo:font-style="italic" style:font-size-asian="12pt" style:font-style-asian="italic" style:font-name-complex="Arial2" style:font-family-complex="Arial" style:font-family-generic-complex="swiss" style:font-size-complex="12pt" style:font-style-complex="italic"/>
	</style:style>
	<style:style style:name="Index" style:family="paragraph" style:parent-style-name="Standard" style:class="index">
	<style:paragraph-properties text:number-lines="false" text:line-number="0"/>
	<style:text-properties style:font-size-asian="12pt" style:font-name-complex="Arial2" style:font-family-complex="Arial" style:font-family-generic-complex="swiss"/>
	</style:style>
	<style:style style:name="Frame_20_contents" style:display-name="Frame contents" style:family="paragraph" style:parent-style-name="Standard" style:class="extra"/>
	<style:style style:name="Bullet_20_Symbols" style:display-name="Bullet Symbols" style:family="text">
	<style:text-properties style:font-name="OpenSymbol" fo:font-family="OpenSymbol" style:font-charset="x-symbol" style:font-name-asian="OpenSymbol" style:font-family-asian="OpenSymbol" style:font-charset-asian="x-symbol" style:font-name-complex="OpenSymbol" style:font-family-complex="OpenSymbol" style:font-charset-complex="x-symbol"/>
	</style:style>
	<style:style style:name="Numbering_20_Symbols" style:display-name="Numbering Symbols" style:family="text"/>
	<style:style style:name="Graphics" style:family="graphic">
	<style:graphic-properties text:anchor-type="paragraph" svg:x="0pt" svg:y="0pt" style:wrap="dynamic" style:number-wrapped-paragraphs="no-limit" style:wrap-contour="false" style:vertical-pos="top" style:vertical-rel="paragraph" style:horizontal-pos="center" style:horizontal-rel="paragraph"/>
	</style:style>
	<style:style style:name="Frame" style:family="graphic">
	<style:graphic-properties text:anchor-type="paragraph" svg:x="0pt" svg:y="0pt" fo:margin-left="5.7pt" fo:margin-right="5.7pt" fo:margin-top="5.7pt" fo:margin-bottom="5.7pt" style:wrap="parallel" style:number-wrapped-paragraphs="no-limit" style:wrap-contour="false" style:vertical-pos="top" style:vertical-rel="paragraph-content" style:horizontal-pos="center" style:horizontal-rel="paragraph-content" fo:padding="4.25pt" fo:border="0.06pt solid #000000"/>
	</style:style>
	<text:outline-style style:name="Outline">
	<text:outline-level-style text:level="1" style:num-format="">
		<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">
		<style:list-level-label-alignment text:label-followed-by="listtab"/>
		</style:list-level-properties>
	</text:outline-level-style>
	<text:outline-level-style text:level="2" style:num-format="">
		<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">
		<style:list-level-label-alignment text:label-followed-by="listtab"/>
		</style:list-level-properties>
	</text:outline-level-style>
	<text:outline-level-style text:level="3" style:num-format="">
		<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">
		<style:list-level-label-alignment text:label-followed-by="listtab"/>
		</style:list-level-properties>
	</text:outline-level-style>
	<text:outline-level-style text:level="4" style:num-format="">
		<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">
		<style:list-level-label-alignment text:label-followed-by="listtab"/>
		</style:list-level-properties>
	</text:outline-level-style>
	<text:outline-level-style text:level="5" style:num-format="">
		<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">
		<style:list-level-label-alignment text:label-followed-by="listtab"/>
		</style:list-level-properties>
	</text:outline-level-style>
	<text:outline-level-style text:level="6" style:num-format="">
		<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">
		<style:list-level-label-alignment text:label-followed-by="listtab"/>
		</style:list-level-properties>
	</text:outline-level-style>
	<text:outline-level-style text:level="7" style:num-format="">
		<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">
		<style:list-level-label-alignment text:label-followed-by="listtab"/>
		</style:list-level-properties>
	</text:outline-level-style>
	<text:outline-level-style text:level="8" style:num-format="">
		<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">
		<style:list-level-label-alignment text:label-followed-by="listtab"/>
		</style:list-level-properties>
	</text:outline-level-style>
	<text:outline-level-style text:level="9" style:num-format="">
		<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">
		<style:list-level-label-alignment text:label-followed-by="listtab"/>
		</style:list-level-properties>
	</text:outline-level-style>
	<text:outline-level-style text:level="10" style:num-format="">
		<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">
		<style:list-level-label-alignment text:label-followed-by="listtab"/>
		</style:list-level-properties>
	</text:outline-level-style>
	</text:outline-style>
	<text:notes-configuration text:note-class="footnote" style:num-format="1" text:start-value="0" text:footnotes-position="page" text:start-numbering-at="document"/>
	<text:notes-configuration text:note-class="endnote" style:num-format="i" text:start-value="0"/>
	<text:linenumbering-configuration text:number-lines="false" text:offset="14.14pt" style:num-format="1" text:number-position="left" text:increment="5"/>
	</office:styles>
	`;

	return {
		header,
		automaticStyles,
		automaticStylesEnd,
		xml,
		footer,
		styles,
		getAutomaticStyles,
		addLevelStyles,
		addCover,
		addStatsTable,
		addRewards,
		addCategoryTitle,
		addImage,
		addSkillTitle,
		addSkillLevel,
		addSkillTimestamp,
		addToSkillFrame,
		addMediaFrame,
		addToMediaContainerFrame
	}
});