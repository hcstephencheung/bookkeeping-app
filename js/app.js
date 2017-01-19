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
    console.log('=== Loaded in ' + (new Date() - APP_START_TIME) + ' ms ===');

    transactionsInstance.buildComponent(componentFactory, 'js-transactions');

    // componentFactory.createComponent({
    //     template: 'ListComponent',
    //     container: 'js-category-list',
    //     data: transactionsInstance.getTransactions()
    // });
});
