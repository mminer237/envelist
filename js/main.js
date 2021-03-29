"use strict"

const { jsPDF } = window.jspdf;

const envelope = document.getElementById("envelope");
const returnAddressBox = document.getElementById("return-address");
const addressesBox = document.getElementById("addresses");

function printEnvelopes() {
	const addresses = getAddresses();
	const doc = makePDF(
		updateEnvelopeSize(),
		returnAddressBox.value,
		addresses
	);
	printPDF(doc);
}

document.getElementById("print-button").onclick = printEnvelopes;

document.onkeydown = e => {
	if (e.ctrlKey && e.keyCode == 'P'.charCodeAt(0)) {
		e.preventDefault();
		printEnvelopes();
	}
};

let savedFont = "Times";
function updateFont(font) {
	returnAddressBox.style.fontFamily = font;
	addressesBox.style.fontFamily = font;
	savedFont = font;
}

const sizes = {
	"A10": [9.5, 4.125]
	// "A10": [10, 4.5]
};
function updateEnvelopeSize(size = "A10") {
	envelope.style.width = sizes[size][0] * 101 + "px";
	envelope.style.height = sizes[size][1] * 101 + "px";
	return sizes[size];
}
updateEnvelopeSize();

function getAddresses() {
	return addressesBox.value.split(/\n\s*\n/);
}

function makePDF(size, returnAddress, addresses) {
	const pageOptions = {
		orientation: "landscape",
		unit: "in",
		format: size
	};
	const doc = new jsPDF(pageOptions);
	doc.addFont(savedFont);
	doc.setFont(savedFont);
	const textOptions = {
		baseline: 'top'
	};
	doc.text(returnAddress, .1, .1, textOptions);
	doc.text(addresses[0], size[0] * .42, size[1] * .55);
	for (let i = 1; i < addresses.length; i++) {
		doc.addPage(pageOptions.format, pageOptions.orientation);
		doc.text(returnAddress, .1, .1, textOptions);
		doc.text(addresses[i], size[0] * .42, size[1] * .55, textOptions);
	}
	return doc;
}

function printPDF(doc) {
	doc.autoPrint({variant: 'non-conform'});
	doc.output('dataurlnewwindow');
}
