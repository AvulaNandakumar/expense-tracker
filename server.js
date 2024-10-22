const path = require("path");
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "data.db");
let db = null;
const app = express();
app.use(express.json());

// initializing DB and Server method
const initializingDBAndServer = async () => {
    try {

        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => console.log("server is running"));
    }
    catch (e) {
        console.log(e.message);
    }

}

//calling initializing method
initializingDBAndServer();


//post route
app.post("/transactions", async (req, res) => {

    const { type, category, amount, date, description } = req.body;
    const transactions_query = `INSERT INTO transactions(type,category,amount,date,description) 
                        VALUES("${type}","${category}",${amount},"${date}","${description}")`;

    const category_query = `INSERT INTO category(name,type) 
                        VALUES("${category}","${type}")`;


    console.log();
    try {
        if (typeof (type) !== "string" || typeof (category) !== "string" || typeof (description) !== "string" || typeof (amount) !== "number" || type.length === 0 || amount.length === 0 || category.length === 0) {
            throw new Error("enter valid input");
            return;
        }
        else {
            const transactions_query_result = await db.run(transactions_query);
            const category_query_result = await db.run(category_query);
            res.send("sucessfully created");
        }
    }
    catch (e) {
        res.send("enter valid data");
        return;
    }

});

//get all route
app.get("/transactions", async (req, res) => {
    const query = `SELECT * FROM transactions`;
    const result = await db.all(query);
    res.send(result);
});

//get by id route
app.get("/transactions/:Id/", async (req, res) => {
    const { Id } = req.params;
    const query = `SELECT * FROM transactions WHERE id=${Id}`;
    const result = await db.all(query);
    res.send(result);
});

//update route
app.put("/transactions/:Id/", async (req, res) => {
    const { Id } = req.params;
    const { type, category, amount, date, description } = req.body;
    const query = `UPDATE transactions SET
                        type="${type}",
                        category="${category}",
                        amount=${amount},
                        date="${date}",
                        description="${description}"
                        WHERE id=${Id}`;
    const result = await db.all(query);
    res.send("sucessfully updated");
});

//delete route
app.delete("/transactions/:Id/", async (req, res) => {
    const { Id } = req.params;
    const query = `DELETE FROM transactions WHERE id=${Id}`;
    const result = await db.all(query);
    res.send("sucessfully deleted");
});

//summary route
app.get("/summary/", async (req, res) => {
    const total_income_query = `SELECT SUM(amount) AS total_income FROM transactions WHERE type LIKE "income"`;
    const total_expenses_query = `SELECT SUM(amount) AS total_expenses FROM transactions WHERE type LIKE "expense"`;
    const [income_res] = await db.all(total_income_query);
    const [expenses_res] = await db.all(total_expenses_query);
    const { total_income } = income_res;
    const { total_expenses } = expenses_res;
    const balance = total_income - total_expenses;
    res.send(`{
        total_income:${total_income},
        total_expenses:${total_expenses},
        balance:${balance}}`);
});    