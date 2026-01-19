require('dotenv').config();
const fs = require('fs');
const path = require('path');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

const sendPasswordResetEmail = async (userName, email, resetToken) => {
  const htmlFilePath = path.join(__dirname, '../templates/reset-password.html');
  let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

  htmlContent = htmlContent.replace('{{account_name}}', userName);
  htmlContent = htmlContent.replace('{{account_email}}', email);
  htmlContent = htmlContent.replaceAll('{{action_url}}', `${process.env.FRONTEND_URL}/auth/password-reset?token=${resetToken}`);

  sendSmtpEmail.subject = 'Soliciatação de redefinição de senha';
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = {
    name: '18 MC Social',
    email: process.env.EMAIL_FROM,
  };
  sendSmtpEmail.to = [{ email: email, name: '18 MC Social' }];

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = {
  sendPasswordResetEmail,
};
