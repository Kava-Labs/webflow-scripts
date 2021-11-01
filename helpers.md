<script type="text/javascript" src="https://cdn.weglot.com/weglot.min.js"></script>
<script>
// init Weglot
Weglot.initialize({
	api_key: 'wg_f391b647f05ec16b062af10bb9b0fe274'
});

// on Weglot init
Weglot.on('initialized', ()=>{
	// get the current active language
  const currentLang = Weglot.getCurrentLang();
  // call updateDropdownLinks function
  updateSW5DropdownLinks(currentLang); 
});

// for each of the .wg-element-wrapper language links
document.querySelectorAll('.wg-element-wrapper.sw5 [lang]').forEach((link)=>{
		// add a click event listener
		link.addEventListener('click', function(e){
    	// prevent default
			e.preventDefault();
      // switch to the current active language      
      Weglot.switchTo(this.getAttribute('lang'));
      // call updateDropdownLinks function
      updateSW5DropdownLinks(this.getAttribute('lang'));
		});
});

// updateDropdownLinks function
function updateSW5DropdownLinks(currentLang){ 
	// get the wrapper element
	const $wrapper = document.querySelector('.wg-element-wrapper.sw5'); 
  // if the .w-dropdown-toggle is not the current active language
 	if($wrapper.querySelector('.w-dropdown-toggle').getAttribute('lang') !== currentLang){
  	// get the current active language link
  	const $activeLangLink = $wrapper.querySelector('[lang='+currentLang+']');
    // swap the dropdown toggle's text with the current active language link text
		const $toggle = $activeLangLink.closest('.wg-element-wrapper').querySelector('.w-dropdown-toggle');
  	const toggleTxt = $toggle.textContent; 
  	const activeLangLinkTxt = $activeLangLink.textContent;
  	$toggle.querySelector('div').textContent = activeLangLinkTxt;
  	$activeLangLink.textContent = toggleTxt;
  	// swap the dropdown toggle's lang attr with the current active language link lang attr  
  	const lang = $activeLangLink.getAttribute('lang');
		const toggleLang = $toggle.getAttribute('lang');
		$toggle.setAttribute('lang', lang);
		$activeLangLink.setAttribute('lang', toggleLang);
  }
}
</script>
<script
	src="https://cdn.jsdelivr.net/gh/Kava-Labs/webflow-scripts@e5f75d20e08e7b75f1f514d5264c448b47a9ba4e/kava-stats.min.js"
>
</script>


<style>
.metric-blur::after {
   content: "";
   display: block;
   width: 100%;
   height: 100%;
   border-radius: 6px;
   background-image: linear-gradient(90deg, rgba(210, 210, 210, 0) 0, rgba(210, 210, 210, .4) 50%, rgba(210, 210, 210, 0) 100%);
   background-size: 80% 100%;
   background-position: -150% 0;
   background-repeat: no-repeat;
   animation: loading 1.5s infinite;
}

@keyframes loading {
  to {
	  background-position: 350% 0;
  }
}

.metric-blur.without-after::after {
  content: none;
}
</style>


/// new 
<script type="text/javascript" src="https://cdn.weglot.com/weglot.min.js"></script>
<script>
// init Weglot
Weglot.initialize({
	api_key: 'wg_f391b647f05ec16b062af10bb9b0fe274'
});

// on Weglot init
Weglot.on('initialized', ()=>{
	// get the current active language
  const currentLang = Weglot.getCurrentLang();
  // call updateDropdownLinks function
  updateSW5DropdownLinks(currentLang); 
});

// for each of the .wg-element-wrapper language links
document.querySelectorAll('.wg-element-wrapper.sw5 [lang]').forEach((link)=>{
		// add a click event listener
		link.addEventListener('click', function(e){
    	// prevent default
			e.preventDefault();
      // switch to the current active language      
      Weglot.switchTo(this.getAttribute('lang'));
      // call updateDropdownLinks function
      updateSW5DropdownLinks(this.getAttribute('lang'));
		});
});

// updateDropdownLinks function
function updateSW5DropdownLinks(currentLang){ 
	// get the wrapper element
	const $wrapper = document.querySelector('.wg-element-wrapper.sw5'); 
  // if the .w-dropdown-toggle is not the current active language
 	if($wrapper.querySelector('.w-dropdown-toggle').getAttribute('lang') !== currentLang){
  	// get the current active language link
  	const $activeLangLink = $wrapper.querySelector('[lang='+currentLang+']');
    // swap the dropdown toggle's text with the current active language link text
		const $toggle = $activeLangLink.closest('.wg-element-wrapper').querySelector('.w-dropdown-toggle');
  	const toggleTxt = $toggle.textContent; 
  	const activeLangLinkTxt = $activeLangLink.textContent;
  	$toggle.querySelector('div').textContent = activeLangLinkTxt;
  	$activeLangLink.textContent = toggleTxt;
  	// swap the dropdown toggle's lang attr with the current active language link lang attr  
  	const lang = $activeLangLink.getAttribute('lang');
		const toggleLang = $toggle.getAttribute('lang');
		$toggle.setAttribute('lang', lang);
		$activeLangLink.setAttribute('lang', toggleLang);
  }
}
</script>
<script
	src="https://cdn.jsdelivr.net/gh/Kava-Labs/webflow-scripts@d3dad429a512531910d956aafd40789c0c978564/kava-stats.min.js"
>
</script>


<style>
.metric-blur::after {
   content: "";
   display: block;
   width: 100%;
   height: 100%;
   border-radius: 6px;
   background-image: linear-gradient(90deg, rgba(210, 210, 210, 0) 0, rgba(210, 210, 210, .4) 50%, rgba(210, 210, 210, 0) 100%);
   background-size: 80% 100%;
   background-position: -150% 0;
   background-repeat: no-repeat;
   animation: loading 1.5s infinite;
}

@keyframes loading {
  to {
	  background-position: 350% 0;
  }
}

.metric-blur.without-after::after {
  content: none;
}
</style>

