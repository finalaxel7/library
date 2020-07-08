var App = new Vue({
    el: '#vue-books',
    data: {
        view: false,
        categories: {},
        datos: {},
        datos_or: {},
        id: 0
    },
    mounted() {
        loadingApp.desactivar();
    },
    created() {
        this.get_categories();
    },
    methods: {
        get_categories() {
            $.post(ajaxurl + '/categories').done((res) => {
                if (res.hasOwnProperty('categories')) {
                    if (typeof res.categories == 'object') {
                        this.categories = res.categories;
                    }
                }
            }).fail(res => {
                console.log(res)
            });
        },
        new_book() {
            $('#new').modal('show');
            this.datos = {};
            this.id = 0;
            this.view = false;
        },
        confirmNew(e) {
            let data = $(e.target).serialize();
            loadingApp.activar('Loading...');
            $.post(ajaxurl + (this.id == 0 ? '/new' : '/edit'), data).done((res) => {
                loadingApp.desactivar();
                if (res.error) {
                    swal('Error', res.message, 'error');
                    return;
                }
                swal('Success', res.message, 'success');
                this.view = true;
                if (res.hasOwnProperty('id')) {
                    this.id = res.id;
                }
                this.$refs['list'].change();
                this.get_categories();
            }).fail(() => {
                loadingApp.desactivar();
                swal('Error', 'Error', 'error');
            });
        },
        see_book(data) {
            App.id = data.id;
            App.datos = JSON.parse(JSON.stringify(data));
            App.view = true;
            $('#new').modal('show');
            Vue.nextTick( () => {
                App.$refs.hist.change()
            })
        },
        borrow(data) {
            $('#borrow').modal('show');
            App.id = data.id;
            App.datos = {};
        },
        confirmBorrow(e) {
            let data = $(e.target).serialize();
            loadingApp.activar('Loading...');
            $.post(ajaxurl + '/borrow', data).done((res) => {
                loadingApp.desactivar();
                if (res.error) {
                    swal('Error', res.message, 'error');
                    return;
                }
                swal('Success', res.message, 'success');
                $('#borrow').modal('hide');
                App.$children[0].change();
            }).fail(() => {
                loadingApp.desactivar();
                swal('Error', 'Error', 'error');
            });
        },
        delete(data) {
            swal({
                title: "Continue?",
                text: 'Deleting the book ' + data.name + ' is not reversible',
                icon: "warning",
                buttons: ['Cancel', 'Acept'],
                dangerMode: true,
            })
                .then((willDelete) => {
                    if (willDelete) {
                        loadingApp.activar();
                        $.post(ajaxurl + '/delete', {'id': data.id}).then(function (res) {
                            loadingApp.desactivar();
                            if (res.error) {
                                swal('Error', res.message, 'error');
                                return;
                            }
                            swal('Success', res.message, 'success');
                            App.$refs.list.change()
                        }).fail(() => {
                            loadingApp.desactivar();
                            swal('Error!', 'Error', 'error');
                        });
                    } else {

                    }
                });
        },
        return_book(data) {
            swal({
                title: "Continue?",
                text: 'I confirm the book ' + App.datos.name + ' has returned to the library',
                icon: "warning",
                buttons: ['Cancel', 'Acept'],
                dangerMode: true,
            })
                .then((willReturn) => {
                    if (willReturn) {
                        loadingApp.activar();
                        $.post(ajaxurl + '/return', {'book_id': App.id, 'registry_id': data.id}).then(function (res) {
                            loadingApp.desactivar();
                            App.$refs.hist.change()
                            App.$refs.list.change()
                        }).fail(() => {
                            loadingApp.desactivar();
                            swal('Error!', 'Error', 'error');
                        });
                    } else {

                    }
                });
        }
    }
});
