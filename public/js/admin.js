/**
 * Created by GROOT on 7/7 0007.
 */
define('admin/plugins/aliyunoss', ['settings'], function(Settings) {
    var NALY = {};
    NALY.init = function() {
        Settings.load('alyoss', $('.aly-settings'), function(err, settings) {
            for(var setting in settings) {
                $('#' + setting).val(settings[setting]);
            }
        });

        $('#save').on('click', function(event) {
            Settings.save('alyoss', $('.aly-settings'), function() {
                app.alert({
                    type: 'success',
                    title: 'Reload Required',
                    message: 'Please reload your NodeBB to have your changes take effect',
                    clickfn: function() {
                        socket.emit('admin.reload');
                    }
                })
            });
        });
    };

    return NALY;
});