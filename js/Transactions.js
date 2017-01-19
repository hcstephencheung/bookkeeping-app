/* 
* Transactions.js
* Transactions Controller that gets all transactions on load
* Singleton to ensure one source of truth for data
* ===
* API
* ===
* getTransactions : retuns all transactions
* getBalance : returns total balance as a float
* getView : returns view object, where view is composed of DOM Elements
* setView : binds DOM Elements to view object
* showView : clears all loading states in view object
*
* create(url) : Singleton is created with a data endpoint
*/
var TransactionsSingleton = (function() {
    var instance;
    var data = {
        transactions: [],
        balance: 0
    };
    var view = {
        head: null,
        body: null,
        container: null,
        balance: null
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

        if (view.balance) {
            view.balance.innerHTML = Utils.serializeDollar(data.balance);
        }
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

            Events.fireEvent('bk-transactions-loaded');
        }
    };

    // initial instance to get transactions
    var _getTransactionsFromEndpoint = function(endpoint) {
        var pageCount = TRANSACTIONS_PAGE_COUNT;
        var url = endpoint + pageCount + ENDPOINT_DATA_TYPE;

        DataBridge.get(url, _updateData);
    };


    // Public Methods
    // ===

    var setView = function(part, DOMNode) {
        if (!view.hasOwnProperty(part)) {
            console.error('Transactions.setView : part is not defined', part);
            return;
        }

        view[part] = DOMNode;
    }

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
        for (var part in view) {
            if (view.hasOwnProperty(part)) {
                if (view[part] === null) {
                    console.warn('Transactions.showView : body or container not set', view);
                    return;
                }

                view[part].classList.remove('c--loading');
            }
        }
    };

    // TODO: refactor this out into Controller.prototype.buildComponent
    var tbodyId = 'js-transactions__ledger-table-body';
    var buildComponent = function(componentFactory, containerID) {
        var transactionsComponent = componentFactory.createComponent({
            template: 'TableComponent',
            container: containerID,
            data: {tbodyId: tbodyId}
        });

        Events.addEventListener('bk-transactions-loaded', function() {
            componentFactory.createComponent({
                template: 'LedgerComponent',
                container: tbodyId,
                data: transactionsInstance.getTransactions()
            });

            showView();
        });
    };
    // ===

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
            buildComponent: buildComponent,
            setView: setView,

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