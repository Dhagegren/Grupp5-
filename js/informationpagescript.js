var mymap // Min karta

function init(){
    initMap();
}

window.addEventListener("load", init);

function initMap() {
	myMap = new google.maps.Map(
			document.getElementById('map'),
			{
				center: {lat:56.13708498823629, lng:15.584851190648239},
				zoom: 11,
				styles: [
					{featureType:"poi", stylers:[{visibility:"off"}]},  // No points of interest.
					{featureType:"transit.station",stylers:[{visibility:"off"}]}  // No bus stations, etc.
				]
			}
		);
} // End initMap