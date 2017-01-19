// Book Keeping app
var ENDPOINT = 'http://resttest.bench.co/transactions/';

// RunnerJS
DataBridge.init();
// Transactions init
var transactionsInstance = TransactionsSingleton.create(ENDPOINT);
transactionsInstance.setView('container', document.getElementById('js-transactions'));
transactionsInstance.setView('head', document.getElementById('js-transactions__head'));
transactionsInstance.setView('balance', document.getElementById('js-transactions__balance'));
// Component init
var componentFactory = new ComponentFactory();

var loadedTime = new Date();
Events.addEventListener('bk-transactions-loaded', function() {
    console.log('=== Loaded in ' + (new Date() - loadedTime) + ' ms ===');

    transactionsInstance.setView('body', componentFactory.createComponent({
        template: 'LedgerComponent',
        container: 'js-transactions__ledger-table-body',
        data: transactionsInstance.getTransactions()
    }));

    transactionsInstance.showView();
});
