// Book Keeping app
var ENDPOINT = 'http://resttest.bench.co/transactions/';

// === Utils.js ===
// ---
// Initialized with an endpoint URL, could be used for any endpoint with row entries
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
// ---
// === Utils.js ===

// === Transactions.js ===
// Singleton for Data (we only need to fetch data once)
// getTransactions : retuns all transactions
var TransactionsSingleton = (function() {
    var instance;
    var data = {
        transactions: [],
        balance: 0
    };
    var view = {
        head: null,
        body: null,
        container: null
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

    var _updateBalance = function() {
        if (!data.transactions) {
            return;
        }

        data.transactions.forEach(function(entry) {
            var increment = parseFloat(entry.Amount);

            if (typeof increment === 'number') {
                data.balance += increment;
            }
        });
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
        } else {
            _updateBalance();
        }
    };

    // initial instance to get transactions
    var _getTransactionsFromEndpoint = function(endpoint) {
        var pageCount = TRANSACTIONS_PAGE_COUNT;
        var url = endpoint + pageCount + ENDPOINT_DATA_TYPE;

        DataBridge.get(url, _updateData);
    };

    var setContainer = function(DOMNode) {
        view.container = DOMNode;
    };

    var setBody = function(DOMNode) {
        view.body = DOMNode;
    };

    var getTransactions = function() {
        return data.transactions;
    };

    var getBalance = function() {
        return data.balance;
    };

    var getView = function() {
        return view;
    }

    var showView = function() {
        if (!view.container || !view.body) {
            console.error('Transactions.showView : body or container not set', view);
        }

        view.container.classList.remove('c--loading');
    };

    var init = function(endpoint) {
        // set url for endpoint for subsequent reqs
        TRANSACTIONS_ENDPOINT = endpoint;
        // initial data fetch
        _getTransactionsFromEndpoint(TRANSACTIONS_ENDPOINT);

        // Transactions API
        return {
            // getters
            getTransactions: getTransactions,
            getBalance: getBalance,
            getView: getView,

            // setters
            setContainer: setContainer,
            setBody: setBody,

            // misc
            showView: showView
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
// ---
// === Transactions.js ===

// === Events.js ===
// ---

// 

// List of Components
// === ComponentFactory.js ===
// ---
var Components = {
    LedgerComponent: function(destinationContainer, data) {
        var containerEl = document.getElementById(destinationContainer);

        if (!containerEl) {
            console.error('LedgerComponent Error: Container id incorrect', destinationContainer);
            return;
        }

        if (!data) {
            console.warn('LedgerComponent Warning: Data is ', data);
            return
        }

        // clear for new data
        containerEl.innerHTML= '';

        data.forEach(function(rowData) {
            var rowEl = document.createElement('tbody');
            rowEl.innerHTML =
                '<tr class="c-ledger__row">' +
                '<td>' + rowData.Amount + '</td>' +
                '<td>' + rowData.Company + '</td>' +
                '<td>' + rowData.Date + '</td>' +
                '<td>' + rowData.Ledger + '</td>' +
                '</tr>';

            // TODO: maybe not return firstChild, will need more cases to refactor
            containerEl.appendChild(rowEl.firstChild);
        });

        return containerEl;
    }
};

function ComponentFactory() {};
ComponentFactory.prototype.createComponent = function(component) {
    return new Components[component.template](component.container, component.data);
};

// ---
// === ComponentFactory.js ===

// RunnerJS
DataBridge.init();
// Transactions init
var transactionsInstance = TransactionsSingleton.create(ENDPOINT);
transactionsInstance.setContainer(document.getElementById('js-transactions'));
// Component init
var componentFactory = new ComponentFactory();

setTimeout(function() {
    console.log('=== Transactions ===', transactionsInstance.getTransactions());

    transactionsInstance.setBody(componentFactory.createComponent({
        template: 'LedgerComponent',
        container: 'js-transactions__ledger-table-body',
        data: transactionsInstance.getTransactions()
    }));

    transactionsInstance.showView();
}, 2000);
