"use strict"

let envelope = document.getElementById("envelope");
let returnAddressBox = document.getElementById("return-address");
let addressesBox = document.getElementById("addresses");

document.getElementById("start").onclick = () => {
	
};

function updateFont(font) {
	returnAddressBox.style.fontFamily = font;
	addressesBox.style.fontFamily = font;
}

let sizes = {
	"A10": [9.5, 4.125]
};
function updateEnvelopeSize(size = "A10") {
	envelope.width = sizes[size][0] * 96;
	envelope.height = sizes[size][1] * 96;
}