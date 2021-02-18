const sgMail = require("@sendgrid/mail");


sgMail.setApiKey(process.env.SGEMAIL_API_KEY);
const welcomeEmail = async (email, name) => {
    try {
        await sgMail.send({
            to: email,
            from: "rushil.koyani@kevit.io",
            subject: "Send Email Through NodeJs",
            text: "Welcome to the App. " + name + " I hope you are fine :)"
        })
    }
    catch (e) {
        console.log(e)
    }
}

const byeEmail = async (email, name) => {
    try {
        await sgMail.send({
            to: email,
            from: "rushil.koyani@kevit.io",
            subject: "Send Email Through NodeJs",
            text: "Good bye to the App. " + name + " I hope. We will see you again :)"
        })
    }
    catch (e) {
        console.log(e)
    }
}

module.exports = { welcomeEmail, byeEmail }