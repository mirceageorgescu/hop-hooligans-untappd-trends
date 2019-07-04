var breweries = [{
  id: 268580,
  name: 'hh',
  primary: true
},{
  id: 276310,
  name: 'bereta',
  primary: false
},{
  id: 170533,
  name: 'gz',
  primary: false
},{
  id: 333825,
  name: 'wicked',
  primary: false
},{
  id: 258038,
  name: 'oriel',
  primary: false
},{
  id: 251892,
  name: 'perfektum',
  primary: false
}]

var breweriesData = {};

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Actions')
      .addItem('Get ratings','writeData')
      .addToUi();
}

function getBrewerData(breweryId) {
  var response = UrlFetchApp.fetch("https://api.untappd.com/v4/brewery/info/" + breweryId + "?client_id=### Client ID ###&client_secret=### Client secret ###");
  var json = JSON.parse(response.getContentText());
  return json.response.brewery;
}

function getDailyRatingNumber(i) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var previousRatings = sheet.getRange(sheet.getLastRow() - 1,i*3+4).getValue();
  var currentRatings = sheet.getRange(sheet.getLastRow(),i*3+4).getValue();
  return currentRatings - previousRatings;
}

function getProgress(i) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var previousRating = sheet.getRange(sheet.getLastRow() - 1,i*3+2).getValue();
  var currentRating = sheet.getRange(sheet.getLastRow(),i*3+2).getValue();
  var difference = currentRating - previousRating;
  if (difference == 0) {
    return '🙌 still awesome'
  } else if (difference > 0) {
    return '☝ ' + difference.toFixed(3);
  } else {
    return '👇 ' + difference.toFixed(3);
  }

}

function sendEmail() {
  var message = 'You got '+ breweriesData[0].daily + ' ratings yesterday ' + breweriesData[0].progress + ' 📈 ' + breweriesData[0].rating.rating_score;
  MailApp.sendEmail('### Email ###', 'Untappd', message);
}

function writeData() {
  var sheet = SpreadsheetApp.getActiveSheet();

  //write date
  sheet.getRange(sheet.getLastRow() + 1, 1).setValue([Utilities.formatDate(new Date(), "GMT+2", "dd/MM/yyyy HH:mm")]);

  //write api data
  for (var i = 0, len = breweries.length; i < len; i++) {
    //get untappd data
    breweriesData[i] = getBrewerData(breweries[i].id);

    sheet.getRange(sheet.getLastRow(), i * 3 + 2).setValue(breweriesData[i].rating.rating_score);
    sheet.getRange(sheet.getLastRow(), i * 3 + 4).setValue(breweriesData[i].rating.count);

    var dailyRatings = getDailyRatingNumber(i);
    var progress = getProgress(i);

    sheet.getRange(sheet.getLastRow(), i * 3 + 3).setValue(dailyRatings);

    //remember this for posterity
    breweriesData[i].daily = dailyRatings;
    breweriesData[i].progress = progress;

    //send email if primary
    if(breweries[i].primary){
      sendEmail();
    }
  }
}