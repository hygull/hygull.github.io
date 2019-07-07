var loginIcons = [
	'https://img.icons8.com/bubbles/344/brunette-girl-phone-call.png',
	'https://img.icons8.com/bubbles/344/accept-or-decline-man-call.png',
	'https://img.icons8.com/bubbles/2x/end-call-male.png',
	'https://img.icons8.com/clouds/344/phone.png',
	'https://image.flaticon.com/icons/png/512/1891/1891028.png'
]

var registerIcons = [
	'https://image.flaticon.com/icons/png/512/1891/1891028.png',
	'https://img.icons8.com/dusk/344/sms-token.png',
	
]

function getIcons(type, count=5) {
	if(type=='login') {
		return loginIcons
	} else if(type == 'register') {
		return registerIcons
	}

	return []
}


function changeIcons(id, type, secs=4000) {
	let icons = getIcons(type)
	let i = 0
	console.log(icons)


	console.log('Setting ', icons[i])
		
	if(icons.length) {
		setInterval(function() {
			// $('#login-img').attr('src', icons[i]).show('slow') 

			// (1st)
			// $('#login-img').attr('src', icons[i])

			// (2nd) https://stackoverflow.com/questions/2744579/jquery-animate-on-an-image-replacement
			let image = $(id)
			image.fadeOut('slow', function () {
	        	image.attr('src', icons[i])
	        	image.fadeIn('slow');

				console.log('ICON ', icons[i], ' set')

	    	});

			if(i == icons.length -1) {
				i = 0
			} else {
				i++
			}
		
		}, secs)
	}
}