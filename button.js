$(document).ready(function () {
    var socket = io('http://localhost:8000');
    socket.on('connect', function () {
        socket.on('button', function (msg) {
            if (!Game) {
                return;
            }

            msg = msg - 510;

            if (msg > 100) {
                Game.Drive(msg * -1 * 2);
            }

            if (msg < -100) {
                Game.Drive(msg * -1 * 2);
            }
        });
    });
});