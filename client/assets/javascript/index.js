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
function byname(name) {
	return document.getElementsByName(name)[0];
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
	const res = await fetch(path);
	if(!res.ok) {
		throw new Error(res);
	}
	return await res.json();
}

async function apiPost(path, data, method = "POST", json = true) {
	const res = await fetch(path, {
		method,
		body: JSON.stringify(data),
		headers: {
			'Content-Type': "application/json",
		}
	});
	
	if(!res.ok) {
		throw new Error(res);
	}
	if(json) {
		return await res.json();
	}
}

async function logIn(username, password, position) {
	try {
		await apiPost("/api/login", {
			username,
			password,
			position,
		}, "POST", false);
		return true;
	} catch(err) {
		return false;
	}
}
