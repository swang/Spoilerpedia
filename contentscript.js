
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
    xhr.open("GET", "https://gdata.youtube.com/feeds/api/videos?q="+query+"%20ending&orderby=relevance&start-index=1&max-results=3&alt=json&v=2&prettyprint=true", false)
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        // JSON.parse does not evaluate the attacker's scripts.
        resp = JSON.parse(xhr.responseText);
        //return resp
      }
    }
    xhr.send()
    return resp



    //return resp
  }
  

  if ( wikiPageIsAFilm() == true) {
    var plotHeadline = findHeadline('Plot')
    var movieName = document.getElementById("firstHeading").getElementsByTagName("span")[1].innerText.replace(/\s+\(.*\)/,'')

    if (plotHeadline) {
        
      var parentPlotNode = plotHeadline.parentNode,
          sibl = parentPlotNode.nextElementSibling,
          para,
          addSheet = document.createElement("style")
      addSheet.innerHTML = "p.spoiler, p.spoiler > a { background-color: black; color: black; }\np.spoiler:hover { background-color: white; color: black; }"
      target.body.appendChild(addSheet)
      

      while ( sibl && sibl.tagName.toString() != parentPlotNode.tagName.toString()) {
        if (sibl.tagName == "P") {
          //console.log( parentPlotNode.nextElementSibling.innerText)
          para = sibl
        }
        sibl = sibl.nextElementSibling
      }
      if (para) {
        para.className += " spoiler"
        para.onmouseover = function() {
          var getLinks = this.getElementsByTagName("a")
          for (var i = 0; i < getLinks.length; i++)
          {
            lastLinkBackground = getLinks[i].style.backgroundColor == "" ? getLinks[i].style.backgroundColor : "black"
            lastLinkColor = getLinks[i].style.color == "" ? getLinks[i].style.color : "black"              
            getLinks[i].style.backgroundColor = "white"
            getLinks[i].style.color = document.defaultView.getComputedStyle( document.getElementsByTagName("a")[0], "").getPropertyValue("color")
          }
        }
        para.onmouseout = function() {
          var getLinks = this.getElementsByTagName("a")
          for (var i = 0; i < getLinks.length; i++)
          {
            lastLinkBackground = getLinks[i].style.backgroundColor == "" ? getLinks[i].style.backgroundColor : "white"
            lastLinkColor = getLinks[i].style.color == "" ? getLinks[i].style.color : document.defaultView.getComputedStyle( document.getElementsByTagName("a")[0], "").getPropertyValue("color")
            getLinks[i].style.backgroundColor = "black"
            getLinks[i].style.color = "black"
          }
        }
        var videosDiv = document.createElement("div")
        //console.log( plotHeadline.parentNode.clientWidth );
        videosDiv.style.width = (plotHeadline.parentNode.clientWidth - 0) + "px"
        //videosDiv.style.clear = "both"
        addSheet.innerHTML += "\ndiv.ytvids { float:left; width:"+Math.floor(plotHeadline.parentNode.parentNode.clientWidth / 3) + "px }\ndiv > iframe { padding:10px }"
        
        // add <br> to clear page to next line. otherwise the next <h2> spazzes out
        //videos.innerHTML = "<div class='ytvids' id='video_1'>hi</div><div class='ytvids' id='video_2'>there</div><div class='ytvids' id='video_3'>mah peeps</div><br style='clear:both'>"

        
        var thirdedView = Math.floor(plotHeadline.parentNode.clientWidth / 3) - 20, 
            videoFeed = getYouTubeFeed( movieName )
        /*vidIframe.setAttribute("width", thirdedView)
        vidIframe.setAttribute("height", Math.floor(thirdedView / (560/315.0)))
        vidIframe.setAttribute("frameborder", 0)
        vidIframe.setAttribute("src", "https://www.youtube.com/embed/4G1xO_B2V7s")*/
        for ( var i = 0; i < videoFeed.feed.entry.length; i++)
        {
          var videoId = videoFeed.feed.entry[i].id["$t"].match(":video:(.*)")[1]
          videosDiv.appendChild(generateYouTubeVideo( videoId, thirdedView))

        }
        videosDiv.appendChild(document.createElement("div"))
        // <iframe width="560" height="315" src="https://www.youtube.com/embed/4G1xO_B2V7s" frameborder="0" allowfullscreen></iframe>

        //console.log(sibl)
        target.getElementById("mw-content-text").insertBefore( videosDiv, sibl ) 
      }
    }
  } 
   
}()
