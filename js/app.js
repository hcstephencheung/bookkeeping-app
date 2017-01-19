// Book Keeping app
var ENDPOINT = 'http://resttest.bench.co/transactions/';

// Initialized with an endpoint URL, could be used for any endpoint with row entries
// getAllRows : returns all data calculated based on totalCount * ROWS_PER_PAGE

var DataBridge = (function() {
    var xhttp;
    var subscribers = [];

    var _init = function() {
        if (!window.XMLHttpRequest) {
            console.error('DataBridge Error: XMLHttpRequest not supported. Please use a modern browser');
            return false;
        }

        xhttp = new XMLHttpRequest();
    };

    var _get = function(endpoint, subscriber) {
        if (typeof endpoint !== 'string' || endpoint === '') {
            console.error('DataBridge Error: Endpoint URL invalid');
            return false;
        }

        if (typeof subscriber !== 'function') {
            console.error('DataBridge Error: subscriber function was not passed');
            return false;
        }

        // process data
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === XMLHttpRequest.DONE) {
                if (xhttp.status === 200) {
                    subscriber(xhttp.responseText);
                }
            }
        };

        xhttp.open('GET', endpoint);
        xhttp.send();
    }

    return {
        init: _init,
        get: _get
    };
})();

DataBridge.init();

// Singleton for Data (we only need to fetch data once)
//
var TransactionsSingleton = (function() {
    var instance;
    var data = {
        transactions: []
    };
    var totalCount;

    var TRANSACTIONS_PAGE_COUNT = 1;
    var ROWS_PER_PAGE = 10;
    var ENDPOINT_DATA_TYPE = '.json';

    var _updateData = function(ajaxData) {
        var fetchedData = JSON.parse(ajaxData);

        if (!fetchedData) {
            return;
        }

        if (!fetchedData.transactions) {
            return;
        }

        // append our data from the DB
        data.transactions = data.transactions.concat(fetchedData.transactions);
        totalCount = fetchedData.totalCount;
    };

    // checks if ajax-ed data is finished
    var _isFinished = function() {
        return totalCount && (TRANSACTIONS_PAGE_COUNT * ROWS_PER_PAGE > totalCount);
    };

    // initial instance to get transactions
    var _getTransactionsFromEndpoint = function(endpoint) {
        var url = endpoint + TRANSACTIONS_PAGE_COUNT + ENDPOINT_DATA_TYPE;

        DataBridge.get(url, _updateData);
    };

    var _getTransactions = function() {
        return data.transactions;
    };

    var init = function(endpoint) {
        // initial fetch
        _getTransactionsFromEndpoint(endpoint);

        return {
            getTransactions: _getTransactions
        };
    };
    
    return {
        create: function(endpoint) {
            if (!instance) {
                instance = init(endpoint);
            }

            return instance;
        }
    };
})();


// Runner
var transactionsInstance = TransactionsSingleton.create(ENDPOINT);

// refactor this to listen for an event?
setTimeout(function() {
    console.log('=== Transactions ===', transactionsInstance.getTransactions());
}, 2000);
