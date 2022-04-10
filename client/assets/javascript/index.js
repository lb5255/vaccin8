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
			typeof(child) === "string" ? document.createTextNode(child) :
			typeof(child) === "number" ? document.createTextNode(child + "") :
			(child === null || child === undefined) ? document.createTextNode("") :
			child
		);
	}
	
	return el;
}

async function apiGet(path, params = {}, json = true) {
	const p = Object.entries(params).map(n => n.map(encodeURIComponent).join("=")).join("&");
	const res = await fetch(path + (p ? "?" + p : ""));
	if(!res.ok) {
		throw new Error(res);
	}
	if(json) {
		return await res.json();
	}
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
	let logout = q("#myusername+.dropdown-content>a");
	if(logout) {
		logout.onclick = async ev => {
			ev.preventDefault();
			try {
				await apiGet("/api/logout", {}, false)
			} finally {
				location.href = logout.href;
			}
		}
	}
})

// time zones are weird
function LocalDate(time) {
	const d = time ? new Date(time) : new Date();
	return new Date(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
}

function UTCDate(ofs = 0) {
	const d = new Date();
	return new Date(d.getTime() + ofs - d.getTimezoneOffset() * 60 * 1000);
}

//Function to check age to verify min and max age between 
function ageCheck(dob, minAge, maxAge) {
    //Convert dob to years.
    //Comes in as yyyy-mm-dd
    var years = getAge(dob);

	if(typeof(minAge) === "number" && years < minAge) {
		return "You must be at least " + minAge + " years old to receive this vaccine";
	}
	if(typeof(maxAge) === "number" && years > maxAge) {
		return "You must be under " + maxAge + " years old to receive this vaccine";
	}
    return true;
}

//Function to get the age from a date of birth
function getAge(dob) {
    var today = new Date();
    var bDate = LocalDate(dob);
    var age = today.getFullYear() - bDate.getFullYear();
    var month = today.getMonth() - bDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < bDate.getDate())) {
        age--;
    }
    return age;
}
