

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

exports.init = function (settings)
{
    /**
     * Global variables
     */
    // latest 100 messages
    // list of currently connected clients (users)
    var clients = [];
    var colours = [];

    /**
     * HTTP server
     */
    var server = http.createServer(function (request, response)
    {
        // Not important for us. We're writing WebSocket server, not HTTP server
    });
    server.listen(settings.presence.port, function ()
    {
        console.log("Presence Server is listening on port " + settings.presence.port+"...");
    });

    /**
     * WebSocket server
     */
    var wsServer = new webSocketServer(
    {
        // WebSocket server is tied to a HTTP server. WebSocket request is just
        // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
        httpServer: server
    });

    // This callback function is called every time someone
    // tries to connect to the WebSocket server
    wsServer.on('request', function (request)
    {
        // accept connection - you should check 'request.origin' to make sure that
        // client is connecting from your website
        var connection = request.accept(null, request.origin);
        // we need to know client index to remove them on 'close' event
        var index = clients.push(connection) - 1;
        var userName = false;

        // user sent some message
        connection.on('message', function (message)
        {
            if (message.type === 'utf8')
            { // accept only text
                if (userName === false)
                { // first message sent by user is their name
                    // remember user name
                    //userName = message.utf8Data;
                    var rjson = JSON.parse(message.utf8Data);
                    userName = rjson.data[0];

                    clients[index][0] = userName;
                    colours[index] = rjson.data[1];
                    var json = JSON.stringify(
                    {
                        type: 2,
                        data: userName + ' has joined the chat'
                    })

                    broadcast(clients, json);
                    console.log((new Date()) + ' User is known as: ' + userName);

                }
                else
                { // log and broadcast the messages

                    var connectedUsernames = [];
                    var j = 0;
                    //storing all connected clients in connectedUserNames
                    for (var i = 0; i < clients.length; i++)
                    {
                        if (clients[i] != null)
                        {
                            connectedUsernames[j++] = clients[i][0];
                        }
                    }

                    var rjson = JSON.parse(message.utf8Data);


                    switch (rjson.type)
                    {
                    case 0:
                        var json = JSON.stringify(
                        {
                            type: 0,
                            data: rjson.data,
                            author: userName,
                            colour: colours[index]
                        });

                        broadcast(clients, json);
                        break;

                    case 1:
                        connection.sendUTF(JSON.stringify(
                        {
                            type: 1,
                            data: connectedUsernames
                        }));
                        break;

                    case 3:
                        var json = JSON.stringify(
                        {
                            type: 2, //for all system alerts
                            data: userName + 'has changed username to ' + rjson.data
                        });
                        userName = clients[index][0] = rjson.data;
                        broadcast(clients, json);
                        break;

                    default:
                        console.log("Unrecognised received json type");

                    }

                }
            }

        });

        // user disconnected
        connection.on('close', function (connection)
        {
            if (userName !== false)
            {
                console.log((new Date()) + " Peer " + userName + " disconnected.");
                // remove user from the list of connected clients
                //clients.splice(index, 1);
                clients[index] = null;

                var json = JSON.stringify(
                {
                    type: 2,
                    data: userName + ' has disconnected from chat'
                })

                broadcast(clients, json);
            }
        });

    });

    function broadcast(clients, json)
    {
        for (var i = 0; i < clients.length; i++)
        {
            if (clients[i] != null)
                clients[i].sendUTF(json);
        }
    }

}