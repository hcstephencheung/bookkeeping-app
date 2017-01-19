# Bookkeeping Challenge

# JS Patterns used
- Module Pattern: used everywhere, Utils, DataBridge, TransactionsController
- Factory Pattern: used to create view components
- PubSub: used for events to handle when data load is finished
- Singleton Pattern: used in Transactions because I want to ensure transactions data only gets fetched once, and then on the FE there is 1 source of truth

# Markup Conventions
- `c-` : BEM model, semantically marks what a component is
- `js-` : Anything that JS needs for binding

# Styles.txt
- I went to the bench.co site to get my assets and match the colors/fonts to the main site. The styles I "borrowed" are noted in `style.txt`
