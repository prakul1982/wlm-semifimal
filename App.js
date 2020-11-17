import React from 'react';
import { StyleSheet, Text, View ,Image} from 'react-native';
import BookTransctionScreen from './screens/BookTransctionScreen'
import SearchScreen from './screens/SearchScreen'
import {createAppContainer} from 'react-navigation'
import {createBottomTabNavigator} from 'react-navigation-tabs'

export default class App extends React.Component {
  render(){
return (<AppContainer></AppContainer>)
}
}
 
const TabNavigator = createBottomTabNavigator({
  BookTransctionScreen:{ screen: BookTransctionScreen,
  navigationOptions:{
    tabBarIcon:<Image
    source={require('./assets/book.png')}
    style={{width:40,height:40}}
    />,
    tabBarLabel:'book Transaction'
  }
  },
  SearchScreen:{screen: SearchScreen,
    navigationOptions:{
      tabBarIcon:<Image
      source={require('./assets/searchingbook.png')}
      style={{width:40,height:40}}
      />,
      tabBarLabel:'Search book'
    }
  }
})

const AppContainer = createAppContainer(TabNavigator)