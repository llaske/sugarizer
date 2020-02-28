define(["webL10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				element: "",
				orphan: true,
				placement: "bottom",
				title: l10n.get("TutoExplainTitle"),
				content: l10n.get("TutoExplainContent")
            },
			{
				element: ".board_table",
				placement: "right",
				title: l10n.get("AboutChessTitle"),
				content: l10n.get("AboutChessContent")
			},
			{
				element: ".board_table",
				placement: "right",
				title: l10n.get("AboutPiecesTitle"),
				content: l10n.get("AboutPiecesContent")
            },
            {
				element: ".black_pawn:first",
				placement: "right",
				title: "Pawn",
				content: l10n.get("AboutPawn")
            },
            {
				element: "#button5",
				placement: "right",
				title: "Pawn promotion",
				content: l10n.get("AboutPawnPromotion")
            },
            {
				element: ".black_rook:first",
				placement: "right",
				title: "Rook",
				content: l10n.get("AboutRook")
            },
            {
				element: ".black_knight:first",
				placement: "right",
				title: "Knight",
				content: l10n.get("AboutKnight")
            },
            {
				element: ".black_bishop:first",
				placement: "right",
				title: "Bishop",
				content: l10n.get("AboutBishop")
            },
            {
				element: ".black_queen:first",
				placement: "right",
				title: "Queen",
				content: l10n.get("AboutQueen")
            },
            {
				element: ".black_king:first",
				placement: "right",
				title: "King",
				content: l10n.get("AboutKing")
            },
            {
                element: "",
                orphan: true,
				placement: "bottom",
				title: l10n.get("AboutCheckTitle"),
				content: l10n.get("AboutCheck")
            },
            {
                element: "",
                orphan: true,
				placement: "bottom",
				title: l10n.get("AboutCheckmateTitle"),
				content: l10n.get("AboutCheckmate")
            },
            {
                element: "",
                orphan: true,
				placement: "bottom",
				title: l10n.get("AboutStalemateTitle"),
				content: l10n.get("AboutStalemate")
            },
            {
                element: "",
                orphan: true,
				placement: "bottom",
				title: l10n.get("AboutCastlingTitle"),
				content: l10n.get("AboutCastling")
            },
            {
                element: "",
                orphan: true,
				placement: "bottom",
				title: l10n.get("AboutDrawTitle"),
				content: l10n.get("AboutDraw")
            },
            {
                element: ".p4wn-log",
				placement: "left",
				title: l10n.get("MoveDivTitle"),
				content: l10n.get("AboutMoveDiv")
            },
            {
                element: "#button6",
				placement: "right",
				title: l10n.get("ComputerLevelTitle"),
				content: l10n.get("AboutComputerLevel")
            },
            {
                element: "#button1",
				placement: "bottom",
				title: l10n.get("WhitePlayer"),
				content: l10n.get("AboutPlayers")
            },
            {
                element: "#button2",
				placement: "bottom",
				title: l10n.get("BlackPlayer"),
				content: l10n.get("AboutPlayers")
            },
            {
                element: "#button3",
				placement: "bottom",
				title: l10n.get("Swap"),
				content: l10n.get("AboutSwap")
            },
            {
                element: "#button4",
				placement: "bottom",
				title: l10n.get("Undo"),
				content: l10n.get("AboutUndo")
            },
            
            
		];
		var tour = new Tour({
            template: "\
            <div class='popover tour'>\
                <div class='arrow'></div>\
                <h3 class='popover-title tutorial-title'></h3>\
                <div class='popover-content'></div>\
                <div class='popover-navigation' style='display: flex; flex-wrap:wrap; justify-content: center; align-items: center'>\
                    <div class='tutorial-prev-icon icon-button' data-role='prev'>\
                        <div class='tutorial-prev-icon1 web-activity'>\
                            <div class='tutorial-prev-icon2 web-activity-icon'></div>\
                            <div class='tutorial-prev-icon3 web-activity-disable'></div>\
                        </div>\
                        <div class='icon-tutorial-text'>"+l10n.get("TutoPrev")+"</div>\
                    </div>\
                    <span data-role='separator' style='margin: 4px'>|</span>\
                    <div class='tutorial-next-icon icon-button' data-role='next'>\
                        <div class='tutorial-next-icon1 web-activity'>\
                            <div class='tutorial-next-icon2 web-activity-icon'></div>\
                            <div class='tutorial-next-icon3 web-activity-disable'></div>\
                        </div>\
                        <div class='icon-tutorial-text'>"+l10n.get("TutoNext")+"</div>\
                    </div>\
                    <div class='tutorial-end-icon icon-button' data-role='end'>\
                        <div class='tutorial-end-icon1 web-activity'>\
                            <div class='tutorial-end-icon2 web-activity-icon'></div>\
                            <div class='tutorial-end-icon3 web-activity-disable'></div>\
                        </div>\
                        <div class='icon-tutorial-text'>"+l10n.get("TutoEnd")+"</div>\
                    </div>\
                </div>\
            </div>",
            storage: false,
            backdrop: true,
            steps: steps
        });
		tour.init();
		tour.start(true);

	};

	return tutorial;
});