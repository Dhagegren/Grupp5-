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
const SMAPI = "https://smapi.lnu.se/api/?api_key=uXpykX9P";
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
var myMarkers2; //array för markörerna förutom campingen, tömmer den för att kunna markera 
var copyPhone;
const infoWindow = new google.maps.InfoWindow();


function init() {
	getCamp = new URLSearchParams(getCamp);
	campId = getCamp.get("value");
	console.log(campId);
	requestCamp();
	requestFac();
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
	
	matRef=document.getElementsByClassName("bra")
	matRef = matRef[0];
	getReviews();
	btnMoreText.addEventListener("click", visaMerText);
}
window.addEventListener("load", init);



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

function checkCamp(response){
	let ingenBeskrivning = document.getElementById("ingenBeskrivning");
	let close = document.getElementById("close");

	let theResponse = JSON.parse(response).payload[0];//Konverterar json svaret
	let picture = document.getElementsByClassName("picture")[0];
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
	let phoneNum = theResponse.phone_number;
	let webSite = theResponse.website;
	websiteDiv[0].href = webSite;
	websiteDiv[1].href = webSite;
	phoneDiv[0].alt = phoneNum;
	phoneDiv[1].innerHTML = phoneNum;
	initMap1();

	requestActivity();

}

function copyTele(){
	let copyText = phoneDiv[0].alt;
	navigator.clipboard.writeText(copyText);
	alert("Kopierad till urklipp")

}

function requestFac(){
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

function checkFac(response){
	const faciliteter = ["breakfast", "free_parking", "restaurant", "conference", "laundry_service", "wifi", "spa", "gym", "bar", "pet_friendly"];
	const faciliteterSvenska = ["Frukost", "Gratis parkering", "Restaurang", "Konferans", "Tvätt", "Wifi", "Spa", "Gym", "Bar", "Djurvänligt"];
	let ikoner = document.getElementById("ikoner");
	let theResponse = JSON.parse(response).payload[0];//Konverterar json svaret
	let responseArray = Object.values(theResponse);
	let x = responseArray.splice(5,10);
	let temp = ""
	for (let i = 0; i < x.length; i++){
		if (x[i] == "Y"){
			temp += "<div class=ikon> <img src=ikoner/" + faciliteter[i] + ".svg  alt=" + faciliteterSvenska[i] + "> <p>" + faciliteterSvenska[i] + "</p> </div>";
		}
	}
	ikoner.innerHTML = temp;
}

function visaMerText() {
	if (moreText.style.display === "inline") {
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
		
		var marker = new google.maps.Marker({
			position: tempVar,
			myMap,
			title: "Campingen",
		});
		
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

function showList() {
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

function showActive() {
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

function showFood() {
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
		myMarkers2=[]; //tömmer arrayen
		removeMarker();
 		for (let i=0; i<foodResponse.length; i++){
			  
			tempFood += "<div class=listobjekt > <h3>" + foodResponse[i].name+ "</h3> <ul> <li>" + foodResponse[i].search_tags + "</li> <li> Betyg: " +parseFloat (foodResponse[i].rating) + "/5 </li> </ul> </div>" ;
 			matRef.innerHTML=tempFood;
			
			 let tempVar ={lat:+foodResponse[i].lat, lng:+ foodResponse[i].lng};
			let tempDesc =foodResponse[i].name;
			
			var marker = new google.maps.Marker({
			position: tempVar,
				myMap,
				title:tempDesc,
			});
			myMarkers.push(marker);
			myMarkers2.push(marker); //pushar in i den andra markörarrayen
			marker.setMap(myMap);
			
			
		}
		addMarker();
		let listElements = document.getElementsByClassName("listobjekt");
		for (i=0; i<listElements.length; i++){
			
			listElements[i].addEventListener("click", activeList);
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
		removeMarker();
		let activityResponse = JSON.parse(response);
		let tempActivity = "";
		activityResponse = activityResponse.payload;
		myMarkers2=[];
		for (let i=0; i<activityResponse.length; i++){
			tempActivity += " <div class=listobjekt> <h3>" + activityResponse[i].name+ "</h3> <ul> <li>" + activityResponse[i].description + "</li> <li> Betyg: " + parseFloat(activityResponse[i].rating)+ "/5 </li> </ul> </div>" ;
			matRef.innerHTML=tempActivity;
			
			let tempVar ={lat:+activityResponse[i].lat, lng:+ activityResponse[i].lng};
			let tempDesc =activityResponse[i].name;
			var marker = new google.maps.Marker({
			position: tempVar,
				myMap,
				title: tempDesc,
			}	
		);
		myMarkers.push(marker);
		myMarkers2.push(marker);//pushar in i den andra markör arrayen
		marker.setMap(myMap)
		}
		addMarker();
		
		var listElements = document.getElementsByClassName("listobjekt");
		for (i=0; i<listElements.length; i++){
			
			listElements[i].addEventListener("click", activeList);
			
		}
		
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
	
	for (let i = 1; i < myMarkers.length; i++) {
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
	
	reviewRef = document.getElementById("recensioner");

	console.log(reviewRef);
	tempText = "";
	if(reviewResponse.length >0){
		for (let i = 0; i < reviewResponse.length; i++) {
			tempText += "<div class=recensionerobjekt> <h3>"+ reviewResponse[i].name + "</h3> <p> "+ reviewResponse[i].comment + "</p></div>"
		}
		

	}
	else{
		let ingaReview = document.getElementById("ingarecensioner");
		ingaReview.style.display = "inline";

	}
	reviewRef.innerHTML = tempText;
}

function activeList(){
	let className = document.getElementsByClassName("listobjekt");
	for(i=0; i<className.length;i++){
		className[i].classList.remove("changeColor");	
	}

		this.classList.add("changeColor");
	for(y=0; y<myMarkers2.length;y++){
		className[y].setAttribute("id", y);
	  	infoWindow.close();
	  	infoWindow.setContent(myMarkers2[this.id].getTitle());
	   	infoWindow.open(myMarkers2[this.id].getMap(), myMarkers2[this.id]);
	}
}






