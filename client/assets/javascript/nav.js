function getPages() {
	const main = document.querySelector("main");
	return [...main.children].filter(n => n.classList.contains("page"));
}

function updateTimeline() {
	const page = document.querySelector(".page.active");
	const timelineNum = parseInt(page.dataset.timeline);
	const timeline = document.querySelector(".timeline");
	if(!timeline || isNaN(timelineNum)) {
		return;
	}
	
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
				const nextpageonload = nextpage.getAttribute("onload");
				if(nextpageonload) {
					(new Function(nextpageonload))();
				}
				
				nextpage.classList.add("active");
				pages[i].classList.remove("active");
				break;
			}
		}
	}
	
	// scroll to the top of the page on page advance
	(document.scrollingElement || document.documentElement).scrollTop = 0;
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

function goToPageIndex(index) {
	const pages = getPages();
	if(pages[index]) {
		qa(".page.active").forEach(n => n.classList.remove("active"));
		pages[index].classList.add("active");
		
		const nextpageonload = pages[index].getAttribute("onload");
		if(nextpageonload) {
			(new Function(nextpageonload))();
		}
	}
	updateTimeline();
}

window.addEventListener("load", () => {
	qa("[next]").forEach(n => n.onclick = nextPage);
	qa("[prev]").forEach(n => n.onclick = prevPage);
	
	qa("[modal-button]").forEach(enableModalButton);
})

function enableModalButton(btn) {
	const modal = id(btn.getAttribute("modal-button"));
		
	btn.addEventListener("click", () => {
		openModal(modal);
	});
}

function openModal(modal) {
	// open the modal 
	modal.style.display = "block";
	
	// functions to execute when the modal exits
	const onclose = [];
	// function to close the modal and execute all onclose functions
	const closeModal = () => {
		modal.style.display = "none";
		onclose.forEach(n => n());
	}
	
	// Get the <span> element that closes the modal
	// using modal.getElementsByClassName to get the one inside the
	// modal in case of multiple modals
	var span = modal.getElementsByClassName("modal-close")[0];

	// all the elements inside the modal that have the close-modal
	// attribute should close the modal when clicked
	modal.querySelectorAll("[close-modal]").forEach(n => {
		n.addEventListener("click", closeModal);
		onclose.push(() => n.removeEventListener("click", closeModal));
	})
	
	// When the user clicks on <span> (x), close the modal
	if(span) {
		span.onclick = closeModal;
	}

	// When the user clicks anywhere outside of the modal, close it
	const onclick = function(event) {
		if (event.target == modal) {
			closeModal();
		}
	}
	
	window.addEventListener("click", onclick);
	onclose.push(() => window.removeEventListener("click", onclick));
	
	const prom = new Promise(r => onclose.push(r));
	prom.close = closeModal;
	return prom;
}

function toast(message, timeout = 5000) {
	const el = document.body.appendChild(
		element("div", { class: "toast" }, message)
	);
	
	setTimeout(() => {
		el.classList.add("toast-exiting");
		setTimeout(() => el.remove(), 2000);
	}, timeout);
}
