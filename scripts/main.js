import '../styles/anims.scss'

function setOverflow() {
  const body = document.body;
  if (window.innerWidth > 800) {
    body.style.overflow = 'hidden';
  } else {
    body.style.overflow = 'auto';
  }
}

const LANYARD_WS = "wss://api.lanyard.rest/socket";
const LANYARD_OP = {
  PRESENCE: 0,
  HELLO: 1,
  INITIALIZE: 2,
  HEARTBEAT: 3,
};
const EVENTS_TO_CALLBACK = ["INIT_STATE", "PRESENCE_UPDATE"];
const DISCORD_ID = "180456337518493697";

let spotifyBarTimer = null;

function initializeLanyard(callback) {
  let ws = new WebSocket(LANYARD_WS);

  ws.onmessage = ({ data }) => {
    const received = JSON.parse(data);

    switch (received.op) {
      case LANYARD_OP.HELLO: {
        ws.send(
          JSON.stringify({
            op: LANYARD_OP.INITIALIZE,
            d: { subscribe_to_id: DISCORD_ID },
          })
        );

        setInterval(() => {
          ws.send(JSON.stringify({ op: LANYARD_OP.HEARTBEAT }));
        }, 1000 * 30);
        break;
      }

      case LANYARD_OP.PRESENCE: {
        if (EVENTS_TO_CALLBACK.includes(received.t)) {
          callback(received.d);
        }
        break;
      }
    }
  };

  ws.onclose = () => initializeLanyard(callback);
}

initializeLanyard((data) => {
  setupBasicInfo(data);
  setupSpotify(data);
});

function setupBasicInfo({ discord_user, discord_status, activities }) {
  const { username, discriminator, avatar } = discord_user;
  const colorCodes = {
    online: "#30d158",
    offline: "#8e8e93",
    idle: "#ffd60a",
    dnd: "#ff453a",
  };

  let status = discord_status;

  for (const activity of activities) {
    if (activity.type === 4) {
      status = activity.state;
      break;
    }
  }

  const descriptionElement = document.getElementById("description");
  descriptionElement.innerText = `@${username} [${status}]`;
  descriptionElement.style.color = colorCodes[discord_status];
}

window.addEventListener('resize', setOverflow);
setOverflow();

function bdayCountdown() {
  const targetDate = new Date(2025, 2, 22);
  const currentDate = new Date();
  const diffTime = targetDate - currentDate;
  const left = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const descriptionElement = document.getElementById('bdaycd');
  if (left > 0) {
      descriptionElement.textContent = `${left} days till bday`;
  } else if (left === 0) {
      descriptionElement.textContent = "my bday is today :D 🎉";
  } else {
      descriptionElement.textContent = "update the date u moron";
  }
}
bdayCountdown();
setInterval(bdayCountdown, 86400000);

// click to enter

//document.getElementById('overlay').addEventListener('click', function () {
//  console.log("Overlay clicked!");
//  this.classList.add('fade-out');
//  const audio = document.getElementById('introAudio');
//  audio.play();
//  
//  setTimeout(() => {
//    this.style.display = 'none';
//  }, 500);
//});
//
//document.getElementById("overlay").addEventListener("click", async function() {
//  await new Promise(resolve => setTimeout(resolve, 500));
//  
//  document.getElementById("overlay").style.display = "none";
//});