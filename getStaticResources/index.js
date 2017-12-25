var fs = require('fs');

const resourceFolder = 'resources';

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.filename == 'presentationMap.xml'
        || req.query.filename == 'strings.xml'
        || req.query.filenmae == 'Sonos.wsdl') {
            var xmlFileContent = fs.readFileSync(__dirname + '/../' + resourceFolder + '/' + req.query.filename, 'utf8');

            context.res = {
                status: 200, /* Defaults to 200 */
                body: xmlFileContent,
                headers: {
                    'Content-Type': 'text/xml'
                },
                isRaw: true
            };
        } else {
            context.res = {
                status: 400,
                body: "Please pass a file name on the query string or in the request body"
            };
        }
            
    context.done();
};