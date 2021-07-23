const debounce = function(fn,delay){
  var timer = null;
  return function(){
    clearTimeout(timer);
    setTimeout(() => {
      fn.call(this,...arguments);
    }, delay);
  }
}
export {
  debounce
}