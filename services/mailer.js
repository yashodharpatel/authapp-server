import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import User from "#models/user";
import constants from "#constants";
import asyncHandler from "express-async-handler";

const sendMail = asyncHandler(async ({ email, emailType, userID }) => {
  // generate the token
  const hashedToken = await bcrypt.hash(userID.toString(), 10);

  if (emailType === constants.EmailTypes.VERIFY) {
    await User.findByIdAndUpdate(userID, {
      verifyToken: hashedToken,
      verifyTokenExpiry: new Date() + 43200000,
    });
  } else if (emailType === constants.EmailTypes.RESET) {
    await User.findByIdAndUpdate(userID, {
      forgotPasswordToken: hashedToken,
      forgotPasswordTokenExpiry: new Date() + 43200000,
    });
  }

  // send mail using gmail
  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: process.env.MAILSERVICE_USER,
  //     pass: process.env.MAILSERVICE_PASS,
  //   },
  // });

  // send mail using mailtrap
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILSERVICE_USER,
      pass: process.env.MAILSERVICE_PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: email,
    subject:
      emailType === constants.EmailTypes.VERIFY
        ? "Verify your Email"
        : "Reset your password",
    html:
      emailType === constants.EmailTypes.VERIFY
        ? `<!DOCTYPE html>
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <title></title>
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style type="text/css">
            #outlook a {
              padding: 0;
            }
        
            .ReadMsgBody {
              width: 100%;
            }
        
            .ExternalClass {
              width: 100%;
            }
        
            .ExternalClass * {
              line-height: 100%;
            }
        
            body {
              margin: 0;
              padding: 0;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
            }
        
            table,
            td {
              border-collapse: collapse;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
            }
          </style>
          <style type="text/css">
            @media only screen and (max-width:480px) {
              @-ms-viewport {
                width: 320px;
              }
        
              @viewport {
                width: 320px;
              }
            }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet"
            type="text/css">
          <style type="text/css">
            @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');
          </style>
          <style type="text/css">
            @media only screen and (max-width:595px) {
              .container {
                width: 100% !important;
              }
        
              .button {
                display: block !important;
                width: auto !important;
              }
            }
          </style>
        </head>
        
        <body style="font-family: 'Inter', sans-serif; background: #E5E5E5;">
          <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
            <tbody>
              <tr>
                <td valign="top" align="center">
                  <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding:48px 0 30px 0; text-align: center; font-size: 14px; color: #4C83EE;">
                          ${constants.COMPANY_NAME}
                        </td>
                      </tr>
                      <tr>
                        <td class="main-content" style="padding: 48px 30px 40px; color: #000000;" bgcolor="#ffffff">
                          <table width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                                  Welcome!
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style="padding: 0 0 10px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                                  Thanks for choosing ${constants.COMPANY_NAME}! We are happy to see
                                  you on board.
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                                  To get started, verify your Email:
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0 0 24px 0;">
                                  <a class="button" href="${process.env.UI_URL}/verifyemail?token=${hashedToken}"
                                    title="Verify Email"
                                    style="width: 100%; background: #4C83EE; text-decoration: none; display: inline-block; padding: 10px 0; color: #fff; font-size: 14px; line-height: 21px; text-align: center; font-weight: bold; border-radius: 7px;">Verify
                                    Email</a>
                                </td>
                              </tr>
                              <tr>
                              <tr>
                                <td style="padding: 0 0 16px;">
                                  <span style="display: block; width: 117px; border-bottom: 1px solid #8B949F;"></span>
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                                  Best regards, <br><strong>${constants.COMPANY_NAME}</strong>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 24px 0 48px; font-size: 0px;">
                          <div class="outlook-group-fix"
                            style="padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;">
                            <span
                              style="padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color: #8B949F;">${constants.COMPANY_NAME}<br />
                          </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>`
        : `<!DOCTYPE html>
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <title></title>
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style type="text/css">
            #outlook a {
              padding: 0;
            }
        
            .ReadMsgBody {
              width: 100%;
            }
        
            .ExternalClass {
              width: 100%;
            }
        
            .ExternalClass * {
              line-height: 100%;
            }
        
            body {
              margin: 0;
              padding: 0;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
            }
        
            table,
            td {
              border-collapse: collapse;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
            }
          </style>
          <style type="text/css">
            @media only screen and (max-width:480px) {
              @-ms-viewport {
                width: 320px;
              }
        
              @viewport {
                width: 320px;
              }
            }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet"
            type="text/css">
          <style type="text/css">
            @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');
          </style>
          <style type="text/css">
            @media only screen and (max-width:595px) {
              .container {
                width: 100% !important;
              }
        
              .button {
                display: block !important;
                width: auto !important;
              }
            }
          </style>
        </head>
        
        <body style="font-family: 'Inter', sans-serif; background: #E5E5E5;">
          <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
            <tbody>
              <tr>
                <td valign="top" align="center">
                  <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding:48px 0 30px 0; text-align: center; font-size: 14px; color: #4C83EE;">
                          ${constants.COMPANY_NAME}
                        </td>
                      </tr>
                      <tr>
                        <td class="main-content" style="padding: 48px 30px 40px; color: #000000;" bgcolor="#ffffff">
                          <table width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                                  Hello! Forgot your password?
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style="padding: 0 0 10px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                                  We received a password reset request for your account: <span
                                    style="color: #4C83EE;">${email}</span>.
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 700; color: #000000; letter-spacing: 0.01em;">
                                  Click the button below to proceed.
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0 0 24px 0;">
                                  <a class="button" href="${process.env.UI_URL}/resetpassword?token=${hashedToken}"
                                    title="Reset Password"
                                    style="width: 100%; background: #22D172; text-decoration: none; display: inline-block; padding: 10px 0; color: #fff; font-size: 14px; line-height: 21px; text-align: center; font-weight: bold; border-radius: 7px;">Reset
                                    Password</a>
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style="padding: 0 0 10px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                                  The password reset link is only valid for the next 24 hours.
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style="padding: 0 0 60px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                                  If you didn’t request the password reset, please ignore this message or contact our support at
                                  <a href="mailto:authsupport@gmail.com">authsupport@gmail.com</a>.
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0 0 16px;">
                                  <span style="display: block; width: 117px; border-bottom: 1px solid #8B949F;"></span>
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                                  Best regards, <br><strong>${constants.COMPANY_NAME}</strong>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 24px 0 48px; font-size: 0px;">
                          <div class="outlook-group-fix"
                            style="padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;">
                            <span
                              style="padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color: #8B949F;">${constants.COMPANY_NAME}<br />
                          </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>`,
  };

  return await transporter.sendMail(mailOptions);
});

export default sendMail;