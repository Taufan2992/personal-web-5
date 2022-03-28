const emailReceiver = 'Miko@gmail.com'

function submitform() {
    let name = document.getElementById('input-name').value
    let email = document.getElementById('input-email').value
    let number = document.getElementById('input-number').value
    let subject = document.getElementById('select-subject').value
    let message = document.getElementById('input-message').value
    

    if (name == '') {
        alert('Nama kamu harus diisi')
    }
    if (email == '') {
        alert('email kamu harus diisi')
    }
    if (number == '') {
        alert('Nomor kamu harus diisi')
    }
    if (subject == '') {
        alert('Subject kamu harus diisi')
    }
    if (message == '') {
        alert('Pesan kamu harus diisi')
    }
    
    console.log(name)
    console.log(email)
    console.log(number)
    console.log(subject)
    console.log(message)

    let a = document.createElement('a')
    a.href = `mailto:${emailReceiver}?subject=${subject}&body=Helllo my name ${name},${message}`
    a.click()
}

 