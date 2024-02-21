import { ServerDatabase as db } from "./database";
import { Ping, LocationKey, Signed } from "./models";

// http://10.0.2.2:8080

const resetColor = "\x1b[0m";
const redColor = "\x1b[31m";

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
            if (!db.isRegistrationKeyValidAndDelete(registration_key)) {
                return Response.error();
            }
            const public_signing_key: string = json_object.public_signing_key;
            const id: string = db.createUser(public_signing_key);
            return new Response(id);
        }
        else if (url.pathname === "/update_ping") {
            console.log("Received a request on api /update_ping");
            const signed_ping: Signed<Ping> = ((await req.json()) as Signed<Ping>);
            const public_signing_key: string = db.getPublicSigningKey(signed_ping.user_id);
            if (db.isPingBeforeLastOne(signed_ping.user_id, signed_ping.timestamp) || !isSignatureValid(signed_ping.encrypted_ping, signed_ping.signature, public_signing_key)) {
                return Response.error();
            }
            db.updatePing(signed_ping as Ping);
            return new Response();
        }
        else if (url.pathname === "/get_ping") {
            console.log("Received a request on api /get_ping");
            const sender_user_id: string = ((await req.json()) as any).requested_user_id;
            const ping: Ping = db.getPing(sender_user_id);
            return Response.json(ping);
        }
        else if (url.pathname === "/update_location_key") {
            console.log("Received a request on api /update_location_key");
            const signed_location_key: Signed<LocationKey> = (await req.json()) as Signed<LocationKey>;
            const public_signing_key: string = db.getPublicSigningKey(signed_location_key.sender_user_id);
            if (db.isLocationKeyBeforeLastOne(signed_location_key.sender_user_id, signed_location_key.timestamp) || !isSignatureValid(signed_location_key.location_key, signed_location_key.signature, public_signing_key)) {
                return Response.error();
            }
            db.updateLocationKey(signed_location_key as LocationKey);
            return new Response();
        }
        else if (url.pathname === "/get_location_key") {
            console.log("Received a request on api /get_location_key");
            const { sender_user_id, receiver_user_id } = await req.json();
            const location_key: LocationKey = db.getLocationKey(sender_user_id, receiver_user_id);
            return Response.json(location_key);
        }
        else if (url.pathname === "/admin/generate_registration_key") { 
            console.log(`${redColor}Received a request on api /admin/generate_registration_key${resetColor}`);
            const { admin_user_id, timestamp, signature } = await req.json();
            const public_signing_key: string = db.getPublicSigningKey(admin_user_id);
            if (db.isNewAdminTimestampBeforeLastOne(timestamp) || !isSignatureValid(admin_user_id + timestamp, signature, public_signing_key)) {
                return Response.error();
            }
            const registration_key: string = db.generateRegistrationKey(timestamp);
            console.log(registration_key);
            return new Response();
        }
        else return new Response("404");
    },
});

console.log(`Listening on http://localhost:${server.port} ...`);

function isSignatureValid(message: string, signature: string, public_signing_key: string): boolean {
    // todo use crystal dilithium?
    return true;
}