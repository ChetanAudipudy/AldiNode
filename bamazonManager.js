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
        manager();
      });

      function manager(){

        // displayInv();

        inquirer.prompt([
            {
                name: 'managerOption',
                type: 'list',
                choices: ["View products for sale." , "View low inventory.", "Add to inventory.", "Add new product."],
                message: "Hello manager, what would you like to do?"
            }  
        ]).then(function(choice){

            // console.log(choice);

            switch(choice.managerOption){
                
                case "View products for sale.":
                displayInv();
                break;

                case "View low inventory.":
                return lowInv();

                case "Add to inventory.":
                return addToInv();

                case "Add new product.":
                return addNewProduct();

            }
            
        })
      }

      function displayInv(){

        var sqlStr = 'SELECT * FROM products';
        
        var tableArr = [];
        var innerDataArr = [];
    
        connection.query(sqlStr , function(err,data){
            if(err) throw err;
            innerDataArr = [];
    
            console.log("This is the current inventory.");
            console.log("--------------------------\n");
            for (var i = 0; i < data.length; i++) {
                innerDataArr = [];
                innerDataArr = [[data[i].item_id],[data[i].product_name],[data[i].department_name],[data[i].price],[data[i].stock_quantity]];
    
                tableArr.push(innerDataArr);
            }
            console.table(['Item ID', 'Name', 'Department', 'Price', 'Quantity'], tableArr);
            console.log("-------------------\n");
            manager();
        })
     }

     function lowInv(){
         
        var tableArr = [];
        var innerDataArr = [];

        connection.query( "SELECT * FROM products WHERE stock_quantity < 30" , function(err,data){
            if(err) throw err;
            innerDataArr = [];
    
            console.log("Items with low Stock in the inventory.");
            console.log("Please re-stock these items asap.")
            console.log("--------------------------\n");
            for (var i = 0; i < data.length; i++) {
                innerDataArr = [];
                innerDataArr = [[data[i].item_id],[data[i].product_name],[data[i].department_name],[data[i].price],[data[i].stock_quantity]];
    
                tableArr.push(innerDataArr);
            }
            console.table(['Item ID', 'Name', 'Department', 'Price', 'Quantity'], tableArr);
            console.log("-------------------\n");
            manager();
        })
     }

     function addToInv(){

        inquirer.prompt([
		{
			name: "chooseItem",
            message: "Please select the id of the item you would like to add quantity to.",
            validate: numValidate
		}, {
			name: "quantityIncrease",
            message: "How much?",
            validate: numValidate
		}
	]).then(function(response){
		connection.query("SELECT * FROM products WHERE item_id = ?", [response.chooseItem], function(err, res){

			var quantity = Number(response.quantityIncrease);
			var total = quantity + res[0].stock_quantity;

			connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [total, res[0].item_id], 
					function(err, res){
						if (err) throw err;
                        console.log("Stock updated.");
                        console.log("---------------------\n");
					});
			displayInv();

		});
	});
}

     function addNewProduct(){

        inquirer.prompt([
            {
                type: 'input',
                name: 'product_name',
                message: 'Please enter the new product name.',
            },
            {
                type: 'input',
                name: 'department_name',
                message: 'Which department does the new product belong to?',
            },
            {
                type: 'input',
                name: 'price',
                message: 'What is the price per unit?',
                validate: numValidate
            },
            {
                type: 'input',
                name: 'stock_quantity',
                message: 'How many items are in stock?',
                validate: numValidate
            }
        ]).then(function(input){

            connection.query('INSERT INTO products SET ?', input, function (error, results, fields) {
                if (error) throw error;
    
                console.log('New product has been added to the inventory.');
                console.log("\n---------------------------------------------------------------------\n");

            });

            displayInv();
        })

        }


     function numValidate(value){
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