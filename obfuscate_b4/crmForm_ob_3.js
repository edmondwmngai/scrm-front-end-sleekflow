$("<table class='w-100'>" +
"<tr>" +
"<td><label class='px-2' for='Customer_Id'><span>Customer ID</span></label></td><td><input disabled class='form-control' type='search' id='Last_Name' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Salutation'>Salutation</label></td><td><input disabled class='form-control' type='search' id='Salutation' autocomplete='off' /></td>" +
"<td><label class='px-2' for='First_Name'><span>First Name</span></label></td><td><input disabled class='form-control' type='search' id='First_Name' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Last_Name'><span>Last Name</span></label></td><td><input disabled class='form-control' type='search' id='Last_Name' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Birth_Year'></i><span class='l-form-other'>Birth Year</span></label></td><td><input disabled class='form-control' type='search' id='Birth_Year' autocomplete='off' /></td>" +
"</tr><tr>" +
"<td><label class='px-2' for='Mobile_No'><span class='l-form-mobile'>Mobile</span></label></td><td><input disabled id='Mobile_No' class='form-control' type='search' onkeyup='this.value=this.value.replace(/[^\d]/,\"\")' maxLength='50' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Email_Address'><span>Email Address</span></label></td><td><input disabled class='form-control' type='search' id='Email Address' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Customer_Preference'></i><span class='l-form-other'>Customer Preference</span></label></td><td><input disabled class='form-control' type='search' id='Customer_Preference' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Remarks_1'><span>Remarks 1</span></label></td><td colspan='3'><input disabled class='form-control' type='search' id='Remarks_1' autocomplete='off' /></td>" +
"</tr>").
appendTo("#customer-details-body");

$('#get-build-span').html(' - Get');