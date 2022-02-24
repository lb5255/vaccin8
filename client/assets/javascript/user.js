apiGet("/api/vaccineList").then(vacc => {
	const sel = id("vaccine-select-dropdown");
	
	// add <option> tags to the select
	vacc.forEach(v => {
		sel.appendChild(
			element("option", {
				value: v.campaignVaccID,
			}, `${v.vaccineType} - ${v.manufacturer} - ${v.vaccineDose}`)
		);
	});
});

apiGet("/api/campaignName").then(campaign => {
	qa(".campaign-name").forEach(el => el.textContent = campaign.campaignName);
});

const states = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
}

window.addEventListener("load", () => {
	const stateInput = id("state-input");
	for(const stateCode in states) {
		stateInput.appendChild(element("option", {
			value: stateCode
		}, states[stateCode]))
	}
})

function validateVaccineType() {
	if(id("vaccine-select-dropdown").value === "") {
		return "Please select an immunization";
	}
}

function validatePreScreening() {
	if(id("date-of-birth").value === "") {
		return "Please select your date of birth";
	}
	
	if(!q("input[name=is-essential-worker]:checked")) {
		return "Please answer whether you are an essential worker";
	}
	
	if(!q("input[name=medical-condition]:checked")) {
		return "Please select whether you have an underlying medical condition";
	}
}

function validatePersonalInfo() {
	const infoFields = {
		"first-name": "first name",
		"last-name": "last name",
		"zipcode": "ZIP code",
		"address": "address",
		"city": "city",
		"state-input": "state",
		"email-or-phone": "notification preference",
	}
	
	for(const fieldId in infoFields) {
		if(id(fieldId).value === "") {
			return "Please enter your " + infoFields[fieldId];
		}
	}
}

function createDateTimeResult(data) {
	/** @type {HTMLTemplateElement} */
	const template = id("datetime-result-template");
	const element = template.content.cloneNode(true);
	
	element.querySelector(".datetime-result-title").textContent = data.address;
	element.querySelector(".datetime-result-city").textContent = data.city;
	element.querySelector(".datetime-result-phone").textContent = data.phone;
	const dist = Math.floor(data.dist * 2) / 2;
	element.querySelector(".datetime-result-dist").textContent = dist + " mile" + (dist === 1 ? "" : "s") + " away";
	
	id("datetime-results").appendChild(element);
}
