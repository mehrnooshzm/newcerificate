const { FirebaseScrypt } = require('firebase-scrypt');

const scrypt = new FirebaseScrypt({
  memCost: Number(process.env.MEMCOST),
  rounds: Number(process.env.ROUNDS),
  saltSeparator: process.env.SALTSEPARATOR,
  signerKey: process.env.SIGNERKEY,
});

function base64UrlToBase64(value) {
  return value.replace(/-/g, '+').replace(/_/g, '/');
}

async function verifyFirebasePassword(password, user) {
  const hash = base64UrlToBase64(user.passwordHash);
  const salt = base64UrlToBase64(user.passwordSalt);

  console.log('Original hash:', user.passwordHash);
  console.log('Converted hash:', hash);
  console.log('Original salt:', user.passwordSalt);
  console.log('Converted salt:', salt);

  const valid = await scrypt.verify(password, salt, hash);

  console.log('valid:', valid);

  return valid;
}

module.exports = verifyFirebasePassword;
