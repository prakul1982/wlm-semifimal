import React from 'react';
import { Text, View, FlatList, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import db from '../config'
import { ScrollView } from 'react-native-gesture-handler';
export default class SearchScreen extends  React.Component{

constructor(){
    super()
    this.state={
        allTransactions:[],
        lastVisibleTransaction:null,
        search:''
    }
}

componentDidMount = async ()=>{
  const query = await db.collection("transaction").limit(12).get()
  query.docs.map((doc)=>{
    console.log(doc.data())
    this.setState({
     allTransactions:[...this.state.allTransactions,doc.data()],
   //   allTransactions:[],
      lastVisibleTransaction: doc
    })
    console.log("hh ")
  })
}

fetchMoreTransactions=async()=>{
    var text = this.state.search.toUpperCase()
    var entertext= text.split("")
    
    if(entertext[0].toUpperCase()==='B'){
    const transaction=await db.collection('transactions').where('bookId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
    transaction.docs.map((doc)=>{
        this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()],
            lastVisibleTransaction:doc
        })
    })
    }
    
    else if(entertext[0].toUpperCase()==='S'){
        const transaction=await db.collection('transactions').where('studentId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
        transaction.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],
                lastVisibleTransaction:doc
            })
        })
        }

}


searchTransactions=async(text)=>{
var entertext= text.split("")
var text = text.toUpperCase()

if(entertext[0].toUpperCase()==='B'){
const transaction=await db.collection('transactions').where('bookId','==',text).get()
transaction.docs.map((doc)=>{
    this.setState({
        allTransactions:[...this.state.allTransactions,doc.data()],
        lastVisibleTransaction:doc
    })
})
}

else if(entertext[0].toUpperCase()==='S'){
    const transaction=await db.collection('transactions').where('studentId','==',text).get()
    transaction.docs.map((doc)=>{
        this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()],
            lastVisibleTransaction:doc
        })
    })
    }
}
    render(){
        return (
        
<View styles={styles.container}>

<View styles={styles.searchBar}>

<TextInput styles={styles.bar}
placeholder='enter Book Id or Student Id'
onChangeText={(text)=>{
this.setStates({search:text})
}}
/>

<TouchableOpacity styles={styles.searchButton}
onPress={()=>{this.searchTransactions(this.state.search)
}}

>



</TouchableOpacity>


</View>


<FlatList
          data={this.state.allTransactions}
          renderItem={({item})=>(
            <View style={{borderBottomWidth: 2}}>
              <Text>{"Book Id: " + item.bookId}</Text>
              <Text>{"Student id: " + item.studentId}</Text>
              <Text>{"Transaction Type: " + item.transactionType}</Text>
              <Text>{"Date: " + item.date.toDate()}</Text>
            </View>
          )}
          keyExtractor= {(item, index)=> index.toString()}
          onEndReached ={this.fetchMoreTransactions}
          onEndReachedThreshold={1}
        /> 
</View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 100
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
  
    },
    bar:{
      borderWidth:2,
      height:50,
      width:300,
      paddingLeft:50,
    },
    searchButton:{
      borderWidth:1,
      height:100,
      width:50,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'green'

    }
  })