import { ServerDatabase as db } from "./database";
import { Ping, Signed, redColor, resetColor } from "./utils";

// http://10.0.2.2:8080

// curl -X POST -H "Content-Type: application/json" -d '{"user_id": "AN_ID", "longitude": 123.3, "latitude": 123.8, "timestamp": 12345}' http://localhost:8080/send_ping
// curl -X GET http://localhost:8080/get_all_users

const server = Bun.serve({
    port: 8080,
    async fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/create_account") {
            console.log("Received a request on api /create_user");
            const json_object: any = await req.json();
            const registration_key: string = json_object.registration_key;
            const public_signing_key: string = json_object.public_signing_key;
            if (!db.isRegistrationKeyValidAndDelete(registration_key)) {
                return Response.error();
            }
            return Response.json(db.createUser(public_signing_key));
        } else if (url.pathname === "/update_pings") {
            console.log("Received a request on api /update_pings");
            const json_object: any = await req.json();
            const signed_pings: Signed<Ping>[] = json_object.signed_pings;
            const public_signing_key = db.getPublicSigningKey(signed_pings[0].sender_user_id);
            signed_pings.forEach((ping) => {
                if (db.isPingBeforeLastOne(ping) || !isSignatureValid(ping.encrypted_ping + ping.timestamp, ping.signature, public_signing_key)) {
                    return Response.error();
                }
                db.updatePing(ping);
            });
            return new Response();
        } else if (url.pathname === "/get_ping") {
            console.log("Received a request on api /get_ping");
            const json_object: any = await req.json();
            const sender_user_id: string = json_object.sender_user_id;
            const receiver_user_id: string = json_object.receiver_user_id;
            const ping: Ping | null = db.getPing(sender_user_id, receiver_user_id);
            if (ping === null) {
                return Response.error();
            }
            return Response.json(ping);
        } else if (url.pathname === "/admin/generate_registration_key") {
            console.log(`${redColor}Received a request on api /admin/generate_registration_key${resetColor}`);
            const { admin_user_id, timestamp, signature } = await req.json();
            const public_signing_key: string = db.getPublicSigningKey("ADMIN");
            if (!db.isNewAdminTimestampBeforeLastOne(timestamp) || !isSignatureValid(admin_user_id + timestamp, signature, public_signing_key)) {
                return Response.error();
            }
            const registration_key: string = db.generateRegistrationKey(timestamp);
            console.log(registration_key);
            return new Response();
        } else if (url.pathname === "/admin/clear_registration_keys") {
            console.log(`${redColor}Received a request on api /admin/clear_registration_keys${resetColor}`);
            const { admin_user_id, timestamp, signature } = await req.json();
            const public_signing_key: string = db.getPublicSigningKey("ADMIN");
            if (!db.isNewAdminTimestampBeforeLastOne(timestamp) || !isSignatureValid(admin_user_id + timestamp, signature, public_signing_key)) {
                return Response.error();
            }
            db.nukeRegistrationKeys(timestamp);
            return new Response();
        }
        return new Response("Page not found", { status: 404 });
    },
});

console.log(`Listening on http://localhost:${server.port} ...`);

function isSignatureValid(message: string, signature: string, public_signing_key: string): boolean {
    // todo use crystal dilithium?
    return true;
}
