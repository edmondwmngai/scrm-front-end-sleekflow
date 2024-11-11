var customBuilder = {
    basic: false,
    advanced: false,
    data: false,
    premium: false,

    system: {
        title: 'System',
        weight: 10,
        components: {
            Agent_Id: {
                title: 'Agent Id',
                icon: 'hashtag',
                schema: {
                label: 'Agent ID',
                type: 'number',
                key: 'Agent_Id',
                input: true,
                disabled: true
                }
            },
            Opened_Time: {
                "title": "Opened Time",
                "key": "Opened_Time423424",
                "icon": "calendar",
                "schema": {
                    "label": "Opened Time",
                    "type": "datetime",
                    "key": "Opened_Time",
                    "format": "yyyy-MM-dd hh:mm a",
                    disabled: true
                }
            },
            Opened_By: {
                title: 'Opened By',
                key: 'Opened_By',
                icon: 'hashtag',
                schema: {
                label: 'Opened By',
                type: 'number',
                key: 'Opened_By',
                input: true,
                disabled: true
                }
            }
        }
    },
    customCus: {
      title: 'Customer Info',
      weight: 10,
      components: {
        Customer_Id: {
          title: 'Customer ID',
          icon: 'hashtag',
          schema: {
            label: 'Customer ID',
            type: 'number',
            disabled: true,
            input: true
          },
          edit: false
      },
      Name_Eng: {
        title: 'Full Name',
        icon: 'terminal',
        required: true,
        schema: {
          label: 'Full Name',
          type: 'textfield',
          input: true,
          validate: {
            required: true
          }
        }
      },
        Gender: {
          title: 'Gender',
          icon: 'th-list',
          schema: {
            label: 'Gender',
            type: 'select',
            input: true,
            data: {values:[]}
          }
        },
        Title: {
          title: 'Title',
          icon: 'th-list',
          schema: {
            label: 'Title',
            type: 'select',
            input: true,
            data: {values:[]}
          }
        },
        Lang: {
          title: 'Language',
          icon: 'th-list',
          schema: {
            label: 'Language',
            type: 'select',
            input: true,
            data: {values:[]}
          }
        },
        Nationality_Id: {
          title: 'Nationality',
          icon: 'th-list',
          schema: {
            label: 'Nationality',
            type: 'select',
            input: true,
            data: {values:[]}
          }
        },
        Market_Id: {
          title: 'Market',
          icon: 'th-list',
          schema: {
            label: 'Market',
            type: 'select',
            input: true,
            data: {values:[]}
          }
        },
        Profile_Id: {
          title: 'Profile',
          icon: 'th-list',
          schema: {
            label: 'Profile',
            type: 'select',
            input: true,
            data: {values:[]}
          }
        },
        Mobile_No: {
          title: 'Mobile',
          icon: 'phone-square',
          schema: {
            label: 'Mobile',
            type: 'textfield',
            input: true,
            inputMask: ''
          }
        },
        Other_Phone_No: {
          title: 'Other',
          icon: 'phone-square',
          schema: {
            label: 'Other',
            type: 'textfield',
            input: true
          }
        },
        Fax_No: {
          title: 'Fax',
          icon: 'phone-square',
          schema: {
            label: 'Fax',
            type: 'textfield',
            input: true
          }
        },
        Email: {
          title: 'Email',
          icon: 'at',
          schema: {
            label: 'Email',
            type: 'email',
            input: true
          }
        },
        Address1: {
          title: 'Address 1',
          icon: 'terminal',
          schema: {
            label: 'Address 1',
            type: 'textfield',
            input: true
          }
        },
        Address2: {
          title: 'Address 2',
          icon: 'terminal',
          schema: {
            label: 'Address 2',
            type: 'textfield',
            input: true
          }
        },
        Address3: {
          title: 'Address 3',
          icon: 'terminal',
          schema: {
            label: 'Address 3',
            type: 'textfield',
            input: true
          }
        },
        Address4: {
          title: 'Address 4',
          icon: 'terminal',
          schema: {
            label: 'Address 4',
            type: 'textfield',
            input: true
          }
        },
        Agree_To_Disclose_Info: {
          title: 'Agree Disclose',
          icon: 'check-square',
          schema: {
            label: 'Agree to Disclose Information',
            type: 'checkbox',
            input: true
          }
        }
      }
    },
    customCase: {
        title: 'Case Details',
        weight: 10,
        default: true,
        components: {
            Call_Nature: {
                title: 'Nature',
                icon: 'th-list',
                required: true,
                schema: {
                  label: 'Nature',
                  type: 'select',
                  input: true,
                  validate: {
                    required: true
                  },
                  // data: {
                  //     values: [{
                  //             label: "Complaint",
                  //             value: "complaint"
                  //         }, {
                  //             label: "Compliment",
                  //             value: "compliment"
                  //         }, {
                  //             label: "Enquiry",
                  //             value: "enquiry"
                  //         }, {
                  //             label: "Feedback",
                  //             value: "feedback"
                  //         }
                  //     ]
                  // }
                }
              },
              Status: {
                title: 'Status',
                icon: 'th-list',
                required: true,
                schema: {
                  label: 'Status',
                  type: 'select',
                  input: true,
                  validate: {
                    required: true
                  },
                  data: {values:[]}
                }
              },
              Details: {
                title: 'Details',
                icon: 'font',
                required: true,
                schema: {
                  label: 'Details',
                  type: 'textarea',
                  input: true,
                  validate: {
                    required: true
                  }
                }
              },
          Internal_Case_No: {
            title: 'Internal Case No',
            key: 'Internal_Case_No',
            icon: 'hashtag',
            schema: {
              label: 'Internal Case No',
              type: 'number',
              key: 'Internal_Case_No',
              input: true
            }
          },
          Case_No: {
            title: 'Case_No',
            key: 'Case_No',
            icon: 'hashtag',
            schema: {
              label: 'Case No',
              type: 'number',
              key: 'Case_No',
              input: true
            }
          }
          // frm001_fname: {
          //   title: 'First Name',
          //   key: 'frm001_fname',
          //   icon: 'terminal',
          //   schema: {
          //     label: 'First Name',
          //     type: 'textfield',
          //     key: 'frm001_fname',
          //     input: true
          //   }
          // },
          // lastName: {
          //   title: 'Last Name',
          //   key: 'frm001_lname',
          //   icon: 'terminal',
          //   schema: {
          //     label: 'Last Name',
          //     type: 'textfield',
          //     key: 'frm001_lname',
          //     input: true
          //   }
          // },
          // phoneNumber: {
          //   title: 'Mobile Phone',
          //   key: 'frm001_mobile',
          //   icon: 'phone-square',
          //   schema: {
          //     label: 'Mobile Phone',
          //     type: 'phoneNumber',
          //     key: 'frm001_mobile',
          //     input: true
          //   }
          // }
        }
      },
      "layout": {
        "title": "Layout",
        "weight": 20,
        "key": "layout",
        "components": {
            "columns": {
                "title": "Columns",
                "icon": "columns",
                "group": "layout",
                "documentation": "http://help.form.io/userguide/#columns",
                "weight": 10,
                "schema": {
                    "input": false,
                    "key": "columns",
                    "placeholder": "",
                    "prefix": "",
                    "customClass": "",
                    "suffix": "",
                    "multiple": false,
                    "defaultValue": null,
                    "protected": false,
                    "unique": false,
                    "persistent": false,
                    "hidden": false,
                    "clearOnHide": false,
                    "refreshOn": "",
                    "redrawOn": "",
                    "tableView": false,
                    "modalEdit": false,
                    "label": "Columns",
                    "labelPosition": "top",
                    "description": "",
                    "errorLabel": "",
                    "tooltip": "",
                    "hideLabel": false,
                    "tabindex": "",
                    "disabled": false,
                    "autofocus": false,
                    "dbIndex": false,
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": false,
                    "widget": null,
                    "attributes": {},
                    "validateOn": "change",
                    "validate": {
                        "required": false,
                        "custom": "",
                        "customPrivate": false,
                        "strictDateValidation": false,
                        "multiple": false,
                        "unique": false
                    },
                    "conditional": {
                        "show": null,
                        "when": null,
                        "eq": ""
                    },
                    "overlay": {
                        "style": "",
                        "left": "",
                        "top": "",
                        "width": "",
                        "height": ""
                    },
                    "allowCalculateOverride": false,
                    "encrypted": false,
                    "showCharCount": false,
                    "showWordCount": false,
                    "properties": {},
                    "allowMultipleMasks": false,
                    "tree": false,
                    "type": "columns",
                    "columns": [{
                            "components": [],
                            "width": 6,
                            "offset": 0,
                            "push": 0,
                            "pull": 0,
                            "size": "md"
                        }, {
                            "components": [],
                            "width": 6,
                            "offset": 0,
                            "push": 0,
                            "pull": 0,
                            "size": "md"
                        }
                    ],
                    "autoAdjust": false,
                    "hideOnChildrenHidden": false
                },
                "key": "columns"
            },
            "content": {
                "title": "Content",
                "group": "layout",
                "icon": "html5",
                "preview": false,
                "documentation": "http://help.form.io/userguide/#content-component",
                "weight": 5,
                "schema": {
                    "input": false,
                    "key": "content",
                    "placeholder": "",
                    "prefix": "",
                    "customClass": "",
                    "suffix": "",
                    "multiple": false,
                    "defaultValue": null,
                    "protected": false,
                    "unique": false,
                    "persistent": true,
                    "hidden": false,
                    "clearOnHide": true,
                    "refreshOn": "",
                    "redrawOn": "",
                    "tableView": false,
                    "modalEdit": false,
                    "label": "Content",
                    "labelPosition": "top",
                    "description": "",
                    "errorLabel": "",
                    "tooltip": "",
                    "hideLabel": false,
                    "tabindex": "",
                    "disabled": false,
                    "autofocus": false,
                    "dbIndex": false,
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": false,
                    "widget": null,
                    "attributes": {},
                    "validateOn": "change",
                    "validate": {
                        "required": false,
                        "custom": "",
                        "customPrivate": false,
                        "strictDateValidation": false,
                        "multiple": false,
                        "unique": false
                    },
                    "conditional": {
                        "show": null,
                        "when": null,
                        "eq": ""
                    },
                    "overlay": {
                        "style": "",
                        "left": "",
                        "top": "",
                        "width": "",
                        "height": ""
                    },
                    "allowCalculateOverride": false,
                    "encrypted": false,
                    "showCharCount": false,
                    "showWordCount": false,
                    "properties": {},
                    "allowMultipleMasks": false,
                    "type": "content",
                    "html": ""
                },
                "key": "content"
            },
            "fieldset": {
                "title": "Field Set",
                "icon": "th-large",
                "group": "layout",
                "documentation": "http://help.form.io/userguide/#fieldset",
                "weight": 20,
                "schema": {
                    "input": false,
                    "key": "fieldSet",
                    "placeholder": "",
                    "prefix": "",
                    "customClass": "",
                    "suffix": "",
                    "multiple": false,
                    "defaultValue": null,
                    "protected": false,
                    "unique": false,
                    "persistent": false,
                    "hidden": false,
                    "clearOnHide": true,
                    "refreshOn": "",
                    "redrawOn": "",
                    "tableView": false,
                    "modalEdit": false,
                    "label": "Field Set",
                    "labelPosition": "top",
                    "description": "",
                    "errorLabel": "",
                    "tooltip": "",
                    "hideLabel": false,
                    "tabindex": "",
                    "disabled": false,
                    "autofocus": false,
                    "dbIndex": false,
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": false,
                    "widget": null,
                    "attributes": {},
                    "validateOn": "change",
                    "validate": {
                        "required": false,
                        "custom": "",
                        "customPrivate": false,
                        "strictDateValidation": false,
                        "multiple": false,
                        "unique": false
                    },
                    "conditional": {
                        "show": null,
                        "when": null,
                        "eq": ""
                    },
                    "overlay": {
                        "style": "",
                        "left": "",
                        "top": "",
                        "width": "",
                        "height": ""
                    },
                    "allowCalculateOverride": false,
                    "encrypted": false,
                    "showCharCount": false,
                    "showWordCount": false,
                    "properties": {},
                    "allowMultipleMasks": false,
                    "tree": false,
                    "type": "fieldset",
                    "legend": "",
                    "components": []
                },
                "key": "fieldset"
            },
            "htmlelement": {
                "title": "HTML Element",
                "group": "layout",
                "icon": "code",
                "weight": 0,
                "documentation": "http://help.form.io/userguide/#html-element-component",
                "schema": {
                    "input": false,
                    "key": "",
                    "placeholder": "",
                    "prefix": "",
                    "customClass": "",
                    "suffix": "",
                    "multiple": false,
                    "defaultValue": null,
                    "protected": false,
                    "unique": false,
                    "persistent": false,
                    "hidden": false,
                    "clearOnHide": true,
                    "refreshOn": "",
                    "redrawOn": "",
                    "tableView": false,
                    "modalEdit": false,
                    "label": "HTML",
                    "labelPosition": "top",
                    "description": "",
                    "errorLabel": "",
                    "tooltip": "",
                    "hideLabel": false,
                    "tabindex": "",
                    "disabled": false,
                    "autofocus": false,
                    "dbIndex": false,
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": false,
                    "widget": null,
                    "attributes": {},
                    "validateOn": "change",
                    "validate": {
                        "required": false,
                        "custom": "",
                        "customPrivate": false,
                        "strictDateValidation": false,
                        "multiple": false,
                        "unique": false
                    },
                    "conditional": {
                        "show": null,
                        "when": null,
                        "eq": ""
                    },
                    "overlay": {
                        "style": "",
                        "left": "",
                        "top": "",
                        "width": "",
                        "height": ""
                    },
                    "allowCalculateOverride": false,
                    "encrypted": false,
                    "showCharCount": false,
                    "showWordCount": false,
                    "properties": {},
                    "allowMultipleMasks": false,
                    "type": "htmlelement",
                    "tag": "p",
                    "attrs": [],
                    "content": ""
                },
                "key": "htmlelement"
            },
            "panel": {
                "title": "Panel",
                "icon": "list-alt",
                "group": "layout",
                "documentation": "http://help.form.io/userguide/#panels",
                "weight": 30,
                "schema": {
                    "input": false,
                    "key": "panel",
                    "placeholder": "",
                    "prefix": "",
                    "customClass": "",
                    "suffix": "",
                    "multiple": false,
                    "defaultValue": null,
                    "protected": false,
                    "unique": false,
                    "persistent": false,
                    "hidden": false,
                    "clearOnHide": false,
                    "refreshOn": "",
                    "redrawOn": "",
                    "tableView": false,
                    "modalEdit": false,
                    "label": "Panel",
                    "labelPosition": "top",
                    "description": "",
                    "errorLabel": "",
                    "tooltip": "",
                    "hideLabel": false,
                    "tabindex": "",
                    "disabled": false,
                    "autofocus": false,
                    "dbIndex": false,
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": false,
                    "widget": null,
                    "attributes": {},
                    "validateOn": "change",
                    "validate": {
                        "required": false,
                        "custom": "",
                        "customPrivate": false,
                        "strictDateValidation": false,
                        "multiple": false,
                        "unique": false
                    },
                    "conditional": {
                        "show": null,
                        "when": null,
                        "eq": ""
                    },
                    "overlay": {
                        "style": "",
                        "left": "",
                        "top": "",
                        "width": "",
                        "height": ""
                    },
                    "allowCalculateOverride": false,
                    "encrypted": false,
                    "showCharCount": false,
                    "showWordCount": false,
                    "properties": {},
                    "allowMultipleMasks": false,
                    "tree": false,
                    "type": "panel",
                    "title": "Panel",
                    "theme": "default",
                    "breadcrumb": "default",
                    "components": []
                },
                "key": "panel"
            },
            "table": {
                "title": "Table",
                "group": "layout",
                "icon": "table",
                "weight": 40,
                "documentation": "http://help.form.io/userguide/#table",
                "schema": {
                    "input": false,
                    "key": "table",
                    "placeholder": "",
                    "prefix": "",
                    "customClass": "",
                    "suffix": "",
                    "multiple": false,
                    "defaultValue": null,
                    "protected": false,
                    "unique": false,
                    "persistent": false,
                    "hidden": false,
                    "clearOnHide": true,
                    "refreshOn": "",
                    "redrawOn": "",
                    "tableView": false,
                    "modalEdit": false,
                    "label": "Table",
                    "labelPosition": "top",
                    "description": "",
                    "errorLabel": "",
                    "tooltip": "",
                    "hideLabel": false,
                    "tabindex": "",
                    "disabled": false,
                    "autofocus": false,
                    "dbIndex": false,
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": false,
                    "widget": null,
                    "attributes": {},
                    "validateOn": "change",
                    "validate": {
                        "required": false,
                        "custom": "",
                        "customPrivate": false,
                        "strictDateValidation": false,
                        "multiple": false,
                        "unique": false
                    },
                    "conditional": {
                        "show": null,
                        "when": null,
                        "eq": ""
                    },
                    "overlay": {
                        "style": "",
                        "left": "",
                        "top": "",
                        "width": "",
                        "height": ""
                    },
                    "allowCalculateOverride": false,
                    "encrypted": false,
                    "showCharCount": false,
                    "showWordCount": false,
                    "properties": {},
                    "allowMultipleMasks": false,
                    "tree": false,
                    "type": "table",
                    "numRows": 3,
                    "numCols": 3,
                    "rows": [[{
                                "components": []
                            }, {
                                "components": []
                            }, {
                                "components": []
                            }
                        ], [{
                                "components": []
                            }, {
                                "components": []
                            }, {
                                "components": []
                            }
                        ], [{
                                "components": []
                            }, {
                                "components": []
                            }, {
                                "components": []
                            }
                        ]],
                    "header": [],
                    "caption": "",
                    "cloneRows": false,
                    "striped": false,
                    "bordered": false,
                    "hover": false,
                    "condensed": false
                },
                "key": "table"
            },
            "tabs": {
                "title": "Tabs",
                "group": "layout",
                "icon": "folder-o",
                "weight": 50,
                "documentation": "http://help.form.io/userguide/#tabs",
                "schema": {
                    "input": false,
                    "key": "tabs",
                    "placeholder": "",
                    "prefix": "",
                    "customClass": "",
                    "suffix": "",
                    "multiple": false,
                    "defaultValue": null,
                    "protected": false,
                    "unique": false,
                    "persistent": false,
                    "hidden": false,
                    "clearOnHide": true,
                    "refreshOn": "",
                    "redrawOn": "",
                    "tableView": false,
                    "modalEdit": false,
                    "label": "Tabs",
                    "labelPosition": "top",
                    "description": "",
                    "errorLabel": "",
                    "tooltip": "",
                    "hideLabel": false,
                    "tabindex": "",
                    "disabled": false,
                    "autofocus": false,
                    "dbIndex": false,
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": false,
                    "widget": null,
                    "attributes": {},
                    "validateOn": "change",
                    "validate": {
                        "required": false,
                        "custom": "",
                        "customPrivate": false,
                        "strictDateValidation": false,
                        "multiple": false,
                        "unique": false
                    },
                    "conditional": {
                        "show": null,
                        "when": null,
                        "eq": ""
                    },
                    "overlay": {
                        "style": "",
                        "left": "",
                        "top": "",
                        "width": "",
                        "height": ""
                    },
                    "allowCalculateOverride": false,
                    "encrypted": false,
                    "showCharCount": false,
                    "showWordCount": false,
                    "properties": {},
                    "allowMultipleMasks": false,
                    "tree": false,
                    "type": "tabs",
                    "components": [{
                            "label": "Tab 1",
                            "key": "tab1",
                            "components": []
                        }
                    ]
                },
                "key": "tabs"
            },
            "well": {
                "title": "Well",
                "icon": "square-o",
                "group": "layout",
                "documentation": "http://help.form.io/userguide/#well",
                "weight": 60,
                "schema": {
                    "input": false,
                    "key": "well",
                    "placeholder": "",
                    "prefix": "",
                    "customClass": "",
                    "suffix": "",
                    "multiple": false,
                    "defaultValue": null,
                    "protected": false,
                    "unique": false,
                    "persistent": false,
                    "hidden": false,
                    "clearOnHide": true,
                    "refreshOn": "",
                    "redrawOn": "",
                    "tableView": false,
                    "modalEdit": false,
                    "label": "",
                    "labelPosition": "top",
                    "description": "",
                    "errorLabel": "",
                    "tooltip": "",
                    "hideLabel": false,
                    "tabindex": "",
                    "disabled": false,
                    "autofocus": false,
                    "dbIndex": false,
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": false,
                    "widget": null,
                    "attributes": {},
                    "validateOn": "change",
                    "validate": {
                        "required": false,
                        "custom": "",
                        "customPrivate": false,
                        "strictDateValidation": false,
                        "multiple": false,
                        "unique": false
                    },
                    "conditional": {
                        "show": null,
                        "when": null,
                        "eq": ""
                    },
                    "overlay": {
                        "style": "",
                        "left": "",
                        "top": "",
                        "width": "",
                        "height": ""
                    },
                    "allowCalculateOverride": false,
                    "encrypted": false,
                    "showCharCount": false,
                    "showWordCount": false,
                    "properties": {},
                    "allowMultipleMasks": false,
                    "tree": false,
                    "type": "well",
                    "components": []
                },
                "key": "well"
            }
        },
        "componentOrder": ["htmlelement", "content", "columns", "fieldset", "panel", "table", "tabs", "well"],
        "subgroups": []
    }
  }