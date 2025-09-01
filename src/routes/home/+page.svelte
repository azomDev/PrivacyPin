<script lang="ts">
    import "../../nostalgic-ui.css";
    import { Settings, Plus, MapPin } from "lucide-svelte";
    import { goto } from "$app/navigation";

    const last_ping_minute: number = 0;
    const last_ping_hour: number = 0;
    const last_ping_day: number = 1;
    const last_ping_month: number = 1;
    const last_ping_year: number = 2025;
    const last_ping_time_ago: string = "120d 3h 2m"; //For testing, I haven't implemented an actual system yet(also it's broken, someone find some duct tape) ~Kishka

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

    /*let text = ["text1", "tex2", "text3", "text4"];
    for(let i = 0; i < text.length; i += 1) {
        let div = document.createElement("div");
        div.className = "finalBlock";
        div.innerHTML = "";
        document.body.appendChild(div);
    }*/
</script>

<div class="inner-card" style="line-height: 0; height: 20px;">
    <div class="split-lr" style="margin-bottom: 0; height: 20px;">
        <div style="display: flex"> <!-- left -->
            <a
                class="dot"
                style="background-color: #d298eb; height: 50px; width: 50px;"
                href="/create-account" >

                <MapPin
                    color="#a538d1"
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
                onclick={() => {
                    showModal("Beta Notification", "This would be used to add a friend");
                }}
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

<div class="split-lr" style="width: 100%">
    <p style="float: left; padding-top: 5px; padding-left: 0; padding-bottom: 5px;">
        Last ping sent:
    </p>
    <p style="font-style: bold; float: right; padding-top: 5px; padding-right: 0; padding-bottom: 5px;">{last_ping_time_ago} ago</p>
</div>
<div class="inner-card wrapper flex-row" style="padding-top: 5px; padding-bottom: 15px;">
    <div id="friends">
        <div id="TestCard" class="ui-style">
            <card style="width: 100%;">
                <div class="inner-card">
                    <div class="split-lr" style="height: 20px;">
                        <div style="display: flex"> <!-- left -->
                            <h3>Jane Doe</h3>
                        </div>

                        <div style="vertical-align: center"> <!-- right -->
                            <button
                                    class="button-secondary"
                                    style="font-size: normal;"
                                    onclick={() => {
                            showModal("Beta Notification", "This would open a map with their location");
                        }}>

                                <MapPin size={10} /> View

                            </button>
                        </div>
                    </div>
                </div>
            </card>
        </div>
    </div>
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
