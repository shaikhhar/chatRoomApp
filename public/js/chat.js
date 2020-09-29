const socket = io();

// socket.on("countUpdated", (count) => {
//   console.log("The count has been updated", count);
// });

// document.getElementById("increment").addEventListener("click", () => {
//   console.log("clicked");
//   socket.emit("increment");
// });

// Elements
const $messageForm = document.getElementById("message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationSendButton = document.getElementById("send-location");
const $messages = document.getElementById("messages");
const $location = document.getElementById("location");
const $sidebar = document.getElementById("sidebar");

//Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sideBarTemplate = document.getElementById("sidebar-template").innerHTML;
//options

const autoScroll = () => {
  //new message element
  const $newMessage = $messages.lastElementChild;

  //height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $messages.offsetHeight;

  //height of messages container
  const containerHeight = $messages.scrollHeight;

  //how far I have scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on("message", (msg) => {
  const dateTime = new Date(msg.createdAt);
  console.log(dateTime);
  const html = Mustache.render(messageTemplate, {
    sender: msg.username,
    msg: msg.text,
    createdAt: getFormattedTime(dateTime),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (res) => {
  const dateTime = new Date(res.createdAt);
  console.log(res);
  const html = Mustache.render(locationTemplate, {
    sender: res.username,
    url: res.text,
    createdAt: getFormattedTime(dateTime),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //disable
  $messageFormButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    //enable
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("message sent");
  });
});

$locationSendButton.addEventListener("click", (e) => {
  //disable
  $locationSendButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Location service not supported by your browser");
  }
  navigator.geolocation.getCurrentPosition((location) => {
    //enable
    $locationSendButton.removeAttribute("disabled");
    const lat = location.coords.latitude;
    const lng = location.coords.longitude;
    socket.emit(
      "sendLocation",
      `https://www.google.com/maps/@${lat},${lng},20z`,
      (error) => {
        if (error) {
          return console.log(error);
        }
        console.log("location shared");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

const getFormattedTime = (dateTime) => {
  return (
    dateTime.getHours().toString().padStart(2, "0") +
    ":" +
    dateTime.getMinutes().toString().padStart(2, "0")
  );
};
