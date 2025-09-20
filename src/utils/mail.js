import Mailgen from "mailgen";
import nodemailer from "nodemailer"
//for sending the email
const sendEmail = async (options) => {
    const mailGenerator = new Mailgen(
        {
            theme: "default",
            product: {
                name: "RecruitAssist",
                link: "https://recruitassistlink.com"
            }
        }
    )
    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHtml = mailGenerator.generate(options.mailgenContent);
    
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    })

    const mail = {
        from: "mail.recruitassist@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transporter.sendMail(mail);
    }
    catch(err){
        console.error("Email Server Rejected!!! , Make sure MAILTRAP credentials are correct , Error: ",err);
    }
}


//template for email sending
const emailVerificationMailgenContent = (name , verificationUrl) => {
    return {
        body: {
            name: name,
            intro: "Welcome to the RecruitAssist! We are thrilled to have you on board.",
            action: {
                instructions: "To verify your email please click on the below mentioned button",
                button: {
                    color: "#22BC66",
                    text: "Verify your email",
                    link: verificationUrl
                }
            },
            outro: "Need help or have questions? Just reply to this email",
        }
    };
};

const forgotPasswordMailgenContent = (name , passwordResetUrl) => {
    return {
        body: {
            name: name,
            intro: "We got a request from your account to reset password",
            action: {
                instructions: "To reset password click on the following button",
                button: {
                    color: "#22BC66",
                    text: "Reset the Password",
                    link: passwordResetUrl
                },
            },
            outro: "Need help, or have questions? Just reply to this email ,  Feel free to reach out"
        }
    };
};

export {emailVerificationMailgenContent , forgotPasswordMailgenContent , sendEmail};