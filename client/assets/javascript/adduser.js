function validateInfo() {
	const infoFields = {
		"emp-name": "name",
		"address": "address",
		"emp-id": "ID #",
		"emp-city": "city",
		"emp-zipcode": "ZIP code",
		"state-input": "state",
		"emp-email": "email",
		"role-input": "role"
	}
	
	for(const fieldId in infoFields) {
		if(id(fieldId).value === "") {
			return "Please enter the employee's " + infoFields[fieldId];
		}
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
			value: loc.locationID
		}))
		
		// make a button that clicks the corresponding input when clicked
		container.appendChild(element("button", { "unfilled": true },
			loc.locationName)
		).onclick = () => input.click();
	}
}
