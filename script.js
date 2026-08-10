let cart = [];
let total = 0;


// ================= GET STARTED =================

function showLogin() {

    document.getElementById("welcomePage").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";

}


// ================= LOGIN =================

function login() {

    let username = document.getElementById("user").value.trim();
    let password = document.getElementById("pass").value.trim();

    if (username === "" || password === "") {

        alert("Please Enter Username and Password");
        return;

    }

    document.getElementById("loginPage").style.display = "none";
    document.getElementById("homePage").style.display = "block";

}


// ================= ADD TO CART =================

function addCart(name, price) {

    cart.push({
        name: name,
        price: price
    });

    total = total + price;

    document.getElementById("count").textContent = cart.length;
    document.getElementById("total").textContent = total;

    let li = document.createElement("li");

    li.textContent = name + " - ₹" + price;

    document.getElementById("cartItems").appendChild(li);

    alert(name + " added to cart 🛒");

}


// ================= PLACE ORDER + HASURA =================

function placeOrder() {

    if (cart.length === 0) {

        alert("Cart is Empty 🛒");
        return;

    }

    let username = document.getElementById("user").value.trim();

    let productNames = cart
        .map(function(item) {
            return item.name;
        })
        .join(", ");


    const query = `
        mutation PlaceOrder(
            $customer_name: String!,
            $product_name: String!,
            $price: Int!
        ) {

            insert_orders_one(
                object: {
                    customer_name: $customer_name,
                    product_name: $product_name,
                    price: $price
                }
            ) {

                id
                customer_name
                product_name
                price

            }
        }
    `;


    fetch("https://pretty-lobster-75.hasura.app/v1/graphql", {

        method: "POST",

        headers: {
            "Content-Type": "application/json",

            "x-hasura-admin-secret": "6zm9BoEf9HVzz5Uen5UXYa5wGsJBhoBtGcmdO0XZgglguGv5ER5AsLsbj4wfXsjV"
        },

        body: JSON.stringify({

            query: query,

            variables: {

                customer_name: username,

                product_name: productNames,

                price: total

            }

        })

    })


    .then(function(response) {

        return response.json();

    })


    .then(function(data) {

        console.log("HASURA RESPONSE:", data);


        // DATABASE ERROR

        if (data.errors) {

            alert(
                "Database Error ❌\n\n" +
                data.errors[0].message
            );

            return;

        }


        // DATABASE SUCCESS

        alert("🎉 Order saved in Hasura Database!");


        document.getElementById("homePage").style.display = "none";

        document.getElementById("successPage").style.display = "flex";


        // CLEAR CART

        cart = [];

        total = 0;

        document.getElementById("cartItems").innerHTML = "";

        document.getElementById("count").textContent = "0";

        document.getElementById("total").textContent = "0";

    })


    .catch(function(error) {

        console.error("Hasura Error:", error);

        alert("Database Connection Error ❌");

    });

}