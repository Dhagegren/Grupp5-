var SMAPI = "https://smapi.lnu.se/api/?api_key=uXpykX9P"; //Smapi api

function init() { // När fönstret laddas in
    let searchBtn = document.getElementsByClassName("search"); // En referens till sökknappen
    searchBtn = searchBtn[0].children[1];
    searchBtn.addEventListener("click", checkCity);
    
    let filterShortcut = document.getElementsByClassName("indexgridsection"); // En referens till de tre stora knapparna på första sidan så att man kan sätta händelsehanterare på dem sen
    filterShortcut[0].addEventListener("click", filterOland);
    filterShortcut[1].addEventListener("click", filterStrand);
    filterShortcut[2].addEventListener("click", filterNatur);
    
    let input = document.getElementById("searchBar"); // Referens till sökrutan
    input.addEventListener("keypress", function(event) {
        if (event.key ==="Enter") {
            event.preventDefault();
            searchBtn.click();   
        }
    });
    popularCamping();
}
window.addEventListener("load", init);

function filterOland() { // Denna funktion skickar vidare värdet "oland" för att visa att knappen för att söka efter campingar på öland är valt
    let filter = "oland"; // En string för att visa att det är öland knappen som är vald
    sessionStorage.setItem("filterChecked", filter);
    window.open("page2.html?value=", "_self");
}

function filterStrand() { // Denna funktion skickar vidare värdet "strand" för att visa att knappen för att söka efter campingar nära stranden är valt
    let filter = "strand"; // En string för att visa att det är strand knappen som är vald
    sessionStorage.setItem("filterChecked", filter);
    window.open("page2.html?value=", "_self");
}

function filterNatur() { // Denna funktion skickar vidare värdet "natur" för att visa att knappen för att söka efter naturcampingar är valt
    let filter = "natur"; // En string för att visa att det är natur knappen som är vald
    sessionStorage.setItem("filterChecked", filter);
    window.open("page2.html?value=", "_self");
}

function popularCamping() { // De 8 bäst rankade campingarna hämtas och skickas vidare till popCamping
    let request = new XMLHttpRequest(); // Object för Ajax-anropet
	request.open("GET", SMAPI + "&controller=establishment&method=getall&descriptions=camping&sort_in=desc&order_by=rating&per_page=8&debug=true&format=json&nojsoncallback=1", true);
	request.send(null); // Skicka begäran till servern
	request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
		if (request.readyState == 4)
			if (request.status == 200) popCamping(request.responseText);
			else console.log("Error finding resource")
	};
}

function popCamping(response) { // De 8 bäst rankade campingarna skickas in här så att de kan skrivas ut på sidan
    let theResponse = JSON.parse(response); //Konverterar json svaret
    let linkBoxes = document.getElementsByClassName("linkbox"); // En referens till elementen i classen linkbox
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

function infoPage() { // Användaren skickas till info sidan för den camping som valts bland de bäst rankade
    window.open("informationpage.html?value=" + this.children[1].id, "_self");
}

function checkCity() { // Användaren skickas till page2 där alla sökresultat syns och kan filtreras och sorteras
    let searchBar = document.querySelector(".searchBar"); // Referens till searchbaren
    let search = searchBar.value; // Det som användaren skrivit i searchbaren sparas i en variabel så att det kan skickas med till page2
    window.open("page2.html?value=" + search, "_self");
}
