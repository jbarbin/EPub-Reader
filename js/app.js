var brightness=0;
var firstParagraph=0;
var lastParagraph=0;
window.onload = function() 
{
	var selectedBook = document.getElementById('book');
	//Check if <input type="file"> is supported (It doesn't work in Firefox OS yet)
	if (selectedBook.type != "file") 
	{
		alert("Input file is not supported.");
		//Have to use Web Activity
	}
	else
	{
		var summary = document.getElementById('summary');
		summary.onclick=displaySummary();
		
		selectedBook.onchange = function() 
		{
			//Check if the file is in .epub format
			if(selectedBook.files[0].name.indexOf(".epub",0)==-1)
			{
				alert("The selected file is wrong. Please select an ebook in Epub format");
			}
			else
			{
				document.getElementById('progress').style.display="block";
				openFile(selectedBook.files[0], function(data) 
				{
					var zip = new JSZip(data);
					var container=getContainer(zip);

					if(container !=null)
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
						var h1=document.getElementById('title');
						var h2=document.getElementById('author');
						h1.textContent=decodeUTF8(title);
						h2.textContent=decodeUTF8(author);

						//Get "toc.ncx"
						for (var i = 0; i < items.length; i++) {
							var id = items[i].getAttribute("id");
							if (id == idRef) {
								var HTMLFileName = items[i].getAttribute("href");
							} 
							else if(id == toc) {
								var NcxFileName = items[i].getAttribute("href");
							}
						}
						
						var tocFolder='';

						var isInOPS=zip.folder("OPS").file("toc.ncx");//If the file exists in OPS folder then the file exists into it
						var isInOEBPS=zip.folder("OEBPS").file("toc.ncx");//If the file exists in OEBPS folder then the file exists into it

						if(isInOPS)
						{
							tocFolder='OPS/';
						}
						else if(isInOEBPS)
						{
							tocFolder='OEBPS/';
						}
						else
						{
							tocFolder='';
						}

						var ncxFile = zip.file(tocFolder+NcxFileName);
						
						if(ncxFile!=null)
						{
							var decoded = decodeUTF8(ncxFile.data);
							
							//Get all info in "toc.ncx"
							var parserNcx = parser.parseFromString(decoded, "text/xml");
							var navMap = parserNcx.getElementsByTagNameNS("*", "navMap")[0];
							var navPoints = navMap.getElementsByTagNameNS("*", "navPoint");
							var pointsList = [];
							var pageFiles=[];

							//Get content of chapters
							if (navPoints.length > 0) {
								var pointsCounter = 0;

								for (var i = 0; i < navPoints.length; i++) {

								var label = navPoints[i].getElementsByTagNameNS("*", "navLabel")[0]
										.getElementsByTagNameNS("*", "text")[0].textContent;

								var content = navPoints[i].getElementsByTagNameNS("*", "content")[0].getAttribute("src");
								var navPoint = navPoints[i];
								var point = [];

								point['label'] = label;
								point['content'] = content;

								pointsList[pointsCounter] = point;
								pointsCounter++;

								if(tocFolder=='')
								{
									var pageFile = zip.file(content);
								}
								else
								{
									if(content.indexOf("#")!=-1)
									{
										var pageFile = zip.file(tocFolder+content.substring(0,content.indexOf("#")));
									}
									else
									{
										var pageFile = zip.file(tocFolder+content);
									}
								}

								decodedPage=decodeUTF8(pageFile.data);
								pageFiles.push(decodedPage);
								}

							}

							//Display the list of chapters
							var chaptersList = document.getElementById('chaptersList');

							for(var i =0; i<pointsList.length;i++)
							{
								var chapter = document.createElement('li');
								var dl=document.createElement('dl');
								var dt=document.createElement('dt');
								var chapterName = document.createTextNode(pointsList[i].label);
								var divChapter ='' ;
								var completeChapter=pageFiles[i];
								
								divChapter = createNewDiv(pageFiles[i]);
								dl.appendChild(dt);
								chapter.appendChild(dl);
								
								chapter.onclick=displayChapter(divChapter, completeChapter);
								dt.appendChild(chapterName);
								chaptersList.appendChild(chapter);
							}
							document.getElementById('book').style.display="none";
							$( "#chaptersList" ).show( "blind", { direction: "up" }, "slow") ;
							// document.getElementById('chaptersList').style.display="block";
							document.getElementById('progress').style.display="none";
						}
						else
						{
							document.getElementById('progress').style.display="none";
							alert("Sorry the file you chose is somehow corrupted.");
						}
						

					}

				});
			}
		};  
	}
};

//Function to display the content for the day or night mode 
function dayNight()
{

	if(document.getElementById('paragraphs').style.backgroundColor=="black")
	{
		document.getElementById('paragraphs').style.color="black";
		document.getElementById('paragraphs').style.backgroundColor="white";
		document.getElementById('body').style.backgroundColor="white";
		document.getElementById('containerChapter').style.backgroundColor="white";
		//adjustBrightness(brightness);
	}
	else
	{
		document.getElementById('paragraphs').style.color="white";
		document.getElementById('paragraphs').style.backgroundColor="black";
		document.getElementById('body').style.backgroundColor="black";
		document.getElementById('containerChapter').style.backgroundColor="black";
		//adjustBrightness(brightness);
	}

}

//Function to display the summary or not
function displaySummary()
{
	return function()
	{
		if(document.getElementById('chaptersList').style.display=="none")
		{
			// document.getElementById('chaptersList').style.display="block";
			$( "#chaptersList" ).show( "blind", { direction: "up" }, "slow") ;
		}
		else
		{
			// document.getElementById('chaptersList').style.display="none";
			$( "#chaptersList" ).hide( "blind", { direction: "up" }, "slow") ;
		}
		
		
	}
}

//Function to adjust the brightness of the screen 
function adjustBrigthness(brightness)
{
	if(document.getElementById('paragraphs').style.backgroundColor=="black")
	{
		switch(brightness)
		{
		case 0:
			document.getElementById('paragraphs').style.color="white";
			break;
		case 1:
			document.getElementById('paragraphs').style.color="#CCCCCC";
			break;
		
		case 2:
			document.getElementById('paragraphs').style.color="#C0C0C0";
			break;
			
		case 3:
			document.getElementById('paragraphs').style.color="#999999";
			break;
			
		case 4:
			document.getElementById('paragraphs').style.color="#666666";
			break;
			
		case 5:
			document.getElementById('paragraphs').style.color="#333333";
			break;			
		}
	}
	else
	{
		switch(brightness)
		{
			case 0:
				document.getElementById('body').style.backgroundColor="white";
				document.getElementById('containerChapter').style.backgroundColor="white";
				document.getElementById('paragraphs').style.backgroundColor="white";
				break;
			
			case 1:
				document.getElementById('body').style.backgroundColor="#CCCCCC";
				document.getElementById('containerChapter').style.backgroundColor="#CCCCCC";
				document.getElementById('paragraphs').style.backgroundColor="#CCCCCC";
				break;
			
			case 2:
				document.getElementById('body').style.backgroundColor="#C0C0C0";
				document.getElementById('containerChapter').style.backgroundColor="#C0C0C0";
				document.getElementById('paragraphs').style.backgroundColor="#C0C0C0";
				break;
				
			case 3:
				document.getElementById('body').style.backgroundColor="#999999";
				document.getElementById('containerChapter').style.backgroundColor="#999999";
				document.getElementById('paragraphs').style.backgroundColor="#999999";
				break;
				
			case 4:
				document.getElementById('body').style.backgroundColor="#666666";
				document.getElementById('containerChapter').style.backgroundColor="#666666";
				document.getElementById('paragraphs').style.backgroundColor="#666666";
				break;
				
			case 5:
				document.getElementById('body').style.backgroundColor="#333333";
				document.getElementById('containerChapter').style.backgroundColor="#333333";
				document.getElementById('paragraphs').style.backgroundColor="#333333";
				break;	
		}
	}

}

//Function to reduce brightness
function reduceBrightness()
{
	brightness++;
	if(brightness>5)
	{
		brightness=5;
	}
	adjustBrigthness(brightness);
}

//Function to increaseBrightness
function increaseBrightness()
{
	brightness--;
	if(brightness<0)
	{
		brightness=0;
	}
	adjustBrigthness(brightness);
}


//Function to display toolbar or not
function displayToolbar()
{
	
	if(document.getElementById('toolbar').style.display=="none")
	{	
		// document.getElementById('toolbar').style.display="block";
		$( "#toolbar" ).show( "blind", { direction: "down" }, "slow") ;
	}
	else
	{
		// document.getElementById('toolbar').style.display="none";
		$( "#toolbar" ).hide( "blind", { direction: "down" }, "slow") ;
	}

	if(document.getElementById('header').style.display=="none")
	{
		// document.getElementById('header').style.display="block";
		$( "#header" ).show( "blind", { direction: "up" }, "slow") ;
	}
	else
	{
		// document.getElementById('header').style.display="none";
		$( "#header" ).hide( "blind", { direction: "up" }, "slow") ;
	}
}

//Function to increase font's size
function increaseFontSize()
{

	var paragraphsContainer = document.getElementById("paragraphs");
	var size=parseInt(paragraphsContainer.style.fontSize.substring(0,paragraphsContainer.style.fontSize.indexOf('px',0)));
	
	paragraphsContainer.style.fontSize=size+1+"px";
}

//Function to reduce font's size
function reduceFontSize()
{
	var paragraphsContainer = document.getElementById("paragraphs");
	var size=parseInt(paragraphsContainer.style.fontSize.substring(0,paragraphsContainer.style.fontSize.indexOf('px',0)));
	
	paragraphsContainer.style.fontSize=size-1+"px";
}

//Function to create chapter's div
function createNewDiv(chapter) {
	var divChapter=document.createElement("div");
	divChapter.id = 'chapter';
	divChapter.className = 'chapter';
	divChapter.style.fontSize = '15px';
	divChapter.innerHTML=chapter;
	divChapter.addEventListener("click", displayToolbar, false); 

	return divChapter;
}

//Function to display a chapter
function displayChapter(page, chapter)
{
	return function()
	{
	
		document.getElementById("paragraphs").addEventListener("click", displayToolbar, false); 
	
		window.frames['completeChapter'].document.body.innerHTML=chapter;

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
		
		/*if(document.getElementById("chapter"))
		{
			var element=document.getElementById("chapter");
			element.parentNode.removeChild(element);
			document.getElementById("body").appendChild(page);
		}
		else
		{
			document.getElementById("body").appendChild(page);
		}*/
		// document.getElementById('chaptersList').style.display="none";
		$( "#chaptersList" ).hide( "blind", { direction: "up" }, "slow") ;
		
		document.getElementById('toolbar').style.display="block";
	}
}

function nextParagraphs(){

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
					lastParagraph=i;
					break;
				}
			}
		}
	}
	
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
	
}

function previousParagraphs(){

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
				lastParagraph=firstParagraph-1
				break;
			}
		}
		
	}
		
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
	
}

//Function to decode a string in UTF8
function decodeUTF8(str) {
	return decodeURIComponent(escape(str));
}

//Function to open a book
function openFile(bookFiles,dezip)
{
	var reader = new FileReader();
	reader.onloadend = function() {
		dezip(reader.result);
	};
	reader.readAsBinaryString(bookFiles);
}

//Function to get the file "container.xml"
function getContainer(archive) {

	var fichier = archive.folder("META-INF").file("container.xml");
	if (fichier) {
		return(fichier.data);
	}
}

//Function to get the selection and search the definition in google
function GetSelection()
{
		mySelection = window.getSelection();
		
		if(mySelection!="")
		{	
			if(confirm(decodeUTF8("Voulez-vous trouver la signification de '"+mySelection+"'")))
			{
				window.open("https://www.google.fr/search?q=define "+mySelection);
			}
		}
}
