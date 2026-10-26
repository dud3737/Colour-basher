plugins {
    id("com.android.application")
}

android {
    namespace = "com.colourbasher.game"
    compileSdk = 37            // Android 17

    defaultConfig {
        applicationId = "com.colourbasher.game"
        minSdk = 26            // Android 8.0+
        targetSdk = 37         // Android 17
        versionCode = 30
        versionName = "2.0.2-beta"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            // Signed with the debug key so the release APK can be sideloaded straight away.
            // Swap for your own keystore before publishing to Google Play.
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
// No third-party dependencies: the game is plain HTML/JS running in the system WebView.
