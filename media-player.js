const audio = document.querySelector('audio')
const volumeBtn = document.querySelector('#volume-btn')
const volumeIcon = document.querySelector('#volume-btn i')
const playBtn = document.querySelector('#play-btn')
const playIcon = document.querySelector('#play-btn i')
let init = false
audio.volume = .2
audio.currentTime = 2;

audio && audio.addEventListener('play', () => {
  playIcon.classList = 'bi-pause-circle-fill'
})

// Stop ticking when the audio is stopped, both manually and via javascript.
audio && audio.addEventListener('pause', () => {
  playIcon.classList = 'bi-play-circle-fill'
})

// Set some cosmetic in the progressbar when the volume changes
audio && audio.addEventListener('volumechange', () => {
  vol = audio.volume
  localStorage.setItem('volume', vol)
  if(audio.volume === 0){
    volumeIcon.classList.add('bi-volume-mute')
  }else{
    volumeIcon.classList.remove('bi-volume-mute')
  }
})

playBtn.addEventListener('click', () => {
  if(audio.paused)
    audio.play()
  else
    audio.pause()
})

volumeBtn.addEventListener('click', () => {
  if(audio.volume == 0){
    audio.volume = .2;
    volumeIcon.classList = "bi-volume-up"
  }
  else{
    volumeIcon.classList = "bi-volume-mute"
    audio.volume = 0;
  }
})