var firstParagraph = 0; //The first paragraph of the current page read when clicking on "previous"
var lastParagraph = 0; //The last paragraph of the current page when clicking on "next"
var chaptersListArray = [];//Array of list of chapters
var currentChapter; //The integer of the current chapter read
var currentChapterTitle; //Title of the current chapter
var isNotFirstPage = true;//To know if the page to show is the first or not

window.onload = function() 
{
//deleteDB('booksLibrary3');
//deleteAllBooks();
 //localStorage.removeItem("lastPageRead");
  
  //Hidding the vertical scrollbar  
  var htmlElement = document.body.parentElement;
  htmlElement.style.overflow = 'hidden';
  
  var lastPageRead=readJson('lastPageRead');
  console.log(lastPageRead);
  
  //If there are no books yet, initialize local storage for lastPageRead
  if(lastPageRead == null) 
  {
    initializeLastPageRead();
  }

  var selectedBook = document.getElementById('book');
  selectedBook.onchange = function() 
  {
    //Check if the file is in .epub format
    if(selectedBook.files[0].name.indexOf(".epub",0) == -1)
    {
      alert("The selected file is wrong. Please select an ebook in Epub format");
    }
    else
    {
      openFile(selectedBook.files[0], function(data) 
      {  
         var bookTitle;
         var bookAuthor;
         var zip = new JSZip(data);
         var container=getContainer(zip);
         if(container != null)
         {
           //Get all information we need in Container.xml and store them
           var parser = new DOMParser();
           var doc = parser.parseFromString(container, "application/xml");
           var rootfile = doc.getElementsByTagNameNS("*", "rootfile")[0];
           var opffile = rootfile.getAttribute("full-path");
           var opfdata = zip.file(opffile);
           var opf = parser.parseFromString(opfdata.data, "text/xml");
           var metadata = opf.getElementsByTagNameNS("*", "metadata")[0];

           bookTitle = metadata.getElementsByTagNameNS("*", "title")[0].childNodes[0].nodeValue;
           bookAuthor = metadata.getElementsByTagNameNS("*", "creator")[0].childNodes[0].nodeValue;
         }
        savesBook(selectedBook.files[0],bookTitle,bookAuthor);//Save the selected file in dataBase
		saveNewBook(bookTitle,-1,-1);//Save the book in local storage to get the last page read
        displayBookList();
      })
    }
  }
  displayBookList();
};


/**
 * Allows to return to the library, this function hides and displays some elements
 */
function goToLibrary()
{
    chaptersListArray.length = 0;
    document.getElementById('book').style.display = "block";
    document.getElementById('bookList').style.display = "block";
    document.getElementById('toolbar').style.display = "none";
    document.getElementById('title').textContent = "EPub-Reader";
    document.getElementById('author').textContent = "";
    document.getElementById('summary').style.display = "none";
    document.getElementById('paragraphs').style.display = "none";
    document.getElementById('previous').style.display = 'none';
    document.getElementById('next').style.display = 'none';
    // var chapter = document.getElementById('chapter');
	// console.log(chapter);
    // if(chapter)
    // {
      // document.getElementById('body').removeChild(chapter);
    // }
    var paragraphs = document.getElementById('paragraphs');
	paragraphs.innerHTML = "";
	
	var chaptersList = document.getElementById('chaptersList');
	chaptersList.innerHTML = "";
}

/**
 * Allows to display the books list
 */
function displayBookList()
{
  displayAllBooks();
}

/**
 * Allows to open a book in .epub format.
 * This function opens the book thanks to JSZip library and parse some files in this archive.
 * Then it displays the chapter's list.
 * @param  book  an absolute URL giving the base location of the image
 */
function openBook(book)
{
  return function()
  {
    //Style settings
    var summary = document.getElementById('summary');
    summary.style.display="block";
	console.log(book);
    document.getElementById('bookList').style.display = "none";
    document.getElementById('progress').style.display = "block";
	
	//Open the chosen book
    openFile(book, function(data) 
    {
      var zip = new JSZip(data);
      var container = getContainer(zip);

      if(container != null)
      {
        //Get all information we need in Container.xml
        var parser = new DOMParser();
        var doc = parser.parseFromString(container, "application/xml");
        var rootfile = doc.getElementsByTagNameNS("*", "rootfile")[0];
        var opffile = rootfile.getAttribute("full-path");
        var opfdata = zip.file(opffile);
        var opf = parser.parseFromString(opfdata.data, "text/xml");
        var metadata = opf.getElementsByTagNameNS("*", "metadata")[0];
        var manifest = opf.getElementsByTagNameNS("*", "manifest")[0];
        var spine = opf.getElementsByTagNameNS("*", "spine")[0];
        var toc = spine.getAttribute("toc");
        var itemref = spine.getElementsByTagNameNS("*", "itemref")[0];
        var idRef = itemref.getAttribute("idref");
        var items = manifest.getElementsByTagNameNS("*", "item");
        var title = metadata.getElementsByTagNameNS("*", "title")[0].childNodes[0].nodeValue;
        var author = metadata.getElementsByTagNameNS("*", "creator")[0].childNodes[0].nodeValue;

        //Display book's title and author
        var h1 = document.getElementById('title');
        var h2 = document.getElementById('author');
        h1.textContent = decodeUTF8(title);
        h2.textContent = decodeUTF8(author);

        //Get "toc.ncx"
        for (var i = 0; i < items.length; i++) 
		{
          var id = items[i].getAttribute("id");
          if (id == idRef) 
		  {
            var HTMLFileName = items[i].getAttribute("href");
          } 
          else if(id == toc) 
          {
            var NcxFileName = items[i].getAttribute("href");
          }
        }

        var tocFolder = '';
        var isInOPS = zip.folder("OPS").file("toc.ncx");//If the file exists in OPS folder then the file exists into it
        var isInOEBPS = zip.folder("OEBPS").file("toc.ncx");//If the file exists in OEBPS folder then the file exists into it

        if(isInOPS)
        {
          tocFolder ='OPS/';
        }
        else if(isInOEBPS)
        {
          tocFolder ='OEBPS/';
        }
        else
        {
          tocFolder ='';
        }

        var ncxFile = zip.file(tocFolder+NcxFileName);

        if(ncxFile != null)
        {
          var decoded = decodeUTF8(ncxFile.data);

          //Get all infos in "toc.ncx"
          var parserNcx = parser.parseFromString(decoded, "text/xml");
          var navMap = parserNcx.getElementsByTagNameNS("*", "navMap")[0];
          var navPoints = navMap.getElementsByTagNameNS("*", "navPoint");
          var pointsList = [];
          var pageFiles = [];

          //Get content of chapters
          if (navPoints.length > 0) 
          {
            var pointsCounter = 0;
            for (var i = 0; i < navPoints.length; i++) 
			{
              var label = navPoints[i].getElementsByTagNameNS("*", "navLabel")[0].getElementsByTagNameNS("*", "text")[0].textContent;
              var content = navPoints[i].getElementsByTagNameNS("*", "content")[0].getAttribute("src");
              var navPoint = navPoints[i];
              var point = [];

              point['label'] = label;
              point['content'] = content;
              pointsList[pointsCounter] = point;
              pointsCounter++;

              if(tocFolder == '')
              {
                var pageFile = zip.file(content);
              }
              else
              {
                if(content.indexOf("#")!= -1)
                {
                  var pageFile = zip.file(tocFolder+content.substring(0,content.indexOf("#")));
                }
                else
                {
                  var pageFile = zip.file(tocFolder+content);
                }
              }
              decodedPage = decodeUTF8(pageFile.data);
              pageFiles.push(decodedPage);
            }
          }
		  
		  //Display the list of chapters
          var chaptersList = document.getElementById('chaptersList');

          for(var i = 0; i<pointsList.length;i++)
          {
            var chapter = document.createElement('li');
            var dl = document.createElement('dl');
            var dt = document.createElement('dt');
            var chapterName = document.createTextNode(pointsList[i].label);
            var completeChapter = pageFiles[i];

			chaptersListArray.push(pageFiles[i]);
			
            dl.appendChild(dt);
            chapter.appendChild(dl);
            chapter.id="chapter"+i;
            chapter.onclick=displayChapter(completeChapter,i);

            dt.appendChild(chapterName);
            chaptersList.appendChild(chapter);
          }
          document.getElementById('book').style.display="none";
		  
		  
		  
		  currentChapterTitle = title;
          var idBook = getCounter(title);
		  var oLastPageRead = readJson('lastPageRead');
		  
		  if(oLastPageRead.books[idBook].lastChapterRead != -1 && oLastPageRead.books[idBook].lastParagraph != -1 )
		  {
		    displayLastPageRead2(oLastPageRead.books[idBook].lastChapterRead,oLastPageRead.books[idBook].lastParagraph);
			document.getElementById('progress').style.display = "none";
		  }
		  else
		  {
          $( "#chaptersList" ).show( "blind", { direction: "up" }, "slow") ;
          // document.getElementById('chaptersList').style.display="block";
          document.getElementById('progress').style.display="none";
		  }
		  
        }
        else
        {
          document.getElementById('progress').style.display="none";
          alert("Sorry the file you chose is somehow corrupted.");
        }
      }
    });
  }
}

/**
 * Allows to display the summary or not
 */
function displaySummary()
{
    //Style settings
    if(document.getElementById('containerChapter').style.display == "block")
	{
	  document.getElementById('containerChapter').style.display = "none";
	}
	else
	{
	  document.getElementById('containerChapter').style.display = "block";
	}
    if(document.getElementById('chaptersList').style.display == "none")
    {
	  //Showing the vertical scrollbar to scroll the summary
	  var htmlElement = document.getElementsByTagName('html')[0];
	  htmlElement.style.overflow = 'auto';
	  
      $( "#chaptersList" ).show( "blind", { direction: "up" }, "slow") ;
    }
    else
    {
	  //Hidding the vertical scrollbar  
	  var htmlElement = document.getElementsByTagName('html')[0];
	  htmlElement.style.overflow = 'hidden';
	  
      $( "#chaptersList" ).hide( "blind", { direction: "up" }, "slow") ;
    }
}

/**
 * Allows to display the toolbar or not
 */
function displayToolbar()
{
  //Style settings
  if(document.getElementById('toolbar').style.display == "none")
  {	
    $( "#toolbar" ).show( "blind", { direction: "down" }, "slow") ;
  }
  else
  {
    $( "#toolbar" ).hide( "blind", { direction: "down" }, "slow") ;
  }

  if(document.getElementById('header').style.display == "none")
  {
    $( "#header" ).show( "blind", { direction: "up" }, "slow") ;
  }
  else
  {
    $( "#header" ).hide( "blind", { direction: "up" }, "slow") ;
  }
}

/**
 * Returns a div which content the whole chapter. 
 *
 * @param  chapter  an object whom content a chapter 
 * @return      the div with the chapter
 */
function createNewDiv(chapter) 
{
  var divChapter = document.createElement("div");
  divChapter.id = 'chapter';
  divChapter.className = 'chapter';
  divChapter.style.fontSize = '15px';
  divChapter.innerHTML = chapter;
  divChapter.addEventListener("click", displayToolbar, false); 

  return divChapter;
}

/**
 * Returns a decoded string in UTF8. 
 *
 * @param str  a string
 * @return a decoded string
 */
function decodeUTF8(str) 
{
  return decodeURIComponent(escape(str));
}

/**
 * Read a file and open it. 
 *
 * @param bookFiles  a file in .epub format
 * @param dezip  a function to open the file
 */
function openFile(bookFiles,dezip)
{
  var reader = new FileReader();
  reader.onloadend = function() 
  {
    dezip(reader.result);
  };
  reader.readAsBinaryString(bookFiles);
}

/**
 * Get 'container.xml' in the archive. 
 *
 * @param archive  a file in .epub format
 * @return file's datas
 */
function getContainer(archive)
{
  var fichier = archive.folder("META-INF").file("container.xml");
  if (fichier) 
  {
    return(fichier.data);
  }
}

/**
 * Display and hide some elements when cancel to delete a book. 
 *
 */
function cancelConfirmDeleteBook()
{
  if(document.getElementById('confirmDeleteBook').style.display = "block")
  {
    document.getElementById('bookList').style.display = "block";
    document.getElementById('confirmDeleteBook').style.display = "none";
  }
}

/**
 * Display and hide some elements when cancel to get a word's definition. 
 *
 */
function cancelConfirmDefineWord()
{
  if(document.getElementById('confirmDefineWord').style.display = "block")
  {
    document.getElementById('confirmDefineWord').style.display = "none";
    if(document.getElementById('toolbar').style.display == "none")
    {	
      $( "#toolbar" ).show( "blind", { direction: "down" }, "slow") ;
    }
    else
    {
      $( "#toolbar" ).hide( "blind", { direction: "down" }, "slow") ;
    }
  }
}
