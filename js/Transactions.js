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
    var hashedTransactions = [];

    // checks if ajax-ed data is finished
    var _isDataStreamFinished = function() {
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
        // [ADF] 2. Remove Duplicates (stored them just for fun)
        data.transactions = data.transactions.concat(_serializeTransactions(fetchedData.transactions));
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

    // [ADF] 2. Remove Duplicates (stored them just for fun)
    var _serializeTransactions = function(transactionsArray) {
        return transactionsArray.filter(function(transaction) {
            var hashString = '';
            var isDuplicate = false;

            for (var heading in transaction) {
                hashString += transaction[heading];
            }

            var hashKey = hashString.hashCode();
            
            if (typeof hashedTransactions[hashKey] === 'undefined') {
                hashedTransactions[hashKey] = [];
                hashedTransactions[hashKey].push(transaction);
            } else {
                hashedTransactions[hashKey].push(transaction);
                isDuplicate = true;
            }

            return !isDuplicate;
        });
    };

    // assumes transaction.Amount
    var _filterExpenses = function(transactionsArray) {
        return transactionsArray.filter(function(transaction) {
            return transaction.Amount < 0;
        });
    };

    // Public Methods
    // ===
    var getTransactions = function() {
        return data.transactions;
    };

    var getTransactionsByCategory = function(categoryName, options) {
        var categoriesWithTransactions = {};
        var categories = [];
        var listItemObj = {
            id: null,
            content: ''
        };
        var filteredTransactions = data.transactions;

        if (typeof options !== 'undefined' && options.showOnlyExpenses) {
            filteredTransactions = filteredTransactions.filter(function(transaction) {
                return transaction.Amount < 0;
            });
        }

        filteredTransactions.map(function(transaction) {
            for (heading in transaction) {
                if (heading !== categoryName) {
                    continue;
                }

                var headingName = transaction[heading] === '' ? 'Unspecified' : transaction[heading];
                var key = ('' + heading + headingName).hashCode();

                if (typeof categoriesWithTransactions[key] === 'undefined') {
                    categoriesWithTransactions[key] = [];
                }

                categoriesWithTransactions[key].push({
                    id: key,
                    categoryName: '' + headingName,
                    amount: parseFloat(transaction.Amount),
                    company: transaction.Company,
                    ledger: transaction.Ledger,
                    date: transaction.Date
                });
            }
        });

        return categoriesWithTransactions;
    };

    var getBalance = function() {
        return data.balance;
    };

    var getView = function() {
        return view;
    };

    var setView = function(part, DOMNode) {
        if (!view.hasOwnProperty(part)) {
            console.error('Transactions.setView : part is not defined', part);
            return;
        }

        view[part] = DOMNode;
    };

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

    // TODO: refactor this out into a Controller.prototype.buildComponent
    var tbodyId = 'js-transactions__ledger-table-body';
    var theadId = 'js-transactions__ledger-table-head';
    var balanceId = 'js-transactions__balance';
    var buildComponent = function(componentFactory, containerID) {
        // build initial table
        var transactionsComponent = componentFactory.createComponent({
            template: 'TableComponent',
            container: containerID,
            data: {tbodyId: tbodyId, theadId: theadId, balanceId: balanceId}
        }).done(function(tableEl) {
            if (!tableEl) {
                console.warn('TransactionsSingleton: Component not created properly');
                return false;
            }

            view.container = tableEl;
            view.body = tableEl.querySelector('#' + tbodyId);
            view.head = tableEl.querySelector('#' + theadId)
            view.balance = tableEl.querySelector('#' + balanceId);
        });

        // Data finished, render table contents
        Events.addEventListener('bk-transactions-loaded', function() {
            var transactionsArray = transactionsInstance.getTransactions();

            // [ADF] 1.
            transactionsArray.map(function(transaction) {
                transaction.Company = Utils.removeGarbageFromTitle(transaction.Company);
                return transaction;
            });

            componentFactory.createComponent({
                template: 'LedgerComponent',
                container: tbodyId,
                data: transactionsInstance.getTransactions()
            });

            showView();
        });
    };

    // [ADF] 3: Categories List
    var buildExpensesListView = function(componentFactory, containerID) {
        var options = {showOnlyExpenses: true};
        var categoriesWithTransactions = getTransactionsByCategory('Ledger', options);
        var categories = [];

        categoriesWithTransactions = categoriesWithTransactions

        for (var heading in categoriesWithTransactions) {
            // build transaction content and title for list
            for (var t = 0; t < categoriesWithTransactions[heading].length; t++) {
                if (t === 0) {
                    categories.push({id: heading, content: categoriesWithTransactions[heading][t].categoryName});
                }

                // text output for our list
                var content = 
                    Utils.serializeDollar(parseFloat(categoriesWithTransactions[heading][t].amount)) +
                    ' : ' +
                    Utils.convertDateToReadable(categoriesWithTransactions[heading][t].date);
                categoriesWithTransactions[heading][t].content = content;
            }
        }

        // Update balance in categories
        categories.forEach(function(category) {
            category.balance = {};
            category.balance.amount = categoriesWithTransactions[category.id].reduce(function(sum, curr) {
                if (typeof sum === 'number') {
                    return sum + curr.amount;
                }

                return sum.amount + curr.amount;
            }, 0);

            // Balance View Logic
            category.balance.amount > 0 ?
                category.balance.modifier = 'green' :
                category.balance.modifier = 'red';

            category.balance.amount = Utils.serializeDollar(category.balance.amount);
        });

        return componentFactory.createComponent({
            template: 'ListComponent',
            container: containerID,
            data: categories
        }).done(function(listEl) {
            var listItems = listEl.querySelectorAll('li');

            listItems.forEach(function(listItemEl) {
                var key = listItemEl.getAttribute('id');

                componentFactory.createComponent({
                    template: 'ListComponent',
                    container: key,
                    data: categoriesWithTransactions[key]
                })
            })
        });
    };

    // [ADF] 4: Daily Balances List
    var buildDateListView = function(componentFactory, containerID) {
        var categoriesWithTransactions = getTransactionsByCategory('Date');
        var categories = [];

        for (var heading in categoriesWithTransactions) {
            // build transaction content and title for list
            for (var t = 0; t < categoriesWithTransactions[heading].length; t++) {
                if (t === 0) {
                    categories.push({
                        id: heading,
                        date: categoriesWithTransactions[heading][t].date,
                        content: categoriesWithTransactions[heading][t].categoryName});
                }

                // text output for our list
                var content = 
                    Utils.serializeDollar(parseFloat(categoriesWithTransactions[heading][t].amount)) + 
                    ' : ' +
                    categoriesWithTransactions[heading][t].ledger;
                categoriesWithTransactions[heading][t].content = content;
            }
        }

        // for:in does not guarantee order, so we should sort
        // our list to ensure our daily balances are correct
        categories.sort(function(date, nextDate) {
            return new Date(date.date) - new Date(nextDate.date);
        });

        var sum = 0;
        // Update balance in categories
        categories.forEach(function(category) {
            category.balance = {};

            sum += categoriesWithTransactions[category.id].reduce(function(curr, next) {
                if (typeof curr === 'number') {
                    return curr + next.amount;
                }

                return curr.amount + next.amount;
            }, 0);

            sum > 0 ?
                category.balance.modifier = 'green' :
                category.balance.modifier = 'red';

            category.balance.amount = Utils.serializeDollar(sum);
        });

        return componentFactory.createComponent({
            template: 'ListComponent',
            container: containerID,
            data: categories.reverse()
        }).done(function(listEl) {
            var listItems = listEl.querySelectorAll('li');

            listItems.forEach(function(listItemEl) {
                var key = listItemEl.getAttribute('id');

                componentFactory.createComponent({
                    template: 'ListComponent',
                    container: key,
                    data: categoriesWithTransactions[key]
                })
            })
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
            getBalance: getBalance,
            getTransactions: getTransactions,
            getTransactionsByCategory: getTransactionsByCategory,
            getView: getView,

            // view builders
            buildComponent: buildComponent,
            buildDateListView: buildDateListView,
            buildExpensesListView: buildExpensesListView,

            // view methods
            showView: showView,

            // setters
            setView: setView
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
