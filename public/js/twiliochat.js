$(document).ready(function() {
    $('#input_text').keypress(function(event){
        if(event.keyCode == 13)
        {
            $(this).val("");
            event.preventDefault();
        }
    });
});
