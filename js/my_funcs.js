function copyToClipboard(elemId, toolTip) {
	// alert(toolTip)
// alert(elemId)   Get the text field 
  // var copyText = document.getElementById('pre_code1');

  // /* Select the text field */
  // copyText.select();

  // /* Copy the text inside the text field */
  // document.execCommand("copy");




  const copyText = document.getElementById(elemId).textContent;
  const textArea = document.createElement('textarea');
  textArea.textContent = copyText;
  document.body.append(textArea);
  textArea.select();
  document.execCommand("copy");

  var tooltip = document.getElementById(toolTip);
  tooltip.innerHTML = "Copied";
  /* Alert the copied text */
  alert("Copied the text");
}


function outFunc(toolTip) {
  var tooltip = document.getElementById(toolTip);
  tooltip.innerHTML = "Copy to clipboard";
}