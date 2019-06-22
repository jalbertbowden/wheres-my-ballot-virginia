<?php // curl "https://www.googleapis.com/civicinfo/v2/voterinfo?key=AIzaSyCkI5hA2ssp_BsYeMCK3z9lxIf4YqDSt7I&address=807%20N%20Robinson%20St.%20Richmond%20VA%20VA&electionId=2000"
// google civic api voter info php curl query
$urlBase = "https://www.googleapis.com/civicinfo/v2/voterinfo?key=AIzaSyCkI5hA2ssp_BsYeMCK3z9lxIf4YqDSt7I";
$urlAddress = "&address=";
$urlElectionID = "&electionId=2000";
$apiData;

function addressStrReplace($str){
  $str = str_replace(' ', '%20', $str);
  return $str;
};

if($_POST && isset($_POST['address'])) {
  $address = $_POST['address'];
  //echo $address;
} else if($_POST) {
  $address = $_POST['address'];
  //echo $address;
} else  {
  // Need proper error handling here!;
  $address = 'No Address Found';
  
}

$address = addressStrReplace($address);
$urlPath = $urlBase.$urlAddress.$address.$urlElectionID;

function apiCurl($urlPath){
  $ch = curl_init($urlPath);
  curl_setopt($ch, CURLOPT_TIMEOUT, 5);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $data = curl_exec($ch);
  curl_close($ch);
  //header('Content-Type: application/json');
  //echo json_encode($data);
  echo $data;
};
$apiData = apiCurl($urlPath);
?>