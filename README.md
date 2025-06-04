# I need help (Android Mobile App)

I need help Frontend Project BSWE@hochschule-burgenland

---

## Prerequisite

Following programs are necessary for developing and building the application:

| Name                         | Version  | Comment                                                                                               |
| ---------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| GIT                          | v2.47+   | https://git-scm.com/                                                                                  |
| Java JDK                     | 21       | https://www.oracle.com/java/technologies/downloads/                                                   |
| Gradle                       | 8.10.2   | https://gradle.org/install/                                                                           |
| node.js                      | v22.14.0 | https://nodejs.org/en/download or use fnm (Windows), nvm (Linux)                                      |
| npm                          | v10.9.2  | https://nodejs.org/en/download or use fnm (Windows), nvm (Linux)                                      |
| Maestro                      | v1.39.13 | https://docs.maestro.dev/getting-started/installing-maestro                                           |
| Android Studio               | 2024.3.2 | (Optional) Needed for the Emulator. https://developer.android.com/studio?hl=de                        |
| Visual Studio Code           | 1.100.2  | https://code.visualstudio.com/download                                                                |
| Google Maps Platform API Key |          | https://developers.google.com/maps/documentation/android-sdk/get-api-key?hl=de (Maps SDK for Android) |

### Setting Up Android Studio

https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=physical&mode=development-build&buildEnv=local#set-up-an-android-device-with-a-development-build

You have to install via the SDK Manager of Android Studio following packages:

**Android SDK > SDK Platforms:**

- Android 15.0 ("VanillaIceCream")

**Android SDK > SDK Tools:**

- Android SDK Build-Tools 36
- NDK (Side by Side)
- Android SDK Command-line Tools
- CMake
- Android Emulator
- Android SDK Platform-Tools

Copy or remember the path listed in the box that says Android SDK Location.

First, set the environment variable `ANDROID_HOME` with path of the Android SDK location as value.

Second, add the path `[ANDROID_HOME]/emulator` and `[ANDROID_HOME]/platform-tools` to your `PATH` environment variable.

Finally, make sure that you can run `adb` from the PowerShell. For example, run the `adb --version` to see which version of the `adb` your system is running.

#### Emulator

Creat an emulator with following configuration:

| Name                 | Value                         |
| -------------------- | ----------------------------- |
| **Form Factor**      | Medium Phone                  |
| **API**              | 35 - Android 15               |
| **Service**          | Google Play Store             |
| **System Image**     | Depending on your host system |
| **Internal Storage** | 4 GB                          |
| **Default boot**     | Quick                         |

### Recommended Visual Studio Extensions

| Name            | Publisher | Comment |
| --------------- | --------- | ------- |
| Expo Tools      | Expo      |         |
| IntelliCode     | Microsoft |         |
| Gradle for Java | Microsoft |         |
|                 |           |         |

---

## Get Started

Download the repository:

```shell
# clone repository
git clone https://github.com/hochschule-burgenland-i-need-help/I_need_help_frontend.git

# change directory
cd I_need_help_frontend
```

Install modules:

```shell
# use npm to install modules
npm install
```

> 💡 Start the emulator
> or connect Android device (enabled USB-Debugging)

> [!TIP]
> If you get the error message \
> _SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable or by setting the sdk.dir path in your project's local properties file_ \
> add `sdk.dir=[path to Android SDK]` to the file `android/local.properties`

Running the application locally:

```shell
# run application
npm run android
```

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

## Pre-Commit Secret Check

To ensure **no sensitive information** ever makes it into the repo, we use SecretLint in our Husky hook:

1. **Install dev dependencies**

    ```bash
    npm install --save-dev secretlint @secretlint/secretlint-rule-preset-recommend

    ```

2. **Create configuration file**
   In the project root, add a file named .secretlintrc.json with the following content:

{
"rules": [
{
"id": "@secretlint/secretlint-rule-preset-recommend"
}
]
}

## API Modules

This project integrates two geospatial data APIs to find and enrich nearby emergency service locations based on OpenStreetMap data.

- Overpass API (OSM)
- Photon API (Geocoding)

### Overpass API

Retrieves nearby police stations, fire stations, hospitals, or ambulance points using the Overpass API for OSM.

**Function:** findNearestDepartment(...)

```ts
findNearestDepartment(
  latitude: number,
  longitude: number,
  department: Department,
  maxRadius?: number,
  step?: number
): Promise<OverpassElement[] | null>

```

**Parameters:**

- latitude / longitude: Your current GPS coordinates
- department: Type of service (Police, Fire, Ambulance)
- maxRadius: Maximum search radius in meters (default: 20,000)
- step: Incremental step per retry (default: 2,000)

**Returns:** Array of OverpassElement or null if nothing found.
**Behavior:** Starts at small radius and expands until results are found or max radius is reached.

### Photon API

Performs reverse geocoding via Photon API (Komoot) to resolve GPS coordinates into human-readable addresses.

**Function:** reverseGeocode(...)

```ts
reverseGeocode(lat: number, lon: number): Promise<AddressInfo | null>
```

**Parameters:**

- lat / lon: GPS coordinates

**Returns:** AddressInfo object or null

Used when no address is provided directly from Overpass results.

### Helper Function

**Function:** toLocationInfo(...)

Located in location_info.ts, this helper function transforms an OverpassElement into a LocationInfo object, including address enrichment using Photon if necessary.

```ts
toLocationInfo(e: OverpassElement): Promise<LocationInfo | null>
```

### Data Models

- OverpassElement: Raw location data from Overpass API
- AddressInfo: Address details from Photon API
- LocationInfo: Unified model with resolved name, coordinates, and address string

### Example Usage

```ts
const elements = await findNearestDepartment(48.2082, 16.3738, Department.Ambulance);
if (elements) {
    const enriched = await Promise.all(elements.map(toLocationInfo));
    console.log(enriched);
}
```
