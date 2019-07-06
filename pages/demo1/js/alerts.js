function sweetAlertSuccess(title, text, obj = {stay:false, url: null}) {
	let url = obj.url
	let stay = obj.stay

	swal({
		icon: "success",
		title,
		text,
		buttons: true
	})
	.then((stay) => {
		if(stay !== true) {
			if(url)
				location.href = url
		} 
	})
}