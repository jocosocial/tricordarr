React Native 0.81 Forklift
==========================

Temporary Project name: `kraken81`

* Is `.eslintrc.imports.js` needed?
* `android/app/src/debug/AndroidManifest.xml` may not be needed
*  `main/res/values/styles.xml` default:
    ```xml
    <resources>

        <!-- Base application theme. -->
        <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
            <!-- Customize your theme here. -->
            <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>
        </style>

    </resources>
    ```
    But we override with edge-to-edge stuff.
* The Photostream filter is broken!