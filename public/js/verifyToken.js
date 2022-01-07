$(document).ready(() => {
    let verifiedTokenModal = document.getElementById('verified-token-modal');
    $('.modal').modal();
    // URL parser for jQuery
    function GetURLParameter(sParam) {
      const sPageURL = window.location.search.substring(1);
      const sURLVariables = sPageURL.split('&');
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < sURLVariables.length; i++) {
        const sParameterName = sURLVariables[i].split('=');
        // eslint-disable-next-line eqeqeq
        if (sParameterName[0] == sParam) {
          return sParameterName[1];
        }
      }
    }
    // secretToken paste in box
    $('#secretToken').bind('paste', function(e) {
        let secretToken_in = e.originalEvent.clipboardData.getData('Text');
        console.log('secretToken_in:',secretToken_in);
        let secretToken_box = $('#secretTokenbox');
        $('#secretTokenbox').val(secretToken_in);
    })

    //$('#verifyTokenBtn').click((event) => {
    $('#verifyTokenBtn').on( "click", function(event) {    
        event.preventDefault();
        console.log('testing');
        const hbtoken = GetURLParameter('id');
        console.log(GetURLParameter('id'));
        const token = { secretToken: $('#secretToken').val() };
        if (!hbtoken) {
          window.location.href = '/users/signup';
        } else {
          $('#token')
            .empty()
            .html(hbtoken);
          // eslint-disable-next-line no-unused-vars
          $.post('/users/verify', token, (req, res) => {
            console.log('<-------verfy email button clicked-------->');
            // verify modal triggers
            $('#verified-token-modal').modal('toggle');
            verifiedTokenModal.addEventListener('shown.bs.modal', function () {
              $('#confirm-token').click((event) => {
                event.preventDefault();
                window.location.href = '/login';
                return false;
              });
            });
          });
        }
      });
    });
    