# Bookkeeping Challenge

First off, apologies for spending a bit too much time on this assignment. Through the process I learned a lot in terms of code organization and design, so hopefully you guys will enjoy what I made.

# Structure
## HTML
index.html : simple markup here. `c-` classes are for styling, `js-` classes are for JS bindings.

## JS
- app.js : main Runner of the application. I've added load times just for funsies. They're logged in console.debug.
- Transactions.js : main "Controller" for this app. Includes logic for: 
    - data manipulation for views
    - builds view components into DOM
    - exposes some methods that are called in app.js (mostly the build functions)

/lib
- ComponentFactory.js : creates templates. A good place to look at the components' markup (Refer to `ComponentsMap`). I also included a `.done()` function to build nested components (used in nested lists) and for the load times.
- DataBridge.js : Ajax wrapper. Nothing exciting here. Only supports `GET`
- Events.js : PubSub controller, mainy used for Transactions.js when all transactions are loaded.
- Utils.js : does all the UI dirty work like ensure $ sign is after the - when a number is negative, "humanize" dates...

## CSS
app.css : 1 giant CSS, I've broken components by comments. Hopefully the `c-` classes is also indicative enough to self-explain its purpose. I thought the styling was small enough to have just 1 file. I left comments in the file to indicate where I would've broken the module styles if needed.

This thing looks nice on mobile too! Win!

# Additional Features:
You can search all the implementations of the features by searching '[ADF]' in the code.

1. I defined garbage strings as any "word" that contains special characters. Specifically this is the regex I used `/([^\w\s\.\,][^\s]*\s{1})/ig` (matches any non-AZ/09 characters followed by any number of characters until a space)
2. I built a hash map to remove/store duplicates. I always knew Yellow Cabs are shady, but Ninja Star World!?
3-4. Self explanatory in the UI. Dec 17th is the TSN turning point!

# JS Patterns used
I referred to a lot of patterns from [Addy Osmani](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript). Here's a list of what I applied:
- Module Pattern: used everywhere, Utils, DataBridge, Transactions
- Factory Pattern: used to create view components
- PubSub: used for events to handle when data load is finished
- Singleton Pattern: used in Transactions because I want to ensure 1 source of truth for transactions. Idea behind it is if other controllers need transactions, they can be ensured of a single truth. We all want to be sane, right?

# Styles.txt
- I went to the bench.co site to get my assets and match the colors/fonts to the main site. The styles I "borrowed" are noted in `style.txt`

# Sources
`String.prototype.hashCode` : thank you [ManWe](http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/)
