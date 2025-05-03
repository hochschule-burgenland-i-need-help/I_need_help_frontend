# I_need_help_frontend

I need help Frontend Project BSWE@hochschule-burgenland

## Testing

### Jest

To run all unit tests you have to run following command:

```bash
npm run test
```

If the you want to see the test coverage run this command:

```bash
npx jest --coverage
```

### E2E Test

For local tests it's necessary to setup the toolchain. Therefore following steps have to be done:

1. Installing Android SDK: [Instruction](https://docs.expo.dev/workflow/android-studio-emulator/)
2. Create Android Emulator with device "medium phone" and API 36
3. Installing Maestro: [Instruction](https://docs.maestro.dev/getting-started/installing-maestro)

After setting up the toolchain, the emulator needs to be started.

Next, the Expo server needs to be startet:

```bash
npm run android
```

To start the e2e tests you can run them with following command:

```bash
npm run e2e
```

## GIT

Be aware that Husky is installed to run pre-commit tasks.
One of those are the e2e tests with Maestro. Therefor you need to follow next steps:

1. Start Android Emulator
2. run command `npm run android`
3. Wait for boot up
4. Stage necessary files
5. Commit

The pre-commit hook will start the script defined in `.husky/pre-commit`

## Pre-Push Security Check

Before each push, a security check runs automatically
to block critical vulnerabilities from entering the remote repository:

1. Runs: `npm audit --audit-level=critical`
2. Behavior:
   If critical vulnerabilities are found, the push is aborted and an error message is shown.

## Android Emulator

For installing the emulator follow the instructions [here](https://docs.expo.dev/workflow/android-studio-emulator/).

### Emulator Config

| Name                      | Value                         |
| ------------------------- | ----------------------------- |
| **Form Factor**           | Medium Phone                  |
| **API**                   | 35 - Android 15               |
| **Service**               | AOSP - Android Open Source    |
| **System Image**          | Depending on your host system |
| **Cpu Cores**             | 4                             |
| **Internal Storage**      | 4 GB                          |
| **Graphics acceleration** | Automatic                     |
| **RAM**                   | 4 GB                          |
| **Default boot**          | Quick                         |
