import { ServerDatabase as db } from "./database";
import { User, Ping } from "./models";

// sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
// sudo iptables -D INPUT -p tcp --dport 3000 -j ACCEPT
// http://10.0.2.2:3000

const server = Bun.serve({
    port: 8080,
    async fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/create_account") {
            // To test: curl -X POST -H "Content-Type: application/json" -d '{"username": "test"}' http://localhost:3000/create_account
            console.log("Received a request on api /create_user");
            const bodyBuffer = await req.arrayBuffer();
            const bodyText = new TextDecoder().decode(bodyBuffer);
            const user_without_id: User = JSON.parse(bodyText);

            // const username: string = requestBody.username;
            console.log("/create_user - INPUT : username: " + user_without_id.username);

            db.openDatabase();
            const user_with_id = db.createUser(user_without_id);
            db.closeDatabase();
            console.log("/create_user - OUTPUT : user_id: " + user_with_id);
            console.log("Finished the request on api /create_user, responding");
            return Response.json(user_with_id);
        } else if (url.pathname === "/send_ping") {
            // test: curl -X POST -H "Content-Type: application/json" -d '{"user_id": "REPLACE_ID", "longitude": "123.3", "latitude": "123.8", "timestamp": "2023-01-01T12:34:56Z"}' http://localhost:3000/send_ping
            console.log("Received a request on api /send_ping");
            const bodyBuffer = await req.arrayBuffer();
            const bodyText = new TextDecoder().decode(bodyBuffer);
            const ping: Ping = JSON.parse(bodyText);

            console.log("/send_ping - INPUT : user_id: " + ping.user_id);
            console.log("/send_ping - INPUT : longitude: " + ping.longitude);
            console.log("/send_ping - INPUT : latitude: " + ping.latitude);
            console.log("/send_ping - INPUT : timestamp: " + ping.timestamp);

            db.openDatabase();
            db.insertPing(ping);
            db.closeDatabase();

            console.log("Finished the request on api /send_ping, responding");
            return new Response();
        } else if (url.pathname === "/get_ping") {
            // test: curl -X POST -H "Content-Type: application/json" -d '{"user_id_to_get_from": "REPLACE_ID"}' http://localhost:3000/get_ping/get
            console.log("Received a request on api /get_ping");
            const bodyBuffer = await req.arrayBuffer();
            const bodyText = new TextDecoder().decode(bodyBuffer);
            const receiver_user: User = JSON.parse(bodyText);

            console.log("/get_ping - INPUT : receiver_user.id: " + receiver_user.id);

            db.openDatabase();
            const ping: Ping = db.getPing(receiver_user);
            db.closeDatabase();
            console.log("/get_ping - OUTPUT :  ping.longitude: " + ping.longitude);
            console.log("/get_ping - OUTPUT :  ping.latitude: " + ping.latitude);
            console.log("/get_ping - OUTPUT :  ping.timestamp: " + ping.timestamp);

            console.log("Finished the request on api /get_ping, responding");
            return Response.json(ping);
        } else if (url.pathname === "/get_all_users") {
            // test: curl -X GET http://localhost:3000/get_all_users
            console.log("Received a request on api /get_all_users");
            db.openDatabase();
            let all_users: User[] = db.getAllUsers();
            db.closeDatabase();

            all_users.forEach((user) => {
                console.log(`/get_all_users - OUTPUT : all_users: Id: ${user.id}, Name: ${user.username}`);
            });
            console.log("Finished the request on api /get_all_users, responding");

            return Response.json(all_users);
        }
        else if (url.pathname === "/get_friends") {
            const bodyBuffer = await req.arrayBuffer();
            const bodyText = new TextDecoder().decode(bodyBuffer);
            const user: User = JSON.parse(bodyText);

            db.openDatabase();
            let friends: Person[] = db.getFriends(user_id_to_get_from);
            db.closeDatabase();

            return new Response(friends.toString());
        }
        else return new Response("404!");
    },
});

console.log(`Listening on http://localhost:${server.port} ...`);
