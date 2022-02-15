// shorthand
function id(i) {
	return document.getElementById(i);
}
function q(q) {
	return document.querySelector(q);
}
function qa(q) {
	return document.querySelectorAll(q);
}

// short function to create an element with attributes and children
function element(tag, attr = {}, ...children) {
	const el = document.createElement(tag);
	for(const attrName in attr) {
		el.setAttribute(attrName, attr[attrName]);
	}
	for(const child of children) {
		el.appendChild(
			typeof(child) === "string" ? document.createTextNode(child) : child
		);
	}
	
	return el;
}

async function apiGet(path) {
	return await (await fetch(path)).json();
}

async function apiPost(path, data, ignoreResult = true) {
	const res = await fetch(path, {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			'Content-Type': "application/json",
		}
	});
	
	if(!ignoreResult) {
		return await res.json();
	} else {
		return res;
	}
}
