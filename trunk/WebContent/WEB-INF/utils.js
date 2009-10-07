/*
 * auxfunc.js Used in JavaScript Password Generator Author: Simon Whitehead
 * Date: October 2006 Notes: These functions are in a separate file because I
 * indend to use them in future projects.
 */

function randbetween(x, y) {
	range = Math.abs(y - x);
	return Math.floor(Math.min(x, y) + (range * Math.random()));
}

function randChar(str) {
	return str.charAt(randbetween(0, str.length));
}

function setVal(id, val) {
	elem = document.getElementById(id);
	if (!elem)
		return false;
	tagname = new String(elem.tagName).toUpperCase();
	switch (tagname) { // Note: use CAPS for tag names
		case 'SPAN' :
			elem.innerHTML = val;
			return true;
			break;
		case 'INPUT' :
			elem.value = val;
			return true;
			break;
		case 'TEXTAREA' :
			elem.innerHTML = val;
			return true;
			break;
		default :
			/*
			 * old code if(elem.hasAttribute("value")) { elem.value = val;
			 * return true; } else return false;
			 */
			return false;
			break;
	}
	return false;
}

function getVal(id) {
	elem = document.getElementById(id);
	if (!elem)
		return false;
	tagname = new String(elem.tagName).toUpperCase();
	switch (tagname) { // Note: use CAPS for tag names
		case 'SPAN' :
			return elem.innerHTML;
			break;
		case 'INPUT' :
			return elem.value;
			break;
		case 'SELECT' :
			indx = elem.selectedIndex;
			optelem = elem.options[indx];
			return optelem.id;
			break;
		case 'TEXTAREA' :
			return elem.innerHTML;
			break;
		default :
			return false;
			break;
	}
	return false;
}

/*
 * radio buttons etc.
 */
function check(id) {
	elem = document.getElementById(id);
	if (elem && elem.type == "checkbox")
		elem.checked = true;
}
function uncheck(id) {
	elem = document.getElementById(id);
	if (elem && elem.type == "checkbox")
		elem.checked = false;
}

function isChecked(id) {
	elem = document.getElementById(id);
	if (elem && elem.type == "checkbox")
		return elem.checked;
	else
		return false;
}
function checkRadio(id) {
	elem = document.getElementById(id);
	if (elem)
		elem.checked = true;

}

function hideElement(id) {
	elem = document.getElementById(id);
	if (elem)
		elem.style.display = "none";

}

function unHideElement(id) {
	elem = document.getElementById(id);
	if (elem)
		elem.style.display = "inline";

}