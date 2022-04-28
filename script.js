
var modal = document.getElementsByClassName("modal");

function init() {
	let btn = document.getElementsByClassName("myBtn");
	let span = document.getElementsByClassName("close")[0];

	console.log(modal[0]);
	
	for (let i = 0; i < btn.length; i++) {
		btn[i].addEventListener("click", showModal);
	}
	span.addEventListener("click", hideModal);
}
window.onload = init;

// When the user clicks on the button, open the modal
function showModal() {
	modal[0].style.display = "block";
}

// When the user clicks on <span> (x), close the modal
function hideModal() {
	modal[0].style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target == modal[0]) {
		modal[0].style.display = "none";
	}
}
