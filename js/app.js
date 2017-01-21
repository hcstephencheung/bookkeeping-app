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
    console.debug('=== Transactions data loaded in ' + (new Date() - APP_START_TIME) + ' ms ===');
    transactionsInstance.buildComponent(componentFactory, 'js-transactions');
    transactionsInstance.buildExpensesListView(componentFactory, 'js-expenses-list').done(function() {
        console.debug('=== Expenses list loaded in ' + (new Date() - APP_START_TIME) + ' ms ===');
    });
    transactionsInstance.buildDateListView(componentFactory, 'js-date-list').done(function() {
        console.debug('=== Daily balances list loaded in ' + (new Date() - APP_START_TIME) + ' ms ===');
    });
});

