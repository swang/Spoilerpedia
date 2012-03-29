

matchYearFilm = /[0-9]{4} Films/i

var catlinks = document.getElementById('mw-normal-catlinks')

var cats = catlinks.getElementsByTagName("li")

var isFilm = false

for (var i = 0; i < cats.length; i++) {
  var aLink = cats[i].getElementsByTagName("a")[0]
  if (matchYearFilm.test(aLink.innerText)) {
    isFilm = true
  }
}

if (isFilm == true) {
 
  var headlines = document.getElementsByClassName('mw-headline')
  for (var i = 0; i < headlines.length; i++) {
    if (headlines[i].innerText == "Plot") {


      var addSheet = document.createElement("style")
      addSheet.innerHTML = "p.spoiler, p.spoiler > a { background-color: black; color: black; }\np.spoiler:hover { background-color: white; color: black; }"
      document.body.appendChild(addSheet)

      parentPlotNode = headlines[i].parentNode
      var para, sibl = parentPlotNode.nextElementSibling
      while ( sibl && sibl.tagName.toString() != parentPlotNode.tagName.toString()) {
        if (sibl.tagName == "P") {
          //console.log( parentPlotNode.nextElementSibling.innerText)
          para = sibl
        }
        sibl = sibl.nextElementSibling
      }
      if (para) {
        para.className += " spoiler"
        //para.style.background = "black"
      }
      //var divNode = document.createNode("div")
      //divNode.style.background = "black"
      //divNode.appendChild( para )
    }
  } 
  //chrome.extension.sendRequest( {action: "spoilerLastParaOfPlot"} , function (response) {
  //    console.log("what happened?")
  //})
}
