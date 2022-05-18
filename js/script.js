var myMap; // Min karta
var modal = document.getElementsByClassName("modal");//Reference to modal
var campingRef = document.getElementsByClassName("campingDivs");
var searchValue = window.location.search;
var SMAPI = "https://smapi.lnu.se/api/?api_key=uXpykX9P"; //Smapi api
var srcValue =""; 
var campings = [{name:"",
				city:"",
				rating:"",
				id:""}];
var activeSide =0;
var skipPage = document.getElementsByClassName("nextPage");
var perPage = 5;
var sorter;
var theResponse;
		// name, city, rating, id
function init() {
	sorter = document.getElementById("sorter");
	for (let i = 0; i < sorter.length; i++) {
		console.log(sorter[i]);
		sorter[i].addEventListener("click", sortCampings);
	}
	//sorter.addEventListener("change", sortCampings);
	skipPage = skipPage[0];
	initMap();
	console.log(campingRef);
	campingRef = campingRef[0];
    searchValue = new URLSearchParams(searchValue);
    srcValue = searchValue.get("value");
	if (searchValue.has("side")) {
		activeSide=parseInt(searchValue.get("side"));
		console.log(activeSide);
	}
    requestCamping();
	let btn = document.getElementsByClassName("myBtn");//Reference to button
	let span = document.getElementsByClassName("close");//Reference to span element
	//Make all buttons clickable

	let checkboxes = document.getElementsByClassName("modalCheck"); // Filterknaparna
	for (let i = 0; i < checkboxes.length; i++) {
		checkboxes[i].addEventListener("click", requestCamping);
	}
	
	for (let i = 0; i < btn.length; i++) {
		btn[i].addEventListener("click", function(){
			showModal(this.id)
		});
	}
	var input = document.getElementById("searchBar");
	input.addEventListener("input", function(event) {
		console.log("hej");
		console.log(input.value);
		srcValue = input.value;
		getCamping();
	})
	input.addEventListener("keypress", function(event){
        if (event.key ==="Enter") 
        {
            event.preventDefault();
			console.log(input.value);
			let search = input.value;
			window.open("page2.html?value="+ search, "_self");
            searchBtn.click();
        }
    });

	for(let i = 0; i < span.length; i++){
		span[i].addEventListener("click", hideModal);
	}

}
window.onload = init;

//Open up modal
function showModal(id) {
	switch (id) {
		case "sortBtn":
			modal[0].style.display = "block";
			activeModal = modal[0]
			break;
		case "filterBtn":
			modal[1].style.display = "block";
			activeModal = modal[1]
			break;
		case "mapBtn":
			modal[2].style.display = "block"
			activeModal = modal[2]
			break;
		default:
			break;
	}
	//modal[2].style.display = "block";

}

//Close modal
function hideModal() {
	//for(let i = 0; i < modal.length; i++){
	//	modal[i].style.display = "none";
	//}
	activeModal.style.display = "none";
	activeModal = null;
}

//Click outside modal to close
window.onclick = function(event) {
	if (event.target == activeModal) {
		hideModal();
	}
}

function initMap() {
	myMap = new google.maps.Map(
			document.getElementById('map'),
			{
				center: {lat:56.13708498823629, lng:15.584851190648239},
				zoom: 12,
				styles: [
					{featureType:"poi", stylers:[{visibility:"off"}]},  // No points of interest.
					{featureType:"transit.station",stylers:[{visibility:"off"}]}  // No bus stations, etc.
				]
			}
		);		
} // End initMap

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
		theResponse = JSON.parse(response);//Konverterar json svaret
		theResponse = theResponse.payload;
		console.log(srcValue);
		getCamping();  
}
}
function getCamping() {
	let search = srcValue;
	theResponse = searchFilters(theResponse);
	campings = [{name:"",
	city:"",
	rating:"",
	id:""}];
	search = search.toLowerCase();
	for (let i = 0; i < theResponse.length; i++) {
		if (theResponse[i].city.toLowerCase().includes(search)|| theResponse[i].municipality.toLowerCase().includes(search) || theResponse[i].name.toLowerCase().includes(search) ||theResponse[i].province.toLowerCase().includes(search) || theResponse[i].county.toLowerCase().includes(search)) {
			let tempCamping = [{name:theResponse[i].name,
			city:theResponse[i].city,
			rating:parseFloat(theResponse[i].rating),
			id:theResponse[i].id}];
			campings.push(tempCamping)
		}
	}
	console.log(campings);
	let campingsRem = campings.shift();

	campings.sort(function(a, b){
		let x = a[0].name.toLowerCase();
		let y = b[0].name.toLowerCase();
		if (x < y) {return -1;}
		if (x > y) {return 1;}
		return 0;
	});
	print();
}

function sortCampings(){
	console.log(this);
	let sorting = this.value;
	console.log(sorting)
	if (sorting == "nameAsc") {
		campings.sort(function(a, b){
			let x = a[0].name.toLowerCase();
			let y = b[0].name.toLowerCase();
			if (x < y) {return -1;}
			if (x > y) {return 1;}
			return 0;
		});
	}
	else if (sorting == "nameDesc") {
		campings.sort(function(a, b){
			let x = a[0].name.toLowerCase();
			let y = b[0].name.toLowerCase();
			if (x < y) {return 1;}
			if (x > y) {return -1;}
			return 0;
		});
	}
	else if (sorting == "ratingAsc"){
		campings.sort(function(a, b){
			let x = a[0].rating;
			let y = b[0].rating;
			if (x < y) {return 1;}
			if (x > y) {return -1;}
			return 0;
		});
	}
	else if (sorting == "ratingDesc") {
		campings.sort(function(a, b){
			let x = a[0].rating;
			let y = b[0].rating;
			if (x < y) {return -1;}
			if (x > y) {return 1;}
			return 0;
		});
	}
	activeSide = 0;
	print();
}

function print(){
	let start=parseInt(activeSide);
	campingRef.innerHTML ="";
	for (let i = start; i < start+5; i++) {
		console.log(i)
		if (i+1 <= campings.length) {
			let tempCamping = campings[i];
			campingRef.innerHTML += "<div class = itemDiv> <img src='img/camp2.jpg' alt='bild på camping'> <div class ='textDiv'> <h2>"+
			tempCamping[0].name + "</h2> <p>5km från "+ tempCamping[0].city + "</p> <p class ='showMap' > Visa på karta </p> <p class='betyg'>" +tempCamping[0].rating + "<span>/5</span></p>"+
			'</div> <button class="infoBtn" id='+tempCamping[0].id+'> Info</button></div>';
		}
	}
	let campingBtn = document.getElementsByClassName("infoBtn");
	for (let i = 0; i < campingBtn.length; i++) {
		campingBtn[i].addEventListener("click", openNext);

	}
	console.log(activeSide)
	if (campings.length > activeSide+5){
		skipPage.innerHTML="<p id='"+perPage+"'>></p>";
	}
	else skipPage.innerHTML="";
	if (activeSide > 0) {
		skipPage.innerHTML+="<p id='"+-perPage+"'><</p>";
		
	}
	for (let i = 0; i < skipPage.children.length; i++) {
		skipPage.children[i].addEventListener("click", changePage)
	}

}

function changePage() {
	let	num = this.id;
	activeSide = activeSide+parseInt(num);
	print();
}

function openNext() {
	window.open("informationpage.html?value="+ this.id, "_self");
}

function searchFilters(resp) { // Kollar om ett filter är itryckt och isåfall vilket och sorterar därefter
	let ixList = [];

	let smaland = document.getElementById("smaland");
	let oland = document.getElementById("oland");
	let strand = document.getElementById("strand");
	let natur = document.getElementById("natur");
	let wifi = document.getElementById("wifi");

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
		console.log(ixList);
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

	if (wifi.checked == true) {
		for (let i = 0; i < resp.length; i++) {
			let aResp = accommodationfilter(resp[i].id, []);
			console.log(aResp); //----------------------------###
			if (aResp.wifi == "Y") {
				ixList.push(i);
				console.log("Wifi"); //----------------------------###
			}
		}
		resp = removeNonIndexed(resp, ixList);	
		ixList = [];
	}

	return resp;
}

function removeNonIndexed(resp, ixList) { // Tar bort alla campingar som inte indexerats ur listan
	if (ixList.length != 0) {
		let newResp = [];
		
		for (let i = 0; i < ixList.length; i++) {
			let ix = ixList[i];
			newResp.push(resp[ix]);
		}
		console.log("dum jävel")
		return newResp;
	}
	
	return "";
}

function accommodationfilter(campId, accResp) { // Kollar om accResp är tom, isåfall gör anrop, annars hämta värdet vi letar efter
	if (accResp.length == 0) {
		accommodationData(campId);
	}

	else {
		for (let i = 0; i < accResp.length; i++) {
			if (accResp[i].id == campId) {
				console.log(accResp[i]); //----------------------------###
				return accResp[i];
			}
		}
	}
}

function accommodationData(id) { // ajax-anrop för att kunna hämta data listat under accommodations i SMAPI
	let campId = id;
	let request = new XMLHttpRequest();
	request.open("GET", SMAPI + "&controller=accommodation&method=getall&descriptions=camping&debug=true", true);
	request.send();
	request.onreadystatechange = function () {
		if (request.readyState == 4) {
			if (request.status == 200) {
				let aResp = JSON.parse(request.responseText).payload;
				accommodationfilter(campId, aResp);
			}
			else console.log("Someting very many wrong D:")
		}
    };
}
