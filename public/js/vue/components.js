/* VUE COMPONENTS
 * pag-table: 		tabla paginada dentro de vue
 * t-header:
 * d-header
 * confirm: 
 * vue-check:
*/
function existe(selector) {
    return document.querySelector(selector) != null;
}
var loadingApp = existe('#loading-app') ? new Vue({
    el: '#loading-app',
    data: {
        activo: false,
        message: ''
    },
    methods: {
        activar: function (message = '') {
            this.activo = true;
            this.message = message;
        },
        desactivar: function () {
            this.activo = false;
        }
    }
}) : false;

Vue.component('pag-table', {
	data: function () {
		return {
			//search
			limit_number: 10,
			order_val: '',
			buscar: '',
			results: [], 		// resultados de la tabla
			others: {},
			//tabla
			controlers: [],		// controladores de la tabla
			inner: -1,
			info: [], 			// informacion que no va ligada a tablas
			pages: 0,
			num_results: 0,
			error: true, 		// resultado de la operacion 
			msg: '', 			// mensaje de error
			//inner
			inner_error: false,
			//config
			loader: true,
			//extras
			ajax: false,
			page: 1,
			load_inner: false
		}
	},
	props: ['action', 'init_page', 'order_in', 'limit', 'columns', 'filter', 'filters', 'w_filters'],
	computed: {
		selected_results: function () {
			return this.results.filter(function (result) {
				return result.selected;
			});
		},
	},
	filters: {
		money: function (value) {
			if (value) {
				return parseFloat(value).toFixed(2);
			}
		},
		date_time: function (value) {
			if (value) {
				var aux = value.split(' ');
				var valor = aux[0].split('-');
				return valor[2] + '/' + valor[1] + '/' + valor[0] + ' ' + aux[1];
			}
		},
		fecha: function (value) {
			if (value) {
				var valor = value.split(' ')[0];
				valor = valor.split('-');
				return valor[2] + '/' + valor[1] + '/' + valor[0];
			}
		},
		strtime: function (value) {
			if (value) {
				return moment(value * 1000).format('DD/MM/YYYY hh:mm:ss');
			}
		},
		fileName: function (value) {
			return value.split('/').pop();
		},
		id: function (value) {
			var str = "" + value
			var pad = "000000"
			var ans = pad.substring(0, pad.length - str.length) + str
			return ans;
		}
	},
	watch: {
		filter: 'change',
		limit_number: 'change',
	},
	methods: {
		//  table function
		first: function () {
			this.page = 1;
			this.inner = -1;
			this.change();
		},
		prev: function () {
			if (this.page > 1) { this.page--; }
			this.inner = -1;
			this.change();
		},
		change_page: function (event) {
			this.page = parseInt($(event.target).html());
			this.inner = -1;
			this.change();
		},
		next: function () {
			if (this.page < this.pages) { this.page++; }
			this.inner = -1;
			this.change();
		},
		last: function () {
			this.page = this.pages;
			this.inner = -1;
			this.change();
		},
		order: function (event, order) {
			$el = $(event.target)
			if (!order) {
				this.order_val = '';
			} else {
				if (order == this.order_val) {
					if ($el.closest(".th-header").hasClass("asc")) {
						this.order_val = order + " DESC";
					} else {
						this.order_val = order;
					}
				} else {
					this.order_val = order;
				}
			}

			this.change(true);
		},
		change_filters: function () {
			this.page = 1;
			this.inner = -1;
			this.change();
		},
		update: function () {
			this.$forceUpdate();
		},
		show_inner: function (i, selector = 'slide_inner') {
			if (selector == 'slide_inner') {
				i = parseInt(i);
				var $this = this;
				this.load_inner = true;
				if (this.inner != i && this.inner != -1) {
					$("." + selector).slideToggle(600, function () {
						$this.inner = -1;
						$this.show_inner(i);
					});
				} else {
					if (this.inner == -1) {
						this.inner = i;
						Vue.nextTick(function () {
							$("." + selector).slideToggle(600, function () { $this.load_inner = false; });

						})
					} else {
						if (this.inner == i) {
							Vue.nextTick(function () {
								$("." + selector).slideToggle(600, function () {
									$this.inner = -1;
									$this.load_inner = false;
								});
							})
						} else {
							this.inner = i;
							Vue.nextTick(function () {
								$("." + selector).slideToggle(600, function () { $this.load_inner = false; });
							})
						}
					}
				}
			} else {
				$("." + selector).slideToggle(600);
			}
			this.$forceUpdate();
		},
		invert_var: function (r, i) {
			r[i] = !r[i];
			this.$forceUpdate();
		},
		select_result: function (i) {
			Vue.set(this.results[i], 'selected', !this.results[i].selected)
		},
		//actions
		confirm: function (id, message, action, target) {
			var $modal = $(target);
			$modal.modal('show');
			$modal.find(".id").val(id);
			$modal.find(".msg").html(message);
			$modal.find(".action").val(action);
		},
		modal: function (event, target, input, info) {
			$(target).find(input).val(info);
		},
		call_parent: function (funct, data = '') {
			eval("this.$parent.$options.methods." + funct + "(data)");
		},
		change_limit_number(number) {
			if (this.limit_number != number) {
				this.limit_number = number;
				this.change();
			}
		},
		change: function (inner = false) {
			var $this = this;
			var data = "action=" + this.action + "&page=" + parseInt($this.page) + "&order=" + this.order_val + "&num_results=" + this.limit_number + (this.filter ? '&filter=' + this.filter : '') + "&search=" + this.buscar;
			if (this.others) {
				if ((Object.keys(this.others)).length > 0) {
					keys = Object.keys(this.others);
					for (i = 0; i < keys.length; i++) {
						data += "&" + keys[i] + "=" + eval('this.others.' + keys[i]);
					}
				}
			}
			if (this.filters) {
				if ((Object.keys(this.filters)).length > 0) {
					keys = Object.keys(this.filters);
					for (i = 0; i < keys.length; i++) {
						data += "&" + keys[i] + "=" + eval('this.others.' + keys[i]);
					}
				}
			}
			if (this.ajax != false) {
				this.ajax.abort();
			}

			var $container = $(this.$el);
			if (this.loader) {
				if ($container.find(".table-loader").length != 0) {
					var $over_container = $container.find(".table-loader");
				} else {
					var $over_container = $container;
				}
				var width = $over_container.width();
				var height = $over_container.height() - 48;;
				$over_container.prepend('<div class="vue-overlay" style="width:' + width + 'px; height: ' + height + 'px; "><i class="fa fa-cog fa-spin" style="margin-top:' + ((height / 2) - 20) + 'px;"></i></div>');
			}
			on_ajax = true;
			ajax = $.post(ajaxurl + this.action, data, (res) => {
				if (inner) {
					$this.inner = -1;
				}
				$('.vue-overlay').remove();
				if (!res.hasOwnProperty('results')) {
					$this.error = true;
					$this.msg = res.hasOwnProperty('message') ? res.message : 'No results found';
					$this.results = [];
					$this.page = 1;
					$this.pages = 1;
					$this.controlers = { pages: [{ number: '1', active: 'active' }], msg: 'No results found' };
				} else {
					$this.error = false;
					$this.results = res.results;
					var controlers = {};
					if (res.hasOwnProperty('num_resultados')) {
						$this.pages = res.hasOwnProperty('pages') ? res.pages : ((res.num_resultados % $this.limit_number) > 0 ? parseInt(res.num_resultados / $this.limit_number) + 1 : parseInt(res.num_resultados / $this.limit_number));
						controlers.first_result = (($this.page - 1) * $this.limit_number) + 1;
						controlers.last_result = controlers.first_result + res.results.length - 1;
						if ($this.page == 1) {
							controlers.first = false;
							controlers.prev = false;
							controlers.first_page = 1;
						} else {
							controlers.first = true;
							controlers.prev = true;
							if (($this.page - 2) > 0) {
								controlers.first_page = $this.page - 2;
							} else {
								controlers.first_page = 1;
							}
						}
						if ($this.page == $this.pages) {
							controlers.last = false;
							controlers.next = false;
						} else {
							controlers.last = true;
							controlers.next = true;
						}
						//pages
						controlers.paginas = [];
						controlers.last_page = controlers.first_page + 4;
						if (controlers.last_page >= $this.pages) {
							controlers.last_page = $this.pages;
							controlers.first_page = controlers.last_page - 4;
						}
						if (controlers.first_page <= 0) {
							controlers.first_page = 1;
						}
						$this.controlers = controlers;
						$this.controlers.pages = [];
						for (var i = controlers.first_page; i <= controlers.last_page; i++) {
							$this.controlers.pages.push({ "active": (i == $this.page) ? "active" : "", "number": i });
						}
						$this.controlers.msg = 'Showing results ' + controlers.first_result + ' to ' + controlers.last_result + ' of ' + res.num_resultados;
					} else {
					}
				}
				if (res.hasOwnProperty("controlers")) {
					keys = Object.keys(res.controlers);
					for (i = 0; i < keys.length; i++) {
						eval('$this.controlers.' + keys[i] + ' = res.controlers.' + keys[i]);
					}
				}
				if (res.hasOwnProperty("info")) {
					$this.info = res.info;
				} else { $this.info = []; }
				on_ajax = false;
			}).fail(function () {
				$('.vue-overlay').remove();
				$this.error = true;
				$this.msg = 'ERROR EN LA CONSULTA';
				$this.results = [];
				$this.page = 1;
				$this.pages = 1;
				$this.controlers = { pages: [{ number: '1', active: 'active' }], msg: 'No results found' };
			});
		},
		pass_to_excel: function ($e) {
			$($e.target).prop('disabled', true);
			var $this = this;
			var data = "action=" + this.action + "_excel&order=" + this.order_val + "&search=" + this.buscar;
			if (this.others) {
				if ((Object.keys(this.others)).length > 0) {
					keys = Object.keys(this.others);
					for (i = 0; i < keys.length; i++) {
						data += "&" + keys[i] + "=" + eval('this.others.' + keys[i]);
					}
				}
			}
			if (this.filters) {
				if ((Object.keys(this.filters)).length > 0) {
					keys = Object.keys(this.filters);
					for (i = 0; i < keys.length; i++) {
						data += "&" + keys[i] + "=" + eval('this.others.' + keys[i]);
					}
				}
			}
			$.post(ajaxurl + this.action + '_excel', data, function (res) {
				$($e.target).prop('disabled', false);
				if (res.hasOwnProperty('url')) {
					window.location.href = res.url;
				} else {
					swal("Error!", "No se genero el reporte", "warning");
				}
			}.bind(this)).fail(function () {
				$($e.target).prop('disabled', false);
				swal("Error!", "No se genero el reporte", "warning");
			}.bind(this));
		},
		pass_to_PDF: function () {
			if (this.others.fecha_inicial) {
				let parts = this.others.fecha_inicial.split('/');
				this.others.fecha_inicial = parts.join('-');
			} else {
				this.others.fecha_inicial = false;
			}

			if (this.others.fecha_fin) {
				let parts = this.others.fecha_fin.split('/');
				this.others.fecha_fin = parts.join('-');
			} else {
				this.others.fecha_fin = false;
			}

			window.location.href = siteurl + "/administracion/gastos/" + this.others.fecha_inicial + "/" + this.others.fecha_fin;
		}
	},
	created: function () {
		this.page = this.init_page;
		Vue.nextTick(function () {
			this.order_val = this.order_in ? this.order_in : false;
			this.limit_number = this.limit ? this.limit : this.limit_number;
			this.page = this.init_page ? this.init_page : this.page;
			this.change();
		}.bind(this))
	}
});
Vue.component('t-header', {
	template: "<th v-on:click=\"order($event)\" class=\"th-header text-left\" :class=\"{'asc' : (comp == variable), 'desc' : (comp == variable+' DESC'), 't-small': small }\" >" +
		"<a href=\"javascript:void(0);\" class=\"column-header-anchor sortable\">" +
		"<span class=\"text\">{{title}}</span>" +
		"<i class=\"icon fas \" :class=\"{'fa-sort-up' : (comp == variable && comp), 'fa-sort-down' : (comp == (variable + ' DESC') && comp)}\"></i>" +
		"</a>" +
		"</th>"

	/*"<th v-on:click=\"order($event)\" v-bind:class=\"{'active' : (comp == variable || comp == variable+' DESC')}\">"+
					"{{title}} <span><i class=\"fa\" v-bind:class=\"{'fa-angle-up' : (comp == variable), 'fa-angle-down' : (comp == variable+' DESC')}\"></i></span>"+
				"</th>"*/,
	props: ['title', 'variable', 'classes', 'small', 'comp'],
	methods: {
		order: function ($event) {
			this.$parent.order($event, this.variable)
		}
	},
	created: function () {
	}
})
Vue.component('d-header', {
	template:
		"<div class=\"text-left\" :class=\"classes\">" +
		"<a @click.prevent=\"order($event)\" href=\"javascript:void(0);\" class=\"column-header-anchor sortable th-header\" :class=\"{'asc' : (comp == variable), 'desc' : (comp == variable+' DESC'), 't-small': small }\">" +
		"<span class=\"text\">{{title}}</span>" +
		"<i class=\"icon fas \" :class=\"{'fa-sort-up' : (comp == variable && comp), 'fa-sort-down' : (comp == (variable + ' DESC') && comp)}\"></i>" +
		"</a>" +
		"</div>",
	props: ['title', 'variable', 'classes', 'small', 'comp'],
	methods: {
		order: function ($event) {
			this.$parent.order($event, this.variable)
		}
	},
	created: function () {
	}
})
Vue.component('confirm-action', {
	template: "<a v-tooltipster v-on:click.prevent=\"confirm\" href=\"#\" class=\"btn btn-danger\" :class=\"classes\" :title=\"title\"><i class=\"fa \" :class=\"[i]\"></i></a>",
	data: function () {
		return {

		}
	},
	props: ['texto', 'classes', 'action', 'after', 'i', 'mensaje', 'then', 'title', 'data'],
	methods: {
		//actions
		confirm: function () {
			var $this = this;

			swal({
				title: "¿Continuar?",
				text: this.mensaje,
				icon: "warning",
				buttons: ['Cancelar', 'Aceptar'],
				dangerMode: true,
			})
				.then((willDelete) => {
					if (willDelete) {
						loadingApp.activar();
						var data = $this.data;
						$.post(ajaxurl + $this.action, data).then(function (res) {
							loadingApp.desactivar();
							if (res.error) {
								swal(res.mensaje, {
									icon: "warning",
								});
							} else {
								swal("Acción completada", "", "success");
								eval('$this.$parent.' + $this.after);
							}
						}).fail(() => {
							loadingApp.desactivar();
							swal('Error!', 'Ocurrio un error al procesar tu solicitud', 'error');
							eval('$this.$parent.' + $this.after);
						});
					} else {
						//swal("Acción cancelada");
					}
				});
		},
	},
	created: function () {
	}
});
Vue.component('vue-check', {
	props: ['name', 'init_val', 'title', 'model', 'block', 'checktitle', 'after'],
	template:
		"<div class=\"p-2 pr-0 full-width d-flex justify-content-between align-items-center check-containter\" :class=\"{'line' : titlec}\" @click=\"change()\" >" +
		"<label>{{title}}</label>" +
		"<button type=\"button\" class=\"btn btn-checkbox\" :class=\"{'btn-primary': value}\"><i class=\"fa\" :class=\"{'fa-check-square-o': value, 'fa-square-o' : !value}\"></i></button>" +
		"<input type=\"hidden\" :value=\"value? 1 : 0\" :name=\"name\"/>" +
		"</div>",
	data: function () {
		return {
			value: "",
			titlec: false,
			action: ''
		}
	},
	watch: {
		init_val: function () {
			this.value = this.init_val && this.init_val != '0' ? true : false;
		},
		value: function () {
			if (this.model) {
				eval('this.$parent.' + this.model + ' = this.value');
				this.$parent.$forceUpdate();
			}
			if (this.after) {
				eval('this.$parent.' + this.after);
			}
		},
	},
	methods: {
		change() {
			let block = (this.block == 0 || !this.block) ? false : true;
			if (!block) {
				this.value = !this.value;
			}
		}
	},
	created: function () {
		this.titlec = this.checktitle == 'true' ? true : false;
		this.value = this.init_val && this.init_val != '0' ? true : false;
	}
});