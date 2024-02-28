const express = require('express');
const {OAuth2Client,google} = require('google-auth-library');
const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://expressjs-google.onrender.com/auth/google/callback';

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

app.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  const {code} = req.query;
  console.log(code);
  const {tokens} = await oauth2Client.getToken(code);
  console.log();
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.get()
  console.log(oauth2);
  // const userInfo = a/wait oauth2.get()
  // console.log(oauth2);
  // const user/ = await prisma.user.upsert({
  //   where: {googleId: userInfo.data.id},
  //   update: {
  //     accessToken: tokens.access_token,
  //     refreshToken: tokens.refresh_token,
  //   },
  //   create: {
  //     googleId: userInfo.data.id,
  //     email: userInfo.data.email,
  //     name: userInfo.data.name,
  //     accessToken: tokens.access_token,
  //     refreshToken: tokens.refresh_token,
  //   },
  // });

  res.send('Authentication successful!');
});

const PORT = process.env.PORT;

app.get('/', (req, res)=> {
  res.send("helloworld")
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
