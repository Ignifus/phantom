var sites = require("./sites.json");
var page = require('webpage').create();
var site;

function getPage() {
	site = sites.pop();
	if(!site) {
		console.log('Finished');
		phantom.exit();
	} 
	console.log('\n*****' + site.url + '****\n');
	page.open(site.url)
}

function capture() {
	console.log("Capturing: ", site.name);
	page.render('./captures/' + site.name + '.png');
	getPage();
}

page.onLoadFinished = function(status) {
  console.log(site.name + 'status: ' + status);
  if(status === 'success') {
  	capture();
  }
};

getPage();