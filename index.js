const express = require('express');
const {OAuth2Client} = require('google-auth-library');
const open = require('open');

const app = express();

async function getAuthenticatedClient() {
  return new Promise((resolve, reject) => {
    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      `https://expressjs-google.onrender.com/auth/google/callback`
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/userinfo.profile',
    });

    open(authorizeUrl, {wait: false}).then(cp => cp.unref());

    app.get('/auth/google/callback', async (req, res) => {
      try {
        const { code } = req.query;
        console.log(`Code is ${code}`);
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        console.info('Tokens acquired.');
        res.send('Authentication successful! Please return to the console.');
        resolve(oAuth2Client);
      } catch (e) {
        reject(e);
        res.status(500).send('Authentication failed');
      }
    });
  });
}

async function main() {
  const oAuth2Client = await getAuthenticatedClient();
  const url = 'https://people.googleapis.com/v1/people/me?personFields=names';
  const res = await oAuth2Client.request({url});
  console.log(res.data);

  const tokenInfo = await oAuth2Client.getTokenInfo(oAuth2Client.credentials.access_token);
  console.log(tokenInfo);
}

app.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
  main().catch(console.error);
});
