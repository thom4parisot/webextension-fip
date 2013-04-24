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

/**
 *
 */
FIPRadio.prototype.play = function play(){
  if (!this.audio){
    this.configureAudio();
  }

  this.audio.play();
};

/**
 *
 */
FIPRadio.prototype.stop = function stop(){
  this.audio.pause();
};
FIPRadio.prototype.pause = FIPRadio.prototype.stop;