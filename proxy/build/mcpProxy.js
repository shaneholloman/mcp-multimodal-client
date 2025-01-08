export default function mcpProxy({ transportToClient, transportToServer, onerror, }) {
    let transportToClientClosed = false;
    let transportToServerClosed = false;
    transportToClient.onmessage = (message) => {
        transportToServer.send(message).catch(onerror);
    };
    transportToServer.onmessage = (message) => {
        transportToClient.send(message).catch(onerror);
    };
    transportToClient.onclose = () => {
        if (transportToServerClosed) {
            return;
        }
        transportToClientClosed = true;
        transportToServer.close().catch(onerror);
    };
    transportToServer.onclose = () => {
        if (transportToClientClosed) {
            return;
        }
        transportToServerClosed = true;
        transportToClient.close().catch(onerror);
    };
    transportToClient.onerror = onerror;
    transportToServer.onerror = onerror;
}
