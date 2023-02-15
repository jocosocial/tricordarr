import React from "react";
import {SafeAreaView, ScrollView, StatusBar, Text, View} from "react-native";
import {Colors, Header} from "react-native/Libraries/NewAppScreen";
import {isDarkMode, backgroundStyle} from "../../styles";
import {Section} from "../Section"

export const MainView = () => {
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'}/>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header/>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            <Text>Foobar</Text>
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}