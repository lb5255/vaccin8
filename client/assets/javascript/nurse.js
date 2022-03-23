let appts;

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
		
		console.log(res);
		appts = res;
		id("patient-name").textContent = id("full-name").textContent = res[0].firstName + " " + res[0].lastName;
		id("address").textContent = res[0].address;
		id("address2").textContent = res[0].city + ", " + res[0].state + " " + res[0].zip;
		id("dob").textContent = new Date(res[0].dateOfBirth).toLocaleDateString();
		id("phone").textContent = res[0].phone || "none";
		id("email").textContent = res[0].email || "none";
		id("insur-prov").textContent = res[0].insuranceProvider || "none";
		id("insur-num").textContent = res[0].insuranceNum || "none";
		
	} catch(err) {
		console.error(err);
		return "An error occurred";
	}
}
