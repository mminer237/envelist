"use strict"

let envelope = document.getElementById("envelope");
let returnAddressBox = document.getElementById("return-address");
let addressesBox = document.getElementById("addresses");

document.getElementById("print").onclick = () => {
	
};

function updateFont(font) {
	returnAddressBox.style.fontFamily = font;
	addressesBox.style.fontFamily = font;
}

let sizes = {
	"A10": [9.5, 4.125]
};
function updateEnvelopeSize(size = "A10") {
	envelope.style.width = sizes[size][0] + "in";
	envelope.style.height = sizes[size][1] + "in";
}
updateEnvelopeSize();
