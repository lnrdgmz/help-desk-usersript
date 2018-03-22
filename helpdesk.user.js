// ==UserScript==
// @name Help Desk Plus
// @namespace lnrdgmz
// @match *://helpdesk.makerpass.com/admin/help-desk/*
// @grant GM.getResourceUrl
// @require https://raw.githubusercontent.com/lodash/lodash/4.17.5/dist/lodash.js
// @resource soundA https://raw.githubusercontent.com/KDE/oxygen/master/sounds/Oxygen-Im-Contact-In.ogg
// @resource soundB https://raw.githubusercontent.com/KDE/oxygen/master/sounds/Oxygen-Sys-Special.ogg
// ==/UserScript===

/**
 * Settings
 */
const myStudents = [

];

const notificationFrequency = 20000;

/**
 * Add a button for toggling sound notifications and create click handlers
 */

const enableSound = () => {
  makeSound = _.throttle(makeSoundFunc, notificationFrequency, { leading: true, trailing: false })
  const button = document.getElementById('toggle-btn');
  button.onclick = () => {
    disableSound();
  }
  button.innerHTML = "Disable audio notifications"
}

const disableSound = () => {
  makeSound.cancel()
  makeSound = _.throttle(makeSoundFunc, Infinity, { leading: false, trailing: true })
  const button = document.getElementById('toggle-btn');
  button.onclick = () => {
    enableSound();
  }
  button.innerHTML = "Enable sound notification"
}

const buttonStyle = "position:absolute; top:0px; right:0px";
const toggleButton = document.createElement('button');
toggleButton.onclick = enableSound;
toggleButton.setAttribute('id', 'toggle-btn');
toggleButton.innerText = 'Enable sound notifications';
toggleButton.setAttribute('style', buttonStyle);
document.body.appendChild(toggleButton)


/**
 * Create buffers with the audio files
 */
const getBuffer = (url) => {
  return fetch(url).then(res => res.arrayBuffer())
    .then(res => ctx.decodeAudioData(res))
}

const ctx = new AudioContext();
let aBuff, bBuff;

(async function () {
  const sndAUrl = await GM.getResourceUrl('soundA');
  const sndBUrl = await GM.getResourceUrl('soundB');
  aBuff = await getBuffer(sndAUrl);
  bBuff = await getBuffer(sndBUrl);
})()

/**
 * makeSoundFunc takes a buffer of audio data and plays it through the previously created AudioContext
 */

const makeSoundFunc = (buffer) => {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.loop = false;
  source.start(0);
}
let makeSound = _.throttle(makeSoundFunc, Infinity, { leading: false, trailing: true });

/**
 * Functions for finding open tickets
 */

const userRegex = /by\s(\D*)\sin/;

const getUser = node => node.textContent.match(userRegex)[1];

const getOpenTickets = () => document.getElementsByClassName('open');

function checkOpen() {
  const openTickets = Array.from(getOpenTickets());
  openTickets.forEach(ticket => {
    const student = getUser(ticket);
    if (_.includes(myStudents, student)) {
      highlightTicket(ticket);
    }
  })
  if (openTickets.length === 0) return;
  const submitters = openTickets.map(getUser);
  if (submitters.some(str => _.includes(myStudents, str))) {
    makeSound(aBuff);
  } else {
    makeSound(bBuff);
  }
}
setInterval(checkOpen, 100);

const highlightTicket = (node) => {
  let style = node.getAttribute('style') || '';
  style += "background-color:#dee6f2;"
  node.setAttribute('style', style);
}