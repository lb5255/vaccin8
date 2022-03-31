async function validateInfo() {
	const infoFields = {
		"emp-first-name": "first name",
		"emp-last-name": "last name",
		"emp-username": "username",
		"emp-password": "password",
		"emp-email": "email",
		"emp-phone": "phone number",
		"role-input": "role"
	}
	
	for(const fieldId in infoFields) {
		if(id(fieldId).value === "") {
			return "Please enter the employee's " + infoFields[fieldId];
		}
	}
	
	if(id("emp-password-confirm").value !== id("emp-password").value) {
		return "Passwords do not match!";
	}
	
	// register the employee
	try {
		const res = await apiPost("/api/admin/accounts", {
			username: id("emp-username").value,
			password: id("emp-password").value,
			firstName: id("emp-first-name").value,
			lastName: id("emp-last-name").value,
			position: id("role-input").value,
			email: id("emp-email").value,
			phone: id("emp-phone").value,
		});
		accountID = res.accountID;
		id("acct-id").textContent = accountID;
		id("acct-name").textContent = id("emp-first-name").value + " " + id("emp-last-name").value;
		id("acct-username").textContent = id("emp-username").value;
		id("acct-pass").textContent = id("emp-password").value;
		id("acct-role").textContent = id("role-input").value;
		toast("Created account " + id("emp-username").value);
	} catch(err) {
		console.log("Failed to create account:", err);
		return "Failed to create account";
	}
}

let accountID;
let locations;

async function loadLocationPage() {
	closeModal();
	locations = await apiGet("/api/admin/locations");
	
	const container = id("location-select");
	container.innerHTML = "";
	for(const loc of locations) {
		const input = container.appendChild(element("input", {
			type: "checkbox",
			name: "location",
			"data-value": loc.locationID
		}))
		
		// make a button that clicks the corresponding input when clicked
		container.appendChild(element("button", { "unfilled": true },
			loc.locationName)
		).onclick = () => input.click();
	}
}

function commas(list) {
	switch(list.length) {
		case 0: return "";
		case 1: return list[0];
		case 2: return list[0] + " and " + list[1];
		default: {
			return list.slice(0, list.length - 1).join(", ") + ", and " + list[list.length - 1];
		}
	}
}

async function setLocations() {
	const locs = [].map.call(qa("input[name=location]:checked"), n => parseInt(n.dataset.value));
	console.log("locations:", locs);
	
	const locnames = locs.map(n => locations.find(l => l.locationID == n)).map(n => n.locationName);
	
	// add the locations to the user
	for(const loc of locs) {
		try {
			await apiPost("/api/sitemgr/locations/accounts", {
				accountID,
				locationID: loc,
			}, "POST", false);
		} catch(err) {
			return "Failed to set user at location";
		}
	}
	
	id("acct-locations").textContent = commas(locnames);
}
