var xml2js = require('xml2js');
var parseString = require('xml2js').parseString;
var preprocessors = require('xml2js').processors;

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.headers.soapaction) {
        var myRegexp = /"http:\/\/www\.sonos\.com\/Services\/1\.1#([a-zA-Z]+)"/g;
        var match = myRegexp.exec(req.headers.soapaction);
        if(match.length > 1) {
            var soapFunction = match[1];      
            context.log('Sonos header found: '+soapFunction);
            if(soapFunction == "getMetadata") {            
                getMetadata(context, req.body, 'root', 100, 100);
            }        
        } else {
            context.log('No Sonos header found');
            context.res = {
                status: 400,
                body: 'No Sonos header found'
            };
        }
    }    
    context.done();
};

getMetadata = function(context, xml, id, count, total) {
    parseString(xml, {
        explicitArray: false,
        tagNameProcessors: [preprocessors.stripPrefix]}, function (err, result) {
        context.log(JSON.stringify(result));
        var xmlBody = result.Envelope.Body;
        context.log(xmlBody.getMetadata.id);


        var response = {"Envelope":{"$":{"xmlns:soapenv":"http://schemas.xmlsoap.org/soap/envelope/","xmlns:ns":"http://www.sonos.com/Services/1.1"},
            "Body":{"ns:getMetadataResponse":{"ns:index":"0","ns:count":"2","ns:total":"2","ns:mediaCollection":"?"}}}};

        var builder = new xml2js.Builder();
        var xmlResponse = builder.buildObject(response);

        context.log(xmlResponse);

        context.res = {
            status: 200,
            body: xmlResponse
        };
    });
};