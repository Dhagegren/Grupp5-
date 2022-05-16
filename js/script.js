var myMap; // Min karta
var modal = document.getElementsByClassName("modal");//Reference to modal
var campingRef = document.getElementsByClassName("campingDivs");
var searchValue = window.location.search;
var SMAPI = "https://smapi.lnu.se/api/?api_key=uXpykX9P"; //Smapi api
var srcValue =""; 
var campings = [];
var activeSide =0;
var skipPage = document.getElementsByClassName("nextPage");
var perPage = 5;

function init() {

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

	
	for (let i = 0; i < btn.length; i++) {
		btn[i].addEventListener("click", function(){
			showModal(this.id)
		});
	}
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
	request.open("GET", SMAPI + "&controller=establishment&method=getall&descriptions=camping&debug=true&format=json&nojsoncallback=1",true);
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
		search = search.toLowerCase();
        for (let i = 0; i < theResponse.length; i++) {
            if (theResponse[i].city.toLowerCase() == search || theResponse[i].municipality.toLowerCase() == search + " kommun" || theResponse[i].name.toLowerCase().includes(search) ||theResponse[i].province.toLowerCase() == search || theResponse[i].county.toLowerCase() == search+" län") {
				campings[i] = "<div class = itemDiv> <img src='img/camp2.jpg' alt='bild på camping'> <div class ='textDiv'> <h2>"+
				theResponse[i].name + "</h2> <p>5km från "+ theResponse[i].city + "</p> <p class ='showMap' > Visa på karta </p> <p class='betyg'>" +parseFloat(theResponse[i].rating) + "<span>/5</span></p>"+
				'</div> <button class="infoBtn" id='+theResponse[i].id+'> Info</button></div>';
				campingRef.innerHTML ="";
            }


        }
		print(0);

		let campingBtn = document.getElementsByClassName("infoBtn");
		for (let i = 0; i < campingBtn.length; i++) {
			campingBtn[i].addEventListener("click", openNext);
	
		}


    }
}

function print(start){
	start=parseInt(activeSide);
	for (let i = start; i < start+5; i++) {
		if (activeSide+i-start+1 <= campings.length) {
			campingRef.innerHTML += campings[i];
		}
	}
	if (activeSide > 0) {
		skipPage[0].innerHTML ="<a href='page2.html?value="+srcValue+"&side="+parseInt(activeSide-perPage)+"'><</a>";
		
	}
	if (campings.length > activeSide+5){
		skipPage[0].innerHTML+="<a href='page2.html?value="+srcValue+"&side="+parseInt(activeSide+perPage)+"'>></a>";
	}
}

function openNext() {
	window.open("informationpage.html?value="+ this.id, "_self");
}