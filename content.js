var $jq, sorted=false, orig_fd;
function getScript(){
    var script=document.createElement('script');
    script.src='jquery-latest.min.js';
    var head=document.getElementsByTagName('head')[0],
    done=false;
    script.onload=script.onreadystatechange = function(){
        if ( !done && (!this.readyState
            || this.readyState == 'loaded'
            || this.readyState == 'complete') ) {
            done=true;
            $jq=jQuery.noConflict();
            window.setTimeout(myfeedlysort,10);
            script.onload = script.onreadystatechange = null;
            head.removeChild(script);
        }
    };
    head.appendChild(script);
}

function myfeedlysort(){
    //DEBUG : $jq('.u0Entry').each(function(){console.log($jq(this).find('.nbrRecommendations').attr('title'))})
    var tryCnt, maxTry, maxFetch, unreadCount, feedId, feedCnt;
    var monitorAdded = false;
    var ignoreUnread = false;
    
    function initVar(){
        tryCnt   = 0; 
        maxTry   = 10;  //Max attempts to load more feeds (scroll down) 
        maxFetch = 40;  //Max feeds to load for sorting
        feedId   = $jq('#feedlyTitleBar a').attr('id');
        feedCnt  = $jq('.u0Entry').length;
        unreadCount = parseInt($jq('[class$=UnreadCountHint]:first').text().replace(/[^\d]/g,'')) || 0 ;
        injectSortButton();  
        if (!monitorAdded){
            $jq('#feedlyTabsHolder').delegate('','click',function(){setTimeout(checkForFeedChange,100);});
            monitorAdded = true;
        }
    }    
    function waitForFeedLoad(){
        if ($jq('.u0Entry').length == 0){
            setTimeout(waitForFeedLoad,50);
        }
        else {
            initVar();
        }
    }
    function checkForFeedChange(){
        var tmpFeedId   = $jq('#feedlyTitleBar a').attr('id');
        var tmpFeedCnt  = $jq('.u0Entry').length;
        if ((tmpFeedId != feedId) || (tmpFeedCnt != feedCnt)){
            waitForFeedLoad();            
        }    
    }
    //Remove all posts beyond the clicked post
    function deleteAllAboveThis(event){
        event.stopPropagation();
        clkParent = $jq(event.target).parents().eq(1);
        clkParent.prevAll().find('.condensedTools img[data-buryentryid]').click();
        clkParent.find('.condensedTools img[data-buryentryid]').click();    
    }
    function deleteAllBelowThis(event){
        event.stopPropagation();
        clkParent = $jq(event.target).parents().eq(1);
        clkParent.nextAll().find('.condensedTools img[data-buryentryid]').click();
        clkParent.find('.condensedTools img[data-buryentryid]').click();    
    }
    function clickGo(){
        checkForFeedChange();
        checkAvailableFeed();
        $jq(document).scrollTop(0);
        //window.scrollTo(0,0);    
    }
    function updateOptions(){
        maxFetch = parseInt($jq('#mygo').val()) || maxFetch;
        ignoreUnread = true; //manual update => unread count would be ignored
    }
    function injectSortButton(){
        if ($jq('#myfeedlyid').length == 0 ){
            $jq('#feedlyPageHeader .pageActionBar').prepend($jq('<img id="myfeedlyid" src="https://i.imgur.com/3MksqRg.png?1" title="Sort By Likes" class="pageAction" width=24 height=24 style="opacity:1;border:0;display:inline;"/>').click(clickGo));
            $jq('#feedlyPageHeader .pageActionBar').prepend($jq('<input type="text" name="maxfetch" title="Max feeds to sort - ignored if less than feeds already loaded" class="pageAction" id="mygo" style="opacity:1;float:left;display:inline;"/>').change(updateOptions));
            $jq('#mygo').width(40).height(24).css('text-align', 'center').css('border', '1px solid #aaa')
        }
        maxFetch = ((unreadCount == 0)||(typeof unreadCount === 'undefined')||(ignoreUnread)) ? maxFetch : unreadCount;
        $jq('#mygo').val(maxFetch);       
    }
    function addDeleteButtons(){
        //Remove a Social button and make room for 'Delete All' button
        try{
            $jq('.condensedTools a:nth-child(1)').remove()
            jQuery.each($jq('div.condensedTools'),function(i,val){if (!$jq(val).children().hasClass("delallbelow")){$jq(val).prepend($jq('<a href="javascript:void(0);" class="delallbelow" title="Delete ALL below" style="background-image: url(data:image/png;base64,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);"></a>').click(deleteAllBelowThis))}});
            $jq('.condensedTools a:nth-child(2)').remove()
            jQuery.each($jq('div.condensedTools'),function(i,val){if (!$jq(val).children().hasClass("delallabove")){$jq(val).prepend($jq('<a href="javascript:void(0);" class="delallabove" title="Delete ALL above" style="background-image: url(data:image/png;base64,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);"></a>').click(deleteAllAboveThis))}});
        }
        catch(e){console.log('Failed in addDeleteButtons(): '+e.message);}      
        getInteractionCount();
    }    
    function checkAvailableFeed(){
        var availableFeed = $jq('.u0Entry').length;
        if ( (availableFeed >= unreadCount) || (availableFeed >= maxFetch) || (tryCnt >= maxTry) ){
            addDeleteButtons();
        }
        else {
            tryCnt++;
            $jq(document).scrollTop($jq(document).scrollTop()+$jq('#mainBar').height());
            //window.scrollTo(0,$jq('#mainBar').height() + 100);
            setTimeout(checkAvailableFeed,500);
        }
    }
    function getInteractionCount(){
        var urlArray = [];
        $jq('.u0Entry').each(function() {
            var articleUrl = $jq(this).attr('data-alternate-link').replace(/.utm_source.*/,'');
            $jq(this).attr('data-alternate-link',articleUrl);
            urlArray.push(articleUrl);
        }); 
        var fbXhr = new XMLHttpRequest();        
        fbXhr.open("GET", 'https://graph.facebook.com/?ids='+escape(urlArray.join()), true);
        fbXhr.onreadystatechange = function() {
          if (fbXhr.readyState == 4) {
            try{
                var resp = (JSON.parse(fbXhr.responseText));
                //var resp = (JSON.parse(fbXhr.responseText))['data'];
                $jq('.u0Entry').each(function() {        
                    var ic = resp[$jq(this).attr('data-alternate-link')].shares;
                    $jq(this).attr('interaction-count',ic);                                        
                    if (!$jq(this).children().hasClass("icount")){
                        $jq('<div class="lastModified icount" style="float:right; width:32px; overflow:hidden; text-align:right; padding-right: 3px; padding-left: 0px"><span style="color:0c0;">'+((typeof ic === 'undefined')?'?':ic)+'</span></div>').insertAfter($jq(this).find('.quicklisthandle'));                                       
                    }
                }); 
                sortFeed();
            }
            catch(e){console.log('Failed fb API: '+e.message);}      
          }
        }
        fbXhr.send();        
    }
    function sortFeed(){
        //$jq('.section').remove() // Remove date-wise section        
        if(sorted){
            newparent = $jq('.u0Entry:first').parent();
            var fd = $jq('.u0Entry').detach();
            newparent.prepend(orig_fd);
            sorted = false;
        } else {
            newparent = $jq('.u0Entry:first').parent();
            try {
                var fd = $jq('.u0Entry').detach();
                orig_fd = fd.slice(); //copy of unsorted array .. to undo sort
                fd.sort(function(a,b){
                    try{
                        var aa = $jq(a).attr('interaction-count');//Populated from XMLHttpRequest
                        var bb = $jq(b).attr('interaction-count');
                        //var aa = $jq(a).find('.nbrRecommendations').attr('title');//Prepopulated by feedly - engagement number
                        //var bb = $jq(b).find('.nbrRecommendations').attr('title');
                        aa = (typeof aa !== 'undefined') ? (parseInt(aa.replace(/[^\d]/g,'')) || 0) : 0;
                        bb = (typeof bb !== 'undefined') ? (parseInt(bb.replace(/[^\d]/g,'')) || 0) : 0;
                        return bb-aa;
                    }catch(e){console.log('Fail in sort '+e.message);}
                });
            }catch(e){
                console.log('Fail in sortFeed '+e.message);
            }finally{
                newparent.prepend(fd);
                sorted = true;
            }
        }
    }
    waitForFeedLoad();
}

function mainEntry(){
    $jq=jQuery.noConflict();
    myfeedlysort();
}

//Needed when run_at = document_idle isn't used
if (document.readyState == "complete") {
    mainEntry();
} else {
  window.addEventListener("load", function() {
    setTimeout(mainEntry, 0);
  });
}
