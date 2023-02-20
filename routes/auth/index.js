const routes = require('express').Router();
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const nodemailer = require("nodemailer");
const Sib = require('sib-api-v3-sdk');
const Op = Sequelize.Op;

const { Users, ShopUsers } = require('../../models');

async function main(x,otp) {
  // const client = Sib.ApiClient.instance;
  // const apiKey = client.authentications['api-key'];
  // apiKey.apiKey = 'xsmtpsib-009a6fa866b33ba10e58c8fd1a844d514a89d87ce33172bd4d538d7d92cd6ba3-7gKWANxV96aqfGSZ';
  // const transEmailApi = new Sib.TransactionalEmailsApi();
  // const sender = { email:'asadshamiteamhail@gmail.com',name:'Asad Tanvir'};
  // const recievers = [ { email:x, }, ];

  // transEmailApi.sendTransacEmail({
  //   sender,
  //   to: recievers,
  //   subject:sub,
  //   //textContent:'Wishing you a warm welcome to Hail Technologies',
  //   htmlContent:`<p>Your Account has been successfully setup</p>
  //     <p>Enter the following code in the login screen</p>
  //     <h1>{{params.pass}}</h1>
  //     <br/>
  //     <p>Do not share this code with anyone else.</p>
  //     <br/>
  //     <p>Regards</p>
  //     <p>Support Team</p>`,
  //   params:{
  //       pass:otp,
  //   },
  // }).then((x)=>console.log(x))
  // .catch((e)=>console.log(e));
  console.log("EMAIL",x)
  let transporter = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 25,
    auth: {
      user: 'asadworkemail@gmail.com', 
      pass: 'xsmtpsib-009a6fa866b33ba10e58c8fd1a844d514a89d87ce33172bd4d538d7d92cd6ba3-7gKWANxV96aqfGSZ',
    },
  });

  let info = await transporter.sendMail({
    from: `"MavDocs Team" <asadshamiteamhail@gmail.com>`,
    to: "asadworkemail@gmail.com",
    subject: "<p>Welcome To MavDocs<p>", 
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

routes.post("/verification", async(req, res)=>{
    const { email, pass, type } = req.body

    if(type=="customer"){

      if(req.body.email && req.body.pass){
        const users = await Users.findOne({where:{email:email, password:pass}})
        if(users){
          if(email==users.email && pass==users.password){
            const payload = { type:type, picture:users.profile_pic, fullname:`${users.fullname} ${users.l_name}`,loginId:`${users.id}` }
            jwt.sign(
              payload,
              'qwertyuiopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnm',
              {expiresIn:"8760h"},
              (err,token) => {
                if(err) return res.json({message: err})
                  return res.json({
                      message:"Success",
                      token: "BearerSplit"+token
                    })
                  }
                )
          } else {  return res.json({message:"Invalid"}) }
        }
        else {  return res.json({message:"Invalid"})  }
      } else {  return res.json({message:"Invalid"})  }

    }else if(type=="shopowner"){

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
                  return res.json({
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

routes.post("/signUp", async(req, res)=>{

  const otp = Math.floor(100000 + Math.random() * 900000);

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
           main(customer.phone, otp);
          res.json({status:'success',customer});
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

// routes.post("/login", async(req, res)=>{

//   const otp = Math.floor(100000 + Math.random()*900000);
//   const { email, type } = req.body;
//   try {
//     if(type=="customer") {
//       const customerVerification = await Users.findOne({where:{email:email}});
//       if(customerVerification){
//         const customer = await Users.update({password:otp},{where:{id:customerVerification.id}});
//         console.log(customer);
//         name(customerVerification.email, otp, 'Innovatory OTP');
//         res.status(200).json(customerVerification)
//         // res.json({status:'success'},customerVerification);
//       }else{
//         res.json({status:'error'});
//       }
//     } else if(type=="rider") {
//       const shopOwnerVerification = await ShopUsers.findOne({where:{email:email}});
//         if(shopOwnerVerification){
//           await ShopUsers.update({password:otp},{where:{id:shopOwnerVerification.id}});
//           name(shopOwnerVerification.email, otp, 'Innovatory OTP');
//           res.json({status:'success'});
//         } else {
//           res.json({status:'error'});
//         }
//     }
//     else {
//       res.json({status:'error'});
//     }
//   }
//   catch (error) {
//     res.send(error);
//   }
// });

module.exports = routes;