var SMAPI = "https://smapi.lnu.se/api/?api_key=uXpykX9P"; //Smapi api
var linkBoxes = document.getElementsByClassName("linkbox");
var searchBtn = document.getElementsByClassName("search");
//https://smapi.lnu.se/api/?api_key=uXpykX9P&controller=establishment&method=getall&descriptions=camping
function init(){
    searchBtn = searchBtn[0].children[1];
    searchBtn.addEventListener("click", requestCamping);
    var input = document.getElementById("searchBar");
    input.addEventListener("keypress", function(event){
        if (event.key ==="Enter") 
        {
            event.preventDefault();
            searchBtn.click();   
        }
    });
    popularCamping();
}



function popularCamping(){
    let request = new XMLHttpRequest(); // Object för Ajax-anropet
	request.open("GET", SMAPI + "&controller=establishment&method=getall&descriptions=camping&sort_in=desc&order_by=rating&per_page=8&debug=true&format=json&nojsoncallback=1",true);
	request.send(null); // Skicka begäran till servern
	request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
		if (request.readyState == 4)
			if (request.status == 200) popCamping(request.responseText);
			else console.log("yes very many")
	};
}

function popCamping(response) {
    let theResponse = JSON.parse(response);//Konverterar json svaret
    theResponse = theResponse.payload;
    for (let i = 0; i < theResponse.length; i++) {
        linkBoxes[i].childNodes[3].innerHTML = theResponse[i].name;
        linkBoxes[i].childNodes[3].setAttribute('id',theResponse[i].id);
        linkBoxes[i].childNodes[5].innerHTML = parseFloat(theResponse[i].rating) + "/5";
        linkBoxes[i].addEventListener("click", infoPage);
    }
}

function infoPage() {
    window.open("informationpage.html?value="+ this.children[1].id, "_self");
}

function requestCamping() {
	let request = new XMLHttpRequest(); // Object för Ajax-anropet
	request.open("GET", SMAPI + "&controller=establishment&method=getall&descriptions=camping&debug=true&format=json&nojsoncallback=1",true);
	request.send(null); // Skicka begäran till servern
	request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
		if (request.readyState == 4)
			if (request.status == 200) checkCity(request.responseText);
			else console.log("yes very many")
	};
} // End requestNewImgs

function checkCity(response){
    let theResponse = JSON.parse(response);//Konverterar json svaret
    let searchBar = document.querySelector(".searchBar");
    let search = searchBar.value;
    window.open("page2.html?value="+ search, "_self");
}

window.addEventListener("load", init);