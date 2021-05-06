# WebFlow Scripts

Webflow Scripts houses the kava labs scripts which populate data our to our webflow sites. These scripts need to be updated from time to time when want to add new or tweak existing metrics on the various webflow pages.

Each page in webflow has its own script. Scripts are named based on the page they support.
**IMPORTANT:** Webflow scripts must remain under 10,000 characters. You will need to use a minifier if the length of the file is too long or host the files and reference them in the webflow script. We currently use:  https://www.jsdelivr.com/ and reference the files

## Updating the webflow page.
- Find the project's webflow file in this repo.
- Make changes to the file and run the functions locally so you can confirm they work. You can also use a tool like [Playcode.io](https://playcode.io/)
- Updating the script(s) on webflow
   1. Log into webflow
   2. Click the app you are updating
   3. In the upper left, click on the 'Pages' link
   4. Find your page, and click on the 'Settings' gear
   5. Navigate to the Custom Code section and look for the <script> tag
   6. Check against Staging
      - Replace the src with your commit hash you would like deployed name link:
         - https://cdn.jsdelivr.net/gh/Kava-Labs/webflow-scripts@YOUR_COMMIT_HASH_HERE/FILE_NAME_OF_PAGE.min.js
         - Example: https://cdn.jsdelivr.net/gh/Kava-Labs/webflow-scripts@908asn349-8gh34/hard-protocol-home.min.js
      - Click Save
      - Repeat this process for each page you intend to update
      - Once all page scripts are updated, close pages window and click the 'Publish' dropdown in the upper right hand corner of the page
      - Uncheck 'www.kava.io' as we do not want to publish to production and verify 'kava-staging' is checked
      - Click 'Publish to Selected Domains'
      - You can now view the changes out at the staging url, viewable by clicking the link icon in the staging dropwdown row
   7. Publish to Production
      - Go through PR review process and get your PR approved and merged into master
      - Repeat steps 1 through 6, but instead of using your branch commit hash, use the new master commit hash. Remember to do this for each page you've updated and publish to staging first to verify scripts are still working
         - https://cdn.jsdelivr.net/gh/Kava-Labs/webflow-scripts@NEW_MASTER_COMMIT_HASH/FILE_NAME_OF_PAGE.min.js
         - Example: https://cdn.jsdelivr.net/gh/Kava-Labs/webflow-scripts@12nr02f8c4nt90/hard-protocol-home.min.js
      - If all scripts are working as expected:
         - Verify with design team that we are okay to publish to production. Design team can have changes out in webflow at the same time and we may not want to publish them yet.
         - If design has given approval:
             - Click the 'Publish' dropdown in the upper right hand corner of the page, check both staging and production boxes
             - Click 'Publish to Selected Domains'
             - Verify your changes are working in production

## Old way to make updates
 - Find the project's webflow file in this repo.
 - Make changes to the file and run the functions locally so you can confirm they work. You can also use a tool like [Playcode.io](https://playcode.io/)
 - Update the webflow page.
   - Log into webflow
   - Click the app you are updating
   - In the upper left, click on the 'Pages' link
   - Find your page, and click on the 'Settings' gear
   - Paste your [minified](https://dotmaui.com/jsminify/) (or under 10,000 character code between the <script> tags
   - Update the UI elements to use new script

## Notes:
 - Some elements on the page are tied to the script via `CSS id` others are tied to the script via `CSS classes`.
 - If you copy a webflow item, it will clone the classes. Now when you edit the classes, it will edit them for the copied element as well. It is best to duplicate a class, and then change the name of it if you need similar styling, but a new class name.
