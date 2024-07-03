import  jwt  from "jsonwebtoken"
import bcrypt from "bcrypt"
import { bd } from "../bd.js"

 

const saltRounds = 10

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,15}$/;


export const signUp = (req, res) => {
  
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  const picture = req.file ? req.file.buffer : null;

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return res.Status(400).json({ Error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.Status(400).json({ Error: "Passwords do not match" });
  }

 if (!passwordRegex.test(password)) {
    return res.Status(400).json({ Error: "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one special character." });
  }


  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) return res.Status(500).json({ Error: "Error hashing password" });

    const queryUserPost = "INSERT INTO user (`firstName`, `lastName`, `email`, `password`) VALUES (?, ?, ?, ?)";
    const values = [firstName, lastName, email, hash];

    bd.query(queryUserPost, values, (err, result) => {
      if (err) {
        console.log(err);
        return res.Status(409).json({ Error: "The email already exists; you need to try a different one." });
      }

      const userID = result.insertId;

      if (picture) {
        const queryPicture = "INSERT INTO pictureUser (`userId`, `picture`) VALUES (?, ?)";
        bd.query(queryPicture, [userID, picture], (err) => {
          if (err) {
            console.log(err);
            return res.Status(500).json({ Error: "Inserting image data Error in server" });
          }
          return res.status(200).json({ Status: "Success" });
        });
      } else {
        return res.status(200).json({ Status: "Success" });
      }
    });
  });
};


export const login =  (req, res) => {
  console.log("Running post data for connected");

  const queryFindEmailForUser = "SELECT * FROM user WHERE email = ?";
  bd.query(queryFindEmailForUser, [req.body.email], (err, data) => {
    if (err) {
      console.error("Login error in server: ", err);
      return res.status(500).json({ Error: "Login error in server" });
    }
    if (data.length > 0) {
      bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
        if (err) {
          console.error("Password compare error: ", err);
          return res.status(500).json({ Error: "Password compare error" });
        }

        if (response) {
          const { id } = data[0];
          const token = jwt.sign({ userId: id }, "jwt-secret-key", { expiresIn: "1d" });
          res.cookie('token', token);
          console.log("Login successfully");
          return res.status(200).json({ Status: "Success" });
        } else {
          return res.status(401).json({ Error: "Password not matched" });
        }
      });
    } else {
      return res.status(404).json({ Error: "No email existed" });
    }
    console.log("Success")
  });
};

export const authUser =  (req, res) => {
   if (!req.userId) {
        return res.status(401).json({ Error: "Unauthorized" });
    }
    const sql = `
        SELECT 
            u.firstName, 
            u.lastName, 
            u.email,
            p.picture
        FROM 
            user u 
            LEFT JOIN pictureUser p ON u.id = p.userId
        WHERE 
            u.id = ?
    `;
    
    bd.query(sql, [req.userId], (err, result) => {
        if (err) {
          console.error(err) 
          return res.status(500).json({ Error: "Error fetching user data" });
        }
        if (result.length > 0) {
            const user = result[0];
            const picture = user.picture ? user.picture.toString('base64') : null;
            return res.status(200).json({ 
                Status: "Success", 
                firstName: user.firstName, 
                lastName: user.lastName, 
                email: user.email, 
                picture, 
                 
            });
        } else {
            return res.status(404).json({ Error: "User not found" });
        }
    });
};

export const logout = (req, res) => {
    res.clearCookie("token");
    return res.json({ Status: "Success"});
}