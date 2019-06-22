function wheresMyBallot(){
  var inputAddress = document.getElementById('address');
  var htmlFormDiv = document.getElementById('div-fieldset');
  var inputSubmit = document.getElementById('submit');
  var xhrAddress = [];
  var map;
  var geoJSONStyle = {
    "color":"#fff",
    "weight":1,
    "opacity":0.85,
    "fillOpacity":0.45,
    "fillColor":"#000"
  };
  var geoJSONStyleLocality = {
    "color":"#000",
    "weight":1,
    "opacity":0.85,
    "fillOpacity":0.85,
    "fillColor":"#ff0",
    "zIndexOffset":1000,
  };
  
  // make initial map with state boundary outline
  function leafletInit(){
    map = L.map('map').setView([38, -79], 8);
  	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.geoJson(virginiaBoundaries, {style:geoJSONStyle}).addTo(map);
  };
  leafletInit();
  
  // make voting locality outline map layer
  function makeLeafletMapPoint(latlon, addressName){
    L.marker(latlon).addTo(map)
    .bindPopup(addressName)
    .openPopup();
  };
  
  // make user address pin point map layer
  function makeLeafletMapPolygon(thisLocalityGeoJSON){
    var geoJSONLayer = L.geoJson(thisLocalityGeoJSON, {style:geoJSONStyleLocality}).addTo(map);
    geoJSONLayer.eachLayer(function(layer){
      map.fitBounds(layer.getBounds());
    });
    
  };
  
  function serialize(str){
  	str = str.replace(/ /g, '%20');
  	str = str.replace(/,/g, '');
  	return str;
  };
  
  var htmlForm = document.getElementById('form-google-civic-api');
  htmlForm.addEventListener('submit', function (e) {
    e.preventDefault();
    inputSubmit.setAttribute('disabled', 'disabled');
    inputAddressUserInput = inputAddress.value;
    inputAddress = serialize(inputAddressUserInput);
  	var civicAPIURL = 'https://www.googleapis.com/civicinfo/v2/voterinfo?key=AIzaSyCkI5hA2ssp_BsYeMCK3z9lxIf4YqDSt7I&address='+inputAddress+'&electionId=2000';
  	xhrAddress.push(inputAddress);
  	fetch(civicAPIURL);
  	//console.log("HERE");
  	//console.log(civicAPIVoterInfoResponseVal);
  	//getElectionInfo(civicAPIVoterInfoResponseVal);
  	return false;
  });
  

  function fetch(civicAPIURL) {
  	var civicAPIVoterInfoResponse;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', "wheres-my-ballot-civic-api-curl.php", true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
      civicAPIVoterInfoResponse = JSON.parse(this.response);
      //console.log('civic api voter info json response');
      //console.log(civicAPIVoterInfoResponse);
      let votingLocationComplete = civicAPIVoterInfoResponse.normalizedInput.line1+', '+civicAPIVoterInfoResponse.normalizedInput.city+', '+civicAPIVoterInfoResponse.normalizedInput.state+' '+civicAPIVoterInfoResponse.normalizedInput.zip;
      normalizedInputHTML(civicAPIVoterInfoResponse.normalizedInput.line1, civicAPIVoterInfoResponse.normalizedInput.city, civicAPIVoterInfoResponse.normalizedInput.state, civicAPIVoterInfoResponse.normalizedInput.zip);
      userOutputHTML(civicAPIVoterInfoResponse.pollingLocations, votingLocationComplete);
      googleCivicAPIElection(civicAPIVoterInfoResponse.election);
      googleCivicAPIState(civicAPIVoterInfoResponse.state);
      
      //return civicAPIVoterInfoResponse;
    };
    xhr.send(civicAPIURL);
    //return xhr.onload;
  }
  
  function googleCivicAPIElection(civicAPIVoterInfoResponseElection){
    console.log(civicAPIVoterInfoResponseElection);
    //console.log('please election');
    //console.log(civicAPIVoterInfoResponseElection);
  };
  
  function googleCivicAPIState(civicAPIVoterInfoResponseState){
    //console.log(civicAPIVoterInfoResponseState);
    //console.log('please state');
    //console.log(civicAPIVoterInfoResponseState[0]);
  };
  
  
  function userOutputHTML(obj, str){
    var pollingLocationsHTML = '<ul id="polling-locations-list">';
    pollingLocationsHTML += '<li>Voting Location for: '+str+'</li>';
    pollingLocationsHTML += '<li>'+obj[0].address.locationName+'</li>';
    pollingLocationsHTML += '<li>'+obj[0].address.line1+'</li>';
    pollingLocationsHTML += '<li id="polling-location-city">'+obj[0].address.city+'</li>';
    pollingLocationsHTML += '<li>'+obj[0].address.state+'</li>';
    pollingLocationsHTML += '<li>'+obj[0].address.zip+'</li></ul>';
    document.getElementById("container").innerHTML = pollingLocationsHTML;
  };
  
  function normalizedInputHTML(stra, strb, strc, strd){ // 0 = street, 1 = city, 2 = state, 3 = zip
    createInputHTML(stra, 0);
    createInputHTML(strb, 1);
    createInputHTML(strc, 2);
    createInputHTML(strd, 3);
    var fullAddressInputHTML = stra+', '+strb+', '+strc+' '+strd;
    createInputHTML(fullAddressInputHTML, 4);
  };

  function createInputHTML(str, int){
    var newInputHTML = document.createElement('input');
    newInputHTML.setAttribute('type', 'hidden');
    if(int === 0){
      newInputHTML.setAttribute('id', 'user-address-street');
    } else if(int === 1){
      newInputHTML.setAttribute('id', 'user-address-city');
    } else if(int === 2){
      newInputHTML.setAttribute('id', 'user-address-state');
    } else if(int === 3){
      newInputHTML.setAttribute('id', 'user-address-zip');
    } else if(int === 4){
      newInputHTML.setAttribute('id', 'user-address');
    }
    newInputHTML.setAttribute('value', str);
    htmlForm.appendChild(newInputHTML);
  };

  var areUserInputsNormalized = (function (d) {
    var interval;
    function check() {
      var elm_id;
        if ( d.getElementById("user-address-city") ) { 
          var localityID = document.getElementById('user-address-city');
          elm_id = d.getElementById( "user-address-city" ).value;
          var userAddressStreet = document.getElementById('user-address-street').value;
          var userAddressCity = document.getElementById('user-address-city').value;
          var userAddressCityPerm = userAddressCity;
          var userAddressState = document.getElementById('user-address-state').value;
          var userAddressZip = document.getElementById('user-address-zip').value;
          var userAddress = document.getElementById('user-address').value;
          var addressName = userAddress;
          
          function censusGeocodeSyntax(str){
          	str = str.replace(/ /g, '+');
          	return str;
          };
          function reformatCensusGeocodeSyntax(str){
          	str = str.replace(/ /g, '%2B');
          	str = str.replace(/\//g, '%2F');
          	str = str.replace(/:/g, '%3A');
          	str = str.replace(/&/g, '%26');
          	str = str.replace(/=/g, '%3D');
          	return str;
          };
          
          userAddressStreet = '?street='+censusGeocodeSyntax(userAddressStreet);
          userAddressCity = '&city='+censusGeocodeSyntax(userAddressCity);
          userAddressState = '&state='+censusGeocodeSyntax(userAddressState);
          matchNameToGeoJSON(userAddressCityPerm);
          
          function censusGeocoderFormat(userAddressStreet, userAddressCity, userAddressState, userAddress){
            var censusGeoURLBase = 'https://geocoding.geo.census.gov/geocoder/geographies/address';
            var censusGeoURLEnd = '&benchmark=Public_AR_Census2010&vintage=Census2010_Census2010&layers=14&format=json';
            var censusGeoURL = censusGeoURLBase+userAddressStreet+userAddressCity+userAddressState+censusGeoURLEnd;
            censusGeoURL = reformatCensusGeocodeSyntax(censusGeoURL);
            // https://bowdenweb.com/php/php-simple-proxy/ba-simple-proxy.php?url=https%3A%2F%2Fgeocoding.geo.census.gov%2Fgeocoder%2Fgeographies%2Faddress%3Fstreet%3D807%2BN%2BRobinson%2BSt%26city%3DRichmond%26state%3DVA%26benchmark%3DPublic_AR_Census2010%26vintage%3DCensus2010_Census2010%26layers%3D14%26format%3Djson&full_headers=1&full_status=1
            // var proxyURL = 'https://bowdenweb.com/php/php-simple-proxy/ba-simple-proxy.php?url=';
            var proxyURL = 'https://bowdenweb.com/google-civic/wheres-my-ballot/ba-simple-proxy.php?url=';
            censusGeoURL = proxyURL+censusGeoURL;
            newXHRGeo(censusGeoURL, addressName);
          };
          censusGeocoderFormat(userAddressStreet, userAddressCity, userAddressState, userAddress);
          clearInterval(interval);
        }
    }
    interval = setInterval(check, 100); // duration: 100ms
  }(document));
  
  function matchNameToGeoJSON(userAddressCityPerm){
    console.log('user address city pem: '+userAddressCityPerm);
    var localityNames = virginiaLocalityBoundaries.features;
    for(var x=0;x<localityNames.length;x++){
      if(localityNames[x].properties.NAME === userAddressCityPerm) {
      	var thisLocalityGeoJSON = localityNames[x].geometry;
        console.log("HOLLA: "+userAddressCityPerm);
        console.log(thisLocalityGeoJSON);
        makeLeafletMapPolygon(thisLocalityGeoJSON);
      }
    };
  };
  
  function newXHRGeo(censusGeoURL, addressName){
  	var xhr = new XMLHttpRequest();
  	xhr.onload = function () {
	  if (xhr.status >= 200 && xhr.status < 300) {
		var data = JSON.parse(xhr.response);
		data = data.contents.result.addressMatches[0].coordinates;
		var lat = parseFloat(data.x);
		var lon = parseFloat(data.y);
		var latlon = [lon, lat];
		makeLeafletMapPoint(latlon, addressName)
		// console.log(JSON.parse(data));
	  } else {
		// console.log('The request failed!');
	  }
    };
    xhr.open('GET', censusGeoURL);
    xhr.send();
  };
  
  // flesh this out proper; need one for everything.
  var errorMessageUserInput = ' not found in <a href="https://nominatim.openstreetmap.org/">OSM\'s Nominatim\'s database</a>!';
  
  function errorMessage(inputAddressUserInput){
  	turnOffOutputs();
    var errorMessageContent = 'Error! Address: '+inputAddressUserInput+errorMessageUserInput;
    var errorMessageHTML = document.createElement('div');
    errorMessageHTML.setAttribute('id', 'error-message');
    errorMessageHTML.innerHTML = errorMessageContent;
    htmlForm.appendChild(errorMessageHTML);
  };
  
  function turnOffOutputs(){
  	var htmlVotingList = document.getElementById('polling-locations-list');
  	htmlVotingList.setAttribute('class', 'hide');
  };
};
wheresMyBallot();

// load geojson after pageload - performance; file is huge
function loadGeoJSON(){
  var htmlScript = document.createElement('script');
  htmlScript.src = 'virginia-administrative-boundaries-localities-cities-counties-and-towns-var.geojson';
  document.body.appendChild(htmlScript);
  // console.log('virginia admin locality boundaries loaded!');
};
function ready(fn) {
  if (document.readyState != 'loading') {
    fn();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState != 'loading')
        fn();
    });
  }
}

window.ready(function() {
    console.log('onready');
    loadGeoJSON();
    //wheresMyBallot();
});