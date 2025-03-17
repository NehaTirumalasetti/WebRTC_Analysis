let localStream, remoteStream, peerConnection;
let logId, logData = [];
let statsCollection = [];

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

async createOffer(setsdpOffer, setStats){
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
    // this.startLog();
    this.pollStats(setStats);
    return([JSON.stringify(offer), remoteStream])
},

async createAnswer(sdpOffer, setsdpAnswer, setStats){
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
    // this.startLog();
    this.pollStats(setStats);
    return[JSON.stringify(answer), remoteStream];
},

async handleAnswer(sdpAnswer){
    await peerConnection.setRemoteDescription(JSON.parse(sdpAnswer));
},

//  startLog(){
//     if (logId){
//         logData = [];
//         clearInterval(logId);
//     }

//     logId = setInterval(async () => {
//         if (peerConnection){
//             const stats = await peerConnection.getStats();

//             stats.forEach((report) => {
//                 console.log(report);
//                 if (report.type === 'inbound-rtp' && report.kind === 'video') {
//                     logData.push({
//                         jitter: report.jitter,
//                         packetLoss: report.packetsLost,
//                         roundTripTime: report.roundTripTime,
//                         bitrate: report.bitrateMean
//                     });

//                     console.log(`Jitter: ${report.jitter}`);
//                     console.log(`Packet Loss: ${report.packetsLost}`);
//                     console.log(`Round Trip Time: ${report.roundTripTime}`); //doesn't exist
//                     console.log(`Bitrate: ${report.bitrateMean}`);
//                 }

//                 if (report.type === 'candidate-pair' && report.nominated) {
//                     console.log(`ICE Candidate: ${report.localCandidateId} -> ${report.remoteCandidateId}`);
//                     console.log(`Available Bandwidth: ${report.availableOutgoingBitrate}`);
//                 }
//             })
//         }   
//     }, 1000);
//  },

//  async stopLog(){
//     if (logId){
//         console.log('Stopping log', logId);
//         const fileHandle = await window.showSaveFilePicker({
//             suggestedName: 'webrtc-log.json'
//         });
//         const writable = await fileHandle.createWritable();
//         await writable.write(JSON.stringify(logData) + '\n');
//         await writable.close();
//         clearInterval(logId);
//     }
// }
checkConnection(){
    if(peerConnection!==null && peerConnection !== undefined){
        if(peerConnection.localDescription && peerConnection.remoteDescription){
            return true;
        }
    }
}, 

pollStats(setStats){
    setInterval(async() =>{
        if(peerConnection){
            peerConnection.getStats(null).then((stats) => {
            // let collectedStats = [];
            setStats(stats);             
            if(stats!== null){
                // console.log(stats);
                // stats.forEach((report) => {
                //     // console.log(report);
                //     collectedStats.push(report);
                // })
                 const collectedStats = Array.from(stats).map(([key, report]) => ({
                    id: report.id,
                    type: report.type,
                    timestamp: report.timestamp,
                    ...report // Spread the report for other fields
                }));
                statsCollection.push({
                    timestamp: new Date(),
                    stats: collectedStats
                });
            } else {
                console.log('no stats');
            }
            });
        }
    }, 1000)
},
hangup(){
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
        remoteStream = null;
    }
},
exportToJSON() {
    const jsonContent = JSON.stringify(statsCollection, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'webrtc-stats.json';
    a.click();

    URL.revokeObjectURL(url);
}

};

export default webrtcService;