import { ServerDatabase as db } from "./database";
import { User, Ping, WithoutId, Link } from "./models";

// sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
// sudo iptables -D INPUT -p tcp --dport 3000 -j ACCEPT
// http://10.0.2.2:3000

async function getJsonObject(req: Request) {
    const bodyBuffer = await req.arrayBuffer();
    const bodyText = new TextDecoder().decode(bodyBuffer);
    return JSON.parse(bodyText);
}
// const username: string = requestBody.username;
// test: curl -X POST -H "Content-Type: application/json" -d '{"user_id": "AN_ID", "longitude": 123.3, "latitude": 123.8, "timestamp": 12345}' http://localhost:3000/send_ping
// test: curl -X GET http://localhost:3000/get_all_users

const server = Bun.serve({
    port: 8080,
    async fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/create_account") {
            console.log("Received a request on api /create_user");
            const user_without_id: WithoutId<User> = await getJsonObject(req)
            const user_with_id: User = db.createUser(user_without_id);
            return Response.json(user_with_id);
        } 
        else if (url.pathname === "/send_ping") {
            console.log("Received a request on api /send_ping");
            const ping: WithoutId<Ping> = await getJsonObject(req);
            console.log("/send_ping - INPUT : user_id: " + ping.user_id);
            console.log("/send_ping - INPUT : longitude: " + ping.longitude);
            console.log("/send_ping - INPUT : latitude: " + ping.latitude);
            console.log("/send_ping - INPUT : timestamp: " + ping.timestamp);
            db.insertPing(ping);
            return new Response();
        } 
        else if (url.pathname === "/get_ping") {
            console.log("Received a request on api /get_ping");
            const receiver_user_id: string = (await getJsonObject(req)).receiver_user_id;
            const ping: Ping = db.getPing(receiver_user_id);
            return Response.json(ping);
        } 
        else if (url.pathname === "/get_all_users") {
            console.log("Received a request on api /get_all_users");
            let all_users: User[] = db.getAllUsers();
            return Response.json(all_users);
        }
        else if (url.pathname === "/create_friend_link") {
            const user: User = await getJsonObject(req);
            const jsonObject: any = await getJsonObject(req);
            const sender_user_id: string = jsonObject.sender_user_id
            const receiver_user_id: string = jsonObject.receiver_user_id;
            db.createFriendLink(sender_user_id, receiver_user_id);
            return new Response();
        }
        else if (url.pathname === "/get_friends") {
            const user: User = await getJsonObject(req);
            const jsonObject: any = await getJsonObject(req);
            const sender_user_id: string = jsonObject.sender_user_id
            const receiver_user_id: string = jsonObject.receiver_user_id;
            db.createFriendLink(sender_user_id, receiver_user_id);
            return new Response();
        }
        else if (url.pathname === "/modify_link") {
            return new Response("404");
        }
        else return new Response("404!");
    },
});

console.log(`Listening on http://localhost:${server.port} ...`);
