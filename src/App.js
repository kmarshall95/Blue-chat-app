import React, { useRef, useState } from 'react';
import './App.css';

/*imports for firebase*/
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

/*Firebase hooks for react */
import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyABHZNcWW2g8P29pAPRoet3JZsJPGonePk",
    authDomain: "portbbddb.firebaseapp.com",
    projectId: "portbbddb",
    storageBucket: "portbbddb.appspot.com",
    messagingSenderId: "907919293394",
    appId: "1:907919293394:web:6e518f9bdffe0ffef7e60b",
    measurementId: "G-X507TW3LB6"
})

const auth = firebase.auth();
const firestore = firebase.firestore();



function App() {
 /*Check if Signed in*/
const [user] = useAuthState(auth);

  return (
    <div className="App">
      

      <section>
          {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}
/*Components */
/*Sign In with google */
function SignIn(){
  const signInWithGoogle = () =>{
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Google Login Here</button>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out, Have a great one!</button>
  )
}

function ChatRoom(){
  
  /*references for scoll*/
  const dummy = useRef();
  /*references a message*/
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  /*Add hook to listen for incoming messages*/
  const [messages] = useCollectionData(query, {idField: 'id'});
  
  const [formValue, setFormValue] = useState('');
  /*sends message */
  const sendMessage = async(e) => {

    e.preventDefault();

    const { uid, photoURL} = auth.currentUser;

    /*Create new document in firestore db */
    await messagesRef.add({
      text: formValue, 
      createdAt: firebase.firestore.FieldValue
      .serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');

    dummy.current.scrollIntoView({behavior:'smooth'});
  }


  /*Map over array of messages*/
  return(
    <>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      
      <div ref={dummy}></div>
    </main>
    
    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
      <button type="submit">Send</button>
    </form>
  </>
  )
}

function ChatMessage(props){
  const{ text, uid, photoURL} = props.message;
  
  /*Handle Sent and Recieve Marks with conditional css*/
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';



  return (
    <div className={'message ${messageClass}'}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )
}


export default App;
