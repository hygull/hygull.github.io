<!--
function showElements(){
	document.getElementById("div_list_group").style.display="block";
	document.getElementById("a_show").style.display="none";
}

function hideElements(){
	document.getElementById("div_list_group").style.display="none";
	document.getElementById("a_show").style.display="block";
}

function info() {
	showElements();
	document.getElementById('span_resolution').innerHTML= "Resolution : "+screen.width+"x"+screen.height;
	document.getElementById('span_host').innerHTML="Host : "+location.hostname;
	document.getElementById('span_protocol').innerHTML="Protocol : "+location.protocol;
}

//-->

/* if => none in place of "none" then ===>
Uncaught ReferenceError: block is not defined
    at showElements (index.js:11)
    at HTMLButtonElement.onclick (index.html:25)
showElements @ index.js:11
onclick @ index.html:25
*/