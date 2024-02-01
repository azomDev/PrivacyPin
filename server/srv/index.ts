import { ServerDatabase as db } from "./database";
import { Person, Ping } from "./models";

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
            const requestBody = JSON.parse(bodyText);

            const username: string = requestBody.username;
            console.log("/create_user - INPUT : username: " + username);

            db.openDatabase();
            const user_id: string = db.createUser(username);
            db.closeDatabase();
            console.log("/create_user - OUTPUT : user_id: " + user_id);
            console.log("Finished the request on api /create_user, responding");
            return new Response(user_id);
        } else if (url.pathname === "/send_ping") {
            // test: curl -X POST -H "Content-Type: application/json" -d '{"user_id": "REPLACE_ID", "longitude": "123.3", "latitude": "123.8", "timestamp": "2023-01-01T12:34:56Z"}' http://localhost:3000/send_ping
            console.log("Received a request on api /send_ping");
            const bodyBuffer = await req.arrayBuffer();
            const bodyText = new TextDecoder().decode(bodyBuffer);
            const requestBody = JSON.parse(bodyText);

            const user_id: string = requestBody.user_id;
            const longitude: number = requestBody.longitude;
            const latitude: number = requestBody.latitude;
            const timestamp: number = requestBody.timestamp;
            console.log("/send_ping - INPUT : user_id: " + user_id);
            console.log("/send_ping - INPUT : longitude: " + longitude.toString());
            console.log("/send_ping - INPUT : latitude: " + latitude.toString());
            console.log("/send_ping - INPUT : timestamp: " + timestamp.toString());

            db.openDatabase();
            db.insertPing(user_id, longitude, latitude, timestamp);
            db.closeDatabase();

            console.log("Finished the request on api /send_ping, responding");
            return new Response();
        } else if (url.pathname === "/get_ping") {
            // test: curl -X POST -H "Content-Type: application/json" -d '{"user_id_to_get_from": "REPLACE_ID"}' http://localhost:3000/get_ping/get
            console.log("Received a request on api /get_ping");
            const bodyBuffer = await req.arrayBuffer();
            const bodyText = new TextDecoder().decode(bodyBuffer);
            const requestBody = JSON.parse(bodyText);

            const user_id_to_get_from: string = requestBody.user_id_to_get_from;
            console.log("/get_ping - INPUT : user_id_to_get_from: " + user_id_to_get_from);

            db.openDatabase();
            let ping: Ping = db.getPing(user_id_to_get_from);
            db.closeDatabase();
            console.log("/get_ping - OUTPUT :  ping.longitude: " + ping.longitude.toString());
            console.log("/get_ping - OUTPUT :  ping.latitude: " + ping.latitude.toString());
            console.log("/get_ping - OUTPUT :  ping.timestamp: " + ping.timestamp.toString());

            console.log("Finished the request on api /get_ping, responding");
            return Response.json(ping);
        } else if (url.pathname === "/get_all_users") {
            // test: curl -X GET http://localhost:3000/get_all_users
            console.log("Received a request on api /get_all_users");
            db.openDatabase();
            let all_users: Person[] = db.getAllUsers();

            all_users.forEach((user) => {
                console.log(`/get_all_users - OUTPUT : all_users: Id: ${user.id}, Name: ${user.name}`);
            });
            console.log("Finished the request on api /get_all_users, responding");
            db.closeDatabase();

            return Response.json(all_users);
        }
        // else if (url.pathname === "/send_friend_request") {
        //     const bodyBuffer = await req.arrayBuffer();
        //     const bodyText = new TextDecoder().decode(bodyBuffer);
        //     const requestBody = JSON.parse(bodyText);

        //     const user_id = requestBody.user_id;
        //     const user_id_to_send_request = requestBody.user_id_to_get_from;

        //     db.openDatabase();
        //     db.createFriendRequest(user_id, user_id_to_send_request);
        //     db.closeDatabase();

        //     return new Response("Yes?");
        // }
        // else if (url.pathname === "/accept_friend_request") {
        //     const bodyBuffer = await req.arrayBuffer();
        //     const bodyText = new TextDecoder().decode(bodyBuffer);
        //     const requestBody = JSON.parse(bodyText);

        //     const user_id = requestBody.user_id;
        //     const user_id_to_send_request = requestBody.user_id_to_accept_from;

        //     db.openDatabase();
        //     // db.deleteFriendRequest(user_id, user_id_to_send_request);
        //     db.createFriendLink(user_id, user_id_to_send_request);
        //     db.closeDatabase();

        //     return new Response("Yes?");
        // }
        // else if (url.pathname === "/get_friends") {
        //     const bodyBuffer = await req.arrayBuffer();
        //     const bodyText = new TextDecoder().decode(bodyBuffer);
        //     const requestBody = JSON.parse(bodyText);

        //     const user_id_to_get_from = requestBody.user_id;

        //     db.openDatabase();
        //     let friends: Person[] = db.getFriends(user_id_to_get_from);
        //     db.closeDatabase();

        //     return new Response(friends.toString());
        // }
        else return new Response("404!");
    },
});

console.log(`Listening on http://localhost:${server.port} ...`);
