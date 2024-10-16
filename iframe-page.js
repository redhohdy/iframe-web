
window.dataLayer = window.dataLayer || [];

document.getElementById('parentButton').onclick = function() {
    const dataToPush = {
        event: 'general_event',
        event_name: 'parent_button_clicked',
        event_action: 'clicked on Parent Button',
    };

    window.dataLayer.push(dataToPush);
    console.log('Data telah dikirim ke dataLayer Parent:', dataToPush);

    // Kirim pesan ke iframe untuk juga push data ke dataLayer iframe
    const iframe = document.getElementById('myIframe');
    iframe.contentWindow.postMessage({
        type: 'iframeButtonClick',
        dataLayer: dataToPush
    }, '*');
};

// Mendengarkan pesan dari iframe
window.addEventListener("message", function(event) {
    if (event.data && event.data.type === 'iframeButtonClick') {
        const iframeData = event.data.dataLayer;
        window.dataLayer.push(iframeData);
        console.log('Data diterima dari iframe dan dikirim ke dataLayer Parent:', iframeData);
    }
});

window.addEventListener("message", function(event) {
    if (event.data && event.data.type === 'changeIframeSource') {
        document.getElementById('myIframe').src = event.data.newSource;
    }
});
