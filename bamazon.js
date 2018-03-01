var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "",
    database: "bamazon"
    });

  connection.connect(function(err) {
    if (err) throw err;
    bamazon();
  });

  function bamazon(){

    displayInv();
  }

  function displayInv(){

    var sqlStr = 'SELECT * FROM products';
    

    connection.query(sqlStr , function(err,data){
        if(err) throw err;

        console.log("This is the current inventory.");
        console.log("--------------------------\n");
        for( var i = 0 ; i<data.length ; i++){
        var invTable = cTable.getTable([
            {
                id : JSON.stringify(data[i].item_id),
                name : JSON.stringify(data[i].product_name),
                department : JSON.stringify(data[i].department_name),
                price : JSON.stringify(data[i].price),
                stock : JSON.stringify(data[i].stock_quantity)
            }
        ])
        console.log(invTable); 
        }
        console.log("-------------------\n");

        promptPurchase();
    })
 }

function promptPurchase(){

    inquirer.prompt([
        {
			type: 'input',
			name: 'item_id',
			message: 'What would you like to buy? Please enter the item ID.',
			validate: function (value){
                if(isNaN(value)){
                    return "Please enter a valid input."
                }else{
                    if(Math.sign(value) === 1){
                        return true;
                    }else{
                        return "Please enter a positive integer."
                    }
                }
            }
		},{
			type: 'input',
			name: 'quantity',
			message: 'Quantity?',
			validate: function (value){
                if(isNaN(value)){
                    return "Please enter a valid input."
                }else{
                    if(Math.sign(value) === 1){
                        return true;
                    }else{
                        return "Please enter a positive integer."
                    }
                }
            }
		}
    ]).then(function(input){

        var item = input.item_id;
		var quantity = input.quantity;
		var queryStr = 'SELECT * FROM products WHERE ?';

		connection.query(queryStr, {item_id: item}, function(err, data) {
			if (err) throw err;
			if (data.length === 0) {
				console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
				displayInventory();

			} else {
                var productData = data[0];
                
				//Check the stock
				if (quantity <= productData.stock_quantity) {
					console.log("You're lucky, its in stock. Placing order.");

					// Construct the updating query string
					var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;

					// Update the inventory
					connection.query(updateQueryStr, function(err, data) {
						if (err) throw err;

						console.log('Order Placed. Your total is $' + productData.price * quantity);
						
                        
                        inquirer.prompt([
                            {
                                name: "reOrder",
                                type: "confirm",
                                message: "Would you like to buy anything else?",
                                default: false
                            }
                        ]).then(function(reOrderResponse){
                                if(reOrderResponse.reOrder){
                                    displayInv();
                                }else{
                                    
                                    console.log("\n---------------------------------------------------------------------\n");
                                    console.log("Goodbye! Comeback again");
                                    console.log('Thank you for shopping with us!');
                                    console.log("\n---------------------------------------------------------------------\n");

                                    //End connection.
                                    connection.end();
                                }
                            })
					})
				} else {
					console.log('Sorry, there is not enough product in stock, your order can not be placed as is.');
					console.log('Please modify your order.');
					console.log("\n---------------------------------------------------------------------\n");

					displayInv();
				}
			}
		})
	})
}
 

    

