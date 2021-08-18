let FormObject = document.forms['newcustomer'];
let zip = FormObject.elements['zip'].value;

	// $(function() {
	// 	// IMPORTANT: Fill in your client key
	// 	var clientKey = "jKq3FqbMjSU27Cb54rz9BZarOPhajohp72i2FVmA8I5WSKcsPCNPz1AozrYHcxDQ";
		
	// 	var cache = {};
	// 	var container = $("#newcustomer");
	// 	var errorDiv = container.find("div.text-error");
		
	// 	/** Handle successful response */
	// 	function handleResp(data)
	// 	{
	// 		// Check for error
	// 		if (data.error_msg)
	// 			errorDiv.text(data.error_msg);
	// 		else if ("city" in data)
	// 		{
	// 			// Set city and state
	// 			container.find("input[name='city']").val(data.city);
	// 			container.find("input[name='state']").val(data.state);
	// 		}
	// 	}
		
	// 	// Set up event handlers
	// 	container.find("input[name='zip']").on("keyup change", function() {
	// 		// Get zip code
	// 		var zipcode = $(this).val().substring(0, 5);
	// 		if (zipcode.length == 5 && /^[0-9]+$/.test(zipcode))
	// 		{
	// 			// Clear error
	// 			errorDiv.empty();
				
	// 			// Check cache
	// 			if (zipcode in cache)
	// 			{
	// 				handleResp(cache[zipcode]);
	// 			}
	// 			else
	// 			{
	// 				// Build url
	// 				var url = "https://www.zipcodeapi.com/rest/"+clientKey+"/info.json/" + zipcode + "/radians";
					
	// 				// Make AJAX request
	// 				$.ajax({
	// 					"url": url,
    //                     "headers": { "Access-Control-Allow-Origin" : "*" },
	// 					"dataType": "json"
	// 				}).done(function(data) {
	// 					handleResp(data);
						
	// 					// Store in cache
	// 					cache[zipcode] = data;
	// 				}).fail(function(data) {
	// 					if (data.responseText && (json = $.parseJSON(data.responseText)))
	// 					{
	// 						// Store in cache
	// 						cache[zipcode] = json;
							
	// 						// Check for error
	// 						if (json.error_msg)
	// 							errorDiv.text(json.error_msg);
	// 					}
	// 					else
	// 						errorDiv.text('Request failed.');
	// 				});
	// 			}
	// 		}
	// 	}).trigger("change");
	// });
