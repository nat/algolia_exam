### CSE Test - Place2Eat
[Algolia exam POC (proof of concept) source code](https://github.com/nat/algolia_with_react) site of Nathaniel Wharton.

[working demo](https://nat.github.io/algolia_with_react/) (subject to key expiration)

# Introduction
Previously, I created a version of this application based on JQuery and Hogan templates. In response to helpful feedback, I removed these dependencies and rewrote the app teaching myself/using React, ES6 Modules, using more-modular SASS, and Webpack. I also improved/simplifyied the UX. 

As always is the case, there are many things I could improve with more time, but I hope you enjoy the project as it is!

# Instructions for Installation of CSE Test - Place2Eat

## Install Dependencies
* node.js (version 7.1.0 was used for development)
* ruby (version 2.3.0 was used for development)(only needed if you want to implement this POC in your own Algolia index)

## Download
* Clone the git repository (using e.g: `git clone https://github.com/nat/algolia_with_react.git`) to your local machine.
* Run `npm install` to download the dependencies (from the project root)
* Or run `npm run watch`

# If you want to install from scratch in your own environment do the following:

## Index Algolia
* Open your terminal to the root of the project and execute `ruby combine_and_export_as_json.rb`.
* The program will generate a new file, `export_for_algolia.json` in the root of the project.
* import `export_for_algolia.json` to a new algolia index using Algolia's web interface.

## Configure Algolia
* Name the new index `poc_restaurants` (for the proof of concept restaurants listing)
* Under the index tab, click on "ranking" and set "Searchable Attributes" to `name, food_type, neighborhood, area, city`.
* Set "Custom Ranking Attributes" to `name`, and `stars_count`.
* Under the index tab, click on "Display" and set "Attributes for Faceting" to `foot_type` and `stars_count`.

## Configure Your HTML
* edit the `assets/js/CustomSettings.js` file and set `ALGOLIA_SETTINGS.APPLICATION_ID`
	and `ALGOLIA_SETTINGS.SEARCH_ONLY_API_KEY` to Algolia's settings.

## Start Node
* Run `npm install` to download the dependencies
* Then run `npm run server` to create a server, and automatically refresh the page every time on of the `*.scss`, `*.less`, `*.html` files get updated.
* Or run `npm run watch` if you only want to run the server

## Type!
When visiting http://localhost:3000 in your browser
* Enter 'a' or anything in the search bar - and you'll start seeing results.
If you have any questions, do not hesitate to contact me!

## Original Specification (for reference) (Source: Algolia):

Our sales team has recently been contacted by a large restaurant reservation website, for who it as identified as strategic to build a demo. As an Engineer, you're asked to build a small prototype that, using the dataset and UI they have provided us, highlights the benefits of a great search experience.

* Push the provided dataset to an Algolia index
* Produce the HTML markup and CSS needed to reproduce the UI provided by the client. To do so, you can write with vanilla CSS or a processor of your choice. We've provided configs for Sass and LESS.
* Using the Algolia JS Helper ([documentation](https://www.algolia.com/doc/guides/search/instant-search/algoliahelperjs)), implement an as-you-type search experience that enables users to easily find restaurants: both by passing a search query and/or filtering on the "type of cuisine".

![image](https://github.com/nat/algolia_with_react/blob/master/resources/mockups/regular-version.png)
*Screenshot of the demo once completed*

**Important Notes**

* Graphical resources, including the Sketch mockup, are provided in the `./resources` folder
* The dataset given by the client is available in the `./resources/dataset` folder. They have been able to extract 5000 restaurants from their database: `restaurants_list.json`. Unfortunately, because of some system complexity on their side, they haven't been able to provide everything in one file only. They sent us another file called `restaurants_info.csv` that contains additional information for all the extracted restaurants.
	* You'll need to manipulate both data files in order to have access to the "type of cuisine".
* The project is already all setup for you, if you're using Sass, LESS you shouldn't have to configure anything
	* Run `npm install` to download the dependencies
	* Then run `npm run dev` to create a server, and automatically refresh the page every time on of the `*.scss`, `*.less`, `*.html` files get updated.
	* Or run `npm run server` if you only want to run the server
* Feel free to use any front-end tooling with which you're the most confortable.
* The blue highlight in the sidebar is an active / over state.

# Evaluation criteria:
The goal of this test is to evaluate your ability to build a front-end implementation using Algolia.

**Criterion**

* Overall look'n'feel of the demo: relevance, UI & UX
* Quality of the code: legibility and re-usability
* Attention given to details

# Deliverable:
Once you're happy with what you've done 

* Create a Github public repository to host the code *(including the import script if you have one)*
* Publish it using GitHub's gh-pages so we can interact with it

**Note:** 
The provided dataset has been created using https://github.com/sosedoff/opentable project.
