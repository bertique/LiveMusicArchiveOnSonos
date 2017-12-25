module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var xmlContent ='\
    <Presentation> \
    <PresentationMap type="NowPlayingRatings" \
					 trackEnabled="true"> \
            <Match propname="isliked" value="1"> \
                <!-- This tag matches if the isStarred property has the value "1" --> \
                <Ratings> \
                    <Rating Id="0" \
                            StringId="RATE_DOWN" \
                            AutoSkip="ALWAYS" \
                            OnSuccessStringId="SUCCESS_DOWN"> \
                        <!-- Note these URLs will return HTTP 404. For \
                        demonstration purposes only. --> \
                        <Icon Controller="icr" \
                            LastModified="00:00:00 16 Nov 2014" \
                            Uri="http://hypem.com/images/sonos/on_52.png" /> \
                        <Icon Controller="acr" \
                            LastModified="00:00:00 16 Nov 2014" \
                            Uri="http://hypem.com/images/sonos/on_52.png" /> \
                        <Icon Controller="acr-hdpi" \
                            LastModified="00:00:00 16 Nov 2014" \
                            Uri="http://hypem.com/images/sonos/on_80.png" /> \
                        <Icon Controller="macdcr" \
                            LastModified="00:00:00 16 Nov 2014" \
                            Uri="http://hypem.com/images/sonos/on_40.png" /> \
                        <Icon Controller="pcdcr" \
                            LastModified="00:00:00 16 Nov 2014" \
                            Uri="http://hypem.com/images/sonos/on_40.png" /> \
                        <Icon Controller="cr200" \
                            LastModified="00:00:00 16 Nov 2014" \
                            Uri="http://hypem.com/images/sonos/on_66.png" /> \
                        <Icon Controller="universal" \
                            LastModified="00:00:00 16 Nov 2014" \
                            Uri="http://sonos-img.ws.sonos.com/star-selected.svg" /> \
                    </Rating> \
                </Ratings> \
            </Match> \
            <Match propname="isliked" value="0"> \
                <Ratings> \
                    <Rating Id="1" \
                            StringId="RATE_UP" \
                            AutoSkip="NEVER" \
                            OnSuccessStringId="SUCCESS_UP"> \
                        <Icon Controller="icr" \
                            LastModified="00:00:00 16 Nov 2014" \
                            Uri="http://hypem.com/images/sonos/off_52.png" /> \
                        <Icon Controller="acr" \
                            LastModified="00:00:00 16 Nov 2014" \
                            Uri="http://hypem.com/images/sonos/off_52.png" /> \
                        <Icon Controller="acr-hdpi" \
                            LastModified="00:00:00 16 Nov 2014" \
                            Uri="http://hypem.com/images/sonos/off_80.png" /> \
                        <Icon Controller="macdcr" \
                            LastModified="00:00:00 16 Nov 2014" \
                            Uri="http://hypem.com/images/sonos/off_40.png" /> \
                        <Icon Controller="pcdcr" \
                            LastModified="00:00:00 16 Nov 2014" \
                            Uri="http://hypem.com/images/sonos/off_40.png" /> \
                        <Icon Controller="cr200" \
                            LastModified="00:00:00 16 Nov 2014" \
                            Uri="http://hypem.com/images/sonos/off_66.png" /> \
                        <Icon Controller="universal" \
                            LastModified="00:00:00 16 Nov 2014" \
                            Uri="http://sonos-img.ws.sonos.com/star-unselected.svg" /> \
                    </Rating> \
                </Ratings> \
            </Match>		  \
        </PresentationMap> \
        <PresentationMap type="Search"> \
        <Match> \
            <SearchCategories> \
                <Category mappedId="podcasts" id="podcasts"/>             \
            </SearchCategories> \
        </Match> \
    </PresentationMap> \
    </Presentation>';

    context.res = {
        status: 200, /* Defaults to 200 */
        body: xmlContent,
        headers: {
            'Content-Type': 'text/xml'
        },
        isRaw: true
    };
    
    context.done();
};