<!-- Frontpage view, contains chats, current conversation, and the add contact window -->
<template>
    <div>

        <div class="row">
            <div class="col-xs-2">
                <chats/>
            </div>
            <div class="col-xs-8 borders">
                <conversation/>
            </div>
            <div class="col-xs-2">
                <add-contact v-if="$store.state.addContactVisible"/>
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
</style>
