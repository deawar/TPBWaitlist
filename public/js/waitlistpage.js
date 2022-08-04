$(document).ready(function() {
    const waitlist = [];
    const rowtoEdit = [];
    const rowtoDel = [];

    // Sourced from https://discourse.webflow.com/t/auto-detecting-city-from-zip-code-entry-in-a-form-field/156760
    $("#zip").keyup(function() {
		let zip_in = $(this);
		let zip_box = $('#zipbox');
		let geocode = $('#geocode');
		let address = $('#address');
		let address2 = $('#address2');
		let city = $('#city');
		let state = $('#state');
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
					const locationURL = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${address.val()}, ${address2.val()}, ${city.val()}, ${state.val()} ${zip_in.val()},USA&category=&outFields=*&forStorage=false&f=json`;
					console.log('ArcGIS URL: ', locationURL);
					$.ajax({
						url: locationURL,
						cache: false,
						dataType: "json",
						success: function(result, success) {
							console.log('ajaax return:', result.candidates[0].location);
							let coor_Location = JSON.stringify(result.candidates[0].location);
							$(geocode).val(coor_Location);
						},
						error: function(result, success) {
									geocode.removeClass('success').addClass('error');
								}
					});

				},
				error: function(result, success) {
					zip_box.removeClass('success').addClass('error');
				}
			});
		}
	});

    //Fx to display timestamps the way we want
    function displayDateTime(date, AddorDel) {
        if(AddorDel){ //do if true
            if(date === undefined || date === null) {
                return date = " ";
            }
            let timestamp = date.split("T");
            usdate = timestamp[0].replace(/(\d{4})\-(\d{2})\-(\d{2}).*/, '$2-$3-$1');
            return usdate;
        }
        if(date === undefined || date === null) {
            return date = " ";
        }
        let timestamp = date.split("T");
        // console.log("deleted_at:", date) // TODO: remove console.log
        let dateDeleted = timestamp[0].replace(/(\d{4})\-(\d{2})\-(\d{2}).*/, '$2-$3-$1');
        let timeDeleted = timestamp[1].replace(/(\d{2})\:(\d{2})\:(\d{2}).*/,'$1:$2:$3');
        newDeleted_at = "Time: "+ timeDeleted + " " +  "Date: " + dateDeleted;
        return newDeleted_at;
    }   
    
    //Fx to read Array object of pets
    function displayPets(pets) {
        let returnPets = [];        
        (Object.keys(pets).forEach(key => {
            //let cell = document.createElement('tr');
            //let textNode = document.createTextNode(key);
            returnPets.push(pets[key]);
            let rPets = (`${pets[key].pets_name}, ${pets[key].pets_sex}, ${pets[key].pets_breed}, "Wt:",${pets[key].pets_weight}, "Age:",${pets[key].pets_age}`);
            console.log("rPets:", rPets);
            return rPets;
        }));
    }

    // Build the waitlist html table
    function buildWaitlistTable(waitlist) {
        let tbl=$("<table/>").attr("id","wltable");
        let shown = 0; // Current number of rows displayed
        console.log("waitlist.count:",waitlist.count); // TODO: remove console.log
        $("#div1").append(tbl);
        for(let i=0;i<waitlist.count;i++)
        {
            const tr = "<tr>";
            let id = waitlist.waitlists[i]["id"];
            let date = waitlist.waitlists[i]["date"];
            let dateAdded = true;
            let pets = waitlist.waitlists[i]["pets"];
            let geocode = JSON.stringify(waitlist.waitlists[i]["geocode"]);
            //console.log("index:", i, "geocode pulled from db:", JSON.parse(geocode));
            console.log("waitlist:", waitlist.waitlists[i]);
            //let inputDate = date.split("T");
            //usdate = inputDate[0].replace(/(\d{4})\-(\d{2})\-(\d{2}).*/, '$2-$3-$1')
            usdate = displayDateTime (date, dateAdded)
            let action_btn = `<button class='btn btn-outline-warning btn-sm mybtn'id='editDelete${[i]}' data-id=${id} data-toggle='modal' data-target='editDeleteModal'><i class="glyphicon glyphicon-pencil"></i>Edit/Delete</button>`;
            const td1 = "<td>"+action_btn+"</td>";
            //let td2 = "<td>"+waitlist.waitlists[i]["date"]+"</td>";
            let td2 = "<td>"+usdate+"</td>";
            let td3 = "<td>"+waitlist.waitlists[i]["customer"]+"</td>";
            let td4 = "<td>"+waitlist.waitlists[i]["address"]+"</td>";
            let td5 = "<td>"+waitlist.waitlists[i]["address2"]+"</td>";
            let td6 = "<td>"+waitlist.waitlists[i]["city"]+"</td>";
            let td7 = "<td>"+waitlist.waitlists[i]["state"]+"</td>";
            let td8 = "<td>"+waitlist.waitlists[i]["zip"]+"</td>";
            let td9 = "<td>"+geocode+"</td>";
            // (Object.keys(pets).forEach(key => {
            //     let rPets = (`${pets[key].pets_name}, ${pets[key].pets_sex}, ${pets[key].pets_breed}, "Wt:",${pets[key].pets_weight}, "Age:",${pets[key].pets_age}`)
            // }));
            let td10 = "<td>" + displayPets(pets) + "</td>";
            //let td9 = "<td>"+waitlist.waitlists[i]["pets"][0]+"</td>";
            let td11 = "<td>"+waitlist.waitlists[i]["phone_mobile"]+"</td>";
            let td12 = "<td>"+waitlist.waitlists[i]["phone_other"]+"</td>";
            let td13 = "<td>"+waitlist.waitlists[i]["location"]+"</td>";
            let td14 = "<td>"+waitlist.waitlists[i]["preferred_days"][0]+"</td>";
            let delatDate = waitlist.waitlists[i]["deleted_at"];
            let dateDeleted = false;
            delDate = displayDateTime (delatDate, dateDeleted)
            // let td14 = "<td>"+waitlist.waitlists[i]["deleted_at"]+"</td>";
            let td15 = "<td>" + delDate + "</td>";
            let td16 = "<td>"+waitlist.waitlists[i]["email"]+"</td></tr>";

            $("#wltable").append(tr+td1+td2+td3+td4+td5+td6+td7+td8+td9+td10+td11+td12+td13+td14+td15+td16); 
            shown ++;
            $("#count").html("Count: " + shown);
        }
    }

    // Edit row in Waitlist
    function updateRow(rowToBeEdited, waitlistId) {
        stringrowTobeEdited = JSON.stringify(rowToBeEdited);
        let url = `/waitlist/update/${waitlistId}`;
        fetch(url, {
            method: "PATCH",
            headers: { 'Content-Type': 'application/json' },
            body: stringrowTobeEdited
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            window.location.href = window.location.href;
        })
        .catch(error => {
            console.log(error);
            response.status(500).json({
                error:err
            });
        });
    } 

    // Delete from Waitlist
    function markDeleted(delrow, waitlistId) {
        console.log('searchId:', waitlistId)
        console.log('delrow:', delrow)
        stringdelrow = JSON.stringify(delrow)
        console.log('stringdelrow:',stringdelrow);
        let url = `/waitlist/update/${waitlistId}`
        fetch(url,{
            method: "PATCH",
            headers: { 'Content-Type': 'application/json' },
            body: stringdelrow
        })
            .then((response) => {
                if (!response.ok) {                                  // ***
                    throw new Error("HTTP error " + response.status);  // ***
                }
                  
                window.location.href = window.location.href;
                })
            .catch(error => {
                console.log(error)
                response.status(500).json({ 
                    error:err 
                });
            });
    }
    

    
    // fetch current waitlist from db
    fetch("/waitlist/displaywaitlist")
    .then(response => {
        return response.json();
    })
    .then(data => {
        const waitlist = data;
        buildWaitlistTable(waitlist);

        // Modal and trigger for Edit/Delete modal 
        $('#wltable').on('click', '.mybtn', function() {
            let searchId = $(this).attr('data-id');
            console.log('Edit/Delete clicked-id:',searchId); // TODO: remove console.log
            $('#editDeleteModal').modal('show');
            console.log('Looking for Waitlist:', waitlist); // TODO: remove console.log
            // Populate edit form with row data
            let editIndex = waitlist.waitlists.findIndex(x => x.id === searchId);
            console.log('num:', editIndex); // TODO: remove console.log
            console.log("ID was found and returned this element:", waitlist.waitlists[editIndex].customer) // TODO: remove console.log
            FormObject = document.forms['editCustomer']; //FIXME: change from element name to for each index with if then to not include <button> elements
            console.log('number of form elements:', FormObject.length); //FIXME: Source: https://www.javascript-coder.com/javascript-form/javascript-get-all-form-objects/
            FormObject.elements['customer'].value = waitlist.waitlists[editIndex].customer;
            //FormObject.elements['last_name'].value = last_name;
            FormObject.elements['phone_mobile'].value = waitlist.waitlists[editIndex].phone_mobile;
            if (waitlist.waitlists[editIndex].phone_other === undefined) {
                FormObject.elements['phone_other'].value = "";
            } else {
                FormObject.elements['phone_other'].value = waitlist.waitlists[editIndex].phone_other;
            };
            if (waitlist.waitlists[editIndex].address === undefined) {
                FormObject.elements['address'].value = "";
            } else {
                FormObject.elements['address'].value = waitlist.waitlists[editIndex].address;
            };
            if (waitlist.waitlists[editIndex].address2 === undefined) {
                FormObject.elements['address2'].value = "";
            } else {
                FormObject.elements['address2'].value = waitlist.waitlists[editIndex].address2;
            };
            if (waitlist.waitlists[editIndex].city === undefined) {
                FormObject.elements['city'].value = "";
            } else {
                FormObject.elements['city'].value = waitlist.waitlists[editIndex].city;
            };
            if (waitlist.waitlists[editIndex].state === undefined) {
                FormObject.elements['state'].value = "";
            } else {
                FormObject.elements['state'].value = waitlist.waitlists[editIndex].state;
            };
            if (waitlist.waitlists[editIndex].zip === undefined) {
                FormObject.elements['zip'].value = "";
            } else {
                FormObject.elements['zip'].value = waitlist.waitlists[editIndex].zip;
            };
            if (waitlist.waitlists[editIndex].geocode === undefined) {
                FormObject.elements['geocode'].value = "";
            } else {
                FormObject.elements['geocode'].value = waitlist.waitlists[editIndex].geocode;
            };
            if (waitlist.waitlists[editIndex].email === undefined) {
                FormObject.elements['email'].value = "";
            } else {
                FormObject.elements['email'].value = waitlist.waitlists[editIndex].email;
            };
            if (waitlist.waitlists[editIndex].pets === undefined) {
                FormObject.elements['pets'].value = "";
            } else {
                FormObject.elements['pets'].value = waitlist.waitlists[editIndex].pets;
            };
            if (waitlist.waitlists[editIndex].pets[0].petsName === undefined) {
                FormObject.elements['petsName'].value = "";
            } else {
                FormObject.elements['petsName'].value = waitlist.waitlists[editIndex].petsName;
            };
            if (waitlist.waitlists[editIndex].petsBreed === undefined) {
                FormObject.elements['petsBreed'].value = "";
            } else {
                FormObject.elements['petsBreed'].value = waitlist.waitlists[editIndex].petsBreed;
            };
            if (waitlist.waitlists[editIndex].preferred_days === undefined) {
                FormObject.elements['preferred_days'].value = "";
            } else {
                FormObject.elements['preferred_days'].value = waitlist.waitlists[editIndex].preferred_days;
            };
            if (waitlist.waitlists[editIndex].deleted_at === undefined) {
                FormObject.elements['deleted_at'].value = "";
            } else {
                FormObject.elements['deleted_at'].value = waitlist.waitlists[editIndex].deleted_at;
            };
            if (waitlist.waitlists[editIndex].location === undefined) {
                FormObject.elements['location'].value = "";
            } else {
                FormObject.elements['location'].value = waitlist.waitlists[editIndex].location;
            };

            // Save Changes Button
            $('#savechgBtn').click(function (eventObject) {
                console.log(`Save Changes Button on ID:${searchId} Clicked`);
                //rowtoEdit = [];
                let customer = FormObject.elements['customer'].value;
                //let last_name = FormObject.elements['last_name'].value;
                //let customer = first_name + ' ' + last_name;
                let phone_mobile = FormObject.elements['phone_mobile'].value;
                let phone_other = FormObject.elements['phone_other'].value;
                let address = FormObject.elements['address'].value;
                let address2 = FormObject.elements['address2'].value;
                let city = FormObject.elements['city'].value;
                let state = FormObject.elements['state'].value;
                console.log ('New State:',state);
                let zip = FormObject.elements['zip'].value;
                let geocode = FormObject.elements['geocode'].value;
                let email = FormObject.elements['email'].value;
                let pets = FormObject.elements['pets'].value;
                let deleted_at = FormObject.elements['deleted_at'].value;
                let location = FormObject.elements['location'].value;

                function createJSON() {
                    let rowEdit = [];
                    $("#editCustomer *").filter(':input').each(function() {
                    //$("input[class=form-control]").each(function() {
                        let propName = $(this).attr("id");
                        let value = $(this).val();
                        item = {}
                        item ["propName"] = propName;
                        item ["value"] = value;
                        console.log("items pushed to array:", item);
                        console.log("propName pushed to array:", propName);
                        console.log("value pushed to array:", value);
                        
                        rowEdit.push(item);
                        console.log("array rowEdit contents:", rowEdit)
                    });
                    console.log("rowEdit:", rowEdit);
                    return rowEdit;
                }
                    
                rowToEdit = createJSON()  
                console.log("Before updateRow call rowToEdit:", rowToEdit);
                updateRow(rowToEdit, searchId)

            })
            // Delete Button
            $('#delBtn').click(function (eventObject) {
                if(FormObject.elements['deleted_at'].value === "" || FormObject.elements['deleted_at'].value === null || FormObject.elements['deleted_at'].value === undefined) {
                    console.log(`Delete Button on ID:${searchId} Clicked`);
                    let deldate = Date();
                    let delrow = { "propName" : "deleted_at", "value": deldate}
                    rowtoDel.push(delrow);
                    console.log("array to mark delete:", rowtoDel);
                    markDeleted(rowtoDel, searchId)
                } else {
                    return console.log('#error.msg: Row already marked Deleted');//('#error.msg' => $this-flash('failure_msg', 'Row already marked Deleted')
                }
            })
            
        });

        // Show rows based on checkbox
        //showDeletedRows();

        // Modal Close button
        $('#editDeleteModal').on('click', 'button.close', function (eventObject) {
            $('#editDeleteModal').modal('hide');
        });
        $('#btnclose').click(function (eventObject) {
            $('#editDeleteModal').modal('hide');
        });
        $('#btnclose').click(function (eventObject) {
            $('#alertMessage')
        })
    });

    //Fx to filter by checkbox
    $("#showDeletedRows").click(function() { 
        let table, rows, cells, deleted_at;
        table = document.getElementById('wltable');
        let mycheckBox=$("#showDeletedRows");
        let shown = 0; // Current number of rows displayed
        //checkBox=document.getElementById('showDeletedRows');
        console.log('mycheckBox.value:', mycheckBox.val())
        console.log('Unchecked mycheckBox:', mycheckBox)
        rows = table.getElementsByTagName("tr");
        if($(mycheckBox).prop("checked") === true){
            $("#showDeletedRows").attr("checked", true);
            alert('Box is checked show only non-deleted rows');
            console.log('Line 288 mycheckBox.value:', mycheckBox.val())
            let index = 0;
            for (let row of rows) {
                if (index > 0) {
                    cells = row.getElementsByTagName("td");
                    //name = cells[2].innerText;
                    deleted_at = cells[13].innerText;
                    console.log("length of deleted_at:",deleted_at.length);
                    console.log("deleted_at:",deleted_at);
                    if (deleted_at.length > 8) {
                        console.log("rows[index - 1].getElementByTagName('td')[13].innerText", rows[index].getElementsByTagName("td")[13].innerText);
                        console.log("rows[index - 1]:", rows[index])
                        console.log("index - 1]:", index)
                        console.log("======================> should be hiding this row.");
                        row.style.display = "none"; // hide this row
                        
                    }
                    else {
                        row.style.display = "table-row"; // show this row
                        shown ++;
                        $("#count").html("Count: " + shown);
                    }
                }
                index++;
            }
        }
        if($(mycheckBox).prop("checked") === false) {
            $("#showDeletedRows").attr("checked", false);
            alert('Box is unchecked show all rows');
            console.log('Line 317 mycheckBox.value:', mycheckBox.val())
            let index = 0;
            for (let row of rows) {
                if (index > 0) {
                    cells = row.getElementsByTagName("td");
                    //name = cells[2].innerText;
                    deleted_at = cells[13].innerText;
                    console.log("length of deleted_at:",deleted_at.length);
                    console.log("deleted_at:",deleted_at);
                    row.style.display = "table-row"; // show this row
                    shown ++;
                    $("#count").html("Count: " + shown);
                }
            }
            index++;
        }
    })

});
