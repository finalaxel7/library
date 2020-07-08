/* PLUGINS DE JQUERY*/
Vue.directive('select2', {
    twoWay: true,
    bind: function (el, binding, vnode) {
      var $this = $(el);
      const vm = vnode.context
      var model = $this.data('bind') == 'valor' ? binding.value : binding.expression;
      Vue.nextTick(function () {
        var valor = $this.val();
        var data = {
          containerCssClass: ':all:'
        };
        if ($this.attr('data-nosearch')) {
          data.minimumResultsForSearch = -1;
        }
        if ($this.attr('dropdownParent')) {
          data.dropdownParent = $($this.parent());
        }
  
        $.fn.select2.amd.require(['select2/compat/matcher'], function (oldMatcher) {
          if ($this.attr('data-matchStart')) {
            data.matcher = oldMatcher(matchStart)
          }
          $select = $this.select2(data)
          if (model != '' && model != undefined) {
            if (valor != undefined) {
              eval('vm.' + model + ' = valor');
            } else if (eval('vm.' + model) != undefined) {
              valor = eval('vm.' + model);
            }
            vm.$forceUpdate();
            $(el).on("change", function (e) {
              window.change = true;
              $this = $(el);
              if ($this.attr('data-json') == 'true') {
                var json = $this.val();
                eval('vm.' + model + ' = JSON.parse(json)');
                eval('vm.' + model + '.value = json');
              } else {
                eval('vm.' + model + ' = $this.val()');
                $.each($(el).find(":selected").data(), function (index, val) {
                  if (index != 'data' && index != 'onchange') {
                    var m = model.split('.');
                    m.splice(m.length - 1, 1);
                    m = m.join('.');
                    eval(('vm.' + m + '.' + index + ' = val').replace('..', '.'));
                  }
                });
              }
              vm.$forceUpdate();
              if ($this.attr('data-onchange')) {
                eval('vm.' + $this.attr('data-onchange'));
              }
            }.bind(this)).on('select2:close', function (e) {
              if ($(el).attr("data-superReactive")) {
                if (!window.change) {
                  $(el).change();
                } else {
                  window.change = false;
                }
              }
            }).on('select2:open', function (e) {
              window.change = false;
            });
          } else if ($this.attr('data-onchange')) {
            $select.on("change", function (e) {
              eval('vm.' + $this.attr('data-onchange'));
            });
          }
        });
        //$this.hide();
      });
    },
    componentUpdated: function (el, binding, vnode) {
      var $this = $(el);
      const vm = vnode.context
      var model = $this.data('bind') == 'valor' ? binding.value : binding.expression;
      Vue.nextTick(function () {
        if (model != '' && model != undefined) {
          var valor = eval('vm.' + model);
          if (valor != undefined && valor != null && $(el).val() != valor) {
            if ($this.attr('data-json') == 'true') {
              $this.val(valor.value);
            } else if (Array.isArray(valor)) {
              for (var i = 0; i < valor.length; i++) {
                if ($this.find("option[value='" + valor[i] + "']").length == 0) {
                  valor.splice(i, 1)
                }
              }
              $this.val(valor);
            } else {
              $this.val(valor);
            }
            $(el).unbind('change');
            var data = {
              containerCssClass: ':all:'
            };
            if ($this.attr('data-nosearch')) {
              data.minimumResultsForSearch = -1;
            }
            if ($this.attr('dropdownParent')) {
              data.dropdownParent = $($this.parent());
            }
  
            $.fn.select2.amd.require(['select2/compat/matcher'], function (oldMatcher) {
              if ($this.attr('data-matchStart')) {
                data.matcher = oldMatcher(matchStart)
              }
              $(el).unbind('change');
              $select = $this.select2(data).change();
              $(el).on("change", function (e) {
                window.change = true;
                $this = $(el);
                if ($this.attr('data-json') == 'true') {
                  var json = $this.val();
                  eval('vm.' + model + ' = JSON.parse(json)');
                  eval('vm.' + model + '.value = json');
                } else {
                  eval('vm.' + model + ' = $this.val()');
                  $.each($(el).find(":selected").data(), function (index, val) {
                    if (index != 'data' && index != 'onchange') {
                      var m = model.split('.');
                      m.splice(m.length - 1, 1);
                      m = m.join('.');
                      eval(('vm.' + m + '.' + index + ' = val').replace('..', '.'));
                    }
                  });
                }
                vm.$forceUpdate();
                if ($this.attr('data-onchange')) {
                  eval('vm.' + $this.attr('data-onchange'));
                }
              }.bind(this));
            });
          }
        }
        Vue.nextTick(function () {
          $.each($(el).find(":selected").data(), function (index, val) {
            if (index != 'data' && index != 'onchange') {
              var m = model.split('.');
              m.splice(m.length - 1, 1);
              m = m.join('.');
              //console.log('vm.'+m+'.'+index);
              eval(('vm.' + m + '.' + index + ' = val').replace('..', '.'));
            }
          });
        })
      });
    }
  });