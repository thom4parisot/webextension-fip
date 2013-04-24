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
  var audio = new Audio();

  audio.preload = "auto";
  audio.src = this.url;
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

  this.audio.play();
  this.state = 'playing';   //not really true, should be 'buffering' then async 'playing'
};

/**
 *
 */
FIPRadio.prototype.stop = function stop(){
  this.audio.pause();
  this.state = 'paused';
};

FIPRadio.prototype.pause = FIPRadio.prototype.stop;