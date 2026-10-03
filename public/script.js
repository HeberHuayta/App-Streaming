const socket = io({
    transports: ['websocket']
})
//  fix error 400

const button = document.getElementById('shareButton')
// const video = document.getElementById('screen')

const videoRemote = document.getElementById('remote')
// const buttonRemote = document.getElementById('reciveRemote')

// const answerInput = document.getElementById('answerInput')
// const buttonResponseInput = document.getElementById('responseInput')

// const offerInput = document.getElementById('offerInput')

const fullScreenButton = document.getElementById('fullScreenButton')

let peer



socket.on('offer', async (offer)=> {

    console.log('oferta recibida N')

    peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            }
        ]
    })

    peer.ontrack = (event)=> {

        videoRemote.srcObject = event.streams[0]
    }

    await peer.setRemoteDescription(offer)

    console.log('oferta aplicada N')



    const answer = await peer.createAnswer()

    await peer.setLocalDescription(answer)

    await new Promise(resolve => {

        if (peer.iceGatheringState === 'complete'){

            resolve()

            return
        }

        peer.onicegatheringstatechange = ()=> {

            if (peer.iceGatheringState === 'complete'){

                resolve()
            }
        }
    })


    socket.emit('answer', peer.localDescription)
    console.log('respuesta enviada')

})

socket.on('answer', async (answer) => {

    await peer.setRemoteDescription(answer)

    console.log('conexion exitosa')




    setInterval(async () => {

        const stats = await peer.getStats()

        stats.forEach(report => {

            if (
                report.type === 'outbound-rtp' &&
                report.kind == 'video'
            ) {
                console.log(report)
            }

        })
    },2000)

})

button.addEventListener("click", async() => {

    try{
        
        const stream = await navigator.mediaDevices.getDisplayMedia({

            video: {

                width: { ideal: 1920},
                height: {ideal: 1080},
                frameRate: {ideal: 60, max: 90}
            },
            audio: true
        })

        peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302'
                }
            ]
        })




        stream.getTracks().forEach( async track => {

            const senderTrack = peer.addTrack(track, stream)

            if (track.kind === 'video'){

                const parameters = senderTrack.getParameters()

                if(!parameters.encodings){

                    parameters.encodings = [{}]
                }

                parameters.encodings[0].maxBitrate = 15_000_000

                await senderTrack.setParameters(parameters);
            }
        })
        


        console.log("1")
        const offer = await peer.createOffer()
        console.log("2")

        await peer.setLocalDescription(offer)

        console.log("3")
        await new Promise(resolve => {

            if(peer.iceGatheringState === "complete"){
                resolve()

                return
            }

            //accede solo si hay cambios
            peer.onicegatheringstatechange = () => {

                if(peer.iceGatheringState === "complete"){
                    resolve()
                }
            }

            
        })

        console.log("4")
        socket.emit('offer', peer.localDescription)

    }catch(error){

        console.error(error)
    }
})


// buttonResponseInput.addEventListener("click", async() =>{

//     const answerRemote = JSON.parse(answerInput.value)

//      await peer.setRemoteDescription(answerRemote)
// })


// buttonRemote.addEventListener("click", async() => {

//     try{

//         peer = new RTCPeerConnection();

//         peer.ontrack = (event) => {

//             videoRemote.srcObject = event.streams[0]
//         }

//         const offer = JSON.parse(offerInput.value)

//         await peer.setRemoteDescription(offer)

//         const answer = await peer.createAnswer()

//         await peer.setLocalDescription(answer)


//         await new Promise(resolve => {

//             if (peer.iceGatheringState === "complete"){

//                 resolve()

//                 return
//             }

//             peer.onicegatheringstatechange = () => {

//                 if (peer.iceGatheringState === "complete") {
//                     resolve()
//                 }
//             }
//         })

//         console.log(JSON.stringify(peer.localDescription))

//     } catch(error){

//         console.error(error)
//     }
// })


fullScreenButton.addEventListener('click', ()=> {
    
    videoRemote.requestFullscreen()
})