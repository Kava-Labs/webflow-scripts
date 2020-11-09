# WebFlow Scripts

Webflow Scripts houses the kava labs scripts which populate data our to our webflow sites. These scripts need to be updated from time to time when want to add new or tweak existing metrics on the various webflow pages.

Each page in webflow has its own script. Scripts are named based on the page they support.
**IMPORTANT:** Webflow scripts must remain under 10,000 characters. You will need to use a minifier if the length of the file is too long.

## Update a project


 - Find the project's webflow file in this repo.
 - Make changes to the file and run the functions locally so you can confirm they work. You can also use a tool like [Playcode.io](https://playcode.io/)
 - Update the webflow page.
	 - Log into webflow
	 - Click the app you are updating
	 - In the upper left, click on the 'Pages' link
	 - Find your page, and click on the 'Settings' gear
	 - Paste your minified (or under 10,000 character code between the <script> tags
	 - Update the UI elements to use new script

Notes: 

 - Some elements on the page are tied to the script via `CSS id` others
   are tied to the script via `CSS classes`.
   
 - If you copy a webflow item, it will clone the classes. Now when you edit the classes, it will edit them for the copied element as well. It is best to duplicate a class, and then change the name of it if you need similar styling, but a new class name.
