function MyPromise(fn) {
    var state = 'pending';
    var value;
    var deferred = null;

    function resolve(newValue) {
        try {
            if (newValue && typeof newValue.then === 'function') {
                newValue.then(resolve);
                return;
            }
            value = newValue;
            state = 'resolved';
            if (deferred) {
                handle(deferred);
            }
        } catch (error) {
            reject(error);
        }
    }

    function reject(err) {
        state = 'rejected';
        value = err;
        if (deferred) {
            handle(deferred);
        }
    }

    this.then = function(onResolved, onRejected) {
        return new MyPromise(function(resolve, reject) {
            handle({
                onResolved: onResolved,
                onRejected: onRejected,
                resolve: resolve,
                reject: reject
            })
        });
    };

    function handle(handler) {
        if (state === 'pending') {
            deferred = handler;
            return;
        }

        var handlerCallback;
            if(state === 'resolved') {
                handlerCallback = handler.onResolved;
            } else {
                handlerCallback = handler.onRejected;
            }

            if(!handlerCallback) {
                if (state === 'resolved') {
                    handler.resolve(value);
                } else {
                    handler.reject(value);
                }
                return;
            }
            var ret;
            try {
                ret = handlerCallback(value);
            } catch (error) {
                handler.reject(error);
                return;
            }
            handler.resolve(ret);
    }

    fn(resolve, reject);
}


function run() {
    return new MyPromise(function(resolve){
        var value = 42;
        resolve(value);
    })
}



function getSomeJson() {
    return new MyPromise(function(resolve) {
      var badJson = "<div>uh oh, this is not JSON at all!</div>";
      // console.log('badJson====');
      resolve(badJson);
    });
  }
  
  getSomeJson().then(function(json) {
    var obj = JSON.parse(json);
    console.log(obj);
  }).then(null, function(error) {
    console.log("an error occured: ", error);
  })