import './App.css';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import webrtcService from './webrtcService';

function App() {
  const [option, setOption] = useState(null);
  const [sdpOffer, setsdpOffer] = useState(null);
  const [sdpAnswer, setsdpAnswer] = useState('');
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState(null);
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
  // return async () => {
  //  await webrtcService.stopLog();
  // }
  }, []);

  let intervalID = setInterval(()=>{
    if(sdpOffer != null && sdpAnswer !== '' && !connected && webrtcService.checkConnection()){
      setConnected(true);
      console.log('connection established');
      clearInterval(intervalID);
    }
  }, 2000)

  function onGenerateSDP (){
    setOption('caller');
    webrtcService.createOffer(setsdpOffer, setStats).then((offer) => {
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
    webrtcService.createAnswer(sdpOffer, setsdpAnswer, setStats).then((answer) => {
      setsdpAnswer(answer[0]);
      // user1.current.srcObject = answer[1];
    }).catch(console.error);
  }
  
  function hangUp() {
    // webrtcService.stopLog();
    setOption(null);
    setConnected(false);
    webrtcService.hangup();
    webrtcService.exportToJSON();
  }

  return (
    <div className="App">
      <h3>WebRTC Project</h3>
      <div className="Video">
        <video className="video-player"  id="user-1" autoPlay playsInline></video>
        <video className="video-player"  id="user-2" autoPlay playsInline></video>
      </div>
      {!option &&  <ButtonBar onGenerateSDP={onGenerateSDP} onAcceptSDP={onAcceptSDP}></ButtonBar>}
      {option==='caller' && !connected && <MessageBubble displayText={sdpOffer} title={'SDP Offer'}/>}
      {option==='caller' && !connected && sdpOffer!==null && <InputBubble title={'answer'} onClick={handleAnswer} onChange={setsdpAnswer}/>}
      {option==='receiver' && !connected && <InputBubble title={'offer'} onClick={handleOffer} onChange={setsdpOffer}/>}
      {option==='receiver'&& !connected && sdpAnswer!==null && <MessageBubble displayText={sdpAnswer} title={'SDP Answer'}/>}
      {connected && <Button className="hang" displayText={'Hang Up'} onClick={hangUp}></Button>}
      {connected && stats && <h2>{`${option} statistics:`}</h2> }
      {connected && stats && <StatsBubble stats={stats}/>}
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
       <div className="msg-title"> 
        <h3>{title}</h3> 
        <button className="but inv" onClick={() => navigator.clipboard.writeText(displayText)}><FontAwesomeIcon icon={faCopy} /></button>
        </div>
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

function StatsBubble({stats}){
  return (
    <>
      {[...stats].map((report) => (
        <div key={report[1].id}>
          <h3>{`Report type : ${report[1].type}`}</h3>
          <span>{`Time : ${report[1].timestamp}`}<br/></span>
          <span>{`ID : ${report[1].id}`}<br/></span>
          {Object.keys(report[1]).map((key) => {
            if (key !== 'id' && key !== 'timestamp' && key !== 'type') {
              if (typeof report[1][key] === 'object') {
                return <span>{`${key} : ${JSON.stringify(report[1][key])}`}<br/></span>
              } else{
              return <span>{`${key} : ${report[1][key]}`}<br/></span>
              }
            }
           })}
        </div>
      ))}
    </>
  )
}

export default App;
