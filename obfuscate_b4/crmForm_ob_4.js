$("<table class='w-100'>" +
"<tr>" +
"<td><label class='px-2' for='Customer_Id'><span>Customer ID</span></label></td><td><input disabled class='form-control' type='search' id='Last_Name' autocomplete='off' /></td>" +
"<td><label class='px-2' for='First_Name'><span>First Name</span></label></td><td><input disabled class='form-control' type='search' id='First_Name' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Last_Name'><span>Last Name</span></label></td><td><input disabled class='form-control' type='search' id='Last_Name' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Gender'>Gender</label></td><td><select disabled class="form-select edit-field" name='Gender' id='Gender'><option selected='selected' value=''></option><option value='M'>Male</option><option value='F'>Female</option></select></td>" +
"<td><label class='px-2' for='HKID'><span>HKID</span></label></td><td><input disabled class='form-control' type='search' id='HKID' autocomplete='off' /></td>" +
"</tr><tr>" +
"<td><label class='px-2' for='Mobile_No'><span class='l-form-mobile'>Mobile</span></label></td><td><input disabled id='Mobile_No' class='form-control' type='search' onkeyup='this.value=this.value.replace(/[^\d]/,\"\")' maxLength='50' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Email_Address'><span>Email Address</span></label></td><td><input disabled class='form-control' type='search' id='Email Address' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Date_of_birth'></i><span class='l-form-other'>Date of Birth</span></label></td><td><input disabled class='form-control' type='search' id='Date_of_birth' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Residential_address'><span>Residential Address</span></label></td><td colspan='3'><input disabled class='form-control' type='search' id='Residential_address' autocomplete='off' /></td>" +
"</tr><tr>" +
"<td><label class='px-2' for='Income_level'>Income Level</label></td><td><select disabled class="form-select edit-field" name='Income_level' id='Income_level'><option selected='selected' value=''></option><option value='5000'>HK$0 - HK$5,000</option><option value='10000'>HK$5,001 - HK$10,000</option><option value='20000'>HK$10,001 - HK$20,000</option><option value='50000'>HK$20,001 - HK$50,000</option><option value='50001'>HK$50,001 或以上</option></select></td>" +
"<td><label class='px-2' for='Policy_code'><span>Policy Code</span></label></td><td><input disabled class='form-control' type='search' id='Policy_code' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Issue_date'><span>Issue Date</span></label></td><td><input disabled class='form-control' type='search' id='Issue_date' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Policy_status'><span>Policy Status</span></label></td><td><input disabled class='form-control' type='search' id='Policy_status' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Product_name'><span>Policy Name</span></label></td><td><input disabled class='form-control' type='search' id='Policy_name' autocomplete='off' /></td>" +
"</tr><tr>" +
"<td><label class='px-2' for='Plan_currency'><span>Plan Currency</span></label></td><td><input disabled class='form-control' type='search' id='Plan_currency' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Benefit_level'><span>Benefit Level (Notional Amount)</span></label></td><td><input disabled class='form-control' type='search' id='Benefit_level' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Premium_mode'><span>Premium Mode</span></label></td><td><input disabled class='form-control' type='search' id='Premium_mode' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Modal_premium'><span>Modal Premium</span></label></td><td><input disabled class='form-control' type='search' id='Modal_premium' autocomplete='off' /></td>" +
"<td><label class='px-2' for='Premium_paid_to_date'><span>Premium Paid to Date</span></label></td><td><input disabled class='form-control' type='search' id='Premium_paid_to_date' autocomplete='off' /></td>" +
"</tr>").
appendTo("#customer-details-body");

$('#get-build-span').html(' - Build');