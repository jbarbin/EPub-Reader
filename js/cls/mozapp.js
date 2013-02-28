//Install the OWA

var request = navigator.mozApps.getSelf();
var manLink = document.querySelector('link[rel="app-manifest"]'),
manifestURL = manLink.getAttribute('href');

request.onsuccess = function()
{	
	if (request.result) 
	{
		// we're installed
	} 
	else 
	{
		var request1 = navigator.mozApps.install(manifestURL);
		request1.onsuccess = function() 
		{
			alert("App installed successfully !");
		}
		
		request1.onerror = function() 
		{
			alert(this.error.name);
		}
	}
}

request.onerror = function() 
{
	alert('Error checking installation status: ' + this.error.message);
}
   