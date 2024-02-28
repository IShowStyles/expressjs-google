const express = require('express');
const {OAuth2Client} = require('google-auth-library');
const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://expressjs-google.onrender.com/auth/google/callback';

console.log(CLIENT_SECRET,CLIENT_ID);

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
  const {tokens} = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2',
  });
  const userInfo = await oauth2.userinfo.get();
  const user = await prisma.user.upsert({
    where: {googleId: userInfo.data.id},
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    },
    create: {
      googleId: userInfo.data.id,
      email: userInfo.data.email,
      name: userInfo.data.name,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    },
  });

  res.send('Authentication successful!');
});

const PORT = process.env.PORT;

app.get('/', (req, res)=> {
  res.send("helloworld")
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
