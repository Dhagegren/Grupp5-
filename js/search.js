var SMAPI = "https://smapi.lnu.se/api/?api_key=uXpykX9P"; //Smapi api
//https://smapi.lnu.se/api/?api_key=uXpykX9P&controller=establishment&method=getall&descriptions=camping
function init(){
    requestCamping();
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
    let search = "T";
    theResponse = theResponse.payload;
    for (let i = 0; i < theResponse.length; i++) {
        if (theResponse[i].city == search || theResponse[i].municipality == search+" kommun" || theResponse[i].name.includes(search)) {
            console.log(theResponse[i]);
        }

        
    }
}

window.addEventListener("load", init);