
var modal = document.getElementsByClassName("modal");//Reference to modal
var campingRef = document.getElementsByClassName("campingDivs");
var searchValue = window.location.search;
var SMAPI = "https://smapi.lnu.se/api/?api_key=uXpykX9P"; //Smapi api
var srcValue =""; 

function init() {
	campingRef = campingRef[0];
    searchValue = new URLSearchParams(searchValue);
    srcValue = searchValue.get("value");
    requestCamping();
	let btn = document.getElementsByClassName("myBtn");//Reference to button
	let span = document.getElementsByClassName("close")[0];//Reference to span element
	//Make all buttons clickable

	let checkboxes = document.getElementsByClassName("modalCheck"); // Filterknaparna
	for (let i = 0; i < checkboxes.length; i++) {
		checkboxes[i].addEventListener("click", requestCamping);
	}
	
	for (let i = 0; i < btn.length; i++) {
		btn[i].addEventListener("click", showModal);
	}
	span.addEventListener("click", hideModal);
	var input = document.getElementById("searchBar");
	input.addEventListener("keypress", function(event){
        if (event.key ==="Enter") 
        {
            event.preventDefault();
			let search = input.value;
			window.open("page2.html?value="+ search, "_self");
            searchBtn.click();  
        }
    });
}
window.onload = init;

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

function requestCamping() {
	let request = new XMLHttpRequest(); // Object för Ajax-anropet
	request.open("GET", SMAPI + "&controller=establishment&method=getall&descriptions=camping&debug=true", true);
	request.send(null); // Skicka begäran till servern
	request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
		if (request.readyState == 4)
			if (request.status == 200) checkCity(request.responseText);
			else console.log("yes very many")
    };
    function checkCity(response){
        let theResponse = JSON.parse(response);//Konverterar json svaret
        let search = srcValue;
		let tempCamping = "";
        theResponse = theResponse.payload;

		theResponse = searchFilters(theResponse);

		console.log("Filtered: ");
		console.log(theResponse);
		
		search = search.toLowerCase();
        for (let i = 0; i < theResponse.length; i++) {
            if (theResponse[i].city.toLowerCase() == search || theResponse[i].municipality.toLowerCase() == search + " kommun" || theResponse[i].name.toLowerCase().includes(search) ||theResponse[i].province.toLowerCase() == search || theResponse[i].county.toLowerCase() == search + " län") {
				tempCamping += "<div class='campingDiv'><div class = itemDiv> <img src='img/camp2.jpg' alt='bild på camping'> <div class ='textDiv'> <h2>" + 
				theResponse[i].name + "</h2> <p>5km från " + theResponse[i].city + "</p> <p> Visa på karta </p> <p>" +parseFloat(theResponse[i].rating) + "/5</p>" +
				'</div> <button class="infoBtn" id=' + theResponse[i].id + '> Info</button></div></div>';
				campingRef.innerHTML = tempCamping;
            }
        }
		let campingBtn = document.getElementsByClassName("infoBtn");
		for (let i = 0; i < campingBtn.length; i++) {
			campingBtn[i].addEventListener("click", openNext);
		}
    }
}

function openNext() {
	window.open("informationpage.html?value="+ this.id, "_self");
}

// Filter funkar typ, blir det noll campingar som matchar alla filter går allt åt skogen tho
// Lägg till fler filter
function searchFilters(resp) {
	let ixList = [];

	let smaland = document.getElementById("smaland");
	let oland = document.getElementById("oland");
	let strand = document.getElementById("strand");
	let natur = document.getElementById("natur");

	if (smaland.checked == true) {
		for (let i = 0; i < resp.length; i++) {
			if (resp[i].province == "Småland") {
				ixList.push(i);
				console.log("Småland"); //----------------------------###
			}
		}
		resp = removeNonIndexed(resp, ixList);
		ixList = [];
	}

	if (oland.checked == true) {
		for (let i = 0; i < resp.length; i++) {
			if (resp[i].province == "Öland") {
				ixList.push(i);
				console.log("Öland"); //----------------------------###
			}
		}
		resp = removeNonIndexed(resp, ixList);
		ixList = [];
	}

	if (strand.checked == true) {
		for (let i = 0; i < resp.length; i++) {
			if (resp[i].text.includes("strand")) {
				ixList.push(i);
				console.log("Strand"); //----------------------------###
			}
		}
		resp = removeNonIndexed(resp, ixList);
		ixList = [];
	}

	if (natur.checked == true) {
		for (let i = 0; i < resp.length; i++) {
			if (resp[i].text.includes("natur")) {
				ixList.push(i);
				console.log("Natur"); //----------------------------###
			}
		}
		resp = removeNonIndexed(resp, ixList);	
		ixList = [];
	}

	return resp;
}

function removeNonIndexed(resp, ixList) {
	if (ixList.length != 0) {
		let newResp = [];
		
		for (let i = 0; i < ixList.length; i++) {
			let ix = ixList[i];
			newResp.push(resp[ix]);
		}

		return newResp;
	}
	
	return resp;
}