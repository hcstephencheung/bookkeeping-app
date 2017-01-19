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
    LedgerComponent: function(containerEl, tableData) {
        // clear for new data
        containerEl.innerHTML= '';

        tableData.forEach(function(rowData) {
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
    ListComponent: function(containerEl, listData) {
        // clear for new data
        containerEl.innerHTML= '';

        var listEl = document.createElement('ul');
        listEl.classList.add('c-list');

        listData.forEach(function(listItemData) {
            var listItemEl = document.createElement('div'); // wrapper div
            listItemEl.innerHTML =
                '<li class="c-list__item">' +
                listItemData.Company +
                '</li>';

            listEl.appendChild(listItemEl.firstChild);
        });

        containerEl.appendChild(listEl);

        return containerEl;
    }
};

var Component = function(templateName, destinationContainer, data) {
    var containerEl = document.getElementById(destinationContainer);

    if (!containerEl) {
        console.error('LedgerComponent Error: Container id incorrect', destinationContainer);
        return;
    }

    if (!data) {
        console.warn('LedgerComponent Warning: Data is ', data);
        return;
    }

    return ComponentsMap[templateName](containerEl, data);
};

function ComponentFactory() {};
ComponentFactory.prototype.createComponent = function(component) {
    return new Component(component.template, component.container, component.data);
};
