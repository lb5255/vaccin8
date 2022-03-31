let findID;
let findname;
let findlocation;

let accountID;
let locations;

function findEmployee() {
	if(id(findID).value === "") {
		return "Please enter the employee's ID";
	}

	//find 
	try {
		const res = await apiPost("/api/sitemgr/accounts", {
			
		});
	} catch(err) {
		console.log("Failed to retrieve account:", err);
		return "Failed to retrieve account";
	}
}


async function loadLocationPage() {
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