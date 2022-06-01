var myMap; // Min karta
var modal = document.getElementsByClassName("modal");//Reference to modal
var campingRef = document.getElementsByClassName("campingDivs");
var searchValue = window.location.search;
var SMAPI = "https://smapi.lnu.se/api/?api_key=uXpykX9P"; //Smapi api
var srcValue =""; 
var campings = [{name:"",
				city:"",
				rating:"",
				id:""}];//Array för att samla in alla campingar till lokal sortering osv
var activeSide = 0;// Kollar vilken sida vi är på
var activeModal; // Kollar vilken modal som är öppen
var skipPage = document.getElementsByClassName("nextPage");//Referens till knappar för next och prev page
var perPage = 5;//Variabel för per page
var sorter; //referens till sortering
var theResponse;//Referens till svaret vi får för att kunna använda alla funktioner	
var myMarkers =[];//Array för att spara alla markers på google maps
const infoWindow = new google.maps.InfoWindow();// Referens till google maps info windows
		// name, city, rating, id

function init() { // När sidan först laddas in
	campingRef = campingRef[0];
	skipPage = skipPage[0];
	let btn = document.getElementsByClassName("myBtn");//Reference to button
	let span = document.getElementsByClassName("close");//Reference to span element
	let checkboxes = document.getElementsByClassName("modalCheck"); // När någon av checkboxarna för filtrering och sortering ändras uppdateras sökningen
	let filterCall = sessionStorage.getItem("filterChecked"); // Data om vilken knapp på startsidan som valts skickas med
	let modalFilters = document.getElementsByClassName("modalFilters"); // Filterfunktionen i modalen synkas med den vanliga filterfunktionen så att den ska funka i båda versionerna
	let modalPrice = document.getElementsByClassName("modalPrice"); // Prisklasserna synkas på samma sätt som filtren för att fungera i mobilversionen
	let input = document.getElementById("searchBar");
	sorter = document.getElementsByClassName("sorter");
	searchValue = new URLSearchParams(searchValue);
	srcValue = searchValue.get("value");
	if (filterCall != null) { // Sålänge datan inte är tom, kalla på autoFilter (som applicerar rätt filter)
		autoFilter();
	}
	initMap();
	if (searchValue.has("side")) {
		activeSide=parseInt(searchValue.get("side"));
	}
    requestCamping();
	//Lägger till event listeners
	for (let i = 0; i < checkboxes.length; i++) {
		checkboxes[i].addEventListener("change", requestCamping);
	}
	for (let i = 0; i < modalFilters.length; i++) {
		modalFilters[i].addEventListener("change", filterSync);
	}
	for (let i = 0; i < modalPrice.length; i++) {
		modalPrice[i].addEventListener("change", priceSync);
	}
	for (let i = 0; i < btn.length; i++) {
		btn[i].addEventListener("click", function() {
			showModal(this.id)
		});
	}
	for (let i = 0; i < sorter.length; i++) {
		sorter[i].addEventListener("click", sortCampings);
	}
	input.addEventListener("input", function(event) {
		srcValue = input.value;
		getCamping();
	})
	input.addEventListener("keypress", function(event){
        if (event.key ==="Enter") {
            event.preventDefault();
			let search = input.value;
			window.open("page2.html?value="+ search, "_self");
            searchBtn.click();
        }
    });
	for(let i = 0; i < span.length; i++) {
		span[i].addEventListener("click", hideModal);
	}
}
window.onload = init;


//Öppnar upp modal
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
			let lat = 57.17112;
			let lng = 15.34419;
			let myLatLng = new google.maps.LatLng(lat,lng);
			let zoom = 8;
			myMap.setZoom(zoom);
			myMap.setCenter(myLatLng);
			break;
		default:
			break;
	}
}

//Close modal
function hideModal() {
	activeModal.style.display = "none";
	activeModal = null;
}

//Click outside modal to close
window.onclick = function(event) {
	if (event.target == activeModal) {
		hideModal();
	}
}
//Skapar en karta
function initMap() {
	myMap = new google.maps.Map(
			document.getElementById('map'),
			{
				center: {lat:57.17112, lng:15.34419},
				zoom: 8,
				styles: [
					{featureType:"poi", stylers:[{visibility:"off"}]},  // No points of interest.
					{featureType:"transit.station",stylers:[{visibility:"off"}]}  // No bus stations, etc.
				]
			}
		);		
} // End initMap
//Uppdatering för mapen
function showMyMap(){
	modal[2].style.display = "block"
	activeModal = modal[2];
	let latlong= this.id.split(",");//Splittar id från stället
	let lat = latlong[1];// tar ut lat
	let lng = latlong[2];// tar ut lng
	let myLatLng = new google.maps.LatLng(lat,lng);//Skapar ny google maps lat lng
	let zoom = 15;// skapar nytt zoom värde
	myMap.setZoom(zoom);
	myMap.setCenter(myLatLng);
}

//Hämta alla campingar
function requestCamping() {
	let request = new XMLHttpRequest(); // Object för Ajax-anropet
	request.open("GET", SMAPI + "&controller=establishment&method=getall&descriptions=camping&debug=true", true);
	request.send(null); // Skicka begäran till servern
	request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
		if (request.readyState == 4)
			if (request.status == 200) checkCity(request.responseText);
			else console.log("Could not find")
    };
	//Hanterar svaret
    function checkCity(response) {
		theResponse = JSON.parse(response);//Konverterar json svaret
		theResponse = theResponse.payload;
		getCamping();  
	}
}
//Funktion för att hantera alla campingar samt sortera ut vid uppdaterad sökning
function getCamping() {
	let search = srcValue;//Hämtar värdet från sökningen
	theResponse = searchFilters(theResponse);
	campings = [{name:"",
	city:"",
	rating:"",
	id:"",
	lat:"",
	long:""}];
	search = search.toLowerCase();
	for (let i = 0; i < theResponse.length; i++) {
		if (theResponse[i].city.toLowerCase().includes(search)|| theResponse[i].municipality.toLowerCase().includes(search) || theResponse[i].name.toLowerCase().includes(search) ||theResponse[i].province.toLowerCase().includes(search) || theResponse[i].county.toLowerCase().includes(search)) {
			let tempCamping = [{name:theResponse[i].name,
			city:theResponse[i].city,
			rating:parseFloat(theResponse[i].rating),
			id:theResponse[i].id,
			lat:theResponse[i].lat,
			long:theResponse[i].lng}];//skapar en camping som går att pusha
			campings.push(tempCamping);
			let tempVar ={lat:+theResponse[i].lat, lng:+ theResponse[i].lng};//Variabel för positionen
			let tempDesc =theResponse[i].name; //Variabel för namnet
	
			let marker = new google.maps.Marker({
			position: tempVar,
				myMap,
				title:tempDesc,
				id:theResponse[i].id
			});//Skapar en ny marker
			myMarkers.push(marker);
			marker.setMap(myMap);
		}
	}
	addMarker();
	let campingsRem = campings.shift(); //tar bort första värdet vid sorteringen

	campings.sort(function(a, b){
		let x = a[0].name.toLowerCase();
		let y = b[0].name.toLowerCase();
		if (x < y) {return -1;}
		if (x > y) {return 1;}
		return 0;
	});
	print();
}
//Funktion för att göra markers click bara och visa information
function addMarker(){
	for (let i = 0; i < myMarkers.length; i++) {
		myMarkers[i].addListener("click", () => {
			infoWindow.close();
			infoWindow.setContent("<div onClick = 'nextPage("+myMarkers[i].id+" )'>"+myMarkers[i].getTitle()+"</div>");
			infoWindow.open(myMarkers[i].getMap(), myMarkers[i]);
		  });
		
	}
}
//Funktion för att öppna nästa sida när man trycker på namnet på kartan
function nextPage(id){
	window.open("informationpage.html?value="+ id, "_self");
}
//Funktion för att sortera campingarna
function sortCampings(){
	let sorting = this.id;//Hämtar aktuella sorteringsmetoden

	if (sorting == "nameAsc" || sorting == "nameAscM") {
		campings.sort(function(a, b) {
			let x = a[0].name.toLowerCase();
			let y = b[0].name.toLowerCase();
			if (x < y) {return -1;}
			if (x > y) {return 1;}
			return 0;
		});
	}
	else if (sorting == "nameDesc" || sorting == "nameDescM") {
		campings.sort(function(a, b) {
			let x = a[0].name.toLowerCase();
			let y = b[0].name.toLowerCase();
			if (x < y) {return 1;}
			if (x > y) {return -1;}
			return 0;
		});
	}
	else if (sorting == "ratingAsc" || sorting == "ratingAscM") {
		campings.sort(function(a, b) {
			let x = a[0].rating;
			let y = b[0].rating;
			if (x < y) {return 1;}
			if (x > y) {return -1;}
			return 0;
		});
	}
	else if (sorting == "ratingDesc" || sorting == "ratingDescM") {
		campings.sort(function(a, b) {
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
//Funktion för att skriva ut resultaten
function print(){
	let start = parseInt(activeSide);//Kolla vilken sida vi är på
	campingRef.innerHTML ="";
	for (let i = start; i < start+5; i++) {
		if (i+1 <= campings.length) {
			let tempCamping = campings[i];// Referens för att enklare komma åt id och stad
			campingRef.innerHTML += "<div class = itemDiv> <img src='campingImg/" + tempCamping[0].id + ".jpg' alt='bild på camping'> <div class ='textDiv'> <h2>"+
			tempCamping[0].name + "</h2> <p>5km från "+ tempCamping[0].city + "</p> <p class ='showMap' id="+tempCamping[0].id +","+ tempCamping[0].lat+","+ tempCamping[0].long+"> Visa på karta </p> <p class='betyg'>" +tempCamping[0].rating + "<span>/5</span></p>"+
			'</div> <button class="infoBtn" id='+tempCamping[0].id+'> Info</button></div>';
		}
	}
	let campingBtn = document.getElementsByClassName("infoBtn");//Referns till knapparna
	//gör knapparna klickbara
	for (let i = 0; i < campingBtn.length; i++) {
		campingBtn[i].addEventListener("click", openNext);

	}
	let showMaps = document.getElementsByClassName("showMap");//referens till visa karta
	//gör visa karta clickbara
	for (let i = 0; i < showMaps.length; i++) {
		showMaps[i].addEventListener("click", showMyMap);
	}
	//Kollar om de finns fler sidor
	if (campings.length > activeSide+5) {
		skipPage.innerHTML="<button id='"+perPage+"'>></button>";
	}
	else skipPage.innerHTML="";
	//Kollar om de finns sidor backåt
	if (activeSide > 0) {
		skipPage.innerHTML+="<button id='"+-perPage+"'><</button>";
		
	}
	//Lägger till event listeners
	for (let i = 0; i < skipPage.children.length; i++) {
		skipPage.children[i].addEventListener("click", changePage)
	}

}

//Byter sida
function changePage() {
	let	num = this.id.split(",");//Hämtar vilken sida
	activeSide = activeSide+parseInt(num[0]);
	print();
}
//Funktion för att öppna campingens sida när man trycker på knappen
function openNext() {
	window.open("informationpage.html?value="+ this.id, "_self");
}

function autoFilter() { // Om en av de tre stora knapparna på första sidan väljs kommer denna funktion söka upp alla campingar och kryssa i rätt filter
	let filterCall = sessionStorage.getItem("filterChecked"); // Vilken knapp som valts på förstasidan hämtas från sessionStrorage
	let oland = document.getElementById("öland"); // Referenser till alla relevanta filter rutor till desktopversionen och mobilversionen sparas i variabler
	let strand = document.getElementById("strand");
	let natur = document.getElementById("natur");
	let olandM = document.getElementById("ölandM");
	let strandM = document.getElementById("strandM");
	let naturM = document.getElementById("naturM");

	if (filterCall == "oland") {
		oland.checked = true;
		olandM.checked = true;
	}

	else if (filterCall == "strand") {
		strand.checked = true;
		strandM.checked = true;
	}

	else if (filterCall == "natur") {
		natur.checked = true;
		naturM.checked = true;
	}
}

function filterSync() { // Om ett filter väljs i mobilversionen väljs det filtret i desktopversionen så att filtren funkar i båda versioner
	let smaland = document.getElementById("småland"); // Referenser till samtliga filter så att man kan kryssa i eller ur rutorna samtidigt som det görs i modalen
	let oland = document.getElementById("öland");
	let strand = document.getElementById("strand");
	let natur = document.getElementById("natur");

	if (this.name == "småland") {
		if (this.checked == true) {
			smaland.checked = true;
		}

		else {
			smaland.checked = false;
		}
	}

	else if (this.name == "öland") {
		if (this.checked == true) {
			oland.checked = true;
		}

		else {
			oland.checked = false;
		}
	}

	else if (this.name == "strand") {
		if (this.checked == true) {
			strand.checked = true;
		}

		else {
			strand.checked = false;
		}
	}

	else if (this.name == "natur") {
		if (this.checked == true) {
			natur.checked = true;
		}

		else {
			natur.checked = false;
		}
	}
}

function priceSync() { // Om en prisklass väljs i mobilversionen väljs samma i desktopversionen
	let price0 = document.getElementById("price0"); // En referens till elementet med id för varje prisklass
	let price1 = document.getElementById("price1");
	let price2 = document.getElementById("price2");
	let price3 = document.getElementById("price3");

	let priceId = this.id // Denna variabel används för att kolla id:t på den valda prisklassen

	if (priceId.slice(0, 6) == "price0") {
		price0.checked = true;
	}

	else if (priceId.slice(0, 6) == "price1") {
		price1.checked = true;
	}

	else if (priceId.slice(0, 6) == "price2") {
		price2.checked = true;
	}

	else if (priceId.slice(0, 6) == "price3") {
		price3.checked = true;
	}
}

function searchFilters(resp) { // Kollar om ett filter är itryckt och isåfall vilket och sorterar därefter
	let ixList = []; // En array som används för att indexera vilka campingar som matchar kraven för filtren

	let smaland = document.getElementById("småland"); // En variabel som innehåller en referens till checkbox elementet för småland filtret
	let oland = document.getElementById("öland"); // En variabel som innehåller en referens till checkbox elementet för öland filtret
	let strand = document.getElementById("strand"); // En variabel som innehåller en referens till checkbox elementet för strand filtret
	let natur = document.getElementById("natur"); // En variabel som innehåller en referens till checkbox elementet för natur filtret
	
	let price1 = document.getElementById("price1"); // En variabel som innehåller en referens till ett av radio button elementen till prisklass filtret
	let price2 = document.getElementById("price2"); // En variabel som innehåller en referens till ett av radio button elementen till prisklass filtret
	let price3 = document.getElementById("price3"); // En variabel som innehåller en referens till ett av radio button elementen till prisklass filtret


	if (smaland.checked == true) { // Om filtret för småland är ikryssat...
		for (let i = 0; i < resp.length; i++) {
			if (resp[i].province == "Småland") { // ...kolla igenom listan med campingar efter campingar som har småland som provins...
				ixList.push(i); // ...och indexera det
			}
		}
		resp = removeNonIndexed(resp, ixList); // Skicka in indexlistan och listan med campingar till removeNonIndexed (där endast de indexerade campingarna sparas)
		ixList = [];
	}
	// Samma (eller liknande) sak görs för resterande filter:

	if (oland.checked == true) {
		for (let i = 0; i < resp.length; i++) {
			if (resp[i].province == "Öland") {
				ixList.push(i);
			}
		}
		resp = removeNonIndexed(resp, ixList);
		ixList = [];
	}

	if (strand.checked == true) {
		for (let i = 0; i < resp.length; i++) {
			if (resp[i].text.includes("strand")) {
				ixList.push(i);
			}
		}
		resp = removeNonIndexed(resp, ixList);
		ixList = [];
	}

	if (natur.checked == true) {
		for (let i = 0; i < resp.length; i++) {
			if (resp[i].text.includes("natur")) {
				ixList.push(i);
			}
		}
		resp = removeNonIndexed(resp, ixList);	
		ixList = [];
	}


	if (price1.checked == true) {
		for (let i = 0; i < resp.length; i++) {
			if (resp[i].price_range.includes("0-25")) {
				ixList.push(i);
			}
		}
		resp = removeNonIndexed(resp, ixList);	
		ixList = [];
	}

	else if (price2.checked == true) {
		for (let i = 0; i < resp.length; i++) {
			if (resp[i].price_range.includes("250-500")) {
				ixList.push(i);
			}
		}
		resp = removeNonIndexed(resp, ixList);	
		ixList = [];
	}

	else if (price3.checked == true) {
		for (let i = 0; i < resp.length; i++) {
			if (resp[i].price_range.includes("500-1250")) {
				ixList.push(i);
			}
		}
		resp = removeNonIndexed(resp, ixList);	
		ixList = [];
	}

	return resp;
}

function removeNonIndexed(resp, ixList) { // Tar bort alla campingar som inte indexerats ur listan
	if (ixList.length != 0) {
		let newResp = []; // En array för attt innehålla den nya listan av campingar
		
		for (let i = 0; i < ixList.length; i++) {
			let ix = ixList[i]; // En variabel som tilldelas varje index som plockas ut ur index listan
			newResp.push(resp[ix]);
		}
		return newResp;
	}
	
	return "";
}
