class waTemplateService {


    templateList = [];
    

	init() {



		//this.render();

		//this.updateStatus("Session Timeout");			 //this.updateStatus("Session Ended");
	};

    
    constructor(waTemplate)
    {
        //this.templateList = [];

        this.HTMLtemplate = waTemplate;
    }

    createContextFromTemplate(templateInfo)
	{

        var context = {
            TemplateName: templateInfo.TemplateName,
            Header: templateInfo.Header,
            Message: templateInfo.Message,
            Footer: templateInfo.Footer,
            Button1: "Testing1",
            Button2: "Testing2",
            Button3: "Testing3",
            displayHeaderImage: "display: none"
            
        };


        if (templateInfo.Header != null)
        {
            if (templateInfo.HeaderType == "image")
            {
                context.Header = ""; //No text displayed
                //Set the CSS style 
                context.displayHeaderImage = "background-color: white";
                context.HeaderImageURL = templateInfo.Header;

            }
        }


        //No button
        if (templateInfo.Button1 == null && templateInfo.Button2 == null && templateInfo.Button3 == null)
        {
            context.displayBtnGroup1 = "display: none";
            context.displayBtnGroup2 = "display: none";
           
        }

        //Two buttons
        if (templateInfo.Button1 != null && templateInfo.Button2 != null && templateInfo.Button3 == null)
        {

            context.Button1 = templateInfo.Button1;
            context.Button2 = templateInfo.Button2;
            context.displayBtnGroup2 = "display: none";
        }

        //Only one buttons
        if (templateInfo.Button1 != null && templateInfo.Button2 == null && templateInfo.Button3 == null)
        {
            context.Button1 = templateInfo.Button1;
            context.displayBtnGroup2 = "display: none";

        }

        //three buttons
        if (templateInfo.Button1 != null && templateInfo.Button2 != null && templateInfo.Button3 != null)
        {
            context.Button1 = templateInfo.Button1;
            context.Button2 = templateInfo.Button2;
            context.Button3 = templateInfo.Button3;
        }

        return context;
    };

    displayTemplateOnChat(sMsg)
    {

        var header = '<div class="agent-content-bubble content-bubble">' +
            '<div class="content-bubble-name">{{SentBy}}</div></div>';

        var footer = '<div>' +
                          '<span class="user-icon"><i class="fas fa-user"></i></span>' +
                          '<div class="time-with-seconds" title="{{time}}"><span></span><span>{{time}}</span></div>' +
            '</div>';

        

    };

    displayFilledTemplateOnWeb(mTemplate, element)
    {

        var dRoot = element;
        var cContext = this.createContextFromTemplate(mTemplate);
        var inputList = mTemplate.inputList;
        var message = cContext.Message;
        var htmlTemplate = parent.$('#phone-panel')[0].contentWindow.wa_template;

        for (var r = 1; r < (inputList.length + 1); r++)
        {
            var rValue = '{{' + r.toString() + '}}';
            message = message.replace(rValue, inputList[r-1].text);
        }

        cContext.Message = message;

        dRoot.text("");

        var result = this.HTMLtemplate(cContext)

        //For removing image's height spacing
        result = result.replace("fa-image wa-card-img", "");
        result = result.replace("wa-card-img-container", "");
        //dRoot.replaceChildren(); // new way to remove all element under div
        dRoot.append(result);
    }

    returnInputListByTableRow(row) 
    {
            var inputElements = row.querySelectorAll("input.wa_value"); // Find all input elements with the name 'textInput' inside the table
            var templateName = row.getElementsByClassName('wa-template-name')[0].innerHTML;

            var selectedTemplate = this.templateList.filter(i => i.TemplateName === templateName)[0];
            // Get the values of the input elements

            var inputList = [];

            inputElements.forEach(input => {
                var item = { type: "", text: "" };
                item.type = "text";
                item.text = input.value;
                inputList.push(item);
                console.log(input.value); // Output each input value
            });

        //    inputElements.forEach(input => {
        //        if (input.type === "text")                      {   console.log("Text input value: " + input.value);        }
        //        if (input.type === "checkbox")                  {   console.log("Checkbox input value: " + input.checked);  }
        //        if (input.type === "radio" && input.checked)    {   console.log("Radio input value: " + input.value);       }
        //        if (input.tagName.toLowerCase() === "textarea") {   console.log("Textarea value: " + input.value);          }
        //    });

        return inputList;
    };

    returnSelectedTemplateByTableRow(row)
    {
        var templateName = row.getElementsByClassName('wa-template-name')[0].innerHTML;
        var cList = this.templateList;
        var selectedTemplate = cList.filter(i => i.TemplateName === templateName)[0];
        return selectedTemplate;
    }

    init(sCompany, sAgentId, sToken) {

        var wa_templateInfoList = [];
   
        getTemplateByAPI(sCompany, sAgentId, sToken, function (result, err) {

            if (err) {
                console.error('AJAX call failed:', err);
                return null; // Return if there's an error 
            }
            else {

//                this.templateList = result.details;
                this.getSetTemplateList(result.details);
            }
            console.log('AJAX call succeeded:', result);

        });
    };
    getSetTemplateList(tList) {
        return this.templateList = tList;
    };

    getTemplateList()
    {
        return this.templateList;
    };


    getTemplateByAPI(sCompany, sAgentId, sToken)
    {
        const self = this;
        $.ajax({
            type: "POST",
            url: "http://172.17.6.11:8033/api/getTemplate",
            data: JSON.stringify({ "Company": sCompany, "Agent_Id": sAgentId, "Token": sToken }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (r) {
                if (!/^success$/i.test(r.result || "")) {
                    console.log('error in WaTemplatePopup');

                    //callback(null, r);
                } else {

                   // callback(r, null);
                     self.templateList = r.details;
                }
            },

            error: function (r) {
                callback(null, r);
                console.log('error in socialPopup');
                console.log(r);
            }
        });
    };

    validateTemplateInput(inputList)
    {
        for (var r = 1; r < (inputList.length + 1); r++) {

            var inputText = inputList[r - 1].text;
            if (isNullOrEmpty(inputText)== true)
            {
                return false;
            }
        }
        return true;
    };

}


function isNullOrEmpty(str) { return !str || str.trim().length === 0; }

