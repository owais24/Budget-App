// BUDGET CONTROLLER 
var budgetcontroller = (function () {

    var Expense = function (id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calPercentage = function (totalincome) {
        if (totalincome > 0) {
            this.percentage = Math.round((this.value / totalincome)) * 100;

        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    var Income = function (id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {

        var sum = 0;
        data.allItems[type].forEach(function (cur) {

            sum += cur.value;
        });

        data.totals[type] = sum;
    };

    var data = {

        allItems: {
            exp: [],
            inc: []
        },

        totals: {

            exp: [],
            inc: []
        },

        budget: 0,
        percentage: -1 // we keep -1 for non-exsistent things

    };

    return {
        addItem: function (type, des, val) {

            var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {

                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            } else {

                ID = 0;
            }


            // create new item based on 'inc or 'exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push in to the data structure
            data.allItems[type].push(newItem);

            // Return new element
            return newItem;
        },


        deleteItem: function (type, id) {
            var ids, index;

            // id =6 
            //data.allItems[type][id];
            // ids= [1 2 4 8]
            //index =3
            ids = data.allItems[type].map(function (current) {
                return current.id;

            });

            index = ids.indexOf(id);

            if (index !== -1) {

                data.allItems[type].splice(index, 1);
            }



        },


        calculatebudget: function () {

            // calculate the total income and expenses

            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget :income - expenses

            data.budget = data.totals.inc - data.totals.exp;



            //calculate the percentage of what income we spend
            // example for below code expense = 100 and income 200 then, spent=50% =100/200=0.5 * 100 we use () because of precdence prpoerry which it would get higher presicdence

            if (data.totals.inc > 0) {

                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

            } else {
                data.percentage = -1;
            }


        },

        calculatePercentages: function () {

            /* 
            a=20
            b=10
            c=40
            income=100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%

            */
            data.allItems.exp.forEach(function (cur) {
                cur.calPercentage(data.totals.inc);
            });

        },

        getPercentages: function () {

            var allPerc = data.allItems.exp.map(function (cur) {

                return cur.getPercentage();


            });

            return allPerc;





        },

        getBudget: function () {

            return {


                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage

            };



        },

    };




})();



// UI CONTROLLER
var uicontroller = (function () {

    var DOMstrings = {

        inputtype: '.add__type',
        inputdescription: '.add__description',
        inputvalue: '.add__value',
        inputbtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',

    };


    var formatNumber = function (num, type) {

        var numSplit, int, dec;
        /* 
        + or - before number
        exactly 2 decimal points
        comma seperating the thousands

        2310.4567 -> +2,310.46
        2000 -> + 2,000.00
        */
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            // input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + '' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {

        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }

    };

    return {

        getinput: function () {


            return {
                type: document.querySelector(DOMstrings.inputtype).value,  //either income or expenses
                description: document.querySelector(DOMstrings.inputdescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputvalue).value),


            };

        },

        addListItem: function (obj, type) {
            var html, newhtml, element;
            //create a html string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }

            else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }
            // replace the placeholder text with some actual data

            newhtml = html.replace('%id%', obj.id);
            newhtml = newhtml.replace('%description%', obj.description);
            newhtml = newhtml.replace('%value%', formatNumber(obj.value, type));

            // insert the html in to the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
        },


        deleteListItem: function (selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {

            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputdescription + ',' + DOMstrings.inputvalue);

            fieldsArr = Array.prototype.slice.call(fields); // this is an list which is created by quereyselector to loop into we nedd an array so this list is converted into an array by (Array.protoype.slice.call(listnmae))

            // this for each is an alternatvier forthr for loop this conssits of function 3 arguments can be passed (current=current value, index=index of the array, array =complete total array)
            fieldsArr.forEach(function (current, index, array) {

                current.value = "";

            });

            // this focus method focuses on particular thing and focuses backto which field we are pointing
            fieldsArr[0].focus();

        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalinc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalexp, 'exp');


            if (obj.percentage > 0) {

                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';

            } else {

                document.querySelector(DOMstrings.percentageLabel).textContent = '----';

            }




        },

        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);



            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {

                    current.textContent = percentages[index] + '%';


                } else {
                    current.textContent = '---';
                }


            });

        },


        displayMonth: function () {
            var now, year, month, months
            now = new Date();

            months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER',
                'OCTOBER', ' NOVEMBER', 'DECEMBER'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + '  ' + year;
        },

        changedtype: function () {


            var fields = document.querySelectorAll(DOMstrings.inputtype + ','
                + DOMstrings.inputdescription + ',' + DOMstrings.inputvalue);


            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');

            });

            document.querySelector(DOMstrings.inputbtn).classList.toggle('red');

        },




        getDOMstrings: function () {
            return DOMstrings;
        }
    };



})();



// GLOBAL APP CONTROLLER 
var controller = (function (budgetCtrl, uiCtrl) {


    var setupEventlisteners = function () {

        var DOM = uiCtrl.getDOMstrings();

        document.querySelector(DOM.inputbtn).addEventListener('click', ctrlAdditem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.keyCode === 13) {

                ctrlAdditem();
            }

        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputtype).addEventListener('change', uiCtrl.changedtype);




    };

    var updateBudget = function () {

        //1. CALCULATE THE BUDGET
        budgetcontroller.calculatebudget();

        //2. RETURN THE BUDGET

        var budget = budgetcontroller.getBudget(); // when we are returning something we need to store them in variables


        //3. DISPLAY THE BUDGET ON THE UI
        uiCtrl.displayBudget(budget);



    }

    var updatePercentages = function () {


        //1. calculate percentages
        budgetCtrl.calculatePercentages();

        //2.  read the percenages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. update the ui with new percerntages
        uiCtrl.displayPercentages(percentages);
    }


    var ctrlAdditem = function () {

        var input, newItem;

        //1. GET THE FIELD INPUT DATA

        input = uiCtrl.getinput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. ADD THE ITEM TO THE BUDGET CONTROLLER

            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //3. ADD THE ITEM TO THE UI

            uiCtrl.addListItem(newItem, input.type);

            //4. CLEAR THE INPUT FIELDS

            uiCtrl.clearFields();

            //5. CALCULATE AND UPDATE THE BUDGET
            updateBudget();

            //6. CALCULATE AND UPDATE PERCENTAGES
            updatePercentages();

        }

    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            uiCtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();

        };




    };

    return {

        init: function () {
            console.log('application started');
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({


                budget: 0,
                totalinc: 0,
                totalexp: 0,
                percentage: -1

            }
            );

            setupEventlisteners();
        }
    };




})(budgetcontroller, uicontroller);

controller.init();