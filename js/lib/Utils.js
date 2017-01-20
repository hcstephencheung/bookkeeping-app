/*
* Utils
* Generic Utility module to do UI tasks
* ===
* API
* ===
* serializeDollar(float) : properly outputs amount as a string with $ 
                           (also precedes with - if negative amount)
*
* convertDateToReadable(string) : converts YYYY-MM-DD to Jan 1st, 2017
*/

var Utils = (function() {
    var serializeDollar = function(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            console.warn('Utils.serializeDollar : amount is not a number', amount);
            return;
        }

        return (amount > 0) ? '$' + amount.toFixed(2) : '-$' + Math.abs(amount).toFixed(2);
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
// Hash function to create hash keys for categories
// Courtesy of http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
// ---
(function() {
    String.prototype.hashCode = function() {
        var hash = 0, i, chr, len;
        if (this.length === 0) return hash;
        for (i = 0, len = this.length; i < len; i++) {
            chr   = this.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };
})();
