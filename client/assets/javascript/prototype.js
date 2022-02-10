// just some javascript to make the page minimally interactive without a server (yet)
// should be replaced once server-side stuff gets filled in

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

function nextPage() {
	const pages = getPages();
	for(let i = 0; i < pages.length; i++) {
		if(pages[i].classList.contains("active")) {
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

window.onload = () => {
	document.querySelectorAll("[next]").forEach(n => n.onclick = nextPage);
	document.querySelectorAll("[prev]").forEach(n => n.onclick = prevPage);
}
