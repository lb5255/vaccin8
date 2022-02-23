function getPages() {
	const main = document.querySelector("main");
	return [...main.children].filter(n => n.classList.contains("page"));
}

function updateTimeline() {
	const page = document.querySelector(".page.active");
	const timelineNum = parseInt(page.dataset.timeline);
	const timeline = document.querySelector(".timeline");
	
	[...timeline.children].filter(n => n.classList.contains("timeline-point")).forEach((point, index) => {
		if(index < timelineNum) {
			point.classList.add("done");
		} else {
			point.classList.remove("done");
		}
	})
}

async function nextPage() {
	// clear any validation errors that exist
	qa(".error-message").forEach(n => n.remove());
	qa(".error-button").forEach(n => n.classList.remove("error-button"));
	
	const pages = getPages();
	for(let i = 0; i < pages.length; i++) {
		if(pages[i].classList.contains("active")) {
			// optionally validate
			let validator = pages[i].getAttribute("validate");
			if(validator) {
				let res = (new Function("return " + validator))();
				if(res?.then) { // can be awaited
					res = await res;
				}
				
				// display the error message
				if(res === false || typeof(res) === "string") {
					const nextButton = pages[i].querySelector("[next]");
					nextButton.classList.add("error-button");
					
					if(typeof(res) === "string") {
						nextButton.parentNode.appendChild(
							element("div", {
								class: "error-message"
							}, res)
						);
					}
					
					return;
				}
			}
			
			// switch pages
			const nextpage = pages[i + 1];
			if(nextpage) {
				nextpage.classList.add("active");
				pages[i].classList.remove("active");
				break;
			}
		}
	}
	updateTimeline();
}

function prevPage() {
	const pages = getPages();
	for(let i = pages.length - 1; i >= 0; i--) {
		if(pages[i].classList.contains("active")) {
			const nextpage = pages[i - 1];
			if(nextpage) {
				nextpage.classList.add("active");
				pages[i].classList.remove("active");
				break;
			}
		}
	}
	updateTimeline();
}

window.addEventListener("load", () => {
	qa("[next]").forEach(n => n.onclick = nextPage);
	qa("[prev]").forEach(n => n.onclick = prevPage);
})
