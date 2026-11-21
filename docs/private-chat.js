// Private family chat. A parent must configure Firebase and its restrictive
// Firestore rules before this feature can connect. Packs work without it.
const $ = id => document.getElementById(id);
const status = $('privateChatStatus');
const loginPanel = $('privateChatLogin');
const roomPanel = $('privateChatRoom');
const form = $('privateChatLoginForm');
const sendForm = $('privateChatSendForm');
const messages = $('privateChatMessages');
const config = window.POKE_PRIVATE_CHAT_CONFIG;
const setStatus = value => { status.textContent = value; };
if (!config || !config.apiKey || !config.projectId || !config.appId) {
  setStatus('Chat is not connected yet. Ask your dad to finish the one-time private chat setup.');
  $('privateChatSetup').hidden = false;
} else {
 try {
  const [{ initializeApp }, authLib, dbLib] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
  ]);
  const app = initializeApp(config);
  const auth = authLib.getAuth(app);
  const db = dbLib.getFirestore(app);
  const chatCollection = dbLib.collection(db, 'familyChat');
  let currentUser = null, unlisten = null, sending = false;
  setStatus('Sign in with one of the two approved accounts to chat.');
  loginPanel.hidden = false;
  function clearMessages(){ messages.replaceChildren(); }
  function showMessages(snapshot){
   clearMessages();
   if(snapshot.empty){setStatus('Private chat connected. Say hello!');return;}
   setStatus('Private chat connected. Only the two approved accounts can read or send messages.');
   snapshot.forEach(doc=>{
     const data=doc.data(), card=document.createElement('div');
     const heading=document.createElement('div'), body=document.createElement('div');
     const isMine = currentUser && data.uid===currentUser.uid;
     card.className='privateChatBubble'+(isMine?' mine':'');
     heading.className='privateChatSender';heading.textContent=isMine?'You':'Other player';
     body.className='privateChatText';body.textContent=String(data.text||'').slice(0,500);
     card.append(heading,body);messages.appendChild(card);
   });
   messages.scrollTop=messages.scrollHeight;
  }
  authLib.onAuthStateChanged(auth,user=>{
    currentUser=user;
    if(unlisten){unlisten();unlisten=null;}
    clearMessages();
    loginPanel.hidden=!!user;
    roomPanel.hidden=!user;
    if(!user){setStatus('Sign in with your private chat account.');return;}
    setStatus('Connecting to private chat…');
    const q=dbLib.query(chatCollection,dbLib.orderBy('sentAt','asc'),dbLib.limitToLast(100));
    unlisten=dbLib.onSnapshot(q,showMessages,err=>{
       setStatus(err?.code==='permission-denied'?
         'This account is not approved for the private chat. Ask your dad to check the two account IDs in the rules.':
         'Chat connection failed. Check the internet and ask your dad to check the Firebase setup.');
    });
  });
  form.addEventListener('submit',async event=>{
     event.preventDefault();
     const email=$('privateChatEmail').value.trim(),password=$('privateChatPassword').value;
     if(!email||!password)return;
     const btn=$('privateChatLoginButton');btn.disabled=true;setStatus('Signing in…');
     try{await authLib.signInWithEmailAndPassword(auth,email,password);$('privateChatPassword').value='';}
     catch(err){setStatus('Sign-in failed. Ask your dad to check the account and password.');}
     finally{btn.disabled=false;}
  });
  sendForm.addEventListener('submit',async event=>{
     event.preventDefault();
     if(!currentUser||sending)return;
     const input=$('privateChatInput'),value=input.value.trim();
     if(!value||value.length>500){setStatus('Write a message of 1 to 500 characters.');return;}
     sending=true;$('privateChatSendButton').disabled=true;
     try{
       await dbLib.addDoc(chatCollection,{uid:currentUser.uid,text:value,sentAt:dbLib.serverTimestamp()});
       input.value='';setStatus('Message sent.');
     }catch(err){setStatus('Message could not be sent. Check your connection and ask your dad to check the chat permissions.');}
     finally{sending=false;$('privateChatSendButton').disabled=false;}
  });
  $('privateChatLogout').addEventListener('click',()=>authLib.signOut(auth));
 } catch(err){
    setStatus('Chat could not start. Check your internet connection or ask your dad to check the setup.');
 }
}
