# Colour Basher – Android app and web app

The game lives in `app/src/main/assets/index.html` (HTML/CSS/JS, no dependencies).
`MainActivity.java` hosts it full-screen in the system WebView and adds immersive mode,
vibration, back-button handling and auto-pause when you leave the app.

Targets **Android 17 (API 37)**, runs on Android 8.0+ (API 26).

## Build the APK

1. Install Android Studio (latest stable).
2. File → Open → select this `ColourBasher` folder. Let Gradle sync.
   - If prompted to install the Android 17 / API 37 SDK platform, accept.
   - If prompted to upgrade the Android Gradle Plugin, accept (the AGP Upgrade Assistant is safe here).
3. Build → Build App Bundle(s) / APK(s) → Build APK(s).
4. The APK is at `app/build/outputs/apk/debug/app-debug.apk`.

Command line alternative (needs the Android SDK and `ANDROID_HOME` set):

    ./gradlew assembleDebug

## Install on your phone

- USB: enable Developer options → USB debugging, plug in, press Run ▶ in Android Studio.
- Sideload: copy `app-debug.apk` to the phone, open it, and allow "Install unknown apps" for your file manager when asked.

## Changing the game

Edit `app/src/main/assets/index.html`, rebuild. You can also open that file in any browser to test quickly.

## Publishing to Google Play

Create an upload keystore (Build → Generate Signed Bundle / APK), point the `release`
signingConfig in `app/build.gradle.kts` at it, and upload the `.aab`.

## Versioning

See `CHANGELOG.md` for what changed in each release and `CODE-CHANGES.md` for the technical detail and release checklist. Snapshots and diffs live in `versions/`.


The version shown on the title screen is `VERSION` near the top of the script in `index.html`.
When you release, bump it there and keep `versionName` (and increase `versionCode`) in `app/build.gradle.kts` to match.

## Web app

The `web/` folder is an installable web app (PWA) built from the same game file. See `HOSTING.md` for how to put it online and share it.
