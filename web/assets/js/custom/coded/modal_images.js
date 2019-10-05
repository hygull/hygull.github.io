function addEventListenerToSpanCloseElement(modal) {
	// Get the <span> element that closes the modal
	var spans = document.getElementsByClassName("close");

	for(let span of spans) {
		// When the user clicks on <span> (x), close the modal
		span.onclick = function() { 
		  modal.style.display = "none";
		}
	}
}

function getModalConfigs({
	imageClass="hygull-img-cls",
	modalClass="hygull-modal-cls"
} = {}) {
	/*
		[
		    {
		        "modalId": "hygull-modal-01",
		        "imageId": "hygull-img-01",
		        "modalImageId": "hygull-modal-img-01",
		        "modalCaptionId": "hygull-caption-01"
		    }
		]
	*/
	modalConfigs = new Array()
	let images = $('.' + imageClass)
	let modals = $('.' + modalClass)

	// Logging
	console.log(images)
	console.log(modals)

	images.each(function(index) {
		let modalConfig = new Object()
		let modal = $(modals[index]) // $(<div>...</div>)
		modalConfig.modalId = modal.attr('id')

		modalConfig.imageId = $(this).attr("id")
		modal.find("img,div").each(function(index) {
			/*
			    <div id="hygull-modal-01" class="modal hygull-modal-cls">
			        <span class="close">&times;</span>
			        <img class="modal-content" id="hygull-modal-img-01">
			        <div id="hygull-caption-01"></div>
			    </div>
			*/

			let elem = $(this)
			let elemId = elem.attr('id')

			if(elem.is("div")) {
				modalConfig.modalCaptionId = elemId
			} else if(elem.is("img")) {
				modalConfig.modalImageId = elemId
			}
		})


		modalConfigs.push(modalConfig)
	})


	return modalConfigs
}

$(document).ready(function() { // $(function() {
	let classes = {
		imageClass: "hygull-img-cls",
		modalClass: "hygull-modal-cls"
	}

	let modalConfigs = getModalConfigs(classes)

	// Logging
	console.log('Modal Configurations', modalConfigs)
	updateImagesAndModalsInDOM(modalConfigs)
})


