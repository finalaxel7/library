var App = new Vue({
    el: '#vue-categories',
    data: {
        view: false,
        datos: {},
        id: 0,
    },
    mounted() {
        loadingApp.desactivar();
    },
    created() {
    },
    methods: {
        new_category() {
            $('#new').modal('show');
            this.datos = {};
            this.id = 0;
        },
        confirmNew(e) {
            let data = $(e.target).serialize();
            loadingApp.activar('Loading...');
            $.post(ajaxurl + (this.id == 0 ? '/new_c' : '/edit'), data).done((res) => {
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
                $('#new').modal('hide');
            }).fail(() => {
                loadingApp.desactivar();
                swal('Error', 'Error', 'error');
            });
        },
        delete(data) {
            swal({
                title: "Continue?",
                text: 'Deleting category ' + data.name + ' is not reversible',
                icon: "warning",
                buttons: ['Cancel', 'Acept'],
                dangerMode: true,
            })
                .then((willDelete) => {
                    if (willDelete) {
                        loadingApp.activar();
                        $.post(ajaxurl + '/delete_c', {'id': data.id}).then(function (res) {
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
    }
});
