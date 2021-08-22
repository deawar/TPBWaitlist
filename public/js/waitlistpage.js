$(document).ready(function() {
    const waitlist = [];
    const rowtoEdit = [];
    const rowtoDel = [];

    
    // Build the waitlist html table
    function buildWaitlistTable(waitlist) {
        let tbl=$("<table/>").attr("id","wltable");
        console.log("waitlist.count:",waitlist.count); // TODO: remove console.log
        $("#div1").append(tbl);
        for(let i=0;i<waitlist.count;i++)
        {
            const tr = "<tr>";
            let id = waitlist.waitlists[i]["id"];
            let date = waitlist.waitlists[i]["date"];
            let inputDate = date.split("T");
            usdate = inputDate[0].replace(/(\d{4})\-(\d{2})\-(\d{2}).*/, '$2-$3-$1')
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
            let td9 = "<td>"+waitlist.waitlists[i]["pets"][0]+"</td>";
            let td10 = "<td>"+waitlist.waitlists[i]["phone_mobile"]+"</td>";
            let td11 = "<td>"+waitlist.waitlists[i]["phone_other"]+"</td>";
            let td12 = "<td>"+waitlist.waitlists[i]["location"]+"</td>";
            let td13 = "<td>"+waitlist.waitlists[i]["preferred_days"]+"</td>";
            let td14 = "<td>"+waitlist.waitlists[i]["deleted_at"]+"</td>";
            let td15 = "<td>"+waitlist.waitlists[i]["email"]+"</td></tr>";

            $("#wltable").append(tr+td1+td2+td3+td4+td5+td6+td7+td8+td9+td10+td11+td12+td13+td14+td15); 

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
            let splitName = waitlist.waitlists[editIndex].customer.split(' ')
            let first_name = splitName[0];
            let last_name = splitName[1];
            FormObject = document.forms['editCustomer']; //FIXME: change from element name to for each index with if then to not include <button> elements
            console.log('number of form elements:', FormObject.length); //FIXME: Source: https://www.javascript-coder.com/javascript-form/javascript-get-all-form-objects/
            FormObject.elements['first_name'].value = first_name;
            FormObject.elements['last_name'].value = last_name;
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
                FormObject.elements['current_facility'].value = "";
            } else {
                FormObject.elements['current_facility'].value = waitlist.waitlists[editIndex].location;
            };

            // Save Changes Button
            $('#savechgBtn').click(function (eventObject) {
                console.log(`Save Changes Button on ID:${searchId} Clicked`);
                //rowtoEdit = [];
                let first_name = FormObject.elements['first_name'].value;
                let last_name = FormObject.elements['last_name'].value;
                let customer = first_name + ' ' + last_name;
                console.log ('New Customer name:', customer);
                let phone_mobile = FormObject.elements['phone_mobile'].value;
                let phone_other = FormObject.elements['phone_other'].value;
                let address = FormObject.elements['address'].value;
                let address2 = FormObject.elements['address2'].value;
                let city = FormObject.elements['city'].value;
                let state = FormObject.elements['state'].value;
                let zip = FormObject.elements['zip'].value;
                let email = FormObject.elements['email'].value;
                let pets = FormObject.elements['pets'].value;
                let deleted_at = FormObject.elements['deleted_at'].value;
                let location = FormObject.elements['current_facility'].value;


                let editrow = { 
                    "propName": "customer", "value": customer,
                    // "propName": "phone_mobile", "value": phone_mobile,
                    // "propName": "phone_other", "value": phone_other,
                    // "propName": "address", "value": address,
                    // "propName": "address2", "value": address2,
                    // "propName": "city", "value": city,
                    // "propName": "state", "value": state,
                    // "propName": "zip", "value": zip,
                    // "propName": "email", "value": email,
                    // "propName": "pets", "value": pets,
                    // "propName": "deleted_at", "value": deleted_at,
                    // "propName": "location", "value": location
                }
                console.log("editrow object:", editrow);
                rowtoEdit.push(editrow);
                console.log("Array to edit row:", editrow);
                updateRow(rowtoEdit, searchId)

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

        // Modal Close button
        $('#editDeleteModal').on('click', 'button.close', function (eventObject) {
            $('#editDeleteModal').modal('hide');
        });
        $('#btnclose').click(function (eventObject) {
            $('#editDeleteModal').modal('hide');
        });

    });
});
