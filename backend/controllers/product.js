import { bd } from "../bd.js"
import util from "util"


export const addProduct = async (req, res) => {
  try {
    const { title, price, currency, unitNumber, description, typeMachine, nameMuscle } = req.body;
    const picture = req.file ? req.file.buffer : null;

    if (!title || !price || !currency || !unitNumber || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const queryProductPost = "INSERT INTO product (`title`, `price`, `currency`, `unitNumber`, `description`) VALUES (?, ?, ?, ?, ?)";
    const values = [title, price, currency, unitNumber, description];

    bd.query(queryProductPost, values, async (err, result) => {
      if (err) {
        console.error(err, " : Database error");
        return res.status(500).json({ error: "Database error" });
      }

      const productID = result.insertId;
      const productID_type = result.insertId;
      const productID_muscle = result.insertId;


      if (picture) {
        const queryPicture = "INSERT INTO pictureProduct (`productID`, `picture`) VALUES (?, ?)";
         bd.query(queryPicture, [productID, picture], (err) => {
          if (err) {
            console.error(err, " : Error inserting image data");
            return res.status(500).json({ error: "Error inserting image data" });
          }
        });
      }

      
        const queryTypeMachine = "INSERT INTO productByCategorie (`productID_type`, `typeMachine`) VALUES (?, ?)";
        bd.query(queryTypeMachine, [productID_type, typeMachine], (err) => {
          if (err) {
            console.error(err, " : Error inserting typeMachine data");
            return res.status(500).json({ error: "Error inserting typeMachine data" });
          }
        });
      
if (nameMuscle) {
        const queryNameMuscle = "INSERT INTO productByMuscle (`productID_muscle`, `nameMuscle`) VALUES (?, ?)";
        bd.query(queryNameMuscle, [productID_muscle, nameMuscle], (err) => {
            if (err) {
                console.error(err, " : Error inserting muscle data");
                return res.status(500).json({ error: "Error inserting muscle data" });
            }
        });
   
}

      return res.status(200).json({ status: "Success" });
    });
  } catch (err) {
    console.error(err, " : Internal server error");
    return res.status(500).json({ error: "Internal server error" });
  }
};