if (!spoilerpedia) var spoilerpedia = {}


spoilerpedia.youtube = function() {

  return {

    generateYouTubeVideo: function(videoId, width) {

      var vidIframe = document.createElement("iframe")

      vidIframe.setAttribute("width", width)
      vidIframe.setAttribute("height", Math.floor( width / (560/315.0)))
      vidIframe.setAttribute("frameborder", 0)
      vidIframe.setAttribute("src", "https://www.youtube.com/embed/"+ videoId) //4G1xO_B2V7s")

      return vidIframe
    },

    getYouTubeFeed: function(query) {
      var xhr = new XMLHttpRequest(),
          resp
      
      xhr.open("GET", "https://gdata.youtube.com/feeds/api/videos?q="+query+"&orderby=relevance&start-index=1&max-results=3&alt=json&v=2&prettyprint=true", false)
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          // JSON.parse does not evaluate the attacker's scripts.
          resp = JSON.parse(xhr.responseText);
        }
      }
      xhr.send()
      return resp
    }
    
  }

}()

spoilerpedia.detectWiki = function() {
  var target = arguments.length == 0 ? document : arguments[0],
      lastLinkBackground = "",
      lastLinkColor = ""        

  return {
        
    wikiPageIsAFilm: function() {

      var matchYearFilm = /[0-9]{4} Films/i,
          cats = target.getElementById('mw-normal-catlinks').getElementsByTagName("li"),
          isFilm = false

      for (var i = 0; i < cats.length; i++) {
        var aLink = cats[i].querySelector("a") //getElementsByTagName("a")[0]
        if (matchYearFilm.test(aLink.innerText)) {
          isFilm = true
        }
      }
      return isFilm
    },

    findHeadline: function(headlineText) {
      var headlines = target.getElementsByClassName('mw-headline')
      for (var i = 0; i < headlines.length; i++) {
        if (new RegExp("^" + headlineText , "i").test( headlines[i].innerText )) {
          return headlines[i]
        }
      }
      return null
    },
    
    /*
     * function changeLinkColor:
     * changes the color of all links in 'node' to col/bgcol
     */
    changeLinkColor: function(node, col, bgcol)  {
      var getLinks = node.getElementsByTagName("a")
      for (var i = 0; i < getLinks.length; i++)
      {
        getLinks[i].style.backgroundColor = bgcol // "white"
        getLinks[i].style.color = col //document.defaultView.getComputedStyle( document.getElementsByTagName("a")[0], "").getPropertyValue("color")
      }
    },

    init: function() {
      var plotHeadline = this.findHeadline('Plot')

      if ( this.wikiPageIsAFilm() && plotHeadline != null) {
        
        chrome.extension.sendRequest({"showSpoilerpediaIcon":true}, function response() {})

        var moviePageEle = document.getElementById("firstHeading").getElementsByTagName("span"),
            moviePage
              
            for (var i = 0 ; i < moviePageEle.length; i++) {
              if (moviePageEle[i].getAttribute("class") != "editsection") {
                moviePage = moviePageEle[i].innerText
              }
            }

        var movieName = moviePage.replace(/\s+\(.*\)/,''), // returns title of page w/out disambig 
            movieYearInPageName = moviePage.match(/\(([0-9]{4}) .*\)/i), // grabs the year if it exists in disambig
            queryMovie = movieName + (movieYearInPageName ? (" " + movieYearInPageName) : "") + " ending",
            videoFeed = spoilerpedia.youtube.getYouTubeFeed(queryMovie), // grabs the YouTube feed
            videoWidth = Math.floor(plotHeadline.parentNode.clientWidth / 3),
            parentPlotNode = plotHeadline.parentNode,
            sibl = parentPlotNode.nextElementSibling,
            addSheet = document.createElement("style"),
            videosDiv = document.createElement("div"),
            para;
        
        //console.log(queryMovie)
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

          para.onmouseover  = function() { spoilerpedia.detectWiki.changeLinkColor(para, document.defaultView.getComputedStyle( document.getElementsByTagName("a")[0], "").getPropertyValue("color"), "white") }
          para.onmouseout   = function() { spoilerpedia.detectWiki.changeLinkColor(para, "black", "black") }

          videosDiv.style.width = (plotHeadline.parentNode.clientWidth - 0) + "px"

          addSheet.innerHTML += "\ndiv.ytvids { float:left; width:" + videoWidth + "px }\ndiv > iframe { padding:10px }"
          
          for ( var i = 0; i < videoFeed.feed.entry.length; i++)
          {
            var videoId = videoFeed.feed.entry[i].id["$t"].match(":video:(.*)")[1]
            videosDiv.appendChild(spoilerpedia.youtube.generateYouTubeVideo( videoId, videoWidth - 20))
            // <iframe width="560" height="315" src="https://www.youtube.com/embed/4G1xO_B2V7s" frameborder="0" allowfullscreen></iframe>
          }

          //videosDiv.appendChild(document.createElement("div"))
          target.getElementById("mw-content-text").insertBefore(videosDiv, sibl) 
        }
      } 
    }
  }
}()
spoilerpedia.detectWiki.init()

// DONE! - need to add feature, if there is a "year" in the () of the title, then do a "movie year ending" lookup
// also if the movie hasn't come out yet, don't apply the spoiler text / youtube thing.
