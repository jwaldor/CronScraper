import sgMail from "@sendgrid/mail";

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY is not set");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmailWithSendGrid(subject: string, text: string) {
  if (!process.env.MY_EMAIL) {
    throw new Error("MY_EMAIL is not set");
  }
  console.log(process.env.MY_EMAIL, "my email");
  const msg = {
    to: process.env.MY_EMAIL,
    from: process.env.MY_EMAIL, // Use the email address or domain you verified above
    subject: subject,
    text: text,
    // html: `
    //   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    //     <h1 style="color: #333;">Latest AI News</h1>
    //     <div style="line-height: 1.6; color: #444;">
    //       ${text}
    //     </div>
    //   </div>
    // `,
  };
  //ES6
  sgMail.send(msg).then(
    (response) => {
      console.log(response, "response");
    },
    (error) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  );
}
