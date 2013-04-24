function Background(){}

Background.prototype.bootstrap = function bootstrap(){
  this.radio = new FIPRadio();
};

Background.prototype.registerEvents = function registerEvents(){

};

Background.init = function init(){
  var instance = new Background();

  instance.bootstrap();

  return instance;
};