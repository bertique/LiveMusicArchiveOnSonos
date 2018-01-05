const xml2js = require('xml2js');
const parseString = require('xml2js').parseString;
const preprocessors = require('xml2js').processors;
const axios = require('axios');

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.headers.soapaction) {
        const myRegexp = /"http:\/\/www\.sonos\.com\/Services\/1\.1#([a-zA-Z]+)"/g;
        var match = myRegexp.exec(req.headers.soapaction);
        if(match.length > 1) {
            var soapFunction = match[1];      
            context.log('Sonos header found: '+soapFunction);
            context.log(req.body);

            parseString(req.body, {
                explicitArray: false,
                tagNameProcessors: [preprocessors.stripPrefix]}, function (err, result) {
                    context.log(JSON.stringify(result));
                    var xmlBody = result.Envelope.Body;                            
                    
                    if(soapFunction == "getMetadata") {            
                        getMetadata(xmlBody).then(function(r) { returnContext(r, 200, context); });
                    } else if (soapFunction == "getMediaURI") {
                        getMediaURI(xmlBody).then(function(r) { returnContext(r, 200, context); });
                    } else if (soapFunction == "search") {
                        search(xmlBody).then(function(r) { returnContext(r, 200, context); });
                    } else {
                        returnContext("NOOP", 400, context);
                    } 
                });
        } else {
            returnContext('No Sonos header found', 400, context);
        }
    }    
};

function returnContext (responseString, responseCode, context) {
    var builder = new xml2js.Builder();
    var xmlResponse = builder.buildObject(responseString);

    //context.log(xmlResponse);

    context.res = {
        status: responseCode,
        body: xmlResponse
    };   
    context.done(); 
}

async function getMetadata(xmlBody) {
    var id = xmlBody.getMetadata.id;
    var count = xmlBody.getMetadata.count ? xmlBody.getMetadata.count : 10;
    var index  = xmlBody.getMetadata.index ? xmlBody.getMetadata.index : 1;

    var rootUrl = "https://archive.org/advancedsearch.php?q=collection%3Aetree+AND+mediatype%3Acollection&fl%5B%5D=description&fl%5B%5D=identifier&fl%5B%5D=mediatype&fl%5B%5D=title&fl%5B%5D=creator&sort%5B%5D=downloads+desc&sort%5B%5D=&sort%5B%5D=&rows="+count+"&page=1&output=json";;
    if(id == "root") {
        rootUrl = "https://archive.org/advancedsearch.php?q=collection%3Aetree+AND+mediatype%3Acollection&fl%5B%5D=description&fl%5B%5D=identifier&fl%5B%5D=mediatype&fl%5B%5D=title&fl%5B%5D=creator&sort%5B%5D=downloads+desc&sort%5B%5D=&sort%5B%5D=&rows="+count+"&page=1&output=json";
    } else if (id.startsWith("collection:")) {
        rootUrl = "https://archive.org/advancedsearch.php?q=collection%3A"+id.replace("collection:","")+"&fl%5B%5D=description&fl%5B%5D=identifier&fl%5B%5D=mediatype&fl%5B%5D=title&fl%5B%5D=creator&sort%5B%5D=downloads+desc&sort%5B%5D=&sort%5B%5D=&rows="+count+"&page=1&output=json";
    } else if (id.startsWith("concert:")) {
        rootUrl = "https://archive.org/metadata/"+id.replace("concert:","");
    } else if (id.startsWith('search:')) {

    }
    
    const resp = await axios.get(rootUrl);    

    var mediaCollection = [];                
    for (var i = 0; i < resp.data.response.docs.length; i++) {
        var currentItem = resp.data.response.docs[i];
        mediaCollection.push({"ns:id":currentItem.mediatype+":"+currentItem.identifier,
                                "ns:itemType":currentItem.mediatype == "collection" ? "container":"track",
                                "ns:title": currentItem.title,
                                "ns:summary": currentItem.description,
                                "ns:canPlay":currentItem.mediatype == "concert" ? "true": "false",
                                "ns:albumArtURI": "https://archive.org/services/img/" + currentItem.identifier }); 
    }

    var response = {"s:Envelope":{"$":{"xmlns:soapenv":"http://schemas.xmlsoap.org/soap/envelope/","xmlns:ns":"http://www.sonos.com/Services/1.1"},
    "s:Body":{"ns:getMetadataResponse":{"ns:getMetadataResult":{"ns:index":resp.data.response.start,"ns:count":resp.data.response.docs.length,"ns:total":resp.data.response.numFound,"ns:mediaCollection":mediaCollection}}}}};                

    return response;
};

async function getMediaURI(xmlBody) {          
    var id = xmlBody.getMediaURI.id;

    var response = {"s:Envelope":{"$":{"xmlns:soapenv":"http://schemas.xmlsoap.org/soap/envelope/","xmlns:ns":"http://www.sonos.com/Services/1.1"},
        "s:Body":{"ns:getMediaURIResponse":{"ns:getMediaURIResult":"https://archive.org/download/"+id+"/"+id+"_vbr.m3u"}}}}; 
    
    return response;      
}

async function search (xmlBody) {

}