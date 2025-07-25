<script lang="ts">
    import "../../nostalgic-ui.css";
    import { QrCode, MapPin } from "lucide-svelte";
    import { goto } from "$app/navigation";

    let server_address = $state("");
    let signup_key = $state("");

    let show_modal = $state(false);
    let modal_title = $state("");
    let modal_text = $state("");
    let modal_button_function: Function = $state(() => {});
    function showModal(title: string, text: string, onclick?: Function) {
        modal_title = title;
        modal_text = text;
        show_modal = true;
        modal_button_function = onclick ? onclick : () => {};
    }

    async function connectCheck() {
        if (server_address != "" && signup_key != "") {
            showModal(
                "Beta Notification",
                "This would have run signup checks with the data:" +
                    "{'" +
                    server_address +
                    "', '" +
                    signup_key +
                    "'}\n\nYou will now be redirected to the home page",

                () => {
                    goto("/home");
                },
            );
            console.log("{'" + server_address + "', '" + signup_key + "'}");
        } else {
            showModal(
                "Connection Error",
                "Please enter a valid Server Address and Signup Key",
            );
        }
    }
</script>

<!-- Main page StyleSheet -->
<div class="inner-card">
    <div class="dot" style="background-color: #dbeafe;">
        <MapPin
            color="#235fe1"
            size={50}
            style="margin-top: 25; margin-bottom: 25;"
        />
    </div>
    <h1 style="line-height: .5">Privacy Pin</h1>
    <p style="line-height: 1">
        Connect with your sever to start sharing
    </p>
    <br />

    <h4
        style="text-align: left; line-height: 0.1; margin: auto; padding: 16px 32px;"
    >
        Server Address
    </h4>
    <input
        class="button-secondary"
        style="width: 75%; text-align: left;"
        placeholder="http://your-server.com"
        bind:value={server_address}
        required
    />
    <br /><br />
    <h4
        style="text-align: left; line-height: 0.1; margin: auto; padding: 16px 32px;"
    >
        Signup Key
    </h4>
    <input
        class="button-secondary"
        style="width: 75%; text-align: left;"
        placeholder="Enter your signup key"
        bind:value={signup_key}
        required
    />
    <p style="text-align: left; color: a9a9a9;">
        Scan a QR code to automatically fill both server address and and
        signup key
    </p>
    <br />
    <button
        class="button-secondary"
        style="width: 90%;"
        onclick={() => {
            showModal(
                "Beta Notification",
                "This would have prompted to scan a QR code. The data {'http://your-server.com', 'signup-key-12345'}",

                () => {
                    server_address = "http://your-server.com";
                    signup_key = "signup-key-12345";
                },
            );
        }}
        ><QrCode
            class="align-middle"
            style="height: 16px; width: auto;"
        /> Scan QR Code</button
    >
    <br />
    <button
        class="button-primary width250px"
        style="width: 90%;"
        onclick={() => connectCheck()}>Connect</button
    >
</div>

<!-- This is the popup modal's HTML -->
<div id="modal" class="ui-style" hidden={show_modal !== true}>
    <card style="width: 75%;">
        <div class="inner-card">
            <h2>{modal_title}</h2>
            <p>{modal_text}</p>
            <button
                class="button-primary"
                onclick={() => {
                    show_modal = false;
                    modal_button_function();
                }}>Okay!</button
            >
        </div>
    </card>
</div>
