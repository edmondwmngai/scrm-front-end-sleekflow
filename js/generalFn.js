var tagsToReplace = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  '!': '&#033;',
  '#': '&#035;',
  '$': '&#036;',
  '%': '&#037;',
  "'": '&#039;',
  '(': '&#040;',
  ')': '&#041;',
  '*': '&#042;',
  '+': '&#043;',
  ',': '&#044;',
  '-': '&#045;',
  '.': '&#046;',
  '/': '&#047;',
  ':': '&#058;',
  ';': '&#059;',
  '=': '&#061;',
  '?': '&#063;',
  '@': '&#064;',
  '[': '&#091;',
  '\\': '&#092;',
  ']': '&#093;',
  '^': '&#094;',
  '_': '&#095;',
  '`': '&#096;',
  '{': '&#123;',
  '|': '&#124;',
  '}': '&#125;',
  '~': '&#126;'
};

var replaceTag = function (tag) {
  console.log('tag'); console.log(tag);
  return tagsToReplace[tag] || tag;
}

var gf = {
  // array.find is not supproted in IE
  altFind: function (arr, callback) {
    /*      //20250403  Expected a `for-of` loop instead of a `for` loop with this simple iteration.
    for (var i = 0; i < arr.length; i++) {
      var match = callback(arr[i]);
      if (match) {
        return arr[i];
        //break;
      }
    }*/

    for (const item of arr) {
        const match = callback(item);
        if (match) {
            return item; // Exit as soon as a match is found
        }
    }
  },
  escape: function (str) {
    var newStr = str
        //.replace(/["<>&!#\$%'()\*+,-./:;=?@[\\\]^_\`'{|}~]/g, replaceTag)    20250408 Remove duplicates in this character class.
      .replace(/["<>&!#$%'()*+,-./:;=?@[\\\]^_`{|}~]/g, replaceTag)
      .replace(/[\n]/g, '&#10;')
      .replace(/[\r]/g, '&#13;');

      var newStr = str
          

    return newStr;
  },
  isDoubleByte: function (str) {
    for (var i = 0, n = str.length; i < n; i++) {
      if (str.charCodeAt(i) > 255) { return true; }
    }
    return false;
  },
  getTimeSqlFormat: function () {
    var date;
    date = new Date();
    date = date.getFullYear() + '-' +
      ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
      ('00' + date.getDate()).slice(-2) + ' ' +
      ('00' + date.getHours()).slice(-2) + ':' +
      ('00' + date.getMinutes()).slice(-2) + ':' +
      ('00' + date.getSeconds()).slice(-2);
    return date;
  },
  verifyIsEmailValid: function(emailReplyDetails) {
    emailReplyDetails = (emailReplyDetails || '').trim().replace(/，/g, ',').replace(/；/g, ';'); // space in an email address will be regards as invalid and need to warn
    if (emailReplyDetails.length > 0) {
        var emailDetialsArr = emailReplyDetails.split(/[,;]/);
        var emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,64}$/
        //for (var i = 0; i < emailDetialsArr.length; i++) {        // 20250403  Expected a `for-of` loop instead of a `for` loop with this simple iteration.
        //    var email = emailDetialsArr[i].trim();
        for (var email of emailDetialsArr) {
            //email = email.trim(); // Trim whitespace
            var isEmail = emailRegex.test(email.trim());        //email => email.trim() 
            if (!isEmail) {
                return false;
            }
        }
        return true;


    } else {
        return true;
    }
  }
}