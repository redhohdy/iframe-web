window.dataLayer = window.dataLayer || [];

let startDate = new Date();
let elapsedTime = 0;

const focus = function() {
    startDate = new Date();
};

const blur = function() {
    const endDate = new Date();
    const spentTime = endDate.getTime() - startDate.getTime();
    elapsedTime += spentTime;
};

const beforeunload = function() {
    const endDate = new Date();
    const spentTime = endDate.getTime() - startDate.getTime();
    elapsedTime += spentTime;

    
    window.dataLayer.push({
        event: 'page_time_spent',
        total_time: elapsedTime
    });

console.log('Total waktu di halaman parent:', elapsedTime, 'milliseconds');

const iframe = document.getElementById('myIframe');
iframe.contentWindow.postMessage({
    event: 'page_time_spent',
    total_time: elapsedTime
}, '*');
};


window.addEventListener('focus', focus);
window.addEventListener('blur', blur);
window.addEventListener('beforeunload', beforeunload);