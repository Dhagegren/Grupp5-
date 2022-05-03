
var modal = document.getElementsByClassName("modal");//Reference to modal
var campingRef = document.getElementsByClassName("campingDivs");
var searchValue = window.location.search;
var SMAPI = "https://smapi.lnu.se/api/?api_key=uXpykX9P"; //Smapi api
var srcValue =""; 

function init() {
	console.log(campingRef);
	campingRef = campingRef[0];
    searchValue = new URLSearchParams(searchValue);
    srcValue = searchValue.get("value");
    console.log(srcValue);
    requestCamping();
	let btn = document.getElementsByClassName("myBtn");//Reference to button
	let span = document.getElementsByClassName("close")[0];//Reference to span element
	//Make all buttons clickable
	
	for (let i = 0; i < btn.length; i++) {
		btn[i].addEventListener("click", showModal);
	}
	span.addEventListener("click", hideModal);
}
window.onload = init;

//Open up modal
function showModal() {
	modal[0].style.display = "block";
}

//Close modal
function hideModal() {
	modal[0].style.display = "none";
}

//Click outside modal to close
window.onclick = function(event) {
	if (event.target == modal[0]) {
		modal[0].style.display = "none";
	}
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
    function checkCity(response){
        console.log("hej")
        let theResponse = JSON.parse(response);//Konverterar json svaret
        let search = srcValue;
		let tempCamping = "";
        console.log(search);
        theResponse = theResponse.payload;
        console.log(theResponse);
        for (let i = 0; i < theResponse.length; i++) {
            if (theResponse[i].city == search || theResponse[i].municipality == search + " kommun" || theResponse[i].name.includes(search)) {
				tempCamping += "<div class='campingDiv'><div class = itemDiv> <img src='img/camp2.jpg' alt='bild på camping'> <div class ='textDiv'> <h2>"+
				theResponse[i].name + "</h2> <p>5km från "+ theResponse[i].city + "</p> <p> Visa på karta </p> <p>" +parseFloat(theResponse[i].rating) + "/5</p>"+
				'</div> <button class="infoBtn"> Info</button></div></div>';
                console.log(tempCamping);
				campingRef.innerHTML = tempCamping;

            }
        }

    }
}

/*     <div class="campingDiv">        
<div class="itemDiv">
            <img src="img/camp2.jpg" alt="bild på camping">
            
            <div id="textDiv"> 
                <h2> Lasses Camping</h2>
                <p> 5km från växjö</p>
                <p> Visa på karta</p>
                <p> 4.4/5</p>
            </div>
                
            <button id="infoBtn"> Info</button>
        
			</div>*/
		