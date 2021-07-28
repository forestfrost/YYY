const debounce = function(fn,delay){
  var timer = null;
  return function(){
    var that =this;
    var args = [...arguments]
    clearTimeout(timer);
    timer=setTimeout(() => {
      fn.call(that,...args);
    }, delay);
  }
}
const throttle = function(fn,delay){
  var flag = true;
  return function(){
    if(!flag) return;
    flag  = false;
    setTimeout(() => {
      fn.call(this,...arguments);
      flag=true;
    }, delay);
  }
}
export {
  debounce,
  throttle
}