import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View ,Image, Alert,KeyboardAvoidingView,ToastAndroid} from 'react-native';
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
            scannedBookID:data,               
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

checkBookEligiblity=async()=>{
    const bookRef=await db.collection('books').where('bookId','==',this.state.scannedBookID).get()
    var transactionType=''
    if(bookRef.docs.length===0){
    transactionType=false
    }
    else{
        bookRef.docs.map((doc)=>{
var book = doc.data()
if (book.bookAvailability){
    transactionType='issue'

}
else{
    transactionType='return'
}
        })
    }
    return transactionType
}

checkStudentEligibleForBookIssue=async()=>{

    const studentRef = await db.collection('students').where('studentId','==',this.state.scannedStudentID).get()
    var isStudentEligible=''
    if(studentRef.docs.length==0){
        isStudentEligible=false 
        Alert.alert('student ID does not exist ')
        this.setState({
            scannedBookID:'',
            scannedStudentID:''
        })
    }

    else{
        studentRef.docs.map((doc)=>{
var student=doc.data()

if(student.numberOfBooksIssued <2){
        isStudentEligible=true
}

else{
    isStudentEligible=false
    Alert.alert('student already issued two books')
    this.setState({
        scannedBookID:'',
        scannedStudentID:''
    })
}
        })

        
    }

    return isStudentEligible

}

checkStudentEligibleForBookReturn=async()=>{

    const transactionRef = await db.collection('transactions').where('bookId','==',this.state.scannedBookID).limit(1).get()
    var isStudentEligible=''
  
    const studentRef = await db.collection('students').where('studentId','==',this.state.scannedStudentID).get()
    
    if(studentRef.docs.length==0){
        
        Alert.alert('student ID does not exist ')
        this.setState({
            scannedBookID:'',
            scannedStudentID:''
        })
    }
else{
transactionRef.docs.map((doc)=>{
var lastBookTransaction=doc.data()

if(lastBookTransaction.studentId===this.state.scannedStudentID){
isStudentEligible=true
}

else{
    isStudentEligible=false
    Alert.alert('the book wasnt issed by this student ')
    this.setState({
        scannedBookID:'',
        scannedStudentID:''
    })
}
})}
return isStudentEligible
}


handelTransaction=async()=>{
var transactionMessage;

var transactionType= await this.checkBookEligiblity()
db.collection('books').doc(this.state.scannedBookID).get()
if (!transactionType){
Alert.alert('book does not exist ')
this.setState({
    scannedBookID:'',
    scannedStudentID:''
})
}

else if (transactionType==='issue'){
var isStudentEligible= await this.checkStudentEligibleForBookIssue()

if(isStudentEligible){
    this.initateBookIssue()
    Alert.alert('book is issued')
}
}

else{
    var isStudentEligible= await this.checkStudentEligibleForBookReturn()
    if(isStudentEligible){
this.initateBookReturn()
Alert.alert('book is Returned')
    }
}
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
//Alert.alert('book Issued')
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
  //  Alert.alert('book returned')
  
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
        <KeyboardAvoidingView
        style={styles.container}
        behavior='padding'
        enabled
        >
<View>
<Image
      source={require('../assets/booklogo.jpg')}
      style={{width:200,height:200}}
      />
      <Text style={{textAlign:'center' ,fontSize:30}}>    WILY WONKA  </Text>

</View>

          <View style={styles.inputView}> 

                <TextInput style={styles.inputbox}
                placeholder='enter book ID'
                onChangeText={(text)=>{
                    this.setState({scannedBookID:text})
                }}
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
        onChangeText={(text)=>{
            this.setState({scannedStudentID:text})
        }}
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
        </KeyboardAvoidingView>

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