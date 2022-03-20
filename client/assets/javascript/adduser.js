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
		await apiPost("/api/admin/accounts", {
			username: id("emp-username").value,
			password: id("emp-password").value,
			firstName: id("emp-first-name").value,
			lastName: id("emp-last-name").value,
			position: id("role-input").value,
			email: id("emp-email").value,
			phone: id("emp-phone").value,
		}, "POST", false); // don't parse the result as json
		toast("Created account " + id("emp-username").value);
	} catch(err) {
		console.log("Failed to create account:", err);
		return "Failed to create account";
	}
}

async function loadLocationPage() {
	const locations = await apiGet("/api/admin/locations");
	
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

async function setLocations() {
	
}
