const routes = require('express').Router();
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const nodemailer = require("nodemailer");
const Op = Sequelize.Op;

const { Users, ShopUsers } = require('../../models');

//Mail Function
async function mailFunc(x,otp) {
  let transporter = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    auth: {
      user: 'asadworkemail@gmail.com', 
      pass: 'xsmtpsib-009a6fa866b33ba10e58c8fd1a844d514a89d87ce33172bd4d538d7d92cd6ba3-gwHJXZSsp3I2PFnm',
    },
  });

  let info = await transporter.sendMail({
    from: `"MavDocs Team" <MavDocs@gmail.com>`,
    to: `${x}`,
    subject: "Welcome To MavDocs", 
    html: `<p>Your Account has been successfully setup</p>
        <p>Enter the following code in the login screen</p>
        <h1>${otp}</h1>
        <br/>
        <p>Do not share this code with anyone else.</p>
        <br/>
        <p>Regards</p>
       <p>Support Team</p>`, 
  });
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
//Verification API
routes.post("/verification", async(req, res)=>{
  console.log(req.body)
    const { phone, pass, type } = req.body;

    if(type=="customer"){
      if(req.body.phone && req.body.pass){
        const users = await Users.findOne({where:{phone:phone, password:pass}})
        if(users){
          if(phone==users.phone && pass==users.password){
            const payload = { type:type, phone:users.phone, fullname:`${users.fullname}`,loginId:`${users.id}`,company:`${users.company}` }
            jwt.sign(
              payload,
              'qwertyuiopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnm',
              {expiresIn:"8760h"},
              (err,token) => {
                if(err) return res.json({message: err})
                  return res.status(200).json({
                      message:"Success",
                      token: "BearerSplit"+token
                    })
                  }
                )
          } else { return res.json({message:"Invalid"}) }
        }
        else {  return res.json({message:"Invalid"})  }
      } else {  return res.json({message:"Invalid"})  }

    } else if(type=="shopowner"){

      if(req.body.email && req.body.pass){
        const users = await ShopUsers.findOne({where:{email:email, password:pass}})
        if(users){
          if(email==users.email && pass==users.password){
            const payload = { picture:users.profile_pic, username:`${users.f_name} ${users.l_name}`,loginId:`${users.id}`, type:type }
            jwt.sign(
              payload,
              'qwertyuiopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnm',
              {expiresIn:"8760h"},
              (err,token) => {
                if(err) return res.json({message: err})
                  return res.status(200).json({
                      message:"Success",
                      token: "BearerSplit"+token
                    })
                  }
                )
          } else {  return res.json({message:"Invalid"}) }
        }
        else {  return res.json({message:"Invalid"})  }
      } else {  return res.json({message:"Invalid"})  }

    }

});
//SignUP API
routes.post("/signUp", async(req, res)=>{

  const otp = Math.floor(1000 + Math.random() * 9000);

  const { phone, fullname, company, type } = req.body;
  try {
    if(type=="customer"){
      const customerVerification = await Users.findOne({where:{phone:phone}});
        if(customerVerification){
          res.send('Already Exists');
        }else{
          const customer = await Users.create({
            fullname:fullname, company:company, phone:phone ,type:'customer', password:otp
          });
           mailFunc(customer.phone, otp);
          res.status(200).json(customer)
        }
    }else if(type=="rider"){
      
      const riderVerification = await Users.findOne({where:{phone:phone}});
        if(riderVerification){
          res.json({status:'error', message:"Already Exists!"});
        } else {
          console.log('Rider Creation')
          const Rider = await Users.create({
            fullname:req.body.fullname,
            company:req.body.company,
            phone:req.body.phone
          })
          name(Rider.email, otp, 'Welcome To MavDocs');
          res.json({status:'success'});
        }
    }else{
      res.json({status:'error', message:"Something Went Wrong Please Try Again"});
    }
  }
  catch (error) {
    res.json({status:'error', message:"Something Went Wrong Please Try Again"});
  }
});
//Login API
routes.post("/login", async(req, res)=>{

  const otp = Math.floor(1000 + Math.random() * 9000);
  const { phone, type } = req.body;
  try {
    if(type=="customer") {
      const customerVerification = await Users.findOne({where:{phone:phone}});
      if(customerVerification){
        const customer = await Users.update({password:otp},{where:{id:customerVerification.id}});
        console.log(customer);
        mailFunc(customerVerification.phone, otp);
        res.status(200).json(customerVerification)
      }else{
        res.sendStatus(404)
      }
    } else if(type=="rider") {
      const shopOwnerVerification = await ShopUsers.findOne({where:{phone:phone}});
        if(shopOwnerVerification){
          await ShopUsers.update({password:otp},{where:{id:shopOwnerVerification.id}});
          mailFunc(shopOwnerVerification.phone, otp);
          res.json({status:'success'});
        } else {
          res.json({status:'error'});
        }
    }
    else {
      res.json({status:'error'});
    }
  }
  catch (error) {
    res.send(error);
  }
});

module.exports = routes;