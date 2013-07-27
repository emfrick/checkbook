$(function(){
   
    // quick jquery test
    $('#jQueryStatus').html('jQuery Loaded');
    
    //////////
    // Models
    //////////
    
    // Model for a single transaction
    var Transaction = Backbone.Model.extend({
        defaults: {
            date: new Date().toJSON().slice(0,10),
            description: 'None',
            category: 0,
            amount: 0.00,
            event: 'None'
        },
        
        idAttribute: "_id"
    });
    
    /////////
    // Views
    /////////
    
    // View for a single transaction
    var TransactionView = Backbone.View.extend({
        tagName:"div",
        className:"transactionContainer",
        template:$("#transactionTemplate").html(),

        render:function () {
            var tmpl = _.template(this.template); //tmpl is a function that takes a JSON object and returns html

            this.$el.html(tmpl(this.model.toJSON())); //this.el is what we defined in tagName. use $el to get access to jQuery html() function
            return this;
        }
    });
    
    // View for all transactions
    var AppView = Backbone.View.extend({
        el: $('#transactions'),
        
        initialize: function() {
            // Anything using 'this' keyword needs to be bound here
            _.bindAll(this, 'render', 'renderSingleTransaction');
            
            // Create a new collection for this AppView
            this.collection = new CheckBook();
            var self = this;
            this.collection.fetch({
                success: function() {
                    //alert(JSON.stringify(self.collection.models));
                    self.render();
                },
                error: function() {
                    alert("Uh oh, something went wrong!");
                } 
            });
            
            // Listen for an 'add' and 'reset' events to this collection
            this.collection.on('add',   this.renderSingleTransaction, this);
            this.collection.on('reset', this.render, this);
        },
                
        render: function() {
            // Save the current 'this' as 'self', so we can call the $el.append
            // within the UnderscoreJS function
            var self = this;
            var total = 0.00;
            
            /////////////////////////////
            // This isn't working yet!! 
            /////////////////////////////
                        
            // Underscore call to iterate over each model in the collection
            // and append it to the the #transactions ID.
            _.each(this.collection.models, function(item) {
                //self.renderSingleTransaction(item);
                total = (+total) + (+item.get('amount'));
                console.log(total);
            }, this);
            
            $('#total').html('Total Spent This Month: $' + total);
            // Allows for chaining
            
            ///////////////////////////////////////
            // End of the part that isn't working
            ///////////////////////////////////////
            
            // Allows for chanining
            return this;
        },
                
        renderSingleTransaction: function(item) {
            var view = new TransactionView({ model: item });
            this.$el.append(view.render().el);
            
            return this;
        }
    });
    
    ///////////////
    // Collections
    ///////////////
    
    // Holds all the transactions
    var CheckBook = Backbone.Collection.extend({
        model: Transaction,
        url: '/api/transactions'
    });
    
    /////////////////
    // Instantiation
    /////////////////
    new AppView();

});
