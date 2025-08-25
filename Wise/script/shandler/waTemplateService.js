class WaTemplateService {


    templateList = [];
    HTMLtemplate = null;
    qHTMLtemplate = null;
    baseURL = "";

    init(sCompany, sAgentId, sToken) {

        //   var wa_templateInfoList = [];     //20250414 Remove the declaration of the unused 'wa_templateInfoList' variable.

        getTemplateByAPI(sCompany, sAgentId, sToken, function (result, err) {

            if (err) {
                console.error('AJAX call failed:', err);
                return null; // Return if there's an error 
            }
            else {

                //                this.templateList = result.details;
                this.setTemplateList(result.details);
            }
            console.log('AJAX call succeeded:', result);

        });
		
		//getAgentListByAPI();
    };

    
    constructor(waTemplate, quotedTemplate, baseURL)
    {
        //this.templateList = [];

        this.HTMLtemplate = waTemplate;
        this.qHTMLtemplate = quotedTemplate;
        this.baseURL = baseURL;
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

    //displayTemplateOnChat(sMsg)
    //{

    //    var header = '<div class="agent-content-bubble content-bubble">' +
    //        '<div class="content-bubble-name">{{SentBy}}</div></div>';

    //    var footer = '<div>' +
    //                      '<span class="user-icon"><i class="fas fa-user"></i></span>' +
    //                      '<div class="time-with-seconds" title="{{time}}"><span></span><span>{{time}}</span></div>' +
    //        '</div>';

        

    //};

    displayFilledTemplateOnWeb(mTemplate, element)
    {

        var dRoot = element;
        var cContext = this.createContextFromTemplate(mTemplate);
        var inputList = mTemplate.inputList;
        var message = cContext.Message;
        //  var htmlTemplate = parent.$('#phone-panel')[0].contentWindow.wa_template;     //20250414 Remove the declaration of the unused 'htmlTemplate' variable.

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
        //var templateName = row.getElementsByClassName('wa-template-name')[0].innerHTML;   // 20250414 Remove the declaration of the unused 'templateName' variable.

        // var selectedTemplate = this.templateList.filter(i => i.TemplateName === templateName)[0];     20250414 Remove the declaration of the unused 'selectedTemplate' variable.
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
	
	returnSelectedTemplateByTemplateName(templateName)
    {
        var cList = this.templateList;
        var selectedTemplate = cList.filter(i => i.TemplateName === templateName)[0];
        return selectedTemplate;
    }

    setTemplateList(tList) {
        this.templateList = tList;
    };

    getTemplateList()
    {
        return this.templateList;
    };
	
	
	returnVariableTable(data, element)
	{
		
		var droot = element;
		
		const container = document.createElement('div');
		container.className = 'd-table';

		// Header row
		const headerRow = document.createElement('div');
		headerRow.className = 'd-table-row';
        let i = 0;
		['Field', 'Test Value', '', 'Field', 'Variable', ''].forEach(text => {
		  const cell = document.createElement('b');
		  i = i + 1;

          if (i == 4)
          {
                cell.className = 'd-table-cell ps-5 l-campaign-field';
          }else{
                cell.className = 'd-table-cell';
          }
		  cell.textContent = text;
		  headerRow.appendChild(cell);
		});

		container.appendChild(headerRow);

		for (let i = 0; i < data.length; i += 2) {
		  const row = document.createElement('div');
		  row.className = 'd-table-row';

		  // First field in row
		  const [field1, value1] = Object.entries(data[i])[0];
		  const field1Class = field1.toLowerCase().replace(/\s+/g, '-');

		  // Second field in row (if exists)
		  let field2 = '', value2 = '', field2Class = '';
		  if (i + 1 < data.length) {
			[field2, value2] = Object.entries(data[i + 1])[0];
			field2Class = field2.toLowerCase().replace(/\s+/g, '-');
		  }

		  row.innerHTML = `
			<span class="d-table-cell pe-2 l-form-${field1Class}">${field1}</span>
			<span class="d-table-cell pe-2">${value1}</span>
			<span class="d-table-cell pe-2">
				<i class="fas fa-copy cursor-pointer pop" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom" aria-label="Copied!" data-bs-original-title="Copied!"></i>
			</span>
			<span class="d-table-cell pe-2 ps-5 l-campaign-${field2Class}">${field2}</span>
			<span class="d-table-cell pe-2">${value2}</span>
			<span class="d-table-cell pe-2">
				<i class="fas fa-copy cursor-pointer pop" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom" aria-label="Copied!" data-bs-original-title="Copied!"></i>
			</span>
		  `;

		  container.appendChild(row);
		}
		
		// Append to body or any container
		droot.append(container);		
		
	}
	
	fillInputFromAssignmentTable(inputJson, variableTableData, assignmentTableData)
	{
		// Create a mapping of placeholders to values
		const valueMap = {};
		for (let i = 0; i < assignmentTableData.length; i++) {
		  const [key, value] = Object.entries(assignmentTableData[i])[0];

		  // Find the matching variable name from variableTableData
		  for (let j = 0; j < variableTableData.length; j++) {
			const [varKey, varPlaceholder] = Object.entries(variableTableData[j])[0];

			// Match based on key name, not placeholder
			if (key === varKey) {
			  valueMap[varPlaceholder] = value; // e.g. valueMap["{{Mobile}}"] = "61234567"
			  break;
			}
		  }
		}

		// Step 2: Replace placeholders in inputJson
		const result = [];
		for (let i = 0; i < inputJson.length; i++) {
		  const item = inputJson[i];
		  const newText = valueMap[item.text] || item.text;
		  result.push({ type: item.type, text: newText });
		}

		return result;
	}
	
	returnAssignmentTable(data, element)
	{
		
		var droot = element;
		
		const container = document.createElement('div');
		container.className = 'd-table';

		// Header row
		const headerRow = document.createElement('div');
		headerRow.className = 'd-table-row';

		['Field', 'Test Value', '', 'Field', 'Test Value'].forEach(text => {
		  const cell = document.createElement('b');
		  cell.className = 'd-table-cell';
		  cell.textContent = text;
		  headerRow.appendChild(cell);
		});

		container.appendChild(headerRow);

		for (let i = 0; i < data.length; i += 2) {
		  const row = document.createElement('div');
		  row.className = 'd-table-row';

		  // First field in row
		  const [field1, value1] = Object.entries(data[i])[0];
		  const field1Class = field1.toLowerCase().replace(/\s+/g, '-');

		  // Second field in row (if exists)
		  let field2 = '', value2 = '', field2Class = '';
		  if (i + 1 < data.length) {
			[field2, value2] = Object.entries(data[i + 1])[0];
			field2Class = field2.toLowerCase().replace(/\s+/g, '-');
		  }

		  row.innerHTML = `
			<span class="d-table-cell pe-2 l-form-${field1Class}">${field1}</span>
			<span class="d-table-cell pe-2">${value1}</span>
			<span class="d-table-cell pe-2"></span>
			<span class="d-table-cell pe-2 ps-5 l-campaign-${field2Class}">${field2}</span>
			<span class="d-table-cell pe-2">${value2}</span>
		  `;

		  container.appendChild(row);
		}
		
		// Append to body or any container
		droot.append(container);

	}
	
	
//	<div class="d-table"><div class="d-table-row"><b class="d-table-cell l-campaign-field">Field</b><b class="d-table-cell l-campaign-variable">Variable</b><b class="d-table-cell"></b><b class="d-table-cell ps-5 l-campaign-field">Field</b><b class="d-table-cell l-campaign-variable">Variable</b><b class="d-table-cell"></b></div><div class="d-table-row"><span class="d-table-cell pe-2 l-form-full-name">Full Name</span><span class="d-table-cell pe-2">{{FullName}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom" aria-label="Copied!" data-bs-original-title="Copied!"></i></span><span class="d-table-cell pe-2 ps-5 l-campaign-mobile-num">Mobile No</span><span class="d-table-cell pe-2">{{Mobile}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom" aria-label="Copied!" data-bs-original-title="Copied!"></i></span></div><div class="d-table-row"><span class="d-table-cell pe-2 l-form-title">Title</span><span class="d-table-cell pe-2">{{Title}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom" aria-label="Copied!" data-bs-original-title="Copied!"></i></span><span class="d-table-cell pe-2 ps-5 l-campaign-home-num">Home No</span><span class="d-table-cell pe-2">{{Home}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom" aria-label="Copied!" data-bs-original-title="Copied!"></i></span></div><div class="d-table-row"><span class="d-table-cell pe-2 l-form-email">Email</span><span class="d-table-cell pe-2">{{Email}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom" aria-label="Copied!" data-bs-original-title="Copied!"></i></span><span class="d-table-cell pe-2 ps-5 l-campaign-work-num">Work No</span><span class="d-table-cell pe-2">{{Work}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom" aria-label="Copied!" data-bs-original-title="Copied!"></i></span></div></div>

    async getTemplateByAPI(sCompany, sAgentId, sToken)
    {
        //"http://172.17.6.11:8033/api/getTemplate",

      

        var URL = this.baseURL;
        //const self = this;        20250414 Remove the declaration of the unused 'self' variable.
        function getTemplate(sCompany, sAgentId, sToken)
        {

            return new Promise((resolve, reject) => {

                $.ajax({
                    type: "POST",
                    url: URL + "/api/getTemplate",
                    data: JSON.stringify({ "Company": sCompany, "Agent_Id": sAgentId, "Token": sToken }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (r) {
                        if (!/^success$/i.test(r.result || "")) {
                            console.log('error in getTemplateByAPI');

                            reject('error in getTemplateByAPI');
                            //callback(null, r);
                        } else {
                            resolve(r.details)

                        }
                    },

                    error: function (r) {
                        //callback(null, r);
                        console.log('error in socialPopup');
                        console.log(r);
                        reject('error in getTemplateByAPI');
                    }
                });
            });
        }

        try {
            // Use Promise.all to wait for all AJAX requests to resolve
            // const results = await Promise.all(fetchPromises);
            const results = await getTemplate(sCompany, sAgentId, sToken);

            // Combine all `details` from the results and assign to self.templateList
            this.templateList = results;
            console.log('Updated template list:', this.templateList);

        } catch (error) {
            console.error('Error in fetching templates:', error);
        }

    };
	
	

	//20250812 for fix 
	validateTemplateInputExist(sTemplate)
	{
			
		if (!sTemplate || !Array.isArray(sTemplate.inputList)) {
			return false; // or handle accordingly
		}
		return true;
	}
	

    validateTemplateInputFilled(sTemplate)
    {
        var inputList = sTemplate.inputList;

        for (var r = 1; r < (inputList.length + 1); r++) {

            var inputText = inputList[r - 1].text;
            if (isNullOrEmpty(inputText)) { //if (isNullOrEmpty(inputText) == true) {       // 20250407 Refactor the code to avoid using this boolean literal.
            
                return false;
            }
        }

        return true;
    };

    validateTemplateInputLength(sTemplate) {
        var inputList = sTemplate.inputList;


        //1024 is the maximum
        var mLength = sTemplate.Message.length;

        var iLength = 0;
        for (var r = 1; r < (inputList.length + 1); r++) {

            var inputText = inputList[r - 1].text;

            if (isNullOrEmpty(inputText)) { //if (isNullOrEmpty(inputText) == true) {       // 20250407 Refactor the code to avoid using this boolean literal.
                iLength = iLength + 0;
            }
            else {
                iLength = iLength + inputText.length;
            }
        }

        // 20250319 Replace this if-then-else flow by a single return statement.
        //Check total character of template message + all the input values length are larger than 1000 or not
//        if (1000 < (mLength + iLength)) {
//            return false;
//        } else {
//           return true;
//        }
        return (1000 >= (mLength + iLength));
        
    };
}


function isNullOrEmpty(str) { return !str || str.trim().length === 0; }

