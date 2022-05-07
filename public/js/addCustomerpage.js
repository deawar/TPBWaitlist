$(document).ready(function() {

	// Sourced from https://discourse.webflow.com/t/auto-detecting-city-from-zip-code-entry-in-a-form-field/156760
	$("#zip").keyup(function() {
		let zip_in = $(this);
		let zip_box = $('#zipbox');
		console.log('Zip Code after zip_in:', zip_in.val())
		if (zip_in.val().length < 5) {
			zip_box.removeClass('error success');
		} else if (zip_in.val().length > 5) {
			zip_box.addClass('error').removeClass('success');
		} else if(zip_in.val().length === 5) {
			
			// Make HTTP request
			$.ajax({
				url: "https://api.zippopotam.us/us/" + zip_in.val(),
				cache: false,
				dataType: "json",
				type: "GET",
				success: function(result, success) {
					// US Zip Code Records Officially Map to only 1 Primary Location
					places = result['places'][0];
					console.log('places:',places);
					$("#city").val(places['place name']);
					//$("#state").val(places['state']);
					$("#state").val(places['state abbreviation']);
					zip_box.addClass('success').removeClass('error');
				},
				error: function(result, success) {
					zip_box.removeClass('success').addClass('error');
				}
			});
		}
	});

	$("#0petsBreed").keyup(function() {
		let breed_in = $(this);
		let breed_box = $('#breedbox');
		console.log('Breed of Dog after breed_in:', breed_in.val())
		if (breed_in.val().length < 5) {
			breed_box.removeClass('error success');
		} else if (breed_in.val().length > 25) {
			breed_box.addClass('error').removeClass('success');
		} else if(breed_in.val().length === 5) {
			// Make HTTP request
			$.ajax({
				url: "https://dog.ceo/api/breeds/list/all" + breed_in.val(),
				cache: false,
				dataType: "json",
				type: "GET",
				success: function(result, success) {
					// Dog Breed API is a simple JSON list
					breeds = result['breed'][0];
					console.log('breeds:',breeds);
					$("#petsBreed").val(breeds['place name']);
					//$("#state").val(places['state']);
					$("#state").val(breeds['state abbreviation']);
					breed_box.addClass('success').removeClass('error');
				},
				error: function(result, success) {
					breed_box.removeClass('success').addClass('error');
				}
			});
		}
	})

});
