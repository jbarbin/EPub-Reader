/**
 * Navigate with keyboard. 
 */
function navigateWithKey(event) {
    if (event.keyCode === 39) {       //Right
        nextParagraphs();
    } else if(event.keyCode === 37) { //Left
        previousParagraphs();
    }
}


/**
 * Display's a chapter page by page. 
 * @param  chapter  the whole chapter
 * @param  idChapter  the id chapter
 */
function displayChapter(chapter, idChapter) {
  return function() {
    initDisplay();
	
    /**
     * Changing the style of the curretn chapter in summary
	 */
    for (var i = 0; i < chaptersListArray.length - 1; i++) {
	  document.getElementById("chapter" + i).style.background = "#120D16";
	  document.getElementById("chapter" + i).firstChild.firstChild.style.color = "lightblue";
	}
    document.getElementById("chapter" + idChapter).style.background = "#52B6CC";
	document.getElementById("chapter" + idChapter).firstChild.firstChild.style.color = "#120D16";
	
	currentChapter = idChapter;
	isNotFirstPage = false;
    document.getElementById('chaptersList').style.display = "none";
	document.getElementById('containerChapter').style.display = "block";
	
	/**
     * Apply parameters (brightness...)
	 */
    var parameters = readJson('parameters');

    if (parameters === null) {
      initializeParameter();
    }
      
    applyParameters();

    document.getElementById('previous').style.display = 'block';
    document.getElementById('next').style.display = 'block';

	/** 
     * Re-Initialize 'paragraphs'
	 */
    var iframe = document.getElementById("completeChapter");
    iframe.contentWindow.document.body.innerHTML = ""; 
    var paragraphs = document.getElementById('paragraphs');
    while (paragraphs.firstChild) {
      paragraphs.removeChild(paragraphs.firstChild);
    }

    document.getElementById("paragraphs").style.display = 'block';
    document.getElementById("paragraphs").addEventListener("click", displayToolbar, false); 

    iframe.contentWindow.document.body.innerHTML += chapter; 

    var temp = document.getElementById('completeChapter').contentDocument;
    var ael = temp.getElementsByTagName("p");

    for (var i = 0, c = ael.length ; i < c ; i++) {		
      if (i === 0) {    //First page of the chapter so display the title
        var title = temp.getElementsByTagName("h1");
        var currentParagraph = title[0].cloneNode(true);
        var paragraph = document.createElement("h1");
        paragraph.id = "title" + i;
        paragraph.innerHTML = currentParagraph.innerHTML;
        document.getElementById("paragraphs").appendChild(paragraph);
      }

      var currentParagraph = ael[i].cloneNode(true);
      var paragraph = document.createElement("p");
      paragraph.id = "paragraph" + i;
      paragraph.innerHTML = currentParagraph.innerHTML;
      document.getElementById("paragraphs").appendChild(paragraph);

      if (paragraph instanceof Element) {
        var p = elementInViewport(paragraph);
        if (!p) {
          lastParagraph = i;
          break;
        }
      }
    }
	saveLastPageRead2(currentChapterTitle, currentChapter, -3);    //-3 because the last page read is the first page of the chapter
    document.getElementById('toolbar').style.display = "block";
  }
}

/**
 * Returns a div which content the whole chapter. 
 *
 * @param  idChapter  the chapter Id
 * @param  firstParagraphToShow  the first paragraph to show in page
 */
function displayLastPageRead2(idChapter, firstParagraphToShow) {     //Display the last page read
  initDisplay();
  document.getElementById('chaptersList').style.display = "none";
  document.getElementById('containerChapter').style.display = "block";
  
  var parameters = readJson('parameters');
  if (parameters === null) {
    initializeParameter();
  }
  applyParameters();

  document.getElementById('previous').style.display = 'block';
  document.getElementById('next').style.display = 'block';

  var iframe = document.getElementById("completeChapter");
  iframe.contentWindow.document.body.innerHTML = ""; 
  var paragraphs = document.getElementById('paragraphs');
  paragraphs.innerHtml = "";
  document.getElementById("paragraphs").style.display = 'block';
  document.getElementById("header").style.display = 'block';
  document.getElementById('toolbar').style.display = "block";
  document.getElementById("paragraphs").addEventListener("click", displayToolbar, false); 
  
  var chapterToDisplay = chaptersListArray[idChapter];
  iframe.contentWindow.document.body.innerHTML += chapterToDisplay;
  currentChapter = idChapter;

  for (var i = 0; i < chaptersListArray.length - 1; i++) {
    document.getElementById("chapter" + i).style.background = "#120D16";
    document.getElementById("chapter" + i).firstChild.firstChild.style.color = "lightblue";
  }
  document.getElementById("chapter" + currentChapter).style.background = "#52B6CC";
  document.getElementById("chapter" + currentChapter).firstChild.firstChild.style.color = "#120D16";

  var temp = document.getElementById('completeChapter').contentDocument;
  var ael = temp.getElementsByTagName("p");

  if (firstParagraphToShow !== -3) {      //Not the first page of chapter to show
    for(var i = firstParagraphToShow, c = ael.length; i < c; i++) {		
      if (i === 0) {
        var title = temp.getElementsByTagName("h1");
        var currentParagraph = title[0].cloneNode(true);
        var paragraph = document.createElement("h1");
        paragraph.id = "title" + i;
        paragraph.innerHTML = currentParagraph.innerHTML;
        document.getElementById("paragraphs").appendChild(paragraph);
      }

      var currentParagraph = ael[i].cloneNode(true);
      var paragraph = document.createElement("p");
      paragraph.id = "paragraph" + i;
      paragraph.innerHTML = currentParagraph.innerHTML;
      document.getElementById("paragraphs").appendChild(paragraph);

      if(paragraph instanceof Element) {
        var p = elementInViewport(paragraph);
        if (!p) {
          lastParagraph = i;
          break;
        }
      }
    }
  }
  else {    //First page of chapter to show
    for (var i = 0, c = ael.length; i < c; i++) {		
      if (i === 0) {
        var title = temp.getElementsByTagName("h1");
        var currentParagraph = title[0].cloneNode(true);
        var paragraph = document.createElement("h1");
        paragraph.id = "title" + i;
        paragraph.innerHTML = currentParagraph.innerHTML;
        document.getElementById("paragraphs").appendChild(paragraph);
      }

      var currentParagraph = ael[i].cloneNode(true);
      var paragraph = document.createElement("p");
      paragraph.id = "paragraph" + i;
      paragraph.innerHTML = currentParagraph.innerHTML;
      document.getElementById("paragraphs").appendChild(paragraph);

      if (paragraph instanceof Element) {
        var p = elementInViewport(paragraph);
        if (!p) {
          lastParagraph = i;
          break;
        }
      }
    }
  }
}

/**
 * Display's the first page of the next chapter when it is the end of the current chapter. 
 */
function displayNextChapter() {
  initDisplay();
  isNotFirstPage = false;
  document.getElementById('chaptersList').style.display = "none";
  var parameters = readJson('parameters');
  if (parameters === null) {
    initializeParameter();
  }
  applyParameters();

  document.getElementById('previous').style.display = 'block';
  document.getElementById('next').style.display = 'block';

  var iframe = document.getElementById("completeChapter");
  iframe.contentWindow.document.body.innerHTML = ""; 
  var paragraphs = document.getElementById('paragraphs');
  while (paragraphs.firstChild) {
    paragraphs.removeChild(paragraphs.firstChild);
  }

  document.getElementById("paragraphs").style.display = 'block';
  document.getElementById("paragraphs").addEventListener("click", displayToolbar, false); 

  var chapterToDisplay = chaptersListArray[currentChapter + 1];
  iframe.contentWindow.document.body.innerHTML += chapterToDisplay; 
    
  currentChapter = currentChapter+1
  for (var i = 0; i < chaptersListArray.length - 1; i++) {
    document.getElementById("chapter" + i).style.background = "#120D16";
    document.getElementById("chapter" + i).firstChild.firstChild.style.color = "lightblue";
  }
  document.getElementById("chapter" + currentChapter).style.background = "#52B6CC";
  document.getElementById("chapter" + currentChapter).firstChild.firstChild.style.color = "#120D16";

  var temp = document.getElementById('completeChapter').contentDocument;
  var ael = temp.getElementsByTagName("p");

  for (var i = 0, c = ael.length; i < c; i++) {		
    if (i === 0) {
      var title = temp.getElementsByTagName("h1");
      var currentParagraph = title[0].cloneNode(true);
      var paragraph = document.createElement("h1");
      paragraph.id = "title" + i;
      paragraph.innerHTML = currentParagraph.innerHTML;
      document.getElementById("paragraphs").appendChild(paragraph);
    }

    var currentParagraph = ael[i].cloneNode(true);
    var paragraph = document.createElement("p");
    paragraph.id = "paragraph" + i;
    paragraph.innerHTML = currentParagraph.innerHTML;
    document.getElementById("paragraphs").appendChild(paragraph);
    if (paragraph instanceof Element) {
      var p = elementInViewport(paragraph);
      if (!p) {
        lastParagraph = i;
        var pToDelete = document.getElementById("paragraph" + i);
        document.getElementById("paragraphs").removeChild(pToDelete);
        break;
      }
    }
  }
  saveLastPageRead2(currentChapterTitle, currentChapter, -3);     // -3 because the last page read is the first page of the chapter
}

/**
 * Display's the last page of the previous chapter when it is the beggining of the current chapter. 
 */
function displayPreviousChapter() {
    initDisplay();
    isNotFirstPage = true;
    document.getElementById('chaptersList').style.display = "none";
    var parameters = readJson('parameters');
    var paragraphIdArray = [];
    if (parameters === null) {
      initializeParameter();
    }
    applyParameters();

    document.getElementById('previous').style.display = 'block';
    document.getElementById('next').style.display = 'block';

    var iframe = document.getElementById("completeChapter");
    iframe.contentWindow.document.body.innerHTML = ""; 
    var paragraphs = document.getElementById('paragraphs');
    while (paragraphs.firstChild) {
      paragraphs.removeChild(paragraphs.firstChild);
    }

    document.getElementById("paragraphs").style.display = 'block';
    document.getElementById("paragraphs").addEventListener("click", displayToolbar, false); 

	var chapterToDisplay = chaptersListArray[currentChapter - 1];
    iframe.contentWindow.document.body.innerHTML += chapterToDisplay; 
    
	currentChapter = currentChapter - 1;
	for (var i = 0; i < chaptersListArray.length - 1; i++) {
	  document.getElementById("chapter" + i).style.background = "#120D16";
	  document.getElementById("chapter" + i).firstChild.firstChild.style.color = "lightblue";
	}
    document.getElementById("chapter" + currentChapter).style.background = "#52B6CC";
	document.getElementById("chapter" + currentChapter).firstChild.firstChild.style.color = "#120D16";
    var temp = document.getElementById('completeChapter').contentDocument;
    var ael = temp.getElementsByTagName("p");
    var paragraphToDisplay = [];
    for (var i = ael.length - 1; i > 0 ; i--) {		
      var currentParagraph = ael[i].cloneNode(true);
      var paragraph = document.createElement("p");
      paragraph.id = "paragraph" + i;
      paragraph.innerHTML = currentParagraph.innerHTML;
      
	  paragraphToDisplay.push(paragraph);
	  
      document.getElementById("paragraphs").appendChild(paragraph);

      if (paragraph instanceof Element) {
        var p = elementInViewport(paragraph);
        if (!p) {
		  paragraphIdArray.push(i);
          lastParagraph = i;
          break;
        }
      }
    }

	paragraphToDisplay.reverse();
	while (paragraphs.firstChild) {
      paragraphs.removeChild(paragraphs.firstChild);
    }
	for (var i = 0; i < paragraphToDisplay.length - 1; i++) {
	  document.getElementById("paragraphs").appendChild(paragraphToDisplay[i]);
	}
	saveLastPageRead2(currentChapterTitle,currentChapter,paragraphIdArray[0]);
}

/**
 * Display's next page of the chapter. 
 */
function nextParagraphs() {
  initDisplay();
  isNotFirstPage = true;
  var temp = document.getElementById('completeChapter').contentDocument;
  var ael = temp.getElementsByTagName("p");
  var paragraphIdArray = [];
  paragraphs.innerHTML = "";

  for (var i = 0, c = ael.length; i < c; i++) {
    if (i > lastParagraph) {
      var currentParagraph = ael[i].cloneNode(true);
      var paragraph = document.createElement("p");
      paragraph.id = "paragraph" + i;
      paragraph.innerHTML=currentParagraph.innerHTML;
      document.getElementById("paragraphs").appendChild(paragraph);
      paragraphIdArray.push(i);
      if (paragraph instanceof Element) {
        var p = elementInViewport(paragraph);
        if (!p) {
          lastParagraph = i - 1;
		  var pToDelete = document.getElementById("paragraph" + i);
		  document.getElementById("paragraphs").removeChild(pToDelete);
		  saveLastPageRead2(currentChapterTitle, currentChapter, paragraphIdArray[0]);
          break;
        }
		
      }
    }
	if (i === ael.length - 1) {
	  displayNextChapter();
	}
  }
}

/**
 * Display's previous page of the chapter. 
 */
function previousParagraphs() {
  initDisplay();
  if (isNotFirstPage) {
    var temp = document.getElementById('completeChapter').contentDocument;
    var ael = temp.getElementsByTagName("p");

    var containerParagraphs = document.getElementById("paragraphs");
    var nbDisplayedParagraphs = containerParagraphs.getElementsByTagName("p").length;

    var displayedParagraphs = containerParagraphs.getElementsByTagName("p");
    var lastDisplayedParagraph = displayedParagraphs[nbDisplayedParagraphs - 1];

    var paragraphIdArray = [];
    var numberLastDisplayedParagraph = parseInt(lastDisplayedParagraph.id.substr(9, 3));

    firstParagraph = ((numberLastDisplayedParagraph + 1) - nbDisplayedParagraphs);
    paragraphs.innerHTML = "";
  
    for (var i = firstParagraph-1, c = ael.length; i < c; i--) {	
      if (i === -1) {
        var title = temp.getElementsByTagName("h1");
        var currentParagraph = title[0].cloneNode(true);
        var paragraph = document.createElement("h1");
        paragraph.id = "title" + i;
        paragraph.innerHTML = currentParagraph.innerHTML;
        document.getElementById("paragraphs").insertBefore(paragraph, containerParagraphs.firstChild);
		var nbElementBeforeDelete=document.getElementById("paragraphs").childNodes.length;
		for (var j = document.getElementById('paragraphs').childNodes.length - 1; j > 0; j--) {
		  var elt = elementInViewport(document.getElementById('paragraphs').childNodes[j]);
		  if (!elt) {
		    var pToDelete = document.getElementById('paragraphs').childNodes[j];
		    document.getElementById("paragraphs").removeChild(pToDelete);
          }
		}
		var nbElementAfterDelete = document.getElementById("paragraphs").childNodes.length;
		var difDelete = nbElementBeforeDelete - nbElementAfterDelete;
        lastParagraph = firstParagraph - 1 - difDelete;
		saveLastPageRead2(currentChapterTitle,currentChapter, -3);
	    isNotFirstPage = false;
      }	
		
      var currentParagraph = ael[i].cloneNode(true);
      var paragraph = document.createElement("p");
      paragraph.id = "paragraph" + i;
      paragraph.innerHTML = currentParagraph.innerHTML;

      if (containerParagraphs.getElementsByTagName("p").length > 0) {
        document.getElementById("paragraphs").insertBefore(paragraph, containerParagraphs.firstChild);
      } else {
        document.getElementById("paragraphs").appendChild(paragraph);
      }
      
      if (containerParagraphs.lastChild instanceof Element) {
        var p = elementInViewport(containerParagraphs.lastChild);
        if (!p) {
		  paragraphIdArray.push(i + 1);
          lastParagraph = firstParagraph - 1;
		  var pToDelete = document.getElementById("paragraph" + i);
		  document.getElementById("paragraphs").removeChild(pToDelete);
          break;
        }
      }	
    }
	saveLastPageRead2(currentChapterTitle, currentChapter, paragraphIdArray[0]);
  } else {
    displayPreviousChapter();
  }
}

/**
 * Test if the element is in the window's. 
 * @param  el  an element (<p>)
 * @return a boolean. If true the element is in the viewport else not
 */
function elementInViewport(el) {
  var rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth 
  );
}

function initDisplay() {
  document.getElementById('previousImage').style.display = "block";
  document.getElementById('nextImage').style.display = "block";
  $("#previousImage").fadeOut("slow");
  $("#nextImage").fadeOut("slow");
  document.getElementById('next').style.height = window.innerHeight + "px";
  document.getElementById('previous').style.height = window.innerHeight + "px";
  document.getElementById('next').style.width = ((window.innerWidth) * 7) / 100 + "px";
  document.getElementById('previous').style.width = ((window.innerWidth) * 7) / 100 + "px";
  document.getElementById('previous').style.maxwidth = ((window.innerWidth) * 86) / 100 + "px";
}