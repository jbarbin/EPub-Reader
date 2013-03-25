var indexedDB=window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
 
function createDatabase(event) {
    var db = event.target.transaction.db;
    var bookStore = db.createObjectStore("books",{keyPath: "bookTitle"});
	
}

/**
* callback when there is an erro to open DB
*/
function errorOpen(event) {
    window.alert("Open error !");
}


/**
* .
* Add or replace a book
*/
function saveBook(id,file) {

	
    //Create the object
    var book = {
		id:id,
		bookName: file
    }
	var alreadyStored=false;
    // open DB
    var request = indexedDB.open("booksLibrary2", 1);
    request.onerror = errorOpen;
    request.onupgradeneeded = createDatabase;

    request.onsuccess = function(event) {
       
        var db = event.target.result;
        // Open transaction
        var transaction = db.transaction(["books"], "readwrite");
        transaction.oncomplete = function(event) {
        };

        transaction.onerror = function(event) {
           window.alert('Transaction error ');
        };

        // Get the store
        var bookStore = transaction.objectStore("books");
		
		// Verify if the book is already stored
		bookStore.openCursor().onsuccess = function (event) {

			var cursor = event.target.result;
			if (cursor) {
				
				var getBook = bookStore.get(cursor.key);

				getBook.onsuccess = function (e) {
					if(getBook.result.bookName.name==file.name)
					{
						alreadyStored=true;
					}
					cursor.continue();
				}
			}
		}

		if(alreadyStored!=true)
		{
			var req = bookStore.put(book);
				req.onsuccess = function(event) {
				//console.log('stockage OK!!!!');
			}
			req.onerror = function(event) {
				window.alert('erreur ajout');
			}
		}
		else
		{
			alert('This book is already in your library');
		}
		
        
    }
}

/**
* .
* Add or replace a book
*/
function savesBook(file,bookTitle,bookAuthor) {

 //Create the object
	var book = {
		bookFile: file,
		bookTitle: bookTitle,
		bookAuthor: bookAuthor
	}
	var alreadyStored=false;
    // open DB
    var request = indexedDB.open("booksLibrary2", 1);
    request.onerror = errorOpen;
    request.onupgradeneeded = createDatabase;

    request.onsuccess = function(event) {
       
        var db = event.target.result;
        // Open transaction
        var transaction = db.transaction(["books"], "readwrite");
        transaction.oncomplete = function(event) {
        };

        transaction.onerror = function(event) {
           window.alert('Transaction error ');
        };


		
        // Get the store
        var bookStore = transaction.objectStore("books");

		// Verify if the book is already stored
		bookStore.openCursor().onsuccess = function (event) {

			var cursor = event.target.result;
			if (cursor) {
				//console.log(cursor);
				var getBook = bookStore.get(cursor.key);

				getBook.onsuccess = function (e) {
					if(getBook.result.bookFile.name==file.name)
					{
						alreadyStored=true;
					}
					cursor.continue();
				}
			}

		}
		
		var bookList=document.getElementById('bookList');
		var id=bookList.childNodes.length;

		if(alreadyStored!=true)
		{
			var req = bookStore.put(book);
				req.onsuccess = function(event) {
				//console.log('stockage OK!!!!');
			}
			req.onerror = function(event) {
				window.alert('erreur ajout');
			}
		}
		else
		{
			alert('This book is already in your library');
		}
    }
}



//Get book by ID
function getBook(id) {

// on ouvre la base, et on déclare les listeners
    var request = indexedDB.open("booksLibrary2", 1);
	var resultat="";
    request.onerror = errorOpen;
    request.onupgradeneeded = createDatabase;

    request.onsuccess = function(event) {
        // ici la base a été ouverte avec succés, il faut ajouter l'enregistrement

        // on récupère l'objet database
        var db = event.target.result;

        // on ouvre une transaction qui permettra d'effectuer
        // les opérations sur la base
        var transaction = db.transaction(["books"], "readwrite");
        transaction.oncomplete = function(event) {
            window.alert("Transaction terminée, sauvegarde effectuée");
        };

        transaction.onerror = function(event) {
           window.alert('erreur de transaction ');
        };

        // on récupère l'object store dans lequel on veut stocker l'objet
        var sauvegardeStore = transaction.objectStore("books");

        // on créé l'ordre d'ajouter un enregistrement
        // sera effectivement executé lors de la fermeture de la transaction
        var req = sauvegardeStore.get(id);

        req.onsuccess = function(event) {
			if(req.result)
			{
				resultat= req.result;
				book= req.result;
				//console.log(book);

			}
			else 
			{
				alert("Bug");
			}
        }

        req.onerror = function(event) {
            window.alert('erreur ajout');
        }

    }



}

// Get all books and store them into global variable booksArray
function getAllBooks(){

	// on ouvre la base, et on déclare les listeners
	var request = indexedDB.open("booksLibrary2", 1);
	var resultat="";
		request.onerror = errorOpen;
		request.onupgradeneeded = createDatabase;

	request.onsuccess = function(event) {
		var db = event.target.result;
		// on ouvre une transaction qui permettra d'effectuer
		// la lecture. uniquement de la lecture -> "readonly"
		var transaction = db.transaction(["books"], "readonly");
		transaction.oncomplete = function(event) {};
		transaction.onerror = function(event) {
			window.alert('erreur de transaction lecture ');
		};

		// on récupère l'object store que l'on veut lire
		var bookStore = transaction.objectStore("books");
		
		bookStore.openCursor().onsuccess = function (event) {

			var cursor = event.target.result;
			if (cursor) {
				
				var getBook = bookStore.get(cursor.key);

				getBook.onsuccess = function (e) {
					booksArray.push(getBook.result); // un niveau
					cursor.continue();
				}
			}
			else
			{
				canDisplay=true;
			}
		}
		
	}
}

/**
Delete all books in the DB
 */
function deleteAllBooks() {
    // on ouvre la base, et on déclare les listeners
    var request = indexedDB.open("booksLibrary2", 1);
    request.onerror = errorOpen;
    request.onupgradeneeded = createDatabase;

    request.onsuccess = function(event) {
        var db = event.target.result;

        // on ouvre une transaction qui permettra d'effectuer la suppression
        var transaction = db.transaction(["books"], "readwrite");
        transaction.oncomplete = function(event) {displayAllBooks();};
        transaction.onerror = function(event) {
           window.alert('erreur de transaction suppression');
        };

        var voitureStore = transaction.objectStore("books");
        var req = voitureStore.clear();
        req.onsuccess = function(event) {
        }
        req.onerror = function(event) {
            window.alert('erreur suppression');
        }
    }
}
    
	
//Delete a book by ID
function deleteBookConfirm(bookTitle) {

	return function()
	{
		if(document.getElementById('confirmDeleteBook').style.display="none")
		{
			document.getElementById('confirmDeleteBook').style.display="block";
			document.getElementById('btnDeleteBook').onclick=deleteBook(bookTitle);
		}
	}

}

//Delete a book by ID
function deleteBook(bookTitle) {
	
	return function ()
	{
		// on ouvre la base, et on déclare les listeners
		var request = indexedDB.open("booksLibrary2", 1);
		var resultat="";
		request.onerror = errorOpen;
		request.onupgradeneeded = createDatabase;

		request.onsuccess = function(event) {
			// ici la base a été ouverte avec succés, il faut ajouter l'enregistrement

			// on récupère l'objet database
			var db = event.target.result;

			// on ouvre une transaction qui permettra d'effectuer
			// les opérations sur la base
			var transaction = db.transaction(["books"], "readwrite");
			transaction.oncomplete = function(event) {
				
			};

			transaction.onerror = function(event) {
			   window.alert('erreur de transaction ');
			};

			// on récupère l'object store dans lequel on veut stocker l'objet
			var bookStore = transaction.objectStore("books");

			// on créé l'ordre d'ajouter un enregistrement
			// sera effectivement executé lors de la fermeture de la transaction
			var req = bookStore.delete(bookTitle);

			req.onsuccess = function(event) {
				displayAllBooks();
				cancelConfirmDeleteBook();
			}
			req.onerror = function(event) {
				window.alert('erreur ajout');
			}

		}
	}

}


// Get all books and store them into global variable booksArray
function displayAllBooks(){

	// on ouvre la base, et on déclare les listeners
	var request = indexedDB.open("booksLibrary2", 1);
	var resultat="";
		request.onerror = errorOpen;
		request.onupgradeneeded = createDatabase;

	request.onsuccess = function(event) {
		var db = event.target.result;
		// on ouvre une transaction qui permettra d'effectuer
		// la lecture. uniquement de la lecture -> "readonly"
		var transaction = db.transaction(["books"], "readonly");
		transaction.oncomplete = function(event) {};
		transaction.onerror = function(event) {
			window.alert('erreur de transaction lecture ');
		};

		// on récupère l'object store que l'on veut lire
		var bookStore = transaction.objectStore("books");
		var booklist=document.getElementById('bookList');
		while (booklist.firstChild) {
			booklist.removeChild(booklist.firstChild);
		}
		var i=0;
		bookStore.openCursor().onsuccess = function (event) {
			
			var cursor = event.target.result;
			if (cursor) {
				i++;
				var getBook = bookStore.get(cursor.key);

				getBook.onsuccess = function (e) {
					//console.log(getBook.result);
					var li = document.createElement("li");
					var chapter = document.createElement('li');
					var dl=document.createElement('dl');
					var dt=document.createElement('dt');
					var chapterName = document.createTextNode(decodeUTF8(i+". "+getBook.result.bookTitle)+" - "+decodeUTF8(getBook.result.bookAuthor));
					var img= document.createElement('img');
					img.src='images/icons/delete.png';
					img.onclick=deleteBookConfirm(getBook.result.bookTitle);	
					
					// currentChapterTitle=getBook.result.bookTitle;
					
					dl.appendChild(dt);
					li.appendChild(dl);
					
					li.appendChild(img);
					//li.onclick=openBook(booksArray[i].bookName);
					dt.onclick=openBook(getBook.result.bookFile);
					//dt.onclick=getInfo(getBook.result.bookTitle);
					dt.appendChild(chapterName);
					booklist.appendChild(li);
					cursor.continue();
				}
			}
			else
			{
				canDisplay=true;
			}
		}
		
	}
}

function deleteDB(indexedDBName) {
	try {
		var dbreq = window.indexedDB.deleteDatabase(indexedDBName);
		dbreq.onsuccess = function (event) {
			var db = event.result;
			console.log("indexedDB: " + indexedDBName + " deleted");
		}
		dbreq.onerror = function (event) {
			console.log("indexedDB.delete Error: " + event.message);
		}
	}
   catch (e) {
		output_trace("Error: " + e.message);
	}
}
