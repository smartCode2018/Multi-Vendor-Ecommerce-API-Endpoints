const emailTemplate = (name: string, otp: string) => {
  return `
    <!DOCTYPE html>
<html>
  <head>
    <title>Ebuy Activation Email</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style type="text/css">
      body {
        margin: 0;
        padding: 0;
        min-width: 100%;
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        color: #222222;
        background-color: #fafafa;
      }
      a {
        color: #000;
        text-decoration: none;
      }
      h1 {
        font-size: 24px;
        margin-bottom: 15px;
        font-weight: 700;
        line-height: 1.25;
        margin-top: 0;
        text-align: center;
      }
      p {
        margin-top: 0;
        margin-bottom: 24px;
      }
      table td {
        vertical-align: top;
      }
      /* Layout  */
      .email-wrapper {
        max-width: 600px;
        margin: 0 auto;
      }
      .email-header {
        background-color: #0070f3;
        padding: 24px;
        color: #ffffff;
      }
      .email-body {
        padding: 24px;
        background-color: #ffffff;
      }
      .email-footer {
        background-color: #f6f6f6;
        padding: 24px;
      }
      /* Buttons  */
      .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #0070f3;
        color: #ffffff;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="email-header">
        <h1>Welcome to Ebuy!</h1>
      </div>
      <div class="email-body">
        <p>Hi ${name},</p>
        <p>
          Thank you for registering with Ebuy! To activate your account, please
          use the following activation code.
        </p>
        <h2>${otp}</h2>
        <p>
          Please enter this code on the activation page within the next 5
          minutes
        </p>
        <p>If you did not request this activation, please ignore this email.</p>
        <p>Thank you for choosing Ebuy!</p>
      </div>
      <div class="email-footer">
        <p>&copy; 2025 Ebuy. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>

  `;
};

export default emailTemplate;
