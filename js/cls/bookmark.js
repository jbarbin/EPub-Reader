//Initial Json of lastPageRead
var lastPageRead = {
	"books": [
        {
            "bookName": "blabla",
            "lastChapterRead": -1,
            "paragraphsToDisplay": []
		}
	]
};

/**
 * Initialize lastPageRead in local storage
 */
function initializeLastPageRead() {
    localStorage.setItem('lastPageRead', JSON.stringify(lastPageRead));
}

/**
 * Save an item in local storage. 
 * @param  bookName  the bookName to save
 * @param  chapter  the chapter to save
 * @param  firstParagraphToShow  the firstParagraphToShow
 * @return the object
 */
function saveLastPageRead2(bookName, chapter, firstParagraphToShow) {
    "use strict";
    var oLastPageRead = readJson('lastPageRead');
    var idBook = getCounter(bookName);
    oLastPageRead.books[idBook].lastChapterRead = chapter;
    oLastPageRead.books[idBook].lastParagraph = firstParagraphToShow;
    
    localStorage.setItem('lastPageRead', JSON.stringify(oLastPageRead));
    var o = readJson('lastPageRead');
}

function saveNewBook(bookName, chapter, lastParagraph) {
    "use strict";
    var oLastPageRead = readJson('lastPageRead');
    oLastPageRead.books.push({"bookName": "" + bookName, "lastChapterRead": "" + chapter, "lastParagraph": "" + lastParagraph});
    localStorage.setItem('lastPageRead', JSON.stringify(oLastPageRead));
}


/**
 * Read an item in local storage. 
 * @param  oJson  the item 
 * @return the object
 */
function readJson(oJson) {
	var oJson = JSON.parse(localStorage.getItem('' + oJson));
	return oJson;
}

/**
 * Read an item in local storage. 
 * @param  bookName  the bookName 
 * @return the counter
 */
function getCounter (bookName) {
    var oLastPageRead = readJson('lastPageRead');
    var counter = 0;
    for (var i = 0; i < oLastPageRead.books.length - 1; i++) {
        if (oLastPageRead.books[i].bookName === bookName) {
            break;
        }
        counter++;
    }
    return counter;
}
