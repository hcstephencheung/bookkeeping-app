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

// Singleton for Data (we only need to fetch data once)
//
var TransactionsSingleton = (function() {
    var instance;
    var data = {
        transactions: []
    };
    var totalCount;
    var TRANSACTIONS_ENDPOINT;
    var TRANSACTIONS_PAGE_COUNT = 1;
    var ROWS_PER_PAGE = 10;
    var ENDPOINT_DATA_TYPE = '.json';
    var reqsNeeded = 0;

    // checks if ajax-ed data is finished
    var _isDataStreamFinished = function() {
        // could also emit event for "loading"
        return TRANSACTIONS_PAGE_COUNT > reqsNeeded;
    };

    var _updateMetadata = function() {
        reqsNeeded = Math.round(totalCount / ROWS_PER_PAGE);
        TRANSACTIONS_PAGE_COUNT++;
    };

    var _updateData = function(ajaxData) {
        var fetchedData = JSON.parse(ajaxData);

        if (!fetchedData) {
            return;
        }

        if (!fetchedData.transactions) {
            return;
        }

        // update our data
        data.transactions = data.transactions.concat(fetchedData.transactions);
        totalCount = fetchedData.totalCount;

        _updateMetadata();

        // recursive call to get more data
        if (!_isDataStreamFinished()) {
            _getTransactionsFromEndpoint(TRANSACTIONS_ENDPOINT);
        }
    };

    // initial instance to get transactions
    var _getTransactionsFromEndpoint = function(endpoint) {
        var pageCount = TRANSACTIONS_PAGE_COUNT;
        var url = endpoint + pageCount + ENDPOINT_DATA_TYPE;

        DataBridge.get(url, _updateData);
    };

    var getTransactions = function() {
        return data.transactions;
    };

    var init = function(endpoint) {
        // set url for endpoint for subsequent reqs
        TRANSACTIONS_ENDPOINT = endpoint;
        // initial data fetch
        _getTransactionsFromEndpoint(TRANSACTIONS_ENDPOINT);

        // Transactions API
        return {
            getTransactions: getTransactions
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
DataBridge.init();
var transactionsInstance = TransactionsSingleton.create(ENDPOINT);

// refactor this to listen for an event?
setTimeout(function() {
    console.log('=== Transactions ===', transactionsInstance.getTransactions());
}, 2000);
