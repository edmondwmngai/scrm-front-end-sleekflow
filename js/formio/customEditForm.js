// Doc: https://formio.github.io/formio.js/docs/file/src/components/tabs/editForm/Tabs.edit.display.js.html
  var customEditForm = {
    textfield: [
      {
        key: 'display',
        components: [
          {
            key: 'label',
            disabled: true
            // onChange: function(this_component){console.log(this_component);return false;},
            // onPress: function(this_component){alert('no');console.log(this_component);return false;},
            // saveComponent: function(this_component){alert('baba');}
          },
          {
            key: 'tableView',
            ignore: true,
            input: false
          }
        ]
      },
      {
        key: 'api',
        ignore: true,
        // components: [
        //   {
        //     key: 'key',
        //     input:false,
        //     "validateOn": "",
        //     onChange: function(this_component,b){console.log(this_component);console.log('key on change');console.log(b);},
            // validate: {
              // "pattern": "",
              // custom: "",
              // customPrivate: false,
              // maxLength: "",
              // minLength: "",
              // multiple: false,
              // pattern: "",
              // patternMessage: "The property name must only contain alphanumeric characters, underscores, dots and dashes and should not be ended by dash or dot.",
              // required: false,
              // strictDateValidation: false,
              // unique: false,
              // pattern:{
              //   check: function(this_component,b){
              //     console.log(this_component);
              //     console.log('pattent check b');
              //     console.log(b);
              //     alert('check?');
              //   }
              // }

              // custom: "abcdefg",
              // customPrivate: false,
              // multiple: false,
              // required: false,
              // strictDateValidation: false,
              // unique: false,
              // custom: "abcdefgQQQ"
            // }
            // validate: {
            //   pattern: ''
            // }
        //   }
        // ]
      }, 
      {
        key: 'display',
        components: [
          {
            key: 'placeholder',
            ignore: true
          }
        ]
      }, {
        key: 'layout',
        ignore: true
      },
      {
        key: 'logic',
        ignore: true
      },
      {
        key: 'conditional',
        ignore: true
      }
    ],
    number: [
      {
        key: 'display',
        components: [
          {
            key: 'label',
            disabled: true
          }, {
            key: 'modalEdit',
            ignore: true
          }, {
            key: 'tableView',
            ignore: true
          }
        ]
      },
      {
        key: 'data',
        ignore: true,
      },  {
        key: 'api',
        ignore: true,
      }, {
        key: 'layout',
        ignore: true//true
      },
      {
        key: 'logic',
        ignore: true
      }
    ],
    select: [
      {
        key: 'display',
        components: [
          {
            key: 'label',
            disabled: true
          }, {
            key: 'modalEdit',
            ignore: true
          }, {
            key: 'tableView',
            ignore: true
          }
        ]
      }, {
      //   key: 'data',
      //   ignore: true,
      // }, {
      //   key: 'api',
      //   ignore: true,
      // }, {
        key: 'layout',
        ignore: true//true
      },
      {
        key: 'logic',
        ignore: true
      }
    ]
    // phoneNumber:[
    //   {
    //     key: 'display',
    //     components: [
    //       {
    //         key: 'inputMask',
    //         ignore: true,
    //         default: '',
    //         validate: '',
    //         pattern: '',
    //         value: ''
    //       }
    //     ]
    //   }
    // ]
  }

// var customerEditForm = {
//     textfield: [
//       {
//         key: 'api',
//         ignore: false,
//         components: [
//           {
//             key: 'key',
//             validate: {
//               pattern: ''
//             }
//           }
//         ]
//       }
//     ],
//     Agent_Id: [
//       {
//         key: 'api',
//         ignore: false,
//         components: [
//           {
//             key: 'key',
//             validate: {
//               pattern: ''
//             }
//           }
//         ]
//       }
//     ],
//     agentId: [
//       {
//         key: 'api',
//         ignore: false,
//         components: [
//           {
//             key: 'key',
//             validate: {
//               pattern: ''
//             }
//           }
//         ]
//       }
//     ],
//     number: [
//         {
//           key: 'api',
//           ignore: false,
//           components: [
//             {
//               key: 'key',
//               overrideEditForm: true,
//               validate:{}
//             }
//           ]
//         }
//       ]
//   }

// the api tab will disappear, but the key still will change
//   var customerEditForm = {
//     textfield: [
//       {
//         key: 'api',
//         ignore: true
//       }        
//     ]
//   }

// https://formio.github.io/formio.js/docs/file/src/components/button/editForm/Button.edit.display.js.html