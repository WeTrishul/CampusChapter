const nodemailer = require('../config/nodemailer')

exports.forgot = (obj)/*email,token*/=>{
    console.log('Inside forgot_mailer')
    const tokenVal = obj.token
    console.log('******* token value from forgotPassword_mailer',tokenVal)

    nodemailer.transporter.sendMail({
        from:'team.weTrishul@gmail.com',
        to: obj.email,
        subject:'Forgot password',
        html:'<p>Click <a href="http://wetrishul.in/reset/password/'+ tokenVal + '"a>change karlo bhai</a></p>'              
    },(err,info)=>{
        if(err){
            console.log(email)
            console.log('Error in sending Mail', err)
            return
        }
        console.log('Messge successfully delivered!', info)
        return 
    })
}