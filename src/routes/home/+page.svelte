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

<div>
    <card style="width: 425px;">
        <div class="inner-card" style="vertical-align: center; line-height: 0;">
            <a
                class="dot"
                style="background-color: #dbeafe; height: 50px; width: 50px; float: left;"
                onclick={() => {
                    goto("/create-account");
                }}
            >
                <MapPin
                    color="#235fe1"
                    size={25}
                    style="margin-top: 12.5; margin-bottom: 12.5;"
                />
            </a>
            <h2 class="h2-padding" style="float: left; padding-left: 32px;">
                Privacy Pin
            </h2>
            <Plus
                size={25}
                style="float: right; margin-top: 12.5; margin-bottom: 12.5;"
            />
            <Settings
                size={25}
                style="float: right; margin-top: 12.5; margin-bottom: 12.5; padding-right: 32px;"
                onclick={() => {
                    showModal("Beta Notification", "This would open settings");
                }}
            />
        </div>
        <br /><br />
        <hr />
        <div class="inner-card" style="padding-top: 0px;">
            <p style="float: left; padding-top: 10px; padding-left: 0;">
                Last ping sent:
            </p>
            <p style="font-style: bold;">ago</p>
        </div>
    </card>
</div>
<div id="modal" class="ui-style" hidden={show_modal != true}>
    <card style="width: 75%;">
        <h2>{modal_title}</h2>
        <p>{modal_text}</p>
        <button
            class="button-primary"
            onclick={() => {
                show_modal = false;
                modal_button_function();
            }}>Okay!</button
        >
    </card>
</div>
