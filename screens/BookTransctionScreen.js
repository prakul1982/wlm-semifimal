import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View ,Image, Alert} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import { TextInput } from 'react-native-gesture-handler';
import * as firebase from 'firebase';
import db from '../config.js'

export default class BookTransctionScreen extends  React.Component{

constructor(){
    super()
    this.state={
        hasCameraPermission:null,
        scanned:false,
        scannedData:'',
        buttonState:'normal',
        scannedBookID:'',
        scannedStudentID:'',
        transactionMessage:'',
    }
}

getCameraPermission = async(id)=>{
const {status}=await Permissions.askAsync(Permissions.CAMERA)
this.setState({hasCameraPermission:status==='granted',buttonState:id,scanned:false})
}

handleBarcodeScanner=async({type,data})=>{
    const{buttonState}=this.state
    console.log(data)
    if(buttonState==='bookID'){
        this.setState({
            scanned:true,
            buttonState:'normal',
            scannedBookId:data,               
        })
    }
    else if (buttonState==='studentID'){
        this.setState({
            scanned:true,
            buttonState:'normal',
            scannedStudentID:data,               
        })
    }
}

handelTransaction=async()=>{
var transactionMessage;
db.collection('books').doc(this.state.scannedBookID).get()
.then((doc)=>{
    console.log(doc.data())
    var book=doc.data()

    if(book.bookAvailability){
this.initateBookIssue()
transactionMessage='book Issued'
    }
    else{
        this.initateBookReturn
        transactionMessage='book Return '
    }
})
this.setState({
    transactionMessage:transactionMessage
})
}

initateBookIssue=async()=>{
db.collection('transactions').add({
    studentId:this.state.scannedStudentID,
    bookId:this.state.scannedBookID,
    date:firebase.firestore.Timestamp.now().toDate(),
    transactionType:'issue',

})
db.collection('books').doc(this.state.scannedBookID).update({
    bookAvailability:false,
})

db.collection('students').doc(this.state.scannedStudentID).update({
    numberOfBooksIssued:firebase.firestore.FieldValue.increment(1)
})
Alert.alert('book Issued')
this.setState({
    scannedBookID:'',

    scannedStudentID:'',

})
}

initateBookReturn=async()=>{
    db.collection('transactions').add({
        studentId:this.state.scannedStudentID,
        bookId:this.state.scannedBookID,
        date:firebase.firestore.Timestamp.now().toDate(),
        transactionType:'return',
    
    })
    db.collection('books').doc(this.state.scannedBookID).update({
        bookAvailability:true,
    })
    
    db.collection('students').doc(this.state.scannedStudentID).update({
        numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
    })
    Alert.alert('book returned')
    this.setState({
        scannedBookID:'',
    
        scannedStudentID:'',
        
    })
    }

    render(){
        
const hasCameraPermissions=this.state.hasCameraPermission;

const scanned = this.state.scanned

const button = this.state.buttonState
console.log(button)
if (button!=='normal'&& hasCameraPermissions) {
return(
    <BarCodeScanner
    onBarCodeScanned={scanned? undefined:this.handleBarcodeScanner}
    style={StyleSheet.absoluteFillObject}
    />
)
}
else if (button==='normal'){
    return (
        <View style={styles.container}>       
<View>
<Image
      source={require('../assets/booklogo.jpg')}
      style={{width:200,height:200}}
      />
      <Text style={{textAlign:'center' ,fontSize:30}}>    WILY  </Text>

</View>

          <View style={styles.inputView}> 

                <TextInput style={styles.inputbox}
                placeholder='enter book ID'
                value={this.state.scannedBookID}
                />
                <TouchableOpacity style={styles.scanButton}
                onPress={()=>{
                    this.getCameraPermission('bookID')
                }}
                >
                <Text style={styles.buttonText}
                scan book
                />
                </TouchableOpacity>
         </View>
         <View style={styles.inputView}> 

        <TextInput style={styles.inputbox}
        value={this.state.scannedStudentID}
        placeholder='enter Student ID'
        />
        <TouchableOpacity style={styles.scanButton}
         onPress={()=>{
            this.getCameraPermission('studentID')
        }}
        >
        <Text style={styles.buttonText}
        scan Student ID
        />
        </TouchableOpacity>
        </View>

        <TouchableOpacity styles={styles.submitButton}
        onPress={async ()=>{
            this.handelTransaction()
        }}>
<Text styles={styles.buttonText}>
Submit
</Text>
        </TouchableOpacity>
     </View>
    )
    }
    }
    }

const styles = StyleSheet.create({
canButton:{ backgroundColor: '#2196F3',padding: 10, margin: 10},
buttonText:{fontSize:20},
container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
displayText:{ fontSize: 15, textDecorationLine: 'underline' },
inputView:{ flexDirection: 'row', margin: 20 }, 
inputBox:{ width: 200, height: 40, borderWidth: 1.5, borderRightWidth: 0, fontSize: 20 }, 
scanButton:{ backgroundColor: '#66BB6A', width: 50, borderWidth: 1.5, borderLeftWidth: 0 },
submitButton:{ backgroundColor: '#FBC02D', width: 100, height:50 }, 
submitButtonText:{ padding: 10, textAlign: 'center', fontSize: 20, fontWeight:"bold", color: 'white' }
})