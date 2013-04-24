/**
 *
 * @constructor
 */
function FIPRadio(){
  /**
   *
   * @type {string}
   */
  this.url = "http://mp3.live.tv-radio.com/fip/all/fiphautdebit.mp3";

  /**
   *
   * @type {null}
   */
  this.audio = null;

  this.state = 'paused';
}

/**
 *
 */
FIPRadio.prototype.bootstrap = function bootstrap(){

};

/**
 *
 */
FIPRadio.prototype.configureAudio = function configureAudio(){
  var self = this;
  var audio = new Audio();

  audio.preload = "auto";
  audio.src = this.url;

  audio.addEventListener('error', function(e){
    console.log("An error occured.")
    console.dir(e);

    self.stop();
  });

  audio.addEventListener('stalled', function(e){
    console.log("An error occured (stall).")
    console.dir(e);

    self.stop();
  });

  audio.addEventListener('stalled', FIPRadio.logEvent);
  audio.addEventListener('waiting', FIPRadio.logEvent);
  audio.addEventListener('loadeddata', FIPRadio.logEvent);
  audio.addEventListener('canplay', FIPRadio.logEvent);
  audio.addEventListener('loadstart', FIPRadio.logEvent);
  audio.addEventListener('emptied', FIPRadio.logEvent);
  audio.addEventListener('play', FIPRadio.logEvent);
  audio.addEventListener('pause', FIPRadio.logEvent);

  audio.load();

  this.audio = audio;
};

FIPRadio.prototype.isPlaying = function isPlaying(){
  return this.state === 'playing';
};

FIPRadio.prototype.isPaused = function isPaused(){
  return this.state === 'paused';
};

/**
 *
 */
FIPRadio.prototype.play = function play(){
  if (!this.audio){
    this.configureAudio();
  }

  this.audio.src = this.url;
  this.audio.play();
  this.state = 'playing';   //not really true, should be 'buffering' then async 'playing'
};

/**
 *
 */
FIPRadio.prototype.stop = function stop(){
  this.audio.pause();
  this.audio.src = '';
  this.state = 'paused';
};

FIPRadio.prototype.pause = FIPRadio.prototype.stop;

FIPRadio.logEvent = function logEvent(event){
  console.log("Audio Element State: ", event.type);
};