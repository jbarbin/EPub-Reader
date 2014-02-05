/**
 * Change the reading's mode (day or night). 
 * It changes some element's style.
 * Then it saves this parameter in local storage.
 */
function dayNight() {
  var parameters = readJson('parameters');
  if (parameters.dayNight === "day") {
    updateParameters(-1, -1, "night");
    document.getElementById('paragraphs').style.backgroundColor = "black";
    document.getElementById('body').style.backgroundColor = "black";
    document.getElementById('containerChapter').style.backgroundColor = "black";
    document.getElementById('html').style.backgroundColor = "black";
    adjustBrightness(parameters.brightness);
  } else if (parameters.dayNight === "night") {
    updateParameters(-1, -1, "day");
    document.getElementById('paragraphs').style.color = "black";
    adjustBrightness(parameters.brightness);
  }	
}

/**
 * Adjust screen's brightness depending of the parameter . 
 * It changes some element's style.
 * @param  brightness  an integer
 */
function adjustBrightness(brightness) {
  var parameters = readJson('parameters');
  if (parameters.dayNight === "night") {
    switch (brightness) {
      case 0:
        document.getElementById('paragraphs').style.color = "white";
        break;
      case 1:
        document.getElementById('paragraphs').style.color = "#E5E5E5";
        break;
      case 2:
        document.getElementById('paragraphs').style.color = "#CCCCCC";
        break;
      case 3:
        document.getElementById('paragraphs').style.color = "#B3B3B3";
        break;
      case 4:
        document.getElementById('paragraphs').style.color = "#999999";
        break;
      case 5:
        document.getElementById('paragraphs').style.color = "#7F7F7F";
        break;
      case 6:
        document.getElementById('paragraphs').style.color = "#666666";
        break;
      case 7:
        document.getElementById('paragraphs').style.color = "#4D4D4D";
        break;
    }
  } else {
    switch (brightness) {
      case 0:
        document.getElementById('body').style.backgroundColor = "white";
        document.getElementById('containerChapter').style.backgroundColor = "white";
        document.getElementById('paragraphs').style.backgroundColor = "white";
        document.getElementById('html').style.backgroundColor = "white";
        break;
      case 1:
        document.getElementById('body').style.backgroundColor = "#E5E5E5";
        document.getElementById('containerChapter').style.backgroundColor = "#E5E5E5";
        document.getElementById('paragraphs').style.backgroundColor = "#E5E5E5";
        document.getElementById('html').style.backgroundColor = "#E5E5E5";
        break;
      case 2:
        document.getElementById('body').style.backgroundColor = "#CCCCCC";
        document.getElementById('containerChapter').style.backgroundColor = "#CCCCCC";
        document.getElementById('paragraphs').style.backgroundColor = "#CCCCCC";
        document.getElementById('html').style.backgroundColor = "#CCCCCC";
        break;
      case 3:
        document.getElementById('body').style.backgroundColor = "#B3B3B3";
        document.getElementById('containerChapter').style.backgroundColor = "#B3B3B3";
        document.getElementById('paragraphs').style.backgroundColor = "#B3B3B3";
        document.getElementById('html').style.backgroundColor = "#B3B3B3";
        break;
      case 4:
        document.getElementById('body').style.backgroundColor = "#999999";
        document.getElementById('containerChapter').style.backgroundColor = "#999999";
        document.getElementById('paragraphs').style.backgroundColor = "#999999";
        document.getElementById('html').style.backgroundColor = "#999999";
        break;
      case 5:
        document.getElementById('body').style.backgroundColor = "#7F7F7F";
        document.getElementById('containerChapter').style.backgroundColor = "#7F7F7F";
        document.getElementById('paragraphs').style.backgroundColor = "#7F7F7F";
        document.getElementById('html').style.backgroundColor = "#7F7F7F";
        break;	
      case 6:
        document.getElementById('body').style.backgroundColor = "#666666";
        document.getElementById('containerChapter').style.backgroundColor = "#666666";
        document.getElementById('paragraphs').style.backgroundColor = "#666666";
        document.getElementById('html').style.backgroundColor = "#666666";
        break;	
      case 7:
        document.getElementById('body').style.backgroundColor = "#4D4D4D";
        document.getElementById('containerChapter').style.backgroundColor = "#4D4D4D";
        document.getElementById('paragraphs').style.backgroundColor = "#4D4D4D";
        document.getElementById('html').style.backgroundColor = "#4D4D4D";
        break;	
    }
  }
}

/**
 * Reduce screen's brightness. 
 * It changes some element's style by calling adjustBrightness().
 * Then save this parameter in local storage.
 */
function reduceBrightness() {
  var parameters = readJson('parameters');
  var brightness = parameters.brightness;
  brightness += 1;
  if (brightness > 7) {
    brightness = 7;
  }
  adjustBrightness(brightness);
  updateParameters(-1, brightness, "");
}

/**
 * Increase screen's brightness. 
 * It changes some element's style by calling adjustBrightness().
 * Then save this parameter in local storage.
 */
function increaseBrightness() {
  var parameters = readJson('parameters');
  var brightness = parameters.brightness;
  brightness -= 1;
  if (brightness < 0) {
    brightness = 0;
  }
  adjustBrightness(brightness);
  updateParameters(-1, brightness, "");
}

/**
 * Increase font's size of 'paragraphs' element. 
 * Then save this parameter in local storage.
 */
function increaseFontSize() {
  var size = parseInt(document.getElementById("paragraphs").style.fontSize.substring(0, document.getElementById("paragraphs").style.fontSize.indexOf('px', 0)));
  document.getElementById("paragraphs").style.fontSize = size + 1 + "px";
  updateParameters(size, -1, "");
}

/**
 * Reduce font's size of 'paragraphs' element. 
 * Then save this parameter in local storage.
 */
function reduceFontSize() {
  var size = parseInt(document.getElementById("paragraphs").style.fontSize.substring(0, document.getElementById("paragraphs").style.fontSize.indexOf('px', 0)));
  document.getElementById("paragraphs").style.fontSize = size -1 + "px";
  updateParameters(size, -1, "");
}


/**
 * Get what the user have selected and show an alert page. 
 */
function GetSelection() {
  mySelection = window.getSelection();
  if (mySelection !== "") {	
    document.getElementById('confirmDefineWord').style.display = "block";
    document.getElementById('btnDefineWord').onclick = defineWord(mySelection);
    document.getElementById('defineQuestion').textContent = "Do you want to get a definition of '" + mySelection + "' ?";

    if (document.getElementById('toolbar').style.display === "none") {	
      $( "#toolbar" ).show( "blind", { direction: "down" }, "slow") ;
    } else {
      $( "#toolbar" ).hide( "blind", { direction: "down" }, "slow") ;
    }
  }
}

/**
 * Define the selected word thank's to a request in google. 
 * @param  mySelection  a selection object
 */
function defineWord(mySelection) {
  var range  = mySelection.getRangeAt(0);
  return function() {
    document.getElementById('confirmDefineWord').style.display = "none";
    window.open("https://www.google.fr/search?q=define " + range);
    if (document.getElementById('toolbar').style.display === "none") {	
       $( "#toolbar" ).show("blind", { direction: "down" }, "slow");
    } else {
      $( "#toolbar" ).hide("blind", { direction: "down" }, "slow");
    }
  }
}

/**
 * Read an item in local storage. 
 * @param  oJson  the item id
 * @return the object
 */
function readJson(oJson) {
  var oJson = JSON.parse(localStorage.getItem('' + oJson));
  return oJson;	
}

/**
 * Initialize an  parameter's item in localStorage. 
 */
function initializeParameter() {
  var parameters = {
    "fontSize": 15,
    "brightness": 0,
    "dayNight": "day"	
  };
  localStorage.setItem('parameters', JSON.stringify(parameters));
}

/**
 * Update the parameter's item in localStorage. 
 * @param  fontSize  an integer
 * @param  brightness  an integer from 0 to 7.
 * @param  dayNight  a string ("day" or "night")
 */
function updateParameters(fontSize, brightness, dayNight) {
  var parameters = readJson('parameters');

  if (fontSize !== -1) {
    parameters.fontSize = fontSize;
  }

  if (brightness !== -1) {
    parameters.brightness = brightness;
  }

  if (dayNight !== "") {
    parameters.dayNight = dayNight;
  }

  localStorage.setItem('parameters',JSON.stringify(parameters));
}


/**
 * Apply's setting's parameters on the screen.
 * It changes some element's style.
 */
function applyParameters() {
  var parameters = readJson('parameters');
  document.getElementById("paragraphs").style.fontSize = parameters.fontSize + "px";
  if (parameters.dayNight === "night") {
    document.getElementById('paragraphs').style.backgroundColor = "black";
    document.getElementById('body').style.backgroundColor = "black";
    document.getElementById('containerChapter').style.backgroundColor = "black";
    document.getElementById('html').style.backgroundColor = "black";
    adjustBrightness(parameters.brightness);
  } else if (parameters.dayNight === "day") {
    document.getElementById('paragraphs').style.color = "black";
    adjustBrightness(parameters.brightness);
  }	
}