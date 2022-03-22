function init(){

document.getElementById('checkIn').addEventListener("click", function() {
	document.querySelector('.bg-modal').style.display = "flex";
});

document.querySelector('.close').addEventListener("click", function() {
	document.querySelector('.bg-modal').style.display = "none";
});

document.querySelector('.close2').addEventListener("click", function() {
	document.querySelector('.bg-modal').style.display = "none";
});

}