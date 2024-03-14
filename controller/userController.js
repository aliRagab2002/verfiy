
const User = require('../model/userSchema.model')
const UserVerification = require('../model/UserVerification')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const {v4 : uuidv4}= require('uuid')
const { Result } = require('express-validator')
const bcrypt = require('bcrypt')
require ('dotenv').config()


// const createToken = (_id)=>{
//     const jwtSecretKey = process.env.JWT_SECRET_KEY;
//     return jwt.sign({_id},jwtSecretKey,{expiresIn: "3d"});
// }


const transporter = nodemailer.createTransport({
    service:"gmail",
    // port : 5000,
    // secure:true,
    // logger:true,
    // debug:true,

    auth:{
        user:process.env.AUTH_EMAIL,
        pass:process.env.AUTH_PASS
    },
    // tls:{
    //     rejectUnauthorized:true
    // }
})

transporter.verify((error,success) => {
    if(error){
        console.log(error)
    }else{
        console.log("ready for messages")
        console.log(success)
    }
})


const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if any required field is missing
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Please provide all required fields" });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        // Create a new user
        const newUser = new User({ name, email, password,verified: false, });

        // Save the new user to the database
         newUser.save().then((result) => {
            sendVerificationEmail(result,res)
         });

        // Respond with the user details after saving
        // res.json({ success: "User registered successfully", _id: newUser._id, name, email });
    } catch (err) {
        console.log("Error in signup:", err);
        res.status(500).json({ error: "Error during user registration" });
    }
};

const sendVerificationEmail = ({_id,email},res)=>{
    // const currendUri = "https://aliragab2002-be78ad0a8c78.herokuapp.com/";
    const currendUri = "https://aliragab752002-32d59c101d22.herokuapp.com/";
    // const currendUri = "http://localhost:5000/";

    const uniqueString = uuidv4() + _id;
    
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify your email",
        html: `<h1>Hello ${email}</h1>
        <p>Please click on the link below to verify your email</p>
        <a href="${currendUri+"api/verify/"+_id +"/" + uniqueString}>hero</a>`
        

    };

    const saltRounds = 10;
    bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) =>{
        const newVerification = new UserVerification({
            userId:_id,
            uniqueString:hashedUniqueString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 21600000,

        });

        newVerification
        .save()
        .then(()=>{
            transporter
            .sendMail(mailOptions)
            .then(()=>{
                res.json({status:"PENDING",
                message:"verification email sent ",
                })
            })
            .catch((error)=>{
                console.error(error)
                res.json({status:"FAILED",
                message:"verification email failed",
                })
            })
        })
        .catch((error) => {
            console.error(error)
            res.json({status:"FAILED",
            message:"coudnot save verification email data",
            })

        })
    })

}

const verifyEmail =(req,res)=>{
    const {userId,uniqueString} = req.params;
    UserVerification
    .find({userId})
    .then((result)=>{
        if(result.length > 0){
            const {expiresAt} = result[0];
            const hasheduniqueString = result[0].uniqueString;

            if(expiresAt < Date.now()){
                UserVerification
                .deleteOne({userId})
                .then((Result=>{
                    User
                    .deleteOne({_id:userId})
                    .then(()=>{
                        res.json({message:"link has been expired plese sign up again "})
                    })
                    .catch(error => {
                        res.json({message:"Error deleting user expired with uniqueString failed "})
                    })

                }))
                .catch((error)=>{
                    console.log(error)
                    res.json({message:"an error occured while deleting the user expired "})

                })
            }else{
                bcrypt
                .compare(uniqueString,hasheduniqueString)
                .then(result => {
                    if(result){
                        User.updateOne({_id:userId},{verified:true})
                        .then(()=>{
                            UserVerification.deleteOne({userId})
                            .then(()=>{
                                res.json({message:"verification successful"})
                            })
                            .catch(error => {
                                console.log(error);
                                res.json({status:"success",
                                message:"an error occured while finalizing successful verification "})
                            })
                        })
                        .catch(error => {
                            res.json({message:"an error occurred while updating user record"})
                        })
                    }else{
                        res.json({message:"invalid verification check your box"})
                    }

                })
                .catch(error => {
                    console.log(error)
                    res.json({message:"an error occured while comparing the unique string"})
                })
            }

        }else{
            res.json({message:"Account record does not exist or has beev verified aleardy please sign up"})
        }
    })
    .catch((error) => {
        console.log(error)
        res.json({message:"An error occurred while checking for exiting user verification"})
    })


}






// const signup = (req, res) => {
//     const { name, email, password } = req.body;

//     // Check if any required field is missing
//     if (!name || !email || !password) {
//         return res.status(400).json({ error: "Please provide all required fields" });
//     }

//     // Check if the user already exists
//     User.findOne({ email })
//         .then(user => {
//             if (user) {
//                 return res.status(400).json({ error: "User with this email already exists" });
//             }

//             // Create a new user
//             const newUser = new User({ name, email, password,isVerified: false,emailToken:crypto.randomBytes(64)
//                 .toString("hex")
//              });

//             // Save the new user to the database
//             return newUser.save();
//         })
//         .then(() => {
//             const token = createToken(newUser._id);
//             return res.json({ success: "User registered successfully",_id: newUser._id,name,email,token});
//         })
//         .catch(err => {
//             console.log("Error in signup:", err);
//             return res.status(500).json({ error: "Error during user registration" });
//         });
// };



// const verifiyEmail = async(req,res) => {
//     try{
//         const emailToken = req.body.emailToken;
//         if(!emailToken) return res.status(404).json("Email token not found");
//         const user = await User.findOne({emailToken});
//         if(user){
//             user.emailToken = null;
//             user.isVerified = true;
//             await user.save();
//             const token = createToken(user._id)
//             return res.status(200).json({
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 token,
//                 isVerified: user?.isVerified
//             })
           
//         } else{
//             return res.status(404).json("Email verification failed,invalid token");
//         }
//     }catch(e){
//         console.log(e)
//         return res.status(500).json({error:e.message});
//     }
// }

module.exports = {
    signup,
    sendVerificationEmail,
    verifyEmail
};