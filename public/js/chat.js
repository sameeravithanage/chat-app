const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () =>{
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the last message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messges container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage', (locationMessage)=>{
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username: locationMessage.username,
        location: locationMessage.location,
        createdAt: moment(locationMessage.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({room,users})=>{
    const html = Mustache.render(sidebarTemplate, {
    room,
    users
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit',(e) =>{
    
    // prevent default prevents the default behaviour of browser doing a full page refresh
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled', 'disabled')
    
    const message = e.target.elements.message.value

    socket.emit('sendMessage',message, (error)=>{
        
        $messageFormButton.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput.focus()

        if (error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

$locationButton.addEventListener('click', ()=>{
    if (!navigator.geolocation) {
      return alert('Geolocation not supported by your browser')
    }
    $locationButton.setAttribute('disabled', 'disabled') 

    navigator.geolocation.getCurrentPosition((position)=>{
    socket.emit('sendLocation', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },()=>{
          console.log('Location shared')
          $locationButton.removeAttribute('disabled')  
      })
    })
})

socket.emit('join', {username,room}, (error)=>{
    if (error) {
        alert(error)
        location.href = './'
    }
})
