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
		// name, city, rating, id
function init() {
	sorter = document.getElementById("sorter");
	for (let i = 0; i < sorter.length; i++) {
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
        theResponse = theResponse.payload;
		search = search.toLowerCase();

        for (let i = 0; i < theResponse.length; i++) {
            if (theResponse[i].city.toLowerCase().includes(search)|| theResponse[i].municipality.toLowerCase().includes(search) || theResponse[i].name.toLowerCase().includes(search) ||theResponse[i].province.toLowerCase() == search || theResponse[i].county.toLowerCase().includes(search)) {
				let tempCamping = [{name:theResponse[i].name,
				city:theResponse[i].city,
				rating:parseFloat(theResponse[i].rating),
				id:theResponse[i].id}];
				campings.push(tempCamping)

            }


        }
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
	console.log(campings.length);
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