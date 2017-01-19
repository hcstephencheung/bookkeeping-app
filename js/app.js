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
transactionsInstance.setView('container', document.getElementById('js-transactions'));
transactionsInstance.setView('head', document.getElementById('js-transactions__head'));
transactionsInstance.setView('balance', document.getElementById('js-transactions__balance'));

Events.addEventListener('bk-transactions-loaded', function() {
    console.log('=== Loaded in ' + (new Date() - APP_START_TIME) + ' ms ===');

    transactionsInstance.setView('body', componentFactory.createComponent({
        template: 'LedgerComponent',
        container: 'js-transactions__ledger-table-body',
        data: transactionsInstance.getTransactions()
    }));

    transactionsInstance.showView();

    componentFactory.createComponent({
        template: 'ListComponent',
        container: 'js-category-list',
        data: transactionsInstance.getTransactions()
    });
});
