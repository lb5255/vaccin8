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
	
	id("email-or-phone").addEventListener("change", () => {
		id("notification-label").textContent = id("email-or-phone").value === "email" ? "Email *" : "Phone Number *";
		id("notification").setAttribute("placeholder", id("email-or-phone").value === "email" ? "Enter your email" : "Enter your phone Number");
	})
	id("notification-label").textContent = id("email-or-phone").value === "email" ? "Email *" : "Phone Number *";
	id("notification").setAttribute("placeholder", id("email-or-phone").value === "email" ? "Enter your email" : "Enter your phone Number");
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
		"notification": id("email-or-phone").value === "email" ? "email" : "phone number",
	}
	
	for(const fieldId in infoFields) {
		if(id(fieldId).value === "") {
			return "Please enter your " + infoFields[fieldId];
		}
	}
}

function loadDateTimePage() {
	const vaccineName = q("#vaccine-select-dropdown>:checked")?.textContent || "unknown vaccine";
	qa(".vaccine-name").forEach(n => n.textContent = vaccineName);
	
	// fill zipcode box with previously entered zip code by default
	id("zipcode-search").value = id("zipcode-search").value || id("zipcode").value;
	
	apiGet("/api/recipient/vaccineAppts").then(results => {
		const locations = {};
		
		// sort the results by location
		for(const result of results) {
			// parse the date
			result.date = new Date(result.apptDate.replace(/T[\d:]+\./,
				"T" + result.apptTime.replace(/^(\d):/, "0$1") + "."));
			if(!(result.locationID in locations)) {
				locations[result.locationID] = {
					id: result.locationID,
					name: result.locationName,
					address: result.locationAddr,
					city: result.locationCity + ", " + result.locationState + " " + result.locationZip,
					zip: result.locationZip,
					appts: [result]
				}
			} else {
				locations[result.locationID].appts.push(result);
			}
		}
		
		showDateTimeResults(locations);
	});
}

function showDateTimeResults(locations) {
	clearDateTimeResults();
	for(const locationId in locations) {
		createDateTimeResult(locations[locationId]);
	}
}

function clearDateTimeResults() {
	id("datetime-results").innerHTML = "";
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function createDateTimeResult(data) {
	/** @type {HTMLTemplateElement} */
	const template = id("datetime-result-template");
	const el = template.content.cloneNode(true);
	
	el.querySelector(".datetime-result-title").textContent = data.name;
	el.querySelector(".datetime-result-address").textContent = data.address;
	el.querySelector(".datetime-result-city").textContent = data.city;
	
	// sort the appointments into chronological order
	const appts = data.appts.sort((a, b) => a.date.getTime() - b.date.getTime());
	
	const days = sortIntoDates(appts);
	
	for(const day of days.slice(0, 3)) { // show the first 3 days
		const datebutton = element("button", { class: "datetime-date", "modal-button": "datetime-modal" }, months[day.date.getMonth()] + " " + day.date.getDate());
		datebutton.onclick = () => displayTimeSelectModal(day.date, data);
		enableModalButton(datebutton);
		el.querySelector(".datetime-result-date-buttons").appendChild(datebutton);
	}
	
	if(days.length <= 3) {
		// don't show the More dates button
		el.querySelector(".datetime-more").remove();
	} else {
		el.querySelector(".datetime-more").onclick = () => {
			displayTimeSelectModal(undefined, data);
		}
	}
	
	id("datetime-results").appendChild(el);
}

// sorts a bunch of appointments into groups in the same day
function sortIntoDates(appts) {
	const days = [];
	
	for(const appt of appts) {
		const dayIndex = days.findIndex(val => isSameDay(val.date, appt.date));
		if(dayIndex < 0) { // insert a new record for the date
			days.push({
				date: appt.date,
				appts: [appt]
			});
		} else { // add it to the existing list
			days[dayIndex].appts.push(appt);
		}
	}
	
	return days;
}

// finds whether 2 dates are in the same day
function isSameDay(date1, date2) {
	return (
		Math.abs(date1.getTime() - date2.getTime()) < 1000 * 60 * 60 * 24 && // less than 24 hours between the times
		date1.getDate() === date2.getDate() // the same day of the month
	)
}

function displayTimeSelectModal(date, data) {
	console.log("data is", data)
	console.log("modal selected")
	const appts = date ? data.appts.filter(n => isSameDay(n.date, date)) : data.appts;
	
	id("selected-location").style.display = date ? "initial" : "none";
	id("selected-location").textContent = data.name + " - " + data.address + ", " + data.city;
	
	// disable the confirm button until the user has made a selection
	id("confirm-appointment").setAttribute("disabled", "true");
	
	const container = id("datetime-appointment-times");
	container.innerHTML = "";
	for(const appt of appts) {
		const input = container.appendChild(element("input", {
			type: "radio",
			name: "appointment-time",
			value: appt.appointmentID,
			style: "display: none;"
		}))
		
		// enable the confirm button when the user selects an option
		input.onclick = () => id("confirm-appointment").removeAttribute("disabled");
		
		// make a button that clicks the corresponding input when clicked
		container.appendChild(element("button", { "unfilled": true },
			formatDate(appt.date))
		).onclick = () => input.click();
	}
}

// date -> a format like "March 1, 12:30 PM"
function formatDate(d) {
	let hour = d.getHours();
	let pm = false;
	if(hour >= 12) {
		hour -= 12;
		pm = true;
	}
	if(hour === 0) {
		hour = 12;
	}
	
	let minutes = d.getMinutes().toString();
	if(minutes.length < 2) {
		minutes = "0" + minutes;
	}
	
	return months[d.getMonth()] + " " +
		d.getDate() + ", " +
		hour + ":" +
		minutes +
		(pm ? " PM" : " AM");
}

async function confirmAppt() {
	const appointment = q("input[name=appointment-time]:checked");
	if(!appointment) {
		return;
	}
	const btn = id("confirm-appointment");
	
	const apptId = parseInt(appointment.value);
	
	const body = {
		fName: id("first-name").value,
		lName: id("last-name").value,
		dob: id("date-of-birth").value,
		email: id("email-or-phone").value === "email" ? id("notification").value : null,
		phone: id("email-or-phone").value === "text" ? id("notification").value : null,
		city: id("city").value,
		state: id("state-input").value,
		address: id("address").value,
		zip: id("zipcode").value,
		insuranceProvider: id("primary-care").value || null,
		insuranceNum: id("insurance-id").value || null,
		campaignVaccID: parseInt(id("vaccine-select-dropdown").value),
		appointmentID: apptId
	}
	
	btn.textContent = "Submitting...";
	// submit the appointment
	try {
		await apiPost("/api/recipient/vaccineAppts", body, "POST", false);
	} catch(err) {
		console.error("Error signing up for an appointment", err);
		btn.textContent = "Error";
		return;
	}
	
	// reset it
	btn.textContent = "Confirm";
	
	// set the confirmation number
	id("confirmation_number").textContent = apptId;
	
	// close the modal
	q("#datetime-modal .modal-close").click();
	nextPage();
}

async function cancelAppt(e) {
	const apptIdStr = id("confirmation_number").textContent;
	if(!apptIdStr) {
		e.target.textContent = "Error";
		return;
	}
	
	const apptId = parseInt(apptIdStr);
	
	try {
		await apiPost("/api/recipient/vaccineAppts", {appointmentID: apptId}, "DELETE", false);
	} catch(err) {
		console.error(err);
		e.target.textContent = "Error";
		return;
	}
	
	// reset the text
	e.target.textContent = "Yes, cancel";
	
	q("#cancelAppUserModal .modal-close").click();
	goToPageIndex(0); // go back to the beginning
	toast("Appointment cancelled");
}
