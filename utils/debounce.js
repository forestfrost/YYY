const debounce = function(fn,delay){
  var timer = null;
  return function(){
    clearTimeout(timer);
    setTimeout(() => {
      fn.call(this,...arguments);
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