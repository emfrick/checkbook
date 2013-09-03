$(function() {
    
    // If using localStorage, uncomment this
    //var storageloc = new Backbone.LocalStorage("checkbookapp");
    
    ///////////////
    // Collections
    ///////////////
    var Transactions = Backbone.Collection.extend({
        //localStorage: storageloc
        
        url: '/api/transactions'
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
        
        render: function() {
            // Create a new "Transactions" collection
            var transactions = new Transactions();
            
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
            console.log("EditTransaction ID - " + options.id);
            if(options.id) {
                // GET request
                this.transaction = new Transaction({ id: options.id });
                
                self.transaction.fetch({ // GET /transactions/:id
                    success : function(transaction) {
                        transaction.set("date", transaction.get("date").substring(0,10));
                        console.log(transaction.get("date"));
                        var template = _.template($('#edit-list-template').html(), { transaction : transaction });
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
            'click .delete' : 'deleteTransaction'
        },
        
        // An 'event' gets passed to this function on the submit action,
        // which can then call 'currentTarget', effectively returning the form
        saveTransaction : function(evt) {
            var transactionDetails = $(evt.currentTarget).serializeObject();
            console.log(transactionDetails);
            
            var transaction = new Transaction();
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
        
        // Call the render function of the TransactionList's instantiated object
        transactionList.render();
    });
    
    router.on('route:editTransaction', function(id) {
        console.log("Loaded Edit Transaction Page for ID - " + id);

        editList.render({ id : id });
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
