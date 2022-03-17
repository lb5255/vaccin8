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

function loadLocationPage() {
	
}
