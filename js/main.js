// @license magnet:?xt=urn:btih:8e4f440f4c65981c5bf93c76d35135ba5064d8b7&dn=apache-2.0.txt Apache-2.0

"use strict";

const { jsPDF } = window.jspdf;

const presetSelect = document.getElementById("preset-size");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const fontFamilySelect = document.getElementById("preset-font-family");
const customFontInput = document.getElementById("custom-font");
const envelope = document.getElementById("envelope");
const returnAddressBox = document.querySelector("#return-address > textarea");
const addReturnImageButton = document.getElementById("add-return-image");
const addressesBox = document.getElementById("addresses");

async function printEnvelopes() {
	makePDF(
		updateEnvelopeSize(),
		await getReturnImage() || returnAddressBox.value,
		getAddresses()
	).then(printPDF);
}

document.getElementById("remove-return-image").onclick = () => {
	addReturnImageButton.value = "";
};

document.getElementById("print-button").onclick = printEnvelopes;

document.onkeydown = e => {
	if (e.ctrlKey && e.keyCode == 'P'.charCodeAt(0)) {
		e.preventDefault();
		printEnvelopes();
	}
};

class FontFamily {
	constructor(idealFonts, loadedFonts, fallbackFonts) {
		this.idealFonts = idealFonts;
		this.loadedFonts = loadedFonts;
		this.fallbackFonts = fallbackFonts;
		this.fontFamily = idealFonts.concat(loadedFonts).concat(fallbackFonts).join(',');
	}
	loadIfNeeded() {
		const fontDetectionDoesNotWork = this.idealFonts.length && !document.fonts.check || document.fonts.check("16px a-non-existent-vqknib-font");
		if (fontDetectionDoesNotWork) {
			document.getElementById("font-detection-warning").style.display = "block";
		}
		if (
			fontDetectionDoesNotWork ||
			this.loadedFonts.length &&
			(
				!this.idealFonts.length ||
				!document.fonts.check("16px " + this.idealFonts.join(','))
			) &&
			!document.fonts.check("16px " + this.loadedFonts.join(','))
		 ) {
			var link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = `https://fonts.googleapis.com/css2?family=${this.loadedFonts.join("&family=").replace(' ', '+')}&display=swap`;
			document.getElementsByTagName('head')[0].appendChild(link);
		}
	}
}

const presetFonts = {
	"Arial": new FontFamily(["Arial", "Helvetica", "Liberation Sans", "FreeSans"], ["Roboto Flex", "Arimo"], ["Roboto", "sans-serif"]),
	"Comic Sans": new FontFamily(["Comic Sans"], ["Comic Relief"], ["Cavolini", "cursive"]),
	"Courier": new FontFamily(["Courier New", "Nimbus Mono L", "Courier"], ["Courier Prime"], ["monospace"]),
	"Dancing Script": new FontFamily([], ["Dancing Script"], ["Feltarigo", "Astania Script", "FabfeltScript", "cursive"]),
	"Cormorant Garamond": new FontFamily([], ["Cormorant Garamond"], ["Garamond", "serif"]),
	"Garamond": new FontFamily(["Garamond"], ["Cormorant Garamond"], ["serif"]),
	"Helvetica": new FontFamily(["Helvetica", "Liberation Sans", "FreeSans"], ["Roboto Flex", "Arimo"], ["Roboto", "sans-serif"]),
	"Parisienne": new FontFamily([], ["Parisienne"], ["cursive"]),
	"Tangerine": new FontFamily([], ["Tangerine"], ["Dream Script", "Italianno", "cursive"]),
	"Times": new FontFamily(["Times New Roman", "Times"], ["Tinos"], ["Liberation Serif", "FreeSerif", "serif"]),
	"Verdana": new FontFamily(["Verdana", "DejaVu Sans", "Bitstream Vera Sans"], [], ["Tahoma", "Geneva", "Arial", "sans-serif"]),
};
if (window.chrome)
	delete presetFonts.Arial; // Helvetica is too close and renders correctly
const pdfFonts = ["Courier", "Helvetica", "Times"];

/* Populate the preset fonts */
fontFamilySelect.innerHTML = Object.keys(presetFonts).map(font => `<option value="${font}">${font}</option>`).join("\n\t\t\t") + "\n\t\t<option value=\"custom\">Custom</option>";
/* Reselect Times as the default font */
fontFamilySelect.value = "Times";

let savedFont = presetFonts.Times.fontFamily;

/* Update font on selection changes */
fontFamilySelect.onchange = () => updateFont(fontFamilySelect.value);
customFontInput.onchange = () => updateFont(customFontInput.value);
function updateFont(font) {
	if (!pdfFonts.includes(font) && window.chrome)
		document.getElementById("pdf-resolution-warning").style.display = "block";
	else
		document.getElementById("pdf-resolution-warning").style.display = "none";
	
	if (font in presetFonts) {
		presetFonts[font].loadIfNeeded();
		font = presetFonts[font].fontFamily;
		customFontInput.value = "";
	}
	else {
		fontFamilySelect.value = "custom";
	}
	returnAddressBox.style.fontFamily = font;
	addressesBox.style.fontFamily = font;
	savedFont = font;
}

/**
 * @typedef {number} EnvelopeWidth - The width of the envelope in inches
 * @typedef {number} EnvelopeHeight - The height of the envelope in inches
 * @typedef {[EnvelopeWidth, EnvelopeHeight]} EnvelopeSize
 * @type {Object.<string, EnvelopeSize>}
 */
const sizes = {
	"#6¼": [6, 3.5],
	"#6¾": [6.5, 3.675],
	"A2": [5.75, 4.375],
	"#7": [6.75, 3.75],
	"C6": [6.3779, 4.4882],
	"Monarch": [7.5, 3.875],
	"A6": [6.5, 4.75],
	"A7": [7.25, 5.25],
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
addressesBox.addEventListener("input", (event) => {
	if (window.chrome && addressesBox.value.match(/\P{ASCII}/u)) {
		document.getElementById("pdf-resolution-warning").style.display = "block";
	}
	else if (document.getElementById("pdf-resolution-warning").style.display === "block") {
		updateFont(customFontInput.value || fontFamilySelect.value);
	}
})

/**
 * Resize the visual envelope
 * @returns {EnvelopeSize} The new envelope size in inches
 */
function updateEnvelopeSize() {
	envelope.style.width = widthInput.value * 101 + "px";
	envelope.style.height = heightInput.value * 101 + "px";
	return [widthInput.value, heightInput.value];
}
updateEnvelopeSize();

/**
 * Get return image as a data URL
 * @returns {string} Data URL of uploaded return image
 */
async function getReturnImage() {
	const file = addReturnImageButton.files[0];
	if (file) {
		const promise = new Promise (resolve => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.readAsDataURL(file);
		});
		return await promise;
	}
	else
		return "";
}

/**
 * Read and parse the recipient addresses
 * @returns {string[]} The list of recipient addresses
 */
function getAddresses() {
	return addressesBox.value.split(/(?:\n\s*\n|(?<=(?<!(?:box|ste|apt|unit|#) ?)\b\w?\d\w ?\d\w\d(?:-\d{4})?)\n)/i).filter(x => x);
}

/**
 * Generate a PDF of the envelope to print
 * @param {EnvelopeSize} size The size of the envelope in inches
 * @param {string} returnAddress The return address, either as a data URL or normal text
 * @param {string[]} addresses The list of recipient addresses
 * @returns {jsPDF} Resulting PDF
 */
async function makePDF(size, returnAddress, addresses) {
	let doc;
	const FONT_SIZE = 12;
	const pdfFont = pdfFonts.find(f => savedFont === presetFonts[f].fontFamily);
	if (pdfFont && !addresses.some(x => x.match(/\P{ASCII}/u))) {
		const pageOptions = {
			orientation: "landscape",
			unit: "in",
			format: size,
			putOnlyUsedFonts: true
		};
		doc = new jsPDF(pageOptions);
		doc.setFontSize(FONT_SIZE);
		doc.setFont(pdfFont);
		const textOptions = {
			baseline: 'top'
		};
		if (returnAddress.startsWith('data:'))
			doc.addImage(returnAddress, returnAddress.substring(11, returnAddress.indexOf(";")).toUpperCase(), .2, .18);
		else
			doc.text(returnAddress, .2, .18, textOptions);
		doc.text(addresses[0], size[0] * .42, size[1] * .55);
		for (let i = 1; i < addresses.length; i++) {
			doc.addPage(pageOptions.format, pageOptions.orientation);
			doc.text(returnAddress, .1, .1, textOptions);
			doc.text(addresses[i], size[0] * .42, size[1] * .55, textOptions);
		}
	}
	else {
		/* Draw on canvas */
		const imagePixelsPerInch = window.chrome ? 72 : 300;
		const images = addresses.map(address => {
			const canvas = document.createElement("canvas");
			canvas.width = size[0] * imagePixelsPerInch;
			canvas.height = size[1] * imagePixelsPerInch;
			const context = canvas.getContext("2d");
			context.font = Math.round(FONT_SIZE * imagePixelsPerInch / 72) + "pt " + savedFont;
			context.textBaseline = "top";
			if (returnAddress.startsWith('data:'))
				context.drawImage(createImageBitmap(returnAddress), 	returnAddress.substring(11, returnAddress.indexOf(";")).toUpperCase(), 14, 13);
			else
				writeMultilineText(context, returnAddress, 14, 13, Math.round((FONT_SIZE + 2) * imagePixelsPerInch / 72) * imagePixelsPerInch);
			writeMultilineText(context, address, size[0] * imagePixelsPerInch * .42, size[1] * imagePixelsPerInch * .55, Math.round((FONT_SIZE + 2) * imagePixelsPerInch / 72));
			return canvas.toDataURL("image/png");
		});

		/* Convert to PDF */
		const pageOptions = {
			orientation: "landscape",
			unit: "in",
			format: size,
			putOnlyUsedFonts: true,
			userUnit: 300
		};
		doc = new jsPDF(pageOptions);
		doc.addImage(images[0], "PNG", 0, 0, size[0], size[1]);
		for (let i = 1; i < addresses.length; i++) {
			doc.addPage(pageOptions.format, pageOptions.orientation);
			doc.addImage(images[i], "PNG", 0, 0, size[0], size[1]);
		}
	}
	return doc;
}

/**
 * Write multiline text to a canvas context
 * @param {CanvasRenderingContext2D} context The context to write to
 * @param {string} text The text to write
 * @param {number} x The x coordinate of the left side to start writing at
 * @param {number} y The y coordinate of the top side to start writing at
 * @param {number} lineHeight The height of each line in pixels
 */
function writeMultilineText(context, text, x, y, lineHeight) {
	const lines = text.split("\n");
	for (let i = 0; i < lines.length; i++) {
		context.fillText(lines[i], x, y + i * lineHeight);
	}
}

function printPDF(doc) {
	doc.autoPrint({variant: 'non-conform'});
	const blobUrl = doc.output('bloburl', {filename: 'envelopes.pdf'});
	window.open(blobUrl, '_blank');
}

// @license-end
