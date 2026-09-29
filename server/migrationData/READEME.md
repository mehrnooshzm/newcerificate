# Firebase User Migration — `migrateData` API

## What this does

`firebaseVerify.js` checks a user's password against their legacy **Firebase
Auth** scrypt hash. When a migrated user logs in for the first time, this
function compares the password they typed against the `passwordHash` /
`passwordSalt` stored for them, and returns `true`/`false`.

## Where `users.json` comes from

It's generated with:

```bash
node firestoreusers2json.js users.json 100
```

from this repo: [certi4Scripts](https://github.com/mehrnooshzm/certi4Scripts).
Each record contains `uid`, `email`, `passwordHash`, and `passwordSalt` in
base64url format, exactly as Firebase stores them.

## Required environment variables

These come from Firebase Console → Authentication → Users → "Password hash
parameters" (also included in the `auth:export` output):

| Variable        | Description                                      |
| --------------- | ------------------------------------------------ |
| `MEMCOST`       | Memory cost parameter for scrypt                 |
| `ROUNDS`        | Number of rounds                                 |
| `SALTSEPARATOR` | Base64-encoded salt separator (project-specific) |
| `SIGNERKEY`     | Base64-encoded signer key (project-specific)     |
