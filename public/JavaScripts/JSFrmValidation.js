//THis part of the code is a part of frm validation function. Taken from Internet directly...
    (()=> {
    'use strict'

    bsCustomFileInput.init();  //This handles the forms uplaod texts displayed in client side.

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
        }

        form.classList.add('was-validated')
    }, false)
    })
    })()