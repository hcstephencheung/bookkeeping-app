/*
* Component Factory
* Creates new view components where the template is specified in a Components object
* TODO: Needs Refactoring on component creation
* ===
* API
* ===
* ComponentFactory.create(options) : DOMNode of component
* where options is object { template: 'nameOfComponent', container: 'idOfWrapper', data: dataOfComponent }
*/
var ComponentsMap = {
    // Table Component
    // ---
    TableComponent: function(containerEl, tableData) {
        // clear for new data
        containerEl.innerHTML= '';

        var tableEl = document.createElement('div');

        tableEl.innerHTML =
            '<table class="c-ledger">' +
            '<thead id="' + tableData.theadId + '" class="c-ledger__head">' +
            '<tr class="c-ledger__row">' +
            '<th> Date </th>' +
            '<th> Company </th>' +
            '<th> Account </th>' +
            '<th id="' + tableData.balanceId + '"> Balance </th>' +
            '</tr>' +
            '</thead>' +
            '<tbody id="' + tableData.tbodyId + '" class="c-ledger__body c--loading">' +
            '<tr class="c-ledger__row">' +
            '<td colspan="4" class="c-ledger__column"> Loading... </td>' +
            '</tr>' +
            '</tbody>' +
            '</table>';

        containerEl.appendChild(tableEl.firstChild);

        return containerEl;
    },
    // Ledger Component
    // ---
    LedgerComponent: function(containerEl, ledgerData) {
        // clear for new data
        containerEl.innerHTML= '';

        ledgerData.forEach(function(rowData) {
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
    },
    // List Component
    // ---
    ListComponent: function(containerEl, listData) {
        var listEl = document.createElement('ul');
        listEl.classList.add('c-list');

        listData.forEach(function(listItemData) {
            if (listItemData === undefined) {
                return;
            }

            var listItemEl = document.createElement('div'); // wrapper div
            listItemEl.innerHTML =
                '<li id="' + listItemData.id + '"' + 'class="c-list__item">' +
                '<p>' + listItemData.content +
                '<span class="c-list__note c--' + (listItemData.balance > 0 ? 'green' : 'red') + '">' +
                (listItemData.balance ? listItemData.balance : '') + '</span>' +
                '</p>' +
                '</li>';

            listEl.appendChild(listItemEl.firstChild);
        });

        containerEl.appendChild(listEl);

        return containerEl;
    }
};

function Component(templateName, destinationContainer, data) {
    var containerEl = document.getElementById(destinationContainer);
    var component = this;

    if (!containerEl) {
        console.error('LedgerComponent Error: Container id incorrect', destinationContainer);
        return;
    }

    if (!data) {
        console.warn('LedgerComponent Warning: Data is ', data);
        return;
    }

    component.el = ComponentsMap[templateName](containerEl, data);
    console.log('=== ' + templateName + ' has loaded ===');

    return component;
};

Component.prototype.done = function(postRenderCb) {
    var component = this;
    if (!component.el) {
        console.error('Component creation failed');
        return false;
    }

    if (typeof postRenderCb === 'function') {
        postRenderCb(component.el);
    }

    return component.el;
};

function ComponentFactory() {};
ComponentFactory.prototype.createComponent = function(component) {
    return new Component(component.template, component.container, component.data);
};
