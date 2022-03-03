"use strict"

const { jsPDF } = window.jspdf;

const presetSelect = document.getElementById("preset");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
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
	"#6¼": [6, 3.5],
	"#6¾": [6.5, 3.675],
	"A2": [5.75, 4.375],
	"#7": [6.75, 3.75],
	"C6": [6.3779, 4.4882],
	"Monarch": [7.5, 3.875],
	"A6": [6.5, 4.75],
	"#8⅝": [8.625, 3.625],
	"#9": [8.875, 3.875],
	"DL": [8.6666, 4.3333],
	"#10": [9.5, 4.125],
	"#11": [10.375, 4.5],
	"#12": [11, 4.75],
	"#14": [11.5, 5],
	"C5": [9.0157, 6.3779]
};

/* Populate the preset sizes */
presetSelect.innerHTML = Object.keys(sizes).map((size, _) => `<option value="${size}">${size}</option>`).join("\n\t\t\t") + "\n\t\t<option value=\"custom\">Custom</option>";
/* Reselect #10 as the default */
presetSelect.value = "#10";
widthInput.value = sizes[presetSelect.value][0];
heightInput.value = sizes[presetSelect.value][1];

/* Update values on preset selection */
presetSelect.onchange = presetChanged;
function presetChanged() {
	if (presetSelect.value !== "custom") {
		widthInput.value = sizes[presetSelect.value][0];
		heightInput.value = sizes[presetSelect.value][1];
		updateEnvelopeSize(presetSelect.value);
	}
}

/* Update on input */
widthInput.oninput = sizeInputChanged;
heightInput.oninput = sizeInputChanged;
function sizeInputChanged() {
	presetSelect.value = "custom";
	updateEnvelopeSize();
}

/* Resize the visual envelope */
function updateEnvelopeSize() {
	envelope.style.width = widthInput.value * 101 + "px";
	envelope.style.height = heightInput.value * 101 + "px";
	return [widthInput.value, heightInput.value];
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
	doc.setFontSize(12);
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
