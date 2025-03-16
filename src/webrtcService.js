let localStream, remoteStream, peerConnection;

const configuration = {
    iceServers: [
    {
        urls:['stun:stun1.1.google.com:19302', 
            'stun:stun2.1.google.com:19302',
            'stun:71.84.73.60:3478',               
            'turn:71.84.73.60:3478?transport=udp', 
            'turn:71.84.73.60:5349?transport=tcp'  
        ],
        username:'test',
        credential:'test123'
    },
    ]
};

// const configuration = {
//     iceServers: [
//         {   urls:'stun:stun1.1.google.com:19302'    },
//         {   urls: 'stun:stun2.1.google.com:19302'   }
//     ]
// };
const webrtcService = {
async init() {
    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false});
    document.getElementById('user-1').srcObject = localStream;
    return localStream
},

async createOffer(setsdpOffer){
    peerConnection = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    })

    remoteStream = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;

    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach((track) => {
            console.log('track')
            remoteStream.addTrack(track)
        })
    }

    let offer = await peerConnection.createOffer();

    peerConnection.onicecandidate = async (event) => {
        if(event.candidate){
            setsdpOffer = JSON.stringify(peerConnection.localDescription);
        }
    }

    await peerConnection.setLocalDescription(offer);
    return([JSON.stringify(offer), remoteStream])
},

async createAnswer(sdpOffer, setsdpAnswer){
    peerConnection = new RTCPeerConnection(configuration);


    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    })

    remoteStream = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;

    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach((track) => {
            console.log('track')
            remoteStream.addTrack(track)
        })
    }

    await peerConnection.setRemoteDescription(JSON.parse(sdpOffer));

    let answer = await peerConnection.createAnswer();

    peerConnection.onicecandidate = async (event) => {
        if(event.candidate){
            setsdpAnswer(JSON.stringify(peerConnection.localDescription));
        }
    }

    // await peerConnection.setRemoteDescription(JSON.parse(sdpOffer));

    await peerConnection.setLocalDescription(answer);
    return[JSON.stringify(answer), remoteStream];
},

async handleAnswer(sdpAnswer){
    await peerConnection.setRemoteDescription(JSON.parse(sdpAnswer));
}
};

export default webrtcService;