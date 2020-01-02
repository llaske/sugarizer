enyo.kind({
	name: "TamTam.WhiteKeys",
    components: [
        { tag: "ul", components: [
            { tag: "li", name: "C", classes:"standard red", ontap: "handlePlayNote", components: [
                {tag: "span", content: "1", classes:"number"}
            ]},

            { tag: "li", name: "D", classes:"standard orange", ontap: "handlePlayNote", components: [
                {tag: "span", content: "2", classes:"number"}
            ]},

            { tag: "li", name: "E", classes:"standard yellow", ontap: "handlePlayNote", components: [
                {tag: "span", content: "3", classes:"number"}
            ]}, 

            { tag: "li", name: "F", classes:"standard green", ontap: "handlePlayNote", components: [
                {tag: "span", content: "4", classes:"number"}
            ]},

            { tag: "li", name: "G", classes:"standard aquamarine", ontap: "handlePlayNote", components: [
                {tag: "span", content: "5", classes:"number"}
            ]},

            { tag: "li", name: "A", classes:"standard blue", ontap: "handlePlayNote", components: [
                {tag: "span", content: "6", classes:"number"}
            ]},

            { tag: "li", name: "B", classes:"standard purple", ontap: "handlePlayNote", components: [
                {tag: "span", content: "7", classes:"number"}
            ]},
        ] } 
    ],

    handlePlayNote: function(s, e) {
        var pitch = s.name;
        console.log(pitch);
        console.log(currentPianoMode)
    }

});