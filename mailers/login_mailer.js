const nodemailer = require('../config/nodemailer')

exports.newLogin = (user)=>{
    console.log('Inside login_mailer')
    let stringHtml = nodemailer.renderTemlate({user:user},'/loginEmail.ejs')

    nodemailer.transporter.sendMail({
        from:'team.wetrishul@gmail.com',
        to: user.email,
        subject:'Succesfully Logged In!',
        html:stringHtml   //'<h1>Congratulations,you have logged in!</h1>'
    },(err,info)=>{
        if(err){
            console.log(user.email)
            console.log('Error in sending Mail', err)
            return
        }
        console.log('Messge successfully delivered!', info)
        return
    })
}