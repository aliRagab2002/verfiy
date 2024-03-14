const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')

router.post('/signup',userController.signup)
router.get('/verify/:userId/:uniqueString',userController.verifyEmail)



module.exports=router