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

function queryParams() {
	return Object.fromEntries(location.search
		.substring(1)
		.split("&")
		.map(n =>
			n.split("=").map(decodeURIComponent)
		)
	)
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

async function apiGet(path, params = {}) {
	const p = Object.entries(params).map(n => n.map(encodeURIComponent).join("=")).join("&");
	const res = await fetch(path + (p ? "?" + p : ""));
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

window.addEventListener("load", () => {
	if(id("myusername")) {
		apiGet("/api/whoami").then(({ username }) => id("myusername").textContent = username);
	}
})
