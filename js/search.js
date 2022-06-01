
var SMAPI = "https://smapi.lnu.se/api/?api_key=uXpykX9P"; //Smapi api

//https://smapi.lnu.se/api/?api_key=uXpykX9P&controller=establishment&method=getall&descriptions=camping
function init() { // När fönstret laddas in
    let searchBtn = document.getElementsByClassName("search"); // En referens till sökknappen
    searchBtn = searchBtn[0].children[1];
    searchBtn.addEventListener("click", requestCamping);
    
    let filterShortcut = document.getElementsByClassName("indexgridsection"); // 
    filterShortcut[0].addEventListener("click", filterOland);
    filterShortcut[1].addEventListener("click", filterStrand);
    filterShortcut[2].addEventListener("click", filterNatur);

    let input = document.getElementById("searchBar");
    input.addEventListener("keypress", function(event) {
        if (event.key ==="Enter") {
            event.preventDefault();
            searchBtn.click();   
        }
    });
    popularCamping();
}

function filterOland() {
    let filter = "oland";
    sessionStorage.setItem("filterChecked", filter);
    window.open("page2.html?value=", "_self");
}

function filterStrand() {
    let filter = "strand";
    sessionStorage.setItem("filterChecked", filter);
    window.open("page2.html?value=", "_self");
}

function filterNatur() {
    let filter = "natur";
    sessionStorage.setItem("filterChecked", filter);
    window.open("page2.html?value=", "_self");
}

function popularCamping() {
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
    let linkBoxes = document.getElementsByClassName("linkbox");
    theResponse = theResponse.payload;
    for (let i = 0; i < theResponse.length; i++) {
        linkBoxes[i].childNodes[1].style.background = "url(campingImg/" + theResponse[i].id + ".jpg) center";
        linkBoxes[i].childNodes[1].style.backgroundSize = "cover";
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

function checkCity(response) {
    let theResponse = JSON.parse(response);//Konverterar json svaret
    let searchBar = document.querySelector(".searchBar");
    let search = searchBar.value;
    window.open("page2.html?value="+ search, "_self");
}

window.addEventListener("load", init);