
// function to get parmas form url ( free or premium )

function GetURLParameter(sParam) {  //general method
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');  //& is common in url, return a array
  for (var i = 0; i < sURLVariables.length; i++)
  {
    var sParameterName = sURLVariables[i].split('=');  //looking for "=", and split the array
    if (sParameterName[0] == sParam) //before "=", return 0
    {
      return sParameterName[1]; //after "=", return 1
    }
  }
};

$(document).ready(function() {

  var show_error, stripeResponseHandler, submitHandler;

// function to handle the submit of the form and intercept the default event

  submitHandler = function (event) {
    var $form = $(event.target); //what has triggered this form?
    $form.find("input[type=submit]").prop("disabled", true); //prop=property, this action makes sure "signup"(submit) button wont get clicked multiple times

    //if stripe was inititalized correctly, this will create a token using credit card info

    if(Stripe){  //correct
      Stripe.card.createToken($form, stripeResponseHandler); //from stripe documentation
    } else {  //incorrect
      show_error("Fail to load credit card processing functionality. Please reload this page")
    }

    return false; //prevent the default action from happening
  };


// initiate submit handler listener for any form with class cc-form

  $(".cc_form").on('submit', submitHandler);

// function to handle the event of plan drop down changing

  var handlePlanChange = function(plan_type, form) { //form=.cc-form class
    var $form = $(form);

    if(plan_type == undefined) {
      plan_type = $('#tenant_plan :selected').val(); //if undefined, plan = selected tenant plan's value
    }

    if(plan_type === 'premium') {
      $('[data-stripe]').prop('required', true);
      $form.off('submit'); //remaove the default event handler attached to the method
      $form.on('submit', submitHandler); //call submithandler (payment)
      $('[data-stripe]').show();
    } else {
      $('[data-stripe]').hide(); //no need for stripe data for non-premium
      $form.off('submit');
      $('[data-stripe]').removeProp('required'); //remaove the requirement for having stripe-date
    }
  }

// set up plan change event listener #tenant_plan id in the forms for class cc_form

  $("#tenant_plan").on('change', function(event) {
    handlePlanChange($('#tenant_plan :selected').val(), ".cc_form");
  });

// call plan change handler so that the plan is et corredctly in the drop down when the page loads

  handlePlanChange(GetURLParameter('plan'), ".cc_form"); //find out the type of the plan, and the cc_form class

// function to handle the the token received from stripe, then remove the credit card fields

  stripeResponseHandler = function (status, response) {
    var token, $form; //get the token and form(cc_form)

    $form = $('.cc_form');
    //if we get the error
    if (response.error) {
      console.log(response.error.message); //log the error message
      show_error(response.error.message); //show error message
      $form.find("input[type=submit]").prop("disabled", false); //we set if false before(signup button), so we have to enable it again
    } else { //if correct
      token = response.id; //find the token
      $form.append($("<input type=\"hidden\" name=\"payment[token]\" />").val(token)); //from stripe documentation
      $("[data-stripe=number]").remove(); //remove the information from credit card
      $("[data-stripe=cvv]").remove();
      $("[data-stripe=exp-year]").remove();
      $("[data-stripe=exp-month]").remove();
      $("[data-stripe=label]").remove();
      $form.get(0).submit(); //submit the form
    }

    return false; //stop the default event
  };

  // function to show errors when stripe functionality return errors

  //create show error message

  show_error = function (message) {
    if($("#flash-messages").size() < 1){
    $('div.container.main div:first').prepend("<div id='flash-messages'></div>")
    }
    $("#flash-messages").html('<div class="alert alert-warning"><a class="close" data-dismiss="alert">×</a><div id="flash_alert">' + message + '</div></div>');
    $('.alert').delay(5000).fadeOut(3000);
    return false;
  };
});
