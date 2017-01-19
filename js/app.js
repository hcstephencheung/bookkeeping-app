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

var Utils = (function() {
    var serializeDollar = function(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            console.warn('Utils.serializeDollar : amount is not a number', amount);
            return;
        }

        return (amount > 0) ? '$' + amount : '-$' + Math.abs(amount);
    };

    var convertDateToReadable = function(YYYYMMDD) {
        if (!YYYYMMDD) {
            console.warn('Utils.convertDateToReadable : input date is undefined', YYYYMMDD);
            return;
        }

        if (!/\d{4}\-\d{2}\-\d{2}/.test(YYYYMMDD)) {
            console.warn('Utils.convertDateToReadable : input date format is incorrect, please follow YYYY-MM-DD', YYYYMMDD);
            return;
        }

        var months = ['boom', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var suffix = [undefined, 'st', 'nd', 'rd'];
        var delim = '-';
        var convertedDate = {};

        YYYYMMDD.split('-').map(function(ymd, idx) {
            var ymdNum = parseInt(ymd);
            var ymdString = '' + ymd; // ensured string, for suffix logic

            switch (idx) {
                case 0:
                    convertedDate.year = ymdNum;
                    break;
                case 1:
                    convertedDate.month = months[ymdNum]; // 0-indexing
                    break;
                case 2:
                    convertedDate.day = ymdNum;

                    // English is weird...
                    if (ymdString.match(/1\d/)) {
                        convertedDate.suffix = 'th'
                        break;
                    }

                    var lastDigit = (ymdString.match(/\d$/) || [0])[0];

                    convertedDate.suffix = !!suffix[lastDigit] ?
                                            suffix[lastDigit] :
                                            'th';
                    break;
                default:
                    return;
            }
        });

        return convertedDate.month + ' ' + convertedDate.day + convertedDate.suffix + ', ' + convertedDate.year;
    };

    return {
        serializeDollar: serializeDollar,
        convertDateToReadable: convertDateToReadable
    };
})();

var Events = (function() {
    var subscribedEvents = {};

    return {
        addEventListener: function(event, subscriber) {
            if (!subscribedEvents.hasOwnProperty(event)) {
                subscribedEvents[event] = [];
            }

            subscribedEvents[event].push(subscriber);
        },
        fireEvent: function(event, data) {
            if (subscribedEvents.hasOwnProperty(event)) {
                for(var subbed = 0; subbed < subscribedEvents[event].length; subbed++) {
                    try {
                        subscribedEvents[event][subbed].call(null, data);
                    } catch (e) {
                        console.error('Events error: ', e);
                    }
                }
            }
        }
    }
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
// ---
// === Transactions.js ===

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
                '<td>' + Utils.convertDateToReadable(rowData.Date) + '</td>' +
                '<td class="c-ledger__bold">' + rowData.Company + '</td>' +
                '<td>' + rowData.Ledger + '</td>' +
                '<td>' + Utils.serializeDollar(parseFloat(rowData.Amount)) + '</td>' +
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
