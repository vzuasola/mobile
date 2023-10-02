interface Promise<T> {
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

if ("undefined" === typeof Promise.prototype.finally) {
    Promise.prototype.finally = function(callback) {
        return this.then(callback, callback );
      };
}
