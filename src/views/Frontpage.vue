<!-- Frontpage view, contains chats, current conversation, and the add contact window -->
<template>
    <div>

        <div class="row">
            <div class="col-md-2 col-xs-12 chats" v-if="$store.state.contactsVisible || $mq === 'lg'">
                <chats />
            </div>
            <div class="col-md-8 col-xs-12 borders">
                <conversation />
            </div>
            <div class="col-md-2 col-xs-12 add-contact" v-if="$store.state.addContactVisible">
                <add-contact />
            </div>
        </div>

    </div>
</template>

<script>
    export default {

    }
</script>

<style scoped>
    .borders {
        border-left: 1px solid gray;
        border-right: 1px solid gray;
    }
    @media only screen and (max-width: 767px) {
        .add-contact {
            z-index: 4;
            position: fixed;
            background: white;
        }
        .chats {
            z-index: 2;
            position: fixed;
            background: white;
        }
    }
</style>
