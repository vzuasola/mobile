function scrollbot(e, w) {

  // e - Element
  // w - scrollbar width
    var _this = this;
    this.orgPar = document.querySelector(e);
    this.bodyTag = document.body;

    // init function, if not ie 8 and below this will run
    this.init = function(){
      if (w == undefined) {
          this.sbw = 5;
      } else {
          this.sbw = w;
      }
      // scrollspeed for scroll trackpad click event
      this.scrollSpeed = 200;
      // parent content
      this.parContent = this.orgPar.innerHTML;
      this.orgPar.innerHTML = "";
      this.newPar = document.createElement("div");
      this.sbContainer = document.createElement("div");
      this.scrollBarHolder = document.createElement("div");
      this.scrollBar = document.createElement("div");
      this.inP = document.createElement("div");
      this.newPar.className = "scrollbot-outer-parent";
      this.scrollBarHolder.className = "scrollbot-scrollbar-holder";
      this.scrollBar.className = "scrollbot-scrollbar";
      this.inP.className = "scrollbot-inner-parent";
      this.newPar.style.position = "relative";
      this.newPar.style.paddingRight = this.sbw + "px";
      this.newPar.style.zIndex = "9999999";
      this.newPar.style.height = "100%";
      this.newPar.style.overflow = "hidden";
      this.inPWidth = (this.orgPar.clientWidth - this.sbw) + "px";
      this.inP.style.cssText = "height:100%;overflow-y:auto;overflow-x:hidden;padding-right:" + (this.sbw + 20) + "px;width:100%;box-sizing:content-box;";
      this.inP.innerHTML = this.parContent;
      this.inP.style.height = "100%";
      this.newPar.appendChild(this.inP);
      this.scrollBarHolder.appendChild(this.scrollBar);
      this.newPar.appendChild(this.scrollBarHolder);
      this.orgPar.appendChild(this.newPar);
      this.sbHeight = this.inP.clientHeight * 100 / this.inP.scrollHeight;
      this.mdown = false;
      this.customHeight = false;
      this.scrollElement = this.inP;
      this.orgPar.style.height = this.orgPar.offsetHeight + "px";
      this.onScroll = function(f) {
          _this.onScrollF = f
      };
      this.sB = {
          height: _this.sbHeight + "%",
      };

      if (this.inP.addEventListener) {
        this.inP.addEventListener("scroll", function() {
            _this.onScrollEvent();
        });
      } else {
        this.inP.attachEvent('on' + 'scroll', function(){
          _this.onScrollEvent();
        });
      }

      this.onScrollEvent = function() {
        _this.scrollBar.style.top = _this.inP.scrollTop * 100 / _this.inP.scrollHeight + (_this.sbHeight - parseFloat(_this.sB.height)) * _this.inP.scrollTop / (_this.inP.scrollHeight - _this.inP.clientHeight) + "%";
          if ("onScrollF" in _this) {
            _this.onScrollF();
          }
      }

      this.setScroll = function(p, d) {
          if (d == undefined || d <= 0) d = 500;
          if (p >= _this.inP.scrollHeight - _this.inP.clientHeight){p = _this.inP.scrollHeight - _this.inP.clientHeight;};

          var difference = p - _this.inP.scrollTop;
          var perTick = difference / d * 10;

          setTimeout(function() {
              _this.inP.scrollTop += perTick;
              if (Math.abs(p - _this.inP.scrollTop) < 5) return;
              _this.setScroll(p, d - 10);
          }, 10);
      }

      if (this.bodyTag.addEventListener) {
          this.scrollBarHolder.addEventListener('mousedown', function(e) {
              _this.scrollBarHolderMouseDown(e);
          });
          this.scrollBar.addEventListener('mousedown', function(e) {
              _this.scrollbarMouseDown(e);
            });
          this.bodyTag.addEventListener('mousemove', function(e) {
              _this.mousemove(e);
          });
      } else {
          this.scrollBarHolder.attachEvent('on' + 'mousedown', function(e){
              _this.scrollBarHolderMouseDown(e);
          });
          this.scrollBar.attachEvent('on' + 'mousedown', function(e) {
              _this.scrollbarMouseDown(e);
          });
          this.bodyTag.attachEvent('on' + 'mousemove', function(e) {
              _this.mousemove(e);
          });
      }

      this.scrollBarHolderMouseDown = function(e) {
          e = e || window.event;
          var target = e.target || e.srcElement;
          if (target != this.scrollBarHolder) return;
          var relPos = (e.clientY - _this.scrollBarHolder.getBoundingClientRect().top) * 100 / _this.scrollBarHolder.clientHeight;
          _this.setScroll(_this.inP.scrollHeight * relPos / 100, _this.scrollSpeed);
      }

      this.scrollbarMouseDown = function(e) {
          _this.mdown = true;
          _this.posCorrection = e.clientY - _this.scrollBar.getBoundingClientRect().top;
          _this.btmCorrection = _this.scrollBar.clientHeight * 100 / _this.newPar.clientHeight;
          return false;
      }
      
      this.bodyTag.onmouseup = function() {
          _this.mdown = false;
      }

      this.mousemove = function(e) {
          if (_this.mdown) {
              if (document.selection) {
                  document.selection.empty();
              } else {
                  window.getSelection().removeAllRanges();
              }
              _this.relY = e.clientY - _this.newPar.getBoundingClientRect().top;
              _this.pC = (_this.relY - _this.posCorrection) * 100 / _this.newPar.clientHeight;
              if (_this.pC >= 0 && (_this.pC + _this.btmCorrection) <= 100) {
                  _this.scrollBar.style.top = _this.pC + "%";
                  _this.inP.scrollTop = (parseFloat(_this.scrollBar.style.top) - (_this.sbHeight - parseFloat(_this.sB.height)) * _this.inP.scrollTop / (_this.inP.scrollHeight - _this.inP.clientHeight)) * _this.inP.scrollHeight / 100;
              } else {
                  if (_this.pC < 0 && parseFloat(_this.scrollBar.style.top) > 0) {
                      _this.scrollBar.style.top = "0%";
                      _this.inP.scrollTop = 0;
                  }
              }
              if ("onScrollF" in _this) {
                  _this.onScrollF();
              }
          } else {
              return false;
          }
      }



      this.refresh = function() {
          _this.sbHeight = _this.inP.clientHeight * 100 / _this.inP.scrollHeight;
          if (_this.sbHeight >= 100) {
              _this.scrollBarHolder.style.display = "none";
          } else {
              _this.scrollBarHolder.style.display = "block"
          }
          _this.sbHeight = this.inP.clientHeight * 100 / this.inP.scrollHeight;
          _this.sB["height"] = _this.customHeight ? _this.sB["height"] : _this.sbHeight + "%";
          if (_this.inP.scrollHeight > _this.inP.clientHeight) {
              _this.scrollBar.style.height = _this.sB.height;
          }
      }
      this.refresh();
    }

    this.destroy = function(){
      _this.orgPar.innerHTML = _this.parContent;
      _this.orgPar.style.overflow = "auto";
      _this.init = null;
    }

    _this.init();

}

export default scrollbot;