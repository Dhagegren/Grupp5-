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
var moreText; 
var btnMoreText;
var phoneDiv;
var websiteDiv;
var places;
var myMarkers;
const infoWindow = new google.maps.InfoWindow();


function init(){
	getCamp = new URLSearchParams(getCamp);
	campId = getCamp.get("value");
	console.log(campId);
	requestCamp();
	moreText = document.getElementById("more");
	btnMoreText = document.getElementById("visaMer");
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
	websiteDiv = document.getElementById("websiteDiv");
	phoneDiv = document.getElementById("phoneDiv");


	//ny kod för att ta fram matställen
	
	matRef=document.getElementsByClassName("bra")
	matRef = matRef[0];
	getReviews();
	btnMoreText.addEventListener("click", visaMerText);
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
	let text = theResponse.text;
	let words = text.split(" ");
	let part1 = words.splice(0,120);
	let part2 = words.splice(0);
	let text1 = part1.join(" ");
	let text2 = part2.join(" ");
	beskrivning.children[0].innerHTML = text1;
	beskrivning.children[1].innerHTML = text2;
	latCamp = theResponse.lat;
	lngCamp = theResponse.lng;
	let phoneNum = theResponse.phone_number;
	let webSite = theResponse.website;
	websiteDiv.href = webSite;
	phoneDiv.innerHTML = phoneNum;
	initMap1();

	requestActivity();

}

function visaMerText() {
	if (more.style.display === "inline") {
	  btnMoreText.firstChild.src = "ikoner/cheveron-down.svg";
	  moreText.style.display = "none";
	} else {
	  btnMoreText.firstChild.src = "ikoner/cheveron-up.svg";
	  moreText.style.display = "inline";
	}
  }

function initMap1() {
	myMap = new google.maps.Map(
			document.getElementById('map'),
			{
				center: {lat:+latCamp, lng:+lngCamp},
				zoom: 11,
				styles: [
					{featureType:"poi", stylers:[{visibility:"off"}]},  // No points of interest.
					{featureType:"transit.station",stylers:[{visibility:"off"}]}  // No bus stations, etc.
				]
			}
		);
		let tempVar ={lat:+latCamp, lng:+ lngCamp};
		console.log(tempVar);
		var marker = new google.maps.Marker({
			position: tempVar,
			myMap,
			title: "Campingen",
		});
		console.log(marker);
		myMarkers = [marker];
		marker.setAnimation(google.maps.Animation.BOUNCE);

		marker.setMap(myMap);
		marker.addListener("click", toggleBounce);
} // End initMap

function toggleBounce() {
	if (myMarkers[0].getAnimation() !== null) {
		myMarkers[0].setAnimation(null);
	} else {
		myMarkers[0].setAnimation(google.maps.Animation.BOUNCE);
	}
  }

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
 		foodResponse = foodResponse.payload;
		removeMarker();
 		for (let i=0; i<foodResponse.length; i++){
 			tempFood += "<div class=listobjekt> <h3>" + foodResponse[i].name+ "</h3> <ul> <li>" + foodResponse[i].search_tags + "</li> </ul> </div>" ;
 			matRef.innerHTML=tempFood;
			 let tempVar ={lat:+foodResponse[i].lat, lng:+ foodResponse[i].lng};
			let tempDesc =foodResponse[i].name;
			var marker = new google.maps.Marker({
			position: tempVar,
				myMap,
				title:tempDesc,
			});
			myMarkers.push(marker);

			marker.setMap(myMap);
		}
		addMarker();

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
		removeMarker();
		let activityResponse = JSON.parse(response);
		let tempActivity = "";
		activityResponse = activityResponse.payload;
		for (let i=0; i<activityResponse.length; i++){
			tempActivity += " <div class=listobjekt> <h3>" + activityResponse[i].name+ "</h3> <ul> <li>" + activityResponse[i].description + "</li> </ul> </div>" ;
			matRef.innerHTML=tempActivity;
			console.log(activityResponse[i].lat); 
			let tempVar ={lat:+activityResponse[i].lat, lng:+ activityResponse[i].lng};
			let tempDesc =activityResponse[i].name;
			var marker = new google.maps.Marker({
			position: tempVar,
				myMap,
				title: tempDesc,
			}	
		);
		console.log(marker.getTitle());
		myMarkers.push(marker);
		marker.setMap(myMap)
		}
		addMarker();
	}
}

function addMarker(){
	for (let i = 0; i < myMarkers.length; i++) {
		myMarkers[i].addListener("click", () => {
			infoWindow.close();
			infoWindow.setContent(myMarkers[i].getTitle());
			infoWindow.open(myMarkers[i].getMap(), myMarkers[i]);
		  });
		
	}
}

function removeMarker(){
	console.log(myMarkers);
	for (let i = 1; i < myMarkers.length-1; i++) {
		myMarkers[i].setMap(null);
	}
}

function getReviews(){
	let request = new XMLHttpRequest();
	request.open("GET", SMAPI +"&controller=establishment&method=getreviews&id="+ campId +"&format=json&nojsoncallback=1", true );
	request.send(null);
	request.onreadystatechange=function(){
		if (request.readyState==4)
			if( request.status==200) checkReviews(request.responseText);
			else console.log("hittas inte")
}
}

function checkReviews(response){
	let reviewResponse = JSON.parse(response).payload;
	console.log(reviewResponse);
	reviewRef = document.getElementById("recensioner");
	console.log(reviewRef);
	tempText = "";
	if(reviewResponse.length >0){
		for (let i = 0; i < reviewResponse.length; i++) {
			tempText += "<div class=recensionerobjekt> <h3>"+ reviewResponse[i].name + "</h3> <p> "+ reviewResponse[i].comment + "</p></div>"
		}
		

	}
	else{
		tempText += "<div class=recensionerobjekt> <h3> Ingen kommentar</h3> <p>Tyvärr finns de igen kommentaren om denna camping för tillfället</p></div>"

	}
	reviewRef.innerHTML = tempText;
}


