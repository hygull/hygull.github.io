function login(event) {
	event.preventDefault()
	// Write logic, API call etc.

	sweetAlertSuccess('Login successfull', 'Click OK/Cancel to visit your accounts/home page')
}


function changeIcons(secs=3000) {
	let icons = getIcons(type='login', count=5)
	let i = 0
	console.log(icons)


	console.log('Setting ', icons[i])
		
	setInterval(function() {
		// $('#login-img').attr('src', icons[i]).show('slow') 

		// (1st)
		// $('#login-img').attr('src', icons[i])

		// (2nd) https://stackoverflow.com/questions/2744579/jquery-animate-on-an-image-replacement
		let image = $('#login-img')
		image.fadeOut('slow', function () {
        	image.attr('src', icons[i])
        	image.fadeIn('slow');
    	});

		if(i == icons.length -1) {
			i = 0
		} 
		

		i++
		console.log('ICON ', icons[i], ' set')
	}, secs)
}

changeIcons()