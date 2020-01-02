enyo.kind({
	name: "TamTam.WhiteKeys",
    components: [
        { tag: "ul", components: [
            { tag: "li", name: "C", classes:"standard red", components: [
                {tag: "span", content: "1", classes:"number"}
            ]},

            { tag: "li", name: "D", classes:"standard orange", components: [
                {tag: "span", content: "2", classes:"number"}
            ]},

            { tag: "li", name: "E", classes:"standard yellow", components: [
                {tag: "span", content: "3", classes:"number"}
            ]}, 

            { tag: "li", name: "F", classes:"standard green", components: [
                {tag: "span", content: "4", classes:"number"}
            ]},

            { tag: "li", name: "G", classes:"standard aquamarine", components: [
                {tag: "span", content: "5", classes:"number"}
            ]},

            { tag: "li", name: "A", classes:"standard blue", components: [
                {tag: "span", content: "6", classes:"number"}
            ]},

            { tag: "li", name: "B", classes:"standard purple", components: [
                {tag: "span", content: "7", classes:"number"}
            ]},
        ] } 
    ],
});