const xml2js = require('xml2js');
const parseString = require('xml2js').parseString;
const preprocessors = require('xml2js').processors;
const request = require('request');

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.headers.soapaction) {
        const myRegexp = /"http:\/\/www\.sonos\.com\/Services\/1\.1#([a-zA-Z]+)"/g;
        var match = myRegexp.exec(req.headers.soapaction);
        if(match.length > 1) {
            var soapFunction = match[1];      
            context.log('Sonos header found: '+soapFunction);
            context.log(req.body);
            if(soapFunction == "getMetadata") {            
                getMetadata(context, req.body);
            } else if (soapFunction == "getMediaURI") {
                getMediaURI(context, req.body);
            } else {
                context.res = {
                    status: 400,
                    body: 'Not implemented Sonos header found'
                };
                context.done();
            }
        } else {
            context.log('No Sonos header found');
            context.res = {
                status: 400,
                body: 'No Sonos header found'
            };
            context.done();
        }
    }    

};

getMetadata = function(context, xml) {
    parseString(xml, {
        explicitArray: false,
        tagNameProcessors: [preprocessors.stripPrefix]}, function (err, result) {
            context.log(JSON.stringify(result));
            var xmlBody = result.Envelope.Body;
            
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
            }
            
            request(rootUrl, function(error, response, body){
                
                var json = JSON.parse(body);

                context.log(JSON.stringify(json));

                var mediaCollection = [];                
                for (var i = 0; i < json.response.docs.length; i++) {
                    var currentItem = json.response.docs[i];
                    mediaCollection.push({"ns:id":currentItem.mediatype+":"+currentItem.identifier,
                                          "ns:itemType":currentItem.mediatype == "collection" ? "container":"track",
                                          "ns:title": currentItem.title,
                                          "ns:summary": currentItem.description,
                                          "ns:canPlay":currentItem.mediatype == "concert" ? "true": "false",
                                          "ns:albumArtURI": "https://archive.org/services/img/" + currentItem.identifier }); 
                }

                var response = {"s:Envelope":{"$":{"xmlns:soapenv":"http://schemas.xmlsoap.org/soap/envelope/","xmlns:ns":"http://www.sonos.com/Services/1.1"},
                "s:Body":{"ns:getMetadataResponse":{"ns:getMetadataResult":{"ns:index":json.response.start,"ns:count":json.response.docs.length,"ns:total":json.response.numFound,"ns:mediaCollection":mediaCollection}}}}};                
            
                var builder = new xml2js.Builder();
                var xmlResponse = builder.buildObject(response);
    
                //context.log(xmlResponse);
    
                context.res = {
                    status: 200,
                    body: xmlResponse
                };   
                context.done();         
            });
    });
};

getMediaURI = function(context, xml) {
    parseString(xml, {
        explicitArray: false,
        tagNameProcessors: [preprocessors.stripPrefix]}, function (err, result) {
            context.log(JSON.stringify(result));
            var xmlBody = result.Envelope.Body;
            
            var id = xmlBody.getMediaURI.id;

            var response = {"s:Envelope":{"$":{"xmlns:soapenv":"http://schemas.xmlsoap.org/soap/envelope/","xmlns:ns":"http://www.sonos.com/Services/1.1"},
                "s:Body":{"ns:getMediaURIResponse":{"ns:getMediaURIResult":"https://archive.org/download/"+id+"/"+id+"_vbr.m3u"}}}}; 
            
            var builder = new xml2js.Builder();
            var xmlResponse = builder.buildObject(response);

            //context.log(xmlResponse);

            context.res = {
                status: 200,
                body: xmlResponse
            };   
            context.done();   
        });    
};