<!-- Frontpage view, contains chats, current conversation, and the add contact window -->
<template>
    <div>

        <div class="row">
            <div class="col-md-2 col-xs-3">
                <chats/>
            </div>
            <div class="col-md-8 col-xs-9 borders">
                <conversation/>
            </div>
            <div class="col-md-2 col-xs-12 add-contact">
                <add-contact v-if="$store.state.addContactVisible"/>
            </div>
        </div>

    </div>
</template>

<script>
    export default {

    }
</script>

<style scoped>WWW
    .borders {
        border-left: 1px solid gray;
        border-right: 1px solid gray;
    }
    @media only screen and (max-width: 767px) {
        .add-contact {
            z-index: 2;
            position: fixed;
            background: white;
        }
    }
</style>
