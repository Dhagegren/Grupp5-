
var modal = document.getElementsByClassName("modal");//Reference to modal

function init() {
	let btn = document.getElementsByClassName("myBtn");
	let span = document.getElementsByClassName("close")[0];

	
	for (let i = 0; i < btn.length; i++) {
		btn[i].addEventListener("click", showModal);
	}
	span.addEventListener("click", hideModal);
}
window.onload = init;
;

//Open up modal
function showModal() {
	modal[0].style.display = "block";
}

//Close modal
function hideModal() {
	modal[0].style.display = "none";
}

//Click outside modal to close
window.onclick = function(event) {
	if (event.target == modal[0]) {
		modal[0].style.display = "none";
	}
}
