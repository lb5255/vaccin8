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
