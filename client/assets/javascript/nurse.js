let appt;

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

async function getPatient() {
	try {
		const res = await apiGet("/api/nurse/searchPatient", {
			firstName: id("first-name").value,
			lastName: id("last-name").value,
			dob: id("date-of-birth").value
		});
		
		if(!res.length) {
			return "No patient found";
		}
		const patient = res[0];
		
		const appts = await apiGet("/api/nurse/appointments", {
			patientID: patient.patientID
		});
		if(!appts.length) {
			return "No appointment for this patient";
		}
		const appointment = appts[0];
		
		console.log(patient, appointment)
		
		appt = appointment;
		id("patient-name").textContent = id("full-name").textContent = patient.firstName + " " + patient.lastName;
		id("address").textContent = patient.address;
		id("address2").textContent = patient.city + ", " + patient.state + " " + patient.zip;
		id("dob").textContent = LocalDate(patient.dateOfBirth).toLocaleDateString();
		id("phone").textContent = patient.phone || "none";
		id("email").textContent = patient.email || "none";
		id("insur-prov").textContent = patient.insuranceProvider || "none";
		id("insur-num").textContent = patient.insuranceNum || "none";
		qa(".first-name").forEach(n => n.textContent = patient.firstName);
		qa(".last-name").forEach(n => n.textContent = patient.lastName);
		
		id("vaccine-select-dropdown").value = appt.campaignVaccID;
		
	} catch(err) {
		console.error(err);
		return "An error occurred";
	}
}

async function enterBatch() {
	try {
		
		await apiPost("/api/nurse/appointments", {
			batchNum: id("batch").value,
			appointmentID: appt.appointmentID,
			vaccineID: id("vaccine-select-dropdown").value,
		}, "PUT", false);
		
		toast("Batch number entered!")
		
	} catch(err) {
		console.error(err);
		return "An error occurred";
	}
}
