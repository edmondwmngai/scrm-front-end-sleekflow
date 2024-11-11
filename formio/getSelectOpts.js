// var nationalityArr = sessionStorage.getItem('scrmNationalityArr') || [];
// var marketArr = sessionStorage.getItem('scrmMarketArr') || [];
// var profileArr = sessionStorage.getItem('scrmProfileArr') || [];
// var getNationalityArr = [];

// function getNationalityId(fieldType) {
//   // when draw form need to use async to draw the selections
//   // ================ GET NATIONALITY, MARKET AND PROFILE ================
//   if (nationalityArr.length == 0 || marketArr.length == 0 || profileArr.length == 0) { // need all, otherwise profile array maybe empty 
//     var language = sessionStorage.getItem('scrmLanguage') ? sessionStorage.getItem('scrmLanguage').toLowerCase() : 'en';
//     $.ajax({
//         type: "POST",
//         url: 'http://172.17.7.40/mvccampaignCRM/api/GetNationalityMarketProfile',
//         crossDomain: true,
//         contentType: "application/json",
//         data: JSON.stringify({Lang: language, Agent_Id : 5, Token: token}),
//         dataType: 'json'
//     }).always(function(r) {
//         var rDetails = r.details || '';
//         if (!/^success$/i.test(r.result || "")) {
//             console.log('error: ' + rDetails ? rDetails : r);
//         } else {
//           console.log(rDetails);
//             nationalityArr = rDetails.NationalityArray;
//             marketArr = rDetails.MarketArray;
//             profileArr = rDetails.ProfileArray;
//             sessionStorage.setItem('scrmNationalityArr', JSON.stringify(nationalityArr));
//             sessionStorage.setItem('scrmMarketArr', JSON.stringify(marketArr));
//             sessionStorage.setItem('scrmProfileArr', JSON.stringify(profileArr));
//             if (fieldType == 'Nationality_Id') {
//               return nationalityArr
//             } else if(fieldType == 'Market_Id') {
//               return marketArr
//             } else {
//               return profileArr
//             }
//         }
//     });
//   } else {
//     if (fieldType == 'Nationality_Id') {
//       return  nationalityArr
//     } else if(fieldType == 'Market_Id') {
//       return marketArr
//     } else {
//       return profileArr
//     }
//   }
// }

function getNationalityJson(nationalityEleArr) {
  var nationalityArr = sessionStorage.getItem('scrmNationalityArr') || [];
  var marketArr = sessionStorage.getItem('scrmMarketArr') || [];
  var profileArr = sessionStorage.getItem('scrmProfileArr') || [];

  // when draw form need to use async to draw the selections
  // ================ GET NATIONALITY, MARKET AND PROFILE ================
  if (nationalityArr.length == 0 || marketArr.length == 0 || profileArr.length == 0) { // need all, otherwise profile array maybe empty 
      var language = sessionStorage.getItem('scrmLanguage') ? sessionStorage.getItem('scrmLanguage').toLowerCase() : 'en';
      $.ajax({
          type: "POST",
          url: 'http://172.17.7.40/mvccampaignCRM/api/GetNationalityMarketProfile',
          crossDomain: true,
          contentType: "application/json",
          data: JSON.stringify({Lang: language, Agent_Id : 5, Token: token}),
          dataType: 'json'
      }).always(function(r) {
          var rDetails = r.details || '';
          if (!/^success$/i.test(r.result || "")) {
              console.log('error: ' + rDetails ? rDetails : r);
          } else {
              console.log(rDetails);
              nationalityArr = rDetails.NationalityArray;
              marketArr = rDetails.MarketArray;
              profileArr = rDetails.ProfileArray;
              sessionStorage.setItem('scrmNationalityArr', JSON.stringify(nationalityArr));
              sessionStorage.setItem('scrmMarketArr', JSON.stringify(marketArr));
              sessionStorage.setItem('scrmProfileArr', JSON.stringify(profileArr));
              nationalityEleArr.forEach(function(ele){
                  if(ele.key == 'Nationality_Id') {
                    ele.data.json = nationalityArr;
                  } else if (ele.key == 'Market_Id') {
                    ele.data.json = marketArr;
                  } else if (ele.key == 'Profile_Id') {
                    ele.data.json = profileArr;
                  }
              })
          }
      });
  } else {
    nationalityEleArr.forEach(function(ele){
          if(ele.key == 'Nationality_Id') {
            ele.data.json = nationalityArr;
          } else if (ele.key == 'Market_Id') {
            ele.data.json = marketArr;
          } else if (ele.key == 'Profile_Id') {
            ele.data.json = profileArr;
          }
      })
  }
}

var	getSelectOpts = {
  'Status':
      [{
        "label": "Follow-up Required",
        "value": "Follow-up Required"
      }, {
        "label": "Closed",
        "value": "Closed"
      }, {
        "label": "Escalated",
        "value": "Escalated"
      }
    ],
    'Call_Nature':[{
            label: "Complaint",
            value: "complaint"
        }, {
            label: "Compliment",
            value: "compliment"
        }, {
            label: "Enquiry",
            value: "enquiry"
        }, {
            label: "Feedback",
            value: "feedback"
        }
    ],
    'Gender':[{
      label: "Female",
      value: "Female"
    },{
      label: "Male",
      value: "Male"
    }],
    'Title':[{
      label: "Miss",
      value: "Miss"
    },{
      label: "Mr",
      value: "Mr"
    },{
      label: "Mrs",
      value: "Mrs"
    },{
      label: "Ms",
      value: "Ms"
    }],
    'Lang':[{
      label: "Cantonese",
      value: "Cantonese"
    },{
      label: "English",
      value: "English"
    },{
      label: "Mandarin",
      value: "Mandarin"
    },{
      label: "Japanese",
      value: "Japanese"
    }],
    'Nationality_Id': function(callback){ callback('nationality', 'NationalityID', '<span market-id={{ item.MarketID }} profile-id={{ item.ProfileID }}>{{ item.NationalityName }}</span>')},
    'Market_Id': function(callback){ callback('nationality', 'MarketID', "{{ item.MarketName }}")},
    'Profile_Id': function(callback){ callback('nationality', 'ID', "{{ item.Profile }}")}
    // 'Nationality_Id': function(callback){ callback(getNationalityId('Nationality_Id'), 'NationalityID', '<span market-id={{ item.MarketID }} profile-id={{ item.ProfileID }}>{{ item.NationalityName }}</span>')},
    // 'Market_Id': function(callback){ callback(getNationalityId('Market_Id'), 'MarketID', "{{ item.MarketName }}")},
    // 'Profile_Id': function(callback){ callback(getNationalityId('Profile_Id'), 'ID', "{{ item.Profile }}")}
}