var mymap; // Min karta

var knappKarta;
var svgKarta;
var knappLista;
var svgLista;
var knappAktiviteter;
var knappMat;
var mapElem;
var listElem;
var svgAktiviteter;
var svgMat;
var SMAPI = "https://smapi.lnu.se/api/?api_key=uXpykX9P";
var getCamp = window.location.search;
var campId ="";
var latCamp;
var lngCamp;
//ny kod för att ta fram matställen
var matRef;

function init(){
	getCamp = new URLSearchParams(getCamp);
	campId = getCamp.get("value");
	console.log(campId);
	requestCamp();
    initMap1();
	knappKarta = document.getElementById("knappKarta");
	knappLista = document.getElementById("knappLista");
	knappAktiviteter = document.getElementById("aktivitetsknapp");
	knappMat = document.getElementById("matknapp");
	mapElem = document.getElementById("map");
	listElem = document.getElementById("listan")
	svgKarta = document.getElementById("bildkarta");
	svgLista = document.getElementById("bildlista");
	svgAktiviteter = knappAktiviteter.firstChild;
	svgMat = knappMat.firstChild;
	// eventListeners
	knappKarta.addEventListener("click", showMap);
	knappLista.addEventListener("click", showList);
	knappAktiviteter.addEventListener("click", showActive);
	knappMat.addEventListener("click", showFood);

	//ny kod för att ta fram matställen
	
	matRef=document.getElementsByClassName("bra")
	matRef = matRef[0];
	
}

window.addEventListener("load", init);

function requestCamp(){
	let request = new XMLHttpRequest(); // Object för Ajax-anropet
	request.open("GET", SMAPI + "&controller=establishment&method=getall&ids="+ campId + "&debug=true&format=json&nojsoncallback=1",true);
	request.send(null); // Skicka begäran till servern
	request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
		if (request.readyState == 4)
			if (request.status == 200) checkCamp(request.responseText);
			else console.log("yes very many");
	}
}

function checkCamp(response){
	let theResponse = JSON.parse(response).payload[0];//Konverterar json svaret
	let picture = document.getElementsByClassName("picture")[0];
	picture.children[2].innerHTML = theResponse.name;
	picture.children[3].innerHTML = parseFloat(theResponse.rating) + "/5";
	picture.children[4].innerHTML = theResponse.address;
	let beskrivning = document.getElementsByClassName("beskrivning")[0];
	beskrivning.children[0].innerHTML = theResponse.text;
	latCamp = theResponse.lat;
	lngCamp = theResponse.lng;
	requestActivity();
}

function initMap1() {
	myMap = new google.maps.Map(
			document.getElementById('map'),
			{
				center: {lat:56.13708498823629, lng:15.584851190648239},
				zoom: 11,
				styles: [
					{featureType:"poi", stylers:[{visibility:"off"}]},  // No points of interest.
					{featureType:"transit.station",stylers:[{visibility:"off"}]}  // No bus stations, etc.
				]
			}
		);
} // End initMap

function showMap(){
	if (mapElem.classList.contains("hidden")){
		listElem.classList.add("hidden");
		mapElem.classList.remove("hidden");
		knappLista.style.backgroundColor ="white";
		knappLista.style.color ="black";
		svgLista.src = "ikoner/menuSvart.svg";
		knappKarta.style.backgroundColor = "#290cad";
		knappKarta.style.color = "white";
		svgKarta.src = "ikoner/kartaVit.svg"
	}
	else {
		
		return;
	}
}

function showList(){
	if (listElem.classList.contains("hidden")){
		mapElem.classList.add("hidden");
		listElem.classList.remove("hidden");
		knappKarta.style.backgroundColor ="white";
		knappKarta.style.color ="black";
		svgKarta.src = "ikoner/kartaSvart.svg";
		knappLista.style.backgroundColor = "#290cad";
		knappLista.style.color = "white";
		svgLista.src = "ikoner/menuVit.svg"
	}
	else {
		
		return;
	}
}

function showActive(){
	if (knappMat.classList.contains("active")){
		knappMat.classList.remove("active");
		svgMat.src = "ikoner/restaurantSvart.svg";
		knappAktiviteter.classList.add("active");
		svgAktiviteter.src = "ikoner/aktiviteterVit.svg"
		requestActivity();
		
	}
	else {
		return;
	}
}

function showFood(){
	if (knappAktiviteter.classList.contains("active")){
		knappAktiviteter.classList.remove("active");
		svgAktiviteter.src = "ikoner/aktiviteterSvart.svg";
		knappMat.classList.add("active");
		svgMat.src = "ikoner/restaurantVit.svg"
		requestMat();
		
	}
	else {
		return;
	}
}

 function requestMat(){
 	let request = new XMLHttpRequest();
 	request.open("GET", SMAPI +"&controller=food&method=getfromlatlng&lat="+latCamp+"&lng="+lngCamp+"&radius=30&format=json&nojsoncallback=1", true );
 	request.send(null);
 	request.onreadystatechange=function(){
 		if (request.readyState==4)
 			if( request.status==200) checkFood(request.responseText);
 			else console.log("hittas inte")
			
 	}
 	function checkFood(response){
 		let foodResponse = JSON.parse(response);
 		let tempFood = "";
 		foodResponse = foodResponse.payload
 		for (let i=0; i<foodResponse.length; i++){
 			tempFood += "<div class=listobjekt> <h3>" + foodResponse[i].name+ "</h3> <ul> <li>" + foodResponse[i].search_tags + "</li> </ul> </div>" ;
 			matRef.innerHTML=tempFood;
			
		}

	}
 }

function requestActivity(){
	let request = new XMLHttpRequest();
	request.open("GET", SMAPI +"&controller=activity&method=getfromlatlng&lat="+latCamp+"&lng="+lngCamp+"&radius=30&format=json&nojsoncallback=1", true );
	request.send(null);
	request.onreadystatechange=function(){
		if (request.readyState==4)
			if( request.status==200) checkActivity(request.responseText);
			else console.log("hittas inte")
			
	}
	function checkActivity(response){
		let activityResponse = JSON.parse(response);
		let tempActivity = "";
		activityResponse = activityResponse.payload
		for (let i=0; i<activityResponse.length; i++){
			tempActivity += " <div class=listobjekt> <h3>" + activityResponse[i].name+ "</h3> <ul> <li>" + activityResponse[i].description + "</li> </ul> </div>" ;
			matRef.innerHTML=tempActivity;
			
		}

	}
}



