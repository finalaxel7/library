/* FILTERS */
Vue.filter('upper', function (value) {
    if (!value) return '';
    return value.toUpperCase();
});

Vue.filter('capitalize', function (value) {
    if (!value) return '';
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
});

Vue.filter('number', function (value, numer = 2) {
    return parseFloat(value).toFixed(numer).replace(/\d(?=(\d{3})+\.)/g, '$&,');  // 12,345.67;
});

Vue.filter('money', function (value, numer = 2) {
    return '$ '+parseFloat(value).toFixed(numer).replace(/\d(?=(\d{3})+\.)/g, '$&,');
});

Vue.filter('unixtime', function (value) {
    if (!value) return '-';
    var date = new Date(value*1000);
    return moment(date).format('DD/MM/YYYY hh:mm:ss a')
});

Vue.filter('uid', function (value) {
    return value.split('-')[0]
});