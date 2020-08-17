define([], function() {
	var conversionFactor = 0.0264;

	var getAutomaticStyles = function() {
		return automaticStyles;
	}

	var addBuddyStyles = function(colors) {
		automaticStyles += `
		<style:style style:name="buddyStroke" style:family="paragraph" style:parent-style-name="Frame_20_contents">
			<style:paragraph-properties fo:line-height="115%" fo:text-align="center" style:justify-single-word="false"/>
			<style:text-properties fo:color="${colors.stroke}" style:font-name="Arial" officeooo:rsid="0008f8b9" officeooo:paragraph-rsid="0008f8b9"/>
		</style:style>`;
		automaticStyles += `
		<style:style style:name="buddyFillHuge" style:family="paragraph" style:parent-style-name="Frame_20_contents">
			<style:paragraph-properties fo:line-height="115%" fo:text-align="center" style:justify-single-word="false"/>
			<style:text-properties fo:color="${colors.fill}" style:font-name="Arial" fo:font-size="36pt" fo:font-weight="bold" officeooo:rsid="0008f8b9" officeooo:paragraph-rsid="0008f8b9" style:font-size-asian="36pt" style:font-weight-asian="bold" style:font-size-complex="36pt" style:font-weight-complex="bold"/>
		</style:style>`;
	}

	var addQuestion = function(question) {
		return `<draw:frame draw:style-name="fr7" text:anchor-type="as-char" svg:width="20.701cm" draw:z-index="0">
		<draw:text-box fo:min-height="1.653cm">
		 <text:p text:style-name="P1">${question}</text:p>
		</draw:text-box>
	 </draw:frame>
	 `;
	}

	var addChartFrame = function(imageURL) {
		return `<draw:frame draw:style-name="fr9" text:anchor-type="paragraph" svg:y="0.168cm" svg:width="14.7cm" svg:height="10.5cm" draw:z-index="7"><draw:image loext:mime-type="image/jpeg">
		<office:binary-data>${imageURL.substring(imageURL.indexOf(',') + 1)}</office:binary-data>
	 </draw:image>
	</draw:frame>
	`;
	}

	var addAvgRatingFrame = function(averageValue) {
		return `<draw:frame draw:style-name="fr5" text:anchor-type="paragraph" svg:x="8.435cm" svg:y="11.146cm" svg:width="3.006cm" draw:z-index="8">
		<draw:text-box fo:min-height="2.457cm">
		 <text:p text:style-name="buddyFillHuge">${averageValue}</text:p>
		 <text:p text:style-name="buddyStroke">${app.$refs.SugarL10n.get('AverageRating')}</text:p>
		</draw:text-box>
	 </draw:frame>
		`;
	}

	var addLegendFrame = function(legendObj) {
		let style = `<style:style style:name="legend${legendObj.text}" style:family="graphic">
		<style:graphic-properties draw:stroke="none" draw:fill-color="${legendObj.color}" draw:textarea-horizontal-align="justify" draw:textarea-vertical-align="middle" draw:auto-grow-height="false" fo:min-height="0.229cm" fo:min-width="0.882cm" style:run-through="foreground" style:wrap="run-through" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="from-top" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" draw:wrap-influence-on-position="once-concurrent" loext:allow-overlap="true" style:flow-with-text="false"/>
	 </style:style>`;
		automaticStyles += style;

		return `<draw:frame draw:style-name="fr1" text:anchor-type="as-char" svg:width="3.119cm" draw:z-index="5">
		<draw:text-box fo:min-height="3.394cm">
		 <text:p text:style-name="P7">${legendObj.text} <text:s/><draw:custom-shape text:anchor-type="as-char" svg:y="-0.222cm" draw:z-index="10" draw:style-name="legend${legendObj.text}" svg:width="0.883cm" svg:height="0.23cm">
			 <text:p/>
			 <draw:enhanced-geometry svg:viewBox="0 0 21600 21600" draw:mirror-horizontal="false" draw:mirror-vertical="false" draw:type="rectangle" draw:enhanced-path="M 0 0 L 21600 0 21600 21600 0 21600 0 0 Z N"/>
			</draw:custom-shape></text:p>
		 <text:p text:style-name="P7"/>
		 <text:p text:style-name="P7"><draw:frame draw:style-name="fr8" text:anchor-type="as-char" svg:width="2.693cm" svg:height="${legendObj.height}cm" draw:z-index="9"><draw:image loext:mime-type="image/png">
				<office:binary-data>${legendObj.imageURL.substring(legendObj.imageURL.indexOf(',') + 1)}</office:binary-data>
			 </draw:image>
			</draw:frame></text:p>
		</draw:text-box>
	 </draw:frame>
		`;	
	}

	var addToChartInfoFrame = function(innerData) {
		return `<text:p text:style-name="P6">${innerData}</text:p>`;
	}

	var addToMainContainer = function(innerData) {
		return `<draw:frame draw:style-name="fr6" text:anchor-type="as-char" svg:width="20.133cm" draw:z-index="1">
		<draw:text-box fo:min-height="19.041cm">
			 ${innerData}
		 </draw:text-box>
		</draw:frame>`;
	}

	var addStatsFrame = function(stats) {
		return `<text:p text:style-name="P11"><draw:frame draw:style-name="fr4" text:anchor-type="char" svg:y="0.208cm" svg:width="7.137cm" draw:z-index="2">
		<draw:text-box fo:min-height="4.464cm"><draw:frame draw:style-name="fr3" text:anchor-type="frame" svg:x="0.282cm" svg:y="3.281cm" svg:width="6.463cm" draw:z-index="4">
			<draw:text-box fo:min-height="1.154cm">
			 <text:p text:style-name="P10">${ stats.timestamp }</text:p>
			</draw:text-box>
		 </draw:frame>
		 <text:p text:style-name="P4"><draw:frame draw:style-name="fr2" text:anchor-type="as-char" svg:width="3.006cm" draw:z-index="6">
			 <draw:text-box fo:min-height="2.457cm">
				<text:p text:style-name="buddyFillHuge">${stats.answersCount}</text:p>
				<text:p text:style-name="buddyStroke">${app.$refs.SugarL10n.get('TotalVotes')}</text:p>
			 </draw:text-box>
			</draw:frame><draw:frame draw:style-name="fr2" text:anchor-type="as-char" svg:width="3.006cm" draw:z-index="3">
			 <draw:text-box fo:min-height="2.457cm">
				<text:p text:style-name="buddyFillHuge">${stats.usersCount}</text:p>
				<text:p text:style-name="buddyStroke">${app.$refs.SugarL10n.get('TotalUsers')}</text:p>
			 </draw:text-box>
			</draw:frame></text:p>
		</draw:text-box>
	 </draw:frame></text:p>
	 `;
	}

	var addToPageContainer = function(innerData) {
		return `<text:p text:style-name="P14">
			${innerData}
		</text:p>`
	}

	var header = `<?xml version="1.0" encoding="UTF-8"?>

	<office:document xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:ooo="http://openoffice.org/2004/office" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:dr3d="urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" xmlns:chart="urn:oasis:names:tc:opendocument:xmlns:chart:1.0" xmlns:rpt="http://openoffice.org/2005/report" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0" xmlns:ooow="http://openoffice.org/2004/writer" xmlns:oooc="http://openoffice.org/2004/calc" xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2" xmlns:css3t="http://www.w3.org/TR/css3-text/" xmlns:tableooo="http://openoffice.org/2009/table" xmlns:calcext="urn:org:documentfoundation:names:experimental:calc:xmlns:calcext:1.0" xmlns:drawooo="http://openoffice.org/2010/draw" xmlns:loext="urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0" xmlns:grddl="http://www.w3.org/2003/g/data-view#" xmlns:field="urn:openoffice:names:experimental:ooo-ms-interop:xmlns:field:1.0" xmlns:math="http://www.w3.org/1998/Math/MathML" xmlns:form="urn:oasis:names:tc:opendocument:xmlns:form:1.0" xmlns:script="urn:oasis:names:tc:opendocument:xmlns:script:1.0" xmlns:dom="http://www.w3.org/2001/xml-events" xmlns:xforms="http://www.w3.org/2002/xforms" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:formx="urn:openoffice:names:experimental:ooxml-odf-interop:xmlns:form:1.0" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:officeooo="http://openoffice.org/2009/office" office:version="1.2" office:mimetype="application/vnd.oasis.opendocument.text">
	 <office:meta><meta:creation-date>2020-08-15T12:05:37.211000000</meta:creation-date><dc:date>2020-08-17T01:01:53.361000000</dc:date><meta:editing-duration>PT1H10M21S</meta:editing-duration><meta:editing-cycles>8</meta:editing-cycles><meta:generator>LibreOffice/6.4.5.2$Windows_X86_64 LibreOffice_project/a726b36747cf2001e06b58ad5db1aa3a9a1872d6</meta:generator><meta:document-statistic meta:table-count="0" meta:image-count="4" meta:object-count="0" meta:page-count="1" meta:paragraph-count="17" meta:word-count="19" meta:character-count="87" meta:non-whitespace-character-count="73"/></office:meta>
	 <office:settings>
		<config:config-item-set config:name="ooo:view-settings">
		 <config:config-item config:name="ViewAreaTop" config:type="long">11931</config:config-item>
		 <config:config-item config:name="ViewAreaLeft" config:type="long">0</config:config-item>
		 <config:config-item config:name="ViewAreaWidth" config:type="long">33657</config:config-item>
		 <config:config-item config:name="ViewAreaHeight" config:type="long">16999</config:config-item>
		 <config:config-item config:name="ShowRedlineChanges" config:type="boolean">true</config:config-item>
		 <config:config-item config:name="InBrowseMode" config:type="boolean">false</config:config-item>
		 <config:config-item-map-indexed config:name="Views">
			<config:config-item-map-entry>
			 <config:config-item config:name="ViewId" config:type="string">view2</config:config-item>
			 <config:config-item config:name="ViewLeft" config:type="long">17154</config:config-item>
			 <config:config-item config:name="ViewTop" config:type="long">17611</config:config-item>
			 <config:config-item config:name="VisibleLeft" config:type="long">0</config:config-item>
			 <config:config-item config:name="VisibleTop" config:type="long">11931</config:config-item>
			 <config:config-item config:name="VisibleRight" config:type="long">33655</config:config-item>
			 <config:config-item config:name="VisibleBottom" config:type="long">28928</config:config-item>
			 <config:config-item config:name="ZoomType" config:type="short">0</config:config-item>
			 <config:config-item config:name="ViewLayoutColumns" config:type="short">1</config:config-item>
			 <config:config-item config:name="ViewLayoutBookMode" config:type="boolean">false</config:config-item>
			 <config:config-item config:name="ZoomFactor" config:type="short">100</config:config-item>
			 <config:config-item config:name="IsSelectedFrame" config:type="boolean">false</config:config-item>
			 <config:config-item config:name="AnchoredTextOverflowLegacy" config:type="boolean">false</config:config-item>
			</config:config-item-map-entry>
		 </config:config-item-map-indexed>
		</config:config-item-set>
		<config:config-item-set config:name="ooo:configuration-settings">
		 <config:config-item config:name="ProtectForm" config:type="boolean">false</config:config-item>
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
		 <config:config-item config:name="TabsRelativeToIndent" config:type="boolean">false</config:config-item>
		 <config:config-item config:name="IgnoreTabsAndBlanksForLineCalculation" config:type="boolean">false</config:config-item>
		 <config:config-item config:name="RsidRoot" config:type="int">587961</config:config-item>
		 <config:config-item config:name="LoadReadonly" config:type="boolean">false</config:config-item>
		 <config:config-item config:name="ClipAsCharacterAnchoredWriterFlyFrames" config:type="boolean">false</config:config-item>
		 <config:config-item config:name="UnxForceZeroExtLeading" config:type="boolean">false</config:config-item>
		 <config:config-item config:name="UseOldPrinterMetrics" config:type="boolean">false</config:config-item>
		 <config:config-item config:name="TabAtLeftIndentForParagraphsInList" config:type="boolean">true</config:config-item>
		 <config:config-item config:name="Rsid" config:type="int">883453</config:config-item>
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
		 <config:config-item config:name="SurroundTextWrapSmall" config:type="boolean">true</config:config-item>
		 <config:config-item config:name="ApplyParagraphMarkFormatToNumbering" config:type="boolean">true</config:config-item>
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
		<style:font-face style:name="Arial3" svg:font-family="Arial" style:font-family-generic="swiss"/>
		<style:font-face style:name="Arial1" svg:font-family="Arial" style:font-family-generic="roman" style:font-pitch="variable"/>
		<style:font-face style:name="Liberation Serif" svg:font-family="&apos;Liberation Serif&apos;" style:font-family-generic="roman" style:font-pitch="variable"/>
		<style:font-face style:name="Arial" svg:font-family="Arial" style:font-family-generic="swiss" style:font-pitch="variable"/>
		<style:font-face style:name="Liberation Sans" svg:font-family="&apos;Liberation Sans&apos;" style:font-family-generic="swiss" style:font-pitch="variable"/>
		<style:font-face style:name="Arial2" svg:font-family="Arial" style:font-family-generic="system" style:font-pitch="variable"/>
		<style:font-face style:name="Microsoft YaHei" svg:font-family="&apos;Microsoft YaHei&apos;" style:font-family-generic="system" style:font-pitch="variable"/>
		<style:font-face style:name="NSimSun" svg:font-family="NSimSun" style:font-family-generic="system" style:font-pitch="variable"/>
	 </office:font-face-decls>
	`;

	var styles = `<office:styles>
  <style:default-style style:family="graphic">
   <style:graphic-properties svg:stroke-color="#3465a4" draw:fill-color="#729fcf" fo:wrap-option="no-wrap" draw:shadow-offset-x="0.3cm" draw:shadow-offset-y="0.3cm" draw:start-line-spacing-horizontal="0.283cm" draw:start-line-spacing-vertical="0.283cm" draw:end-line-spacing-horizontal="0.283cm" draw:end-line-spacing-vertical="0.283cm" style:flow-with-text="false"/>
   <style:paragraph-properties style:text-autospace="ideograph-alpha" style:line-break="strict" style:font-independent-line-spacing="false">
    <style:tab-stops/>
   </style:paragraph-properties>
   <style:text-properties style:use-window-font-color="true" style:font-name="Liberation Serif" fo:font-size="12pt" fo:language="en" fo:country="US" style:letter-kerning="true" style:font-name-asian="NSimSun" style:font-size-asian="10.5pt" style:language-asian="zh" style:country-asian="CN" style:font-name-complex="Arial2" style:font-size-complex="12pt" style:language-complex="hi" style:country-complex="IN"/>
  </style:default-style>
  <style:default-style style:family="paragraph">
   <style:paragraph-properties fo:orphans="2" fo:widows="2" fo:hyphenation-ladder-count="no-limit" style:text-autospace="ideograph-alpha" style:punctuation-wrap="hanging" style:line-break="strict" style:tab-stop-distance="1.27cm" style:writing-mode="page"/>
   <style:text-properties style:use-window-font-color="true" style:font-name="Liberation Serif" fo:font-size="12pt" fo:language="en" fo:country="US" style:letter-kerning="true" style:font-name-asian="NSimSun" style:font-size-asian="10.5pt" style:language-asian="zh" style:country-asian="CN" style:font-name-complex="Arial2" style:font-size-complex="12pt" style:language-complex="hi" style:country-complex="IN" fo:hyphenate="false" fo:hyphenation-remain-char-count="2" fo:hyphenation-push-char-count="2" loext:hyphenation-no-caps="false"/>
  </style:default-style>
  <style:default-style style:family="table">
   <style:table-properties table:border-model="collapsing"/>
  </style:default-style>
  <style:default-style style:family="table-row">
   <style:table-row-properties fo:keep-together="auto"/>
  </style:default-style>
  <style:style style:name="Standard" style:family="paragraph" style:class="text"/>
  <style:style style:name="Heading" style:family="paragraph" style:parent-style-name="Standard" style:next-style-name="Text_20_body" style:class="text">
   <style:paragraph-properties fo:margin-top="0.423cm" fo:margin-bottom="0.212cm" loext:contextual-spacing="false" fo:keep-with-next="always"/>
   <style:text-properties style:font-name="Liberation Sans" fo:font-family="&apos;Liberation Sans&apos;" style:font-family-generic="swiss" style:font-pitch="variable" fo:font-size="14pt" style:font-name-asian="Microsoft YaHei" style:font-family-asian="&apos;Microsoft YaHei&apos;" style:font-family-generic-asian="system" style:font-pitch-asian="variable" style:font-size-asian="14pt" style:font-name-complex="Arial2" style:font-family-complex="Arial" style:font-family-generic-complex="system" style:font-pitch-complex="variable" style:font-size-complex="14pt"/>
  </style:style>
  <style:style style:name="Text_20_body" style:display-name="Text body" style:family="paragraph" style:parent-style-name="Standard" style:class="text">
   <style:paragraph-properties fo:margin-top="0cm" fo:margin-bottom="0.247cm" loext:contextual-spacing="false" fo:line-height="115%"/>
  </style:style>
  <style:style style:name="List" style:family="paragraph" style:parent-style-name="Text_20_body" style:class="list">
   <style:text-properties style:font-size-asian="12pt" style:font-name-complex="Arial3" style:font-family-complex="Arial" style:font-family-generic-complex="swiss"/>
  </style:style>
  <style:style style:name="Caption" style:family="paragraph" style:parent-style-name="Standard" style:class="extra">
   <style:paragraph-properties fo:margin-top="0.212cm" fo:margin-bottom="0.212cm" loext:contextual-spacing="false" text:number-lines="false" text:line-number="0"/>
   <style:text-properties fo:font-size="12pt" fo:font-style="italic" style:font-size-asian="12pt" style:font-style-asian="italic" style:font-name-complex="Arial3" style:font-family-complex="Arial" style:font-family-generic-complex="swiss" style:font-size-complex="12pt" style:font-style-complex="italic"/>
  </style:style>
  <style:style style:name="Index" style:family="paragraph" style:parent-style-name="Standard" style:class="index">
   <style:paragraph-properties text:number-lines="false" text:line-number="0"/>
   <style:text-properties style:font-size-asian="12pt" style:font-name-complex="Arial3" style:font-family-complex="Arial" style:font-family-generic-complex="swiss"/>
  </style:style>
  <style:style style:name="Frame_20_contents" style:display-name="Frame contents" style:family="paragraph" style:parent-style-name="Standard" style:class="extra"/>
  <style:style style:name="Frame" style:family="graphic">
   <style:graphic-properties text:anchor-type="paragraph" svg:x="0cm" svg:y="0cm" fo:margin-left="0.201cm" fo:margin-right="0.201cm" fo:margin-top="0.201cm" fo:margin-bottom="0.201cm" style:wrap="parallel" style:number-wrapped-paragraphs="no-limit" style:wrap-contour="false" style:vertical-pos="top" style:vertical-rel="paragraph-content" style:horizontal-pos="center" style:horizontal-rel="paragraph-content" fo:padding="0.15cm" fo:border="0.06pt solid #000000"/>
  </style:style>
  <style:style style:name="Graphics" style:family="graphic">
   <style:graphic-properties text:anchor-type="paragraph" svg:x="0cm" svg:y="0cm" style:wrap="dynamic" style:number-wrapped-paragraphs="no-limit" style:wrap-contour="false" style:vertical-pos="top" style:vertical-rel="paragraph" style:horizontal-pos="center" style:horizontal-rel="paragraph"/>
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
  <text:linenumbering-configuration text:number-lines="false" text:offset="0.499cm" style:num-format="1" text:number-position="left" text:increment="5"/>
  <style:default-page-layout>
   <style:page-layout-properties style:writing-mode="lr-tb" style:layout-grid-standard-mode="true"/>
  </style:default-page-layout>
 </office:styles>
	`;

	var automaticStyles = ` <office:automatic-styles>
  <style:style style:name="P1" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:text-properties style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" officeooo:rsid="0008f8b9" officeooo:paragraph-rsid="0008f8b9" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P2" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:paragraph-properties fo:line-height="115%" fo:text-align="center" style:justify-single-word="false"/>
   <style:text-properties fo:color="#2a6099" style:font-name="Arial" officeooo:rsid="0008f8b9" officeooo:paragraph-rsid="0008f8b9"/>
  </style:style>
  <style:style style:name="P3" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:paragraph-properties fo:line-height="115%" fo:text-align="center" style:justify-single-word="false"/>
   <style:text-properties fo:color="#2a6099" style:font-name="Arial" officeooo:rsid="000d7afd" officeooo:paragraph-rsid="000d7afd"/>
  </style:style>
  <style:style style:name="P4" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:text-properties officeooo:rsid="0009f873" officeooo:paragraph-rsid="0009f873"/>
  </style:style>
  <style:style style:name="P5" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:paragraph-properties fo:line-height="115%" fo:text-align="center" style:justify-single-word="false"/>
   <style:text-properties fo:color="#c9211e" style:font-name="Arial" fo:font-size="36pt" fo:font-weight="bold" officeooo:rsid="0008f8b9" officeooo:paragraph-rsid="0008f8b9" style:font-size-asian="36pt" style:font-weight-asian="bold" style:font-size-complex="36pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P6" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:text-properties officeooo:rsid="000bc07a" officeooo:paragraph-rsid="000bc07a"/>
  </style:style>
  <style:style style:name="P7" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:paragraph-properties fo:text-align="center" style:justify-single-word="false"/>
   <style:text-properties fo:color="#808080" style:font-name="Arial" fo:font-size="8pt" officeooo:rsid="000d7afd" officeooo:paragraph-rsid="000d7afd" style:font-size-asian="8pt" style:font-size-complex="8pt"/>
  </style:style>
  <style:style style:name="P8" style:family="paragraph" style:parent-style-name="Standard">
   <style:text-properties fo:color="#ffffff" style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" officeooo:rsid="0008f8b9" officeooo:paragraph-rsid="0008f8b9" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P9" style:family="paragraph" style:parent-style-name="Standard">
   <style:paragraph-properties fo:line-height="115%" fo:text-align="center" style:justify-single-word="false"/>
   <style:text-properties fo:color="#333333" style:font-name="Arial" fo:font-size="16pt" fo:font-weight="normal" officeooo:rsid="0008f8b9" officeooo:paragraph-rsid="0008f8b9" style:font-size-asian="16pt" style:font-weight-asian="normal" style:font-size-complex="16pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P10" style:family="paragraph" style:parent-style-name="Standard">
   <style:paragraph-properties fo:line-height="115%" fo:text-align="center" style:justify-single-word="false"/>
   <style:text-properties fo:color="#333333" style:font-name="Arial1" fo:font-size="16pt" fo:font-weight="normal" officeooo:rsid="0008f8b9" officeooo:paragraph-rsid="0008f8b9" style:font-size-asian="16pt" style:font-weight-asian="normal" style:font-size-complex="16pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P11" style:family="paragraph" style:parent-style-name="Standard">
   <style:text-properties fo:color="#000000" style:font-name="Arial" fo:font-size="16pt" fo:font-weight="normal" officeooo:rsid="000bc07a" officeooo:paragraph-rsid="000bc07a" style:font-size-asian="16pt" style:font-weight-asian="normal" style:font-size-complex="16pt" style:font-weight-complex="normal"/>
  </style:style>
  <style:style style:name="P12" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill-color="#ff0000"/>
  </style:style>
  <style:style style:name="P13" style:family="paragraph" style:parent-style-name="Standard">
   <loext:graphic-properties draw:fill-color="#ffff00"/>
  </style:style>
  <style:style style:name="P14" style:family="paragraph" style:parent-style-name="Standard">
   <style:paragraph-properties fo:break-before="page"/>
   <style:text-properties fo:color="#ffffff" style:font-name="Arial" fo:font-size="16pt" fo:font-weight="bold" officeooo:rsid="0008f8b9" officeooo:paragraph-rsid="0008f8b9" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
  </style:style>
  <style:style style:name="P15" style:family="paragraph" style:parent-style-name="Frame_20_contents">
   <style:paragraph-properties fo:text-align="center" style:justify-single-word="false"/>
   <style:text-properties fo:color="#808080" style:font-name="Arial" fo:font-size="8pt" officeooo:rsid="000d7afd" officeooo:paragraph-rsid="000d7afd" style:font-size-asian="8pt" style:font-size-complex="8pt"/>
  </style:style>
  <style:style style:name="P16" style:family="paragraph">
   <loext:graphic-properties draw:fill-color="#ff0000"/>
  </style:style>
  <style:style style:name="T1" style:family="text">
   <style:text-properties officeooo:rsid="0009f873"/>
  </style:style>
  <style:style style:name="T2" style:family="text">
   <style:text-properties style:font-name="Arial1"/>
  </style:style>
  <style:style style:name="T3" style:family="text">
   <style:text-properties officeooo:rsid="000c1c63"/>
  </style:style>
  <style:style style:name="fr1" style:family="graphic" style:parent-style-name="Frame">
   <style:graphic-properties style:wrap="parallel" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="middle" style:vertical-rel="baseline" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" fo:padding="0.049cm" fo:border="none"/>
  </style:style>
  <style:style style:name="fr2" style:family="graphic" style:parent-style-name="Frame">
   <style:graphic-properties style:wrap="parallel" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="middle" style:vertical-rel="baseline" style:horizontal-pos="left" style:horizontal-rel="paragraph" fo:padding="0.15cm" fo:border="none"/>
  </style:style>
  <style:style style:name="fr3" style:family="graphic" style:parent-style-name="Frame">
   <style:graphic-properties style:wrap="parallel" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="from-top" style:vertical-rel="frame" style:horizontal-pos="from-left" style:horizontal-rel="frame" fo:padding="0.15cm" fo:border="none"/>
  </style:style>
  <style:style style:name="fr4" style:family="graphic" style:parent-style-name="Frame">
   <style:graphic-properties style:wrap="parallel" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="from-top" style:vertical-rel="paragraph" style:horizontal-pos="center" style:horizontal-rel="paragraph" fo:padding="0.15cm" fo:border="none"/>
  </style:style>
  <style:style style:name="fr5" style:family="graphic" style:parent-style-name="Frame">
   <style:graphic-properties style:run-through="foreground" style:wrap="none" style:vertical-pos="from-top" style:vertical-rel="paragraph" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" fo:padding="0.15cm" fo:border="none"/>
  </style:style>
  <style:style style:name="fr6" style:family="graphic" style:parent-style-name="Frame">
   <style:graphic-properties style:wrap="parallel" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="middle" style:vertical-rel="baseline" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" fo:padding="0.15cm" fo:border="none"/>
  </style:style>
  <style:style style:name="fr7" style:family="graphic" style:parent-style-name="Frame">
   <style:graphic-properties fo:margin-left="0cm" fo:margin-right="0cm" style:vertical-pos="middle" style:vertical-rel="baseline" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" fo:background-color="#333333" draw:fill="solid" draw:fill-color="#333333" fo:padding="0.499cm" fo:border="0.06pt solid #000000" draw:wrap-influence-on-position="once-concurrent" loext:allow-overlap="true">
    <style:columns fo:column-count="1" fo:column-gap="0cm"/>
   </style:graphic-properties>
  </style:style>
  <style:style style:name="fr8" style:family="graphic" style:parent-style-name="Graphics">
   <style:graphic-properties style:vertical-pos="top" style:vertical-rel="baseline" style:horizontal-pos="center" style:horizontal-rel="paragraph" style:mirror="none" fo:clip="rect(0cm, 0cm, 0cm, 0cm)" draw:luminance="0%" draw:contrast="0%" draw:red="0%" draw:green="0%" draw:blue="0%" draw:gamma="100%" draw:color-inversion="false" draw:image-opacity="100%" draw:color-mode="standard"/>
  </style:style>
  <style:style style:name="fr9" style:family="graphic" style:parent-style-name="Graphics">
   <style:graphic-properties style:run-through="foreground" style:wrap="parallel" style:number-wrapped-paragraphs="no-limit" style:wrap-contour="false" style:vertical-pos="from-top" style:vertical-rel="paragraph" style:horizontal-pos="center" style:horizontal-rel="paragraph" style:mirror="none" fo:clip="rect(0cm, 0cm, 0cm, 0cm)" draw:luminance="0%" draw:contrast="0%" draw:red="0%" draw:green="0%" draw:blue="0%" draw:gamma="100%" draw:color-inversion="false" draw:image-opacity="100%" draw:color-mode="standard"/>
  </style:style>
  <style:style style:name="gr1" style:family="graphic">
   <style:graphic-properties draw:stroke="none" draw:fill-color="#ff0000" draw:textarea-horizontal-align="justify" draw:textarea-vertical-align="middle" draw:auto-grow-height="false" fo:min-height="0.229cm" fo:min-width="0.882cm" style:run-through="foreground" style:wrap="run-through" style:number-wrapped-paragraphs="no-limit" style:vertical-pos="from-top" style:horizontal-pos="from-left" style:horizontal-rel="paragraph" draw:wrap-influence-on-position="once-concurrent" loext:allow-overlap="true" style:flow-with-text="false"/>
  </style:style>
  <style:page-layout style:name="pm1">
   <style:page-layout-properties fo:page-width="21.59cm" fo:page-height="27.94cm" style:num-format="1" style:print-orientation="portrait" fo:margin-top="0.499cm" fo:margin-bottom="0.499cm" fo:margin-left="0.499cm" fo:margin-right="0.499cm" style:writing-mode="lr-tb" style:layout-grid-color="#c0c0c0" style:layout-grid-lines="44" style:layout-grid-base-height="0.55cm" style:layout-grid-ruby-height="0cm" style:layout-grid-mode="none" style:layout-grid-ruby-below="false" style:layout-grid-print="true" style:layout-grid-display="true" style:layout-grid-base-width="0.37cm" style:layout-grid-snap-to="true" style:footnote-max-height="0cm">
    <style:footnote-sep style:width="0.018cm" style:distance-before-sep="0.101cm" style:distance-after-sep="0.101cm" style:line-style="solid" style:adjustment="left" style:rel-width="25%" style:color="#000000"/>
   </style:page-layout-properties>
   <style:header-style/>
   <style:footer-style/>
  </style:page-layout>
	`;

	var automaticStylesEnd = `</office:automatic-styles>
	<office:master-styles>
	 <style:master-page style:name="Standard" style:page-layout-name="pm1"/>
	</office:master-styles>
	`;

	var xml = `<office:body>
  <office:text>
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

	return {
		header,
		automaticStyles,
		automaticStylesEnd,
		xml,
		footer,
		styles,
		getAutomaticStyles,
		addBuddyStyles,
		addQuestion,
		addChartFrame,
		addAvgRatingFrame,
		addLegendFrame,
		addToChartInfoFrame,
		addToMainContainer,
		addStatsFrame,
		addToPageContainer
	}
});