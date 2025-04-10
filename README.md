# I_need_help_frontend
I need help Frontend Project BSWE@hochschule-burgenland

## Testing
### E2E Test
For local tests it's necessary to setup the toolchain. Therefore following steps have to be done:

1. Installing Android SDK: [Instruction](https://docs.expo.dev/workflow/android-studio-emulator/)
2. Create Android Emulator with device "medium phone" and API 36
3. Installing Maestro: [Instruction](https://docs.maestro.dev/getting-started/installing-maestro)

After setting up the toolchain, the emulator needs to be started.

Next, the Expo server needs to be startet:

```bash
npx expo run:android
```

To start the e2e tests you can run them with following command:

```bash
maestro test .maestro/<file_name>.yml
```

