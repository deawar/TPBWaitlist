$(document).ready(function() {
    const waitlist = [];
    const rowtoEdit = [];
    const rowtoDel = [];

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

    // Build the waitlist html table
    function buildWaitlistTable(waitlist) {
        let tbl=$("<table/>").attr("id","wltable");
        let shown = 0; // Current number of rows displayed
        let addedToApp = 0; // Current number of entries added to App and "Deleted" from Waitlist
        let tpbtrailer = 0; // Current count on waitlist for TPB Trailer
        let tpbvan1 = 0; // Current count on waitlist for TPB Van1
        let tpbvan2 = 0; // Current count on waitlist for TPB Van2
        let tpbvan3 = 0; // Current count on waitlist for TPB Van3
        let tpbvan4 = 0; // Current count on waitlist for TPB Van4
        console.log("waitlist.count:",waitlist.count); // TODO: remove console.log
        $("#div1").append(tbl);
        for(let i=0;i<waitlist.count;i++)
        {
            const tr = "<tr>";
            let id = waitlist.waitlists[i]["id"];
            let date = waitlist.waitlists[i]["date"];
            let dateAdded = true;
            usdate = displayDateTime (date, dateAdded)
            // let action_btn = `<button class='btn btn-outline-warning btn-sm mybtn'id='editDelete${[i]}' data-id=${id} data-toggle='modal' data-target='editDeleteModal'><i class="glyphicon glyphicon-pencil"></i>Edit/Delete</button>`;
            // const td1 = "<td>"+action_btn+"</td>";
            // let td2 = "<td>"+usdate+"</td>";
            // let td3 = "<td>"+waitlist.waitlists[i]["customer"]+"</td>";
            // let td4 = "<td>"+waitlist.waitlists[i]["address"]+"</td>";
            // let td5 = "<td>"+waitlist.waitlists[i]["address2"]+"</td>";
            // let td6 = "<td>"+waitlist.waitlists[i]["city"]+"</td>";
            // let td7 = "<td>"+waitlist.waitlists[i]["state"]+"</td>";
            // let td8 = "<td>"+waitlist.waitlists[i]["zip"]+"</td>";
            // let td9 = "<td>"+waitlist.waitlists[i]["pets"][0]+"</td>";
            // let td10 = "<td>"+waitlist.waitlists[i]["phone_mobile"]+"</td>";
            // let td11 = "<td>"+waitlist.waitlists[i]["phone_other"]+"</td>";
            let td12 = waitlist.waitlists[i]["location"];
            // let td13 = "<td>"+waitlist.waitlists[i]["preferred_days"]+"</td>";
            let delatDate = waitlist.waitlists[i]["deleted_at"];
            let dateDeleted = false;
            delDate = displayDateTime (delatDate, dateDeleted)
            // let td14 = "<td>"+waitlist.waitlists[i]["deleted_at"]+"</td>";
            // let td14 = "<td>" + delDate + "</td>";
            // let td15 = "<td>"+waitlist.waitlists[i]["email"]+"</td></tr>";
            //if(delatDate.length > 0 && (delatDate != null|| delatDate != undefined)) {
            if(delatDate != null|| delatDate != undefined) {
                //console.log("deleted: ", delatDate) // TODO remove console.log 
                addedToApp ++;
                $("#deleted").html("Total: " + addedToApp);
            }
            // $("#wltable").append(tr); 
            shown ++;
            $("#count").html("Total: " + shown);
            // Count for location TPB Trailer
            if(td12 === "TPB Trailer") {
                tpbtrailer ++;
                $("#tpbtrailer").html("Total: " + tpbtrailer);
            } else if (td12 === "TPB Van") {
                tpbvan1 ++;
                $("#tpbvan1").html("Total: " + tpbvan1);
            } else if (td12 === "TPB Van 2") {
                tpbvan2 ++;
                $("#tpbvan2").html("Total: " + tpbvan2);
            } else if (td12 === "TPB Van 3") {
                tpbvan3 ++;
                $("#tpbvan3").html("Total: " + tpbvan3);
            } else if (td12 === "TPB Van 4") {
                tpbvan4 ++;
                $("#tpbvan4").html("Total: " + tpbvan4);
            }
        }
    }

    // fetch current waitlist from db
    fetch("/waitlist/displaywaitlist")
    .then(response => {
        return response.json();
    })
    .then(data => {
        const waitlist = data;
        buildWaitlistTable(waitlist);

    });
});
