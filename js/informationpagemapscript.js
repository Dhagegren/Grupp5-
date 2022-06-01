var mymap; // Min karta
var knappKarta; // Referens till knappen för kartan
var svgKarta; // Referens till ikonen till knappen för kartan
var knappLista; // Referens till list-knappen i mobilversionen
var svgLista; // Ikon till list-knappen
var knappAktiviteter; // Referens till knappen för att se närliggande aktiviteter
var knappMat; // Referens till knappen för att se närliggande matställen
var mapElem; // Referens till div elementet där kartan skapas
var listElem; // Referens till div elementet där alla element till listan skapas
var svgAktiviteter; // Referens till ikonen för aktivitetsknappen
var svgMat; // Referens till ikonen för matknappen
const SMAPI = "https://smapi.lnu.se/api/?api_key=uXpykX9P"; // Smapi nyckel
var getCamp = window.location.search; // Vilken camping
var campId = ""; // Variabel för att spara id:t för den camping som info sidan är om
var latCamp; // Variabel för att spara latituden för den valda campingen
var lngCamp; // Variabel för att spara longituden för den valda campingen
//ny kod för att ta fram matställen
var matRef; // Referens till div elementet där listans element skapas
var moreText; // Referens till texten till "visa mer" knappen
var btnMoreText; // Referens till "visa mer" knappen
var phoneDiv; // Referens till knappen för att få fram campingens telefonnummer
var websiteDiv; // Referens till knappen för att komma till campingens hemsida
var myMarkers; // En lista med alla markörer
var myMarkers2; // En array för markörerna förutom campingen, tömmer den för att kunna markera 
var copyPhone; // En referens till det div-element där campingens telefonnummer läggs
const infoWindow = new google.maps.InfoWindow();

function init() {
	getCamp = new URLSearchParams(getCamp);
	campId = getCamp.get("value");
	console.log(campId);
	requestCamp();
	requestFac();
	//Referenser 
	moreText = document.getElementById("more");
	btnMoreText = document.getElementById("visaMer");
	knappKarta = document.getElementById("knappKarta");
	knappLista = document.getElementById("knappLista");
	knappAktiviteter = document.getElementById("aktivitetsknapp");
	knappMat = document.getElementById("matknapp");
	mapElem = document.getElementById("map");
	copyPhone = document.getElementById("map2")
	listElem = document.getElementById("listan")
	svgKarta = document.getElementById("bildkarta");
	svgLista = document.getElementById("bildlista");
	svgAktiviteter = knappAktiviteter.firstChild;
	svgMat = knappMat.firstChild;
	websiteDiv = document.getElementsByClassName("webbLink");
	phoneDiv = document.getElementsByClassName("phoneLink");
	// eventListeners
	knappKarta.addEventListener("click", showMap);
	knappLista.addEventListener("click", showList);
	knappAktiviteter.addEventListener("click", showActive);
	knappMat.addEventListener("click", showFood);
	copyPhone.addEventListener("click", copyTele);
	//ny kod för att ta fram matställen
	
	matRef = document.getElementsByClassName("bra");
	matRef = matRef[0];
	getReviews();
	btnMoreText.addEventListener("click", visaMerText);
}
window.addEventListener("load", init);

//Hämtar campingen
function requestCamp() {
	let request = new XMLHttpRequest(); // Object för Ajax-anropet
	request.open("GET", SMAPI + "&controller=establishment&method=getall&ids="+ campId + "&debug=true&format=json&nojsoncallback=1",true);
	request.send(null); // Skicka begäran till servern
	request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
		if (request.readyState == 4)
			if (request.status == 200) checkCamp(request.responseText);
			else console.log("yes very many");
	}
}

//Kollar vilken camping
function checkCamp(response) {
	let ingenBeskrivning = document.getElementById("ingenBeskrivning");//om de inte finns någon beskrivning
	let close = document.getElementById("close");

	let theResponse = JSON.parse(response).payload[0];//Konverterar json svaret
	let picture = document.getElementsByClassName("picture")[0];//Hämtar bilden
	picture.style.background = "linear-gradient(to top, rgba(0, 0, 0, 1) 10%, rgba(0,0,0,.7) 20%, rgba(0,0,0,.4) 40%, rgba(0,0,0,0) 50%), url(campingImg/" + theResponse.id + ".jpg) no-repeat center";

	picture.style.backgroundSize = "cover"
	picture.children[2].innerHTML = theResponse.name;
	picture.children[3].innerHTML = parseFloat(theResponse.rating) + "/5";
	picture.children[4].innerHTML = theResponse.address;
	close.children[0].innerHTML = "Nära " + theResponse.name;
	let beskrivning = document.getElementsByClassName("beskrivning")[0];
	let text = theResponse.text;
	let words = text.split(" ");
	let part1 = words.splice(0,120);
	let part2 = words.splice(0);
	let text1 = part1.join(" ");
	let text2 = part2.join(" ");
	
	if (text1.length < 1){
		ingenBeskrivning.style.display = "inline";
	}
	if (text2.length < 1) {
		btnMoreText.firstChild.style.display = "none";
	}
	beskrivning.children[0].innerHTML = text1;
	beskrivning.children[1].innerHTML = text2;
	latCamp = theResponse.lat;
	lngCamp = theResponse.lng;
	let phoneNum = theResponse.phone_number;//Telefonnummret
	let webSite = theResponse.website;//Hemsidan
	websiteDiv[0].href = webSite;
	websiteDiv[1].href = webSite;
	phoneDiv[0].alt = phoneNum;
	phoneDiv[1].innerHTML = phoneNum;
	initMap1();

	requestActivity();
}

//Funktion för att kopiera telefonnummret
function copyTele() {
	let copyText = phoneDiv[0].alt;//Hämta tel nr
	navigator.clipboard.writeText(copyText);
	alert("Kopierad till urklipp");
}

//Hämnta faciliteter
function requestFac() {
	console.log("dd")
	let request = new XMLHttpRequest(); // Object för Ajax-anropet
	request.open("GET", SMAPI + "&controller=accommodation&method=getall&descriptions=Camping&ids="+ campId + "&debug=true&format=json&nojsoncallback=1",true);
	request.send(null); // Skicka begäran till servern
	request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
		if (request.readyState == 4)
			if (request.status == 200) checkFac(request.responseText);
			else console.log("yes very many");
	}
}

//Hantera faciliteter och iconer
function checkFac(response) {
	const faciliteter = ["breakfast", "free_parking", "restaurant", "conference", "laundry_service", "wifi", "spa", "gym", "bar", "pet_friendly"];//Faciliteter i smapi
	const faciliteterSvenska = ["Frukost", "Gratis parkering", "Restaurang", "Konferans", "Tvätt", "Wifi", "Spa", "Gym", "Bar", "Djurvänligt"];//Factiliteter på svenska
	let ikoner = document.getElementById("ikoner");//Referens till ikonerna
	let theResponse = JSON.parse(response).payload[0];//Konverterar json svaret
	let responseArray = Object.values(theResponse);//Array med värdena på faciliteterna
	let x = responseArray.splice(5,10);
	let temp = "";//Temporär variabel för att kunna lägga in i innerHTML
	for (let i = 0; i < x.length; i++) {
		if (x[i] == "Y"){
			temp += "<div class=ikon> <img src=ikoner/" + faciliteter[i] + ".svg  alt=" + faciliteterSvenska[i] + "> <p>" + faciliteterSvenska[i] + "</p> </div>";
		}
	}
	ikoner.innerHTML = temp;
}

//Funktion för att visa mer text
function visaMerText() {
	if (moreText.style.display === "inline") {
	  btnMoreText.firstChild.src = "ikoner/cheveron-down.svg";
	  moreText.style.display = "none";
	}
	else {
	  btnMoreText.firstChild.src = "ikoner/cheveron-up.svg";
	  moreText.style.display = "inline";
	}
}

//Skapa en ny karta
function initMap1() {
	myMap = new google.maps.Map(
		document.getElementById('map'), {
			center: {lat:+latCamp, lng:+lngCamp},
			zoom: 11,
			styles: [
				{featureType:"poi", stylers:[{visibility:"off"}]},  // No points of interest.
				{featureType:"transit.station",stylers:[{visibility:"off"}]}  // No bus stations, etc.
			]
		}
	);
	let tempVar ={lat:+latCamp, lng:+ lngCamp};//Centrera kartan på campingen
		
	let marker = new google.maps.Marker({
		position: tempVar,
		myMap,
		title: "Campingen",
	});//Skapa ny marker
		
	myMarkers = [marker];
	marker.setAnimation(google.maps.Animation.BOUNCE);

	marker.setMap(myMap);
	marker.addListener("click", toggleBounce);
} // End initMap

//funktion för att få marker att studsa
function toggleBounce() {
	if (myMarkers[0].getAnimation() !== null) {
		myMarkers[0].setAnimation(null);
	}
	else {
		myMarkers[0].setAnimation(google.maps.Animation.BOUNCE);
	}
}

//Visa kartan
function showMap(){
	if (mapElem.classList.contains("hidden")) {
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

//Visa listan
function showList() {
	if (listElem.classList.contains("hidden")) {
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

//Visa aktiv
function showActive() {
	if (knappMat.classList.contains("active")) {
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

//Visa maten
function showFood() {
	if (knappAktiviteter.classList.contains("active")) {
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

//Hämta mat i närheten
 function requestMat() {
 	let request = new XMLHttpRequest();
 	request.open("GET", SMAPI +"&controller=food&method=getfromlatlng&lat="+latCamp+"&lng="+lngCamp+"&radius=30&format=json&nojsoncallback=1", true);
 	request.send(null);
 	request.onreadystatechange=function() {
 		if (request.readyState==4)
 			if(request.status==200) checkFood(request.responseText);
 			else console.log("hittas inte");
 	}
	 //Hantera svaret med mat i närheten
 	function checkFood(response){
 		let foodResponse = JSON.parse(response);//Hantera responsen
 		let tempFood = "";//Temp variabel för maten
 		foodResponse = foodResponse.payload;
		myMarkers2=[]; //tömmer arrayen
		removeMarker();
 		for (let i=0; i<foodResponse.length; i++) {
			  
			tempFood += "<div class=listobjekt > <h3>" + foodResponse[i].name+ "</h3> <ul> <li>" + foodResponse[i].search_tags + "</li> <li> Betyg: " +parseFloat (foodResponse[i].rating) + "/5 </li> </ul> </div>" ;
 			matRef.innerHTML=tempFood;
			
			let tempVar ={lat:+foodResponse[i].lat, lng:+ foodResponse[i].lng};// lat lng för mat plats
			let tempDesc =foodResponse[i].name; // beskrivning av matplats
			
			let marker = new google.maps.Marker({
			position: tempVar,
				myMap,
				title:tempDesc,
			});//Skapa en marker 
			myMarkers.push(marker);
			myMarkers2.push(marker); //pushar in i den andra markörarrayen
			marker.setMap(myMap);
		}
		addMarker();
		let listElements = document.getElementsByClassName("listobjekt");//Referens
		for (i=0; i<listElements.length; i++) {
			listElements[i].addEventListener("click", activeList);
		}
	}
}

//Hämta aktiviteter i närheten
function requestActivity(){
	let request = new XMLHttpRequest();
	request.open("GET", SMAPI +"&controller=activity&method=getfromlatlng&lat="+latCamp+"&lng="+lngCamp+"&radius=30&format=json&nojsoncallback=1", true);
	request.send(null);
	request.onreadystatechange=function() {
		if (request.readyState==4)
			if( request.status==200) checkActivity(request.responseText);
			else console.log("hittas inte")
			
	}
	//Hantera aktiviteter i närheten
	function checkActivity(response) {
		removeMarker();
		let activityResponse = JSON.parse(response);//Hantera svaret
		let tempActivity = "";//Temp variabel för aktiviteter
		activityResponse = activityResponse.payload;
		myMarkers2=[];
		for (let i=0; i<activityResponse.length; i++) {
			tempActivity += " <div class=listobjekt> <h3>" + activityResponse[i].name+ "</h3> <ul> <li>" + activityResponse[i].description + "</li> <li> Betyg: " + parseFloat(activityResponse[i].rating)+ "/5 </li> </ul> </div>" ;
			matRef.innerHTML=tempActivity;
			
			let tempVar ={lat:+activityResponse[i].lat, lng:+ activityResponse[i].lng};//Lat lng för aktiviteter
			let tempDesc =activityResponse[i].name;//namnet på aktiviten
			let marker = new google.maps.Marker({
			position: tempVar,
				myMap,
				title: tempDesc,
			}//Skapa en marker	
			);
			myMarkers.push(marker);
			myMarkers2.push(marker);//pushar in i den andra markör arrayen
			marker.setMap(myMap)
		}
		addMarker();
		
		let listElements = document.getElementsByClassName("listobjekt");//referens till list objekt
		for (i=0; i<listElements.length; i++) {
			listElements[i].addEventListener("click", activeList);
		}
	}
}

//Lägger till info om platserna i info ruta
function addMarker() {
	for (let i = 0; i < myMarkers.length; i++) {
		myMarkers[i].addListener("click", () => {
			infoWindow.close();
			infoWindow.setContent(myMarkers[i].getTitle());
			infoWindow.open(myMarkers[i].getMap(), myMarkers[i]);
		  });
		
	}
}

//tar bort markers
function removeMarker() {
	for (let i = 1; i < myMarkers.length; i++) {
		myMarkers[i].setMap(null);
	}
}

//Hämta reviews
function getReviews() {
	let request = new XMLHttpRequest();
	request.open("GET", SMAPI +"&controller=establishment&method=getreviews&id="+ campId +"&format=json&nojsoncallback=1", true );
	request.send(null);
	request.onreadystatechange=function() {
		if (request.readyState==4)
			if( request.status==200) checkReviews(request.responseText);
			else console.log("hittas inte")
}
}

//Hantera reviews
function checkReviews(response) {
	let reviewResponse = JSON.parse(response).payload;
	let reviewRef = document.getElementById("recensioner");//Referens till reviews
	let tempText = "";// temporär variabel för att kunna skriva ut reviews sen
	if(reviewResponse.length > 0) {
		for (let i = 0; i < reviewResponse.length; i++) {
			tempText += "<div class=recensionerobjekt> <h3>"+ reviewResponse[i].name + "</h3> <p> "+ reviewResponse[i].comment + "</p></div>"
		}
	}
	else {
		let ingaReview = document.getElementById("ingarecensioner");//Referens till inga reviews
		ingaReview.style.display = "inline";

	}
	reviewRef.innerHTML = tempText;
}

//Aktiva listan
function activeList() {
	let className = document.getElementsByClassName("listobjekt");//Referens
	for(i=0; i<className.length;i++) {
		className[i].classList.remove("changeColor");	
	}
	this.classList.add("changeColor");
	for(y=0; y < myMarkers2.length; y++) {
		className[y].setAttribute("id", y);
	  	infoWindow.close();
	  	infoWindow.setContent(myMarkers2[this.id].getTitle());
	   	infoWindow.open(myMarkers2[this.id].getMap(), myMarkers2[this.id]);
	}
}
