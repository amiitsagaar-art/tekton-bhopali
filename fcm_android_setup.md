# Firebase Cloud Messaging (FCM) Setup for Tekton Android App

This guide details the manual configurations required in the `android/` directory to enable native push notifications using Firebase Cloud Messaging (FCM).

---

## Step 1: Add Google Services Config File
1. Go to your **Firebase Console** -> Project Settings.
2. Select your Android App (Package Name: `com.tekton.bhopal`).
3. Download the `google-services.json` file.
4. Place this file inside the `android/app/` folder of your project workspace:
   `c:\Users\MY PC\Downloads\tekton-skilled-worker-marketplace (1)\android\app\google-services.json`

---

## Step 2: Configure Gradle Dependencies

### 1. Project-level Build Gradle (`android/build.gradle`)
Open the root `android/build.gradle` file, and ensure the `google-services` classpath dependency is present under the `buildscript` block:

```gradle
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.1'
        classpath 'com.google.gms:google-services:4.4.0' // <-- Add this line if missing
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
```

---

### 2. App-level Build Gradle (`android/app/build.gradle`)
Open the app module's `android/app/build.gradle` file and apply the `google-services` plugin at the very bottom:

```gradle
apply plugin: 'com.android.application'

// ... existing configurations ...

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation project(':capacitor-android')
    implementation project(':capacitor-cordova-android-plugins')
    // ... existing dependencies ...
}

// Add this line at the very bottom of the file
apply plugin: 'com.google.gms.google-services'
```

---

## Step 3: Synchronize Capacitor Project
After completing the above changes, run the following command in the project root folder to sync the native configurations:

```bash
npx cap sync android
```

Your Android application is now fully configured to register for and receive native push notifications via FCM!
