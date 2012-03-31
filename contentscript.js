
var wikiSpoiler = function() {
  var target = arguments.length == 0 ? document : arguments[0],
      lastLinkBackground = "",
      lastLinkColor = ""        
      

  function wikiPageIsAFilm() {
    var matchYearFilm = /[0-9]{4} Films/i,
        catlinks = target.getElementById('mw-normal-catlinks'),
        cats = catlinks.getElementsByTagName("li"),
        isFilm = false

    for (var i = 0; i < cats.length; i++) {
      var aLink = cats[i].getElementsByTagName("a")[0]
      if (matchYearFilm.test(aLink.innerText)) {
        isFilm = true
      }
    }
    return isFilm
  }
  function findHeadline( headlineText ) {
    var headlines = target.getElementsByClassName('mw-headline')
    for (var i = 0; i < headlines.length; i++) {
      if (headlines[i].innerText == headlineText) {
        return headlines[i]
      }
    }
    return null
  }

  function generateYouTubeVideo( videoId, width ) {

    var vidIframe = document.createElement("iframe")

    vidIframe.setAttribute("width", width)
    vidIframe.setAttribute("height", Math.floor( width / (560/315.0)))
    vidIframe.setAttribute("frameborder", 0)
    vidIframe.setAttribute("src", "https://www.youtube.com/embed/"+ videoId) //4G1xO_B2V7s")

    return vidIframe
  }

  function getYouTubeFeed( query ) {
    var xhr = new XMLHttpRequest(),
        resp
    
    xhr.open("GET", "https://gdata.youtube.com/feeds/api/videos?q="+query+"&orderby=relevance&start-index=1&max-results=3&alt=json&v=2&prettyprint=true", false)
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        // JSON.parse does not evaluate the attacker's scripts.
        resp = JSON.parse(xhr.responseText);
        //return resp
      }
    }
    xhr.send()
    return resp
  }
  
  /*
   * function changeLinkColor:
   * changes the color of all links in 'node' to col/bgcol
   */

  function changeLinkColor( node, col, bgcol )  {
    var getLinks = node.getElementsByTagName("a")
    for (var i = 0; i < getLinks.length; i++)
    {
      getLinks[i].style.backgroundColor = bgcol // "white"
      getLinks[i].style.color = col //document.defaultView.getComputedStyle( document.getElementsByTagName("a")[0], "").getPropertyValue("color")
    }
  }
  if ( wikiPageIsAFilm() == true) {
    var plotHeadline = findHeadline('Plot'),
        moviePage = document.getElementById("firstHeading").getElementsByTagName("span")[0].innerText,
        movieName = moviePage.replace(/\s+\(.*\)/,''),
        movieYearInPageName = moviePage.match(/\(([0-9]{4}) .*\)/i),
        queryMovie = movieName + " " + (movieYearInPageName ? movieYearInPageName : "") + " ending",
        videoFeed = getYouTubeFeed(queryMovie),
        thirdedView = Math.floor(plotHeadline.parentNode.clientWidth / 3) - 20
    //Friday the 13th (1980 film)
    if (plotHeadline) {
        
      var parentPlotNode = plotHeadline.parentNode,
          sibl = parentPlotNode.nextElementSibling,
          para,
          addSheet = document.createElement("style"),
          videosDiv = document.createElement("div"),
          
      addSheet.innerHTML = "p.spoiler, p.spoiler > a { background-color: black; color: black; }\np.spoiler:hover { background-color: white; color: black; }"
      target.body.appendChild(addSheet)
      
      while ( sibl && sibl.tagName.toString() != parentPlotNode.tagName.toString()) {
        if (sibl.tagName == "P") {
          para = sibl
        }
        sibl = sibl.nextElementSibling
      }
      if (para) {
        para.className += " spoiler"
        para.onmouseover = changeLinkColor( para, document.defaultView.getComputedStyle( document.getElementsByTagName("a")[0], "").getPropertyValue("color"), "white")

        para.onmouseout = changeLinkColor( para, "black", "black")


        videosDiv.style.width = (plotHeadline.parentNode.clientWidth - 0) + "px"

        addSheet.innerHTML += "\ndiv.ytvids { float:left; width:"+Math.floor(plotHeadline.parentNode.parentNode.clientWidth / 3) + "px }\ndiv > iframe { padding:10px }"
        
        // add <br> to clear page to next line. otherwise the next <h2> spazzes out
        //videos.innerHTML = "<div class='ytvids' id='video_1'>hi</div><div class='ytvids' id='video_2'>there</div><div class='ytvids' id='video_3'>mah peeps</div><br style='clear:both'>"

        
        /*vidIframe.setAttribute("width", thirdedView)
        vidIframe.setAttribute("height", Math.floor(thirdedView / (560/315.0)))
        vidIframe.setAttribute("frameborder", 0)
        vidIframe.setAttribute("src", "https://www.youtube.com/embed/4G1xO_B2V7s")*/
        for ( var i = 0; i < videoFeed.feed.entry.length; i++)
        {
          var videoId = videoFeed.feed.entry[i].id["$t"].match(":video:(.*)")[1]
          videosDiv.appendChild(generateYouTubeVideo( videoId, thirdedView))
          // <iframe width="560" height="315" src="https://www.youtube.com/embed/4G1xO_B2V7s" frameborder="0" allowfullscreen></iframe>
        }

        videosDiv.appendChild(document.createElement("div"))
        target.getElementById("mw-content-text").insertBefore( videosDiv, sibl ) 
      }
    }
  } 
   
}()

// DONE! - need to add feature, if there is a "year" in the () of the title, then do a "movie year ending" lookup
// also if the movie hasn't come out yet, don't apply the spoiler text / youtube thing.
