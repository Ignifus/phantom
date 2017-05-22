var sites  = require("./sites.json");
var page   = require('webpage').create();
var system = require('system');
var args   = system.args;
var fs     = require('fs'); 

var site;
var inner;
var results;
var params = {};
var LOCKED = false;

function getPage() {
    buildParams();
	site = getSite();
	if(!site) {
		console.log('Finished');
		phantom.exit();
	} 
	console.log('\n*****' + site.url + params.SEARCH + '****\n');
	page.open(site.url + params.SEARCH);
}

function getLinks(results) {
    console.log("GETING LINKS", results.length);
    LOCKED = true;
    if(results.length === 0) {
        console.log("NO MORE LINKS");
        LOCKED = false;
        phantom.exit();
        return null;
    }
    inner = results.pop();
    page.open(inner.url);
}

page.onLoadFinished = function(status) {
  if(status === 'success') {
    console.log(site.name + 'status: ' + status);
    if(!LOCKED) {
        capture();
        analyzeDom();
    } else {
        captureInner();
    }
    //getPage();
  }
};

function capture() {
	console.log("Capturing: ", site.name);
	page.render('./captures/' + site.name + '.png');
}

function captureInner() {
    console.log("Capturing: ", inner.title);
    page.render('./captures/' + inner.image);
    getLinks(results);
}

function analyzeDom() {
    results = page.evaluate(getEvaluator());
    results = results.filter(function(e) { return criteria(e.price, params.PRICE); });
    results = results.filter(function(e, i) { return i < params.LIMIT; });
    buildReport(results);
    getLinks(results);
}

function pageEvaluationML() {
    var links = [];

    //CONFIG
    var SEARCH_RESULTS = 'searchResults';
    var RESULTS_ITEMS = 'results-item';
    var PRICE = 'ch-price';
    var RESULT_ITEM_TILE = 'list-view-item-title';

    var containers = document.getElementById(SEARCH_RESULTS).getElementsByClassName(RESULTS_ITEMS);

    //foreach container
    for(var i = 0; i < containers.length; i++) {
        var price = containers[i].getElementsByClassName(PRICE);
        
        if(price[0] == null) continue;

        var price = parseInt(price[0].innerText.replace(/[\$\.\s]/g, '')) / 100; //Mercado libre formats price as '$ 60079.99'
        var anchors = containers[i].getElementsByTagName('a');
        if(anchors[0].href.indexOf('http://articulo') >= 0) {
            links.push({
                title: containers[i].getElementsByClassName(RESULT_ITEM_TILE)[0].innerText,
                url: anchors[0].href,
                price: price,
                image: Math.random().toString() + '.png'
            });
        }
    }

    return links;
}

function pageEvaluationOLX() {
    var links = [];
    var containers = document.querySelectorAll('.items-list .item');

    for(var i = 0; i < containers.length; i++) {
        var price = containers[i].querySelector('.items-price');
        if(price == null) continue;
        var price = parseInt(price.innerText.replace(/[\$\.\s]/g, ''));
        var anchor = containers[i].querySelector('a')
        if(anchor.href.indexOf('olx.com') >= 0) {
            links.push({
                title: containers[i].querySelector('h3').innerText,
                url: anchor.href,
                price: price,
                image: Math.random().toString() + '.png'
            });
        }
    }
    return links;
}

function buildReport(results) {
    console.log("BUILDING REPORT", results.length);
    var table = "<style>.hide {max-height: 160px; overflow: hidden; } tr:nth-child(even) { background-color: #eee}</style><table><thead><tr>";
    Object.keys(results[0]).forEach(function(key) { table += ("<th>" + key + "</th>"); });
    table += "</tr></thead><tbody>";

    results.forEach(function(result) {
        table += "<tr>";
        Object.keys(result).forEach(function(key) {
            var value = result[key];
            if(key === "image") {
                //TODO refactor bosta
                value = '<div class="hide"><a href="captures/' + result[key] + '" __target="blank"><img src="captures/' + result[key] + '" width="150"></a></div>';
            }
            if(key === "title") {
                value = '<a href="' + result['url'] + '">' + value  + '</a>';
            }
            table += ("<td>" + value + "</td>"); 
        });
        table += "</tr>";
    });

    table += "</tbody></table>";
    fs.write(params.OUT, table, 'w');
}

function buildParams() {
    var error = false;
    for (var i = 1; i < args.length; i++) {
        if(args[i].indexOf('--limit=') >= 0) {
            params.LIMIT = parseInt(args[i].replace('--limit=', ''));
        }

        if(args[i].indexOf('--price=') >= 0) {
            params.PRICE = parseInt(args[i].replace('--price=', ''));
        }

        if(args[i].indexOf('--search=') >= 0) {
            params.SEARCH = args[i].replace('--search=', '');
        }

        if(args[i].indexOf('--site=') >= 0) {
            params.SITE = args[i].replace('--site=', '');
        }

        if(args[i].indexOf('--criteria=') >= 0) {
            params.CRITERIA = args[i].replace('--criteria=', '');
        }

        if(args[i].indexOf('--out=') >= 0) {
            params.OUT = args[i].replace('--out=', '');
        }
    }

    //normalization
    if(params.CRITERIA == null) {
        params.CRITERIA = 'lt';
    }

    if(params.SEARCH == null) {
        error = true;
        console.log('Provea un termino de busqueda');
    }

    if(params.SITE == null) {
        params.SITE = 'mercadolibre';
    }

    if(params.LIMIT == null) {
        params.LIMIT = 10;
    }

    if(params.PRICE == null || isNaN(params.PRICE)) {
        error = true;
        console.log('Provea un precio de referencia');
    }

    if(params.OUT == null) {
        params.OUT = 'reporte.html';
    }

    if(error) phantom.exit();
}

function criteria(price, refPrice) {
    console.log("PRICES", price, refPrice);
    switch(params.CRITERIA) {
        case 'gt':
            return price > refPrice;
            break;
        case 'gte':
            return price >= refPrice;
            break;
        case 'lt':
            return price < refPrice;
            break;
        case 'lte':
            return price <= refPrice;
            break;
    }
    console.log('No machea ningun criterio');
    phantom.exit();
}

function getEvaluator() {
    switch(params.SITE) {
        case 'mercadolibre':
            return pageEvaluationML;
            break;
        case 'olx': 
            return pageEvaluationOLX;
            break;
        case 'all':
            console.log('--site=all no fue implementado aun');
            phantom.exit();
            break;
        default:
            console.log('--site= no soportado');
            phantom.exit();
            break;
    }
}

function getSite() {
    var selectedSite;
    sites = sites.filter(function(e, i) {
        if(e.name !== params.SITE) { 
            return true; 
        } else {
            selectedSite = e;
        }
    });

    if (selectedSite == null) {
        console.log('no se encuentra el sitio especificado');
    }
    console.log(JSON.stringify(selectedSite));
    return selectedSite;
}

getPage();