/**
 * Display's a chapter page by page. 
 * @param  chapter  the whole chapter
 */
function displayChapter(page,chapter)
{
  return function()
  {
    var parameters=readJson('parameters');

    if(parameters==null) 
    {
      initializeParameter();
    }
    applyParameters();

    document.getElementById('previous').style.display='block';
    document.getElementById('next').style.display='block';

    var iframe=document.getElementById("completeChapter");
    iframe.contentWindow.document.body.innerHTML=""; 
    var paragraphs = document.getElementById('paragraphs');
    while (paragraphs.firstChild) 
	{
      paragraphs.removeChild(paragraphs.firstChild);
    }

    document.getElementById("paragraphs").style.display='block';
    document.getElementById("paragraphs").addEventListener("click", displayToolbar, false); 

    iframe.contentWindow.document.body.innerHTML+=chapter; 

    var temp = document.getElementById('completeChapter').contentDocument;
    var ael = temp.getElementsByTagName("p");

    for(var i = 0, c = ael.length ; i < c ; i++)
    {		
      if (i==0)
      {
        var title = temp.getElementsByTagName("h1");
        var currentParagraph = title[0].cloneNode(true);
        var paragraph = document.createElement("h1");
        paragraph.id = "title".concat(i);
        paragraph.innerHTML=currentParagraph.innerHTML;
        document.getElementById("paragraphs").appendChild(paragraph);
      }

      var currentParagraph = ael[i].cloneNode(true);
      var paragraph = document.createElement("p");
      paragraph.id = "paragraph".concat(i);
      paragraph.innerHTML=currentParagraph.innerHTML;
      document.getElementById("paragraphs").appendChild(paragraph);

      if(paragraph instanceof Element) 
      {
        var p = elementInViewport(paragraph);
        if(!p) 
        {
          lastParagraph=i;
          break;
        }
      }
    }
    $( "#chaptersList" ).hide( "blind", { direction: "up" }, "slow") ;
    document.getElementById('toolbar').style.display="block";
  }
}

/**
 * Display's next page of the chapter. 
 */
function nextParagraphs()
{
  var temp = document.getElementById('completeChapter').contentDocument;
  var ael = temp.getElementsByTagName("p");

  paragraphs.innerHTML="";

  for(var i = 0, c = ael.length ; i < c ; i++)
  {
    if(i>lastParagraph)
    {
      var currentParagraph = ael[i].cloneNode(true);
      var paragraph = document.createElement("p");
      paragraph.id = "paragraph".concat(i);
      paragraph.innerHTML=currentParagraph.innerHTML;
      document.getElementById("paragraphs").appendChild(paragraph);

      if(paragraph instanceof Element) 
      {
        var p = elementInViewport(paragraph);
        if(!p) 
        {
          lastParagraph=i-1;
		  var pToDelete=document.getElementById("paragraph"+i);
		  document.getElementById("paragraphs").removeChild(pToDelete);
          break;
        }
      }
    }
  }
}

/**
 * Display's previous page of the chapter. 
 */
function previousParagraphs()
{
  var temp = document.getElementById('completeChapter').contentDocument;
  var ael = temp.getElementsByTagName("p");

  var containerParagraphs = document.getElementById("paragraphs");
  var nbDisplayedParagraphs = containerParagraphs.getElementsByTagName("p").length;

  var displayedParagraphs = containerParagraphs.getElementsByTagName("p");
  var lastDisplayedParagraph = displayedParagraphs[nbDisplayedParagraphs-1];

  var numberLastDisplayedParagraph = parseInt(lastDisplayedParagraph.id.substr(9,3));

  firstParagraph = ((numberLastDisplayedParagraph+1)-nbDisplayedParagraphs);

  paragraphs.innerHTML="";

  for(var i = firstParagraph-1, c = ael.length ; i < c ; i--)
  {	
    if (i<0)
    {
      var title = temp.getElementsByTagName("h1");
      var currentParagraph = title[0].cloneNode(true);
      var paragraph = document.createElement("h1");
      paragraph.id = "title".concat(i);
      paragraph.innerHTML=currentParagraph.innerHTML;
      document.getElementById("paragraphs").insertBefore(paragraph, containerParagraphs.firstChild);
      lastParagraph=firstParagraph-1;
    }	

    var currentParagraph = ael[i].cloneNode(true);
    var paragraph = document.createElement("p");
    paragraph.id = "paragraph".concat(i);
    paragraph.innerHTML=currentParagraph.innerHTML;

    if(containerParagraphs.getElementsByTagName("p").length > 0)
    {
      document.getElementById("paragraphs").insertBefore(paragraph, containerParagraphs.firstChild);
    }
    else
    {
      document.getElementById("paragraphs").appendChild(paragraph);
    }

    if(containerParagraphs.lastChild instanceof Element) 
    {
      var p = elementInViewport(containerParagraphs.lastChild);
      if(!p) 
      {
        lastParagraph=firstParagraph-1;
		var pToDelete=document.getElementById("paragraph"+i);
		document.getElementById("paragraphs").removeChild(pToDelete);
        break;
      }
    }	
  }	
}

/**
 * Test if the element is in the window's. 
 * @param  el  an element (<p>)
 * @return a boolean. If true the element is in the viewport else not
 */
function elementInViewport(el) 
{
  var rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth 
  );
}
