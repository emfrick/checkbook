$(function() {
    
    var date = new Date();
    var year = date.getYear();
    
    var months = {
        "01" : "January",
        "02" : "February",
        "03" : "March",
        "04" : "April",
        "05" : "May",
        "06" : "June",
        "07" : "July",
        "08" : "August",
        "09" : "September",
        "10" : "October",
        "11" : "November",
        "12" : "December"
        
    };
    
    //var storageloc = new Backbone.LocalStorage("checkbookapp");
    
    ///////////////
    // Collections
    ///////////////
    var Transactions = Backbone.Collection.extend({
        //localStorage: storageloc
        
        url: '/api/transactions'
    });
    
    var Categories = Backbone.Collection.extend({
        url: '/api/categories'
    });
    
    //////////
    // Models
    //////////
    var Transaction = Backbone.Model.extend({
        //localStorage: storageloc
        urlRoot: "/api/transactions/id"
    });
    
    /////////
    // Views
    /////////
    var TransactionList = Backbone.View.extend({
        
        // Which element (in this case class) in the html page do we want to render in
        el: '.page',
        
        render: function(options) {
            // Create a new "Transactions" collection
            var transactions = new Transactions();

            if (options.year && options.month) {
                transactions.url = '/api/transactions/' + options.year + '/' + options.month;
            }
            
            var month = options.month;
            $('#page-header').html(months[month]);
            
            // Take the "element" defined by "el" and update its html
            var self = this;
            transactions.fetch({
                success: function(transactions) {
                    console.log(transactions.models);
                    var total = 0.00;
                    _.each(transactions.models, function(t) {
                        total += t.get('amount');
                    });
                    var template = _.template($('#transaction-list-template').html(), { transactions: transactions.models, total: total });
                    self.$el.html(template);
                },
                error: function() {
                    self.$el.html("ERROR: Could not fetch transaction!");
                }
            });
        }
    });
    
    var EditTransaction = Backbone.View.extend({
        
        // Which element (in this case class) in the html page do we want to render in
        el: '.page',
        
        render: function(options) {
            var self = this;
            $('#page-header').html('Details');
            console.log("EditTransaction ID - " + options.id);
            if(options.id) {
                // GET request
                this.transaction = new Transaction({ id: options.id });
                
                self.transaction.fetch({ // GET /transactions/:id
                    success : function(transaction) {
                        transaction.set("date", transaction.get("date").substring(0,10));
                        console.log(transaction.get("date"));
                        var tAmount = transaction.get('amount');
                        var tType = (tAmount < 0) ? "debit" : "credit";
                        var template = _.template($('#edit-list-template').html(), { transaction : transaction, type : tType });
                        self.$el.html(template);
                    },
                    error : function(err) {
                        console.log("ERROR: Could not fetch transaction!" + err);
                    }
                });
                
            }
            else {
                // Since we don't need to do a fetch, just render the template
                // Template now doesn't need an object as the second argument, because we have no data
                var template = _.template($('#edit-list-template').html(), { transaction : null });
                this.$el.html(template);
            }
        },
                
        events :{
            'submit .edit-transaction-form' : 'saveTransaction',
            'click .delete' : 'deleteTransaction',
            'focus #amount' : 'clearInput'
        },
        
        // An 'event' gets passed to this function on the submit action,
        // which can then call 'currentTarget', effectively returning the form
        saveTransaction : function(evt) {
            var transactionDetails = $(evt.currentTarget).serializeObject();
            console.log(transactionDetails);
            
            var transaction = new Transaction();
            console.log("== SAVING ==");
            console.log(transaction.get("date"));
            console.log(transactionDetails.date);
            console.log("==  DONE  ==");
            transaction.save(transactionDetails, {
                success: function() {
                    router.navigate('', { trigger: true });
                },
                        
                error: function() {
                    console.log("ERROR: Could not save transaction!");
                }
            });
            
            // Return false to stop the browser from refreshing
            return false;
        },
        
        deleteTransaction : function(evt) {
            this.transaction.destroy({
                success: function() {
                    router.navigate('', { trigger : true });
                },
                error: function() {
                    console.log("ERROR: Could not destroy transaction!");
                }
            });
            return false;
        },

        clearInput: function(evt) {
            if (evt.target.value == '$0.00') {
                evt.target.value = '';
            }
        }
    });



    //////////
    // Routes
    //////////
    var Router = Backbone.Router.extend({
        
        // Define all your pages and the corresponding actions here
        routes: {
            '': 'home',
            'new' : 'editTransaction',
            'edit/:id' : 'editTransaction',
            ':year/:month' : 'viewMonth',
            ':page' : 'globalalert' // Fallthrough to log any requests we get that don't have a page defined
        }
    });

    //////////////////
    // Instantiations
    //////////////////
    var transactionList = new TransactionList();
    var editList = new EditTransaction();
    var router   = new Router();


    /////////////
    // Listeners
    /////////////

    // Whenever we hit 'home' (aka '/')
    router.on('route:home', function() {
        console.log("Loaded the homepage");

        var d = new Date();
        var month = d.getMonth() + 1;
        if (month < 10) {
            var month = "0" + month;
        }
        
        // Call the render function of the TransactionList's instantiated object
        transactionList.render({ month : month });
    });
    
    router.on('route:editTransaction', function(id) {
        console.log("Loaded Edit Transaction Page for ID - " + id);

        editList.render({ id : id });
    });

    router.on('route:viewMonth', function(year, month) {
        console.log("Loading specific month: " + month + "/" + year);

        transactionList.render({ year: year, month : month });
    });
    
    // Log every page hit
    router.on('route:globalalert', function(page) {
        console.log("Loaded page: " + page);
    });

    // Start Backbone listening to the URL
    Backbone.history.start();
    
    
    
    /////////////
    // Resources
    /////////////
    
    // This resource will take any jQuery Form Object
    // and convert the entire thing into a JSON object
    // Found at:
    // https://github.com/thomasdavis/backbonetutorials/tree/gh-pages/videos/beginner
    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

});
