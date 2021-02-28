const nodemailer = require("nodemailer");

async function mailer(to,num) {
  let transporter = nodemailer.createTransport({
    host: "smtp.qq.com",
    port: 465,
    secure: true,
    auth: {
      user: '', //设置发送邮箱
      pass: '', //设置smtp码
    },
  });

  await transporter.sendMail({
    from: '"Fred Foo 👻" <>', //<>内需要写发送邮箱
    to, 
    subject: "注册验证码",
    text: "您的验证码在五分钟内有效。 验证码是："+num,
  });
}

module.exports = mailer