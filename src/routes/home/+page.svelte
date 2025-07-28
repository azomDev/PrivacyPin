<script lang="ts">
    import "../../nostalgic-ui.css";
    import { Settings, Plus, MapPin } from "lucide-svelte";
    import { goto } from "$app/navigation";

    const last_ping_minute: number = 0;
    const last_ping_hour: number = 0;
    const last_ping_day: number = 1;
    const last_ping_month: number = 1;
    const last_ping_year: number = 2025;
    const last_ping_time_ago: string = "20d 3h 2m"; //For testing, I haven't implemented an actual system yet ~Kit

    let show_modal: boolean = $state(false);
    let modal_title: string = $state("");
    let modal_text: string = $state("");
    let modal_button_function: Function = $state(() => {});
    function showModal(title: string, text: string, onclick?: Function) {
        modal_title = title;
        modal_text = text;
        show_modal = true;
        modal_button_function = onclick ? onclick : () => {};
    }
</script>

<div class="inner-card" style="line-height: 0; height: 15px;">
    <div class="split-lr" style="margin-bottom: 0; height: 20px;"> <!-- left -->
        <div style="display: flex">
            <a
                class="dot"
                style="background-color: #dbeafe; height: 50px; width: 50px;"
                onclick={() => {
                    goto("/create-account");
                }}
            >
                <MapPin
                    color="#235fe1"
                    size={25}
                    style="margin-top: 12.5; margin-bottom: 12.5;"
                />
            </a> <!-- Pin Icon -->
            <h2 class="h2-padding" style="padding-left: 16px;">
                Privacy Pin
            </h2>
        </div>

        <div style="margin-bottom: 0; height: 20px;"> <!-- right -->
            <Plus
                size={25}
                style="margin-right: 0;"
            />
            <Settings
                size={25}
                onclick={() => {
                    showModal("Beta Notification", "This would open settings");
                }}
            />
        </div>
    </div>
</div>
<hr />

<div class="split-lr" style="">
    <p style="float: left; padding-top: 5px; padding-left: 0;">
        Last ping sent:
    </p>
    <p style="font-style: bold; float: right; padding-top: 5px; padding-right: 0;">ago</p>
</div>
<div class="inner-card wrapper flex-row" style="padding-top: 0px;">

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
