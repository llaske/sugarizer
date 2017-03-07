var Emitter=function(){
  console.log("Emitter");
  var me={};
  me.emit=function(){
    console.log("EMinus:EMIT");
  }
  return me;
}
