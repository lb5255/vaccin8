let findID;
let findname;
let findlocation;

let accountID;
let locations;

let account;
async function findEmployee() {
	if(id("findID").value === "") {
		return "Please enter the employee's ID";
	}
	//find 
	try {
		const user = (await apiGet("/api/sitemgr/accountLocations")).find(n => n.accountID === +id("findID").value);
		id("findname").textContent = user.firstName + " " + user.lastName;
		id("findname2").textContent = user.firstName + " " + user.lastName;
		account = user;
	} catch(err) {
		console.log("Failed to retrieve account:", err);
		return "Failed to retrieve account";
	}
}


async function loadLocationPage() {
	locations = await apiGet("/api/sitemgr/activeLocations");
	
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
				accountID: account.accountID,
				locationID: loc,
			}, "POST", false);
		} catch(err) {
			return "Failed to set user at location";
		}
	}
	
	id("acct-locations").textContent = commas(locnames);
}