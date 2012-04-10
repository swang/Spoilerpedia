if (typeof spoilerpedia === 'undefined') { var spoilerpedia = {} }

spoilerpedia.youtube = function() {
  return {
    /*
     * function resize
     * Resizes the spoilerpedia div based off the reflowed div on Wikipedia.
     */
    resize: function() {
      var videosDiv = document.querySelector("div#spoilerpedia-videos"),
          videosDivWidth = document.querySelector("div#spoilerpedia-videos").clientWidth
          videos = videosDiv.querySelectorAll("iframe"),
          videoWidth = Math.floor(videosDivWidth / 3) - 20

      for ( var i = 0; i < videos.length; i++)
      {
        videos[i].setAttribute('width', videoWidth)
        videos[i].setAttribute("height", Math.floor(videoWidth / (560/315.0) ))
      }
    },

    /*
     * function generateYouTubeVideo
     * Generates an iframe element with the YouTube video with id, 'videoId' and a width of 'width'
     */
    generateYouTubeVideo: function(videoId, width) {
      var vidIframe = document.createElement("iframe")

      vidIframe.setAttribute("width", width)
      vidIframe.setAttribute("height", Math.floor( width / (560/315.0)))
      vidIframe.setAttribute("frameborder", 0)
      vidIframe.setAttribute("src", "https://www.youtube.com/embed/"+ videoId) //4G1xO_B2V7s

      return vidIframe
    },

    /* 
     * function getYouTubeFeed
     * Returns the top 3 relevant links for 'query'
     */
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
      return resp.feed
    }
    
  }

}()
spoilerpedia.wiki = function() {
  var target = arguments.length == 0 ? document : arguments[0]

  return {
    /* 
     * function wikiPageIsAFilm
     * Determines whether or not the current page on Wikipedia is one about film.
     * Generally any page about a film will include the category '<Year> Film' so
     * we will search for that in its list of categories.
     */
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

    /*
     * function findHeadline
     * Finds a headline in Wikipedia that matches `headlineText`
     */
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
     * function changeLinkColor
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

    /*
     * function getLastParagraph
     * returns the last paragraph under the plot heading
     */
    getLastParagraph: function(plotHeadline) {
      var parentPlotNode = plotHeadline.parentNode,
          sibl = parentPlotNode.nextElementSibling,
          para
            
      while ( sibl && sibl.tagName.toString() != parentPlotNode.tagName.toString()) {
        if (sibl.tagName == "P") {
          para = sibl
        }
        sibl = sibl.nextElementSibling
      }
      return para
    },

    /*
     * function applySpoiler
     * adds blackbars across the last paragraph under Plot heading
     */
    applySpoiler: function(paragraph) {
      if (paragraph) {
        var linkStyle = document.defaultView.getComputedStyle( document.getElementsByTagName("a")[0], "")
        
        paragraph.className += " spoiler"
        paragraph.onmouseover  = function() { spoilerpedia.wiki.changeLinkColor(paragraph, linkStyle.getPropertyValue("color"), linkStyle.getPropertyValue("background-color")) }
        paragraph.onmouseout   = function() { spoilerpedia.wiki.changeLinkColor(paragraph, "black", "black") }
        
        // set link color in spoiler to black/black
        spoilerpedia.wiki.changeLinkColor(paragraph, "black", "black")
      }
    },

    /*
     * function removeSpoiler
     * removes blackbars from last paragraph and removes mouseover/out events
     */
    removeSpoiler: function(paragraph) {
      if (paragraph) {
        var linkStyle = document.defaultView.getComputedStyle( document.getElementsByTagName("a")[0], "")
        
        // remove spoiler class and trims end spaces
        paragraph.className = paragraph.className.replace(/\bspoiler\b/gi,"").replace(/\s\s*$/,"").replace(/^\s\s*/,"") 
        // remove mouseover/out events
        paragraph.onmouseover = null
        paragraph.onmouseout = null

        // fix link color to the default, just in case it was stuck on black/black
        spoilerpedia.wiki.changeLinkColor(paragraph, linkStyle.getPropertyValue("color"), linkStyle.getPropertyValue("background-color"))
      }
    },

    /*
     * function getSheet
     * returns <style> that contains styles for spoilerpedia, or if it does not
     * exist, one is created and returned.
     */
    getSheet: function() {
      var styleSheet = document.querySelector("style#spoilerpedia-css")

      if (!styleSheet) {
        styleSheet = document.createElement("style")
        styleSheet.id = "spoilerpedia-css"
      }
      return styleSheet
    },

    /* function getMovie
     * returns the Wikipedic title of current Page
     * trick is spans inside the heading change if user is logged in vs logged out.
     */
    getTitle: function() {
      var getSpans = document.getElementById("firstHeading").getElementsByTagName("span"),
          moviePage

      for (var i = 0 ; i < getSpans.length; i++) {
        if (getSpans[i].getAttribute("class") != "editsection") {
          moviePage = getSpans[i].innerText
        }
      }
      return moviePage
    },

    /* 
     * function addVideos
     * adds 3 videos at the bottom of the Plot paragraph with the top 3 relevant
     * YouTube videos for that movie's ending
     */
    addVideos: function(moviePage) {
      var videosDiv = document.createElement("div"),
          videoDivWidth = this.findHeadline('Plot').parentNode.parentNode.clientWidth,
          movieName = moviePage.replace(/\s+\(.*\)/,''), // returns title of page w/out disambig 
          movieYearInPageName = moviePage.match(/\(([0-9]{4}) .*\)/i), // grabs the year if it exists in disambig
          queryMovie = movieName + (movieYearInPageName && movieYearInPageName.length >= 2 ? (" " + movieYearInPageName[1]) : "") + " ending",
          videoFeed = spoilerpedia.youtube.getYouTubeFeed(queryMovie) // grabs the YouTube feed
          
      videosDiv.id = "spoilerpedia-videos"
      videosDiv.style.width = "auto"
      videosDiv.style.height = "auto"
      videosDiv.style.overflow = "hidden"

      for ( var i = 0; i < videoFeed.entry.length; i++)
      {
        var videoId = videoFeed.entry[i].id["$t"].match(":video:(.*)")[1]
        videosDiv.appendChild(spoilerpedia.youtube.generateYouTubeVideo( videoId, Math.floor(videoDivWidth / 3) - 20))
        // <iframe width="560" height="315" src="https://www.youtube.com/embed/4G1xO_B2V7s" frameborder="0" allowfullscreen></iframe>
      }
      return videosDiv
    },
    removeSpoilerpedia: function() {
      var plotHeadline = this.findHeadline('Plot'),
          para = this.getLastParagraph(plotHeadline)

      this.removeSpoiler(para)
      document.querySelector("div#spoilerpedia-videos").style.display = 'none'
    },

    restoreSpoilerpedia: function() {
      var plotHeadline = this.findHeadline('Plot'),
          para = this.getLastParagraph(plotHeadline)
            
      this.applySpoiler(para)
      document.querySelector("div#spoilerpedia-videos").style.display = 'block'
    },
    init: function() {
      var plotHeadline = this.findHeadline('Plot')

      if ( this.wikiPageIsAFilm() && plotHeadline != null) {
        chrome.extension.sendRequest({"showSpoilerpediaIcon":true}, function response() {})

        chrome.extension.sendRequest({"tracker":true}, function resp() {})
        var moviePage = this.getTitle(),
            para = this.getLastParagraph(plotHeadline)
        
        target.body.appendChild( this.getSheet() )

        this.getSheet().innerHTML = "p.spoiler, p.spoiler > a { background-color: black; color: black; }\np.spoiler:hover { background-color: white; color: black; }\ndiv#spoilerpedia-videos > iframe { padding:10px }\n"
        if (para) {
          var videosDiv = this.addVideos(moviePage)

          this.applySpoiler(para)
          target.getElementById("mw-content-text").insertBefore(videosDiv , para.nextElementSibling) 
        }
        setTimeout( spoilerpedia.youtube.resize, 1000)
      } 
    }
  }
}()

spoilerpedia.wiki.init()

chrome.extension.onRequest.addListener( function onRequest(request, sender, sendResponse) {
  if (request.showSpoilerpediaIcon) {
    chrome.pageAction.show(sender.tab.id)
  }
  if (request.restoreSpoilerpedia) {
    spoilerpedia.wiki.restoreSpoilerpedia()
  }
  if (request.removeSpoilerpedia) {
    spoilerpedia.wiki.removeSpoilerpedia()
  }
  // Return nothing to let the connection be cleaned up.
  sendResponse({})
})  

window.onresize = function(event) {
  spoilerpedia.youtube.resize()
}
