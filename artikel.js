
window.dataLayer = window.dataLayer || [];

// let startDate = new Date();
// let elapsedTime = 0;

// const focus = function() {
//     startDate = new Date();
// };

// const blur = function() {
//     const endDate = new Date();
//     const spentTime = endDate.getTime() - startDate.getTime();
//     elapsedTime += spentTime;
// };

// const beforeunload = function() {
//     const endDate = new Date();
//     const spentTime = endDate.getTime() - startDate.getTime();
//     elapsedTime += spentTime;


//     window.dataLayer.push({
//         event: 'iframe_time_spent',
//         total_time: elapsedTime
//     });
    
//     console.log('Total waktu di halaman iframe:', elapsedTime, 'milliseconds');
// };


// window.addEventListener('focus', focus);
// window.addEventListener('blur', blur);
// window.addEventListener('beforeunload', beforeunload);

function pushDataToGTM(buttonName) {
    const dataToPush = {
        event: 'general_event',
        event_name: buttonName,
        event_action: 'clicked on ' + buttonName,
    };

    window.dataLayer.push(dataToPush);
    console.log('Data telah dikirim ke dataLayer Iframe:', dataToPush);

    // Kirim pesan ke parent untuk juga push data ke dataLayer parent
    window.parent.postMessage({
        type: 'iframeButtonClick',
        dataLayer: dataToPush
    }, '*');
}

document.getElementById('iframeButton1').onclick = function() {
    pushDataToGTM('iframe_button1_clicked');
};

document.getElementById('iframeButton2').onclick = function() {
    pushDataToGTM('iframe_button2_clicked');
    window.parent.postMessage({
        type: 'changeIframeSource',
        newSource: 'artikel2.html'
    }, '*');
};

document.getElementById('iframeButton3').onclick = function() {
    pushDataToGTM('iframe_button3_clicked');

    setTimeout(() => {
        window.top.location.href = 'iframe-page2.html';
    }, 1000);
};

// Mendengarkan pesan dari parent
window.addEventListener("message", function(event) {
    if (event.data && event.data.type === 'iframeButtonClick') {
        const parentData = event.data.dataLayer;
        window.dataLayer.push(parentData);
        console.log('Data diterima dari parent dan dikirim ke dataLayer Iframe:', parentData);
    }
});

window.addEventListener("message", function(event) {
    if (event.data && event.data.type === 'iframeButtonClick') {
        const parentData = event.data.dataLayer;
        window.dataLayer.push(parentData);
        console.log('Data diterima dari parent dan dikirim ke dataLayer Iframe:', parentData);
    }
});

window.addEventListener('message', function(event) {
if (event.data.event === 'page_time_spent') {
    window.dataLayer.push({
        event: 'page_time_spent',
        total_time: event.data.total_time
    });
    
    console.log('Total waktu di iframe berdasarkan parent:', event.data.total_time, 'milliseconds');
    }
});