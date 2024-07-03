import mysql from "mysql2"


export const bd = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "rootroot",
    database: "projectBodyLine"
});

bd.connect(err => {
    if (err) {
        console.error("Database connection error: ", err);
    } else {
        console.log("Connected to the database");
    }
});