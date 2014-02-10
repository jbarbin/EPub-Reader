var firstParagraph = 0,     //The first paragraph of the current page read when clicking on "previous"
    lastParagraph = 0,      //The last paragraph of the current page when clicking on "next"
    chaptersListArray = [], //Array of list of chapters
    currentChapter,         //The integer of the current chapter read
    currentChapterTitle,    //Title of the current chapter
    isNotFirstPage = true;  //T know if the page to show is the first or not

window.onload = function () {
    "use strict";
    
    //Hidding the vertical scrollbar  
    var htmlElement = document.body.parentElement;
    htmlElement.style.overflow = 'hidden';
    
    var lastPageRead = readJson('lastPageRead');
    console.log(lastPageRead);
  
    //If there are no books yet, initialize local storage for lastPageRead
    if (lastPageRead === null) {
        initializeLastPageRead();
    }

    var selectedBook = document.getElementById('book');
    selectedBook.onchange = function () {
        //Check if the file is in .epub format
        if (selectedBook.files[0].name.indexOf(".epub", 0) === -1) {
            alert("The selected file is wrong. Please select an ebook in Epub format");
        } else {
            openFile(selectedBook.files[0], function (data) {
                var bookTitle,
                    bookAuthor,
                    zip = new JSZip(data),
                    container = getContainer(zip);
        
                if (container !== null) {
                    //Get all information we need in Container.xml and store them
                    var parser = new DOMParser(),
                        doc = parser.parseFromString(container, "application/xml"),
                        rootfile = doc.getElementsByTagNameNS("*", "rootfile")[0],
                        opffile = rootfile.getAttribute("full-path"),
                        opfdata = zip.file(opffile),
                        opf = parser.parseFromString(opfdata.data, "text/xml"),
                        metadata = opf.getElementsByTagNameNS("*", "metadata")[0];
                    
                    bookTitle = metadata.getElementsByTagNameNS("*", "title")[0].childNodes[0].nodeValue;
                    bookAuthor = metadata.getElementsByTagNameNS("*", "creator")[0].childNodes[0].nodeValue;
                }
                savesBook(selectedBook.files[0], bookTitle, bookAuthor);//Save the selected file in dataBase
                saveNewBook(bookTitle, -1, -1);//Save the book in local storage to get the last page read
                displayBookList();
            })
        }
    }
    displayBookList();
};


/**
 * Allows to return to the library, this function hides and displays some elements
 */
function goToLibrary() {
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
    
    var paragraphs = document.getElementById('paragraphs');
    paragraphs.innerHTML = "";
    
    var chaptersList = document.getElementById('chaptersList');
    chaptersList.innerHTML = "";
}

/**
 * Allows to display the books list
 */
function displayBookList() {
    displayAllBooks();
}

/**
 * Allows to open a book in .epub format.
 * This function opens the book thanks to JSZip library and parse some files in this archive.
 * Then it displays the chapter's list.
 * @param  book  an absolute URL giving the base location of the image
 */
function openBook(book) {
    "use strict";

    return function () {
        //Style settings
        var summary = document.getElementById('summary');
        summary.style.display = "block";
        console.log(book);
        document.getElementById('bookList').style.display = "none";
        document.getElementById('progress').style.display = "block";
	
        //Open the chosen book
        openFile(book, function (data) {
            var zip = new JSZip(data);
            var container = getContainer(zip);

            if (container !== null) {
                //Get all information we need in Container.xml
                var parser = new DOMParser(),
                    doc = parser.parseFromString(container, "application/xml"),
                    rootfile = doc.getElementsByTagNameNS("*", "rootfile")[0],
                    opffile = rootfile.getAttribute("full-path"),
                    opfdata = zip.file(opffile),
                    opf = parser.parseFromString(opfdata.data, "text/xml"),
                    metadata = opf.getElementsByTagNameNS("*", "metadata")[0],
                    manifest = opf.getElementsByTagNameNS("*", "manifest")[0],
                    spine = opf.getElementsByTagNameNS("*", "spine")[0],
                    toc = spine.getAttribute("toc"),
                    itemref = spine.getElementsByTagNameNS("*", "itemref")[0],
                    idRef = itemref.getAttribute("idref"),
                    items = manifest.getElementsByTagNameNS("*", "item"),
                    title = metadata.getElementsByTagNameNS("*", "title")[0].childNodes[0].nodeValue,
                    author = metadata.getElementsByTagNameNS("*", "creator")[0].childNodes[0].nodeValue;
                
                //Display book's title and author
                var h1 = document.getElementById('title');
                var h2 = document.getElementById('author');
                h1.textContent = decodeUTF8(title);
                h2.textContent = decodeUTF8(author);

                //Get "toc.ncx"
                for (var i = 0; i < items.length; i++) {
                    var id = items[i].getAttribute("id");
                    if (id === idRef) {
                        var HTMLFileName = items[i].getAttribute("href");
                    } else if (id === toc) {
                        var NcxFileName = items[i].getAttribute("href");
                    }
                }

                var tocFolder = '',
                    isInOPS = zip.folder("OPS").file("toc.ncx"),        //If the file exists in OPS folder then the file exists into it
                    isInOEBPS = zip.folder("OEBPS").file("toc.ncx");    //If the file exists in OEBPS folder then the file exists into it

                if (isInOPS) {
                    tocFolder ='OPS/';
                } else if(isInOEBPS) {
                    tocFolder = 'OEBPS/';
                } else {
                    tocFolder = '';
                }

                var ncxFile = zip.file(tocFolder + NcxFileName);

                if (ncxFile !== null) {
                    var decoded = decodeUTF8(ncxFile.data);

                    //Get all infos in "toc.ncx"
                    var parserNcx = parser.parseFromString(decoded, "text/xml"),
                        navMap = parserNcx.getElementsByTagNameNS("*", "navMap")[0],
                        navPoints = navMap.getElementsByTagNameNS("*", "navPoint"),
                        pointsList = [],
                        pageFiles = [];

                    //Get content of chapters
                    if (navPoints.length > 0) {
                        var pointsCounter = 0;
                        for (var i = 0; i < navPoints.length; i++) {
                            var label = navPoints[i].getElementsByTagNameNS("*", "navLabel")[0].getElementsByTagNameNS("*", "text")[0].textContent,
                                content = navPoints[i].getElementsByTagNameNS("*", "content")[0].getAttribute("src"),
                                navPoint = navPoints[i],
                                point = [],
                                pageFile;

                            point['label'] = label;
                            point['content'] = content;
                            pointsList[pointsCounter] = point;
                            pointsCounter++;

                            if (tocFolder === '') {
                                pageFile = zip.file(content);
                            } else {
                                if (content.indexOf("#") !== -1) {
                                    pageFile = zip.file(tocFolder + content.substring(0, content.indexOf("#")));
                                } else {
                                    pageFile = zip.file(tocFolder + content);
                                }
                            }
														
														if (pageFile === null) {
															alert("We don't support this type of epub for the moment :-( ")
															break;
														} else {                      
                            	var decodedPage = decodeUTF8(pageFile.data);
                            	pageFiles.push(decodedPage);
														}
                        }
                    }
                
                    //Display the list of chapters
                    var chaptersList = document.getElementById('chaptersList');

                    for (var i = 0; i < pointsList.length; i++) {
                        var chapter = document.createElement('li'),
                            dl = document.createElement('dl'),
                            dt = document.createElement('dt'),
                            chapterName = document.createTextNode(pointsList[i].label),
                            completeChapter = pageFiles[i];

                        chaptersListArray.push(pageFiles[i]);
                    
                        dl.appendChild(dt);
                        chapter.appendChild(dl);
                        chapter.id = "chapter" + i;
                        chapter.onclick = displayChapter(completeChapter, i);
                    
                        dt.appendChild(chapterName);
                        chaptersList.appendChild(chapter);
                    }
                    
                    document.getElementById('book').style.display = "none";
		  
                    currentChapterTitle = title;
                    var idBook = getCounter(title);
                    var oLastPageRead = readJson('lastPageRead');
		  
                    if (oLastPageRead.books[idBook].lastChapterRead !== -1 && oLastPageRead.books[idBook].lastParagraph !== -1 ) {
                        displayLastPageRead2(oLastPageRead.books[idBook].lastChapterRead,oLastPageRead.books[idBook].lastParagraph);
                        document.getElementById('progress').style.display = "none";
                    } else {
                        $("#chaptersList").show("blind", { direction: "up" }, "slow");
                        document.getElementById('progress').style.display = "none";
                    }		  
                } else {
                    document.getElementById('progress').style.display = "none";
                    alert("Sorry the file you chose is somehow corrupted.");
                }
            }
        });
    }
}

/**
 * Allows to display the summary or not
 */
function displaySummary () {
	//Style settings
	if (document.getElementById('containerChapter').style.display === "block") {
        document.getElementById('containerChapter').style.display = "none";
	} else {
        document.getElementById('containerChapter').style.display = "block";
	}
  
    if (document.getElementById('chaptersList').style.display === "none") {
        //Showing the vertical scrollbar to scroll the summary
        var htmlElement = document.getElementsByTagName('html')[0];
        htmlElement.style.overflow = 'auto';
        $("#chaptersList").show("blind", { direction: "up" }, "slow") ;
    } else {
        //Hidding the vertical scrollbar  
        var htmlElement = document.getElementsByTagName('html')[0];
        htmlElement.style.overflow = 'hidden';
        $("#chaptersList").hide("blind", { direction: "up" }, "slow") ;
    }
}

/**
 * Allows to display the toolbar or not
 */
function displayToolbar () {
    //Style settings
    if (document.getElementById('toolbar').style.display === "none") {	
        $("#toolbar").show("blind", { direction: "down" }, "slow") ;
    } else {
        $("#toolbar").hide("blind", { direction: "down" }, "slow") ;
    }

    if (document.getElementById('header').style.display === "none") {
        $("#header").show("blind", { direction: "up" }, "slow") ;
    } else {
        $("#header").hide("blind", { direction: "up" }, "slow") ;
    }
}

/**
 * Returns a div which content the whole chapter. 
 *
 * @param  chapter  an object whom content a chapter 
 * @return      the div with the chapter
 */
function createNewDiv (chapter) {
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
function decodeUTF8 (str) {
    return decodeURIComponent(escape(str));
}

/**
 * Read a file and open it. 
 *
 * @param bookFiles  a file in .epub format
 * @param dezip  a function to open the file
 */
function openFile (bookFiles, dezip) {
    var reader = new FileReader();
    reader.onloadend = function () {
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
function getContainer (archive) {
    var fichier = archive.folder("META-INF").file("container.xml");
    if (fichier) {
        return(fichier.data);
    }
}

/**
 * Display and hide some elements when cancel to delete a book. 
 *
 */
function cancelConfirmDeleteBook () {
    if (document.getElementById('confirmDeleteBook').style.display === "block") {
        document.getElementById('bookList').style.display = "block";
        document.getElementById('confirmDeleteBook').style.display = "none";
    }
}

/**
 * Display and hide some elements when cancel to get a word's definition. 
 *
 */
function cancelConfirmDefineWord () {
    if (document.getElementById('confirmDefineWord').style.display === "block") {
        document.getElementById('confirmDefineWord').style.display = "none";
        if (document.getElementById('toolbar').style.display === "none") {	
            $("#toolbar").show("blind", { direction: "down" }, "slow");
        } else {
            $("#toolbar").hide("blind", { direction: "down" }, "slow");
        }
    }
}