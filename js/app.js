// Book Keeping app
var ENDPOINT = 'http://resttest.bench.co/transactions/';
// Track load times just for fun
var APP_START_TIME = new Date();

// RunnerJS
DataBridge.init();
// Component init
var componentFactory = new ComponentFactory();
// Transactions init
var transactionsInstance = TransactionsSingleton.create(ENDPOINT);

Events.addEventListener('bk-transactions-loaded', function() {
    transactionsInstance.buildComponent(componentFactory, 'js-transactions');
    transactionsInstance.buildLedgerListView(componentFactory, 'js-category-list');
    transactionsInstance.buildDateListView(componentFactory, 'js-date-list');

    console.log('=== Loaded in ' + (new Date() - APP_START_TIME) + ' ms ===');
});

