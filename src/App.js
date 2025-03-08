import './App.css';
import { useState, useEffect, useRef } from 'react';
import webrtcService from './webrtcService';

function App() {
  const [option, setOption] = useState(null);
  const [sdpOffer, setsdpOffer] = useState(null);
  const [sdpAnswer, setsdpAnswer] = useState('');
  const user1 = useRef(null);
  const user2 = useRef(null);
  let localStream = null;

  useEffect(() => {
   const initStream =  async() => {
      try{
       localStream = await webrtcService.init();
    } catch (error){
      console.error(error);
    }
  }
  initStream();
  }, []);

  function onGenerateSDP (){
    setOption('caller');
    webrtcService.createOffer(setsdpOffer).then((offer) => {
      setsdpOffer(offer[0]);
      // user2.current.srcObject = offer[1];
    }).catch(console.error);
    // user1.current.srcObject = localStream;
  }
  
  function onAcceptSDP(){
    setOption('receiver');
    // user2.current.srcObject = localStream;
  }
  function handleAnswer(){
    webrtcService.handleAnswer(sdpAnswer).then(() => {
      console.log('answer handled');
    }).catch(console.error);
  }

  function handleOffer(){
    webrtcService.createAnswer(sdpOffer, setsdpAnswer).then((answer) => {
      setsdpAnswer(answer[0]);
      // user1.current.srcObject = answer[1];
    }).catch(console.error);
  }

  return (
    <div className="App">
      <h3>WebRTC Project</h3>
      <div className="Video">
        <video className="video-player"  id="user-1" autoPlay playsInline></video>
        <video className="video-player"  id="user-2" autoPlay playsInline></video>
      </div>
      {!option &&  <ButtonBar onGenerateSDP={onGenerateSDP} onAcceptSDP={onAcceptSDP}></ButtonBar>}
      {option==='caller' && <MessageBubble displayText={sdpOffer} title={'SDP Offer'}/>}
      {option==='caller' && sdpOffer!==null && <InputBubble title={'answer'} onClick={handleAnswer} onChange={setsdpAnswer}/>}
      {option==='receiver' &&<InputBubble title={'offer'} onClick={handleOffer} onChange={setsdpOffer}/>}
      {option==='receiver'&& sdpAnswer!==null && <MessageBubble displayText={sdpAnswer} title={'SDP Answer'}/>}
    </div>
  );
}

function ButtonBar({ onGenerateSDP, onAcceptSDP }) {
  return(     
  <div className="buttonBar">
    <Button className = "inv" displayText= "Invite User" onClick = {onGenerateSDP} ></Button>
    <Button className = "acp" displayText= "Accept Invite" onClick = {onAcceptSDP} ></Button>
  </div>
  )
}

function Button({className, displayText, onClick}) {
  return(
    <button className={`but ${className}`}onClick={onClick}>{displayText}</button>
  )
}

function MessageBubble({displayText, title}) {
  return (
    <div className="msg">
      <p className="grey">
        <h3>{title}</h3>
          {displayText}
      </p> 
    </div>
  )
}

function InputBubble({title, onClick, onChange}) {
  return (
    <div>
      <input type="text" className="ip" placeholder={`Paste SDP ${title}`} onChange={(value) => onChange(value.target.value)}/>
      <button className ="but acp" onClick={onClick} >Paste SDP {title}</button>
    </div>
  )
}

export default App;
