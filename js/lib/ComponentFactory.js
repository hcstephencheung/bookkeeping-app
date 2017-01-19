/*
* Component Factory
* Creates new view components where the template is specified in a Components object
* ===
* API
* ===
* ComponentFactory.create(options) : DOMNode of component
* where options is object { template: 'nameOfComponent', container: 'idOfWrapper', data: dataOfComponent }
*/
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
