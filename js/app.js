window.onload = function() {
 //Test
  var livreChoisi = document.getElementById('livre');
  var sommaire = document.getElementById('sommaire');
  sommaire.onclick=afficherSommaire();
			
  livreChoisi.onchange = function() {
    ouvrirFichier(livreChoisi.files[0], function(data) {
	
      var zip = new JSZip(data);
      var container=getContainer(zip);
	  
	  if(container !=null)
	  {
	  
	  
	  
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
		  
		  var titre = metadata.getElementsByTagNameNS("*", "title")[0].childNodes[0].nodeValue;
			
		
			
		var auteur = metadata.getElementsByTagNameNS("*", "creator")[0].childNodes[0].nodeValue;
		 
		 //Affichage du titre et de l'auteur
		 var h1=document.getElementById('Titre');
		 var h2=document.getElementById('Auteur');
		 h1.innerHTML=titre;
		 h2.innerHTML=auteur;

		  for (var i = 0; i < items.length; i++) {
			var id = items[i].getAttribute("id");

			if (id == idRef) {
			  var nomfichierHTML = items[i].getAttribute("href");
			} else if(id == toc) {
				
			  var nomfichierNcx = items[i].getAttribute("href");
			}
		  }
		  var dossierContenantToc='';
		  
		  var verifExistenceOPS=zip.folder("OPS").file("toc.ncx");//Si le fichier existe dans OPS alors OPS existe
		  var verifExistenceOEBPS=zip.folder("OEBPS").file("toc.ncx");//Si le fichier existe dans OPS alors OPS existe

		  if(verifExistenceOPS)
		  {
			dossierContenantToc='OPS/';
		  }
		  else if(verifExistenceOEBPS)
		  {
			dossierContenantToc='OEBPS/';
		  }
		  else
		  {
			dossierContenantToc='';
		  }
			
		  var fichierNcx = zip.file(dossierContenantToc+nomfichierNcx);

		  var decoded = decodeUTF8(fichierNcx.data);

		  var parserNcx = parser.parseFromString(decoded, "text/xml");
		  var navMap = parserNcx.getElementsByTagNameNS("*", "navMap")[0];
		  var navPoints = navMap.getElementsByTagNameNS("*", "navPoint");
		  var listeDePoints = [];
		  var pageFiles=[];
		  
		   if (navPoints.length > 0) {
		   var compteurPoints = 0;

		   for (var i = 0; i < navPoints.length; i++) {
				  
					var label = navPoints[i].getElementsByTagNameNS("*", "navLabel")[0]
											.getElementsByTagNameNS("*", "text")[0].textContent;

					var content = navPoints[i].getElementsByTagNameNS("*", "content")[0].getAttribute("src");
					var navPoint = navPoints[i];
					var point = [];

					point['label'] = label;
					point['content'] = content;

					listeDePoints[compteurPoints] = point;
					compteurPoints++;
					
					if(dossierContenantToc=='')
					{
						var pageFile = zip.file(content);
						
					}
					else
					{
						
						if(content.indexOf("#")!=-1)
						{
							var pageFile = zip.file(dossierContenantToc+content.substring(0,content.indexOf("#")));
						}
						else
						{
							var pageFile = zip.file(dossierContenantToc+content);
						}
					}

					decodedPage=decodeUTF8(pageFile.data);
					pageFiles.push(decodedPage);

				  
			}
			
		   }

			var listChapitre = document.getElementById('listeChapitre');
		
			
			for(var i =0; i<listeDePoints.length;i++)
			{
				  var chapitre = document.createElement('li');
				  var dl=document.createElement('dl');
				  var dt=document.createElement('dt');
				  var nomChapitre = document.createTextNode(listeDePoints[i].label);
				  var divChapitre ='' ;
				  divChapitre = createNewDiv(pageFiles[i]);
				  dl.appendChild(dt);
				  chapitre.appendChild(dl);
				  chapitre.onclick=afficherChapitre(divChapitre);
				  dt.appendChild(nomChapitre);
				  listChapitre.appendChild(chapitre);
			}
			document.getElementById('livre').style.display="none";
			document.getElementById('listeChapitre').style.display="block";


			
	  }
	  
    });
  };  
};


function afficherSommaire()
{
	return function()
	{

		if(document.getElementById('listeChapitre').style.display=="none")
		{

			document.getElementById('listeChapitre').style.display="block";
		
		}
		else
		{

			document.getElementById('listeChapitre').style.display="none";
		}

	}
}

  function createNewDiv(chapitre) {
  
	var divChapitre=document.createElement("div");
	divChapitre.id = 'chapitre';
	divChapitre.className = 'chapitre';
	divChapitre.innerHTML=chapitre;

    return divChapitre;
  }

function afficherChapitre(page)
{
		return function()
	{
			var divContainerChapitre = document.getElementById("containerChapitre"); 

			if(document.getElementById("chapitre"))
			{
				var element=document.getElementById("chapitre");
				element.parentNode.removeChild(element);
				document.getElementById("containerChapitre").appendChild(page);
			}
			else
			{
				document.getElementById("containerChapitre").appendChild(page);
			}
			
			document.getElementById('listeChapitre').style.display="none";
			
	}
}


function decodeUTF8(str) {
    return decodeURIComponent(escape(str));
  }
  
function ouvrirFichier(fichiersLivre,dezip)
{
	var reader = new FileReader();
	reader.onloadend = function() {
    dezip(reader.result);
  };
  reader.readAsBinaryString(fichiersLivre);
}

function getContainer(archive) {


    var fichier = archive.folder("META-INF").file("container.xml");
    if (fichier) {
	  
      return(fichier.data);
    }
  
}



